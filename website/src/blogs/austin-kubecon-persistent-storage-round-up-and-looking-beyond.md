---
title: Austin KubeCon — Persistent Storage Round-up and Looking beyond!
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 08-01-2018
tags: Kubecon, Kubernetes, Persistence, Storage Containers, Updates
excerpt: Kubernetes Clusters are up and running at the push of a button or even better by talking to your favorite bot.
not_has_feature_image: true
---

TL;DR

This rather has become a long post as I drafted it and incorporated feedback from community members. So, in short:

- 2017 saw Kubernetes being crowned as the de-facto container orchestration engine. And from the storage perspective, containerized storage makes its presence felt.
- 2018 — The reign of Kubernetes continues. Containerized Storage gains momentum with renewed focus on manageability of persistence workloads

—

Kubernetes Clusters are up and running at the [push of a button](https://twitter.com/muratkarslioglu/status/941399154714066944) or even better by [talking to your favorite bot](https://www.youtube.com/watch?v=07jq-5VbBVQ).

![Push a button](https://cdn-images-1.medium.com/max/800/1*oz5esyJvsb5zBIaoyDKUeQ.png)

source: Containerized Storage for Containers — session at Kubernetes Meetup [https://t.co/tdQaOue5w8](https://t.co/tdQaOue5w8)

But just about a year ago when we started envisioning OpenEBS — Containerized Storage for Containers — to be orchestrated by Kubernetes, setting up a cluster took a good three days. Phenomenal progress by the Kubernetes Community in 2017 — from Kubernetes — the Hard-Way to making it Child’s play!

If you were at KubeCon, you would have definitely been caught up in or at least glimpsed the Euphoria around Kubernetes. Kubernetes, almost feels like Noah’s Ark right now — you are either in or wait to perish. A little exaggerated, I know, but only a little.

_Every Technology and Cloud Service Provider are now providing or planning to provide a container service using Kubernetes and almost every infrastructure provider is looking at putting themselves on the map of Kubernetes._

![Cloud Native Landscape](https://cdn-images-1.medium.com/max/800/1*YJIF6xBEPL1WpVgOK4VV0Q.png)

[https://raw.githubusercontent.com/cncf/landscape/master/landscape/CloudNativeLandscape_latest.png](https://raw.githubusercontent.com/cncf/landscape/master/landscape/CloudNativeLandscape_latest.png)

And why not!

Kubernetes has reached the level of maturity that can be used with ease in controlled environments and at the same time, has gained tremendous strength from a community that is not afraid to re-engineer or re-architect the core components. The popularity of Kubernetes is enabling many meta-kubernetes projects like — kubespray, stackpointcloud, kubeless, heptio ksonnet, heptio ark, etc. And with these new projects and possibilities, many _Kubernetes — blue ocean — companies are on the rise!_

—

I am very bullish that Kubernetes is that magical ingredient that will renew the focus on HumanOps!

One inevitable aspect of being an infrastructure operations admin is to be prepared for smooth operations, scaling, maintaining and recovering from faults and disasters — which usually tend to put a lot of unwarranted pressure on the admins when dealing with their own management (business impact) and the vendors whose technology they used to build a “black-box” infrastructures. A “black-box” infrastructure that doesn’t comply with what they were told and assumed would do — and involves talking to people building those black-boxes often crossing company borders, leading into non-technical calls about blaming who is at fault. Such stressful conditions also exist within an organization where there is a crunch of resources.

Kubernetes and the meta-kubernetes projects are helping administrators build — what I call “white-box” infrastructures. Often professed and hardly-prevailed aspect of Infrastructure is the [_HumanOps_](https://blog.serverdensity.com/humanops/) _— "_ technology affects the well being of humans just as humans affect the reliable operation of technology *"* — which can be achieved by building “white-box” infrastructures that are easy to operate and reduce the dependency on specialists that tend to be over-worked in an organization. _The “white-box” infrastructures are built with API-driven Open Source Micro-Services._

The key to the widespread adoption of Kubernetes in such a short time is the inclusive nature of it, which was well captured by this slide from the KubeCon:

![Extensibility](https://cdn-images-1.medium.com/max/800/1*IXods_RnXRco2z7UcngePw.png)

[https://schd.ws/hosted_files/kccncna17/ac/KubeCon_2017\_-_Kernels_and_Distros.pdf](https://schd.ws/hosted_files/kccncna17/ac/KubeCon_2017_-_Kernels_and_Distros.pdf)

### **_Kubernetes is more than an orchestration engine → It is the new kernel for building clustered infrastructures._**

I consider this shift towards making Kubernetes a Kernel that can be extended by custom solutions that can be downloaded and installed as a true enabler for driving innovation — which is inline with the Psyche of keeping “Community First and Company Next!”.

—

This past year, saw the rise in user awareness for securing Containers. Different teams started tackling this issue from different perspectives — from providing secure container runtime like Kata Containers to using different types of Service Meshes to better access control and more.

Service Mesh was definitely a buzzword in 2017! The options — linkerd, envoy, istio and conduit — all of which are (or will be) accepted into CNCF sooner or later, provide a glimpse of interesting trend. For instance, [conduit](https://buoyant.io/2017/12/05/introducing-conduit/) is from the same team that built Linkerd. Conduit provides similar capabilities like Linkerd for managing the communication between micro-services, but seems better suited for Kubernetes environment that can run across clouds and with low resource constraints.

Like Service Mesh, the other infrastructure components — logging, monitoring, tracing, and networking are all being containerized (re-engineered) to work well with Kubernetes primitives (resources, pods, policies, federations, labels, taints, tolerations, affinity and anti-affinity, CR, CRDs, Custom Controllers, etc.)

### **_Kubernetes has become a powerful set of nuts and bolts, that is changing the way people should think about infrastructures and how systems are built._**

—

Storage is no different. How data is stored and managed is also being transformed by the possibilities afforded by Kubernetes. Like Service Mesh of initial days, a lot of incumbent storage vendors are providing a patched (which some view as cloud washed or container plugged) solutions that will result in operations and developers spending endless hours firefighting to make them work with cloud native environments.

The key for any infrastructure component to be called container-native will be characterized by being hardware agnostic and usable at scale! The past few months, there is an active workgroup team grappling with defining — [_Cloud Native Storage (WIP White Paper by CNCF Storage Workgroup)_](https://docs.google.com/document/d/1cJLgOAIWbi-Ya27BY7mjH61yoO3oWcO5tOZYteaDVgI/edit#heading=h.ik4inq9mv6b4)

While deliberations are ongoing about what Cloud Native Storage is, which I think will finally be about users adoption, the talks at KubeCon suggest the community sees three distinct storage options for Kubernetes:

- Persistence Volumes from External Storage Providers
- Local/Ephemeral Storage for Containers
- Containerized Storage for Containers

—

**Persistence Storage from External Storage Providers**

Most of the cloud providers and incumbent storage vendors want the users to opt for this option where storage is connected via in-tree or out-of-tree dynamic volume provisioners. Many vendors are coming together in helping shape the CSI [(Container Storage Interface)](https://github.com/container-storage-interface/spec), and the initial implementation are slated to get into beta stage in early 2018. There are constant improvements — or strides — being made in storage workflow automation via controllers and `kubectl` — dynamically provisioning volumes, resizing, and snapshots.

I spoke to a number of storage users at KubeCon, including the team at GitHub who are at the forefront of putting Kubernetes in production. The users are still very wary with the state of storage w.r.t using the PVs to connected storage and the amount of work involved in rewriting their operational scripts and playbooks.

Another issue I heard users talk about that puts them off NAS or SAN — and this was a little surprising as I’ve spent years building a unified storage system that in some environments is really fundamental to the architectures of private clouds and hosting environments — is that they think shared underlying storage does not fit a microservices architecture. Of course, if you read the 12 Factor definition it talks about storage if at all as an attached resource. However — it also is clear from 12 Factor approaches that _dev should be the same as possible as production and that the same people should be doing coding and deploys._ That’s just not the world of external arrays with special teams running storage and different arrays for dev, test, staging, and production.

It is also worth noting and taking time to understand that these options of connecting to network storage have been around for more than couple of years, and the fact that Stateful workloads on Kubernetes aren’t yet as prevalent says something about user acceptance of the approach! _Users are waiting for better options to be made available — like the support for local storage or something else — but not NAS!_

Learning from the HBO team that was streaming GoT using Kubernetes, it is interesting to see a solution like Rook being used on top of EBS, while EBS is provided as PVs themselves.

![Telemetry](https://cdn-images-1.medium.com/max/800/1*Zl5PPYzJpDZoXrK7DCL_0w.png)

[https://www.youtube.com/watch?v=7skInj_vqN0](https://www.youtube.com/watch?v=7skInj_vqN0)

Rook also presented a pretty interesting study against using PVs from external storage to Pods in their talk [here](https://schd.ws/hosted_files/kccncna17/b3/Cloud%20storage-2.pdf). This is inline with what the teams at [PortWorx](https://portworx.com/ebs-stuck-attaching-state-docker-containers/), [StorageOS ](https://schd.ws/hosted_files/kccncna17/ca/2017-12-8-persistent-storage.pdf)and OpenEBS have been advocating as well.

- Make static assignments of disks (physical or virtual) to nodes and use them as local storage — avoid detaching/attaching disks from nodes
- As long as the applications can take care of replication and sustain longer downtime for nodes and cluster rebuilding times — use local PVs with the storage provisioned in the previous steps.
- For workloads that don’t inherently support replication, snapshots, etc. use a containerized storage option.

_I am a firm believer in CSI and what it was set to achieve and has already accomplished— Open Standard for interfacing with Storage. Something which SNIA should have done and couldn’t do in past two decades of my experience. OpenSDS seems to be an effort in that direction by SNIA, but is being received with the same cold response from vendors and in turn the community. FWIW, REX-Ray is also playing in the same space._

At the moment, the focus for CSI is on (simplifying a bit) provisioning and de-provisioning volume, but albeit a good start. But is it enough for the users to start using it? There was an interesting observation made in the F2F storage workgroup meeting at KubeCon that CSI discussions are mostly driven by vendors. Where are the users? Can we say that vendors represent the users, because they interact with their users?

Coming from a operational background, for me to consider using CSI to connect with external storage systems, CSI requires to evolve and include API for Day 2+ Operational Usecases that involve — ease of debugging, snapshots, backups, migration and most importantly, a unified monitoring system of the Kubernetes Clusters and the Storage Systems.

Don't get me wrong. We need storage, lots and lots of it and it will be served from external storage systems — cloud (EBS, GPD, etc., ) or on-premise SAN/NAS products. But these external storage systems weren’t designed to be used for micro-services environment but rather to provide volumes to Nodes (physical or virtual) that are long running and are not subject to rapid connects, disconnects and migrations.

_I believe in the long run we will be using CSI with these external storage for what they were designed for — mainly to provision storage to the nodes rather than Pods._

—

**Local/Ephemeral Storage for containers (aka Direct Attached Storage — DAS)**

Kubernetes keeps improving the capabilities for managing the local/ephemeral storage. The recent advancements include:

- Support for attaching [block devices](https://schd.ws/hosted_files/kccncna17/8e/Mitsuhiro_Tanino_Block_Volume_KC_CNC_NA17.pdf) to pods
- Support for enforcing policies or [resource limits for ephemeral storage](https://schd.ws/hosted_files/kccncna17/3e/Kubecon_localstorage.pdf)
- Enhance the UX for using [local storage for PVs](https://schd.ws/hosted_files/kccncna17/3c/2017%20Kubecon%20Storage%20-%20FINAL.pdf) — dynamic provisioning, hook into the scheduler for pods requiring local storage PVs etc.,

_When using local storage for PVs, the applications using these PVs need to also own up some of the features like — data consistency, replication, snapshots, etc., that are typically taken care of by the storage controllers._

_One of the ongoing issue with using the local storage in clouds are the quirks of disconnecting and connecting the disks to different instances. The local storage is really meant for using storage that is tied to the node — either physically inserted or hardwired to a VM instance._

—

**Containerized Storage for Containers (aka Container Attached Storage — CAS)**

The appeal for fully containerized storage for containers is in the possibilities that it opens up to the DevOps administrators who are interested in building on-demand programmable infrastructures, which include:

- storage can be observed down to the bit using the same set of tools they use to monitor their compute and network.
- storage can also be secured using the same tools used to secure application pods
- storage can be made policy driven similar to networks
- storage can be programmed and versioned — made an integral part of the work flows for developers and operations administrators
- storage can also use federation features for cloud migration similar to application pods.

_StorageOS presented at KubeCon on what we call Container Attached Storage — and on how to select which storage approach for which workload and environment. It was a good talk — slides are here: _[talk](https://schd.ws/hosted_files/kccncna17/ca/2017-12-8-persistent-storage.pdf)

_Kubernetes can provide an unified infrastructure layer to the applications by pooling together nodes with compute, network, and **storage as well**._

KubeCon showcased a demo of launching [glusterfs in containers](https://schd.ws/hosted_files/kccncna17/7b/KubeRunningYourStorage1208.pdf). While this is feasible, it might put some hard requirements on the amount of RAM and CPU required for running the software optimized for running in the nodes in containers.

To be container-native storage, the storage software needs to be broken down into micro-services, just like how Kubernetes runs using micro-services. There has to be greater flexibility provided to the developers and operations to run seamlessly on their choice of hardware!

OpenEBS does just that! OpenEBS provides all the enterprise grade storage features by its open-source containers that can run anywhere. _No kernel dependencies and vendor lock-in._ A typical data path using the OpenEBS Containers is as follows:

![Stateful Apps using OpenEBS Volumes](https://cdn-images-1.medium.com/max/800/1*Ifsa-k-q4EnO7Fpg7E6jLA.png)

[https://github.com/openebs/openebs/blob/master/contribute/design/OpenEBS%20Architecture%20and%20Design.pdf](https://github.com/openebs/openebs/blob/master/contribute/design/OpenEBS%20Architecture%20and%20Design.pdf)

OpenEBS can consume any storage connected to the node and provide enterprise grade storage features (like snapshots, replication, data-consistency, cross-cloud migration, etc.) to Stateful workloads.

2017 saw a steep rise in the community for building OpenEBS with users evaluating it for different types of storage workloads from Cassandra, Minio to MySQL and some users also rolling out services to their customers using Kubernetes and OpenEBS. _I am looking forward to more application work-flow focused automation of Stateful workloads using OpenEBS in 2018._

—

Managing Storage in an enterprise environment — whether it is cloud or on-premise has to be as seamless as interacting with your favorite bot! I know it is a bit far fetched, but it is definitely going to happen in 2018 with companies like MayaData leading from the front!

2017 saw some major improvements to storage in Kubernetes, but there is a lot more to look forward to in 2018!

- CSI spec will mature to encompass all the storage API and will be adopted by a large percentage of storage vendors.
- Improved debuggability/observability of PV — Metrics and Alerts etc.
- Make PVs accessible via namespaces and RBAC and extend the Policies to involve HumanOps!
- Further improvements to resource constraints from the IOPS perspective
- Support for host-supported file system types to be used on top of local storage

_Programmable and Predictable Infrastructures are what the developers need while the administrators are looking for building infrastructures that can be easily versioned, built, and deployed anywhere — where the economics makes sense._

—

I take tremendous pride in having been associated with MayaData team that is at the forefront of making Storage Operations fade away by extending Kubernetes with containerized storage for containers.

Your participation will shape and accelerate the movement of Stateful Workloads on Kubernetes. Do join us on Slack on either [Kubernetes sig-storage](http://slack.k8s.io/) or [OpenEBS users](http://slack.openebs.io/) or join the [CNCF storage events](https://calendar.google.com/calendar/embed?src=linuxfoundation.org_o5avjlvt2cae9bq7a95emc4740%40group.calendar.google.com)!

Looking forward to an exciting 2018 for the Stateful Workloads on Kubernetes!
