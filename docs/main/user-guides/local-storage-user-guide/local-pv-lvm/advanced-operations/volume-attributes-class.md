---
id: volume-attributes-class
title: Local PV LVM VolumeAttributesClass
keywords:
 - Local PV LVM VolumeAttributesClass
 - VolumeAttributesClass
 - Local PV LVM VAC
 - LVM VAC
 - VAC
description: This document explains about the Local PV LVM VolumeAttributesClass feature.
---

# Local PV LVM VolumeAttributesClass

## Overview

VolumeAttributesClass (VAC) enables you to define and manage Quality of Service (QoS) parameters for Local PV LVM volumes using Kubernetes-native VAC resources.

With VAC, you can apply and modify IOPS and bandwidth limits for filesystem and block-mode volumes without recreating PersistentVolumeClaims (PVCs). The configured QoS settings are applied at the node level using Linux cgroup v2 controls.

This feature allows you to standardize storage performance policies and dynamically adjust volume QoS characteristics for workloads running on Local PV LVM.

Typical use cases include:

- Limiting IOPS for low-priority workloads
- Assigning higher throughput to performance-sensitive applications
- Managing storage performance for multi-tenant environments
- Dynamically adjusting volume QoS policies

:::important
VAC support requires Kubernetes versions that support the VAC API.
:::

## Supported Kubernetes Versions
VAC support depends on Kubernetes API availability.

| Kubernetes Version | Support Status |
| :--- | :--- |
| 1.34+ | Supported |
| Earlier versions | VAC API unavailable |

:::warning
Clusters running Kubernetes versions without VAC support continue to function normally, but VAC configuration is ignored.
:::

## How VAC Works

VAC defines mutable storage parameters that can be associated with a PVC.

When a VAC is attached to a PVC:

- OpenEBS Local PV LVM applies the QoS configuration to the corresponding volume
- QoS settings are enforced for filesystem and block volumes
- Updates to the VAC are automatically reconciled on supported Kubernetes versions

Supported QoS parameters include:

| Parameter                 | Description                  |
| :--- | :--- |
| `qosIopsLimit`            | Maximum IOPS limit           |
| `qosBandwithPerSec`       | Maximum bandwidth per second |
| `qosIopsReadLimit`        | Read IOPS limit              |
| `qosIopsWriteLimit`       | Write IOPS limit             |
| `qosBandwithReadPerSec`   | Read bandwidth limit         |
| `qosBandwithWritePerSec`  | Write bandwidth limit        |

## Create a VAC

Use the following example to create a VAC with QoS limits.

**Example VAC**

```
apiVersion: storage.k8s.io/v1
kind: VolumeAttributesClass
metadata:
  name: lvm-qos-high
driverName: local.csi.openebs.io
parameters:
  qosIopsLimit: "50000"
  qosBandwithPerSec: "5000000"
```

Apply the configuration: `kubectl apply -f vac.yaml`

## Create a PVC Using VAC

Associate the VAC with a PVC using the volumeAttributesClassName field.

**Example PVC**

```
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

Apply the PVC configuration: `kubectl apply -f pvc.yaml`

## Update Volume QoS Parameters

You can modify the QoS policy applied to a PVC by updating the volumeAttributesClassName field to reference a different VAC.

**Example Updated VAC**

```
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

```
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

Apply the updated PVC configuration: `kubectl apply -f pvc.yaml`

After the PVC is updated, OpenEBS Local PV LVM automatically reconciles and applies the new QoS settings associated with the updated `VolumeAttributesClass`.

## Verify VAC Configuration

Use the following commands to verify VAC resources and PVC configuration.

**View VAC**

```
kubectl get volumeattributesclass
```

**View PVC Configuration**

```
kubectl describe pvc <pvc-name>
```

**Expected Results**

- The PVC references the configured VAC
- QoS parameters are applied to the associated Local PV LVM volume