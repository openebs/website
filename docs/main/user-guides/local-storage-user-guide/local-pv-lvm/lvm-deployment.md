---
id: lvm-deployment
title: Deploy an Application
keywords:
 - OpenEBS LVM Local PV
 - Local PV LVM
 - Deploy an Application
description: This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 
---

This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by LVM Storage. 

 Create the deployment yaml using the PVC backed by LVM storage.

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

 After the deployment of the application, we can go to the node and see that the LVM volume is being used by the application for reading/writing the data and space is consumed from the LVM. 
 
:::note
Check the provisioned volumes on the node, we need to run pvscan --cache command to update the LVM cache and then we can use lvdisplay and all other LVM commands on the node.
:::

 ## PersistentVolumeClaim Conformance Matrix

 The following matrix shows supported PersistentVolumeClaim parameters for localpv-lvm.

<table>
  <thead>
    <tr>
      <th> Parameter </th>
      <th> Values </th>
      <th> Development Status </th>
      <th> E2E Coverage Status </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan={3}> <a href="#accessmode"> AccessMode </a> </td>
      <td> ReadWriteOnce </td>
      <td> Supported </td>
      <td rowspan={3}> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/lvm-localpv-provisioner#readme"> Yes </a> </td>
    </tr>
    <tr>
      <td> <strike> ReadWriteMany </strike> </td>
      <td> Not Supported </td>
    </tr>
    <tr>
      <td> <strike> ReadOnlyMany </strike> </td>
      <td> Not Supported </td>
    </tr>
    <tr>
      <td> <a href="#storageclassname"> Storageclass </a> </td>
      <td> StorageClassName </td>
      <td> Supported </td>
      <td> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/lvm-localpv-provisioner#readme"> Yes </a> </td>
    </tr>
    <tr>
      <td> <a href="#capacity-resource"> Capacity Resource </a> </td>
      <td> Number along with size unit </td>
      <td> Supported </td>
      <td> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/functional/lvm-volume-resize#readme"> Yes </a> </td>
    </tr>
    <tr>
      <td rowspan={2}> <a href="#volumemode-optional"> VolumeMode </a> </td>
      <td> Block </td>
      <td> Supported </td>
      <td rowspan={2}> <a href="https://github.com/openebs/lvm-localpv/blob/HEAD/e2e-tests/apps/percona/deployers/run_e2e_test.yml"> Yes </a> <br /> <i> Test cases available for Filesystem mode </i> <br /> </td>
    </tr>
    <tr>
      <td> Filesystem </td>
      <td> Supported </td>
    </tr>
    <tr>
      <td> <a href="#selectors-optional"> Selectors </a> </td>
      <td> Equality & Set based selections </td>
      <td> Supported </td>
      <td> Pending </td>
    </tr>
    <tr>
      <td> <a href="#volumename-optional"> VolumeName </a> </td>
      <td> Available PV name </td>
      <td> Supported </td>
      <td> Pending </td>
    </tr>
    <tr>
      <td> DataSource </td>
      <td> - </td>
      <td> Not Supported </td>
      <td> Pending </td>
    </tr>
  </tbody>
</table>

 ## PersistentVolumeClaim Parameters

 **AccessMode**

LVM-LocalPV supports only ReadWriteOnce access mode i.e. volume can be mounted as read-write by a single node. AccessMode is a required field, if the field is unspecified then it will lead to a creation error. Refer [Access Modes](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/persistent-volume-claim/access_mode.md) for more information about the access modes workflow.

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

LVM CSI-Driver supports dynamic provision of volume for the PVCs referred to as LVM storageclass. StorageClassName is a required field, if the field is unspecified then it will lead to provision error. Refer [StorageClass Reference](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/persistent-volume-claim/storage_class.md) for more information about the dynamic provisioning workflow.

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

Admin/User can specify the desired capacity for LVM volume. CSI-Driver will provision a volume if the underlying volume group has requested capacity available else provisioning volume will be errored. StorageClassName is a required field, if the field is unspecified then it will lead to provisioning errors. Refer [Resource Request](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/persistent-volume-claim/capacity_resource.md) for more information about the workflows.

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

Local PV LVM supports two kinds of volume modes (Defaults to Filesystem mode):

Block (Block mode can be used in a case where the application itself maintains filesystem)
Filesystem (Application which requires filesystem as a prerequisite) 

:::note
If unspecified defaults to Filesystem mode. Refer [Volume Mode](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/persistent-volume-claim/volume_mode.md) for more information about workflows.
:::

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

Users can bind any of the retained LVM volumes to the new PersistentVolumeClaim object via the selector field. If the selector and [volumeName](https://github.com/openebs/lvm-localpv/blob/develop/docs/persistentvolumeclaim.md#volumename-optional) fields are unspecified then the LVM CSI driver will provision new volume. If the volume selector is specified then request will not reach to local pv driver. This is a use case of pre-provisioned volume. Refer [Volume Selector](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/persistent-volume-claim/selector.md) for more information about the workflows.

Follow the below steps to specify selector on PersistentVolumeClaim:

- List the PersistentVolumes(PVs) which has status Released.
```
$ kubectl get pv -ojsonpath='{range .items[?(@.status.phase=="Released")]}{.metadata.name} {.metadata.labels}{"\n"}'
pvc-8376b776-75f9-4786-8311-f8780adfabdb {"openebs.io/lvm-volume":"reuse"}
```
:::note 
If labels do not exist for persistent volume then it is required to add labels to PV.
:::

```
$ kubectl label pv pvc-8376b776-75f9-4786-8311-f8780adfabdb openebs.io/lvm-volume=reuse
```

- Remove the claimRef on selected persistentvolumes using patch command. (This will mark PV as Available for binding).

```
$ kubectl patch pv pvc-8376b776-75f9-4786-8311-f8780adfabdb -p '{"spec":{"claimRef": null}}'
persistentvolume/pvc-8376b776-75f9-4786-8311-f8780adfabdb patched
```

- Create PVC with the selector.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  ## Specify selector matching to available PVs label, K8s will be bound to any of the available PVs matching the specified labels
  selector:
    matchLabels:
      openebs.io/lvm-volume: reuse
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi   ## Capacity should be less than or equal to available PV capacities
```

- Verify bound status of PV.

```
$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM               STORAGECLASS    REASON   AGE
pvc-8376b776-75f9-4786-8311-f8780adfabdb   6Gi        RWO            Retain           Bound    default/csi-lvmpv   openebs-lvmpv   9h
```

**VolumeName (Optional)**

VolumeName can be used to bind PersistentVolumeClaim(PVC) to retained PersistentVolume(PV). When VolumeName is specified K8s will ignore [selector field](https://github.com/openebs/lvm-localpv/blob/develop/docs/persistentvolumeclaim.md#selectors-optional). If volumeName field is specified Kubernetes will try to bind to specified volume(It will help to create claims for pre provisioned volume). If volumeName is unspecified then CSI driver will try to provision new volume. Refer [Volume Name](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/persistent-volume-claim/volume_name.md) for more information about the workflows.

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

To deprovision the volume we can delete the application that is using the volume and then we can go ahead and delete the PV, as part of the deletion of PV this volume will also be deleted from the volume group and data will be freed.

```
$ kubectl delete -f fio.yaml
pod "fio" deleted
$ kubectl delete -f pvc.yaml
persistentvolumeclaim "csi-lvmpv" deleted
```

## Limitation

Resize of volumes with snapshot is not supported.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)