---
title: OpenEBS Building blocks — Rancher Longhorn
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 06-01-2017
tags: Container, DevOps, Longhorn, OpenEBS, Docker
excerpt: In the previous blog post, I shared the initial details of OpenEBS. In this post, I will continue to discuss the OpenEBS technology building blocks and touch upon the details of Rancher longhorn and why we chose longhorn.
not_has_feature_image: true
---

In the [previous ](https://blog.openebs.io/openebs-the-containerized-storage-f76e394a9543#.vaquo22zw)blog post, I shared the initial details of OpenEBS. In this post, I will continue to discuss the OpenEBS technology building blocks and touch upon the details of Rancher longhorn and why we chose [longhorn ](https://github.com/rancher/longhorn).

OpenEBS platform contains three core building blocks:

- An orchestration platform, Maya, that works with Kubernetes and manages thousands of volumes with ease.
- Containerized storage volumes called Virtual Storage Machines or VSMs and
- Maya managed backing stores or data stores residing either locally on OpenEBS hosts or remotely over network

**_Just to recap, why storage containerization?_** With storage containerization, the storage upgrades are flexible, easy, and effective. The containerization of storage means that the core functionality of storage (like front end protocol ISCSI, snapshotting, replication, backup) is abstracted into a Docker container and managed outside the kernel. A software patch to correct or enhance the replication behavior of a volume does not affect the other volume in the same host. Each of these Docker containers do a specific job of either running [gotgt ](https://github.com/gostor/gotgt)iSCSI or running a [longhorn ](https://github.com/rancher/longhorn)replica. The storage software is built as [Docker image](https://hub.docker.com/r/openebs/jiva/) and is the core/essence of OpenEBS technology. Hence, we named it “Jiva” (meaning “life”, [Wikipedia](https://en.wikipedia.org/wiki/Jiva)).

**_About VSM:_** Virtual Storage Machine is the logical set of storage pods that encapsulates the entire functionality of the life cycle of a volume. The components of an OpenEBS VSM is shown in the below picture.

![Fig: OpenEBS VSM components](https://cdn-images-1.medium.com/max/800/1*-Bl0JyjyNdVe_bp6YI-n6w.png)

A VSM contains as many storage pods as the number of data copies of the volume. Each storage pod has at least one container for replica and optionally has a container for exposing the storage access protocol (iSCSI, NBD etc). We are using a fork of rancher/longhorn software to manage the replication among the storage pods and a fork of gostor/gotgt software to provide iSCSI interface.

## What is longhorn ?

Longhorn is a simplified block storage software, implemented in golang, that stores the entire volume as a single linux sparse file. The sparse files provide thin provisioning behavior. Formatting with QCow2 adds the CoW feature to the data. It is lean and provides an AWS EBS style snapshot functionality. Longhorn has two subcomponents, longhorn controller (LHC) and longhorn replica (LHR). LHC takes care of storage connectivity, replication, rebuild, encryption, etc while LHR does snapshotting, backup, QoS, etc.

LHC and LHR can be deployed in two modes.

- _Hyper-converged container model,_ where LHC and LHR are on the same host as that of compute or Docker Host. TCMU is used for block storage volume drive emulation on Docker Host.
- _Remote storage model,_ where LHC and LHR are on separate storage host. The compute Docker Host connects to LHC using iSCSI. iSCSI client is used for block storage volume drive emulation on Docker Host.

These two models are shown below

#### LHC and LHR are on the Docker Host

![Fig. Longhorn deployment mode : Hyper-converged](https://cdn-images-1.medium.com/max/800/1*nlswAfJqgqaWRJpKYLr_jA.png)

_Note: Minimum linux kernel version required for hyper-converged mode is 4.4_

## LHC and LHR are on the remote Storage

![Fig: Longhorn deployment mode : Network storage](https://cdn-images-1.medium.com/max/800/1*wB_PG-Y_jZm8lMmSzKJAww.png)

A third mode is also possible, where LHC runs on the Docker Host and LHR runs on the remote storage host, the discussion about this is for a later day.

Longhorn replica uses 4K as the underlying block size and is a chain of differencing disks among the live data and snapshot data. The backup is done in a AWS-EBS style, where only the changed blocks are copied to the remote location (like S3) using 2M block size.

## Why we chose longhorn for OpenEBS?

We wanted to implement a simple block storage engine, in user space, that can be containerized. Rancher had spent quite an amount of effort in just doing that. It is written in golang too. We found it to be thin, working, and fit. We integrated gotgt and longhorn for the basic use case of OpenEBS. We are thrilled to find great support from longhorn team in this journey. Thank you, Rancher. Though [openebs longhorn](https://github.com/openebs/longhorn) is forked at the moment from Rancher longhorn, we intend to push back the changes to the mainstream longhorn and contribute there. We plan to add the functionality of flash caching, S3 integration, RDMA support, cache tier-ing to remote storage, etc to longhorn in the days and months to come.

The next blog post will discuss the deployment modes of OpenEBS with containerized longhorn or jiva.
