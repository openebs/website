---
title: OpenEBS 0.6 serves IOs amidst Chaos and much more
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 20-07-2018
tags: DevOps, Kubernetes, OpenEBS, Stateful Containers, Storage
excerpt: We are very excited to announce the availability of OpenEBS version 0.6. I would like to take a few minutes to talk about what has been keeping us busy in making it GA.
---

We are very excited to announce the availability of OpenEBS version 0.6. I would like to take a few minutes to talk about what has been keeping us busy in making it GA. We have been making a number of additions to both the design and code in the last few months. In this blog I’ll talk about:

- Quality leveraging Chaos Engineering
- Framework (CAS Templates) for supporting multiple storage engines

I won’t talk about our new Storage Engine (cStor) — written in C — which is _almost_ ready. I’ll save that for a later blog.

Before going into specifics, I would like to express my sincerest gratitude to the OpenEBS community users and developers who are helping to make OpenEBS the most simple and easy to setup containerized attached storage (CAS) solution available for Kubernetes today — and the most popular open source one as well.

Since the OpenEBS 0.5 release we have seen so many ways users have deployed OpenEBS many of which we had not envisioned when we started OpenEBS back in 2016. We are working hard to listen to the growing user community — and of course MayaOnline is helping us a bit as well as we learn something from MayaOnline users who are using this free SaaS monitoring and ChatOps integration of their stateful workloads. Along these lines, we have a survey that is running through the end of July that takes 2–3 minutes that has proven helpful; please do fill it out if you have not already and we will even send you some swag: [https://www.surveymonkey.com/r/BRDCCWY](https://www.surveymonkey.com/r/BRDCCWY)

The timing of OpenEBS 0.5 was perfect in that it coincided with a take-off in interest in stateful workloads on Kubernetes. Some deployment patterns I’ve encountered just in the last few weeks include:

- GitLab for internal IT teams
- Kube weekly just featured a step by step blog on this subject: [https://blog.openebs.io/git-freedom-on-kubernetes-3a491dd37cdf](https://blog.openebs.io/git-freedom-on-kubernetes-3a491dd37cdf)
- Data Science training sessions
- Here we are seeing hundreds of pods with stateful workloads spun up and destroyed repeatedly — really a great use case for container attached storage
- Running Minio on OpenEBS which some users have called a happy marriage between OpenEBS block and Minio S3
- We remain huge fans of Minio and are looking forward to more community led collaboration with our almost neighbors
- OpenEBS being deployed as a basic part of DBs on Kubernetes; in particular we are seeing a good amount of NuoDB on OpenShift for example
- The elastic SQL technology of NuoDB seems to resonate with lots and lots of users; we’re pretty proud that using OpenEBS underneath is becoming a common pattern
- And of course many Containers as a Service offerings now include OpenEBS as a default option with more to be announced shortly

And all this adoption means heterogeneity and dynamism.

## Challenge 1: Kubernetes is resilient amidst Chaos and so must be storage

Because OpenEBS is deployed on so many varieties of Kubernetes and our fundamental job is to keep the data safe no matter what — we have been investing heavily in our ability to create these varied environments and their behaviors and to then measure and validate the resilience of OpenEBS as these environments respond to outages and increased load and so forth. We are seeing OpenEBS deployed across lots of varieties including:

- Native Kubernetes or using Rancher, OpenShift, IBM Cloud Private, GKE, Tectonic, StackPoint Cloud, and others
- Operating Systems -Ubuntu, CentOS, CoreOS and others
- Pod Networking of all types, with Flannel being a favorite
- Various cloud services — AWS EC2 remains the preferred option, with GCE growing in adoption amongst OpenEBS users

Each combination comes with nuances that are unique and sometimes annoying as well. For example, recently a user on a Cloud Provider saw their nodes shut down frequently and occasional high network latency or packet drops in inter pod networking. Anyone with experience working with Storage Systems knows how detrimental these situations can be for latency-sensitive Stateful Applications.

We consciously chose the well-understood and widely used iSCSI protocol as the underlying storage connectivity used by Applications to connect to OpenEBS Volumes. There are many benefits to this architecture, but I will not address those here.

There are some annoying pieces when running iSCSI at scale as well. For example, depending on the response from the iSCSI targets and your operating system, there are some quirky things that can happen with iSCSI. The most notorious of these happens when iSCSI backed volumes move into read-only if you are using ext4 under certain conditions. You must then go through the steps for manually recovering the volumes. To address this, we have put together a troubleshooting guide that you can access [here](https://docs.openebs.io/docs/next/readonlyvolumes.html?__hstc=216392137.386b1bc3a48de21192b74b07a4e27366.1580120418429.1580120418429.1580120418429.1&__hssc=216392137.1.1580120418429&__hsfp=3765904294).

However, we wanted to solve as many of these issues as possible with the right approach. We stepped up our use of chaos engineering in our OpenEBS development process. We also extended and open sourced our in-house tooling, and we are starting to see it used more and more by engineers deploying stateful workloads on Kubernetes — whether or not OpenEBS is the underlying storage.

## Solution : Chaos Engineered OpenEBS, the birth of Litmus.

If you would like an introduction to the Litmus project, which we open sourced at KubeCon in Denmark, visit the following link: [https://openebs.io/litmus](https://openebs.io/litmus?__hstc=216392137.386b1bc3a48de21192b74b07a4e27366.1580120418429.1580120418429.1580120418429.1&__hssc=216392137.1.1580120418429&__hsfp=3765904294) or [https://github.com/openebs/litmus](https://github.com/openebs/litmus)

We are also working on operators to add additional autonomic function into OpenEBS, leveraging improved metrics and advancements in CSI around node daemonsets and the mount-propagation feature. In the meantime, we use Litmus to increase automated real-world scenario testing to ensure improvements in every release. In this regard, a lot of effort has gone towards beefing up the tests that can simulate Chaos at Node, Network, Storage, RAM, and CPU. These typically contribute to Volume Pods switching nodes and, if not careful, interrupted IOs.

Of course, this Chaos for Storage Application is something we believe should be applied to stateful workloads and underlying storage both during testing and as a part of a healthy chaos engineering practice. This is what led us to Open Source Litmus.

One outcome of our improved chaos engineering and testing is improvements to the resiliency of intra OpenEBS deployment communication. Specifically, we added enhancements to the responses sent by the iSCSI Target to the initiator; overall, this makes OpenEBS more resilient even when Pods are rescheduled unexpectedly and when the environment otherwise changes. You can learn more about these issues in the [release notes](https://github.com/openebs/openebs/releases/tag/v0.6).

We expect that the incidence of read-only issues will decrease greatly for the tested scenarios. We are constantly adding more scenarios, workloads and other tooling into Litmus to bolster the Jiva storage engine and other engines to come. Contributions to Jiva are of course always welcome!

## Challenge 2: The evolving state of the State in Kubernetes!

If you regularly monitor storage developments, you will notice that Kubernetes is moving towards CSI and Snapshots are beginning to become a standard. There are enhancements to support Block Volumes and Topology aware Scheduling for Stateful Applications powered by Local PVs, which also benefits other PV types like OpenEBS.

To give an example, OpenEBS strongly prefers the case when the OpenEBS Controller Pod (and the application Pod) schedule on nodes where the OpenEBS Replica Pod resides. Currently, we achieve this via Pod/Node Affinity parameters. However, with Topology Aware scheduling, the constructs of pinning are efficiently done via the PV topology parameters.

That is just one example of new capabilities that we must now embrace. Features in Kubernetes now transition “quickly” from alpha to beta and the new paradigms/patterns that enter into Kubernetes must be adopted, or you will soon become outdated like the Third Party Resources (TPRs). However, we are not complaining about the pace of progress and continually contribute upstream to Kubernetes itself. We always seek to lend a hand to make Kubernetes an even better platform for storage and stateful workloads.

Nonetheless, the challenge remains. After all, the core of the Orchestration layer in OpenEBS is to deploy and operate the Container Attached Storage solution using Kubernetes native constructs. And the constructs just keep changing!

Looking at the situation, we decided to step back and think about an architecture that would allow us to minimize the need to make code changes every time Kubernetes changes. For example, some users want to deploy their OpenEBS by specifying Pod Disruption Budges (PDBs) or setting specific Resource Limits for PVs in certain namespaces/users etc. We wondered: how can we embrace these new knobs, settings, and advances without endless code churn? This type of work — effectively upgrading the transmission of the underlying orchestration of OpenEBS — is not easy to do unless you really understand the architecture of OpenEBS. That’s not good — what’s the point of being open source if the code itself is too hard to work with and adjust? Fortunately, Kubernetes has CRDs, which provides a way forward.

## Solution : Provide templates to Cluster Owners to define and manage the storage infrastructure.

In the OpenEBS 0.6 release, we have utilized the power of Kubernetes CRDs to provide a workable solution to introduce pluggable storage engines. OpenEBS now provides a complete workflow for developers and cluster administrators to choose the right storage software and hardware for their unique requirements. The control of the storage infrastructure stays with the cluster owner, and the ability to address a given need in storage lies with the developer. OpenEBS 0.6 brings the initial version of CAS Templates, which are YAMLs that can be scripted by cluster owners, fit into your GitOps, and are associated with Storage Classes.

We like the way OpenEBS CAS Templates are shaping up, and we can see many of the cluster owners’ needs being met over time, including enforcing of policies using tools like OPA. I will share more on this in upcoming blogs, but you can glance at them by reading this introductory documentation [here](https://docs.openebs.io/docs/next/storageengine.html?__hstc=216392137.386b1bc3a48de21192b74b07a4e27366.1580120418429.1580120418429.1580120418429.1&__hssc=216392137.1.1580120418429&__hsfp=3765904294). We intend to build upon this improved architectural pattern to do even more than the pluggability of storage engines. As always, we would especially welcome your feedback and use cases.

### And there is more…

You will notice when you look at the release notes or try OpenEBS 0.6 that there are many other enhancements, including:

- Configuring of OpenEBS for running stateful workloads that span across Availability Zones
- Enabling the management of Snapshots and Clone from kubectl
- Enhancement to mayactl to display volume status
- Improved Integration and Unit Testing coverage
- Enhanced Contributor Guides

And, most importantly, product documentation has been overhauled to provide accessible insights about OpenEBS as well as a process to provide feedback.

As mentioned above, our next release also enables users to try out _cStor — a storage engine_ that is more efficient in terms of performance and capacity management. It also reduces the number of containers required to run OpenEBS. If you are interested in taking a look, please get in touch as we have some alpha users of cStor now.

With its strong community of users, developers, and partners building us into their solutions, it feels like OpenEBS is nearly unstoppable. As always, we look forward to your feedback and suggestions on this release and the direction that you want to see OpenEBS move going foward. Please reach out to us on Slack or add comments below. [https://slack.openebs.io](https://slack.openebs.io/?__hstc=216392137.386b1bc3a48de21192b74b07a4e27366.1580120418429.1580120418429.1580120418429.1&__hssc=216392137.1.1580120418429&__hsfp=3765904294)/

Finally, if you have not done so yet, claim your free access to [MayaOnline](https://mayaonline.io/). You will be surprised by how easy it can be to visualize and manage your storage needs.

[Public domain](https://creativecommons.org/publicdomain/mark/1.0/).
