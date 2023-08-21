---
id: mayastor
title: Mayastor
keywords: 
  - Mayastor
description: In this document you will learn about Mayastor and it's design goals.
---

## Mayastor Overview 

**Mayastor** is a progressive sub-project of the CNCF (Cloud Native Computing Foundation) Open Source initiative [**OpenEBS**](https://openebs.io/). OpenEBS is a "Container Attached Storage" (CAS) solution that extends Kubernetes by providing a declarative data plane, offering resilient and adaptable storage for stateful applications.

----

## Mayastor Design Goals

The fundamental design objectives driving Mayastor's development are as follows:

- **High Availability and Durability**: Mayastor aims to ensure the persistence of data with high levels of availability and durability, contributing to the reliability of applications in a Kubernetes environment.
- **Simplified Deployment and Management**: The project endeavors to achieve seamless deployment and effortless management, empowering autonomous SRE (Site Reliability Engineering) or development teams to handle the storage infrastructure efficiently.
- **Low Overhead Abstraction**: Mayastor is designed to be a lightweight abstraction, minimizing resource overhead while delivering optimal storage performance for workloads.

---

## NVMe-oF Semantics and Performance

Mayastor is built on the foundation of Intel's cutting-edge [Storage Performance Development Kit (SPDK)](https://spdk.io/). The project fully leverages the protocol and computational efficiency of NVMe-oF (Non-Volatile Memory Express over Fabrics) semantics. This approach harnesses the immense performance capabilities of the latest generation solid-state storage devices, delivering a storage abstraction that incurs performance overhead within single-digit percentages.

In contrast, traditional pre-CAS shared storage systems are known to introduce overhead, often exceeding 40% and occasionally reaching as high as 80% of the underlying device or cloud volume capabilities. Moreover, pre-CAS shared storage can scale unpredictably as various workloads compete for access to shared storage resources.

:::note

Although Mayastor utilizes NVMe-oF, it doesn't impose any requirements for the use of NVMe devices or cloud volumes.      

:::

---

## Getting Started and User Documentation

For comprehensive insights into Mayastor's architecture, core concepts, and to begin using the platform, refer to the official user documentation available in GitBook format: [mayastor.gitbook.io](https://mayastor.gitbook.io/).

----

## Source Code and Contributions

To access the Mayastor source code or actively contribute to the project, visit the GitHub repository:  https://github.com/openebs/mayastor.

---

## Community Support via Slack

Join the vibrant[OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com) for assistance and discussions related to OpenEBS and Mayastor. If you have questions or seek further information, visit the [#openebs](https://kubernetes.slack.com/messages/openebs/) channel. If you're not already part of the community, you can sign up on Kubernetes Slack for a collaborative experience.

