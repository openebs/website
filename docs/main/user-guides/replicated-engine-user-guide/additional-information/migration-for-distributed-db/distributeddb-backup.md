---
id: distributeddb-backup
title: Backing up from cStor
keywords:
 - Backing up from cStor
description: This section explains how to backup from cStor for Distributed DBs.
---
# Steps to take a Backup from cStor for Distributed DBs (Cassandra)

## Step 1: Backup from CStor Cluster

In the current setup, we have a CStor cluster serving as the source, with Cassandra running as a StatefulSet, utilizing CStor volumes.

{% tabs %}
{% tab title="Command" %}
```text
kubectl get pods -n cassandra 
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME          READY   STATUS    RESTARTS   AGE
cassandra-0   1/1     Running   0          6m22s
cassandra-1   1/1     Running   0          4m23s
cassandra-2   1/1     Running   0          2m15s
```
{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="Command" %}
```text
kubectl get pvc -n cassandra 
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
data-cassandra-0   Bound    pvc-05c464de-f273-4d04-b915-600bc434d762   3Gi        RWO            cstor-csi-disk   6m37s
data-cassandra-1   Bound    pvc-a7ac4af9-6cc9-4722-aee1-b8c9e1c1f8c8   3Gi        RWO            cstor-csi-disk   4m38s
data-cassandra-2   Bound    pvc-0980ea22-0b4b-4f02-bc57-81c4089cf55a   3Gi        RWO            cstor-csi-disk   2m30s
```
{% endtab %}
{% endtabs %}

{% tabs %}
{% tab title="Command" %}
```text
kubectl get cvc -n openebs 
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME                                       CAPACITY   STATUS   AGE
pvc-05c464de-f273-4d04-b915-600bc434d762   3Gi        Bound    6m47s
pvc-0980ea22-0b4b-4f02-bc57-81c4089cf55a   3Gi        Bound    2m40s
pvc-a7ac4af9-6cc9-4722-aee1-b8c9e1c1f8c8   3Gi        Bound    4m48s
```
{% endtab %}
{% endtabs %}


## Step 2: Velero Installation

To initiate Velero, execute the following command:

```
velero install --use-node-agent --provider gcp --plugins velero/velero-plugin-for-gcp:v1.6.0 --bucket velero-backup-datacore --secret-file ./credentials-velero --uploader-type restic
```

Verify the Velero namespace for Node Agent and Velero pods:


```
kubectl get pods -n velero
```

## Step 3: Create a Sample Database

In this example, we create a new database with sample data in Cassandra, a distributed database. 

![](https://hackmd.io/_uploads/ryvcoj-l6.png)


The data is distributed across all replication instances.

![](https://hackmd.io/_uploads/ryzoojZgT.png)

## Step 4: Taking Velero Backup

Cassandra is a distributed wide-column store database running in clusters called **rings**. Each node in a Cassandra ring stores some data ranges and replicates others for scaling and fault tolerance. To back up Cassandra, we must back up all three volumes and restore them at the destination.

Velero offers two approaches for discovering pod volumes to back up using File System Backup (FSB):
- **Opt-in Approach**: Annotate every pod containing a volume to be backed up with the volume's name.
- **Opt-out Approach**: Back up all pod volumes using FSB, with the option to exclude specific volumes.

**Opt-in**:

In this case, we opt-in all Cassandra pods and volumes for backup:

```
kubectl -n cassandra annotate pod/cassandra-0 backup.velero.io/backup-volumes=data
kubectl -n cassandra annotate pod/cassandra-1 backup.velero.io/backup-volumes=data
kubectl -n cassandra annotate pod/cassandra-2 backup.velero.io/backup-volumes=data
```

To perform the backup, run the following command:

```
velero backup create cassandra-backup-19-09-23 --include-namespaces cassandra --default-volumes-to-fs-backup --wait
```

Check the backup status, run the following command:

```
velero get backup | grep cassandra-backup-19-09-23
```


