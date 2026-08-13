---
id: eventing-aggregator
title: Eventing Aggregator
keywords:
 - Eventing Aggregator
 - Eventing
 - Events
 - NATS
 - JetStream
 - Loki
 - get events
description: This document explains the Eventing Aggregator, which collects Replicated PV Mayastor cluster events and makes them available for querying through the kubectl plugin.
---

# Eventing Aggregator

## Overview

Replicated PV Mayastor publishes an event every time something significant happens in the cluster, such as a volume being created, a replica changing state, or a rebuild starting. These events are published to a NATS message bus. For a full catalogue of the events that are generated, refer to the [Eventing](eventing.md) documentation.

The **Eventing Aggregator** is the component that subscribes to this event bus and turns those in-flight messages into a durable, queryable record. It runs as a single-replica Deployment in the OpenEBS namespace, consumes events from NATS JetStream, and writes each event as a single line of JSON.

The aggregator writes events to two destinations:

- **Standard output (pod logs)**: Every event is written to the aggregator's stdout. When Loki is deployed in the cluster, it scrapes these pod logs and retains them for long-term querying.
- **Ephemeral volume**: When Loki is not deployed, events are also written as NDJSON files to an `emptyDir` volume mounted at `/var/events`. This gives you a rolling, bounded window of recent events even without a logging stack.

Once events are aggregated, you can query them with the `kubectl mayastor get events` command. The plugin automatically determines where to read events from, applies the filters you specify, and renders the results as a table, JSON, or YAML. Events are also captured in the support bundle produced by `kubectl mayastor dump system`, which allows them to be analysed offline without a cluster connection.

The Eventing Aggregator is enabled by default when eventing is enabled.

:::info
The Eventing Aggregator does not replace metrics or monitoring. It provides a chronological record of discrete state changes, which is useful when reconstructing the sequence of actions that led to a particular condition. For metrics, refer to the [Monitoring](monitoring.md) documentation.
:::

## Requirements

Before using the Eventing Aggregator, ensure the following:

- Replicated PV Mayastor is installed with `eventing.enabled=true` in the Helm values. This is the default.
- NATS is deployed with JetStream enabled. This is the default. The aggregator retries JetStream setup at startup until the stream becomes ready.
- Loki is optional. When Loki is present, it collects the aggregator's pod logs and provides long-term retention. When Loki is absent, the plugin automatically falls back to reading the ephemeral volume.

## Architecture

The following describes the flow of an event from generation to query.

1. **Ingestion**: The aggregator establishes a durable pull consumer on the NATS JetStream `events-stream` and fetches raw event messages. Messages are passed over a bounded channel, which applies backpressure so that a slow disk cannot cause unbounded memory growth.
2. **Normalization**: Each message is parsed into a structured event record.
3. **Batching**: Records are accumulated in an in-memory buffer. The buffer is flushed when it reaches 100 events, or when 10 seconds have elapsed since the last flush, whichever occurs first. The time-based trigger ensures that events are not held indefinitely on a low-traffic cluster.
4. **Fan-out**: On flush, the batch is written to both sinks. Every event reaches both stdout and, when file export is active, the ephemeral volume.
5. **Acknowledgement**: JetStream acknowledgements are sent for the processed messages and the buffer is cleared. Because the consumer is durable, unacknowledged events are redelivered if the aggregator restarts.

### Log Rotation and Retention

Retention depends on the destination.

| Destination | Rotation Handled By | Retention |
| :--- | :--- | :--- |
| Standard output (pod logs) | The container runtime, such as containerd or CRI-O. | Governed by the kubelet log rotation policy on the node. |
| Loki | Not applicable. Loki writes logs into chunks in object storage. | Governed by `retention_period` in the Loki `limits_config`. Note that Loki also enforces a maximum query range, which defaults to 30 days. |
| Ephemeral volume | The aggregator's built-in rolling file writer. | A maximum of two files: `events.json`, which is active, and `events.1.json`, which is rotated. The volume is an `emptyDir` and is therefore cleared when the pod restarts. |

:::note
The ephemeral volume is intended as a short-term buffer for recent events, not as a long-term store. If you require event history that survives pod restarts, deploy Loki.
:::

## Configuration

The aggregator is configured through the Helm chart. The following values are available.

```yaml
eventing:
  enabled: true
  aggregator:
    enabled: true
    logLevel: "info"
    dirSizeLimit: "100Mi"
    resources:
      limits:
        cpu: "100m"
        memory: "32Mi"
      requests:
        cpu: "50m"
        memory: "16Mi"
    tolerations: []
    nodeSelector: {}
    priorityClassName: ""
```

The table below describes each value.

| Value | Description | Default |
| :--- | :--- | :--- |
| `eventing.enabled` | Enables event generation across the cluster and deploys NATS. When set to `false`, no events are produced and the aggregator is not deployed. | `true` |
| `eventing.aggregator.enabled` | Deploys the Eventing Aggregator. Requires `eventing.enabled=true`. | `true` |
| `eventing.aggregator.logLevel` | Log verbosity of the aggregator container. | `info` |
| `eventing.aggregator.dirSizeLimit` | Maximum combined size of the event files on the ephemeral volume. Applies only when events are written to disk. Each of the two file slots receives 40 percent of this limit, which allows the active and rotated files to coexist within the bound. | `100Mi` |
| `eventing.aggregator.resources` | CPU and memory requests and limits for the aggregator container. | See the values above. |
| `eventing.aggregator.tolerations` | Tolerations applied to the aggregator pod. | `[]` |
| `eventing.aggregator.nodeSelector` | Node selector applied to the aggregator pod. | `{}` |
| `eventing.aggregator.priorityClassName` | Priority class assigned to the aggregator pod. | `""` |

### Disable the Eventing Aggregator

To deploy eventing without the aggregator, add the following flag to the `helm install` or `helm upgrade` command. Events continue to be published to NATS and remain available to other consumers, such as call-home, but they are not aggregated or queryable through the plugin.

```
--set eventing.aggregator.enabled=false
```

To disable event generation entirely, refer to the [Call-Home Metrics](call-home.md) documentation.

### Increase the On-Disk Event Buffer

If your cluster generates a high volume of events and Loki is not deployed, you can increase the size of the ephemeral event buffer to retain a longer window of history.

```
--set eventing.aggregator.dirSizeLimit=500Mi
```

## Verify the Deployment

To confirm that the aggregator is running, execute the following command.

**Command**

```
kubectl get pods -n openebs -l app=eventing-aggregator
```

**Sample Output**

```
NAME                                           READY   STATUS    RESTARTS   AGE
openebs-eventing-aggregator-7c9f4b6d8c-x2mkq   1/1     Running   0          11m
```

The aggregator pod includes an init container that waits for NATS to become reachable before the main container starts. If the pod remains in the `Init` state, verify that the NATS pods are running.

## Query Events

Use the `kubectl mayastor get events` command to retrieve aggregated events.

**Command**

```
kubectl mayastor get events
```

**Sample Output**

```
TIMESTAMP             CATEGORY  ACTION         TARGET                                NODE      COMPONENT
2026-08-12T09:14:02Z  volume    create         18e30e83-b106-4e0d-9fb6-2b04e761e18a  worker-1  CoreAgent
2026-08-12T09:14:03Z  replica   create         c0f9a1d2-77b3-4a51-9e0c-1b2a3c4d5e6f  worker-2  IoEngine
2026-08-12T09:18:47Z  nexus     rebuild_begin  18e30e83-b106-4e0d-9fb6-2b04e761e18a  worker-1  IoEngine
2026-08-12T09:19:11Z  nexus     rebuild_end    18e30e83-b106-4e0d-9fb6-2b04e761e18a  worker-1  IoEngine
```

By default, the command returns events from the last 24 hours, up to a maximum of 1000 records.

### Event Source Selection

The plugin resolves its data source automatically, in the following order of precedence:

1. If `--from-file` is specified, events are read from the given local file and no cluster connection is made.
2. If `--nats-endpoint` is specified, events are read directly from NATS JetStream.
3. If `--loki-endpoint` is specified, events are read from that Loki instance. If the specified endpoint is unreachable, the command fails immediately rather than falling back, because an explicit endpoint indicates that you expect Loki to be used.
4. If no source flag is specified, the plugin attempts to discover Loki through its Kubernetes service. If Loki is found, it is used. If Loki is not found, the plugin locates the running aggregator pod and reads the event files from the ephemeral volume.

### Command Options

| Flag | Description | Default |
| :--- | :--- | :--- |
| `-o`, `--output <format>` | Output format. Accepts `table`, `json`, or `yaml`. The JSON and YAML formats include the complete typed event payload, whereas the table format shows a summary. | `table` |
| `--since <duration>` | Returns events from the last specified duration, for example `1h`, `30m`, or `7d`. | `24h` |
| `--limit <N>` | Maximum number of events to return. A value of `0` means unlimited. The limit is applied after all filters, and a notice is displayed when the output is truncated. | `1000` |
| `--category` | Filters by event category, such as `volume` or `pool`. | — |
| `--action` | Filters by event action, such as `create` or `state_change`. | — |
| `--component` | Filters by the component that produced the event. | — |
| `--node <name>` | Filters by node name. This is an exact match. | — |
| `--target <id>` | Filters by target resource ID. This accepts an exact or substring match. | — |
| `--pool <name>` | Filters by pool name. This accepts an exact or substring match. | — |
| `--volume <UUID>` | Filters events that touch the specified volume, matching against the target, snapshot, and volume ID fields. The value must be a valid UUID. | — |
| `--replica <UUID>` | Filters events by replica UUID. The value must be a valid UUID. | — |
| `--rebuild-status` | Filters rebuild events by outcome. | — |
| `--state <string>` | Filters state-change events. This is a case-insensitive substring match against the previous and next state. | — |
| `--filter <path=value>` | Filters on an arbitrary field within the event payload, using a dot-separated path. Refer to [Filter on Arbitrary Fields](#filter-on-arbitrary-fields). | — |
| `--from-file <path>` | Reads events from a local NDJSON file instead of querying the cluster. No cluster connection is required. | — |
| `--loki-endpoint <URL>` | Overrides the Loki base URL instead of discovering it automatically. | Auto-discovered |
| `--nats-endpoint [URL]` | Reads events directly from NATS JetStream, bypassing both Loki and the aggregator volume. Pass the flag without a value to discover the NATS service automatically, or supply a URL such as `nats://host:4222`. | — |
| `--tenant-id <ID>` | The Loki `X-Scope-OrgID` header. This is required when Loki runs with authentication enabled. | `openebs` |

:::note
The `--category`, `--action`, `--component`, and `--rebuild-status` flags can be repeated or supplied as a comma-separated list. Both forms are equivalent, so `--category volume,pool` and `--category volume --category pool` produce the same result. An invalid value produces a parse error that lists all accepted values.
:::

### Filtering Examples

The following examples show common filtering patterns.

To retrieve all events for a specific volume:

```
kubectl mayastor get events --volume 18e30e83-b106-4e0d-9fb6-2b04e761e18a
```

To retrieve nexus activity from the last six hours:

```
kubectl mayastor get events --category nexus --since 6h
```

To retrieve pool events from a specific node in JSON format:

```
kubectl mayastor get events --category pool --node worker-1 -o json
```

Filters are combined using AND logic. The following command returns only the events that satisfy every condition:

```
kubectl mayastor get events --category volume --action create --since 1h --limit 50
```

### Filter on Arbitrary Fields

The `--filter` flag matches on any field within the event payload, using a dot-separated path relative to the payload root. Leading and trailing `*` wildcards are supported. When the flag is repeated, all conditions must match.

To filter on a nested payload field:

```
kubectl mayastor get events --filter metadata.source.component=IoEngine
```

To filter using a wildcard:

```
kubectl mayastor get events --filter target=979dc3e5*
```

:::note
Events in which the specified path is absent are excluded from the results. If a filter returns no records, the plugin reports the number of events that were retrieved before filtering, which helps distinguish an empty dataset from an overly specific filter.
:::

## Collect Events in a Support Bundle

Events are included automatically in the support bundle generated by the `dump system` command. For general information about the supportability tool, refer to the [Supportability](../../../supportability.md) documentation.

**Command**

```
kubectl mayastor dump system -n openebs -d <output_directory_path>
```

The archive includes the following files:

| File | Description |
| :--- | :--- |
| `mayastor/events.ndjson` | The collected events, one JSON object per line. |
| `mayastor/events-source.txt` | Records the source from which the events were collected, either `loki` or the name of the aggregator pod. |

As with event queries, the dump command prefers Loki when it is available and falls back to reading the aggregator's ephemeral volume when it is not.

### Analyse Events Offline

Because the events are stored as NDJSON, the extracted file can be queried with the same filters used against a live cluster. This is useful when reviewing a support bundle from a cluster you cannot reach.

```
kubectl mayastor get events --from-file ./events.ndjson --component io-engine
```

All filtering, limit, and output format options behave identically in this mode.

## Troubleshooting

For issues relating to the Eventing Aggregator and the `get events` command, including an aggregator pod that does not start, queries that return no events, and missing event history, refer to the [Eventing Issues](../../../../troubleshooting/troubleshooting-replicated-storage.md#eventing-issues) section of the Replicated Storage troubleshooting documentation.

## See Also

- [Eventing](eventing.md)
- [Kubectl Plugin](kubectl-plugin.md)
- [Supportability](../../../supportability.md)
- [Monitoring](monitoring.md)
- [Troubleshooting - Replicated Storage](../../../../troubleshooting/troubleshooting-replicated-storage.md#eventing-issues)
