---
id: velerobrrbv
title: Velero Backup and Restore using Replicated PV Mayastor Snapshots - Raw Block Volumes
keywords: 
  - Velero Backup and Restore using Replicated PV Mayastor Snapshots - Raw Block Volumes
  - Velero Backup and Restore
  - Raw Block Volumes
description: In this document, you learn about Velero Backup and Restore using Replicated PV Mayastor Snapshots - Raw Block Volumes.
---

# Velero Backup and Restore using Replicated PV Mayastor Snapshots - Raw Block Volumes

Using Velero for backup and restore operations with Replicated PV Mayastor snapshots combines the strengths of both tools, providing a robust, efficient, and easy-to-manage solution for protecting your Kubernetes applications and data. The integration leverages the high performance and efficiency of Replicated PV Mayastor snapshots with the comprehensive backup capabilities of Velero, ensuring your data is always protected and recoverable.

Velero can support any volume provider that has a Container Storage Interface (CSI) driver with snapshotting capability.

In this guide, we will utilize Velero to create a backup of a sample Nginx application with a Replicated PV Mayastor from a cluster, transfer the backup to an object store, and restore it on a different cluster.

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

1. Install Velero with a privileged node agent by utilizing the `--privileged-node-agent` to take raw block volume backups. 

```
velero install --provider gcp --plugins velero/velero-plugin-for-gcp:v1.10.0,velero/velero-plugin-for-csi:v0.7.0  --use-node-agent --bucket velero-openebs --secret-file ./credentials-velero --use-volume-snapshots=true --features=EnableCSI --privileged-node-agent
```

2. Once you have installed Velero, verify that Velero has installed correctly.

**Command**

```
kubectl get pods -n velero
```

**Output**

```
NAME                      READY   STATUS    RESTARTS   AGE
node-agent-5pfg6          1/1     Running   0          58s
node-agent-5q5mg          1/1     Running   0          58s
node-agent-mxfwr          1/1     Running   0          58s
velero-6b9b99494b-kgvpk   1/1     Running   0          58s
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
  default   Available   8s               90s   true
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

In this example, We have deployed a sample Nginx test application (with volume mode as block) for backup and restore.

**PVC with Volume Mode as Block**

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim-block
  namespace: mayastor-app-block
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: mayastor-3-thin
  volumeMode: Block
```

**Mounting Raw Block Volumes to Pod**

```
kind: Pod
apiVersion: v1
metadata:
  namespace: mayastor-app-block
  name: test-block
spec:
  nodeSelector:
    kubernetes.io/os: linux
  containers:
    - image: nginx
      name: nginx
      command: [ "sleep", "1000000" ]
      volumeDevices:
        - name: claim
          devicePath: "/dev/sdm"
  volumes:
    - name: claim
      persistentVolumeClaim:
        claimName: ms-volume-claim-block
```

**Command**

```
kubectl get pods -n mayastor-app-block
```

**Output**

```
NAME         READY   STATUS    RESTARTS   AGE
test-block   1/1     Running   0          10s
```

**Command**

```
kubectl get pvc -n mayastor-app-block
```

**Output**

```
NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
ms-volume-claim-block   Bound    pvc-c9b2160a-6b26-4176-8478-f616267204aa   1Gi        RWO            mayastor-3-thin   5m34s
```

**Sample Data**

```
root@master-velero:~# kubectl exec -it test-block -n mayastor-app-block -- bash
root@test-block:/# cd /dev
root@test-block:/dev# echo Mayastor  >/dev/sdm
root@test-block:/dev# dd if=/dev/sdm bs=1 count=8
Mayastor8+0 records in
8+0 records out
8 bytes copied, 5.3903e-05 s, 148 kB/s
root@test-block:/dev#
```

### Backup using Velero

- Use the following command to create a Velero backup:

**Command**

```
velero backup create my-backup-raw-block --snapshot-volumes --include-namespaces=mayastor-app-block --volume-snapshot-locations=default --storage-location=default --snapshot-move-data
```

**Output**

```
Backup request "my-backup-raw-block" submitted successfully.
Run `velero backup describe my-backup-raw-block` or `velero backup logs my-backup-raw-block` for more details.
```

- Use the following command to verify the backup status:

**Command**

```
velero backup get
```

**Output**

```
NAME                  STATUS      ERRORS   WARNINGS   CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
my-backup-raw-block   Completed   0        0          2024-07-30 10:07:33 +0000 UTC   29d       default            <none>
```

**Command**

```
kubectl get datauploads.velero.io -A
```

**Output**

```
NAMESPACE   NAME                        STATUS      STARTED   BYTES DONE   TOTAL BYTES   STORAGE LOCATION   AGE     NODE
velero      my-backup-raw-block-chjz2   Completed   2m20s     1068481536   1068481536    default            2m20s   worker-velero-1
```

- Use the following command to verify the backup on target cluster:

**Command**

```
velero backup get
```

**Output**

```
NAME                  STATUS      ERRORS   WARNINGS   CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
my-backup-raw-block   Completed   0        0          2024-07-30 10:07:33 +0000 UTC   29d       default            <none>
```

### Restore using Velero

:::important
In order to ensure that Velero can access the previously saved backups, it is recommended that you install Velero on the target cluster with the same values for the BUCKET-NAME and SECRET-FILENAME placeholders as you did originally. Also, make sure you have Replicated PV Mayastor already installed and that pools and storageclass have been configured.
:::

- Use the following command to restore on target cluster:

**Command**

```
velero restore create my-raw-block-restore --from-backup my-backup-raw-block --restore-volumes=true --namespace-mappings mayastor-app-block:mayastor-app-restore-block
```

**Output**

```
Restore request "my-raw-block-restore" submitted successfully.
Run `velero restore describe my-raw-block-restore` or `velero restore logs my-raw-block-restore` for more details.
```

:::note
This is being restored on the target cluster in the namespace: `mayastor-app-restore-block`.
:::

- Use the following command to verify the restore status:

**Command**

```
velero restore get
```

**Ouput**

```
AME                   BACKUP                STATUS      STARTED                         COMPLETED                       ERRORS   WARNINGS   CREATED                         SELECTOR
my-raw-block-restore   my-backup-raw-block   Completed   2024-07-30 10:11:53 +0000 UTC   2024-07-30 10:13:14 +0000 UTC   0        1          2024-07-30 10:11:53 +0000 UTC   <none>
```

**Command**

```
kubectl get datadownloads.velero.io -A
```

**Output**

```
NAMESPACE   NAME                         STATUS      STARTED   BYTES DONE   TOTAL BYTES   STORAGE LOCATION   AGE   NODE
velero      my-raw-block-restore-h8rlw   Completed   84s       1068481536   1068481536    default            84s   worker-restore-1
```

- Use the following command to validate Nginx Application restored on target cluster:

**Command**

```
kubectl get pods -n mayastor-app-restore-block
```

**Output**

```
NAME         READY   STATUS    RESTARTS   AGE
test-block   1/1     Running   0          107s
```

**Command**

```
kubectl get pvc -n mayastor-app-restore-block
```

**Output**

```
NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
ms-volume-claim-block   Bound    pvc-8e030156-ed8b-46ba-9df4-629cda2ef697   1Gi        RWO            mayastor-3-thin   2m20s
```

- Validate the data on target.

**Sample Data**

```
kubectl exec -it test-block -n mayastor-app-restore-block -- bash
root@test-block:/# dd if=/dev/sdm bs=1 count=8
Mayastor8+0 records in
8+0 records out
8 bytes copied, 0.000104084 s, 76.9 kB/s
root@test-block:/# cd /dev
root@test-block:/dev# ls -lrt sdm
brw-rw---- 1 root disk 259, 1 Jul 30 10:13 sdm
root@test-block:/dev#
```

The `raw block data` has been restored to the target cluster.

## See Also

- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](velero-br-fs.md)
- [Replicated PV Mayastor Installation on MicroK8s](../openebs-on-kubernetes-platforms/microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](../openebs-on-kubernetes-platforms/talos.md)
- [Replicated PV Mayastor Installation on Google Kubernetes Engine](../openebs-on-kubernetes-platforms/gke.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)