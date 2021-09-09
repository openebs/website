---
id: alpha-features-cstor
title: Alpha Features
keywords: 
 - Alpha version
 - cStor
 - OpenEBS CLI
 - OpenEBS Monitoring Add-on
description: This page provides an overview of OpenEBS(cStor) components and features that are present in the Alpha version and are under active development. These features are not recommended to be used in production.
---

This page provides an overview of OpenEBS cStor components and features presently in Alpha version and under active development. These features are not recommended to be used in production. We suggest you to familiarize and try these features on test clusters and reach out to [OpenEBS Community](/introduction/community) if you have any queries, feedback or need help on these features.

The list of alpha features include:
- [OpenEBS CLI](#openebs-cli)
- [OpenEBS Monitoring Add-on](#openebs-monitoring-add-on)

:::note
Upgrade is not supported for features in Alpha version.
:::

## OpenEBS CLI

OpenEBS is developing a kubectl plugin for openebs called `openebsctl` that can help perform administrative tasks on OpenEBS volumes and pools. 

For additional details and detailed instructions on how to get started with OpenEBS CLI please refer this [Quickstart guide](https://github.com/openebs/openebsctl).

## OpenEBS Monitoring Add-on

OpenEBS is developing a monitoring add-on package that can be installed via helm or kubectl for setting up a default prometheus, grafana and alert manager stack. The package also will include default service monitors, dashboards and alert rules. 

For additional details and detailed instructions on how to get started with OpenEBS Monitoring Add-on please refer this [Quickstart guide](https://github.com/openebs/monitoring).
