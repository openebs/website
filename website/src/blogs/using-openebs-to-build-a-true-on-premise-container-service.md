---
title: Using OpenEBS to build a true on-premise container service
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
tags: AWS EBS, Container as a Service, OpenEBS, Persistent Storage, Kubernetes
date: 28-02-2017
excerpt: The top questions that could be lingering on the enterprise architect mind in an enterprise are
not_has_feature_image: true
---

The top questions that could be lingering on the enterprise architect mind in an enterprise are

- How do I build a true container service in my enterprise?
- Do I really have to depend on the popular clouds such as Google, AWS, DigitalOcean to start my container journey?

Building container services on AWS or GCP is practical today. These cloud platforms provide the infrastructure to start building your container platform. You get VMs for hosting K8s minions and masters and persistent disks (EBS disks or GP disks) to persist the block storage of your applications. If you want to build a similar container service in your enterprise on-premise data center, what are the choices for container infrastructure?

Well, the troubling infrastructure piece to build the true container service in your enterprise is the persistent storage for your applications. No surprise there. VMs or bare metal can be deployed using well-known tools such as OpenStack and KVM, but for deploying EBS or GPD equivalent, you would need something like OpenEBS.

OpenEBS helps the enterprises to build an AWS EBS equivalent or GPD equivalent platforms on-premise. OpenEBS is architected to ease the provisioning and management of persistent volumes at scale. It will have most of the elements of the popular AWS EBS. I had discussed the comparison between AWS EBS and OpenEBS with few community members in our last meetup. The slides are posted at [https://www.slideshare.net/OpenEBS/openebs-containerized-storage-for-containers-meetup-2](https://www.slideshare.net/OpenEBS/openebs-containerized-storage-for-containers-meetup-2)

Containerization of block storage volumes gives the benefit of flexible storage upgrade schedules, treating the storage volume as part of your K8s POD, etc. However, there is more to consider as benefits of OpenEBS. OpenEBS is “Open Source” EBS. A quick feature comparison is as follows

![Comparing AWS EBS & OpenEBS](https://cdn-images-1.medium.com/max/800/1*uu_mIhdqobjf3ftNOtf8KQ.png)

Next, provisioning and consuming persistent volumes through OpenEBS is very similar and simple to that of AWS EBS

In AWS EBS a user creates and attaches a disk to an EC2 instance. The nuances of underlying storage protocols are hidden underneath and not exposed to the consumer/user.

![Connectivity in AWS EBS](https://cdn-images-1.medium.com/max/800/1*zShnxODcXjTNu-X-qsJa5g.png)

Flow of provisioning and consuming persistent block volumes on AWS EBS
In OpenEBS, it is very similar. Once the OpenEBS volumes are expressed as intent in the application YAML config file, the volumes are automatically created on the OpenEBS platform, mounted on K8s minions, and the persistent storage is made available to the application.

Example of OpenEBS volumes getting consumed through iSCSI:

![Connectivity in OpenEBS](https://cdn-images-1.medium.com/max/800/1*Mh9MzX5a_YbV9K_LR8EynA.png)

An example of OpenEBS volumes getting dynamically provisioned and consumed using k8s-openebs provider is shown below

[https://github.com/openebs/openebs/blob/master/k8s-demo/my-nginx-pod-on-openebs.yaml](https://github.com/openebs/openebs/blob/master/k8s-demo/my-nginx-pod-on-openebs.yaml)

The next comparison of OpenEBS to AWS EBS is how the volume snapshots are managed for data protection.

![Snapshots on AWS EBS vs OpenEBS](https://cdn-images-1.medium.com/max/800/1*elAnAeYarCwxeCEyXv_Xow.png)
(***Comparing snapshots management on OpenEBS to that of AWS EBS***)  

As shown above, using OpenEBS, you will have a standard S3 snapshot upload capability so that you can choose your S3 provider. With on-premise S3 technologies like Minio, you can have the container backup infrastructure also as on-prem.

On the advanced features comparison, OpenEBS steps up to match AWS EBS. Granular QoS control, advanced IOPs management features such as using burst and credit IOPS are some of the features that will be home at OpenEBS

![Other features comparison of AWS EBS & OpenEBS](https://cdn-images-1.medium.com/max/800/1*1WGi8-GdTamykwgnJ0lqjw.png)

Building reliable storage platforms in open source is a hard thing. With all the expertise in serving large enterprises, the team seems to be up for the challenge. We hope to see the increasing levels of community engagement in the months to come!
