---
id: releases
title: OpenEBS Release Notes
keywords:
  - OpenEBS Releases
  - OpenEBS Release Notes
  - Releases
  - Release Notes
description: This page contains list of supported OpenEBS releases.
---

**Release Date: 05 June 2026**

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners.
The status of the various components as of v4.5 are as follows:

| Component Type | Component | Version | Status |
| :--- | :--- | :--- | :--- |
| Replicated Storage | Replicated PV Mayastor | 2.11.0 | Stable |
| Local Storage | Local PV Hostpath | 4.5.0 | Stable |
| Local Storage | Local PV LVM | 1.9.0 | Stable |
| Local Storage | Local PV ZFS | 2.10.0 | Stable |
| Local Storage | Local PV Rawfile | 0.14.0 | Experimental |
| Out-of-tree (External Storage) Provisioners | Local PV Hostpath | 4.5.0 | Stable |
| Other Components | CLI | 4.5.0 | — |

## What’s New

### Replicated Storage

- **Offline Node Deletion (Node Purge)**

  Replicated PV Mayastor now supports offline node deletion (purge), allowing administrators to permanently remove an unreachable and unrecoverable node from the control plane without requiring access to the underlying host. Before performing the operation, you can review the expected impact on volumes and snapshots. This capability helps simplify recovery and cleanup workflows following permanent node or infrastructure failures.

- **Offline and Online Pool Deletion**

  Replicated PV Mayastor now supports deleting both offline and online Pools. Online pools can be deleted when they no longer contain replicas, while unrecoverable offline pools can be safely purged from the control plane after reviewing the impact on affected volumes and snapshots.

- **Disk I/O Failure and Hot-Removal Handling**

  Replicated PV Mayastor now improves storage fault visibility by detecting disk I/O failures, hot-removal events, stalled I/O conditions, and runtime disk I/O errors. DiskPools automatically report updated pool states, alerts, and diagnostic information, helping you identify unhealthy storage devices and understand workload impact during disk-related failures.

- **Experimental RWX Block Volume Support for KubeVirt Live Migration**

  Replicated PV Mayastor now provides experimental support for native ReadWriteMany (RWX) block volumes to enable KubeVirt Virtual Machine (VM) live migration without requiring an intermediary NFS layer. This capability allows KubeVirt workloads to migrate between nodes while maintaining access to shared block storage. This feature is intended for evaluation and testing in non-production environments.

- **RDMA QoS and DSCP Marking Support**

  Replicated PV Mayastor now supports configuring transport-level Quality of Service (QoS) settings for RDMA connections through DSCP marking. This enables integration with network QoS policies and allows administrators to prioritize storage traffic in RDMA-enabled environments.

### Local Storage

- **Node Deployment Mode for Local PV Hostpath**

  Local PV Hostpath now supports a node deployment mode for provisioning operations. This deployment model is designed for high-performance environments and helps reduce provisioning overhead by running provisioning workloads closer to the target node.

- **Quality of Service (QoS) Support for Local PV LVM**

  Local PV LVM now supports Quality of Service (QoS) controls through Kubernetes VolumeAttributesClass (VAC) resources. Administrators can define and dynamically update storage performance policies, including IOPS and bandwidth limits, without recreating PersistentVolumeClaims (PVCs). This capability enables predictable storage performance, simplifies resource governance, and provides greater flexibility for managing stateful workloads.

## Enhancements

### General

**Global Helm Values Support**

  Support for global Helm values has been added, simplifying configuration management and enabling more consistent deployment settings across OpenEBS components.

### Replicated Storage

- **Expanded Storage Observability**

  New metrics are available for DiskPool capacity, maximum expandable capacity, pool health alerts, replica counts, snapshot counts, and node status. These additions provide deeper visibility into storage utilization, cluster health, and operational status.

- **Node Shutdown State Awareness**

  Replicated PV Mayastor now exposes graceful node shutdown status through its APIs, enabling more accurate node state visibility and troubleshooting.

- **SPDK Interrupt Mode Support**

  Replicated PV Mayastor now supports SPDK interrupt mode and associated configuration options, providing an alternative I/O processing model that can help reduce CPU utilization in suitable environments.

### Local Storage

- **Configurable Worker Threads and Helper Pod Timeout**

  Local PV Hostpath now allows administrators to configure worker thread counts and helper pod timeout values. This provides greater control over provisioning behavior and enables tuning for different workload and cluster environments.

- **Configurable DNS Policy for Local PV ZFS Node Components**

  Local PV ZFS now allows administrators to configure the Kubernetes `dnsPolicy` for ZFS node components through the Helm chart, providing greater flexibility when deploying in customized networking environments.

## Fixes

### Replicated Storage

- **RWX Block Volume Migration Stability**

  Resolved issues that could cause repeated unpublish and republish operations during RWX block volume migrations, improving migration reliability and reducing disruption during failover events.

- **DiskPool Cleanup After Device Removal**

  Resolved issues affecting DiskPool cleanup and recovery when underlying storage devices were unexpectedly removed or became unavailable.

- **Storage Scheduling Reliability**

  Resolved an issue where replicas could be scheduled on pools in a critical state. Scheduling now correctly avoids unhealthy pools.

- **Node Unpublish Reliability**

  Resolved an issue where node unpublish operations could fail when the target path existed as an empty file.

- **Cross-Filesystem Restore Validation**

  Resolved an issue where restore operations could proceed between incompatible filesystem types. Restore requests are now validated to prevent unsupported cross-filesystem restores.

### Local Storage

- **Capacity Reporting for Thin-Provisioned Volumes for Local PV LVM**

  Resolved an issue where available capacity calculations for thin-provisioned storage could be inaccurate. Capacity reporting now correctly considers thin pool free space when determining available storage.

- **Improved ZFS Error Reporting**

  Resolved issues with error reporting by providing more detailed ZFS error messages directly from the underlying system. This simplifies troubleshooting and improves visibility into storage-related failures.

- **Graceful Filesystem Shutdown Handling for Local PV ZFS**

  Resolved issues affecting volume publish and unpublish operations when a filesystem entered a shutdown state. These improvements help ensure more reliable volume lifecycle operations during filesystem failure scenarios.

## Known Issues

### Replicated Storage

- If a node hosting a pod reboots and the pod lacks a controller (like a Deployment), the volume unpublish operation may not trigger. This causes the control plane to assume the volume is still in use, which leads to `fsfreeze` operation failure during snapshots.

**Workaround:** Recreate or rebind the pod to ensure proper volume mounting.

- Large pools (for example, 10–20 TiB) may experience extended recovery times after a dirty shutdown of the node hosting the io-engine.

- When using Replicated PV Mayastor on Oracle Linux 9 (kernel 5.14.x), servers may unexpectedly reboot during volume detach operations due to a kernel bug (CVE-2024-53170) in the block layer.
This issue is not caused by Mayastor but is triggered more frequently because of its NVMe-TCP connection lifecycle.

**Workaround:** Upgrade to kernel 6.11.11, 6.12.2, or later, which includes the fix.

### Local Storage

- For Local PV LVM and Local PV ZFS, you may face issues on single-node setups post-upgrade where the controller pod does not enter the `Running` state due to changes in the manifest and missing affinity rules.

**Workaround:** Delete the old controller pod to allow scheduling of the new one. This does not occur when upgrading from the previous release.

- For Local PV LVM, thin pool capacity is not unmapped or reclaimed and is also not tracked in the `lvmnode` custom resource. This may result in unexpected behavior.

## Limitations

### Replicated Storage

- The IO engine fully utilizes all allocated CPU cores regardless of the actual I/O load, as it runs a poller at full speed.
- Each DiskPool is limited to a single block device and cannot span across multiple devices.
- The data-at-rest encryption feature does not support rotation of Data Encryption Keys (DEKs).

## Related Information

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For release summaries and full version-level notes, see [OpenEBS Release 4.5](https://github.com/openebs/openebs/releases).

See version specific Releases to view the legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/prerequisites.md)
- [Deployment](./quickstart-guide/deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)