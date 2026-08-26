---
id: lvm-create-vac
title: Create VolumeAttributesClass
keywords:
 - Configuration
 - Create VolumeAttributesClass
 - Create a VAC
 - VAC
 - Local PV LVM VolumeAttributesClass
 - LVM VAC
description: This document explains how to create a Local PV LVM VolumeAttributesClass.
---

# Create VolumeAttributesClass

VolumeAttributesClass (VAC) enables you to define Quality of Service (QoS) parameters for Local PV LVM volumes using Kubernetes-native resources.

A VAC allows you to configure storage performance characteristics such as IOPS and bandwidth limits for filesystem and block-mode volumes. These QoS settings can then be associated with PersistentVolumeClaims (PVCs) that use Local PV LVM storage.

Use VAC to standardize storage performance policies across workloads running on Local PV LVM.

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

## Verify VAC Configuration

Use the following commands to verify VAC resources and PVC configuration.

**View VAC**

```
kubectl get volumeattributesclass
```

**Expected Results:** The VAC is listed successfully in the cluster.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [StorageClass Parameters](lvm-storageclass-parameters.md)
- [Create PersistentVolumeClaim](lvm-create-pvc.md)
- [Deploy an Application](lvm-deployment.md)