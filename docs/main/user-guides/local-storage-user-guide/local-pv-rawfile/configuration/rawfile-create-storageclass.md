---
id: rawfile-create-storageclass
title: Create StorageClass(s)
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Configuration
 - Create StorageClass
 - Create Local PV Rawfile StorageClass(s)
description: This guide will help you to create Local PV Rawfile StorageClass.
---

# Create StorageClass(s)

This document provides step-by-step instructions on creating a StorageClass for Local PV Rawfile, with examples covering different filesystem types, thin provisioning, and volume binding modes.

The provisioner name for Local PV Rawfile is `rawfile.csi.openebs.io`. This must be set in every StorageClass so that provisioning requests are handled by the Rawfile driver.

## Default StorageClass (ext4)

The following is a basic StorageClass that provisions volumes formatted with ext4, which is the default filesystem:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-ext4
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "ext4"
```

## StorageClass with XFS

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-xfs
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "xfs"
```

## StorageClass with Btrfs

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-btrfs
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "btrfs"
```

## StorageClass with Thin Provisioning

Thin provisioning creates sparse backing files, meaning disk space is allocated on demand rather than upfront. When using thin provisioning, you must set `formatOptions` to disable block discard, otherwise the filesystem may reclaim space in a way that conflicts with the sparse file.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-thin
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "ext4"
  thinProvision: "true"
  formatOptions: "-E nodiscard"
```

:::note
For ext4 volumes, 5% of the capacity is reserved for the root user by default. To remove this reservation and make the full capacity available to applications, add `-m 0` to `formatOptions`:

```yaml
parameters:
  fsType: "ext4"
  formatOptions: "-m 0"
```
:::

## StorageClass with Snapshots Enabled (Copy-on-Write)

To enable block-level snapshots using copy-on-write (reflink), set `copyOnWrite` to `"true"`. The underlying filesystem must support reflinks (btrfs supports this natively; ext4 requires a reflink-capable filesystem).

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-cow-snapshots
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "btrfs"
  copyOnWrite: "true"
```

## StorageClass with FreezeFS for In-Use Snapshots

For volumes that need to be snapshotted while in use and where CoW is not available, enable `freezeFs`. This briefly freezes the filesystem during snapshot creation to ensure consistency.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-freezefs
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "ext4"
  freezeFs: "true"
```

## StorageClass Targeting a Specific Storage Pool

If multiple storage pools are configured on the nodes, use the `storagePool` parameter to pin volumes to a named pool:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-fast-pool
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  fsType: "ext4"
  storagePool: "fast-pool"
```

## StorageClass Parameters Conformance Matrix

### Standard StorageClass Parameters

| Parameter | Values |
|---|---|
| `allowVolumeExpansion` | `true` / `false` |
| `volumeBindingMode` | `Immediate` / `WaitForFirstConsumer` |
| `reclaimPolicy` | `Retain` / `Delete` |

### Rawfile-Specific StorageClass Parameters

| Parameter | Values | Description |
|---|---|---|
| `fsType` | `ext4` (default), `xfs`, `btrfs` | Filesystem used to format the volume |
| `thinProvision` | `"true"` / `""` | Creates a sparse backing file instead of pre-allocating disk space |
| `copyOnWrite` | `"true"` / `""` / `"false"` | Enables CoW reflink snapshots; leave empty to autodetect |
| `freezeFs` | `"true"` / `""` | Freezes the filesystem during snapshot for in-use volume consistency |
| `formatOptions` | Filesystem format flags (e.g. `-m 0`, `-E nodiscard`) | Passed to `mkfs` at volume creation time |
| `mountOptions` | Mount flags (e.g. `noatime`) | Passed to `mount` when attaching the volume to a pod |
| `storagePool` | Pool name string | Targets a specific named storage pool on the node |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [StorageClass Parameters](rawfile-storageclass-parameters.md)
- [Create PVC](rawfile-create-pvc.md)
