---
title: Litmus - Release a chaos monkey on your Kubernetes Stateful Workloads!
author: Karthik Satchitanand
author_info: Karthik has been into the Design and Development of tools for infrastructure as code, software testing performance & benchmarking & chaos engineering.
date: 01-05-2018
tags: Chaos, Kubernetes, Litmus, Software Testing, E2e, Chaos Engineering
excerpt: If you are a Kubernetes Enthusiast and working on stateful workloads, you may be asking yourself
---

**In this blog we quickly talk about what led us to build Litmus and to open source it.**

If you are a Kubernetes Enthusiast and working on stateful workloads, you may be asking yourself:

“With all the options I have to run Kubernetes — the permutations are endless — how can I be sure that my particular mix of options works well end to end at keeping my data safe and accessible?”

You are not alone, as can be seen by the ever increasing conversations on Kubernetes sig-storage slack channel and other forums like Reddit or Twitter. To just pick a few conversations:

![Is it really recommended to run stateful workloads like MySQL on Kubernetes?](https://cdn-images-1.medium.com/max/800/1*6VJXdgFpuwD-fUkEKPo0GA.png)

[Is it really recommended to run stateful workloads like MySQL on Kubernetes?](https://www.reddit.com/r/kubernetes/comments/88fxdg/is_it_really_not_recommended_to_run_stateful/)

![What are the storage solutions offered in Kubernetes today? Which one will suit my workload](https://cdn-images-1.medium.com/max/800/1*5s60fO7nzhZfC3SFNiY0gA.png)

[What are the storage solutions offered in Kubernetes today? Which one will suit my workload](https://twitter.com/rothgar/status/978694465975083009)

And say, you somehow have made the journey to explore different solutions out there, mostly referring to product documentation and blogs, how can you be sure that the solution will continue to work in your enterprise environment?

As enterprises move to DevOps and microservices, more and more of the infrastructure from policy engines through storage and everything in between such as DNS, tracing, logging and more are selected and operated by all in one teams. With this control and autonomy comes greater agility — and all too often, _stress_.

Meanwhile, infrastructure vendors and projects are also (we know first hand) challenged to keep their end-to-end (e2e) and chaos engineering frameworks updated with the ever-increasing permutations of deployment scenarios. Kubernetes itself is changing, new providers emerge every day, workloads are changing, and all of it is increasingly simple to adopt and deploy. As a storage solution provider we simply cannot have the resulting explosion of “corner cases” go untested.

The solution providers can go one step ahead to open source their project, but it still doesn’t help the users to ensure that the selected Kubernetes stack works in their highly distributed and agile environments and they are not called to fight fires at 3 AM.

![Fire-fighting production issues !!](https://cdn-images-1.medium.com/max/800/0*qX8CliW_E3gKMURn.)

“What’s a person to do? Test, test, release the chaos monkeys, and test again!”

Thankfully, Kubernetes and containerization and Go and some software engineering we’re happy to share make it much easier to provide end to end validation in real world conditions !

#### So — What is Litmus?

**_Litmus is a community for e-2-e testing and chaos engineering for Kubernetes, focusing on stateful workloads._**

The primary objective of Litmus is to ensure a consistent and reliable behavior of Kubernetes for various persistent workloads and to catch hard-to-test bugs and unacceptable behaviors before users do. Litmus can detect many more real-world issues than relatively simple issues identified by unit and integration tests.

Litmus can also be used to determine if a given Kubernetes deployment is suitable for stateful workloads. While Litmus tests and metrics were developed initially to test the resilience of container attached storage from OpenEBS and others — we realized that the use cases are broader and overall system resilience can be characterized, which is a major reason we are open sourcing our efforts and putting the time into starting the Litmus community.

Litmus tests range from initial setup and configuration validation to deploying and running persistent workloads under various conditions and failures.

_What sets Litmus apart is not just its intent of being an end to end testing framework that can be embedded into any CI/CD pipeline, but the ease with which different teams from product developers to customers can contribute to the tests. Litmus allows for defining scenarios using native language specifications (English !!) OR a set of easy-to-define/understand YAML templates which are internally converted into test scripts, with a simple Kubernetes manifest as the end-product._

Here is a simple test, defined in plain English:

![Simple test in plain english](https://cdn-images-1.medium.com/max/800/0*ar6cYX2rEJ7Nh_G2.)

## How to get involved with Litmus?

First, it might be useful to understand the basic pieces of Litmus. Litmus has the following major components:

![Litmus: High level architecture](https://cdn-images-1.medium.com/max/800/1*CdBbpkSilx3aJnZA3tiAjQ.png)

- **Deployments** that help in setting up different types of Kubernetes Clusters like on-premise, cloud, OpenShift, etc. The default is that the deployments provision and configure OpenEBS storage, however, these deployments are easily extended to support other storage and we are happy to help any user or storage vendor to build additional deployments.
- **Facilitators** for test execution that aid: defining and running test suites, capturing logs and generating reports about the test runs, fault/error injection tools that help to perform chaos tests, examples that demonstrate how to integrate these test pipelines with Slack notifications
- **Test modules** that are triggered from within a Kubernetes cluster. Think of these as containerized tests. For instance, the **_mysql-client_** can be launched as a pod to validate MySQL resiliency while the underlying nodes and the connected storage are subjected to chaos engineering.
- **Tests** that themselves are written in easy to understand formats, either in plain English (thanks [Godog](https://github.com/DATA-DOG/godog)!) or in Ansible Playbooks. These tests primarily interact with the Kubernetes cluster via **_kubectl_** making them highly portable.

Litmus can be used to test a given workload in a variety of Kubernetes environments, for example, a developer minikube or a GKE cluster with a specific storage solution or as a part of a full-fledged CI setup.

Litmus is early and needs all the help you can provide to have it cover the ever-growing Kubernetes landscape. Checkout the [Litmus Project](https://github.com/openebs/litmus) on Github for more details or if you are at KubeCon EU, please join us for the talk this Friday on [End to End testing with Kubectl](https://kccnceu18.sched.com/event/DqwD/using-kubectl-to-run-your-end-to-end-tests-amit-kumar-das-uday-kiran-mayadata-intermediate-skill-level) to learn more about how we have built Litmus and a quic

#### Conclusion:

Please welcome Litmus into the world! We’re pretty sure it addresses a set of needs being felt by everyone from developers and operators to service providers and cloud native open source projects such as OpenEBS. With Litmus we use microservices and containers and Kubernetes to test, validate and characterize environments end to end. Your feedback is welcome and needed. Thanks for reading!
