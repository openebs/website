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

:::important
Always set `volumeBindingMode: WaitForFirstConsumer`. The driver provisions volumes on the node chosen by the Kubernetes scheduler and requires that topology information. Using `Immediate` will cause provisioning to fail with "No preferred topology set".
:::

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
  csi.storage.k8s.io/fstype: "ext4"
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
  csi.storage.k8s.io/fstype: "xfs"
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
  csi.storage.k8s.io/fstype: "btrfs"
```

## StorageClass with Thin Provisioning

By default, volumes are **thick-provisioned** - the full backing file is pre-allocated at creation time. Thin provisioning creates a sparse backing file instead, meaning disk space is allocated on demand as data is written. This enables overprovisioning, so you must monitor actual pool usage (`rawfile_pool_remaining_capacity_bytes`) to avoid the backing filesystem running out of space.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-thin
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  thinProvision: "true"
  formatOptions: "-E nodiscard"
```

:::note
For ext4 volumes, 5% of the capacity is reserved for the root user by default. To remove this reservation and make the full capacity available to applications, add `-m 0` to `formatOptions`:

```yaml
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  formatOptions: "-m 0"
```
:::

## StorageClass with Snapshots Enabled (Copy-on-Write)

To enable block-level snapshots using copy-on-write (reflink), set `copyOnWrite` to `"true"`. The underlying storage pool's filesystem must support reflinks. CoW support varies by filesystem:

| Filesystem | CoW Support | Setup Required |
|---|---|---|
| btrfs | Native | None - works out of the box |
| XFS | With reflink | Format the pool device with `mkfs.xfs -m reflink=1` |
| ext4 | Not supported | Full data copy is used instead |

**For btrfs** - no extra setup needed, just set `fstype: btrfs`:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-cow-btrfs
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: "btrfs"
  copyOnWrite: "true"
```

**For XFS**, format the pool device with reflink enabled on each node, then configure the pool path in Helm values:

```bash
mkfs.xfs -m reflink=1 /dev/sdb
mount /dev/sdb /mnt/nvme/rawfile/
```

Create a StorageClass targeting that pool:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-cow-xfs
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: "xfs"
  copyOnWrite: "true"
  storagePool: "nvme"
```

See [Storage Pools](../advanced-operations/rawfile-storage-pools.md) for how to configure the pool in Helm values.

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
  csi.storage.k8s.io/fstype: "ext4"
  freezeFs: "true"
```

## StorageClass Targeting a Specific Storage Pool

Storage pools must be configured in the Helm chart before they can be referenced in a StorageClass. See [Storage Pools](../advanced-operations/rawfile-storage-pools.md) for how to define named pools with independent paths and capacity reservations.

Once pools are configured, use the `storagePool` parameter to pin volumes to a named pool:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-fast-pool
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: "ext4"
  storagePool: "fast-pool"
```

:::note
To use the node's default pool, omit the `storagePool` key entirely. Setting it to an empty string (`""`) is rejected as an invalid pool name.
:::

## VolumeSnapshotClass

To use snapshots with Local PV Rawfile, a `VolumeSnapshotClass` is required. The Helm chart creates one named `rawfile-localpv` by default. To create one manually:

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: rawfile-localpv
driver: rawfile.csi.openebs.io
deletionPolicy: Delete
```

There are no driver-specific parameters on the `VolumeSnapshotClass`. Snapshot behavior (`freezeFs`, `copyOnWrite`) is controlled by the volume's StorageClass.

## StorageClass Parameters Conformance Matrix

### Standard StorageClass Parameters

| Parameter | Values | Notes |
|---|---|---|
| `allowVolumeExpansion` | `true` / `false` | Set to `true` to enable online volume resize |
| `volumeBindingMode` | `WaitForFirstConsumer` | **Required.** `Immediate` causes provisioning to fail |
| `reclaimPolicy` | `Retain` / `Delete` | `Delete` removes the backing file when the PV is released |

### Rawfile-Specific StorageClass Parameters

| Parameter | Values | Description |
|---|---|---|
| `csi.storage.k8s.io/fstype` | `ext4` (default), `xfs`, `btrfs` | Filesystem used to format the volume; ignored for `volumeMode: Block` |
| `thinProvision` | `"true"` / `"false"` (default) | `"true"` creates a sparse backing file; enables overprovisioning - monitor pool usage |
| `copyOnWrite` | `"true"` / `"false"` / unset | CoW reflink attribute on the backing file; leave unset to autodetect per pool |
| `freezeFs` | `"true"` / `"false"` (default) | Briefly freezes the filesystem during snapshots of in-use volumes for consistency |
| `formatOptions` | Extra `mkfs` flags (e.g. `"-m 0"`, `"-i maxpct=10"`) | Applied once at volume creation time only |
| `mountOptions` | Mount flags (e.g. `noatime`) | Passed to `mount` when attaching the volume to a pod |
| `storagePool` | Pool name string | Targets a named storage pool; omit the key entirely for the node's default pool |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [StorageClass Parameters](rawfile-storageclass-parameters.md)
- [Create PVC](rawfile-create-pvc.md)
