---
title: OpenEBS Node Device Management (NDM) — Troubleshooting tips
author: Akhil Mohan
author_info: Software Engineer @ MayaData, working on Cloud Native Tech.
date: 08-01-2020
tags: Docker, OpenEBS, Uncategorized, Troubleshooting, Tutorials
excerpt: OpenEBS Node Device Management (aka NDM) helps in discovering the block devices attached to Kubernetes nodes. In this blog, I will walk through some of the scenarios I have seen working with users on the OpenEBS Slack Channel.
---

OpenEBS Node Device Management (aka NDM) helps in discovering the block devices attached to Kubernetes nodes. For many clusters, the default configuration of NDM suffices, however there are some cases where further customizations are required.

> In this blog, I will walk through some of the scenarios I have seen working with Users on the [OpenEBS Slack Channel](http://slack.openebs.io/)

---

### NDM Quick Overview

For setting up NDM in secure mode, please see my previous [blog](https://blog.mayadata.io/openebs/configuring-openebs-to-run-with-security-enhanced-linux), and you can learn how NDM works [here](https://docs.openebs.io/docs/next/ndm.html). Here is a quick snapshot of the key components of NDM.

- NDM components are installed in the OpenEBS Namespace. Ensure that NDM pods part of the NDM DaemonSet are running on all the storage nodes. NDM Operator helps with allocating Block Devices to Block Device Claims and should be running.
- NDM DaemonSet pod discovers all the block devices attached to the node and creates BlockDevice custom resource for each device. Note that NDM will filter out some of the devices like loopback device and so forth as configured in the NDM ConfigMap. `kubectl get bd -n openebs`
- NDM creates a special type of devices called sparse devices depending on the `SPARSE_FILE_COUNT` and `SPARSE_FILE_SIZE` passed to the NDM Daemon. These devices are used in cases where nodes do not have any additional devices attached to the node and users would like to run their applications by carving out some spaces from the OS disk. The creation of sparse devices is disabled by default from OpenEBS 1.3.
- Users or Operators like cStor Operator, Local PV provisioner interact with NDM by creating a BlockDeviceClaim CR. The BlockDeviceClaim will have properties like nodeName, required Capacity etc., The NDM operator will match these properties with the available BlockDevices and associate the one that matches all the requirements to BlockDeviceClaim.

---

### NDM Known Issues / Future Development Items

- BlockDevices are not created for Partitions and LVM devices. If you need to use them, you have to manually create BlockDevice CR. The steps are mentioned in this [blog](https://blog.mayadata.io/openebs/creating-manual-blockdevice).

OK. Let us get started with some common issues reported and how to troubleshoot them.

---

#### Scenario #1

**BlockDevice CR is not created for a device available on my node.**

I have some disks attached to the node. Installed OpenEBS, but blockdevice resources are not created for the devices.

**Symptom:** I have some disks attached to the node. Installed OpenEBS, but blockdevice resources are not created for the devices.

**Troubleshooting:**

1. Check `lsblk` output of the node
2. Get the NDM config map.
3. Check if the mount point of the disk is excluded in the filter configurations in configmap.
4. From lsblk output check if the blockdevice you want to use is an LVM/software raid/ partition/LUKS filesystem. NDM currently does not support these types.
5. If none of the above works, the logs of NDM daemonset can be checked. It will have information of disk being detected, and at what point the disk was excluded from blockdevice creation, (like `excluded by path-filter`)

    ![blockdevice creation](https://cdn-images-1.medium.com/max/800/0*q8rBQFw284gRYqjg)

**Resolution:** Update the filter configuration in configmap and restart the NDM DaemonSet pod. This will create the blockdevices.

---

#### Scenario #2

**After node reboot, one blockdevice became inactive and another blockdevice was created.**

**Symptom:** When a node in the cluster is rebooted, A blockdevice resource on that node was marked as inactive and a new resource was created. The new blockdevice also has the same details as the old one.

**Troubleshooting:**

1. Check `lsblk` output of the node
2. Get the yaml of both blockdevices and compare them.
3. Check to see `spec.Path` is different in both outputs.
4. If yes, then the new blockdevice resource was created because the path changed
5. Check if `kubernetes.io/hostname` is different, if yes, then the blockdevice was created because the hostname of the node changed.

**Resolution:** If using cStor, the newly generated BD can be added in both SPC and CSP instead of the old BD resource. Thus the storage engine will claim the new BD resource and start using it.

**Root Cause:** Whenever the NDM deamonset pods shutdown, all the devices on that node will be marked into an Unknown state. When the pod comes backup, all the devices on that node are marked as inactive, and then individual devices are processed for their statuses.

NDM uses an md5 sum of WWN+Model+Serial of the disk to create its unique name. If none of these fields are available then NDM uses device path and hostname to create the blockdevice. There are chances that the device path/hostname has changed after reboot. If the path/hostname changes a new blockdevice resource will be created, and the old one will still be in the inactive state.

---

#### Scenario #3

**BlockDevices are created for already used disks in which OS is installed**

**Symptom:** NDM created blockdevice resources for disks which are already used for OS partitions. By default NDM excludes the blockdevices that are mounted at `/, /boot, /etc/hosts`. If these mount points are on an LVM or SoftRaid, NDM will not be able to identify that.

**Resolution:** Support for LVM and software RAID is in the design phase. Once it is supported the issue will be resolved.

---

#### Scenario #4

**Only one Blockdevice is created, when devices are connected in multipath configuration**

**Symptom:** There is a disk attached in multipath configuration to a node. i.e both sdb & sdc are the same devices. But blockdevice resource is created only for sdc.

**Resolution:** Support for detecting disks in multipath configuration and attaching the same disk to multiple nodes will be available in the future versions of NDM

**Root Cause:** NDM generates the UID for disk identification using the disk details like WWN, Serial, etc that are fetched from the disk. In case of a disk attached in multipath configuration, the details from both sdb and sdc will be the same. Therefore, NDM will first create a blockdevice for sdb, and then moves on to create for `sdc`. But at this stage, it will find that a blockdevice with that UID already exists and will update the blockdevice information with the new path `sdc`. This results in a blockdevice existing only for sdc.

---

#### Scenario #5

**Only single BlockDevice resource is created in a multi-node Kubernetes cluster on GKE.**

**Symptom:** On a multinode kubernetes cluster in GKE, with an external GPD attached to each node. NDM is creating only one blockdevice resource, instead of one blockdevice resource per node.

**Troubleshooting:**

1. Was the GPD added using the gcloud CLI or google cloud console web UI?
2. If the disk was added using gcloud CLI, check whether the ` — device-name` flag was specified during attaching the disk.

**Resolution:** The command to add disk using gcloud CLI should be

    gcloud compute instances attach-disk <node-name> --disk=disk-1 **--device-name=disk-1**

**Root Cause:** gcloud CLI uses the value provided in the `device-name` flag as the serial number of the GPD when it is attached to the node. If it is left blank, Google will assign a default serial number that is unique only to the node. When multiple nodes are present, and NDM generates the UID for the blockdevice, the disks on both nodes will have the same serial number and thus the same UID.

NDM from one node will create the blockdevice resource and when the other NDM daemon tries to create the resource, it finds that a resource already exists and just updates the resource.

This blog was originally published on Jan 7th, 2020 on [MayaData blog](https://blog.mayadata.io/openebs/openebs-node-device-management-ndm-troubleshooting-tips).
