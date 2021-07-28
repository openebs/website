---
title: Not Yet Another Distributed Storage System
author: Jeffry Molanus
author_info: Jeffry is the CTO at MayaData. At MayaData, his primary focus is to make sure the product is flexible and scalable. When he is not working with code, he practices martial arts.
tags: Kubernetes, Docker, Container
date: 10-09-2017
excerpt: These days, it seems that a lot of storage vendors are taking a scale out approach to delivering high-performance storage to meet the increasing demand for IOPS and bandwidth.
not_has_feature_image: true
---

These days, it seems that a lot of storage vendors are taking a scale-out approach to deliver high-performance storage to meet the increasing demand for IOPS and bandwidth. Reduced latency is also high on the storage requirement list, however, scale-out distributed systems typically result in the inverse, i.e., it increases latency.

Although complex distributed systems are easier to build these days due to a variety of factors including maturing software implementations of the likes of Paxos, distributed hash tables, and RAFT it seems that creating a storage system that utilizes these concepts and is easy to manage and maintain in production — is not.

On the other hand, if you want to leverage the distributed nature of storage at the client level, more often than not, the end-users are required to run specialized clients/drivers to unleash the enormous bandwidth these systems can deliver — and so now your storage has infected your client which makes it even less attractive.

Arguably, if you need hundreds of gigabytes of throughput for a particular workload, the Linux kernel comes preloaded with [one](http://www.orangefs.org/). So you have to look no further from a tech support side of things — as what better experts to find that concern themselves with the Linux kernel and thus OrangeFS, right? No need to search any further, right?

Let’s first try to understand why a lot of people I’ve spoken to in the past typically chose **“scale-out.”** It seems they all like the idea of “**add another box”** to add performance and capacity. The fact that you can’t scale performance decoupled from capacity is what they take for granted. However, due to economics forcing IT segments to do things cheaper and more predictably, this is not the case — anymore.

Some storage vendors have found a solution for this, by not selling you expensive boxes but rather just the software. You simply scale in any cloud on any hardware or so they say. However, this **“any any”** approach does not fit in with the requirement to make things more predictable in fact quite the opposite.

So if we summarize the downsides:

- Distributed storage difficult to develop and is hard and nasty to manage in production
- Specialized drivers needed to unleash the real potential
- Scaling the number of nodes does not decrease latency, in fact, usually the opposite (depending on implementation)
- Best scales bandwidth and IOPS, however, this is not what a typical workload requires
- Complex consistency models create surprises regarding what is on disk or not
- Not especially good at leveraging flash or NVMe to deliver great performance and a small footprint
- Big blast radius — the more data you can put in one system, the more you might lose or at least lose access to when you most need it
- The complexity and need for quick metadata updates across nodes both argue against multi-cloud deployments (though there are some scale-out file systems being built that claim to address these issues)

Now there will always be vendors out there that claim to have solved it all, unlimited scale-out, never ending IOPS, more bandwidth than the whole of the internet combined, and latency — sure we do that too…

At [OpenEBS](https://www.openebs.io/), however, we took a different approach by not trying to solve the distributed problems but to take a step back and try to determine what are the real problems people need to solve?

Speaking to our early tech-preview customers, we were shocked with awe to see that due to the complexity of storage these days, they simply revert to [Direct Attached Storage](https://en.wikipedia.org/wiki/Direct-attached_storage) (DAS). “It won’t go any quicker than that”, they say. And you have to make a very, very, strong case to argue against that. In fact, come to think of it, it is nearly impossible if you consider the speed of NMVe devices.

Has the storage market become so consumed with itself that it keeps making storage products so complex, with each vendor, having its own **“if — and — or buts”** that they are fed up with it and revert back to DAS? Did it become so unpredictable? The time of consolidated storage churn?

Yes, the storage market is consumed with itself. But there is more, the storage **needs** have also changed. In the early SAN days, it was about consolidating islands of storage into a bigger one as it would be easier to manage and the performance of the SAN would be higher than some individual devices. Virtual machines made it possible to consolidate compute which also made a lot of sense as boxes were mostly idle.

However, all of this work was done for one reason and one only — to accommodate the piece of software that matters the most: the app.

The app is central and is the only thing that matters; everything around it is inflicted upon us.

Nobody wakes up one day and says, “I need to get myself a SAN” — it was likely the best of the worst options at that time.

As DevOps happened alongside containerization, the application itself has become a distributed system. A distributed system in the sense that subcomponents of the app as a whole may run on the same box, different box, and are loosely coupled by APIs one way or the other and working together to solve a complex (business) problem.

As applications have become distributed systems themselves, they have become easier to scale and thus don’t always require high IOPS low latency storage devices to scale performance-wise. So storage and capacity are now loosely coupled and suffer from data gravity in a different way than they once did. Additionally, data availability does not solely depend anymore on expensive storage arrays as applications are designed to replicate their data straight out of the GIT. As these apps are distributed by nature, we think that a distributed storage system is not only complex and nasty but completely unneeded.

So — what’s a storage vendor to do? Well, we have it easier, as we don’t have much legacy — though we do have lots of experience building storage on containers as a part of our [ElastiStor](http://www.cloudbyte.com/products/elastistor-os/) product. And so we were able to start with the customer questions discussed above — in the age of microservices and cloud and containers, what job are they looking to do regarding serving, moving, and protecting their data? And we can answer those questions in a way that is entirely free from whether it is storage strategy A, B, or C. In future blogs we’ll talk about OpenEBS more (of course) — and maybe more importantly we would like to discuss with you how we think the job storage is being asked to do has changed and hence, how and why the old storage industry may be coming to an end.

Please, feel free to join us on [slack](http://slack.openebs.io/) to discuss in a more real-time fashion.
