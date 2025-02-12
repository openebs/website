---
id: zfs-create-storageclass
title: Create StorageClass(s)
keywords:
 - OpenEBS Local PV ZFS
 - ZFS Local PV
 - Configuration
 - Create StorageClass
 - Create Local PV ZFS StorageClass(s)
description: This guide will help you to create Local PV ZFS StorageClass.
---

# Create StorageClass(s)

This document provides step-by-step instructions on creating a custom StorageClass for Local PV ZFS, including detailed explanations of supported parameters and their usage.

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

The storage class contains the volume parameters like recordsize (should be power of 2), compression, dedup, and fstype. You can select what are all parameters you want. In case ZFS property parameters are not provided, the volume will inherit the properties from the ZFS Pool.

The poolname is the must argument. It should be noted that poolname can either be the root dataset or a child dataset e.g.

```
poolname: "zfspv-pool"
poolname: "zfspv-pool/child"
```

Also, the dataset provided under `poolname` must exist on all the nodes with the name given in the storage class. Check the doc on storageclasses to know all the supported parameters for Local PV ZFS.

## ext2/3/4 or xfs or btrfs as FsType

If we provide fstype as one of ext2/3/4 or xfs or btrfs, the driver will create a ZVOL, which is a blockdevice carved out of ZFS Pool. This blockdevice will be formatted with corresponding filesystem before it's used by the driver.

:::info
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
We are providing `volblocksize` instead of `recordsize` since we will create a ZVOL, for which we can select the blocksize with which we want to create the block device. The volblocksize should be power of 2.
:::

## ZFS as FsType

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

## ZFS Pool Availability

If ZFS pool is available on certain nodes only, then make use of topology to tell the list of nodes where we have the ZFS pool available. As shown in the below storage class, we can use allowedTopologies to use the ZFS pools only from the specified nodes.

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

## Scheduler

The ZFS driver has its own scheduler which will try to distribute the PV across the nodes so that one node should not be loaded with all the volumes. Currently the driver supports two scheduling algorithms: VolumeWeighted and CapacityWeighted, in which it will try to find a ZFS pool which has less number of volumes provisioned in it or less capacity of volume provisioned out of a pool respectively, from all the nodes where the ZFS pools are available. Refer [StorageClass With K8s Scheduler](https://github.com/openebs/zfs-localpv/blob/HEAD/docs/storageclasses.md#storageclass-with-k8s-scheduler) to learn how to select a scheduler via storage class.

Once it can find the node, it will create a PV for that node and also create a ZFSVolume custom resource for the volume with the NODE information. The watcher for this ZFSVolume CR will get all the information for this object and creates a ZFS dataset (zvol) with the given ZFS property on the mentioned node.

The scheduling algorithm currently only accounts for either the number of ZFS volumes or total capacity occupied from a zpool and does not account for other factors like available cpu or memory while making scheduling decisions.

So if you want to use node selector/affinity rules on the application pod, or have cpu/memory constraints, Kubernetes scheduler should be used. To make use of Kubernetes scheduler, you can set the `volumeBindingMode` as `WaitForFirstConsumer` in the storage class.

This will cause a delayed binding, i.e. Kubernetes scheduler will schedule the application pod first and then it will ask the ZFS driver to create the PV.

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

The scheduling algorithm by ZFS driver or Kubernetes will come into picture only during the deployment time. Once the PV is created, the application can not move anywhere as the data is there on the node where the PV is.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../zfs-installation.md)
- [StorageClass Parameters](zfs-storageclass-parameters.md)
- [Create PVC](zfs-create-pvc.md)
- [Usage](zfs-usage.md)
- [Deploy an Application](zfs-deployment.md)