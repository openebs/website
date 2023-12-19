---
id: releases
title: OpenEBS Releases
keywords:
  - OpenEBS releases
description: This page contains list of supported OpenEBS releases.
---

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners. The status of the various components as of v3.9.0 are as follows:

- Data Engines
  - [Jiva](https://github.com/openebs/jiva) 3.5.0 (stable)
  - [cStor](https://github.com/openebs/libcstor) 3.5.0 (stable)
- CSI Provisioners
  - [cStor](https://github.com/openebs/cstor-operators) 3.5.0 (stable)
  - [Local PV ZFS](https://github.com/openebs/zfs-localpv) 2.3.0 (stable)
  - [Local PV LVM](https://github.com/openebs/lvm-localpv) 1.3.0 (stable)
  - [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.8.0 (beta)
  - [Jiva](https://github.com/openebs/jiva-operator) 3.5.0 (beta) 
  - [Mayastor](https://github.com/openebs/mayastor) 2.4.0 (stable)
  - [Local PV Partitions](https://github.com/openebs/device-localpv) 0.9.0 (alpha)
- Out-of-tree(external storage) provisioners 
  - [Local PV hostpath](https://github.com/openebs/dynamic-localpv-provisioner) 3.4.0 (stable)
  - [Local PV device](https://github.com/openebs/dynamic-localpv-provisioner) 3.4.0 (stable)
  - [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.10.0 (beta)
- Other components
  - [NDM](https://github.com/openebs/node-disk-manager) 2.1.0 (stable)
  - [Upgrade and Migration Tools](https://github.com/openebs/upgrade) 3.5.0 (stable)
  - [CLI](https://github.com/openebs/openebsctl) 0.5.0 (beta)
  - [Dashboard](https://github.com/openebs/monitoring) 0.4.11 (beta)
- Deprecated components(with last supported release)
  - [Jiva (non-csi)](https://github.com/openebs/maya) 2.12.2 
  - [cStor (non-csi)](https://github.com/openebs/maya) 2.12.2

OpenEBS Release notes are maintained in the GitHub repositories alongside the code and releases. For summary of what changes across all components in each release, checkout: https://github.com/openebs/openebs/releases

Here is a quick reference on status of OpenEBS volumes and compatibility with regards to Kubernetes version. It is possible that the individual storage engines might have more dependenices. Please refer to the release notes or reach out to the [contributor community via slack](/docs/introduction/community).


|OpenEBS Release |Kubernetes Versions|Stable Engines| Beta Engines | Alpha Engines | Deprecated Engines
|:------ |:------------------|:--------     |:------       |:-----         |:-------
|3.9.0 | K8s >= 1.21 |Mayastor, cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.8.0 | K8s >= 1.21 |Mayastor, cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.7.0 | K8s >= 1.21 <1.27 |Mayastor, cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.6.0 | K8s >= 1.21 <1.27 |Mayastor, cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.5.0 | K8s >= 1.21 <1.27 |Mayastor, cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.4.0 | K8s >= 1.21 <1.27 |Mayastor, cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.3.0 |>1.18 K8s >1.18 <1.25 (Jiva-CSI: K8s >=1.21) |cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), Mayastor, NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.2.0   |1.18< K8s <1.25 (Jiva-CSI: K8s >=1.21) |cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), Mayastor, NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.1.0   |K8s >1.18          |cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), Mayastor, NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|3.0.0   |K8s >1.18          |cStor(w/CSI), LocalPV(Hostpath, Device, ZFS, LVM)| Jiva(w/CSI), Mayastor, NFS, LocalPV(Rawfile) | LocalPV(Device w/CSI) | **cStor and Jiva (w/non-CSI)**
|2.12.x   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(Hostpath, Device, ZFS)| cStor(w/CSI), cStor(w/non-CSI), Jiva(w/CSI), Mayastor, LocalPV(LVM, Rawfile) | LocalPV(Device w/CSI), NFS | 
|2.11.0   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(Hostpath, Device, ZFS)| cStor(w/CSI), cStor(w/non-CSI), Jiva(w/CSI), Mayastor, LocalPV(LVM, Rawfile) | LocalPV(Device w/CSI), NFS | 
|2.10.0   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(Hostpath, Device, ZFS)| cStor(w/CSI), cStor(w/non-CSI), Jiva(w/CSI), Mayastor, LocalPV(LVM, Rawfile) | LocalPV(Device w/CSI), NFS | 
|2.9.0   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(Hostpath, Device, ZFS)| cStor(w/CSI), cStor(w/non-CSI), Jiva(w/CSI), Mayastor, LocalPV(LVM, Rawfile) | LocalPV(Device w/CSI), NFS | 
|2.8.0   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(ZFS)| cStor(w/CSI), cStor(w/non-CSI), Jiva(w/CSI), Mayastor, LocalPV(Hostpath, Device, LVM, Rawfile) | LocalPV(Device w/CSI), NFS | 
|2.7.0   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(ZFS)| cStor(w/CSI), cStor(w/non-CSI), Mayastor, LocalPV(Hostpath, Device) | LocalPV(LVM, Rawfile), Jiva(w/CSI), NFS | 
|2.6.0   |K8s >1.17 <1.22    | Jiva(w/non-CSI), LocalPV(ZFS)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(LVM, Rawfile), Jiva(w/CSI), NFS | 
|2.5.0   |K8s >1.14 <1.22    | Jiva(w/non-CSI), LocalPV(ZFS)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(LVM, Rawfile), Jiva(w/CSI), NFS | 
|2.4.0   |K8s >1.14 <1.22    | Jiva(w/non-CSI), LocalPV(ZFS)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(Rawfile), Jiva(w/CSI), NFS | 
|2.3.0   |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(Rawfile), Jiva(w/CSI) | 
|2.2.0   |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device, ZFS) | Mayastor, LocalPV(Rawfile), Jiva(w/CSI) | 
|2.1.0   |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device, ZFS) | Mayastor, LocalPV(Rawfile), Jiva(w/CSI) | 
|2.0.0   |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/CSI), cStor(w/non-CSI), LocalPV(Hostpath, Device, ZFS) | Mayastor, LocalPV(Rawfile), Jiva(w/CSI) | 
|1.12.0  |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/non-CSI), LocalPV(Hostpath, Device, ZFS) | Mayastor, cStor(w/CSI), Jiva(w/CSI) | 
|1.11.0  |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/non-CSI), LocalPV(Hostpath, Device, ZFS) | Mayastor, cStor(w/CSI), Jiva(w/CSI) | 
|1.10.0  |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(ZFS), cStor(w/CSI), Jiva(w/CSI) | 
|1.9.0   |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(ZFS), cStor(w/CSI), Jiva(w/CSI) | 
|1.8.0   |K8s >1.14 <1.20    | Jiva(w/non-CSI)| cStor(w/non-CSI), LocalPV(Hostpath, Device) | Mayastor, LocalPV(ZFS), cStor(w/CSI), Jiva(w/CSI) | 

## See Also:

- [Community Support](/docs/introduction/community) 
- [Quickstart](/docs/user-guides/quickstart) 
- [OpenEBS Architecture](/docs/concepts/architecture)
- [OpenEBS Local PV](/docs/concepts/localpv)
- [OpenEBS Mayastor](/docs/concepts/mayastor)
