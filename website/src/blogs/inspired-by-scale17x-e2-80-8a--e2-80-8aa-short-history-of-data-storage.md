---
title: Inspired by SCale17x — a short history of data storage
author: Evan Powell
author_info: Founding CEO of a few companies including StackStorm (BRCD) and Nexenta — and CEO & Chairman of OpenEBS/MayaData. ML and DevOps and Python, oh my!
date: 11-03-2019
tags: DevOps, OpenEBS, Kubernetes, Open Source
excerpt: Last weekend I had the pleasure of attending SCale 17x in Pasadena, just outside Los Angeles. Whether it was Robert Treat’s excellent talk on logical replication for PostgreSQL or refreshing my knowledge of Terraform
---

Last weekend I had the pleasure of attending SCale 17x in Pasadena, just outside Los Angeles. Whether it was Robert Treat’s excellent talk on [logical replication for PostgreSQL](https://www.socallinuxexpo.org/scale/17x/presentations/postgres-logical-replication-lets-do-it-live) or refreshing my knowledge of Terraform thanks to the [dynamic and even funny instruction](https://www.socallinuxexpo.org/scale/17x/presentations/terraform-50-minutes) of [Rami Al-Ghanmi](https://twitter.com/alghanmi),  it was a great weekend filled with high-quality discussions. Kudos to Ilan and the rest of the all-volunteer organizing staff. Most importantly, it was a chance to run into friends, gather the MayaData/OpenEBS team together, support our CTO Jeffry as he told the story about [CAS (a great, deeper dive into the why and how of CAS)](https://www.socallinuxexpo.org/scale/17x/presentations/container-attached-storage-cas-openebs) and meet countless engineers, especially a bunch in the PostgreSQL, Percona, MariaDB, and MySQL communities.

Perhaps my favorite moment was when I introduced myself during the DevOps LA taco night and the immediate reaction from a lead developer at a large analytics company was:

“Oh holy #hit, OpenEBS and CAS — we need this stuff; working on it now as we move onto Kubernetes!”

As the conversation continued, a couple of questions emerged:

1. How mature is it?
2. Where did the idea come from?

Regarding #1 — *maturity* — I think the growth of references on the community and our work at [www.openEBS.ci](http://www.openebs.ci/) to test every commit to master in public across many environments with many workloads both speak to the ongoing polishing and maturity of OpenEBS. I won’t dig too far into that subject, but I will say it is a lot more mature than many hacked together attempts at simply using a local PV. However, it is still <1.x.

You can read more about our efforts to mature OpenEBS and its docs and related management software in our founder’s recent blog post on the 0.8.1 release:

[https://blog.openebs.io/openebs-releases-0-8-1-with-stability-fixes-and-improved-documentation-374dd6b7c4a5](https://blog.openebs.io/openebs-releases-0-8-1-with-stability-fixes-and-improved-documentation-374dd6b7c4a5)

Maturity and polishing is our top area of focus, and it is coming along quickly with the help of additional users and our dedicated, well-experienced engineering team. The next time you see them [on slack](https://openebs-community.slack.com/), please say thank you; the effort level by all involved is phenomenal.

Regarding #2 — *where did the idea come from* — when trying to answer that question, I often roll the tape back a bit to see where storage has come from.

We put together a few slides that offer a light-hearted approach to answering this question.

**The Era of Slow Disk Drives and Scale-up Architectures**

![Slow Disk Drives and Scale-up Architectures](https://cdn-images-1.medium.com/max/800/0*6SPflCuTGC2rWXmH)

So, rolling the tape back to the 2000s, there were at least a few major differences as the slide expresses.

1. At the bottom were slow disk drives; striping was required for adequate performance.
2. Apps were not built for failure — users expected the storage to be bulletproof; on the other hand, once you got the App working, it wasn’t going anywhere, it was a monolith that could be tightly bound to the hardware and to the network attached storage.
3. Along those lines, your apps were definitely not built to run on a public cloud service. They ran on a box, in your data center.

Back then, it all sort of made sense. You needed software and systems that could combine many servers and disks into a highly resilient system to make sure your monolith continued to operate.

**What has changed and how is that changing the data layer?**

![Flash and NVMe extremely fast. Striping slows them down. DAS beats storage](https://cdn-images-1.medium.com/max/800/0*ZJ8CaKQdxEesL7eE)

Storage was disrupted by flash. But now we are done with that, right? Well, not really…. Today’s scale-out storage systems almost always impose massive latency versus underlying, extremely fast NVMe connected non-volatile systems. As a result, and from a desire to avoid the complexity of running a distributed system like Cassandra on top of a distributed storage system (often with the distributed Kubernetes system in between), DAS has beaten all existing storage for many workloads.

In short, **the very reason that we started striping across nodes — to add resilience and performance to slow disks — no longer applies.**

So, what else?

![75x increase in the number of workloads. 95% decrease in size & duration. Ephemeral](https://cdn-images-1.medium.com/max/800/0*VzhXdDLpxtERp1Sk)

Perhaps most importantly, the workloads — the way DBs are built and run — has changed. They are of much shorter duration, typically much smaller, and they move around! This is not your father’s monolith!

![You pay clouds for storage. Data gravity -> ^ spending, less agility. Lock-in](https://cdn-images-1.medium.com/max/800/0*Yuk0vAdoZe4qp24s)

Then you run it on the cloud, which gives you and your teams incredible agility. However, you now introduce dependencies because each cloud’s storage differs. So, if you are not careful, before you know it you are locked-in. Even for some of our users listed here, ^^ their AWS bills are growing quickly. And, again, your teams are less agile because there has been a collective decision to grab some opaque service such as a stripped down and standardized version of open source MySQL or Redis from another company.

To sum things up, the world has changed in many ways! Therefore, storage has changed too, right? Well, not really. Storage is hard. It is far easier through marketing and open source influence peddling to get your 20-year-old project labelled “cloud native” than it is to actually start an entirely new storage system that runs anywhere.

![Run anywhere with dynamic provisioning. Don't stripe across nodes. Reduce SPOF](https://cdn-images-1.medium.com/max/800/0*vNlv_UcOVV5Y456W)

To begin at the bottom of the stack, you not only have to accommodate the presence of extremely fast storage hardware, you also have to accommodate running *on clouds* themselves. How can you do this? And how do you do so in a way that does not itself introduce another single point of failure?

The approach we take at OpenEBS is to run our storage capabilities in a decoupled way so that the controller — that serves the actual workloads — is itself stateless and easily rescheduled. Also, it runs in the user space in containers so that it really can run anywhere. It then coordinates reads and writes to logically underlying data containers.

We also keep the data local and utilize intelligence in our control plane to leverage Kubernetes to optimize data placement of primary data stores and replicas. There is much more I could discuss here, but I’ll leave it at this high level for now.

![Every workload has its own data storage. Every team as well. Quick & agile](https://cdn-images-1.medium.com/max/800/0*ZFFma1SdaG9GaiAS)

Secondly, instead of having a one size fits all storage system that is limited in its ability to make trade-offs for each of the potentially thousands of workloads, each workload has its own storage system with OpenEBS. The specific needs of those workloads and of the “two pizza” teams that build and run the workloads are each served by their own OpenEBS. This limits the need for cross-functional team meetings in which members argue about how they want the storage to behave. They simply invoke their particular flavor via a Helm chart and, with the help of the right storage classes, away they go!

![Run Dbs w/o any headache. Achieve data agility and cost savings. No lock-in. Unicorn](https://cdn-images-1.medium.com/max/800/0*w9bt1flsblASWqcG)

Because you can customize OpenEBS to run however you want it and it abstracts away the underlying differences from storage vendors or storage services, you are now less locked-in than before.

Plus, with OpenEBS and MayaData we are providing per workload back-up and recovery and entire workload data migration as well. Common use cases include disaster recovery of stateful workloads, where you cannot, of course, have the workload itself doing all its own replication if the disaster you are protecting against is a catastrophic situation on that workload. Other common use cases include moving workloads from one cloud to another to save funds or possibly moving workloads closer to other cloud services.

**What’s next?**

No look back to history would be complete without a quick look at the not-too-distant future as well.

In our case, we are adding additional performance tuning capabilities to the per workload container attached storage of OpenEBS. This will allow you to more easily tune components of a database, for example.

Additionally, we are working closely with a variety of workload providers to improve the ongoing testing and, yes, maturation of DBs + OpenEBS on various clouds and on premises deployments. We are increasingly getting help in building and operating [OpenEBS.ci](http://openebs.ci/) for example. The idea is to make it much easier to run your own databases without the loss of control and decreased agility from relying on cloud managed databases.

Hopefully you can see why I believe we have entered a golden age for building and running stateful applications. With the help of container attached storage like the solutions delivered by OpenEBS, you can run workloads anywhere in a completely automated way while providing a nearlt impossible level of per workload customization and performance. The net result is a boost in developer productivity and a reduction in cloud lock-in.

We are also inviting community members to write interesting blogs with hands-on content that OpenEBS and broader Kubernetes providers might find useful. So, if you have an idea for a blog post, such as doing blue/green with stateful workloads or a comparison between different Kubernetes platforms, please do get in touch. We would be happy to cross-publish on the OpenEBS blog and to otherwise collaborate with you.

Thanks again to the Southern California Linux community! It was an inspiring weekend.

Here are the reference slides I mentioned (with a nice Monty Python GIF included as a bonus):

[https://docs.google.com/presentation/d/11dNx7-HEqUg6ZeUAtaKAzfqfscmuDcXaKWbjxbM3us4/edit?usp=sharing](https://docs.google.com/presentation/d/11dNx7-HEqUg6ZeUAtaKAzfqfscmuDcXaKWbjxbM3us4/edit?usp=sharing)
