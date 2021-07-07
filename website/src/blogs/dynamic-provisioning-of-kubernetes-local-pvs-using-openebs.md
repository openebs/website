---
title: Dynamic provisioning of Kubernetes Local PVs using OpenEBS
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
date: 29-03-2019
tags: Kubernetes, Open Source, OpenEBS, Stateful Applications, Storage
excerpt: In this blog I discuss why we are adding the support of Local Persistent Volumes to the open source OpenEBS -  I view this as a significant step forward in our mission of delivery true data agility to the broader cloud native community and I welcome your feedback.
---

*Updated May 16th 2019: The alpha version of the OpenEBS Local PV provisioner has been included in OpenEBS Release 0.9. This blog is updated with the setup instructions and examples from v0.9.*

In this blog I discuss why we are adding the support of Local Persistent Volumes to the open source OpenEBS — I view this as a significant step forward in our mission of delivery true data agility to the broader cloud native community and I welcome your feedback.

There are many stateful workloads like Mongo, Redis, Cassandra, Postgres, Nuodb etc.,that are capable of performing their own replication for high availability and basic data protection, eliminating the need for the underlying storage to copy or replicate the data for these purposes. Instead, what users of these workloads seem to really want from underlying storage is maximum throughput that can be delivered along with of course the guarantee that data is consistent on the disk — and increasingly we are seeing that the operators of these workloads also want to use Kubernetes as their fundamental API irrespective of what IaaS or hardware or Kubernetes service underlies their environment.

Kubernetes provides an option to use Host Paths (and very recently the use of Local PVs is also gaining popularity) which present a very simple and elegant option to get started. The Local PVs differ from the Host Paths in two aspects:

- Application developers have to specify the Host Path in their Pod Spec.
- Host Paths typically share a single underlying disk, where as Local PVs occupy the entire disk.

There are many scenarios where Host Paths are the only option since the Kubernetes Nodes can have a limitation on the number of Disks (or devices) that can be attached — either due to node capabilities or just for cost purposes.

However, for Kubernetes Cluster administrators — it can soon become a nightmare if they give free reign to their application developers to use Host Path volumes — as can be seen from a recent conversation in the Kubernetes Slack.

![slack conversation](/images/blog/slack-conversation.png) 
(***Issues - Slack conversation***)

Typically Kubernetes Administrators lockdown (or disable) the `hostPath` feature using Pod Security Policies, especially in enterprises where security policies trump everything else.

Interestingly, most of these challenges with the Host Path volumes can be overcome, by using a Dynamic Local PV Provisioner (managed by StorageClasses and PersistentVolumeClaims) that can be configured to create a Local PV with either a subpath or the entire disk.

The Kubernetes Cluster Administrators can reassert control by specifying via StorageClasses where and how the Host Path can be created and who can actually use them in the Cluster (by setting RBAC) policies.

Besides overcoming the security issues with hostPath and gaining more control on how they are provisioned, Local PVs based provisioning of host paths has the following additional benefits:

- Ability to pin the pods using the hostPath Local PV, by specifying the node selector. If native hostpath is used, there is no guarantee that the pod will get rescheduled to the same node in case of node reboots or pod eviction scenarios.
- Ability to provide hooks that can either retain the PV and its data or perform clean up of the directory once the associated PVC is deleted.
- Ability to provide exclusive ( ReadWriteOnce) or shared (ReadWriteMany) to the data on the host path.

Using Dynamic Provisioner for Local PVs also makes it easy to provide additional features of forthcoming Kubernetes Versions, such as:

- Metrics Support
- Enabling Capacity and PVC Resource Quotas
- Full benefits of Volume Topology

**Ready to give OpenEBS Local PVs a spin.**

*OpenEBS Local PVs (alpha) is available in OpenEBS 0.9 release. Use the following commands to try it out.*

*Step 1:* You need to have Kubernetes 1.12 or higher. Install the OpenEBS Local PV Provisioner.

    kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.9.0.yaml

Note: The above will setup the complete OpenEBS Control Plane along with the OpenEBS Dynamic PV Provisioner. Ensure that the ` openebs-localpv-provisioner` pod is running. `kubectl get pods -n openebs`

This version supports creating hostpath based Local PVs. A default StorageClass ` openebs-hostpath` is also loaded, that will create the host paths under `/var/openebs/local/`. If you would like to change the path, modify the StorageClass accordingly and re-apply.

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
     name: openebs-hostpath
     annotations:
     openebs.io/cas-type: local
     cas.openebs.io/config: |
     - name: StorageType
     value: "hostpath"
     - name: BasePath
     value: "/var/openebs/local/"
    provisioner: openebs.io/local
    volumeBindingMode: WaitForFirstConsumer
    reclaimPolicy: Delete

*Step 2:* Launch a MongoDB StatefulSet that makes use of Local Persistent Volumes.

    kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.9.x/k8s/demo/mongodb/demo-mongo-localpvhostpath.yaml

Checkout that Local PVs are dynamically created — `kubectl get pv`.

Also go ahead and check that deleting the Pod will put it right back on the node where the PV was created.

**Show me Code**

It is being cooked [here](https://github.com/openebs/maya/tree/master/cmd/provisioner-localpv). Any help with code review or suggestions welcome.

**Credits!**

The implementation has been inspired by the feedback from the OpenEBS community who have requested for this feature to be available and used for Jiva Data engine and by all the prior work done by the Kubernetes Community.

- [https://github.com/kubernetes-sigs/sig-storage-lib-external-provisioner/tree/master/examples/hostpath-provisioner](https://github.com/kubernetes-sigs/sig-storage-lib-external-provisioner/tree/master/examples/hostpath-provisioner)
- [https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner)
- [https://github.com/rancher/local-path-provisioner](https://github.com/rancher/local-path-provisioner)
- [https://docs.openshift.com/container-platform/3.7/install_config/configuring_local.html](https://docs.openshift.com/container-platform/3.7/install_config/configuring_local.html)

**What Next.**

OpenEBS v1.0 continues to make significant progress in enhancing capabilities to the existing Storage Engines like ability to expand cStor Pools by adding additional disks, ability to replace a failed disk without affecting the applications, ability to resize the cStor volumes and many more. OpenEBS Local PVs will provide an additional option for the DevOps teams to cost effectively run their Stateful workloads.

OpenEBS Dynamic Provisioner for Local Persistent Volumes works in tandem with the capabilities that are provided already by the OpenEBS Node Device Manager (NDM).

![openebs local pv](/images/blog/openebs-local-pv.png)
(***OpenEBS Local PVs***)

The Disk/Device Management Layer is provided by the OpenEBS NDM and projects built using Restic, that help with:

- Discovering the devices attached to the Nodes
- Performing Backup / Restore of Data from subpaths on the Nodes
- Monitoring the devices used to provide the Host Paths, and in case the devices are backed by Disks — monitoring the SMART metrics to provide predictive error alerts.

I believe this also opens up a lot of use cases to utilize the Capacity from the existing storage servers that are at the Users disposal by adding them to the Kubernetes Nodes and not having to worry about upgrading those SANs to support or wait for CSI specs to be implemented.

Would love to hear your feedback on this feature. Do you use hostPaths or Local PVs that are natively supported in Kubernetes? What are your biggest challenges using those features and how can OpenEBS help? Please leave a comment in this blog or hit me up on the [Slack](https://slack.openebs.io/?__hstc=216392137.09f8198be7856f2c54869404c1891309.1580118253605.1580118253605.1580118253605.1&amp;__hssc=216392137.1.1580118253605&amp;__hsfp=3765904294).

[Public domain](https://creativecommons.org/publicdomain/mark/1.0/).
