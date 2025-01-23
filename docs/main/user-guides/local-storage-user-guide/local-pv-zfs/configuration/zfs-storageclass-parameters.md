---
id: zfs-storageclass-parameters
title: StorageClass Parameters
keywords:
 - OpenEBS Local PV ZFS
 - ZFS Local PV
 - Configuration
 - Create StorageClass
 - Create Local PV ZFS StorageClass(s)
description: This guide will help you to create Local PV ZFS StorageClass.
---

# StorageClass Parameters

This document outlines the key parameters used in configuring a StorageClass for Local PV ZFS. The document categorizes parameters into mandatory and optional, emphasizing critical settings such as poolname, while detailing optional features like FsType, recordsize, compression, and deduplication.

## Poolname (Must Parameter)

Poolname specifies the name of the pool where the volume has been created. The *poolname* is the must argument. It should be noted that *poolname* can either be the root dataset or a child dataset e.g.

```
poolname: "zfspv-pool"
poolname: "zfspv-pool/child"
```

Also, the dataset provided under `poolname` must exist on *all the nodes* with the name given in the storage class.

## FSType (Optional Parameter)

FsType specifies filesystem type for the zfs volume/dataset. If FsType is provided as "zfs", then the driver will create a ZFS dataset, formatting is
not required as underlying filesystem is ZFS anyway. If FsType is ext2, ext3, ext4, btrfs, or xfs, then the driver will create a ZVOL and format the volume
accordingly. FsType can not be modified once volume has been provisioned. If fstype is not provided, k8s takes ext4 as the default fstype.

allowed values: "zfs", "ext2", "ext3", "ext4", "xfs", "btrfs"

## Recordsize (Optional Parameter)

This parameter is applicable if fstype provided is "zfs" otherwise it will be ignored. It specifies a suggested block size for files in the file system.

Allowed values: Any power of 2 from 512 bytes to 128 Kbytes

## Volblocksize (Optional Parameter)

This parameter is applicable if fstype is anything but "zfs" where we create a ZVOL a raw block device carved out of ZFS Pool. It specifies the block size to use for the zvol. The volume size can only be set to a multiple of volblocksize, and cannot be zero.

Allowed values: Any power of 2 from 512 bytes to 128 Kbytes

## Compression (Optional Parameter)

Compression specifies the block-level compression algorithm to be applied to the ZFS Volume and datasets. The value "on" indicates ZFS to use the default compression algorithm.

Allowed values: "on", "off", "lzjb", "zstd", "zstd-1", "zstd-2", "zstd-3", "zstd-4", "zstd-5", "zstd-6", "zstd-7", "zstd-8", "zstd-9", "zstd-10", "zstd-11", "zstd-12", "zstd-13", "zstd-14", "zstd-15", "zstd-16", "zstd-17", "zstd-18", "zstd-19", "gzip", "gzip-1", "gzip-2", "gzip-3", "gzip-4", "gzip-5", "gzip-6", "gzip-7", "gzip-8", "gzip-9", "zle", "lz4"

## Dedup (Optional Parameter)

Deduplication is the process for removing redundant data at the block level, reducing the total amount of data stored.

Allowed values: "on", "off"

## Thinprovision (Optional Parameter)

ThinProvision describes whether space reservation for the source volume is required or not. The value "yes" indicates that volume should be thin provisioned and "no" means thick provisioning of the volume. If thinProvision is set to "yes" then volume can be provisioned even if the ZPOOL does not have enough capacity. If thinProvision is set to "no" then volume can be provisioned only if the ZPOOL has enough capacity and capacity required by volume can be reserved. Omitting this parameter lets ZFS default behavior prevail: `thin` provisioning for filesystems and `thick` provisioning (through refreservation) for volumes.

Allowed values: "yes", "no"

## Shared (Optional Parameter)

Shared specifies whether the volume can be shared among multiple pods. If it is not set to "yes", then the ZFS-LocalPV Driver will not allow the volumes to be mounted by more than one pods. The default value is "no" if shared is not provided in the storageclass.

Allowed values: "yes", "no"

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../zfs-installation.md)
- [Create StorageClass(s)](zfs-create-storageclass.md)
- [Create PVC](zfs-create-pvc.md)
- [Usage](zfs-usage.md)
- [Deploy an Application](zfs-deployment.md)