---
id: rawfile-raw-block-volume
title: Raw Block Volumes
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Raw Block Volume
 - Block Mode
description: This document explains how to use Local PV Rawfile volumes in raw block mode for workloads that manage their own storage format.
---

Local PV Rawfile supports raw block volumes that expose a loop device directly to the pod without any filesystem layer. This is useful for databases and other workloads that manage their own storage format.

## Create a Block Mode PVC

Set `volumeMode: Block` in the PVC spec:

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

```bash
kubectl apply -f block-pvc.yaml
```

The PVC will remain in `Pending` state until a consuming pod is scheduled (`WaitForFirstConsumer`).

## Consume the Block Volume in a Pod

Use `volumeDevices` (not `volumeMounts`) to map the raw device into the pod:

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

```bash
kubectl apply -f pod-block.yaml
kubectl get pvc rawfile-block-pvc
```

Once the pod is scheduled, the loop device is attached and exposed at `/dev/xvda` inside the container. The application is responsible for initializing and managing the device.

## Verify the Block Device

```bash
kubectl exec app-block -- ls -l /dev/xvda
# brw-rw---- 1 root disk 7, 3 ... /dev/xvda

kubectl exec app-block -- blockdev --getsize64 /dev/xvda
# 10737418240
```

## StorageClass Parameters for Block Mode

The following StorageClass parameters are **ignored** for block mode PVCs:

- `csi.storage.k8s.io/fstype` - no filesystem is created
- `formatOptions` - no format step
- `mountOptions` - no mount step
- `copyOnWrite` / `freezeFs` - CoW and freeze apply to filesystem operations only

All other parameters (`storagePool`, `thinProvision`, `allowVolumeExpansion`) continue to apply.

:::note
The `readOnly` attribute on block mode PVCs is not currently honored.
:::

## Volume Expansion

Block mode volumes support online expansion. If the volume is currently unstaged (no pod using it), only the backing file is grown; node-side expansion is deferred until the volume is next attached. The application inside the pod is responsible for recognizing the larger device (e.g. re-reading partition tables, resizing the filesystem it manages).

## Use Cases

| Use Case | Why Block Mode |
|---|---|
| Databases (PostgreSQL, MySQL) | Direct I/O without filesystem overhead |
| VM disk images | Raw block device maps naturally to a virtual disk |
| Custom storage formats | Application manages its own layout on the device |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Create PVC](../configuration/rawfile-create-pvc.md)
- [StorageClass Parameters](../configuration/rawfile-storageclass-parameters.md)
- [Volume Resize](rawfile-resize.md)
