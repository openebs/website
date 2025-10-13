---
id: drain-node
title: Drain a Node
keywords:
 - Node Drain
 - Drain a Node
description: This guide explains about the Node Drain feature.
---

# Drain a Node

## Overview

The node drain functionality marks the node as unschedulable and then gracefully moves all the volume targets off the drained node.

This feature is in line with the [node drain functionality of Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).

## Drain a Node

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

## Halt Drain

To halt the drain operation or to make the node schedulable again, execute:

**Command**

```
kubectl-mayastor uncordon node <node_name> <label>
```