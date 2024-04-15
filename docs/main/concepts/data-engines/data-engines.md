---
id: dataengines
title: Overview of OpenEBS Data Engines
keywords: 
  - Data Engines
  - OpenEBS Data Engines
  - Local Storage
  - Local Engines
  - Replicated Storage 
  - Replicated Engine
description: OpenEBS Data Engine is the core component that acts as an end-point for serving the IO to the applications. OpenEBS Data engines are akin to Storage controllers or sometimes also know for implementing the software defined storage capabilities.
---

OpenEBS Data Engine is the core component that acts as an end-point for serving the IO to the applications. OpenEBS Data engines are akin to Storage controllers or sometimes also known for implementing software-defined storage capabilities. 

OpenEBS provides a set of Data Engines, where each of the engines is built and optimized for running stateful workloads of varying capabilities and running them on Kubernetes nodes with varying ranges of resources.

Platform Site Reliability Engineering (SRE) or administrators typically select one or more [data engines](#data-engine-capabilities) to be used in their Kubernetes cluster. The selection of the data engines depends on the following two aspects:
- [Node Resources or Capabilities](#node-capabilities)
- [Stateful Application Capabilities](#stateful-workload-capabilities)

## Node Capabilities

Node Resources or Capabilities refer to the CPU, RAM, Network, and Storage available to Kubernetes nodes. 

Based on the CPU, RAM, and Network bandwidth available to the nodes, the nodes can be classified as:

* Small instances that typically have up to 4 cores, 16GB RAM and Gigabit Ethernet
* Medium instances that typically have up to 16 cores, 32GB RAM and up to 10G Networks
* Large instances that typically have more than 16 - even 96 cores, up to 256G or more RAM and 10 to 25G Networks

The Storage of the above instance can be made available in the following ways: 

* Ephemeral Storage - where storage is lost when a node is taken out of the cluster as part of auto-scaling or upgrades
* Cloud Volumes or Network Attached Storage - that can be re-attached to new nodes if the older node is removed from the cluster
* Direct Attached Storage
* Categorize based on the performance of the storage like slow (HDD via SAS), medium (SSD via SAS), fast (SSD or Persistent Flash via NVMe) 

Another key aspect that must be considered is the nature of the Kubernetes cluster size:
- Is it for an edge or home cluster with a single node?
- Hyperconverged nodes - where Stateful workload and its storage can be co-located
- Disaggregated - where Stateful workload and its storage will be served from different nodes

The following table summarizes the recommendation for small to medium instances, with HDDs, and SSDs limited to 2000 IOPS: 

| Node Capabilities           |                  |                         |                   |
| ----------------------------| :--------------: | :---------------------: | :---------------: |
| Ephemeral Node or Storage   | Non-Ephemeral    |   Non-Ephemeral         | Ephemeral         |
| Size of Cluster             | Single Node      |   Multiple Nodes        | Multiple Nodes    |
| Storage Deployment Type     | Hyperconverged   |   Hyperconverged        | Disaggregated     |
| Recommended Data Engines    | Local Storage     |   Local Storage and Replicated Storage | Replicated Storage |

The following table summarizes the recommendation for small to medium instances with fast SSDs capable of higher IOPS and Throughput, typically connected using NVMe: 

| Node Capabilities           |                  |                         |                   |
| ----------------------------| :--------------: | :---------------------: | :---------------: |
| Ephemeral Node or Storage   | Non-Ephemeral    |   Non-Ephemeral         | Ephemeral         |
| Size of Cluster             | Single Node      |   Multiple Nodes        | Multiple Nodes    |
| Storage Deployment Type     | Hyperconverged   |   Hyperconverged        | Disaggregated     |
| Recommended Data Engines    | Local Storage     |   Local Storage and Replicated Storage    | Replicated Storage |


## Stateful Workload Capabilities

Often storage is an integral part of any application, used without realizing that it exists. 

Storage can be further decomposed into two distinct layers:
- Stateful Workloads or the Data Platform Layer - which comprises SQL/NoSQL Database, Object and Key/Value stores, Message Bus, and so forth.
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
- **Distributed:** Stateful workloads like MongoDB have availability features like protecting against node failures built into them. Such systems will expect the Data Engines to provide the capacity and performance required with the data consistency/durability at the block level.
- **Distributed and Standalone:** Stateful workloads like Cassandra can benefit from the availability features from the Data Engines as it might help speed up the rebuild times required to rebuild a failed Cassandra node. However, this comes at the cost of using extra storage by the Data Engines. 
- **Standalone:** Stateful workloads like MongoDB (standalone) focus more on consistency and database features. It depends on the underlying Data Engine for providing availability, performance, durability, and other features. 

Each stateful application comes with certain capabilities and depends on the [Data Engines](#data- engine-capabilities) for complementary capabilities. The following table summarizes the recommendation for Data Engines based on the capabilities required by Applications: 

| Workload Type               | Distributed      |  Stand-alone            | Distributed and/or Stand-alone |
| ----------------------------| :--------------: | :---------------------: | :---------------------------:  |
| Required Capabilities       | Performance      |   Availability          | Performance and Availability   |
| Recommended Data Engines    | Local Storage     |   Replicated Storage     | Replicated Storage              |


## Data Engine Capabilities

Data Engines are what maintain the actual state generated by the Stateful applications and are concerned about providing enough storage capacity to store the state and ensure that the state remains intact over its lifetime. For instance, the state can be generated once, accessed over the next few minutes or days, modified or just left to be retrieved after many months or years. 

All OpenEBS Data Engines support:
- Dynamic Provisioning of Persistent Volumes
- Strong Data Consistency 

OpenEBS Data Engines can be classified into two categories.

### Local Storage

OpenEBS Local Storage (a.k.a Local Engines) can create Persistent Volumes (PVs) out of local disks or hostpaths or use the volume managers on the Kubernetes worker nodes. Local Storage is well suited for cloud native applications that have the availability and scalability features built into them. Local Storage is also well suited for stateful workloads that are short-lived like Machine Learning (ML) jobs or edge cases where there is a single node Kubernetes cluster. 

:::note
Local Storage is only available from the node on which the persistent volume is created. If that node fails, the application pod will not be rescheduled to another node.
:::

The below table identifies a few differences among the different OpenEBS Local Storage. 

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


### Replicated Storage

Replicated Storage (a.k.a Replicated Engine) can synchronously replicate the data to multiple nodes. These engines protect against node failures, by allowing the volume to be accessible from one of the other nodes where the data was replicated to. The replication can also be set up across availability zones helping applications move across availability zones. Replicated Volumes are also capable of enterprise storage features like snapshots, clone, volume expansion, and so forth. 

:::tip
Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from [Local Storage](local-storage.md) or [Replicated Storage](replicated-storage.md).
:::

:::note
An important aspect of the OpenEBS Data Layer is that each volume replica is a full copy of the data. This leads to the following capacity constraints that need to be kept in mind when using OpenEBS Replicated Volumes.
- Volumes can only be provisioned with capacity that can be accommodated in a single node by a single storage device or a pool of devices. Volume replica data will not be stripped or sharded across different nodes.
- Depending on the number of replicas configured, OpenEBS will use as many Volume Replicas. Example: A 10GB volume with 3 replicas will result in using 10GB on 3 different nodes where replicas are provisioned.
- Volume Replicas are thin provisioned, so the used capacity will increase only when the applications write data into volumes.
- When Volume Snapshots are taken, the snapshot is taken on all its healthy volume replicas.
:::

### Use-cases for OpenEBS Local Storage

- When applications are managing replication and availability themselves, there is no need for replication at the storage layer. In most such situations, the applications are deployed as `statefulset`.
- Local Storage is recommended when dedicated local disks are not available for a given application or dedicated storage is not needed for a given application.
- When near disk performance is needed along with features like snapshots, volume expansion, and pooling of storage from multiple storage devices. 

### Use-cases for OpenEBS Replicated Storage

- When you need high performance storage using NVMe SSDs the cluster is capable of NVMe-oF. 
- When you need replication or availability features to protect against node failures.  
- Replicated Storage is designed for the next-gen compute and storage technology and is under active development. 

For the latest updates and discussions, community users are invited to join the [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at [#openebs](https://kubernetes.slack.com/messages/openebs/) channel.

### Summary

- Local Storage is preferred if your application is in production and does not need storage level replication.
- Replicated Storage is preferred if your application needs low latency and near disk throughput, requires storage level replication and your nodes have high CPU, RAM, and NVMe capabilities. 


## See Also

- [Local Storage User Guide](../../user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-installation.md)
- [Replicated Storage User Guide](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md)