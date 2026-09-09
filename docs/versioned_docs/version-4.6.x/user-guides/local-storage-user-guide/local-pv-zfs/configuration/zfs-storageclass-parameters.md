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

This document describes the StorageClass fields and parameters supported by Local PV ZFS. It covers the standard Kubernetes StorageClass fields, such as volume expansion, mount options, and binding mode, along with the ZFS-specific parameters that control the properties of the underlying dataset or ZVOL, such as poolname, recordsize, compression, and quotatype.

## Standard StorageClass Fields

These fields are set at the top level of the StorageClass, alongside `provisioner`, and not under `parameters`.

| Field | Values |
|-------|--------|
| `allowVolumeExpansion` | `true`, `false` |
| `mountOptions` | Mount options supported by the filesystem |
| `volumeBindingMode` | `Immediate`, `WaitForFirstConsumer` |
| `reclaimPolicy` | `Delete`, `Retain` |
| `allowedTopologies` | Node label key and the values to match |

## Supported StorageClass Parameters

These parameters are set under `parameters` in the StorageClass.

| Parameter | Requirement | Allowed Values | Applies To |
|-----------|-------------|----------------|------------|
| `poolname` | Required | Existing ZFS pool or child dataset (for example, `zfspv-pool`, `zfspv-pool/child`) | Both |
| `fstype` | Optional | `zfs`, `ext2`, `ext3`, `ext4`, `xfs`, `btrfs` | Both |
| `formatOptions` | Optional | Extra `mkfs` options as a space-separated string | ZVOL |
| `recordsize` | Optional | Any power of 2 from 512 bytes to 128 KiB | Dataset |
| `volblocksize` | Optional | Any power of 2 from 512 bytes to 128 KiB | ZVOL |
| `compression` | Optional | `on`, `off`, `lzjb`, `lz4`, `zle`, `gzip`, `gzip-1` through `gzip-9`, `zstd`, `zstd-fast`, `zstd-1` through `zstd-19` | Both |
| `dedup` | Optional | `on`, `off` | Both |
| `atime` | Optional | `on`, `off` | Dataset |
| `logbias` | Optional | `latency`, `throughput` | Both |
| `thinProvision` | Optional | `yes`, `no` | Both |
| `quotatype` | Optional | `quota`, `refquota` | Dataset |
| `shared` | Optional | `yes`, `no` | Both |

In the **Applies To** column:

- **Dataset** means that the parameter takes effect only when `fstype` is "zfs".
- **ZVOL** means that the parameter takes effect only when `fstype` is a filesystem other than "zfs".
- **Both** means that the parameter takes effect in either case.

A parameter that does not apply to the type of volume being created is ignored.

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


## FormatOptions (Optional Parameter)

Use the `formatOptions` parameter to pass extra options to the `mkfs` command that formats the ZVOL with the filesystem specified by `fstype`. Provide the options as a single space-separated string.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
allowVolumeExpansion: true
parameters:
  poolname: "zfspv-pool"
  fstype: "xfs"
  formatOptions: "-i nrext64=0"      ## Extra mkfs options for ZVOL backed volumes
provisioner: zfs.csi.openebs.io
```

The options are applied only while the volume is being formatted, which happens the first time the volume is mounted. Changing `formatOptions` in the storage class has no effect on volumes that have already been formatted.

Refer to the documentation of the filesystem you are using to know which format options it supports.

To apply the same options to every volume of a filesystem across the cluster instead of per StorageClass, see [Node-Level Default Format Options](#node-level-default-format-options).

:::note
Format options apply only to ZVOL backed volumes. A StorageClass with `fstype: "zfs"` gets a ZFS dataset, which is not formatted with `mkfs`, so `formatOptions` has no effect on it.

Format options are not validated by the driver. If the options are not valid for the chosen filesystem, then formatting fails and the volume does not mount.

Format options are also not applied to [raw block volumes](../advanced-operations/zfs-raw-block-volume.md), because a raw block volume is not formatted with a filesystem.
:::

## Node-Level Default Format Options

`formatOptions` sets the extra `mkfs` options of a single StorageClass. To apply options to every volume of a filesystem across the cluster instead, the node component takes `defaultFormatOptions`. This is a Helm value set when you install or upgrade the driver, not a StorageClass parameter. Use it when an option is a property of your nodes rather than of one workload, such as a `mkfs.xfs` option that the kernel of your nodes requires.

Give `zfsNode.defaultFormatOptions` one entry per filesystem. The key is a filesystem the driver formats (`ext2`, `ext3`, `ext4`, `xfs` or `btrfs`) and the value is that filesystem's `mkfs` options as a single space-separated string.

```yaml
zfsNode:
  defaultFormatOptions:
    ext4: "-m 0 -O ^orphan_file"
    xfs: "-i nrext64=0"
```

Install or upgrade with the values file:

```
helm upgrade --install zfs-localpv openebs/zfs-localpv -n openebs --create-namespace -f values.yaml
```

A single filesystem can also be set on the command line. Use `--set-string`, because the value contains spaces and an `=` sign:

```
helm upgrade --install zfs-localpv openebs/zfs-localpv -n openebs --create-namespace \
  --set-string 'zfsNode.defaultFormatOptions.xfs=-i nrext64=0'
```

The chart turns each entry into one `--default-format-options=<fstype>=<options>` argument of the node plugin and rolls the node DaemonSet. Filesystems whose value is empty are skipped. The chart ships no defaults.

### How DefaultFormatOptions and FormatOptions Interact

For each volume the driver resolves one set of options for the filesystem it is about to create:

1. If the StorageClass of the volume sets `formatOptions`, those options are used.
2. Otherwise the `defaultFormatOptions` entry of that filesystem is used.
3. If neither is set, the volume is formatted with the defaults of `mkfs`.

The two are **not merged**. A StorageClass that sets `formatOptions` replaces the default of its filesystem completely, so a StorageClass that needs both its own option and a node wide one has to repeat the node wide one:

```yaml
parameters:
  poolname: "zfspv-pool"
  fstype: "xfs"
  formatOptions: "-i nrext64=0 -b size=4096"   ## repeats the node wide -i nrext64=0
```

The options are applied only while a volume is being formatted, which happens the first time it is mounted. Changing `defaultFormatOptions` therefore affects volumes provisioned after the change, and never reformats a volume that already carries a filesystem.

### Verifying the Configuration

Confirm that the node plugin received the arguments:

```
$ kubectl get pod -n openebs -l app=openebs-zfs-node \
    -o jsonpath='{.items[0].spec.containers[?(@.name=="openebs-zfs-plugin")].args}'
```

After a volume of that filesystem is mounted for the first time, the node plugin log shows the options it passed to `mkfs`:

```
$ kubectl logs -n openebs -l app=openebs-zfs-node -c openebs-zfs-plugin | grep "attempting to format"
```

:::note
If an `xfs` volume fails to mount after provisioning because the `mkfs.xfs` in the driver image is newer than the kernel of your nodes, see [Unable to mount xfs File System](../../../../troubleshooting/troubleshooting-local-storage.md#unable-to-mount-xfs-file-system).
:::

## Recordsize (Optional Parameter)

This parameter is applicable if fstype provided is "zfs" otherwise it will be ignored. It specifies a suggested block size for files in the file system.

## Volblocksize (Optional Parameter)

This parameter is applicable if fstype is anything but "zfs" where we create a ZVOL a raw block device carved out of ZFS Pool. It specifies the block size to use for the zvol. The volume size can only be set to a multiple of volblocksize, and cannot be zero.

## Compression (Optional Parameter)

Compression specifies the block-level compression algorithm to be applied to the ZFS Volume and datasets. The value "on" indicates ZFS to use the default compression algorithm.

## Dedup (Optional Parameter)

Deduplication is the process for removing redundant data at the block level, reducing the total amount of data stored.

## Atime (Optional Parameter)

Atime controls whether the access time of a file is updated when the file is read. Setting it to "off" avoids the write traffic that is otherwise generated by reading files, which can improve performance for read-heavy workloads.

This parameter is applicable if fstype provided is "zfs". For any other fstype the driver creates a ZVOL, where atime does not apply, and the value is ignored.

If atime is not provided in the storageclass, the volume inherits the value from the parent ZFS pool or dataset.

## Logbias (Optional Parameter)

Logbias provides a hint to ZFS about how to handle synchronous requests for the volume. With "latency", ZFS uses the separate log devices (SLOG) of the pool, if any, to handle these requests at low latency. With "throughput", ZFS does not use the separate log devices and instead optimizes synchronous operations for overall pool throughput.

This parameter applies to both ZFS datasets and ZVOLs.

If logbias is not provided in the storageclass, the volume inherits the value from the parent ZFS pool or dataset.

## Thinprovision (Optional Parameter)

ThinProvision describes whether space reservation for the source volume is required or not. The value "yes" indicates that volume should be thin provisioned and "no" means thick provisioning of the volume. If thinProvision is set to "yes" then volume can be provisioned even if the ZPOOL does not have enough capacity. If thinProvision is set to "no" then volume can be provisioned only if the ZPOOL has enough capacity and capacity required by volume can be reserved. Omitting this parameter lets ZFS default behavior prevail: `thin` provisioning for filesystems and `thick` provisioning (through refreservation) for volumes.

## Quotatype (Optional Parameter)

Quotatype selects the ZFS property that is used to enforce the size of the volume. With "quota", the limit applies to the dataset together with everything it contains, including its snapshots and clones. With "refquota", the limit applies only to the data that the dataset itself references, so snapshots and clones are not counted against it.

Quotatype also determines the property that is used to reserve space when `thinProvision` is set to "no". With "quota", the space is reserved using `reservation`, and with "refquota", it is reserved using `refreservation`.

This parameter is applicable if fstype provided is "zfs" otherwise it will be ignored. Quotatype can not be modified once volume has been provisioned. If quotatype is not provided in the storageclass, the driver uses "quota".

## Shared (Optional Parameter)

Shared specifies whether the volume can be shared among multiple pods. If it is not set to "yes", then the ZFS-LocalPV Driver will not allow the volumes to be mounted by more than one pods. The default value is "no" if shared is not provided in the storageclass.

## AllowVolumeExpansion (Optional)

Volumes provisioned by a StorageClass can be expanded only when `allowVolumeExpansion` is set to `true`. If this field is not specified, volume expansion is not supported.

Local PV ZFS supports online volume expansion, which means that the application does not need to be scaled down for the volume to be resized. Refer to [Resize](../advanced-operations/zfs-resize.md) for more details.

:::note
btrfs does not support online volume resize, so we can not resize the btrfs volumes.
:::

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
```

## MountOptions (Optional)

Volumes provisioned by Local PV ZFS are mounted using the mount options specified in the storageclass.

Mount options apply to volumes that are mounted with a filesystem, which covers both ZFS datasets and formatted ZVOLs. They are not applied to [raw block volumes](../advanced-operations/zfs-raw-block-volume.md), because a raw block volume is attached to the pod as a block device instead of being mounted with a filesystem.

:::note
Mount options are not validated. If the mount options are invalid, then the volume mount fails.
:::

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
parameters:
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
mountOptions:
  - nosuid
```

## VolumeBindingMode (Optional)

Local PV ZFS supports both the volume binding modes that are `Immediate` and `WaitForFirstConsumer`.

- `Immediate` indicates that volume binding and dynamic provisioning occur once the PersistentVolumeClaim is created.
- `WaitForFirstConsumer` is also known as late binding, which delays the binding and provisioning of a PersistentVolumeClaim until a pod using it is created.

Use `WaitForFirstConsumer` when the application pod has node selector or affinity rules, or CPU and memory constraints. In this case, Kubernetes schedules the pod first and the driver then provisions the volume on the selected node.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
parameters:
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
```

## ReclaimPolicy (Optional)

Local PV ZFS supports both the reclaim policies that are `Delete` and `Retain`. If it is not specified, it defaults to `Delete`.

- `Delete` indicates that the backend volume resources are deleted along with the PersistentVolumeClaim.
- `Retain` indicates that the backend volume resources are retained in the cluster after the PersistentVolumeClaim is deleted.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
parameters:
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
reclaimPolicy: Delete
```

## AllowedTopologies (Optional)

If the ZFS pool is available on certain nodes only, use `allowedTopologies` to list the nodes where the pool is present. The driver will create volumes on those nodes only.

Refer to [ZFS Pool Availability](zfs-create-storageclass.md#zfs-pool-availability) and [StorageClass with Custom Node Labels](zfs-usage.md#storageclass-with-custom-node-labels) for more details and examples.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](zfs-create-storageclass.md)
- [Create PVC](zfs-create-pvc.md)
- [Usage](zfs-usage.md)
- [Deploy an Application](zfs-deployment.md)
