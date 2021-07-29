---
title: OpenEBS — The containerized storage
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 01-01-2017
tags: DevOps, Docker, Kubernetes, Rancher, Golang, OpenEBS
excerpt: In the infrastructure space, the compute environment is always the first to lead the change. Docker has brought in the new thinking into every DevOPs administrator and application developer.
not_has_feature_image: true
---

In the infrastructure space, the compute environment is always the first to lead the change. Docker has brought in the new thinking into every DevOps administrator and application developer. CIOs across the spectrum are beginning to include Docker into their policies. As the IT environment begins to adopt containerization into mainstream, there are holes that still need to be plugged in, specifically in the storage space.

I am excited to write the first details on OpenEBS ([www.openebs.io](http://www.openebs.io/)) project.

After 4 amazing years of building commercial storage products, I recently took a giant leap into the open source model of building infrastructure software. We recently launched OpenEBS project with the goal of building the developer friendly storage using coolest available infrastructure pieces underneath .. be it Docker, k8s, Rancher LongHorn, Nomad, Terraform, etc.

## So, what is OpenEBS, in short ?

OpenEBS offers persistent block storage with the following features:

- Containerized block storage using Docker containers. We call them VSMs or Virtual Storage Machines, a concept similar to k8s PODs.
- A highly scalable storage orchestration platform that spins the storage volumes seamlessly and manages them effortlessly
- A simple, yet high performing distributed block storage designed with best caching via the NVMe optimizations

## Why containerized storage?

Simple answer is that even the storage volumes have software associated with them for their regular functions and this software needs to be managed at volume level.

![Monolithic vs Containerized Storage](https://cdn-images-1.medium.com/max/800/1*OoQnpEsGf_ovb5BFnGI8hA.jpeg)

When software upgrades happen at storage host level, all volumes' behavior will change simultaneously, which may not be the desired result. Similarly, upgrade maintenance windows may not be the same for all applications or storage volumes. We often observe that it is very difficult to get a convenient window that satisfies all storage volumes or associated applications.

With containerized storage, storage upgrades becomes simple and easy, just like application upgrades with Docker containers.

## Maya, our new storage orchestration platform

Kubernetes, Docker swarm, Rancher cattle, Nomad and other orchestration platforms do a good job of managing the lifecycle of compute containers and initial provisioning of network and storage. However, the storage infrastructure management, when scaled is a big beast in itself. Storage volumes need to be persistent to the application but they need to be volatile in the backend. Storage volumes need to be scheduled on various hosts based on the capacity and IOPS availability and these volumes may need to be moved on the fly as the usage goes up.

_Maya in Sanskrit language means “\***\*Magic\*\***”. Maya will seamlessly integrate storage management functionality into existing container orchestration layers for provisioning, scheduling, reporting, rolling upgrades etc., and provide storage specific capabilities like data protection capabilities, migrating storage etc.,_

## The building blocks of high performing, distributed block storage:

**_Rancher longhorn:_** We chose to adopt and enhance Rancher longhorn as the basic building block of storage block intelligence in OpenEBS. I will write a separate blog about what is longhorn, it’s features and why we chose longhorn, but in short, longhorn employs a clever and simple approach to container data connectivity, data availability (replication), data protection (snapshot). And longhorn is written in GoLang.

**_Gostor gotgt:_** One of the initial front ends for OpenEBS is of course the iSCSI. We chose gostor/gotgt as a good starting point. OpenEBS plans to add many new capabilities to gotgt like clustering support, performance optimizations etc.

**_Bulk Caching layer through NVMe:_** The caching layer that we see in traditional storage systems is usually small in size. The recent advancements in flash technology made it possible to offer large capacities of flash at affordable prices. Now cost is not a deterrent to have terabytes of low latency flash storage. OpenEBS provides an intelligent caching technology which keeps the hot data in the large NVMe flash layer. Intel’s 3d XPoint is a good fit for this technology.

## Community:

Community is paramount. We hope to embrace a lot of friends, advisers, experts in this journey and successfully deliver the OpenEBS promise. Drop by at our [gitter channel](https://gitter.im/openebs/Lobby) and say Hi !
