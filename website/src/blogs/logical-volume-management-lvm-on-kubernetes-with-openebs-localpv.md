---
title: Logical Volume Management (LVM) on Kubernetes with OpenEBS LocalPV
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 17-06-2021
tags: Kubernetes, OpenEBS, LocalPV, LVM
excerpt: In large production environments, various physical disks are typically pooled to handle user and application storage needs. Logical Volume Management (LVM) is a storage virtualization technology that is a part of Linux which is widely used as a way to help administrators and developers abstract the physical configuration of storage devices for flexible and simpler provisioning. 
not_has_feature_image: false
---

## Introduction to Logical Volume Management

In large production environments, various physical disks are typically pooled to handle user and application storage needs. Logical Volume Management (LVM) is a **storage virtualization** technology that is a part of Linux which is widely used as a way to help administrators and developers **abstract the physical configuration** of storage devices for flexible and simpler provisioning. The LVM tool gathers all storage devices into volume groups, creates logical units depending on application needs, and then allocates them to particular groups. By doing so, LVM gives greater control, flexibility and easier abstraction of physical storage enabling use cases such as the replacement of local devices, local RAID and the ability to manage the sharing of JBODs across multiple hosts.

OpenEBS offers a **LVM option for LocalPV** that allows Kubernetes administrators to dynamically provision Persistent Volumes. This article delves into the architecture of Logical Volume Management and how to set up and use the **OpenEBS LVM LocalPV** to provision and manage storage for a Kubernetes cluster.

## LVM Architecture & Concepts

At its foundation, LVM combines several individual physical disks into one Volume Group that can be subdivided into multiple Logical Volumes. This is achieved by creating several layered abstractions between the physical drives and the end-user’s storage partitions.

![A typical PVC user request flow](/images/blog/a-typical-pvc-user-request-flow.png)  
(***A typical PVC user request flow***)

The various storage management structure that LVM uses to simplify the management of conflicting end-user storage needs, in increasing order of virtualization are: 

## Physical Volumes

These are regular storage devices that include physical disks such as HDDs, SSDs and RAIDs. Such units are essentially used as basic raw devices for achieving a level of abstraction. To manage a physical disk, the LVM assigns a header to it which it uses while allocating volumes.

### Volume Groups (VG)

Volume Groups are LVM’s higher level of abstraction and consist of one or more physical volumes. Once a physical storage device is added into a VG, the files stored inside it are partitioned into multiple smaller logical **extents** as specified by administrators when creating the Volume Group. Besides partition size, administrators can also set a VG’s security permissions and other specifications.

### Logical Volumes

A Volume Group (VG) is partitioned into several Logical Volumes (LVs) that can be perceived as flexible partitions of volume. LVs are the primary abstract interface through which end-users and applications interact with storage. 

Volumes in a Volume Group are partitioned into smaller segments known as **Extents**. While Physical volumes are divided into **Physical Extents**, Logical Volumes are divided into **Logical Extents**. An extent size is the smallest amount of space that the LVM can allocate since the Logical Volumes are just abstract mapping between physical and logical extents.

Extents give LVM flexibility since logical extents do not need to be directly and continuously mapped to physical extents. An LVM can duplicate and rearrange the physical extents in a physical volume without changing logical extents, eliminating the need to migrate users. This gives an efficient way of resizing logical extents by adding or removing physical extents from the volume.

### OpenEBS LVM LocalPV

The OpenEBS Container Storage Interface (CSI) driver allows Kubernetes administrators to dynamically resize Local Persistent Volumes using Logical Volume Management. There are several capabilities of OpenEBS LocalPV LVM that readers are encouraged to learn. These are available on both OpenEBS docs or via the published [OpenSource roadmap](https://github.com/orgs/openebs/projects/30). OpenEBS LocalPV LVM is a widely deployed project, which is under active development with the assistance of the broader OpenEBS community, including the hyper-scale eCommerce firm Flipkart. In the section below, we cover the steps to install a OpenEBS LVM driver in a Kubernetes cluster, along with highlighting its possible use-cases.

## Installing OpenEBS LVM into a Kubernetes Cluster

### Setup

For the CSI LVM driver to work on a cluster, it must meet the following prerequisites:

1. All nodes should have LVM2 utilities installed on their host systems. Additional details on LVM2 utilities can be found here: 

[Ubuntu - http://manpages.ubuntu.com/manpages/xenial/man8/lvm.8.html](http://manpages.ubuntu.com/manpages/xenial/man8/lvm.8.html)

[Red Hat - https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_logical_volumes/index](http://manpages.ubuntu.com/manpages/xenial/man8/lvm.8.html).

2. A Volume Group of block storage devices has been set up to provision volume for the cluster. 

3. The user has administrative rights so they can install RBAC components into the default namespace for objects created by the Kubernetes System: **kube-system**.

The OpenEBS CSI LVM driver supports Kubernetes 1.18 and newer versions, the Ubuntu OS and runs on LVM2 utilities. 

If you have a real physical device, you can use the command accordingly or can use a loopback device for testing. The following commands are used to locate the disk to be managed by LVM.

    $ truncate -s 1024G /tmp/disk.img               //marks the extents
    $ sudo losetup -f /tmp/disk.img --show       //finds unused device

The Volume Group is created on all nodes using commands similar to the following:

    $ sudo pvcreate /dev/sdb
    $ sudo vgcreate lvmvg /dev/sdb

This creates the Volume Group `lvmvg`. The same process must be followed to create Volume Groups on all nodes. 

### Installation

The OpenEBS CSI LVM driver can then be installed from the official repository by running the command:

    $ kubectl apply -f https://raw.githubusercontent.com/openebs/charts/gh-pages/lvm-operator.yaml

The following command can be used to check whether the driver and its components have been installed: 

    $ kubectl get pods -n kube-system -l role=openebs-lvm

Once the driver has been successfully installed, administrators can now use it to provision volumes through the steps to follow below.

### Provisioning Volumes with the LVM Driver

Provisioning Volumes with the OpenEBS LVM driver consists of three steps:

1. Creating a storage class
2. Creating a Persistent Volume Claim (PVC)
3. Deploying the Application

The manifest file for a storage class that allows the LVM driver to create volumes on specific nodes is as shown:

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
    name: darwin-lvmpv
    allowVolumeExpansion: true
    parameters:
    volgroup: "lvmvg"
    provisioner: local.csi.openebs.io
    allowedTopologies:
    - matchLabelExpressions:
    - key: kubernetes.io/hostname
        values:
        - lvmpv-node1
        - lvmpv-node2

The YAML file above instructs the LVM to deploy volumes from the Volume Group `lvmvg` to nodes `lvmpv-node1` and `lvmpv-node2`.

The Persistent Volume Claim for this storage class will look similar to:

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
    name: pvc-lvmpv
    spec:
    storageClassName: darwin-lvmpv
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
        storage: 4Gi

The application can now be allocated storage resources from the `darwin-vg` Volume Group.

## OpenEBS LocalPV LVM Use-Cases

Once the LVM driver has been installed in a cluster, it allows dynamic provisioning of LocalPV Volumes to Kubernetes applications. This is useful for applications such as:

* Dynamic resizing of assigned physical and logical volumes
* Creating smaller storage environments for tests and upgrades
* Tenant Isolation
* Backup and Recovery using redundant partitions 

By simplifying the management of users’ conflicting storage needs by abstracting logical and physical volumes, Logical Volume Management (LVM) is critical for managing production workloads efficiently. To do so, OpenEBS through a Container Storage Interface (CSI) Driver allows Kubernetes administrators to dynamically resize Local Persistent Volumes using Logical Volume Management. This enables an application-level **storage virtualization layer** for **greater control**, **flexibility** and **easier abstraction** of physical storage.