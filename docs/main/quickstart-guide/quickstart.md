---
id: quickstart
title: OpenEBS Quickstart Guide
keywords:
 - How to setup and use OpenEBS
 - Kubernetes Cluster Design
 - Install OpenEBS and Setup Storage Classes
 - Deploy Stateful Workloads
 - Dynamic Persistent Volume Provisioning
 - Managing the Life cycle of OpenEBS components
description: This guide will help you to setup OpenEBS and use OpenEBS Volumes to run your Kubernetes Stateful Workloads. If you are new to running Stateful workloads in Kubernetes, you will need to familiarize yourself with Kubernetes Storage Concepts
---

:::note
With OpenEBS v3.4, the OpenEBS helm chart now supports installation of replicated engine v2.0 storage engine.
::: 




In most cases, the following steps is all you need to install OpenEBS. You can read through the rest of the document to understand the choices you have and optimize OpenEBS for your Kubernetes cluster. 
 
:::tip QUICKSTART
  Install using helm
  ```
  helm repo add openebs https://openebs.github.io/charts
  helm repo update
  helm install openebs --namespace openebs openebs/openebs --create-namespace
  ```
:::


## See Also

- [Installation](../quickstart-guide/installation.md)
- [Deployment](../quickstart-guide/deploy-a-test-application.md)