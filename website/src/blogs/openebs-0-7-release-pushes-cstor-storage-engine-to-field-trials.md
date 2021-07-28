---
title: OpenEBS 0.7 Release pushes cStor Storage Engine to field trials!
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 29-08-2018
tags: Container, Kubernetes, OpenEBS, Storage Solutions
excerpt: Before I get into some fascinating features of 0.7 release, I would like to take this opportunity to thank all users who have taken our OpenEBS survey and have come forward to share your Kubernetes Stateful Workload and OpenEBS adoption stories.
not_has_feature_image: true
---

Before I get into some fascinating features of 0.7 release, I would like to take this opportunity to thank all users who have taken our OpenEBS survey and have come forward to share your Kubernetes Stateful Workload and OpenEBS adoption stories. When I hear statements like ***“OpenEBS just works!”***, it is definitely a sign that the project and the OpenEBS Developer Community are headed in the right direction. It is both heartening and humbling. Thank you!
![contributions survey](https://cdn-images-1.medium.com/max/800/08J2dBBRWCnbu82R_)
We would welcome more contributions to the survey mentioned above, for example, whether you are an OpenEBS user (yet) or not: [https://www.surveymonkey.com/r/BRDCCWY](https://www.surveymonkey.com/r/BRDCCWY)

—

While 0.6 was mainly focused towards making the storage resilient via building chaos tools like [Litmus](https://github.com/openebs/litmus); 0.7 has taken a huge leap towards bringing a new Storage Engine for your OpenEBS Volumes — called cStor. — **container** **Storage** and incidentally it is a **Storage** written in **c**)!

Speaking of OpenEBS 0.7, the geek in me would like to banter about the OpenEBS CAST (Container Attached Storage Templates or read it as moulding) framework that we developed to help easily plugin new Storage Engines, or about how we use the new Kubernetes Dynamic Client to do some heavy lifting of interacting with the Kubernetes CRDs and Scheduling. Anyways, let us keep it for the upcoming KubeCons!

So, here are some things that make OpenEBS 0.7 a significant milestone:

- Increased number of Integrations
- Node Disk Manager for Kubernetes
- OpenEBS Control Plane
- cStor Storage Engine

In the rest of this post, I will provide additional details on these items.

—

## Integrated Offerings:

OpenEBS remains committed to being Easy to Setup and Use, and we are continuing our efforts to make it available from your Cluster Solutions such as KubeApps, IBM Private Cloud, StackPoint Cloud, Red Hat OpenShift, Rancher, Kontena Pharos, etc.

—

[Node Disk Manager (NDM)](https://github.com/openebs/node-disk-manager) for Kubernetes has made its first [release](https://github.com/openebs/node-disk-manager/releases)! It helps you better manage the Disk Inventory in your Kubernetes Cluster. The discovered block devices are added as Kubernetes custom resources called Disks. In addition to managing actual disks attached to nodes, NDM also helps developers simulate disks on their local machines using sparse files. *You can interact with NDM via kubectl.*

    kiran_mova@kmova-dev:~$ kubectl get disks --show-labels
    NAME AGE LABELS
    disk-cdf294e8662a87.. 2h kubernetes.io/hostname=node1...
    disk-eaf3931c96c1d9.. 2h kubernetes.io/hostname=node2...
    disk-edc04b8fcf924e.. 2h kubernetes.io/hostname=gke-kmova-

    To learn more about NDM and its commands, please visit
    https://github.com/openebs/node-disk-manager

—

## OpenEBS Control Plane (maya):

As you use OpenEBS, you realize that you almost never interact with any of the actual components of OpenEBS. This is thanks in part to the beauty of Kubernetes and how OpenEBS plugs itself into the Kubernetes orchestration layer. You can hardly notice when there is an addition to the control plane that helps provision and manage OpenEBS Volumes.

Typical Storage Solutions come with a separate heavy-weight control plane, which essentially must do everything that Kubernetes does, albeit for Storage constructs like Pools and Volumes. If Storage Volumes and Pools are treated as Containers, then Kubernetes itself can Orchestrate Storage, right?

This is exactly what OpenEBS does; the Storage Volumes and Pools themselves are represented by Containers (Deployments and Services), and Kubernetes does most of the Orchestration! What is really needed by OpenEBS is to produce the Kubernetes YAMLs with the appropriate resources and scheduling constructs.

The way the Storage Pods are deployed can have specific requirements such as:

- Pods should be deployed as StatefulSet or DaemonSet or regular Deployment with the custom Scheduler.
- Pods should be associated with Node Selectors or Taints/Tolerations etc.
- Pods should have specific privileges and/or resource limits, etc.
- Pods should be configured with Affinity and Anti-affinity rules that make the storage highly available across node or zone failures etc.

OpenEBS Release 0.7 makes it insanely easy to specify such constructs and associate them with Storage Engines, basically by just adding a few YAML files.

To understand this better, let’s observe a couple of examples.

**Example 1:** Scheduling PVs of Mongo instances across Availability Zones. When Stateful Applications like Mongo are deployed, each Mongo instance gets its own PV and PVC. To be truly resilient against node failures, the PVs (actual storage) belonging to a given Mongo application must be spread out across nodes or occasionally even across availability zones. We already know how to ensure Mongo instances (pods) are spread out with Pod Anti-affinity rules.

With OpenEBS, the same Pod Anti-affinity rules can be passed on and the OpenEBS Control Plane (maya) takes care of setting them on the storage pods. All you need to do is the following:

**Step 1:** Create an OpenEBS StorageClass that can be used by the PVs of Mongo StatefulSet:

    # Create a StorageClass suited for Mongo STS
    ---
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: mongo-pv-az
    annotations:
    cas.openebs.io/config: |
    - name: ReplicaCount
    value: "1"
     - name: ReplicaAntiAffinityTopoKey
     value: failure-domain.beta.kubernetes.io/zone
    - name: StoragePool
    value: default
    provisioner: openebs.io/provisioner-iscsi
    parameters:
    openebs.io/fstype: "xfs"

**Step 2:** Specify the application label (say *app-unique-id*) in the Mongo StatefulSet:

    apiVersion: apps/v1beta1
    kind: StatefulSet
    metadata:
    name: mongo
    spec:
    serviceName: "mongo"
    replicas: 3
    template:
    metadata:
    labels:
    role: mongo
    environment: test
    openebs.io/replica-anti-affinity: app-unique-id

**Step 3:** Specify the Storage Class in the Volume Claim Template:

    volumeClaimTemplates:
    — metadata:
    name: mongo-persistent-storage
    spec:
    storageClassName: mongo-pv-az
    accessModes:
    — ReadWriteOnce
    resources:
    requests:
    storage: 5G

When the PVs are created for the Mongo StatefulSet, the Replicas are configured with PodAntiAffinity rules with the provided application label and topology key as follows:

    podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    — labelSelector:
    matchLabels:
    openebs.io/replica: jiva-replica
    openebs.io/replica-anti-affinity: app-unique-id
    topologyKey: failure-domain.beta.kubernetes.io/zone

The complete YAML file for Mongo StatefulSet using OpenEBS PV is available [here](https://github.com/openebs/openebs/blob/master/k8s/demo/mongodb/mongo-statefulset.yml).

**Example 2:** When running in hyper-converged mode along with applications, it is imperative to deploy granular control on how much memory or CPU can be allocated for serving a storage volume. Again, this is a relatively common scenario, and we know how to control it for the Application Deployments! The same can be extended to the Storage!

For example, you can define the Resource Requests and Limits for different storage pods:

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: openebs-jiva-limits
    annotations:
    cas.openebs.io/config: |
    - name: TargetResourceRequests
    value: |-
    memory: 0.5Gi
    cpu: 100m
    - name: TargetResourceLimits
    value: |-
    memory: 1Gi
    - name: ReplicaResourceRequests
    value: |-
    memory: 0.5Gi
    cpu: 100m
    - name: ReplicaResourceLimits
    value: |-
    memory: 2Gi
    cpu: 200m

I have only covered a couple of examples here, but I am very excited that with the framework we have now embedded within OpenEBS, we can support any kind of scheduling requests you might have. **Bring it On!**

—

**cStor Storage Engine (cStor)** is the latest addition to the storage engines supported by OpenEBS. Similar to the previous Jiva/Longhorn storage engine, cStor is also completely Open Source and has no dependency on the Kernel. It can run in the platform of your choice — either on-premise or cloud!

While cStor Volumes work just like the previous OpenEBS volumes in terms of replication and high availability, cStor has many advantages:

1. Managing the Storage Space — You no longer need to worry about writing extra scripts for cleanup when Volumes are deleted.
2. cStor reduces the number of Containers required to achieve replication capability. This is a significant shift from requiring 4 pods per Volume to just 1 new pod per Volume. The Replication is taken care of by a “Pool” pod that can serve multiple volumes.
3. The core storage engine used to store the data is based on OpenZFS technology that has been used in production for over a decade now.

cStor Pools are created on the Disks discovered by NDM. (Again, the geek in me would like to point out the excellent Operator pattern used to convert a Storage Pool Claim to Storage Pools and the cool way in which we used side-cars and CRDs to manage a non-Kubernetes storage engine in a Kubernetes way!)

cStor is available as an Alpha feature with 0.7 and is very easy to try out! You can read more about cStor [here](https://docs.openebs.io/docs/next/storageengine.html?__hstc=216392137.c9fd9f8df74ffca9b73b72bd793ad982.1580119894211.1580119894211.1580119894211.1&amp;__hssc=216392137.1.1580119894211&amp;__hsfp=3765904294#cstor).

There is a lot that I didn’t cover or address in this blog post, but I hope this served as a brief introduction to some of the most exciting features in the 0.7 release. For detailed release notes and instructions for getting started, visit [release notes](https://github.com/openebs/openebs/releases/tag/v0.7).

In my opinion, OpenEBS 0.7 decidedly will be remembered as a release that brought the coming of age of several different OpenEBS projects like [Litmus](https://github.com/openebs/litmus), [Node Disk Manager for Kubernetes (NDM)](https://github.com/openebs/node-disk-manager) and [OpenEBS cStor](https://docs.openebs.io/docs/next/storageengine.html?__hstc=216392137.c9fd9f8df74ffca9b73b72bd793ad982.1580119894211.1580119894211.1580119894211.1&amp;__hssc=216392137.1.1580119894211&amp;__hsfp=3765904294). OpenEBS 0.7 is equipped to successfully deliver a comprehensive storage solution for DevOps persona, providing capabilities for automating Storage management in their Kubernetes Clusters.

By the way, if you have not yet, don’t forget to claim your free access to [MayaOnline](https://mayaonline.io/). You will be surprised by how easy it can be to visualize and manage your storage needs.

We would welcome more contributions to the survey mentioned above, whether you are an OpenEBS user (yet) or not: [https://www.surveymonkey.com/r/BRDCCWY](https://www.surveymonkey.com/r/BRDCCWY)

What makes this project great is your support and feedback! Please reach out to us on Slack or comment below. [https://slack.openebs.io](https://slack.openebs.io/?__hstc=216392137.c9fd9f8df74ffca9b73b72bd793ad982.1580119894211.1580119894211.1580119894211.1&amp;__hssc=216392137.1.1580119894211&amp;__hsfp=3765904294)/

Thanks to [Amit Das](https://medium.com/@amit.das?source=post_page) and [Karthik Satchitanand](https://medium.com/@karthik.s_5236?source=post_page). [Public domain](https://creativecommons.org/publicdomain/mark/1.0/).
