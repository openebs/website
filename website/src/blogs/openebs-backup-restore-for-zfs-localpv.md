---
title: OpenEBS Backup/Restore for ZFS-LocalPV
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 27-10-2020
tags: OpenEBS
excerpt: Overview of how to use Velero Backup/Restore plugin for ZFS-LocalPV to protect it against data loss.
---

## Overview: OpenEBS Backup/Restore for ZFS-LocalPV

**Backup** is the process of copying the data to a different/remote location to protect against accidental or corruption or any other type of data loss. Restore is the process of getting back the data from the backup. In this blog, I will discuss how we can use *Velero Backup/Restore* plugin for ***ZFS-LocalPV*** to protect it against data loss.

### Pre-requisites

We should have installed the ZFS-LocalPV 1.0.0 or later version for Backup and Restore, see my previous[ blog](https://blog.openebs.io/openebs-dynamic-volume-provisioning-on-zfs-d8670720181d) for the steps to install the ZFS-LocalPV driver.

### Setup

**1.Install Velero CLI**

Download the 1.5 or later binary for ZFS-LocalPV. For Linux on amd64, we need to download below

    wget
    https://github.com/vmware-tanzu/velero/releases/download/v1.5.1/velero-v1.5.1-linux-amd64.tar.gz

Extract the tarball:

    tar -xvf velero-v1.5.1-linux-amd64.tar.gz

Move the extracted velero binary to somewhere in your $PATH (/usr/local/bin for most users).

See the detailed steps[ here](https://velero.io/docs/v1.5/basic-install/).

**2.Deploy Velero**

We will be using minio for storage purpose in this blog, we need to setup the credential file first

    $ cat /home/pawan/velero/credentials-minio
    [default]
    aws_access_key_id = minio
    aws_secret_access_key = minio123

We can install Velero by using below command

    $ velero install --provider aws --bucket velero --secret-file /home/pawan/velero/credentials-minio --plugins velero/velero-plugin-for-aws:v1.0.0-beta.1 --backup-location-config region=minio,s3ForcePathStyle="true",s3Url=http://minio.velero.svc:9000 --use-volume-snapshots=true --use-restic

We have to install the velero 1.5 or later version of velero for ZFS-LocalPV.

**3.Deploy MinIO**

Deploy the MinIO for storing the backup:-

    $ kubectl apply -f
    https://raw.githubusercontent.com/openebs/zfs-localpv/master/deploy/sample/minio.yaml

The above MinIO uses tmp directory inside the pod to store the data for the demonstration purpose, so when restart happens, the backed up data will be gone. We should change the above YAML to use persistence storage to store the data when deploying it for the production.

Check the Velero Pods are UP and Running

    $ kubectl get po -n velero
    NAME                      READY   STATUS      RESTARTS   AGE
    minio-d787f4bf7-xqmq5     1/1     Running     0          8s
    minio-setup-prln8         0/1     Completed   0          8s
    restic-4kx8l              1/1     Running     0          69s
    restic-g5zq9              1/1     Running     0          69s
    restic-k7k4s              1/1     Running     0          69s
    velero-7d9c448bc5-j424s   1/1     Running     3          69s

**4.Setup OpenEBS Plugin**

We can Install the Velero Plugin for ZFS-LocalPV using the below command

    velero plugin add openebs/velero-plugin:2.2.0

We have to install the velero-plugin 2.2.0 or later version, which has the support for ZFS-LocalPV. Once the setup is done, we can go ahead and create the backup/restore.

**5.Create the VSL**

The VSL(Volume Snapshot Location) has information about where the snapshot should be stored. To create the Backup/Restore, we can create the Volume Snapshot Location by applying the below YAML:

    apiVersion: velero.io/v1
    kind: VolumeSnapshotLocation
    metadata:
     name: default
     namespace: velero
    spec:
     provider: openebs.io/zfspv-blockstore
     config:
       bucket: velero
       prefix: zfs
       namespace: openebs # this is the namespace where ZFS-LocalPV creates all the CRs, passed as OPENEBS_NAMESPACE env in the ZFS-LocalPV deployment
       provider: aws
       region: minio
       s3ForcePathStyle: "true"
       s3Url: http://minio.velero.svc:9000

Here, we have to provide the namespace, which we have used as OPENEBS_NAMESPACE env while deploying the ZFS-LocalPV. The ZFS-LocalPV Operator yamls uses “openebs” as the default value for OPENEBS_NAMESPACE env. Verify the volumesnapshot location:

    kubectl get volumesnapshotlocations.velero.io -n velero

### Create Backup

We can use the below Velero command to create the backup:

    velero backup create my-backup --snapshot-volumes --include-namespaces=<backup-namespace> --volume-snapshot-locations=default --storage-location=default

we can add all the namespaces we want to be backed up in a comma-separated format in --include-namespaces parameter. We have to provide the VSL that we have created in --volume-snapshot-locations parameter.

We can check the backup status using the velero backup get command:

    $ velero backup get
    NAME        STATUS       CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
    my-backup   InProgress   2020-09-14 21:09:06 +0530 IST   29d       default            <none>

The status InProgress means that the backup is in progress. Wait for it to be Completed.

We can also create a scheduled backup which will take the backup periodically. For example, to take the full backup at every 5 min, we can create the below schedule :

    velero create schedule schd --schedule="*/5 * * * *" --snapshot-volumes --include-namespaces=<backup-namespace1>,<backup-namespace2> --volume-snapshot-locations=default --storage-location=default

### Restore

If the application and its PVC has been deployed in a namespace, then we can use the below Velero command to create the backup of the entire namespace:

    velero restore create --from-backup my-backup --restore-volumes=true --namespace-mappings <source-ns>:<dest-ns>

The above command will create the backup of everything that is there in the namespace provided as --include-namespaces argument. We can provide the namespace mapping if we want to restore in a different namespace as --namespace-mappings parameter. If namespace mappings are not provided, it will restore in the source namespace only where the original pod and pvc was present. Now we can check the restore status:

    $ velero restore get
    NAME                       BACKUP      STATUS       WARNINGS   ERRORS   CREATED                         SELECTOR
    my-backup-20200914211331   my-backup   InProgress   0          0        2020-09-14 21:13:31 +0530 IST   <none>

Once the Status is Completed, we can check the pods in the destination namespace and verify that everything is up and running. We can also verify that the data has been restored.

### Summary

As demonstrated in this blog, OpenEBS makes it easy to take the backup of the Kubernetes applications, which we can use to Restore as part of disaster recovery. In my next blog, I will talk about how we can take the incremental backup of the volumes, which is space optimized backup for ZFS-LocalPV

## Important links

[https://github.com/openebs/zfs-localpv](https://github.com/openebs/zfs-localpv)
[https://velero.io/docs/](https://velero.io/docs/v1.5/basic-install/)
