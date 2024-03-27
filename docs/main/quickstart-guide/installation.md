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

At a high level OpenEBS requires:

- Verify that you have the admin context. If you do not have admin permissions to your cluster, check with your Kubernetes cluster administrator to help with installing OpenEBS or if you are the owner of the cluster, check out the [steps to create a new admin context](#set-cluster-admin-user-context) and use it for installing OpenEBS.
- You have Kubernetes 1.18 version or higher.
- Each storage engine may have few additional requirements like having:
  - Depending on the managed Kubernetes platform like Rancher or MicroK8s - set up the right bind mounts
  - Decide which of the devices on the nodes should be used by OpenEBS or if you need to create LVM Volume Groups or ZFS Pools
- Join [OpenEBS community on Kubernetes slack](../community.md).

## Installation via Helm

Verify helm is installed and helm repo is updated. You need helm 3.2 or more. 

Setup helm repository
```
helm repo add openebs https://openebs.github.io/openebs
helm repo update
```

OpenEBS provides several options that you can customize during install like:
- specifying the directory where hostpath volume data is stored or
- specifying the nodes on which OpenEBS components should be deployed and so forth. 

The default OpenEBS helm chart will install both local engines and replicated engine. Refer to [OpenEBS helm chart documentation](https://github.com/openebs/charts/tree/master/charts/openebs) for full list of customizable options and using other flavors of OpenEBS data engines by setting the correct helm values. 

Install OpenEBS helm chart with default values. 

```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```

The above commands will install OpenEBS LocalPV Hostpath, OpenEBS LocalPV LVM, OpenEBS LocalPV ZFS, and OpenEBS Replicated Engine components in `openebs` namespace and chart name as `openebs`.

:::note
If you do not want to install OpenEBS Replicated Engine, use the following command:

```
helm install openebs --namespace openebs openebs/openebs --set mayastor.enabled=false --create-namespace
```

To view the chart and get the output, use the following commands:

**Command**
```
helm ls -n openebs
```
**Output**
```
NAME     NAMESPACE   REVISION  UPDATED                                   STATUS     CHART           APP VERSION
openebs  openebs     1         2024-03-25 09:13:00.903321318 +0000 UTC   deployed   openebs-4.0.0   4.0.0
```
:::

As a next step [verify](#verifying-openebs-installation) your installation and do the[post installation](#post-installation-considerations) steps.

## Verifying OpenEBS Installation

### Verify Pods 

#### Default Installation

List the pods in `<openebs>` namespace 

```
  kubectl get pods -n openebs
```

In the successful installation of OpenEBS, you should see an example output like below:

```
NAME                                              READY   STATUS    RESTARTS   AGE
openebs-agent-core-674f784df5-7szbm               2/2     Running   0          11m
openebs-agent-ha-node-nnkmv                       1/1     Running   0          11m
openebs-agent-ha-node-pvcrr                       1/1     Running   0          11m
openebs-agent-ha-node-rqkkk                       1/1     Running   0          11m
openebs-api-rest-79556897c8-b824j                 1/1     Running   0          11m
openebs-csi-controller-b5c47d49-5t5zd             6/6     Running   0          11m
openebs-csi-node-flq49                            2/2     Running   0          11m
openebs-csi-node-k8d7h                            2/2     Running   0          11m
openebs-csi-node-v7jfh                            2/2     Running   0          11m
openebs-etcd-0                                    1/1     Running   0          11m
openebs-etcd-1                                    1/1     Running   0          11m
openebs-etcd-2                                    1/1     Running   0          11m
openebs-io-engine-7t6tf                           2/2     Running   0          11m
openebs-io-engine-9df6r                           2/2     Running   0          11m
openebs-io-engine-rqph4                           2/2     Running   0          11m
openebs-localpv-provisioner-6ddf7c7978-4fkvs      1/1     Running   0          11m
openebs-loki-0                                    1/1     Running   0          11m
openebs-lvm-localpv-controller-7b6d6b4665-fk78q   5/5     Running   0          11m
openebs-lvm-localpv-node-mcch4                    2/2     Running   0          11m
openebs-lvm-localpv-node-pdt88                    2/2     Running   0          11m
openebs-lvm-localpv-node-r9jn2                    2/2     Running   0          11m
openebs-nats-0                                    3/3     Running   0          11m
openebs-nats-1                                    3/3     Running   0          11m
openebs-nats-2                                    3/3     Running   0          11m
openebs-obs-callhome-854bc967-5f879               2/2     Running   0          11m
openebs-operator-diskpool-5586b65c-cwpr8          1/1     Running   0          11m
openebs-promtail-2vrzk                            1/1     Running   0          11m
openebs-promtail-mwxk8                            1/1     Running   0          11m
openebs-promtail-w7b8k                            1/1     Running   0          11m
openebs-zfs-localpv-controller-f78f7467c-blr7q    5/5     Running   0          11m
openebs-zfs-localpv-node-h46m5                    2/2     Running   0          11m
openebs-zfs-localpv-node-svfgq                    2/2     Running   0          11m
openebs-zfs-localpv-node-wm9ks                    2/2     Running   0          11m
```

#### Installation with Replicated Engine Disabled

List the pods in `<openebs>` namespace 

```
  kubectl get pods -n openebs
```

In the successful installation of OpenEBS, you should see an example output like below:

```
NAME                                              READY   STATUS    RESTARTS   AGE
openebs-localpv-provisioner-6ddf7c7978-jsstg      1/1     Running   0          3m9s
openebs-lvm-localpv-controller-7b6d6b4665-wfw64   5/5     Running   0          3m9s
openebs-lvm-localpv-node-62lnq                    2/2     Running   0          3m9s
openebs-lvm-localpv-node-lhndx                    2/2     Running   0          3m9s
openebs-lvm-localpv-node-tlcqv                    2/2     Running   0          3m9s
openebs-zfs-localpv-controller-f78f7467c-k7ldb    5/5     Running   0          3m9s
openebs-zfs-localpv-node-5mwbz                    2/2     Running   0          3m9s
openebs-zfs-localpv-node-g45ft                    2/2     Running   0          3m9s
openebs-zfs-localpv-node-g77g6                    2/2     Running   0          3m9s
```

### Verify StorageClasses

List the storage classes to check if OpenEBS has installed with default StorageClasses.  

```
kubectl get sc
```

In the successful installation, you should have the following StorageClasses are created:

```
NAME                       PROVISIONER               RECLAIMPOLICY   VOLUMEBINDINGMODE    ALLOWVOLUMEEXPANSION 
mayastor-etcd-localpv      openebs.io/local          Delete          WaitForFirstConsumer false
mayastor-loki-localpv      openebs.io/local          Delete          WaitForFirstConsumer false
openebs-hostpath           openebs.io/local          Delete          WaitForFirstConsumer false
openebs-single-replica     io.openebs.csi-mayastor   Delete          Immediate            true
```

## Post-Installation Considerations

For testing your OpenEBS installation, you can use the `openebs-hostpath` mentioned in the [Local Engine User Guide](../user-guides/local-engine-user-guide/) for provisioning Local PV on hostpath.

You can follow through the below user guides for each of the engines to use storage devices available on the nodes instead of the `/var/openebs` directory to save the data.  
- [Local Engine User Guide](../user-guides/local-engine-user-guide/)
- [Replicated Engine User Guide](../user-guides/replicated-engine-user-guide/)

## See Also

[OpenEBS Architecture](../concepts/architecture.md)

[OpenEBS Use Cases and Examples](../introduction-to-openebs/use-cases-and-examples.mdx)

[Troubleshooting](../troubleshooting/)