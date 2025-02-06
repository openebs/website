---
id: rs-create-storageclass
title: Create Replicated PV Mayastor StorageClass(s)
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Configuration
 - Configuration
 - Create Replicated PV Mayastor StorageClass(s)
description: This guide will help you to create Replicated PV Mayastor StorageClass.
---

# Create StorageClass(s)

Replicated PV Mayastor dynamically provisions PersistentVolumes \(PVs\) based on StorageClass definitions created by the user. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. Refer [Storage Class parameters](#storage-class-parameters) for a detailed description of these parameters.
Most importantly StorageClass definition is used to control the level of data protection afforded to it (i.e. the number of synchronous data replicas that are maintained for purposes of redundancy). It is possible to create any number of StorageClass definitions, spanning all permitted parameter permutations.

We illustrate this quickstart guide with two examples of possible use cases; one which offers no data redundancy \(i.e. a single data replica\), and another having three data replicas.

:::info
Both the example YAMLs given below have [thin provisioning](#thin) enabled. You can modify these as required to match your own desired test cases, within the limitations of the cluster under test.
:::

## One Replica

**Example Command**
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

## Three Replica

**Example Command**
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
The default installation of Replicated PV Mayastor includes the creation of a StorageClass with the name `mayastor-single-replica`. The replication factor is set to 1. You may either use this StorageClass or create your own.
:::

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Create DiskPool(s)](../configuration/rs-create-diskpool.md)
- [Storage Class Parameters](../configuration/rs-storage-class-parameters.md)
- [Topology Parameters](../configuration/rs-topology-parameters.md)
- [Enable RDMA for Volume Targets](../configuration/rs-rdma.md)
- [Deploy an Application](../configuration/rs-deployment.md)