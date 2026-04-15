---
id: hostpath-overview
title: Local PV Hostpath Overview
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Overview
 - Installation
 - Prerequisites
description: This section explains the overview of Local PV Hostpath.
---

OpenEBS Local PV Hostpath is a lightweight and easy-to-use storage engine that provides persistent volumes by directly accessing the host node's filesystem path. It is ideal for single-node development and testing environments, where applications need fast local storage without replication. Volumes are dynamically provisioned on the node where the workload is scheduled, using a designated base path (Example: `/var/openebs/local`).

It can create Kubernetes Local Persistent Volumes using a unique Hostpath (directory) on the node to persist data, hereafter referred to as *OpenEBS Local PV Hostpath* volumes. 

## Advantages

- OpenEBS Local PV Hostpath allows your applications to access hostpath via StorageClass, PVC, and PV. This provides you with the flexibility to change the PV providers without having to redesign your Application YAML. 

- Data protection using the Velero Backup and Restore.

- Protect against hostpath security vulnerabilities by masking the hostpath completely from the application YAML and pod.

OpenEBS Local PV uses volume topology aware pod scheduling enhancements introduced by [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local).

## Installation 

Refer to the [OpenEBS Installation documentation](../../../quickstart-guide/installation.md) to install Local PV Hostpath.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)
