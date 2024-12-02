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
helm install openebs openebs/openebs -n openebs --create-namespace \ 
  --set mayastor.csi.node.kubeletDir="/var/snap/microk8s/common/var/lib/kubelet" \
  --set lvm-localpv.lvmNode.kubeletDir="/var/snap/microk8s/common/var/lib/kubelet" \
  --set zfs-localpv.zfsNode.kubeletDir="/var/snap/microk8s/common/var/lib/kubelet"
```

***Output**

```
NAME: openebs
LAST DEPLOYED: Wed Apr 17 14:35:22 2024
NAMESPACE: openebs
STATUS: deployed
REVISION: 1
NOTES:
Successfully installed OpenEBS.

Check the status by running: kubectl get pods -n openebs

The default values will install both Local PV and Replicated PV. However,
the Replicated PV will require additional configuration to be fuctional.
The Local PV offers non-replicated local storage using 3 different storage
backends i.e HostPath, LVM and ZFS, while the Replicated PV provides one replicated highly-available
storage backend i.e Mayastor.

For more information,
- view the online documentation at https://openebs.io/docs
- connect with an active community on our Kubernetes slack channel.
        - Sign up to Kubernetes slack: https://slack.k8s.io
        - #openebs channel: https://kubernetes.slack.com/messages/openebs
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
