---
title: Deployment modes of OpenEBS
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 13-02-2017
tags: Container, Docker, Kubernetes, OpenEBS, Storage For Containers
excerpt: OpenEBS supports two modes — Hyper-converged and dedicated. The deployment mode really depends on where and how you want to use OpenEBS.
not_has_feature_image: true
---

OpenEBS supports two modes — Hyper-converged and dedicated. The deployment mode really depends on where and how you want to use OpenEBS. If you are adding block storage capability to existing Kubernetes minions, hyper-converged mode is most desired, so that you can use the existing hardware as is. If the desire is to get a full fledged EBS type functionality to your on-premise cloud or container needs, then dedicated storage servers for OpenEBS is a better choice.

In the hyper-converged mode, OpenEBS Maya hooks into the K8s master and minions, hooking into scheduling algorithms for creating OpenEBS VSMs. When used in dedicated mode, the provisioning API are exposed via the OpenEBS Maya master. Dynamic Provisioning of the storage can be enabled using the volume plugin drivers or use the EBS volume plugin as in the case with K8s.

![OpenEBS — Hyper-converged mode](https://cdn-images-1.medium.com/max/800/1*MxM5MmWCB_5mmy7A5bor6Q.png)_(OpenEBS — Hyper-converged mode)_

![OpenEBS — Dedicated mode](https://cdn-images-1.medium.com/max/800/1*MAbRf5rJfv8w_OvZz02q7g.png)_(OpenEBS — Dedicated mode)_

In both modes, Flannel plays an important role in OpenEBS deployment for storage networking. A lot of issues are yet to be discovered in this area.. yes, this is just a start.
