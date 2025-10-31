---
id: lvm-snapshot-restore
title: Volume Restore from Snapshot
keywords:
 - Snapshot Restore
description: This guide explains about the Snapshot Restore feature.
---

## Overview

Volume restore from an existing snapshot will create a storage volume captured at a specific point in time. They serve as an essential tool for data protection, recovery, and efficient management in Kubernetes environments. This document provides step-by-step instructions to restore a volume from a previously created snapshot using Local PV LVM.

## Requirements

Before performing the restore operation, ensure the following requirements are met:

- A volume snapshot has already been created.
- A compatible StorageClass is available for the restore operation.
- A snapshot has been created for the source volume. Follow the steps outlined in the [Volume Snapshots Documentation](lvm-snapshot.md) to create a volume snapshot.
- Only thin snapshot restores are supported. To verify whether a snapshot is thin or thick, describe the LVM snapshot Custom Resource (CR) and check the `spec.thinProvision` field.
- The restore volume request capacity must match the snapshot logical volume (LV) size. To verify snapshot LV size, describe LVM snapshot CR and check the snapshot LV size in `status.lvSize` field.
- The Local PV LVM volume group name must match the snapshot’s volume group (`spec.volGroup`).

**Example: Local PV LVM Snapshot CR**

```yaml
apiVersion: local.openebs.io/v1alpha1
kind: LVMSnapshot
metadata:
  creationTimestamp: "2025-10-27T09:44:16Z"
  finalizers:
  - lvm.openebs.io/finalizer
  generation: 2
  labels:
    kubernetes.io/nodename: worker-node-1
    openebs.io/persistent-volume: pvc-dca183ae-4096-48fc-bf08-740d1c03d583
  name: snapshot-cc82975a-c652-41fa-892a-744eb04ccbd1
  namespace: openebs
  resourceVersion: "285569"
  uid: 840781e1-11e2-46af-b9de-eb88443e8cde
spec:
  ownerNodeID: worker-node-1
  thinProvision: true
  volGroup: lvmvg
status:
  lvSize: 5Gi
  state: Ready
```


## Creating a Volume Restore from an Existing Snapshot

After creating a snapshot, you can create a PersistentVolumeClaim (PVC) from it to generate the volume restore. Use the following command:

After a snapshot is created, you can create a new volume (clone) from it. The restored volume will contain the same data as the original volume at the time the snapshot was taken.

To perform a restore, create a PersistentVolumeClaim (PVC) manifest that references the snapshot as a data source.

**Command: Create a PVC from an Existing VolumeSnapshot**

```
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: lvmpv-snap-restore-pvc   # Specify a name for the restored volume
spec:
  storageClassName: lvm-snapshot-restore-sc   # Specify your StorageClass
  dataSource:
    name: lvmpv-snap   # Specify your VolumeSnapshot name
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
EOF     
 ```

**Example: PVC YAML for Volume Restore**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: lvmpv-snap-restore-pvc //add a name for your new volume
spec:
  storageClassName: lvm-snapshot-restore-sc //add your storage class name 
  dataSource:
    name: lvmpv-snap //add your volumeSnapshot name
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```   
      
Applying the above YAML creates a new volume from the snapshot `lvmpv-snap`.
The restored volume is scheduled on the same node as the original volume and retains the same data and properties that existed when the snapshot was taken.

:::note
- The restored PVC size must match the snapshot LV size (`status.lvSize`).
- The restored volume must belong to the same volume group (`spec.volGroup`).
- Ensure that the restored volume is thin-provisioned.
- If a separate StorageClass is used for the restore operation, verify it meets the above criteria.
:::

## Verifying the Restored Volume (PVC)

Verify the restored PVC.

**Command**

```
kubectl get pvc -n openebs
```

**Sample Output**

```
NAME                     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS         AGE
lvmpv-origin-pvc         Bound    pvc-dca183ae-4096-48fc-bf08-740d1c03d583   5Gi        RWO            lvmpv-sc-2xz5t       46s
lvmpv-snap-restore-pvc   Bound    pvc-e9c895c0-ddbc-44ea-8f90-7fe81ba723bb   5Gi        RWO            lvm-snapshot-restore-sc   30s
```

The restored PVC (lvmpv-snap-restore-pvc) has been successfully created and bound.

## Verifying the Restored Local PV LVM Volume

Verify the Local PV LVM volumes.

**Command**

```
kubectl get lvmvolume -n openebs
```

**Sample Output**

```
NAME                                       VOLGROUP   NODE             SIZE         STATUS   AGE
pvc-dca183ae-4096-48fc-bf08-740d1c03d583   lvmvg      worker-node-1    5368709120   Ready    82s
pvc-e9c895c0-ddbc-44ea-8f90-7fe81ba723bb   lvmvg      worker-node-1    5368709120   Ready    66s
```

The restored Local PV LVM volume (`pvc-e9c895c0-ddbc-44ea-8f90-7fe81ba723bb`) is created and its status is Ready.

**Example: Restored LVM Volume CR**

```yaml
apiVersion: local.openebs.io/v1alpha1
kind: LVMVolume
metadata:
  name: pvc-e9c895c0-ddbc-44ea-8f90-7fe81ba723bb
  namespace: openebs
  labels:
    kubernetes.io/nodename: worker-node-1
spec:
  capacity: "5368709120"
  ownerNodeID: worker-node-1
  shared: "no"
  source: snapshot-cc82975a-c652-41fa-892a-744eb04ccbd1
  thinProvision: "yes"
  vgPattern: ^lvmvg$
  volGroup: lvmvg
status:
  state: Ready
```

:::note
- To prevent write failures when the thin pool becomes full, enable the following parameters in the `lvm.conf` file:
  - `thin_pool_autoextend_threshold`
  - `thin_pool_autoextend_percent`
- Ensure that the Volume Group (VG) has sufficient free capacity. Auto-extend will not function correctly if the VG lacks space.