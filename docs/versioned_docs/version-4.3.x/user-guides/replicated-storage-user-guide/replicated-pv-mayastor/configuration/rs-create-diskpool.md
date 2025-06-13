---
id: rs-create-diskpool
title: Create DiskPool(s)
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Configuration
 - Configuration
 - Create DiskPool(s)
description: This guide will help you to create and verify DiskPool for OpenEBS Replicated PV Mayastor.
---

# Create DiskPool(s)

When a node allocates storage capacity for a replica of a Persistent Volume (PV) it does so from a DiskPool. Each node may create and manage zero, one, or more such pools. The ownership of a pool by a node is exclusive. A pool can manage only one block device, which constitutes the entire data persistence layer for that pool and thus defines its maximum storage capacity.

A pool is defined declaratively, through the creation of a corresponding `DiskPool` Custom Resource (CR) on the cluster. The DiskPool must be created in the same namespace where the Replicated PV Mayastor has been deployed. User configurable parameters of this resource type include a unique name for the pool, the node name on which it will be hosted and a reference to a disk device that is accessible from that node. The pool definition requires the reference to its member block device to adhere to a discrete range of schemas, each associated with a specific access mechanism/transport/ or device type.

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

## Configure Pools

To get started, it is necessary to create and host at least one pool on one of the nodes in the cluster. The number of pools available limits the extent to which the synchronous N-way mirroring (replication) of PVs can be configured; the number of pools configured should be equal to or greater than the desired maximum replication factor of the PVs to be created. Also, while placing data replicas ensure that appropriate redundancy is provided. Replicated PV Mayastor's control plane will avoid placing more than one replica of a volume on the same node. For example, the minimum viable configuration for a Replicated PV Mayastor deployment which is intended to implement 3-way mirrored PVs must have three nodes, each having one DiskPool, with each of those pools having one unique block device allocated to it.

Create the required type and number of pools by using one or more of the following examples as templates. 

**Example DiskPool Definition**
```text
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-1
  namespace: openebs
spec:
  node: workernode-1-hostname
  disks: ["aio:///dev/disk/by-id/<id>"]
EOF
```

Inorder to place the volume replicas based on the pool labels i.e. to satisfy `poolHasTopologyKey` and `poolAffinityTopologyLabel` parameters of the storage class, the pools must be labelled with the topology field.
This can be achieved in two ways:

1. Create a new pool with the labels.

**Example DiskPool Definition with Labels**
```
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-1
  namespace: openebs
spec:
  node: workernode-1-hostname
  disks: ["aio:///dev/disk/by-id/<id>"]
  topology:
    labelled:
      topology-key: topology-value
EOF
```

2. The existing pools can be labelled using the plugin. This will not affect any of the pre-existing volumes.

```
kubectl mayastor label pool pool-on-node-1 topology-key=topology-value -n openebs
```

**YAML**
```text
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: INSERT_POOL_NAME_HERE
  namespace: openebs
spec:
  node: INSERT_WORKERNODE_HOSTNAME_HERE
  disks: ["INSERT_DEVICE_URI_HERE"]
```

:::info
When using the examples given as guides to creating your own pools, remember to replace the values for the fields "metadata.name", "spec.node" and "spec.disks" as appropriate to your cluster's intended configuration. Note that whilst the "disks" parameter accepts an array of values, the current version of Replicated PV Mayastor supports only one disk device per pool.
:::

:::note
Existing schemas in CR definitions (in older versions) will be updated from v1alpha1 to v1beta1 after upgrading to Replicated PV Mayastor 2.4 and above. To resolve errors encountered about the upgrade, see the [Troubleshooting - Replicated Storage documentation](../../../troubleshooting/troubleshooting-replicated-storage.md).
:::

## Verify Pool Creation and Status

The status of DiskPools may be determined by reference to their cluster CRs. Available, healthy pools should report their State as `online`. Verify that the expected number of pools has been created and that they are online.

**Command**
```text
kubectl get dsp -n openebs
```

**Example Output**
```text
NAME             NODE          STATE    POOL_STATUS   CAPACITY      USED   AVAILABLE
pool-on-node-1   node-1-14944  Created   Online        10724835328   0      10724835328
pool-on-node-2   node-2-14944  Created   Online        10724835328   0      10724835328
pool-on-node-3   node-3-14944  Created   Online        10724835328   0      10724835328
```

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](../configuration/rs-create-storageclass.md)
- [Storage Class Parameters](../configuration/rs-storage-class-parameters.md)
- [Topology Parameters](../configuration/rs-topology-parameters.md)
- [Enable RDMA for Volume Targets](../configuration/rs-rdma.md)
- [Deploy an Application](../configuration/rs-deployment.md)