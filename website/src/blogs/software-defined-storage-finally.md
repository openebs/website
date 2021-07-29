---
title: Software Defined Storage — finally
author: Evan Powell
author_info: Founding CEO of a few companies including StackStorm (BRCD) and Nexenta — and CEO & Chairman of OpenEBS/MayaData. ML and DevOps and Python, oh my!
tags: DevOps, Docker
date: 11-03-2017
excerpt: In this blog, I’ll discuss what went wrong — why we didn’t achieve the promise of software-defined storage — and why software-defined storage is now, finally, possible.
not_has_feature_image: true
---

Many years ago there was a flowering of what we called software-defined infrastructure. Those of us at the forefront of the trend were no doubt encouraged by the success of Martin Casado and the Nicera team who quickly went from Ph.D. thesis to $1.26bn purchase by VMware thanks to the promise of software-defined *networking*. In hindsight we were misguided, but a handful of us built companies built on the premise — why not *storage*?

Today we finally have the ingredients in and around the storage industry to achieve what we all were shooting for 5–7 years ago. I’m so encouraged by these enabling trends that I’ve gotten back into storage even as it has fallen out of investor favor. Cutting-edge users are now achieving the cost savings and boost to their agility we all promised — and truly believed — were around the corner years ago.

In this blog I’ll discuss what went wrong — why we didn’t achieve the promise of software-defined storage — and why software-defined storage is now, finally, possible.

There are at least a handful of reasons that storage failed to achieve the true promise of software-defined storage — that we did not live up to the radical flexibility of virtualized compute for example, where compute jobs were largely freed from their underlying hardware:

1. The lack of portability of the controllers themselves
2. The inherent stickiness of the underlying data
3. Inability to deliver performance in a dynamic environment
4. Immature common standards

****Controller portability and data stickiness:****

Storage controllers have to be able to deliver the policies you want — share these folders with these thousands of people for example — while keeping the underlying data safe irrespective of hardware failure, bit rot, user error, and more.

For a couple of reasons we in the industry at the time were unable to make our controllers truly software-like in the way that they were deployed in data centers: one, we didn’t sufficiently separate the policy engine or storage scheduler from the care and feeding of the underlying data on disk; two, in part because of this as well as the way that hardware drivers interact with operating systems, our storage controllers tended to need to be bare metal installs, and did not run well in a virtual machine. Perhaps more importantly, because our controllers needed to run on the same systems where the data was stored, they could only ever be as fluid and dynamic as the data itself. In other words, we were chained to our hardware in part by the physics of reading, transporting, and writing data.

****Performance amidst dynamism:****

Information technology design is often a game of pass the bottleneck. For any given system there is one bottleneck or constraint that limits much of overall performance and hence that throttles the ability of the application to serve user needs. Historically the bottleneck has often been storage — and the rise of virtualization just tightened further this bottleneck thanks to the I/O scrambling that hypervisors perform on the read/ write patterns of the applications running on them.

And yet if you are to treat storage — and storage controllers — as software that itself can be dynamically provisioned and moved about then you must be able to deliver performance from underlying systems irrespective of where the controller software is located. Perhaps more importantly, you need to be able to interpret the requirements of the applications themselves and deliver the combination of IOPS and latency they need to meet the requirements of their end-users.

This problem has aspects of the traveling salesman problem, which is to say, it is not entirely solvable. The way it has been solved in practice is that storage has remained bound to particular sets of typically hugely over provisioned hardware and the combination of applications and underlying storage has itself had to be controlled through affinity rules in the compute schedulers from VMware and OpenStack and others. In the container world, for the most part, we have dealt with the challenges of delivering storage performance to so-called stateful containers **by not having stateful containers**. The vast majority of containers that are deployed don’t actually rely upon data storage in the way that databases for example do. Those containers that are stateful typically tightly couple the underlying storage to containers, thereby removing much of the dynamism and ease of management that was a primary point in moving to containers in the first place.

****Immature common standards****

As if the inherent difficulty of somehow addressing QoS for storage, while allowing controllers themselves to become more flexible, was not hard enough, the industry structure of IT 4–5 years ago itself made it more difficult to deliver software-defined storage. VMware tried hard to get everyone on the same page via their VASA APIs, which was a way to pass information about applications to the storage and for the storage to essentially sign-up for the performance needed, however, this effort ended up making less transparent and more proprietary the DNA, or operating instructions, of the software-defined data center. Perhaps because these operating instructions themselves were so opaque they never caught on in software-defined data centers.

Today the Kubernetes community is probably our best shot for having a set of commonly accepted application definitions that flow into the infrastructure, to actually deliver software-defined infrastructure. In this case, the DNA is human readable YAML and is managed by a set of open source technologies.

Quick note — pod and resource definitions are not fully fleshed out by Kubernetes for storage. So you can do some basic things, such as limiting the amount of storage by user or application or pod, however storage specific QoS is not yet supported in these definitions. This is a work in progress.

Nonetheless, what is possible today gives a good idea of what is coming. For example:

![human readable code example](/images/blog/software-defined-storage-finally-example-code.png)

As you can see, very simple, human readable, and change controllable easily via GitHub or other systems, which is fundamental to achieving a high degree of automation and control.

**The unevenly distributed future**

While this blog and self-assessment of where we got to in software-defined storage may be a bit depressing, there are signs of hope.

Within the Kubernetes community, for example, hardy pioneers with deep technical expertise such as Pearson are using solutions like StackStorm and much else to build truly developer defined infrastructures that include the use of containers for stateful workloads.

What I learned from Pearson and other StackStorm users led me to look for storage intellectual property — and the teams that built it — that could enable the storage freedom promised by software-defined Storage. Specifically, I went looking for technologies that could virtualize or containerize storage controllers while somehow ensuring the delivery of QoS.

In CloudByte I found a solution that today delivers fine grained control of QoS via an architecture that features virtualized storage controllers. What this means is that the controllers themselves can be live migrated, for example, while continuing to serve storage. This is how CloudByte delivers non-disruptive upgrades — and it also means that you can migrate pieces of your data center from on-premise to the cloud and back — with confidence. However, without QoS controls moving your controllers around would be madness — and so the deep understanding of QoS and the ability to set QoS SLAs by the user or by volume for example is crucially important.

![Storage controller migrating from one site to another](/images/blog/storage-controller-migrating-from-one-site-to-another.png)

In the above image, I show a storage controller migrating from one site to another.

And what CloudByte does for today’s primarily scale-up workloads — largely “pets” — our emerging open source project called OpenEBS will do for emerging scale-out workloads — so called cattle — through “containerized storage for containers.”

In short — as we plan to further illustrate through use case stories especially of hybrid cloud and backup use cases — in CloudByte / OpenEBS I’ve found not just the building blocks but the first instantiations of the future we all dreamed of several years ago.

Time to reboot — and re-energize; storage now has the ingredients needed to unshackle users and enable them to achieve much more dynamic IT while keeping control of their data. Join me by taking a look at CloudByte and OpenEBS today. I look forward to your feedback.
