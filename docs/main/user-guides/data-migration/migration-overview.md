---
id: migration-overview
title: Migration Overview
keywords:
 - Migration
 - Data Migration
 - Migration from OpenEBS Local PV Device to OpenEBS LVM Local PV
 - Local PV Device to Local PV LVM
 - Local PV Device to Local PV ZFS
 - Migration from OpenEBS cStor to OpenEBS Replicated
 - cStor to Replicated
 - cStor to Mayastor
 - Jiva to Replicated
 - Jiva to Mayastor
description: This section outlines the process of migrating the legacy storage to latest storage solution.
---

# Migration Overview

Data migration is the process of moving data from a source storage to a destination storage. In OpenEBS context, the users can migrate the data from legacy OpenEBS storage to the latest OpenEBS storage.

There are different techniques/methodologies for performing data migration. Users can perform data migration within the same Kubernetes cluster or across Kubernetes clusters. The following guides outline several methodologies for migrating from legacy OpenEBS storage to latest OpenEBS storage:
- [Migration using pv-migrate](migration-using-pv-migrate.md)
- [Migration using Velero](migration-using-velero/overview.md)

:::info
Users of non-OpenEBS storage solutions can also use these approaches described below to migrate their data to OpenEBS storage.
:::

## See Also

- [Migration from Legacy Storage to Latest Storage Solution](../data-migration/migration-using-pv-migrate.md)
- [Migration for Distrubuted DB](../data-migration/migration-using-velero/migration-for-distributed-db/distributeddb-backup.md)
- [Migration for Replicated DB](../data-migration/migration-using-velero/migration-for-replicated-db/replicateddb-backup.md)