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

**Release Date: TBD**

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners.
The status of the various components as of v4.6 are as follows:

| Component Type | Component | Version | Status |
| :--- | :--- | :--- | :--- |
| Replicated Storage | Replicated PV Mayastor | 2.12.0 | Stable |
| Local Storage (non-CSI) | Local PV Hostpath | 4.6.0 | Stable |
| Local Storage | Local PV LVM | 1.10.0 | Stable |
| Local Storage | Local PV ZFS | 2.11.0 | Stable |
| Local Storage | Local PV Rawfile | 0.15.0 | Experimental |
| Other Components | CLI | 4.6.0 | — |

## What’s New

### General

- **Optional CSI Snapshot Controller**

  Replicated PV Mayastor, Local PV LVM, Local PV ZFS, and Local PV Rawfile now allow you to disable the bundled CSI snapshot controller through the Helm chart. This avoids conflicts in clusters where a snapshot controller is already managed at the cluster level.

### Replicated Storage

- **Eventing Aggregator**

  Replicated PV Mayastor now includes the Eventing Aggregator, a new component that collects cluster events and makes them available for querying through the `get events` command in the Mayastor kubectl plugin. Events can be retrieved from Loki, directly from NATS JetStream, or from a previously collected support bundle for offline analysis, and can be filtered by category, action, node, target, component, pool, volume, replica, and state. Cluster events are also included in the support bundle produced by `kubectl openebs dump system`. The Eventing Aggregator is enabled by default and works with or without Loki deployed.

- **Best-Effort Snapshot Restore Policy**

  A new `snapshotRestorePolicy` StorageClass parameter controls how a snapshot restore behaves when not every replica pool can host a clone. With the default `strict` policy, every requested replica must be cloned from the snapshot. With `bestEffort`, the restore proceeds as long as at least one clone succeeds; the volume comes up under-replicated and the remaining replicas are filled in through a normal rebuild. This allows a restore to succeed when a source pool is full or otherwise unable to host a clone.

- **DiskPool Handle Rescanning**

  Replicated PV Mayastor now periodically rescans DiskPool backing device file handles to detect hot-removal on devices that require I/O to surface a removal event, such as those using the AIO and io_uring backends. Previously, removal of an idle device could go undetected. The rescan also refreshes the reported disk size, and both the behaviour and its interval are configurable through the Helm chart.

- **DiskPool Error Clearing**

  Building on the pool error and alert visibility introduced in the previous release, you can now clear recorded DiskPool errors using the Mayastor kubectl plugin. This allows a pool to be returned to normal reporting after the underlying condition has been resolved.

- **Volume and Nexus Label V2**

  A new versioned on-disk label layout, V2, is introduced alongside the existing V1 layout. V2 reduces the metadata partition reserved at the front of every replica from 4 MiB to 3 MiB and aligns volume capacity to 1 MiB boundaries. It also resolves block-mode backup compatibility with Kasten K10.

  For a V2 volume, the requested size is rounded up to the next 1 MiB boundary. A size that is already a multiple of 1 MiB is unchanged, so a request for `10Gi` stays `10Gi`, while a decimal quantity such as `10G` is not MiB-aligned and is rounded up. Each replica additionally reserves 8 MiB for the metadata partition, and the replica total is then aligned up to the cluster size of the pool, which is 4 MiB by default. For example, a 10 MiB volume on a pool with the default cluster size is exposed as a 10 MiB device while each replica consumes 20 MiB of pool space.

  A volume created with a size that is not 1 MiB aligned reports a slightly larger size than requested, which is expected behaviour. Because V2 also adds the 8 MiB metadata reservation for every replica, a V2 volume consumes more pool space than the raw requested size, so size your pools accordingly.

  The cluster-wide label version is negotiated automatically as the lowest version supported across all registered io-engines, and only ever moves up, so the control plane never creates a label that a node cannot understand. In a cluster where some nodes do not yet support V2, the negotiated version stays at V1 until every node supports it. Existing volumes remain on V1 and require no migration, and resize and snapshot operations preserve the label version of the volume.

### Local Storage

- **API Server for Local PV Rawfile**

  Local PV Rawfile now includes an API server with an OpenAPI specification and a Swagger UI, providing a documented interface for inspecting and interacting with the provisioner.

- **Dataset Tuning Parameters for Local PV ZFS**

  Local PV ZFS StorageClasses now support the `atime` and `logbias` parameters, giving you direct control over access-time updates and write-workload optimisation on the underlying ZFS datasets and volumes.

- **Topology-Constrained StorageClasses for Local PV Hostpath**

  The Local PV Hostpath Helm chart now allows you to set `allowedTopologies` on the provisioned StorageClass, so volume placement can be restricted to a defined set of nodes or zones directly from chart values.

## Enhancements

### General

- **Analytics Configuration Overrides**

  The OpenEBS Helm charts now accept global overrides for the analytics identifier and key values, making analytics configuration consistent across the Replicated PV Mayastor, Local PV Hostpath, Local PV LVM, Local PV ZFS, and Local PV Rawfile charts.

### Replicated Storage

- **TLS Hardening and Certificate Auto-Reload**

  Replicated PV Mayastor now supports TLS for its service endpoints, starting with the REST API, along with the CSI controller, CSI node, DiskPool operator, metrics exporter, and kubectl plugin clients. Certificates can be managed in three ways: a transient self-signed certificate generated by the server at startup, self-signed certificates generated by the Helm chart, or certificates provisioned and rotated by cert-manager. Certificates are hot-reloaded on rotation without a restart, TLS discovery is enabled by default, plain HTTP on the REST service is restricted to health probes only, and the Helm chart exposes the TLS configuration for the public API.

- **RDMA Capability Detection**

  The CSI node now checks for the `nvme_rdma` kernel module before reporting RDMA capability, and node transport capabilities are propagated through registration. Previously a node could be treated as RDMA-capable without the required kernel support.

- **Asynchronous Bdev Destruction**

  Block device destruction in the io-engine is now asynchronous, improving the responsiveness of pool and replica teardown.

- **Additional Helm Chart Options**

  Additional environment variables are exposed for component customisation, the api-rest health probes use an `initialDelaySeconds` of 1 for faster readiness, and the maximum Loki ingestion limits have been increased.

- **Clearer Impact Reporting for Purge Operations**

  Node and DiskPool purge operations that involve data loss now list the affected volumes and snapshots directly in the reported error, instead of requiring a separate `--show-impact` run. Snapshot impact is now included alongside volume impact.

- **Pool Identification on Replica Metrics**

  Replica metrics now carry `pool_name` and `pool_uuid` labels, making it possible to attribute replica-level metrics to a specific DiskPool without additional correlation.

### Local Storage

- **HTTP Health Probe for Local PV Hostpath**

  The Local PV Hostpath provisioner now serves a dedicated HTTP health endpoint, replacing the previous process-based liveness check. This provides a more accurate signal of provisioner health to Kubernetes.

- **Configurable Kubernetes API Client Rate Limits for Local PV Hostpath**

  The Kubernetes API client QPS and burst values used by the Local PV Hostpath provisioner are now configurable, allowing provisioning throughput to be tuned in large clusters.

- **Configurable Helper Pod Image Pull Policy for Local PV Hostpath**

  The image pull policy for the Local PV Hostpath helper pod can now be set through the Helm chart, providing more control in air-gapped and locally mirrored registry environments.

- **Updated CSI Snapshot Components for Local PV LVM**

  The bundled `csi-snapshotter` and `snapshot-controller` components have been updated to v8.2.0.

## Fixes

### Replicated Storage

- **Volume Expansion with Undersized Replicas**

  Resolved an issue where a volume expansion could fail to complete when one or more replicas had not yet been resized. Undersized replicas are now resized before the nexus resize is retried.

- **Pool Availability During Device Removal and Replica Deletion**

  Resolved several issues affecting DiskPool availability during device and replica lifecycle events, including a race between pool deregistration and reload, and a race when listing pools while replicas were being destroyed.

- **Frozen I/O During Nexus Shutdown**

  Resolved an issue where I/O could remain frozen when a shutdown nexus was unshared. Outstanding I/O is now aborted correctly, child device closure is awaited, and devices are no longer detached on transient I/O submission errors.

- **Nexus Size Miscalculation**

  Resolved an issue where the nexus block device size could be off by one block. Volume sizing now accounts for label metadata, so the usable capacity always meets the requested size.

- **Pool Capacity Accounting for Snapshot Clones**

  Resolved an issue where pool capacity tallying did not account for the creation of snapshot clones, which could lead to over-commitment of pool space.

- **Readiness Probe Startup Race**

  Resolved an issue where a readiness failure could be cached before the first successful probe, causing api-rest to be incorrectly reported as not ready.

- **Node Rebuild Count Accuracy**

  Resolved an issue where the node rebuild count was not refreshed on single nexus updates, improving the accuracy of rebuild throttling.

- **SPDK Fixes**

  Updated SPDK with fixes for a null pointer dereference and IPv6 transport handling, and resolved an interrupt-mode reactor teardown issue.

### Local Storage

- **Idempotent Volume Expansion for Local PV LVM**

  Resolved an issue where repeating a volume expansion could behave inconsistently. Node expansion now remains required during resize, so repeated expand operations are idempotent.

- **XFS Project Quota Cleanup for Local PV Hostpath**

  Resolved an issue where volume cleanup on XFS could attempt to reset the quota project on named pipes, causing cleanup to fail.

- **File Permissions in Node Deployment Mode for Local PV Hostpath**

  Resolved an issue where the configured file permissions mode was not applied to provisioned volumes when the provisioner ran in node deployment mode. Additional volume manager fixes for node deployment mode are also included.

- **Volume Expansion for Local PV Rawfile**

  Resolved an issue where volume expansion could fail because of unreliable mount output parsing. Mount information is now resolved using `findmnt`.

- **ServiceMonitor Manifest Rendering for Local PV LVM**

  Resolved an issue where the namespace field in the generated ServiceMonitor manifest was incorrectly indented.

- **Image URL Rendering for Local PV ZFS**

  Resolved an issue where image URLs in rendered manifests were not quoted, which could break rendering for registries whose URLs contain characters that YAML treats specially.

## Breaking Changes

### Local Storage

- **PVC-Level BasePath Override Disabled for Local PV Hostpath**

  As a security hardening, a `BasePath` supplied through the `cas.openebs.io/config` annotation on a PersistentVolumeClaim is now ignored. This prevents a user who can create PersistentVolumeClaims from choosing the directory on the node where the volume is created. Set `BasePath` on the StorageClass instead. Deployments that depend on the earlier behaviour can restore it with the `localpv-provisioner.localpv.allowInsecurePvcBasePathOverride` Helm value, which is disabled by default.

- **Deprecated Local PV Rawfile Helm Values Removed**

  The top-level `dataDirPath` and `reservedCapacity` Helm chart values have been removed. Use the equivalent storage pool specific values instead.

- **Filesystem-Level Snapshots Removed from Local PV Rawfile**

  Filesystem-level (Btrfs) snapshot support has been removed. Existing snapshots are not deleted, but they are no longer accessible after the upgrade. Remove any filesystem-level snapshots before upgrading.

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

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For release summaries and full version-level notes, see [OpenEBS Release 4.6](https://github.com/openebs/openebs/releases).

See version specific Releases to view the legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/prerequisites.md)
- [Deployment](./quickstart-guide/deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)
