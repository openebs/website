---
id: monitoring
title: Monitoring
keywords:
 - Monitoring
 - Pool metrics
description: This guide explains about the replicated engine pool metrics exporter.
---
# Monitoring

## Pool Metrics Exporter

The Replicated Engine pool metrics exporter runs as a sidecar container within every I/O-engine pod and exposes pool usage metrics in Prometheus format. These metrics are exposed on port 9502 using an HTTP endpoint/metrics and are refreshed every five minutes.

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

When [eventing](../additional-information/call-home.md) is activated, the stats exporter operates within the **obs-callhome-stats** container, located in the **callhome** pod. The statistics are made accessible through an HTTP endpoint at port `9090`, specifically using the `/stats` route.

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

Then, install the Prometheus monitoring stack and set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues to false. This enables Prometheus to discover custom ServiceMonitor for Replicated Engine.

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


[Learn more](https://kubernetes.io/docs/concepts/storage/volume-health-monitoring/)