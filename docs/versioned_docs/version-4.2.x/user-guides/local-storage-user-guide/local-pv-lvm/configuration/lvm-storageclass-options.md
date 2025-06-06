---
id: lvm-storageclass-options
title: StorageClass Options
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Configuration
 - Create StorageClass
 - StorageClass Options
description: This guide will help you to create Local PV LVM StorageClass. 
---

# StorageClass Options

This document provides step-by-step instructions to the configurable options available for StorageClass when working with Local PV LVM.
Each StorageClass option helps you configure features such as volume expansion, mount options, file systems, volume sharing, topology-aware provisioning, and more.

## AllowVolumeExpansion (Optional)

Users can expand the volumes only when the `allowVolumeExpansion` field is set to true in storageclass. If a field is unspecified, then volume expansion is not supported. Refer [Volume Expansion](https://github.com/openebs/lvm-localpv/blob/HEAD/design/lvm/resize_workflow.md#lvm-localpv-volume-expansion) for more information about expansion workflow.
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvm
allowVolumeExpansion: true     ## If set to true then dynamically it allows expansion of volume
provisioner: local.csi.openebs.io
parameters:
  storage: "lvm"
  vgpattern: "lvmvg.*"
```

## MountOptions (Optional)

Volumes that are provisioned via Local PV LVM will use the mount options specified in storageclass during volume mounting time inside an application. If a field is unspecified/specified, `-o default` option will be added to mount the volume. Refer [Mount Options](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/mount_options.md) for more information about mount options workflow.

:::note
Mount options are not validated. If mount options are invalid, then volume mount fails.
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvm
provisioner: local.csi.openebs.io
parameters:
  storage: "lvm"
  vgpattern: "lvmvg.*"
mountOptions:    ## Various mount options of volume can be specified here
  - debug
```
:::

## Parameters

Local PV LVM storageclass supports various parameters for different use cases. The following are the supported parameters:

### FsType (Optional)

  Admin can specify filesystem in storageclass. Local PV LVM CSI-Driver will format block device with specified filesystem and mount in the application pod. If fsType is not specified defaults to `ext4` filesystem. Refer [FsType](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/fs_type.md) for more information about filesystem type workflow.

  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: openebs-lvm
  allowVolumeExpansion: true
  provisioner: local.csi.openebs.io
  parameters:
    storage: "lvm"
    vgpattern: "lvmvg.*"
    fsType: xfs               ## Supported filesystems are ext2, ext3, ext4, xfs & btrfs
  ```

### Shared (Optional)

  Local PV LVM volume mount points can be shared among the multiple pods on the same node. Applications that can share the volume can set the value of `shared` parameter to yes. Refer [Shared Volume](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/shared.md) for more information about workflow of shared volume.

  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: nvme-lvmsc
  allowVolumeExpansion: true
  provisioner: local.csi.openebs.io
  parameters:
    volgroup: "lvmvg"
    shared: "yes"             ## Parameter that states volume can be shared among multiple pods
  ```

### vgpattern (Mandatory if `volgroup` is not provided; otherwise optional)

  vgpattern specifies the regular expression for the volume groups on node from which the volumes can be created. The *vgpattern* is the must argument if `volgroup` parameter is not provided in the storageclass. Here, in this case, the driver will pick the volume groups matching the vgpattern with enough free capacity to accommodate the volume and will use the one which has the largest capacity available for provisioning the volume. Refer [VG Pattern](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/vg_pattern.md) for more information about vgpattern workflow. 

  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: openebs-lvm
  provisioner: local.csi.openebs.io
  parameters:
    storage: "lvm"
    vgpattern: "lvmvg.*"     ## vgpattern specifies pattern of lvm volume group name
  ```

  If `volgroup` and `vgpattern` both the parameters are defined in the storageclass then `volgroup` will get higher priority and the driver will use that to provision to the volume.

  :::note
  Either `volgroup` or `vgpattern` should be present in the storageclass parameters to make the provisioning successful.
  :::

### Volgroup (Mandatory if `vgpattern` is not provided; otherwise optional)

  volgroup specifies the name of the volume group on the nodes from which the volumes will be created. The *volgroup* is the must argument if the `vgpattern` is not provided in the storageclass.

  :::info
  It is recommended to use vgpattern since volumegroup will be deprecated in future.
  :::

  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: openebs-lvm
  provisioner: local.csi.openebs.io
  parameters:
    storage: "lvm"
    volgroup: "lvmvg"       ## volgroup specifies name of lvm volume group
  ```

### ThinProvision (Optional)

  For creating a thin-provisioned volume, use the thinProvision parameter in the storage class. Its allowed values are: "yes" and "no". If we do not set the thinProvision parameter by default its value will be `no` and it will work as thick provisioned volumes. Refer [Thin Provisioning](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/thin_provision.md) for more details about thinProvisioned workflow.

  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: openebs-lvm
  provisioner: local.csi.openebs.io
  parameters:
    storage: "lvm"
    volgroup: "lvmvg"
    thinProvision: "yes"      ## Parameter that enables thinprovisioning
  ```
  Before creating a thin provision volume, make sure that the required thin provisioning kernel module `dm_thin_pool` is loaded on all the nodes.

  To verify if the modules are loaded, run:
  ```sh
  $ lsmod | grep dm_thin_pool
  ```

  If modules are not loaded, then execute the following command to load the modules:
  ```sh
  $ modprobe dm_thin_pool
  ```

### VolumeBindingMode (Optional)

Local PV LVM supports two types of volume binding modes that are `Immediate` and `late binding`.
- Immediate: Indicates that volume binding and dynamic provisioning occur once the PersistentVolumeClaim is created.
- WaitForFirstConsumer: It is also known as late binding which will delay binding and provisioning of a PersistentVolumeClaim until a pod using the PersistentVolumeClaim is created.
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvm
provisioner: local.csi.openebs.io
parameters:
  storage: "lvm"
  vgpattern: "lvmvg.*"
volumeBindingMode: WaitForFirstConsumer     ## It can also replaced by Immediate volume binding mode depending on the use case.
```

 Refer [StorageClass VolumeBindingMode](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/volume_binding_mode.md) for more details about VolumeBindingMode.

### Reclaim Policy (Optional)

Local PV LVM supports both types of reclaim policy which are `Delete` and `Retain`. If not specified defaults to `Delete`.
- Delete: Indicates that backend volume resources (PV, LVMVolume) will be deleted as soon as after deleting PVC.
- Retain: Indicates backend volume resources can be reclaimed by PVCs or retained in the cluster.
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvm
provisioner: local.csi.openebs.io
parameters:
  storage: "lvm"
  vgpattern: "lvmvg.*"
reclaimPolicy: Delete          ## Reclaim policy can be specified here. It also accepts Retain
```

Refer [StorageClass Volume Reclaim Policy](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/reclaim_policy.md) for more details about the reclaim policy.

## StorageClass with Custom Node Labels

There can be a use case where we have certain kinds of Volume Groups present on certain nodes only, and we want a particular type of application to use that VG. We can create a storage class with `allowedTopologies` and mention all the nodes there where that vg is present:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: lvm-sc
allowVolumeExpansion: true
parameters:
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
 - key: openebs.io/nodename
   values:
     - node-1
     - node-2
```

At the same time, you must set env variables in the Local PV LVM CSI driver daemon sets (openebs-lvm-node) so that it can pick the node label as the supported topology. It adds "openebs.io/nodename" as the default topology key. If the key does not exist in the node labels when the CSI LVM driver registers, the key will not add to the topologyKeys. Set more than one key separated by commas.

```yaml
env:
  - name: OPENEBS_NODE_ID
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: OPENEBS_CSI_ENDPOINT
    value: unix:///plugin/csi.sock
  - name: OPENEBS_NODE_DRIVER
    value: agent
  - name: LVM_NAMESPACE
    value: openebs
  - name: ALLOWED_TOPOLOGIES
    value: "test1,test2"
```

We can verify that the key has been registered successfully with the Local PV LVM CSI Driver by checking the CSI node object yaml:

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
  - name: local.csi.openebs.io
    nodeID: k8s-node-1
    topologyKeys:
    - openebs.io/nodename
    - test1
    - test2
```

If you want to change topology keys, just a set new env(ALLOWED_TOPOLOGIES). Refer [FAQs](./faq.md#1-how-to-add-custom-topology-key) for more details.

```
$ kubectl edit ds -n kube-system openebs-lvm-node
```

Here, we can have a volume group named “lvmvg” created on the nvme disks and want to use this high performing LVM volume group for the applications that need higher IOPS. We can use the above SorageClass to create the PVC and deploy the application using that.

The Local PV LVM driver will create the Volume in the volume group “lvmvg” present on the node with fewer volumes provisioned among the given node list. In the above StorageClass, if there provisioned volumes on node-1 are less, it will create the volume on node-1 only. Alternatively, we can use `volumeBindingMode: WaitForFirstConsumer` to let the k8s select the node where the volume should be provisioned.

The problem with the above StorageClass is that it works fine if the number of nodes is less, but if the number of nodes is huge, it is cumbersome to list all the nodes like this. In that case, what we can do is, we can label all the similar nodes using the same key value and use that label to create the StorageClass.

```
user@k8s-master:~ $ kubectl label node k8s-node-2 openebs.io/lvmvg=nvme
node/k8s-node-2 labeled
user@k8s-master:~ $ kubectl label node k8s-node-1 openebs.io/lvmvg=nvme
node/k8s-node-1 labeled
```

Add "openebs.io/lvmvg" to the Local PV LVM CSI driver daemon sets env(ALLOWED_TOPOLOGIES). Now, we can create the StorageClass like this:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: nvme-lvmsc
allowVolumeExpansion: true
parameters:
 volgroup: "lvmvg"
provisioner: local.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
 - key: openebs.io/lvmvg
   values:
     - nvme
```

Here, the volumes will be provisioned on the nodes that have label “openebs.io/lvmvg” set as “nvme”.

 Refer [Allowed Topologies](https://github.com/openebs/lvm-localpv/blob/develop/design/lvm/storageclass-parameters/allowed_topologies.md) for more details about topology.

### VolumeGroup Availability

If the LVM volume group is available on certain nodes only, then make use of topology to tell the list of nodes where we have the volgroup available. As shown in the below storage class, we can use allowedTopologies to describe volume group availability on nodes.

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
 The provisioner name for the LVM driver is "local.csi.openebs.io", we have to use this while creating the storage class so that the volume provisioning/deprovisioning request can come to the LVM driver.
 :::

 ## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../lvm-installation.md)
- [Create StorageClass(s)](lvm-create-storageclass.md)
- [Create PersistentVolumeClaim](lvm-create-pvc.md)
- [Deploy an Application](lvm-deployment.md)
