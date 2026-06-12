---
id: spdk-interrupt-mode
title: SPDK Interrupt Mode
keywords:
 - SPDK Interrupt Mode
 - SPDK
 - Interrupt Mode
description: This section explains about SPDK Interrupt Mode.
---
# SPDK Interrupt Mode

## Overview

Replicated PV Mayastor supports Interrupt Mode, an optional reactor operating mode that reduces CPU utilization during periods of low or idle I/O activity.

By default, io-engine reactors continuously poll for I/O events, which can consume significant CPU resources even when no I/O operations are in progress. When Interrupt Mode is enabled, reactors transition from continuous polling to an event-driven model, allowing them to sleep while waiting for work and wake only when events occur.

This feature helps reduce overall CPU consumption in environments where maximizing storage performance is less critical than improving resource efficiency.

:::warning
- Interrupt Mode is an experimental feature in this release. The functionality and behavior may change in future releases. Evaluate the feature thoroughly in non-production environments before enabling it in production deployments.
- Interrupt Mode has not been validated for use with RDMA configurations in this release. If your deployment uses RDMA, continue using the default polling mode unless interrupt mode support for RDMA is explicitly documented in a future release.
:::

## How SPDK Interrupt Mode Works

When Interrupt Mode is enabled:

- Reactors wait for events instead of continuously polling.
- NVMe-oF target operations use event-driven notifications.
- NVMe initiator I/O queues are polled periodically based on a configurable polling interval.
- CPU usage decreases significantly during idle periods.

This behavior reduces CPU utilization at the expense of additional I/O latency and reduced peak throughput.

## Performance Considerations

Interrupt Mode introduces a trade-off between CPU efficiency and storage performance.

Smaller polling intervals generally provide better performance while still reducing CPU usage. Larger polling intervals further reduce CPU consumption but may increase latency and reduce throughput.

Consider the following guidelines:

| Poll Interval | Expected Behavior |
| :--- | :--- |
| `0` (Busy Poll) | Maximum performance and lowest latency, highest CPU usage |
| `100us` | Balanced CPU savings and performance |
| `1000us` | Maximum CPU savings, higher latency and lower throughput |

:::note
- For production environments requiring the highest storage performance, the default polling mode may be preferable.
- For development, edge, test, or lightly utilized environments, Interrupt Mode can significantly reduce CPU consumption.
:::

## Configure SPDK Interrupt Mode

Configure Interrupt Mode in the Replicated PV Mayastor Helm values file.

### Enable Interrupt Mode

Set the following parameter to enable SPDK Interrupt Mode:

```
io_engine:
  interruptMode:
    enabled: true
```

### Configure the NVMe I/O Queue Poll Period

Use the following parameter to configure the NVMe I/O queue polling interval:

```
io_engine:
  interruptMode:
    enabled: true
    nvmeIoQueuePollPeriod: "100us"
```

**Parameters**

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `interruptMode.enabled` | Enables SPDK Interrupt Mode for io-engine reactors. | `false` |
| `interruptMode.nvmeIoQueuePollPeriod` | Specifies the NVMe I/O queue polling interval used when Interrupt Mode is enabled. Higher values reduce CPU usage but may increase latency. | `100us` |

## Benefits

SPDK Interrupt Mode provides the following benefits:

- Reduces idle CPU consumption for io-engine instances.
- Improves resource efficiency in lightly loaded clusters.
- Helps lower infrastructure overhead in edge and development environments.
- Provides configurable tuning for balancing CPU utilization and storage performance.
- Maintains backward compatibility because the feature is disabled by default.

## See Also

- [RDMA Enablement](../configuration/rs-rdma.md)
- [Create DiskPool(s)](../configuration/rs-create-diskpool.md)
- [Create StorageClass(s)](../configuration/rs-create-storageclass.md)
- [Storage Class Parameters](../configuration/rs-storage-class-parameters.md)
- [Topology Parameters](../configuration/rs-topology-parameters.md)
- [Deploy an Application](../configuration/rs-deployment.md)