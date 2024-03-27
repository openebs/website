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
With OpenEBS v3.4, the OpenEBS helm chart now supports installation of Mayastor v2.0 storage engine.
::: 

This guide will help you to setup OpenEBS and use OpenEBS Volumes to run your Kubernetes Stateful Workloads. If you are new to running Stateful workloads in Kubernetes, you will need to familiarize yourself with [Kubernetes Storage Concepts](../concepts/basics.md).


In most cases, the following steps is all you need to install OpenEBS. You can read through the rest of the document to understand the choices you have and optimize OpenEBS for your Kubernetes cluster. 
 
:::tip QUICKSTART
  Install using helm
  ```
  helm repo add openebs https://openebs.github.io/charts
  helm repo update
  helm install openebs --namespace openebs openebs/openebs --create-namespace
  ```
:::

## How to setup and use OpenEBS?

OpenEBS seamlessly integrates into the overall workflow tooling that Kubernetes administrators and users have around Kubernetes. 

The OpenEBS workflow fits nicely into the reconcilation pattern introduced by Kubernetes, paving the way for a Declarative Storage Control Plane as shown below: 

![control plane overview](../assets/control-plane-overview.svg)

### 1. Kubernetes Cluster Design

As a Kubernetes cluster administrator, you will have to work with your Platform or Infrastructure teams on the composition of the Kubernetes worker nodes like - RAM, CPU, Network, and the storage devices attached to the worker nodes. The [resources available to the Kubernetes nodes](../concepts/data-engines/data-engines.md#node-capabilities) determine what OpenEBS engines to use for your stateful workloads. 

As a Kubernetes cluster administrator or Platform SREs, you will have to decide which deployment strategy works best for you - either use an hyperconverged mode where Stateful applications and storage volumes are co-located or run Stateful applications and storage on different pools of nodes. 

For installing OpenEBS, you Kubernetes cluster should meet the following:
- Kubernetes 1.18 or newer is recommended. 
- Based on the selected data engine, the nodes should be prepared with additional packages like:
  - Installing the ext4, xfs, nfs, lvm, zfs, nvme packages.
  - Prepare the devices for use by data engines like - making sure there are no the filesystem installed or by creating an LVM volume group or ZFS Pool or partition the drives if required. 
- Based on whether you are using a upstream Kubernetes cluster or using a managed Kubernetes cluster like AKS, Rancher, OpenShift, GKE, there may be additional steps required. 

Read through the relevant section of the [pre-requisites](../user-guides/local-engine-user-guide/prerequisites.mdx) for your Kubernetes platform, Operating System of the worker nodes.

- [Ubuntu](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [RHEL](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [CentOS](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [OpenShift](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [Rancher](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [ICP](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [EKS](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [GKE](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [AKS](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [Digital Ocean](../user-guides/local-engine-user-guide/prerequisites.mdx)
- [Konvoy](../user-guides/local-engine-user-guide/prerequisites.mdx)

If your platform is missing in the above list, [raise an issue on the docs](https://github.com/openebs/openebs/issues/new/choose) or reach us on the [community slack](../community.md) to let us know. 

### 2. Install OpenEBS and Setup Storage Classes

OpenEBS is Kubernetes native, which makes it possible to install OpenEBS into your Kubernetes cluster - just like any other application. 

You can install OpenEBS only using Kubernetes admin context as you will require cluster level permissions to create Storage Classes. 

OpenEBS offers different modes of [installation](../quickstart-guide/installation.md). The most popular ones are using [OpenEBS Helm chart](/user-guides/installation#installation-through-helm).

OpenEBS will install a couple of default storage classes that you an use for Local Volumes (`openebs-hostpath`) and Replicated Volumes (`openebs-hostpath`). The data of the volumes created by these default Storage Classes will be saved under `/var/openebs`. 

As a Platform SRE / Cluster Administrator, you can customize several things about OpenEBS installer to suite your specific environment and create the setup the required Storage Classes. You can jump to the relevant sections based on your choice of [data engines](../concepts/data-engines/data-engines.md):

- [Local PV hostpath](/user-guides/localpv-hostpath)
- [Local PV ZFS](https://github.com/openebs/zfs-localpv)
- [Local PV LVM](https://github.com/openebs/lvm-localpv)
- [Replicated Engine](../user-guides/replicated-engine-user-guide/)

### 3. Deploy Stateful Workloads

The application developers will launch their application (stateful workloads) that will in turn create Persistent Volume Claims for requesting the Storage or Volumes for their pods. The Platform teams can provide templates for the applications with associated PVCs or application developers can select from the list of Storage Classes available for them. 

As an application developer all you have to do is substitute the `StorageClass` in your PVCs with the OpenEBS Storage Classes available in your Kubernetes cluster. 

**Here are examples of some applications using OpenEBS:**

- PostgreSQL
- Percona
- Redis
- MongoDB
- Cassandra
- Prometheus
- Elastic
- MinIO
- Wordpress using NFS

### 4. Dynamic Persistent Volume Provisioning

The Kubernetes CSI (provisioning layer) will intercept the requests for the Persistent Volumes and forward the requests to the OpenEBS Control Plane components to service the requests. The information provided in the StorageClass combined with requests from PVCs will determine the right OpenEBS control component to receive the request. 

OpenEBS control plane will then process the request and create the Persistent Volumes using the specified local or replicated engines. The data engine services like target and replica are deployed as Kubernetes applications as well. The containers provide storage for the containers. The new containers launched for serving the applications will be available in the `openebs` namespace. 

With the magic of OpenEBS and Kubernetes, the volumes should be provisioned, pods scheduled and application ready to serve. For this magic to happen, the prerequisites should be met.

Check out our [troubleshooting section](../troubleshooting/) for some of the common errors that users run into due to setup issues.


### 5. Managing the Life Cycle of OpenEBS Components

Once the workloads are up and running, the platform or the operations team can observe the system using the cloud native tools like Prometheus, Grafana, and so forth. The operational tasks are a shared responsibility across the teams: 
* Application teams can watch out for the capacity and performance and tune the PVCs accordingly. 
* Platform or Cluster teams can check for the utilization and performance of the storage per node and decide on expansion and spreading out of the Data Engines. 
* Infrastructure team will be responsible for planning the expansion or optimizations based on the utilization of the resources.
