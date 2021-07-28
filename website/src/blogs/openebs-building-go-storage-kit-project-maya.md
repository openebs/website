---
title: OpenEBS building Go Storage Kit Project — Maya
author: Satyam Zode
author_info: Go Developer @openebs | Open Source Contributor | Avid Learner
tags: Golang, OpenEBS, DevOps, Container Orchestration
date: 25-07-2017
excerpt: I attended GopherCon India 2017, there was a talk on “Package Oriented Design In Go” by William Kennedy. In that talk, William explained some really important and thoughtful design principles which we can apply in our day-to-day life, while writing Go.
not_has_feature_image: true
---

## Motivation

I attended [GopherCon India](http://www.gophercon.in/) 2017, there was a [talk](https://youtu.be/spKM5CyBwJA?list=PLFjrjdmBd0CoclkJ_JdBET5fzz4u0SELZ) on “Package Oriented Design In Go” by [William Kennedy](https://twitter.com/goinggodotnet). In that talk, William explained some really important and thoughtful design principles which we can apply in our day-to-day life, while writing [Go](https://golang.org/project/). I have attempted to absorb some of the design philosophies I learned at GopherCon into practice at [OpenEBS](https://github.com/openebs). At [OpenEBS](https://github.com/openebs), as an open-source and growing Go project, We value Go principles and We try hard to leverage Go’s offerings.

Briefly, OpenEBS is a [container-native storage](https://blog.openebs.io/cloud-native-storage-vs-marketers-doing-cloud-washing-c936089c2b58) that is built from containers for enabling stateful containers to get into production. Being container-native, OpenEBS augments the Container Orchestration (CO) Layers like Kubernetes, DockerSwarm, Mesos, etc., with Storage Specific Orchestration capabilities using “Maya” — Magic! I contribute mainly towards the “Maya” — which is a set of containerized control plane applications for hooking into several modules like the configuration, monitoring, and alerting of CO.

## What is the Go Kit Project?

To understand in plain terms, let us take an example where we end up writing the same Go packages, again and again, to do the same task at different levels in the different Go projects under the same organization. We are all familiar with the custom logger package in the different Go projects.

What if, the custom logger package is the same across the organization and can be reused by simply importing it, then this custom logger package is the perfect fit for the Kit project. The advantages of this approach go beyond avoiding duplicate code, improved readability of the projects in an organization, to savings in terms of time and cost as well :-)

If you go through Bill’s talk, you will notice that the Kit project is characterized by Usability, Purpose, and Portability. In this blog, I will discuss how I have applied the refactored code to use the “Kit Project” pattern for maya.

## How to convert existing projects to have “kit”

OpenEBS being a container-native project is delivered via a set of containers. For instance, with OpenEBS 0.3 release we have the following active maya related projects:

1. openebs/maya aka ****maya-cli**** : is the command-line interface like kubectl for interacting with maya services for performing storage operations.
2. openebs/mayaserver : or ****m-apiserver**** abstracts a generic volume API that can be used to provision OpenEBS Disks using containers launched using the CO like K8s, nomad, etc.,
3. openebs/****openebs-k8s-provisioner**** : is the K8s controller for dynamically creating OpenEBS PVs

With these projects, we are already seeing how code gets duplicated when each of these projects is independently developed. For example *maya-cli* and *openebs-k8s-provisioner* both need to interact with *maya-apiserver*, which resulted in maya-apiserver-client code being written in *maya-cli* and *openebs-k8s-provisioner*. Similarly, *openebs-k8s-provisioner* and *maya-apiserver* have duplicated code w.r.t to accessing the K8s services.

To avoid this duplicity of code using the kit project, we are transforming OpenEBS/maya into a Kit project for the Application projects like [maya-apiserver](https://github.com/openebs/mayaserver), openebs-k8s-provisioner, and many more coming up in the future. openebs/maya contains all the kubernetes & nomad APIs, common utilities, etc. needed for the development of maya-apiserver and maya-storage-bot. In the near future, we are trying to push our custom libraries to maya. So that, it will become a promising Go kit project for the OpenEBS community.

Lets now see, how maya (as a kit project) adheres to the package oriented design principles:

- ****Usability****  
We moved common packages such as orchprovider, types, pkg to maya from maya-apiserver. These packages are very generic and can be used in most of the Go projects in the OpenEBS organization. Brief details about new packages in Maya.
1. Orchprovider: orchprovider contains packages of different orchestrators such as Kubernetes and nomad.
2. types: types provide all the generic types related to orchestrator.
3. pkg: pkg contains packages like nethelper, util, etc.
4. volumes: volumes contain packages related to volume provisioner and profiles.
- ****Purpose****  
While the Packages in the Kit project are categorized as per the functionality, the naming convention should ideally provide the reader with the information on what the package “provides”. So, the packages (in the kit project) must provide, not contain. In maya, we have packages like types, orchprovider, volumes, etc. name of these packages suggests the functionality provided by them.
- ****Portability****  
Portability is an important factor for packages in the kit project. Hence, we are making maya in such a way that it will be easy to import and use in any Go project. Packages in the Maya are not a single point of dependency and all the packages are independent of each other. For example, types directory contains versioned Kubernetes and Nomad packages. These packages are simply importable to any project to use Kubernetes and Nomad APIs.

## Example usage of maya kit project

Maya-apiserver uses maya as a Kit project. Maya-apiserver exposes OpenEBS operations in form of REST APIs. This allows multiple clients e.g. volume-related plugins to consume OpenEBS storage operations exposed by Maya API server. Maya-apiserver will use volume provisioner as well as orchestration provider modules from Maya. Maya-apiserver will always have HTTP endpoints to do OpenEBS operations.

Similarly, openebs-k8s-provisioner will use the maya-kit project Kubernetes API to query for details about the Storage Classes, etc.,

Another usage is of the maya-kit project, maya-apiserver client that is accessed by maya-cli as well as the openebs-k8s-provisioner to talk to maya-apiserver.

## Conclusion

Go Kit project should contain packages that are usable, purposeful, and portable. Go Kit projects will improve the efficiency of the organization at both human and code levels.
