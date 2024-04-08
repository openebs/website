---
id: overview
title: OpenEBS Documentation
slug: /
keywords:
  - OpenEBS
  - OpenEBS overview
description: OpenEBS builds on Kubernetes to enable Stateful applications to easily access Dynamic Local or Replicated Container Attached Kubernetes Persistent Volumes. By using the Container Native Storage pattern users report lower costs, easier management, and more control for their teams.
---

## What is OpenEBS?

OpenEBS turns any storage available to Kubernetes worker nodes into Local or Replicated Kubernetes Persistent Volumes. OpenEBS helps application and platform teams easily deploy Kubernetes stateful workloads that require fast and highly durable, reliable, and scalable [Container Native Storage](../concepts/container-native-storage.md).

OpenEBS is also a leading choice for NVMe based storage deployments.

OpenEBS was originally built by MayaData and donated to the _Cloud Native Computing Foundation_ and is now a [CNCF sandbox project](https://www.cncf.io/sandbox-projects/).

## Why do users prefer OpenEBS?

The [OpenEBS Adoption stories](https://github.com/openebs/openebs/blob/master/ADOPTERS.md), mention the top reasons driving users towards OpenEBS as:

- OpenEBS provides consistency across all Kubernetes distributions - On-premise and Cloud.
- OpenEBS with Kubernetes increases Developer and Platform SRE Productivity.
- OpenEBS is Easy to use compared to other solutions, for eg trivial to install & enabling entirely dynamic provisioning.
- OpenEBS has Excellent Community Support.
- OpenEBS is completely Open Source and Free.

## What does OpenEBS do?

OpenEBS manages the storage available on each of the Kubernetes nodes and uses that storage to provide [Local](#local-volumes) or [Replicated](#replicated-volumes) Persistent Volumes to Stateful workloads.

![data-engines-comparision](../assets/data-engines-comparision.svg)

In case of [Local Volumes](#local-volumes):

- OpenEBS can create persistent volumes, or using sub-directories on Hostpaths or by using locally attached storage or sparse files or over existing LVM or ZFS stack.
- The local volumes are directly mounted into the Stateful Pod, without any added overhead from OpenEBS in the data path, decreasing latency.
- OpenEBS provides additional tooling for local volumes for monitoring, backup/restore, disaster recovery, snapshots when backed by LVM or ZFS stack, capacity based scheduling, and more.

In case of [Replicated) Volumes](#replicated-volumes):

- OpenEBS Replicated Storage creates an NVMe target accessible over TCP, for each persistent volume.
- The Stateful Pod writes the data to the NVMe-TCP target that synchronously replicates the data to multiple nodes in the cluster. The OpenEBS engine itself is deployed as a pod and orchestrated by Kubernetes. When the node running the Stateful pod fails, the pod will be rescheduled to another node in the cluster and OpenEBS provides access to the data using the available data copies on other nodes.
- OpenEBS Replicated Storage is developed with durability and performance as design goals. It efficiently manages the compute (hugepages and cores) and storage (NVMe Drives) to provide fast block storage.

:::note
OpenEBS contributors prefer to call the Replicated Block Storage volumes as **Replicated Volumes**, to avoid confusion with traditional block storage for the following reasons:
* Replicated block storage tends to shard the data blocks of a volume across many nodes in the cluster. Replicated volumes persist all the data blocks of a volume on a node and for durability replicate the entire data to other nodes in the cluster.  
* While accessing a volume data, replicated block storage depends on metadata hashing algorithms to locate the node where the block resides, whereas replicated volumes can access the data from any of the nodes where data is persisted (aka replica nodes).
* Replicated volumes have a lower blast radius compared to traditional block storage. 
* Replicated volumes are designed for Cloud Native stateful workloads that require a large number of volumes with capacity that can typically be served from a single node as apposed to a single large volume with data sharded across multiple nodes in the cluster.
:::

OpenEBS Data Engines and Control Plane are implemented as micro-services, deployed as containers and orchestrated by Kubernetes itself. Importantly, OpenEBS data engines are implemented in user space, allowing OpenEBS to run on any Kubernetes Platform and to use any type of storage available to Kubernetes worker nodes. An added advantage of being a completely Kubernetes native solution is that administrators and developers can interact and manage OpenEBS using all the wonderful tooling that is available for Kubernetes like kubectl, Helm, Prometheus, Grafana, etc.

## Local Volumes

Local Volumes are accessible only from a single node in the cluster. Pods using local volume have to be scheduled on the node where volume is provisioned. Local volumes are typically preferred for distributed workloads like Cassandra, MongoDB, Elastic, etc that are distributed in nature and have high availability built into them.

## Replicated Volumes

Replicated Volumes, as the name suggests, are those that have their data synchronously replicated to multiple nodes. Volumes can sustain node failures. The replication also can be setup across availability zones helping applications move across availability zones.

Replicated Volumes also are capable of enterprise storage features like snapshots, clone, volume expansion and so forth. Replicated Volumes are a preferred choice for Stateful workloads like Percona/MongoDB, Jira, GitLab, etc.

:::info
Depending on the type of storage attached to your Kubernetes worker nodes and the requirements of your workloads, you can select from Local Storage or Replicated Storage.
:::

## Quickstart Guides

Installing OpenEBS in your cluster is as simple as running a few `kubectl` or `helm` commands. Refer to our [Quickstart guide](../quickstart-guide) for more information.

## Community Support via Slack

OpenEBS has a vibrant community that can help you get started. If you have further questions and want to learn more about OpenEBS, join [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at[#openebs](https://kubernetes.slack.com/messages/openebs/) channel.

## See Also

- [Quickstart](../quickstart-guide)
- [Installation](../quickstart-guide/installation.md)
- [Deployment](../quickstart-guide/deploy-a-test-application.md)
- [Use Cases and Examples](use-cases-and-examples.mdx)
- [Container Native Storage (CNS)](../concepts/container-native-storage.md)
- [OpenEBS Architecture](../concepts/architecture.md)
- [OpenEBS Local Storage](../concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](../concepts/data-engines/replicated-engine.md)
