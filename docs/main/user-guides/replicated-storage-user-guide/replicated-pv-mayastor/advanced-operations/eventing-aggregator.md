---
id: eventing-aggregator
title: Eventing Aggregator
keywords:
 - Eventing Aggregator
 - Eventing
 - Events
 - NATS
 - Loki
 - get events
description: This document explains how to collect and query Replicated PV Mayastor cluster events using the Eventing Aggregator.
---

# Eventing Aggregator

## Overview

Replicated PV Mayastor generates an event whenever something significant happens in the cluster, such as a volume being created or a rebuild starting. For the full list of events, refer to the [Eventing](eventing.md) documentation.

The Eventing Aggregator collects these events and makes them available to query using the `kubectl mayastor get events` command. It runs as a single Deployment in the OpenEBS namespace and is enabled by default.

Events are written to the aggregator's pod logs, which Loki collects when it is deployed. If Loki is not deployed, events are written to a volume on the aggregator pod instead, and the plugin reads them from there. Querying works the same way in both cases.

Events are also included in the support bundle produced by `kubectl mayastor dump system`.

## Requirements

- Replicated PV Mayastor is installed with `eventing.enabled=true`. This is the default.
- NATS is deployed with JetStream enabled. This is the default.
- Loki is optional. Without it, only recent events are available.

## Event Retention

A new event can take up to 10 seconds to appear in query results. Events are not lost if the aggregator restarts.

How long events remain available depends on where they are stored.

| Storage | Retention Controlled By | Notes |
| :--- | :--- | :--- |
| Loki | `retention_period` in the Loki `limits_config`. | Loki also limits queries to 30 days by default. |
| Pod logs | The kubelet log rotation policy on the node. | — |
| Aggregator volume | `eventing.aggregator.dirSizeLimit`. | Cleared when the aggregator pod restarts. |

:::note
For event history that survives pod restarts, deploy Loki.
:::

## Configuration

The aggregator is configured through the Helm chart.

```yaml
eventing:
  enabled: true
  aggregator:
    enabled: true
    logLevel: "info"
    dirSizeLimit: "100Mi"
```

| Value | Description | Default |
| :--- | :--- | :--- |
| `eventing.enabled` | Enables event generation. When set to `false`, no events are produced. | `true` |
| `eventing.aggregator.enabled` | Deploys the Eventing Aggregator. | `true` |
| `eventing.aggregator.logLevel` | Log verbosity of the aggregator container. | `info` |
| `eventing.aggregator.dirSizeLimit` | Size limit for events stored on the aggregator volume. | `100Mi` |

The aggregator also accepts the standard `resources`, `tolerations`, `nodeSelector`, and `priorityClassName` values.

### Disable the Aggregator

To stop collecting events while leaving eventing enabled, add the following flag to the `helm install` or `helm upgrade` command.

```
--set eventing.aggregator.enabled=false
```

### Retain More Events on Disk

If Loki is not deployed and you want a longer window of event history, increase the size limit.

```
--set eventing.aggregator.dirSizeLimit=500Mi
```

## Verify the Deployment

**Command**

```
kubectl get pods -n openebs -l app=eventing-aggregator
```

**Sample Output**

```
NAME                                           READY   STATUS    RESTARTS   AGE
openebs-eventing-aggregator-7c9f4b6d8c-x2mkq   1/1     Running   0          11m
```

## Query Events

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
```

By default, the command returns events from the last 24 hours, up to a maximum of 1000 records.

The plugin finds its own source: Loki if it is deployed, otherwise the aggregator pod. Use `--loki-endpoint`, `--nats-endpoint`, or `--from-file` to select a source explicitly.

### Filters

| Flag | Description |
| :--- | :--- |
| `--category` | Event category, such as `volume` or `pool`. |
| `--action` | Event action, such as `create` or `state_change`. |
| `--component` | Component that produced the event. |
| `--node` | Node name. |
| `--target` | Target resource ID. |
| `--pool` | Pool name. |
| `--volume` | Volume UUID. |
| `--replica` | Replica UUID. |
| `--rebuild-status` | Rebuild outcome. |
| `--state` | Previous or next state of a state-change event. |
| `--filter <path=value>` | Any field in the event payload, using a dot path such as `metadata.source.component=IoEngine`. Supports `*` wildcards. |

Filters are combined using AND logic. The `--category`, `--action`, `--component`, and `--rebuild-status` flags accept comma-separated or repeated values.

### Other Options

| Flag | Description | Default |
| :--- | :--- | :--- |
| `-o`, `--output <format>` | Output format: `table`, `json`, or `yaml`. JSON and YAML include the full event payload. | `table` |
| `--since <duration>` | Events from the last duration, such as `1h` or `7d`. | `24h` |
| `--limit <N>` | Maximum number of events to return. `0` means unlimited. | `1000` |
| `--loki-endpoint <URL>` | Read from a specific Loki instance instead of discovering one. | Auto-discovered |
| `--nats-endpoint [URL]` | Read directly from NATS. Omit the value to discover the service automatically. | — |
| `--from-file <path>` | Read from a local NDJSON file instead of the cluster. | — |
| `--tenant-id <ID>` | Loki `X-Scope-OrgID` header. Required when Loki runs with authentication enabled. | `openebs` |

### Examples

To retrieve all events for a specific volume:

```
kubectl mayastor get events --volume 18e30e83-b106-4e0d-9fb6-2b04e761e18a
```

To retrieve nexus events from the last six hours:

```
kubectl mayastor get events --category nexus --since 6h
```

To retrieve pool events from a specific node in JSON format:

```
kubectl mayastor get events --category pool --node worker-1 -o json
```

## Collect Events in a Support Bundle

**Command**

```
kubectl mayastor dump system -n openebs -d <output_directory_path>
```

The archive includes `mayastor/events.ndjson`, containing the collected events, and `mayastor/events-source.txt`, which records where they were collected from. For more information about the supportability tool, refer to the [Supportability](../../../supportability.md) documentation.

### Analyse Events Offline

The extracted events file can be queried with the same filters used against a live cluster, without a cluster connection.

```
kubectl mayastor get events --from-file ./events.ndjson --component io-engine
```

## Troubleshooting

Refer to the [Eventing Issues](../../../../troubleshooting/troubleshooting-replicated-storage.md#eventing-issues) section of the Replicated Storage troubleshooting documentation.

## See Also

- [Eventing](eventing.md)
- [Kubectl Plugin](kubectl-plugin.md)
- [Supportability](../../../supportability.md)
- [Monitoring](monitoring.md)
- [Troubleshooting - Replicated Storage](../../../../troubleshooting/troubleshooting-replicated-storage.md#eventing-issues)
