---
id: replicated-engine
title: Replicated Engine
keywords: 
  - Replicated Engine
description: In this document you will learn about Replicated Engine and it's design goals.
---

## Replicated Engine Overview 

**Replicated Engine** is a progressive sub-project of the CNCF (Cloud Native Computing Foundation) Open Source initiative [**OpenEBS**](https://openebs.io/). OpenEBS is a Container Native Storage (CNS) solution that extends Kubernetes by providing a declarative data plane, offering resilient and adaptable storage for stateful applications.

## Replicated Engine Design Goals

The fundamental design objectives driving Replicated Engine's development are as follows:

- **High Availability and Durability**: Replicated Engine aims to ensure the persistence of data with high levels of availability and durability, contributing to the reliability of applications in a Kubernetes environment.
- **Simplified Deployment and Management**: The project endeavors to achieve seamless deployment and effortless management, empowering autonomous Site Reliability Engineering (SRE), or development teams to handle the storage infrastructure efficiently.
- **Low Overhead Abstraction**: Replicated Engine is designed to be a lightweight abstraction, minimizing resource overhead while delivering optimal storage performance for workloads.

## NVMe-oF Semantics and Performance

Replicated Engine is built on the foundation of Intel's cutting-edge [Storage Performance Development Kit (SPDK)](https://spdk.io/). The project fully leverages the protocol and computational efficiency of Non-Volatile Memory Express over Fabrics (NVMe-oF) semantics. This approach harnesses the immense performance capabilities of the latest generation solid-state storage devices, delivering a storage abstraction that incurs performance overhead within single-digit percentages.

In contrast, traditional pre-CNS shared storage systems are known to introduce overhead, often exceeding 40% and occasionally reaching as high as 80% of the underlying device or cloud volume capabilities. Moreover, pre-CNS shared storage can scale unpredictably as various workloads compete for access to shared storage resources.

{% hint style=“note” %}
Although Replicated Engine utilizes NVMe-oF, it does not impose any requirements for the use of NVMe devices or cloud volumes.
{% endhint %}

## Quick Start Guides

OpenEBS provides Local Volume that can be used to provide locally mounted storage to Kubernetes Stateful workloads. Refer to the [Quickstart Guide](../../quickstart-guide/) for more information.

## Source Code and Contributions

To access the Replicated Engine source code or actively contribute to the project, visit the [GitHub repository](https://github.com/openebs/mayastor).


## Community Support via Slack

Join the vibrant [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com) for assistance and discussions related to OpenEBS and Replicated Engine. If you have questions or seek further information, visit the[#openebs](https://kubernetes.slack.com/messages/openebs/) channel. If you are not already part of the community, you can sign up on Kubernetes Slack for a collaborative experience.

## See Also:

[OpenEBS Architecture](../architecture.md)
[Replicated Engine Prerequisites](../../user-guides/replicated-engine-user-guide/prerequisites.md)
[Installation](../../quickstart-guide/installation.md)
[Replicated Engine User Guide](../../user-guides/replicated-engine-user-guide/)