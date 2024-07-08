---
id: zfs-localpv
title: ZFS Local PV User Guide
keywords:
 - OpenEBS ZFS Local PV
 - ZFS Local PV
 - Prerequisites
 - Install
 - Create StorageClass
 - Install verification
 - Create a PersistentVolumeClaim
description: This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by ZFS Local PV. 
---

# ZFS Local PV User Guide

This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by ZFS Local PV. 

## Prerequisites

Before installing ZFS driver, make sure your Kubernetes Cluster must meet the following prerequisites:

1. All the nodes must have zfs utils installed.
2. ZPOOL has been setup for provisioning the volume.
3. You have access to install RBAC components into kube-system namespace. The OpenEBS ZFS driver components are installed in kube-system namespace to allow them to be flagged as system critical components.

## Setup

Setup
All the node should have zfsutils-linux installed. We should go to the each node of the cluster and install zfs utils:

```
$ apt-get install zfsutils-linux
```

Go to each node and create the ZFS Pool, which will be used for provisioning the volumes. You can create the Pool of your choice, it can be striped, mirrored or raidz pool.

If you have the disk(say /dev/sdb) then you can use the below command to create a striped pool :

```
$ zpool create zfspv-pool /dev/sdb
```

You can also create mirror or raidz pool as per your need. Check https://github.com/openzfs/zfs for more information.

If you do not have the disk, then you can create the zpool on the loopback device which is backed by a sparse file. Use this for testing purpose only.

```
$ truncate -s 100G /tmp/disk.img
$ zpool create zfspv-pool `losetup -f /tmp/disk.img --show`
```

Once the ZFS Pool is created, verify the pool via zpool status command, you should see something like this:

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

## Installation

For installation instructions, see [here](../../quickstart-guide/installation.md).

## Configuration

This section will help you to configure ZFS Local PV.

### Create StorageClass

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
:::

**ZFS as FsType**

In case if we provide "zfs" as the fstype, the ZFS driver will create ZFS DATASET in the ZFS Pool, which is the ZFS filesystem. Here, there will not be any extra layer between application and storage, and applications can get the optimal performance.

The sample storage class for ZFS fstype is provided below:

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

:::note
We are providing `recordsize` which will be used to create the ZFS datasets, which specifies the maximum block size for files in the zfs file system. The recordsize has to be power of 2 for ZFS datasets.
:::

**ZPOOL Availability**

If ZFS pool is available on certain nodes only, then make use of topology to tell the list of nodes where we have the ZFS pool available. As shown in the below storage class, we can use allowedTopologies to describe ZFS pool availability on nodes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
allowVolumeExpansion: true
parameters:
  recordsize: "128k"
  compression: "off"
  dedup: "off"
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: kubernetes.io/hostname
    values:
      - zfspv-node1
      - zfspv-node2
```

The above storage class tells that ZFS pool "zfspv-pool" is available on nodes zfspv-node1 and zfspv-node2 only. The ZFS driver will create volumes on those nodes only.

:::note
The provisioner name for ZFS driver is "zfs.csi.openebs.io", we have to use this while creating the storage class so that the volume provisioning/deprovisioning request can come to ZFS driver.
:::

**Scheduler**

The ZFS driver has its own scheduler which will try to distribute the PV across the nodes so that one node should not be loaded with all the volumes. Currently the driver supports two scheduling algorithms: VolumeWeighted and CapacityWeighted, in which it will try to find a ZFS pool which has less number of volumes provisioned in it or less capacity of volume provisioned out of a pool respectively, from all the nodes where the ZFS pools are available. To know about how to select scheduler via storage-class See [this](https://github.com/openebs/zfs-localpv/blob/HEAD/docs/storageclasses.md#storageclass-with-k8s-scheduler). Once it is able to find the node, it will create a PV for that node and also create a ZFSVolume custom resource for the volume with the NODE information. The watcher for this ZFSVolume CR will get all the information for this object and creates a ZFS dataset(zvol) with the given ZFS property on the mentioned node.

The scheduling algorithm currently only accounts for either the number of ZFS volumes or total capacity occupied from a zpool and does not account for other factors like available cpu or memory while making scheduling decisions.

So if you want to use node selector/affinity rules on the application pod, or have cpu/memory constraints, kubernetes scheduler should be used. To make use of kubernetes scheduler, you can set the `volumeBindingMode` as `WaitForFirstConsumer` in the storage class.

This will cause a delayed binding, i.e kubernetes scheduler will schedule the application pod first and then it will ask the ZFS driver to create the PV.

The driver will then create the PV on the node where the pod is scheduled:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
allowVolumeExpansion: true
parameters:
  recordsize: "128k"
  compression: "off"
  dedup: "off"
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
```

:::note
Once a PV is created for a node, application using that PV will always get scheduled to that particular node only, as PV will be sticky to that node.
:::

The scheduling algorithm by ZFS driver or kubernetes will come into picture only during the deployment time. Once the PV is created, the application can not move anywhere as the data is there on the node where the PV is.

### Create PersistentVolumeClaim

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-zfspv
spec:
  storageClassName: openebs-zfspv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
```

Create a PVC using the storage class created for the ZFS driver. Here, the allocated volume size will be rounded off to the nearest Mi or Gi notation, check the [faq section](../../faqs/faqs.md) for more details.

If we are using the immediate binding in the storageclass then we can check the kubernetes resource for the corresponding ZFS volume, otherwise in late binding case, we can check the same after pod has been scheduled:

```
$ kubectl get zv -n openebs
NAME                                       ZPOOL        NODE           SIZE         STATUS   FILESYSTEM   AGE
pvc-34133838-0d0d-11ea-96e3-42010a800114   zfspv-pool   zfspv-node1    4294967296   Ready    zfs          4s
```

```
$ kubectl describe zv pvc-34133838-0d0d-11ea-96e3-42010a800114 -n openebs
Name:         pvc-34133838-0d0d-11ea-96e3-42010a800114
Namespace:    openebs
Labels:       kubernetes.io/nodename=zfspv-node1
Annotations:  <none>
API Version:  openebs.io/v1alpha1
Kind:         ZFSVolume
Metadata:
  Creation Timestamp:  2019-11-22T09:49:29Z
  Finalizers:
    zfs.openebs.io/finalizer
  Generation:        1
  Resource Version:  2881
  Self Link:         /apis/openebs.io/v1alpha1/namespaces/openebs/zfsvolumes/pvc-34133838-0d0d-11ea-96e3-42010a800114
  UID:               60bc4df2-0d0d-11ea-96e3-42010a800114
Spec:
  Capacity:       4294967296
  Compression:    off
  Dedup:          off
  Fs Type:        zfs
  Owner Node ID:  zfspv-node1
  Pool Name:      zfspv-pool
  Recordsize:     4k
  Volume Type:    DATASET
Status:
  State: Ready
Events:           <none>
```

The ZFS driver will create a ZFS dataset (or zvol as per fstype in the storageclass) on the node zfspv-node1 for the mentioned ZFS pool and the dataset name will same as PV name.

Go to the node zfspv-node1 and check the volume:

```
$ zfs list
NAME                                                  USED  AVAIL  REFER  MOUNTPOINT
zfspv-pool                                            444K   362G    96K  /zfspv-pool
zfspv-pool/pvc-34133838-0d0d-11ea-96e3-42010a800114    96K  4.00G    96K  legacy
```

## Deploy the Application

Create the deployment yaml using the pvc backed by ZFS-LocalPV storage.

```
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
      claimName: csi-zfspv
```

After the deployment of the application, we can go to the node and see that the zfs volume is being used by the application for reading/writting the data and space is consumed from the ZFS pool.

## ZFS Property Change

ZFS Volume Property can be changed like compression on/off can be done by just simply editing the kubernetes resource for the corresponding zfs volume by using below command:

```
$ kubectl edit zv pvc-34133838-0d0d-11ea-96e3-42010a800114 -n openebs
```
You can edit the relevant property like make compression on or make dedup on and save it. This property will be applied to the corresponding volume and can be verified using below command on the node:

```
$ zfs get all zfspv-pool/pvc-34133838-0d0d-11ea-96e3-42010a800114
```

## Deprovisioning

To deprovision the volume we can delete the application which is using the volume and then we can go ahead and delete the pv, as part of deletion of pv this volume will also be deleted from the ZFS pool and data will be freed.

```
$ kubectl delete -f fio.yaml
pod "fio" deleted
$ kubectl delete -f pvc.yaml
persistentvolumeclaim "csi-zfspv" deleted
```

:::Warning
If you are running kernel ZFS on the same set of nodes, the following two points are recommended:

- Disable zfs-import-scan.service service that will avoid importing all pools by scanning all the available devices in the system, disabling scan service will avoid importing pools that are not created by kernel.

- Disabling scan service will not cause harm since zfs-import-cache.service is enabled and it is the best way to import pools by looking at cache file during boot time.

```
$ systemctl stop zfs-import-scan.service
$ systemctl disable zfs-import-scan.service
```

Always maintain upto date /etc/zfs/zpool.cache while performing operations on zfs pools(zpool set cachefile=/etc/zfs/zpool.cache).

## Support

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

[Installation](../../quickstart-guide/installation.md)
[Deploy an Application](../../quickstart-guide/deploy-a-test-application.md)