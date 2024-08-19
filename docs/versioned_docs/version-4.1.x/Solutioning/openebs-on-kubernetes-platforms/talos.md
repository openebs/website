---
id: talos
title: Replicated PV Mayastor Installation on Talos
keywords:
 - Replicated PV Mayastor Installation on Talos
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - Talos
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on Talos

:::info
All the below configurations can be configured either during initial cluster creation or on running worker nodes.
:::

## Talos Control Plane Changes

### Pod Security

By default, Talos Linux applies a baseline pod security profile across namespaces except for the kube-system namespace. This default setting restricts Replicated PV Mayastors’s ability to manage and access system resources. You need to add the exemptions for Replicated PV Mayastor namespace. See the [Talos Documentation](https://www.talos.dev/v1.6/kubernetes-guides/configuration/pod-security/) for detailed instructions on Pod Security.

**Create a file cp.yaml**

```
- op: add
  path: /cluster/apiServer/admissionControl
  value:
    - name: PodSecurity
      configuration:
        exemptions: null
        namespaces:
          - mayastor
```

## Talos Worker Node Changes

### Huge Pages

2MiB-sized Huge Pages must be supported and enabled on the Replicated PV Mayastor storage nodes. A minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the Replicated PV Mayastor pod on each node.

### Labels

All Replicated PV Mayastor storage nodes must be labelled with the OpenEBS engine type "mayastor". This label will be used as a node selector by the IO engine Daemonset that is deployed as a part of the Replicated PV Mayastor data plane components installation.

### Data Mount Paths

Provide additional data path mounts to be accessible to the Kubernetes Kubelet container. These mounts are necessary to provide access to the host directories and attach volumes required by the Replicated PV Mayastor components.

**Create a file wp.yaml**

```
- op: add
  path: /machine/sysctls
  value:
    vm.nr_hugepages: "1024"

- op: add
  path: /machine/nodeLabels
  value:
    openebs.io/engine: "mayastor"

- op: add
  path: /machine/kubelet/extraMounts
  value:
    - destination: /var/local
      type: bind
      source: /var/local
      options:
        - bind
        - rshared
        - rw
```

**Examples**

1. By using talosctl gen config:

    - Run talosctl gen config with the above file.

    ```
    talosctl gen config talos-k8s-gcp-tutorial https://mytaloscluster:443 --config-patch-control-plane @cp.yaml --config-patch-worker @wp.yaml
    ```

2. By patching a running node with config file:

    - Run the following command to patch an existing node with config file. 

    ```
    talosctl patch --mode=no-reboot machineconfig -n <control plane node ip> --patch @cp.yaml
    talosctl patch --mode=no-reboot machineconfig -n <worker node ip> --patch @wp.yaml
    ```

3. By editing machineconfig on running node:

    - Run the following command to edit the machineconfig of a node directly.

    ```
    talosctl edit -n <node ip> machineconfig --talosconfig <path to talosconfig file>
    ```

:::important
Restart kubelet or reboot the node if you modify the `vm.nr_hugepages` configuration of a node. Replicated PV Mayastor will not deploy correctly if the available Huge Page count as reported by the node's kubelet instance does not meet the minimum requirements.

```
talosctl -n <node ip> service kubelet restart
```
:::

## Install Replicated PV Mayastor on Talos

Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md#installation-via-helm) to install Replicated PV Mayastor using Helm on Talos.

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](microkubernetes.md)
- [Replicated PV Mayastor Installation on Google Kubernetes Engine](gke.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)