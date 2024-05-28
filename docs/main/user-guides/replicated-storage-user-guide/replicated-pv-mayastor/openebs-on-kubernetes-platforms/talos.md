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

## Prerequisites

Prepare a cluster by following the steps outlined in this [guide](../replicated-pv-mayastor/rs-installation.md#preparing-the-cluster).

## Install Replicated PV Mayastor on Talos

:::info
HugePages and node labels can be configured either during initial cluster creation or on running worker nodes.
:::

1. Set the `vm.nr_hugepages` sysctl and add `openebs.io/engine=mayastor` labels to the nodes which are meant to be storage nodes. This can be done with `talosctl edit/patch machineconfig` or via config patches during `talosctl gen config`.

2. Create a config patch file 'mayastor-patch.yaml' using the following commands.

**Command**

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

**Command**

```
talosctl gen config my-cluster https://mycluster.local:6443 --config-patch @mayastor-patch.yaml
```

**Command**

```
talosctl patch --mode=no-reboot machineconfig -n <node ip> --patch @mayastor-patch.yaml
```

**Command**

```
talosctl edit -n <node ip> machineconfig --talosconfig <path to talosconfig file>
```

3. Restart kubelet if you are adding or updating the `vm.nr_hugepages` on an existing node, so that it picks up the new value.

**Command**

```
talosctl -n <node ip> service kubelet restart
```

4. To install Replicated PV Mayastor using Helm on Talos, refer to the [installation steps](../../../../quickstart-guide/installation.md#installation-via-helm) in the Quickstart Guide.

