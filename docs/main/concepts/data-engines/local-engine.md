---
id: localengine
title: OpenEBS Local Engine
keywords: 
  - Local Engine
  - OpenEBS Local Engine
description: This document provides you with a brief explanation of OpenEBS Local Engine, quick start guides, and when to use OpenEBS Local Engine, and when not to use OpenEBS Local Engine, and its limitations.
---

## Local Engine Overview

OpenEBS provides Dynamic PV provisioners for [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local). A Local Engine (aka Local Volume) implies that storage is available only from a single node. A local volume represents a mounted local storage device such as a disk, partition, or directory. 

As the local volume is accessible only from a single node, local volumes are subject to the availability of the underlying node and are not suitable for all applications. If a node becomes unhealthy, then the local volume will also become inaccessible and a Pod using it will not be able to run. Applications using local volumes must be able to tolerate this reduced availability, as well as potential data loss, depending on the durability characteristics of the underlying disk.

## Use Cases

Examples of good workloads that can benefit from local volumes are: 

- Replicated databases like MongoDB and Cassandra
- Stateful workloads that can be configured with their own high-availability configuration like Elastic, MinIO 
- Edge workloads that typically run on a single node or in single node Kubernetes Clusters.

OpenEBS helps users to take local volumes into production by providing features that are currently missing in Kubernetes like:

- Dynamic PV provisioners for local volumes.
- Local volumes backed by hostpath on filesystems like Ext3, XFS, LVM, or ZFS.
- Monitoring the health of underlying devices or storage used to create local volumes. 
- Capacity management features like over-provisioning and/or quota enforcement. 
- Make use of the underlying storage capabilities like snapshot, clone, compression, and so forth when local volumes are backed by advanced filesystem like LVM and ZFS. 
- Backup and Restore via Velero. 
- Secure the local volumes via LUKS or by using in-built encryption support of the underlying filesystem.

## Quickstart Guides

OpenEBS provides Local Volume that can be used to provide locally mounted storage to Kubernetes Stateful workloads. Refer to the [Quickstart Guide](../../quickstart-guide/) for more information.

## When to use OpenEBS Local Engine?

- High performance is needed by those applications which manage their own replication, data protection, and other features such as snapshots and clones.
- When local disks need to be managed dynamically and monitored for impending notice of them going bad.

## When not to use OpenEBS Local Engine?

- When applications expect replication from storage.
- When the volume size may need to be changed dynamically but the underlying disk is not resizable. 

## Backup and Restore 

OpenEBS Local Volumes can be backed up and restored along with the application using [Velero](https://velero.io). 

Velero uses [Restic](https://github.com/restic/restic) for backing up and restoring Kubernetes local volumes. Velero can be configured to save the backups either in the cloud or on-premise with any S3 compatible storage like MinIO. When user initiates the backup, Velero via the Restic, will copy the entire data from the Local Engine to the remote location. Later, when the user wants to restore the application, Velero injects an init container into the application that will download and populate the data into the volume from the backed up location. For more details on how Velero Restic works, refer to the [Velero Restic integration](https://velero.io/docs/v1.3.2/restic/) documentation. 

While the preferred way for Backup and Restore for cloud native applications using Local Volumes is to use the application specific backup solution, you can use the Velero based Backup and Restore in the following cases:
- Application does not natively provide a Backup and Restore solution
- Schedule a daily or weekly backups of the data during off-peak hours
- Migrating the application using Local Volumes to a new Cluster 

A quick summary of the steps to backup include:

1. Install and Setup Velero by following the [Velero Documentation](https://velero.io/docs/).  

2. Prepare the application that needs to be backed up. Label and annotate the application, indicating that you want to use Velero to backup the volumes. For example, if you want to backup an application pod named `hello-local-hostpath-pod` with a volume mount `local-storage`, run the following commands. 
   
   ```
   kubectl label pod hello-local-hostpath-pod app=test-velero-backup
   kubectl annotate pod hello-local-hostpath-pod backup.velero.io/backup-volumes=local-storage
   ```
3. Use velero to backup the application. 
   ```
   velero backup create bbb-01 -l app=test-velero-backup
   ```

A quick summary of the steps to restore include:

1. Install and Setup Velero, with the same provider where backups were saved. 

2. Local Engines are created with node affinity. As the node names will change when a new cluster is created, create the required PVC(s) prior to proceeding with restore. 
   ```
   kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pvc.yaml
   ```
   
3. Use Velero to restore the application and populate the data into the volume from the backup. 
   ```
   velero restore create rbb-01 --from-backup bbb-01 -l app=test-velero-backup
   ```

## Limitations (or Roadmap items) of OpenEBS Local Engine

- Size of the Local Engine cannot be increased dynamically.
- Disk quotas are not enforced by Local Engine. An underlying device or hostpath can have more data than requested by a PVC or storage class. Enforcing the capacity is a roadmap feature.
- Enforce capacity and PVC resource quotas on the local disks or host paths.
- SMART statistics of the managed disks is also a potential feature in the roadmap.

## See Also

- [OpenEBS Architecture](../architecture.md)
- [Local Engine Prerequisites](../../user-guides/local-engine-user-guide/prerequisites.mdx)
- [Installation](../../quickstart-guide/installation.md)
- [Local Engine User Guide](../../user-guides/local-engine-user-guide/)

