---
title: Mayastor Engine Reaches Beta
author: Glenn Bullingham
author_info: Director of Solution Architecture
tags: OpenEBS
date: 19-11-2020
excerpt: Mayastor, the storage engine by OpenEBS has reached the beta stage. Read the blog to know more.
---

title: Mayastor Engine Reaches Beta
As I write this, it is early November, and the winds of change are blowing. The United States has a new president. Here in the United Kingdom, Keats' days of mists and mellow fruitfulness are departing, replaced by a low sun and the first morning frosts. And at MayaData, we see the Mayastor project carefully but tenaciously emerging from alpha/pre-release into its beta phase. In fact, Mayastor now undergirds MayaData’s commercial offering for performance sensitive containerized workloads, called [Kubera Propel](https://mayadata.io/product).

> ***“Beta Software: Software considered to be feature complete and substantially free of known major defects”***

Significant contributions over the past 18 months have seen the project raised from concept to working software. A major requirement of our MVP specification is that it should carry minimal performance overhead; Mayastor is intended to satisfy demands for performance at all levels of scale. At the beginning of Autumn, working in conjunction with Intel’s labs in the UK, we were able to validate that assertion; deployed in conjunction with the latest generation of Optane NVMe devices, the Mayastor data plane was found to introduce less than 6% overhead; you can read more about that benchmarking [here](https://openebs.io/blog/mayastor-nvme-of-tcp-performance/). Having addressed that performance criteria and the other principle MVP requirements, the Mayastor team at MayaData has begun to focus its contributions to the project on QA as we approach Beta and GA releases.

In particular, we’ve greatly increased end-to-end test coverage on Kubernetes. How MayaData tests Mayastor is something that I’ll elaborate upon in a forthcoming post.  However, suffice it to say customary suspects feature (Jenkins, mocha, nix, cargo test), whilst we’re also collaborating with our colleagues who maintain the [Litmus Chaos](https://litmuschaos.io/) project. By the time that you’re likely reading this, Mayastor-specific chaos tests should be available to all on [ChaosHub](https://hub.litmuschaos.io/).

## Ease of Use, Perf, and Availability

Mayastor MVP requirements center on ease of use, performance, and availability. In the Beta phase and subsequent GA release, these will be realized as a CAS platform with full NVMe data path semantics, declarative configuration via CSI compliant dynamic provisioning, and N+1 synchronous mirroring of data at the persistent layer. This closely approaches functional parity with the current OpenEBS storage engines (cStor, Jiva, and Local PV), with snapshot and cloning functionality to be added in Q1 2021. Mayastor will also very soon be the recipient of a streamlined deployment and configuration experience, which is exclusive to this engine.

## Try it Yourself

If you’re a member of the Kubernetes community looking to implement a platform-native storage solution in the new year, now is an ideal time to start evaluating Mayastor. The other venerable and respected engines of OpenEBS won’t be retiring overnight, but as full feature parity emerges, MayaData’s commercial products and services will on Mayastor as their default storage engine; we do recognize that some users will continue to prefer various flavors of Dynamic Local PV from OpenEBS - as a recent [blog](https://www.percona.com/blog/2020/10/01/deploying-percona-kubernetes-operators-with-openebs-local-storage/) from the CTO of Percona attests as do countless [Adopter.md case studies](https://github.com/openebs/openebs/blob/master/ADOPTERS.md) including that of the SaaS company Optoro, also a CNCF case study. Mayastor’s roadmap includes provisions for the inward migration of existing OpenEBS users. It’s an equally opportune moment to [consider becoming a contributor](https://github.com/openebs/Mayastor/issues/new/choose) to the project yourself.

To help with Mayastor onboarding as we prepare to go to full steam, we’re putting together a new documentation site over at[ GitBook](https://mayastor.gitbook.io/introduction/), which includes a comprehensive quick-start deployment guide (developer docs will remain, at least for now, with the OpenEBS/Mayastor GitHub repository). We’re also holding [Office Hours at Kubecon NA 2020 this month](https://kccncna20.sched.com/?searchstring=OpenEBS&amp;iframe=no&amp;w=&amp;sidebar=&amp;bg=), and we’d love to see you there.

If you’d like to try Mayastor from the source - you can do so, of course, from the GitHub repositories. If you’d like to also try out management utilities, including a cool management interface and available 24x7 support - please take a look at [Kubera Propel](https://go.mayadata.io/register-for-kubera-chaos-and-propel-technical-preview). A free forever for individual use tier is available.

## Conclusion

It is a propitious time for MayaData and Mayastor - and for data on Kubernetes more broadly. If you have always wanted to run workloads on Kubernetes but were put off by the stories of performance challenges, you can now move forward with confidence. Kubernetes enabled storage with the help of Mayastor performs faster than that of traditional shared everything storage while retaining the ease of use, open source community, and Kubernetes semantics for which OpenEBS has become famous.
