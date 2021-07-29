---
title: Emerging Storage Trends for Containers
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 11-01-2017
tags: DevOps, Docker, OpenEBS, Startup, Storage
excerpt: The smiling docker whale is everywhere these days. You either have ridden on it or you want to know how to ride on it. As far as operations teams are concerned the docker whale is just teasing them.
not_has_feature_image: true
---

The smiling docker whale is everywhere these days. You either have ridden on it or you want to know how to ride on it. As far as operations teams are concerned the docker whale is just teasing them. In the recent meetups and conferences I attended here, very few hands rise when asked if they have deployed containers in production.

Well, it has taken over a decade and half at least for the shift from servers to virtual machines. And even now, I see a lot of caution in the enterprises to move completely into the public cloud. Though the technology around virtualization is well established, the real return$$ of moving onto public cloud aren’t as great as initially expected.

A similar transitional trend, but at a much faster pace is being seen around the containers. Docker has done a phenomenal job in breaking the entry barrier for playing with containers, by addressing the Container Eco-System components for Developers to quickly build, test and package the applications via containers.

![Interest over time](https://cdn-images-1.medium.com/max/800/1*c8cxwXMmU93xXAiK4Rs0BA.png)

While it is very easy to setup and run containers, are dockers really ready for the production work load? The following diagram pretty much sums it up.

(Credit: [http://bicarait.com/2016/11/01/running-your-docker-using-vsphere-integrated-container/](http://bicarait.com/2016/11/01/running-your-docker-using-vsphere-integrated-container/))

![Containers in development & production](https://cdn-images-1.medium.com/max/800/0*nDL6ATRys2vPH8m9.png)

Learning from the recent past, the cloud was led by the compute virtualization, but it wasn’t a true cloud until the network and storage also were fully virtualized, giving way to software-defined Storage and software-defined Networking. These days it is about SDDC, which involves significant improvement in the orchestration of infrastructure and the services running on them. For those of us that have contributed and implemented the cloud, and operated them in production — the journey was exciting and in some instances nail biting!!

I keep hearing developers say, I don’t care about the infrastructure. That’s great, but it just means that someone else is taking care of it, usually the operations team! I wonder if the DevOps is bringing developers closer to operations or Operations closer to Developers? I bet it is the Operations Team getting closer to Developers and making the life of Developers much easier.

The Developers are excited about the stateless containers or server-less architectures or lambda services. All of these are great architectural patterns, but all these eventually depend in some form on some stateful containers or servers that are running over robust infrastructure with extremely low latency.

The Operations Teams are the one that need to define this robust infrastructure for running the containers. Unlike VMs that were provisioned (or self provisioned on designated infrastructure) for specific use-cases, the container infrastructure must come with a brain of its own, where the containers are provisioned and moved depending on the load and performance parameters.

An application or service in the container world, will be a set of interconnected containers (stateful or stateless — much like a K8s Pod), that will require compute, network and storage. And for these Application Pods to be portable, the infrastructure also needs to move along with them. It is time for programmable infrastructure to go mainstream. Just as virtualization paved way for software-defined networks and software-defined storage, we are now seeing the need for container defined network and container defined storage.

For a recent [Bangalore Docker meetup](http://neependra.net/?p=2141), I took a shot at looking through the various storage startups that are trying to build storage for the containers. The slides are available here : [Emerging Storage Trends for Containers](http://www.slideshare.net/kiranmova/emerging-storagetrendsforcontainers)

The storage trends can be summarized as follows:

(1) (Slide#22) **Elastic Storage Infrastructure** — The storage can be horizontally scaled, much like the docker hosts in docker swarm. The technology to implement the Elastic Storage is already in production with many vendors supplying **_Software-Defined Scale-out/Distributed Storage_** in the cloud environments.

(2) (Slide #23) **Ease of Accessing the Storage**— The volume of volumes required by the containerized applications will be manyfold compared to volumes used in the VM storage. And the volumes will be more portable. Operations team should be shielded from having to mount/unmount volumes or datastores. **_The integration into the orchestration layers for mounting the storage and providing access to the volumes, without requiring additional software changes will be paramount._** The TCMU/iSCSI, NBD/NFS interfaces are two different approaches with each coming with its own nuances w.r.t isolation vs ease.

(3) (Slide #24) **Hyper Converged Storage** — For storage to be hardened, the developer setups need to be and **_avoid managing silos of infrastructure for compute, network, and storage._** The concept of lightweight storage software will emerge which will mount distributed external storage or cloud storage onto the local machines (with caching).

(4) (Slide #25) **Hybrid Clouds / Storage** — Put the storage in the right place and move it around depending on the demands of the application and economics. A first in this place would be to move the snapshots into S3 when the persistent disks are used for stateful containers. The industry has established that to save money, a mix of clouds is going to be used with the apps moving into different container environments. The storage platform should be able to run alongside different clouds or have the ability to inter-operate. **_Seamless Storage Migration within and across clouds is a must._**

(5) (Slide #26) **Containerized Storage** — One of the best innovations is the way the containers are defined and deployed. The storage software also will reap these benefits by containerizing the storage. **_Version of the storage being used will become another parameter to be defined in the intent specs along with capacity and performance (QoS)._** Containerization also helps with isolation and ease of upgrades in shared environments.

(6) (Slide #27) **Keep up with the core storage innovations** — Flash is already mainstream, with CIOs questioning if they still really need the SAS Tiers. With NVMe, cache is becoming more accessible both in terms of $$ and the performance boost it can provide to the Storage Software. **_The low latency demands from the containerized applications will be guaranteed via the use of NVMe Flash for read/write caching of data that is possibly stored on disks or remote cloud storage._**

It is euphoric to see the new developments being made in the opensource for the storage, networking, and orchestration layers, apart from the container runtime itself!

2017 may well be year where we will start seeing containers in production as the infrastructure pieces for Containers mature.
