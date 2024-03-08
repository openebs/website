---
id: replicateddb-overview
title: Replicated DB Overview
keywords:
 - Replicated DB Overview
description: This section outlines the process of migrating application volumes from CStor to Mayastor for Replicated Databases.
---
# Migrating from CStor to Mayastor for Replicated Databases (MongoDB)


This documentation provides a comprehensive guide on migrating CStor application volumes to Mayastor. We utilize Velero for the backup and restoration process, enabling a seamless transition from a CStor cluster to Mayastor. This example specifically focuses on a GKE cluster.

Velero offers support for the backup and restoration of Kubernetes volumes attached to pods directly from the volume's file system. This is known as File System Backup (FSB) or Pod Volume Backup. The data movement is facilitated through the use of modules from free, open-source backup tools such as Restic (which is the tool of choice in this guide).

- For cloud providers, you can find the necessary plugins [here](https://velero.io/docs/main/supported-providers/).
- For detailed Velero GKE configuration prerequisites, refer to [this resource](https://github.com/vmware-tanzu/velero-plugin-for-gcp#setup).
- It's essential to note that Velero requires an object storage bucket for storing backups, and in our case, we use a [Google Cloud Storage (GCS) bucket](https://github.com/vmware-tanzu/velero-plugin-for-gcp#setup).
- For detailed instructions on Velero basic installation, visit https://velero.io/docs/v1.11/basic-install/.





