---
id: cloudnative-backup
title: OpenEBS VolumeSnapshots for CloudNativePG Backups
keywords: 
  - OpenEBS VolumeSnapshots for CloudNativePG Backups
  - VolumeSnapshots for CloudNativePG Backups
  - CloudNativePG Backups
description: In this document, you learn about how to use OpenEBS VolumeSnapshots to back up and restore PostgreSQL databases.
---

## Overview

As PostgreSQL deployments scale in Kubernetes environments, traditional logical backups such as `pg_dump` can become increasingly time-consuming and resource-intensive. These approaches often struggle to meet recovery time objectives (RTOs) for large or performance-sensitive databases.

OpenEBS VolumeSnapshots offer a more efficient alternative by capturing the state of persistent volumes at a specific point in time. This snapshot-based approach enables near-instant backups with minimal performance impact, making it well suited for cloud-native database workloads that require fast and reliable recovery.

By integrating OpenEBS VolumeSnapshots with CloudNativePG (CNPG), you can implement efficient, storage-level backups and restore PostgreSQL clusters directly from snapshots. This document explains how to configure the environment, set up snapshot classes, perform VolumeSnapshot-based backups, recover PostgreSQL clusters, and verify restored data in a Kubernetes environment.

## Environment

The following versions were used for this workflow:

| Component | Version |
| :--- | :--- |
| CloudNativePG | v1.25.1 |
| OpenEBS | v4.2.0 |
| Kubernetes | v1.29.6 |
| kubectl-mayastor Plugin | v2.7.4+0 |
| kubectl cnpg plugin | v1.25.1 |

## Prerequisites

### Setup OpenEBS

- **Install OpenEBS**
  
  Ensure that OpenEBS is installed in your cluster. Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md) for step-by-step instructions.

- **Install the `kubectl-mayastor` Plugin**
  
  Ensure that `kubectl-mayastor` plugin is installed. Refer to the [Mayastor Kubectl Plugin Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/kubectl-plugin.md) to install the plugin.

- **Create a StorageClass**

1. Create a file named `StorageClass.yaml`.
  
**StorageClass.yaml**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  protocol: nvmf
  repl: "1"
  thin: "true"  # should be thin only
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

2. Apply the configuration.
  
```
kubectl create -f StorageClass.yaml
```

### Create a VolumeSnapshotClass

1. Create a file named `VolumeSnapshotClass.yaml`.

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
```

2. Apply the configuration.
  
```
kubectl create -f VolumeSnapshotClass.yaml
```

## CloudNativePG Operator and PostgreSQL Cluster Setup

1. Install the CNPG operator using the official manifest.

```
kubectl apply --server-side -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.25/releases/cnpg-1.25.1.yaml
```

:::note
By default, the operator is installed in the `cnpg-system` namespace.
:::

Refer to the [CloudNativePG Installation Documentation](https://cloudnative-pg.io/documentation/1.25/installation_upgrade/) for alternative installation methods.

2. Install the kubectl CNPG plugin using Homebrew on macOS.

```
brew install kubectl-cnpg
```

Refer to the [CloudNativePG kubectl Plugin Documentation](https://cloudnative-pg.io/documentation/1.25/kubectl-plugin/#generation-of-installation-manifests) for installation instructions on Linux, Windows, or other platforms.

## Deploying a PostgreSQL Cluster

1. Create a namespace for PostgreSQL cluster.

```
kubectl create namespace cnpg-cluster
```

2. Create the PostgreSQL cluster custom resource.

```
kubectl create -f Cluster.yaml -n cnpg-cluster
```

**Cluster.yaml**
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: testcnpg-cluster
spec:
  instances: 3
  primaryUpdateStrategy: unsupervised
  # Persistent storage configuration
  storage:
    storageClass: mayastor-1
    size: 4Gi
  walStorage:
    storageClass: mayastor-1
    size: 4Gi

  # Backup properties
  backup:
    volumeSnapshot:
       className: csi-mayastor-snapshotclass
```

3. Create the PostgreSQL cluster.

```
kubectl create -f Cluster.yaml -n cnpg-cluster
```

**Sample Output**

```
Cluster Summary
---------------
Name:                    cnpg-cluster/testcnpg-cluster
System ID:               7486770939978866710
PostgreSQL Image:        ghcr.io/cloudnative-pg/postgresql:17.4
Primary instance:        testcnpg-cluster-1
Primary start time:      2025-03-28 08:15:04 +0000 UTC (uptime 2m28s)
Status:                  Cluster in healthy state
Instances:               3
Ready instances:         3
Size:                    126M
Current Write LSN:       0/6050170 (Timeline: 1 - WAL File: 000000010000000000000006)


Continuous Backup status
------------------------
First Point of Recoverability:   Not Available
Working WAL archiving:           OK
WALs waiting to be archived:     0
Last Archived WAL:               000000010000000000000005.00000060.backup @ 2025-03-28T08:15:52.520972Z
Last Failed WAL:                 -


Streaming Replication status
----------------------------
Replication Slots Enabled

Name                 Sent LSN   Write LSN  Flush LSN  Replay LSN  Write Lag  Flush Lag  Replay Lag  State       Sync State  Sync Priority  Replication Slot
----                 --------   ---------  ---------  ---------- ---------  ---------  ---------- ----------- ----------  -------------  ----------------
testcnpg-cluster-2   0/6050170  0/6050170  0/6050170  0/6050170   00:00:00   00:00:00   00:00:00   streaming   async       0              active
testcnpg-cluster-3   0/6050170  0/6050170  0/6050170  0/6050170   00:00:00   00:00:00   00:00:00   streaming   async       0              active


Instances status
----------------
Name                 Current LSN  Replication role    Status  QoS         Manager Version  Node
----                 -----------  ------------------  ------  ----------  ---------------  --------------
testcnpg-cluster-1   0/6050170    Primary             OK      BestEffort  1.25.1           node-1-331287
testcnpg-cluster-2   0/6050170    Standby (async)     OK      BestEffort  1.25.1           node-0-331287
testcnpg-cluster-3   0/6050170    Standby (async)     OK      BestEffort  1.25.1           node-2-331287
```

## Insert Sample Data into the PostgreSQL Database

1. Connect to the PostgreSQL cluster.

```
kubectl cnpg psql testcnpg-cluster -n cnpg-cluster
```

2. Create database and insert sample data.

```
CREATE DATABASE demo;
\c demo;

CREATE TABLE my_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  value INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO my_table (name, value)
SELECT
  'Record ' || generate_series(1, 100),
  (random() * 1000)::INTEGER;

SELECT COUNT(*) FROM my_table;
```

**Sample Output**

```
[demo]$ kubectl cnpg psql testcnpg-cluster -n cnpg-cluster
psql (17.4 (Debian 17.4-1.pgdg110+2))
Type "help" for help.

[postgres=#]
[postgres=#]
[postgres=#] create database demo;
CREATE DATABASE

[postgres=#] \l demo
                                   List of databases
 Name |  Owner   | Encoding | Locale Provider | Collate | Ctype | Locale | ICU Rules | Access privileges
------+----------+----------+-----------------+---------+-------+--------+-----------+-------------------
 demo | postgres | UTF8     | libc            | C       | C     |        |           |
(1 row)

[postgres=#] \c demo
You are now connected to database "demo" as user "postgres".

[demo=#]
[demo=#] CREATE TABLE my_ta_
```

## Backup Using VolumeSnapshots

CloudNativePG supports two snapshot-based backup modes:

  - Online (Hot) Backups: Taken while PostgreSQL is running
  - Offline (Cold) Backups: Taken while PostgreSQL instances are stopped

- **Perform an Online Backup**

Create an online VolumeSnapshot backup.

```
kubectl cnpg backup -m volumeSnapshot testcnpg-cluster -n cnpg-cluster
```

Backup behavior can be controlled using `spec.backup.volumeSnapshot` options such as `online`, `immediateCheckpoint`, and `waitForArchive`.

- **Perform an Offline Backup**

:::warning
Performing a cold backup with volumesnapshots targeting the primary will result in primary instance shutdown and write operation disruption. This also occurs in single-instance clusters, even without explicitly targeting the primary.
:::

Create an offline VolumeSnapshot backup.

```
kubectl cnpg backup -m volumeSnapshot testcnpg-cluster -n cnpg-cluster --online=false
```

Check backup status.

```
kubectl get backup -n cnpg-cluster
```

:::note
For reliable recovery, cold backups are recommended over hot backups. By default, backups are performed on the most suitable replica, or on the primary instance if no replicas are available. This behavior can be modified to explicitly target the primary instance by setting `spec.backup.target="Primary"` in the cluster definition or `spec.target="Primary"` in the Backup custom resource (CRD).
:::

## Recovery Using VolumeSnapshots

1. List VolumeSnapshots in the cluster namespace.

```
kubectl get volumesnapshot -n cnpg-cluster
```

**Sample Output**
```
NAME                               READYTOUSE   SOURCEPVC               SOURCESNAPSHOTCONTENT   RESTORESIZE   SNAPSHOTCLASS                SNAPSHOTCONTENT                                CREATIONTIME   AGE
testcnpg-cluster-20250328144442    true         testcnpg-cluster-2      -                      4Gi           csi-mayastor-snapshotclass   snapcontent-2e0a7dc1-94b9-475c-89eb-36e0486ca642   7m21s         7m22s
testcnpg-cluster-20250328144442-wal true         testcnpg-cluster-2-wal  -                      4Gi           csi-mayastor-snapshotclass   snapcontent-70e3efac-b27f-48f3-97c0-e8cb4d788aef   7m21s         7m22s
```

2. Create a new cluster using the existing VolumeSnapshots.

```
kubectl create -f RecoverCluster.yaml -n cnpg-cluster
```

**RecoverCluster.yaml**
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: cluster-restore
spec:
  instances: 3
  storage:
    size: 4Gi
    storageClass: mayastor-1
  walStorage:
    size: 4Gi
    storageClass: mayastor-1 # Storage Class with thin Prov
  primaryUpdateStrategy: unsupervised
  bootstrap:
    recovery:
        volumeSnapshots:
          storage:
            name: testcnpg-cluster-20250328144442
            kind: VolumeSnapshot
            apiGroup: snapshot.storage.k8s.io
          walStorage:
            name: testcnpg-cluster-20250328144442-wal
            kind: VolumeSnapshot
            apiGroup: snapshot.storage.k8s.io
  backup:
    volumeSnapshot:
       className: csi-mayastor-snapshotclass
```

```
kubectl get all -n cnpg-cluster
```

**Sample Output**
```
NAME                          READY       STATUS          RESTARTS      AGE
pod/cluster-restore-1         1/1         Running         0             2m57s
pod/cluster-restore-2         1/1         Running         0             2m23s
pod/cluster-restore-3         1/1         Running         0             114s
pod/testcnpg-cluster-1        1/1         Running         0             74m
pod/testcnpg-cluster-2        1/1         Running         0             73m
pod/testcnpg-cluster-3        1/1         Running         0             73m


NAME                          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)     AGE
service/cluster-restore-r     ClusterIP   10.99.62.103    <none>        5432/TCP    3m7s
service/cluster-restore-ro    ClusterIP   10.106.226.108  <none>        5432/TCP    3m7s
service/cluster-restore-rw    ClusterIP   10.106.211.11   <none>        5432/TCP    3m7s
service/testcnpg-cluster-r    ClusterIP   10.99.226.253   <none>        5432/TCP    74m
service/testcnpg-cluster-ro   ClusterIP   10.106.164.228  <none>        5432/TCP    74m
service/testcnpg-cluster-rw   ClusterIP   10.102.32.168   <none>        5432/TCP    74m
```

:::info
The recovery cluster must be created in the same namespace as the source cluster.
:::

## Verify Restored Data

1. Connect to the restored PostgreSQL cluster.

```
kubectl cnpg psql cluster-restore -n cnpg-cluster
```

2. Verify the restored data.

```
\c demo;
SELECT COUNT(*) FROM my_table;
```

**Sample Output**
```
[demo]$ kubectl cnpg psql cluster-restore -n cnpg-cluster
psql (17.4 (Debian 17.4-1.pgdg110+2))
Type "help" for help.

[postgres=# \c demo
You are now connected to database "demo" as user "postgres".
[demo=# SELECT COUNT(*) FROM my_table;
 count
-------
 10000
(1 row)

demo=#
```

Successful output confirms that the database was restored correctly from the VolumeSnapshots.

## See Also

- [Replicated PV Mayastor Installation on OpenShift](../openebs-on-kubernetes-platforms/openshift.md)
- [Replicated PV Mayastor Installation on Talos](../openebs-on-kubernetes-platforms/talos.md)
- [Kasten Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/kasten-br-fs.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)
- [KubeVirt VM Backup and Restore using Replicated PV Mayastor VolumeSnapshots and Velero - FileSystem](../backup-and-restore/kubevirt-backup.md)