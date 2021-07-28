---
title: Container Native Storage builds its High Availability in style
author: Amit Kumar Das
author_info: Engineer the DAO
tags: Docker, High Availability, Kubernetes, OpenEBS, Storage
date: 17-07-2017
excerpt: Infrastructure components are the toughest to build. It is meant to work always by default.
not_has_feature_image: true
---

Infrastructure components are the toughest to build. It is meant to work always by default. It must be telecom grade as scores of applications rely on the infra component’s zero downtime, no deterioration in QoS, etc. However, we all know software has got defects and it is no different for infrastructure software components as well. One of the things the software can do is implement high availability as its core feature and somehow buy time (by the virtue of HA) when one of these components experiences a breakdown due to defects or otherwise.

Implementing the HA piece seems to be the elixir to all the unforeseen issues. Is that so simple then? Programmers who have built the HA in the past will swear to its complexity. It is another piece of software logic that is very difficult to get right the first time or even after a couple of major releases.

> The non HA programmer can have the flexibility to err. Well, a programmer is supposed to be a human after all. However, this option is ruled out for the HA logic implementer.

Having said this, implementing high availability logic in a '*Container Native*' software solution has reasons to cheer. Most of the container orchestration platforms have abstracted the scheduling, placements, evacuations, prioritized jobs, and whatnot and thus have freed the average programmer from these overwhelming tasks.

All of a sudden, programming becomes fun again (*HA logic becomes more like placing the [lego](https://en.wikipedia.org/wiki/Lego) blocks in a fashion/pattern to get your favorite character into action*).

Programmers now need to build the required HA logic by tying together appropriate placement components that result in a customized HA solution. We at OpenEBS [***toolroom***](https://github.com/openebs/) have been trying to maximize the offerings provided by [*Kubernetes*](https://kubernetes.io/) towards achieving a true container-native solution for OpenEBS high availability. All the advancements in Kubernetes will make OpenEBS better and the scenarios handled by OpenEBS (*which will never be simple*) can become a point of reference in Kubernetes.

Let’s get into some storage specific HA basics:

1. A typical persistent storage solution would require its data to be replicated across hosts within a cluster. There are also cases, where the production scenarios demand this replication to be across geographies. In addition, hybrid cases require some replicas to reside within the cluster while other replicas to be placed across zones, regions, etc.
2. Since storage solutions derive their power from their underlying hardware resources, it makes sense to earmark exclusive hardware for storage components. In other words, the host(s) would want to avoid software components that are not storage specific.
3. Solutions around placements alone are not sufficient for storage software to be highly available. There can be cases where a storage controller does not support active-active mode. Now relying just on placements can not avoid application outages due to these storage hiccups (*i.e. storage protocol connection breaks resulting in breakdown of the applications consuming this storage*). The evacuation should be fast & its new placement cannot take any time longer. Appropriate policies should be in place to let these storage components be evacuated early before the application components. This becomes more essential during a node crash where every component will fight for survival.
4. Storage HA cannot rely on half-baked evacuations that may lead to split-brain conditions. Storage should either be evacuated or be let to die along with the crash. There should be no cases of hangs, stalls, freezes, you name it. There can be only one option & that is:

***100% successful evacuation as well as 100% successful re-scheduling.***

In some cases, 100% successful evacuation might imply the use of the logic called [**stonith**](https://en.wikipedia.org/wiki/STONITH) before boarding the re-schedule flight.

With the above HA basics (*you may like to call it hardships*) in our mind let us find if the most popular container orchestrator has any feature, policy, etc that can simplify HA in storage. While looking at Kubernetes (version 1.7) I could find a couple of policies that can help storage build its HA story with ease.

> One: ‘Node affinity’ is a feature that constrains which nodes your pod is eligible to schedule on, based on labels on the node.

> Two: ‘Inter-pod affinity and anti-affinity’ is a feature to constrain which nodes your pod is eligible to schedule on based on labels on pods that are already running on the node rather than based on labels on nodes.

> Three: ‘Taints and tolerations’ work together to ensure that pods are not scheduled onto inappropriate nodes. One or more taints are applied to a node; this marks that the node should not accept any pods that do not tolerate the taints. Tolerations are applied to pods, and allow (but do not require) the pods to schedule onto nodes with matching taints.

Does the above sound familiar? It does not introduce any new jargon except for the term 'Pod' and perhaps 'Labels'. A pod is a logical concept for a container or bunch of containers while labels can be understood as tags. Now if our persistent storage is really a piece of software that runs from within a container all the properties that Kubernetes exposes can be applied against this storage software & let it construct (or extend or even plug) its 'High Availability' feature.
