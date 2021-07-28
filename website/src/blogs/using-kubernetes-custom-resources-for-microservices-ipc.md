---
title: Using Kubernetes Custom Resources for Microservices IPC
author: Ganesh Kumar
author_info: Gopher, Open Source Contributor, Thinker, Health enthusiast
date: 11-05-2018
tags: Kubernetes, Golang, OpenEBS, Microservices
excerpt: This blog talks about why I used Custom Resources as a way for communication between different microservices (aka Kubernetes Pods).
not_has_feature_image: true
---

This blog talks about why I used [Custom Resources](https://kubernetes.io/docs/concepts/api-extension/custom-resources) as a way for communication between different microservices (aka Kubernetes Pods).

OpenEBS is a fully containerized storage solution running within Kubernetes. Infact [OpenEBS](https://docs.openebs.io/) extends the Kubernetes cluster functionality to manage storage and stateful workloads.

OpenEBS has an operator (or orchestration component) called [Maya](https://github.com/openebs/maya) (magic) that relays Volume management operations to several storage engines. OpenEBS already supports [Jiva](https://github.com/openebs/jiva) based storage engine. The purpose is to plugin a more independent [cStor](https://github.com/openebs/cstor)based storage engine (making use of zfs on userspace).

I essentially have a user interacting with OpenEBS Maya using PV, PVC, StorageClasses etc. and OpenEBS Maya interacts with cStor Pods. I will be focusing on the design considerations for interactions between OpenEBS Maya and cStor Pods.

![Architecture](/images/blog/architecture.png)

_1 — Shows user creating StoragePoolClaim (SPC) CR, with details like the number and type of pools to be created. Let us consider, SPC specifies a cStor pool should be created._

_2 — Maya has a custom controller that watches for the SPC CR and it will go ahead and create the cStor Pods with a cstor-pool container and a side-car cstor-pool-mgmt that has a CLI interface for creating pools and volumes. Side-car container (following the Kubernetes Ambassador Pattern), helps in translating the Pool and Volume operations triggered by Maya into the corresponding CLI commands._

_3 — Depending on the user’s request for creating a pool or a volume, Maya will create CStorPool and CStorVolumeReplica CRs respectively. Note that, I could have had the cstor-pool-mgmt container expose an API service that Maya could have invoked. Instead, I decided to use CRs and I will explain why in the following sections._

_4 — cstor-pool-mgmt sidecar application watches for CRs of CStorPool and CStorVolumeReplica and performs pool — volume operations._

**One of the core design constraint while deciding on inter-pod communication between Maya and CStor Pod is that:** _When the user requests for a Volume, the cluster state may not be fully ready to satisfy all the criteria — for example, User requests for 3 replicas but there are only 2 nodes running. The request should be cached and a third replica has to be provisioned whenever a new node gets added to the cluster._

Developers normally go with an approach to make a REST/gRPC call to the receiver and store in a database, running in separate pod/statefulset. But OpenEBS thinks beyond that.

Now consider, that I had used the traditional approach of using a REST/gRPC method of interactions between Maya and CStor Pods, then Maya would have to implement/consider cases like:

- Where to store the state of current request, as the request can’t be serviced immediately depending on the cluster state. This is required to handle the case where the node running Maya can itself go down.
- When working in a scaled environment, when there are multiple Maya pods, who gets to service the requests and when one of the pod goes down, should the other take it over or not?
- How to handle the case where, Maya sends the request to the CStor container and then it goes boom (after all this is Kubernetes Cluster and they are supposed to handle all kinds of Chaos), who handles the results of the operation at CStor. In other words, how to implement a 2-phase commit?

_However, if you look at my design constraint, doesn’t it sound similar to how a Kubernetes deployment with 3 replicas work?_ The user defines a desired state (in this case Maya) and the controllers make it happen eventually. So, why not just, be a roman when in rome.

### Thats exactly what OpenEBS does!

OpenEBS goes with `watch`-er approach. i.e., watch [**k8s custom resource definition**](https://kubernetes.io/docs/concepts/api-extension/custom-resources). If a pool (virtual disk) must be created on top of the actual disk, Maya creates a custom resource (named CStorPool), and a pod running cstor-pool-mgmt watcher gets an event for corresponding resource request and starts performing pool related operations. Cool, isn’t it?

### Where does the custom resource get stored?

kubernetes etcd. You pronounced it right, that’s `yetsed`, :-)

### How is custom resource efficient?

- Storing critical details in a separate pod-database, leads to pod level consistency. Storing in etcd leads to **cluster level consistency**.
- Even if the **receiver is not running**, when the request is generated, the receiver-watcher gets an event, as and when it starts running.
- Users can access the resources via **k8s cli** — `kubectl get <crd-name>`
- Update the status of request on the same custom resource.

### What is the problem with custom resource?

- It is not suitable for transactional communication. (Say if an OTP request needs to be done within 20 seconds, it is not applicable to go with, “as and when up” approach).
  Solution: Before making any transactional call, verify status of receiver and make a REST/gRPC API call. No other go, :-(
- It is slightly complex to implement watcher.
  Solution: My next blog will address an easy way to implement CRD watcher, how to solve issues with watcher design and different ways to implement watching controller. Practise, you become perfect; Follow us, you become fantastic :-)

Support and follow us [**@gkGaneshR**](https://twitter.com/gkGaneshR) and [**@openebs**](https://twitter.com/openebs) to get instant updates.

Thanks [Kiran](https://twitter.com/kiranmova) for your valuable support. We at OpenEBS are always looking for help and feedback from Community. Please join us on [Slack](https://slack.openebs.io/) or comment on the [design doc](https://docs.google.com/document/d/1Q5W3uHktHa-vOm8oGp-3kpAQ3V1tvyk5AYmxxtf57Rg/edit?usp=sharing) and related [Pull Request](https://github.com/openebs/maya/pull/284).

**Summary**

- K8s CRD becomes a good alternative to REST/gRPC API for “push to perform” operations.
- Few more implementation details will be covered in upcoming blogs — Follow us for updates.
