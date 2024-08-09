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

* For each volume, you will notice one I/O controller pod and one or more replicas (as per the storage class configuration). You can use the volume ID (ee171da3-07d5-11e8-a5be-42010a8001be) to view information about the volume and replicas using the [kubectl plugin](../user-guides/replicated-storage-user-guide/advanced-operations/kubectl-plugin.md)

[Go to top](#top)

### What changes are needed for Kubernetes or other subsystems to leverage OpenEBS? {#changes-on-k8s-for-openebs}

One of the major differences of OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload and the easy management of it is crucial especially as the CNS approach entails putting containers that are I/O controller and replica controllers.

[Go to top](#top)

### How do you get started and what is the typical trial deployment? {#get-started}

To get started, you can follow the steps in the [quickstart guide](../quickstart-guide/installation.md).
 
[Go to top](#top)

### What is the default OpenEBS Reclaim policy? {#default-reclaim-policy}

The default retention is the same used by K8s. For dynamically provisioned PersistentVolumes, the default reclaim policy is “Delete”. This means that a dynamically provisioned volume is automatically deleted when a user deletes the corresponding PersistentVolumeClaim.

[Go to top](#top)

### Can I use replica count as 2 in StorageClass if it is a single node cluster? {#replica-count-2-in-a-single-node-cluster}

While creating a StorageClass, if user mention replica count as 2 in a single node cluster, OpenEBS will not create the volume. It is required to match the number of replica count and number of nodes available in the cluster for provisioning OpenEBS replicated volumes.

[Go to top](#top)

### How backup and restore is working with OpenEBS volumes? {#backup-restore-openebs-volumes}

Refer to the following links for more information on the backup and restore functionality with the OpenEBS volumes:
- [Backup and Restore](../user-guides/local-storage-user-guide/additional-information/backupandrestore.md)
- [Snapshot](../user-guides/local-storage-user-guide/local-pv-lvm/advanced-operations/lvm-snapshot.md)
- [Backup and Restore for Local PV ZFS Volumes](../user-guides/local-storage-user-guide/local-pv-zfs/advanced-operations/zfs-backup-restore.md)
- [Snapshot Restore for Replicated Storage](../user-guides/replicated-storage-user-guide/advanced-operations/snapshot-restore.md)

[Go to top](#top)

### How to add custom topology key in the Local PV LVM driver?

To add custom topology key:
* Label the nodes with the required key and value.
* Set env variables in the LVM driver daemonset yaml(openebs-lvm-node), if already deployed, you can edit the daemonSet directly.
* "openebs.io/nodename" has been added as default topology key. 
* Create storageclass with above specific labels keys.


```sh
$ kubectl label node k8s-node-1 openebs.io/rack=rack1
node/k8s-node-1 labeled

$ kubectl get nodes k8s-node-1 --show-labels
NAME           STATUS   ROLES    AGE   VERSION   LABELS
k8s-node-1   Ready    worker   16d   v1.17.4   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=k8s-node-1,kubernetes.io/os=linux,node-role.kubernetes.io/worker=true,openebs.io/rack=rack1


$ kubectl get ds -n kube-system openebs-lvm-node -o yaml
...
env:
  - name: OPENEBS_NODE_ID
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: OPENEBS_CSI_ENDPOINT
    value: unix:///plugin/csi.sock
  - name: OPENEBS_NODE_DRIVER
    value: agent
  - name: LVM_NAMESPACE
    value: openebs
  - name: ALLOWED_TOPOLOGIES
    value: "openebs.io/rack"

```
It is recommended is to label all the nodes with the same key, they can have different values for the given keys, but all keys should be present on all the worker node.

Once we have labeled the node, we can install the lvm driver. The driver will pick the keys from env "ALLOWED_TOPOLOGIES" and add that as the supported topology key. If the driver is already installed and you want to add a new topology information, you can edit the Local PV LVM CSI driver daemon sets (openebs-lvm-node).


```sh
$ kubectl get pods -n kube-system -l role=openebs-lvm

NAME                       READY   STATUS    RESTARTS   AGE
openebs-lvm-controller-0   4/4     Running   0          5h28m
openebs-lvm-node-4d94n     2/2     Running   0          5h28m
openebs-lvm-node-gssh8     2/2     Running   0          5h28m
openebs-lvm-node-twmx8     2/2     Running   0          5h28m
```

We can verify that key has been registered successfully with the Local PV LVM CSI Driver by checking the CSI node object yaml:

```yaml
$ kubectl get csinodes pawan-node-1 -oyaml
apiVersion: storage.k8s.io/v1
kind: CSINode
metadata:
  creationTimestamp: "2020-04-13T14:49:59Z"
  name: k8s-node-1
  ownerReferences:
  - apiVersion: v1
    kind: Node
    name: k8s-node-1
    uid: fe268f4b-d9a9-490a-a999-8cde20c4dadb
  resourceVersion: "4586341"
  selfLink: /apis/storage.k8s.io/v1/csinodes/k8s-node-1
  uid: 522c2110-9d75-4bca-9879-098eb8b44e5d
spec:
  drivers:
  - name: local.csi.openebs.io
    nodeID: k8s-node-1
    topologyKeys:
    - openebs.io/nodename
    - openebs.io/rack
```

We can see that "openebs.io/rack" is listed as topology key. Now we can create a storageclass with the topology key created:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
allowVolumeExpansion: true
parameters:
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: openebs.io/rack
    values:
      - rack1
```

The LVM Local PV CSI driver will schedule the PV to the nodes where label "openebs.io/rack" is set to "rack1".

:::note 
If storageclass is using Immediate binding mode and storageclass allowedTopologies is not mentioned then all the nodes should be labeled using "ALLOWED_TOPOLOGIES" keys, that means, "ALLOWED_TOPOLOGIES" keys should be present on all nodes, nodes can have different values for those keys. If some nodes don't have those keys, then LVMPV's default scheduler can not effectively do the volume capacity based scheduling. Here, in this case the CSI provisioner will pick keys from any random node and then prepare the preferred topology list using the nodes which has those keys defined and LVMPV scheduler will schedule the PV among those nodes only.
:::

[Go to top](#top)

### What is Local PV ZFS?

Local PV ZFS is a CSI driver for dynamically provisioning a volume in ZFS storage. It also takes care of tearing down the volume from the ZFS storage once volume is deprovisioned.

[Go to top](#top)

### How to upgrade the driver to newer version?

Follow the instructions [here](https://github.com/openebs/zfs-localpv/tree/develop/upgrade).

[Go to top](#top)

### ZFS Pools are there on certain nodes only, how can I create the storage class?

If ZFS pool is available on certain nodes only, then make use of topology to tell the list of nodes where we have the ZFS pool available.
As shown in the below storage class, we can use allowedTopologies to describe ZFS pool availability on nodes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
allowVolumeExpansion: true
parameters:
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: kubernetes.io/hostname
    values:
      - zfspv-node1
      - zfspv-node2
```

The above storage class tells that ZFS pool "zfspv-pool" is available on nodes zfspv-node1 and zfspv-node2 only. The ZFS driver will create volumes on those nodes only.

:::note
The provisioner name for ZFS driver is "zfs.csi.openebs.io", we have to use this while creating the storage class so that the volume provisioning/deprovisioning request can come to ZFS driver.
:::

[Go to top](#top)

### How to install the provisioner in High Availability?

To have High Availability (HA) for the provisioner (controller), we can update the replica count to 2 (or more as per need) and deploy the yaml. Once yaml is deployed, you can see 2 (or more) controller pod running. At a time only one will be active and once the controller pod is down, the other will take over. They will use lease mechanism to decide which is active/master. 

:::note
The controller pod has anti-affinity rules, so on one node only one pod will be running. That means, if you are using 2 replicas on a single node cluster, the other pod will be in pending state because of the anti-affinity rule. So, before changing the replica count, ensure that you have sufficient nodes.
:::

Here is the yaml snippet to do that:

```yaml
kind: Deployment
apiVersion: apps/v1
metadata:
  name: openebs-zfs-controller
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: openebs-zfs-controller
      role: openebs-zfs
  serviceName: "openebs-zfs"
  replicas: 2
---
```

[Go to top](#top)

### How to add custom topology key to Local PV ZFS driver?

To add custom topology key:
* Label the nodes with the required key and value.
* Set env variables in the ZFS driver daemonset yaml (openebs-zfs-node), if already deployed, you can edit the daemonSet directly. By default the env is set to `All` which will take the node label keys as allowed topologies.
* "openebs.io/nodename" and "openebs.io/nodeid" are added as default topology key. 
* Create storageclass with above specific labels keys.


```sh
$ kubectl label node pawan-node-1 openebs.io/rack=rack1
node/pawan-node-1 labeled

$ kubectl get nodes pawan-node-1 --show-labels
NAME           STATUS   ROLES    AGE   VERSION   LABELS
pawan-node-1   Ready    worker   16d   v1.17.4   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=pawan-node-1,kubernetes.io/os=linux,node-role.kubernetes.io/worker=true,openebs.io/rack=rack1

$ kubectl get ds -n kube-system openebs-zfs-node -o yaml
...
env:
  - name: OPENEBS_NODE_ID
    valueFrom:
      fieldRef:
        fieldPath: spec.nodeName
  - name: OPENEBS_CSI_ENDPOINT
    value: unix:///plugin/csi.sock
  - name: OPENEBS_NODE_DRIVER
    value: agent
  - name: OPENEBS_NAMESPACE
    value: openebs
  - name: ALLOWED_TOPOLOGIES
    value: "openebs.io/rack"
```
It is recommended is to label all the nodes with the same key, they can have different values for the given keys, but all keys should be present on all the worker node.

Once we have labeled the node, we can install the zfs driver. The driver will pick the keys from env "ALLOWED_TOPOLOGIES" and add that as the supported topology key. If the driver is already installed and you want to add a new topology information, you can edit the LocalPV ZFS CSI driver daemon sets (openebs-zfs-node).

```sh
$ kubectl get pods -n kube-system -l role=openebs-zfs

NAME                       READY   STATUS    RESTARTS   AGE
openebs-zfs-controller-0   4/4     Running   0          5h28m
openebs-zfs-node-4d94n     2/2     Running   0          5h28m
openebs-zfs-node-gssh8     2/2     Running   0          5h28m
openebs-zfs-node-twmx8     2/2     Running   0          5h28m
```

We can verify that key has been registered successfully with the ZFSPV CSI Driver by checking the CSI node object yaml:

```yaml
$ kubectl get csinodes pawan-node-1 -oyaml
apiVersion: storage.k8s.io/v1
kind: CSINode
metadata:
  creationTimestamp: "2020-04-13T14:49:59Z"
  name: pawan-node-1
  ownerReferences:
  - apiVersion: v1
    kind: Node
    name: pawan-node-1
    uid: fe268f4b-d9a9-490a-a999-8cde20c4dadb
  resourceVersion: "4586341"
  selfLink: /apis/storage.k8s.io/v1/csinodes/pawan-node-1
  uid: 522c2110-9d75-4bca-9879-098eb8b44e5d
spec:
  drivers:
  - name: zfs.csi.openebs.io
    nodeID: pawan-node-1
    topologyKeys:
    - openebs.io/nodeid
    - openebs.io/nodename
    - openebs.io/rack
```

We can see that "openebs.io/rack" is listed as topology key. Now we can create a storageclass with the topology key created:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-zfspv
allowVolumeExpansion: true
parameters:
  fstype: "zfs"
  poolname: "zfspv-pool"
provisioner: zfs.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: openebs.io/rack
    values:
      - rack1
```

The ZFSPV CSI driver will schedule the PV to the nodes where label "openebs.io/rack" is set to "rack1". If there are multiple nodes qualifying this prerequisite, then it will pick the node which has less number of volumes provisioned for the given ZFS Pool.

:::note
If storageclass is using immediate binding mode and storageclass `allowedTopologies` is not mentioned then all the nodes should be labeled using "ALLOWED_TOPOLOGIES" keys. That means, "ALLOWED_TOPOLOGIES" keys should be present on all nodes, nodes can have different values for those keys. If some nodes don't have those keys, then ZFS PV's default scheduler can not effectively do the volume capacity based scheduling. Here, in this case the CSI provisioner will pick keys from any random node and then prepare the preferred topology list using the nodes which has those keys defined and ZFSPV scheduler will schedule the PV among those nodes only.
:::

[Go to top](#top)

### Why the ZFS volume size is different than the reqeusted size in PVC?

:::note
The size will be rounded off to the nearest Mi or Gi unit. M/G notation uses 1000 base and Mi/Gi notation uses 1024 base, so 1M will be 1000 * 1000 byte and 1Mi will be 1024 * 1024.
:::

The driver uses below logic to roundoff the capacity:

1. if PVC size is > Gi (1024 * 1024 * 1024), then it will find the size in the nearest Gi unit and allocate that.

allocated = ((size + 1Gi - 1) / Gi) * Gi

For example if the PVC is requesting 4G storage space:

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-zfspv
spec:
  storageClassName: openebs-zfspv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4G
```

Then driver will find the nearest size in Gi, the size allocated will be ((4G + 1Gi - 1) / Gi) * Gi, which will be 4Gi.

2. if PVC size is < Gi (1024 * 1024 * 1024), then it will find the size in the nearest Mi unit and allocate that.

allocated = ((size + 1Mi - 1) / Mi) * Mi

For example if the PVC is requesting 1G (1000 * 1000 * 1000) storage space which is less than 1Gi (1024 * 1024 * 1024):

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-zfspv
spec:
  storageClassName: openebs-zfspv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1G
```

Then driver will find the nearest size in Mi, the size allocated will be ((1G + 1Mi - 1) / Mi) * Mi, which will be 954Mi.

PVC size as zero in not a valid capacity. The minimum allocatable size for the Local PV ZFS driver is 1Mi, which means that if we are requesting 1 byte of storage space then 1Mi will be allocated for the volume.

[Go to top](#top)

### How to migrate PVs to the new node in case old node is not accessible?

The Local PV ZFS driver will set affinity on the PV to make the volume stick to the node so that pod gets scheduled to that node only where the volume is present. Now, the problem here is, when that node is not accesible due to some reason and we move the disks to a new node and import the pool there, the pods will not be scheduled to this node as k8s scheduler will be looking for that node only to schedule the pod.

From release 1.7.0 of the Local PV ZFS, the driver has the ability to use the user defined affinity for creating the PV. While deploying the Local PV ZFS driver, first we should label all the nodes using the key `openebs.io/nodeid` with some unique value.
```
$ kubectl label node node-1 openebs.io/nodeid=custom-value-1
```

In the above command, we have labeled the node `node-1` using the key `openebs.io/nodeid` and the value we have used here is `custom-value-1`. You can pick your own value, just make sure that the value is unique for all the nodes. We have to label all the nodes in the cluster with the unique value. For example, `node-2` and `node-3` can be labeled as below:

```
$ kubectl label node node-2 openebs.io/nodeid=custom-value-2
$ kubectl label node node-3 openebs.io/nodeid=custom-value-3
```

Now, the Driver will use `openebs.io/nodeid` as the key and the corresponding value to set the affinity on the PV and k8s scheduler will consider this affinity label while scheduling the pods.

When a node is not accesible, follow the steps below:

1. Remove the old node from the cluster or we can just remove the above node label from the node which we want to remove.
2. Add a new node in the cluster
3. Move the disks to this new node
4. Import the zfs pools on the new nodes
5. Label the new node with same key and value. For example, if we have removed the node-3 from the cluster and added node-4 as new node, we have to label the node `node-4` and set the value to `custom-value-3` as shown below:

```
$ kubectl label node node-4 openebs.io/nodeid=custom-value-3
```

Once the above steps are done, the pod should be able to run on this new node with all the data it has on the old node. Here, there is one limitation that we can only move the PVs to the new node, we cannot move the PVs to the node which was already used in the cluster as there is only one allowed value for the custom key for setting the node label.

[Go to top](#top)

### How is data protected in Replicated Storage? What happens when a host, client workload, or a data center fails?

The OpenEBS Replicated Storage (a.k.a Replicated Engine or Mayastor) ensures resilience with built-in highly available architecture. It supports on-demand switch over of the NVMe controller to ensure IO continuity in case of host failure. The data is synchronously replicated as per the congigured replication factor to ensure no single point of failure.
Faulted replicas are automatically rebuilt in the background without IO disruption to maintain the replication factor.

[Go to top](#top)

### How does OpenEBS provide high availability for stateful workloads?

Refer to the [Replicated PV Mayastor Configuration documentation](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#stsaffinitygroup) for more information.

[Go to top](#top)

### What changes must be made to the nodes on which OpenEBS runs?

OpenEBS has been engineered so that it does not require any changes to the nodes on which it runs. Similarly, Kubernetes itself does not require to be altered and no additional external orchestrator is required. However, the workloads that need storage must be running on hosts that have nvme-tcp kernel module.

[Go to top](#top)

### What are the minimum requirements and supported container orchestrators?

OpenEBS is currently tightly integrated into Kubernetes.

The [system requirements](../quickstart-guide/installation.md#prerequisites) depend on the number of volumes being provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster.

[Go to top](#top)

### Why would you use OpenEBS on EBS?

There are at least four common reasons for running OpenEBS on Amazon EBS that are listed as follows:

Attach / Detach: The attach / detach process can slow the environment operations dependent on EBS.

No volume management needed: OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume manager. This saves time and reduces operational complexity.

Expansion and inclusion of NVMe: OpenEBS allows users to add additional capacity without experiencing downtime. This online addition of capacity can include NVMe and SSD instances from cloud providers or deployed in physical servers. This means that as performance requirements increase, or decrease, you can use Kubernetes via storage policies to instruct OpenEBS to change capacity accordingly.

Other enterprise capabilities: OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption. Snapshots and clones facilitate much more efficient CI/CD workflows as zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these without incurring additional storage space or administrative effort. The snapshot capabilities can also be used for replication.

[Go to top](#top)

### What must be the disk mount status on Node for provisioning OpenEBS volume?

It is recommended to use unpartitioned raw block devices for best results.

[Go to top](#top)

### How does it help to keep my data safe?

Replicated Storage engine supports synchronous mirroring to enhance the durability of data at rest within whatever physical persistence layer is in use. When volumes are provisioned which are configured for replication \(a user can control the count of active replicas which should be maintained, on a per StorageClass basis\), write I/O operations issued by an application to that volume are amplified by its controller ("nexus") and dispatched to all its active replicas. Only if every replica completes the write successfully on its own underlying block device will the I/O completion be acknowledged to the controller. Otherwise, the I/O is failed and the caller must make its own decision as to whether it should be retried. If a replica is determined to have faulted \(I/O cannot be serviced within the configured timeout period, or not without error\), the control plane will automatically take corrective action and remove it from the volume. If spare capacity is available within a Replicated Storage pool, a new replica will be created as a replacement and automatically brought into synchronisation with the existing replicas. The data path for a replicated volume is described in more detail [here](../user-guides/replicated-storage-user-guide/additional-information/i-o-path-description.md#replicated-volume-io-path).

[Go to top](#top)

### How is it configured?

This documentation contains sections which are focused on initial quickstart deployment scenarios, including the correct configuration of underlying hardware and software, and of Replicated Storage features such as "Storage Nodes" \(MSNs\) and "Disk Pools" \(MSPs\). Information describing tuning for the optimization of performance is also provided.

* [Quickstart Guide](../quickstart-guide/installation.md)
* [Performance Tips](../user-guides/replicated-storage-user-guide/additional-information/performance-tips.md)

[Go to top](#top)

### What is the basis for its performance claims? Has it been benchmarked?

Replicated Storage has been built to leverage the performance potential of contemporary, high-end, solid state storage devices as a foremost design consideration. For this reason, the I/O path is predicated on NVMe, a transport which is both highly CPU efficient and which demonstrates highly linear resource scaling. The data path runs entirely within user space, also contributing efficiency gains as syscalls are avoided, and is both interrupt and lock free.

MayaData performance benchmarking was done in collaboration with Intel, using latest generation Intel P5800X Optane devices "The World's Fastest Data Centre SSD". In those tests it was determined that, on average, across a range of read/write ratios and both with and without synchronous mirroring enabled, the overhead imposed by the Replicated Storage's I/O path was well under 10% \(in fact, much closer to 6%\).

Further information regarding the testing performed may be found [here](https://openebs.io/blog/mayastor-nvme-of-tcp-performance).

[Go to top](#top)

### What is the on-disk format used by Disk Pools? Is it also open source?

Replicated Storage makes use of parts of the open source [Storage Performance Development Kit \(SPDK\)](https://spdk.io/) project, contributed by Intel. Replicated Storage's Storage Pools use the SPDK's Blobstore structure as their on-disk persistence layer. Blobstore structures and layout are [documented](https://github.com/spdk/spdk/blob/master/doc/blob.md).

Since the replicas \(data copies\) of replicated volumes are held entirely within Blobstores, it is not possible to directly access the data held on pool's block devices from outside of Replicated Storage. Equally, Replicated Storage cannot directly 'import' and use existing volumes which are not of Replicated Storage's origin. The project's maintainers are considering alternative options for the persistence layer which may support such data migration goals.

[Go to top](#top)

### Can the size / capacity of a Disk Pool be changed?

The size of a Replicated Storage pool is fixed at the time of creation and is immutable. A single pool may have only one block device as a member. These constraints may be removed in later versions.

### How can I ensure that replicas are not scheduled onto the same node? How about onto nodes in the same rack/availability zone?

The replica placement logic of Replicated Storage's control plane does not permit replicas of the same volume to be placed onto the same node, even if it were to be within different Disk Pools. For example, if a volume with replication factor 3 is to be provisioned, then there must be three healthy Disk Pools available, each with sufficient free capacity and each located on its own replicated node. Further enhancements to topology awareness are under consideration by the maintainers.

[Go to top](#top)

### How can I see the node on which the active nexus for a particular volume resides?

The kubectl plugin is used to obtain this information.

[Go to top](#top)

### Is there a way to automatically rebalance data across available nodes? Can data be manually re-distributed?

No. This may be a feature of future releases.

[Go to top](#top)

### Can Replicated Storage do async replication to a node in the same cluster? How about a different cluster?

Replicated Storage does not peform asynchronous replication.

[Go to top](#top)

### Does Replicated Storage support RAID?

Replicated Storage pools do not implement any form of RAID, erasure coding or striping. If higher levels of data redundancy are required, replicated volumes can be provisioned with a replication factor of greater than one, which will result in synchronously mirrored copies of their data being stored in multiple Disk Pools across multiple Storage Nodes. If the block device on which a Disk Pool is created is actually a logical unit backed by its own RAID implementation \(e.g. a Fibre Channel attached LUN from an external SAN\) it can still be used within a replicated disk pool whilst providing protection against physical disk device failures.

[Go to top](#top)

### Does Replicated Storage perform compression and/or deduplication?

No.

[Go to top](#top)

### Does Replicated Storage support snapshots? Clones?

Yes, snapshots and clones support is presently limited to volumes with only one replica. Snapshot and clone support for multi-replica volumes is planned in the upcoming release.

[Go to top](#top)

### Which CPU architectures are supported? What are the minimum hardware requirements?

The Replicated Storage nightly builds and releases are compiled and tested on x86-64, under Ubuntu 20.04 LTS with a 5.13 kernel. Some effort has been made to allow compilation on ARM platforms but this is currently considered experimental and is not subject to integration or end-to-end testing by Replicated Storage's maintainers.

Minimum hardware requirements are discussed in the [quickstart section](../quickstart-guide/installation.md) of this documentation.

Replicated Storage does not run on Raspberry Pi as the current version of SPDK requires ARMv8 Crypto extensions which are not currently available for Pi.

[Go to top](#top)

### Does Replicated Storage suffer from TCP congestion when using NVME-TCP?

Replicated Storage, as any other solution leveraging TCP for network transport, may suffer from network congestion as TCP will try to slow down transfer speeds. It is important to keep an eye on networking and fine-tune TCP/IP stack as appropriate. This tuning can include \(but is not limited to\) send and receive buffers, MSS, congestion control algorithms \(e.g. you may try DCTCP\) etc.

[Go to top](#top)

### Why do Replicated Storage's IO engine pods show high levels of CPU utilization when there is little or no I/O being processed?

Replicated Storage has been designed so as to be able to leverage the peformance capabilities of contemporary high-end solid-state storage devices. A significant aspect of this is the selection of a polling based I/O service queue, rather than an interrupt driven one. This minimizes the latency introduced into the data path but at the cost of additional CPU utilization by the "reactor" - the poller operating at the heart of the Replicated Storage's IO engine pod. When the IO engine pod is deployed on a cluster, it is expected that these daemonset instances will make full utilization of their CPU allocation, even when there is no I/O load on the cluster. This is simply the poller continuing to operate at full speed, waiting for I/O. For the same reason, it is recommended that when configuring the CPU resource limits for the IO engine daemonset, only full, not fractional, CPU limits are set; fractional allocations will also incur additional latency, resulting in a reduction in overall performance potential. The extent to which this performance degradation is noticeable in practice will depend on the performance of the underlying storage in use, as well as whatvever other bottlenecks/constraints may be present in the system as cofigured.

[Go to top](#top)

### Does the supportability tool expose sensitive data?

The supportability tool generates support bundles, which are used for debugging purposes. These bundles are created in response to the user's invocation of the tool and can be transmitted only by the user. To view the list of collected information, visit the [supportability section](../user-guides/replicated-storage-user-guide/advanced-operations/supportability.md#does-the-supportability-tool-expose-sensitive-data).

[Go to top](#top)

### What happens when a PV with reclaim policy set to retain is deleted?

In Kubernetes, when a PVC is created with the reclaim policy set to 'Retain', the PV bound to this PVC is not deleted even if the PVC is deleted. One can manually delete the PV by issuing the command "kubectl delete pv", however the underlying storage resources could be left behind as the CSI volume provisioner (external provisioner) is not aware of this. To resolve this issue of dangling storage objects, Replicated Storage has introduced a PV garbage collector. This PV garbage collector is deployed as a part of the Replicated Storage CSI controller-plugin.

[Go to top](#top)

### How does the PV garbage collector work?

The PV garbage collector deploys a watcher component, which subscribes to the Kubernetes Persistent Volume deletion events. When a PV is deleted, an event is generated by the Kubernetes API server and is received by this component. Upon a successful validation of this event, the garbage collector deletes the corresponding replicated volume resources.

[Go to top](#top)

### How to disable cow for btrfs filesystem?

To disbale cow for `btrfs` filesystem, use `nodatacow` as a mountOption in the storage class which would be used to provision the volume.

[Go to top](#top)

### How to access NVMe Disk directly from userspace via PCIe when creating a DiskPool?

The following methods can be used to access NVMe Disk directly from userspace via PCIe:

1. Via Kernel BDev
    - URING: `uring:///dev/nvmexn1`
    - AIO: `uring:///dev/nvmexn1` or `/dev/nvmexn1`

2. Direct PCIe access: `pcie:///0000:01:00.0`

For Direct PCIe access to bypass the kernel, the NVME device must be detached from the kernel.

:::info
We intend to automate this process in the future.
:::

Use this [setup](https://github.com/spdk/spdk/blob/master/scripts/setup.sh) and clone the `spdk` repo.

```
❯ sudo ./scripts/setup.sh status
Hugepages
node     hugesize     free /  total
node0   1048576kB        0 /      0
node0      2048kB     4096 /   4096

Type                      BDF             Vendor Device NUMA    Driver           Device     Block devices
NVMe                      0000:01:00.0    144d   a80c   unknown nvme             nvme0      nvme0n1
NVMe                      0000:22:00.0    8086   f1a8   unknown nvme             nvme1      nvme1n1
NVMe                      0000:23:00.0    144d   a808   unknown nvme             nvme2      nvme2n1
```

For example, use pcie for `nvme0n1` that has BDF of `0000:01:00.0`.

```
❯ sudo PCI_ALLOWED=0000:01:00.0 ./scripts/setup.sh
....
❯ sudo ./scripts/setup.sh status
Hugepages
node     hugesize     free /  total
node0   1048576kB        0 /      0
node0      2048kB     4096 /   4096

Type                      BDF             Vendor Device NUMA    Driver           Device     Block devices
NVMe                      0000:01:00.0    144d   a80c   unknown vfio-pci         -          -
NVMe                      0000:22:00.0    8086   f1a8   unknown nvme             nvme1      nvme1n1
NVMe                      0000:23:00.0    144d   a808   unknown nvme             nvme2      nvme2n1
```

Now that `0000:01:00.0` is bound to `vfio-pcie`, you can create your pools with `pcie:///0000:01:00.0`.

[Go to top](#top)

### How do I install Replicated PV Mayastor on a Kubernetes cluster with a custom domain?

If the domain name of your Kubernetes cluster is not 'cluster.local', you have to specify the custom domain during installation as follows:
 
```
helm install openebs openebs/openebs -n openebs --create-namespace --set mayastor.etcd.clusterDomain="<your-custom-cluster-domain>"
```

[Go to top](#top)

### What happens when a single replica node fails?

It is recommended that Replicated PV Mayastor volumes be provisioned with a minimum of 2 replicas for higher storage availability. If a volume is provisioned with a single replica and the node where that replica is present, becomes unavailable, then the entire volume will become unavailable for access and I/O operations will fail as there will be no more healthy replicas.

[Go to top](#top)

## See Also

- [Quickstart](../quickstart-guide/installation.md)
- [Deployment](../quickstart-guide/deploy-a-test-application.md)
- [OpenEBS Architecture](../concepts/architecture.md)
- [OpenEBS Local Storage](../concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](../concepts/data-engines/replicated-storage.md)
- [Community](../community.md)
- [Commercial Support](../commercial-support.md)