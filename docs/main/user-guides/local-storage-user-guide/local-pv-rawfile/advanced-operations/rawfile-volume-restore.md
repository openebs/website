---
id: rawfile-volume-restore
title: Volume Restore (Cloning)
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Volume Restore
 - Clone
 - PVC Clone
description: This document explains how to clone an existing PVC or restore a snapshot into a new PVC with Local PV Rawfile.
---

Local PV Rawfile supports two ways to create a new PVC from existing data:

- **PVC Clone** - creates an independent copy of a PVC without an intermediate snapshot object.
- **Snapshot Restore** - creates a new PVC from an existing `VolumeSnapshot`.

Both are node-local: the new PVC is provisioned on the same node as the source.

## PVC Clone

Cloning creates a new PVC that starts as an exact copy of an existing PVC. No `VolumeSnapshot` object is created.

### Requirements

- Snapshots must be enabled in the chart (used internally for clone): `capabilities.snapshots.enabled=true`
- The source pool must have roughly **3× the volume size** of free capacity while the clone is being materialized.
- Cross-node cloning is not yet supported - source and clone must land on the same node.

### Create a Clone

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data-clone
spec:
  storageClassName: rawfile-localpv
  accessModes:
    - ReadWriteOnce
  dataSource:
    kind: PersistentVolumeClaim
    name: app-data
  resources:
    requests:
      storage: 10Gi    # must be >= source size
```

```bash
kubectl apply -f clone.yaml
```

### Consume the Clone

The clone, like any rawfile PVC, is provisioned when a pod uses it (`WaitForFirstConsumer`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-clone-consumer
spec:
  containers:
    - name: app
      image: busybox
      command: ["sh", "-c", "sleep infinity"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: app-data-clone
```

```bash
kubectl get pvc app-data-clone -w    # wait for Bound
kubectl exec app-clone-consumer -- ls /data
```

The clone is fully independent after creation - changes to the clone do not affect the source, and changes to the source do not affect the clone.

### Clone Consistency

Cloning an actively-written volume produces a crash-consistent copy at best. For consistent clones:

- Use a StorageClass with `freezeFs: "true"` - the filesystem is frozen during the copy.
- Use a CoW-capable pool (XFS with reflink, btrfs) - the copy is nearly instantaneous and consistent.

:::warning
With `freezeFs: "true"` on a **non-CoW** pool, the filesystem stays frozen for the **entire duration of the copy**. All writes to the volume block until the clone completes, which can take a long time for large volumes. Prefer a CoW-capable pool.
:::

If neither `freezeFs` nor a CoW pool is available and the volume is actively written, the clone request will be rejected. Scale the workload down first.

## Snapshot Restore

Restore a previously taken snapshot into a new PVC by specifying it as a `dataSource`.

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
kubectl get pvc app-data-restored -w
```

The restored PVC will land on the same node that holds the snapshot data.

## Clone vs. Snapshot Restore

| Feature | PVC Clone | Snapshot Restore |
|---|---|---|
| Point-in-time copy kept around | No - one-shot copy | Yes - snapshot object persists |
| Extra API objects needed | None | `VolumeSnapshot` + `VolumeSnapshotClass` |
| Use case | Duplicate an environment, fork test data | Backup/rollback points, repeated restores |

Both use the same underlying copy mechanism: cheap on CoW-capable pools, full copy otherwise.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Insufficient disk space (Cloning a volume requires at least 3× the volume size)` | Free capacity on the source node's pool, or grow the underlying disk. |
| Clone PVC stuck in `Pending` | Needs a consuming pod (`WaitForFirstConsumer`). Check `kubectl describe pvc` events. |
| `Snapshotting capabilities are disabled` | Enable `capabilities.snapshots.enabled=true` and upgrade the Helm release. |
| Clone must land on a different node | Not yet supported - cross-node cloning is in progress. |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Snapshots](rawfile-snapshot.md)
- [Storage Pools](rawfile-storage-pools.md)
- [Create PVC](../configuration/rawfile-create-pvc.md)
