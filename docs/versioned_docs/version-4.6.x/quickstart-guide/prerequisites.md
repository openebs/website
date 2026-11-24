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
- [Local PV Rawfile Prerequisites](#local-pv-rawfile-prerequisites)
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

Configure the [custom topology keys](../faqs/faqs.md#how-to-add-custom-topology-key-to-local-pv-zfs-driver) (if needed). This can be used for many purposes like if we want to create the PV on nodes in a particular zone or building. We can label the nodes accordingly and use that key in the storageclass for making the scheduling decision.

## Local PV Rawfile Prerequisites

:::note
Local PV Rawfile is disabled by default in the OpenEBS Helm chart. These prerequisites apply only if you intend to enable and use it.
:::

The Rawfile driver container image bundles all required tools (`losetup`, `mkfs.ext4`, `mkfs.xfs`, `mkfs.btrfs`) — no host-level installation of these tools is needed.

The only host-side requirement is:

- The storage pool directory (default: `/var/csi/rawfile`) must exist or be creatable on each node, with sufficient disk space for the volumes you plan to provision.

:::note
**Copy-on-Write (CoW) snapshots and clones:** If you want space-efficient, near-instant snapshots and clones, the underlying filesystem of the storage pool directory must support reflinks. btrfs supports this natively. XFS supports it when formatted with `mkfs.xfs -m reflink=1`. ext4 does not currently support reflinks. Without CoW, snapshots and clones perform a full data copy instead.
:::

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
    * A minimum of **2GiB** of huge pages, using either **2MiB-sized** or **1GiB-sized** pages

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

Huge pages must be supported and enabled on the storage nodes, that is, the nodes where IO engine
pods are deployed. **A minimum of 2GiB of huge pages must be available exclusively to the IO engine
pod on each node.** Either 2MiB-sized or 1GiB-sized pages can be used, or a combination of the two.
The IO engine treats one 1GiB page as the equivalent of 512 2MiB pages when it checks at startup
that enough memory is available.

2MiB pages are the default and are suitable for most clusters. See
[Using 1GiB Pages](#using-1gib-pages) below for when the larger size is worth considering.

##### Using 2MiB Pages

A minimum of 1024 2MiB pages (2GiB total) is required, which should be verified thus:

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

##### Using 1GiB Pages

1GiB pages are an alternative to 2MiB pages, not an addition to them. A minimum of two such pages
(2GiB total) is required.

Consider them when another workload on the same nodes manages the 2MiB page pool. The
`vm.nr_hugepages` sysctl used above controls only the pool for the system's default huge page size,
which is 2MiB on x86_64. If something else on the node sets that value, pages reserved for the IO
engine can be taken away from it. The 1GiB pool is configured separately and is unaffected.

Unlike 2MiB pages, **1GiB pages must normally be reserved at boot time**. Allocating them at
runtime is unreliable once memory is fragmented, because the kernel has to find a contiguous 1GiB
region. Add the following kernel boot parameters and reboot the node:

```text
hugepagesz=1G hugepages=2
```

Then verify the pool:

```text
cat /sys/kernel/mm/hugepages/hugepages-1048576kB/nr_hugepages
cat /sys/kernel/mm/hugepages/hugepages-1048576kB/free_hugepages
```

Kubernetes exposes each page size as its own schedulable resource, so the IO engine has to be told
to request `hugepages-1Gi` instead of `hugepages-2Mi`. Set the following Helm values at install
time:

```text
--set io_engine.resources.requests.hugepages1Gi=2Gi \
--set io_engine.resources.requests.hugepages2Mi=0 \
--set io_engine.resources.limits.hugepages2Mi=0
```

The 1GiB size is set through `requests` alone: the IO engine renders both its 1GiB request and
its 1GiB limit from that one value, as Kubernetes requires huge page requests and limits to be
equal.

Zeroing the 2MiB values is required. If both sizes are requested, the node must be able to supply
both, and the IO engine pod stays `Pending` on `Insufficient hugepages-2Mi` if it cannot.

:::warning
Set the 2MiB values to `0`, not to `null` or an empty value.

`0` keeps the `hugepages-2Mi` entry in the pod's resources with a value of zero, which is what the
kubelet uses to determine the page size of the `HugePages-2Mi` volume the IO engine mounts. `null`
removes the entry altogether, and the kubelet then refuses to mount that volume:

```text
MountVolume.SetUp failed for volume "hugepages-2mi" : medium HugePages-2Mi:
hugePages storage requested, but there is no resource request for huge pages
```

The pod is admitted and scheduled, then stays in `PodInitializing` with no restarts and no
container logs, so the cause is visible only in `kubectl describe pod` or in the namespace events.
An empty value (`--set ...hugepages2Mi=`) or `nil` is rejected outright by the API server, because
neither is a valid quantity.
:::

##### NUMA Considerations

On a multi-socket node, huge pages are reserved per NUMA node, and the IO engine allocates them
from the NUMA node its cores run on. Reserving enough pages in total is not sufficient if they
end up on a socket the IO engine does not use.

:::note
This applies to bare metal. Virtual machines are normally presented with a single, flat NUMA
node, in which case there is nothing to place and the rest of this section does not apply. Check
with `lscpu | grep -i 'NUMA node(s)'` or by listing `/sys/devices/system/node/`.
:::

Neither `vm.nr_hugepages` nor the `hugepages=` boot parameter places the pool on a particular
socket. Both spread it across the NUMA nodes, and how evenly they manage that depends on how much
contiguous free memory each node has at the time. Check the resulting distribution per node:

```text
cat /sys/devices/system/node/node*/hugepages/hugepages-2048kB/nr_hugepages
cat /sys/devices/system/node/node*/hugepages/hugepages-2048kB/free_hugepages
```

Use `hugepages-1048576kB` in place of `hugepages-2048kB` for 1GiB pages.

To reserve 2MiB pages on one specific NUMA node, write to that node's file rather than to
`vm.nr_hugepages`:

```text
echo 1024 | sudo tee /sys/devices/system/node/node0/hugepages/hugepages-2048kB/nr_hugepages
```

That write does not survive a reboot, and it cannot be made persistent through
`/etc/sysctl.conf`: `vm.nr_hugepages` applies to the whole system and has no per-node form. To
reserve pages on a specific node across reboots, use the node form of the kernel boot parameter
instead:

```text
hugepagesz=2M hugepages=0:1024
```

The `node:count` form requires **Linux 5.16 or later**, where it was introduced. Some
distributions backport it to earlier kernels, so check your own if you are on 5.15 or older —
where it is absent, the parameter is ignored and the pages are distributed across all nodes as
usual.

Several nodes can be given at once, as `hugepages=0:1024,1:1024`. Each `hugepages` applies to the
page size named by the `hugepagesz` before it, so the two sizes can be reserved independently.
Verify the result after rebooting:

```text
cat /sys/devices/system/node/node*/meminfo | grep Huge
```

If the IO engine is pinned to particular cores with `io_engine.coreList`, reserve the pages on the
NUMA node that owns those cores. `lscpu` reports which cores belong to which node.

The network interface carrying NVMe-oF traffic ideally sits on that same node. Check which node a
given interface is attached to:

```text
cat /sys/class/net/<interface>/device/numa_node
```

A value of `-1` means the kernel has no NUMA affinity for that device, which is the usual answer
on a virtual machine or a single-socket host.

The disks backing a DiskPool matter in the same way, and are checked the same way:

```text
cat /sys/block/nvme0n1/device/numa_node
```

When the pool disks and the storage interface sit on different NUMA nodes, no core placement
keeps both local. The I/O buffers live in huge pages on the node that owns the cores, so whichever
device is on the other node crosses the interconnect on every transfer. Choose by where the
traffic actually goes:

- **Replicated volumes, or volumes consumed from other nodes** — follow the network interface.
  A write crosses the network at least twice, once from the application node to this one and
  again from here to each additional replica, against a single local transfer to the disk.
- **Single-replica volumes consumed by pods on the same node** — follow the disks. There is
  little or no NVMe-oF traffic in that case, so the disk is the only path that counts.

Spreading `io_engine.coreList` across both NUMA nodes does not resolve the split. Each reactor is
then local to one device and remote from the other, and huge pages have to be reserved on both
nodes. Where the workload is genuinely mixed, the split is better fixed in the hardware layout —
pool disks on the socket that owns the storage interface, or an interface on the socket that owns
the disks.

:::note
A bad distribution is not reported anywhere. The IO engine's startup check reads the system-wide
totals under `/sys/kernel/mm/hugepages`, and kubelet advertises `hugepages-2Mi` as a single
node-level resource, so the pod is scheduled and the check passes even when every page sits on a
socket the IO engine cannot allocate from.
:::

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
