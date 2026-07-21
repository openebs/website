---
id: rawfile-deployment
title: Deploy an Application
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Configuration
 - Deploy an Application
description: This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by Local PV Rawfile storage.
---

This document explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by Local PV Rawfile storage.

Create the deployment using the PVC backed by Local PV Rawfile storage.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: busybox
      command: ["sh", "-c", "while true; do sleep 60; done"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: rawfile-pvc
```

After the deployment of the application, the node will attach the loop device, format it with the configured filesystem, and mount it into the pod. You can verify the volume is in use:

```bash
kubectl get pvc rawfile-pvc
kubectl exec app -- df -hT /data
```

**Sample Output**

```
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/loop3     ext4   10G   24K  9.5G   1% /data
```

## PersistentVolumeClaim Conformance Matrix

The following matrix shows the supported PersistentVolumeClaim parameters for Local PV Rawfile.

| Parameter | Values |
|---|---|
| `accessModes` | Supported: `ReadWriteOnce` / Not Supported: `ReadWriteMany`, `ReadOnlyMany` |
| `storageClassName` | StorageClass name |
| `resources.requests.storage` | Storage size with unit (e.g. `10Gi`, `100Gi`) |
| `volumeMode` | `Filesystem` (default), `Block` |
| `dataSource` (VolumeSnapshot) | Supported - restores a snapshot into a new PVC |
| `dataSource` (PVC clone) | Supported - clones an existing same-node PVC |

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](rawfile-create-storageclass.md)
- [StorageClass Parameters](rawfile-storageclass-parameters.md)
- [Create PVC](rawfile-create-pvc.md)
