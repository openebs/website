---
id: installation
title: Installing OpenEBS
keywords: 
  - Installing OpenEBS
  - Installing OpenEBS through helm
description: This guide will help you to customize and install OpenEBS
---

This guide will help you to customize and install OpenEBS. 

## Prerequisites

If this is your first time installing OpenEBS Local Engine, make sure that your Kubernetes nodes meet the [required prerequisites](../user-guides/local-engine-user-guide/prerequisites.mdx).

For OpenEBS Replicated Engine, make sure that your Kubernetes nodes meet the [required prerequisites](../user-guides/replicated-engine-user-guide/prerequisites.md).

:::info
- The assumption is that the target cluster will pull the replicated engine container images directly from OpenEBS public container repositories. Where preferred, it is also possible to [build replicated engine locally from source](https://github.com/openebs/Mayastor/blob/develop/doc/build.md) and deploy the resultant images but this is outside of the scope of this guide.
- Deploying and operating replicated engine in production contexts requires a foundational knowledge of replicated engine internals and best practices, found elsewhere within this documentation.
- The sections that follow describing the replicated engine installation steps in this guide provide basic installation instructions of replicated engine on an existing Kubernetes cluster, sufficient for evaluation purposes. 
:::

At a high level OpenEBS requires:

- Verify that you have the admin context. If you do not have admin permissions to your cluster, check with your Kubernetes cluster administrator to help with installing OpenEBS or if you are the owner of the cluster, check out the [steps to create a new admin context](#set-cluster-admin-user-context) and use it for installing OpenEBS.
- You have Kubernetes 1.18 version or higher.
- Each storage engine may have few additional requirements like having:
  - Depending on the managed Kubernetes platform like Rancher or MicroK8s - set up the right bind mounts
  - Decide which of the devices on the nodes should be used by OpenEBS or if you need to create LVM Volume Groups or ZFS Pools
- Join [OpenEBS community on Kubernetes slack](../community.md).

## Installation via Helm - Local Engine

:::note
With OpenEBS v3.4, the OpenEBS helm chart now supports installation of Replicated Engine v2.0 storage engine.
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

The default OpenEBS helm chart will only install Local PV hostpath and replicated data engines. Refer to [OpenEBS helm chart documentation](https://github.com/openebs/charts/tree/master/charts/openebs) for full list of customizable options and using other flavors of OpenEBS data engines by setting the correct helm values. 

Install OpenEBS helm chart with default values. 

```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```
The above commands will install OpenEBS replicated and Local PV components in `openebs` namespace and chart name as `openebs`. To install and enable other engines you can modified the above command as follows:

To view the chart
```
helm ls -n openebs
```

As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

## Preparing the Cluster

:::caution
This section only applies if you are installing Replicated Engine.
:::

### Verify/Enable Huge Page Support

_2MiB-sized_  Huge Pages must be supported and enabled on the replicated engine storage nodes. A minimum number of 1024 such pages \(i.e. 2GiB total\) must be available _exclusively_ to the replicated engine pod on each node, which should be verified thus:

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
If you modify the Huge Page configuration of a node, you _MUST_ either restart kubelet or reboot the node.  replicated engine will not deploy correctly if the available Huge Page count as reported by the node's kubelet instance does not satisfy the minimum requirements.
:::

### Label Replicated Engine Node Candidates

All worker nodes which will have replicated engine pods running on them must be labelled with the OpenEBS engine type "replicated engine". This label will be used as a node selector by the Replicated Engine Daemonset, which is deployed as a part of the replicated engine data plane components installation. To add this label to a node, execute:

```text
kubectl label node <node_name> openebs.io/engine=mayastor
```

## Installation via Helm - Replicated Engine

:::tip
Before deploying and using Replicated Engine, see the [Known Issues](../troubleshooting/troubleshooting-replicated-engine.md#known-issues) section of this guide.
:::

:::info
- The steps and commands which follow are intended only for use in conjunction with Replicated Engine version(s) 2.1.x and above.
- The Replicated Engine Helm chart now includes the Dynamic Local Persistent Volume (LocalPV) provisioner as the default option for provisioning storage to etcd and Loki. This simplifies storage setup by utilizing local volumes within your Kubernetes cluster.
- For etcd, the chart uses the `mayastor-etcd-localpv` storage class, and for Loki, it utilizes the `mayastor-loki-localpv` storage class. These storage classes are bundled with the Replicated Engine chart, ensuring that your etcd and Loki instances are configured to use OpenEBS localPV volumes efficiently. 
`/var/local/{{ .Release.Name }}` paths should be persistent accross reboots.
:::

1.  Add the OpenEBS Replicated Engine Helm repository.

**Command**
```text
helm repo add mayastor https://openebs.github.io/mayastor-extensions/ 
```

**Output**
```text
"mayastor" has been added to your repositories
```

Run the following command to discover all the _stable versions_ of the added chart repository:

**Command**
```text
helm search repo mayastor --versions
```

**Output**
```text
 NAME             	CHART VERSION	APP VERSION  	DESCRIPTION                       
mayastor/mayastor	2.4.0        	2.4.0       	Replicated Engine Helm chart for Kubernetes
```

:::info
To discover all the versions (including unstable versions), execute:
`helm search repo mayastor --devel --versions`
:::

3. Run the following command to install Replicated Engine _version 2.4.

**Command**
```text
helm install mayastor mayastor/mayastor -n mayastor --create-namespace --version 2.4.0
```

**Output**
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

Verify the status of the pods by running the command:

**Command**
```text
kubectl get pods -n mayastor
```

**Sample Output for a Three Node Cluster**
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

## Verifying OpenEBS Installation

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
openebs-provisioner-657486f6ff-pxdbc           1/1     Running   0          98s
openebs-snapshot-operator-5bdcdc9b77-v7n4w     2/2     Running   0          97s
```

The control plane pods `openebs-provisioner`, `maya-apiserver` and `openebs-snapshot-operator` should be running. If you have configured nodeSelectors, check if they are scheduled on the appropriate nodes by listing the pods through `kubectl get pods -n openebs -o wide`

**Verify StorageClasses:**

List the storage classes to check if OpenEBS has installed with default StorageClasses.  

```
kubectl get sc
```

In the successful installation, you should have the following StorageClasses are created.

```shell hideCopy
NAME                        PROVISIONER                                                AGE
openebs-hostpath            openebs.io/local                                           64s
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   64s
```

## Post-Installation Considerations

For testing your OpenEBS installation, you can use the `openebs-hostpath` mentioned in the [Local Engine User Guide](../user-guides/local-engine-user-guide/) for provisioning Local PV on hostpath.

You can follow through the below user guides for each of the engines to use storage devices available on the nodes instead of the `/var/openebs` directory to save the data.  
- [Local Engine User Guide](../user-guides/local-engine-user-guide/)
- [Replicated Engine User Guide](../user-guides/replicated-engine-user-guide/)

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

[OpenEBS Architecture](../concepts/architecture.md)

[OpenEBS Use Cases and Examples](../introduction-to-openebs/use-cases-and-examples.mdx)

[Troubleshooting](../troubleshooting/)