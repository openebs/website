---
title: OpenEBS 0.5 enables Storage Policies for Kubernetes Persistent Volumes
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 30-11-2017
tags: Container, Open Source, Storage Containers, Kubernetes, Updates
excerpt: Personally, it is very exciting and enriching to see the growth of the OpenEBS project — from its capabilities, contributors and community perspective!
not_has_feature_image: true
---


Personally, it is very exciting and enriching to see the growth of the OpenEBS project — from its capabilities, contributors and community perspective!

I believe the metric to measure the success of OpenSource Projects is determined by the number of users and the conversion ratio of users turning into contributors. The past couple of months (thanks to campaigns like Hacktoberfest and the ongoing OpenEBS Hackfest), we have seen a steep rise in the number of contributors and contributions to the OpenEBS project.

![OpenEBS contributors](https://cdn-images-1.medium.com/max/800/1*BMOr9ULh_7KnM6k8aUj9hw.png)

In almost all the interactions we had with the user community, we are seeing a clear resonance of the value proposition that OpenEBS brings to the [DevOps teams managing systems with large number of micro-services](https://twitter.com/muratkarslioglu/status/921072858628997121). The best part is that the users are independently evaluating OpenEBS and finding ways to automate their Compute, Network, Storage, and Data related Operations.

![Towards Kubernetes](https://cdn-images-1.medium.com/max/800/0*XilwHl_ucs5K5fcK.jpg)

Today, I can look back on our decision to use Kubernetes as a framework to build OpenEBS is one of the best decisions we have made. While the core of the Kubernetes community is helping DevOps teams treat Compute and Network as Code — we at OpenEBS are focused at extending Kubernetes to enable treating Storage and Data also as Code.

I am delighted to announce that OpenEBS 0.5 is released with 300+ PRs coming from 50+ new community contributors, with several new features and bug fixes. Summary of changes are available in the [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.0).

Some notable changes include:

- Storage Policy Enforcement Framework that allows DevOps teams to deploy a customized storage
- Extend OpenEBS API Server to expose volume snapshot API
- Support for deploying OpenEBS via helm charts
- Support for monitor and get insights into OpenEBS volumes via Prometheus and Grafana
- Sample Deployment YAMLs and corresponding Policy enabled Storage Classes for several stateful applications
- Sample Deployment YAMLs for launching Kubernetes Dashboard for a preview of the changes done by OpenEBS Team to Kubernetes Dashboard

***My favorite capability is the Storage Policy Framework that will enable each DevOps team to have their own storage controller — with their own storage policies. And the possibilities it will open-up!***

Imagine as a Developer I want to test my service against MySQL database with different datasets. On my staging PV (mysqldata), I can create multiple snapshots containing different datasets — say snaps like *sandy* and *wendy*. Now I can extend OpenEBS to support a new policy *"openebs.io/jiva-replica-snap"*, that can launch a new volume using snapshot for seed data.

The policy can be defined for snap — *sandy* as follows:

    # Define a SC referring to snapshot sandy
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: mysvc-mysqldata-kiran-ds-sandy
    provisioner: openebs.io/provisioner-iscsi
    parameters:
      openebs.io/jiva-replica-count: "1"
      openebs.io/jiva-source-pv: "mysqldata"      
      openebs.io/jiva-replica-snap: "mysqldata-ds-sandy"

and another one for *wendy*:

    # Define a storage classes supported by OpenEBS
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: mysvc-mysqldata-kiran-ds-wendy
    provisioner: openebs.io/provisioner-iscsi
    parameters:
      openebs.io/jiva-replica-count: "1"
      openebs.io/jiva-source-pv: "mysqldata"
      openebs.io/jiva-replica-snap: "mysqldata-ds-wendy"

In my PVC, I can now use the above StorageClasses (augmented with OpenEBS Storage Policies) to point to the different datasets and independently test my service.

All this from ***kubectl***.

In the background, OpenEBS will create a separate Containerized Storage Engine/Controller for my test database — by sourcing the data from the specified snapshot.

And btw, we are on the [CNCF LandScape](https://github.com/cncf/landscape) under the Cloud Native Storage options, and decidedly leading the niche market for Containerized Storage Controller. You will hear more on this in the coming days at the KubeCon, Austin.

![CNCF](https://cdn-images-1.medium.com/max/800/1*rdKFLGyf0hRDB_zcgGlywA.png)

You will hear more on OpenEBS 0.5 in the coming days at `KubeCon 2017`, Austin, Texas.

I will be at the OpenEBS booths with my team and look forward to catching up with some of you in person.
