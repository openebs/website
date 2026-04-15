---
id: basics
title: Kubernetes Storage Concepts
keywords: 
  - Kubernetes Storage Concepts
  - Container Storage Interface
  - Storage Classes
  - Dynamic Provisioning
  - Persistent Volume Claims
  - Persistent Volumes
  - StatefulSets
description: This document provides you with a quick overview of the Kubernetes concepts you need to know for running Stateful Workloads.
---

This page provides you with a quick overview of the [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/) you need to know for running Stateful Workloads. If you are already familiar with running Stateful workloads in Kubernetes, head over to the next section on [Container Native Storage](container-native-storage.md).

Kubernetes has made several enhancements to support running Stateful workloads by providing the required abstractions for platform (or Cluster Administrators) and application developers. The abstractions ensure that different types of file and block storage (whether ephemeral or persistent, local or remote) are available wherever a container is scheduled (including provisioning/creating, attaching, mounting, unmounting, detaching, and deleting of volumes), storage capacity management (container ephemeral storage usage, volume resizing, etc.), influencing scheduling of containers based on storage (data gravity, availability, etc.), and generic operations on storage (snapshotting, etc.).

The most important Kubernetes Storage abstractions to be aware of for running Stateful workloads using OpenEBS are:

- [Container Storage Interface (CSI)](#container-storage-interface)
- [Storage Classes and Dynamic Provisioning](#storage-classes-and-dynamic-provisioning)
- [Persistent Volume Claims](#persistent-volume-claims)
- [Persistent Volumes](#persistent-volumes)
- [StatefulSets and Deployments](#statefulsets-and-deployments)

## Container Storage Interface

The [Container Storage Interface (CSI)](https://github.com/container-storage-interface/spec/blob/master/spec.md) is a standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems (COs) like Kubernetes. Using CSI third-party storage providers like OpenEBS can write and deploy plugins exposing new storage volumes like OpenEBS Local and Replicated Volumes in Kubernetes without ever having to touch the core Kubernetes code.

When cluster administrators install OpenEBS, the required OpenEBS CSI driver components are installed into the Kubernetes cluster.

:::note
Before CSI, Kubernetes supported adding storage providers using out-of-tree provisioners referred to as [external provisioners](https://github.com/kubernetes-sigs/sig-storage-lib-external-provisioner) and Kubernetes in-tree volumes pre-date the external provisioners. There is an ongoing effort in the Kubernetes community to deprecate in-tree volumes with CSI based volumes.
:::

## Storage Classes and Dynamic Provisioning

A [StorageClass](https://kubernetes.io/docs/concepts/storage/storage-classes/) provides a way for administrators to describe the "classes" of storage they offer. Different classes might map to quality-of-service levels, backup policies, or arbitrary policies determined by the cluster administrators. This concept is sometimes called "profiles" in other storage systems.

The dynamic provisioning feature eliminates the need for cluster administrators to pre-provision storage. Instead, it automatically provisions storage when it is requested by users. The implementation of dynamic volume provisioning is based on the `StorageClass` abstraction. A cluster administrator can define as many StorageClass objects as needed, each specifying a volume plugin (aka provisioner) that provisions a volume and the set of parameters to pass to that provisioner when provisioning. 

A cluster administrator can define and expose multiple flavors of storage (from the same or different storage systems) within a cluster, each with a custom set of parameters. This design also ensures that end users do not have to worry about the complexity and nuances of how storage is provisioned but still can select from multiple storage options.

When OpenEBS is installed, it ships with a couple of default Storage Classes that allow users to create either local or replicated volumes. The cluster administrator can enable the required storage engines and then create Storage Classes for the required Data Engines. 

## Persistent Volume Claims 

PersistentVolumeClaim (PVC) is a user’s storage request that is served by a Storage Class offered by the cluster administrator. An application running on a container can request a certain type of storage. For example, a container can specify the size of storage it needs or the way it needs to access the data (read-only, read/write, etc.).

Beyond storage size and access mode, administrators create Storage Classes to provide PVs with custom properties, such as the type of disk (HDD vs. SSD), the level of performance, or the storage tier (regular or cold storage). 

## Persistent Volumes

The PersistentVolume (PV) is dynamically provisioned by the storage providers when users request for a PVC. PV contains the details on how the storage can be consumed by the container. Kubernetes and the volume drivers use the details in the PV to attach/detach the storage to the node where the container is running and mount/unmount storage to a container. 

OpenEBS Control Plane dynamically provisions OpenEBS local and replicated volumes and helps in creating the PV objects in the cluster. 

## StatefulSets and Deployments

Kubernetes provides several built-in workload resources such as StatefulSets and Deployments that let application developers define an application running on Kubernetes. You can run a stateful application by creating a Kubernetes Deployment/Statefulset and connecting it to a PersistentVolume using a PersistentVolumeClaim. 

For example, you can create a MongoDB Deployment YAML that references a PersistentVolumeClaim. The MongoDB PersistentVolumeClaim referenced by the Deployment should be created with the requested size and StorageClass. Once the OpenEBS control plane provisions a PersistenceVolume for the required StorageClass and requested capacity, the claim is set as satisfied. Kubernetes will then mount the PersistentVolume and launch the MongoDB Deployment. 

## Kubernetes Persona

There are primarily two types of users that interact with Kubernetes and OpenEBS. 

### Cluster Administrators 

These users are responsible for managing the life cycle of the cluster and are often referred to as administrators or platform SREs. Administrators have full access to the cluster resources and can create policies and roles for other users that have access to the cluster.

Cluster administrators are responsible for installing OpenEBS and configuring the OpenEBS Storage Classes that will be used by other application users.

### Application Owners 

These users are responsible for managing the life cycle of the application and are often referred to as users or developers. Typically these users have restricted access to one or more `namespaces` in the Kubernetes clusters. These users can have view access to the object that can be used like `StorageClasses` but will not be able to edit or delete them. 

These users usually have full access to application abstractions within their namespace. Some examples of application abstractions are `Deployment`, `StatefulSet`, `ConfigMap`, and `PVC`.

Administrators can further define other roles for users with further granular access or restrictions using the Kubernetes RBAC.

## Kubernetes Cluster Design

As a Kubernetes cluster administrator, you will have to work with your Platform or Infrastructure teams on the composition of the Kubernetes worker nodes like - RAM, CPU, Network, and the storage devices attached to the worker nodes. The [resources available to the Kubernetes nodes](../concepts/data-engines/data-engines.md#node-capabilities) determine what OpenEBS engines to use for your stateful workloads. 

As a Kubernetes cluster administrator or Platform SREs, you will have to decide which deployment strategy works best for you - either use a hyperconverged mode where Stateful applications and storage volumes are co-located or run Stateful applications and storage on different pools of nodes. 

For installing OpenEBS, your Kubernetes cluster should meet the following:
- Kubernetes 1.23 or higher is recommended. 
- Based on the selected data engine, the nodes should be prepared with additional packages like:
- Installing the ext4, xfs, nfs, lvm, zfs, nvme packages.
- Prepare the devices for use by data engines by making sure there are no filesystems installed or by creating an LVM volume group or ZFS Pool or partitioning the drives if required. 
- Based on whether you are using an upstream Kubernetes cluster or a managed Kubernetes cluster like AKS, Rancher, OpenShift, or GKE, there may be additional steps required. 

If your platform is missing from the above list, [raise an issue on the docs](https://github.com/openebs/openebs/issues/new/choose) or reach us on the [community slack](../community.md) to let us know. 

## See Also

- [Container Native Storage](../concepts/container-native-storage.md)
- [OpenEBS Architecture](architecture.md)
- [Connect with Community](../community.md)