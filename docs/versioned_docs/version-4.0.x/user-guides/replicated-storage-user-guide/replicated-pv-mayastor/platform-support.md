---
id: platform-support
title: Platform Support
keywords:
 - Replicated PV Mayastor - Platform Support
 - Platform Support
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on MicroK8s

## Install Replicated PV Mayastor on MicroK8s

:::info
**Prerequisite**: Prepare a cluster by following the steps outlined in this [guide](../replicated-pv-mayastor/rs-installation.md#preparing-the-cluster).
:::

To install Replicated PV Mayastor using Helm on MicroK8s, execute the following command:

**Command**

```
helm install mayastor mayastor/mayastor -n mayastor --create-namespace  --set csi.node.kubeletDir="/var/snap/microk8s/common/var/lib/kubelet"
```

***Output**

```
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

## Resolve Known Issue (Calico Vxlan)

During the installation of Replicated PV Mayastor in MicroK8s, Pods with hostnetwork might encounter a known issue where they get stuck in the init state due to the Calico Vxlan bug.

**Expected Error:**

![](https://hackmd.io/_uploads/Syigxz7u3.png)

**Resolution:**

To resolve this error, execute the following command:

**Command**

```
microk8s kubectl patch felixconfigurations default --patch '{"spec":{"featureDetectOverride":"ChecksumOffloadBroken=true"}}' --type=merge
```

> For more details about this issue, refer to the [GitHub issue](https://github.com/canonical/microk8s/issues/3695).

:::info
For further **Configuration of Replicated PV Mayastor** including storage pools, storage class, persistent volume claims, and application setup, refer to the [offical documentation](../replicated-pv-mayastor/rs-configuration.md).
:::
