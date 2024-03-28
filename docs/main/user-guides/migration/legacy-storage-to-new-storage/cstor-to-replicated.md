---
id: cstor-to-replicated
title: Migration from OpenEBS cStor to OpenEBS Replicated
keywords:
 - Migration from OpenEBS cStor to OpenEBS Replicated
 - cStor to Replicated
 - cStor to Mayastor
description: This section outlines the process of migrating OpenEBS cStor to OpenEBS Replicated.
---

:::info
The following steps are an example about migrating from legacy storage to new storage.
You can also migrate OpenEBS Jiva to OpenEBS Replicated using the steps below.
:::

## Assumptions

- It is an assumption that cStor is already deployed.
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

Follow the steps below to migrate OpenEBS cStor to OpenEBS Replicated (fka Mayastor).

1. [Install Replicated Engine](../../../quickstart-guide/installation.md) on your cluster.

2. Create a replicated PVC of the same [configuration](../../../user-guides/replicated-engine-user-guide/replicated-engine-deployment.md). See the example below:

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

4. Start the migration and let it complete. See the example below:

:::note
Make sure you use the correct cStor pvc name that your application has.
:::

```
pv-migrate migrate \
  --source-namespace default \
  --dest-namespace default \
  cstor-pvc ms-volume-claim

🚀 Starting migration
💭 Will attempt 3 strategies: mnt2, svc, lbsvc
🚁 Attempting strategy: mnt2
📂 Copying data... 100% |███████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| (2.8 GB/s)        
📂 Copying data...   0% |                                                                                                                                                             |  [0s:0s]🧹 Cleaning up
📂 Copying data... 100% |█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████|         
✨ Cleanup done
✅ Migration succeeded
```

5. Deploy the MongoDB application using the Repliated PVC.
6. Once the MongoDB pod is created, check the data.

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

:::note
The cStor volume and pools can now be removed and cStor can be uninstalled.
:::