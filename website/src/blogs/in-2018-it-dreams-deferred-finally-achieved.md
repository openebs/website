---
title: In 2018 - IT dreams deferred finally achieved?
author: Evan Powell
author_info: Founding CEO of a few companies including StackStorm (BRCD) and Nexenta — and CEO & Chairman of OpenEBS/MayaData. ML and DevOps and Python, oh my!
date: 09-01-2018
tags: Containerization, Docker, Kubernetes, OpenEBS, Storage
excerpt: At MayaData, we believe we, and others are building the foundation for a much longer cycle of software-centric innovation thanks to proactively eliminating sources of lock-in.
---

# **_…..Dreams deferred_**

Many of us in the infrastructure business have been forced by experience to lower our expectations of what is possible. While we’ve all dreamed for decades of a world in which software just works — and delivers value where and how it is needed — we’ve been disappointed again and again.

We have seen open systems that, over time, became increasingly proprietary with Unix diverging into proprietary camps.

We’ve seen SQL go from a fascinating research project to a broadly deployed standard to, with the help of stored procedures and truly nefarious licensing, a source of lock-in dominated by one company and one eccentric multi-billionaire.

We’ve seen a vision of Java as a cross infrastructure abstraction layer bloom and wither.

And of course, we’ve seen virtual machines offer the promise of cross infrastructure mobility only to fall prey to the rest of the stack and proprietary business models and incorrect levels of abstraction.

Over time the result has been infrastructure by silos, with each silo — security, storage, networking and compute — dominated by proprietary solution providers that over time sought to provide the entire stack to drive up their sales, even if doing so meant increasing the friction for users seeking to combine best of breed solutions.

# **_On the other hand…._**

All along technological progress has continued. Allowing for new possibilities.

We’ve even seen — finally — broadband make its way into the United States so that more and more we can cost effectively access the cloud (yes, the loss of net neutrality seems to put this at risk for at least consumers and new entrants).

And intra data center networking has gotten insanely fast — which is crucial if we are to run workloads in a flexible manner.

And arguably the best example of innovation at scale in modern business — Amazon — focusing on the right persona — the developer — and raising the bar massively for all of us in infrastructure.

And perhaps most importantly, the Open Source community, which as Richard Stallman and others have pointed out predates the commercial software world and which some have called the world’s first social network, grew to become an undeniable force.

And pulling all the positive forces together — DevOps and microservices. DevOps as a cultural movement and approach to building and running software at scale PLUS an emerging understanding of how to run systems via microservices as explained by the [12 factor approach](https://www.12factor.net/) and elsewhere led to countless examples of “software eating the world.”

# **But …. What about lock-in?**

So as the above suggests, one theme in the story of innovation in IT over the years has been breakthrough technologies, and business models, enabling fundamentally better software delivered more easily to users. And as one approach came to predominate, proprietary approaches over time led to more “rent seeking”, where leading vendors extracted more value from their users and slowed their innovation. And this stagnation leads to pent up demand for better approaches — triggering the next cycle.

Well — what about this time?

Kubernetes has emerged in part because it promises a world more free from lock-in to AWS and other clouds. Could it be that we have collectively learned enough from all the boom and bust cycles to know what is good for us?

Could be — the signs are incredibly promising as all the cloud vendors and RedHat and Cloud Foundry and Docker and Mesos have all embraced Kubernetes as the standard control plane. This means that you are no longer locked-in by the control plane logic and should be able to move your applications from cloud to cloud and from on premise to off. Crucially — Kubernetes itself is open source and all the major vendors have pledged to not fork it; so it shouldn’t be _too_ bad to move from one vendor supporting Kubernetes to another.

_…. but what about data?_ Without data mobility all you can move is the stateless components of your applications — provided you address having those components able to access your store of state.

# **And your data remains largely locked-in**

_Locked into_ proprietary vendors.

_Locked into_ underlying systems that are sources of risk and that themselves are resolutely monolithic.

I harken back to a speech Randy Bias gave at one of the OpenStorage summits I helped host back in 2010 about `blast radius`. The basic idea is that microservices dramatically reduce the blast radius of any single outage; conversely putting all your state in a shared storage system is, by comparison, an anti-pattern. When your shared storage dies or slows down unexpectedly perhaps due to a rebalancing, so does your entire environment. So much for being built for failure!

S3 for non performant data and EBS for performant data have become defacto standards. They are easy, they “just work”, and — crucially — they put the responsibility for the configuration, care and feeding of state in the hands of the teams that also control the microservices.

The only problem is that it is _hard_ to move your data from these AWS services to other solutions without a lot of work that frankly software development teams don’t have the time or inclination to invest. I see the lock-in that results as the TBs pile up treated much as technical debt is treated — it is annoying and yet it is much less important than getting valuable capabilities in the hands of end users.

And putting all your data in a scale-out software solution running on these clouds only makes the issue worse. Now you have the blast radius issue and you have your data stored in a solution that cannot be stretched across clouds. Two sources of lock-in and at least twice the effort!

It might be worth remembering that networking, security and compute are all becoming both infrastructure services delivered as services **to** today’s microservice environments and **are themselves also microservice based services**. Take a look at Project Calico for instance. Or at Kubernetes itself.

**Nobody says — hey, Kubernetes is just a black box that sits to the side and so it needn’t be a bunch of microservices. But not storage. Storage somehow gets a pass. It gets to live with aged architectures and typically aged business models.**

## Which raises the question: What if storage was itself delivered as microservices and orchestrated by Kubernetes?

For the purpose of this exercise, **assume** it were possible to make storage a set of capabilities delivered as microservices with the controller running on containers.

You’d probably agree that such an approach would have some benefits including:

**Familiarity:**

- If storage is delivered as microservices within Kubernetes then if you know how to run Kubernetes then you know how to run the storage.
- Perhaps more importantly, you are familiar with the failure domain. You lose a storage controller — well, you just lost a stateless container that itself simply provides services and pointers towards the underlying data. Your data is always safe in multiple locations and your storage system itself is resilient (at least the way OpenEBS is architected with the use of atomic transactions).

**Granularity:**

- As mentioned above, the defacto standard approach to delivering storage is to use AWS itself with each team organized around one or more microservices having their own approach to EBS for performant storage and S3 for blobs of data.
- Using a shared storage system runs counter to this approach and cuts these teams out of the loop. They are back to lobbying central IT as one of hundreds or even thousands of workloads with particular desires as to how storage should be configured. And, yes, those configurations matter. And, actually, they are impossible to get right. We’ve talked about that in the past including at Meet-ups: [https://www.slideshare.net/MattBaldwin3/containerized-storage-for-containers-why-what-and-how-openebs-works](https://www.slideshare.net/MattBaldwin3/containerized-storage-for-containers-why-what-and-how-openebs-works)

![What move the data and configs next to the app](/images/blog/what-move-the-data-and-configs-next-to-the-app.png)

**Performant:**

- This being a storage blog, it is worth reiterating the point that shared storage is inherently less performant these days than direct attached or DAS. That is a fairly new reality. It used to be that DAS was really slow disk and the way to get IOPS was to stripe across a bunch of faster disks. That was a primary driver for shared storage. Imagine that — at one time CEPH would have been faster than the underlying hardware! How times have changed.
- Our CTO, Jeffry Molanus does a good job walking through how the landscape of performance has changed why this and other changes now favor what we call “container attached storage”:
- [https://blog.openebs.io/not-yet-another-distributed-storage-system-57ee9220c409](https://blog.openebs.io/not-yet-another-distributed-storage-system-57ee9220c409)

**Natively cross cloud — with the help of metadata and routing services:**

- What is perhaps least well appreciated about the potential of treating storage as a service delivered via microservices is that, correctly engineered, this means that data itself can be served as a service in the background across underlying clouds.
- The first prerequisite is that the controller itself runs in a container or set of containers.
- The second prerequisite is that the controller performs its magic in the user space so that the container does not need to be a special build and so that the system can perform.
- Third, there needs to be the management of metadata to see where the data is versus the workloads. Kubernetes can help here as it expands however in addition a solution such as MayaOnline.io — as it matures — is needed. This service acts as an air traffic controller, helping the data to get to where it is needed. Such a service can also become more intelligent over time, for example suggesting improvements to Kubernetes storage policies based on success in running similar workloads.

# **TL;DR:**

So, in short, this time perhaps it really _is_ different.

This time we “won’t get fooled again” (gratuitous old guy music reference :)).

This time we _will_ address the sources of lock-in not just at the controller plane via Kubernetes but also at the data layer. And in so doing we will avoid ending the the cycle of innovation prematurely. Perhaps it goes without saying — only an open source solution like OpenEBS that is widely accepted and easy to fork if needed can help free us from the risk of cloud lock-in without adding yet another source of lock-in.

And we can address lock-in while respecting and extending the patterns we know are working including: every team controlling their infrastructure themselves, the elimination of single points of failure (aka “storage blast radius”), and allowing Kubernetes to control more and more of the environment, leaving the developers to focus on capabilities that add value to their end users.

In short, at MayaData we believe we and others are building the foundation for a much longer cycle of software-centric innovation thanks to proactively eliminating sources of lock-in.

Please help this reality come true by providing us feedback on [OpenEBS](http://www.openebs.io/) and [MayaData](http://www.mayadata.io/) or see us on the Kubernetes storage SIG where we are trying to be helpful as well.
