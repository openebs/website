---
id: lvm-deployment
title: Deploy an Application
keywords:
 - OpenEBS LVM Local PV
 - Local PV LVM
 - Deploy an Application
description: This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 
---

This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 

 Create the deployment yaml using the pvc backed by LVM storage.

 ```
 $ cat fio.yaml

apiVersion: v1
kind: Pod
metadata:
  name: fio
spec:
  restartPolicy: Never
  containers:
  - name: perfrunner
    image: openebs/tests-fio
    command: ["/bin/bash"]
    args: ["-c", "while true ;do sleep 50; done"]
    volumeMounts:
       - mountPath: /datadir
         name: fio-vol
    tty: true
  volumes:
  - name: fio-vol
    persistentVolumeClaim:
      claimName: csi-lvmpv
 ```

 After the deployment of the application, we can go to the node and see that the lvm volume is being used by the application for reading/writting the data and space is consumed from the LVM. Please note that to check the provisioned volumes on the node, we need to run pvscan --cache command to update the lvm cache and then we can use lvdisplay and all other lvm commands on the node.

 ## PersistentVolumeClaim Conformance Matrix

 Following matrix shows supported PersistentVolumeClaim parameters for localpv-lvm.

 Parameter            Values                            Development Status    E2E Coverage Status
 AccessMode           ReadWriteOnce                     Supported             Yes
                      ReadWriteMany                     Not Supported
                      ReadOnlyMany                      Not Supported
 Storageclass	        StorageClassName                  Supported	            Yes
 Capacity Resource	  Number along with size unit	      Supported	            Yes
 VolumeMode	          Block	                            Supported	            Yes 
                                                                              *Test cases available for Filesystem mode*
                      Filesystem                        Supported  
 Selectors	          Equality & Set based selections   Supported             Pending
 VolumeName	          Available PV name	                Supported	            Pending
 DataSource	          -	                                Not Supported	        Pending

 ## PersistentVolumeClaim Parameters

 **AccessMode**

LVM-LocalPV supports only ReadWriteOnce access mode i.e volume can be mounted as read-write by a single node. AccessMode is a required field, if the field is unspecified then it will lead to a creation error. For more information about access modes workflow click here.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  accessModes:
    - ReadWriteOnce        ## Specify ReadWriteOnce(RWO) access modes
  storageClassName: openebs-lvm
  resources:
    requests:
      storage: 4Gi
```

**StorageClassName**

LVM CSI-Driver supports dynamic provision of volume for the PVCs referred to lvm storageclass. StorageClassName is a required field, if field is unspecified then it will lead to a provision errors. For more information about dynamic provisioning workflow click here.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: openebs-lvm    ## It must be OpenEBS LVM storageclass for provisioning LVM volumes
  resources:
    requests:
      storage: 4Gi
```

**Capacity Resource**

Admin/User can specify the desired capacity for lvm volume. CSI-Driver will provision a volume if the underlying volume group has requested capacity available else provisioning volume will be errored. StorageClassName is a required field, if field is unspecified then it will lead to a provision errors. For more information about workflow click here

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: openebs-lvm
  resources:
    requests:
      storage: 4Gi       ## Specify required storage for an application
```

**VolumeMode (Optional)**

LVM-LocalPV supports two kind of volume modes(Defaults to Filesystem mode):

Block (Block mode can be used in a case where application itself maintains filesystem)
Filesystem (Application which requires filesystem as a prerequisite) Note: If unspecified defaults to Filesystem mode. More information about workflow is available here.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: openebs-lvm
  volumeMode: Filesystem     ## Specifies in which mode volume should be attached to pod
  resources:
    requests:
      storage: 4Gi
```

**Selectors (Optional)**

Users can bind any of retained lvm volumes to new PersistentVolumeClaim object via selector field. If selector and volumeName fields are unspecified then LVM CSI driver will provision new volume. If volume selector is specified then request will not reach to localpv driver this is a use case of pre-provisioned volume, for more information about workflow click here

Follow below steps to specify selector on PersistentVolumeClaim:

- List the persistentvolumes(PVs) which has status Released.
```
$ kubectl get pv -ojsonpath='{range .items[?(@.status.phase=="Released")]}{.metadata.name} {.metadata.labels}{"\n"}'
pvc-8376b776-75f9-4786-8311-f8780adfabdb {"openebs.io/lvm-volume":"reuse"}
```
:::note 
If labels doesn't exist for persistent volume then it is required to add labels to PV.
:::

```
$ kubectl label pv pvc-8376b776-75f9-4786-8311-f8780adfabdb openebs.io/lvm-volume=reuse
```

- Remove the claimRef on selected persistentvolumes using patch command(This will mark PV as Available for binding).

```
$ kubectl patch pv pvc-8376b776-75f9-4786-8311-f8780adfabdb -p '{"spec":{"claimRef": null}}'
persistentvolume/pvc-8376b776-75f9-4786-8311-f8780adfabdb patched
```

- Create pvc with the selector

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  ## Specify selector matching to available PVs label, K8s will bound to any of available PV matches to specified labels
  selector:
    matchLabels:
      openebs.io/lvm-volume: reuse
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi   ## Capacity should be less than or equal to available PV capacities
```

- Verify bound status of PV

```
$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM               STORAGECLASS    REASON   AGE
pvc-8376b776-75f9-4786-8311-f8780adfabdb   6Gi        RWO            Retain           Bound    default/csi-lvmpv   openebs-lvmpv   9h
```

**VolumeName (Optional)**

VolumeName can be used to bind PersistentVolumeClaim(PVC) to retained PersistentVolume(PV). When VolumeName is specified K8s will ignore selector field. If volumeName field is specified Kubernetes will try to bind to specified volume(It will help to create claims for pre provisioned volume). If volumeName is unspecified then CSI driver will try to provision new volume. For more detailed information workflow click here.

:::note
Before creating PVC make retained/preprovisioned PersistentVolume Available by removing claimRef on PersistentVolume.
:::

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  volumeName: pvc-8376b776-75f9-4786-8311-f8780adfabdb   ## Name of LVM volume present in Available state
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi  ## Capacity should be less than or equal to available PV capacities
```
 
 ## Deprovisioning

To deprovision the volume we can delete the application which is using the volume and then we can go ahead and delete the pv, as part of deletion of pv this volume will also be deleted from the volume group and data will be freed.

```
$ kubectl delete -f fio.yaml
pod "fio" deleted
$ kubectl delete -f pvc.yaml
persistentvolumeclaim "csi-lvmpv" deleted
```

## Limitation

Resize of volumes with snapshot is not supported.

## Support

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../quickstart-guide/installation.md)
- [Deploy an Application](../../quickstart-guide/deploy-a-test-application.md)