---
id: cordon-node
title: Cordon a Node
keywords:
 - Node Cordon
 - Cordon Node
description: This guide explains about the Node Cordon feature.
---

# Cordon a Node

## Overview

Cordoning a node marks or taints the node as unschedulable. This prevents the scheduler from deploying new resources on that node. However, the resources that were deployed prior to cordoning off the node will remain intact.

This feature is in line with the node-cordon functionality of Kubernetes.

## Cordon a Node

To add a label and cordon a node, execute:
**Command**
```
kubectl-mayastor cordon node <node_name> <label>
```

To get the list of cordoned nodes, execute:

**Command**
```
kubectl-mayastor get cordon nodes
```

To view the labels associated with a cordoned node, execute:
**Command**
```
kubectl-mayastor get cordon node <node_name>
```

## Uncordon a Node

To make a node schedulable again, execute:
**Command**
```
kubectl-mayastor uncordon node <node_name> <label>
```

The above command allows the Kubernetes scheduler to deploy resources on the node.