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

## Preparing the Nodes

1. 2MiB-sized Huge Pages must be supported and enabled on the mayastor storage nodes. A minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the Mayastor pod on each node.

:::info
HugePages and node labels can be configured either during initial cluster creation or on running worker nodes.
:::

2. Set the `vm.nr_hugepages` sysctl and add `openebs.io/engine=mayastor` labels to the nodes which are meant to be storage nodes. This can be done with `talosctl edit/patch machineconfig` or via config patches during `talosctl gen config`.

**Example**

1. By using talosctl gen config:

    - Create a config patch file `mayastor-patch.yaml`.

    ```
    - op: add
    path: /machine/sysctls
    value:
        vm.nr_hugepages: "1024"
    - op: add
    path: /machine/nodeLabels
    value:
        openebs.io/engine: mayastor
    ```

    - Run talosctl gen config with the above file.

    ```
    talosctl gen config my-cluster https://mycluster.local:6443 --config-patch @mayastor-patch.yaml
    ```

2. By patching a running node with config file:

    - Run the following command to patch an existing node with config file. 

    ```
    talosctl patch --mode=no-reboot machineconfig -n <node ip> --patch @mayastor-patch.yaml
    ```

3. By editing machineconfig on running node:

    - Run the following command to edit the machineconfig of a node directly.

    ```
    talosctl edit -n <node ip> machineconfig --talosconfig <path to talosconfig file>

    #enable hugepages from sysctl configs on the editor
    sysctl:
    vm.nr_hugepages: "1024"
    ```
    
    - Add the labels by using the kubectl commands. 

    ```
    kubectl label node <node_name> openebs.io/engine=mayastor
    ```

:::important
Restart kubelet or reboot the node if you modify the `vm.nr_hugepages` configuration of a node. Replicated PV Mayastor will not deploy correctly if the available Huge Page count as reported by the node's kubelet instance does not meet the minimum requirements.
```
talosctl -n <node ip> service kubelet restart
```
:::

## Install Replicated PV Mayastor on Talos

To install Replicated PV Mayastor using Helm on Talos, refer to the [installation steps](../../../../quickstart-guide/installation.md#installation-via-helm) in the Quickstart Guide.

