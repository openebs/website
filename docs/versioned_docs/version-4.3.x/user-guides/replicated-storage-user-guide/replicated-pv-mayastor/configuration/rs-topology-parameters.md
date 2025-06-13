---
id: rs-topology-parameters
title: Topology Parameters
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Configuration
 - Configuration
 - Topology Parameters
description: This guide describes the Topology Parameters for Replicated PV Mayastor.
---

# Topology Parameters

The topology parameters defined in storage class helps in determining the placement of volume replicas across different nodes/pools of the cluster. A brief explanation of each parameter is as follows.

:::note
We support only one type of topology parameter per storage class.
:::

## "nodeAffinityTopologyLabel"

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

## "nodeHasTopologyKey"

The parameter `nodeHasTopologyKey` will allow the placement of replicas on the nodes having a label whose key matches the key specified in the storage class.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
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

## "nodeSpreadTopologyKey"

The parameter `nodeSpreadTopologyKey` will allow the placement of replicas on the node that has label keys that are identical to the keys specified in the storage class but have different values.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
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

## "poolAffinityTopologyLabel"

The parameter `poolAffinityTopologyLabel` will allow the placement of replicas on the pool that exactly match the labels defined in the storage class.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
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

## "poolHasTopologyKey"

The parameter `poolHasTopologyKey` will allow the placement of replicas on the pool that has label keys same as the keys passed in the storage class.

**Command**
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-1
parameters:
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

## "stsAffinityGroup" 

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

## "cloneFsIdAsVolumeId"

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
- [Storage Class Parameters](../configuration/rs-storage-class-parameters.md)
- [Enable RDMA for Volume Targets](../configuration/rs-rdma.md)
- [Deploy an Application](../configuration/rs-deployment.md)