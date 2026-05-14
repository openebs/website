---
id: zfs-installation
title: Installation
keywords:
 - OpenEBS ZFS Local PV
 - ZFS Local PV
 - Prerequisites
 - Installation
description: This section explains the prerequisites and installation requirements to set up OpenEBS Local Persistent Volumes (PV) backed by the ZFS Storage. 
---

This section explains the prerequisites and installation requirements to set up OpenEBS Local Persistent Volumes (PV) backed by the ZFS Storage. 

## Prerequisites

Before installing the ZFS driver, make sure your Kubernetes Cluster must meet the following prerequisites:

1. All the nodes must have zfs utils installed.
2. ZPOOL has been set up for provisioning the volume.

## Setup

All the nodes should have zfsutils-linux installed. We should go to each node of the cluster and install zfs utils:

```
$ apt-get install zfsutils-linux
```

Go to each node and create the ZFS Pool, which will be used for provisioning the volumes. You can create the Pool of your choice, it can be striped, mirrored or raidz pool.

If you have the disk (say /dev/sdb), then you can use the below command to create a striped pool:

```
$ zpool create zfspv-pool /dev/sdb
```

You can also create mirror or raidz pool as per your need. Refer to the [OpenZFS Documentation](https://openzfs.github.io/openzfs-docs/) for more details.

If you do not have the disk, then you can create the zpool on the loopback device which is backed by a sparse file. Use this for testing purpose only.

```
$ truncate -s 100G /tmp/disk.img
$ zpool create zfspv-pool `losetup -f /tmp/disk.img --show`
```

Once the ZFS Pool is created, verify the pool via zpool status command, you should see the command similar as below:

```
$ zpool status
  pool: zfspv-pool
 state: ONLINE
  scan: none requested
config:

	NAME        STATE     READ WRITE CKSUM
	zfspv-pool  ONLINE       0     0     0
	  sdb       ONLINE       0     0     0

errors: No known data errors
```

Configure the [custom topology keys](../../../faqs/faqs.md#how-to-add-custom-topology-key-to-local-pv-zfs-driver) (if needed). This can be used for many purposes like if we want to create the PV on nodes in a particular zone or building. We can label the nodes accordingly and use that key in the storageclass for making the scheduling decision.

## Installation

Refer to the [OpenEBS Installation documentation](../../../quickstart-guide/installation.md) to install Local PV ZFS.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)
