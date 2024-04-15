---
id: hostpath-installation
title: Installation
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Installation
 - Installation
 - Prerequisites
description: This section explains the prerequisites and installation requirements to set up OpenEBS Local Persistent Volumes (PV) backed by Hostpath. 
---

This section explains the prerequisites and installation requirements to set up OpenEBS Local Persistent Volumes (PV) backed by Hostpath. 

*OpenEBS Dynamic Local PV provisioner* can create Kubernetes Local Persistent Volumes using a unique Hostpath (directory) on the node to persist data, hereafter referred to as *OpenEBS Local PV Hostpath* volumes. 

*OpenEBS Local PV Hostpath* volumes have the following advantages compared to native Kubernetes hostpath volumes. 
- OpenEBS Local PV Hostpath allows your applications to access hostpath via StorageClass, PVC, and PV. This provides you with the flexibility to change the PV providers without having to redesign your Application YAML. 
- Data protection using the Velero Backup and Restore.
- Protect against hostpath security vulnerabilities by masking the hostpath completely from the application YAML and pod.

OpenEBS Local PV uses volume topology aware pod scheduling enhancements introduced by [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).

## Prerequisites

Set up the directory on the nodes where Local PV Hostpaths will be created. This directory will be referred to as `BasePath`. The default location is `/var/openebs/local`.  

`BasePath` can be any of the following:
- A directory on the root disk (or `os disk`). (Example: `/var/openebs/local`). 
- In the case of bare-metal Kubernetes nodes, a mounted directory using the additional drive or SSD. (Example: An SSD available at `/dev/sdb`, can be formatted with Ext4 and mounted as `/mnt/openebs-local`) 
- In the case of cloud or virtual instances, a mounted directory is created by attaching an external cloud volume or virtual disk. (Example, in GKE, a Local SSD can be used which will be available at `/mnt/disk/ssd1`.)

:::note
**air-gapped environment**
If you are running your Kubernetes cluster in an air-gapped environment, make sure the following container images are available in your local repository.
- openebs/localpv-provisioner
- openebs/linux-utils
:::

:::note
**Rancher RKE cluster**
If you are using the Rancher RKE cluster, you must configure the kubelet service with `extra_binds` for `BasePath`. If your `BasePath` is the default directory `/var/openebs/local`, then extra_binds section should have the following details:
```
services:
  kubelet:
    extra_binds:
      - /var/openebs/local:/var/openebs/local
```
:::

## Installation 

For installation instructions, see [here](../../../quickstart-guide/installation.md).

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)