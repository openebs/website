---
id: rs-storage-class-parameters
title: Storage Class Parameters
keywords:
 - OpenEBS Replicated PV Mayastor
 - Replicated PV Mayastor Configuration
 - Configuration
 - Storage Class Parameters
description: This guide describes the Storage Class Parameters for Replicated PV Mayastor.
---

# Storage Class Parameters

Storage Class resource in Kubernetes is used to supply parameters to volumes when they are created. It is a convenient way of grouping volumes with common characteristics. All parameters take a string value. A brief explanation of each parameter is as follows.

:::warning
The Storage Class parameter `local` has been deprecated and is a breaking change in Replicated PV Mayastor version 2.0. Make sure that this parameter is not used.
:::

## "fsType"

A file system that will be used when mounting the volume. 
The supported file systems are **ext4**, **xfs** and **btrfs** and the default file system when not specified is **ext4**. We recommend using **xfs** that is considered to be more advanced and performant. 
Make sure the requested filesystem driver is installed on all worker nodes in the cluster before using it.

## "protocol"

The parameter `protocol` takes the value `nvmf`(NVMe over TCP protocol). It is used to mount the volume (target) on the application node.

## "repl"

The string value should be a number and the number should be greater than zero. The Replicated PV Mayastor control plane will try to keep always this many copies of the data if possible. If set to one then the volume does not tolerate any node failure. If set to two, then it tolerates one node failure. If set to three, then two node failures, etc.

## "thin"

The volumes can either be `thick` or `thin` provisioned. Adding the `thin` parameter to the StorageClass YAML allows the volume to be thinly provisioned. To do so, add `thin: true` under the `parameters` spec, in the StorageClass YAML. [Sample YAML](#create-replicated-pv-mayastor-storageclasss)
When the volumes are thinly provisioned, the user needs to monitor the pools, and if these pools start to run out of space, then either new pools must be added or volumes deleted to prevent thinly provisioned volumes from getting degraded or faulted. This is because when a pool with more than one replica runs out of space, Replicated PV Mayastor moves the largest out-of-space replica to another pool and then executes a rebuild. It then checks if all the replicas have sufficient space; if not, it moves the next largest replica to another pool, and this process continues till all the replicas have sufficient space.

:::info
The capacity usage on a pool can be monitored using [exporter metrics](../replicated-pv-mayastor/advanced-operations/monitoring.md#pool-metrics-exporter).
:::

The `agents.core.capacity.thin` spec present in the Replicated PV Mayastor helm chart consists of the following configurable parameters that can be used to control the scheduling of thinly provisioned replicas:

1. **poolCommitment** parameter specifies the maximum allowed pool commitment limit (in percent).
2. **volumeCommitment** parameter specifies the minimum amount of free space that must be present in each replica pool to create new replicas for an existing volume. This value is specified as a percentage of the volume size.
3. **volumeCommitmentInitial** minimum amount of free space that must be present in each replica pool to create new replicas for a new volume. This value is specified as a percentage of the volume size.

:::note
- By default, the volumes are provisioned as `thick`. 
- For a pool of a particular size, say 10 Gigabytes, a volume > 10 Gigabytes cannot be created, as Replicated PV Mayastor currently does not support pool expansion.
- The replicas for a given volume can be either all thick or all thin. The same volume cannot have a combination of thick and thin replicas.
:::

## "allowVolumeExpansion"

The parameter `allowVolumeExpansion` enables the expansion of PVs when using Persistent Volume Claims (PVCs). You must set the `allowVolumeExpansion` parameter to `true` in the StorageClass to enable the expansion of a volume. In order to expand volumes where volume expansion is enabled, edit the size of the PVC. Refer to the [Resize documentation](../replicated-pv-mayastor/advanced-operations/resize.md) for more details.

## "formatOptions"

The parameter  `formatOptions` allows you to specify additional formatting options to be used when formatting a device with a filesystem. By default, Replicated PV Mayastor uses the `ext4` filesystem to format devices. Depending on the `fsType` parameter, refer to the [Linux FS Documentation](https://man7.org/linux/man-pages/man8/mkfs.8.html) for supported formatting options.

## "overrideGlobalFormatOpts"

Replicated PV Mayastor provides a Helm key to define global `xfs` formatting options. These global options are applied to all volumes formatted with `xfs`. To override the global formatting options for a specific volume, set `overrideGlobalFormatOpts` to `true`. If both `formatOptions` and global Helm-defined options are specified for `xfs` volume, they will be concatenated. The `formatOptions` parameter can be used to add extra flags alongside the defaults.

For editing global options, set `overrideGlobalFormatOpts: true` and pass the edit flags in formatOptions.
 
For example:
If global options are `-m bigtime=0 -m inobtcount=0` and if you want to use different options for a specific volume, such as `-m bigtime=1 -m inobtcount=1` then configure the volume with:

```
overrideGlobalFormatOpts: true
formatOptions: "-m bigtime=1 -m inobtcount=1"
```

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Create DiskPool(s)](../configuration/rs-create-diskpool.md)
- [Create StorageClass(s)](../configuration/rs-create-storageclass.md)
- [Topology Parameters](../configuration/rs-topology-parameters.md)
- [Enable RDMA for Volume Targets](../configuration/rs-rdma.md)
- [Deploy an Application](../configuration/rs-deployment.md)