---
title: Torus (from CoreOS) steps aside as Cloud Native Storage Platform. What now?
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: DevOps, Docker, Storage Containers, Kubernetes
date: 20-02-2017
excerpt: Torus (from CoreOS), that aimed at providing container-native distributed storage announced that it would discontinue development due to lack of traction.
not_has_feature_image: true
---

[Torus (from CoreOS)](https://github.com/coreos/torus), which aimed at providing container-native distributed storage announced that it would discontinue development due to lack of traction. It just goes to show the dynamics of the open source projects and how business needs could influence them.

Torus attempted to solve one of the core infrastructure problems, and like any projects that aim to solve the infrastructure problems — compute, network or storage, are slightly harder problems to crack with only a handful of people really venturing into solving them. Maybe, this inertia is also due to the fact that, when infrastructure fails, hell breaks loose — we are all too familiar with those network outages and data loss situations where Database teams spend days recovering data.

Harder problems require renewed focus, at least in the initial stages to get the product off the ground for the basic use case. The entry barrier must be minimal, if not totally absent. Once the core value is established, in terms of ease of use or scale and just solving a problem in an intuitive way, it graduates into the adoption phase.

With containers changing the landscape of applications, they pose an additional set of requirements on the storage platform, which are covered in my earlier post — [Emerging Storage Trends for Containers](https://blog.openebs.io/emerging-storage-trends-for-containers-4970e4c51de#.ep5wl2u0z). *Any container-native storage platform developed today should be distributed and natively integrated into container orchestration platforms like Kubernetes*. Torus got these aspects right.

While suspending further Torus development, I find it interesting that the committers at CoreOS mentioned Rook.

[Rook](https://github.com/rook/rook), like [GlusterFS-container](https://github.com/gluster/gluster-containers), are not container-native, they provide wrapper projects that make it easy to deploy alongside Kubernetes. In the short-term towards the journey of taking containers into production, this retro-fitting approach may be OK! If there is enough traction to refactor the existing projects (Ceph) as we move forward.

But as we saw with compute virtualization paving the way for software-defined storage, there is a need for container defined storage. PortWorx and OpenEBS alone currently come close to being container-native storage platforms, built ground-up using containers by teams that have built enterprise and cloud storage platforms.

OpenEBS is a distributed block storage that supports both hyper-converged and dedicated deployment models. However, the implementation of the block storage with OpenEBS follows a different approach for block replication (forked out of [Rancher Longhorn](https://github.com/rancher/longhorn)), which optimizes the meta-data processing of the distributed blocks.

OpenEBS also inherits the data protection capabilities, pushing backups onto Amazon S3. We are currently working on EBS like API for provisioning the storage from K8s. With its cloud integration capabilities, we envision the capabilities supported by OpenEBS to enable our customers to build On-prem container environments that are compatible to be moved into the Cloud and vice-versa.

OpenEBS Storage is delivered through VSMs which are essentially containers — frontend and backend, that can be scheduled by Kubernetes along with the Application Pods. The storage specific parameters are fed into the scheduling algorithms through our OpenEBS storage orchestration layer — maya. This container mode of deployment also reduces the burden of managing a separate storage network. The building blocks of the OpenEBS were covered in this post — [OpenEBS building blocks](https://blog.openebs.io/openebs-building-blocks-rancher-longhorn-b8928b5921fa#.r7kzqlucd)

If you were planning to contribute to Torus or just interested in getting your hands dirty with container-native storage platform, please take a closer look at [OpenEBS](https://github.com/openebs/openebs), which is completely open source.
