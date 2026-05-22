---
id: offline-node-deletion
title: Offline Node Deletion
keywords:
 - Offline Node Deletion
 - Node Deletion
 - Purge
description: This document explains about the Offline Node Deletion feature.
---

# Offline Node Deletion

## Overview

Offline node deletion, referred to as purge, allows you to remove a Replicated PV Mayastor node from the control plane when it is no longer reachable and cannot be recovered. Purge removes the node’s representation from the control plane along with associated resources that are no longer accessible on that node, without requiring communication with the underlying host.

This operation is intended for failure scenarios where the node is considered irrecoverably lost and cannot be deleted through normal means that require access to the node.

Typical scenarios include:

- The host running the node is permanently unavailable and has been replaced
- The node cannot be recovered due to infrastructure or hardware failure
- Storage resources on the node are no longer accessible

Purge is not part of the normal node lifecycle and should be used only when you are certain that the node cannot be recovered.

:::warning
Offline node deletion is irreversible and may result in permanent loss of access to volume or snapshot data.
:::

## When to Use Purge

Use purge only when:

- The node is no longer accessible and cannot be recovered
- The host running the node is permanently unavailable
- Storage resources on the node are lost or inaccessible

Do not use purge for temporary failures or conditions where the node may become available again.

**Example: Offline Node State**

The following example shows a Replicated PV Mayastor node in an Offline state.

**Command**

```
kubectl openebs mayastor get nodes -n openebs
```

**Sample Output**

```
ID             GRPC ENDPOINT       STATUS   VERSION                           POOLS  VOLUMES  SNAPSHOTS 
node-0-469923  5.223.46.235:10124  Offline  v2.9.0-alpha.0-250-g36f25c282ef1  1      2        0 
node-1-469923  5.223.44.23:10124   Online   v2.9.0-alpha.0-250-g36f25c282ef1  1      1        0 
node-2-469923  5.223.46.36:10124   Online   v2.9.0-alpha.0-250-g36f25c282ef1  1      1        0
```

## Requirements

Before performing purge, ensure that:

- The node is offline
- The node is cordoned to prevent new workloads from being scheduled. Refer to the [Cordon Node documentation](../advanced-operations/cordon-node.md) for details on how to cordon a node.
- The `openebs.io/engine` label has been removed from the Kubernetes node.

**Example: Cordon the Node**

Before purge, cordon the node and remove the `openebs.io/engine` label.

**Command**

```
kubectl openebs mayastor cordon node node-0-469923 openebs-offline=true -n openebs
kubectl label node node-0-469923 openebs.io/engine-
```

**Sample Output**

```
Node node-0-469923 cordoned successfully
node/node-0-469923 unlabeled
```

## Review Purge Impact

Before performing purge, review the affected replicas and workloads.

**Command**

```
kubectl openebs mayastor delete node node-0-469923 -n openebs --purge --show-impact
```

**Sample Output**

```
 NODE               STATUS      REPLICAS    VOLUMES     READY
 node-0-469923      Unknown     1           1           true
```

## Purge a Node

Use the following command to purge an irrecoverable node from the Replicated PV Mayastor control plane.

:::note
Use `--cleanup-dsp` to remove DiskPool custom resources (CRs) for pools associated with the purged node.
:::

**Command**

```
kubectl openebs mayastor delete node node-0-469923 -n openebs --purge --yes --cleanup-dsp
```

## Purge Options

If the node contains critical resources, additional confirmation flags may be required.

| Condition | Required Flag |
| :--- | :--- |
| General confirmation for purge operation | `--yes` |
| Accept the data loss involved with removing all replicas that are the last healthy replicas of their respective volumes on the node | `--accept-volume-loss` |
| Accept the data loss involved with removing all snapshot replicas that are the last remaining snapshot replicas of their respective volumes on the node. This flag can be used only together with `--accept-volume-loss`. | `--accept-snapshot-loss` |
| Accept both volume and snapshot data loss using a single confirmation flag | `--accept-data-loss` |
| Remove DiskPool CRs associated with the purged node | `--cleanup-dsp` |
| Display the expected volume and snapshot impact before performing purge | `--show-impact` |

## Data Loss Confirmation

**Example: Volume Loss Confirmation**

If the purge operation impacts the last healthy replica of a volume, the command returns the following message:

`Volumes would lose their last healthy replica. Use --accept-volume-loss to proceed, or --accept-data-loss to also accept snapshot loss in a single flag.`

To continue with the purge operation, additional confirmation is required:

**Command**

```
kubectl openebs mayastor delete node node-0-469923 -n openebs --purge --yes --accept-data-loss
```

**Sample Output**

```
NODE               VOLUME-LOSS     SNAPSHOT-LOSS 
node-0-469923      1 volume(s)     <none>
```

## Impact on Workloads

- **Single-replica volumes:** Data is permanently lost if the replica resides on the purged node. 
- **Multi-replica volumes:** Volumes may continue to operate and recover using remaining replicas if high availability (HA) is configured and sufficient replicas remain. 
- **Snapshots:** Snapshots may become unusable if the last healthy snapshot replica was located on the purged node.

**Example: Volume Replica Topology**

The following example shows replica topology information before node purge.

**Command**

```
kubectl openebs mayastor get volume-replica-topologies -n openebs
```

**Sample Output**

```
VOLUME-ID                             REPLICA-ID                            NODE           POOL                STATUS   ENCRYPTED  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD  HEALTHY 
f373835e-4ada-4eec-a4f3-b35f1be7817b  b63e1f76-22ce-4c9f-8d3c-196b7ecb503e  node-2-469923  pool-node-2-469923  Online   false      1 GiB     1 GiB      0 B        Online        <none>  <none>   true 
├─                                    ca275563-e044-46e3-ad60-22b5701223cb  node-0-469923  pool-node-0-469923  Unknown  false      <none>    <none>     <none>     Faulted       <none>  <none>   false 
└─                                    ff544d71-9fa6-461a-85e6-a9e3e922d339  node-1-469923  pool-node-1-469923  Online   false      1 GiB     1 GiB      0 B        Online        <none>  <none>   true 
ec307c1d-3311-4768-9a60-eb457b84277d  2961803b-01c2-49bf-b8bf-c6014f336f96  node-0-469923  pool-node-0-469923  Unknown  false      <none>    <none>     <none>     <none>        <none>  <none>   true
```

## Verify Purge Completion

After performing purge, verify that the node has been removed and that affected workloads reflect the updated state.

```
kubectl openebs mayastor get nodes
```

**Expected Results**

- The purged node is no longer listed.
- Associated pools are no longer listed.
- Affected workloads reflect updated states.
