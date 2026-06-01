---
id: lvm-create-pvc
title: Create PersistentVolumeClaim
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Configuration
 - Create StorageClass
 - Create a PersistentVolumeClaim
description: This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using the Local PV LVM storage class. 
---

# Create PersistentVolumeClaim

This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using the Local PV LVM storage class.It explains how to define a PVC manifest with key attributes such as the storage class name, access modes, storage size requirements, and optional VolumeAttributesClass (VAC) association for Quality of Service (QoS) configuration.

By following the example provided, you can seamlessly request storage resources that are dynamically provisioned and managed by the LVM driver.

## Create a PVC

Create a PVC using the storage class created for the LVM driver.

**Example PVC**

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
 ```

Apply the PVC configuration:

```bash
kubectl apply -f pvc.yaml
```

## Create a PVC Using VAC

Associate the VAC with a PVC using the `volumeAttributesClassName` field.

**Example PVC**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: lvm-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: openebs-lvm
  volumeAttributesClassName: lvm-qos-high
  resources:
    requests:
      storage: 5Gi
```

Apply the PVC configuration:

```bash
kubectl apply -f pvc.yaml
```

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](lvm-create-storageclass.md)
- [StorageClass Options](lvm-storageclass-options.md)
- [Deploy an Application](lvm-deployment.md)
