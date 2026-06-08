---
id: cordon-pools
title: Cordon Pools
keywords:
 - Cordon Replicated PV Mayastor Pools
 - Cordon and Uncordon Pools
 - Cordon Pools
description: This guide explains how to cordon and uncordon pools.
---

# Cordon Pools

## Overview

Pool Cordon allows you to temporarily prevent new replicas, snapshots, restores, or imports from being scheduled on a specific Replicated PV Mayastor pool.
Use cordon during planned maintenance, hardware investigations, or controlled decommissioning. Existing data remains fully available and unaffected until explicitly migrated or removed.

## Requirements

You can configure the maximum pool size using the `maxExpansion` field in the DiskPool CR.

- Replicated PV Mayastor deployment with a version that supports pool cordoning

- `kubectl-mayastor` or `kubectl-openebs` plugin installed and configured with appropriate administrative access

## Cordon a Pool

When you cordon a pool, specify the resource types you want to block by including their flags. A flag’s presence sets that resource type to true (cordoned). If you omit a flag, that resource type remains uncordoned (false).

Cordon a pool to block new replicas and imports using `kubectl-openebs`. For Example: `kubectl-openebs mayastor`

**Cordon a Pool to Block New Replicas and Imports**

```
kubectl-openebs mayastor cordon pool <pool-name> --replicas
```

```
kubectl-openebs mayastor cordon pool <pool-name> --replicas --imports
```

**Flags**

- `--replicas` - Prevent new replicas from being created on the pool
- `--snapshots` - Prevent new snapshots from being scheduled
- `--restores` - Prevent new restore operations on the pool
- `--imports` - Prevent pool import operations.

## Uncordon a Pool

When you uncordon a pool, you remove the scheduling restrictions and allow new resources to be created again. Use this when maintenance is complete or when you want the pool to resume normal operations.

**Uncordon a Pool and Re-enable All Resource Scheduling**

```
kubectl-openebs mayastor uncordon pool <pool-name> --replicas --imports
```

**Flags**

- The same flags apply as with cordon, letting you selectively enable scheduling for replicas, snapshots, restores, and imports.
- By default, running uncordon pool without flags will remove all existing cordons, restoring full scheduling for the pool.

## Typical Use Cases

- Planned Maintenance: Isolate a pool before firmware upgrades or hardware replacement.
- Capacity Management: Prevent new replicas on a pool nearing its operational threshold.
- Controlled Decommissioning: Cordon, migrate replicas, and then retire the pool.

:::note
- Cordoning blocks new resources only. It does not move or delete existing data.
- Make sure enough other pools remain uncordoned to keep volumes healthy.
- Pools stay cordoned across restarts until you explicitly uncordon them.
:::