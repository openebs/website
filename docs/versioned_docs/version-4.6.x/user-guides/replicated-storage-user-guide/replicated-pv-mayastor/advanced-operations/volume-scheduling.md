---
id: volume-scheduling
title: Volume Scheduling
keywords:
 - Volume Scheduling
description: This document explains how Replicated PV Mayastor manages volume scheduling, including current behavior and a proposed enhancement to pin or bind volumes and their components to a single node.
---

This document explains how Replicated PV Mayastor manages volume scheduling, including current behavior and a proposed enhancement to pin or bind volumes and their components to a single node. The goal is to understand how volumes are placed and how these processes will improve in the future.

## Current Scheduling Behavior

- **Volume Targets:** These can be placed on any io-engine node.
- **Volume Replicas:** These are placed only on io-engine nodes with Mayastor disk pools.

## How Scheduling Works

1. When a Persistent Volume (PV) is Created:

    - Only the volume replicas are created at this stage.
    - The Mayastor control plane determines the optimal placement of replicas on disk pools.

2. When a Persistent Volume Claim (PVC) is Assigned to a Pod:

    - A volume target is created, enabling the Pod’s node to connect to the volume.
    - The target’s placement depends on the volume type and node configuration.

## Placement Scenarios

**Single-Replica Volumes**

The volume target is always placed on the same node as the replica.

**Multi-Replica Volumes**

- If the Pod’s Node Is an io-engine Node: The volume target is placed on the same node as the Pod, if the io-engine on said node is online

- If the Pod’s Node Is Not an io-engine Node: The volume target is placed optimally on any io-engine node, as determined by the control plane.

:::note
For multi-replica volumes, the initial placement of the volume target is not fixed. If High Availability (HA) is triggered (e.g., the target becomes unresponsive), the control plane may relocate the target to another node to maintain accessibility.
:::
