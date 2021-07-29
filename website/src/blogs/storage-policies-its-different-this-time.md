---
title: Storage Policies — It’s different this time
author: Amit Kumar Das
author_info: Engineer the DAO
date: 29-11-2017
tags: Container, DevOps, Kubernetes, Storage Policy, Updates
excerpt: One of the most common disbelief at the operator’s end would be the reports of an application’s (that consumed this storage) sudden death after introducing a much awaited shiny new storage feature.
not_has_feature_image: true
---


### Need for Storage Policy

One of the most common disbelief at the operator’s end would be the reports of an application’s (*that consumed this storage*) sudden death after introducing a much awaited shiny new storage feature. To make things worse the same surprise would be reciprocated from the storage provider as well. Neither the operator nor the storage fellow have any clues to this sudden strangeness.

Having gone through many such cycles of frustrations building storage features that satisfy the needs of every operator as well does not break stuff that are outside its control; I knew there was clearly a gap in storage design that needs to be talked about openly and bridged. In this article, I present storage policy as the solution to this pressing problem.

The moment I think about conceptualizing storage policy, my mind tries to battle against many odds. *Is this not what everyone (*read storage vendors*) has accomplished?*

**Think again!!!** The chances are, it works for specific storage **“A”** and needs a radically different approach for the other storage **“B”**; assuming both of these provide the infrastructure for the operator’s storage needs. So the operator goes ahead and does some plumbings if lucky enough to get these infrastructures as white-box components. *At the end of the day, the operator is ready with a new bespoke program and feels so lucky*. Whatsoever, this does not last long due to the very behaviour of infra components. *This operator needs to be ready all the time for the next upgrade to above crafted program, **since little can be expected from the monolith storage fellas*. *Poor operator is left to fend for self, building all possible defence mechanisms*.

Getting back to the need for a storage policy; *what is the edge in this incarnation of storage policy then*? Well, it is all about capitalising the essential features that being native to cloud and being operated from within a container provides *(I can only hope and pray for those storage controllers who cannot operate from the cloud(s) or can not be run from within the container(s))*.

Having said that, there is no innate need to design storage policy that is drastically different just to prove its greatness. Instead, there is a need to design, build, and apply policies that are agnostic to a storage implementation and is conducive to storage operations that are never ever meant to be interrupted.

1. A Storage Policy should be simple to setup on Day 0
2. It should be simple to expect the obvious on Day 1
3. It should be simple enough to build an update whenever desired.

### Is it that simple?

All this time, I have been describing the storage policy and its operations as simple. *Well, they can be described as simple, but not easy*. What was your feeling when you created one last time? *Have you ever felt creating a storage snapshot policy is easy?* How about a policy that does periodic restore
of some randomly picked snapshots and marks them as *PASSED* or *FAILED* after verifying its data integrity. How did that failure alert you? Was it a slack notification? To make it further interesting, can you think of a snapshot policy that hooks into its consuming application’s life cycle events before trying out the snapshot (*Yes!!! I am suggesting those ‘freeze’ and ‘thaw’ exploits before and after a snapshot*).

**Policies can be described as simple, but not easy.**

Remember, these are not the only policies that can be thought of with respect to storage (*we have not even scratched the storage surface*). While all of these are achievable in a cloud and container native way, they may not be termed as easy.

Applying storage policies is like a dangerous yet interesting sport. Like rock climbing, building a suitable policy can be learnt and then adapted based on the needs, workloads, environment, and so on. However, these policies if applied incorrectly can create a ripple-effect that can lead to increased costs and SLA misses which in turn leads to more support personnel on duty, and so on. As we read further, this new design of storage policies helps in eliminating the aforementioned impacts.

### Bring your own YAML

Did I just say YAML? Yes, I did and I shall explain it in a moment. Let us first explore the possible design angles of a storage policy. *Will it not be great to design a policy that fits well within an enterprise’s existing processes, its employees, its culture, its tools?* Is this too much to ask for?

No!!! *These are no more a set of good to have features but a must have checklist.* I believe expressing storage policy intents as YAMLs can pass all possible checks in an enterprise’s checklist. These current generation declarative intents are now fluent enough to be understood by APIs. In addition, one of YAML’s greatest strengths is its ability to abstract the entire logic that most of us understand as programmable code. This code now becomes truly yours since you have full control of these YAMLs. In other words, it is the operators who have the controlling rights.

To reiterate, there are few but really solid facts that makes this approach towards policy design a much better one than that of all its predecessors.

***Here are my bets that makes this design different:***

***Fact #1*** — To put things into perspective, the unassuming reader needs to look at the storage policies along with the current trends in cloud infrastructure as well as the trends in container engine. The cloud has of late become seamless. Thanks to Kubernetes which has been continuously bridging the impedance mismatch between different cloud providers. In addition, the communities involved in Container Storage Initiative, Container Runtime Interface, etc. are making intents as first class citizens. These declarative code pieces are thought of in a bottoms-up approach in each of these implementations which are then placed together coherently by the likes of Kubernetes. Now this is what is definitely more effective than just a tool that parses YAML and runs in isolation.

***Fact #2*** — These intents are precise and parsed with appropriate validation checks to state with decisive control on the exact outcome. In other words they control the actual execution logic in addition to accepting input values via its declarative specifications. This grounds-up approach coupled with the nativity towards cloud as well as container engine is more suited to design storage policies that align with modern day DevOps’ practices.

***Fact #3*** — Let us not forget the containers and the critical role they play in this age of cloud and orchestrators. Perhaps containers have become so ubiquitous and hence are easy to miss. I truly feel there are umpteen number of cool things that are yet to be discovered when we run a storage controller inside a container.

**Fact #4** — All these also mean the intents that were once the sole prerogative of humans can now be built and operated by machines as well. This too with the same ease that the humans used to enjoy. After all, the ingredients *(#1, #2 and #3)* to make this possibility are all in place. This has come of age and is really an advancement in my opinion.

***Bringing your own YAML really means setting your own policies and having complete control over their execution as well.***

### Use the tool(s) you always loved

A policy alone cannot justify its existence unless it is complimented with simple tools and automated processes. The careful reader might have already guessed it. Yes, I am talking of aligning storage policies with DevOps to realize its full potential.

*Making storage policies more visible, more obvious, and enabling them to the enterprise’s established processes will make them simple to be believed and instil the faith to operate*. *Once again, there is a learning involved but the curve is not steep*.

These policies should offer the finest levels of control to the operators’ tools, their bots, and of course operators themselves when such a need arises. *For example finer granularity is craved for during rollbacks, automated downgrades, or blue-green deployments which are not uncommon in the world of storage infrastructures.*

To complete the DevOps cycle, these policies which can be handcrafted or system-generated can be submitted to the approver(s) (*which again can be a combination of humans as well as their loved tools*) as Pull Requests before being installed and applied against the storage.

### Storage was the proverbial “Missing Cog”

We are seeing users finally achieving what many have dreamt of for so long  —  ***storage****(and the rest of the infrastructure)* truly being driven by the needs of the application and in a way that remains understandable and for a variety of reasons *(take infra as code for example)* trusted by humans. And now increasingly we see the recognition that containerised storage itself is another important ingredient.

Thanks to [OpenEBS](http://openebs.io) and more broadly containerised storage. *For the first time, every team and workload can have its **own fully functional storage controller**, with capabilities that have always been required by enterprise storage systems and that are still useful in taking care of *stateful workloads*. Our users do not want to give up the tools they used for the care and feeding of MySQL for example just because it now runs in a container. *This is possible by enabling capabilities like snapshots, versioning, encryption, and more **as knobs** to be able to be turned on/off for each workload.*

This incarnation of storage policies make it easy for many procedures for these workloads to be recorded as YAML; *the run book is truly code and so can easily be shared, versioned, and executed without humans having to play a role in the ugly details of managing storage system **A** or **B** or even **C**. Storage fades into the background. Time is ripe for the operators to rule.*
