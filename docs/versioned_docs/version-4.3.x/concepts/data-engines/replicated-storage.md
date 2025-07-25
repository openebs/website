---
id: replicated-storage
title: Replicated Storage
keywords: 
  - Replicated Storage
  - OpenEBS Replicated Storage
description: In this document you will learn about Replicated Storage and its design goals.
---

## Replicated Storage Overview 

**Replicated Storage** (a.k.a Replicated Engine) refers to a storage engine provided by OpenEBS, a cloud-native storage solution for Kubernetes. In replicated storage, data is stored across multiple replicas (copies) to ensure high availability, durability, and fault tolerance. Replicated storage uses Mayastor engines to maintain multiple replicas of each volume across different Kubernetes nodes.

## Design Goals

The fundamental design objectives driving Replicated Storage's development are as follows:

- **High Availability and Durability**: Replicated Storage aims to ensure the persistence of data with high levels of availability and durability, contributing to the reliability of applications in a Kubernetes environment.
- **Simplified Deployment and Management**: The project endeavors to achieve seamless deployment and effortless management, empowering autonomous Site Reliability Engineering (SRE), or development teams to handle the storage infrastructure efficiently.
- **Low Overhead Abstraction**: Replicated Storage is designed to be a lightweight abstraction, minimizing resource overhead while delivering optimal storage performance for workloads.

## NVMe-oF Semantics and Performance

Replicated Storage is built on the foundation of Intel's cutting-edge [Storage Performance Development Kit (SPDK)](https://spdk.io/). The project fully leverages the protocol and computational efficiency of Non-Volatile Memory Express over Fabrics (NVMe-oF) semantics. This approach harnesses the immense performance capabilities of the latest generation solid-state storage devices, delivering a storage abstraction that incurs performance overhead within single-digit percentages.

In contrast, traditional pre-CNS shared storage systems are known to introduce overhead, often exceeding 40% and occasionally reaching as high as 80% of the underlying device or cloud volume capabilities. Moreover, pre-CNS shared storage can scale unpredictably as various workloads compete for access to shared storage resources.

:::note
Although Replicated Storage utilizes NVMe-oF, it does not impose any requirements for the use of NVMe devices or cloud volumes.
:::

## Quickstart Guide

OpenEBS provides Replicated Storage that can be used to deliver highly available storage for Kubernetes Stateful workloads. Refer to the [Quickstart Guide](../../quickstart-guide/prerequisites.md) for more information.

## Source Code and Contributions

To access the Replicated Storage source code or actively contribute to the project, visit the [GitHub repository](https://github.com/openebs/mayastor).

## See Also

- [OpenEBS Architecture](../architecture.md)
- [Quickstart](../../quickstart-guide/prerequisites.md)
- [Deployment](../../quickstart-guide/deploy-a-test-application.md)
- [Replicated Storage User Guide](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-overview.md)
