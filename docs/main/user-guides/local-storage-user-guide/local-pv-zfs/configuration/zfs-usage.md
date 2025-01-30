---
id: zfs-usage
title: Usage of StorageClass(s)
keywords:
 - OpenEBS Local PV ZFS
 - ZFS Local PV
 - Configuration
 - Create StorageClass
 - Create Local PV ZFS StorageClass(s)
description: This guide will help you to create Local PV ZFS StorageClass.
---

# Usage

This document provides a comprehensive guide on configuring and using various types of StorageClass(s) with the ZFS-Local PV driver.

## StorageClass Backed by ZFS Dataset

We can create a StorageClass with the fstype as “zfs”. Here, the ZFS-LocalPV driver will create a ZFS dataset for the persistence storage. The application will get a dataset for the storage operation. We can also provide recordsize, compression, or dedup property in the StorageClass. The dataset will be created with all the properties mentioned in the StorageClass:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: openebs-zfspv
allowVolumeExpansion: true
parameters:
 recordsize: "128k"
 thinprovision: "no"
 fstype: "zfs"
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
```

We have the thinprovision option as “no” in the StorageClass, which means that do reserve the space for all the volumes provisioned using this StorageClass. We can set it to “yes” if we do not want to reserve the space for the provisioned volumes.

The allowVolumeExpansion is needed if we want to resize the volumes provisioned by the StorageClass. ZFS-LocalPV supports online volume resize, which means we don’t need to scale down the application. The new size will be visible to the application automatically.

Once the storageClass is created, we can go ahead and create the PVC and deploy a pod using that PVC.

## StorageClass Backed by ZFS Volume

There are a few applications that need to have different filesystems to work optimally. For example, Concourse performs best using the [“btrfs” filesystem](https://github.com/openebs/zfs-localpv/issues/169). Here we can create a StorageClass with the desired fstype we want. The ZFS-LocalPV driver will create a ZVOL, which is a raw block device carved out from the mentioned ZPOOL and format it to the desired filesystem for the applications to use as persistence storage backed by ZFS Storage Pool:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: openebs-zfspv
parameters:
 volblocksize: "4k"
 thinprovision: "yes"
 fstype: "btrfs"
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
```

Here, we can mention any fstype we want. As of 0.9 release, the driver supports ext2/3/4, xfs, and btrfs fstypes for which it will create a ZFS Volume.

:::note
If `fstype` is not provided in the StorageClass, the k8s takes “ext4" as the default fstype. Here also we can provide volblocksize, compression, and dedup properties to create the volume, and the driver will create the volume with all the properties provided in the StorageClass.
:::

We have the thinprovision option as “yes” in the StorageClass, which means that it does not reserve the space for all the volumes provisioned using this StorageClass. We can set it to “no” if we want to reserve the space for the provisioned volumes.

## StorageClass for Sharing the Persistence Volumes

By default, the ZFS-LocalPV driver does not allow Volumes to be mounted by more than one pod. Even if we try to do that, only one Pod will come into the running state, and the other Pod will be in ContainerCreating state, and it will be failing on the mount.

If we want to share a volume among multiple pods, we can create a StorageClass with the “shared” option as “yes”. For this, we can create a StorageClass backed by ZFS dataset as below:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: openebs-zfspv
allowVolumeExpansion: true
parameters:
 fstype: "zfs"
 shared: "yes"
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
```

Or, we can create the StorageClass backed by ZFS Volume for sharing it among multiple pods as below:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: openebs-zfspv
allowVolumeExpansion: true
parameters:
 fstype: "ext4"
 shared: "yes"
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
```

Here, we have to note that all the Pods using that volume will come to the same node as the data is available on that particular node only. Also, applications need to be aware that the volume is shared by multiple pods and should synchronize with the other Pods to access the data from the volume.

## StorageClass with k8s Scheduler

The ZFS-LocalPV Driver has two types of its own scheduling logic, VolumeWeighted and CapacityWeighted (Supported from zfs-driver: 1.3.0+). To choose any one of the scheduler add scheduler parameter in storage class and give its value accordingly.

```
parameters:
 scheduler: "VolumeWeighted"
 fstype: "zfs"
 poolname: "zfspv-pool"
```

CapacityWeighted is the default scheduler in zfs-localpv driver, so even if we don't use scheduler parameter in storage-class, driver will pick the node where total provisioned volumes have occupied less capacity from the given pool. On the other hand for using VolumeWeighted scheduler, we have to specify it under scheduler parameter in storage-class. Then driver will pick the node to create volume where ZFS Pool is less loaded with the volumes. Here, it just checks the volume count and creates the volume where less volume is configured in a given ZFS Pool. It does not account for other factors like available CPU or memory while making scheduling decisions.

In case where you want to use node selector/affinity rules on the application pod or have CPU/Memory constraints, the Kubernetes scheduler should be used. To make use of Kubernetes scheduler, we can set the volumeBindingMode as WaitForFirstConsumer in the storage class:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: openebs-zfspv
allowVolumeExpansion: true
parameters:
 fstype: "zfs"
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
```

Here, in this case, the Kubernetes scheduler will select a node for the POD and then ask the ZFS-LocalPV driver to create the volume on the selected node. The driver will create the volume where the POD has been scheduled.

From zfs-driver version 1.6.0+, pvc will not be bound till the provisioner succesfully creates the volume on node. Previously, pvc gets bound even if zfs volume creation on nodes keeps failing because scheduler used to return only a single node and provisioner keeps trying to provision the volume on that node only. Now onwards scheduler will return the list of nodes that satisfies the provided topology constraints. Then csi controller will continuosly attempt the volume creation on all these nodes and till volume is created on any of the node or volume creation gets failed on all the nodes. PVC will be bound to a PV only if volume creation succeeds on any one of the nodes.

## StorageClass with Custom Node Labels

There can be a use case where we have certain kinds of ZFS Pool present on certain nodes only, and we want a particular type of application to use that ZFS Pool. We can create a storage class with `allowedTopologies` and mention all the nodes there where that pool is present:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: nvme-zfspv
allowVolumeExpansion: true
parameters:
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
 - key: openebs.io/nodename
   values:
     - node-1
     - node-2
```

At the same time, you must set env variables in the ZFS-LocalPV CSI driver daemon sets (openebs-zfs-node) so that it can pick the node label as the supported topology. It adds "openebs.io/nodename" as default topology key. If the key does not exist in the node labels when the CSI ZFS driver register, the key will not add to the topologyKeys. Set more than one keys separated by commas.

```yaml
env:
  - name: OPENEBS_NODE_NAME
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: OPENEBS_CSI_ENDPOINT
    value: unix:///plugin/csi.sock
  - name: OPENEBS_NODE_DRIVER
    value: agent
  - name: OPENEBS_NAMESPACE
    value: openebs
  - name: ALLOWED_TOPOLOGIES
    value: "test1,test2"
```

We can verify that key has been registered successfully with the ZFS LocalPV CSI Driver by checking the CSI node object yaml:

```yaml
$ kubectl get csinodes pawan-node-1 -oyaml
apiVersion: storage.k8s.io/v1
kind: CSINode
metadata:
  creationTimestamp: "2020-04-13T14:49:59Z"
  name: k8s-node-1
  ownerReferences:
  - apiVersion: v1
    kind: Node
    name: k8s-node-1
    uid: fe268f4b-d9a9-490a-a999-8cde20c4dadb
  resourceVersion: "4586341"
  selfLink: /apis/storage.k8s.io/v1/csinodes/k8s-node-1
  uid: 522c2110-9d75-4bca-9879-098eb8b44e5d
spec:
  drivers:
  - name: zfs.csi.openebs.io
    nodeID: k8s-node-1
    topologyKeys:
    - openebs.io/nodename
    - test1
    - test2
```

If you want to change topology keys, just set new env(ALLOWED_TOPOLOGIES). Refer [FAQs](../../../../faqs/faqs.md#how-to-add-custom-topology-key-to-local-pv-zfs-driver) for more details.

```
$ kubectl edit ds -n kube-system openebs-zfs-node
```

Here we can have ZFS Pool of name “zfspv-pool” created on the nvme disks and want to use this high performing ZFS Pool for the applications that need higher IOPS. We can use the above SorageClass to create the PVC and deploy the application using that.

The ZFS-LocalPV driver will create the Volume in the Pool “zfspv-pool” present on the node  which will be seleted based on scheduler we chose in storage-class. In the above StorageClass, if total capacity of provisioned volumes on node-1 is less, it will create the volume on node-1 only. Alternatively, we can use `volumeBindingMode: WaitForFirstConsumer` to let the k8s select the node where the volume should be provisioned.

The problem with the above StorageClass is that it works fine if the number of nodes is less, but if the number of nodes is huge, it is cumbersome to list all the nodes like this. In that case, what we can do is, we can label all the similar nodes using the same key value and use that label to create the StorageClass.

```
pawan@pawan-master:~/pawan$ kubectl label node pawan-node-2 openebs.io/zpool=nvme
node/pawan-node-2 labeled
pawan@pawan-master:~/pawan$ kubectl label node pawan-node-1 openebs.io/zpool=nvme
node/pawan-node-1 labeled
```

Add "openebs.io/zpool" to the ZFS-LocalPV CSI driver daemon sets env(ALLOWED_TOPOLOGIES). Now, we can create the StorageClass like this:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: nvme-zfspv
allowVolumeExpansion: true
parameters:
 poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
 - key: openebs.io/zpool
   values:
     - nvme
```

Here, the volumes will be provisioned on the nodes which has label “openebs.io/zpool” set as “nvme”.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../zfs-installation.md)
- [Create StorageClass(s)](zfs-create-storageclass.md)
- [StorageClass Parameters](zfs-storageclass-parameters.md)
- [Create PVC](zfs-create-pvc.md)
- [Deploy an Application](zfs-deployment.md)