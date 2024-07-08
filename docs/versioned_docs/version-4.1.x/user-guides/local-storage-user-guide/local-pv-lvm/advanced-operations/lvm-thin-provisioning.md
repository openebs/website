---
id: lvm-thin-provisioning
title: Thin Provisioning
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - ThinProvisioning
 - Advanced Operations
description: This section talks about the advanced operations that can be performed in the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 
---


LVM thin provisioning allows you to over-provision the physical storage. You can create file systems that are larger than the available physical storage. LVM thin provisioning allows you to create virtual disks inside a thin pool. The size of the virtual disk can be greater than the available space in the thin pool. You must monitor the thin pool and add more capacity when it starts to become full.

## Configuring ThinProvision Volume

For creating a thin-provisioned volume, use the thinProvision parameter in storage class. Its allowed values are: "yes" and "no". If we do not use this parameter by default its value will be "no" and it will work as thick provisioned volumes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: lvm-sc
allowVolumeExpansion: true
provisioner: local.csi.openebs.io
parameters:
  volgroup: "lvmvg"
  thinProvision: "yes"
```

Before creating a thin provision volume, make sure that the required thin provisioning kernel module `dm_thin_pool` is loaded on all the nodes.

To verify if the modules are loaded, run:
```
lsmod | grep dm_thin_pool
```

If modules are not loaded, then execute the following command to load the modules:
```
modprobe dm_thin_pool
```

## Extend the Thin Pool Size

Thin pools are just logical volumes, so if we need to extend the size of thin-pool
we can use the same command like, we have used for logical volumes extend, but we 
can not reduce the size of thin pool.

```
$ lvextend -L +15G lvmvg/thin_pool
  Extending logical volume thin_pool to 30.00 GiB
  Logical volume mythinpool successfully resized
```

## Configure Auto Extending of the Thin Pool (Configure Over-Provisioning protection)

:::important
The provisioner does not automatically enable monitoring (auto-extend) on the thin pool, as not all use cases necessitate auto-extension. In certain configurations, a thin pool may be required to extend, but not exceeding a certain limit. However, the lvm configuration does not offer a method to restrict the extension limit.
Hence, it is left to the user to configure thin pool auto-extend as needed.
:::

1. Since we automatically create a thin pool as part of first the thin volume provisioning,
we need to enable the monitoring using `lvchange` command on all thin pools
across the nodes to use the auto extend threshold feature.

   To Ensure monitoring of the logical volume is enabled.

   ```
   $ lvs -o+seg_monitor
    LV             VG    Attr       LSize Pool           Origin Data%  Meta%  Move Log Cpy%Sync Convert Monitor
    lvmvg_thinpool lvmvg twi-aotz-- 2.07g                       0.00   11.52                            not monitored
   ```


   If the output in the Monitor column reports, as above, that the volume is not monitored,
   then monitoring needs to be explicitly enabled. Without this step, an automatic extension of
   the logical thin pool will not occur, regardless of any settings in the `lvm.conf`.

   ```
   $ lvchange --monitor y lvmvg/lvmvg_thinpool
   ```

     Double-check that monitoring is now enabled by running the `lvs -o+seg_monitor` command a second time.
     The Monitor column should now report the logical volume is being monitored.

   ```
   $ lvs -o+seg_monitor
   LV             VG    Attr       LSize Pool           Origin Data%  Meta%  Move Log Cpy%Sync Convert Monitor
   lvmvg_thinpool lvmvg twi-aotz-- 2.07g                       0.00   11.52                            monitored
   ```

2. Editing the settings in the `/etc/lvm/lvm.conf` can allow auto-growth of the thin 
pool when required. By default, the threshold is 100% which means that the pool
will not grow. If we set this to, 75%, the Thin Pool will autoextend when the 
pool is 75% full. It will increase by the default percentage of 20% if the value
is not changed. We can see these settings using the command grep against the file.

   ```
   $ grep -E ‘^\s*thin_pool_auto’ /etc/lvm/lvm.conf 
   thin_pool_autoextend_threshold = 100
   thin_pool_autoextend_percent = 20
   ```