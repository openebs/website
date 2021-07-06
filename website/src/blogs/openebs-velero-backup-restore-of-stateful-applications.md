---
title: OpenEBS-Velero backup/restore of stateful applications
author: Vishnu Itta
author_info: Developer who is always eager to learn, loves math, algorithms, & programming. Have a good experience in storage protocols, ZFS, FreeBSD internals, Linux, device drivers.
date: 04-08-2020
tags: OpenEBS, Velero
excerpt: In this blog, we will go through the backup/restore solution provided to its users by OpenEBS with the help of Velero.
---

### **Backup/Restore of stateful applications in OpenEBS**

SREs play a crucial role in automating operations. This role includes handling infrastructure upgrades and the upgrades of software running on that infrastructure. When running stateful workloads, the data must be backed up before any upgrades.

Additionally, workloads on Kubernetes are often different than traditional monolithic applications since Kubernetes supports microservices and loosely coupled workloads. This brings-in the need for a `cloud-native` design of backup/restore per workload or application. Once implemented this approach provides benefits to users such as an app-centric view, ease of management, setting of RPO/RTO at the workload level, and others. To learn more about cloud native backup drivers and requirements - please read this [thenewstack.io article](https://thenewstack.io/cloud-native-backups-disaster-recovery-and-migrations-on-kubernetes/).

The below graphic shows microservices, and their loosely coupled nature. Managing backups and the tuning of RPO/RTO per microservice is required to preserve the loosely coupled nature of these workloads and of the teams responsible for them.
![OpenEBS Velero backup/restore of stateful applications: fig 1](https://lh4.googleusercontent.com/JyIxZZtj-1rBOGo2z1bKcYlD9-halM8dXpChtOIPro_aZEhQObTL_K5_Be_hLgqXl7aT68jYqFjNE9C6rZK0IRaV_neH4DURZhUr3z5FkVirzMirk_z8FiscY6_sb3JPhlAx1XRL)
The following are **challenges** in redesigning backup/restore of K8s applications:

- Ability to look from the application view rather than only the data
- Dependencies with K8s constructs like node names, PVCs, storage classes, topologies in them
- Snapshots of selected volumes rather than entire mount point/disk in hyper-converged infrastructure
- K8s application deployment workflow to copy data during a restore whether using operators or another method

In this blog, we will go through a backup/restore solution for ***OpenEBS*** with the help of ***Velero***. OpenEBS is leading open source container attached storage solution, and Velero is one of the most used open-source tools for backups in Kubernetes environments.

### **Backup/Restore solution**

This solution, with Velero, provides a declarative way for users to specify

- object storage as the destination location to store backed-up data
- K8s applications and its resources which are part of the backup
- storage provider configuration to backup/restore data
- schedules to take a backup at regular intervals
- restore selected resources from the selected backup
- app-specific hooks to execute before and after performing backup/restore

Let's start by examining what OpenEBS, as container attached storage, offers. It has many kinds of storage engines as below:

- Local PV host path and block device
- Jiva
- CStor
- Local PV ZFS

### **Local PV / Jiva Volumes + Restic + Restore Item Action plugin**

OpenEBS Local PV volumes are prominent among cloud-native applications. These applications themselves take care of replicating data and snapshotting. As the name suggests, these are used in hyper-converged infrastructure. This brings in a few challenges during backup/restoration.

Local PVs related storage classes will have `WaitForFirstConsumer`. It provides delayed binding of volumes until Pod gets scheduled on the node. K8s sets the node name as an annotation on PVC. Restoring that PVC onto the destination cluster will leave the pod in pending state. This solution takes care of it by applying node name mapping in PVC annotation. Restore Item Action plugin, contributed by OpenEBS, in Velero performs this mapping.

Velero's in-built file-based `Restic` plugin helps in backing up the application's data. `Init` container will be injected into the application to copy data from the destination location to the volume.

Jiva volumes are used by applications that need replication functionality from storage providers. File-based `Restic` plugin can be used to backup/restore applications using jiva volumes.

### **CStor / Local PV ZFS + Velero plugin**

Standard applications use OpenEBS cStor volumes. These applications need replication, snapshotting, cloning, etc., from storage providers. Also, these applications are free to run-anywhere-in-the-cluster nature. OpenEBS have a cStor velero-plugin for crash-consistent backup of data. This plugin performs pausing of IOs on the volume before the snapshot is taken on all the replicas. It resumes IOs once the point-in-time snapshot is taken. It reads the snapshot content from one of the replicas and backs it up at the object location. When a Schedule is newly created, full data will be backed up at the destination location. The plugin manages the completion status of the backup. On the next iterations, the plugin just backups the changes from previous successful backup.

Based on the replication settings of cStor at the destination, the plugin takes care of copying data to the configured number of replicas. The connection between iSCSI target pod and replica pods is not established until data is copied into the volume. This avoids usage of the PV by any application during restore time.

CStor plugin also provides an option to keep backups locally with the main volume in the form of local snapshots. Users can create a backup of applications and with local snapshots. Restoring these backups, which consists of local snapshots, can be done in a different namespace of the same cluster.

Work-related to local PV ZFS plugin is in-active development to provide all the features as mentioned above and much more.

### **Summary**

To summarize, a new kind of thinking (or) a new kind of approach is required to do cloud-native backups. OpenEBS has made tremendous progress in achieving it and provides various features and flavors of backup/restoration of its volumes.

- File-based
- Point-in-time block-based local snapshot and restore
- Full and incremental block-based remote backup and restore
- Per-workload backups
- K8s resources transformations

Credits to the Velero team for building a wonderful open-source backup/restore tool.

Please visit [https://docs.openebs.io](https://docs.openebs.io/), [https://velero.io](https://velero.io/) for more details about storage class, backup/restore examples, Velero.
