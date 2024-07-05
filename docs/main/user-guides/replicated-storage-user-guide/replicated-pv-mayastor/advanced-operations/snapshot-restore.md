---
id: snapshot-restore
title: Volume Restore from Snapshot
keywords:
 - Snapshot Restore
description: This guide explains about the Snapshot Restore feature.
---

Volume restore from an existing snapshot will create an exact replica of a storage volume captured at a specific point in time. They serve as an essential tool for data protection, recovery, and efficient management in Kubernetes environments. This article provides a step-by-step guide on how to create a volume restore.

:::info
A volume snapshot transcends into taking snapshots on each of the volume's replicas for consistency. For instance, a snapshot on a source volume with three replicas (repl=3) results in snapshot-ting all three replicas of the source volume.
Similarly, the replica count of the new volume must be less than or equal to the available replica snapshot count of the corresponding source volume when a restore is initiated, or a new volume is provisioned by specifying the source volume's snapshot as the source.

- Do the following command to find the number of available replicas of a volume:

**Command**

```
kubectl mayastor get volume-replica-topology ec4e66fd-3b33-4439-b504-d49aba53da26         
```

**Output**

```
ID                                    NODE         POOL    STATUS  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD 
5de77b1e-56cf-47c9-8fca-e6a5f316684b  io-engine-1  pool-1  Online  12MiB     0 B        12MiB      <none>        <none>  <none> 
78fa3173-175b-4339-9250-47ddccb79201  io-engine-2  pool-2  Online  12MiB     0 B        12MiB      <none>        <none>  <none> 
7b4e678a-e607-40e3-afce-b3b7e99e511a  io-engine-3  pool-3  Online  12MiB     8MiB       0 B        <none>        <none>  <none> 
```

- Do the following command to check the replica snapshot information for volume snapshots:

**Command**

```
kubectl mayastor get volume-snapshot-topology --volume ec4e66fd-3b33-4439-b504-d49aba53da26
```

**Output**

```
SNAPSHOT-ID                           ID                                    POOL    SNAPSHOT_STATUS  SIZE      ALLOCATED_SIZE  SOURCE 
25823425-41fa-434a-9efd-a356b70b5d7c  cb8d200b-c7d8-4ccd-bb62-78f903e444e4  pool-2  Online           12582912  12582912        78fa3173-175b-4339-9250-47ddccb79201 
└─                                    b09f4097-85fa-41c9-a2f8-56198641258d  pool-1  Online           12582912  12582912        5de77b1e-56cf-47c9-8fca-e6a5f316684b 
 

25823425-41fa-434a-9efd-a356b70b5d7d  1b69b3ca-8f08-4889-8f90-1a428e088c46  pool-2  Online           12582912  0               78fa3173-175b-4339-9250-47ddccb79201 
├─                                    1837b17a-9773-437c-b926-dda3272e3c60  pool-1  Online           12582912  0               5de77b1e-56cf-47c9-8fca-e6a5f316684b 
└─                                    1f8827e7-9674-4879-8f29-b15752aef902  pool-3  Online           12582912  8388608         7b4e678a-e607-40e3-afce-b3b7e99e511a 
```
:::

## Prerequisites

### Step 1: Create a StorageClass 

To begin, you will need to create a StorageClass that defines the properties of the snapshot to be restored. Refer to [StorageClass Parameters](../../replicated-pv-mayastor/rs-configuration.md#storage-class-parameters) for more details. Use the following command to create the StorageClass:

:::info
Currently, restores are thin-provisioned volumes created from a snapshot, Therefore, the storage class for the restored volume must also specify `thin: "true"`.
:::

**Command**

```
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3-restore
parameters:
  protocol: nvmf
  repl: "3"
  thin: "true"
provisioner: io.openebs.csi-mayastor
EOF
```

**YAML**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3-restore
parameters:
  protocol: nvmf
  repl: "3"
  thin: "true"
provisioner: io.openebs.csi-mayastor
```

:::note
The name of the StorageClass, which, in the example above, is **mayastor-3-restore**.
:::

### Step 2: Create a Snapshot 

You need to create a volume snapshot before proceeding with the restore. Follow the steps outlined in [this guide](snapshot.md) to create a volume snapshot.

:::note
The snapshot's name, for example, **mayastor-pvc-snap**.
:::

## Create a Volume Restore of the Existing Snapshot

After creating a snapshot, you can create a PersistentVolumeClaim (PVC) from it to generate the volume restore. Use the following command:

**Command**

```
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restore-pvc //add a name for your new volume
spec:
  storageClassName: mayastor-3-restore //add your storage class name 
  dataSource:
    name: mayastor-pvc-snap //add your volumeSnapshot name
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
 EOF     
 ```

**YAML**

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restore-pvc //add a name for your new volume
spec:
  storageClassName: mayastor-3-restore //add your storage class name 
  dataSource:
    name: mayastor-pvc-snap //add your volumeSnapshot name
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```   
      
By running this command, you create a new PVC named `restore-pvc` based on the specified snapshot. The restored volume will have the same data and configuration as the original volume had at the time of the snapshot.
