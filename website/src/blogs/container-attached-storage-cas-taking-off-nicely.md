---
title: Container Attached Storage (CAS) — Taking off nicely
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 28-05-2018
tags: CAS, Kubernetes, Stateful Applications, OpenEBS, MayaOnline
excerpt: I had the fortune of presenting to a group of brilliant folks at SNIA India SDC event last week. This event being in Bangalore, I could sense the heat emanating from technology savvy brains mostly from the storage companies like DELL-EMC, NetApp, RedHat storage, HP storage etc
---

I had the fortune of [presenting](https://www.slideshare.net/OpenEBS/openebs-cas-sdc-india-2018) to a group of brilliant folks at SNIA India SDC event last week. This event being in Bangalore, I could sense the heat emanating from technology savvy brains mostly from the storage companies like DELL-EMC, NetApp, RedHat storage, HP storage etc and the questions at the end of the presentation were a proof of it. Lots of great questions on the lines of “Nice architecture, I never knew storage can be run completely in user space”, “CAS — great topic, I understand the value and benefits, but are not you adding too many containers to the equation?”. In the interest of answering those questions in detail, I thought let me take the most commonly asked ones and answer them in this short article.

## Just a quick recap on CAS:

[Container Attached Storage (CAS)](https://docs.openebs.io/docs/next/conceptscas.html) is a new storage architecture to run the entire storage software in containers and hence in user space. This architecture has many benefits, primary one being “a dedicated storage controller per application” and bring in the possibility of hardening the storage controller for a given application workload. Read more on the benefits at the [CNCF blog](https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/). A typical CAS architecture example is shown below.

![CAS architecture with controller and replica pods for each application](https://cdn-images-1.medium.com/max/800/1*4dJDmPbxxrP-fZK7NZZmYg.png)

Now back to the CAS FAQ, here are a couple:

### Q1: Well, how can you run entire storage in user space? I thought it can never be run in user level because of performance reasons.

For more technical answer, read our [CTO’s blog](https://blog.openebs.io/the-mule-and-the-flash-going-for-a-run-b104acbc74a2) on this precise topic 🙂

Short answer is, we think storage should take advantage of container technology, so in CAS, we run storage as a microservice. The performance will be taken care by using technologies like SPDK, VPP and also taking advantage of the abundant availability of compute cores on the node.

Reality is that, linux kernel, as it is today, cannot deliver all the IOPS from the underlying NVMe flash disks. Do we think kernel can deliver 12 Million IOPS from the 24 NVMe disks ? Of course not, not today !!

In summary, higher performance can only be delivered using CAS architecture, SPDK, VPP and using more CPU cores.

![CAS with SPDK leads to higher performance](https://cdn-images-1.medium.com/max/800/1*aKjepAaB5sIZF-hOq_dxIg.png)

### Q2: In CAS, you are adding more containers to the cluster because of storage. Isn’t that increasing the compute needs of the Kubernetes cluster ?

CAS enables native hyper convergence capability on Kubernetes. You don’t need an external storage array to manage the storage/data needs of applications on K8S, thats a lot of saving of CPU and hardware. With CAS, the overall TCO reduces as the additional storage (local disks), CPU and software (CAS) are provisioned on the same K8S cluster nodes and avoids the need of expensive external storage arrays.

As for the the question of dealing with large number of containers is concerned, there are nice tools like Weave Scope which you can use either on the local K8S or in a free service like MayaOnline. Check out [MayaOnline](https://www.mayaonline.io) where the storage extensions to Scope are put to use.

![Application relationship with storage (PVC, PV, SC, and CAS)](https://cdn-images-1.medium.com/max/800/1*RQYjI0MdsXf1kj8AGqLJZA.png)

## Conclusion:

We continue to say — With CAS, storage fades away as a concern !! Join our [slack community](https://slack.openebs.io) to find more !!
