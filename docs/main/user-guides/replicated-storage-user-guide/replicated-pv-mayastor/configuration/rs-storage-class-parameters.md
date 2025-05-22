---
id: rs-storage-class-parameters
title: Storage Class Parameters
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Configuration
 - Configuration
 - Storage Class Parameters
description: This guide describes the Storage Class Parameters for Replicated PV Mayastor.
---

# Storage Class Parameters

Storage Class resource in Kubernetes is used to supply parameters to volumes when they are created. It is a convenient way of grouping volumes with common characteristics. All parameters take a string value. A brief explanation of each parameter is as follows.

:::warning
The Storage Class parameter `local` has been deprecated and is a breaking change in Replicated PV Mayastor version 2.0. Make sure that this parameter is not used.
:::

## "fsType"

A file system that will be used when mounting the volume. 
The supported file systems are **ext4**, **xfs** and **btrfs** and the default file system when not specified is **ext4**. We recommend using **xfs** that is considered to be more advanced and performant. 
Make sure the requested filesystem driver is installed on all worker nodes in the cluster before using it.

## "protocol"

The parameter `protocol` takes the value `nvmf`(NVMe over TCP protocol). It is used to mount the volume (target) on the application node.

## "repl"

The string value should be a number and the number should be greater than zero. The Replicated PV Mayastor control plane will try to keep always this many copies of the data if possible. If set to one then the volume does not tolerate any node failure. If set to two, then it tolerates one node failure. If set to three, then two node failures, etc.

## "thin"

The volumes can either be `thick` or `thin` provisioned. Adding the `thin` parameter to the StorageClass YAML allows the volume to be thinly provisioned. To do so, add `thin: true` under the `parameters` spec, in the StorageClass YAML. [Sample YAML](#create-replicated-pv-mayastor-storageclasss)
When the volumes are thinly provisioned, the user needs to monitor the pools, and if these pools start to run out of space, then either new pools must be added or volumes deleted to prevent thinly provisioned volumes from getting degraded or faulted. This is because when a pool with more than one replica runs out of space, Replicated PV Mayastor moves the largest out-of-space replica to another pool and then executes a rebuild. It then checks if all the replicas have sufficient space; if not, it moves the next largest replica to another pool, and this process continues till all the replicas have sufficient space.

:::info
The capacity usage on a pool can be monitored using [exporter metrics](../replicated-pv-mayastor/advanced-operations/monitoring.md#pool-metrics-exporter).
:::

The `agents.core.capacity.thin` spec present in the Replicated PV Mayastor helm chart consists of the following configurable parameters that can be used to control the scheduling of thinly provisioned replicas:

1. **poolCommitment** parameter specifies the maximum allowed pool commitment limit (in percent).
2. **volumeCommitment** parameter specifies the minimum amount of free space that must be present in each replica pool to create new replicas for an existing volume. This value is specified as a percentage of the volume size.
3. **volumeCommitmentInitial** minimum amount of free space that must be present in each replica pool to create new replicas for a new volume. This value is specified as a percentage of the volume size.

:::note
- By default, the volumes are provisioned as `thick`. 
- For a pool of a particular size, say 10 Gigabytes, a volume > 10 Gigabytes cannot be created, as Replicated PV Mayastor currently does not support pool expansion.
- The replicas for a given volume can be either all thick or all thin. The same volume cannot have a combination of thick and thin replicas.
:::

## "allowVolumeExpansion"

The parameter `allowVolumeExpansion` enables the expansion of PVs when using Persistent Volume Claims (PVCs). You must set the `allowVolumeExpansion` parameter to `true` in the StorageClass to enable the expansion of a volume. In order to expand volumes where volume expansion is enabled, edit the size of the PVC. Refer to the [Resize documentation](../replicated-pv-mayastor/advanced-operations/resize.md) for more details.

## Topology Parameters

The topology parameters defined in storage class helps in determining the placement of volume replicas across different nodes/pools of the cluster. A brief explanation of each parameter is as follows.

:::note
We support only one type of topology parameter per storage class.
:::

### "nodeAffinityTopologyLabel"

The parameter `nodeAffinityTopologyLabel` will allow the placement of replicas on the node that exactly matches the labels defined in the storage class.
For the case shown below, the volume replicas will be provisioned on `worker-node-1` and `worker-node-3` only as they match the labels specified under `nodeAffinityTopologyLabel` in storage class which is equal to zone=us-west-1.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "2"
  nodeAffinityTopologyLabel: |
    zone: us-west-1
provisioner: io.openebs.csi-mayastor
volumeBindingMode: Immediate
EOF
```

Apply the labels to the nodes using the below command:

**Command**
```text
kubectl mayastor label node worker-node-1 zone=us-west-1
kubectl mayastor label node worker-node-2 zone=eu-east-1
kubectl mayastor label node worker-node-3 zone=us-west-1
 ```

**Command (Get nodes)**
 ```text
kubectl mayastor get nodes -n openebs --show-labels
ID             GRPC ENDPOINT        STATUS  LABELS
worker-node-1  65.108.91.181:10124  Online  zone=eu-west-1
worker-node-3  65.21.4.103:10124    Online  zone=eu-east-1
worker-node-3  37.27.13.10:10124    Online  zone=us-west-1
```

### "nodeHasTopologyKey"

The parameter `nodeHasTopologyKey` will allow the placement of replicas on the nodes having a label whose key matches the key specified in the storage class.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "2"
  nodeHasTopologykey: |
    rack
provisioner: io.openebs.csi-mayastor
volumeBindingMode: Immediate
EOF
```

Apply the labels on the node using the below command:

**Command**
```text
 # kubectl mayastor label node worker-node-1 rack=1
 # kubectl mayastor label node worker-node-2 rack=2
 # kubectl mayastor label node worker-node-3 rack=2
 
 # kubectl mayastor get nodes -n openebs --show-labels
 ID             GRPC ENDPOINT        STATUS  LABELS
 worker-node-1  65.108.91.181:10124  Online  rack=1
 worker-node-3  65.21.4.103:10124    Online  rack=2
 worker-node-3  37.27.13.10:10124    Online  rack=2
```

In this case, the volume replicas will be provisioned on any two of the three nodes i.e. 
- `worker-node-1` and `worker-node-2` or 
- `worker-node-1` and `worker-node-3` or
- `worker-node-2` and `worker-node-3`
as the storage class has `rack` as the value for `nodeHasTopologyKey` that matches the label key of the node.

### "nodeSpreadTopologyKey"

The parameter `nodeSpreadTopologyKey` will allow the placement of replicas on the node that has label keys that are identical to the keys specified in the storage class but have different values.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "2"
  nodeSpreadTopologyKey: |
    zone
provisioner: io.openebs.csi-mayastor
volumeBindingMode: Immediate
EOF
```

Apply the labels to the nodes using the below command:

**Command**
```text
kubectl mayastor label node worker-node-1 zone=us-west-1
kubectl mayastor label node worker-node-2 zone=eu-east-1
kubectl mayastor label node worker-node-3 zone=us-west-1
 ```

**Command (Get nodes)**
 ```text
kubectl mayastor get nodes -n openebs --show-labels
ID             GRPC ENDPOINT        STATUS  LABELS
worker-node-1  65.108.91.181:10124  Online  zone=eu-west-1
worker-node-3  65.21.4.103:10124    Online  zone=eu-east-1
worker-node-3  37.27.13.10:10124    Online  zone=us-west-1
```

In this case, the volume replicas will be provisioned on the below given nodes i.e.
- `worker-node-1` and `worker-node-2` or
- `worker-node-2` and `worker-node-3`
as the storage class has `zone` as the value for `nodeSpreadTopologyKey` that matches the label key of the node but has a different value.

### "poolAffinityTopologyLabel"

The parameter `poolAffinityTopologyLabel` will allow the placement of replicas on the pool that exactly match the labels defined in the storage class.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "2"
  poolAffinityTopologyLabel: |
    zone: us-west-1
provisioner: io.openebs.csi-mayastor
volumeBindingMode: Immediate
EOF
```

Apply the labels to the pools using the below command:

**Command**
```text
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-0
  namespace: mayastor
spec:
  node: worker-node-0
  disks: ["/dev/sdb"]
  topology:
    labelled:
        zone: us-west-1
---
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-1
  namespace: mayastor
spec:
  node: worker-node-1
  disks: ["/dev/sdb"]
  topology:
    labelled:
        zone: us-east-1
---
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-2
  namespace: mayastor
spec:
  node: worker-node-2
  disks: ["/dev/sdb"]
  topology:
    labelled:
        zone: us-west-1
EOF
 ```

 **Command (Get filtered pools based on labels)**
 ```text
kubectl mayastor get pools -n openebs --selector zone=eu-west-1
ID             GRPC ENDPOINT        STATUS  LABELS
ID              DISKS                                                     MANAGED  NODE           STATUS  CAPACITY  ALLOCATED  AVAILABLE  COMMITTED
pool-on-node-0  aio:///dev/sdb?uuid=b7779970-793c-4dfa-b8d7-03d5b50a45b8  true     worker-node-0  Online  10GiB     0 B        10GiB      0 B
pool-on-node-2  aio:///dev/sdb?uuid=b7779970-793c-4dfa-b8d7-03d5b50a45b8  true     worker-node-2  Online  10GiB     0 B        10GiB      0 B

kubectl mayastor get pools -n openebs --selector zone=eu-east-1
ID             GRPC ENDPOINT        STATUS  LABELS
ID              DISKS                                                     MANAGED  NODE           STATUS  CAPACITY  ALLOCATED  AVAILABLE  COMMITTED
pool-on-node-1  aio:///dev/sdb?uuid=b7779970-793c-4dfa-b8d7-03d5b50a45b8  true     worker-node-1  Online  10GiB     0 B        10GiB      0 B
```

For the case shown above, the volume replicas will be provisioned on `pool-on-node-0` and `pool-on-node-3` only as they match the labels specified under `poolAffinityTopologyLabel` in the storage class that is equal to zone=us-west-1.

### "poolHasTopologyKey"

The parameter `poolHasTopologyKey` will allow the placement of replicas on the pool that has label keys same as the keys passed in the storage class.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "2"
  poolHasTopologykey: |
    zone
provisioner: io.openebs.csi-mayastor
volumeBindingMode: Immediate
EOF
```

**Command (Get filtered pools based on labels)**
 ```text
kubectl mayastor get pools -n openebs --selector zone=eu-west-1
ID             GRPC ENDPOINT        STATUS  LABELS
ID              DISKS                                                     MANAGED  NODE           STATUS  CAPACITY  ALLOCATED  AVAILABLE  COMMITTED
pool-on-node-0  aio:///dev/sdb?uuid=b7779970-793c-4dfa-b8d7-03d5b50a45b8  true     worker-node-0  Online  10GiB     0 B        10GiB      0 B
pool-on-node-2  aio:///dev/sdb?uuid=b7779970-793c-4dfa-b8d7-03d5b50a45b8  true     worker-node-2  Online  10GiB     0 B        10GiB      0 B

kubectl mayastor get pools -n openebs --selector zone=eu-east-1
ID             GRPC ENDPOINT        STATUS  LABELS
ID              DISKS                                                     MANAGED  NODE           STATUS  CAPACITY  ALLOCATED  AVAILABLE  COMMITTED
pool-on-node-1  aio:///dev/sdb?uuid=b7779970-793c-4dfa-b8d7-03d5b50a45b8  true     worker-node-1  Online  10GiB     0 B        10GiB      0 B
```

In this case, the volume replicas will be provisioned on any two of the three pools i.e.
- `pool-on-node-1` and `pool-on-node-2` or
- `pool-on-node-1` and `pool-on-node-3` or
- `pool-on-node-2` and `pool-on-node-3`
as the storage class has `zone` as the value for `poolHasTopologyKey` that matches with the label key of the pool.

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

#### Known Limitation
For multi-replica volumes that are part of an `stsAffinityGroup`, scaling down is permitted only up to two replicas. Reducing the replica count below two is not supported.

### "cloneFsIdAsVolumeId"

`cloneFsIdAsVolumeId` is a setting for volume clones/restores with two options: `true` and `false`. By default, it is set to `false`.
- When set to `true`, the created clone/restore's filesystem `uuid` will be set to the restore volume's `uuid`. This is important because some file systems, like XFS, do not allow duplicate filesystem `uuid` on the same machine by default.
- When set to `false`, the created clone/restore's filesystem `uuid` will be the same as the original volume `uuid`, but it will be mounted using the `nouuid` flag to bypass duplicate `uuid` validation.

:::note
This option needs to be set to true when using a `btrfs` filesystem, if the application using the restored volume is scheduled on the same node where the original volume is mounted, concurrently.
:::

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Create DiskPool(s)](../configuration/rs-create-diskpool.md)
- [Create StorageClass(s)](../configuration/rs-create-storageclass.md)
- [Topology Parameters](../configuration/rs-topology-parameters.md)
- [Enable RDMA for Volume Targets](../configuration/rs-rdma.md)
- [Deploy an Application](../configuration/rs-deployment.md)