---
id: offline-rebuild
title: Offline Volume Rebuild
keywords:
 - Offline Volume Rebuild
 - Offline Rebuild
 - Unpublished Volume Rebuild
description: This guide explains how replicas of unpublished volumes are rebuilt automatically, and how to configure the feature.
---

Replicated PV Mayastor rebuilds a degraded replica by attaching it to the volume's target and copying data from a healthy one. That relies on a target existing, so it only happens while a volume is published. A volume that is not currently mounted by any application has no target, and until now a replica lost while in that state stayed missing until the next time the volume was published.

This matters because many volumes spend most of their life unpublished: golden images that are read once during cloning, cold backups, and volumes belonging to scaled-down workloads. If a disk fails or a node is decommissioned while such a volume is detached, it runs at reduced redundancy without any indication that a rebuild is due. The usual workaround was to mount each affected volume briefly just to force a target into existence.

The offline volume rebuild feature closes that gap. When an unpublished volume has been degraded for longer than a grace period, the control plane creates a temporary target that is not shared with any host, lets the existing rebuild engine restore the replica through it, and then tears the target down. No application sees the volume during this; the target exists only to give the rebuild something to run against.

## When a Rebuild Is Triggered

A volume is picked up when all of the following hold:

- It is not published, and it has been published at some point in the past. A volume that has never been published has no data to protect.
- Self-healing is enabled on the volume (the default).
- It is `Degraded`, judged from the replica health recorded at the last publish rather than from live replica state, so a node whose cache is stale cannot mask the degradation.
- It has stayed degraded for the whole grace period.
- The rebuild can actually succeed: there is a healthy replica to copy from, and somewhere to put the replacement.

The last point avoids creating a target that could only sit there failing. If no healthy source or no suitable pool exists, the volume is left alone and re-examined on the next cycle.

The grace period is skipped in one case. If the volume's replica count was increased while it was unpublished, the added replica is known to be out of sync rather than possibly-stale, so waiting achieves nothing and the rebuild starts immediately.

## What Happens if the Volume Is Published Mid-Rebuild

If an application mounts the volume while an offline rebuild is running, the existing temporary target is promoted to a normal published target rather than being destroyed and recreated. The rebuild continues through the promotion, and the target then behaves like any other published target, including being torn down by the usual unpublish path rather than by this feature.

## Enabling the Feature

Offline rebuild is disabled by default. Enable it at install or upgrade time:

```
--set agents.core.rebuild.offline.enabled=true
```

Or in `values.yaml`:

```yaml
agents:
  core:
    rebuild:
      offline:
        enabled: true
```

## Configuring the Grace Period

The grace period exists so that a node rebooting, or briefly dropping off the network, does not cause a rebuild that would have been unnecessary a minute later. It defaults to 10 minutes.

```yaml
agents:
  core:
    rebuild:
      offline:
        gracePeriod: 30m
```

Leaving this blank keeps the 10 minute default. Shorten it if your nodes rarely come back from a failure, lengthen it if transient node outages are common in your environment and you would rather absorb them than spend rebuild bandwidth.

:::note
The grace period is measured from when the control plane observes the volume as degraded, not from when the underlying failure occurred.
:::

## Starting a Rebuild Without Waiting

The grace period is there for a node that might come back. When you already know it
will not, a decommissioned machine or a confirmed disk failure, there is no reason to
sit through it:

**Command**
```
kubectl mayastor rebuild volume {your_volume_UUID}
```

**Sample Output**
```
Offline rebuild requested for volume 18e30e83-b106-4e0d-9fb6-2b04e761e18a. The grace period wait is skipped and the volume is considered before other offline rebuilds. This does not raise the rebuild limits, so the rebuild starts once it is viable and a slot is free.
```

This skips the wait and has the volume considered before other offline rebuilds, rather
than in whatever order the volumes happen to sit in. It does not raise the concurrency
limits below: the rebuild still has to be viable and still has to fit within those
limits, so the request shortens the wait rather than forcing through a rebuild that
could not otherwise run.

:::note
Being considered first is not a reserved slot. If every rebuild slot is already taken,
the request does not evict a running rebuild, and a slot that frees up can still be
taken by another volume. What the request does guarantee is that the volume stops
waiting out the grace period, and that it is no longer stuck behind the same volumes on
every cycle.
:::

:::note
The request is refused outright, rather than held, in three cases: the volume is
published, the volume is not degraded, or offline rebuild is disabled. A published
volume is already rebuilt without a grace period, a volume that is not degraded has
nothing to rebuild, and with the feature disabled there would be no reconciler to act
on the request.
:::

## Limiting How Many Run at Once

Offline rebuilds draw from the same budget as ordinary rebuilds, set by `agents.core.rebuild.maxConcurrent`. Without a separate limit, a batch of offline rebuilds, for example after a pool is decommissioned, can occupy every slot and leave nothing for volumes that are published and serving I/O.

`maxConcurrent` inside the `offline` block caps them separately:

```yaml
agents:
  core:
    rebuild:
      maxConcurrent: 10
      offline:
        maxConcurrent: 2
```

With this, at most two rebuild jobs at a time are offline ones, leaving the remaining eight slots for published volumes. Both limits are counted in rebuild jobs, so a target restoring two replicas counts as two.

:::info
Setting the offline limit at or above the system-wide `maxConcurrent` reserves nothing, since the system-wide limit is reached first. The control plane logs a warning at startup if it is configured that way.
:::

Leaving the offline limit blank means only the system-wide limit applies.

## Observing a Rebuild

While an offline rebuild is running, the volume reports a target even though no application is using it. That is the temporary one, and for as long as it exists the rebuild can be inspected the same way as any other:

**Command**
```
kubectl mayastor get rebuild-history {your_volume_UUID}
```

**Sample Output**
```
DST                                   SRC                                   STATE      TOTAL   RECOVERED  TRANSFERRED  IS-PARTIAL  START-TIME            END-TIME
b5de71a6-055d-433a-a1c5-2b39ade05d86  0dafa450-7a19-4e21-a919-89c6f9bd2a97  Completed  10 MiB  10 MiB     10 MiB       false       2026-09-26T11:02:14Z  2026-09-26T11:02:19Z
```

The replacement replica starts empty, so `IS-PARTIAL` is `false`, unlike the partial rebuilds a published volume can often use.

:::note
Rebuild history belongs to the target, so it is discarded when the temporary target is torn down. Once the volume is back to `Online` this command reports that the volume has no target, and the completed offline rebuild will not appear in any later history. Check it while the rebuild is in progress if you want the per-segment detail.
:::

To see that a rebuild happened after the fact, use the events instead. The data plane emits `RebuildBegin` and `RebuildEnd` for every rebuild, and these outlive the temporary target:

**Command**
```
kubectl openebs mayastor get events -n <product-namespace> --volume {your_volume_UUID}
```

**Sample Output**
```
ID                                    TIMESTAMP             CATEGORY  ACTION        TARGET                                NODE         COMPONENT
a4f60c25-91bb-4d37-8e5f-2d7c8b1a9e03  2026-09-26T11:02:14Z  Nexus     RebuildBegin  18e30e83-b106-4e0d-9fb6-2b04e761e18a  io-engine-1  IoEngine
c7b1e0a9-3d62-41f5-8a74-6e9f2c0b5d81  2026-09-26T11:02:19Z  Nexus     RebuildEnd    18e30e83-b106-4e0d-9fb6-2b04e761e18a  io-engine-1  IoEngine
```

This requires the [Eventing Aggregator](eventing-aggregator.md), which is enabled by default.

Afterwards, confirm the outcome from the volume itself:

**Command**
```
kubectl mayastor get volume {your_volume_UUID}
```

**Sample Output**
```
ID                                    REPLICAS  TARGET-NODE  ACCESSIBILITY  STATUS  SIZE    THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE  CLEAN-SHUTDOWN  ENCRYPTED
18e30e83-b106-4e0d-9fb6-2b04e761e18a  2         <none>       <none>         Online  10 MiB  false             10 MiB     0          <none>  true            false
```

A volume that has finished an offline rebuild is `Online` with no target, so `TARGET-NODE` and `ACCESSIBILITY` are both `<none>`. To confirm where the replicas ended up:

**Command**
```
kubectl mayastor get volume-replica-topology {your_volume_UUID}
```

**Sample Output**
```
REPLICA-ID                            NODE         POOL    STATUS  ENCRYPTED  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD  HEALTHY
0dafa450-7a19-4e21-a919-89c6f9bd2a97  io-engine-1  pool-1  Online  false      10 MiB    10 MiB     0 B        <none>        <none>  <none>   true
b5de71a6-055d-433a-a1c5-2b39ade05d86  io-engine-3  pool-3  Online  false      10 MiB    10 MiB     0 B        <none>        <none>  <none>   true
```

`CHILD-STATUS`, `REASON` and `REBUILD` are `<none>` because there is no longer a target for the replicas to be children of. While the rebuild is running they are populated, and `REBUILD` shows a percentage.

## If a Rebuild Does Not Start

The reconciler skips volumes rather than failing loudly, so an offline rebuild that never begins usually means one of its conditions is unmet. Working from the cheapest check upwards:

- **The feature is enabled.** It is off by default.
- **The volume has been published at least once.** A volume that has never been published has no recorded replica health to compare against, so there is nothing to call degraded.
- **Self-healing is enabled on the volume.**
- **The volume is actually reported as `Degraded`.** A replica can be missing while the volume still reports `Online` if the loss has not yet been reflected in the recorded health.
- **The grace period has fully elapsed** since the volume was first seen as degraded,
  or the rebuild was requested explicitly.
- **A healthy replica remains to copy from,** and a pool exists with room for the replacement. If either is missing the rebuild could not finish, so it is not started.
- **The concurrency limits are not already taken** by other rebuilds, offline or otherwise. A requested rebuild is considered before other offline rebuilds, but it still waits for a slot and does not reserve one.

:::note
Only some of these are logged. The core agent logs at debug level when it defers for the grace period, when either concurrency limit is reached, and when the rebuild is not viable. The earlier conditions, the feature being disabled, the volume never having been published, self-healing being off, or the volume not being degraded, are skipped silently, so check those from the volume itself rather than looking for a log line.
:::

## See Also

- [Drain a Node](drain-node.md) and [Cordon Pools](cordon-pools.md), for taking nodes and pools out of service. Offline rebuild is what restores redundancy for unpublished volumes whose replicas lived there.
- [Replica Rebuilds](replica-rebuild.md), for how rebuilds work on published volumes, including the partial rebuild path.
- [Eventing Aggregator](eventing-aggregator.md), for querying rebuild events after the fact.
