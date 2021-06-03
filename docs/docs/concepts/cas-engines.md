---
sidebar_position: 3
---

# OpenEBS Storage Engines - cStor, Jiva and LocalPV

## Overview of a Storage Engine

A storage engine is the data plane component of the IO path of a persistent volume. In CAS architecture, users can choose different data planes for different application workloads based on a configuration policy. A Storage engine can be hardened to optimize a given workload either with a feature set or for performance.

Operators or administrators typically choose a storage engine with a specific software version and build optimized volume templates that are fine-tuned with the type of underlying disks, resiliency, number of replicas, set of nodes participating in the Kubernetes cluster. Users can then choose an optimal volume template at the time of volume provisioning, thus providing the maximum flexibility in running the optimum software and storage combination for all the storage volumes on a given Kubernetes cluster.

## Types of Storage Engines

OpenEBS provides three types of storage engines.
