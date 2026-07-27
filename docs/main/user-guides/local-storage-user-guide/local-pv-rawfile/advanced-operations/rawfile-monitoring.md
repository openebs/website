---
id: rawfile-monitoring
title: Monitoring
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile
 - Advanced Operations
 - Monitoring
 - Prometheus
 - Metrics
description: This document describes the Prometheus metrics exposed by Local PV Rawfile and how to configure scraping.
---

Local PV Rawfile exposes Prometheus metrics from the node plugin on each node. Metrics are organized at three levels: node, pool, and volume.

## Enable Metrics

Metrics are enabled by default. To disable them:

```yaml
metrics:
  enabled: false
```

Metrics are exposed on port **9100** (configurable).

## Configure Prometheus Scraping

### Prometheus Operator (ServiceMonitor)

Enable the ServiceMonitor for automatic scraping:

```yaml
metrics:
  serviceMonitor:
    enabled: true
    interval: 1m
```

Apply:

```bash
helm upgrade rawfile-localpv rawfile-localpv/rawfile-localpv -n openebs \
  --set metrics.serviceMonitor.enabled=true
```

### Manual Scraping

Add a scrape job to your Prometheus configuration:

```yaml
scrape_configs:
  - job_name: rawfile-localpv
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: [openebs]
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: rawfile-localpv-node
        action: keep
      - source_labels: [__address__]
        target_label: __address__
        replacement: $1:9100
```

## Metrics Reference

### Node-Level Metrics

| Metric | Labels | Description |
|---|---|---|
| `rawfile_remaining_capacity_bytes` | `node` | Free capacity for new volumes on this node, excluding reserved storage |

### Pool-Level Metrics

| Metric | Labels | Description |
|---|---|---|
| `rawfile_pool_capacity_bytes` | `node`, `pool` | Maximum usable capacity of the pool |
| `rawfile_pool_remaining_capacity_bytes` | `node`, `pool` | Remaining free capacity in the pool |
| `rawfile_pool_reserved_capacity_bytes` | `node`, `pool` | Capacity reserved for non-pool use |
| `rawfile_pool_backing_fs_capacity_bytes` | `node`, `pool` | Total capacity of the backing filesystem |
| `rawfile_pool_backing_fs_available_bytes` | `node`, `pool` | Available bytes on the backing filesystem |
| `rawfile_pool_backing_fs_usage_bytes` | `node`, `pool` | Used bytes on the backing filesystem |
| `rawfile_pool_volumes_physical_bytes` | `node`, `pool` | Physical disk bytes consumed by all volumes in the pool |
| `rawfile_pool_volumes_logical_bytes` | `node`, `pool` | Logical (provisioned) bytes of all volumes in the pool |
| `rawfile_pool_volume_count` | `node`, `pool` | Number of volumes in the pool |
| `rawfile_pool_info` | `node`, `pool`, `mode`, `default_pool` | Pool metadata (labels only, value always 1) |

### Volume-Level Metrics

| Metric | Labels | Description |
|---|---|---|
| `rawfile_volume_used_bytes` | `node`, `volume` | Bytes currently used inside the volume |
| `rawfile_volume_total_bytes` | `node`, `volume` | Total provisioned size of the volume |
| `rawfile_volume_physical_bytes` | `node`, `volume` | Physical disk bytes consumed by the volume (may differ from logical for thin or CoW volumes) |
| `rawfile_volume_info` | `node`, `volume`, `pool`, `sparse`, `thin_provision` | Volume metadata (labels only, value always 1) |

## Example PromQL Queries

**Alert when a volume is more than 90% full:**

```promql
rawfile_volume_used_bytes / rawfile_volume_total_bytes > 0.9
```

**Alert when a pool has less than 10 GiB free:**

```promql
rawfile_pool_remaining_capacity_bytes < 10 * 1024^3
```

**Thin-provisioning overcommit ratio per pool:**

```promql
rawfile_pool_volumes_logical_bytes / rawfile_pool_capacity_bytes
```

**Physical vs. logical usage per pool (CoW space savings):**

```promql
1 - (rawfile_pool_volumes_physical_bytes / rawfile_pool_volumes_logical_bytes)
```

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/rawfile-localpv/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Storage Pools](rawfile-storage-pools.md)
- [Volume Resize](rawfile-resize.md)
- [Thin Provisioning](rawfile-thin-provisioning.md)
