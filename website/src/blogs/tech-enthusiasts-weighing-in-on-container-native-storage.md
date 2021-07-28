---
title: Tech Enthusiasts weighing in on Container Native Storage
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Docker, Game of Thrones, OpenEBS, Reddit, Statefulcontainers
date: 27-07-2017
excerpt: These redditers are like the nights-watch-men (Operations Team) who are guarding the wall (production services) from army of dead (issues).
not_has_feature_image: true
---

*Full disclosure: I contribute to OpenEBS and I relish GoT (not IoT).*

*This post is inspired by the *[*Reddit thread (r/Docker)*](https://www.reddit.com/r/docker/comments/6l0y3v/persistent_storage_with_docker_in_production/)* discussing implementation approaches for Stateful Containers.*

These redditers are like the nights-watch-men (Operations Team) who are guarding the wall (production services) from army of dead (issues). These redditers are akin to “the tech Enthusiasts” as depicted in the following diagram, who can foresee the challenges and are looking for innovative solutions.  

![Container native storage adaption curve](https://cdn-images-1.medium.com/max/800/1*11EOWUuoRjWn8pZ1uMXidg.png)

With S-less (server and state) architectures on the rise and faster networks at every possible endpoint, we can envision building and deploying services that can scale to yet unseen/unknown/unimaginable magnitude, **but!** (*Ned Stark once told me, that anything said before but*, ..*a GoT in-joke*) **State will be the bottleneck.**

Whatever you do with Compute (S-less) containers, you always need to start and end with Data. Data is State. *State — is the beginning and end! the Alpha and Omega!*

S-less will have no (busine$$) value without State! (*Well, agreed that you can offload the maintenance of State to someone else. But at what cost! Whoever owns the data, owns the $$*)

The real question is where to put the State!

*Probably over-simplifying, but we can save the State using one of the following:*

- *Connected Storage — Further divided into File/Block*
- *Container Native Storage*

**Connected Storage**: save the State external to container hosts and use the Orchestrator Volume Plugins to attach/detach storage from SAN/NAS or Cloud Disks.

There is a huge community (of cash rich vendors, a.k.a Roses, and Lions!) and a majority of enterprises (consumers of storage) locked in with these vendors are working on making this option succeed.

These enterprises are stuck with Roses or Lions not because they love them, but these are the only options that are available to them. This reverberates in the comments of the Reddit thread, here is a gist of the views expressed:

(a) Connecting to NFS or EFS (from AWS)

Applied Use Cases:

- Applications that store data in the file — images or text or backup
- Applications that need shared access to the data from multiple containers, running on different hosts.

Concerns:

- Hard to keep up with the performance and capacity needs of the massively scalable applications
- Seeing Performance Issues — when saving a huge number of small-sized files
- Need to be careful about Data Integrity from shared access. Needs a lot of hand-holding for secured access
- Not a good option for databases or high random write workloads

(b) Connecting to SAN or Cloud Disks (attached locally)

Applied Use Cases:

- Applications that are resilient to underlying storage failures like ElasticSearch/Cassandra
- Databases like Percona/PostgreSQL

Concerns:

- Longer re-build times and degraded windows, as the size of the data increases.
- Connecting one LUN per Container increases the boot-up times up to 10 minutes in worst cases

*Roses and Lions have been there for a very long time, fighting for the dominion of the realms, by any means necessary. But these are summer lands. They are not prepared for the Great Winter that has begun in the North.*

The “tech Enthusiasts” (or the nights watch) have seen the challenges that the massively scaled applications (Winter) can bring and are seeking alternate options.

A handful of vendors like [portworx](https://t.co/Aawo9fr4Dz), [storage_os](https://storageos.com/), [rook](https://rook.io/), [openebs](https://www.openebs.io/) are working on alternate options, what is now being termed as [Cloud Native Storage](https://blog.openebs.io/cloud-native-storage-vs-marketers-doing-cloud-washing-c936089c2b58) or [Container Native Storage](https://storageos.com/storageos-vision-cloud-native-storage-todays-modern/).

*While the blogs above (and many others) dwell into what makes a storage container-native, the one that stands out is — ***the flexibility***.*

*The tech enthusiasts/operations personnel will have the choice of technology used to deliver their services like Kubernetes, DockerSwarm, Mesos — on Google, Amazon, Azure, or Private Cloud with storage that integrates seamlessly with these cloud environments.*

**Container Native Storage:** storage controller functionality is containerized and can co-exist with the containers (even fly with them) across the clouds.

Portworx is leading the pack, has been successful in getting some reference customers (*we are yet to hear from them in the open forums — hard to convince the council at kings landing with just a reference!*)

Some of the apprehensions surrounding this option are:

- writing a new storage layer is hard.
- missing some standard benchmarking tools that can clearly demonstrate the performance boost obtained by this relatively new way of provisioning storage.
- there are questions raised about Rook / CEPH performance for DBs
- dependency on the kernel drivers (this is probably hinting at PortWorx, if I read, between the lines/comments).

*Winter is Here My Lord — We need new alliances!* We need to hear from more Operations and DevOps Personnel grappling with the storage issues.

We need them to spend more time towards sharpening the solutions that are being built for containers using containers in Open Source!

Do contribute and earn your Open Source Karma by weighing in your thoughts at this *[Reddit thread (r/Docker)](https://www.reddit.com/r/docker/comments/6l0y3v/persistent_storage_with_docker_in_production/) or at [OpenEBS Slack](http://slack.openebs.io/) or at the [GitHub/Container-Storage-Interface](https://github.com/container-storage-interface/spec)*
