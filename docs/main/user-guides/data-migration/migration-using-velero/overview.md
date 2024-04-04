---
id: overview
title: Overview
keywords:
 - Overview
 - Velero
description: This section provides an overview on velero.
---
# Overview

This documentation outlines the process of migrating application volumes from CStor to Replicated Storage (f.k.a Mayastor). We will leverage Velero for backup and restoration, facilitating the transition from a CStor cluster to a Replicated Storage cluster. This example specifically focuses on a Google Kubernetes Engine (GKE) cluster.

**Velero Support**: Velero supports the backup and restoration of Kubernetes volumes attached to pods through File System Backup (FSB) or Pod Volume Backup. This process involves using modules from popular open-source backup tools like Restic (which we will utilize).

- For **cloud provider plugins**, see the [Velero Docs - Providers section](https://velero.io/docs/main/supported-providers/).
- **Velero GKE Configuration (Prerequisites)**: You can find the prerequisites and configuration details for Velero in a Google Kubernetes Engine (GKE) environment on the GitHub [here](https://github.com/vmware-tanzu/velero-plugin-for-gcp#setup).
- **Object Storage Requirement**: To store backups, Velero necessitates an object storage bucket. In our case, we utilize a Google Cloud Storage (GCS) bucket. Configuration details and setup can be found on the GitHub [here](https://github.com/vmware-tanzu/velero-plugin-for-gcp#setup). 
- **Velero Basic Installation**: For a step-by-step guide on the basic installation of Velero, see the [Velero Docs - Basic Install section](https://velero.io/docs/v1.11/basic-install/).

## See Also

- [Migration from Legacy Storage to Latest Storage Solution](../data-migration/migration-using-pv-migrate.md)
- [Migration for Distrubuted DB](../data-migration/migration-using-velero/migration-for-distributed-db/distributeddb-backup.md)
- [Migration for Replicated DB](../data-migration/migration-using-velero/migration-for-replicated-db/replicateddb-backup.md)