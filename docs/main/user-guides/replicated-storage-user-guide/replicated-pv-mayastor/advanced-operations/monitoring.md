---
id: monitoring
title: Monitoring
keywords:
 - Monitoring
 - Pool metrics
 - Node metrics
 - Replica metrics
 - Volume metrics
 - Replicated PV Mayastor Stats
description: This guide explains about the IO engine metrics exporter and obs-callhome stats exporter.
---
# Mayastor metrics reference

Replicated PV Mayastor exposes metrics from two different sources: the metrics exporter sidecar in the I/O-engine pod, and the call-home stats container in the call-home pod.

## Source: I/O-engine pod — metrics exporter container

Exposed at port `9502`, path `/metrics`.

The metrics below — grouped by resource: diskpools, nodes, replicas, and volumes — come from this exporter. Each is a live Prometheus gauge, polled inline with the Prometheus client's scrape cycle rather than cached.

## Diskpool metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `diskpool_alert_attention_reason` | gauge | `name`, `node`, plus reason labels (`io_error`, `io_error_exc`, `io_stall_intermittent`, `io_stall_intermittent_exc`, `io_stalled`, `unknown`) | Collection of reasons contributing to an attention-level alert |
| `diskpool_alert_critical_reason` | gauge | same reason labels as above | Collection of reasons contributing to a critical alert |
| `diskpool_alert_notice_reason` | gauge | same reason labels as above | Collection of reasons contributing to a notice alert |
| `diskpool_alert_warning_reason` | gauge | same reason labels as above | Collection of reasons contributing to a warning alert |
| `diskpool_bytes_read` | gauge | `name=<pool_id>`, `node=<pool_node>` | Total bytes read on the pool |
| `diskpool_bytes_written` | gauge | `name=<pool_id>`, `node=<pool_node>` | Total bytes written on the pool |
| `diskpool_committed_size_bytes` | gauge | `name`, `node` | Committed size of the pool, in bytes |
| `diskpool_disk_capacity_bytes` | gauge | `name`, `node` | Capacity of the pool's underlying device |
| `diskpool_io_alert_status` | gauge | `name`, `node` | DiskPool alert status |
| `diskpool_io_error_count` | gauge | `name`, `node` | Count of I/O errors for the pool |
| `diskpool_io_error_threshold` | gauge | `name`, `node` | Threshold for I/O errors in the pool |
| `diskpool_io_stall_transition_count` | gauge | `name`, `node` | Count of I/O stall transitions in the pool |
| `diskpool_io_stall_transition_threshold` | gauge | `name`, `node` | Threshold for I/O stall transitions in the pool |
| `diskpool_io_stalled` | gauge | `name`, `node` | Stalled I/O operations in the pool |
| `diskpool_max_expandable_size` | gauge | `name`, `node` | Maximum capacity to which this pool can be expanded, in bytes |
| `diskpool_num_read_ops` | gauge | `name=<pool_id>`, `node=<pool_node>` | Number of read operations on the pool |
| `diskpool_num_write_ops` | gauge | `name=<pool_id>`, `node=<pool_node>` | Number of write operations on the pool |
| `diskpool_read_latency_us` | gauge | `name=<pool_id>`, `node=<pool_node>` | Total read latency for all IOs on the pool, in microseconds |
| `diskpool_status` | gauge | `name`, `node` | Status of the pool: `0` = Unknown, `1` = Online, `2` = Degraded, `3` = Faulted, `4` = Suspected |
| `diskpool_total_size_bytes` | gauge | `name`, `node` | Total size of the pool, in bytes |
| `diskpool_used_size_bytes` | gauge | `name`, `node` | Used size of the pool, in bytes |
| `diskpool_write_latency_us` | gauge | `name=<pool_id>`, `node=<pool_node>` | Total write latency for all IOs on the pool, in microseconds |

> The alert-reason metrics aren't separate counters per reason — each is a single metric where the reason labels (`io_error`, `io_stalled`, etc.) indicate which condition is contributing to that alert level.

## Node metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `mayastor_node_cordoned` | gauge | `node_id` | Indicates if the Mayastor node is cordoned |
| `mayastor_node_draining` | gauge | `node_id` | Indicates if the Mayastor node is draining |
| `mayastor_node_online` | gauge | `node_id` | Indicates if the Mayastor node is online |

## Replica metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
 | `replica_bytes_read` | gauge | `name=<replica_uuid>`, `node=<replica_node>`, `pool_name=<pool_name>`, `pool_uuid=<pool_uuid>`, `pv_name=<pv_name>` | Total bytes read on the replica |
 | `replica_bytes_written` | gauge | `name=<replica_uuid>`, `node=<replica_node>`, `pool_name=<pool_name>`, `pool_uuid=<pool_uuid>`, `pv_name=<pv_name>` | Total bytes written on the replica |
 | `replica_num_read_ops` | gauge | `name=<replica_uuid>`, `node=<replica_node>`, `pool_name=<pool_name>`, `pool_uuid=<pool_uuid>`, `pv_name=<pv_name>` | Number of read operations on the replica |
 | `replica_num_write_ops` | gauge | `name=<replica_uuid>`, `node=<replica_node>`, `pool_name=<pool_name>`, `pool_uuid=<pool_uuid>`, `pv_name=<pv_name>` | Number of write operations on the replica |
 | `replica_read_latency_us` | gauge | `name=<replica_uuid>`, `node=<replica_node>`, `pool_name=<pool_name>`, `pool_uuid=<pool_uuid>`, `pv_name=<pv_name>` | Total read latency for all IOs on the replica, in microseconds |
 | `replica_write_latency_us` | gauge | `name=<replica_uuid>`, `node=<replica_node>`, `pool_name=<pool_name>`, `pool_uuid=<pool_uuid>`, `pv_name=<pv_name>` | Total write latency for all IOs on the replica, in microseconds |

## Volume metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `volume_bytes_read` | gauge | `node=<target_node>`, `pv_name=<pv_name>` | Total bytes read through the volume target |
| `volume_bytes_written` | gauge | `node=<target_node>`, `pv_name=<pv_name>` | Total bytes written through the volume target |
| `volume_num_read_ops` | gauge | `node=<target_node>`, `pv_name=<pv_name>` | Number of read operations through the volume target |
| `volume_num_write_ops` | gauge | `node=<target_node>`, `pv_name=<pv_name>` | Number of write operations through the volume target |
| `volume_read_latency_us` | gauge | `node=<target_node>`, `pv_name=<pv_name>` | Total read latency for all IOs through the volume target, in microseconds |
| `volume_write_latency_us` | gauge | `node=<target_node>`, `pv_name=<pv_name>` | Total write latency for all IOs through the volume target, in microseconds |

## Deriving IOPS, latency, and throughput

The metrics above are raw, cumulative per-resource totals (typically monotonically increasing values). To get IOPS, average latency, or throughput for a dashboard, compute them across two successive polls of the *same* resource (pool, replica, or volume):

**R/W IOPS**

```
write_iops = (num_write_ops_current - num_write_ops_previous) / poll_period_sec
read_iops  = (num_read_ops_current  - num_read_ops_previous)  / poll_period_sec
```

**R/W latency**

```
read_latency_avg  = (read_latency_current  - read_latency_previous)  / (num_read_ops_current  - num_read_ops_previous)
write_latency_avg = (write_latency_current - write_latency_previous) / (num_write_ops_current - num_write_ops_previous)
```
> If `num_*_ops_current == num_*_ops_previous` (no I/O between polls), the average latency can’t be computed; treat it as 0/NaN in dashboards.
**R/W throughput**

```
read_throughput  = (bytes_read_current    - bytes_read_previous)    / poll_period_sec
write_throughput = (bytes_written_current - bytes_written_previous) / poll_period_sec
```

**Handling counter resets**

These counters are not persistent across I/O engine restarts — they reset to zero when the engine restarts. If the current-poll value is lower than the previous-poll value, the formulas above will go negative. In that case, fall back to:

```
iops (r/w)        = num_ops (r/w) / poll_period_sec
latency_avg (r/w) = latency_sum (r/w) / num_ops (r/w)
throughput (r/w)  = bytes_read/written / poll_period_sec
```

### Sample scrape

```
# HELP diskpool_alert_attention_reason Collection of reason for attention alert
# TYPE diskpool_alert_attention_reason gauge
diskpool_alert_attention_reason{io_error="0",io_error_exc="0",io_stall_intermittent="0",io_stall_intermittent_exc="0",io_stalled="0",name="pool-on-node-2-477115",node="node-2-477115",unknown="0"} 0
# HELP diskpool_bytes_read Total bytes read on the pool
# TYPE diskpool_bytes_read gauge
diskpool_bytes_read{name="pool-on-node-2-477115",node="node-2-477115"} 3198976
# HELP diskpool_bytes_written Total bytes written on the pool
# TYPE diskpool_bytes_written gauge
diskpool_bytes_written{name="pool-on-node-2-477115",node="node-2-477115"} 0
# HELP diskpool_committed_size_bytes Committed size of the pool in bytes
# TYPE diskpool_committed_size_bytes gauge
diskpool_committed_size_bytes{name="pool-on-node-2-477115",node="node-2-477115"} 1073741824
# HELP diskpool_disk_capacity_bytes Capacity of the Pool's underlying device
# TYPE diskpool_disk_capacity_bytes gauge
diskpool_disk_capacity_bytes{name="pool-on-node-2-477115",node="node-2-477115"} 10737418240
# HELP diskpool_status Status of the pool
# TYPE diskpool_status gauge
diskpool_status{name="pool-on-node-2-477115",node="node-2-477115"} 1
# HELP diskpool_total_size_bytes Total size of the pool in bytes
# TYPE diskpool_total_size_bytes gauge
diskpool_total_size_bytes{name="pool-on-node-2-477115",node="node-2-477115"} 10724835328
# HELP diskpool_used_size_bytes Used size of the pool in bytes
# TYPE diskpool_used_size_bytes gauge
diskpool_used_size_bytes{name="pool-on-node-2-477115",node="node-2-477115"} 1073741824
# HELP mayastor_node_online Indicates if Mayastor node is online
# TYPE mayastor_node_online gauge
mayastor_node_online{node_id="node-2-477115"} 1
# HELP replica_bytes_read Total bytes read on the replica
# TYPE replica_bytes_read gauge
replica_bytes_read{name="77c600a8-6709-4779-9a8f-7e86b8cf005e",node="node-2-477115",pool_name="",pool_uuid="",pv_name="pvc-86e8ccf8-3fcd-4d5a-847c-60016f722403"} 3145728
# HELP replica_num_read_ops Number of read operations on the replica
# TYPE replica_num_read_ops gauge
replica_num_read_ops{name="77c600a8-6709-4779-9a8f-7e86b8cf005e",node="node-2-477115",pool_name="",pool_uuid="",pv_name="pvc-86e8ccf8-3fcd-4d5a-847c-60016f722403"} 24
# HELP volume_bytes_read Total bytes read from the volume
# TYPE volume_bytes_read gauge
volume_bytes_read{node="node-2-477115",pv_name="pvc-86e8ccf8-3fcd-4d5a-847c-60016f722403"} 9437184
# HELP volume_num_read_ops Number of read operations on the volume
# TYPE volume_num_read_ops gauge
volume_num_read_ops{node="node-2-477115",pv_name="pvc-86e8ccf8-3fcd-4d5a-847c-60016f722403"} 72
# HELP volume_read_latency_us Total read latency on the volume in usec
# TYPE volume_read_latency_us gauge
volume_read_latency_us{node="node-2-477115",pv_name="pvc-86e8ccf8-3fcd-4d5a-847c-60016f722403"} 149780
```

> Truncated for brevity — every metric in the disk pool, node, replica, and volume tables above follows this same `# HELP` / `# TYPE` / sample-line pattern on a live scrape.

## Source: call-home pod — obs-callhome-stats container

Exposed at port `9090`, path `/stats`. These are cumulative event counters (lifecycle actions), distinct from the per-resource I/O metrics above.

| Metric | Type | Labels | Description |
|---|---|---|---|
| `nexus` | counter | `action="created"` | Total nexus creation events |
| `nexus` | counter | `action="deleted"` | Total nexus deletion events |
| `nexus` | counter | `action="rebuild_started"` | Total nexus rebuild-started events |
| `nexus` | counter | `action="rebuild_ended"` | Total nexus rebuild-ended events |
| `pool` | counter | `action="created"` | Total pool creation events |
| `pool` | counter | `action="deleted"` | Total pool deletion events |
| `volume` | counter | `action="created"` | Total volume creation events |
| `volume` | counter | `action="deleted"` | Total volume deletion events |

> `nexus`, `pool`, and `volume` are each a single counter metric — the different lifecycle events are distinguished by the `action` label rather than being separate metric names.

### Sample scrape

```
# HELP nexus Nexus stats
# TYPE nexus counter
nexus{action="created"} 6
nexus{action="deleted"} 4
nexus{action="rebuild_ended"} 7
nexus{action="rebuild_started"} 7
# HELP pool Pool stats
# TYPE pool counter
pool{action="created"} 6
pool{action="deleted"} 0
# HELP volume Volume stats
# TYPE volume counter
volume{action="created"} 2
volume{action="deleted"} 0
```

## Preconfigured monitoring stack

If you'd rather not wire up Prometheus, Grafana, and Alertmanager from scratch, OpenEBS maintains a monitoring Helm chart with sample dashboards and alert rules built on top of these metrics:

[github.com/openebs/monitoring](https://github.com/openebs/monitoring)

## Notes

- All four resource groups (diskpool, node, replica, volume) are scoped by labels — always filter/group by the relevant label (`node`, `name`, `pv_name`, etc.) rather than reading a metric as a global value.
- The I/O-engine metrics (port 9502) and the call-home stats (port 9090) are separate exporters on separate ports/paths — don't assume both live in the same scrape target.

[Learn more](https://kubernetes.io/docs/concepts/storage/volume-health-monitoring/)
