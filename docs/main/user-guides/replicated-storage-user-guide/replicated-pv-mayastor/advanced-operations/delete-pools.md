---
id: delete-pools
title: Delete Pools
keywords:
 - Offline Pool Deletion
 - Pool Deletion
 - Purge
 - Delete Pools
description: This document explains about the Pool Deletion feature.
---

# Delete Pools

## Overview

Replicated PV Mayastor supports multiple methods for deleting storage pools, depending on the state of the pool and the preferred management workflow.

Pools that are online and empty can be deleted through the Replicated PV Mayastor plugin or by deleting the corresponding DiskPool custom resource (CR). Pools that are no longer reachable or cannot be recovered can be removed through a purge operation.

Pool purge, also referred to as offline pool deletion, removes a pool's representation from the Replicated PV Mayastor control plane without deleting any data that may still exist on the underlying storage device. Purge is intended only for failure scenarios where a pool is considered irrecoverably lost and cannot be deleted through normal means that require access to the underlying storage.

Typical scenarios for Pool purge include:

- The host running the pool is permanently unavailable and has been replaced
- The underlying storage device is no longer accessible
- The pool cannot be recovered due to infrastructure or hardware failure

Purge is not part of the normal pool lifecycle and should be used only when you are certain that the pool cannot be recovered.

:::warning
Offline pool deletion is irreversible and may result in permanent loss of access to volume or snapshot data if the purged pool contains the last healthy replicas.
:::

## Delete Pools (Online)

An online pool can be deleted when it is accessible and no longer required.

Before deleting an online pool, ensure that the pool is empty and does not contain any volume replicas or snapshots. Pool deletion is blocked while dependent resources exist on the pool.

Use the following command to delete an empty online pool.

**Command**

```
kubectl openebs mayastor delete pool <pool-name> -n <namespace> --yes
```

:::important
Online pool deletion is supported only for empty pools. Remove or relocate all replicas and snapshots before attempting to delete the pool.
:::

## Delete Pools (Offline)

An offline pool can be purged when it is no longer accessible and recovery is no longer possible.

### Requirements

Before performing purge, ensure that the pool is cordoned to prevent any new replicas or snapshots from being scheduled on it.

Refer to the [Pool Cordon documentation](../advanced-operations/cordon-pools.md) for details on how to cordon a pool.

**Example: Cordon the Pool**

Before purge, cordon the pool to prevent new replicas or snapshots from being scheduled.

**Command**

```
kubectl openebs mayastor cordon pool pool-node-1-469894 -n openebs --replicas --snapshots
```

**Sample Output**

```
Pool pool-node-1-469894 cordoned successfully. Current constraints: replicas,snapshots
```

### When to Use Purge

Use purge only when:

- The pool is no longer accessible and cannot be recovered
- The host running the pool is permanently unavailable
- The underlying storage device is lost or inaccessible

Do not use purge for temporary failures or conditions where the pool may become available again.

**Example: Offline Pool State**

The following example shows a pool in an Offline state because the hosting node is unavailable.

**Command**

```
kubectl openebs mayastor get pools -n openebs
```

**Sample Output**

```
ID                  DISKS                                            MANAGED  NODE           STATUS                   ALERTS   CAPACITY  ALLOCATED  AVAILABLE  COMMITTED  ENCRYPTED  DISK-CAPACITY  MAX-EXPANDABLE-SIZE  VOLUMES  SNAPSHOTS 
pool-node-0-469894  aio:///dev/disk/by-id/scsi-0HC_Volume_105758064  true     node-0-469894  Online                   Healthy  10 GiB    4 GiB      6 GiB      4 GiB      false      10 GiB         127.8 GiB            1        0 
pool-node-1-469894  /dev/disk/by-id/scsi-0HC_Volume_105758065        true     node-1-469894  Offline (NodeIsOffline)  <none>   0 B       0 B        0 B        <none>     false      <none>         <none>               2        0 
pool-node-2-469894  aio:///dev/disk/by-id/scsi-SHC_Volume_105758063  true     node-2-469894  Online                   Healthy  10 GiB    4 GiB      6 GiB      4 GiB      false      10 GiB         127.8 GiB            1        0
```

### Review Purge Impact

Before performing purge, review the affected replicas and volumes.

**Command**

```
kubectl openebs mayastor delete pool <pool-id> -n openebs --show-impact
```

**Sample Output**

```
POOL                STATUS   CORDON  REPLICAS  VOLUMES                               READY 
pool-node-1-469894  Unknown  Ready   1         86598b37-4a37-4a85-a014-4f5e5022bb4e  true
```

### Purge a Pool (Offline)

Use the following command to purge an irrecoverable pool from the Replicated PV Mayastor control plane.

**Command**

```
kubectl openebs mayastor delete pool pool-node-1-469894 -n openebs --purge --yes --cleanup-dsp
```

:::note
Use `--cleanup-dsp` to remove DiskPool CRs for the purged pool.
:::

### Purge Options

If the pool contains critical data, additional confirmation is required:

| Condition | Required Flag |
| :--- | :--- |
| General confirmation for purge operation | `--yes` |
| Accept the data loss involved with removing all replicas that are the last healthy replicas of their respective volumes on the pool | `--accept-volume-loss` |
| Accept the data loss involved with removing all snapshot replicas that are the last remaining snapshot replicas of their respective volumes on the pool. This flag can be used only together with `--accept-volume-loss`. | `--accept-snapshot-loss` |
| Accept both volume and snapshot data loss using a single confirmation flag | `--accept-data-loss` |
| Remove DiskPool CRs associated with the purged pool | `--cleanup-dsp` |
| Display the expected volume and snapshot impact before performing purge | `--show-impact` |

### Data Loss Confirmation

**Example: Volume Loss Confirmation**

If the purge operation impacts the last healthy replica of a volume, the command returns the following message:

`Volumes would lose their last healthy replica. Use --accept-volume-loss to proceed, or --accept-data-loss to also accept snapshot loss in a single flag.`

To continue with the purge operation, additional confirmation is required:

**Command**

```
kubectl openebs mayastor delete pool pool-node-1-469894 -n openebs --purge --yes --accept-data-loss
```

**Sample Output**

```
NODE               VOLUME-LOSS     SNAPSHOT-LOSS 
node-0-469923      1 volume(s)     <none>
```

**Example: Accept Data Loss**

The following example confirms volume or snapshot data loss and proceeds with purge.

**Command**

```
kubectl openebs mayastor delete pool pool-node-1-469894 -n openebs --purge --yes --accept-data-loss
```

**Sample Output**

```
POOL                VOLUME-LOSS  SNAPSHOT-LOSS 
pool-node-1-469894  1 volume(s)  <none>
```

### Impact on Workloads

- **Single-replica volumes:** Data is permanently lost if the replica resides on the purged pool.
- **Multi-replica volumes:** Volumes may continue to operate and recover using remaining replicas if high availability (HA) is configured and sufficient replicas remain.

**Example: Workloads Using the Affected Pool**

The following example shows workloads and PVCs associated with single-replica and multi-replica volumes.

**Command**

```
kubectl get pod,pvc -o wide
```

**Sample Output**

```
NAME                         READY   STATUS    RESTARTS   AGE     IP            NODE            NOMINATED NODE   READINESS GATES
pod/busybox-single-replica   1/1     Running   0          18m     10.244.2.9    node-1-469894   <none>           <none>
pod/busybox-three-replica    1/1     Running   0          9m27s   10.244.1.11   node-0-469894   <none>           <none>

NAME                                                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             VOLUMEATTRIBUTESCLASS   AGE     VOLUMEMODE
persistentvolumeclaim/mayastor-vol-single-replica   Bound    pvc-86598b37-4a37-4a85-a014-4f5e5022bb4e   4Gi        RWO            openebs-single-replica   <unset>                 18m     Filesystem
persistentvolumeclaim/mayastor-vol-three-replica    Bound    pvc-37ba6b83-3295-4522-8cc5-c0c0755b08b3   4Gi        RWO            openebs-three-replica    <unset>                 9m28s   Filesystem
```

**Example: Volume Replica Topology**

The following example shows replica topology information for single-replica and multi-replica volumes before purge.

**Command**

```
kubectl openebs mayastor get volume-replica-topologies -n openebs
```

**Sample Output**

```
VOLUME-ID                             REPLICA-ID                            NODE           POOL                STATUS   ENCRYPTED  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD  HEALTHY 
86598b37-4a37-4a85-a014-4f5e5022bb4e  4b019a21-e3b3-4fd0-bcc3-e79ff15d3a04  node-1-469894  pool-node-1-469894  Unknown  false      <none>    <none>     <none>     <none>        <none>  <none>   true 
37ba6b83-3295-4522-8cc5-c0c0755b08b3  53f1eca1-f4ee-4288-adb4-e41592e7fc5f  node-2-469894  pool-node-2-469894  Online   false      4 GiB     4 GiB      0 B        Online        <none>  <none>   true 
├─                                    76e3f67b-7139-4723-8438-d69a57014be8  node-0-469894  pool-node-0-469894  Online   false      4 GiB     4 GiB      0 B        Online        <none>  <none>   true 
└─                                    b4e1c87e-5868-4c32-8924-11ef0e44c59e  node-1-469894  pool-node-1-469894  Unknown  false      <none>    <none>     <none>     Faulted       <none>  <none>   false
```

### Verify Purge Completion

After performing purge, verify that the pool has been removed and that affected workloads reflect the updated state.

```
kubectl openebs mayastor get pools
```

**Expected Results**

- The pool should no longer appear 
- Affected volumes may show updated states 

## Delete Pools Using a DiskPool CR

You can also delete pools by operating directly on the associated DiskPool CR.

### Delete Online Pools

To delete an online pool using its DiskPool resource, delete the corresponding DiskPool CR. The pool must be empty and must not contain any volume replicas or snapshots.

**Command**

```
kubectl delete dsp <pool-name> -n <namespace>
```

:::important
Deletion of an online DiskPool resource is supported only when the pool does not contain replicas or snapshots.
:::

### Purge Offline Pools

For an offline pool, add a deletion annotation to the DiskPool resource.

The annotation:

- Indicates that a purge operation should be performed.
- Confirms acceptance of replica and snapshot loss associated with the pool.

**Command**

```
kubectl -n <namespace> annotate dsp <pool-name> \
  openebs.io/delete-opts='purge=true,accept=true' \
  --overwrite
```

**Annotation Options**

| Option | Description |
| :--- | :--- |
| `purge=true` | Performs a purge operation on the pool |
| `accept=true` | Confirms deletion of replicas and snapshots associated with the pool |
| `accept-volume-loss=true` | Accepts permanent loss of affected volume replicas |
| `accept-snapshot-loss=true` | Accepts permanent loss of affected snapshot replicas |
| `accept-data-loss=true` | Accepts both volume and snapshot data loss |

If deleting the pool would result in permanent loss of volume replicas or snapshots, additional confirmation options are required.

**Example: Accept Volume and Snapshot Data Loss**

```
kubectl -n <namespace> annotate dsp <pool-name> \
  openebs.io/delete-opts='purge=true,accept=true,accept-data-loss=true' \
  --overwrite
```

**Example: Shorthand Syntax**

The previous command can be expressed using the following shorthand option:

```
kubectl -n <namespace> annotate dsp <pool-name> \
  openebs.io/delete-opts=purge-accept-all \
  --overwrite
```

:::warning
Purging a pool through a DiskPool resource is irreversible and may result in permanent volume or snapshot data loss if the pool contains the last healthy replicas.
:::