---
title: Announcing MayaOnline — A SaaS platform for freeing data management from its traditional…
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 01-05-2018
tags: Gitops, Kubernetes, Mayaonline, OpenEBS, Stateful Workloads
excerpt: At this Kubecon, we, at MayaData, are thrilled to make couple of announcements. One of them is the launch of beta version of MayaOnline.
---

At this Kubecon, we, at MayaData, are thrilled to make couple of [announcements](https://www.prnewswire.com/news-releases/mayadata-releases-litmus---open-source-chaos-engineering-for-kubernetes--free-tier-of-mayaonline-681458381.html). One of them is the launch of beta version of [MayaOnline](https://mayaonline.io). MayaOnline provides **free** visibility, ChatOps and cross-cloud control for users running OpenEBS or just local disks on Kubernetes clusters.

MayaOnline provides application developers, Kubernetes administrators and CIOs different variants of visibility into stateful applications data and helps these users to better manage data operations.

It has become an almost untold expectation that the modern era tools being built for easing / helping DevOps are built with easy integration into GitOps; change controlling configurations much in the way that code is managed has been identified as a key determinant of success. MayaOnline takes the GitOps philosophy into its design; configurations come from single source of truth — Git repositories.

Talking about simple integrations — we also have made APIs first class citizens in the design of MayaOnline. Almost anything you can do via the GUI you can do via APIs.

Kubernetes’ stateful applications journey is still evolving. We observe two primary usage patterns.

1. Perhaps the most common pattern is running stateful workloads with the help of open source storage that is easy to use and operate; if the open source storage delivering capabilities to microservices and containers is itself built from microservices and containers — all the better.. OpenEBS is a leading example of this pattern, with an architecture described as [CAS](https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/) or container attached storage. In OpenEBS, data volumes are containerized and each workload has its own storage controller enabling teams to be fully in control of their storage without any central single point of failure (or latency)
2. A second common pattern that we see is perhaps best characterized by NoSql workloads such as Cassandra, that manage the data operations themselves (replication, snapshotting and rebuilding) and therefore for which just raw storage underneath is good enough. This type of stateful workloads are starting to use Kubernetes Local PVs. However, the raw storage needs to be planned, monitoring and managed for Local PVs too otherwise your Cassandra and application engineers spend all their time trying to figure out why the ring is rebalancing again and again.

**_MayaOnline is intended to be an all in one storage resource planning, monitoring and management solution for Kubernetes deployments across clouds; we do support the above patterns, allowing you to manage OpenEBS and Local PVs as the underlying storage choices._**

MayaOnline is released as a beta version today and comes live with the following features. In this post, I discuss MayaOnline’s current capabilities and delve a bit into the vision as well.

## Sifting through your PVCs and PVs:

Microservices architectures typically split applications into multiple Kubernetes PODs. It is not uncommon to have a production Kubernetes cluster with hundreds of PODs, in some cases even thousands. Each POD can have multiple volumes claims (PVCs), derived from a combination of storage classes (SCs) and resulting in volumes (PVs). Thanks in large part to our newly released Weave Scope integration, MayaOnline provides an efficient way to view, debug and for some scenarios manage these PVC and PVs and their relationships.

One simple use case is sifting through the snapshots of a volume and creating a clone out of one.

![Browse storage configuration of a cluster](https://cdn-images-1.medium.com/max/800/1*uEEzklDvtzepvdjGUIQdJQ.gif)

## Managing hyper-convergence:

The same problem of sifting through hundreds of objects and their logical and physical relationships can arise while managing underlying storage media, including disks, cloud volumes, SSDs, and more. MayaOnline helps here as well, simplifying disk monitoring and management, the pooling of disks, expansion of capacity . OpenEBS NDM is a key piece go get the hyper-convergence management right, you can refer to [this blog](https://blog.openebs.io/achieving-native-hyper-convergence-in-kubernetes-cb93e0bcf5d3) for more thoughts on contributing NDM to Kubernetes itself.

![Browse disks relationship to a volume](https://cdn-images-1.medium.com/max/800/1*7w2jYA2KghNxT7c96snCxw.gif)

## Visibility:

Prometheus is a popular project applying a time series approach to monitoring. We use Prometheus in MayaOnline in a variety of ways. Thanks to Prometheus Developers, Operators and CIOs have readily customized dashboards for volume data and for storage resources data within and across clusters. MayaOnline makes it easy to aggregate Prometheus metrics from various clusters spread across multiple clusters and on-prem data centers. External API support, customization of Prometheus dashboards, and the creation of new dashboards are other favorite features of MayaOnline.

![Comprehensive metrics of a volume, cluster and organization](https://cdn-images-1.medium.com/max/800/1*ZeFadSNW8zEQ9DWaotiOhA.gif)

## ChatOps — Dedicated chatbot for automated operations:

Getting useful alerts on time and be able to act on them is an integral part of data management operations. With MayaOnline, one can view and manage the alerts centrally by logging onto MayaOnline — or can just have them pop up in your chat thanks to our dedicated chatbot, which we call MuleBot. MuleBot is a [Slack application](http://slack.com/apps/A7XH78AAH-mulebot) that works hard to deliver alerts to the Slack channels you want while participating in your GitOps workflow by interacting with your teams end users, allowing them to storage infrastructure right from the slack channel.

![MuleBot Slack Application](https://cdn-images-1.medium.com/max/800/0*U47i8j0o34sBq3AW.)

## Looking into the future of MayaOnline:

### Seamless cross cloud data movement:

Though Kubernetes solves the problem of cloud lock-in with regard to application provisioning and management — by being a common orchestration framework and set of operations APIs across environments -, we still have the problem of lock-in caused by data gravity. MayaOnline’s cMotion feature — which we are working on actively and have demoed in the past — will help with seamless and policy based workload movements. cMotion APIs at MayaOnline will be used to automate workload movement across clouds or Kubernetes clusters right from the user’s DevOps platforms.

### Learning workloads

One of the reasons we made MayaOnline freely available is to learn from users how they use OpenEBS and, more broadly, how they are managing stateful workloads on Kubernetes.

In the not too distant future we will use what we learn from MayaOnline to nudge users towards better approaches. For example, we are investigating how to suggest better storage policies based on our experience from many users. For example, certain workloads may benefit from larger block sizes and a replication approach optimized for videos — OpenEBS allows this kind of extreme customization thanks to its CAS architecture; with MayaOnline we intend to coach users towards better approaches.

### It is free. Import your Kubernetes cluster today !

MayaOnline follows a [freemium](https://en.wikipedia.org/wiki/Freemium) model. Using the free tier, one can manage certain number of Kubernetes clusters for free, forever.

Sign-up with your github credentials and import your Kubernetes cluster, we are eagerly looking for your feedback !!
