---
id: rs-overview
title: Replicated PV Mayastor Overview
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Overview
 - Installation
 - Prerequisites
description: This section explains the overview of Replicated PV Mayastor.
---

OpenEBS Replicated PV Mayastor is a high-performance storage engine that provides block storage with replication across multiple nodes. Built using Rust for safety and speed, Mayastor is designed for mission-critical workloads requiring high availability, durability, and fault tolerance. It ensures that data remains accessible even if one or more nodes fail, making it suitable for production environments where data resiliency is a top priority.

## Advantages

- Highly available storage – Replicates data across nodes for fault tolerance.

- Performance-optimized – Built in Rust and NVMe-native for low latency.

- Node failure resiliency – Workloads stay online even during node failures.

- Kubernetes-native – Seamlessly integrates with K8s CSI and scheduling.

- Ideal for mission-critical apps – Suitable for databases and stateful services requiring zero data loss.

## Installation 

Refer to the [OpenEBS Installation documentation](../../../quickstart-guide/installation.md) to install Replicated PV Mayastor.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Configuration](../replicated-pv-mayastor/configuration/rs-create-diskpool.md)
- [Deploy an Application](../replicated-pv-mayastor/configuration/rs-deployment.md)