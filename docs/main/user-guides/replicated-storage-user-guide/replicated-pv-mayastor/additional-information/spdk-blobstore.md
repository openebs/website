---
id: spdk-blobstore
title: Configuring SPDK Blobstore Cluster Size for Replicated PV Mayastor DiskPools
keywords:
 - Configuring SPDK Blobstore Cluster Size for Mayastor DiskPools
 - SPDK
 - SPDK Blobstore
 - Blobstore Cluster Size
description: This section explains the recommended practices for better performance.
---
# Configuring SPDK Blobstore Cluster Size for Replicated PV Mayastor DiskPools

## Overview

You can configure the Storage Performance Development Kit (SPDK) blobstore cluster size when creating a Replicated PV Mayastor DiskPool. Adjusting this value lets you optimize the on-disk layout for your specific workloads and device sizes.

- Smaller cluster sizes (default 4 MiB) provide better storage efficiency but generate more metadata overhead.
- Larger cluster sizes (for example, 16 MiB or 32 MiB) reduce metadata, speed up pool creation and imports, and improve performance for large sequential I/O operations.

:::note
Before modifying the default setting, carefully evaluate application I/O patterns and device size. For example: Smaller cluster size provides better storage efficiency and less internal fragmentation, but more metadata overhead. Larger cluster size will provide better performance for large sequential IOs, and low metadata overhead.
:::

### Configuration

1. Per-Pool Configuration (DiskPool CR)

Set the `cluster_size` field directly in your DiskPool custom resource manifest. This provides granular control for specific storage devices.

```
apiVersion: "openebs.io/v1beta3"
kind: DiskPool
metadata:
  name: <pool_name>
  namespace: <namespace>
spec:
  node: <none_name>
  disks: ["/disk/path"]
  cluster_size: 32MiB
```

2. Global Configuration (Helm Chart)

Set a global cluster size for all new pools that do not specify it in their custom resource. Provide the size in bytes.

```
--set openebs.engines.replicated.mayastor.agents.core.poolClusterSize=33554432
(The value above sets the global cluster size to 32 MiB.)
```

3. Volume Provisioning

A new storageclass parameter named `poolClusterSize` is provided. With this option, only the pools that match requested blobstore cluster size will be used for that volume’s replicas. If enough such pools are not found, to satisfy the volume’s replication factor, the provisioning will fail or in case of an existing volume the rebuilds might not be able to start.

### Recommendations

- This is an advanced user configuration. Proceed with caution and ensure that you fully understand the implications before modifying the default value of `4 MiB`.

- Typically, this configuration has been tested at `32 MiB` for device sizes upto `20 TiB`, where the pool import takes about three minutes on a performant cloud disk.

- For simpler management and more predictable replica scheduling, we recommend minimizing the number of different cluster sizes used in deployment environment. As a general guideline for node clusters utilizing large storage devices, configuring a global blobstore cluster size of `16 MiB` or `32 MiB` provides a strong balance of performance and efficiency.

### Benefits

Choosing a larger cluster size (Example: `16 MiB` or `32 MiB)` significantly reduces the amount of metadata that SPDK needs to manage.

- Faster Pool Creation: When a pool is created, the device is formatted by writing metadata for every cluster. Fewer clusters mean significantly less metadata to write, leading to a significant reduction in the time it takes to create a pool on a large device.

- Faster Pool Imports: During startup or recovery, Replicated PV Mayastor imports existing pools by reading their metadata from disk. A more compact metadata layout (due to larger clusters) requires fewer I/O operations, making the import process much quicker.

The performance of the disk also impacts the apparent benefits of this configuration.

## See Also

- [RDMA Enablement](../configuration/rs-rdma.md)
- [Create DiskPool(s)](../configuration/rs-create-diskpool.md)
- [Create StorageClass(s)](../configuration/rs-create-storageclass.md)
- [Storage Class Parameters](../configuration/rs-storage-class-parameters.md)
- [Topology Parameters](../configuration/rs-topology-parameters.md)
- [Deploy an Application](../configuration/rs-deployment.md)