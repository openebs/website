---
title: OpenEBS plus Red Hat OpenShift and StackPointCloud and IBM Cloud Private and….
author: Evan Powell
author_info: Founding CEO of a few companies including StackStorm (BRCD) and Nexenta — and CEO & Chairman of OpenEBS/MayaData. ML and DevOps and Python, oh my!
date: 05-02-2018
tags: DevOps, Docker, Kubernetes, Updates, OpenEBS
excerpt: This week we announced that our partnership with Red Hat is flourishing. We achieved their Primed level of certification for their OpenShift offerings and are seeing more and more users rely upon OpenShift and Kubernetes as a means to provide persistence to their workloads.
---

This week we [announced](https://www.prnewswire.com/news-releases/openebs-certified-with-red-hat-openshift-stackpointcloud-and-ibm-cloud-672729373.html) that our partnership with Red Hat is flourishing. We achieved their Primed level of certification for their OpenShift offerings and are seeing more and more users rely upon OpenShift and Kubernetes as a means to provide persistence to their workloads.

The alternative pattern, of course, is to connect to an external storage system. Solutions like Rook and others such as the CSI efforts of RexRay and many others enable the use of external storage.

Actually — so does OpenEBS :)

OpenEBS can and often does use external storage underneath. With OpenEBS, however, every workload has its own storage controller(s) that themselves are easily orchestrated by Kubernetes and data is local by default. There are three main benefits to the OpenEBS containerized architecture that external only storage cannot address due to architectural limitations:

- **The granularity of control** — with OpenEBS the storage controller interprets ever more individualized and extensive storage policies and makes them so for each workload. Because OpenEBS is a full system (or is becoming one :)), it offers far more control than centralized storage that itself has to address the sometimes competing needs of countless — hundreds — of workloads. Developer teams can take on storage knowing they are much less constrained than they are working with least common denominator external storage.
- **No SPOF** — in an age in which chaos engineering is becoming more and more popular, the notion of a sacrosanct dependency that cannot itself be disrupted or the entire system crashes potentially into a non-recoverable state is anachronistic. Put more directly — shared scale-out storage is an anti-pattern for many. Blast Radius.
- **Performance** — as storage heads, we too often likely focus on performance. However, OpenEBS does work with databases, and in some cases the speed at which you run those workloads directly translates into user experience and hence money. So the tax a scale out storage system puts on performance versus the insane and rapidly accelerating speed of direct attached is essential. Ironically, scale-out first arose in part to work around how slow local disk was; times have changed. If you are interested in performance, you’ll want to grab our cStore by the way which, as the name suggests, is written in C and does much else as well to build upon our inherently faster Container Attached Approach. Stay tuned…

So why Red Hat and why StackPointCloud?

In both cases, we see organizations that are doing an incredible job helping their target users adopt Kubernetes based orchestration. With Red Hat, we tend to see especially larger enterprises taking the approach. With StackPointCloud, there is a real mix of departmental level users at large organizations as well as countless start-ups. In both cases, our support of Helm charts for OpenEBS makes it trivial to spin OpenEBS up.

While OpenEBS itself as not achieve 1.0 status, we are working hand in hand w/ partners to make sure users are succeeding in their use of OpenEBS for stateful workloads. There must now be at least hundreds of production proof of concept deployments ongoing. We will be making [MayaOnline](http://www.mayaonline.io/) freely available to help these and other users in the near future via no cost monitoring and control and ChatOps integrations.

Please get in touch via [Slack](https://join.slack.com/t/openebs-community/shared_invite/enQtMjQzMTg4NTcyNTY2LTJiMzVjYjA5ZDk3YmI4NjAxY2QyYmI3MTA1MmUxMTAzNTU0NTM5NTViOTIxMjA1NWQ4NzVmMTBiNjk0NDU1YzQ) or otherwise if you would like to spend a little time with us to discuss your use cases and, of course, if you are running OpenEBS and testing it out.
