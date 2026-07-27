---
id: rawfile-storageclass-parameters
title: StorageClass Parameters
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Configuration
 - StorageClass Parameters
 - StorageClass Options
description: This guide describes all supported StorageClass parameters for Local PV Rawfile.
---

# StorageClass Parameters

This document describes all supported StorageClass parameters for Local PV Rawfile and explains how to configure them. These parameters control filesystem selection, provisioning behavior, snapshot support, mount options, and storage pool targeting.

## fstype (Optional)

Specifies the filesystem used to format the volume. If unspecified, falls back to the node plugin's `defaultFs` (chart value `node.defaultFs`, default `ext4`). Ignored for `volumeMode: Block` PVCs.

Supported values: `ext4` (default), `xfs`, `btrfs`.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-xfs
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: xfs
```

:::note
Parameter keys are matched case-insensitively by the driver. Values must be strings - quote booleans (e.g. `"true"`, `"false"`).
:::

## thinProvision (Optional)

Controls whether the backing file is pre-allocated (thick) or sparse (thin).

- **`"false"` (default)** - Thick provisioning. The full backing file is allocated at volume creation time. Space is consumed from the pool upfront and overprovisioning is not possible.
- **`"true"`** - Thin provisioning. A sparse backing file is created and disk space is allocated on write. This enables overprovisioning, so you must monitor real pool usage (`rawfile_pool_remaining_capacity_bytes`) to avoid running the backing filesystem out of space.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-thin
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: ext4
  thinProvision: "true"
```

## formatOptions (Optional)

Extra flags passed to `mkfs.<fstype>` when the volume is formatted at creation time. Applied only once at first format - not on subsequent mounts.

Examples:
- ext4: `"-m 0"` removes the 5% root-reserved block reservation, making the full capacity available to applications.
- xfs: `"-i maxpct=10"` limits inode space.

```yaml
parameters:
  csi.storage.k8s.io/fstype: ext4
  formatOptions: "-m 0"
```

:::note
In Helm chart values, `formatOptions` is a list that is joined with spaces at runtime:
```yaml
storageClasses:
  - name: rawfile-localpv
    formatOptions: ["-m", "0"]
```
:::

## copyOnWrite (Optional)

Controls the copy-on-write (reflink) attribute on the volume's backing file.

- **Unset (recommended)** - The driver autodetects CoW support on each pool's backing filesystem and applies it accordingly.
- **`"true"`** - Explicitly enable CoW. The pool's backing filesystem must support reflinks (btrfs natively, or XFS created with `mkfs.xfs -m reflink=1`).
- **`"false"`** - Explicitly disable CoW. Useful for database workloads where `nodatacow` improves write performance.

When CoW is enabled, snapshots and clones are cheap (reflink copy). Without CoW, snapshots perform a full data copy.

```yaml
parameters:
  csi.storage.k8s.io/fstype: xfs
  copyOnWrite: "true"
```

## freezeFs (Optional)

- **`"false"` (default)** - No filesystem freeze during snapshot.
- **`"true"`** - The volume's filesystem is briefly frozen (`fsfreeze`) while a snapshot of an in-use volume is taken, producing a crash-consistent image.

Use this when the pool's backing filesystem does not support CoW and you need consistent snapshots of running volumes. Expect a brief I/O pause on the volume during snapshot creation.

:::important
On a non-CoW pool with `freezeFs: "true"`, the filesystem stays frozen for the **entire duration of the data copy**. For large volumes this can be significant. Prefer a CoW-capable pool filesystem where possible.
:::

```yaml
parameters:
  csi.storage.k8s.io/fstype: ext4
  copyOnWrite: "false"
  freezeFs: "true"
```

## mountOptions (Optional)

Mount flags passed to the `mount` command when the volume is attached to a pod. If unspecified, `-o default` is used.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-noatime
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
mountOptions:
  - noatime
parameters:
  csi.storage.k8s.io/fstype: ext4
```

:::note
Mount options are not validated by the driver. If mount options are invalid, the volume mount will fail.
:::

## storagePool (Optional)

Targets a specific named storage pool on the node. If omitted, the node's `defaultPool` is used.

```yaml
parameters:
  csi.storage.k8s.io/fstype: xfs
  storagePool: nvme
```

:::important
Omit the `storagePool` key entirely to use the default pool. Setting it to an empty string (`""`) is rejected as an invalid pool name.
:::

Provisioning fails with `INVALID_ARGUMENT` if the named pool does not exist on the selected node.

## volumeBindingMode (Required)

:::important
Always use `WaitForFirstConsumer`. The driver requires the node topology set by the Kubernetes scheduler to provision a volume. Using `Immediate` fails with "No preferred topology set".
:::

| Value | Behavior |
|---|---|
| `WaitForFirstConsumer` | Volume is provisioned when a pod using the PVC is scheduled - node is chosen by the scheduler |
| `Immediate` | Not supported - provisioning fails |

## allowVolumeExpansion (Optional)

Set to `true` to enable online volume expansion. Requires `capabilities.resize.enabled=true` in the Helm chart (default). Supported for ext4, xfs, and btrfs. Shrinking is not supported.

```yaml
allowVolumeExpansion: true
```

## reclaimPolicy (Optional)

Controls what happens to the backing file and PV when the PVC is deleted.

| Value | Behavior |
|---|---|
| `Delete` (default) | The PV and its backing file are deleted when the PVC is released |
| `Retain` | The PV and backing file are kept until manually deleted |

## StorageClass Parameters Conformance Matrix

### Standard Parameters

| Parameter | Values | Notes |
|---|---|---|
| `volumeBindingMode` | `WaitForFirstConsumer` | **Required.** `Immediate` causes provisioning to fail |
| `allowVolumeExpansion` | `true` / `false` | Enable online resize |
| `reclaimPolicy` | `Delete` (default) / `Retain` | Backing file lifecycle on PVC deletion |
| `mountOptions` | Mount flags | Not validated - invalid options cause mount failure |

### Rawfile-Specific Parameters

| Parameter | Default | Values | Description |
|---|---|---|---|
| `csi.storage.k8s.io/fstype` | `ext4` | `ext4`, `xfs`, `btrfs` | Volume filesystem type |
| `thinProvision` | `"false"` | `"true"` / `"false"` | Sparse vs pre-allocated backing file |
| `formatOptions` | - | `mkfs` flags string | Applied once at volume creation |
| `copyOnWrite` | autodetect | `"true"` / `"false"` / unset | CoW attribute on backing file |
| `freezeFs` | `"false"` | `"true"` / `"false"` | Freeze filesystem during in-use snapshots |
| `storagePool` | node default | Pool name string | Target a named storage pool |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](rawfile-create-storageclass.md)
- [Create PVC](rawfile-create-pvc.md)
- [Storage Pools](../advanced-operations/rawfile-storage-pools.md)
