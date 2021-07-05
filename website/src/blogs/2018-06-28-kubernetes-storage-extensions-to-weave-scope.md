---
title: Kubernetes storage extensions to Weave Scope
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 28-6-2018
tags: Open Source, Weave Scope, Node Disk Manager, Persistent Volume, Kubernetes
excerpt: It was in Austin KubeCon 2017 that I first got a deep look at Weave Scope, and could not stop falling in love with it. The visualisation Scope provides into Kubernetes resources is simply amazing.
---

It was in Austin KubeCon 2017 that I first got a deep look at Weave Scope, and could not stop falling in love with it. The visualisation Scope provides into Kubernetes resources is simply amazing. It greatly simplifies the tasks of an Administrator in dealing with the clutter of Kubernetes components and helps directly go to the component of interest and start observing and managing it.

Being tasked with the goal of simplifying storage management for Kubernetes, my immediate thought was, why can’t we use Scope for Kubernetes storage? Of course, storage in Kubernetes is a developing area and new features are always coming but the existing adoption of Kubernetes persistent storage volumes(PVs) concept was already pretty large and we thought it warranted extensions to Scope to include PVs.

So we got to and with the help of [Alexis](https://twitter.com/monadic) and the Weave team — we started coding!

We set out multiple milestones for this journey:

- The first one — get the persistent volumes (PVs), persistent volume claims (PVCs) and Storage Classes (SCs) into Scope
- The second one — add snapshot/clone support and start monitoring the volume metrics
- The third one — bring in the disk or SSD or similar as a fundamental resource that is being managed by the Administrator just like they might want to sometimes take a look at CPU and Memory

## Persistent Volumes (PVs)

Most of the time, Persistent Volume Claims (PVCs) are the entry points to increasing the storage. The number of PVCs will be about the same as the number of pods, or slightly less in a reasonably-loaded Kubernetes cluster. The administrator will benefit from having visibility of which POD is using which PVCs and the associated storage classes and PVs. This is especially true if they are using the storage capacity of the Kubernetes clusters themselves. Adding this visibility is precisely is what we did to start.

![PVC-PV-SC-POD Relationship on Scope](/images/blog/pvc-pv-sc-pod.png)

You can see this new visibility in Scope by using the newly-created filter “Show storage/Hide storage” under the PODs section. This filter puts the storage components in perspective with the remaining pods and associated networked-data connections. Users can **Hide storage** when not interested, or to reduce clutter.

We received an enthusiastic welcome to the Scope community from the Weaveworks team. We also found encouragement from [Alexis](https://twitter.com/monadic) and plenty of technical help from [Bryan](https://twitter.com/bboreham) at Weaveworks. The first pull request (PR) was really about adding PV, PVC and Storage Class support, and was merged into the Weave Scope master recently ([https://github.com/weaveworks/scope/pull/3132](https://github.com/weaveworks/scope/pull/3132) ).

![PV-PVC-SC Integration into Scope](https://blog.mayadata.io/hubfs/0_iYXgl-m8oxyXVs1s.gif)

## Future work:

### Snapshots and Clones

CI/CD pipelines are the most active areas in which DevOps are finding stateful applications on Kubernetes to be immediately applicable. Storing the state of a database at the end of each pipeline stage, and restoring them when required, is a commonly performed task. The state of the stateful application is stored by taking snapshots of its persistent volumes and is restored by creating clones of persistent volumes. We believe that offering visibility and administrative capabilities to manage snapshots and clones in Scope is a natural next step.

### Disk Management and Monitoring

Hyper-converged Infrastructure (HCI) has yet to find its rhythm with Kubernetes, largely due to a lack of fully-developed tools for disk management and monitoring. Kubernetes now has a well-accepted method to provision and manage volumes and attach them to disk management. Therefore, the enabling of HCI for Kubernetes will be improved by new tools such as [Node Disk Manager (NDM)](https://github.com/openebs/node-disk-manager), to which, incidentally (humble brag), we are also contributing. With Disk being the fundamental component for storage and the main participant in the chaos engineering of storage infrastructure, it helps to have it visualised and monitored in a proper way. In large Kubernetes clusters (100+) nodes, the disks will be in the thousands. Scope’s resource utilisation panel is a powerful tool that brings in the visibility of CPU and Memory utilisation at the Host, Container and Process level. This is a natural extension to add Disk Capacity, Disk performance (IOPS and throughput) to this resource utilisation tool. Our view is shown in the figure below, that Disk performance can be added.

![Current View of the Resource Utilisation Tool on Scope](https://blog.mayadata.io/hubfs/0_9SozVWeQ2F69fDQO.gif)

Another important aspect of disk management is simply browsing from the application volume all the way to the disk where the data is stored. It is not possible to locate the actual disk of a persistent volume if the underlying storage is a cloud-disk such as EBS or GPD, but if it is a Kubernetes local PV or OpenEBS volume, the volume data vs. physical disks relationship can be identified. This will be useful while managing the hyper-converged infrastructure on Kubernetes.

![(Future work) PODs/Disks and Nodes Relationship at Scope](https://blog.mayadata.io/hubfs/0_WJA8ii6NlaBoS94H.gif)

The above screens are a dirty implementation on a dev branch that is still in process. However, it provides a good, quick glimpse of how a POD’s volume is linked to the associated disks.

_Weaveworks team recently started community meetings led by [Fons](https://twitter.com/2opremio), and it appears to be a great beginning of broader community involvement into the development of Scope. You can access the public meeting notes at_

_[https://docs.google.com/document/d/103_60TuEkfkhz_h2krrPJH8QOx-vRnPpbcCZqrddE1s/edit?usp=sharing](https://docs.google.com/document/d/103_60TuEkfkhz_h2krrPJH8QOx-vRnPpbcCZqrddE1s/edit?usp=sharing)_

## Summary:

Weave Scope is a very useful tool for Kubernetes administrators for visualising and basic administration. With the addition of extensions being added, and a wider community being formed, Scope’s adoption will certainly increase and benefit the Kubernetes eco-system. We are looking forward to being an active contributor to this excellent visualisation tool.

Please provide any feedback here or in the next Scope community meeting. We will be there!

Thanks to [Akash Srivastava](https://medium.com/@srivastavaakash?source=post_page) and [Satyam Zode](https://medium.com/@satyamz?source=post_page).
