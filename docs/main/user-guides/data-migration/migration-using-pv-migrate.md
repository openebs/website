---
id: migration-using-pv-migrate
title: Migration from Legacy Storage to Latest Storage Solution
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

This section describes the process of migrating the legacy storage to latest storage solution.

## Overview

Data migration is the process of moving data from a source storage to a destination storage. In OpenEBS context, the users can migrate the data from legacy OpenEBS storage to the latest OpenEBS storage.

There are different techniques/methodologies for performing data migration. Users can perform data migration within the same Kubernetes cluster or across Kubernetes clusters. The following guides outline several methodologies for migrating from legacy OpenEBS storage to latest OpenEBS storage:
- [Migration using pv-migrate](#migration-using-pv-migrate)
- [Migration using Velero](../../user-guides/data-migration/migration-using-velero/overview.md)

:::info
Users of non-OpenEBS storage solutions can also use these approaches described below to migrate their data to OpenEBS storage.
:::

## Migration using pv-migrate

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

## Migration from Local PV Device to Local PV LVM

:::info
The following example describes the steps to migrate data from legacy OpenEBS Local PV Device storage to OpenEBS Local PV LVM storage. Legacy OpenEBS Local PV ZFS storage users can also use the below steps to migrate to OpenEBS Local PV LVM storage.
:::

### Assumptions

- Local PV Device is already deployed.
- MongoDB Standalone is deployed as below using the Local PV Device PVC. (Here, MongoDB Standalone is an example.)

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: localpv-vol
spec:
  storageClassName: openebs-device
  accessModes: ["ReadWriteOnce"]
  volumeMode: Filesystem
  resources:
    requests:
      storage: 5Gi
```

- For validation, some data has been inserted in the MongoDB as an example below:

```
db.admin.insertMany([{name: "Max"}, {name:"Alex"}])

[
  { _id: ObjectId('65eaafa01cd2b6de45285d86'), name: 'Max' },
  { _id: ObjectId('65eaafa01cd2b6de45285d87'), name: 'Alex' }
]
```
### Steps to migrate Local PV Device to Local PV LVM

Follow the steps below to migrate OpenEBS Local PV Device to OpenEBS Local PV LVM.

1. [Install Local Storage](../../quickstart-guide/installation.md) on your cluster.

2. Create a LVM PVC of the same [configuration](../../user-guides/local-storage-user-guide/local-pv-lvm/lvm-configuration.md).

:::info
For the LVM volume to be created, the node (where the application was deployed) needs to be same as that of where Volume Group (VG) is created.
:::

See the example below:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
allowVolumeExpansion: true
parameters:
  storage: "lvm"
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: kubernetes.io/hostname
    values:
      - node-1-152720
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

3. Scale down the MongoDB pod.

:::note
In your case, scale down or delete the concerned application pod.
:::

4. Start the migration and let it complete.

:::info
Use the correct Local PV Device PVC name that your application has.
:::

See the example below:

```
pv-migrate migrate \
  --source-namespace default \
  --dest-namespace default \
  localpv-vol csi-lvmpv

🚀 Starting migration
💭 Will attempt 3 strategies: mnt2, svc, lbsvc
🚁 Attempting strategy: mnt2
📂 Copying data... 100% |██████████████████████████████| (3.4 GB/s)     
📂 Copying data...   0% |                              |  [0s:0s]🧹 Cleaning up
📂 Copying data... 100% |██████████████████████████████|         
✨ Cleanup done
✅ Migration succeeded
```

5. Deploy the MongoDB application using the LVM PVC.

6. Once the MongoDB pod is created, check the data that was persisted previously.

```
root@mongo-lvm-556f58cd7d-rws6l:/# mongosh -u admin -p admin123
Current Mongosh Log ID:	65eabe0ee915a8cf7d9eee57
Connecting to:		mongodb://<credentials>@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5
Using MongoDB:		7.0.6
Using Mongosh:		2.1.5

For mongosh info see: https://docs.mongodb.com/mongodb-shell/

------
   The server generated these startup warnings when booting
   2024-03-08T07:27:19.404+00:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
   2024-03-08T07:27:19.747+00:00: vm.max_map_count is too low
------

test> db.admin.find().pretty()
[
  { _id: ObjectId('65eab75b8f5d183790d7bbd5'), name: 'Max' },
  { _id: ObjectId('65eab75b8f5d183790d7bbd6'), name: 'Alex' }
]
```

The migration is successful.

The Local PV Device volumes and pools can now be removed and Local PV Device can be uninstalled.

## Migration from cStor to Replicated

:::info
The following example describes the steps to migrate data from legacy OpenEBS CStor storage to OpenEBS Replicated Storage (a.k.a Replicated Engine and f.k.a Mayastor). Legacy OpenEBS Jiva storage users can also use the below steps to migrate to OpenEBS Replicated.
:::

### Assumptions

- cStor is already deployed.
- MongoDB Standalone is deployed as below using the cStor PVC. (Here, MongoDB Standalone is an example.)

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-pvc
spec:
  storageClassName: cstor-csi-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

- For validation, some data has been inserted in the MongoDB as an example below:

```
db.admin.insertMany([{name: "Max"}, {name:"Alex"}])

[
  { _id: ObjectId('65eaafa01cd2b6de45285d86'), name: 'Max' },
  { _id: ObjectId('65eaafa01cd2b6de45285d87'), name: 'Alex' }
]
```
### Steps to migrate cStor to Replicated

Follow the steps below to migrate OpenEBS cStor to OpenEBS Replicated (fka Mayastor).

1. [Install Replicated Storage](../../quickstart-guide/installation.md) on your cluster.

2. Create a replicated PVC of the same [configuration](../../user-guides/replicated-engine-user-guide/replicated-engine-deployment.md). See the example below:

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: mayastor-2
```

3. Scale down the MongoDB pod.

:::note
In your case, scale down or delete the concerned application pod.
:::

4. Start the migration and let it complete. 

:::info
Use the correct cStor PVC name that your application has.
:::

See the example below:

```
pv-migrate migrate \
  --source-namespace default \
  --dest-namespace default \
  cstor-pvc ms-volume-claim

🚀 Starting migration
💭 Will attempt 3 strategies: mnt2, svc, lbsvc
🚁 Attempting strategy: mnt2
📂 Copying data... 100% |██████████████████████████████| (2.8 GB/s)
📂 Copying data...   0% |                              |  [0s:0s]🧹 Cleaning up
📂 Copying data... 100% |██████████████████████████████|         
✨ Cleanup done
✅ Migration succeeded
```

5. Deploy the MongoDB application using the Replicated PVC.

6. Once the MongoDB pod is created, check the data that was persisted previously.

```
root@mongo-mayastor-c7d645666-b98pc:/# mongosh -u admin -p admin123
Current Mongosh Log ID:	65eab3877cce529ad560c3e8
Connecting to:		mongodb://<credentials>@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.5
Using MongoDB:		7.0.6
Using Mongosh:		2.1.5

For mongosh info see: https://docs.mongodb.com/mongodb-shell/

------
   The server generated these startup warnings when booting
   2024-03-08T06:41:42.650+00:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
   2024-03-08T06:41:44.268+00:00: vm.max_map_count is too low
------

test> db.admin.find().pretty()
[
  { _id: ObjectId('65eaafa01cd2b6de45285d86'), name: 'Max' },
  { _id: ObjectId('65eaafa01cd2b6de45285d87'), name: 'Alex' }
]
```

The migration is successful.

The cStor volume and pools can now be removed and cStor can be uninstalled.

## See Also

 - [Migration using Velero](../data-migration/migration-using-velero/overview.md)