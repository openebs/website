---
id: rs-installation
title: Installation
keywords:
 - Replicated Storage Prerequisites
 - Prerequisites
 - Replicated Storage Installation
 - Linux platforms
 - Managed Kubernetes Services on Public Cloud
 - Kubernetes On-Prem Solutions
description: This guide will help you to verify that your Kubernetes worker nodes have the required prerequisites to install OpenEBS and use OpenEBS Volumes to run your Kubernetes Stateful Workloads. In addition, you will learn about how to customize the installer according to your managed Kubernetes provider.
---

## Prerequisites

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

### Network Requirements

* Ensure that the following ports are **not** in use on the node:
  - **10124**: Mayastor gRPC server will use this port.
  - **8420 / 4421**: NVMf targets will use these ports.
* The firewall settings should not restrict connection to the node.

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

<!--
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

All worker nodes which will have IO engine pods running on them must be labeled with the OpenEBS storage type "Replicated PV Mayastor". This label will be used as a node selector by the IO engine Daemonset, which is deployed as a part of the Replicated PV Mayastor data plane components installation. To add this label to a node, execute:

```
kubectl label node <node_name> openebs.io/engine=mayastor
```

:::warning
If you set `csi.node.topology.nodeSelector: true`, then you will need to label the worker nodes accordingly to `csi.node.topology.segments`. Both csi-node and agent-ha-node Daemonsets will include the topology segments into the node selector.
:::

## Installation 

For installation instructions, see [here](../../../quickstart-guide/installation.md).

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Configuration](../replicated-pv-mayastor/rs-configuration.md)
- [Deploy an Application](../replicated-pv-mayastor/rs-deployment.md)