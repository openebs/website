---
id: local-engine-deployment
title: Local Engine Deployment
keywords: 
  - Deployment
  - Local Engine Deployment
description: This guide will help you to deploy OpenEBS Local Engines.
---

# Local Engine Deployment

:::info
Make sure that you have [installed OpenEBS](../../quickstart-guide/installation.md) before proceeding with the deployment.
:::

This guide will help you to deploy OpenEBS Local Persistent Volumes (PV) backed by LVM and ZFS.

## Local PV Hostpath

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

Verify that the LVM driver Components are installed and running using below command:

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

## ZFS Local PV

### Setup

All the node should have zfsutils-linux installed. We should go to the each node of the cluster and install zfs utils:

```
$ apt-get install zfsutils-linux
```

Go to each node and create the ZFS Pool, which will be used for provisioning the volumes. You can create the Pool of your choice, it can be striped, mirrored or raidz pool.

If you have the disk(say /dev/sdb) then you can use the below command to create a striped pool:

```
$ zpool create zfspv-pool /dev/sdb
```

You can also create mirror or raidz pool as per your need. Check https://github.com/openzfs/zfs for more information.

If you do not have the disk, then you can create the zpool on the loopback device which is backed by a sparse file. Use this for testing purpose only.

```
$ truncate -s 100G /tmp/disk.img
$ zpool create zfspv-pool `losetup -f /tmp/disk.img --show`
```

Once the ZFS Pool is created, verify the pool `via zpool` status command, you should see something like this:

```
$ zpool status
  pool: zfspv-pool
 state: ONLINE
  scan: none requested
config:

	NAME        STATE     READ WRITE CKSUM
	zfspv-pool  ONLINE       0     0     0
	  sdb       ONLINE       0     0     0

errors: No known data errors
```

Configure the custom topology keys (if needed). This can be used for many purposes like if we want to create the PV on nodes in a particuler zone or building. We can label the nodes accordingly and use that key in the storageclass for taking the scheduling decesion:

https://github.com/openebs/zfs-localpv/blob/HEAD/docs/faq.md#6-how-to-add-custom-topology-key

### Installation

In order to support moving data to a new node later on, you must label each node with a unique value for `openebs.io/nodeid`. For more information on migrating data, see [here](https://github.com/openebs/zfs-localpv/blob/develop/docs/faq.md#8-how-to-migrate-pvs-to-the-new-node-in-case-old-node-is-not-accessible)

We can install the latest release of OpenEBS ZFS driver by running the following command:

```
$ kubectl apply -f https://openebs.github.io/charts/zfs-operator.yaml
```

We can also install it via kustomize using `kubectl apply -k deploy/yamls`, check the kustomize yaml.

:::note
If you are running a custom Kubelet location, or a Kubernetes distribution that uses a custom Kubelet location, the `kubelet` directory must be changed at all relevant places in the YAML powering the operator (both the `openebs-zfs-controller` and `openebs-zfs-node`).
:::

- For `microk8s`, we need to change the kubelet directory to `/var/snap/microk8s/common/var/lib/kubelet/`, we need to replace `/var/lib/kubelet/` with `/var/snap/microk8s/common/var/lib/kubelet/` at all the places in the operator yaml and then we can apply it on microk8s.
- For `k0s`, the default directory `(/var/lib/kubelet)` should be changed to `/var/lib/k0s/kubelet`.
- For `RancherOS`, the default directory `(/var/lib/kubelet)` should be changed to `/opt/rke/var/lib/kubelet`.

Verify that the ZFS driver Components are installed and running using below command:

```
$ kubectl get pods -n kube-system -l role=openebs-lvm
```

Depending on number of nodes, you will see one zfs-controller pod and zfs-node daemonset running on the nodes.

```
NAME                       READY   STATUS    RESTARTS   AGE
openebs-zfs-controller-0   5/5     Running   0          5h28m
openebs-zfs-node-4d94n     2/2     Running   0          5h28m
openebs-zfs-node-gssh8     2/2     Running   0          5h28m
openebs-zfs-node-twmx8     2/2     Running   0          5h28m
```

Once ZFS driver is successfully installed, we can provision volumes.

### Deployment

#### Create StorageClass

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
parameters:
  recordsize: "128k"
  compression: "off"
  dedup: "off"
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
```

The storage class contains the volume parameters like recordsize(should be power of 2), compression, dedup and fstype. You can select what are all parameters you want. In case, ZFS properties paramenters are not provided, the volume will inherit the properties from the ZFS Pool.

The poolname is the must argument. It should be noted that poolname can either be the root dataset or a child dataset e.g.

```
poolname: "zfspv-pool"
poolname: "zfspv-pool/child"
```

Also the dataset provided under `poolname` must exist on all the nodes with the name given in the storage class. Check the doc on storageclasses to know all the supported parameters for ZFS-LocalPV

**ext2/3/4 or xfs or btrfs as FsType**
If we provide fstype as one of ext2/3/4 or xfs or btrfs, the driver will create a ZVOL, which is a blockdevice carved out of ZFS Pool. This blockdevice will be formatted with corresponding filesystem before it's used by the driver.

:::note
There will be a filesystem layer on top of ZFS volume and applications may not get optimal performance.
:::

A sample storage class for ext4 fstype is provided below:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
parameters:
  volblocksize: "4k"
  compression: "off"
  dedup: "off"
  fstype: "ext4"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
```

:::note
We are providing `volblocksize` instead of `recordsize` since we will create a ZVOL, for which we can select the blocksize with which we want to create the block device. Also, note that for ZFS, volblocksize should be power of 2.

**ZFS as FsType**