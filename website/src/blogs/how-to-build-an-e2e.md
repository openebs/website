---
title: How to build an e2e?
author: Amit Kumar Das
author_info: Engineer the DAO
tags: Cloud Storage, E2e Testing, Featured, Kubernetes, Storage
date: 17-10-2017
excerpt: e2e which expands into end to end speaks for itself. It can be treated as component testing, integration testing, or something that tries to test stuff outside the scope of unit tests.
not_has_feature_image: true
---

### What is e2e?

Well *e2e* which expands into end to end speaks for itself. It can be treated as component testing, integration testing, or something that tries to test stuff outside the scope of unit tests. I got attracted to this side of development when I was surprised looking at one of the smallest possible directory names ever in a code-based project. As I speak, we get to see a number of Go based projects having an *e2e* folder. I believe, it has been popularized by the likes of etcd, Kubernetes, and perhaps a few other open source communities.

### How to build one?

Before even getting into the How’s part, we must rather be comfortable with following questions:

— *Do we need to?*  
 — *Does our project need one?*

More often than not, a code based project will love to have one. Perhaps not with this name but the need will definitely exist. Some of the guiding principles highlighted in this article will also help us in getting the answers to these questions. So keep reading.

### Assuming our project needs one, how to build it then?

Are there any guidelines/rules that we can follow? Here they are:

— ***`Refer and re-use wherever possible than build from scratch`*** is the golden rule.

— ***`Start Small`***. In this context, it refers to '*not to gulp the entire code base and be very selective even to the point of refusing 90% of the code that is available for free*'. This is the learning I have had all these years as a programmer. This is essential if one wants to reach the milestones in time which will otherwise become a mirage. I have burnt my fingers multiple times with regards to this principle. The latest one was when I tried to reuse the entire Kubernetes e2e for [Maya’s](https://github.com/openebs/maya/) e2e. Needless to say I failed miserably. Some of these reasons are explained in this article.

### Is that all?

Definitely not. We will soon get into the How’s part which in turn is a repository of queries, doubts, and concerns.

To clarify it further, I had these queries when I started with the e2e journey for the [Maya](https://github.com/openebs/maya/) project.

- Should e2e be shell wrappers over [CLI](https://en.wikipedia.org/wiki/Command-line_interface), for example, [kubectl](https://kubernetes.io/docs/user-guide/kubectl-overview/) & [mayactl](https://github.com/openebs/maya/tree/master/cmd/mayactl)?
- Should it be tied to Go [*testing*](https://golang.org/pkg/testing/) library? Any benefits?
- Should it use the [*Ginkgo*](https://onsi.github.io/ginkgo/) library? Anything to gain?
- Should it be moulded with [*Ansible*](https://www.ansible.com/) and let the scene get enacted by its players (*read playbooks*)?

### Simplicity — One Rule to Rule them All

All these queries should be answered with simplicity in mind. In other words, how to construct test code that is simple?

With simplicity in mind, let us pen down some dos and don’ts that will be an
indicator of simplicity versus complexity.

### Simplicity — Direct Thinking!!

Listed are some of the direct modes of thinking with regards to simplicity.

- Code should just try to eliminate the repeating tasks of the developer, tester, or operator. It will be simpler if it builds logic on only those ingredients that play an inhibiting role in manual testing.
- Find out one tool (*in other words a dependency*) that can make this test code easy to reason and comprehend. Build the code around this dependency. Though this dependency becomes a hard requirement, we are still good if it satisfies the simplicity rule.
- It should be limited in its scope. For example, in the case of [Maya](https://github.com/openebs/maya/), its e2e is scoped to Kubernetes. Maya e2e avoids [*Ginkgo*](https://onsi.github.io/ginkgo/) etc libraries. It also avoids *Ansible* as the latter is not at all required.
- It should be built using a high level language. Maya e2e uses Go as its only programming language. It does not use shell or any other scripts. This choice is also dependent on the scope the test code is targeting at. In the case of Maya, [Kubernetes](https://kubernetes.io/) (*and host of other container orchestrators*) use Go as their primary language. This helps Maya to abide by the golden rules mentioned earlier.

### Simplicity — Inverted Thinking!!

Listed are some of the inverted modes of thinking with regards to simplicity.

- It should not try to be another [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) in the making. In addition, it should not deal with some smart syntax. It will instantly seem smart to the eyes which developed it, but will definitely repel others.
- It should not get into the way of the developer or the tester in form of auto-generation of test code etc. This will lead to its brittleness.
- It should not dedicate its logic to concurrency while running the test cases. It should not build its logic around CPU cores and parallelism for running the test cases either. It might seem concurrency is a required feature for a particular test case. However, do we take concurrency into factor while executing these cases manually? The test logic can have the concurrency built later in an iterative fashion. Remember “*shipping is better than perfect”* in these cases.
- It should not play around with the abstraction of containers and their orchestrators. Remember this is not the reason for its existence in the first place. It goes against the prescription of simplicity. Hence, cut this noise if they are not a natural fit.
- It should not mandate running the tests in containers. It is considered cool these days to run test cases in containers. However, it can backfire. For example, running your app and test cases as containers within a namespace or inside the same cluster. We do not want *100s* and *1000s* of containers getting spawned in the same setup that is meant to test your app which is again a set of containers.
- It should not involve a learning curve. It should be an involving library that can take inputs from the team (*internal as well as external*) and evolve.
- It `need not / must not` follow design patterns. The best it can do is to adhere to the core language’s best practices.

### What else should the e2e try to achieve?

Answers to these questions will help you in getting the other aspects of your e2e.

- Did we avoid fancy scripting ?
- Is e2e (*especially the reusable code pieces*) better than the one it was created from?
- Will *`anybody be able to contribute to anything`* in this e2e project?
- Does it look similar to the practices followed by its programming language? Why? This leads to a 0 learning curve and hence is simpler to understand?
- Do you still remember the `Golden Rules`? Add another one & that is **`End Small`**.

*Thanks to Madhuri Hebbar and Uday Kiran.*
