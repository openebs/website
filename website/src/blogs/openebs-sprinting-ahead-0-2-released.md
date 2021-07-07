---
title: OpenEBS sprinting ahead, 0.2 released
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Containerized Storage, Docker, Kubernetes, Microservices, OpenEBS
date: 10-04-2017
excerpt: I am delighted that we have been able to push the OpenEBS 0.2 release for community consumption, a version that demonstrates that storage controllers can be containerized.
---

I am delighted that we have been able to push the [OpenEBS 0.2 release](https://github.com/openebs/openebs/releases/tag/v0.2) for community consumption, a version that demonstrates that storage controllers can be containerized. This release comes with k8s flex volume driver called “openebs-iscsi”

The past week has been very exciting for the OpenEBS Team — engaging with container technology evangelists, enthusiasts, and users at the [Bangalore Container Conference — BCC 2017](http://www.containerconf.in/), followed by a very interactive meetup on the [Containerized Storage for Containers](http://www.containerconf.in/) with [Evan Powell](https://twitter.com/epowell101), [Ian Lewis](https://twitter.com/IanMLewis), and my fellow Bangalore Entrepreneurs and OpenSource fans.

By containerizing the storage functionality, the OpenEBS delivers the core storage capabilities like block-layout and its management, data protection, consistency, and availability as a “microservice”, thus bringing the advantages of containers to the storage volumes. Containerization also helps in dynamic provisioning at scale, scale-up/down the storage cluster, monitoring, ease of upgrades, etc.

We understand that generic orchestration engines will not solve all the problems of storage orchestration. We are augmenting container orchestration engines with the storage intelligence by the OpenEBS orchestration layer — maya. In line with this vision, the 0.2 release has implemented m-apiserver that acts as an interface to the Volume Plugin drivers to provision the storage, while it takes care of interacting with the Container Orchestration Engine to find the right placement for the Storage Containers (VSM).

OpenEBS 0.2 can be used to setup an Amazon EBS-like Block Storage Service for your containers, and consume block storage for your Stateful applications.

![OpenEBS 0.2 setup](https://cdn-images-1.medium.com/max/800/1*itiDxdwyTmdd9VsIYwFYiA.png)

The Ops team can easily setup an OpenEBS cluster using Bare Metal Machines or VMs, just like setting up Kubernetes Cluster. The Kubernetes minion nodes should be configured with the FlexVolume OpenEBS Driver (openebs-iscsi) to use OpenEBS Storage.

The DevOps or the Developers can configure Storage to their Stateful Apps from OpenEBS cluster by having their Application intent files point to OpenEBS Maya API Server.

OpenEBS is a completely OpenSource Project that is being driven by the feedback received from the community. In our next milestone 0.3, we are working towards making OpenEBS hyper converged with Kubernetes. Enhance the capabilities around Core Storage for using an additional type of disks for storing block data, providing the controls to the user to perform backup/restore to Amazon S3, etc., Do take a moment to check out our [Project Tracker](https://github.com/openebs/openebs/wiki/Project-Tracker).

If you are as cautious and skeptical about technology as me, then seeing is believing. To help you quickly get started, we have created Kubernetes and OpenEBS 0.2 Vagrant Boxes.

[Try OpenEBS 0.2 today](https://github.com/openebs/openebs/blob/master/k8s/dedicated/tutorial-ubuntu1604-vagrant.md) and let us know what you think!

Hangout with us and help us with your valuable feedback at [slack.openebs.io](http://slack.openebs.io)
