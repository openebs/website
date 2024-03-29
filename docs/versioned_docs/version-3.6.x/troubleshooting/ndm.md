---
id: ndm
title: Troubleshooting OpenEBS - NDM
keywords:
  - OpenEBS
  - NDM
  - NDM troubleshooting
  - OpenEBS NDM
  - OpenEBS NDM troubleshooting
  - Node Disk Manager
description: This page contains a list of Node Disk Manager (NDM) related troubleshooting information.
---

## General guidelines for troubleshooting

- Contact [OpenEBS Community](/docs/introduction/community) for support.
- Search for similar issues added in this troubleshooting section.
- Search for any reported issues on [StackOverflow under OpenEBS tag](https://stackoverflow.com/questions/tagged/openebs)

[Blockdevices are not detected by NDM](#bd-not-detected)

[Unable to claim blockdevices by NDM operator](#unable-to-claim-blockdevices)

### Blockdevices are not detected by NDM {#bd-not-detected}

One additional disk is connected to the node, with multiple partitions on the disk. Some of the partitions have a filesystem and is mounted. `kubectl get bd -n openebs` does not show any blockdevices. Ideally the blockdevice resources for the partitions should have been shown.

```shell hideCopy
NAME   FSTYPE MOUNTPOINT   SIZE
sda                        1.8T
├─sda1                     500G
├─sda2                     500G
├─sda3                     500G
└─sda4 ext4   /kubernetes  363G
sdb                       55.9G
├─sdb1 vfat   /boot/efi    512M
└─sdb2 ext4   /           55.4G
```

**Troubleshooting:**

Check the output of `lsblk` on the node and check the mountpoints of the partitions. By default NDM excludes partitions mounted at `/, /boot` and `/etc/hosts` (which is same as the partition at which kubernetes / docker filesystem exists) and the parent disks of those partitions. In the above example `/dev/sdb` is excluded because of root partitions on that disk. `/dev/sda4` contains the docker filesystem, and hence `/dev/sda` is also excluded.

**Resolution:**

The `ndm-config-map` needs to be edited.

1. Remove `/etc/hosts` entry from the os-disk-exclude-filter
2. Add the corresponding docker filesystem partition in exclude section of path filter. eg: `/dev/sda4`
3. Restart the NDM daemonset pods.

The blockdevices should now be created for the unused partitions.

### Unable to claim blockdevices by NDM operator{#unable-to-claim-blockdevices}

BlockDeviceClaims may remain in pending state, even if blockdevices are available in Unclaimed and Active state. The main reason for this will be there are no blockdevices that match the criteria specified in the BlockDeviceClaim. Sometimes, even if the criteria matches the blockdevice may be in an Unclaimed state.

**Troubleshooting:**

Check if the blockdevice is having any of the following annotations:

1.

```
  metadata:
    annotations:
      internal.openebs.io/partition-uuid: <uuid>
      internal.openebs.io/uuid-scheme: legacy
```

or

2.

```
metadata:
annotations:
internal.openebs.io/fsuuid: <uuid>
internal.openebs.io/uuid-scheme: legacy
```

If `1.` is present, it means the blockdevice was previously being used by cstor and it was not properly cleaned up. The cstor pool can be from a previous release or the disk already container some zfs labels.
If `2.` is present, it means the blockdevice was previously being used by localPV and the cleanup was not done on the device.

**Resolution:**

1. ssh to the node in which the blockdevice is present

2. If the disk has partitions, run wipefs on all of the partitions

```

wipefs -fa /dev/sdb1
wipefs -fa /dev/sdb9

```

3. Run wipefs on the disk

```

wipefs -fa /dev/sdb

```

4. Restart NDM pod running on the node

5. New blockdevices should get created for those disks and it can be claimed and used. The older blockdevices will go into an Unknown/Inactive state.

## See Also:

[FAQs](/docs/additional-info/faqs) [Seek support or help](/docs/introduction/community) [Latest release notes](/docs/introduction/releases)
