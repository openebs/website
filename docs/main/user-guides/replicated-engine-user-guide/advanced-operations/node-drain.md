---
id: node-drain
title: Node Drain
keywords:
 - Node Drain
description: This guide explains about the Node Drain feature.
---
## Node Drain

The node drain functionality marks the node as unschedulable and then gracefully moves all the volume targets off the drained node. 
This feature is in line with the [node drain functionality of Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).


To start the drain operation, execute:
**Command**
```
kubectl-mayastor drain node <node_name> <label>
```

To get the list of nodes on which the drain operation has been performed, execute:
**Command**
```
kubectl-mayastor get drain nodes
```

To halt the drain operation or to make the node schedulable again, execute:
**Command**
```
kubectl-mayastor uncordon node <node_name> <label>
```