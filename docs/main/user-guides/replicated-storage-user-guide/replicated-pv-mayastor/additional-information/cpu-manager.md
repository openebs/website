---
id: cpu-manager
title: CPU Manager and Core Pinning
keywords:
 - CPU Manager
 - Core Pinning
 - isolcpus
 - Dedicated CPUs
description: How the IO engine's core pinning interacts with the Kubernetes CPU Manager, and the configuration required to run the two together.
---

# CPU Manager and Core Pinning

## Overview

The IO engine pins each of its reactors to one CPU core and polls that core continuously.
On a node running the Kubernetes CPU Manager with the `static` policy, CPU cores are also
assigned by kubelet. These are two independent allocators, and **nothing reconciles them**.
Getting them to agree is a configuration task that falls to the cluster administrator.

This page describes what each allocator decides, what happens when the two disagree, and
the configuration required for them to coexist. Read it alongside
[Performance Tips](performance-tips.md), which covers choosing the cores themselves.

:::info
Every core listed in `mayastor.io_engine.coreList` is consumed in full. The reactors busy-poll,
so those cores sit at 100% utilisation whether or not there is I/O to serve. The core list is a
reservation, not a measure of average usage. See [Interrupt Mode](interrupt-mode.md) for the
alternative.
:::

## Two Allocators, No Handshake

**kubelet decides which CPUs a pod gets.** Under the `static` policy, a pod in QoS class
Guaranteed with an integer CPU limit is granted exclusive CPUs, chosen by kubelet's own
topology-aware algorithm. There is no API to request particular CPUs — a workload asks for a
count, not a choice.

**The IO engine pins to literal core numbers.** The value of `mayastor.io_engine.coreList` is
passed through to the data plane as a list of core IDs, and each reactor pins itself to the core
with that number.

This applies to `mayastor.io_engine.cpuCount` as well, which is easy to miss. `cpuCount` does not
mean "any N cores" — the chart expands it to the literal list `1,2,…,N`. The default
`cpuCount: "2"` therefore means **cores 1 and 2 specifically**, and an installation that never
sets `coreList` is still asserting that kubelet will assign exactly those cores.

## Why a Mismatch Is Silent

The Linux kernel does not allow a thread to be pinned to a CPU outside its cgroup cpuset. The
request is rejected outright rather than clamped to the permitted set:

**Command**

Run inside a container whose cpuset does not include CPU 1:

```
grep Cpus_allowed_list /proc/self/status
taskset -c 1 true
```

**Example Output**

```
Cpus_allowed_list:	0
taskset: failed to set pid 8's affinity: Invalid argument
```

When the cores named in `coreList` are not the cores kubelet assigned, every reactor pin is
rejected this way. The pod does not fail, no probe trips, and no event is recorded. The reactors
simply run unpinned, floating across whatever cpuset the container has, and the performance
isolation the core list was meant to provide is never established.

A partial overlap is the most difficult case to spot. If kubelet assigns cores `2` and `7` while
`coreList` is `{2,3}`, the reactor on core 2 pins and the reactor on core 3 does not. The
deployment looks correct and performs inconsistently.

:::warning
Restoring affinity after a cpuset change can only ever restore a pin to a core that is still in
the container's cpuset. It cannot recover a core that kubelet has given to another workload. A
core list that overlaps another workload's exclusive CPUs is a provisioning problem, and no amount
of re-pinning corrects it.
:::

## Required Configuration

The IO engine does not need exclusive CPUs from kubelet, and asking for them is what creates the
reconciliation problem. Reserve the reactor cores at the node level instead, point the core list at
them, and leave the pod's QoS class alone. This works identically under the `none` and `static`
policies, so no policy change is required.

### 1. Reserve the Reactor Cores

Set `reservedSystemCPUs` in the kubelet configuration to the cores the IO engine will run on, and
set `mayastor.io_engine.coreList` to the same cores.

**Kubelet configuration**

```yaml
reservedSystemCPUs: "2-3"
```

**Command**

```
kubectl openebs upgrade -n <namespace> --set 'mayastor.io_engine.coreList={2,3}'
```

Under the `static` policy, CPUs named in `reservedSystemCPUs` are withheld from exclusive
allocation — kubelet will not grant them to any Guaranteed pod — while remaining part of the shared
pool. The IO engine container's cpuset therefore still contains them, and the reactors pin
successfully. The two properties together are what this configuration relies on: the cores are
unavailable to other workloads, and still reachable by the IO engine.

Reserving the cores also removes them from the node's allocatable CPU, which is correct. The
reactors busy-poll those cores in full, so the capacity is genuinely gone, and the scheduler should
not be offering it to anything else.

### 2. Leave the IO Engine Pod Non-Guaranteed

Do not add resources to make the pod Guaranteed. The IO engine container already has matching CPU
requests and limits, and the pod is kept in Burstable only by the metrics exporter sidecar, which
ships with no resources set. Leave it that way.

Promoting the pod to Guaranteed is actively harmful here. A Guaranteed pod with an integer CPU
limit is granted exclusive CPUs **chosen by kubelet** from the pool that excludes the reserved
cores. It would be given cores other than the ones reserved for it, its cpuset would be narrowed to
exactly those, and every pin to the configured core list would then be rejected — the silent
failure described above.

### 3. Do Not Enable `strict-cpu-reservation`

The `static` policy accepts a `strict-cpu-reservation` option, available since Kubernetes v1.32. It
removes the reserved CPUs from the shared pool as well, so that no pod of any QoS class can run on
them. That breaks this configuration at the root: the IO engine container's cpuset would no longer
contain the reserved cores and every reactor pin would fail. Leave it out of
`cpuManagerPolicyOptions` on nodes that run the IO engine.

### 4. Exclude Core 0

Core 0 carries boot-time and timekeeping duties that the kernel will not fully migrate elsewhere.
Placing a busy-polling reactor there starves that work and usually reduces throughput rather than
improving it. The chart's `cpuCount` expansion begins at core 1 for this reason; a hand-written
`coreList` loses that protection, so exclude core 0 explicitly.

## Isolated CPUs

Reserving the cores keeps kubelet from allocating them exclusively, but it does not keep other
containers off them — the reserved CPUs stay in the shared pool, which is the cpuset every
Burstable and BestEffort pod runs in. That is exactly what lets the reactors pin, and it is also
the remaining gap.

Close it with the `isolcpus` kernel parameter, naming the same cores. Isolated CPUs are removed
from the scheduler's general-purpose set, so other threads are not balanced onto them and only a
thread that asks for a core explicitly — as the reactors do — runs there.

The three settings describe the same list of cores and must be changed together:

| Setting | Where | What it does |
| :--- | :--- | :--- |
| `isolcpus` | Kernel boot arguments | Keeps the general scheduler from placing other work on the cores |
| `reservedSystemCPUs` | Kubelet configuration | Keeps kubelet from allocating the cores exclusively to another pod |
| `mayastor.io_engine.coreList` | OpenEBS Helm values | Tells the IO engine which cores to pin its reactors to |

## Workloads with Dedicated CPUs

Workloads that request dedicated CPUs — including virtual machines configured for CPU pinning —
receive them from kubelet's exclusive pool, which is the node's CPUs minus `reservedSystemCPUs`.
Reserving the reactor cores separates the two allocators by construction: kubelet cannot hand a
reactor core to a VM, and the IO engine never consults kubelet's assignments. Nothing needs to be
reconciled, and nothing needs re-checking when a VM is created, migrated or destroyed.

## Not Recommended: Exclusive CPUs for the IO Engine

Making the IO engine pod Guaranteed so that kubelet grants it exclusive CPUs is the configuration
most often attempted, and it can be made to work, but it is fragile. There is no API to request
*particular* CPUs: kubelet chooses, the core list must be edited to match what it chose, and it
chooses afresh every time the container is recreated.

kubelet records its assignments on each node:

**Command**

```
jq '.entries' /var/lib/kubelet/cpu_manager_state
```

**Example Output**

```
{
  "b4c1...": {
    "io-engine": "2-3"
  }
}
```

The set shown for the `io-engine` container must be identical to `mayastor.io_engine.coreList`.

:::warning
This is not a one-time check. A pod that is rescheduled, restarted, or moved to another node can be
granted a different set, so a core list that matched at install time can stop matching later,
silently. Re-verify after any event that recreates the IO engine pod, and whenever the node's
workload mix changes. Reserving the cores instead avoids this entirely.
:::

## Supported Configurations

| Configuration | Status |
| :--- | :--- |
| `isolcpus`, `reservedSystemCPUs` and `coreList` set to the same cores, IO engine left non-Guaranteed | Supported — recommended, under either policy |
| As above, without `isolcpus` | Best-effort — the reactors stay pinned, but shared-pool pods can run on the same cores |
| `static` policy with `strict-cpu-reservation` enabled | Not supported — the reserved cores leave the shared pool and every reactor pin fails |
| `static` policy, IO engine Guaranteed, core list verified equal to the assigned CPUs | Works, but not recommended — must be re-verified after every pod recreation |
| `static` policy, IO engine Guaranteed, `coreList` or `cpuCount` left at defaults | Not supported — pins to cores 1 and 2 regardless of what was assigned |
| Core list overlapping another workload's dedicated CPUs | Not supported |

## Confirming the Reactors Are Pinned

The core list is a request. To see where the reactors ended up, list the data plane's threads with
the processor each one is running on. Run this on the node, not inside the container.

**Command**

```
ps -L -o tid,psr,comm -p "$(pidof io-engine)"
```

**Example Output**

```
    TID PSR COMMAND
 176746   1 io-engine
 176750   4 tokio-runtime-w
 176751   5 tokio-runtime-w
 176752   7 tokio-runtime-w
 176753   3 tokio-runtime-w
 176754   0 tokio-runtime-w
 176756   7 dpdk-intr
 176757   2 dpdk-worker2
 176758   3 dpdk-telemet-v2
 176759   4 io-engine
```

The reactors are the process's **main thread** and the **`dpdk-worker`** threads. Above, the main
thread holds core 1 and `dpdk-worker2` holds core 2 — the chart's default core list. There is no
`dpdk-worker1` because the first core in the list is driven by the main thread rather than by a
spawned worker, so a list of N cores produces the main thread plus N-1 workers.

Every `PSR` value in the reactor rows must appear in `mayastor.io_engine.coreList`, and because the
reactors never sleep, those values do not change between readings. A reactor whose processor number
moves, or sits outside the core list, is not pinned.

:::info
The other threads are not reactors and their processor numbers are not part of this check. The
`tokio-runtime-w` threads run the asynchronous runtime and are deliberately left unaffinitized, so
they appear on any core in the container's cpuset — including cores outside the core list, as above.
The same applies to `dpdk-intr` and `dpdk-telemet-v2`.
:::

## Verification Checklist

1. `isolcpus`, `reservedSystemCPUs` and `mayastor.io_engine.coreList` name the same cores.
2. The core list excludes core 0.
3. `cpuManagerPolicyOptions` does not include `strict-cpu-reservation`.
4. No container in `/var/lib/kubelet/cpu_manager_state` holds any of those cores.
5. The reactors are actually on them — see
   [Confirming the Reactors Are Pinned](#confirming-the-reactors-are-pinned).
