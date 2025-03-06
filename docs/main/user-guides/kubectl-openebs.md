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

The Kubectl OpenEBS Plugin is a plugin that allows you to interact with OpenEBS storages through a unified interface. This unified plugin is especially beneficial if you have installed a cluster using the OpenEBS Helm chart. The supported storages include:

- Local PV HostPath
- Local PV LVM
- Local PV ZFS
- Replicated PV Mayastor

This plugin integrates the current `kubectl-mayastor` functionality for Replicated PV Mayastor specific commands while introducing newly developed functionality for other storages, inspired by the existing `kubectl-openebs` plugin. The previous `kubectl-openebs` supported only Local PV storages whereas now it extends its capabilities to include Replicated PV Mayastor commands. Also, the plugin supports multiple output formats, such as YAML and JSON.

By using this plugin, you get a simplified and consistent interface to manage multiple storages, with improved output formats, flexible namespace configurations, and robust command options tailored to meet diverse storage needs.

## Features

### Unified Plugin for All Storages

The plugin consolidates functionality for all OpenEBS storages under a single interface. You can manage Local PV Hostpath, Local PV LVM, Local PV ZFS, and Replicated PV Mayastor resources without switching between multiple tools or plugins.

### Namespace Assumption

The `kubectl-mayastor` plugin previously assumed the namespace to be `mayastor` if unspecified. Now, if the namespace is not explicitly defined, the plugin reads it from the kubeconfig context's namespace (It is set to `default` by default). The kubeconfig path is configurable using `--kubeconfig` or the `KUBECONFIG` env. Namespace can be set explicitly using the `--namespace` option.

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

This section provides a detailed breakdown of the primary `kubectl-openebs` commands. This plugin serves as the central CLI for managing OpenEBS storage resources.

**Command**

```
kubectl openebs
```

**Sample Output**

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
  -n, --namespace <NAMESPACE>    Namespace where openebs is installed. If unset, defaults to the default namespace in the current context
  -k, --kubeconfig <KUBECONFIG>  Path to kubeconfig file
  -h, --help                     Print help
  -V, --version                  Print version 
```

## Storage-Specific Commands

### Local PV HostPath

The Local PV Hostpath command supports resource retrieval for Hostpath storage volumes.

**Command**

```
kubectl openebs localpv-hostpath
```

**Sample Output**

```
Usage: kubectl-openebs localpv-hostpath [OPTIONS] <COMMAND>

Commands:
  get   Gets localpv-hostpath resources
  help  Print this message or the help of the given subcommand(s)

Options:
  -o, --output <OUTPUT>          The Output, viz yaml, json [default: none]
  -n, --namespace <NAMESPACE>    Namespace where openebs is installed. If unset, defaults to the default namespace in the current context
  -k, --kubeconfig <KUBECONFIG>  Path to kubeconfig file
  -h, --help                     Print help 
```

### Local PV LVM

The Local PV LVM command supports operations like retrieving information about volumes, volume groups, and node-specific resources.

**Command**

```
kubectl openebs localpv-lvm
```

**Sample Output**

```
Usage: kubectl-openebs localpv-lvm [OPTIONS] <COMMAND>

Commands:
  get   Gets localpv-lvm resources
  help  Print this message or the help of the given subcommand(s)

Options:
  -o, --output <OUTPUT>          The Output, viz yaml, json [default: none]
  -n, --namespace <NAMESPACE>    Namespace where openebs is installed. If unset, defaults to the default namespace in the current context
  -k, --kubeconfig <KUBECONFIG>  Path to kubeconfig file
  -h, --help                     Print help
   
```

### Local PV ZFS

The Local PV ZFS command provides options for managing ZFS volumes and pools.

**Command**

```
kubectl openebs localpv-zfs
```

**Sample Output**

```
Usage: kubectl-openebs localpv-zfs [OPTIONS] <COMMAND>

Commands:
  get   Gets localpv-zfs resources
  help  Print this message or the help of the given subcommand(s)

Options:
  -o, --output <OUTPUT>          The Output, viz yaml, json [default: none]
  -n, --namespace <NAMESPACE>    Namespace where openebs is installed. If unset, defaults to the default namespace in the current context
  -k, --kubeconfig <KUBECONFIG>  Path to kubeconfig file
  -h, --help                     Print help
   
```

### Replicated PV Mayastor

The Replicated PV Mayastor command enables you to perform advanced operations on Replicated PV Mayastor resources, such as scaling, resource management, and upgrades.

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
  -n, --namespace <NAMESPACE>    Namespace where openebs is installed. If unset, defaults to the default namespace in the current context
  -k, --kubeconfig <KUBECONFIG>  Path to kubeconfig file
  -r, --rest <REST>              The rest endpoint to connect to
  -o, --output <OUTPUT>          The Output, viz yaml, json [default: none]
  -j, --jaeger <JAEGER>          Trace rest requests to the Jaeger endpoint agent
  -t, --timeout <TIMEOUT>        Timeout for the REST operations [default: 10s]
  -h, --help                     Print help 
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