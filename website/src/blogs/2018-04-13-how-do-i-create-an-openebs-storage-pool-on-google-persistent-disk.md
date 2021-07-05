---
title: How do I create an OpenEBS storage pool on Google Persistent Disk
author: Karthik Satchitanand
author_info: Karthik has been into the Design and Development of tools for infrastructure as code, software testing performance & benchmarking & chaos engineering.
date: 13-04-2018
tags: Docker, OpenEBS, Solutions, Google Cloud Platform, Kubernetes
excerpt: The OpenEBS volume replicas, which are the actual backend storage units of the OpenEBS iSCSI target currently store the data in a hostPath on the Kubernetes nodes.
---

This article belongs to #HowDoI series on Kubernetes and OpenEBS.

The OpenEBS volume replicas, which are the actual backend storage units of the OpenEBS iSCSI target currently store the data in a hostPath on the Kubernetes nodes. By default, a folder with the volume (PV) name is created on the root filesystem, in a parent directory (/var/openebs) & bind mounted into the container during the replica pod instantiation. This parent directory (also created if not already available), which is basically a persistent path to hold the individual volumes is referred to as a **_Storage Pool_**.

Note: The notion of the storage pool described above is specific to the current default storage engine,i.e., Jiva. Future releases may see availability of additional storage-engines which can consume block devices instead of hostdir to create storage pools

For various reasons, it may be desirable to create this storage pool on an external disk (GPD, EBS, SAN) mounted into specific locations on the Kubernetes nodes. This is facilitated by the **OpenEBS storage pool policy**, which defines the storage pool as a **_Kubernetes Custom Resource_** with the persistent path as an attribute.

This blog will focus on the steps to be followed to create the OpenEBS PV on Google Persistent Disks (GPD).

## PRE-REQUISITES

- 3-Node GKE cluster with the OpenEBS Operator installed (Refer: [https://docs.openebs.io/docs/cloudsolutions.html](https://docs.openebs.io/docs/cloudsolutions.html))
- 3-Google Persistent Disks, one attached to each node of the cluster.This can be done using the **_gcloud compute disks create_** & **_gcloud compute instances attach-disk_** commands (Refer for console steps: [https://cloud.google.com/compute/docs/disks/add-persistent-disk#create_disk](https://cloud.google.com/compute/docs/disks/add-persistent-disk#create_disk))

### STEP-1: Format the GPDs & Mount into desired path

On each node, perform the following actions :

- Switch to root user _sudo su –_
- Identify GPD attached _fdisk -l_

  ```
  root@gke-oebs-staging-default-pool-7cc7e313-0xs4:~# fdisk -l
  Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
  Units: sectors of 1 \* 512 = 512 bytes
  Sector size (logical/physical): 512 bytes / 4096 bytes
  I/O size (minimum/optimal): 4096 bytes / 4096 bytes
  Disklabel type: dos
  Disk identifier: 0x635eaac1

  Device Boot Start End Sectors Size Id Type
  /dev/sda1 \* 2048 209715166 209713119 100G 83 Linux

  Disk /dev/sdb: 10 GiB, 10737418240 bytes, 20971520 sectors
  Units: sectors of 1 \* 512 = 512 bytes
  Sector size (logical/physical): 512 bytes / 4096 bytes
  I/O size (minimum/optimal): 4096 bytes / 4096 bytes
  ```

- Format the disk with, say ext4 fs (_mkfs.ext4 /dev/sd<>)_

  ```
  root@gke-oebs-staging-default-pool-7cc7e313-0xs4:~# mkfs.ext4 /dev/sdb
  mke2fs 1.42.13 (17-May-2015)
  /dev/sdb contains a ext4 file system
  last mounted on /openebs on Fri Apr 13 05:03:42 2018
  Proceed anyway? (y,n) y
  Discarding device blocks: done
    Creating filesystem with 2621440 4k blocks and 655360 inodes
  Filesystem UUID: 87d36681-d5f3-4169-b7fc-1f2f95bd527e
  Superblock backups stored on blocks:
  32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632

  Allocating group tables: done
    Writing inode tables: done
    Creating journal (32768 blocks): done
  Writing superblocks and filesystem accounting information: done
  ```

- Mount the disk into desired mount point (_mount -o sync /dev/sd<> /mnt/openebs_)

  ```
  root@gke-oebs-staging-default-pool-7cc7e313-0xs4:~# mount -o sync /dev/sdb /mnt/openebs/
  root@gke-oebs-staging-default-pool-7cc7e313-0xs4:~# mount | grep openebs
  /dev/sdb on /mnt/openebs type ext4 (rw,relatime,sync,data=ordered)
  ```

### STEP-2 : Create a storage pool custom resource

- Construct a storage pool resource specification as shown below & apply it (Note that the custom resource definition for the storage pool is already applied as part of the operator install)

  ```
  apiVersion: openebs.io/v1alpha1
  kind: StoragePool
  metadata:
  name: sp-mntdir
  type: hostdir
  spec:
  path: "/mnt/openebs"
  ```

### STEP-3 : Refer the storage pool in a custom storage class

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: openebs-custom
provisioner: openebs.io/provisioner-iscsi
parameters:
  openebs.io/storage-pool: "sp-mntdir"
  openebs.io/jiva-replica-count: "3"
  openebs.io/volume-monitor: "true"
  openebs.io/capacity: 5G
```

### STEP-4 : Use the custom storage class in an application’s PVC spec

```
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-custom
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```

### STEP-5 : Confirm volume is created on the storage pool

- Once the OpenEBS PV is created (_kubectl get pv, kubectl get pods_), list the contents of the custom persistent path mentioned in the storage pool custom resource. It should contain a folder with the PV name consisting of the sparse files (disk image files)

  ```
  karthik_s@strong-eon-153112:~$ kubectl get pv
  NAME CAPACITY ACCESS MODES RECLAIM POLICY STATUS CLAIM STORAGECLASS REASON AGE
  pvc-556e7ab7-3ed9-11e8-8e6a-42010a800216 5G RWO Delete Bound default/demo-vol1-claim openebs-custom 59m

  root@gke-oebs-staging-default-pool-7cc7e313-0xs4:~# ls /mnt/openebs/
  lost+found pvc-556e7ab7-3ed9-11e8-8e6a-42010a800216
  ```

### GOTCHAS !!

_Issue_: GPDs are detached in the event of a) Cluster resize (downscale/upscale) , b) upgrades & c) VM halts

- No options to add “additional disks” during cluster creation
- Instance templates are “immutable”, disks have to be added to instances separately

_Workaround_: Perform a manual re-attach in above situations (Enlarged root disks are an option, but generally not recommended)
