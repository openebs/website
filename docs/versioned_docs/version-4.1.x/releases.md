---
id: releases
title: OpenEBS Releases
keywords:
  - OpenEBS releases
description: This page contains list of supported OpenEBS releases.
---

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners. The status of the various components as of v4.0.1 are as follows:

- Local Storage (a.k.a Local Engine)
  - [Local PV Hostpath 4.0.0](https://github.com/openebs/dynamic-localpv-provisioner) (stable)
  - [Local PV LVM 1.5.0](https://github.com/openebs/lvm-localpv) (stable)
  - [Local PV ZFS 2.5.0](https://github.com/openebs/zfs-localpv) (stable)

- Replicated Storage (a.k.a Replicated Engine)
  - [Replicated PV Mayastor 2.6.1](https://github.com/openebs/mayastor) (stable)

- Out-of-tree (External Storage) Provisioners 
  - [Local PV Hostpath](https://github.com/openebs/dynamic-localpv-provisioner) 4.0.0 (stable)

- Other Components
  - [CLI](https://github.com/openebs/openebsctl) 0.6.0 (beta)

- Deprecated Components (with last supported release)
  - [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.8.0 (beta)
  - [Local PV Partitions](https://github.com/openebs/device-localpv) 0.9.0 (alpha)
  - [Local PV Device](https://github.com/openebs/dynamic-localpv-provisioner) 3.5.0 (stable)
  - [Jiva](https://github.com/openebs/jiva) 3.6.0 (stable)
  - [cStor](https://github.com/openebs/libcstor) 3.6.0 (stable)
  - [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.11.0 (beta)
  - [NDM](https://github.com/openebs/node-disk-manager) 2.1.0 (stable)
  - [Upgrade and Migration Tools](https://github.com/openebs/upgrade) 3.6.0 (stable)

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For summary of what changes across all components in each release, checkout [here](https://github.com/openebs/openebs/releases).

See [here](../versioned_docs/version-3.10.x/introduction/releases.md) for legacy OpenEBS Releases.

## See Also

- [Quickstart](./quickstart-guide/installation.md)
- [Deployment](./deploy-a-test-application.md)
- [OpenEBS Architecture](./concepts/architecture.md)
- [OpenEBS Local Storage](./concepts/data-engines/local-storage.md)
- [OpenEBS Replicated Storage](./concepts/data-engines/replicated-storage.md)
- [Community](community.md)
- [Commercial Support](commercial-support.md)