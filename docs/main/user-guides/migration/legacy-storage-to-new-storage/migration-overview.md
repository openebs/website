---
id: migration-overview
title: Migration from Legacy Storage to Latest Storage Solution
keywords:
 - Migration
 - Data Migration
description: This section outlines the process of migrating the legacy storage to latest storage solution.
---

# Data Migration

Data migration is the process of transferring data from the legacy storage to the latest storage solution.
Also, the data can be migrated from any non-OpenEBS storage to OpenEBS storage.



In this migration process, we are using [pv-migrate](https://github.com/utkuozdemir/pv-migrate) that is a CLI tool/kubectl plugin to easily migrate the contents of one Kubernetes `PersistentVolumeClaim` to another.

This tool is binary and can be [downloaded](https://github.com/utkuozdemir/pv-migrate/releases/download/v1.7.1/pv-migrate_v1.7.1_linux_x86_64.tar.gz) from the release section for linux/amd64. For other OS and arch, download the respective binary from the latest [release section](https://github.com/utkuozdemir/pv-migrate/releases/tag/v1.7.1).

1. Once downloaded, untar the binary as below:

```
tar -xvf pv-migrate_v1.7.1_linux_x86_64.tar.gz
```

2. Add the binary to `PATH` or move it to `/usr/local/bin` to use the binary like any usual binary.

```
mv pv-migrate /usr/local/bin
```

The binary can be used as specified in the migrate flows.