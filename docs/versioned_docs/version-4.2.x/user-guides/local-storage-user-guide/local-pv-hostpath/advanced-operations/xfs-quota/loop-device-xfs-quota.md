---
id: loop-device-xfs-quota
title: XFS Quota with Loop Device
keywords:
 - OpenEBS LocalPV Hostpath Modify XFS Quota
 - XFS Quota
 - XFS Quota with Loop Device
 - Advanced Operations
description: This section talks about creating XFS filesystem at the basepath as loop device. 
---

# XFS Quota with Loop Device

In scenarios where you do not have an existing device formatted with the XFS filesystem, you can create an XFS filesystem on a loop device. This process is particularly useful when the root filesystem is not XFS and it allows you to simulate an XFS-based storage environment.

This document outlines the steps to create a sparse file, format it with the XFS filesystem, and mount it as a loop device at the specified directory, `/var/openebs/local`, with project quota enabled.

## Create XFS filesystem at the Basepath as Loop Device (If filesystem is not XFS)

If your environment does not have a XFS filesystem, you can use a loop device to create an XFS filesystem. The following steps will guide you through the process of creating a 32MiB sparse file, formatting it with XFS, and mounting it with project quota enabled.

1. **Ensure XFS Utilities Are Installed**

Before proceeding, ensure that the library for managing xfs-fs is installed on your system.

**For Ubuntu/Debian-based Systems**

```
sudo apt update
sudo apt-get install -y xfsprogs
```

**For RHEL/CentOS-based Systems**

```
sudo yum install -y xfsprogs
```

2. **Create the Mount Directory**

Create the directory where the filesystem will be mounted.

```
sudo mkdir -p /var/openebs/local
cd /var/openebs
```

3. **Create a 32MiB Sparse File**

Create a sparse file of maximum size 32MiB.

```
sudo dd if=/dev/zero of=xfs.32M bs=1 count=0 seek=32M
```

4. **Format the Sparse File with XFS**

Format the newly created sparse file with the XFS filesystem.

```
sudo mkfs -t xfs -q xfs.32M
```

5. **Mount the Sparse File**

Finally, mount the sparse file as a loop device with project quota enabled. This will make the file accessible as a directory, `/var/openebs/local`.

```
sudo mount -o loop,rw xfs.32M -o pquota /var/openebs/local
```

## See Also

- [XFS Quota Prerequisites](xfs-quota-pre.md)
- [Enable XFS Quota on LocalPV Hostpath](enable-xfs-quota.md)
- [Modify XFS Quota on LocalPV Hostpath](modify-xfs-quota.md)