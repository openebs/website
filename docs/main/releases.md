---
id: releases
title: OpenEBS Releases
keywords:
  - OpenEBS Releases
  - OpenEBS Release Notes
  - Releases
  - Release Notes
description: This page contains list of supported OpenEBS releases.
---

**Release Date: 12 February 2025**

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners.
The status of the various components as of v4.2.0 are as follows:

- Local Storage (a.k.a Local Engine)
  - [Local PV Hostpath 4.2.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)
  - [Local PV LVM 1.6.2](https://github.com/openebs/lvm-localpv) (stable)
  - [Local PV ZFS 2.7.1](https://github.com/openebs/zfs-localpv) (stable)

- Replicated Storage (a.k.a Replicated Engine)
  - [Replicated PV Mayastor 2.8.0](https://github.com/openebs/mayastor) (stable)

- Out-of-tree (External Storage) Provisioners 
  - [Local PV Hostpath 4.2.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)

- Other Components
  - [CLI 0.6.0](https://github.com/openebs/openebsctl) (beta)

## What’s New

OpenEBS is delighted to introduce the following new features:

### What’s New - Local Storage

- **Configurable Quota Options for ZFS Volumes**

You can now select between using `refquota` and `quota` for ZFS volumes, providing greater flexibility in managing resource limits.

- **Enhanced Compression Support with `zstd-fast` Algorithm**

Support for the `zstd-fast` compression algorithm has been introduced, offering improved performance when compression is enabled on ZFS volumes.

- **Merged CAS Config from PVC in Local PV Provisioner**

Enables merging CAS configuration from PersistentVolumeClaim to improve flexibility in volume provisioning.

- **Analytics ID and KEY Environment Variables**

Introduces support for specifying analytics ID and KEY as environment variables in the provisioner deployment.

- **Eviction Tolerations to the Provisioner Deployment**

Allows the provisioner deployment to tolerate eviction conditions, enhancing stability in resource-constrained environments.

- **Support for Incremental Builds and Helm charts in CI**

Added support for incremental builds and added Helm chart.

### What’s New - Replicated Storage

- **NVMeoF-RDMA Support for Replicated PV Mayastor Volume Targets**

Replicated PV Mayastor volume targets can now be shared over RDMA transport, allowing application hosts to achieve high throughput and reduced latency. This feature is enabled via a Helm chart option, which must be used alongside the existing network interface name to provide an RDMA-capable interface name. This enables NVMe hosts to leverage high-performance RDMA network infrastructure when communicating with storage targets.

- **CSAL FTL bdev Support**

SPDK FTL bdev (Cloud Storage Acceleration Layer - CSAL) support is now available, enabling the creation of layered devices with a fast cache device for buffering writes, which are eventually flushed sequentially to a base device. This allows the use of emerging storage interfaces such as Zoned Namespace (ZNS) and Flexible Data Placement (FDP)-capable NVMe devices.

- **Persistent Store Transaction API in IO-Engine**

Introduces a persistent store transaction API to improve data consistency and reliability.

- **Allowed HA Node to Listen on IPv6 Pod IPs**

Adds support for HA nodes to listen on IPv6 Pod IPs.

- **Made CSI Driver Operations Asynchronous**

Converts mount, unmount, and NVMe operations to use spawn_blocking. It also removes `async_stream` for gRPC over UDS in controller and node.

- **Eviction Tolerations**

Added eviction tolerations to the DSP operator deployment and CSI controller, updated LocalPV provisioner chart to 4.2, and renamed `tolerations_with_early_eviction` to `_tolerations_with_early_eviction_two` to avoid conflicts with the `LocalPV-provisioner _helpers.tpl` function.

## Fixes

### Fixed Issues - Local Storage

- **Environment Variable Handling**

This fix ensures the environment variable setting to disable event analytics reporting is properly honored.

- **Volume Provisioning Error for Existing ZFS volumes**

This fix ensures that if a ZFS volume already exists, the controller will provision the volume without error.

- **Indentation Issues in VolumeSnapshot CRDs**

VolumeSnapshot CRDs now have proper indentation formatting.

- **Introduced Per-Volume Mutex**

A per-volume mutex was introduced to prevent simultaneous CSI controller calls that might cause the volume CR to be inadvertently deleted.

- **Reservation Logic Bug during Volume Expansion**

A bug in the reservation logic during volume expansion (with refquota settings) has been resolved.

- **Removed Caching**

Removed caching for the openebs-ndm dependency to ensure fresh builds.

- **Fixed Trigger for `build_and_push` Workflow in CI**

Corrected the trigger configuration for the `build_and_push` workflow to ensure proper execution.

### Fixed Issues - Replicated Storage

- **Prevent Persistence of Faulty Child during Nexus Creation**

Fixed an issue where a child faulting before the nexus is open would be persisted as unhealthy, preventing future volume attachment.

- **Propagate Child I/O Error for Split I/O in SPDK**

Ensures proper error propagation when a child encounters an I/O error during split I/O operations.

- **Use Transport Info from NVMe Connect Response**

Fixed an issue where transport information from the NVMe connect response was not being used correctly.

- **Fixed Regression Causing Pool Creation Timeout Retry Issues**

Fixed a regression where pool creation retries were not handled properly due to timeout issues.

- **Handle Devices for Existing Subsystems in CSI Node**

This fix ensures proper handling of devices when dealing with existing subsystems.

- **Use Auto-Detected Sector Size for Block Devices**

Automatically detects and applies the correct sector size for block devices, improving compatibility and performance.

## Known Issues

### Known Issues - Local Storage

Local PV ZFS / Local PV LVM on a single worker node encounters issues after upgrading to the latest versions. The issue is specifically associated with the change of the controller manifest to a Deployment type, which results in the failure of new controller pods to join the Running state. The issue appears to be due to the affinity rules set in the old pod, which are not present in the new pods. As a result, since both the old and new pods have relevant labels, the scheduler cannot place the new pod on the same node, leading to scheduling failures when there's only a single node.
The workaround is to delete the old pod so the new pod can get scheduled. Refer to the issue [#3741](https://github.com/openebs/openebs/issues/3751) for more details.

### Known Issues - Replicated Storage

- When a pod-based workload is scheduled on a node that reboots, and the pod lacks a controller, the volume unpublish operation is not triggered. This causes the control plane to incorrectly assume the volume is published, even though it is not mounted. As a result, FIFREEZE fails during a snapshot operation, preventing the snapshot from being taken. To resolve this, reinstate or recreate the pod to ensure the volume is properly mounted.

- Replicated PV Mayastor does not support the capacity expansion of DiskPools as of v2.8.0.

- The IO engine pod has been observed to restart occasionally in response to heavy IO and the constant scaling up and down of volume replicas.

## Limitations (If any)

### Limitations - Replicated Storage

- As with the previous versions, the Replicated PV Mayastor IO engine makes full utilization of the allocated CPU cores regardless of IO load. This is the poller operating at full speed, waiting for IO.

- As with the previous versions, a Replicated PV Mayastor DiskPool is limited to a single block device and cannot span across more than one block device.

## Related Information

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For summary of what changes across all components in each release and to view the full Release Notes, see [OpenEBS Release 4.2.0](https://github.com/openebs/openebs/releases/tag/v4.2.0).

See version specific Releases to view the legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/installation.md)
- [Deployment](./deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)