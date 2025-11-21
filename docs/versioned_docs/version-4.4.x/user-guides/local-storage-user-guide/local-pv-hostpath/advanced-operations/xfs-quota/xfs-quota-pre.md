---
id: xfs-quota-pre
title: XFS Quota Prerequisites
keywords:
 - OpenEBS LocalPV Hostpath Enable XFS Quota
 - XFS Quota
 - XFS Quota Prerequisites
 - Advanced Operations
description: This section talks about the prerequisites of XFS quotas for OpenEBS LocalPV Hostpath. 
---

# XFS Quota Prerequisites

To enable XFS Quota on LocalPV Hostpath, certain prerequisites must be met to ensure proper configuration and functionality. This involves installing the necessary `xfsprogs` package, verifying the filesystem type, and configuring the appropriate mount options, such as `pquota`.

The following steps outline the installation and configuration procedures for both root and data disk filesystems on Ubuntu, Debian, RHEL, and CentOS systems. By completing these steps, you will be ready to enable and manage XFS Quotas on your OpenEBS LocalPV Hostpath setup.

## Install the `xfsprogs` Package

**For Ubuntu/Debian Systems**

To install the `xfsprogs` package on Ubuntu and Debian systems, execute the following command:

```
$ sudo apt-get update
$ sudo apt-get install -y xfsprogs
```

**For RHEL/CentOS Systems**

To install the xfsprogs package on RHEL/CentOS systems, execute the following command:

```
$ sudo yum install -y xfsprogs
```

**For Fedora**

To install the xfsprogs package on Fedora, execute the following command:

```
$ sudo dnf install -y xfsprogs
```

## Mount Filesystem using the `pquota` Mount Option

1. **Check the Filesystem Type**

Verify whether the filesystem of the hostPath directory is XFS. The default hostPath directory is `/var/openebs/local`. Execute the following command to check if the filesystem is XFS and to identify the device where the filesystem is stored:

```
$ df -Th /var/openebs/local
```

**Example Output**

```
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/nvme0n1p1 xfs   8.0G  959M  7.1G  12% /
```

If the above command fails due to the path not yet existing, execute the following script to check the filesystem type and host device name of the directory:

```
BASEPATH="/var/openebs/local"

until OUTPUT=$(df -Th $BASEPATH 2> /dev/null)
do
BASEPATH=$(echo "$BASEPATH" | sed 's|\(.*\)/.*|\1|')
done

echo "PATH=${BASEPATH}"
#Final output
echo "$OUTPUT"
```

2. **Check Existing Mount Options**

Ensure that the mount options for the device found in Step 1 include `pquota` or `prjquota`. Execute the following command to verify the mount options for the device (Example: `/dev/nvme0n1p1`).

```
$ sudo mount | grep "^/dev/nvme0n1p1"
```

**Example Output**

```
/dev/nvme0n1p1 on / type xfs (rw,relatime,seclabel,attr2,inode64,noquota)
```

If the mount options already include `pquota` or `prjquota`, you can proceed to the next section to [Enable XFS Quota](enable-xfs-quota.md). If not, continue with Step 3.

3. **Mount the Device with `pquota` Option**

In this step, we will mount the device using the `pquota` mount option. If the filesystem is the root filesystem (/), follow the instructions below. If the filesystem is located on a data disk, you can proceed to the [Filesystem on Data Disk](#filesystem-on-data-disk) section.

**Root Filesystem:**

To enable `pquota` for the root filesystem, modify the `GRUB_CMDLINE_LINUX` option in the `/etc/default/grub` file.

- Edit the file `/etc/default/grub`.

```
$ sudo vi /etc/default/grub
```

- Locate the line containing the variable `GRUB_CMDLINE_LINUX`.

```
GRUB_CMDLINE_LINUX="console=tty0 crashkernel=auto net.ifnames=0 console=ttyS0"
```

- Add `rootflags=pquota` at the end of the string. If `rootflags` option is already present, append `pquota` to the list of options.

```
GRUB_CMDLINE_LINUX="console=tty0 crashkernel=auto net.ifnames=0 console=ttyS0 rootflags=pquota"
```

- Locate the `grub.cfg` file. The file path may vary based on your OS.

  - /boot/grub2/grub.cfg
  - /boot/efi/EFI/ubuntu/grub.cfg
  - /boot/efi/EFI/debian/grub.cfg
  - /boot/efi/EFI/redhat/grub.cfg
  - /boot/efi/EFI/centos/grub.cfg
  - /boot/efi/EFI/fedora/grub.cfg

- Create a backup copy of the existing `grub.cfg`. The sample commands below use the path `/boot/grub2/grub.cfg`. Replace the paths with your `grub.cfg` path.

```
$ sudo cp /boot/grub2/grub.cfg /boot/grub2/grub.cfg.backup
```

- Generate a new `grub.cfg` that includes the changes.

```
$ sudo grub2-mkconfig -o /boot/grub2/grub.cfg
```

- Reboot the system.

```
$ sudo reboot
```

- After rebooting, check the mount options again to confirm the changes.

```
$ sudo mount | grep "^/dev/nvme0n1p1"
```

**Expected Output**

```
/dev/nvme0n1p1 on / type xfs (rw,relatime,seclabel,attr2,inode64,prjquota)
```

### Filesystem on Data Disk

If the filesystem is located on a data disk, follow these steps:

1. Unmount the filesystem on the data disk (Replace `/dev/nvme1n1` and `/mnt/data` with your device and mount path).

```
$ sudo umount /dev/nvme1n1
```

2. Mount the disk using the `pquota` mount option.

```
$ sudo mount -o rw,pquota /dev/nvme1n1 /mnt/data
```

:::caution
`pquota` is not usable with `remount` mount option.
:::

3. Verify the mount options.

```
$ sudo mount | grep "^/dev/nvme1n1"
```

**Expected Output**

```
/dev/nvme1n1 on /mnt/data type xfs (rw,relatime,seclabel,attr2,inode64,prjquota)
```

4. Add the `pquota` option to the `/etc/fstab` file for the data disk to make the changes persistent across reboots.

```
UUID=9cff3d69-3769-4ad9-8460-9c54050583f9 /mnt/data               xfs     defaults,pquota 0 0
```

## See Also

- [Enable XFS Quota on LocalPV Hostpath](enable-xfs-quota.md)
- [Modify XFS Quota on LocalPV Hostpath](modify-xfs-quota.md)
- [XFS Quota with Loop Device](xfs-quota-pre.md)