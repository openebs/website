---
title: Storage Scheduling goes mainstream in Kubernetes 1.12
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 01-10-2018
tags: Kubernetes, Open Source, OpenEBS, Storage Containers
excerpt: With every new release of Kubernetes, I find myself in awe and also at ease with the choices we made early on to marry OpenEBS with Kubernetes.
---

With every new release of Kubernetes, I find myself in awe and also at ease with the choices we made early on to marry OpenEBS with Kubernetes.

There are a lot of Storage management capabilities being built into Kubernetes such as PV/PVC metrics, PV resize, PV Quota, Pod Priority Classes, and the Mount Propagation features that greatly enhance OpenEBS. However, I am especially excited about a couple of features that came in with Kubernetes 1.12:

- Taint Nodes based on Conditions
- Topology Aware Storage Provisioning

## Taint Nodes based on Conditions ([#382](https://github.com/kubernetes/features/issues/382)):

OpenEBS Volume services comprise of a Target Pod and a set of Replicas. When a node that is running the Target pod is unable to serve the Pods — the Target Pod needs to be evicted and rescheduled immediately. If you are using OpenEBS 0.6 or higher the Target Pods have the following eviction tolerations specified.

    - effect: NoExecute
     key: node.kubernetes.io/not-ready
     operator: Exists
     tolerationSeconds: 0
    - effect: NoExecute
     key: node.kubernetes.io/unreachable
     operator: Exists
     tolerationSeconds: 0

Up until now, the above tolerations take effect only when the Kubernetes TaintNodeByCondition feature was enabled via alpha gate. With K8s 1.12, this feature has moved to beta and is enabled by default. Along with this feature, the performance improvements done in scheduling will help in faster rescheduling of the OpenEBS Target pod and so help to keep the data storage by OpenEBS highly available.

## Topology Aware Dynamic Provisioning ( [#561](https://github.com/kubernetes/features/issues/561))

This feature mainly benefits the Persistent Volumes that have connectivity or access limitations such as Local PVs that cannot be accessed by Pods outside of the node or Cloud PVs like EBS and GPD that cannot be accessed outside of the zone in which they were provisioned. OpenEBS never had this limitation so this connectivity or access benefit is not really needed by the OpenEBS community.

However, I am excited about some of the new capabilities that are now added to the StorageClass and PVC that can benefit OpenEBS volumes as well.

For instance, OpenEBS storage classes also can be set with *volumeBindingMode* of *WaitForFirstConsumer* as follows:

    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
     name: openebs-standard
    provisioner: openebs.io/iscsi
    volumeBindingMode: WaitForFirstConsumer

The PVCs provisioned with the above StorageClass will contain the information of the Node selected by the scheduler to launch the associated Pod in the following PVC annotation.

## `volume.kubernetes.io/selected-node`

OpenEBS can then use the above annotation to determine the preferred node where the Target Pod can be scheduled. This provides a simpler way to schedule the Target Pods on the same Node as the Application Pod.

This feature decidedly is an important step towards making Storage PVs a first-class citizen in scheduling. This feature helps with the initial provisioning of the volumes — I am excited about the enhancements that are planned in this area, such as the ability for the Volume Plugins to specify the preferred location where the Application Pods can be scheduled.

While this release made progress in making Storage a first-class citizen of Kubernetes schedulers, a lot of work is underway to make the Storage Lifecycle easy to manage with the upcoming support in CSI of Snapshot, Clone, Backup and Recovery.

It feels great to be associated with Kubernetes and OpenEBS and the incredible team that is helps the DevOps teams sleep better.

—

Btw, it is [Hacktoberfest](https://hacktoberfest.digitalocean.com/) This is a great time to become part of the Open Source community. OpenEBS is also participating in this year’s [Hacktoberfest ](https://blog.openebs.io/celebrate-hacktoberfest-2018-with-openebs-206daa1d653c?__hstc=216392137.073930d2db558f65dd6e9df2ff66b40e.1580119414166.1580119414166.1580119414166.1&amp;__hssc=216392137.1.1580119414166&amp;__hsfp=3765904294) with a friendly team that is available to help you get started with your contributions to OpenEBS and other projects.

As always, feel free to reach out to us on Slack or add comments below. [https://slack.openebs.io](https://slack.openebs.io/?__hstc=216392137.073930d2db558f65dd6e9df2ff66b40e.1580119414166.1580119414166.1580119414166.1&amp;__hssc=216392137.1.1580119414166&amp;__hsfp=3765904294).
