---
id: velerobrfs
title: Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem
keywords: 
  - Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem
  - Velero Backup and Restore
  - FileSystem
description: In this document, you learn about Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem.
---

# Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem

Using Velero for backup and restore operations with Replicated PV Mayastor snapshots combines the strengths of both tools, providing a robust, efficient, and easy-to-manage solution for protecting your Kubernetes applications and data. The integration leverages the high performance and efficiency of Replicated PV Mayastor snapshots with the comprehensive backup capabilities of Velero, ensuring your data is always protected and recoverable.

Velero can support any volume provider that has a Container Storage Interface (CSI) driver with snapshotting capability.

In this guide, we will utilize Velero to capture a backup of a sample Nginx application with a Replicated PV Mayastor from a cluster, transfer the backup to an object store, and restore it on a different cluster.

## Requirements

### Replicated PV Mayastor

Replicated PV Mayastor CSI supports volume snapshots, which are essential for backup and recovery operations. By using Velero with Replicated PV Mayastor CSI, you can take advantage of Velero's robust backup and restore capabilities to create point-in-time snapshots of your volumes. This is critical for disaster recovery and data protection strategies.

Make sure that Replicated PV Mayastor has been installed, pools have been configured, and applications have been deployed before proceeding to the next step. Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md#installation-via-helm) for more details.

### Velero with CSI Snapshot Support

Velero is an open-source tool used for backup, restore, and migration of Kubernetes cluster resources and persistent volumes. It allows users to schedule regular backups of their Kubernetes resources and persistent volumes, and to restore those resources when needed.

When CSI snapshots are enabled, Velero leverages the Kubernetes CSI driver to create snapshots of persistent volumes. These snapshots can be used to restore data to the same or different Kubernetes clusters.

## Details of Setup

### Install Velero with CSI Snapshot Support Enabled

Install Velero (V1.13.2) with the `velero-plugin-for-csi` and with any S3 object storage. In this example, we are using the Google cloud bucket as our BackupStorageLocation. Refer to [Velero Documentation](https://velero.io/plugins/) for instructions on setting up the BackupStorageLocation.

As an example we will be using Google Cloud Platform (GCP) and OpenEBS.

1. Install Velero.

```
velero install --provider gcp --plugins velero/velero-plugin-for-gcp:v1.10.0,velero/velero-plugin-for-csi:v0.7.0  --use-node-agent --bucket velero-openebs --secret-file ./credentials-velero --use-volume-snapshots=true --features=EnableCSI
```

2. Once you have installed Velero, verify that Velero has installed correctly.

**Command**

```
kubectl get pods -n velero
```

**Output**

```
NAME                      READY   STATUS    RESTARTS   AGE
node-agent-9b9gz          1/1     Running   0          175m
node-agent-dlrzt          1/1     Running   0          175m
node-agent-q47cq          1/1     Running   0          175m
velero-6b9b99494b-rkppw   1/1     Running   0          20h
```

3. Verify the backup and snapshot storage location.

  - Use the following command to verify the backup:

  **Command**

  ```
  kubectl get backupstoragelocation -n velero
  ```

  **Output**

  ```
  NAME      PHASE       LAST VALIDATED   AGE   DEFAULT
  default   Available   34s              20h   true
  ```

  - Use the following command to verify the snapshot storage location:

  **Command**

  ```
  velero snapshot-location get
  ```

  **Output**

  ```
  NAME      PROVIDER
  default   gcp
  ```

### Deploy the Application with CSI Backed Volumes

Before installing the application with CSI backed volumes, install the storage class and the volume snapshot class for the OpenEBS CSI driver by applying the below yaml to your cluster. Refer to the [Replicated PV Mayastor Configuration Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#create-replicated-pv-mayastor-storageclasss) for more details.

:::info
Volume snapshots for multi-replicas volume is supported only from OpenEBS v4.1. The annotation `velero.io/csi-volumesnapshot-class: "true"` must be added to the volume snapshot class or the Velero backup will fail.
:::

**YAML**

```
---
kind: VolumeSnapshotClass
apiVersion: snapshot.storage.k8s.io/v1
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    velero.io/csi-volumesnapshot-class: "true"
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3-thin
parameters:
  protocol: nvmf
  repl: "3"
  thin: "true"
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
volumeBindingMode: Immediate
```

In this example, We have deployed a sample Nginx test application (with volume mode as file-system) for backup and restore.

**Command**

```
kubectl get pods -n mayastor-app
```

**Output**

```
NAME   READY   STATUS    RESTARTS   AGE
test   1/1     Running   0          63m
```

**Sample Data**

```
kubectl exec -it  test -n mayastor-app -- bash
root@test:/# cd /volume
root@test:/volume# cat abc
Mayastor velero Backup and restore
root@test:/volume# exit
exit
```

### Backup using Velero

- Use the following command to create a Velero backup:

**Command**

```
velero backup create my-fs-backup --snapshot-volumes --include-namespaces=mayastor-app --volume-snapshot-locations=default --storage-location=default --snapshot-move-data
```

**Output**

```
Backup request "my-fs-backup" submitted successfully.
Run `velero backup describe my-fs-backup` or `velero backup logs my-fs-backup` for more details.
```

- Use the following command to verify the backup status:

**Command**

```
velero backup get
```

**Output**

```
NAME         STATUS     ERRORS  WARNINGS  CREATED                        EXPIRES  STORAGE LOCATION   SELECTOR
my-fs-backup Completed  0       0         2024-07-30 08:48:12 +0000 UTC  29d      default            <none>
```

**Command**

```
kubectl get datauploads.velero.io -A
```

**Output**

```
NAMESPACE  NAME                STATUS     STARTED  BYTES DONE  TOTAL BYTES  STORAGE LOCATION  AGE    NODE
velero     my-fs-backup-z9vrj  Completed  2m10s    35          35           default           2m10s  worker-velero-1
```

:::important
In order to ensure that Velero can access the previously saved backups, it is recommended that you install Velero on the target cluster with the same values for the BUCKET-NAME and SECRET-FILENAME placeholders as you did originally. Also, make sure you have Replicated PV Mayastor already installed and that pools and storageclass have been configured.
:::

- Use the following command to verify the backup on target cluster:

**Command**

```
velero backup get
```

**Output**

```
NAME          STATUS      ERRORS   WARNINGS   CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
my-fs-backup  Completed   0        0          2024-07-30 08:48:12 +0000 UTC   29d       default            <none>
```

### Restore using Velero

- Use the following command to restore on target cluster:

**Command**

```
velero restore create my-fs-restore --from-backup my-fs-backup --restore-volumes=true --namespace-mappings mayastor-app:mayastor-app-restore
```

**Output**

```
Restore request "my-fs-restore" submitted successfully.
Run `velero restore describe my-fs-restore` or `velero restore logs my-fs-restore` for more details.
```

:::note
This is being restored on the target cluster in the namespace: `mayastor-app-restore`.
:::

- Use the following command to verify the restore status:

**Command**

```
velero restore get
```

**Ouput**

```
NAME           BACKUP        STATUS     STARTED                        COMPLETED                      ERRORS  WARNINGS   CREATED    SELECTOR
my-fs-restore  my-fs-backup  Completed  2024-07-30 08:56:25 +0000 UTC  2024-07-30 08:57:11 +0000 UTC  0       1          2024-07-30 08:56:25 +0000 UTC   <none>
```

**Command**

```
kubectl get datadownloads.velero.io -A
```

**Output**

```
NAMESPACE   NAME                   STATUS      STARTED   BYTES DONE   TOTAL BYTES   STORAGE LOCATION   AGE   NODE
velero      my-fs-restore-2s4w5    Completed   56s       35           35            default            56s   worker-restore-1
```

- Use the following command to validate Nginx Application restored on target cluster:

**Command**

```
kubectl get pods -n mayastor-app-restore
```

**Output**

```
NAME   READY   STATUS    RESTARTS   AGE
test   1/1     Running   0          2m20s
```

**Command**

```
kubectl get pvc -n mayastor-app-restore
```

**Output**

```
NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
ms-volume-claim   Bound    pvc-d1f5eddc-289b-4b7e-a61e-eaccce0f0d71   1Gi        RWO            mayastor-3-thin   2m25s
```

- Validate the data on target.

**Sample Data**

```
kubectl exec -it test -n mayastor-app-restore -- bash
root@test:/# cd volume/
root@test:/volume# cat abc
Mayastor velero Backup and restore
root@test:/volume# exit
exit
```

The `fs data` has been restored to the target cluster.

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](../openebs-on-kubernetes-platforms/microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](../openebs-on-kubernetes-platforms/talos.md)
- [Replicated PV Mayastor Installation on Google Kubernetes Engine](../openebs-on-kubernetes-platforms/gke.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)