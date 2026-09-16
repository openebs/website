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

## When a rebuild is triggered

A volume is picked up when all of the following hold:

- It is not published, and it has been published at some point in the past. A volume that has never been published has no data to protect.
- Self-healing is enabled on the volume (the default).
- It is `Degraded`, judged from the replica health recorded at the last publish rather than from live replica state, so a node whose cache is stale cannot mask the degradation.
- It has stayed degraded for the whole grace period.
- The rebuild can actually succeed: there is a healthy replica to copy from, and somewhere to put the replacement.

The last point avoids creating a target that could only sit there failing. If no healthy source or no suitable pool exists, the volume is left alone and re-examined on the next cycle.

The grace period is skipped in one case. If the volume's replica count was increased while it was unpublished, the added replica is known to be out of sync rather than possibly-stale, so waiting achieves nothing and the rebuild starts immediately.

## What happens if the volume is published mid-rebuild

If an application mounts the volume while an offline rebuild is running, the existing temporary target is promoted to a normal published target rather than being destroyed and recreated. The rebuild continues through the promotion, and the target then behaves like any other published target, including being torn down by the usual unpublish path rather than by this feature.

## Enabling the feature

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

## Configuring the grace period

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

## Starting a rebuild without waiting

The grace period is there for a node that might come back. When you already know it
will not, a decommissioned machine or a confirmed disk failure, there is no reason to
sit through it:

**Command**
```
kubectl mayastor rebuild volume {your_volume_UUID}
```

This skips the wait and nothing else. The rebuild still has to be viable and still
has to fit within the concurrency limits below, so the request shortens the wait
rather than forcing through a rebuild that could not otherwise run. If those
conditions are not met yet, the volume is picked up as soon as they are.

:::note
The request is refused outright, rather than held, in three cases: the volume is
published, the volume is not degraded, or offline rebuild is disabled. A published
volume is already rebuilt without a grace period, a volume that is not degraded has
nothing to rebuild, and with the feature disabled there would be no reconciler to act
on the request.
:::

## Limiting how many run at once

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

## Observing a rebuild

While an offline rebuild is running, the volume reports a target even though no application is using it. That is the temporary one, and for as long as it exists the rebuild can be inspected the same way as any other:

**Command**
```
kubectl mayastor get rebuild-history {your_volume_UUID}
```

:::note
Rebuild history belongs to the target, so it is discarded when the temporary target is torn down. Once the volume is back to `Online` this command reports that the volume has no target, and the completed offline rebuild will not appear in any later history. Check it while the rebuild is in progress if you want the per-segment detail.
:::

To see that a rebuild happened after the fact, use the events instead. The data plane emits `RebuildBegun` and `RebuildEnd` for every rebuild, and these outlive the temporary target:

**Command**
```
kubectl openebs mayastor get events -n <product-namespace> --volume {your_volume_UUID}
```

This requires the [Eventing Aggregator](eventing-aggregator.md), which is enabled by default.

Afterwards, confirm the outcome from the volume itself:

**Command**
```
kubectl mayastor get volume {your_volume_UUID}
```

A volume that has finished an offline rebuild is `Online` with no target. To confirm where the replicas ended up:

**Command**
```
kubectl mayastor get volume-replica-topology {your_volume_UUID}
```

## If a rebuild does not start

The reconciler skips volumes rather than failing loudly, so an offline rebuild that never begins usually means one of its conditions is unmet. Working from the cheapest check upwards:

- **The feature is enabled.** It is off by default.
- **The volume has been published at least once.** A volume that has never been published has no recorded replica health to compare against, so there is nothing to call degraded.
- **Self-healing is enabled on the volume.**
- **The volume is actually reported as `Degraded`.** A replica can be missing while the volume still reports `Online` if the loss has not yet been reflected in the recorded health.
- **The grace period has fully elapsed** since the volume was first seen as degraded,
  or the rebuild was requested explicitly.
- **A healthy replica remains to copy from,** and a pool exists with room for the replacement. If either is missing the rebuild could not finish, so it is not started.
- **The concurrency limits are not already taken** by other rebuilds, offline or otherwise.

:::note
Only some of these are logged. The core agent logs at debug level when it defers for the grace period, when either concurrency limit is reached, and when the rebuild is not viable. The earlier conditions, the feature being disabled, the volume never having been published, self-healing being off, or the volume not being degraded, are skipped silently, so check those from the volume itself rather than looking for a log line.
:::

## See also

- [Drain a Node](drain-node.md) and [Cordon Pools](cordon-pools.md), for taking nodes and pools out of service. Offline rebuild is what restores redundancy for unpublished volumes whose replicas lived there.
- [Replica Rebuilds](replica-rebuild.md), for how rebuilds work on published volumes, including the partial rebuild path.
- [Eventing Aggregator](eventing-aggregator.md), for querying rebuild events after the fact.
