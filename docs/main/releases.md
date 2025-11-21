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

**Release Date: 21 November 2025**

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners.
The status of the various components as of v4.4 are as follows:

| Component Type | Component | Version | Status |
| :--- | :--- | :--- | :--- |
| Replicated Storage | Replicated PV Mayastor | 2.10.0 | Stable |
| Local Storage | Local PV Hostpath | 4.4.0 | Stable |
| Local Storage | Local PV LVM | 1.8.0 | Stable |
| Local Storage | Local PV ZFS | 2.9.0 | Stable |
| Local Storage | Local PV Rawfile | 0.12.0 | Experimental |
| Out-of-tree (External Storage) Provisioners | Local PV Hostpath | 4.4.0 | Stable |
| Other Components | CLI | 4.4.0 | — |

## What’s New

### General

- **Support for Installing Both Replicated PV Mayastor and Local PV LVM on OpenShift**

  You can now install both Replicated PV Mayastor and Local PV LVM on OpenShift using a unified Helm-based deployment process. In earlier releases, only Replicated PV Mayastor installation was supported on OpenShift.

### Replicated Storage

- **DiskPool Expansion**

  You can now expand existing Replicated PV Mayastor DiskPools using the maxExpansion parameter. This feature allows controlled, on-demand capacity increases while preventing ENOSPC errors and ensuring uninterrupted application availability.

- **Safely Pause Pool Activity**

  You can now temporarily cordon Replicated PV Mayastor pools to block new replicas, snapshots, restores, or imports. This feature helps you perform maintenance or decommission storage safely while keeping existing data fully available and unaffected.

- **Optimize Storage Performance**

  You can now configure the SPDK blobstore cluster size when creating Replicated PV Mayastor DiskPools. This option lets you fine-tune on-disk layout and performance for your workloads—using smaller clusters for efficiency or larger clusters for faster pool creation, imports, and sequential I/O operations.

- **Kubeconfig Context Switching for `kubectl-mayastor`**

  The `kubectl-mayastor` plugin now supports kubeconfig context switching, making it easier for administrators to manage multi-cluster environments.

- **Support for 1GiB HugePages**

  1 GiB HugePages are now supported, enabling improved performance for memory-intensive workloads and providing greater flexibility when tuning systems for high-performance environments.

### Local Storage

- **Local PV LVM Snapshot Restore**

  Snapshot Restore is now supported for Local PV LVM. This brings Local PV LVM to parity with Replicated PV Mayastor and Local PV ZFS, which already supported snapshot-based volume restoration.

## Enhancements

### Replicated Storage

- **Improved Replica Health Management**

  Replica health updates are now performed as an atomic etcd transaction, significantly improving consistency and reliability during replica state changes.

- **Enhanced Nexus Subsystem Stability**

  The system now ensures that a single unhealthy nexus cannot impact or block the entire nexus subsystem, improving overall storage resiliency and workload stability.

- **Pre-Validation of Kubernetes Secrets for DiskPools**

  The diskpool operator now validates Kubernetes secrets before creating a pool, providing earlier error detection and faster troubleshooting.

- **Improved Device Event Handling via udev Kernel Monitor**

  Device detection has been improved by using the udev kernel monitor, providing faster and more reliable NVMe device event handling.

### Local Storage

- **ThinPool Space Reclamation Improvements**

  Local PV LVM now automatically cleans up the thinpool Logical Volume (LV) when the last thin volume associated with the thinpool is deleted. This optimization helps reclaim storage space efficiently.

- **Configurable Resource Requests and Limits for Local PV ZFS Components**

  You can now configure CPU and memory requests and limits for all `zfs-node` and `zfs-controller` containers through the `values.yaml` file. This enhancement provides greater control over resource allocation and improves deployment flexibility across diverse cluster environments.

## Fixes

### Replicated Storage

- **Resolved Lost udev Events Affecting NVMe Devices**

  Fixed a race condition where missing udev events caused NVMe devices to fail to connect. Device discovery is now more reliable.

- **Improved Pool Creation on Slow or Large Storage Devices**

  Fixed an issue where pool creation could fail or time out on very slow or very large storage devices.

- **Correct gRPC Port Usage in Metrics Exporter**

  Resolved an issue where the metrics exporter could use an incorrect gRPC port, ensuring accurate metrics collection.

- **Fix for mkfs Hanging on Large Pools/Volumes**

  Resolved an issue where filesystem creation could hang on very large pools or volumes, improving provisioning reliability.

- **Agent-Core Panic During Replica Scheduling**

  Fixed a panic in agent-core when scheduling replicas, improving system stability during heavy provisioning operations.

### Local Storage

- **PVC Provisioning Failure with Empty Selector**

  Resolved an issue where PersistentVolumeClaim (PVC) provisioning for Local PV Hostpath volumes could fail when the `.spec.selector` field was left empty. PVCs without a selector now provision successfully as expected.

- **Corrected Scheduling Behavior for Local PV LVM**

  Scheduling logic for Local PV LVM has been corrected to ensure reliable provisioning. Thinpool statistics are now properly recorded, thinpool free space is considered during scheduling, and CreateVolume requests for thick PVCs now fail early when insufficient capacity is available.

- **Correct Encryption Handling for Local PV ZFS Clone Operations**

  Resolved an issue where Local PV ZFS clone creation attempted to set a read-only encryption property. Clone volumes now correctly inherit encryption from their parent snapshots without passing unsupported parameters.

## Known Issues

### Replicated Storage

- If a node hosting a pod reboots and the pod lacks a controller (like a Deployment), the volume unpublish operation may not trigger. This causes the control plane to assume the volume is still in use, which leads to `fsfreeze` operation failure during snapshots.

**Workaround:** Recreate or rebind the pod to ensure proper volume mounting.

- If a disk backing a DiskPool fails or is removed (Example: A cloud disk detaches), the failure is not clearly reflected in the system. As a result, the volume may remain in a degraded state for an extended period.

- Large pools (Example: 10–20TiB) may take a while during recovery after a dirty shutdown of the node hosting the io-engine.

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

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For release summaries and full version-level notes, see [OpenEBS Release 4.4](https://github.com/openebs/openebs/releases/tag/v4.4).

See version specific Releases to view the legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/prerequisites.md)
- [Deployment](./deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)