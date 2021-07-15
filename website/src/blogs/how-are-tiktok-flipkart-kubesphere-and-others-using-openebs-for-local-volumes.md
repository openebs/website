---
title: How are TikTok, Flipkart, KubeSphere, and others using OpenEBS for Local Volumes
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: LocalPV, OpenEBS, Flipkart, TikTok, Kubernetes, Mayastor, MayaData
date: 12-03-2021
excerpt: How are TikTok, Flipkart, KubeSphere, and others using OpenEBS for Local Volumes
---

**How to select the right local volume for your workloads?**

We have recently seen a massive increase in the usage of different flavors of OpenEBS Local PV. We estimate by looking at container pulls for underlying components combined with some call home data for those users of OpenEBS that enable the capturing of metrics that the weekly new deployments of OpenEBS for LocalPV increased by nearly 10x during 2020. This can be attributed to the fact that more and more cloud native Stateful applications are moving into Kubernetes

![LocalPv Deployment](/images/blog/local-pv-deployment.png)

Some of the prominent users of OpenEBS Local PV include the CNCF, Optoro, ByteDance / TikTok, Flipkart, and many more. You can always read more about OpenEBS users on the OpenEBS.io website and on the GitHub project page here: [https://github.com/openebs/openebs/blob/master/ADOPTERS.md](https://github.com/openebs/openebs/blob/master/ADOPTERS.md).

While Kubernetes provides native support or interfaces for consuming Local Volumes, the adoption of OpenEBS for LocalPV management suggests that some capabilities are missing that are desired by users. At a high level, dynamic provisioning and the simplicity of deleting Local Volumes are two reasons often given for the preference of some users for the use of OpenEBS LocalPV.

In this blog, I outline the various types of Local Storage that users have in their Kubernetes clusters and introduce the various flavors of OpenEBS Local PV being used.

Before getting into the flavors of OpenEBS Local PV, it might be worthwhile to know what Kubernetes offers or means by a Local Volume.

_A [Kubernetes Local Volume](https://kubernetes.io/docs/concepts/storage/volumes/#local) implies that storage is available only from a single node. A local volume represents a mounted local storage device such as a disk, partition, or directory._

So, it stands to reason - as the Local Volume is accessible only from a single node, local volumes are subject to the availability of the underlying node. If the node becomes unhealthy, then the local volume will also become inaccessible, and a Pod using it will not be able to run.

Hence, Stateful Applications using local volumes must be able to tolerate this reduced availability, as well as potential data loss, depending on the durability characteristics of the underlying disk.

As it happens, many of the Cloud Native Workloads - are distributed in nature and are typically deployed as StatefulSets with multiple replicas. These can sustain the failure or reduced availability of a single replica. MinIO, Redis, PostgreSQL, Kafka, Cassandra, Elastic are just some examples that are deployed using Local Volumes. For these applications - performance and consistent low latency, and ease of management are more important than the resiliency of a node to failures.

As the large SaaS provider, [Optoro](https://github.com/openebs/openebs/blob/master/adopters/optoro/README.md) puts it:  
*The vast majority of applications are able to better handle failover and replication than a block level device. Instead of introducing another distributed system into an already complex environment, OpenEBS's localPVs allow us to leverage fast local storage. … OpenEBS has allowed us to not introduce a complicated distributed system into our platform. The adoption has been smooth and completely transparent to our end users.*

## Limitations of Kubernetes LocalPV

Kubernetes expects users to make Persistent Volumes (PVs) available that it can then associate with PVCs during scheduling. Kubernetes does not help with dynamically creating these PVs as the applications are launched into the cluster.

This pre-provisioning can become an issue when companies have more than two people or teams managing the Kubernetes clusters, and the Application teams depend on the Kubernetes cluster administrators for provisioning the Volumes.

We have seen that cluster administrators are challenged by the following aspects:

(a) The type of storage available on the Kubernetes nodes varies depending on how the Kubernetes nodes are provisioned. Available storage types include:

- Nodes have only OS disks with large space that can be used for provisioning Local Volumes.
- Nodes have one or two additional devices (SSDs or Disks) attached that can be used for provisioning Local Volumes.
- Nodes have 8 to 16 high-performing NVMe SSDs.

(b) And then, there is a matter of capacity available from the Local Storage and how to manage this to enable the freedom of developers and other consumers of capacity while retaining a level of oversight and assistance by centralized teams:

(c) First, the platform or other centralized team may not know exactly what the capacity a particular team or workload needs - and the developer or data scientist may not know either. Dynamic provisioning within quotas means that users can keep moving without opening a ticket or having a conversation.

(d) Secondly, there are many common operations tasks that need to be performed. Just because the applications are resilient does not mean these tasks entirely disappear. Administrators still would like to safeguard the data with best practices from years of experience in dealing with data such as:

- Enforcing Capacity Limits/Thresholds
- Securing the Volumes
- Carving out the Local Volumes from well known or familiar file systems like LVM, ZFS, XFS, and so forth
- Encrypting the Volumes
- Enforce compliance with BCP by taking regular snapshots and full backups

This is where Kubernetes itself stops, and plugins like OpenEBS LocalPV options step into the auto-magically provision and manage the Local Volumes.

## Selecting your LocalPV

OpenEBS provides different types of Local Volumes that can be used to provide locally mounted storage to Kubernetes stateful workloads. The choice of the OpenEBS Local Volume depends on the type of local storage available on the node and the features required.

- OpenEBS Hostpath Local PV - The use of the host path is the simplest, most used, and lowest overhead solution. This approach creates Local PVs by creating a sub-directory per Persistent Volume. This offers flexibility to create different classes of storage and allows administrators to decide into which parent or mounted directory the Persistent Volumes sub-directories should be placed. For example - a storage class for critical workloads vs. non-critical transient workloads, SSD vs. Hard Disk mounted paths, and so forth.
- OpenEBS Raw file Local PV - The OpenEBS Raw file approach evolved out of the Hostpath approach due to considerable feedback from some OpenEBS community members. Raw file Local PV offers all the benefits of Hostpath Local PV - and in addition, Hostpath supports enforcing Capacity Quotas on Volume subdirectories by creating sparse files per volume.
- OpenEBS Device Local PV - Device Local PV is best suited for cases where either a complete device or a partitioned device needs to be dedicated to the pod. Workloads like Cassandra or Kafka that need high throughput and low latency often use dedicated device Local PV.
- OpenEBS ZFS and LVM Local PV - Both ZFS and LVM are selected by seasoned storage administrators that want to leverage all the good things of well-known filesystems or volume management along with the power of Local Volumes. This category offers features like full/incremental snapshots, encryption, thin-provisioning, resiliency against local disk failures by using software raid/mirror, and so forth. Incidentally, you can easily cause a fairly reasoned argument by asking users and community members, and even our own engineers to share their opinions about whether ZFS or LVM is more useful; I'm very happy that the community has progressed to the point that both solutions are now supported and widely deployed.

I hope this overview of LocalPV options and OpenEBS Local has been useful. I plan to follow this with further blogs that get into the details of each flavor of the OpenEBS Local PV.

In the meantime, you can get started easily with [OpenEBS Local PV](https://docs.openebs.io/docs/next/overview.html), and the community is always available on the Kubernetes Slack #openebs channel.

Or read more on what our OpenEBS users and partners have to say about Local PV. From our friends at 2nd Quadrant (now part of EDB): [Local Persistent Volumes and PostgreSQL usage in Kubernetes](https://www.2ndquadrant.com/en/blog/local-persistent-volumes-and-postgresql-usage-in-kubernetes/)

And from one of the most broadly deployed Kubernetes distributions, Kubesphere: [OpenEBS Local PV is default Storage Class in Kubesphere](https://github.com/openebs/openebs/tree/master/adopters/kubesphere)

Or, again, you can find more stories and can add your own to Adopters.MD on the OpenEBS GitHub: [https://github.com/openebs/openebs/blob/master/ADOPTERS.md](https://github.com/openebs/openebs/blob/master/ADOPTERS.md)
