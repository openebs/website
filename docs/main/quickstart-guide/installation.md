---
id: installation
title: Installing OpenEBS
keywords: 
  - Installing OpenEBS
  - Installing OpenEBS through helm
  - Installing OpenEBS through kubectl 
description: This guide will help you to customize and install OpenEBS
---

This guide will help you to customize and install OpenEBS. 

## Prerequisites

If this is your first time installing OpenEBS, make sure that your Kubernetes nodes meet the [required prerequisites](/user-guides/prerequisites). At a high level OpenEBS requires:

- Verify that you have the admin context. If you do not have admin permissions to your cluster, please check with your Kubernetes cluster administrator to help with installing OpenEBS or if you are the owner of the cluster, check out the [steps to create a new admin context](#set-cluster-admin-user-context) and use it for installing OpenEBS.
- You have Kubernetes 1.18 version or higher.
- Each storage engine may have few additional requirements like having:
  - iSCSI initiator utils installed for Jiva and cStor volumes
  - Depending on the managed Kubernetes platform like Rancher or MicroK8s - set up the right bind mounts
  - Decide which of the devices on the nodes should be used by OpenEBS or if you need to create LVM Volume Groups or ZFS Pools
- Join [OpenEBS community on Kubernetes slack](/introduction/commercial).

## Installation through helm

:::note
With OpenEBS v3.4, the OpenEBS helm chart now supports installation of Mayastor v2.0 storage engine.
:::

Verify helm is installed and helm repo is updated. You need helm 3.2 or more. 

Setup helm repository
```
helm repo add openebs https://openebs.github.io/charts
helm repo update
```

OpenEBS provides several options that you can customize during install like:
- specifying the directory where hostpath volume data is stored or
- specifying the nodes on which OpenEBS components should be deployed, and so forth. 

The default OpenEBS helm chart will only install Local PV hostpath and Jiva data engines. Please refer to [OpenEBS helm chart documentation](https://github.com/openebs/charts/tree/master/charts/openebs) for full list of customizable options and using cStor and other flavors of OpenEBS data engines by setting the correct helm values. 

Install OpenEBS helm chart with default values. 

```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```
The above commands will install OpenEBS Jiva and Local PV components in `openebs` namespace and chart name as `openebs`. To install and enable other engines you can modified the above command as follows:

- cStor 
  ```
  helm install openebs --namespace openebs openebs/openebs --create-namespace --set cstor.enabled=true
  ```

To view the chart
```
helm ls -n openebs
```

As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

## Installation through kubectl 

OpenEBS provides a list of YAMLs that will allow you to easily customize and run OpenEBS in your Kubernetes cluster. For custom installation, [download](https://openebs.github.io/charts/openebs-operator.yaml) the **openebs-operator** YAML file, update the configurations and use the customized YAML for installation in the below `kubectl` command.

To continue with default installation mode, use the following command to install OpenEBS. OpenEBS is installed in `openebs` namespace. 

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
```

The above command installs Jiva and Local PV components. To install and enable other engines you will need to run additional command like:
- cStor 
  ```
  kubectl apply -f https://openebs.github.io/charts/cstor-operator.yaml
  ```
- Local PV ZFS
  ```
  kubectl apply -f https://openebs.github.io/charts/zfs-operator.yaml
  ```
- Local PV LVM
  ```
  kubectl apply -f https://openebs.github.io/charts/lvm-operator.yaml
  ```

## Verifying OpenEBS installation


**Verify pods:**

List the pods in `<openebs>` namespace 

```
  kubectl get pods -n openebs
```

In the successful installation of OpenEBS, you should see an example output like below.

```shell hideCopy
NAME                                           READY   STATUS    RESTARTS   AGE
maya-apiserver-d77867956-mv9ls                 1/1     Running   3          99s
openebs-admission-server-7f565bcbb5-lp5sk      1/1     Running   0          95s
openebs-localpv-provisioner-7bb98f549d-ljcc5   1/1     Running   0          94s
openebs-ndm-dn422                              1/1     Running   0          96s
openebs-ndm-operator-84849677b7-rhfbk          1/1     Running   1          95s
openebs-ndm-ptxss                              1/1     Running   0          96s
openebs-ndm-zpr2l                              1/1     Running   0          96s
openebs-provisioner-657486f6ff-pxdbc           1/1     Running   0          98s
openebs-snapshot-operator-5bdcdc9b77-v7n4w     2/2     Running   0          97s
```

`openebs-ndm` is a daemon set, it should be running on all nodes or on the nodes that are selected through nodeSelector configuration.

The control plane pods `openebs-provisioner`, `maya-apiserver` and `openebs-snapshot-operator` should be running. If you have configured nodeSelectors , check if they are scheduled on the appropriate nodes by listing the pods through `kubectl get pods -n openebs -o wide`

**Verify StorageClasses:**

List the storage classes to check if OpenEBS has installed with default StorageClasses.  

```
kubectl get sc
```

In the successful installation, you should have the following StorageClasses are created.

```shell hideCopy
NAME                        PROVISIONER                                                AGE
openebs-device              openebs.io/local                                           64s
openebs-hostpath            openebs.io/local                                           64s
openebs-jiva-default        openebs.io/provisioner-iscsi                               64s
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   64s
```

## Post-Installation considerations

For testing your OpenEBS installation, you can use the below default storage classes

- `openebs-jiva-default` for provisioning Jiva Volume (this uses `default` pool which means the data replicas are created in the /var/openebs/ directory of the Jiva replica pod)

- `openebs-hostpath` for provisioning Local PV on hostpath.

You can follow through the below user guides for each of the engines to use storage devices available on the nodes instead of the `/var/openebs` directory to save the data.  
- [cStor](/user-guides/cstor-csi)
- [Jiva](/user-guides/jiva-guide)
- [Local PV](/user-guides/localpv-hostpath)

## Troubleshooting

### Set cluster-admin user context

For installation of OpenEBS, cluster-admin user context is a must. OpenEBS installs service accounts and custom resource definitions that are only allowed for cluster administrators. 

Use the `kubectl auth can-i` commands to verify that you have the cluster-admin context. You can use the following commands to verify if you have access: 

```
kubectl auth can-i 'create' 'namespace' -A
kubectl auth can-i 'create' 'crd' -A
kubectl auth can-i 'create' 'sa' -A
kubectl auth can-i 'create' 'clusterrole' -A
```

If there is no cluster-admin user context already present, create one and use it. Use the following command to create the new context.

```
kubectl config set-context NAME [--cluster=cluster_nickname] [--user=user_nickname] [--namespace=namespace]
```

Example:

```
kubectl config set-context admin-ctx --cluster=gke_strong-eon-153112_us-central1-a_rocket-test2 --user=cluster-admin
```

Set the existing cluster-admin user context or the newly created context by using the following command.

Example:

```
kubectl config use-context admin-ctx
```

## See Also:

[OpenEBS Architecture](/concepts/architecture) [OpenEBS Examples](/introduction/usecases) [Troubleshooting](/troubleshooting)

(Below listed are the Mayastor Contents - For Internal reference)
# Scope

This quickstart guide describes the actions necessary to perform a basic installation of Mayastor on an existing Kubernetes cluster, sufficient for evaluation purposes. It assumes that the target cluster will pull the Mayastor container images directly from OpenEBS public container repositories. Where preferred, it is also possible to [build Mayastor locally from source](https://github.com/openebs/Mayastor/blob/develop/doc/build.md) and deploy the resultant images but this is outside of the scope of this guide.

Deploying and operating Mayastor in production contexts requires a foundational knowledge of Mayastor internals and best practices, found elsewhere within this documentation. 

# Preparing the Cluster

### Verify / Enable Huge Page Support

_2MiB-sized_  Huge Pages must be supported and enabled on the mayastor storage nodes.  A minimum number of 1024 such pages \(i.e. 2GiB total\) must be available _exclusively_ to the Mayastor pod on each node, which should be verified thus:

```text
grep HugePages /proc/meminfo

AnonHugePages:         0 kB
ShmemHugePages:        0 kB
HugePages_Total:    1024
HugePages_Free:      671
HugePages_Rsvd:        0
HugePages_Surp:        0

```

If fewer than 1024 pages are available then the page count should be reconfigured on the worker node as required, accounting for any other workloads which may be scheduled on the same node and which also require them.  For example:

```text
echo 1024 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
```

This change should also be made persistent across reboots by adding the required value to the file`/etc/sysctl.conf` like so:

```text
echo vm.nr_hugepages = 1024 | sudo tee -a /etc/sysctl.conf
```

{% hint style="warning" %}
If you modify the Huge Page configuration of a node, you _MUST_ either restart kubelet or reboot the node.  Mayastor will not deploy correctly if the available Huge Page count as reported by the node's kubelet instance does not satisfy the minimum requirements.
{% endhint %}

### Label Mayastor Node Candidates

All worker nodes which will have Mayastor pods running on them must be labelled with the OpenEBS engine type "mayastor".  This label will be used as a node selector by the Mayastor Daemonset, which is deployed as a part of the Mayastor data plane components installation. To add this label to a node, execute:

```text
kubectl label node <node_name> openebs.io/engine=mayastor
```

# Deploy Mayastor

## Overview

{% hint style="note" %}
Before deploying and using Mayastor please consult the [Known Issues](troubleshooting-replicated-engine.md) section of this guide.
{% endhint %}

The steps and commands which follow are intended only for use in conjunction with Mayastor version(s) 2.1.x and above.

## Installation via helm

{% hint style="info" %}
The Mayastor Helm chart now includes the Dynamic Local Persistent Volume (LocalPV) provisioner as the default option for provisioning storage to etcd and Loki. This simplifies storage setup by utilizing local volumes within your Kubernetes cluster.
For etcd, the chart uses the `mayastor-etcd-localpv` storage class, and for Loki, it utilizes the `mayastor-loki-localpv` storage class. These storage classes are bundled with the Mayastor chart, ensuring that your etcd and Loki instances are configured to use openEbs localPV volumes efficiently. 
`/var/local/{{ .Release.Name }}` paths should be persistent accross reboots.
{% endhint %}

1.  Add the OpenEBS Mayastor Helm repository.
{% tabs %}
{% tab title="Command" %}
```text
helm repo add mayastor https://openebs.github.io/mayastor-extensions/ 
```
{% endtab %}
{% tab title="Output" %}
```text
"mayastor" has been added to your repositories
```
{% endtab %}
{% endtabs %}


Run the following command to discover all the _stable versions_ of the added chart repository:

{% tabs %}
{% tab title="Command" %}
```text
helm search repo mayastor --versions
```
{% endtab %}
{% tab title="Sample Output" %}
```text
 NAME             	CHART VERSION	APP VERSION  	DESCRIPTION                       
mayastor/mayastor	2.4.0        	2.4.0       	Mayastor Helm chart for Kubernetes
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
To discover all the versions (including unstable versions), execute:
`helm search repo mayastor --devel --versions`
{% endhint %}


3. Run the following command to install Mayastor _version 2.4.
{% tabs %}
{% tab title="Command" %}
```text
helm install mayastor mayastor/mayastor -n mayastor --create-namespace --version 2.4.0
```
{% endtab %}
{% tab title="Sample Output" %}
```text
NAME: mayastor
LAST DEPLOYED: Thu Sep 22 18:59:56 2022
NAMESPACE: mayastor
STATUS: deployed
REVISION: 1
NOTES:
OpenEBS Mayastor has been installed. Check its status by running:
$ kubectl get pods -n mayastor

For more information or to view the documentation, visit our website at https://openebs.io.
```
{% endtab %}
{% endtabs %}

Verify the status of the pods by running the command:

{% tabs %}
{% tab title="Command" %}
```text
kubectl get pods -n mayastor
```
{% endtab %}
{% tab title="Sample Output for a three Mayastor node cluster" %}
```text
NAME                                         READY   STATUS    RESTARTS   AGE
mayastor-agent-core-6c485944f5-c65q6         2/2     Running   0          2m13s
mayastor-agent-ha-node-42tnm                 1/1     Running   0          2m14s
mayastor-agent-ha-node-45srp                 1/1     Running   0          2m14s
mayastor-agent-ha-node-tzz9x                 1/1     Running   0          2m14s
mayastor-api-rest-5c79485686-7qg5p           1/1     Running   0          2m13s
mayastor-csi-controller-65d6bc946-ldnfb      3/3     Running   0          2m13s
mayastor-csi-node-f4fgd                      2/2     Running   0          2m13s
mayastor-csi-node-ls9m4                      2/2     Running   0          2m13s
mayastor-csi-node-xtcfc                      2/2     Running   0          2m13s
mayastor-etcd-0                              1/1     Running   0          2m13s
mayastor-etcd-1                              1/1     Running   0          2m13s
mayastor-etcd-2                              1/1     Running   0          2m13s
mayastor-io-engine-f2wm6                     2/2     Running   0          2m13s
mayastor-io-engine-kqxs9                     2/2     Running   0          2m13s
mayastor-io-engine-m44ms                     2/2     Running   0          2m13s
mayastor-loki-0                              1/1     Running   0          2m13s
mayastor-obs-callhome-5f47c6d78b-fzzd7       1/1     Running   0          2m13s
mayastor-operator-diskpool-b64b9b7bb-vrjl6   1/1     Running   0          2m13s
mayastor-promtail-cglxr                      1/1     Running   0          2m14s
mayastor-promtail-jc2mz                      1/1     Running   0          2m14s
mayastor-promtail-mr8nf                      1/1     Running   0          2m14s
```
{% endtab %}
{% endtabs %} 

# Configure Mayastor

## Create DiskPool\(s\)


### What is a DiskPool?

When a node allocates storage capacity for a replica of a persistent volume (PV) it does so from a DiskPool. Each node may create and manage zero, one, or more such pools. The ownership of a pool by a node is exclusive. A pool can manage only one block device, which constitutes the entire data persistence layer for that pool and thus defines its maximum storage capacity.

A pool is defined declaratively, through the creation of a corresponding `DiskPool` custom resource on the cluster. The DiskPool must be created in the same namespace where Mayastor has been deployed. User configurable parameters of this resource type include a unique name for the pool, the node name on which it will be hosted and a reference to a disk device which is accessible from that node. The pool definition requires the reference to its member block device to adhere to a discrete range of schemas, each associated with a specific access mechanism/transport/ or device type.

{% hint style="info" %}
Mayastor versions before 2.0.1 had an upper limit on the number of retry attempts in the case of failure in `create events` in the DSP operator. With this release, the upper limit has been removed, which ensures that the DiskPool operator indefinitely reconciles with the CR.
{% endhint %}

#### Permissible Schemes for `spec.disks` under DiskPool CR

{% hint style="info" %}
It is highly recommended to specify the disk using a unique device link that remains unaltered across node reboots. Examples of such device links are: by-path or by-id.

Easy way to retrieve device link for a given node:
`kubectl mayastor get block-devices worker`

```
DEVNAME       DEVTYPE  SIZE      AVAILABLE  MODEL                             DEVPATH                                                           MAJOR  MINOR  DEVLINKS 
/dev/nvme0n1  disk     894.3GiB  yes        Dell DC NVMe PE8010 RI U.2 960GB  /devices/pci0000:30/0000:30:02.0/0000:31:00.0/nvme/nvme0/nvme0n1  259    0      "/dev/disk/by-id/nvme-eui.ace42e00164f0290", "/dev/disk/by-path/pci-0000:31:00.0-nvme-1", "/dev/disk/by-dname/nvme0n1", "/dev/disk/by-id/nvme-Dell_DC_NVMe_PE8010_RI_U.2_960GB_SDA9N7266I110A814"
```

Usage of the device name (for example, /dev/sdx) is not advised, as it may change if the node reboots, which might cause data corruption.
{% endhint %}

| Type | Format | Example |
| :--- | :--- | :--- |
| Disk(non PCI) with disk-by-guid reference <i><b>(Best Practice)</b></i> | Device File | aio:///dev/disk/by-id/<id> OR uring:///dev/disk/by-id/</id> |
| Asynchronous Disk\(AIO\) | Device File | /dev/sdx |
| Asynchronous Disk I/O \(AIO\) | Device File | aio:///dev/sdx |
| io\_uring | Device File | uring:///dev/sdx |


Once a node has created a pool it is assumed that it henceforth has exclusive use of the associated block device; it should not be partitioned, formatted, or shared with another application or process. Any pre-existing data on the device will be destroyed.

{% hint style="warning" %}
A RAM drive isn't suitable for use in production as it uses volatile memory for backing the data. The memory for this disk emulation is allocated from the hugepages pool. Make sure to allocate sufficient additional hugepages resource on any storage nodes which will provide this type of storage.
{% endhint %}

### Configure Pools for Use with this Quickstart

To get started, it is necessary to create and host at least one pool on one of the nodes in the cluster. The number of pools available limits the extent to which the synchronous N-way mirroring (replication) of PVs can be configured; the number of pools configured should be equal to or greater than the desired maximum replication factor of the PVs to be created. Also, while placing data replicas ensure that appropriate redundancy is provided. Mayastor's control plane will avoid placing more than one replica of a volume on the same node. For example, the minimum viable configuration for a Mayastor deployment which is intended to implement 3-way mirrored PVs must have three nodes, each having one DiskPool, with each of those pools having one unique block device allocated to it.

Using one or more the following examples as templates, create the required type and number of pools.

{% tabs %}
{% tab title="Example DiskPool definition" %}
```text
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1beta1"
kind: DiskPool
metadata:
  name: pool-on-node-1
  namespace: mayastor
spec:
  node: workernode-1-hostname
  disks: ["/dev/disk/by-id/<id>"]
EOF
```
{% endtab %}

{% tab title="YAML" %}
```text
apiVersion: "openebs.io/v1beta1"
kind: DiskPool
metadata:
  name: INSERT_POOL_NAME_HERE
  namespace: mayastor
spec:
  node: INSERT_WORKERNODE_HOSTNAME_HERE
  disks: ["INSERT_DEVICE_URI_HERE"]
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
When using the examples given as guides to creating your own pools, remember to replace the values for the fields "metadata.name", "spec.node" and "spec.disks" as appropriate to your cluster's intended configuration. Note that whilst the "disks" parameter accepts an array of values, the current version of Mayastor supports only one disk device per pool.
{% endhint %}

{% hint style="note" %}

Existing schemas in Custom Resource (CR) definitions (in older versions) will be updated from v1alpha1 to v1beta1 after upgrading to Mayastor 2.4 and above. To resolve errors encountered pertaining to the upgrade, click [here](quickstart/troubleshooting.md).

{% endhint %}

### Verify Pool Creation and Status

The status of DiskPools may be determined by reference to their cluster CRs. Available, healthy pools should report their State as `online`. Verify that the expected number of pools have been created and that they are online.

{% tabs %}
{% tab title="Command" %}
```text
kubectl get dsp -n mayastor
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME             NODE          STATE    POOL_STATUS   CAPACITY      USED   AVAILABLE
pool-on-node-1   node-1-14944  Created   Online        10724835328   0      10724835328
pool-on-node-2   node-2-14944  Created   Online        10724835328   0      10724835328
pool-on-node-3   node-3-14944  Created   Online        10724835328   0      10724835328
```
{% endtab %}
{% endtabs %}

    
----------
    
    
## Create Mayastor StorageClass\(s\)

Mayastor dynamically provisions PersistentVolumes \(PVs\) based on StorageClass definitions created by the user. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. For a detailed description of these parameters see [storage class parameter description](https://mayastor.gitbook.io/introduction/reference/storage-class-parameters). Most importantly StorageClass definition is used to control the level of data protection afforded to it \(that is, the number of synchronous data replicas which are maintained, for purposes of redundancy\). It is possible to create any number of StorageClass definitions, spanning all permitted parameter permutations.

We illustrate this quickstart guide with two examples of possible use cases; one which offers no data redundancy \(i.e. a single data replica\), and another having three data replicas. 
{% hint style="info" %}
Both the example YAMLs given below have [thin provisioning](https://mayastor.gitbook.io/introduction/quickstart/configure-mayastor/storage-class-parameters#thin) enabled. You can modify these as required to match your own desired test cases, within the limitations of the cluster under test.
{% endhint %}

{% tabs %}
{% tab title="Command \(1 replica example\)" %}
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "1"
provisioner: io.openebs.csi-mayastor
EOF
```
{% endtab %}

{% tab title="Command \(3 replicas example\)" %}
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "3"
provisioner: io.openebs.csi-mayastor
EOF
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
The default installation of Mayastor includes the creation of a StorageClass with the name `mayastor-single-replica`. The replication factor is set to 1. Users may either use this StorageClass or create their own.
{% endhint %}

# Storage class parameters

Storage class resource in Kubernetes is used to supply parameters to volumes when they are created. It is a convenient way of grouping volumes with common characteristics. All parameters take a string value. Brief explanation of each supported Mayastor parameter follows.


{% hint style="info" %}

The storage class parameter `local` has been deprecated and is a breaking change in Mayastor version 2.0. Ensure that this parameter is not used.
 
{% endhint %}


## "fsType"

File system that will be used when mounting the volume. 
The supported file systems are **ext4**, **xfs** and **btrfs** and the default file system when not specified is **ext4**. We recommend to use **xfs** that is considered to be more advanced and performant. 
Please ensure the requested filesystem driver is installed on all worker nodes in the cluster before using it.

## "protocol"

The parameter 'protocol' takes the value `nvmf`(NVMe over TCP protocol). It is used to mount the volume (target) on the application node.

## "repl"

The string value should be a number and the number should be greater than zero. Mayastor control plane will try to keep always this many copies of the data if possible. If set to one then the volume does not tolerate any node failure. If set to two, then it tolerates one node failure. If set to three, then two node failures, etc.

## "thin"

The volumes can either be `thick` or `thin` provisioned. Adding the `thin` parameter to the StorageClass YAML allows the volume to be thinly provisioned. To do so, add `thin: true` under the `parameters` spec, in the StorageClass YAML. [Sample YAML](https://mayastor.gitbook.io/introduction/quickstart/configure-mayastor#create-mayastor-storageclass-s)
When the volumes are thinly provisioned, the user needs to monitor the pools, and if these pools start to run out of space, then either new pools must be added or volumes deleted to prevent thinly provisioned volumes from getting degraded or faulted. This is because when a pool with more than one replica runs out of space, Mayastor moves the largest out-of-space replica to another pool and then executes a rebuild. It then checks if all the replicas have sufficient space; if not, it moves the next largest replica to another pool, and this process continues till all the replicas have sufficient space.

{% hint style="info" %}
The capacity usage on a pool can be monitored using [exporter metrics](https://mayastor.gitbook.io/introduction/advanced-operations/monitoring#pool-metrics-exporter).
{% endhint %}

The `agents.core.capacity.thin` spec present in the Mayastor helm chart consists of the following configurable parameters that can be used to control the scheduling of thinly provisioned replicas:

1. **poolCommitment** parameter specifies the maximum allowed pool commitment limit (in percent).
2. **volumeCommitment** parameter specifies the minimum amount of free space that must be present in each replica pool in order to create new replicas for an existing volume. This value is specified as a percentage of the volume size.
3. **volumeCommitmentInitial** minimum amount of free space that must be present in each replica pool in order to create new replicas for a new volume. This value is specified as a percentage of the volume size.


{% hint style="info" %}
Note:
1. By default, the volumes are provisioned as `thick`. 
2. For a pool of a particular size, say 10 Gigabytes, a volume > 10 Gigabytes cannot be created, as Mayastor currently does not support pool expansion.
3. The replicas for a given volume can be either all thick or all thin. Same volume cannot have a combination of thick and thin replicas
{% endhint %}


## "stsAffinityGroup" 

 `stsAffinityGroup` represents a collection of volumes that belong to instances of Kubernetes StatefulSet. When a StatefulSet is deployed, each instance within the StatefulSet creates its own individual volume, which collectively forms the `stsAffinityGroup`. Each volume within the `stsAffinityGroup` corresponds to a pod of the StatefulSet.

This feature enforces the following rules to ensure the proper placement and distribution of replicas and targets so that there isn't any single point of failure affecting multiple instances of StatefulSet.

1. Anti-Affinity among single-replica volumes :
 This rule ensures that replicas of different volumes are distributed in such a way that there is no single point of failure. By avoiding the colocation of replicas from different volumes on the same node.

2.  Anti-Affinity among multi-replica volumes : 

If the affinity group volumes have multiple replicas, they already have some level of redundancy. This feature ensures that in such cases, the replicas are distributed optimally for the stsAffinityGroup volumes.


3. Anti-affinity among targets :

The [High Availability](https://mayastor.gitbook.io/introduction/advanced-operations/ha) feature ensures that there is no single point of failure for the targets.
The `stsAffinityGroup` ensures that in such cases, the targets are distributed optimally for the stsAffinityGroup volumes.

By default, the `stsAffinityGroup` feature is disabled. To enable it, modify the storage class YAML by setting the `parameters.stsAffinityGroup` parameter to true.

## "cloneFsIdAsVolumeId"

`cloneFsIdAsVolumeId` is a setting for volume clones/restores with two options: `true` and `false`. By default, it is set to `false`.
- When set to `true`, the created clone/restore's filesystem `uuid` will be set to the restore volume's `uuid`. This is important because some file systems, like XFS, do not allow duplicate filesystem `uuid` on the same machine by default.
- When set to `false`, the created clone/restore's filesystem `uuid` will be same as the orignal volume `uuid`, but it will be mounted using the `nouuid` flag to bypass duplicate `uuid` validation.

{% hint style="note" %}
This option needs to be set to true when using a `btrfs` filesystem, if the application using the restored volume is scheduled on the same node where the original volume is mounted, concurrently.
{% endhint %}
