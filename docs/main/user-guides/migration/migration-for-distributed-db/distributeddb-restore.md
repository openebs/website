---
id: distributeddb-restore
title: Restoring Mayastor
keywords:
 - Restoring Mayastor
description: This section explains how to Restore from cStor Backup to Mayastor for Distributed DBs.
---
# Steps to Restore from cStor Backup to Mayastor for Distributed DBs (Cassandra)

Cassandra is a popular NoSQL database used for handling large amounts of data with high availability and scalability. In Kubernetes environments, managing and restoring Cassandra backups efficiently is crucial. In this article, we'll walk you through the process of restoring a Cassandra database in a Kubernetes cluster using Velero, and we'll change the storage class to Mayastor for improved performance.


{% hint style="info" %}
Before you begin, make sure you have the following:
- Access to a Kubernetes cluster with Velero installed.
- A backup of your Cassandra database created using Velero.
- Mayastor configured in your Kubernetes environment.
{% endhint %}

## Step 1: Set Up Kubernetes Credentials and Install Velero

Set up your Kubernetes cluster credentials for the target cluster where you want to restore your Cassandra database. 
Use the same values for the BUCKET-NAME and SECRET-FILENAME placeholders that you used during the initial Velero installation. This ensures that Velero has the correct credentials to access the previously saved backups.
Use the gcloud command if you are using Google Kubernetes Engine (GKE) as shown below:

```
gcloud container clusters get-credentials CLUSTER_NAME --zone ZONE --project PROJECT_NAME
```

Install Velero with the necessary plugins, specifying your backup bucket, secret file, and uploader type. Make sure to replace the placeholders with your specific values:


```
velero get backup | grep YOUR_BACKUP_NAME
```

## Step 2: Verify Backup Availability and Check BackupStorageLocation Status

Confirm that your Cassandra backup is available in Velero. This step ensures that there are no credentials or bucket mismatches:

```
velero get backup | grep YOUR_BACKUP_NAME
```

Check the status of the BackupStorageLocation to ensure it's available:

```
kubectl get backupstoragelocation -n velero
```

## Step 3: Create a Restore Request

Create a Velero restore request for your Cassandra backup:

```
velero restore create RESTORE_NAME --from-backup YOUR_BACKUP_NAME
```

## Step 4: Monitor Restore Progress

Monitor the progress of the restore operation using the below commands.
Velero initiates the restore process by creating an initialization container within the application pod. This container is responsible for restoring the volumes from the backup. As the restore operation proceeds, you can track its status, which typically transitions from **in progress** to **Completed**. 



In this scenario, the storage class for the PVCs remains as `cstor-csi-disk` since these PVCs were originally imported from a cStor volume.

{% hint style="note" %}    
Your storage class was originally set to `cstor-csi-disk` because you imported this PVC from a cStor volume, the status might temporarily stay as **In Progress** and your PVC will be in **Pending** status.
{% endhint %}


```
velero get restore | grep RESTORE_NAME
```
Inspect the status of the PVCs in the cassandra namespace:

```
kubectl get pvc -n cassandra
```
```
kubectl get pods -n cassandra
```


## Step 5:  Back Up PVC YAML

Create a backup of the Persistent Volume Claims (PVCs) and then modify their storage class to `mayastor-single-replica`. 

{% hint style="note" %}    
The statefulset for Cassandra will still have the `cstor-csi-disk` storage class at this point. This will be addressed in the further steps. 
{% endhint %}

```
kubectl get pvc -n cassandra -o yaml > cassandra_pvc_19-09.yaml
```

```
ls -lrt | grep cassandra_pvc_19-09.yaml
```

Edit the PVC YAML to change the storage class to `mayastor-single-replica`. You can use the provided example YAML snippet and apply it to your PVCs.

```
apiVersion: v1
items:
- apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    finalizers:
    - kubernetes.io/pvc-protection
    labels:
      app.kubernetes.io/instance: cassandra
      app.kubernetes.io/name: cassandra
      velero.io/backup-name: cassandra-backup-19-09-23
      velero.io/restore-name: cassandra-restore-19-09-23
    name: data-cassandra-0
    namespace: cassandra
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 3Gi
    storageClassName: mayastor-single-replica
    volumeMode: Filesystem
- apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    finalizers:
    - kubernetes.io/pvc-protection
    labels:
      app.kubernetes.io/instance: cassandra
      app.kubernetes.io/name: cassandra
      velero.io/backup-name: cassandra-backup-19-09-23
      velero.io/restore-name: cassandra-restore-19-09-23
    name: data-cassandra-1
    namespace: cassandra
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 3Gi
    storageClassName: mayastor-single-replica
    volumeMode: Filesystem
- apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    finalizers:
    - kubernetes.io/pvc-protection
    labels:
      app.kubernetes.io/instance: cassandra
      app.kubernetes.io/name: cassandra
      velero.io/backup-name: cassandra-backup-19-09-23
      velero.io/restore-name: cassandra-restore-19-09-23
    name: data-cassandra-2
    namespace: cassandra
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 3Gi
    storageClassName: mayastor-single-replica
    volumeMode: Filesystem
kind: List
metadata:
  resourceVersion: ""
```

## Step 6: Delete and Recreate PVCs

Delete the pending PVCs and apply the modified PVC YAML to recreate them with the new storage class:

```
kubectl delete pvc PVC_NAMES -n cassandra
```

```
kubectl apply -f cassandra_pvc.yaml -n cassandra
```

## Step 7: Observe Velero Init Container and Confirm Restore

Observe the Velero init container as it restores the volumes for the Cassandra pods. This process ensures that your data is correctly recovered.

```
Events:
  Type     Reason                  Age                     From                     Message
  ----     ------                  ----                    ----                     -------
  Warning  FailedScheduling        8m37s                   default-scheduler        0/3 nodes are available: 3 pod has unbound immediate PersistentVolumeClaims. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling.
  Warning  FailedScheduling        8m36s                   default-scheduler        0/3 nodes are available: 3 pod has unbound immediate PersistentVolumeClaims. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling.
  Warning  FailedScheduling        83s                     default-scheduler        0/3 nodes are available: 3 persistentvolumeclaim "data-cassandra-0" not found. preemption: 0/3 nodes are available: 3 Preemption is not helpful for scheduling.
  Warning  FailedScheduling        65s                     default-scheduler        running PreFilter plugin "VolumeBinding": %!!(MISSING)w(<nil>)
  Normal   Scheduled               55s                     default-scheduler        Successfully assigned cassandra/cassandra-0 to gke-mayastor-pool-2acd09ca-4v3z
  Normal   NotTriggerScaleUp       3m34s (x31 over 8m35s)  cluster-autoscaler       pod didn't trigger scale-up:
  Normal   SuccessfulAttachVolume  55s                     attachdetach-controller  AttachVolume.Attach succeeded for volume "pvc-bf8a2fb7-8ddb-4e53-aa48-f8bbf2064b41"
  Normal   Pulled                  47s                     kubelet                  Container image "velero/velero-restore-helper:v1.11.1" already present on machine
  Normal   Created                 47s                     kubelet                  Created container restore-wait
  Normal   Started                 47s                     kubelet                  Started container restore-wait
  Normal   Pulled                  41s                     kubelet                  Container image "docker.io/bitnami/cassandra:4.1.3-debian-11-r37" already present on machine
  Normal   Created                 41s                     kubelet                  Created container cassandra
  Normal   Started                 41s                     kubelet                  Started container cassandra
```

Run this command to check the restore status:

```
velero get restore | grep cassandra-restore-19-09-23
```

Run this command to check if all the pods are running: 

```
kubectl get pods -n cassandra
```

## Step 8:  Verify Cassandra Data and StatefulSet

### Access a Cassandra pod using cqlsh and check the data

- You can use the following command to access the Cassandra pods. This command establishes a connection to the Cassandra database running on pod `cassandra-1`:

```
cqlsh -u <enter-your-user-name> -p <enter-your-password> cassandra-1.cassandra-headless.cassandra.svc.cluster.local 9042
```
- The query results should display the data you backed up from cStor. In your output, you're expecting to see the data you backed up.

```
cassandra@cqlsh> USE openebs;
```

```
cassandra@cqlsh:openebs> select * from openebs.data;
```

```
 replication | appname   | volume
-------------+-----------+--------
           3 | cassandra |  cStor

(1 rows)
```

- After verifying the data, you can exit the Cassandra shell by typing `exit`.







### Modify your Cassandra StatefulSet YAML to use the mayastor-single-replica storage class

- Before making changes to the Cassandra StatefulSet YAML, create a backup to preserve the existing configuration by running the following command:

```
kubectl get sts cassandra -n cassandra -o yaml > cassandra_sts_backup.yaml
```

- You can modify the Cassandra StatefulSet YAML to change the storage class to `mayastor-single-replica`. Here's the updated YAML:
```
apiVersion: apps/v1
kind: StatefulSet
metadata:
  annotations:
    meta.helm.sh/release-name: cassandra
    meta.helm.sh/release-namespace: cassandra
  labels:
    app.kubernetes.io/instance: cassandra
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: cassandra
    helm.sh/chart: cassandra-10.5.3
    velero.io/backup-name: cassandra-backup-19-09-23
    velero.io/restore-name: cassandra-restore-19-09-23
  name: cassandra
  namespace: cassandra
spec:
  podManagementPolicy: OrderedReady
  replicas: 3
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      app.kubernetes.io/instance: cassandra
      app.kubernetes.io/name: cassandra
  serviceName: cassandra-headless
  template:
    # ... (rest of the configuration remains unchanged)
  updateStrategy:
    type: RollingUpdate
  volumeClaimTemplates:
  - apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      creationTimestamp: null
      labels:
        app.kubernetes.io/instance: cassandra
        app.kubernetes.io/name: cassandra
      name: data
    spec:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 3Gi
      storageClassName: mayastor-single-replica # Change the storage class here
      volumeMode: Filesystem
```

- Apply the modified YAML to make the changes take effect:

```
kubectl apply -f cassandra_sts_modified.yaml
```



### Delete the Cassandra StatefulSet with the --cascade=orphan flag

Delete the Cassandra StatefulSet while keeping the pods running without controller management:

```
kubectl delete sts cassandra -n cassandra --cascade=orphan
```



### Recreate the Cassandra StatefulSet using the updated YAML

- Use the kubectl apply command to apply the modified StatefulSet YAML configuration file, ensuring you are in the correct namespace where your Cassandra deployment resides. Replace <path_to_your_yaml> with the actual path to your YAML file.

```
kubectl apply -f <path_to_your_yaml> -n cassandra
```

- To check the status of the newly created StatefulSet, run:

```
kubectl get sts -n cassandra
```

- To confirm that the pods are running and managed by the controller, run:

```
kubectl get pods -n cassandra
```





