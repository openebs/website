---
id: rawfile-thin-provisioning
title: Thin Provisioning
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Thin Provisioning
 - Overprovisioning
description: This document explains thin provisioning with Local PV Rawfile, enabling overprovisioned volumes using sparse files.
---

By default, Local PV Rawfile creates **thick-provisioned** volumes - the backing file is fully pre-allocated at creation time. Thin provisioning uses sparse files instead, so only the blocks actually written by the application consume physical disk space.

## Thick vs Thin Provisioning

| Feature | Thick (default) | Thin |
|---|---|---|
| Backing file | Pre-allocated | Sparse (holes represent unwritten blocks) |
| Disk usage at creation | Equal to requested size | Near zero |
| Overprovisioning | Not possible | Possible |
| Performance | Predictable - no allocation latency | May have small latency on first write to a block |
| Risk | None - space is reserved | Out-of-space if physical disk fills before logical limit |

## Enable Thin Provisioning

Set `thinProvision: "true"` in the StorageClass parameters:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-thin
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: ext4
  thinProvision: "true"
```

All PVCs created from this StorageClass will use sparse files.

## Overprovisioning

Thin provisioning enables you to provision more logical capacity than physical disk space. For example, on a 100 GB pool you could provision ten 20 GB volumes (200 GB logical), as long as the total data written across all volumes does not exceed the physical pool capacity.

Monitor the overcommit ratio:

```promql
rawfile_pool_volumes_logical_bytes / rawfile_pool_capacity_bytes
```

:::warning
If the underlying pool runs out of physical space, writes to thin-provisioned volumes will fail with I/O errors at the application level. Monitor `rawfile_pool_remaining_capacity_bytes` and set alerts before this occurs.
:::

## Monitor Physical vs Logical Usage

```promql
# Physical bytes actually written across all volumes in a pool
rawfile_pool_volumes_physical_bytes

# Logical (provisioned) bytes across all volumes
rawfile_pool_volumes_logical_bytes

# Space savings ratio (higher = more savings from thin provisioning or CoW)
1 - (rawfile_pool_volumes_physical_bytes / rawfile_pool_volumes_logical_bytes)
```

Per-volume physical usage:

```promql
rawfile_volume_physical_bytes
```

## Thin Provisioning with CoW Pools

Thin provisioning combines well with Copy-on-Write pools (filesystems with reflink enabled):

- New volumes start near-empty (sparse file).
- Snapshots and clones only consume the blocks that differ from their source.
- Physical usage tracks actual data written, not logical size.

## Thick Provisioning Use Cases

Use thick provisioning (the default) when:

- Predictable I/O performance is critical.
- You need a guaranteed reservation of disk space for a workload.
- The pool is shared with other services and you want to avoid unexpected out-of-space conditions.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [StorageClass Parameters](../configuration/rawfile-storageclass-parameters.md)
- [Monitoring](rawfile-monitoring.md)
- [Storage Pools](rawfile-storage-pools.md)
