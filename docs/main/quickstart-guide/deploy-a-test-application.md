---
id: deployment
title: Deploy an Application
keywords:
  - Deploy
  - Deployment
  - Deploy an Application
description: This section helps you choose the OpenEBS storage engine and find the instructions to deploy an application on it.
---

# Deploy an Application

After you install OpenEBS, you deploy an application by creating a PersistentVolumeClaim (PVC) that uses an OpenEBS StorageClass, and then running a Pod that consumes the provisioned volume. The steps depend on the storage engine that you use.

## Deploy an Application on Your Storage Engine

Select the documentation for the storage engine that you installed:

| Storage Engine | Deployment Instructions |
| :--- | :--- |
| Local PV Hostpath | [Local PV Hostpath Deployment](../user-guides/local-storage-user-guide/local-pv-hostpath/configuration/hostpath-deployment.md) |
| Local PV LVM | [Local PV LVM Deployment](../user-guides/local-storage-user-guide/local-pv-lvm/configuration/lvm-deployment.md) |
| Local PV ZFS | [Local PV ZFS Deployment](../user-guides/local-storage-user-guide/local-pv-zfs/configuration/zfs-deployment.md) |
| Local PV Rawfile | [Local PV Rawfile Deployment](../user-guides/local-storage-user-guide/local-pv-rawfile/configuration/rawfile-deployment.md) |
| Replicated PV Mayastor | [Replicated PV Mayastor Deployment](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-deployment.md) |

:::important
Local PV Hostpath is available by default after you install OpenEBS. All other storage engines require additional configuration before you can deploy an application. Refer to the respective user guide for the prerequisites.
:::

## Deploy Stateful Workloads

The application developers will launch their application (stateful workloads) that will in turn create Persistent Volume Claims for requesting the Storage or Volumes for their pods. The Platform teams can provide templates for the applications with associated PVCs or application developers can select from the list of Storage Classes available for them. 

As an application developer, all you have to do is substitute the `StorageClass` in your PVCs with the OpenEBS Storage Classes available in your Kubernetes cluster. 

**Here are examples of some applications using OpenEBS:**

- PostgreSQL
- Percona
- Redis
- MongoDB
- Cassandra
- Prometheus
- Elastic
- MinIO

## Managing the Life Cycle of OpenEBS Components

Once the workloads are up and running, the platform or the operations team can observe the system using the cloud native tools like Prometheus, Grafana, and so forth. The operational tasks are a shared responsibility across the teams: 
- Application teams can watch out for the capacity and performance and tune the PVCs accordingly. 
- Platform or Cluster teams can check for the utilization and performance of the storage per node and decide on expansion and spreading out of the Data Engines. 
- Infrastructure team will be responsible for planning the expansion or optimizations based on the utilization of the resources.

## See Also

- [Installation](installation.md)
- [Local PV Hostpath](../user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-overview.md)
- [Local PV LVM](../user-guides/local-storage-user-guide/local-pv-lvm/lvm-overview.md)
- [Local PV ZFS](../user-guides/local-storage-user-guide/local-pv-zfs/zfs-overview.md)
- [Local PV Rawfile](../user-guides/local-storage-user-guide/local-pv-rawfile/rawfile-overview.md)
- [Local Storage](../concepts/data-engines/local-storage.md)
- [Replicated Storage](../concepts/data-engines/replicated-storage.md)
- [Local Storage User Guide](../user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-overview.md)
- [Replicated Storage User Guide](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-overview.md)