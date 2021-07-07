---
title: How to install OpenEBS on IBM Cloud Private
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 19-11-2017
tags: Helm Charts, OpenEBS, Solutions, ICP
excerpt: What is IBM Cloud Private? IBM Cloud Private (ICP) is a new application platform that is based on Kubernetes and provides services for developing and managing on-premises containerized applications. 
---

## What is IBM Cloud Private?

**IBM Cloud Private (ICP)** is a new application platform that is based on **Kubernetes** and provides services for developing and managing **on-premises** containerized applications. ICP Community Edition *(ICP-CE)* is distributed free of charge for non-production use and is available on Docker Hub. For commercial use, you would need the Enterprise package.

In my previous blog post, [Introduction to IBM Cloud Private](http://containerized.me/introduction-to-ibm-cloud-private/), I have covered step-by-step installation of ICP 2.1. This time I will focus on configuring **OpenEBS** as a **persistent storage** option and deploying a stateful workload (MongoDB) using OpenEBS storage classes.

## Prerequisites

### Hardware

- Minimum three x64 servers

### Software

- [Ubuntu Server 16.04 LTS](https://www.ubuntu.com/download/server)
- IBM Cloud Private 2.1
- [OpenEBS](https://github.com/openebs/openebs)

### Install IBM Cloud Private

Follow instructions from [Introduction to IBM Cloud Private](http://containerized.me/introduction-to-ibm-cloud-private/) to deploy a multi-node ICP cluster.

### Install OpenEBS on ICP

1. Log in to the ICP console and go to the **Admin/Repositories** menu.

![OpenEBS on ICP](https://cdn-images-1.medium.com/max/800/0*PPZPNSr9_mW_9AZq.png)

1. Click **Add repository**.

![Add repository](https://cdn-images-1.medium.com/max/800/0*ZNaLIkk1gxFLWUJK.png)

1. Add a chart repository with the following parameters:
 — **Name:** openebs-charts
 — **URL:** [https://openebs.github.io/charts/](https://openebs.github.io/charts/)

![Confirm charts](https://cdn-images-1.medium.com/max/800/0*2m2J6V9YhnYk5_Cx.png)

1. After you click **Add**, confirm that **openebs-charts** is listed under Repositories.

![Catalog menu](https://cdn-images-1.medium.com/max/800/0*wkPxIB_Q2DevkgWh.png)

1. Go to the **Catalog** menu, select **openebs** from the list.

![Configure](https://cdn-images-1.medium.com/max/800/0*7Lt6IE4f_da0jZEB.png)

1. On OpenEBS chart instructions page, click **Configure**.
2. Configure OpenEBS deployment with the following parameters:
 — **Release name:** openebs-<your-release-name> (you need to pick a unique name)
 — **Target Namespace:** default (namespace should be the same as your workload)
 — **rbacEnable:** true
 — **image pullPolicy:** IfNotPresent
 — **apiserver image:** openebs/m-apiserver
 — **apiserver tag:** 0.4.0
 — **provisione image:** openebs/openebs-k8s-provisioner
 — **provisioner tag:** 0.4.0
 — **jiva image:** openebs/jiva:0.4.0
 — **replicas:** 2 (Number of Jiva Volume replicas)

![Installation](https://cdn-images-1.medium.com/max/800/0*qfLs4pg_3TE1PbCB.png)

1. Click **Install**. When finished click **View Helm Release.**

![Storage classes](https://cdn-images-1.medium.com/max/800/0*raLyHiJeZ0hC_BAk.png)

1. On the Helm Release page, you can see the status of OpenEBS, deployment, and available **Storage Classes**.

![Deploy stateful application](https://cdn-images-1.medium.com/max/800/0*-gCAd374s2jXY3AP.jpg)

1. Now, let’s try to deploy a stateful app on OpenEBS.

### Install MongoDB on OpenEBS

1. Under **Catalog**, select **ibm-mongodb-dev** and click **Configure**.
2. Configure MongoDB deployment with the following parameters:
 — **Release name:** mongodb-<your-release-name> (you need to pick a unique name here)
 — **Target Namespace:** default (same as OpenEBS)
 — **persistence enabled:** true
 — **persistence useDynamicProvisioning:** true
 — **dataVolume storageClassName:** openebs-mongodb
 — **dataVolume size:** 2G (default is 20Gi, remove “i” — in current version it is not supported)
 — **database password:** mongo
 Accept the license agreements, keep all the other values as default and click **Install**.

![Workloads release](https://cdn-images-1.medium.com/max/800/0*UTiLWk3zOy5bw_Wh.png)

1. Go to **Workloads/Helm Releases** and select your MongoDB release. Under the **PersistentVolumeClaim** table you are going to see the volume claim and OpenEBS storage class.

![Workloads deployment](https://cdn-images-1.medium.com/max/800/0*PNNp0nDxsZXzYwIH.png)

1. If you go to the **Workloads/Deployments** page, you can find the storage controller and two volume replicas (as configured) running.

![Repository](https://cdn-images-1.medium.com/max/800/0*uaEIPO8n2vY0yUet.png)

1. Confirm that replicas are running on separate nodes. Click on the PVC name ending with **rep** (Example:pvc-23025190-c516–11e7-b45e-e8fd90000064-rep). Scroll down, and you will see that pods are running on separate hosts.

![Deployment successful](https://cdn-images-1.medium.com/max/800/0*pD7rHAX_D8_cxcfl.png)

You have successfully deployed a stateful application on a persistent block storage presented by OpenEBS.

### How does storage HA work for stateful workloads?

High Availability storage (HA storage) is a storage system that is continuously operational. Redundancy is the key feature of HA storage as it allows data to be kept in more than one place while ensuring data protection and consistency.

An **OpenEBS Jiva Volume** is a controller deployed during the OpenEBS installation. Volume replicas are defined by the parameter we set above. The controller is an **iSCSI target** while the replicas play the role of a disk. The controller exposes the iSCSI target while the actual data is written. The controller and each replica run inside a dedicated container.

An OpenEBS Jiva Volume controller exists as a single instance, but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is synchronized between replicas.

OpenEBS Jiva Volume HA is based on various scenarios as explained in the following sections.

NOTE: Each replica is scheduled in a unique K8s node, and a K8s node never has two replicas of one OpenEBS volume.

### What happens when an OpenEBS volume controller pod crashes?

Kubernetes automatically re-schedules the controller as a new Kubernetes pod.
 Policies are in place that ensures faster rescheduling.

### What happens when a K8s node that hosts OpenEBS volume controller goes offline?

The controller is automatically re-scheduled as a new Kubernetes pod.
 Policies are in place that ensures faster rescheduling.
 If Kubernetes node is unavailable, the controller gets scheduled on one of the available nodes.

### What happens when an OpenEBS volume replica pod crashes for reasons other than node not-ready and node unreachable?

The replica is autoamtically re-scheduled as a new Kubernetes pod.
 The replica may or may not be re-scheduled on the same K8s node.
 There is data loss with this newly scheduled replica if it gets re-scheduled on a different K8s node.

### What happens when a K8s node that hosts OpenEBS volume replica goes offline?

There is no storage downtime as the other available replica displays inputs/outputs.
 Policies are in place that does not allow re-scheduling of crashed replica (as the replica is tied to a node’s resources) to any other node.

---

*Originally published at *[*Containerized Me*](http://containerized.me/how-to-install-openebs-on-ibm-cloud-private/)*.*
