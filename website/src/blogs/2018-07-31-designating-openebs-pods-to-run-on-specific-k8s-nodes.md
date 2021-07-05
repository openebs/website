---
title: Designating OpenEBS pods to run on specific K8S Nodes
author: Ajesh Baby
author_info: Product Manager at MayaData
date: 30-07-2018
tags: OpenEBS, Kubernetes, Solutions, Scheduler, Scheduling
excerpt: OpenEBS does not have a separate scheduler used to manage scheduling pods. Instead, it uses the Kubernetes scheduler for managing the scheduling needs of an administrator.
---

OpenEBS does not have a separate scheduler used to manage scheduling pods. Instead, it uses the Kubernetes scheduler for managing the scheduling needs of an administrator. Kubernetes provides the following methods for controlling the scheduling pods on cluster nodes:

- [nodeSelector](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#nodeselector)
- [Taints and Tolerations](https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/)

For more details and information about these features, you can refer to the Kubernetes documentation.

In this post, I would like to cover the different aspects of how to restrict/control the OpenEBS pods scheduling to a set of specific nodes in the Kubernetes cluster.

OpenEBS deals with many types of Kubernetes pods throughout its life cycle. These can be broadly categorized into two types, control plane pods and data plane pods. Control plane pods are installed as part of installation of the following OpenEBS components:

- OpeEBS API Server
- OpenEBS Provisioner
- OpenEBS Snapshot Controller

Data plane pods are installed as part of volume provisioning:

- Target Pod
- Replica Pods

For details on the exact steps of scheduling, see the configuration section [here](https://docs.openebs.io/docs/next/scheduler.html?__hstc=216392137.e7b2938c542eaf0f98426e5d8be4aa84.1579859056424.1579859056424.1579859056424.1&__hssc=216392137.1.1579859056424&__hsfp=3765904294).

Use case: Let’s consider a scenario in which you have 20 nodes named Node1, Node2 ... Node20. You may want to designate Node1, Node2, Node3 as storage nodes so that all storage pods are scheduled only on these nodes.

Solution: You can use Kubernetes scheduling methods to achieve this. Below are some of the possible options and their effect on scheduling pods to respective nodes.

![Storage Pods](/images/blog/storage-pods.png)

You may select and use any of the above options based on your unique requirements.

Option 2 does not necessarily guarantee storage pod scheduling on Node1, Node2 and Node3.

Option 1, Option 3, and Option 4 will limit the scheduled OpenEBS pods to Node1, Node2 and Node3. Option 3 is my preferred choice, for the following reasons:

- Other application pods will not be scheduled on my storage nodes, whereas Option 1 does present the possibility of other application pods being scheduled on Node1, Node2, and Node3.
- While scaling the cluster for application deployments, I do not have to worry about changing the policy for storage. If I use option4, I must taint the new nodes with respective applications.
- In this scenario, I am worried only about storage nodes, as these have local disks attached to them. I am not restricted to schedule an application pod deployment on any nodes other than storage nodes.
