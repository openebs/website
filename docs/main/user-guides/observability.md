---
id: observability
title: Observability
keywords:
 - Monitoring
 - Observability
 - Pool metrics
 - Prometheus
 - Grafana
description: This guide explains about monitoring your cluster.
---
# Observability

Monitoring your cluster is essential to ensure the health, efficiency, and reliability of your storage infrastructure.​ The following technologies are implemented to monitor your cluster:

- Prometheus to collect data
- Grafana to visualize your data

Prometheus and Grafana, together provide a robust solution for collecting metrics, visualizing data, and creating alerts.

## Monitoring Setup

OpenEBS provides a basic cloud-native monitoring stack built using Prometheus and Grafana, as an add-on Helm chart. This has pre-configured dashboards for visualization of metrics from the various OpenEBS storages.

:::info
A set of Grafana dashboards for monitoring and visualization of exported metrics via various OpenEBS storage are bundled with OpenEBS installation which is by default **disabled**. Grafana will be using Prometheus as a data source.
:::

### Setup the Monitoring Helm Repository

Setup the Monitoring Helm Repository by using the following command:

```
helm repo add monitoring https://openebs.github.io/monitoring/
helm repo update
```

### Install the Helm Chart

Install the Helm Chart by using the following command:

```
helm install monitoring monitoring/monitoring --namespace openebs --create-namespace
```

With this installation, Prometheus and Grafana pods will be deployed.

### Accessing Grafana Dashboard

1. You can view the Grafana Pod by using the following command:

```
kubectl get pods -n [NAMESPACE] | grep -i grafana
```

2. You can access the Grafana dashboard using the NodeIP (Public IP) and NodePort (Grafana service port) of your Kubernetes cluster.

```
kubectl get nodes -o wide
```

```
kubectl get svc -n [NAMESPACE] | grep -i grafana
```

3. Visit http://NodeIp:NodePort. For example, if your Node IP address is `node-ip` and the `NodePort` assigned is 12345, you would access Grafana using http://node-ip:12345.

The default Grafana login credentials are:

- username: admin
- password: admin

:::note
If public IP is not available, then you can access it via port-forwarding by using the following command and then visit http://127.0.0.1:[grafana-forward-port].

```
kubectl port-forward --namespace [NAMESPACE] pods/[grafana-pod-name] [grafrana-foward-port]:[grafana-cluster-port]
```
:::

### Pre-Configured Dashboards

After accessing Grafana in the default directory, you can view the following pre-configured dashboards for various OpenEBS storages:

#### Replicated PV Mayastor Dashboard

<table>
<tbody>
  <tr>
    <th> DashBoard </th>
    <th> Panel </th>
  </tr>
  <tr>
    <td rowSpan={7}> DiskPool Information </td>
    <td> <a href="#pool-status"> Pool Status </a></td>
  </tr>
  <tr>
    <td> <a href="#total-pool-size"> Total Pool Size </a></td>
  </tr>
  <tr>
    <td> <a href="#used-pool-size"> Used Pool Size </a></td>
  </tr>
  <tr>
    <td> <a href="#available-pool-size"> Available Pool Size </a></td>
  </tr>
  <tr>
    <td> <a href="#diskpool-iops"> DiskPool IOPS (Read/Write) </a></td>
  </tr>
  <tr>
    <td> <a href="#diskpool-throughput"> DiskPool Throughput (Read/Write) </a></td>
  </tr>
  <tr>
    <td> <a href="#diskpool-latency"> DiskPool Latency (Read/Write) </a></td>
  </tr>
  <tr>
    <td rowSpan={3}> Volume Replica Information </td>
    <td> <a href="#volume-replica-iops"> Volume Replica IOPS (Read/Write) </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-replica-throughput"> Volume Replica Throughput (Read/Write) </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-replica-latency"> Volume Replica Latency (Read/Write) </a></td>
  </tr>
  <tr>
    <td rowSpan={3}> Volume Information </td>
    <td> <a href="#volume-iops"> Volume IOPS (Read/Write) </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-throughput"> Volume Throughput (Read/Write) </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-latency"> Volume Latency (Read/Write) </a></td>
  </tr>
</tbody>
</table>

#### Local PV LVM Dashboard

<table>
<tbody>
  <tr>
    <th> DashBoard </th>
    <th> Panel </th>
  </tr>
  <tr>
    <td rowSpan={9}> Volume Group Stats </td>
    <td> <a href="#volume-group-capacity"> Volume Group Capacity </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-metadata-capacity"> Volume Group Metadata Capacity </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-permission"> Volume Group Permission </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-allocation-policy"> Volume Group Allocation Policy </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-volumes-count"> Volume Group Volumes Count </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-pv-count"> Volume Group PV Count </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-metadata-count"> Volume Group Metadata Count </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-snapshot-count"> Volume Group Snapshot Count </a></td>
  </tr>
  <tr>
    <td> <a href="#volume-group-volumes"> Volume Group Volumes </a></td>
  </tr>
  <tr>
    <td rowSpan={4}> Volume Group Performance Stats </td>
    <td> <a href="#volume-group-io-read"> Volume Group I/O Read </a></td>
  </tr>
  <tr>
     <td> <a href="#volume-group-io-write"> Volume Group I/O Write </a></td>
  </tr>
  <tr>
     <td> <a href="#volume-group-rw-data"> Volume Group R/W Data </a></td>
  </tr>
  <tr>
     <td> <a href="#volume-group-io-utilisation"> Volume Group I/O Utilisation </a></td>
  </tr>
  <tr>
    <td rowSpan={7}> Thin Pool Stats </td>
    <td> <a href="#health-status"> Health Status </a></td>
  </tr>
  <tr>
    <td> <a href="#behaviour-when-full"> Behaviour when Full </a></td>
  </tr>
  <tr>
    <td> <a href="#pool-capacity"> Pool Capacity </a></td>
  </tr>
  <tr>
    <td> <a href="#pool-metadata-capacity"> Pool Metadata Capacity </a></td>
  </tr>
  <tr>
    <td> <a href="#pool-snapshot-full"> Pool Snapshot Full % </a></td>
  </tr>
  <tr>
    <td> <a href="#pool-permission"> Pool Permission </a></td>
  </tr>
  <tr>
    <td> <a href="#thin-volumes"> Thin Volumes </a></td>
  </tr>
  <tr>
    <td rowSpan={4}> Thin Pool Performance Stats </td>
    <td> <a href="#thin-pool-io-read"> Thin Pool I/O Read </a></td>
  </tr>
  <tr>
     <td> <a href="#thin-pool-io-write"> Thin Pool I/O Write </a></td>
  </tr>
  <tr>
     <td> <a href="#thin-pool-rw-data"> Thin Pool R/W Data </a></td>
  </tr>
  <tr>
     <td> <a href="#thin-pool-io-utilisation"> Thin Pool I/O Utilisation </a></td>
  </tr>
   <tr>
    <td rowSpan={1}> Volume Group PV Stats </td>
    <td> <a href="#volume-group-pv"> Volume Group PV </a></td>
  </tr>
</tbody>
</table>

#### Local PV ZFS Dashboard

<table>
<tbody>
  <tr>
    <th> DashBoard </th>
    <th> Panel </th>
  </tr>
  <tr>
    <td rowSpan={1}> Volume Capacity </td>
    <td> <a href="#used-space"> Used Space </a></td>
  </tr>
  <tr>
    <td rowSpan={2}> Pools </td>
    <td> <a href="#zpool-time"> ZPOOL-Time </a></td>
  </tr>
  <tr>
     <td> <a href="#zpool-ops"> ZPOOL-OPS </a></td>
  </tr>
  <tr>
    <td rowSpan={3}> ARC </td>
    <td> <a href="#arc-hit"> ARC Hit % </a></td>
  </tr>
  <tr>
     <td> <a href="#arc-misses"> ARC Hit/ARC Misses </a></td>
  </tr>
  <tr>
     <td> <a href="#arc-size"> ARC Size </a></td>
  </tr>
  <tr>
    <td rowSpan={3}> ARC L2</td>
    <td> <a href="#arc-l2-hit"> ARC L2 Hit % </a></td>
  </tr>
  <tr>
     <td> <a href="#arc-l2-misses"> ARC L2 Hit/ARC L2 Misses </a></td>
  </tr>
  <tr>
     <td> <a href="#arc-l2-size"> ARC L2 Size </a></td>
  </tr>
</tbody>
</table>

## See Also

- [Monitoring](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/monitoring.md)