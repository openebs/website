---
id: volume-snapshots
title: Volume Snapshots
keywords:
 - Volume snapshots
description: This guide explains about the Volume snapshots feature.
---
**Volume Snapshots** are copies of a persistent volume at a specific point in time. They can restore a volume to a previous state or create a new volume. Replicated PV Mayastor provides support for industry-standard copy-on-write (COW) snapshots, which is a popular methodology for taking snapshots by keeping track of changed blocks.
Replicated PV Mayastor incremental snapshot capability enhances data migration and portability in Kubernetes clusters across different cloud providers or data centers. Using standard kubectl commands, you can seamlessly perform operations on snapshots and clones in a fully Kubernetes-native manner.

Use cases for volume snapshots include:

- Efficient replication for backups
- Utilization of clones for troubleshooting
- Development against a read-only copy of data

Volume snapshots allow the creation of read-only incremental copies of volumes, enabling you to maintain a history of your data. These volume snapshots possess the following characteristics:
- **Consistency**: The data stored within a snapshot remains consistent across all replicas of the volume, whether local or remote.
- **Immutability**: Once a snapshot is successfully created, the data contained within it cannot be modified.

Currently, Replicated PV Mayastor supports the following operations related to volume snapshots:

1. Creating a snapshot for a PVC
2. Listing available snapshots for a PVC
3. Deleting a snapshot for a PVC

## Prerequisites

Install and configure Replicated PV Mayastor by following the steps given in the [Installing OpenEBS documentation](../rs-installation.md) and create disk pools.

**Command**

```
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

**YAML**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  protocol: nvmf
  repl: "3"
provisioner: io.openebs.csi-mayastor
```

3. Create a PVC by following the steps given in the [Deploy a test Application documentation](../../../../quickstart-guide/deploy-a-test-application.md#create-a-persistentvolumeclaim) and check if the status of the PVC is **Bound**.

**Command**
```
kubectl get pvc
```

**Example Output**
```
NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
ms-volume-claim     Bound    pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b   1Gi        RWO            mayastor-3       15s
```

:::note
Copy the PVC name, for example, `ms-volume-claim`.
:::

4. Create an application by following the instructions provided in the [Deploy an Application documentation](../rs-deployment.md).
 
## Create a Snapshot

You can create a snapshot (with or without an application) using the PVC.

Follow the steps below to create a volume snapshot:

### Step 1: Create a Kubernetes VolumeSnapshotClass object

**Command**

```
cat <<EOF | kubectl create -f -
kind: VolumeSnapshotClass
apiVersion: snapshot.storage.k8s.io/v1
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
EOF
```

**YAML**

```
kind: VolumeSnapshotClass
apiVersion: snapshot.storage.k8s.io/v1
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
```

| Parameters | Type | Description|
| -------- | ---- | -------- |
| **Name**| String | Custom name of the snapshot class|
| **Driver** | String | CSI provisioner of the storage provider being requested to create a snapshot (io.openebs.csi-mayastor)|

**Apply VolumeSnapshotClass Details**

**Command**

```
kubectl apply -f class.yaml
```

**Example Output**

```
volumesnapshotclass.snapshot.storage.k8s.io/csi-mayastor-snapshotclass created
```

### Step 2: Create the Snapshot

**Command**

```
cat <<EOF | kubectl create -f -
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: mayastor-pvc-snap
spec:
  volumeSnapshotClassName: csi-mayastor-snapshotclass
  source:
    persistentVolumeClaimName: ms-volume-claim   
EOF
```

**YAML**

```
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: mayastor-pvc-snap
spec:
  volumeSnapshotClassName: csi-mayastor-snapshotclass
  source:
    persistentVolumeClaimName: ms-volume-claim   
```

| Parameters | Type | Description|
| -------- | ---- | -------- |
| **Name** | String | Name of the snapshot | 
| **VolumeSnapshotClassName** | String | Name of the created snapshot class | 
| **PersistentVolumeClaimName** | String | Name of the PVC. Example- `ms-volume-claim` | 

**Apply the Snapshot**

**Command**

```
kubectl apply -f snapshot.yaml
```

**Example Output**

```
volumesnapshot.snapshot.storage.k8s.io/mayastor-pvc-snap created
```

:::note
When a snapshot is created on a **thick**-provisioned volume, the storage system automatically converts it into a **thin**-provisioned volume.
:::

## List Snapshots 

To retrieve the details of the created snapshots, use the following command:

**Command**

```
kubectl get volumesnapshot 
```

**Example Output**

```
NAME                  READYTOUSE   SOURCEPVC         SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS                SNAPSHOTCONTENT                                    CREATIONTIME   AGE
mayastor-pvc-snap   true         ms-volume-claim                           1Gi           csi-mayastor-snapshotclass   snapcontent-174d9cd9-dfb2-4e53-9b56-0f3f783518df   57s            57s
```

**Command**

```
kubectl get volumesnapshotcontent
```

**Example Output**

```
NAME                                               READYTOUSE   RESTORESIZE   DELETIONPOLICY   DRIVER                    VOLUMESNAPSHOTCLASS          VOLUMESNAPSHOT        VOLUMESNAPSHOTNAMESPACE   AGE
snapcontent-174d9cd9-dfb2-4e53-9b56-0f3f783518df   true         1073741824    Delete           io.openebs.csi-mayastor   csi-mayastor-snapshotclass   mayastor-pvc-snap   default                   87s
```

## Delete a Snapshot

To delete a snapshot, use the following command:

**Command**

```
kubectl delete volumesnapshot mayastor-pvc-snap
```

**Example Output**

```
volumesnapshot.snapshot.storage.k8s.io "mayastor-pvc-snap" deleted
```

## Filesystem Consistent Snapshot

The filesystem consistent snapshot ensures that the snapshot filesystem remains consistent while taking a volume snapshot. Before taking the volume snapshot, the csi-node plugin runs the FIFREEZE and FITHAW ioctls on the underlying filesystem to flush and quiesce any active IOs. After the snapshot creation process, the IOs are resumed.

By default, mayastor volume snapshots are fs consistent. This means that if any part of creating a snapshot or an ioctl fails, the whole process will fail and be tried again by the mayastor CSI-controller without any user intervention.

You can disable the fs consistency feature using the VolumeSnapshotClass parameter `quiesceFS`. See the below example to disable the feature:

```
kind: VolumeSnapshotClass
apiVersion: snapshot.storage.k8s.io/v1
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
parameters:
  quiesceFs: none
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
```