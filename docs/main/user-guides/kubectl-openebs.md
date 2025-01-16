---
id: kubectl-openebs
title: Kubectl OpenEBS Plugin
keywords:
 - Kubectl
 - Plugin
 - Kubectl Plugin
 - Kubectl OpenEBS Plugin
description: A comprehensive guide to the kubectl-openebs plugin, enabling unified management of OpenEBS storages with enhanced features and improved usability.
---
# Kubectl OpenEBS Plugin

## Overview

The Kubectl OpenEBS Plugin is an OSS plugin that allows you to interact with all OpenEBS storages through a unified interface. This is especially beneficial if you have installed a cluster using the OpenEBS umbrella chart. The supported storages include:

- Local PV HostPath
- Local PV LVM
- Local PV ZFS
- Replicated PV Mayastor

This plugin integrates the current `kubectl-mayastor` codebase for Replicated PV Mayastor specific commands while introducing newly developed functionality for other storages, inspired by the existing `kubectl-openebs` plugin.

The previous `kubectl-openebs` supported only Local PV storages whereas now it extends its capabilities to include Replicated PV Mayastor commands. Also, the plugin supports multiple output formats, such as YAML and JSON.

## Namespace Assumption

The `kubectl-mayastor` plugin previously assumed the namespace to be `mayastor` if unspecified. Now, if the namespace is not explicitly defined, the plugin reads it from the kubeconfig context's namespace (It is set to `default` by default).

To set the namespace in the current context, use:

```
kubectl config set-context --namespace=<namespace> --current
```

:::note
Changing the context namespace will also affect how other Kubernetes `kubectl` plugins fetch resources if not explicitly set.
:::

For example, if OpenEBS is installed on namespace "storage" then we can set the `ns` on current context using:

```
kubectl config set-context --namespace=storage --current
```

## Command Overview

**Command**

```
kubectl openebs
```

**Expected Output**

```
Storage engines supported  

Usage: kubectl-openebs [OPTIONS] <COMMAND>  

Commands:  
  mayastor          Mayastor operations  
  localpv-lvm       LocalPV LVM operations  
  localpv-zfs       LocalPV ZFS operations  
  localpv-hostpath  LocalPV Hostpath operations  
  help              Print this message or the help of the given subcommand(s)  

Options:  
  -n, --namespace <NAMESPACE>  Namespace where OpenEBS is installed. Defaults to the namespace in the current context.  
  -h, --help                   Print help.  
  -V, --version                Print version.  
```

## Storage-Specific Commands

### Local PV HostPath

Local PV Hostpath supports volume management commands.

**Command**

```
kubectl openebs localpv-hostpath
```

```
kubectl-openebs localpv-hostpath get volumes
```

**Sample Output**

```
NAME                                      NODE                  STATUS  CAPACITY  PVC-NAME       SC-NAME  
pvc-4b07a2a9-b7e9-4173-a094-14ab2ca7eb62  node-3                Ready   4.00 GiB  pvc-hostvol     openebs-hostpath  
```

### Local PV LVM

Local PV LVM supports resource retrieval commands.

**Command**

```
kubectl openebs localpv-lvm
```

```
kubectl-openebs localpv-lvm get volumes
```

**Sample Output**

```
NAME                                      NODE                  STATUS  CAPACITY  VOLGROUP  PVC-NAME       SC-NAME  
pvc-c7688f88-a379-4e22-985c-02d1908e5c9a  node-1                Ready   4.00 GiB  lvmvg     pvc-lvmpv-199  openebs-lvmpv   
```

### Local PV ZFS

Local PV ZFS supports commands for managing volumes and pools.

**Command**

```
kubectl openebs localpv-zfs
```

```
kubectl-openebs localpv-zfs get volumes
```

**Sample Output**

```
NAME                                      NODE                  STATUS  CAPACITY  POOL     PVC-NAME       SC-NAME  
pvc-4b07a2a9-b7e9-4173-a094-14ab2ca7eb62  node-2                Ready   4.00 GiB  zfspool  pvc-zfsvol     openebs-zfspv     
```

### Replicated PV Mayastor

Replicated PV Mayastor commands support operations like resource management, scaling, and upgrading.

**Command**

```
kubectl openebs mayastor
```

**Expected Output**

```
Usage: kubectl-openebs mayastor [OPTIONS] <COMMAND>  

Commands:  
  drain     'Drain' resources  
  label     'Label' resources  
  get       'Get' resources  
  scale     'Scale' resources  
  set       'Set' resources  
  cordon    'Cordon' resources  
  uncordon  'Uncordon' resources  
  dump      Dump resources  
  upgrade   Upgrade the deployment  
  delete    Delete the upgrade resources  
  help      Print this message or the help of the given subcommand(s)  

Options:  
  -n, --namespace <NAMESPACE>   Namespace where OpenEBS is installed.  
  -r, --rest <REST>             REST endpoint to connect to.  
  -k, --kube-config-path <PATH> Path to kubeconfig file.  
  -o, --output <OUTPUT>         Output format (e.g., yaml, json).  
  -j, --jaeger <JAEGER>         Trace REST requests to Jaeger.  
  -t, --timeout <TIMEOUT>       Timeout for REST operations.  
  -h, --help                    Print help.    
```

**Command**

```
kubectl-openebs mayastor get pools
```

**Sample Output**

```
ID       DISKS                                                     MANAGED  NODE                  STATUS  CAPACITY  ALLOCATED  AVAILABLE  COMMITTED  
pool-22  aio:///dev/sdb?uuid=a321df8d-78ff-4d9d-a6a6-11a456131987  true     node-1                Online  30GiB     0 B        30GiB      0 B  
pool-23  aio:///dev/sdb?uuid=f9dfa95a-1db4-42fb-b3f5-dbb4731d4a27  true     node-2                Online  30GiB     5GiB       25GiB      5GiB  
```

## See Also

- [Observability](../user-guides/observability.md)
- [Kubectl Plugin](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/kubectl-plugin.md)