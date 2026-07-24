---
id: rawfile-resize
title: Volume Resize
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Volume Resize
 - Volume Expansion
description: This document explains how to expand Local PV Rawfile volumes online without restarting the pod.
---

Local PV Rawfile supports **online volume expansion** - the backing file, loop device, and filesystem are grown live with no pod restart required. Shrinking is not supported.

## Requirements

- Resize must be enabled in the chart (default): `capabilities.resize.enabled=true`
- The StorageClass must set `allowVolumeExpansion: true`
- Online filesystem growth is supported for `ext4`, `xfs`, and `btrfs`
- Sufficient free capacity must exist in the volume's storage pool on its node

## StorageClass Configuration

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rawfile-localpv
provisioner: rawfile.csi.openebs.io
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
allowVolumeExpansion: true
parameters:
  csi.storage.k8s.io/fstype: ext4
```

## Expand a Volume

Edit the PVC's `spec.resources.requests.storage` to the new (larger) size:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  storageClassName: rawfile-localpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi    # was 10Gi
```

```bash
kubectl apply -f pvc.yaml
```

Or patch in place:

```bash
kubectl patch pvc app-data \
  -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'
```

## Monitor the Expansion

Watch for the capacity to update:

```bash
kubectl get pvc app-data -w
# NAME       STATUS   VOLUME      CAPACITY   ACCESS MODES   STORAGECLASS
# app-data   Bound    pvc-xxxxx   10Gi       RWO            rawfile-localpv
# app-data   Bound    pvc-xxxxx   20Gi       RWO            rawfile-localpv
```

Check events and conditions if it takes longer than expected:

```bash
kubectl describe pvc app-data
```

Under the hood, the `csi-resizer` sidecar calls the controller, which forwards the request to the node that owns the volume. The node grows the backing file, resizes the loop device, and expands the filesystem online.

## Verify Inside the Pod

```bash
kubectl exec app -- df -hT /data
# Filesystem     Type  Size  Used Avail Use% Mounted on
# /dev/loop3     ext4   20G  1.1G   18G   6% /data
```

No pod restart is needed - the new capacity is visible immediately after the resize completes.

## Block Mode Volumes

Block volumes (`volumeMode: Block`) are also expandable. If the volume is currently unstaged (no pod consuming it), only the backing file is grown; node-side expansion is deferred until the volume is next attached. The application inside the pod is responsible for recognizing the larger device.

## Limitations

| Item | Status |
|---|---|
| Online expansion (ext4/xfs/btrfs) while pod is running | Supported |
| Shrinking | Not supported - requests to reduce size are rejected by Kubernetes |
| Expansion beyond pool free space | Fails with `Not enough disk space` |

## Troubleshooting

| Symptom | Fix |
|---|---|
| PVC capacity never updates | Check: `allowVolumeExpansion: true` on StorageClass, `capabilities.resize.enabled=true` in chart, controller deployment is running: `kubectl -n openebs logs deploy/<release>-controller`. |
| `Not enough disk space` | The pool on the volume's node lacks free capacity. Free space or grow the underlying disk. Monitor: `rawfile_pool_remaining_capacity_bytes`. |
| `Resizing capabilities are disabled` | Set `capabilities.resize.enabled=true` and upgrade the Helm release. |
| Filesystem size unchanged but PV shows new size | Node-side expansion pending - ensure the node plugin is healthy; kubelet triggers `NodeExpandVolume` on the mounted node. |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [StorageClass Parameters](../configuration/rawfile-storageclass-parameters.md)
- [Monitoring](rawfile-monitoring.md)
- [Storage Pools](rawfile-storage-pools.md)
