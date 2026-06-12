---
id: k8supgrades
title: Kubernetes Upgrades - Best Practices for Replicated PV Mayastor
keywords: 
 - Upgrading Kubernetes
 - K8s Upgrades
 - Volume replica
 - Kubernetes nodes
description: Kubernetes upgrades do need to happen to new features that roll out and to get minimum requirements satisfied for the applications upgrade running on Kubernetes.
---

This document provides recommendations for performing Kubernetes node upgrades and maintenance activities in clusters that use Replicated PV Mayastor. Following these recommendations helps ensure that replica rebuild operations are completed before additional nodes are rebooted.

There are a few reasons why nodes in a Kubernetes cluster get rebooted:

- Kubernetes upgrades are required to support new features and satisfy the minimum requirements for applications running on Kubernetes. The Kubernetes upgrade process typically involves upgrading the nodes one by one. This process may require rebooting the nodes in the cluster.
- Kubernetes nodes may undergo hardware changes.

## Replicated PV Mayastor Volume Availability

When a Kubernetes node is rebooted, Replicated PV Mayastor volume targets lose access to the replicas hosted on that node. As a result, the volume may enter a Degraded state.

When the node comes back online, Replicated PV Mayastor rebuilds the affected replicas. Before rebooting the next node, wait for the rebuild process to complete and ensure that the volume returns to the Online state.

It is recommended that before a Kubernetes node is rebooted:

- All Replicated PV Mayastor volumes are in the Online state.
- All replicas are healthy.
- No replica rebuild operations are in progress.

## See Also

- [Connect with Community](../../../community.md)
