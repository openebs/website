---
title: OpenEBS 0.8 release allows you to Snapshot and Clone cStor Volumes
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 07-12-2018
tags: Cloud Native, Kubernetes, OpenEBS, Storage, DevOps
excerpt: cStor as a new Storage Engine and Node Disk Manager (NDM) that were introduced in the previous release have proven to be quite popular with DevOps user community.
---

cStor as a new Storage Engine and Node Disk Manager (NDM) that were introduced in the previous release have proven to be quite popular with DevOps user community.

The following picture shows the locations where OpenEBS is deployed. `(More on this image later in the blog.)`

IMO, this rise in adoption/installations can be attributed:

- Enterprises are getting serious about Agility promised by the Cloud Native Architectures, where Kubernetes is an essential piece.
- Kubernetes mainly focuses on the workflow of attaching Storage to Applications, but not managing the Storage itself. The Agility that Cloud Native Architectures bring are somewhat lost when a dependency is created on one specialized team ( Storage IT Team) which essentially slows down the Application Delivery Process.
- Enterprises want the same experience with their Kubernetes Clusters whether they opt for Managed Kubernetes Clusters or have their own Kubernetes Clusters either On Premise or in Public/Private Cloud.

`cStor Storage Engine` — being developed in the user space doesn’t require any special Kernel taints and just works on `any platform` of user’s choice — whether On Premise or On Cloud.

`NDM` — addresses another missing aspect from Kubernetes about handling various types of Disks (or Storage Devices) connected to the Kubernetes Nodes and managing them, the Kubernetes way!

As one CTO evaluating OpenEBS, put it:

> `I love OpenEBS Architecture, it helps remove the layers from the application delivery process. There is no need for a dedicated storage administrator or team. I can easily scale up and down this solution.`

In the spirit of Open Source Transparency, the CTO reached out to us to share his admiration for OpenEBS and express his concern over the performance of OpenEBS running completely in Userspace. The fact that none of the other Storage Providers do this and when push comes to shove,the CTO office needs to convince the DevOps Teams to pick OpenEBS over traditional/non-cloud native Storage Systems. DevOps Teams are aware of exactly where those legacy solutions break due to their distributed nature, and they also hold a long sustained perception of Kernel being faster than Userspace.

We knew performance is going to surface as a concern sooner or later. However, we have also found that users who have evaluated OpenEBS against other solutions still pick OpenEBS for its ease of use even if they incur a slight overhead.

Having said that, performance is still a real concern when it comes to Enterprises that run heavy computational jobs, and we know it. We have been working on resolving this performance piece for quite some time now and will very soon announce the details of what we have come up with. It suffices to say that “Performance with OpenEBS will not be a concern” in the near future.

But I digress.

Speaking of 0.8 release, some interesting features that I like are:

- Support for cStor Snapshot and Clones
- Support for managing cStor Volumes via kubectl

And there are several other enhancements and bug fixes that went in along with a huge number of PRs from external contributors to improve code readability and unit tests. A detailed release notes can be found [here](https://github.com/openebs/openebs/releases/tag/0.8).

The OpenEBS community has grokked items like: Backup/Restore of OpenEBS Volumes to S3 compatible storage using Heptio ARK, Getting around the quirks of RKE to get iSCSI working.

The E2e team has also been very busy with setting up [https://openebs.ci/](https://openebs.ci/) that is powered by OpenEBS Litmus project with Chaos injection tools etc., Sharing the details about this project warrants for another blog!

—

Let me stick in this blog primarily to the cStor 0.8 features:

**Snapshots and Clones.** While this feature is primarily viewed from data protection and recovery aspect, it has been found to make sense for many other use cases like:

- CI / CD Pipelines for Stateful Workloads. When using OpenEBS as the underlying storage, the CI tools can make use of the Snapshot functionality to freeze the state of the application in case of build failure (or success). Developers can then launch their application with the frozen state of data from the CI pipeline for further debugging or detailed analysis. Saves a ton of time from having to reproduce the issues.
- Big Data. The Analysis Workloads typically involve downloading large amounts of data from external sources into the Kubernetes volumes (a process called — warm-up) before running the intended computation jobs. And oftentimes the data downloaded doesn’t change very frequently. With cStor volumes, the data can be downloaded once and snapshotted. The computations jobs can use the cloned volumes. Save on network bandwidth and faster processing of the data. All this without losing the granularity of isolating the different workloads from each other.
- Improving the Onboarding experience of users. SaaS Platforms such as — exam or certification portals or development IDEs require a set of prerequisite packages to be downloaded and installed. Snapshots can help in making sure prerequisite activities are performed outside of the Onboarding workflow. When a user requests for a service, a volume can be rapidly provided by cloning from snapshots. User experience matters! 5 mins to get your IDE or exam to being are not acceptable anymore.

cStor Snapshot and Clone functionality are triggered via **kubectl** itself. cStor Snapshots and Clones are reference based and are highly optimized for lowering the capacity required for maintaining large number of snapshots and clones.

**cStor Volumes managed via kubectl**. cStor volumes comprise of a Target Pod that exposes iSCSI. This target pod is instrumental in making the Applications using cStor Volumes portable. The cStor Target Pod then replicates the data to cStor Storage Pools. For redundancy and high-availability, the data is replicated to cStor Pools that are located on different nodes. `(Note that multiple cStor Target Pods can write to the same set of cStor Pools).`
![cStor Volume](/pubic/images/blog/cstor-volume.png) cStor Volume
The cStor Target (aka cStor Volume), cStor Volume Replica and the cStor Pools are all Kubernetes custom resources. You can use the `kubectl describe` commands to check the health or events on each of these entities. And moreover, the Disks where the cStor Pools eventually write the data to, are also represented by Kubernetes Custom Resources.

Please give it a try and looking forward to your feedback. More details usage and examples are provided in the [release notes](https://github.com/openebs/openebs/releases/tag/0.8)

Now, about that world map that I shared earlier, OpenEBS release v0.8 introduced the option of sending anonymous usage analytics. The analytics collected will help answer questions like:

- What is a typical lifespan of a Storage Volume in the Cloud Native Environments?
- What is the max (or average) capacity of Volumes in Kubernetes?
- A slightly more involved question is around the nature of the Cloud Native Applications and what it means to the storage features like replication. In other words, do applications really require a storage that does replication?. Or do they just need Local PVs?.

What was most surprising (or not) is that users don’t always wait on releases. They also tend to pick up the master builds, if it contains what they need! The above diagram depicts the Kubernetes clusters that used the OpenEBS master build before its release.

Of course, you can also turn off sending the analytics if you so desire.

And by the way, if you have not yet, claim your free access to [MayaOnline](https://mayaonline.io/). MayaData team has made some significant and useful additions to its `Maya Data Agility Platform (MDAP)`. You will be surprised how easy it can be to visualize and manage your storage needs.
