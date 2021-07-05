---
title: Recap of Google Next’18
author: Murat Karslioglu
author-info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 01-08-2018
tags: Cloud Services Platform, Knative, Google Next18, Istio, OpenEBS
excerpt: This year I have attended a number of tech events and in terms of size, organization, and especially the content — Next ’18 is so far my favorite.
---

![You know that you are at the right event when you see a familiar face like Mr. Hightower :)](https://lh3.googleusercontent.com/iBQD9nOCN5cmrzn73zLeMoHDdhbTZWa3d4sSC1k1wkudXXL0L0912hrjUe2Bxr3MBTLOM_-LDC-ZrA-zNq8arcTJfD_V6e0pc_A9_oKcm6tAsBnIfqXdTfEbnmb8Qu_PoSyBZkVN)

This year I have attended a number of tech events and in terms of size, organization, and especially the content — Next ’18 is so far my favorite.

Next ’18 was an excellent representation of Google as a company and their culture. Sessions were mostly in Moscone West, but the whole event was spread across Moscone West, the brand new South building, and six other buildings.

![Next ’18 Event Map](https://lh4.googleusercontent.com/3ojmOPqqjEieE6GxfEjgFxRRv4sIzQpA_x21hFRpj3IRrmy6i7HL4k5FO2zztbwf9b5HJlrzO8BP3bWkOM34gZQdKS5lmLqR0FjmHJr96VIToFfc-SWdIKmlLcMJLz2y_tWPbERn)

The floor plan was fun and casual; catering was of “Google Quality” and the security was insane, with metal detectors, police, K9 search dogs, and cameras everywhere. And of course games, fun, and even “Chrome Enterprise Grab n Go” were there in case you needed a loaner laptop to work on — see some pictures at the end. :)

### **What I learned at the Next ’18 conference**

First of all, a big shout out to all involved in the [**Istio** project](https://istio.io/). It is not a surprise that we see great advocate marketing and support for the Istio 1.0 GA release on social media last week. Istio is a big part of the [**Google’s Cloud Services Platform**](https://cloud.google.com/solutions/cloud-services-platform/)(**CSP**) puzzle.

![GCSP Dashboard — After deploying my first app in less than 30 seconds.](https://lh4.googleusercontent.com/taoSgNELqkMCnfsqUd84nPfbIATkjucboLYdbzMUWKct5ZFiXb_PZFjoU5KFBc5LZNBz6mhuwHXEpMs49tREabCzrMDCuNTrKniQ4UYuk_i1pNxR08pUHOEjtZ3nxfUOZswcA_xe)

Later this year, Google is targeting to make all components of their CSP available (in some form). CSP will combine **Kubernetes**, **GKE**, **GKE On-Prem** and **Istio** with Google’s infrastructure, security, and operations to increase velocity, reliability, and manage governance at scale.

Cloud Services Platform will be extensible through an open ecosystem. **Stackdriver Monitoring** and **Marketplace** are the extensions to platform services. [Marketplace](https://console.cloud.google.com/marketplace/browse?filter=solution-type:k8s) already has 27 Kubernetes apps including commonly used components of many environments such as Elasticsearch and Cassandra.

![CSP Marketplace](https://lh3.googleusercontent.com/esTW1l0iBV-Wvleoosxha1W5KqmA5BQLZ-4jyfb3e0W2j_S5rzqtncJCFA8t6brQc_ZJdF2eVqaXAdhHASBlTq9izYO85SLSZRyE8mbwoB1EiFHTmQdwDHsnTdFm2EDb0i4yefVA)

Users will be able to deploy a unified architecture, that spans from their private cloud, using Google CSP to Google’s public cloud. Again, the two most important pieces to this puzzle are managed versions of the open source projects Kubernetes and Istio. To me, the rest of it still feels mostly to be DIY-like quality.

Knative, Cloud Build, and CD are other significant solutions announced at Next’18.

### **A new cloud availability zone, this time in your datacenter — which might be in your garage**

At first, **GKE on-prem** got me interested. But, after talking to a few Google Cloud Experts again, I felt it’s very early to be seriously considered. You can read others’ thoughts here on [Hacker News](https://news.ycombinator.com/item?id=17602555).

![Discussions on GKE on-prem](https://lh5.googleusercontent.com/q_0yHazRpRZ9bLptYCw1_GQsmdM8TpbM7xXmZ8nL8nejR3uhVg79bvJokA_BrQ91VfzYYl8OLtQ1Evl5VNJqDwJM3EKwqKFsn_jr99N91hCEa1lkazjMZE3aphRbr21LEc0atqTr)

GKE on-prem alpha will support **_vSphere 6.5_** only, no bare-metal for now!

Failover from on-prem -> GKE is something Google team is working on. This means GKE on-prem instance will look like another availability zone (AZ) on a Google Cloud dashboard.

Other than vSphere dependency, the idea of being able to have an availability zone, local in your data center is really compelling. It is also a very common use-case for [**OpenEBS**](https://openebs.io/) since there is no cloud vendor provided, a cloud-native way of spreading your cloud volumes, EBS, etc. across AZs — we see many community users running web services today using OpenEBS to enable that.

### **Github and Google Partnership to provide a CI/CD platform**

**Cloud Build** is Google’s fully managed CI/CD platform that lets you build and test applications in the cloud. Cloud Build is fully integrated with GitHub workflow, simplifies CI processes on top of your GitHub repositories.

![Me deploying myself on Serverless Cloud Maker :)](https://lh3.googleusercontent.com/Vid2Mpm0eaSATtriAt3eLoDdBvvRcv7WCJeNBKxe_VOhVcbdrmh_nJIn5aiQlnMfEOpywRMhHF7Gnv58Nyu_5MQHoWWfxMCmPYdfDlYlKkiQPldJvHxEk9Qa5BOQBuDQNW-YZ0dc)

Cloud Build features;

**Multiple environment support** lets developers build, test, and deploy across multiple environments such as VMs, serverless, Kubernetes, or Firebase.

**Native Docker support** means that deployment to Kubernetes or GKE can be automated by just importing your Docker files.

**Generous free tier**— 20 free build-minutes per day and up to 10 concurrent builds may be good enough for many small projects.

**Vulnerability identification** performs built-in package vulnerability scanning for Ubuntu, Debian, and Alpine container images.

**Build locally or in the cloud** enables more edge usage or GKE on-prem.

### Serverless — here we are again

**Knative** is a new open-source project started by engineers from Google, Pivotal, IBM, and a few others. It’s a K8s-based platform to build, deploy, and manage serverless workloads.

_“The biggest concern on Knative is the dependency on Istio.”_

Traffic management is critical for serverless workloads. Knative is tied to Istio and can’t take advantage of the broad ecosystem. This means existing external DNS services and cert-managers cannot be used. I believe, Knative still needs some work and not ready for prime-time. If you don’t believe me, read the installation YAML file — I mean the 17K lines “human readable” configuration file ([release.yaml](https://github.com/knative/serving/releases/download/v0.1.0/release.yaml)).

![](https://lh6.googleusercontent.com/0qn1GCe8B-15DIr5G7eqqbg3FfnOcm58iQ08ZUobrKJ82xIArtNjnSuFS2KOkkEhyGfyTH8pz5_NXZOk87EllIjN4rSVYlyxxmN6iDemZ0AgM_Yd-FMZzMR-nQdCHpFPTIL84hwS)

### **My take on all of the above — Clash of the Cloud Vendors**

If you have been in IT long enough, you could easily see the pattern and predict why some technologies will become more important and why will the others be replaced.

_“What is happening today in the industry is the battle to become the “Top-level API” vendor.”_

20–25 years ago hardware was still the king of IT. Brand-name server, network, and storage appliance vendors were ruling in the datacenters. Being able to manage network routers or configure proprietary storage appliances were the most wanted skills. We were talking to hardware…

20 years ago (in 1998), VMware was founded. VMware slowly but successfully commercialized hypervisors and virtualized the IT. They became the new API to talk to, everything else under that layer became a commodity. We were suddenly writing virtualized drivers, talking software-defined storage and networking — the term “software-defined” was born. Traditional hardware vendors lost the market and momentum!

12 years ago, the AWS platform was launched. Cloud vendors became the new API that developers wanted to talk to, hypervisors became a commodity. CIO and enterprises that are sucked into the cloud started worrying about the cloud lock-in. Just like the vendor lock-in or hypervisor lock-in, we have experienced before. Technology might be new, but concerns were almost the same.

4 years ago, Kubernetes was announced and v1.0 released in mid-2015. Finally, an open-source project that threatens all previous, proprietary, vendor managed “Top-level API” that we were using became a majorly adopted container orchestration technology. Although it came from Google, it took off after it got open-sourced and probably would be right to say that so far financially, Red Hat profited most from Kubernetes with their Red Hat OpenShift platform. And now we see somewhat of a battle over APIs to be used in operating applications on Kubernetes, with the RedHat / CoreOS operator framework and other projects including one supported by Google and others such as Rook.io emerging to challenge or extend the framework.

Google Container Engine (**GKE**), Microsoft Azure Container Service (AKS**)**, Amazon Elastic Container Service (**EKS**), IBM Cloud Container Service (**CCS**), and Rackspace Kubernetes-as-a-Service (**KaaS**) are all competing in the hosted Kubernetes space (new vendors expected here).

There is enough space to grow in the self-hosted Kubernetes space. GKE on-prem is the validation from Google.

**Hardware>Virtualization>Cloud>Containers>Serverless???**

Many of us see **Serverless** as the next step, but it might be too granular to support larger adoption and current limitations validate the claims. It doesn’t scale well for intense workloads.

One size doesn’t fit all, there are still traditional use cases that even run on bare-metal and VMs. Same might be true for Serverless. It is not for every workload. Modernizing existing workloads will take time, and we will see who will become the leader of the next “Top-level API”.

What do you think? Who is going to win the clash of the titans? What did you think about Next’18 and Google’s strategy?

Thanks for reading and for any feedback.

### **Some Next’18 moments from my camera**

![](https://lh4.googleusercontent.com/ARfwggxkEIm1I-QXUGinQGV0zVQLzaTaQ9WxUEC4nN-xuTUsK0I-Bi4JO9kwyIi6MQYxnu0hBQDxdbkVy5nsTd5oQMEl-JCXRvdWWVhcrbCK3EfM8EegXImT2_Kn0kXeZoHbfLmK)

![](https://lh5.googleusercontent.com/bUCoD0IKci0QEETmHlcrUN-wOSLFSYsIuR4aG96D3QtZo23_gm10SfBqMzUtHVduFt-XzA4m9mI-sae4ktxJRIG9m9aBUt9VUtG0ytYyjFoh-Q2GbFNlQC7Ry0iBiTiaKUNuKsFd)

![](https://lh3.googleusercontent.com/Vdr19dKixjLs64xGxB_thJ3D8_-cnMihbC-gH50S5FuFJ13y2UMb42zSQy9Rp2LT9olLP5TPSRb4WPoW71l71NMJoBeK70SiFtYgsDs1l2k2tmLTiqJTlo9ajj0F0xTp4JlkQuF2)

![](https://lh4.googleusercontent.com/GGkcm_nFqb_gDKJuBJISMI3mueZx6xiBE6R8diM84xEOnYmcSDQVNPaRTbIFgBf-fh1Y_8JcioxxP8g8RzrxYEUJ4Xhw51RMRdXw3aS3fVpbH_mjc_kPUC0pXL3WxXZNlgR3baCb)

![](https://lh4.googleusercontent.com/seBUEu7ltrIHW3VxY_V5rqekHkLXfLYhR0dZZbsyr8MC-vww-_rGvQA3rPz0kfbqudV-LNAi292BTwNrGIe_KG56Vqr-sHSv-mPlIy8nhnJDQPQKnUj7ohg3uql67RVvqTf-earr)

![](https://lh6.googleusercontent.com/2BPdWJYXZizBdmFra0GYqedeArDGynas8VsxPkC0FWhyCjUm8A7TYLpPN06hPMmQ1UQ_yPoG8mH91eRjAyQE6sbw4Jo2wjPlsqDVTLEohowMOtSQaEuSWZO0lIntDOeMip75K20P)

![](https://lh3.googleusercontent.com/esI-PdVDc9sEqPoOkwG4nQhcD_FYSxs8Z1eBiHW9UTBDNO9bbd145X9vwnQgijXHTiz6DUD_bgkz9ViC1C2ukDYtjLaHVAIFlEMPcHmQEWjpKeq3pvEy4HyWXeK65oe61LUMTZ1-)

![](https://lh5.googleusercontent.com/KtS0m1tRBvjWehJSCSFItgtvDK5IiAEU20aa3GfSK6TmlyPVWjQpjnq_z5OAxsa1-L7PQuNRuiK2ZRX1It-1CrDlqzv1ubwrYaZA_gQQGxsb2rXJCAiQPjZ9GLiqXHZsCess6dYz)

![](https://lh6.googleusercontent.com/Uee-fb3QJewe05s4AWM2bF6b7MuRI8XgU9r3KfX72RNwVYYecjt5UX15vw1jhk0LoqvgL1MN5yKT5t9Mei6QzI7bohUAKtoQthG02YCr1VXiM4HFB-RRmQB29uuANQNDiq1sGKGe)

![](https://lh6.googleusercontent.com/OXx7ZGSWDI5z2UnqunkcWtB1MWY5ZtXs3EmruVAqfZo4JiLzhd00hmRkKZi_y2Icv6FV4CJRJW68HK1laKNXCKnGI5A9Z1l53R1BtOiM6dLzjDvecuWLgzPIgir3Q89qxkHt50yo)

![](https://lh4.googleusercontent.com/LUlB3APRP1t0gEEzaXmPbUxZFKGD1nVHRtdNMoKp7iSTLAZAHXOF3W_VPaZs9-XsLdw54GC2TnjnxGyR_spqek8X5ZLFkWICZpP4oXEzATj4n_vfvLQtr0FNceiT3lKzGKg7oh1f)

![](https://lh4.googleusercontent.com/AZP7UsS_i0gXvSBRuoDas6D48cBdU9JD3N39C53YEIdJwXARCyEg2sXRSuvOGUSa07o0xZ2UzQc8mLgZxj6EQm8uRLZ3JXVDzEwx6kTT3Vq-eia5OV865zc0q3bq3htEDZxUiIX1)

![](https://lh4.googleusercontent.com/GkXUs0HYRwS66hSMex7NDDT6Ck0NaxO4VrIHW23GzjrQbRMWDDA4EGwIOwSsg3O8tL_iNuISRywMDuF1u61rZm4fzaBisfUkyo-aPIcCcTk3KwUPunnPwgrV6-oRca0td-eYHxss)

![](https://lh3.googleusercontent.com/EPOoqoV_b11WJCV9cNJFgAtGfuRyqF3xZpKKoJ46J54wNsrE0kFFp82WFZn_gRoRTSLYPAkFHdFcizdOOBYwk_pL6pUZiy9ld24o-xBHIJZWcLmz_tMSFav77_9fbc2pPbwgnObR)

![](https://lh5.googleusercontent.com/cbuvmjdXzUEgiSf6BL6jC3-TKAbwf1WASiNfypDXQcmeXLrr6OPhITsEjeEUo1dXtg3OW3YTPNez3XxjaRxeAV_Ox6dTq9XpbwNDqh2-iWiXqWhrgn2o1VIe45xKPGYsxxPluLkw)

![](https://lh5.googleusercontent.com/wskI0Jy2g9icXoitcNDIp9VChhWlxu9fIDwepnqd0ds_Oq1m8Yt7ZHY8GZ_DvfS8IQcNfsJyBanCPIpp_GUznnzK3b3YBP7F2oV9gsi9k9WyKfwmWGCI4um2SKeNveXy2uaeD-sd)

![](https://lh5.googleusercontent.com/zeDLw8eZvkjgSfWnUwOkIG_Ze3GmKAwrTH59o37K8XEMXDMcAOtUsOSzfEwP8qF7qgVHEbgCs6YbXyE9loDTZOX4q5JeRe2J4JMMufrD0H6wr-ADk9sMBzRRwgi3iRVjhTCLh0Uy)

### **Check-out the popular hashtags :**

[#next18](https://twitter.com/search?q=next18) [#googlenext18](https://twitter.com/search?q=googlenext18) [#knative](https://twitter.com/search?q=knative) [#kubernetes](https://twitter.com/search?q=kubernetes) [#istiomesh](https://twitter.com/search?q=istiomesh)

Also check out the keynotes:Keynotes from last week’s[ #GoogleNext18](https://twitter.com/hashtag/GoogleNext18?src=hash) here →[ http://g.co/nextonair](https://t.co/mVuwk0hw4i)
