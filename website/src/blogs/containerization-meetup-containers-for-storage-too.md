---
title: Containerization meetup - Containers for storage too
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 15-01-2017
tags: Containerized Storage, Docker, Kubernetes, OpenEBS, Storage Containerization
excerpt: I had the opportunity to talk to a very good group of technologists, DevOPs users in the Digital Ocean Containerization Meetup . Docker 1.13 details and Kubernetes deployment tips were fantastics.
not_has_feature_image: true
---

I had the opportunity to talk to a very good group of technologists, DevOPs users in the [Digital Ocean Containerization Meetup](https://www.meetup.com/DigitalOceanBangalore/events/236353004/) . Docker 1.13 details and Kubernetes deployment tips were fantastics.

I talked about the containerization for storage. The presentation slides are published [here](http://www.slideshare.net/UmasankarMukkara/openebs-containerized-storage-for-containers). Slide #6 talks about the advantages when the storage volumes are containerized, just like the advantages when the applications are containerized. In the storage containerization, the storage software becomes a micro service. Storage protocol (iSCSI in this case), replication, QoS, Encryption are micro services that are better managed and served when containerized. This form of containerization leads to a true non-disruptive storage upgrade possibility in production.

Imagine, there are thousands of storage volumes in production serving thousands of containerized applications. If a storage upgrade has to happen that actually is needed only few volumes, such as a special snapshot or encryption feature or bug fix, then only those containers need to be upgraded. The maintenance window scheduling will be the simplest in such scenarios. To make this possible, OpenEBS abstracts the storage functionality into the user space (slide #7) and each volume is dedicated with a separate storage process in the form of containers… Micro services architecture to the storage, delivered.

I also talked about the building blocks of OpenEBS.

OpenEBS uses or builds on:

- Docker — for achieving containerization. [Jiva](https://hub.docker.com/r/openebs/jiva/) is the docker image
- Longhorn Rancher — For basic storage replication and distributed scale-out needs. QoS, encryption comes from here.
- Nomad — Clustering capability among storage hosts as well as storage pods or VSMs is served by Nomad
- Consul — for the cluster db
- Flannel — for the container networking needs. We use the flannel’s intelligence for picking up the IP addresses for VSMs automatically, VLANS and other networking stuff. The database portion of flannel is not needed as OpenEBS has the centralized config db for Maya (consul implementation)

![OpenEBS Building Blocks and Integration](/images/blog/containerization-meetup-building-blocks.png)
As far as the integration points of OpenEBS are concerned, the provisioning in integrated into k8s. The provisioning of the OpenEBS can be done through the [K8s iSCSI volume interface](https://kubernetes.io/docs/user-guide/volumes/#iscsi) or through the [K8s AWS EBS interface](https://kubernetes.io/docs/user-guide/volumes/#awselasticblockstore). Yes, OpenEBS exposes AWS EBS API. Any orchestration layer or application that knows to connect to and use AWS EBS, will work with OpenEBS.

As we progress from this early stage, we look forward to work closely with the Docker and k8s user communities.
