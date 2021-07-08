---
title: The Mule and (the) Flash — going for a run?
author: Jeffry Molanus
author_info: Jeffry is the CTO at MayaData. At MayaData, his primary focus is to make sure the product is flexible and scalable. When he is not working with code, he practices martial arts.
date: 26-02-2018
tags: Kubernetes, Cloud Storage, Container
excerpt: In this blog, I discuss why we are building an innovative approach to user IO for the purpose of containerized storage, in particular vhost. If you just want the code, take a look at https://github.com/openebs/vhost-user.
---

In this blog, I discuss why we are building an innovative approach to user IO for the purpose of containerized storage, in particular vhost. If you just want the code, take a look at [https://github.com/openebs/vhost-user](https://github.com/openebs/vhost-user).

First off, as mentioned in previous blog articles, OpenEBS is not yet another distributed file system. Let’s reiterate the reasoning behind this:

- As microservices typically require only a small (relatively) amount of storage, there is no need to build a scale-out storage system
- As Direct-attached Storage (DAS), in particular, NVMe, is the fastest storage you can get, you want the workload and the controller to be local with respect to each other; this is true even with SSD cloud storage offerings like AWS EBS instances
- As single NVMe devices can reach 450K IOPS per device or [more](https://www.prnewswire.com/news-releases/supermicro-delivers-groundbreaking-18-million-iops-of-storage-performance-in-new-2u-ultra-server-300508258.html) there is no longer any need to “scale out” to achieve high IOPS or low latency, in fact, scale-out adds latency as per the above argument

Finally, distributed applications are complex by nature. When you are building microservices, you are in fact, developing a distributed application. It seems unwise to put one distributed application on top of the other (storage) and sleep well at night. All that work you’ve done limiting single points of failure in your application layer can be undone through the use of complex distributed storage.

Another fundamental aspect of OpenEBS is that it runs in user space. This too has, we like to believe, a significant advantage as it does not require you to [build a kernel module](https://github.com/portworx/px-fuse) and taint your kernel (in case of closed source) with out-of-tree code. But it does not stop there; if you want to move your data from cloud to cloud (c2c), you do not have to worry about kernel version mismatches or anything like that. User space is the new kernel — when it comes to IO.

But what about performance? Linus Torvals himself said some years ago that file systems in user space are nothing but [toys](https://www.phoronix.com/scan.php?page=news_item&px=OTYwMA). But, as it turns out, with these low latency SSDs and high-speed networking (100GbE) the kernel, in fact, has become the bottleneck!

_“fuse works fine if the thing being exported is some random low-use interface to a fundamentally slow device.”_

So it seems that we have reached an impasse? The kernel appears to be the bottleneck, and user space implementations are just “toys.” Or have we? When you look into why IO in user space is slow, it’s mostly due to the inability to do DMA, the required context switches, and the copying in and out of data. What if we could avoid this? Also, as you may know, hardware is already causing a change in the way we do things — 3D XPoint™ next to NVMe. This can be seen by technologies applied in SPDK and others like FD.IO. As OpenEBS is storage in containers, we have started to work on what we call the IOC, or the IO Container using these technologies.

**The IOC runs in user space and can do IO to the underlying hardware, bypassing the kernel altogether. It owns a set of resources (CPU, NICs, memory, and storage) and applies polling for IO instead of being interrupt driven.**

With 18-core desktop computers being available today, it’s hardly an issue to use a core or two dedicated for IO — in the user space.

Because the IOC exposes block devices, we need a way to connect these devices to the other containers. Luckily — the VM space solved that problem for us: v[host](http://www.spdk.io/doc/vhost.html). By reusing these approaches, we create high a speed connection between the IOC and the containerized storage controller without making a change to the applications.

![IOC model with vhost user interface and VPP](/images/blog/ioc-model-with-vhost-user-interface-and-vpp.png)

The above picture tries to depict the situation on a single node. As the application sends its IO through a block protocol (the target), OpenEBS — through the shared vhost subsystem — sends the IO to the replica which applies storage logic to it. With storage logic, we mean things that allow OpenEBS to do Copy-on-write (COW), snapshots, clones, compression or whatever is required. Also, OpenEBS is starting to further leverage this architecture to alter data management parameters including replication and snapshot patterns and even lower level parameters as well as block size in those containers depending on the workload.

Then finally, the IO is submitted again to the IOC where an adaptive polling algorithm waits for its completion. Note, that the target — replicates `n` copies to the other node(s) which is depicted with R(n). So instead of doing IO through the kernel, your application passes the IO to the IOC which takes care of completing the IO as fast as possible all from user space.

With this approach, we get the best of both worlds and are in fact capable of surpassing the performance you would get when doing the same in the kernel — hands down — while also providing per workload granularity of control.

![User space outperforming the kernel](/images/blog/user-space-outperforming-the-kernel.png)

As you can see from the repository, the design is fairly straightforward and is intended to support both legacy workloads as well as those built for faster underlying storage. We welcome input and contributions from anyone.

While the vHost work stands alone it is central to a new storage engine forthcoming in OpenEBS 0.6, code named ‘cStore’.

We would really like your input so please [open an issue](https://github.com/openebs/vhost-user/issues) or join us on Slack to discuss at [openebs-community.slack.com](http://openebs-community.slack.com/) or just contact me directly. I can be reached at Twitter at [@jeffrymolanus](https://twitter.com/jeffrymolanus)
