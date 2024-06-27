---
id: gke
title: Replicated PV Mayastor Installation on Google Kubernetes Engine
keywords:
 - Replicated PV Mayastor Installation on Google Kubernetes Engine
 - Replicated PV Mayastor Installation on GKE
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - Google Kubernetes Engine
 - GKE
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on Google Kubernetes Engine

This document provides instructions for installing Replicated PV Mayastor on Google Kubernetes Engine (GKE).

## Prerequisites

Before installing Replicated PV Mayastor, make sure that you meets the following requirements:

- **Image**

    Replicated PV Mayastor is supported exclusively by GKE clusters that are provisioned on the [Ubuntu node images](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images) (ubuntu_containerd). It is necessary to specify the Ubuntu node image when you create the clusters.

- **Hardware Requirements**

    Your machine-type must meet the requirements defined in the [prerequisites](../rs-installation.md#prerequisites).

- **GKE Nodes**

    The minimum number of worker nodes that can be supported is three. The number of worker nodes on which IO engine pods are deployed should not be less than the desired replication factor when using the synchronous replication feature (N-way mirroring).



## Install Replicated PV Mayastor on GKE

