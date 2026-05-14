---
id: overview
title: Overview
keywords:
 - Overview
 - Velero
description: This section provides an overview on velero.
---
# Overview

This documentation outlines the process of migrating application volumes from CStor to Replicated Storage (a.k.a Replicated Engine or Mayastor). We will leverage Velero for backup and restoration, facilitating the transition from a CStor cluster to a Replicated Storage cluster. This example specifically focuses on a Google Kubernetes Engine (GKE) cluster.

**Velero Support**: Velero supports the backup and restoration of Kubernetes volumes attached to pods through File System Backup (FSB) or Pod Volume Backup. This process involves using modules from popular open-source backup tools like Restic (which we will utilize).

- For **cloud provider plugins**, see the [Velero Docs - Providers section](https://velero.io/docs/main/supported-providers/).
- **Velero GKE Configuration (Prerequisites)**: Refer [Velero plugin for Google Cloud Platform (GCP)](https://github.com/vmware-tanzu/velero-plugin-for-gcp#setup) to view the prerequisites and configuration details for Velero in a Google Kubernetes Engine (GKE) environment.
- **Object Storage Requirement**: Velero necessitates an object storage bucket to store backups. In this case, we are using a Google Cloud Storage (GCS) bucket. Refer [Velero plugin for GCP](https://github.com/vmware-tanzu/velero-plugin-for-gcp#setup) to view the setup and configuration details.
- **Velero Basic Installation**: Refer to the [Velero Documentation - Basic Install section](https://velero.io/docs/v1.11/basic-install/) for a step-by-step guide on the basic installation of Velero.

## See Also

- [Migration from Legacy Storage to Latest Storage Solution](../migration-using-pv-migrate.md)
- [Migration for Distributed DB](../migration-using-velero/migration-for-distributed-db/distributeddb-backup.md)
- [Migration for Replicated DB](../migration-using-velero/migration-for-replicated-db/replicateddb-backup.md)