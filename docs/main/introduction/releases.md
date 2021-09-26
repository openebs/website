---
id: releases
title: OpenEBS Releases
keywords:
  - OpenEBS releases
description: This page contains list of supported OpenEBS releases.
---

OpenEBS Release notes are available at: https://github.com/openebs/openebs/releases

The latest recommended version for various engines as follows:

This page should be used a quick reference to find out the compatability of OpenEBS with regards to Kubernetes version. It is possible that the individual storage engines might have more dependenices. Please refer to the release notes or reach out to the [contributor community via slack](/docs/introduction/community).


|OpenEBS Release |Kubernetes Versions|Stable Engines| Beta Engines | Alpha Engines | Deprecated Engines
|:------ |:------------------|:--------     |:------       |:-----         |:-------
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
