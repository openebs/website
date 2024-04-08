---
id: upgrade-re
title: OpenEBS Replicated Storage Upgrades
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 2.6.0 version is supported only from v1.0.0 and later.
---

## Upgrading Replicated Storage

Replicated Storage (a.k.a Replicated Engine and f.k.a Mayastor) supports seamless upgrades starting with target version 2.1.0 and later, and source versions 2.0.0 and later. To upgrade from a previous version (1.0.5 or prior) to 2.1.0 or later, visit [Legacy Upgrade Support](../advanced-operations/legacy-upgrade.md). 

### Supported Upgrade Paths

- From 2.0.x to 2.6.0

:::info
- The upgrade operation utilises the [Kubectl Plugin](../advanced-operations/kubectl-plugin.md).
- The upgrade process is generally non-disruptive for volumes with a replication factor greater than one and all replicas being healthy, prior to starting the upgrade.
:::

To upgrade Replicated Storage deployment on the Kubernetes cluster, execute:

**Command**

```
kubectl mayastor upgrade
```

To view all the available options and sub-commands that can be used with the upgrade command, execute:

**Command**

```
kubectl mayastor upgrade -h
```

**Expected Output**

```
`Upgrade` the deployment

Usage: kubectl-mayastor upgrade [OPTIONS]

Options:
  -d, --dry-run
          Display all the validations output but will not execute upgrade
  -r, --rest <REST>
          The rest endpoint to connect to
  -D, --skip-data-plane-restart
          If set then upgrade will skip the io-engine pods restart
  -k, --kube-config-path <KUBE_CONFIG_PATH>
          Path to kubeconfig file
  -S, --skip-single-replica-volume-validation
          If set then it will continue with upgrade without validating singla replica volume
  -R, --skip-replica-rebuild
          If set then upgrade will skip the repilca rebuild in progress validation
  -C, --skip-cordoned-node-validation
          If set then upgrade will skip the cordoned node validation
  -o, --output <OUTPUT>
          The Output, viz yaml, json [default: none]
  -j, --jaeger <JAEGER>
          Trace rest requests to the Jaeger endpoint agent
  -n, --namespace <NAMESPACE>
          Kubernetes namespace of mayastor service, defaults to mayastor [default: mayastor]
  -h, --help
          Print help
```

To view the status of upgrade, execute:

**Command**

```
kubectl mayastor get upgrade-status
```

**Expected Output**

```
Upgrade From: 2.0.0
Upgrade To: 2.6.0
Upgrade Status: Successfully upgraded Mayastor
```

To view the logs of upgrade job, execute:

**Command**

```
kubectl logs <upgrade-job-pod-name> -n <mayastor-namespace>
```

:::info
1. The time taken to upgrade is directly proportional to the number of IO engine nodes and storage volumes.
2. To upgrade to a particular Replicated Storage version, ensure you are using the same version of kubectl plugin.
3. The above process of upgrade creates one Job in the namespace where Replicated Storage is installed, one ClusterRole, one ClusterRoleBinding and one ServiceAccount.
:::