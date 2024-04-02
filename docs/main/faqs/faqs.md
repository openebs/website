---
id: faqs
title: FAQs
keywords: 
 - OpenEBS FAQ
 - FAQs
 - General FAQ about OpenEBS
description: The FAQ section about OpenEBS helps to address common concerns, questions, and objections that users have about OpenEBS.
---

### What is most distinctive about the OpenEBS architecture?{#What-is-most-distinctive-about-the-OpenEBS-architecture}

The OpenEBS architecture is an example of Container Native Storage (CNS). These approaches containerize the storage controller, called I/O controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, a delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

[Go to top](#top)

### Where is my data stored and how can I see that? {#where-is-my-data}

OpenEBS stores data in a configurable number of replicas. These are placed to maximize resiliency. For example, they are placed in different racks or availability zones.

To determine exactly where your data is physically stored, you can run the following kubectl commands.

* Run `kubectl get pvc` to fetch the volume name. The volume name looks like: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be*.

* For each volume, you will notice one I/O controller pod and one or more replicas (as per the storage class configuration). You can use the volume ID (ee171da3-07d5-11e8-a5be-42010a8001be) to view information about the volume and replicas using the replicated engine [kubectl plugin](../../../docs/main/user-guides/replicated-engine-user-guide/advanced-operations/kubectl-plugin.md)

[Go to top](#top)

### What changes are needed for Kubernetes or other subsystems to leverage OpenEBS? {#changes-on-k8s-for-openebs}

One of the major differences of OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload and the easy management of it is crucial especially as the CNS approach entails putting containers that are I/O controller and replica controllers.

[Go to top](#top)

### How do you get started and what is the typical trial deployment? {#get-started}

To get started, you can follow the steps in the [quickstart guide](../quickstart-guide/quickstart.md)
 
[Go to top](#top)

### What is the default OpenEBS Reclaim policy? {#default-reclaim-policy}

The default retention is the same used by K8s. For dynamically provisioned PersistentVolumes, the default reclaim policy is “Delete”. This means that a dynamically provisioned volume is automatically deleted when a user deletes the corresponding PersistentVolumeClaim.

[Go to top](#top)

### Is OpenShift supported? {#openebs-in-openshift}

Yes. See the [detailed installation instructions for OpenShift](../user-guides/local-engine-user-guide/additional-information/kb.md#how-to-install-openebs-in-openshift-4x-openshift-install) for more information.

[Go to top](#top)

### Can I use replica count as 2 in StorageClass if it is a single node cluster? {#replica-count-2-in-a-single-node-cluster}

While creating a StorageClass, if user mention replica count as 2 in a single node cluster, OpenEBS will not create the volume. It is required to match the number of replica count and number of nodes available in the cluster for provisioning OpenEBS replicated volumes.

[Go to top](#top)

### How backup and restore is working with OpenEBS volumes? {#backup-restore-openebs-volumes}

OpenEBS (provide snapshots and restore links to all 3 engines - Internal reference)

[Go to top](#top)

### How is data protected? What happens when a host, client workload, or a data center fails?

Kubernetes provides many ways to enable resilience. OpenEBS leverages these wherever possible. For example, say the IO container that has the iSCSI target fails. Well, it is spun back up by Kubernetes. The same applies to the underlying replica containers, where the data is actually stored. They are spun back up by Kubernetes. Now, the point of replicas is to ensure that when one or more of these replicas are being respond and then repopulated in the background by OpenEBS, the client applications still run. OpenEBS takes a simple approach to ensuring that multiple replicas can be accessed by an IO controller using a configurable quorum or the minimum number of replica requirements. In addition, our new cStor checks for silent data corruption and in some cases can fix it in the background. Silent data corruption, unfortunately, can occur from poorly engineered hardware and from other underlying conditions including those that your cloud provider is unlikely to report or identify.

[Go to top](#top)

### How does OpenEBS provide high availability for stateful workloads?

An OpenEBS Jiva volume is a controller deployed during OpenEBS installation. Volume replicas are defined by the parameter that you set. The controller is an iSCSI target while the replicas play the role of a disk. The controller exposes the iSCSI target while the actual data is written. The controller and each replica run inside a dedicated container. An OpenEBS Jiva volume controller exists as a single instance, but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is synchronized between replicas. OpenEBS Jiva volume high availability is based on various scenarios as explained in the following sections. 

:::note
Each replica is scheduled in a unique K8s node, and a K8s node never has two replicas of one OpenEBS volume.
:::

[Go to top](#top)

### What changes must be made to the nodes on which OpenEBS runs?

OpenEBS has been engineered so that it does not require any changes to the nodes on which it runs. Similarly, Kubernetes itself does not require to be altered and no additional external orchestrator is required. However, the workloads that need storage must be running on hosts that have nvme-tcp kernel module.

[Go to top](#top)

### What are the minimum requirements and supported container orchestrators?

OpenEBS is currently tightly integrated into Kubernetes.

The system requirements depend on the number of volumes being provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster.(Link the prerequsistes - Internal reference)

[Go to top](#top)

### Why would you use OpenEBS on EBS?

There are at least four common reasons for running OpenEBS on Amazon EBS that are listed as follows:

Attach / Detach: The attach / detach process can slow the environment operations dependent on EBS.

No volume management needed: OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume manager. This saves time and reduces operational complexity.

Expansion and inclusion of NVMe: OpenEBS allows users to add additional capacity without experiencing downtime. This online addition of capacity can include NVMe and SSD instances from cloud providers or deployed in physical servers. This means that as performance requirements increase, or decrease, you can use Kubernetes via storage policies to instruct OpenEBS to change capacity accordingly.

Other enterprise capabilities: OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption. Snapshots and clones facilitate much more efficient CI/CD workflows as zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these without incurring additional storage space or administrative effort. The snapshot capabilities can also be used for replication.

[Go to top](#top)

### Why OpenEBS_logical_size and OpenEBS_actual_used are showing in different size?

The `OpenEBS_logical_size` and `OpenEBS_actual_used` parameters will start showing different sizes when there are replica node restarts and internal snapshots are created for synchronizing replicas.

[Go to top](#top)

### What must be the disk mount status on Node for provisioning OpenEBS volume?

OpenEBS have three local storage engines and one replicated storage engine which can be used to provision OpenEBS volumes.

[Go to top](#top)

### How does it help to keep my data safe?

Replicated storage engine supports synchronous mirroring to enhance the durability of data at rest within whatever physical persistence layer is in use. When volumes are provisioned which are configured for replication \(a user can control the count of active replicas which should be maintained, on a per StorageClass basis\), write I/O operations issued by an application to that volume are amplified by its controller ("nexus") and dispatched to all its active replicas. Only if every replica completes the write successfully on its own underlying block device will the I/O completion be acknowledged to the controller. Otherwise, the I/O is failed and the caller must make its own decision as to whether it should be retried. If a replica is determined to have faulted \(I/O cannot be serviced within the configured timeout period, or not without error\), the control plane will automatically take corrective action and remove it from the volume. If spare capacity is available within a replicated engine pool, a new replica will be created as a replacement and automatically brought into synchronisation with the existing replicas. The data path for a replicated volume is described in more detail [here](../user-guides/replicated-engine-user-guide/additional-information/i-o-path-description.md#replicated-volume-io-path)

[Go to top](#top)

### How is it configured?

This documentation contains sections which are focused on initial quickstart deployment scenarios, including the correct configuration of underlying hardware and software, and of replicated engine features such as "Storage Nodes" \(MSNs\) and "Disk Pools" \(MSPs\). Information describing tuning for the optimization of performance is also provided.

* [Quickstart Guide](../quickstart-guide/)
* [Performance Tips](../user-guides/replicated-engine-user-guide/additional-information/performance-tips.md)

[Go to top](#top)

### What is the basis for its performance claims? Has it been benchmarked?

Replicated engine has been built to leverage the performance potential of contemporary, high-end, solid state storage devices as a foremost design consideration. For this reason, the I/O path is predicated on NVMe, a transport which is both highly CPU efficient and which demonstrates highly linear resource scaling. The data path runs entirely within user space, also contributing efficiency gains as syscalls are avoided, and is both interrupt and lock free.

MayaData has performed its own benchmarking tests in collaboration with Intel, using latest generation Intel P5800X Optane devices "The World's Fastest Data Centre SSD". In those tests it was determined that, on average, across a range of read/write ratios and both with and without synchronous mirroring enabled, the overhead imposed by the replicated engine's I/O path was well under 10% \(in fact, much closer to 6%\).

Further information regarding the testing performed may be found [here](https://openebs.io/blog/mayastor-nvme-of-tcp-performance)

[Go to top](#top)

### What is the on-disk format used by Disk Pools? Is it also open source?

Replicated engine makes use of parts of the open source [Storage Performance Development Kit \(SPDK\)](https://spdk.io/) project, contributed by Intel. Replicated engine's Storage Pools use the SPDK's Blobstore structure as their on-disk persistence layer. Blobstore structures and layout are [documented](https://github.com/spdk/spdk/blob/master/doc/blob.md).

Since the replicas \(data copies\) of replicated volumes are held entirely within Blobstores, it is not possible to directly access the data held on pool's block devices from outside of replicated engine. Equally, replicated engine cannot directly 'import' and use existing volumes which are not of replicated engine's origin. The project's maintainers are considering alternative options for the persistence layer which may support such data migration goals.

[Go to top](#top)

### Can the size / capacity of a Disk Pool be changed?

The size of a replicated storage pool is fixed at the time of creation and is immutable. A single pool may have only one block device as a member. These constraints may be removed in later versions.

### How can I ensure that replicas aren't scheduled onto the same node? How about onto nodes in the same rack / availability zone?

The replica placement logic of replicated engine's control plane doesn't permit replicas of the same volume to be placed onto the same node, even if it were to be within different Disk Pools. For example, if a volume with replication factor 3 is to be provisioned, then there must be three healthy Disk Pools available, each with sufficient free capacity and each located on its own replicated node. Further enhancements to topology awareness are under consideration by the maintainers.

[Go to top](#top)

### How can I see the node on which the active nexus for a particular volume resides?

The kubectl plugin is used to obtain this information.

[Go to top](#top)

### Is there a way to automatically rebalance data across available nodes? Can data be manually re-distributed?

No. This may be a feature of future releases.

[Go to top](#top)

### Can replicated engine do async replication to a node in the same cluster? How about a different cluster?

Replicated engine does not peform asynchronous replication.

[Go to top](#top)

### Does replicated engine support RAID?

Replicated storage pools do not implement any form of RAID, erasure coding or striping. If higher levels of data redundancy are required, replicated volumes can be provisioned with a replication factor of greater than one, which will result in synchronously mirrored copies of their data being stored in multiple Disk Pools across multiple Storage Nodes. If the block device on which a Disk Pool is created is actually a logical unit backed by its own RAID implementation \(e.g. a Fibre Channel attached LUN from an external SAN\) it can still be used within a replicated disk pool whilst providing protection against physical disk device failures.

[Go to top](#top)

### Does replicated engine perform compression and/or deduplication?

No.

[Go to top](#top)

### Does replicated engine support snapshots? Clones?

No but these may be features of future releases.

[Go to top](#top)

### Which CPU architectures are supported? What are the minimum hardware requirements?

The replicated engine nightly builds and releases are compiled and tested on x86-64, under Ubuntu 20.04 LTS with a 5.13 kernel. Some effort has been made to allow compilation on ARM platforms but this is currently considered experimental and is not subject to integration or end-to-end testing by replicated engine's maintainers.

Minimum hardware requirements are discussed in the [quickstart section](../quickstart-guide/) of this documentation.

Replicated engine does not run on Raspbery Pi as the version of the SPDK. Replicated engine requires ARMv8 Crypto extensions which are not currently available for Pi.

[Go to top](#top)

### Does replicated engine suffer from TCP congestion when using NVME-TCP?

Replicated engine, as any other solution leveraging TCP for network transport, may suffer from network congestion as TCP will try to slow down transfer speeds. It is important to keep an eye on networking and fine-tune TCP/IP stack as appropriate. This tuning can include \(but is not limited to\) send and receive buffers, MSS, congestion control algorithms \(e.g. you may try DCTCP\) etc.

[Go to top](#top)

### Why do replicated engine pods show high levels of CPU utilization when there is little or no I/O being processed?

Replicated engine has been designed so as to be able to leverage the peformance capabilities of contemporary high-end solid-state storage devices. A significant aspect of this is the selection of a polling based I/O service queue, rather than an interrupt driven one. This minimises the latency introduced into the data path but at the cost of additional CPU utilization by the "reactor" - the poller operating at the heart of the replicated engine pod. When replicated engine pods have been deployed to a cluster, it is expected that these daemonset instances will make full utilization of their CPU allocation, even when there is no I/O load on the cluster. This is simply the poller continuing to operate at full speed, waiting for I/O. For the same reason, it is recommended that when configuring the CPU resource limits for the replicated engine daemonset, only full, not fractional, CPU limits are set; fractional allocations will also incur additional latency, resulting in a reduction in overall performance potential. The extent to which this performance degradation is noticeable in practice will depend on the performance of the underlying storage in use, as well as whatvever other bottlenecks/constraints may be present in the system as cofigured.

[Go to top](#top)

### Does the supportability tool expose sensitive data?

The supportability tool generates support bundles, which are used for debugging purposes. These bundles are created in response to the user's invocation of the tool and can be transmitted only by the user. To view the list of collected information, visit the [supportability section](../user-guides/replicated-engine-user-guide/advanced-operations/supportability.md#does-the-supportability-tool-expose-sensitive-data).

[Go to top](#top)

### What happens when a PV with reclaim policy set to retain is deleted?

In Kubernetes, when a PVC is created with the reclaim policy set to 'Retain', the PV bound to this PVC is not deleted even if the PVC is deleted. One can manually delete the PV by issuing the command "kubectl delete pv ", however the underlying storage resources could be left behind as the CSI volume provisioner (external provisioner) is not aware of this. To resolve this issue of dangling storage objects, replicated engine  has introduced a PV garbage collector. This PV garbage collector is deployed as a part of the replicated engine CSI controller-plugin.

[Go to top](#top)

### How does the PV garbage collector work?

The PV garbage collector deploys a watcher component, which subscribes to the Kubernetes Persistent Volume deletion events. When a PV is deleted, an event is generated by the Kubernetes API server and is received by this component. Upon a successful validation of this event, the garbage collector deletes the corresponding replicated volume resources.

[Go to top](#top)

### How to disable cow for btrfs filesystem?

To disbale cow for `btrfs` filesystem, use `nodatacow` as a mountOption in the storage class which would be used to provision the volume.

[Go to top](#top)
