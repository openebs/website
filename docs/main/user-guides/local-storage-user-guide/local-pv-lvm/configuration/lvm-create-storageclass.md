---
id: lvm-create-storageclass
title: Create StorageClass(s)
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Configuration
 - Create StorageClass(s)
 - Create Local PV LVM StorageClass(s)
description: This guide will help you to create Local PV LVM StorageClass.
---

# Create StorageClass(s)

This document provides step-by-step instructions on creating a custom StorageClass for Local PV LVM, including detailed explanations of supported parameters and their usage. It covers standard LVM-specific parameters and how to configure scheduling logic like SpaceWeighted, CapacityWeighted, or VolumeWeighted.

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

Refer [Storage Classes](https://github.com/openebs/lvm-localpv/blob/develop/docs/storageclasses.md) to know all the supported parameters for Local PV LVM.

## StorageClass Parameters Conformance Matrix

The following matrix shows standard StorageClass parameters for Local PV LVM.

### Standard StorageClass Parameters

| Parameter                                    | Values                                    |
| -------------------------------------------- | :---:                                     |
| `allowVolumeExpansion`                       |  `true` / `false`                         |
| `MountOptions`                               |  Filesystem-supported mount options       |
| `VolumeBindingMode`                          |  `Immediate` / `WaitForFirstConsumer`     |
| `Reclaim Policy`                             |  `Retain`/ `Delete`                       |
| `allowedTopologies`                          |  -                                        |
| `fsType`                                     | `ext2`, `ext3`, `ext4`, `xfs` and `btrfs` |

### LVM Supported StorageClass Parameters

| Parameter | Values |
|-----------|--------|
| `shared` | `yes` |
| `vgpattern` | Regular expression of the volume group name |
| `volgroup` | Volume group name |
| `thinProvision` | `yes` |
| `scheduler` | `SpaceWeighted`, `CapacityWeighted`, `VolumeWeighted` |

### StorageClass with Scheduler Parameters

The Local PV LVM Driver supports three types of scheduling logic: SpaceWeighted, VolumeWeighted, and CapacityWeighted (Supported from lvm-driver: v0.9.0).

Add the scheduler parameter in storage class and give its value accordingly.

```
parameters:
  storage: "lvm"
  volgroup: "lvmvg" 
  scheduler: "CapacityWeighted" ## or "VolumeWeighted"
```

- `SpaceWeighted` is the default scheduler in the Local PV LVM driver, so even if we do not use the scheduler parameter in storageclass, the driver will pick the node where there is a vg with the highest free space adhering to the volgroup/vgpattern parameter.

- If `CapacityWeighted` scheduler is used, then the driver will pick the node containing vg that has the least allocated storage in terms of capacity.

- If `VolumeWeighted` scheduler is used, then the driver will pick the node containing vg (adhering to vgpattern/volgroup parameter) that has the least number of volumes provisioned on it.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [StorageClass Parameters](lvm-storageclass-parameters.md)
- [Create PersistentVolumeClaim](lvm-create-pvc.md)
- [Deploy an Application](lvm-deployment.md)
