---
id: node-deployment-mode
title: Node-Deployment Mode for Local PV Hostpath
keywords:
 - OpenEBS Local PV Hostpath Node-Deployment Mode
 - DaemonSet Provisioner
 - Local PV Performance
 - Advanced Operations
description: This section describes Node-Deployment Mode for the OpenEBS Dynamic Local PV Provisioner, which eliminates helper pods and reduces PVC binding latency by running the provisioner as a DaemonSet.
---

# Node-Deployment Mode for Local PV Hostpath

## Overview

This document describes Node-Deployment Mode for the OpenEBS Dynamic Local PV Provisioner and explains how to enable it on your cluster. In this mode, the provisioner runs as a DaemonSet - one instance per node and performs volume operations directly on the target node without spawning short-lived helper pods for each PersistentVolumeClaim (PVC) operation. This eliminates scheduling overhead, resulting in faster PVC binding.

Node-Deployment Mode is recommended for clusters with high PVC churn or latency-sensitive workloads. It is opt-in and requires no migration of existing volumes.

:::info
Node-Deployment Mode is additive - no migration of existing volumes is required. Existing PVs continue to function normally, and new PVCs will be provisioned by the DaemonSet instances going forward.
:::

## How It Works

When a PVC is bound to a node, the co-located DaemonSet instance performs the filesystem operation (directory creation, quota setup, or deletion) directly in-process - no helper pod is scheduled.

Each DaemonSet instance handles only the PVCs scheduled to its own node. Requests for other nodes are gracefully skipped (treated as non-fatal), ensuring correct coordination across instances. Leader election is automatically disabled, as each node instance is authoritative for its own local storage.

## Enabling Node-Deployment Mode

Node-Deployment Mode is opt-in. Your existing Deployment-based setup continues to work without any changes.

### Via Helm

```bash
helm upgrade openebs openebs/openebs \
  --namespace openebs \
  --set localpv-provisioner.nodeDeployment.enabled=true
```

:::note
If you are enabling Node-Deployment Mode as part of a Helm upgrade, use `--reset-then-reuse-values` to reset the release to the new chart defaults, re-apply your existing user values, and then apply any additional `--set` overrides.
:::

### Via Provisioner Flag

Add the `--node-deployment=true` flag to the provisioner container args in your DaemonSet manifest:

```yaml
containers:
  - name: openebs-provisioner-hostpath
    args:
      - "--node-deployment=true"
```

### Verify the Installation

Once enabled, verify that the DaemonSet pods are running - one per node:

```bash
kubectl get po -n openebs
```

**Sample Output**

```
NAME                             READY   STATUS    RESTARTS   AGE
localpv-provisioner-node-74p49   1/1     Running   0          70s
localpv-provisioner-node-hxz94   1/1     Running   0          70s
localpv-provisioner-node-nw7dq   1/1     Running   0          70s
```

## See Also

- [Local PV Hostpath Overview](../hostpath-overview.md)
- [Enable XFS Quota on Local PV Hostpath](./xfs-quota/enable-xfs-quota.md)
- [OpenEBS Installation](../../../../quickstart-guide/installation.md)