---
id: rawfile-overview
title: Local PV Rawfile Overview
keywords:
 - OpenEBS Local PV Rawfile
 - Local PV Rawfile Overview
 - Installation
 - Prerequisites
description: This section explains the overview of Local PV Rawfile.
---

OpenEBS Local PV Rawfile provisions persistent volumes backed by raw files on the host filesystem, exposed to pods as independent block devices via Linux loop devices. Each volume is a thick or thin-provisioned file formatted with its own filesystem (`ext4`, `btrfs`, or `xfs`), making it fully isolated from the host's filesystem. This approach delivers near-baremetal disk performance with hard-enforced capacity limits, real-time volume metrics, and per-volume filesystem customization - addressing the core limitations of HostPath-based provisioning.

## How It Works

When a PVC is created, the driver allocates a raw file in a configured storage pool directory on the selected node and attaches it to a Linux loop device. That loop device is then formatted with the requested filesystem and mounted into the pod. Since each volume is an independent block device, the operating system enforces size limits natively and usage metrics are available in O(1) via `df`.

The driver runs as a DaemonSet node plugin on every eligible node, handling both CSI Node and Controller operations locally. When volume resize is enabled, a separate controller Deployment manages cluster-wide resize requests. Long-running operations such as volume creation and snapshot creation are handled asynchronously by a built-in Task Manager, which persists state so that operations survive driver restarts and are retried automatically on failure.

Volumes are strictly node-local - the Kubernetes scheduler uses storage capacity tracking to place pods only on nodes with sufficient pool space, and once a PV is created its node affinity is permanent.

## Installation

Refer to the [OpenEBS Installation documentation](../../../quickstart-guide/installation.md) to install Local PV Rawfile.

## Advantages

- Near-baremetal disk performance – Direct I/O via loop devices with near-zero overhead.
- Hard-enforced volume size limits – Capacity is enforced by the OS, not just advisory quotas.
- Real-time volume usage metrics – Per-volume disk usage readable in O(1) via `df`, with Prometheus metrics exposed per pool and node.
- Per-volume filesystem customization – Each volume can use a different filesystem (ext4, btrfs, xfs) with independent format and mount options.
- Dynamic provisioning – Volumes are created on demand without manual pre-allocation.
- Volume snapshots and cloning – Block-level copy-on-write snapshots and same-node volume cloning.
- Online volume expansion – Expand volumes without downtime on supported filesystems (ext4, btrfs, xfs).
- Multiple storage pools per node – Independent pool configuration with reserved capacity management.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)
