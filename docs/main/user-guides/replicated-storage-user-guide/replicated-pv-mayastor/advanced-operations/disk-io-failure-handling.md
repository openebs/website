---
id: disk-io-failure-handling
title: DiskPool I/O Failure Handling
keywords:
 - DiskPool I/O Failure Handling
 - Disk I/O Failure Handling
 - Disk Failure
 - Disk I/O Errors
description: This document explains about the Disk I/O Failure Handling feature.
---

# Disk I/O Failure Handling

## Overview

Replicated PV Mayastor continuously monitors DiskPools and their underlying storage devices to detect Disk I/O errors, device removal and I/O stalls. It improves storage fault visibility by detecting device hot-removal, stalled I/O conditions and I/O errors. DiskPools automatically report updated pool states, alerts and diagnostic information to help identify unhealthy storage devices, understand workload impact during disk-related failures, and prevent unhealthy pools from being selected for future storage operations.

Typical scenarios include:

- A backing disk is physically detached or removed from the node
- A disk starts returning I/O errors or experiencing stalled I/O operations

:::warning
Disk I/O failures and device removal events may result in degraded volumes, unavailable replicas, or failed storage operations.
:::

## DiskPool States and Alerts

Replicated PV Mayastor reports DiskPool health using pool states, alerts, and diagnostic information.

### Pool States

| State | Description |
| :--- | :--- |
| Online | Pool is operating normally |
| Suspected | Pool has disk or I/O alerts of level warning or higher |
| Faulted | Pool is in an unrecoverable state and cannot be used |
| Offline | Pool is unavailable because the node is offline or the disk is detached |
| Unknown | Pool state cannot be determined |

### Alert Status

| Alert Status | Description |
| :--- | :--- |
| Healthy | No disk I/O issues detected |
| Attention | Intermittent or low-frequency I/O stalls detected |
| Warning | Disk I/O error threshold exceeded or excessive intermittent stall transitions detected |
| Critical | Active stalled I/O operations detected |

## Hot-Removal Behavior

When a backing disk is detached becomes unavailable, Replicated PV Mayastor unloads the affected pool.

As part of this process:

- The DiskPool transitions to an `Offline` state
- The DiskPool Custom Resource (CR) `PoolReady` condition becomes False
- Diagnostic information reports the detected failure reason

The control plane probes the io-engine to detect whether the backing device has been reattached to the node. If the device becomes available again, Replicated PV Mayastor import the pool and restore normal operations.

## DiskPool I/O Error Handling

Replicated PV Mayastor tracks runtime disk I/O errors and exposes alert information for affected DiskPools.

If the number of I/O errors reported by a DiskPool exceeds the configured threshold, the DiskPool is marked as `Suspected`. Pools in the `Suspected` state are less likely to be selected for future volume placement operations.

The `ioErrorThreshold` parameter defines the number of allowed I/O errors before a DiskPool transitions to the `Suspected` state. By default, `ioErrorThreshold` is set to `64`. This parameter can be configured using Helm and applies globally to all DiskPools created in the cluster. The current DiskPool I/O error count is exposed through the `status.error_info.io_error_count field` in the DiskPool custom resource.

## I/O Stall Detection and Intermittent Backend Failure Handling

Replicated PV Mayastor monitors DiskPools for stalled I/O operations.

When the I/O request is submitted to the pool backend and remains incomplete beyond the user-configured stall detection timeout (`stallDeadline`):

- The DiskPool is marked as stalled
- The DiskPool state transitions to `Suspected`
- The DiskPool alert status transitions to `Critical`
- The pool is avoided for future replica placement operations

I/O stalls can occur because of Storage device failures or unresponsive disks, Backend storage path instability, and Network disruptions affecting storage access. The current stall status of a DiskPool is exposed through the `status.error_info.io_stalled` field in the DiskPool custom resource. The `status.error_info.io_stall_transition_count` field reports the number of stall-to-resume and resume-to-stall transitions detected within the configured `stallTransitionWindow`.

### Intermittent Stall Detection

Replicated PV Mayastor monitors repeated I/O stall and recovery transitions to detect unstable or intermittently failing storage backends. Such conditions can occur when storage paths become unreliable, causing I/O operations to alternate between stalled and completed states.

To help identify these scenarios, Replicated PV Mayastor tracks the frequency of stall transitions within a configurable time window. You (Administrators) can define the maximum number of allowable stall transitions by configuring the `stallTransitionThreshold` and `stallTransitionWindow` parameters.

For example, if `stallTransitionWindow` is configured as 30 minutes and `stallTransitionThreshold` is set to 10, a DiskPool is marked as `Suspected` and a Warning alert is raised when 10 stall transitions occur within any 30-minute period. DiskPools in the `Suspected` state become less preferred for future replica placement operations.

If one or more stall transitions occur within the configured time window but do not exceed the configured threshold, the DiskPool alert status transitions to `Attention`, indicating a potential storage path or backend stability issue that should be monitored.

When intermittent stalls are detected:

- The DiskPool alert status transitions to `Attention`
- Repeated stall transitions within the configured time window may raise the alert level to `Warning`
- Pools experiencing frequent intermittent stalls become less preferred for replica scheduling

This behavior helps identify unstable storage devices or paths that repeatedly recover and fail over time.

## Configure DiskPool I/O Alert Thresholds

Replicated PV Mayastor allows you to configure DiskPool I/O monitoring thresholds using Helm values.

The following parameters control disk error and stall detection behavior:

| Parameter | Default Value | Description | Helm Path |
| :--- | :--- | :--- | :--- |
| `ioErrorThreshold` | `64` | Number of disk I/O errors allowed before the DiskPool is marked as `Suspected` | `mayastor.io_engine.pool.ioAlerts.errorThreshold` |
| `stallDeadline` | `io_engine.nvme.ioTimeout * 2` | Time interval after which incomplete I/O operations are treated as stalled | `mayastor.io_engine.pool.ioAlerts.stallDeadline` |
| `stallTransitionThreshold` | 3 | Number of intermittent stall transitions allowed before warning alerts are raised | `mayastor.io_engine.pool.ioAlerts.stallTransitionThreshold` |
| `stallTransitionWindow` | 3h | Time window used to track intermittent stall activity | `mayastor.io_engine.pool.ioAlerts.stallTransitionWindow` |

## View DiskPool Status

Use the following command to view DiskPool state, alerts, and conditions.

**Command**

```
kubectl get diskpools -A
```

## View DiskPool Details

Use the following command to inspect DiskPool conditions, alerts, and diagnostic information.

**Command**

```
kubectl describe diskpool <diskpool-name>
```

**Expected Results**

- Pool state reflects the current health condition
- PoolReady condition displays the detected failure reason 
- Diagnostic information includes disk or import-related errors 