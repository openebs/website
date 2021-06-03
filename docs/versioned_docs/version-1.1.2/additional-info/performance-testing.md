---
sidebar_position: 1
---

# Performance Testing

## Steps for performance testing

### Setup cStorPool and StorageClass

Choose the appropriate disks (SSDs or SAS or Cloud disks) and create pool and create StorageClass. There are some performance tunings available and this configuration can be added in the corresponding StorageClass before provisioning the volume. The tunings are available in the StorageClass section.

For performance testing, performance numbers vary based on the following factors.

- The number of OpenEBS replicas (1 vs 3) (latency between cStor target and cStor replica)

- Whether all the replicas are in one zone or across multiple zones

- The network latency between the application pod and iSCSI target (cStor target)

The steps for running FIO based Storage benchmarking and viewing the results are explained in detail [here](https://github.com/openebs/performance-benchmark/tree/master/fio-benchmarks).
