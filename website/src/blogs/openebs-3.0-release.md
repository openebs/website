---
title: OpenEBS 3.0 Release
author: Kiran Mova
author_info: Founder, Contributor and Maintainer of OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: OpenEBS
date: 24-09-2021
excerpt: Announcing OpenEBS 3.0 release - with ability to create 9 types of volumes. 
---
 
We released OpenEBS in early 2017 as one of the first solutions to adopt the Container Attached Storage pattern to deliver per workload storage in part by building upon Kubernetes.  OpenEBS is now one of the most popular storage solutions for Kubernetes; our metrics indicate that usage of OpenEBS has increased significantly in the last three years, by approximately 7x, with the most popular workloads being those that are resilient including NoSQL DBs that often do not use shared storage. 

A lot of the growth in usage by OpenEBS is due to the overall growth in Kubernetes for stateful workloads.  The [CNCF’s 2020 Survey](https://www.cncf.io/wp-content/uploads/2020/11/CNCF_Survey_Report_2020.pdf) highlighted 55% of surveyed organizations now use stateful applications in production. **The survey also highlighted MayaData / OpenEBS is in the top-5 list of popular storage solutions.**

Over the years, OpenEBS has steadily evolved into a full stack storage software with swappable storage engine, related control plane components, and integrations into other cloud native projects. 

A quick summary:
- **OpenEBS 1.0** was launched with the goal of simplifying the journey of users, who were  onboarding Stateful workloads into Kubernetes. The initial release included: 
  * A stable distributed block storage called “Jiva” backed by Longhorn engine. 
  * An initial version of the CStor engine based on ZFS that was much more resilient to node failures and optimized for working with Hard Drives and RAID. 
  * Also included components like Node Disk Manager that helped to manage the local storage on kubernetes nodes and Dynamic LocalPV Provisioners.
- **OpenEBS 2.0** focused on the stability of the data plane and building of an automated test framework, and the introduction of additional engines based on user feedback. This release included: 
  * Making OpenEBS a CNCF project - which meant streamlining a lot of project governance, development processes and moving towards CNCF provided tools. 
  * CStor data plane was declared stable, with support for incremental backup/restore support via Velero. 
  * E2e tests for all of the OpenEBS Engines using the Litmus framework, which went on to become a project of its own.
  * ZFS LocalPV provisioners (CSI Driver) was introduced.
  * Initial release of Mayastor - which was the result of investigations done on top of Jiva and CStor to improve the performance. 
- **OpenEBS 3.0** has been about enhancing the usability and stability aspects of all the previously introduced engines as well as support for new engines. The release is also about supporting the newer Kubernetes releases. This release includes:
  * CSI Drivers for CStor and Jiva and tools to migrate volumes to the newer CSI drivers. The legacy provisioners are deprecated with 3.0.0 and users are required to migrate to the corresponding CSI drivers asap. 
  * Several enhancements to existing LocalPV flavors and introduction of new types of LocalPV. 
  * A new control plane for Mayastor is being worked on that is better designed to handle scale and resiliency.
  * Also included are the initial version of a kubectl plugin for OpenEBS and a prometheus grafana mixin for managing the OpenEBS storage and volumes. 

## What’s new in OpenEBS 3.0?

OpenEBS 3.0 is a culmination of efforts geared towards laying the foundation for making it easier to onboard and accept community contributions, making each of the engine operators  ready for future kubernetes releases, making it easy to manage and troubleshoot various engines. This has been achieved via migration to latest Kubernetes constructs, ease of use improvements, bug fixes and most importantly refactoring the control plane and e2e test suites to independently enhance and release each of the engines. 

I highlight a few of these enhancements below.  

OpenEBS includes various storage engines developed for different workloads and use-cases. OpenEBS data engines can be classified into two categories - Local and Replicated.

### LocalPV - New Features and Enhancements

OpenEBS uses LocalPV provisioners to connect applications directly with storage from a single node. This storage object, known as LocalPV, is subject to the availability of the node on which it is mounted, making it a handy feature for fault-tolerant applications who prefer local storage over traditional shared storage. The OpenEBS LocalPV provisioner enables Kubernetes-based stateful applications to leverage several types of local storage features ranging from raw block devices to using capabilities of filesystems on top of those devices like LVM and ZFS. 

OpenEBS 3.0 includes the following enhancement to the LocalPV provisioner:
* Support for 3 new types of LocalPVs namely LVM LocalPV, Rawfile LocalPV, Partition Local PV in addition to the previously supported Hostpath LocalPV, Device LocalPV and ZFS LocalPV. 
* [OpenEBS Hostpath LocalPV (stable)](https://github.com/openebs/dynamic-localpv-provisioner), the first and the most widely used LocalPV now supports enforcing XFS quota, ability to use a custom node label for node affinity (instead of the default `kubernetes.io/hostname`) 
* [OpenEBS ZFS LocalPV (stable)](https://github.com/openebs/zfs-localpv), used widely for production workloads that need direct and resilient storage has added new capabilities like:
  * Velero plugin to perform incremental backups that make use of the copy-on-write ZFS snapshots.
  * CSI Capacity based scheduling used with `waitForFirstConsumer` bound Persistent Volumes. 
  * Improvements to inbuilt volume scheduler (used with `immediate` bound Persistent Volumes) that can now take into account the capacity and the count of volumes provisioned per node.
* [OpenEBS LVM LocalPV (stable)](https://github.com/openebs/lvm-localpv), can be used to provision volume on top of LVM Volume Groups and supports the following features:
  * Thick (Default) or Thin Provisioned Volumes 
  * CSI Capacity based scheduling used with `waitForFirstConsumer` bound Persistent Volumes. 
  * Snapshot that translates into LVM Snapshots 
  * Ability to set QoS on the containers using LVM Volumes.
  * Also supports other CSI capabilities like volume expansion, raw or filesystem mode, metrics. 
* [OpenEBS Rawfile LocalPV (beta)](https://github.com/openebs/rawfile-localpv), is a preferred choice for creating local volumes using a sparse file within a sub-directory that supports capacity enforcement, filesystem or block volumes.
* [OpenEBS Device LocalPV (beta)](https://github.com/openebs/dynamic-localpv-provisioner/blob/develop/docs/quickstart.md#provisioning-localpv-device-persistent-volume), is a preferred choice for running workloads that have typically worked well with consuming the full disks in block mode. This provisioner uses NDM to select the block device. 
* [OpenEBS Partition LocalPV (an alpha engine)](https://github.com/openebs/device-localpv), is under active development and is being deployed in select users for creating volumes by dynamically partitioning a disk with the requested capacity from the PVC. 

### ReplicatedPV - New Features and Enhancements

OpenEBS uses ReplcatedPV provisioners to connect applications to volumes - whose data is synchronously replicated to multiple storage nodes. This storage object, known as ReplicatedPV, is highly available and can be mounted from multiple nodes in the clusters. OpenEBS supports three types of ReplicatedPVs Jiva (based on Longhorn and iSCSI), CStor (based on ZFS and iSCSI) and Mayastor (based on SPDK and NVMe). 

Some enhancements to replicated storage engines in OpenEBS 3.0 include:
* [OpenEBS Jiva (stable)](https://github.com/openebs/jiva-operator), has added support for a CSI Driver and Jiva operator that include features like:
  * Enhanced management of the replicas 
  * Ability to auto-remount the volumes marked as read-only due to iSCSI time to read-write. 
  * Faster detection of the node failure and helping Kubernetes to move the application out of the failed node to a new node. 
  * 3.0 also deprecates the older Jiva volume provisioners - that was based on the kubernetes external storage provisioner. There will be no more features added to the older provisioners and users are requested to migrate their Volumes to CSI Drivers as soon as possible. 
* [OpenES CStor (stable)](https://github.com/openebs/cstor-operators), has added support for a CSI Driver and also improved customer resources and operators for managing the lifecycle of CStor Pools. This 3.0 version of the CStor includes:
  * The improved schema allows users to declaratively run operations like replacing the disks in mirrored CStor pools, add new disks, scale-up replicas,  or move the CStor Pools to a new node. The new custom resource for configuring CStor is called CStorPoolCluster (CSPC) compared to older StoragePoolCluster(SPC). 
  * Ability to auto-remount the volumes marked as read-only due to iSCSI time to read-write. 
  * Faster detection of the node failure and helping Kubernetes to move the application out of the failed node to a new node. 
  * 3.0 also deprecates the older CStor volume provisioners and pool operators based on SPC - that was based on the kubernetes external storage provisioner. There will be no more features added to the older provisioners and users are requested to migrate their Pools to CSPC and Volumes to CSI Drivers as soon as possible.
* [OpenES Maystor (beta)](https://github.com/openebs/mayastor), is under active development and currently is building a new and enhanced control plane to manage the mayastor pools and volumes. In the current release, the changes to the Mayastor include:
  * Support for deprecating the MOAC based control plane in favor of the new control plane. 
  * Enhanced control plane to handle node failure scenarios and move the volumes to new nodes. 
  * Stabilizing the Mayastor data engine for durability and performance. 
  * Enhanced E2e tests.

### Other Notable Features and Enhancements

Beyond the improvements to the data engines and their corresponding control plane, there are several new enhancements that will help with ease of use of OpenEBS engines:
* Several fixes and enhancements to the Node Disk Manager ranging from adding a to automatically adding a reservation tag to devices, detecting filesystem changes and updating the block device CR (without the need for a reboot), metrics exporter and an API service that can be extended in the future to implement storage pooling or cleanup hooks. 
* [Dynamic NFS Provisioner](https://github.com/openebs/dynamic-nfs-provisioner) that allows users to launch a new NFS server on any RWO volume (called backend volume) and expose an RWX volume that saves the data to the backend volume. 
* Kubernetes Operator for automatically upgrading Jiva and CStor volumes that are driven by a Kubernetes Job 
* Kubernetes Operator for automatically migrating CStor Pools and Volumes from older pool schema and legacy (external storage based) provisioners to the new Pool Schema and CSI volumes respectively. 
* [OpenEBS CLI (a kubectl plugin)](https://github.com/openebs/openebsctl) for easily checking the status of the block devices,  pools (storage) and volumes (PVs). 
* [OpenEBS Dashboard](https://github.com/openebs/monitoring) (a prometheus and grafana mixin) that can be installed via jsonnet or helm chart with a set of default Grafana Dashboards and AlertManager rules for OpenEBS storage engines. 
* Enhanced OpenEBS helm chart that can easily enable or disable a data engine of choice. The 3.0 helm chart stops installing the legacy CStor and Jiva provisioners. If you would like to continue to use them, you have to set the flag “legacy.enabled=true”. 
* OpenEBS helm chart includes sample kyverno policies that can be used as an option for PodSecurityPolicies(PSP) replacement. 
* OpenEBS images are delivered as multi-arch images with support for AMD64 and ARM64 and hosted on DockerHub, Quay and GHCR. 
* Support for installing in air gapped environments. 
* Enhanced Documentation and Troubleshooting guides for each of the engines located in the respective engine repositories. 
* A new and improved design for the [OpenEBS website](https://openebs.io/). 

### Deprecated Features

As announced in [June earlier this year](https://github.com/openebs/openebs/releases/tag/v2.10.0), the non-csi provisioners for CStor and Jiva are deprecated with 3.0. You can still continue to use them till Dec 2021. The older provisioners are released with the v2.12.2 version at the moment and only patch releases (to fix severe security vulnerabilities) will be supported going forward. 

## What is Next after OpenEBS 3.0? 

We originally developed OpenEBS that focused on solving the core issue of Kubernetes storage - that is the lack of support to manage stateful applications, especially modern resilient workloads that do not use shared storage and prefer the per workload approach of Container Attached Storage.  That remains our focus today - and as mentioned innovation seems to be accelerating as the community of users and contributors grows at an accelerated rate.  
I am especially thankful to the OpenEBS users and organizations that have taken the time to fill out [Adopters.md](https://github.com/openebs/openebs/blob/master/ADOPTERS.md) to share how they are using OpenEBS, and how it is solving their common problems while leveraging Kubernetes for data.  

I will also be talking about the new features, upgrades & bug fixes and giving glimpses into what is coming in OpenEBS 3.1 and 4.0 at the CNCF On-Demand Webinar: OpenEBS 3.0 : What’s in it on September 30th. Feel free to register & attend: https://community.cncf.io/events/details/cncf-cncf-online-programs-presents-cncf-on-demand-webinar-openebs-30-whats-in-it/

To learn more about recent updates, developer documentation, and scheduled releases, please feel free to use any of the following resources.
- https://github.com/openebs/openebs/releases
- https://github.com/openebs/openebs/blob/master/ADOPTERS.md. 
- https://openebs.io/docs
- https://openebs.io/community













