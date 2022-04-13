---
id: alphafeatures
title: Alpha Features
keywords: 
 - Alpha version
 - OpenEBS CLI
 - OpenEBS Monitoring
 - Dynamic NFS Provisioner
description: This page provides an overview of OpenEBS components and features that are present in the Alpha version and are under active development. These features are not recommended to be used in production.
---

This page provides an overview of OpenEBS components and features presently in Alpha version and under active development. These features are not recommended to be used in production. We suggest you to familiarize and try these features on test clusters and reach out to [OpenEBS Community](/introduction/community) if you have any queries, feedback or need help on these features.

The list of alpha features include:
- [CSI Driver for Local PV - Device](#csi-driver-for-local-pv-device)
- [Dynamic NFS Provisioner](#dynamic-nfs-provisioner)
- [OpenEBS CLI](#openebs-cli)
- [OpenEBS Monitoring Add-on](#openebs-monitoring-add-on)
- [Data Populator](#data-populator)

:::note
Upgrade is not supported for features in Alpha version.
:::

## CSI Driver for Local PV - Device

OpenEBS is developing a CSI driver for provisioning Local PVs that are backed by block devices. 

For additional details and detailed instructions on how to get started with OpenEBS Local PV - Device CSI Driver please refer this [Quickstart guide](https://github.com/openebs/device-localpv).


## Dynamic NFS Provisioner

OpenEBS is developing a dynamic NFS PV provisioner that can setup a new NFS server on top of any block storage. 

For additional details and detailed instructions on how to get started with OpenEBS NFS PV provisioner please refer this [Quickstart guide](https://github.com/openebs/dynamic-nfs-provisioner).

## OpenEBS CLI

OpenEBS is developing a kubectl plugin for openebs called `openebsctl` that can help perform administrative tasks on OpenEBS volumes and pools. 

For additional details and detailed instructions on how to get started with OpenEBS CLI please refer this [Quickstart guide](https://github.com/openebs/openebsctl).

## OpenEBS Monitoring Add-on

OpenEBS is developing a monitoring add-on package that can be installed via helm or kubectl for setting up a default prometheus, grafana and alert manager stack. The package also will include default service monitors, dashboards and alert rules. 

For additional details and detailed instructions on how to get started with OpenEBS Monitoring Add-on please refer this [Quickstart guide](https://github.com/openebs/monitoring).

## Data Populator

The Data populator can be used to load seed data into a Kubernetes persistent volume from another such volume. The data populator internally uses Rsync, which is a volume populator having the ability to create a volume from any rsync source. 

### Use cases

1. <b>Decommissioning of a node in the cluster</b>: In scenarios where a Kubernetes node needs to be decommissioned whether for upgrade or maintenance, a data populator can be used to migrate the data saved in the local storage of the node, that has to be decommissioned, to another node in the cluster. 
2. <b>Loading seed data to Kubernetes volumes</b>: Data populator can be used to scale applications without using read-write many operation. The application can be pre-populated with the static content available in an existing PV.

To get more details about Data Populator, [click here](https://github.com/openebs/data-populator#data-populator).

For instructions on the installation and usage of Data Populator, please refer to this [Quickstart guide](https://github.com/openebs/data-populator#install). 







