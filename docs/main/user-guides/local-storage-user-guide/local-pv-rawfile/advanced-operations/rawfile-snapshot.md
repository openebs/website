---
id: rawfile-snapshot
title: Snapshots
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Snapshots
 - VolumeSnapshot
description: This document explains how to create, use, and delete volume snapshots with Local PV Rawfile.
---

Local PV Rawfile supports block-level volume snapshots using the standard Kubernetes `VolumeSnapshot` API. Snapshots are node-local and processed as persistent background tasks with automatic retry across driver restarts.

## Requirements

- Snapshots must be enabled in the chart (default): `capabilities.snapshots.enabled=true`
- Kubernetes VolumeSnapshot CRDs must be installed in the cluster
- A `VolumeSnapshotClass` must exist for the rawfile driver
- A snapshot controller must be running in the cluster. Local PV Rawfile deploys one by default. Refer to [Using an Existing Snapshot Controller](#using-an-existing-snapshot-controller) if the cluster already manages its own.

## Using an Existing Snapshot Controller

Local PV Rawfile runs a `snapshot-controller` container by default. A cluster should run only one snapshot controller, so if one is already managed at the cluster level, disable the bundled one:

```yaml
node:
  snapshotController:
    enabled: false
```

Apply the updated values:

```bash
helm upgrade rawfile-localpv rawfile-localpv/rawfile-localpv -n openebs -f values.yaml
```

:::warning
The snapshot controller that remains in the cluster must be started with `--enable-distributed-snapshotting=true`. Without this flag, Local PV Rawfile snapshots are never provisioned, and no error is reported at install time.
:::

## Create a VolumeSnapshotClass

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: rawfile-snapshotclass
driver: rawfile.csi.openebs.io
deletionPolicy: Delete
```

Apply:

```bash
kubectl apply -f snapshotclass.yaml
```

`deletionPolicy: Delete` removes snapshot data when the `VolumeSnapshot` object is deleted. Use `Retain` to preserve the data after object deletion.

## Create a Snapshot

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: app-data-snap
spec:
  volumeSnapshotClassName: rawfile-snapshotclass
  source:
    persistentVolumeClaimName: rawfile-pvc
```

```bash
kubectl apply -f snapshot.yaml
kubectl get volumesnapshot app-data-snap -w
```

The snapshot is `ReadyToUse: true` when complete. The snapshot operation runs as a persistent background task on the node that hosts the volume - it survives driver restarts and retries automatically.

## Snapshot Consistency

Two approaches are available for snapshotting active volumes:

### CoW-Capable Pools (Recommended)

Storage pools backed by filesystems which support reflink (i.e. btrfs or XFS) produce space-efficient, nearly instant snapshots. No freeze is required.

### freezeFs

For pools without CoW support, add `freezeFs: "true"` to the StorageClass. The filesystem is frozen and the entire volume is copied to a new file before it is unfrozen:

```yaml
parameters:
  csi.storage.k8s.io/fstype: ext4
  freezeFs: "true"
```

:::warning
With `freezeFs: "true"` on a non-CoW pool, the volume's filesystem stays frozen for the entire snapshot duration. All writes to the volume block until the snapshot completes. For large volumes this can take significant time. Prefer a CoW-capable pool filesystem where possible.
:::

## Restore a Snapshot to a New PVC

Specify the snapshot as a `dataSource` in a new PVC:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data-restored
spec:
  storageClassName: rawfile-localpv
  accessModes:
    - ReadWriteOnce
  dataSource:
    name: app-data-snap
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  resources:
    requests:
      storage: 10Gi
```

```bash
kubectl apply -f restore.yaml
```

:::note
Snapshots are node-local. The restored PVC will be provisioned on the same node that holds the snapshot data.
:::

## Roll Back an Application

A common pattern for rolling back to a previous state:

1. Scale down the workload to release the PVC:
   ```bash
   kubectl scale deployment my-app --replicas=0
   ```

2. Create a restored PVC from the snapshot (see above).

3. Update the Deployment to reference the restored PVC:
   ```bash
   kubectl patch deployment my-app \
     -p '{"spec":{"template":{"spec":{"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"app-data-restored"}}]}}}}'
   ```

4. Scale the workload back up:
   ```bash
   kubectl scale deployment my-app --replicas=1
   ```

## Delete a Snapshot

```bash
kubectl delete volumesnapshot app-data-snap
```

With `deletionPolicy: Delete`, the snapshot data on the node is removed. With `Retain`, the backing data remains.

:::important
Delete all VolumeSnapshots before deleting the PVC or uninstalling the driver to avoid leaked data on nodes.
:::

## Capacity Considerations

- CoW-capable pools (filesystems with reflink enabled): snapshots consume only the changed blocks after the snapshot point.
- Non-CoW pools: each snapshot is a full copy of the volume and consumes the same amount of space as the original.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Snapshot stuck in `Pending` | Check the node plugin logs: `kubectl -n openebs logs ds/<release>-node -c csi-driver`. Snapshot operations are retried on restart. |
| `Snapshotting capabilities are disabled` | Set `capabilities.snapshots.enabled=true` and upgrade the Helm release. |
| No VolumeSnapshotClass found | Create a `VolumeSnapshotClass` with `driver: rawfile.csi.openebs.io`. |
| `Insufficient disk space` | Non-CoW snapshot requires a full copy - check pool free capacity: `rawfile_pool_remaining_capacity_bytes`. |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Create StorageClass(s)](../configuration/rawfile-create-storageclass.md)
- [Volume Restore (Cloning)](rawfile-volume-restore.md)
- [Storage Pools](rawfile-storage-pools.md)
