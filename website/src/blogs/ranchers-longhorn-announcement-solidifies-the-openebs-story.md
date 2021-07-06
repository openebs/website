---
title: Rancher’s Longhorn announcement solidifies the OpenEBS story
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
tags: Docker, OpenEBS, Rancher, Stateful Applications, Longhorn
date: 18-04-2017
excerpt: Today, Sheng Liang unveiled project Longhorn as a new way to build distributed block storage for cloud and container-based platform.
---

Today, Sheng Liang [unveiled project Longhorn](http://rancher.com/microservices-block-storage/) as a new way to build distributed block storage for cloud and container-based platform. We, the OpenEBS team, are thrilled with this news as it solidifies our decision of using Longhorn as the underlying block storage system for OpenEBS.

When I reviewed the OpenEBS vision with Sheng late last year, he introduced me to Longhorn project and asked me to study it and use it if it makes sense for OpenEBS. Clearly, Longhorn was sharing the OpenEBS block storage vision and we soon launched OpenEBS with Longhorn underneath.

What I liked most about Longhorn was the nice separation of block protocol stack (Longhorn controller) and the actual block storage (Longhorn replica). This helped us containerize the storage software completely and efficiently. An OpenEBS VSM, or a storage pod, will have containerized longhorn controller and replica(s).

Another cool thing about Longhorn implementation is that it’s controller sits closer to the application docker containers thus enabling hyper-converged mode of deployment and it’s replica sits closer to the underlying storage with a simple sparse file based system for block data management.

It is so nice of Sheng to mention OpenEBS’s usage of LongHorn. We will continue to contribute to the performance tuning of LongHorn, improvements to S3 integration, rebuilding logic of replicas, etc

### OpenEBS is an extension to the idea of Longhorn

Sheng Liang, in his blog, talks about Longhorn and other storage systems.

“*We wrote Longhorn as an experiment to build distributed block storage using containers and microservices. Longhorn is not designed to compete with or replace existing storage software and storage systems…”*

As believers in the idea for which Longhorn is written, we are building OpenEBS as credible enterprise storage with Longhorn at it’s core. As part of the journey with CloudByte ElastiStor, where we have containerized the storage volumes a few years ago, we picked up tremendous amount of real world experience in delivering enterprise storage to the customers. All this experience is being put into work at OpenEBS. OpenEBS will have most of the enterprise features that Sheng mentions, if not more. Some of them will be “scalable and reliable distributed file systems, a unified storage experience, enterprise data management, crash consistency, near disk performance, etc”.

Again, a ton of thanks to the awesome folks who contributed to the development of Longhorn. With this announcement from Rancher, we are hoping to see more usage of Longhorn and OpenEBS. We are all ears to the community for any suggestions on OpenEBS and its usage of Longhorn ([slack.openebs.io](http://slack.openebs.io)).

Long live Longhorn!!
