---
id: ext4-quota-pre
title: EXT4 Quota Prerequisites
keywords:
 - OpenEBS LocalPV Hostpath Enable EXT4 Quota
 - EXT4 Quota
 - EXT4 Quota Prerequisites
 - Advanced Operations
description: This section talks about the prerequisites of EXT4 quotas for OpenEBS LocalPV Hostpath.
---

# EXT4 Quota Prerequisites

To enable EXT4 Quota on LocalPV Hostpath, certain prerequisites must be met to ensure proper configuration and functionality. This involves installing the `quota` and `e2fsprogs` packages, verifying the filesystem type, enabling the project quota feature on the filesystem, and mounting it with the `prjquota` mount option.

The following steps outline the installation and configuration procedures for both root and data disk filesystems on Ubuntu, Debian, RHEL, and CentOS systems. By completing these steps, you will be ready to enable and manage EXT4 Quotas on your OpenEBS LocalPV Hostpath setup.

## Install the `quota` and `e2fsprogs` Packages

The `quota` package provides the `repquota` and `setquota` commands, and `e2fsprogs` provides the `tune2fs`, `chattr`, and `lsattr` commands.

**For Ubuntu/Debian Systems**

To install the packages on Ubuntu and Debian systems, execute the following command:

```
$ sudo apt-get update
$ sudo apt-get install -y quota e2fsprogs
```

**For RHEL/CentOS Systems**

To install the packages on RHEL/CentOS systems, execute the following command:

```
$ sudo yum install -y quota e2fsprogs
```

**For Fedora**

To install the packages on Fedora, execute the following command:

```
$ sudo dnf install -y quota e2fsprogs
```

## Check the Filesystem Type

Verify whether the filesystem of the hostPath directory is EXT4. The default hostPath directory is `/var/openebs/local`. Execute the following command to check the filesystem type and to identify the device where the filesystem is stored:

```
$ df -Th /var/openebs/local
```

**Example Output**

```
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/nvme1n1   ext4  8.0G  959M  7.1G  12% /mnt/data
```

If the above command fails because the path does not exist yet, execute the following script to check the filesystem type and host device name of the closest existing parent directory:

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

## Enable the Project Quota Feature on the Filesystem

Unlike XFS, an EXT4 filesystem must have the `project` and `quota` features enabled before project quotas can be used. Filesystems created by older versions of `mkfs.ext4` may not have them.

1. Check the features that are currently enabled on the device.

```
$ sudo tune2fs -l /dev/nvme1n1 | grep -i "filesystem features"
```

**Example Output**

```
Filesystem features:      has_journal ext_attr resize_inode dir_index filetype extent 64bit flex_bg sparse_super large_file huge_file dir_nlink extra_isize metadata_csum
```

In the example above, `project` and `quota` are not present, so they have to be enabled.

2. Unmount the filesystem. The features cannot be changed while the filesystem is mounted.

```
$ sudo umount /dev/nvme1n1
```

3. Check the filesystem for errors, which is recommended before changing its features.

```
$ sudo e2fsck -f /dev/nvme1n1
```

4. Enable the `project` and `quota` features.

```
$ sudo tune2fs -O project,quota /dev/nvme1n1
```

5. Verify that the features are now enabled.

```
$ sudo tune2fs -l /dev/nvme1n1 | grep -i "filesystem features"
```

**Expected Output**

```
Filesystem features:      has_journal ext_attr resize_inode dir_index filetype extent 64bit flex_bg sparse_super large_file huge_file dir_nlink extra_isize metadata_csum quota project
```

:::note
The `project` feature requires the filesystem to have an inode size of 256 bytes or more. This is the default for `mkfs.ext4`, but filesystems created with a smaller inode size cannot be converted, and have to be recreated. You can check the inode size with `sudo tune2fs -l /dev/nvme1n1 | grep -i "inode size"`.
:::

## Mount the Filesystem using the `prjquota` Mount Option

1. **Check Existing Mount Options**

Ensure that the mount options for the device include `prjquota`. Execute the following command to verify the mount options for the device (Example: `/dev/nvme1n1`).

```
$ sudo mount | grep "^/dev/nvme1n1"
```

**Example Output**

```
/dev/nvme1n1 on /mnt/data type ext4 (rw,relatime)
```

If the mount options already include `prjquota`, you can proceed to the next section to [Enable EXT4 Quota](enable-ext4-quota.md). If not, continue with the steps below.

2. **Mount the Device with the `prjquota` Option**

If the filesystem is the root filesystem (`/`), follow the instructions below. If the filesystem is located on a data disk, proceed to the [Filesystem on Data Disk](#filesystem-on-data-disk) section.

**Root Filesystem:**

To enable `prjquota` for the root filesystem, modify the `GRUB_CMDLINE_LINUX` option in the `/etc/default/grub` file.

- Edit the file `/etc/default/grub`.

```
$ sudo vi /etc/default/grub
```

- Locate the line containing the variable `GRUB_CMDLINE_LINUX`.

```
GRUB_CMDLINE_LINUX="console=tty0 crashkernel=auto net.ifnames=0 console=ttyS0"
```

- Add `rootflags=prjquota` at the end of the string. If the `rootflags` option is already present, append `prjquota` to the list of options.

```
GRUB_CMDLINE_LINUX="console=tty0 crashkernel=auto net.ifnames=0 console=ttyS0 rootflags=prjquota"
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
$ sudo mount | grep " / "
```

**Expected Output**

```
/dev/nvme0n1p1 on / type ext4 (rw,relatime,prjquota)
```

### Filesystem on Data Disk

If the filesystem is located on a data disk, follow these steps:

1. Unmount the filesystem on the data disk (Replace `/dev/nvme1n1` and `/mnt/data` with your device and mount path).

```
$ sudo umount /dev/nvme1n1
```

2. Mount the disk using the `prjquota` mount option.

```
$ sudo mount -o rw,prjquota /dev/nvme1n1 /mnt/data
```

3. Verify the mount options.

```
$ sudo mount | grep "^/dev/nvme1n1"
```

**Expected Output**

```
/dev/nvme1n1 on /mnt/data type ext4 (rw,relatime,prjquota)
```

4. Add the `prjquota` option to the `/etc/fstab` file for the data disk to make the changes persistent across reboots.

```
UUID=9cff3d69-3769-4ad9-8460-9c54050583f9 /mnt/data               ext4     defaults,prjquota 0 0
```

## See Also

- [Enable EXT4 Quota on LocalPV Hostpath](enable-ext4-quota.md)
- [Modify EXT4 Quota on LocalPV Hostpath](modify-ext4-quota.md)
- [EXT4 Quota with Loop Device](loop-device-ext4-quota.md)
