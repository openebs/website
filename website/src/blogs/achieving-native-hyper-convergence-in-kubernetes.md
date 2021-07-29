---
title: Achieving native hyper convergence in Kubernetes
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 13-03-2018
tags: Hyper Convergence, Kubernetes, Nutanix, OpenEBS, Persistent Storage
excerpt: Hyper convergence has a lot of benefits — which is one reason it has become popular in the traditional infrastructure-centric world of virtual machines with proprietary vendors like Nutanix reaching prominence over the last several years.
not_has_feature_image: true
---

Hyper convergence has a lot of benefits — which is one reason it has become popular in the traditional infrastructure-centric world of virtual machines with proprietary vendors like Nutanix reaching prominence over the last several years.

Kubernetes is nearly ready as a layer enabling hyper convergence, as the compute orchestration is extremely flexible and networking has moved to a largely containerized approach that leverages local resources in attached physical and virtual hosts.

When it comes to storage, however, there are a few pieces that are missing. Once added to Kubernetes, these pieces will unlock a number of benefits to users of Kubernetes including better resource utilization, reduction of noisy neighbor phenomena, simpler management, isolation at the node level thereby reducing the potential blast radius of failures, and, perhaps most importantly, further ownership and management of relevant infrastructure per workload and per DevOps team.

Storage management capabilities in Kubernetes have improved in the last couple of years. For example, there is now clarity around how to connect a stateful application to persistent storage. The constructs of persistent volume claim (PVC), persistent volume (PV), and storage class (SC) along with dynamic provisioners from vendors have clarified how to connect a pod to a storage volume. With these Kubernetes constructs, a large ecosystem of legacy storage found its way to be connected to application pods. Many vendors and open source projects are so excited about this connectivity to cloud native environments that they have taken to calling their traditional storage “[cloud native](https://blog.openebs.io/cloud-native-storage-vs-marketers-doing-cloud-washing-c936089c2b58)”.

In order to explain why new tools and constructs are needed to improve the management of storage media, let’s start by reviewing pod connectivity. Shown below is a pod connected to external storage through a dynamic provisioner interface.

![Need for new tools and constructs in Kubernetes for managing disks](https://cdn-images-1.medium.com/max/800/1*zm4UFgEvTWesM2JoxQF9Cg.jpeg)

In addition, we show the Local PV construct connected to local disks whether spinning or solid state.

Currently the Local PV can manage just a single disk. In a typical hyper-converged solution, more disks would be involved for a given pod. In addition to this single disk limitation, the following are limitations or gaps in the local PV feature.

- Add disks / detach disks to a pod currently requires the pod to be restarted
- Control and access to the storage is itself is limited. There will be a number of benefits of enabling access at times to the level of NUMA and to allowing CPU cores to be attached to the storage pod; keep in mind that these days using all the cores itself can be a challenge and driving up utilization is one of the central attributes of hyper converged systems
- Today there is no standard ability to share the underlying disk. This is particularly important as extremely fast, and relatively expensive, NVMe SSD devices are now readily available and if shared they could be used as a cache for multiple Persistent Volumes
- Lack of any fault management capabilities. Kubernetes needs to be able to receive and manage storage faults such as failures of the underlying disk, changes to the latency of disk IO

With these limitations in mind, we summarize needed enhancements as:

- Capability to pool the disks, and provide an interface to manage the pooling
- Capability to monitor disks, identify faults, forward them to the appropriate receivers

In the drawing above, these requirements are loosely shown as “constructs and tools to manage local disks”. These disk related constructs and tools are largely meant to be managed by Kubernetes cluster administrators and DevOps administrators in a Kubernetes like way.

It may be easier to think about this using human personas. Let’s say a DevOps developer is interested in connecting a working storage volume to their workload. Meanwhile a DevOps admin wants to rely as much as possible on Kubernetes to deliver storage services.

Today, DevOps admins are forced to turning to different storage solutions to create storage classes as opposed to having a generic way of writing solutions around creating storage classes in a k8s native way. The DevOps admin would love to have a native k8s way to create storage classes so that they can standardize on an approach irrespective of the underlying storage systems or even storage cloud services.

![Using and constructing a storage class in Kubernetes](https://cdn-images-1.medium.com/max/800/1*17YT5-GR_JUXEq6qW2SD1A.jpeg)

## Some thoughts on what these new disk related constructs and tools could be

Just like storage connectivity issue is solved with a dynamic volume provisioner, we could introduce pool provisioners into Kubernetes.

![Proposed disk related constructs and interfaces](https://cdn-images-1.medium.com/max/800/0*eM2LjKDvhbl62mjG.)

As shown above, DevOps administrators will have the required tools to design the storage policy decisions. A toolset called is created node-disk-manager to provision, monitor, and manage disks on the node. The disks are then grouped into pools by an interface called pool provisioner. The pool provisioner gives a generic set of APIs to consume the Kubernetes disk objects and create a storage technology specific pools such as OpenEBS cStorPool, OpenZFS zpool, GlusterPool etc.The advantage of representing the pools in native Kubernetes constructs is that Kubernetes native tools can be extended to manage these new constructs.

With these constructs, the end-to-end volume provisioning work flow could be depicted like below.

![New proposed workflow for managing local disks and achieving true hyper convergence in Kubernetes](https://cdn-images-1.medium.com/max/800/1*9bAs7wOPNNGLxELpgP-4FA.jpeg)

## Conclusion:

Kubernetes native constructs and tools to manage and monitor local disks will help move towards achieving true hyper-convergence. We have observed many users in the OpenEBS community are using OpenEBS dynamic provisioner seamlessly and requesting tools to manage the disks and storage pools. We are thinking of adding such tools to Kubernetes itself so that they are available to the larger community. A draft design proposal is available at We are looking forward to proposing and discussing these thoughts with K8S SIG leadership.

We are cooking up some draft proposals in the OpenEBS project before we take the to K8S SIG. Your feedback is appreciated and needed.

### Disk Manager design:

[https://docs.google.com/presentation/d/11GLg21x7G-nMTNw8aNIOhhjW\_-eK19zSI9Xm-0jYHKs/edit?usp=sharing](https://docs.google.com/presentation/d/11GLg21x7G-nMTNw8aNIOhhjW_-eK19zSI9Xm-0jYHKs/edit?usp=sharing)

[https://github.com/kmova/node-bot/blob/3cb83976a5392003d02275f8a94d1860257915f0/design/node-storage-management.md](https://github.com/kmova/node-bot/blob/3cb83976a5392003d02275f8a94d1860257915f0/design/node-storage-management.md)

### Pool Provisioner design:

[https://github.com/kmova/openebs/blob/35fb65540b17ad3da3df270ccc425c4ec417ca12/contribute/design/proposal-cstor-orchestration.md](https://github.com/kmova/openebs/blob/35fb65540b17ad3da3df270ccc425c4ec417ca12/contribute/design/proposal-cstor-orchestration.md)
