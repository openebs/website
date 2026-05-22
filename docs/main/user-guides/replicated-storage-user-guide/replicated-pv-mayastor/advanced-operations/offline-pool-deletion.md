---
id: offline-pool-deletion
title: Offline Pool Deletion
keywords:
 - Offline Pool Deletion
 - Pool Deletion
 - Purge
description: This document explains about the Offline Pool Deletion feature.
---

# Offline Pool Deletion

## Overview

Offline pool deletion, referred to as purge, allows you to remove a storage pool (pool) from the Replicated PV Mayastor control plane when it is no longer reachable and cannot be recovered. Purge removes the pool’s representation from the control plane without attempting to erase any data that may still exist on the underlying storage device.

This operation is intended for failure scenarios where the pool is considered irrecoverably lost and cannot be deleted through normal means that require access to the underlying storage.

Typical scenarios include:

- The host running the pool is permanently unavailable and has been replaced
- The underlying storage device is no longer accessible
- The pool cannot be recovered due to infrastructure or hardware failure

Purge is not part of the normal pool lifecycle and should be used only when you are certain that the pool cannot be recovered.

:::warning
Offline pool deletion is irreversible and may result in permanent loss of access to volume or snapshot data if the purged pool contains the last healthy replicas.
:::

## When to Use Purge

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

## Requirements

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

## Review Purge Impact

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

## Purge a Pool

Use the following command to purge an irrecoverable pool from the Replicated PV Mayastor control plane.

**Command**

```
kubectl openebs mayastor delete pool <pool-id> --purge --yes
```

**Sample Command**

```
kubectl openebs mayastor delete pool pool-node-1-469894 -n openebs --purge --yes --accept-data-loss
```

**Sample Output**

```
 POOL                VOLUME-LOSS  SNAPSHOT-LOSS 
 pool-node-1-469894  1 volume(s)  <none>
```

## Data Loss Confirmation

If the pool contains critical data, additional confirmation is required:

| Condition | Required Flag |
| :--- | :--- |
| Pool contains replicas | `--yes` |
| Last replica of a volume | `--accept-volume-loss` |
| Last snapshot replica | `--accept-snapshot-loss` |

**Example: Volume Loss Confirmation**

If the purge operation impacts the last healthy replica of a volume, the command requires additional confirmation.

**Command**

```
kubectl openebs mayastor delete pool pool-node-1-469894 -n openebs --purge --yes
```

**Sample Output**

```
Volumes would lose their last healthy replica. Use --accept-volume-loss to proceed, or --accept-data-loss to also accept snapshot loss in a single flag.
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

## Impact on Workloads
Single-replica volumes: Data is permanently lost if the replica resides on the purged pool.

Multi-replica volumes: Volumes may continue to operate and recover using remaining replicas if high availability (HA) is configured and sufficient replicas remain.

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

## Verify Purge Completion
After performing purge, verify that the pool has been removed and that affected workloads reflect the updated state.

```
kubectl openebs mayastor get pools
```

**Expected Results**

- The pool should no longer appear 
- Affected volumes may show updated states 
