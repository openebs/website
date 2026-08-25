---
id: hostpath-create-pvc
title: Create PersistentVolumeClaim
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Configuration
 - Configuration
 - Create PersistentVolumeClaim
 - Local PV Hostpath PVC
description: This guide will help you to create a PersistentVolumeClaim for Local PV Hostpath.
---

# Create PersistentVolumeClaim

This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using a Local PV Hostpath StorageClass. It also explains how a PVC can carry its own configuration through an annotation.

## Create a PVC

Save the following as `local-hostpath-pvc.yaml`, updating `storageClassName` if you are using a StorageClass other than the default `openebs-hostpath`:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: local-hostpath-pvc
spec:
  storageClassName: openebs-hostpath
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

Create the PVC:

```
kubectl apply -f local-hostpath-pvc.yaml
```

:::note
Local PV Hostpath supports the `ReadWriteOnce` access mode only. A PVC that requests any other access mode is not provisioned.
:::

## Verify the PVC

```
kubectl get pvc local-hostpath-pvc
```

The PVC remains in `Pending` state until an application pod that uses it is scheduled:

```
NAME                 STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS       AGE
local-hostpath-pvc   Pending                                      openebs-hostpath   21s
```

This is expected. Local PV Hostpath StorageClasses use `volumeBindingMode: WaitForFirstConsumer`, because the volume directory has to be created on the node where the application pod runs. Kubernetes selects that node first, and the provisioner then creates the volume there.

Once a pod using the PVC is scheduled, the PVC is bound:

```
NAME                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
local-hostpath-pvc   Bound    pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425   5Gi        RWO            openebs-hostpath   3m
```

Refer to [Deploy an Application](hostpath-deployment.md) for deploying a pod that uses this PVC.

## Configure a Volume Using PVC Annotations

In addition to the settings on the StorageClass, an individual PVC can supply configuration through the `cas.openebs.io/config` annotation. This is useful when one volume needs a setting that differs from the rest of the volumes provisioned by the same StorageClass.

The annotation takes the same entries as the StorageClass annotation. For example, to create the volume directory of this one volume with `0770` permissions:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: local-hostpath-pvc
  annotations:
    cas.openebs.io/config: |
      - name: FilePermissions
        data:
          mode: "0770"
spec:
  storageClassName: openebs-hostpath
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

:::note
The configuration on the StorageClass takes precedence. A PVC annotation only applies for the parameters that the StorageClass does not already set, so it cannot be used to override a value that the StorageClass defines.

In the example above, the `0770` mode is applied only if the `openebs-hostpath` StorageClass does not set `FilePermissions` itself.
:::

### BasePath in a PVC Annotation

`BasePath` supplied through a PVC annotation is ignored by default. Because a PVC can be created by any user with access to a namespace, allowing it to choose a directory on the node would let that user place volumes outside the location the cluster administrator intended.

If you need the earlier behaviour, the provisioner can be started with the `--allow-insecure-pvc-basepath-override` flag, which is exposed through the Helm chart:

```yaml
localpv-provisioner:
  localpv:
    allowInsecurePvcBasePathOverride: true
```

:::warning
Enabling this option allows a user who can create PVCs in any namespace to choose the directory on the node where the volume is created. Leave it disabled unless you specifically need it, and set `BasePath` on the StorageClass instead.
:::

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](hostpath-create-storageclass.md)
- [StorageClass Parameters](hostpath-storageclass-parameters.md)
- [Deploy an Application](hostpath-deployment.md)
