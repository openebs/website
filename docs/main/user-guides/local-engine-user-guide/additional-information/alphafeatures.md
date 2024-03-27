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

This section provides an overview of OpenEBS components and features available in the Alpha version and under active development. These features are not recommended to be used in production. We suggest you to familiarize and try these features on test clusters and reach out to [OpenEBS Community](../../../community.md) if you have any queries, feedback or need help on these features.

The list of alpha features include:
- [CSI Driver for Local PV - Device](#csi-driver-for-local-pv-device)
- [Dynamic NFS Provisioner](#dynamic-nfs-provisioner)
- [OpenEBS CLI](#openebs-cli)
- [OpenEBS Monitoring Add-on](#openebs-monitoring-add-on)
- [Data Populator](#data-populator)

:::note
Upgrade is not supported for features in Alpha version.
:::

## OpenEBS CLI

OpenEBS is developing a kubectl plugin for openebs called `openebsctl` that can help perform administrative tasks on OpenEBS volumes and pools. 

For additional details and detailed instructions on how to get started with OpenEBS CLI, see [here](https://github.com/openebs/openebsctl).

## OpenEBS Monitoring Add-on

OpenEBS is developing a monitoring add-on package that can be installed via helm for setting up a default prometheus, grafana, and alert manager stack. The package also will include default service monitors, dashboards, and alert rules. 

For additional details and detailed instructions on how to get started with OpenEBS Monitoring Add-on, see [here](https://github.com/openebs/monitoring).

## Data Populator

The Data populator can be used to load seed data into a Kubernetes persistent volume from another such volume. The data populator internally uses Rsync, which is a volume populator having the ability to create a volume from any rsync source.

### Use Cases

1. <b>Decommissioning of a node in the cluster</b>: In scenarios where a Kubernetes node needs to be decommissioned whether for upgrade or maintenance, a data populator can be used to migrate the data saved in the local storage of the node, that has to be decommissioned. 
2. <b>Loading seed data to Kubernetes volumes</b>: Data populator can be used to scale applications without using read-write many operation. The application can be pre-populated with the static content available in an existing PV.

To get more details about Data Populator, see [here](https://github.com/openebs/data-populator#data-populator).

For instructions on the installation and usage of Data Populator, see [here](https://github.com/openebs/data-populator#install). 
