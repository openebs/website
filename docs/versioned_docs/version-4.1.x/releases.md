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

**Release Date: 08 July 2024**

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners.
The status of the various components as of v4.1.0 are as follows:

- Local Storage (a.k.a Local Engine)
  - [Local PV Hostpath 4.1.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)
  - [Local PV LVM 1.6.0](https://github.com/openebs/lvm-localpv) (stable)
  - [Local PV ZFS 2.6.0](https://github.com/openebs/zfs-localpv) (stable)

- Replicated Storage (a.k.a Replicated Engine)
  - [Replicated PV Mayastor 2.7.0](https://github.com/openebs/mayastor) (stable)

- Out-of-tree (External Storage) Provisioners 
  - [Local PV Hostpath 4.1.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)

- Other Components
  - [CLI 0.6.0](https://github.com/openebs/openebsctl) (beta)

## What’s New

OpenEBS is delighted to introduce the following new features:

### What’s New - Replicated Storage

- **Snapshot across Multiple Replicas**

Replicated PV Mayastor has enhanced its snapshot capabilities to ensure file-system consistency across multiple replicas before taking snapshots. This ensures that snapshots are consistent and reliable across multiple replicas.

- **Restore across Multiple Replicas**

The capability to restore from snapshots across multiple replicas has been introduced in recent releases, enhancing data recovery options​.

- **Expansion of Volumes with Snapshots**

This release includes support for volume expansion even when snapshots are present.

- **Placement of Replica Volumes across different Nodes/Pools**

Replicated PV Mayastor now uses topology parameters defined in the storage class to determine the placement of volume replicas. This allows replicas to be controlled via labels from the storage class.

- **Grafana Dashboards**

Grafana Dashboards for Replicated PV Mayastor has been added in this releases.

## Fixes

### Fixed Issues - Local Storage

- **Metrics Collection Loop**

Adds an anonymous metrics collection loop which periodically pushes OpenEBS usage metrics. ([#188](https://github.com/openebs/dynamic-localpv-provisioner/pull/188),[#318](https://github.com/openebs/lvm-localpv/pull/318), and[#548](https://github.com/openebs/zfs-localpv/pull/548))

### Fixed Issues - Replicated Storage

- **Plugin changes for Snapshot Operation**

This plugin will give detailed information about volume snapshot operation. ([#500](https://github.com/openebs/mayastor-extensions/pull/500))

- **Deserialize Failures with Helm v3.13+ Installation**

With Helm v3.13 or higher, helm chart values deserialize fails when loki-stack or jaeger-operator are disabled. This modification includes default deserialize options, which enable the essential options even when the dependent charts are disabled. ([#512](https://github.com/openebs/mayastor-extensions/pull/512))

- **Scale of Volume**

Earlier, the scale of volume was not allowed when the volume already has a snapshot. Now, Scale volume with snapshot can be used for replica rebuild. ([#826](https://github.com/openebs/mayastor-control-plane/pull/826))

## Watch Items and Known Issues

### Watch Items and Known Issues - Local Storage

Local PV ZFS / Local PV LVM on a single worker node encounters issues after upgrading to the latest versions. The issue is specifically associated with the change of the controller manifest to a Deployment type, which results in the failure of new controller pods to join the Running state. The issue appears to be due to the affinity rules set in the old pod, which are not present in the new pods. As a result, since both the old and new pods have relevant labels, the scheduler cannot place the new pod on the same node, leading to scheduling failures when there's only a single node.
The workaround is to delete the old pod so the new pod can get scheduled. See the issue [#3741](https://github.com/openebs/openebs/issues/3751) for more details.

### Watch Items and Known Issues - Replicated Storage

- Replicated PV Mayastor does not support the capacity expansion of DiskPools as of v2.6.0.

- The IO engine pod has been observed to restart occasionally in response to heavy IO and the constant scaling up and down of volume replicas.

## Limitations (If any)

### Limitations - Replicated Storage

- As with the previous versions, the Replicated PV Mayastor IO engine makes full utilization of the allocated CPU cores regardless of IO load. This is the poller operating at full speed, waiting for IO.

- As with the previous versions, a Replicated PV Mayastor DiskPool is limited to a single block device and cannot span across more than one block device.

## Related Information

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For summary of what changes across all components in each release and to view the full Release Notes, see [OpenEBS Release 4.1](https://github.com/openebs/openebs/releases/tag/v4.1.0).

See version specific Releases to view the legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/installation.md)
- [Deployment](./deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)