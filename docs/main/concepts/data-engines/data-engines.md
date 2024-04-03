---
id: dataengines
title: Overview of OpenEBS Data Engines
keywords: 
  - Data Engines
  - OpenEBS Data Engines
description: OpenEBS Data Engine is the core component that acts as an end-point for serving the IO to the applications. OpenEBS Data engines are akin to Storage controllers or sometimes also know for implementing the software defined storage capabilities.
---

OpenEBS Data Engine is the core component that acts as an end-point for serving the IO to the applications. OpenEBS Data engines are akin to Storage controllers or sometimes also know for implementing the software defined storage capabilities. 

OpenEBS provides a set of Data Engines, where each of the engines is built and optimized for running stateful workloads of varying capabilities and running them on Kubernetes nodes with varying range of resources.

Platform Site Reliability Engineering (SRE) or administrators typically select one or more [data engines](#data-engine-capabilities) to be used in their Kubernetes cluster. The selection of the data engines depend on the following two aspects:
- [Node Resources or Capabilities](#node-capabilities)
- [Stateful Application Capabilities](#stateful-workload-capabilities)

## Node Capabilities

Node Resources or Capabilities refer to the CPU, RAM, Network, and Storage available to Kubernetes nodes. 

Based on the CPU, RAM, and Network bandwidth available to the nodes, the nodes can be classified as:

* Small instances that typically have up to 4 cores, 16GB RAM and Gigabit Ethernet
* Medium instances that typically have up to 16 cores, 32GB RAM and up to 10G Networks
* Large instances that typically have more than 16 - even 96 cores, up to 256G or more RAM and 10 to 25G Networks

The Storage to the above instance can be made available in the following ways: 

* Ephemeral Storage - where storage is lost when node is taken out of the cluster as part of auto-scaling or upgrades
* Cloud Volumes or Network Attached Storage - that can be re-attached to new nodes if the older node is removed from cluster
* Direct Attached Storage
* Categorize based on the performance of the storage like slow (HDD via SAS), medium (SSD via SAS), fast (SSD or Persistent Flash via NVMe) 

Another key aspect that must be considered is the nature of the Kubernetes cluster size:
- Is it for an edge or home cluster with single node?
- Hyperconverged nodes - where Stateful workload and its storage can be co-located
- Disaggregated - where Stateful workload and its storage will be served from different nodes

The following table summarizes the recommendation for small to medium instances, with HDDs, SSDs limited to 2000 IOPS: 

| Node Capabilities           |                  |                         |                   |
| ----------------------------| :--------------: | :---------------------: | :---------------: |
| Ephemeral Node or Storage   | Non-Ephemeral    |   Non-Ephemeral         | Ephemeral         |
| Size of Cluster             | Single Node      |   Multiple Nodes        | Multiple Nodes    |
| Storage Deployment Type     | Hyperconverged   |   Hyperconverged        | Disaggregated     |
| Recommended Data Engines    | Local Engine     |   Local Engine and Replicated Engine | Replicated Engine |

The following table summarizes the recommendation for small to medium instances with fast SSDs capable of higher IOPS and Throughput, typically connected using NVMe: 

| Node Capabilities           |                  |                         |                   |
| ----------------------------| :--------------: | :---------------------: | :---------------: |
| Ephemeral Node or Storage   | Non-Ephemeral    |   Non-Ephemeral         | Ephemeral         |
| Size of Cluster             | Single Node      |   Multiple Nodes        | Multiple Nodes    |
| Storage Deployment Type     | Hyperconverged   |   Hyperconverged        | Disaggregated     |
| Recommended Data Engines    | Local Engine     |   Local Engine and Replicated Engine    | Replicated Engine |


## Stateful Workload Capabilities

Often storage is an integral part of any application, used without realizing that it actually exists. 

Storage can be further decomposed into two distinct layers:
- Stateful Workloads or the Data Platform Layer - which comprises of SQL/NoSQL Database, Object and Key/Value stores, Message Bus, and so forth.
- Storage Engine or Data Engine layer that provides block storage to the Stateful workloads to persist the data onto the storage devices. 

The key features or capabilities provided by the storage can be classified as: 
- Availability
- Consistency
- Durability
- Performance
- Scalability
- Security
- Ease of Use

With serverless and cloud native becoming mainstream a key shift has happened in terms of how the Stateful workloads are developed, with many of the workloads natively supporting the key storage features like availability, consistency, and durability. For example:
- **Distributed:** Stateful workloads like MongoDB have availability features like protecting against node failures built into them. Such systems will expect the Data Engines to provide capacity and performance required with the data consistency/durability at the block level.
- **Distributed and Standalone:** Stateful workloads like Cassandra can benefit from the availability features from the Data Engines as it might help speed up the rebuild times required to rebuild a failed Cassandra node. However, this comes at the cost of using extra storage by the Data Engines. 
- **Standalone:** Stateful workloads like MongoDB (standalone) focus more on consistency and database features. It depends on the underlying Data Engine for providing availability, performance, durability, and other features. 

Each stateful application comes with a certain capabilities and depends on the [Data Engines](#data- engine-capabilities) for complementary capabilities. The following table summarizes the recommendation on Data Engines based on the capabilities required by Applications: 

| Workload Type               | Distributed      |  Stand-alone            | Distributed and/or Stand-alone |
| ----------------------------| :--------------: | :---------------------: | :---------------------------:  |
| Required Capabilities       | Performance      |   Availability          | Performance and Availability   |
| Recommended Data Engines    | Local Engine     |   Replicated Engine     | Replicated Engine              |


## Data Engine Capabilities

Data Engines are what maintain the actual state generated by the Stateful applications and are concerned about providing enough storage capacity to store the state and ensure that state remains intact over its lifetime. For instance state can be generated once, accessed over a period of next few minutes or days or modified or just left to be retrieved after many months or years. 

All OpenEBS Data Engines support:
- Dynamic Provisioning of Persistent Volumes
- Strong Data Consistency 

OpenEBS Data Engines can be classified into two categories.

### Local Engines

OpenEBS Local Engines can create Persistent Volumes (PVs) out of local disks or hostpaths or using the volume managers on the Kubernetes worker nodes. Local Engines are well suited for cloud native applications that have the availability, scalability features built into them. Local Engines are also well suited for stateful workloads that are short lived like Machine Learning (ML) jobs or edge cases where there is a single node Kubernetes cluster. 

:::note
Local volumes are only available from the the node on which the persistent volume is created. If that node fails, the application pod will not be re-scheduled to another node.
:::

The below table identifies few differences among the different OpenEBS Local Engines. 

| Feature                                      | Hostpath  |  Rawfile  |  Device    | ZFS      | LVM      | 
| -------------------------------------------- | :---:     | :------:  | :--------: | :------: | :------: |
| Near Disk Performance                        |  Yes      |   Yes     | Yes        | No       | Yes      |
| Full Backup and Restore using Velero         |  Yes      |   Yes     | Yes        | Yes      | Yes      |
| Thin Provisioning                            |  Yes      |   Yes     | No         | Yes      | Yes      |
| On-demand Capacity Expansion                 |  Yes      |   Yes     | No         | Yes      | Yes      |
| Disk Pool or Aggregate Support               |  Yes      |   Yes     | No         | Yes      | Yes      |
| Disk Resiliency (RAID Support)               |  Yes      |   Yes     | No         | Yes      | Yes      |
| Snapshots                                    |  No       |   No      | No         | Yes      | Yes      |
| Incremental Backups                          |  No       |   No      | No         | Yes      | Yes      |
| Clones                                       |  No       |   No      | No         | Yes      | No       |
| Works on OS Mounted storage                  |  Yes      |   Yes     | No         | No       | No       |


### Replicated Engines

Replicated Engines (aka Replicated Volumes) are those that can synchronously replicate the data to multiple nodes. These engines provide protection against node failures, by allowing the volume to be accessible from one of the other nodes where the data was replicated to. The replication can also be setup across availability zones helping applications move across availability zones. Replicated Volumes are also capable of enterprise storage features like snapshots, clone, volume expansion, and so forth. 

:::tip
Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from [Local Engine](local-engine.md) or[Replicated Engine](replicated-engine.md).
:::

:::note
An important aspect of the OpenEBS Data Layer is that each volume replica is a full copy of the data. This leads to the following capacity constraints that need to be kept in mind when using OpenEBS Replicated Volumes.
- Volumes can only be provisioned with capacity that can be accommodated in a single node by a single storage device or a pool of devices. Volume replica data will not be stripped or sharded across different nodes.
- Depending on the number of replicas configured, OpenEBS will use as many Volume Replicas. Example: A 10GB volume with 3 replicas will result in using 10GB on 3 different nodes where replicas are provisioned.
- Volume Replicas are thin provisioned, so the used capacity will increase only when the applications really write data into volumes.
- When Volume Snapshots is taken, the snapshot is taken on all its healthy volume replicas.
:::

Below table identifies few differences among the different OpenEBS Replicated engines. 

| Feature                                      | Jiva    |  cStor   |  Mayastor  | 
| -------------------------------------------- | :---:   | :------: | :--------: |
| Full Backup and Restore using Velero         |  Yes    |   Yes    | Yes        |
| Synchronous replication                      |  Yes    |   Yes    | Yes        |
| Protect against node failures (replace node) |  Yes    |   Yes    | Yes        |
| Use with ephemeral storage on nodes          |  Yes    |   Yes    | Yes        |
| Thin Provisioning                            |  Yes    |   Yes    | Yes        |
| Disk pool or aggregate support               |  Yes    |   Yes    | Planned    |
| Disk resiliency (RAID support )              |  Yes    |   Yes    | Planned    |
| On demand capacity expansion                 |  No     |   Yes    | Planned    |
| Snapshots                                    |  No     |   Yes    | Planned    |
| Clones                                       |  No     |   Yes    | Planned    |
| Incremental Backups                          |  No     |   Yes    | Planned    |
| Suitable for high capacity (>50GB) workloads |  No     |   Yes    | Yes        |
| Near disk performance                        |  No     |   No     | Yes        |

### Ideal Conditions for selecting OpenEBS Local Engine

- When applications are managing replication and availability themselves and there is no need of replication at storage layer. In most such situations, the applications are deployed as `statefulset`.
- Local Engine is recommended when dedicated local disks are not available for a given application or dedicated storage is not needed for a given application.
- When near disk performance is a need along with features like snapshots, volume expansion, pooling of storage from multiple storage devices. 

### Ideal Conditions for selecting OpenEBS Replicated Engine

- When you need high performance storage using NVMe SSDs and the cluster is capable of NVMeoF. 
- When you need replication or availability features to protected against node failures.  
- Replicated Engine is designed for the next gen compute and storage technology and is under active development. 

As Replicated Engine is under active development, you can also influence the features that are being built by joining [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at [#openebs](https://kubernetes.slack.com/messages/openebs/) channel. 

### Summary

A short summary is provided below.

- Local Engine is preferred if your application is in production and does not need storage level replication.
- Replicated Engine is preferred if your application needs low latency and near disk throughput, requires storage level replication and your nodes have high CPU, RAM, and NVMe capabilities. 


## See Also

- [User Guides](../../user-guides/)
- [Local Engine User Guide](../../user-guides/local-engine-user-guide/)
- [Replicated Engine User Guide](../../user-guides/replicated-engine-user-guide/)