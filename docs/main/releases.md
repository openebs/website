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

**Release Date: 13 June 2025**

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners.
The status of the various components as of v4.3.2 are as follows:

- Local Storage (a.k.a Local Engine)
  - [Local PV Hostpath 4.3.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)
  - [Local PV LVM 1.7.0](https://github.com/openebs/lvm-localpv) (stable)
  - [Local PV ZFS 2.8.0](https://github.com/openebs/zfs-localpv) (stable)

- Replicated Storage (a.k.a Replicated Engine)
  - [Replicated PV Mayastor 2.9.0](https://github.com/openebs/mayastor) (stable)

- Out-of-tree (External Storage) Provisioners 
  - [Local PV Hostpath 4.3.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)

- Other Components
  - [CLI 4.3.0](https://github.com/openebs/openebs/tree/release/4.3/plugin)

## What’s New

OpenEBS is delighted to introduce the following new features with OpenEBS 4.3.2:

### General

- **Kubectl OpenEBS Plugin**

  A new unified CLI plugin has been introduced. If you have deployed your cluster using the OpenEBS umbrella chart, you can now manage all supported storages - Local PV Hostpath, Local PV LVM, Local PV ZFS, and Replicated PV Mayastor using a single plugin.

- **One-Step Upgrade**

  OpenEBS now supports a unified, one-step upgrade process for all its storages. This umbrella upgrade mechanism simplifies and streamlines the upgrade procedure across the OpenEBS ecosystem.

- **Enhanced Supportability**

  - Support bundle collection is now available for all stable OpenEBS storages — Replicated PV Mayastor, Local PV Hostpath, Local PV LVM and Local PV ZFS using the `kubectl openebs dump system` command.
  - This unified supportability approach enables consistent and comprehensive system state capture, significantly improving the efficiency of debugging and troubleshooting. Previously, this capability was limited to Replicated PV Mayastor via the `kubectl-mayastor` plugin.

### Replicated Storage

**At-Rest Encryption**

  You can now configure disk pools with your own encryption key, allowing volume replicas to be encrypted at rest. This is useful if you are working in environments with compliance or security requirements.

## Enhancements

### Replicated Storage

- Added `formatOptions` support via storage class.
- Cordoned nodes are now preferred when removing volume replicas (Example: Scale down).
- Restricted pool creation using non-persistent devlinks like `/dev/sdX`.
- You no longer need to recreate the StorageClass when restoring volumes from thick snapshots.
- New volume health information is available to better represent volume state.
- A plugin command is available to delete volumes with `RETAIN` policy - useful when a volume remains after its PV is deleted.
- Full volume rebuilds are now avoided if a partial rebuild fails due to reaching the max rebuild limit.

### Local Storage

- For Local PV Hostpath, support has been added to specify file permissions for PVC hostpaths.
- For Local PV LVM, support for `formatOptions` has been added via the storage class, allowing you to format devices with custom `mkfs` options.
- For Local PV LVM, cordoned Kubernetes nodes are now excluded while provisioning volumes.
- For Local PV ZFS, a backup garbage collector has been added to automatically clean up stale or orphaned backup resources.
- For Local PV ZFS, labeling has been improved across all components, including logging-related labels, to help you maintain and observe Helm charts more effectively.

## Fixes

### Local Storage

**For Local PV ZFS**

- The quota property is now correctly retained during upgrades.
- Volume restores now maintain backward compatibility for `quotatype` values.
- Fixed a crash in the controller caused by unhandled errors in the `CSI NodeGetInfo` call.
- The gRPC server now exits cleanly when receiving SIGTERM or SIGINT signals.
- The agent now uses the OpenEBS `lib-csi` Kubernetes client to load `kubeconfig` more reliably.
- The `--plugin` CLI flag now only accepts valid values: `controller` and `agent`.

## Known Issues

### Known Issues - Replicated Storage

- DiskPool capacity expansion is not supported as of v2.9.0.
- If a node hosting a pod reboots and the pod lacks a controller (like a Deployment), the volume unpublish operation may not trigger. This causes the control plane to assume the volume is still in use, which leads to `fsfreeze` operation failure during snapshots.
**Workaround:** Recreate or rebind the pod to ensure proper volume mounting.
- If a disk backing a DiskPool fails or is removed (Example: A cloud disk detaches), the failure is not clearly reflected in the system. As a result, the volume may remain in a degraded state for an extended period.
- Large pools (Example: 10–20TiB) may hang during recovery after a dirty shutdown of the node hosting the io-engine.
- Provisioning very large filesystem volumes (Example: More than 15TiB) may fail due to filesystem formatting timeouts or hangs.

### Known Issues - Local Storage

- For Local PV LVM and Local PV ZFS, you may face issues on single-node setups post-upgrade where the controller pod does not enter the `Running` state due to changes in the manifest and missing affinity rules.
**Workaround:** Delete the old controller pod to allow scheduling of the new one. This does not occur when upgrading from the previous release.

- For Local PV LVM, thin pool capacity is not unmapped or reclaimed and is also not tracked in the `lvmnode` custom resource. This may result in unexpected behavior.

## Limitations (If any)

### Limitations - Replicated Storage

- The IO engine fully utilizes all allocated CPU cores regardless of the actual I/O load, as it runs a poller at full speed.
- Each DiskPool is limited to a single block device and cannot span across multiple devices.
- The data-at-rest encryption feature does not support rotation of Data Encryption Keys (DEKs).

## Related Information

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For summary of what changes across all components in each release and to view the full Release Notes, see [OpenEBS Release 4.3.2](https://github.com/openebs/openebs/releases/tag/v4.3.2).

See version specific Releases to view the legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/prerequisites.md)
- [Deployment](./deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)