---
title: OpenEBS StorageClasses For ZFS-LocalPV
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 09-09-2020
tags: OpenEBS, LocalPV, ZFS
excerpt: In this blog, I will discuss various storage classes we can use to dynamically provision the volumes backed by ZFS-LocalPV Storage Pool.
---

In this blog, I will discuss various storage classes we can use to dynamically provision the volumes backed by ZFS Storage Pool.

Please read my previous [post](/blog/openebs-dynamic-volume-provisioning-on-zfs?__hstc=216392137.7dc0753f698b104ea002a16b84268b54.1580207831486.1580207831486.1580207831486.1&amp;__hssc=216392137.1.1580207831487&amp;__hsfp=818904025) for instructions on setting up the *ZFS-LocalPV*. Alternatively, you can also go through the [README](https://github.com/openebs/zfs-localpv/blob/master/README.md) section of the [*ZFS-LocalPV* repository](https://github.com/openebs/zfs-localpv).

### **StorageClass Backed by ZFS Dataset**

We can create a StorageClass with the fstype as “zfs”. Here, the ZFS-LocalPV driver will create a ZFS dataset for the persistence storage. The application will get a dataset for the storage operation. We can also provide recordsize, compression, or dedup property in the StorageClass. The dataset will be created with all the properties mentioned in the StorageClass:

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
     name: openebs-zfspv
    allowVolumeExpansion: true
    parameters:
     recordsize: "4k"
     thinprovision: "no"
     fstype: "zfs"
     poolname: "zfspv-pool"
    provisioner: zfs.csi.openebs.io

We have the thinprovision option as “no” in the StorageClass, which means that do reserve the space for all the volumes provisioned using this StorageClass. We can set it to “yes” if we don’t want to reserve the space for the provisioned volumes.

The allowVolumeExpansion is needed if we want to resize the volumes provisioned by the StorageClass. ZFS-LocalPV supports online volume resize, which means we don’t need to scale down the application. The new size will be visible to the application automatically.

Once the storageClass is created, we can go ahead and create the PVC and deploy a pod using that PVC.

### **StorageClass Backed by ZFS Volume**

There are a few applications that need to have different filesystems to work optimally. For example, Concourse performs best using the “btrfs” filesystem ([https://github.com/openebs/zfs-localpv/issues/169](https://github.com/openebs/zfs-localpv/issues/169)). Here we can create a StorageClass with the desired fstype we want. The ZFS-LocalPV driver will create a ZVOL, which is a raw block device carved out from the mentioned ZPOOL and format it to the desired filesystem for the applications to use as persistence storage backed by ZFS Storage Pool:

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
     name: opeenbs-zfspv
    parameters:
     volblocksize: "4k"
     thinprovision: "yes"
     fstype: "btrfs"
     poolname: "zfspv-pool"
    provisioner: zfs.csi.openebs.io

Here, we can mention any fstype we want. As of 0.9 release, the driver supports ext2/3/4, xfs, and btrfs fstypes for which it will create a ZFS Volume. Please note here, if fstype is not provided in the StorageClass, the k8s takes “ext4" as the default fstype. Here also we can provide volblocksize, compression, and dedup properties to create the volume, and the driver will create the volume with all the properties provided in the StorageClass.

We have the thinprovision option as “yes” in the StorageClass, which means that it does not reserve the space for all the volumes provisioned using this StorageClass. We can set it to “no” if we want to reserve the space for the provisioned volumes.

### **StorageClass for Sharing the Persistence Volumes**

By default, the ZFS-LocalPV driver does not allow Volumes to be mounted by more than one pod. Even if we try to do that, only one Pod will come into the running state, and the other Pod will be in ContainerCreating state, and it will be failing on the mount.

If we want to share a volume among multiple pods, we can create a StorageClass with the “shared” option as “yes”. For this, we can create a StorageClass backed by ZFS dataset as below :

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

Or, we can create the StorageClass backed by ZFS Volume for sharing it among multiple pods as below :

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

Here, we have to note that all the Pods using that volume will come to the same node as the data is available on that particular node only. Also, applications need to be aware that the volume is shared by multiple pods and should synchronize with the other Pods to access the data from the volume.

### **StorageClass With k8s Scheduler**

The ZFS-LocalPV Driver has its own scheduling logic, where it creates the volume where the ZFS Pool is less loaded with the volumes. Here, it just checks the volume count and creates the volume where less volume is configured in a given ZFS Pool. It does not account for other factors like available CPU or memory while making scheduling decisions. So if you want to use node selector/affinity rules on the application pod or have CPU/Memory constraints, the Kubernetes scheduler should be used. To make use of Kubernetes scheduler, we can set the volumeBindingMode as WaitForFirstConsumer in the storage class:

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

Here, in this case, the Kubernetes scheduler will select a node for the POD and then ask the ZFS-LocalPV driver to create the volume on the selected node. The driver will create the volume where the POD has been scheduled.

### **StorageClass With Custom Node Labels**

There can be a use case where we have certain kinds of ZFS Pool present on certain nodes only, and we want a particular type of application to use that ZFS Pool. We can create a storage class with `allowedTopologies` and mention all the nodes there where that pool is present:

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

Here we can have ZFS Pool of name “zfspv-pool” created on the nvme disks and want to use this high performing ZFS Pool for the applications that need higher IOPS. We can use the above StorageClass to create the PVC and deploy the application using that.

The ZFS-LocalPV driver will create the Volume in the Pool “zfspv-pool” present on the node with fewer of volumes provisioned among the given node list. In the above StorageClass, if there provisioned volumes on node-1 are less, it will create the volume on node-1 only. Alternatively, we can use `volumeBindingMode: WaitForFirstConsumer` to let the k8s select the node where the volume should be provisioned.

The problem with the above StorageClass is that it works fine if the number of nodes is less, but if the number of nodes is huge, it is cumbersome to list all the nodes like this. In that case, what we can do is, we can label all the similar nodes using the same key value and use that label to create the StorageClass.

    pawan@pawan-master:~/pawan$ kubectl label node pawan-node-2 openebs.io/zpool=nvme
    node/pawan-node-2 labeled
    pawan@pawan-master:~/pawan$ kubectl label node pawan-node-1 openebs.io/zpool=nvme
    node/pawan-node-1 labeled

Now, restart the ZFS-LocalPV Driver (if already deployed otherwise, please ignore) so that it can pick the new node label as the supported topology.

    $ kubectl delete po -n kube-system -l role=openebs-zfs

Now, we can create the StorageClass like this:

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

Here, the volumes will be provisioned on the nodes which has label “openebs.io/zpool” set as “nvme”.

### **Conclusion :**

We can set up different kinds of StorageClasses as per our need, and then we can proceed with PVC and POD creation. The driver will take the care of honoring the requests put in the PVC and the StorageClass.

I hope you found this post useful. Feel free to contact me with any feedback or questions by using the comment section below.
