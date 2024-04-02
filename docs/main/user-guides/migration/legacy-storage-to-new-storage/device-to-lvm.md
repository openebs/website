---
id: device-to-lvm
title: Migration from OpenEBS Local PV Device to OpenEBS Local PV LVM
keywords:
 - Migration from OpenEBS Local PV Device to OpenEBS LVM Local PV
 - Local PV Device to Local PV LVM
 - Local PV Device to Local PV ZFS
 - Local PV Rawfile to Local PV LVM
 - Local PV Rawfile to Local PV ZFS
description: This section outlines the process of migrating OpenEBS Local PV Device to OpenEBS LVM Local PV.
---

:::info
The following steps are an example about migrating from legacy storage to new storage.
You can also migrate OpenEBS Local PV Device to OpenEBS Local PV ZFS. Similarly, you can migrate OpenEBS Local PV Rawfile to OpenEBS Local PV LVM or Local PV ZFS using the steps below.
:::

## Assumptions

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
## Steps to migrate Local PV Device to Local PV LVM

Follow the steps below to migrate OpenEBS Local PV Device to OpenEBS Local PV LVM.

1. [Install Local Engine](../../../quickstart-guide/installation.md) on your cluster.

2. Create a LVM PVC of the same [configuration](../../../user-guides/local-engine-user-guide/lvm-localpv.md#configuration).

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