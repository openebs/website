---
id: prerequisites
title: OpenEBS Prerequisites
keywords: 
  - OpenEBS Prerequisites
  - Prerequisites
description: This document outlines the prerequisites for installing OpenEBS.
---

If you are installing OpenEBS, make sure that your Kubernetes nodes meet the required prerequisites for the following storages:
- [Local PV Hostpath Prerequisites](#local-pv-hostpath-prerequisites)
- [Local PV LVM Prerequisites](#local-pv-lvm-prerequisites)
- [Local PV ZFS Prerequisites](#local-pv-zfs-prerequisites)
- [Replicated PV Mayastor Prerequisites](#replicated-pv-mayastor-prerequisites).

At a high-level, OpenEBS requires:

- Verify that you have the admin context. If you do not have admin permissions to your cluster, check with your Kubernetes cluster administrator to help with installing OpenEBS or if you are the owner of the cluster, check out the [steps to create a new admin context](../troubleshooting/troubleshooting-local-storage.md#set-cluster-admin-user-context) and use it for installing OpenEBS.
- Each storage engine may have a few additional requirements as follows:
  - Depending on the managed Kubernetes platform like Rancher or MicroK8s - set up the right bind mounts.
  - Decide which of the devices on the nodes should be used by OpenEBS or if you need to create LVM Volume Groups or ZFS Pools.

## Local PV Hostpath Prerequisites

Set up the directory on the nodes where Local PV Hostpaths will be created. This directory will be referred to as `BasePath`. The default location is `/var/openebs/local`.  

`BasePath` can be any of the following:
- A directory on the root disk (or `os disk`). (Example: `/var/openebs/local`). 
- In the case of bare-metal Kubernetes nodes, a mounted directory using the additional drive or SSD. (Example: An SSD available at `/dev/sdb`, can be formatted with Ext4 and mounted as `/mnt/openebs-local`) 
- In the case of cloud or virtual instances, a mounted directory is created by attaching an external cloud volume or virtual disk. (Example, in GKE, a Local SSD can be used which will be available at `/mnt/disk/ssd1`.)

:::note
**Air-gapped environment:**
If you are running your Kubernetes cluster in an air-gapped environment, make sure the following container images are available in your local repository.
- openebs/provisioner-localpv
- openebs/linux-utils

**Rancher RKE cluster:**
If you are using the Rancher RKE cluster, you must configure the kubelet service with `extra_binds` for `BasePath`. If your `BasePath` is the default directory `/var/openebs/local`, then extra_binds section should have the following details:
```
services:
  kubelet:
    extra_binds:
      - /var/openebs/local:/var/openebs/local
```
:::

## Local PV LVM Prerequisites

Before installing the LVM driver, make sure your Kubernetes Cluster must meet the below prerequisite:

- All the nodes must have lvm2 utils installed and the dm-snapshot kernel module loaded.
- Setup Volume Group:
  Find the disk that you want to use for the LVM, for testing you can use the loopback device.

  ```
  truncate -s 1024G /tmp/disk.img
  sudo losetup -f /tmp/disk.img --show
  ```

  Create the Volume group on all the nodes, which will be used by the LVM Driver for provisioning the volumes.

  ```
  sudo pvcreate /dev/loop0
  sudo vgcreate lvmvg /dev/loop0
  ```

  In the above command, `lvmvg` is the volume group name to be created.

## Local PV ZFS Prerequisites

Before installing the ZFS driver, make sure your Kubernetes Cluster must meet the following prerequisites:

1. All the nodes must have zfs utils installed.
2. ZPOOL has been set up for provisioning the volume.

**Setup:**

All the nodes should have zfsutils-linux installed. We should go to each node of the cluster and install zfs utils:

```
$ apt-get install zfsutils-linux
```

Go to each node and create the ZFS Pool, which will be used for provisioning the volumes. You can create the Pool of your choice, it can be striped, mirrored or raidz pool.

If you have the disk (say /dev/sdb), then you can use the below command to create a striped pool:

```
$ zpool create zfspv-pool /dev/sdb
```

You can also create mirror or raidz pool as per your need. Refer to the [OpenZFS Documentation](https://openzfs.github.io/openzfs-docs/) for more details.

If you do not have the disk, then you can create the zpool on the loopback device which is backed by a sparse file. Use this for testing purpose only.

```
$ truncate -s 100G /tmp/disk.img
$ zpool create zfspv-pool `losetup -f /tmp/disk.img --show`
```

Once the ZFS Pool is created, verify the pool via zpool status command, you should see the command similar as below:

```
$ zpool status
  pool: zfspv-pool
 state: ONLINE
  scan: none requested
config:

  NAME        STATE     READ WRITE CKSUM
  zfspv-pool  ONLINE       0     0     0
    sdb       ONLINE       0     0     0

errors: No known data errors
```

Configure the [custom topology keys](../../../faqs/faqs.md#how-to-add-custom-topology-key-to-local-pv-zfs-driver) (if needed). This can be used for many purposes like if we want to create the PV on nodes in a particular zone or building. We can label the nodes accordingly and use that key in the storageclass for making the scheduling decision.

## Replicated PV Mayastor Prerequisites

### General

All worker nodes must satisfy the following requirements:

* **x86-64** CPU cores with SSE4.2 instruction support
* _(Tested on)_ Linux kernel **5.15**
  _(Recommended)_ Linux kernel **5.13 or higher**.   
  The kernel should have the following modules loaded:
  * nvme-tcp
  * ext4 and optionally xfs
  * [Helm](https://helm.sh/docs/intro/install/) version must be v3.7 or later.

* Each worker node which will host an instance of an io-engine pod must have the following resources _free and available_ for _exclusive_ use by that pod:
  * Two CPU cores
  * 1GiB RAM
  * **HugePage support**
    * A minimum of **2GiB of** **2MiB-sized** pages

* Enabling `nvme_core.multipath` is required for High Availability (HA) functionality in Replicated PV Mayastor. Ensure the kernel parameter `nvme_core.multipath=Y` is set during the installation. (This prerequisite is optional.)

:::note
If the application is scheduled to nodes with the `io-engine label` (`openebs.io/engine=mayastor`), the volume target is preferably placed on the same node where the application is scheduled.
:::

### Network Requirements

* Ensure that the following ports are **not** in use on the node:
  - **10124**: Mayastor gRPC server will use this port.
  - **8420 / 4421**: NVMf targets will use these ports.
* The firewall settings should not restrict connection to the node.

<!--
### Recommended Resource Requirements

**io-engine DaemonSet**

```
resources:
  limits:
    cpu: "2"
    memory: "1Gi"
    hugepages-2Mi: "2Gi"
  requests:
    cpu: "2"
    memory: "1Gi"
    hugepages-2Mi: "2Gi"
```

**csi-node DaemonSet**

```
resources:
  limits:
    cpu: "100m"
    memory: "50Mi"
  requests:
    cpu: "100m"
    memory: "50Mi"
```

**csi-controller Deployment**

```
resources:
  limits:
    cpu: "32m"
    memory: "128Mi"
  requests:
    cpu: "16m"
    memory: "64Mi"
```

**api-rest Deployment**

```
resources:
  limits:
    cpu: "100m"
    memory: "64Mi"
  requests:
    cpu: "50m"
    memory: "32Mi"
```

**agent-core**

```
resources:
  limits:
    cpu: "1000m"
    memory: "32Mi"
  requests:
    cpu: "500m"
    memory: "16Mi"
```

**operator-diskpool**

```
resources:
  limits:
    cpu: "100m"
    memory: "32Mi"
  requests:
    cpu: "50m"
    memory: "16Mi"
```

### DiskPool Requirements

* Disks must be unpartitioned, unformatted, and used exclusively by the DiskPool.
* The minimum capacity of the disks should be 10 GB.

### RBAC Permission Requirements

* **Kubernetes core v1 API-group resources:** Pod, Event, Node, Namespace, ServiceAccount, PersistentVolume, PersistentVolumeClaim, ConfigMap, Secret, Service, Endpoint, and Event.

* **Kubernetes batch API-group resources:** CronJob and Job

* **Kubernetes apps API-group resources:** Deployment, ReplicaSet, StatefulSet, and DaemonSet

* **Kubernetes `storage.k8s.io` API-group resources:** StorageClass, VolumeSnapshot, VolumeSnapshotContent, VolumeAttachment, and CSI-Node

* **Kubernetes `apiextensions.k8s.io` API-group resources:** CustomResourceDefinition

* **Replicated PV Mayastor Custom Resources that is `openebs.io` API-group resources:** DiskPool

* **Custom Resources from Helm chart dependencies of Jaeger that is helpful for debugging:**

   - ConsoleLink Resource from `console.openshift.io` API group

   - ElasticSearch Resource from `logging.openshift.io` API group

   - Kafka and KafkaUsers from `kafka.strimzi.io` API group

   - ServiceMonitor from `monitoring.coreos.com` API group

   - Ingress from `networking.k8s.io` API group and from extensions API group

   - Route from `route.openshift.io` API group

   - All resources from `jaegertracing.io` API group

**Sample `ClusterRole` YAML**

```
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ .Release.Name }}-service-account
  namespace: {{ .Release.Namespace }}
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: mayastor-cluster-role
rules:
- apiGroups: ["apiextensions.k8s.io"]
  resources: ["customresourcedefinitions"]
  verbs: ["create", "list"]
  # must read diskpool info
- apiGroups: ["datacore.com"]
  resources: ["diskpools"]
  verbs: ["get", "list", "watch", "update", "replace", "patch"]
  # must update diskpool status
- apiGroups: ["datacore.com"]
  resources: ["diskpools/status"]
  verbs: ["update", "patch"]
  # external provisioner & attacher
- apiGroups: [""]
  resources: ["persistentvolumes"]
  verbs: ["get", "list", "watch", "update", "create", "delete", "patch"]
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]

  # external provisioner
- apiGroups: [""]
  resources: ["persistentvolumeclaims"]
  verbs: ["get", "list", "watch", "update"]
- apiGroups: ["storage.k8s.io"]
  resources: ["storageclasses"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["events"]
  verbs: ["list", "watch", "create", "update", "patch"]
- apiGroups: ["snapshot.storage.k8s.io"]
  resources: ["volumesnapshots"]
  verbs: ["get", "list"]
- apiGroups: ["snapshot.storage.k8s.io"]
  resources: ["volumesnapshotcontents"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch"]

  # external attacher
- apiGroups: ["storage.k8s.io"]
  resources: ["volumeattachments"]
  verbs: ["get", "list", "watch", "update", "patch"]
- apiGroups: ["storage.k8s.io"]
  resources: ["volumeattachments/status"]
  verbs: ["patch"]
  # CSI nodes must be listed
- apiGroups: ["storage.k8s.io"]
  resources: ["csinodes"]
  verbs: ["get", "list", "watch"]

  # get kube-system namespace to retrieve Uid
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["get"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: mayastor-cluster-role-binding
subjects:
- kind: ServiceAccount
  name: {{ .Release.Name }}-service-account
  namespace: {{ .Release.Namespace }}
roleRef:
  kind: ClusterRole
  name: mayastor-cluster-role
  apiGroup: rbac.authorization.k8s.io
```
-->
### Minimum Worker Node Count

  The minimum supported worker node count is three nodes. When using the synchronous replication feature (N-way mirroring), the number of worker nodes on which IO engine pods are deployed should be no less than the desired replication factor.

### Transport Protocols

  Replicated PV Mayastor supports the export and mounting of volumes over NVMe-oF TCP only. Worker node(s) on which a volume may be scheduled (to be mounted) must have the requisite initiator software installed and configured.
  In order to reliably mount Replicated PV Mayastor volumes over NVMe-oF TCP, a worker node's kernel version must be 5.13 or later and the nvme-tcp kernel module must be loaded.

### Preparing the Cluster

#### Verify/Enable Huge Page Support

2MiB-sized Huge Pages must be supported and enabled on the storage nodes i.e. nodes where IO engine pods are deployed. A minimum number of 1024 such pages \(i.e. 2GiB total\) must be available exclusively to the IO engine pod on each node, which should be verified thus:

```text
grep HugePages /proc/meminfo

AnonHugePages:         0 kB
ShmemHugePages:        0 kB
HugePages_Total:    1024
HugePages_Free:      671
HugePages_Rsvd:        0
HugePages_Surp:        0

```

If fewer than 1024 pages are available then the page count should be reconfigured on the worker node as required, accounting for any other workloads which may be scheduled on the same node and which also require them. For example:

```text
echo 1024 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
```

This change should also be made persistent across reboots by adding the required value to the file`/etc/sysctl.conf` like so:

```text
echo vm.nr_hugepages = 1024 | sudo tee -a /etc/sysctl.conf
```

:::warning
If you modify the huge page configuration of a node, you _MUST_ either restart kubelet or reboot the node.  Replicated PV Mayastor will not deploy correctly if the available huge page count as reported by the node's kubelet instance does not satisfy the minimum requirements.
:::

#### Label IO Node Candidates

All worker nodes which will have IO engine pods running on them must be labeled with the OpenEBS storage type "mayastor". This label will be used as a node selector by the IO engine Daemonset, which is deployed as a part of the Replicated PV Mayastor data plane components installation. To add this label to a node, execute:

```
kubectl label node <node_name> openebs.io/engine=mayastor
```

:::warning
If you set `csi.node.topology.nodeSelector: true`, then you will need to label the worker nodes accordingly to `csi.node.topology.segments`. Both csi-node and agent-ha-node Daemonsets will include the topology segments into the node selector.
:::

## Supported Versions

- Kubernetes 1.23 or higher is required
- Linux Kernel 5.15 or higher is required
-	OS: Ubuntu and RHEL 8.8
-	LVM Version: LVM 2
-	ZFS Version: ZFS 0.8

## See Also

- [Deployment](../quickstart-guide/deploy-a-test-application.md)
- [OpenEBS Architecture](../concepts/architecture.md)
- [OpenEBS Use Cases and Examples](../introduction-to-openebs/use-cases-and-examples.mdx)
- [Troubleshooting](../troubleshooting/)
