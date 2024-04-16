---
id: rs-configuration
title: Configuration
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Configuration
 - Configuration
description: This guide will help you to configure OpenEBS Replicated PV Mayastor.
---

## Create DiskPool\(s\)

When a node allocates storage capacity for a replica of a persistent volume (PV) it does so from a DiskPool. Each node may create and manage zero, one, or more such pools. The ownership of a pool by a node is exclusive. A pool can manage only one block device, which constitutes the entire data persistence layer for that pool and thus defines its maximum storage capacity.

A pool is defined declaratively, through the creation of a corresponding `DiskPool` Custom Resource (CR) on the cluster. The DiskPool must be created in the same namespace where Replicated PV Mayastor has been deployed. User configurable parameters of this resource type include a unique name for the pool, the node name on which it will be hosted and a reference to a disk device which is accessible from that node. The pool definition requires the reference to its member block device to adhere to a discrete range of schemas, each associated with a specific access mechanism/transport/ or device type.

:::info
Replicated PV Mayastor versions before 2.0.1 had an upper limit on the number of retry attempts in the case of failure in `create events` in the DSP operator. With this release, the upper limit has been removed, which ensures that the DiskPool operator indefinitely reconciles with the CR.
:::

**Permissible Schemes for `spec.disks` under DiskPool Custom Resource**

:::info
It is highly recommended to specify the disk using a unique device link that remains unaltered across node reboots. Examples of such device links are: by-path or by-id.

Easy way to retrieve device link for a given node:
`kubectl mayastor get block-devices worker`

```
DEVNAME       DEVTYPE  SIZE      AVAILABLE  MODEL                             DEVPATH                                                           MAJOR  MINOR  DEVLINKS 
/dev/nvme0n1  disk     894.3GiB  yes        Dell DC NVMe PE8010 RI U.2 960GB  /devices/pci0000:30/0000:30:02.0/0000:31:00.0/nvme/nvme0/nvme0n1  259    0      "/dev/disk/by-id/nvme-eui.ace42e00164f0290", "/dev/disk/by-path/pci-0000:31:00.0-nvme-1", "/dev/disk/by-dname/nvme0n1", "/dev/disk/by-id/nvme-Dell_DC_NVMe_PE8010_RI_U.2_960GB_SDA9N7266I110A814"
```

Usage of the device name (for example, /dev/sdx) is not advised, as it may change if the node reboots, which might cause data corruption.
:::

| Type | Format | Example |
| :--- | :--- | :--- |
| Disk(non PCI) with disk-by-guid reference <i><b>(Best Practice)</b></i> | Device File | aio:///dev/disk/by-id/<id> OR uring:///dev/disk/by-id/</id> |
| Asynchronous Disk\(AIO\) | Device File | /dev/sdx |
| Asynchronous Disk I/O \(AIO\) | Device File | aio:///dev/sdx |
| io\_uring | Device File | uring:///dev/sdx |


Once a node has created a pool it is assumed that it henceforth has exclusive use of the associated block device; it should not be partitioned, formatted, or shared with another application or process. Any pre-existing data on the device will be destroyed.

:::warning
A RAM drive is not suitable for use in production as it uses volatile memory for backing the data. The memory for this disk emulation is allocated from the hugepages pool. Make sure to allocate sufficient additional hugepages resource on any storage nodes which will provide this type of storage.
:::

### Configure Pools

To get started, it is necessary to create and host at least one pool on one of the nodes in the cluster. The number of pools available limits the extent to which the synchronous N-way mirroring (replication) of PVs can be configured; the number of pools configured should be equal to or greater than the desired maximum replication factor of the PVs to be created. Also, while placing data replicas ensure that appropriate redundancy is provided. Replicated PV Mayastor's control plane will avoid placing more than one replica of a volume on the same node. For example, the minimum viable configuration for a Replicated PV Mayastor deployment which is intended to implement 3-way mirrored PVs must have three nodes, each having one DiskPool, with each of those pools having one unique block device allocated to it.

Using one or more the following examples as templates, create the required type and number of pools.

**Example DiskPool Definition**
```text
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-1
  namespace: mayastor
spec:
  node: workernode-1-hostname
  disks: ["/dev/disk/by-id/<id>"]
EOF
```

**YAML**
```text
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: INSERT_POOL_NAME_HERE
  namespace: mayastor
spec:
  node: INSERT_WORKERNODE_HOSTNAME_HERE
  disks: ["INSERT_DEVICE_URI_HERE"]
```

:::info
When using the examples given as guides to creating your own pools, remember to replace the values for the fields "metadata.name", "spec.node" and "spec.disks" as appropriate to your cluster's intended configuration. Note that whilst the "disks" parameter accepts an array of values, the current version of Replicated PV Mayastor supports only one disk device per pool.
:::

:::note
Existing schemas in CR definitions (in older versions) will be updated from v1alpha1 to v1beta1 after upgrading to Replicated PV Mayastor 2.4 and above. To resolve errors encountered pertaining to the upgrade, click [here](../../troubleshooting/troubleshooting-replicated-storage.md).
:::

### Verify Pool Creation and Status

The status of DiskPools may be determined by reference to their cluster CRs. Available, healthy pools should report their State as `online`. Verify that the expected number of pools have been created and that they are online.

**Command**
```text
kubectl get dsp -n mayastor
```

**Example Output**
```text
NAME             NODE          STATE    POOL_STATUS   CAPACITY      USED   AVAILABLE
pool-on-node-1   node-1-14944  Created   Online        10724835328   0      10724835328
pool-on-node-2   node-2-14944  Created   Online        10724835328   0      10724835328
pool-on-node-3   node-3-14944  Created   Online        10724835328   0      10724835328
```

## Create Replicated PV Mayastor StorageClass\(s\)

Replicated PV Mayastor dynamically provisions PersistentVolumes \(PVs\) based on StorageClass definitions created by the user. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. See [storage class parameter description](#storage-class-parameters) for a detailed description of these parameters.
Most importantly StorageClass definition is used to control the level of data protection afforded to it (i.e.the number of synchronous data replicas which are maintained, for purposes of redundancy). It is possible to create any number of StorageClass definitions, spanning all permitted parameter permutations.

We illustrate this quickstart guide with two examples of possible use cases; one which offers no data redundancy \(i.e. a single data replica\), and another having three data replicas. 
:::info
Both the example YAMLs given below have [thin provisioning](#thin) enabled. You can modify these as required to match your own desired test cases, within the limitations of the cluster under test.
:::

**Command \(1 replica example\)**
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  protocol: nvmf
  repl: "1"
provisioner: io.openebs.csi-mayastor
EOF
```

**Command \(3 replicas example\)**
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  protocol: nvmf
  repl: "3"
provisioner: io.openebs.csi-mayastor
EOF
```

:::info
The default installation of Replicated PV Mayastor includes the creation of a StorageClass with the name `mayastor-single-replica`. The replication factor is set to 1. Users may either use this StorageClass or create their own.
:::

## Storage Class Parameters

Storage Class resource in Kubernetes is used to supply parameters to volumes when they are created. It is a convenient way of grouping volumes with common characteristics. All parameters take a string value. Brief explanation of each parameter is as follows.


:::info
The Storage Class parameter `local` has been deprecated and is a breaking change in Replicated PV Mayastor version 2.0. Ensure that this parameter is not used.
:::

### "fsType"

File system that will be used when mounting the volume. 
The supported file systems are **ext4**, **xfs** and **btrfs** and the default file system when not specified is **ext4**. We recommend to use **xfs** that is considered to be more advanced and performant. 
Please ensure the requested filesystem driver is installed on all worker nodes in the cluster before using it.

### "protocol"

The parameter 'protocol' takes the value `nvmf`(NVMe over TCP protocol). It is used to mount the volume (target) on the application node.

### "repl"

The string value should be a number and the number should be greater than zero. Replicated PV Mayastor control plane will try to keep always this many copies of the data if possible. If set to one then the volume does not tolerate any node failure. If set to two, then it tolerates one node failure. If set to three, then two node failures, etc.

### "thin"

The volumes can either be `thick` or `thin` provisioned. Adding the `thin` parameter to the StorageClass YAML allows the volume to be thinly provisioned. To do so, add `thin: true` under the `parameters` spec, in the StorageClass YAML. [Sample YAML](#create-replicated-pv-mayastor-storageclasss)
When the volumes are thinly provisioned, the user needs to monitor the pools, and if these pools start to run out of space, then either new pools must be added or volumes deleted to prevent thinly provisioned volumes from getting degraded or faulted. This is because when a pool with more than one replica runs out of space, Replicated PV Mayastor moves the largest out-of-space replica to another pool and then executes a rebuild. It then checks if all the replicas have sufficient space; if not, it moves the next largest replica to another pool, and this process continues till all the replicas have sufficient space.

:::info
The capacity usage on a pool can be monitored using [exporter metrics](../replicated-pv-mayastor/advanced-operations/monitoring.md#pool-metrics-exporter).
:::

The `agents.core.capacity.thin` spec present in the Replicated PV Mayastor helm chart consists of the following configurable parameters that can be used to control the scheduling of thinly provisioned replicas:

1. **poolCommitment** parameter specifies the maximum allowed pool commitment limit (in percent).
2. **volumeCommitment** parameter specifies the minimum amount of free space that must be present in each replica pool in order to create new replicas for an existing volume. This value is specified as a percentage of the volume size.
3. **volumeCommitmentInitial** minimum amount of free space that must be present in each replica pool in order to create new replicas for a new volume. This value is specified as a percentage of the volume size.


:::note
- By default, the volumes are provisioned as `thick`. 
- For a pool of a particular size, say 10 Gigabytes, a volume > 10 Gigabytes cannot be created, as Replicated PV Mayastor currently does not support pool expansion.
- The replicas for a given volume can be either all thick or all thin. Same volume cannot have a combination of thick and thin replicas.
:::

### "stsAffinityGroup" 

 `stsAffinityGroup` represents a collection of volumes that belong to instances of Kubernetes StatefulSet. When a StatefulSet is deployed, each instance within the StatefulSet creates its own individual volume, which collectively forms the `stsAffinityGroup`. Each volume within the `stsAffinityGroup` corresponds to a pod of the StatefulSet.

This feature enforces the following rules to ensure the proper placement and distribution of replicas and targets so that there is not any single point of failure affecting multiple instances of StatefulSet.

1. Anti-Affinity among single-replica volumes:
 This rule ensures that replicas of different volumes are distributed in such a way that there is no single point of failure. By avoiding the colocation of replicas from different volumes on the same node.

2.  Anti-Affinity among multi-replica volumes: 

If the affinity group volumes have multiple replicas, they already have some level of redundancy. This feature ensures that in such cases, the replicas are distributed optimally for the stsAffinityGroup volumes.

3. Anti-affinity among targets:

The [High Availability](../replicated-pv-mayastor/advanced-operations/HA.md) feature ensures that there is no single point of failure for the targets.
The `stsAffinityGroup` ensures that in such cases, the targets are distributed optimally for the stsAffinityGroup volumes.

By default, the `stsAffinityGroup` feature is disabled. To enable it, modify the storage class YAML by setting the `parameters.stsAffinityGroup` parameter to true.

### "cloneFsIdAsVolumeId"

`cloneFsIdAsVolumeId` is a setting for volume clones/restores with two options: `true` and `false`. By default, it is set to `false`.
- When set to `true`, the created clone/restore's filesystem `uuid` will be set to the restore volume's `uuid`. This is important because some file systems, like XFS, do not allow duplicate filesystem `uuid` on the same machine by default.
- When set to `false`, the created clone/restore's filesystem `uuid` will be same as the orignal volume `uuid`, but it will be mounted using the `nouuid` flag to bypass duplicate `uuid` validation.

:::note
This option needs to be set to true when using a `btrfs` filesystem, if the application using the restored volume is scheduled on the same node where the original volume is mounted, concurrently.
:::

## See Also

- [Installation](../../quickstart-guide/installation.md)
- [Deploy an Application](../replicated-pv-mayastor/rs-deployment.md)