---
id: monitoring
title: Monitoring
keywords:
 - Monitoring
 - Pool metrics
description: This guide explains about the IO engine pool metrics exporter.
---
# Monitoring

## Pool Metrics Exporter

The IO engine pool metrics exporter runs as a sidecar container within every I/O-engine pod and exposes pool usage metrics in Prometheus format. These metrics are exposed on port 9502 using an HTTP endpoint/metrics and are refreshed every five minutes.

### Supported Pool Metrics

| Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| disk_pool_total_size_bytes | Gauge | Integer | Total size of the pool |
| disk_pool_used_size_bytes | Gauge | Integer | Used size of the pool |
| disk_pool_status | Gauge | Integer | Status of the pool (0, 1, 2, 3) = {"Unknown", "Online", "Degraded", "Faulted"} |
| disk_pool_committed_size | Gauge | Integer | Committed size of the pool in bytes |

**Example Metrics**
```
# HELP disk_pool_status disk-pool status
# TYPE disk_pool_status gauge
disk_pool_status{node="worker-0",name="mayastor-disk-pool"} 1
# HELP disk_pool_total_size_bytes total size of the disk-pool in bytes
# TYPE disk_pool_total_size_bytes gauge
disk_pool_total_size_bytes{node="worker-0",name="mayastor-disk-pool"} 5.360320512e+09
# HELP disk_pool_used_size_bytes used disk-pool size in bytes
# TYPE disk_pool_used_size_bytes gauge
disk_pool_used_size_bytes{node="worker-0",name="mayastor-disk-pool"} 2.147483648e+09
# HELP disk_pool_committed_size_bytes Committed size of the pool in bytes
# TYPE disk_pool_committed_size_bytes gauge
disk_pool_committed_size_bytes{node="worker-0", name="mayastor-disk-pool"} 9663676416
```

## Stats Exporter Metrics

When [eventing](../additional-information/eventing.md) is activated, the stats exporter operates within the **obs-callhome-stats** container, located in the **callhome** pod. The statistics are made accessible through an HTTP endpoint at port `9090`, specifically using the `/stats` route.

### Supported Stats Metrics

| Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| pools_created |  Guage | Integer | Total successful pool creation attempts |
| pools_deleted | Guage | Integer | Total successful pool deletion attempts |
| volumes_created | Guage | Integer | Total successful volume creation attemtps |
| volumes_deleted | Guage | Integer | Total successful volume deletion attempts |

## Integrating Exporter with Prometheus Monitoring Stack

1. To install, add the Prometheus-stack helm chart and update the repo.

**Command**
```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Then, install the Prometheus monitoring stack and set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues to false. This enables Prometheus to discover custom ServiceMonitor for Replicated PV Mayastor.

**Command**
```
helm install mayastor prometheus-community/kube-prometheus-stack -n mayastor --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

2. Install the ServiceMonitor resource to select services and specify their underlying endpoint objects.

**ServiceMonitor YAML**
```
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: mayastor-monitoring
  labels:
    app: mayastor
spec:
  selector:
    matchLabels:
      app: mayastor
  endpoints:
  - port: metrics
```

:::info
Upon successful integration of the exporter with the Prometheus stack, the metrics will be available on the port 9090 and HTTP endpoint /metrics.
:::

## CSI Metrics Exporter

| Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| kubelet_volume_stats_available_bytes | Gauge | Integer | Size of the available/usable volume (in bytes) | 
| kubelet_volume_stats_capacity_bytes | Gauge | Integer | The total size of the volume (in bytes) |
| kubelet_volume_stats_used_bytes | Gauge | Integer | Used size of the volume (in bytes) |
| kubelet_volume_stats_inodes | Gauge |	Integer | The total number of inodes |
| kubelet_volume_stats_inodes_free | Gauge | Integer | The total number of usable inodes. |
| kubelet_volume_stats_inodes_used | Gauge | Integer | The total number of inodes that have been utilized to store metadata. |


## Performance Monitoring Stack

Earlier, the pool capacity/state stats were exported, and the exporter used to cache the metrics and return when Prometheus client queried. This was not ensuring the latest data retuns during the Prometheus poll cycle.

In addition to the capacity and state metrics, the metrics exporter also exports performance statistics for pools, volumes, and replicas as Prometheus counters. The exporter does not pre-fetch or cache the metrics, it polls the IO engine inline with the Prometheus client polling cycle.

:::important
Users are recommended to have Prometheus poll interval not less then 5 minutes.
:::

The following sections describes the raw resource metrics counters.

### DiskPool IoStat Counters

| Metric Name | Metric Type | Labels/Tags | Metric Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
|diskpool_num_read_ops | Gauge | `name`=<pool_id>, `node`=<pool_node> | Integer | Number of read operations |
|diskpool_bytes_read | Gauge | `name`=<pool_id>, `node`=<pool_node> | Integer | Total bytes read on the pool |
|diskpool_num_write_ops | Gauge | `name`=<pool_id>, `node`=<pool_node> | Integer | Number of write operations on the pool |
|diskpool_bytes_written | Gauge | `name`=<pool_id>, `node`=<pool_node> | Integer | Total bytes written on the pool |
|diskpool_read_latency_us | Gauge | `name`=<pool_id>, `node`=<pool_node> | Integer | Total read latency for all IOs on Pool in usec. |
|diskpool_write_latency_us | Gauge | `name`=<pool_id>, `node`=<pool_node> | Integer | Total write latency for all IOs on Pool in usec. |

### Replica IoStat Counters

| Metric Name | Metric Type | Labels/Tags | Metric Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
|replica_num_read_ops | Gauge | `name`=<replica_uuid>, `pool_id`=<pool_uuid> `pv_name`=<pv_name>, `node`=<replica_node> | Integer | Number of read operations on replica |
|replica_bytes_read | Gauge | `name`=<replica_uuid>, `pv_name`=<pv_name>, `node`=<replica_node> | Integer | Total bytes read on the replica |
|replica_num_write_ops | Gauge | `name`=<replica_uuid>, `pv_name`=<pv_name>, `node`=<replica_node> | Integer | Number of write operations on the replica |
|replica_bytes_written | Gauge | `name`=<replica_uuid>, `pv_name`=<pv_name>, `node`=<replica_node> | Integer | Total bytes written on the Replica |
|replica_read_latency_us | Gauge | `name`=<replica_uuid>, `pv_name`=<pv_name>, `node`=<replica_node> | Integer | Total read latency for all IOs on replica in usec. |
|replica_write_latency_us | Gauge | `name`=<replica_uuid>, `pv_name`=<pv_name>, `node`=<replica_node> | Integer | Total write latency for all IOs on replica in usec. |

### Target/Volume IoStat Counters

| Metric Name | Metric Type | Labels/Tags | Metric Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
|volume_num_read_ops | Gauge | `pv_name`=<pv_name> | Integer | Number of read operations through vol target |
|volume_bytes_read | Gauge | `pv_name`=<pv_name> | Integer | Total bytes read through vol target |
|volume_num_write_ops | Gauge | `pv_name`=<pv_name> | Integer | Number of write operations through vol target |
|volume_bytes_written | Gauge | `pv_name`=<pv_name> | Integer | Total bytes written through vol target |
|volume_read_latency_us | Gauge | `pv_name`=<pv_name> | Integer | Total read latency for all IOs through vol target in usec. |
|volume_write_latency_us | Gauge | `pv_name`=<pv_name> | Integer | Total write latency for all IOs through vol target in usec. |

:::note
If you require IOPS, Latency, and Throughput in the dashboard, use the following consideration while creating dashboard json config.
:::

## R/W IOPS Calculation

`num_read_ops` and `num_write_ops` for all resources in stats response are available.

```
write_iops = num_write_ops (current poll) - num_write_ops (previous_poll) / poll period (in sec)
```

```
read_iops = num_read_ops (current poll) - num_read_ops (previous_poll) / poll period (in sec)
```

## R/W Latency Calculation

`write_latency` (sum of all IO's read_latency) and `read_latency` (sum of all IO and read_latency) are available.

```
read_latency_avg = read_latency (current poll) - read_latency (previous poll) / num_read_ops (current poll) - num_read_ops (previous_poll)
```

```
write_latency_avg = write_latency (current poll) - write_latency (previous poll) / num_write_ops (current poll) - num_write_ops (previous_poll)
```

## R/W Throughput Calculation

`bytes_read/written` (total bytes read/written for a bdev) are available.

```
read_throughput = bytes_read (current poll) - bytes_read (previous_poll) / poll period (in sec)
```

```
write_throughput = bytes_written (current poll) - bytes_written (previous_poll) / poll period (in sec)
```

### Handling Counter Reset

The performance stats are not persistent across IO engine restart, this means the counters will be reset upon IO engine restart. Users will receive lesser values for all the resources residing on that particular IO engine due to reset. So using the above logic would yield negative values. Hence, the counter current poll is less than the counter previous poll. In this case, do the following:

```
iops (r/w) = num_ops (r/w) / poll cycle
```

```
latency_avg(r/w) = latency (r/w) / num_ops
```

```
throughput (r/w) = bytes_read/written / poll_cycle (in secs)
```

[Learn more](https://kubernetes.io/docs/concepts/storage/volume-health-monitoring/)