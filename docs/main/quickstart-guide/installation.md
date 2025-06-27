---
id: installation
title: OpenEBS Installation
keywords: 
  - OpenEBS Installation
  - Installing OpenEBS
  - Installing OpenEBS through helm
  - Installation
description: This guide will help you to customize and install OpenEBS
---

This guide will help you to set up, customize, and install OpenEBS and use OpenEBS Volumes to run your Kubernetes Stateful Workloads. If you are new to running Stateful workloads in Kubernetes, you will need to familiarize yourself with [Kubernetes Storage Concepts](../concepts/basics.md).

:::note
Before you begin the installation, make sure all [prerequisites](prerequisites.md) are met.
:::

## How to set up and use OpenEBS?

OpenEBS seamlessly integrates into the overall workflow tooling that Kubernetes administrators and users have around Kubernetes. 

The OpenEBS workflow fits nicely into the reconciliation pattern introduced by Kubernetes, paving the way for a Declarative Storage Control Plane as shown below: 

![control plane overview](../assets/control-plane-overview.svg)

## Installation via Helm

:::warning
The Helm chart registry at https://openebs.github.io/charts has now been deprecated as those charts are used to install legacy OpenEBS (v3.10 and below) releases. This registry will be migrated to a different registry location https://openebs-archive.github.io/charts by Oct 30, 2024.

The Helm charts for the latest OpenEBS (v4.0 and above) are hosted in a new registry location https://openebs.github.io/openebs. To ensure seamless access to OpenEBS Helm charts, update your configurations to use the new registry URL.
:::

Verify helm is installed and helm repo is updated. You need helm 3.2 or more. 

1. Setup helm repository.

```
helm repo add openebs https://openebs.github.io/openebs
helm repo update
```

:::note
`helm repo add openebs https://openebs.github.io/charts` has changed to `helm repo add openebs https://openebs.github.io/openebs`.
:::

OpenEBS provides several options to customize during installation such as:
- Specifying the directory where hostpath volume data is stored or
- Specifying the nodes on which OpenEBS components should be deployed and so forth. 

:::info
The complete list of Helm chart images is available in the Helm chart annotations. You can view them using the command:
```
helm show chart openebs/openebs | yq '.annotations."helm.sh/images"'
```
Refer to the [OpenEBS helm chart](https://github.com/openebs/openebs/blob/main/charts/README.md#values) for configurable options.
:::

2. Install the OpenEBS helm chart with default values. 

```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```

The above command will install OpenEBS Local PV Hostpath, OpenEBS Local PV LVM, OpenEBS Local PV ZFS, and OpenEBS Replicated Storage components in `openebs` namespace and chart name as `openebs`.

:::important
- The default OpenEBS helm chart will install both Local Storage and Replicated Storage. If you do not want to install OpenEBS Replicated Storage, use the following command:

  ```
  helm install openebs --namespace openebs openebs/openebs --set engines.replicated.mayastor.enabled=false --create-namespace
  ```

- If the CustomResourceDefinitions for CSI VolumeSnapshots are already present in your cluster, you may skip their creation by using the following option:

  ```
  --set openebs-crds.csi.volumeSnapshots.enabled=false
  ```
:::

If you are utilizing a custom Kubelet location or a Kubernetes distribution that uses a custom Kubelet location, it is necessary to modify the Kubelet directory in the Helm values at installation time. This can be accomplished by using the `--set` flag option in the Helm install command, as follows:

- For Local PV LVM

```
--set lvm-localpv.lvmNode.kubeletDir=<your-directory-path>
```

- For Local PV ZFS

```
--set zfs-localpv.zfsNode.kubeletDir=<your-directory-path>
```

- For Replicated PV Mayastor

```
--set mayastor.csi.node.kubeletDir=<your-directory-path>
```

Specifically:

- For **MicroK8s**, the Kubelet directory must be updated to `/var/snap/microk8s/common/var/lib/kubelet/` by replacing the default `/var/lib/kubelet/` with `/var/snap/microk8s/common/var/lib/kubelet/`.
  
- For **k0s**, the default Kubelet directory (`/var/lib/kubelet`) must be changed to `/var/lib/k0s/kubelet/`.

- For **RancherOS**, the default Kubelet directory (`/var/lib/kubelet`) must be changed to `/opt/rke/var/lib/kubelet/`.

3. To view the chart and get the output, use the following command:

**Command**

```
helm ls -n openebs
```

**Sample Output**

```
NAME     NAMESPACE   REVISION  UPDATED                                   STATUS     CHART           APP VERSION
openebs  openebs     1         2025-05-25 09:13:00.903321318 +0000 UTC   deployed   openebs-4.3.2   4.3.2
```

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

#### Installation with Replicated Storage Disabled

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

List the storage classes to check if OpenEBS has been installed with default StorageClasses.  

```
kubectl get sc
```

In the successful installation, you should have the following StorageClasses created:

```
NAME                       PROVISIONER               RECLAIMPOLICY   VOLUMEBINDINGMODE    ALLOWVOLUMEEXPANSION 
mayastor-etcd-localpv      openebs.io/local          Delete          WaitForFirstConsumer false
mayastor-loki-localpv      openebs.io/local          Delete          WaitForFirstConsumer false
openebs-hostpath           openebs.io/local          Delete          WaitForFirstConsumer false
openebs-single-replica     io.openebs.csi-mayastor   Delete          Immediate            true
```

## Post-Installation Considerations

For testing your OpenEBS installation, you can use the `openebs-hostpath` mentioned in the [Local Storage User Guide](../user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-overview.md) for provisioning Local PV on hostpath.

You can follow through the below user guides for each of the engines to use storage devices available on the nodes instead of the `/var/openebs` directory to save the data.  
- [Local Storage User Guide](../user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-overview.md)
- [Replicated Storage User Guide](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-overview.md)

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Deployment](../quickstart-guide/deploy-a-test-application.md)
- [OpenEBS Architecture](../concepts/architecture.md)
- [OpenEBS Use Cases and Examples](../introduction-to-openebs/use-cases-and-examples.mdx)
- [Troubleshooting](../troubleshooting/)
