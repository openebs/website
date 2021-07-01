---
title: OpenEBS 2.2.0 - Enhancements And New Storage Capabilities
author: Ashutosh Kumar
author_info: Software Engineer at MayaData | OpenEBS Reviewer and Contributor | CKA | Gopher | Kubernaut
date: 20-10-2020
tags: OpenEBS
excerpt: OpenEBS 2.2.0 is here! Read this post to learn about the new updates.
---

### **OpenEBS 2.2.0 is here**

We are excited to announce yet another ***OpenEBS*** release that comes with new storage capabilities, control plane enhancements, bug fixes, and new APIs for the world’s fastest storage engine built on RUST, also known as Mayastor.

OpenEBS has seen a wider adoption among the users, thanks to the vibrant and growing community. Like in most of the OpenEBS releases, this release responds to the feedback received in the community. If you want to learn more about the project roadmap, please browse the following link:
[https://github.com/openebs/openebs/blob/master/ROADMAP.md](https://github.com/openebs/openebs/blob/master/ROADMAP.md)

Incremental Backup and Restore in ZFS local PV and pool and volume migration in cStor are the major release milestones made into the release. The pool migration in cStor solves the use-case of replacing a bad node with a new node or sending a node for maintenance on on-premise clusters. The migration feature provides great value in cloud-managed Kubernetes clusters, too, e.g., GKE, where node reboots or voluntary scale down of nodes can cause the disks to get removed. 

This release is also special due to the [*Hacktoberfest*](https://hacktoberfest.digitalocean.com/) festival and would like to give a shout out to first-time contributors [@didier-durand](https://github.com/didier-durand), [@zlymeda](https://github.com/zlymeda), [@avats-dev](https://github.com/avats-dev), and many more.

### **Key Highlights of OpenEBS 2.2.0 Release:**

- Mayastor aims to be the world’s fastest container attached storage and is currently in alpha. The release introduced block device enumeration feature via the gRPC API and enhancement around storage pool finalizers.
- ZFS local PV has become a popular storage engine built on local storage design and provides powerful storage features like snapshots and clones, raw block volume, etc. It also supports day two operations like volume resize and backup and restore via the pluggable Velero interface.
Support for Incremental Backup and Restore by enhancing the OpenEBS Velero Plugin has been a significant highlight for ZFS local PV release. 
To learn more about this, please refer to the document [here](https://github.com/openebs/zfs-localpv/blob/master/docs/backup-restore.md).
- OpenEBS Velero plugin connects the Velero interface to the OpenEBS storage engines to deliver backup/restore functionality. Velero Plugin has been enhanced to restore ZFS Local PV into a different cluster or a different node in the cluster and use custom certificates for S3 object storage.
- CStor went into beta in 2.0 and has been enhanced to migrate the storage pool from one node to another node. This will help with scenarios where a Kubernetes node can be replaced with a new node but can be attached with the block devices from the old node that contain cStor Pool and the volume data.
- OpenEBS node disk manager helps in block device discovery and management in a Kubernetes cluster and powers storage engines like cStor. Support to exclude multiple devices that could be mounted as host filesystem directories has been added.
An issue where NDM could cause data loss by creating a partition table on an uninitialized iSCSI volume has also been fixed.

### **Useful Links and Summary:**

If you are interested in knowing more details regarding the changes that made to this release, please visit the release note [link](https://github.com/openebs/openebs/releases/tag/v2.2.0). To try out OpenEBS, you can visit [https://docs.openebs.io/](https://docs.openebs.io/) and follow the user guides.

You can visit the following link to learn more or experiment with Mayastor
[https://github.com/openebs/mayastor](https://github.com/openebs/mayastor)

You can visit the following link to learn more or experiment with ZFS local PV
[https://github.com/openebs/zfs-localpv](https://github.com/openebs/zfs-localpv)

To learn more about the new cStor CSPC API, please visit the following link:
[https://github.com/openebs/cstor-operators](https://github.com/openebs/cstor-operators)

If you have any feedback, questions, or suggestions — please reach out to the community on the #openebs channel in the Kubernetes workspace or consider opening a relevant issue at [Github](https://github.com/openebs/openebs).
