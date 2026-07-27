---
id: rawfile-create-pvc
title: Create PersistentVolumeClaim
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Configuration
 - Create PVC
 - Create PersistentVolumeClaim
description: This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using the Local PV Rawfile storage class.
---

# Create PersistentVolumeClaim

This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using the Local PV Rawfile storage class. It covers filesystem mode and block mode PVCs, how to verify binding, how to consume the volume in a pod, and how to delete volumes.

Before you begin, make sure:

- The Rawfile driver is installed and running. Refer to the [Installation](../../../../quickstart-guide/installation.md) documentation for more information.
- A StorageClass exists. The Helm chart creates one named `rawfile-localpv` by default:

  ```bash
  kubectl get sc rawfile-localpv
  ```

## Create a Filesystem Mode PVC

This is the default volume mode. The driver formats the backing file with the filesystem specified in the StorageClass and mounts it as a directory inside the pod.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rawfile-pvc
spec:
  storageClassName: rawfile-localpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

Apply the PVC:

```bash
kubectl apply -f pvc.yaml
```

The PVC will remain in `Pending` state until a pod that uses it is scheduled. This is expected behavior with `volumeBindingMode: WaitForFirstConsumer`.

```bash
kubectl get pvc rawfile-pvc
```

## Create a Block Mode PVC

For workloads that manage their own storage format (e.g. databases), use `volumeMode: Block`. The driver exposes the loop device directly to the pod without formatting.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rawfile-block-pvc
spec:
  storageClassName: rawfile-localpv
  accessModes:
    - ReadWriteOnce
  volumeMode: Block
  resources:
    requests:
      storage: 10Gi
```

:::note
`fsType`, `formatOptions`, and `mountOptions` StorageClass parameters are ignored for block mode PVCs. The `readOnly` attribute on block PVCs is not currently honored.
:::

## Consume the Volume in a Pod

### Filesystem Mode

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
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
        claimName: rawfile-pvc
```

Once the pod is scheduled, the driver provisions the volume on that node and the PVC transitions to `Bound`:

```bash
kubectl get pvc rawfile-pvc
```

Verify the volume inside the pod:

```bash
kubectl exec app -- df -hT /data
```

### Block Mode

Use `volumeDevices` instead of `volumeMounts` to consume a block PVC:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-block
spec:
  containers:
    - name: app
      image: busybox
      command: ["sh", "-c", "sleep infinity"]
      volumeDevices:
        - name: data
          devicePath: /dev/xvda
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: rawfile-block-pvc
```

## PVC Parameters Reference

| Parameter | Required | Values | Notes |
|---|---|---|---|
| `storageClassName` | Yes | Rawfile StorageClass name | Must reference a StorageClass with `rawfile.csi.openebs.io` provisioner |
| `accessModes` | Yes | `ReadWriteOnce` | Only `ReadWriteOnce` is supported |
| `resources.requests.storage` | Yes | e.g. `10Gi`, `100Gi` | Provisioning fails if the pool lacks sufficient free capacity |
| `volumeMode` | No | `Filesystem` (default) / `Block` | `Block` exposes a raw loop device; formatting is skipped |
| `dataSource` (VolumeSnapshot) | No | VolumeSnapshot reference | Restores a snapshot into a new PVC — see [Snapshots](../advanced-operations/rawfile-snapshot.md) |
| `dataSource` (PVC clone) | No | PVC reference | Clones an existing PVC — see [Volume Restore](../advanced-operations/rawfile-volume-restore.md) |

## Deprovisioning

Delete the workload using the PVC first, then delete the PVC:

```bash
kubectl delete pod app
kubectl delete pvc rawfile-pvc
```

With `reclaimPolicy: Delete` (default), the PV, backing file, and metadata are removed from the node. With `Retain`, the PV and data remain until you delete the PV manually.

:::important
Delete any VolumeSnapshots of a volume before deleting the volume itself if you intend to fully reclaim space.
:::

## Troubleshooting

| Symptom | Fix |
|---|---|
| PVC `Pending` forever | Is a pod consuming it? Check pool capacity: `kubectl get csistoragecapacities -A`. Check events: `kubectl describe pvc <name>`. |
| `Invalid storage pool` error | The `storagePool` parameter in the StorageClass does not match a configured pool on the node. |
| Pod stuck in `ContainerCreating` | Check node plugin logs: `kubectl -n openebs logs ds/<release>-node -c csi-driver`. |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](rawfile-create-storageclass.md)
- [StorageClass Parameters](rawfile-storageclass-parameters.md)
- [Deploy an Application](rawfile-deployment.md)
