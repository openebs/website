---
id: lvm-installation
title: Installation
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Installation
 - Prerequisites
description: This section explains the prerequisites and installation requirements to set up OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 
---

This section explains the prerequisites and installation requirements to set up OpenEBS Local Persistent Volumes (PV) backed by LVM Storage.

## Prerequisites

Before installing the LVM driver, make sure your Kubernetes Cluster must meet the following prerequisites:

1. All the nodes must have lvm2 utils installed and the dm-snapshot kernel module loaded.

## Setup Volume Group

Find the disk that you want to use for the LVM, for testing you can use the loopback device.

```
truncate -s 1024G /tmp/disk.img
sudo losetup -f /tmp/disk.img --show
```

Create the Volume group on all the nodes, which will be used by the LVM Driver for provisioning the volumes.

```
sudo pvcreate /dev/loop0
sudo vgcreate lvmvg /dev/loop0       ## here lvmvg is the volume group name to be created
```

## Installation

For installation instructions, see [here](../../../quickstart-guide/installation.md).

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)