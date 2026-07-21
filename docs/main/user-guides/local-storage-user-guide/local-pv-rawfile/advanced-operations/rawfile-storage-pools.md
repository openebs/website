---
id: rawfile-storage-pools
title: Storage Pools
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Storage Pools
description: This document explains how to configure and use storage pools with Local PV Rawfile to enable storage tiering across multiple named storage locations per node.
---

Storage pools let each node offer one or more named storage locations (for example, an NVMe pool and an HDD pool), each backed by its own filesystem with independent capacity reservations. This enables storage tiering - workloads select a tier by referencing the pool name in the StorageClass.

## Configure Storage Pools

Pools are defined in the Helm chart values under `node.storagePools`. A `node.defaultPool` is required and must reference one of the defined pools.

```yaml
node:
  defaultPool: hdd
  storagePools:
    hdd:
      path: /var/local/openebs/rawfile/hdd/
      reservedCapacity: "10%"
      reservedCapacityMode: plain
    nvme:
      path: /mnt/nvme/rawfile/
      reservedCapacity: 20GiB
      reservedCapacityMode: subtract-from-total
```

Apply the updated values:

```bash
helm upgrade rawfile-localpv rawfile-localpv/rawfile-localpv -n openebs -f values.yaml
```

## Pool Naming Rules

Pool names must be DNS-compatible:
- Length: 3–63 characters
- Characters: lowercase letters, digits, and hyphens only
- Cannot start or end with a hyphen

## Reserved Capacity Modes

Each pool defines how much disk space is reserved for non-pool use.

| Mode | Behavior |
|---|---|
| `plain` | The pool grows until the specified capacity remains free on the backing filesystem. Suitable for shared disks. |
| `subtract-from-total` | The pool is capped at `total disk size − reserved amount`. Suitable for dedicated disks. |

**`plain` example:** A 1 TB disk with `reservedCapacity: "10%"` allows the pool to use up to 900 GB.

**`subtract-from-total` example:** A 1 TB disk with `reservedCapacity: 20GiB` caps the pool at 980 GB regardless of other filesystem usage.

## Validation Rules

The driver validates pool configuration on startup:

- Pool paths must exist or be creatable on each node.
- Each pool must be on a distinct backing filesystem - multiple pools cannot share the same device.
- The `defaultPool` must reference an existing pool entry.
- Pool paths must be unique per node.

## Copy-on-Write (CoW) Capable Pools

Snapshots and clones are always available, but pools backed by CoW-capable filesystems make them fast and space-efficient (reflinks, nearly instant). Pools without CoW support perform a full data copy.

| Filesystem | CoW Support |
|---|---|
| btrfs | Native |
| XFS | With `mkfs.xfs -m reflink=1` |
| ext4 | Full copy |

To create an XFS pool with reflink enabled:

```bash
mkfs.xfs -m reflink=1 /dev/sdb
mount /dev/sdb /mnt/nvme/rawfile/
```

## Create StorageClasses per Pool

Create a separate StorageClass for each pool tier and reference the pool by name via the `storagePool` parameter:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-nvme
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
parameters:
  csi.storage.k8s.io/fstype: xfs
  storagePool: nvme
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-hdd
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
parameters:
  csi.storage.k8s.io/fstype: ext4
  storagePool: hdd
```

:::important
`volumeBindingMode: WaitForFirstConsumer` is required. Using `Immediate` will fail with "No preferred topology set" because the driver needs to know which node the pod will land on to select the correct pool.
:::

A StorageClass without a `storagePool` parameter uses `node.defaultPool`.

## Monitor Pool Capacity

Pool metrics are exposed on port 9100. Use these PromQL queries to track capacity:

```promql
# Remaining capacity per pool
rawfile_pool_remaining_capacity_bytes

# Alert when a pool has less than 10 GiB free
rawfile_pool_remaining_capacity_bytes < 10 * 1024^3
```

See [Monitoring](rawfile-monitoring.md) for the full metrics reference.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Create StorageClass(s)](../configuration/rawfile-create-storageclass.md)
- [StorageClass Parameters](../configuration/rawfile-storageclass-parameters.md)
- [Monitoring](rawfile-monitoring.md)
- [Snapshots](rawfile-snapshot.md)
