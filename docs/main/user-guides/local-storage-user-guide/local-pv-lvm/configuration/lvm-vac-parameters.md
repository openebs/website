---
id: lvm-vac-parameters
title: VolumeAttributesClass Parameters
keywords:
 - VAC Parameters
 - VolumeAttributesClass Parameters
 - Local PV LVM QoS Parameters
 - LVM VAC QoS
 - Volume QoS Parameters
description: This document explains the supported VolumeAttributesClass parameters for Local PV LVM volumes.
---

# Local PV LVM VAC Parameters

## Overview

VolumeAttributesClass (VAC) parameters allow you to define Quality of Service (QoS) policies for Local PV LVM volumes.

These parameters control IOPS and bandwidth limits for filesystem and block-mode volumes provisioned through Local PV LVM. QoS policies are enforced at the node level using Linux cgroup v2 controls.

## Supported VAC Parameters

The following VAC parameters are supported for Local PV LVM volumes.

| Parameter | Description | Accepted Values |
| :--- | :--- | :--- |
| `qosIopsLimit` | Maximum Read/Write IOPS limit | Non-zero positive integer or `max` |
| `qosIopsReadLimit` | Maximum read IOPS limit | Non-zero positive integer or `max` |
| `qosIopsWriteLimit` | Maximum write IOPS limit | Non-zero positive integer or `max` |
| `qosBandwithPerSec` | Maximum Read/Write bandwidth per second | Non-zero positive integer (bytes/sec) or supported size suffixes such as `7000Mi` |
| `qosBandwithReadPerSec` | Maximum read bandwidth per second | Non-zero positive integer (bytes/sec) or supported size suffixes such as `7000Mi` |
| `qosBandwithWritePerSec` | Maximum write bandwidth per second | Non-zero positive integer (bytes/sec) or supported size suffixes such as `7000Mi` |

:::note
Setting an IOPS parameter to `max` disables IOPS limiting for that parameter on the volume.
A value of `0` is not supported for IOPS or bandwidth parameters.
:::

**Example VAC Configuration**

The following example configures total IOPS and bandwidth limits using a VAC.

```yaml
apiVersion: storage.k8s.io/v1
kind: VolumeAttributesClass
metadata:
  name: lvm-qos-high
driverName: local.csi.openebs.io
parameters:
  qosIopsLimit: "50000"
  qosBandwithPerSec: "5000000"
```

**Example Directional QoS Configuration**

The following example configures separate read and write QoS limits.

```yaml
apiVersion: storage.k8s.io/v1
kind: VolumeAttributesClass
metadata:
  name: lvm-qos-directional
driverName: local.csi.openebs.io
parameters:
  qosIopsReadLimit: "100"
  qosIopsWriteLimit: "200"
  qosBandwithReadPerSec: "7000Mi"
  qosBandwithWritePerSec: "8000Mi"
```

## Update VAC QoS Parameters

You can modify the QoS policy applied to a PVC by updating the `volumeAttributesClassName` field to reference a different VAC.

**Example Updated VAC**

```yaml
apiVersion: storage.k8s.io/v1
kind: VolumeAttributesClass
metadata:
  name: lvm-qos-low
driverName: local.csi.openebs.io
parameters:
  qosIopsLimit: "20"
  qosBandwithPerSec: "20000"
```

**Example Updated PVC**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: lvm-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: openebs-lvm
  volumeAttributesClassName: lvm-qos-low
  resources:
    requests:
      storage: 5Gi
```

Apply the updated PVC configuration:

```bash
kubectl apply -f pvc.yaml
```

After the PVC is updated, OpenEBS Local PV LVM automatically reconciles and applies the new QoS settings associated with the updated `VolumeAttributesClass`.

### Invalid VAC Parameter Example

**Conflicting QoS Parameters**

The following example uses conflicting QoS parameter values.

```yaml
apiVersion: storage.k8s.io/v1
kind: VolumeAttributesClass
metadata:
  name: lvm-qos-conflict
driverName: local.csi.openebs.io
parameters:
  qosIopsLimit: "max"
  qosIopsReadLimit: "1000"
```

## Verify VAC QoS Configuration

Use the following command to verify the PVC configuration.

```bash
kubectl describe pvc <pvc-name>
```

**Expected Results**

- The PVC references the updated VAC
- Updated QoS parameters are applied to the Local PV LVM volume
- QoS reconciliation completes automatically on supported Kubernetes versions

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [StorageClass Parameters](lvm-storageclass-parameters.md)
- [Create PersistentVolumeClaim](lvm-create-pvc.md)
- [Deploy an Application](lvm-deployment.md)