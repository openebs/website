---
id: loop-device-ext4-quota
title: EXT4 Quota with Loop Device
keywords:
 - OpenEBS LocalPV Hostpath EXT4 Quota with Loop Device
 - EXT4 Quota
 - EXT4 Quota with Loop Device
 - Advanced Operations
description: This section talks about creating an EXT4 filesystem at the basepath as a loop device.
---

# EXT4 Quota with Loop Device

In scenarios where you do not have an existing device formatted with an EXT4 filesystem that has project quota enabled, you can create one on a loop device. This process is particularly useful when the root filesystem cannot be remounted with `prjquota`, and it allows you to try out project quota enforcement without repartitioning a disk.

This document outlines the steps to create a sparse file, format it with the EXT4 filesystem with the project quota features enabled, and mount it as a loop device at the specified directory, `/var/openebs/local`.

## Create an EXT4 Filesystem at the Basepath as a Loop Device

1. **Ensure the Required Utilities Are Installed**

Before proceeding, ensure that `e2fsprogs` and `quota` are installed on your system.

**For Ubuntu/Debian-based Systems**

```
sudo apt update
sudo apt-get install -y quota e2fsprogs
```

**For RHEL/CentOS-based Systems**

```
sudo yum install -y quota e2fsprogs
```

2. **Create the Mount Directory**

Create the directory where the filesystem will be mounted.

```
sudo mkdir -p /var/openebs/local
cd /var/openebs
```

3. **Create a Sparse File**

Create a sparse file of maximum size 1GiB. Use a size that can accommodate the volumes you intend to provision.

```
sudo dd if=/dev/zero of=ext4.1G bs=1 count=0 seek=1G
```

4. **Format the Sparse File with EXT4**

Format the newly created sparse file with the EXT4 filesystem, enabling the `quota` and `project` features that project quotas require.

```
sudo mkfs.ext4 -F -O quota,project ext4.1G
```

5. **Mount the Sparse File**

Mount the sparse file as a loop device with project quota enabled. This will make the file accessible as the directory `/var/openebs/local`.

```
sudo mount -o loop,rw,prjquota ext4.1G /var/openebs/local
```

6. **Verify the Mount Options**

```
sudo mount | grep "/var/openebs/local"
```

**Expected Output**

```
/var/openebs/ext4.1G on /var/openebs/local type ext4 (rw,relatime,prjquota)
```

You can now proceed to [Enable EXT4 Quota on LocalPV Hostpath](enable-ext4-quota.md).

## See Also

- [EXT4 Quota Prerequisites](ext4-quota-pre.md)
- [Enable EXT4 Quota on LocalPV Hostpath](enable-ext4-quota.md)
- [Modify EXT4 Quota on LocalPV Hostpath](modify-ext4-quota.md)
