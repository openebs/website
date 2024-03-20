---
id: local-engine-installation
title: Local Engine Installation
keywords: 
  - Installation
  - Local Engine Installation
description: This guide will help you to install OpenEBS Local Engines.
---

# Local Engine Installation

:::info
Make sure that your Kubernetes nodes meet the [required prerequisites](../local-engine-user-guide/prerequisites.mdx) before proceeding with the installation.
:::

This guide will help you to set up and use OpenEBS Local Persistent Volumes (PV) backed by Hostpath, LVM, and ZFS.

## Local PV Hostpath

:::caution
You can skip this section if you have already installed OpenEBS.
:::

### Installation

You can skip this section if you have already installed OpenEBS.

1. Prepare to install OpenEBS by providing custom values for configurable parameters. 

   *OpenEBS Dynamic Local Provisioner* offers some configurable parameters that can be applied during the OpenEBS Installation. Some key configurable parameters available for OpenEBS Dynamic Local Provisioner are:

   - The location of the *OpenEBS Dynamic Local PV provisioner* container image.
     ```shell hideCopy
     Default value: openebs/provisioner-localpv
     YAML specification: spec.image on Deployment(localpv-provisioner)
     Helm key: localprovisioner.image
     ```

   - The location of the *Provisioner Helper* container image. *OpenEBS Dynamic Local Provisioner* create a *Provisioner Helper* pod to create and delete hostpath directories on the nodes.
     ```shell hideCopy
     Default value: openebs/linux-utils
     YAML specification: Environment Variable (OPENEBS_IO_HELPER_IMAGE) on Deployment(localpv-provisioner) 
     Helm key: helper.image
     ```

   - The absolute path on the node where the Hostpath directory of a Local PV Volume will be created.
     ```shell hideCopy
     Default value: /var/openebs/local
     YAML specification: Environment Variable (OPENEBS_IO_LOCALPV_HOSTPATH_DIR) on Deployment(maya-apiserver)
     Helm key: localprovisioner.basePath
     ```

2. You can proceed to install OpenEBS using helm following the steps below. 

   - Install using OpenEBS helm charts
  
     If you would like to change the default values for any of the configurable parameters mentioned in the previous step, specify each parameter using the `--set key=value[,key=value]` argument to `helm install`.
  
     ```
     helm repo add openebs https://openebs.github.io/charts
     helm repo update
     helm install --namespace openebs --name openebs openebs/openebs
     ```
### Create StorageClass

You can skip this section if you would like to use default OpenEBS Local PV Hostpath StorageClass created by OpenEBS. 

The default Storage Class is called `openebs-hostpath` and its `BasePath` is configured as `/var/openebs/local`. 

1. To create your own StorageClass with custom `BasePath`, save the following StorageClass definition as `local-hostpath-sc.yaml`

   ```
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: local-hostpath
     annotations:
       openebs.io/cas-type: local
       cas.openebs.io/config: |
         - name: StorageType
           value: hostpath
         - name: BasePath
           value: /var/local-hostpath
   provisioner: openebs.io/local
   reclaimPolicy: Delete
   volumeBindingMode: WaitForFirstConsumer
   ```
    #### (Optional) Custom Node Labelling

    In Kubernetes, Hostpath LocalPV identifies nodes using labels such as `kubernetes.io/hostname=<node-name>`. However, these default labels might not ensure each node is distinct across the entire cluster. To solve this, you can make custom labels. As an admin, you can define and set these labels when configuring a **StorageClass**. Here's a sample storage class:

    ```
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: local-hostpath
      annotations:
        openebs.io/cas-type: local
        cas.openebs.io/config: |
          - name: StorageType
            value: "hostpath"
          - name: NodeAffinityLabels
            list:
              - "openebs.io/custom-node-unique-id"
    provisioner: openebs.io/local
    volumeBindingMode: WaitForFirstConsumer

    ```
  :::note 
  Using NodeAffinityLabels does not influence scheduling of the application Pod. Use kubernetes [allowedTopologies](https://github.com/openebs/dynamic-localpv-provisioner/blob/develop/docs/tutorials/hostpath/allowedtopologies.md) to configure scheduling options.
  :::

2. Edit `local-hostpath-sc.yaml` and update with your desired values for `metadata.name` and `cas.openebs.io/config.BasePath`.

   :::note 
   If the `BasePath` does not exist on the node, *OpenEBS Dynamic Local PV Provisioner* will attempt to create the directory, when the first Local Volume is scheduled on to that node. You MUST ensure that the value provided for `BasePath` is a valid absolute path. 
   :::

3. Create OpenEBS Local PV Hostpath Storage Class. 
   ```
   kubectl apply -f local-hostpath-sc.yaml
   ```

4. Verify that the StorageClass is successfully created. 
   ```
   kubectl get sc local-hostpath -o yaml
   ```

### Verify the Installation

Once you have installed OpenEBS, verify that *OpenEBS Local PV provisioner* is running and Hostpath StorageClass is created. 

1. To verify *OpenEBS Local PV provisioner* is running, execute the following command. Replace `-n openebs` with the namespace where you installed OpenEBS. 

   ```
   kubectl get pods -n openebs -l openebs.io/component-name=openebs-localpv-provisioner
   ```

   The output should indicate `openebs-localpv-provisioner` pod is running. 
   ```shell hideCopy
   NAME                                           READY   STATUS    RESTARTS   AGE
   openebs-localpv-provisioner-5ff697f967-nb7f4   1/1     Running   0          2m49s
   ```

2. To verify *OpenEBS Local PV Hostpath* StorageClass is created, execute the following command. 

   ```
   kubectl get sc
   ```

   The output should indicate either the default StorageClass `openebs-hostpath` and/or custom StorageClass `local-hostpath` are displayed.
   ```shell hideCopy
   NAME                        PROVISIONER                                                AGE
   local-hostpath              openebs.io/local                                           5h26m
   openebs-hostpath            openebs.io/local                                           6h4m
   ```

### Deployment

#### Create a PersistentVolumeClaim

The next step is to create a PersistentVolumeClaim. Pods will use PersistentVolumeClaims to request Hostpath Local PV from *OpenEBS Dynamic Local PV provisioner*.

1. Here is the configuration file for the PersistentVolumeClaim. Save the following PersistentVolumeClaim definition as `local-hostpath-pvc.yaml`

   ```
   kind: PersistentVolumeClaim
   apiVersion: v1
   metadata:
     name: local-hostpath-pvc
   spec:
     storageClassName: openebs-hostpath
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5G
   ```

2. Create the PersistentVolumeClaim

   ```
   kubectl apply -f local-hostpath-pvc.yaml
   ```

3. Look at the PersistentVolumeClaim:
   
   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The output shows that the `STATUS` is `Pending`. This means PVC has not yet been used by an application pod. The next step is to create a Pod that uses your PersistentVolumeClaim as a volume.

   ```shell hideCopy
   NAME                 STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Pending                                      openebs-hostpath   3m7s
   ```

#### Create Pod to consume OpenEBS Local PV Hostpath Storage

1. Here is the configuration file for the Pod that uses Local PV. Save the following Pod definition to `local-hostpath-pod.yaml`.

   ```
   apiVersion: v1
   kind: Pod
   metadata:
     name: hello-local-hostpath-pod
   spec:
     volumes:
     - name: local-storage
       persistentVolumeClaim:
         claimName: local-hostpath-pvc
     containers:
     - name: hello-container
       image: busybox
       command:
          - sh
          - -c
          - 'while true; do echo "`date` [`hostname`] Hello from OpenEBS Local PV." >> /mnt/store/greet.txt; sleep $(($RANDOM % 5 + 300)); done'
       volumeMounts:
       - mountPath: /mnt/store
         name: local-storage
   ```

   :::note
   As the Local PV storage classes use `waitForFirstConsumer`, do not use `nodeName` in the Pod spec to specify node affinity. If `nodeName` is used in the Pod spec, then PVC will remain in `pending` state. For more details refer https://github.com/openebs/openebs/issues/2915.
   :::

2. Create the Pod:

   ```
   kubectl apply -f local-hostpath-pod.yaml
   ```

3. Verify that the container in the Pod is running.

   ```
   kubectl get pod hello-local-hostpath-pod
   ```
4. Verify that the data is being written to the volume.

   ```
   kubectl exec hello-local-hostpath-pod -- cat /mnt/store/greet.txt
   ```
   
5. Verify that the container is using the Local PV Hostpath.
   ```
   kubectl describe pod hello-local-hostpath-pod
   ```

   The output shows that the Pod is running on `Node: gke-user-helm-default-pool-3a63aff5-1tmf` and using the persistent volume provided by `local-hostpath-pvc`.

   ```shell hideCopy
   Name:         hello-local-hostpath-pod
   Namespace:    default
   Priority:     0
   Node:         gke-user-helm-default-pool-3a63aff5-1tmf/10.128.0.28
   Start Time:   Thu, 16 Apr 2020 17:56:04 +0000  
   ...  
   Volumes:
     local-storage:
       Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
       ClaimName:  local-hostpath-pvc
       ReadOnly:   false
   ...
   ```

6. Look at the PersistentVolumeClaim again to see the details about the dynamically provisioned Local PersistentVolume
   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The output shows that the `STATUS` is `Bound`. A new Persistent Volume `pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425` has been created. 

   ```shell hideCopy
   NAME                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Bound    pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425   5G         RWO            openebs-hostpath   28m
   ```

7. Look at the PersistentVolume details to see where the data is stored. Replace the PVC name with the one that was displayed in the previous step. 
   ```
   kubectl get pv pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425 -o yaml
   ```
   The output shows that the PV was provisioned in response to PVC request  `spec.claimRef.name: local-hostpath-pvc`. 

   ```shell hideCopy
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
     annotations:
       pv.kubernetes.io/provisioned-by: openebs.io/local
     ...
   spec:
     accessModes:
       - ReadWriteOnce
     capacity:
       storage: 5G
     claimRef:
       apiVersion: v1
       kind: PersistentVolumeClaim
       name: local-hostpath-pvc
       namespace: default
       resourceVersion: "291148"
       uid: 864a5ac8-dd3f-416b-9f4b-ffd7d285b425  
     ...
     ...
     local:
       fsType: ""
       path: /var/openebs/local/pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
     nodeAffinity:
       required:
         nodeSelectorTerms:
         - matchExpressions:
           - key: kubernetes.io/hostname
             operator: In
             values:
             - gke-user-helm-default-pool-3a63aff5-1tmf
     persistentVolumeReclaimPolicy: Delete
     storageClassName: openebs-hostpath
     volumeMode: Filesystem
   status:
     phase: Bound
   ```
   <br/>

:::note 
A few important characteristics of a *OpenEBS Local PV* can be seen from the above output: 
- `spec.nodeAffinity` specifies the Kubernetes node where the Pod using the Hostpath volume is scheduled. 
- `spec.local.path` specifies the unique subdirectory under the `BasePath (/var/local/openebs)` defined in corresponding StorageClass.
:::
  
### Cleanup

Delete the Pod, the PersistentVolumeClaim and StorageClass that you might have created. 

```
kubectl delete pod hello-local-hostpath-pod
kubectl delete pvc local-hostpath-pvc
kubectl delete sc local-hostpath
```

Verify that the PV that was dynamically created is also deleted. 
```
kubectl get pv
```

## LVM Local PV

### Setup

Find the disk which you want to use for the LVM, for testing you can use the loopback device

```
truncate -s 1024G /tmp/disk.img
sudo losetup -f /tmp/disk.img --show
```

Create the Volume group on all the nodes, which will be used by the LVM Driver for provisioning the volumes

```
sudo pvcreate /dev/loop0
sudo vgcreate lvmvg /dev/loop0       ## here lvmvg is the volume group name to be created
```

### Installation

We can install the latest release of OpenEBS LVM driver by running the following command.

```
$ kubectl apply -f https://openebs.github.io/charts/lvm-operator.yaml
```

If you want to fetch a versioned manifest, you can use the manifests for a specific OpenEBS release version, for example:

```
$ kubectl apply -f https://raw.githubusercontent.com/openebs/charts/gh-pages/versioned/3.0.0/lvm-operator.yaml
```

:::note
For some Kubernetes distributions, the `kubelet` directory must be changed at all relevant places in the YAML powering the operator (both the `openebs-lvm-controller` and `openebs-lvm-node`).
:::

- For `microk8s`, we need to change the kubelet directory to `/var/snap/microk8s/common/var/lib/kubelet/`, we need to replace `/var/lib/kubelet/` with `/var/snap/microk8s/common/var/lib/kubelet/` at all the places in the operator yaml and then we can apply it on microk8s.
- For `k0s`, the default directory `(/var/lib/kubelet)` should be changed to `/var/lib/k0s/kubelet`.
- For `RancherOS`, the default directory `(/var/lib/kubelet)` should be changed to `/opt/rke/var/lib/kubelet`.

Verify that the LVM driver Components are installed and running using below command :

```
$ kubectl get pods -n kube-system -l role=openebs-lvm
```

Depending on number of nodes, you will see one lvm-controller pod and lvm-node daemonset running on the nodes.

```
NAME                       READY   STATUS    RESTARTS   AGE
openebs-lvm-controller-0   5/5     Running   0          35s
openebs-lvm-node-54slv     2/2     Running   0          35s
openebs-lvm-node-9vg28     2/2     Running   0          35s
openebs-lvm-node-qbv57     2/2     Running   0          35s
```

Once LVM driver is successfully installed, we can provision volumes.

### Deployment

#### Create a StorageClass

```
$ cat sc.yaml

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
parameters:
  storage: "lvm"
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
```

Check the doc on [storageclasses](https://github.com/openebs/lvm-localpv/blob/develop/docs/storageclasses.md) to know all the supported parameters for LVM-LocalPV.

##### VolumeGroup Availability

If LVM volume group is available on certain nodes only, then make use of topology to tell the list of nodes where we have the volgroup available. As shown in the below storage class, we can use allowedTopologies to describe volume group availability on nodes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
allowVolumeExpansion: true
parameters:
  storage: "lvm"
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: kubernetes.io/hostname
    values:
      - lvmpv-node1
      - lvmpv-node2
```

The above storage class tells that volume group "lvmvg" is available on nodes lvmpv-node1 and lvmpv-node2 only. The LVM driver will create volumes on those nodes only.

 :::note
 The provisioner name for LVM driver is "local.csi.openebs.io", we have to use this while creating the storage class so that the volume provisioning/deprovisioning request can come to LVM driver.
 :::

 #### Create the PVC

 ```
 $ cat pvc.yaml

kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
 ```

 Create a PVC using the storage class created for the LVM driver.

 #### Deploy the Application

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

#### Deprovisioning

To deprovision the volume we can delete the application which is using the volume and then we can go ahead and delete the pv, as part of deletion of pv this volume will also be deleted from the volume group and data will be freed.

```
$ kubectl delete -f fio.yaml
pod "fio" deleted
$ kubectl delete -f pvc.yaml
persistentvolumeclaim "csi-lvmpv" deleted
```

### Limitation

Resize of volumes with snapshot is not supported.
