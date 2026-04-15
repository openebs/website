---
id: upgrade-re
title: OpenEBS Replicated PV Mayastor Upgrades
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 2.6.0 version is supported only from v1.0.0 and later.
---

## Upgrading Replicated PV Mayastor

Replicated PV Mayastor supports seamless upgrades starting with target version 2.1.0 and later, and source versions 2.0.0 and later. To upgrade from a previous version (1.0.5 or prior) to 2.1.0 or later, visit [Legacy Upgrade Support](legacy-upgrade.md).

### Supported Upgrade Paths

- From 2.0.x and newer (2.0.x, 2.1.x, 2.2.x, etc.)
- To 2.1.0 and newer (2.1.x, 2.2.x, 2.3.x, etc.)
- It is possible to upgrade to the same version with different configuration (using `--set` options, etc.) in 2.7.2 and newer versions.

:::info

- Only upgrades are supported.Downgrading to earlier versions is not supported.
- The upgrade operation utilises the [Kubectl mayastor Plugin](../advanced-operations/kubectl-plugin.md). Ensure you have the appropriate Kubectl Plugin installed, Use the kubectl plugin version that matches your target Mayastor version.
- If Replicated PV Mayastor was installed using the `mayastor/mayastor` Helm chart, use the `kubectl mayastor` plugin for upgrades.
- If Replicated PV Mayastor was installed using the `openebs/openebs` Helm chart, refer to the [OpenEBS upgrade documentation](https://openebs.io/docs/4.0.x/user-guides/upgrade).
- Volumes with single replica will be unavailable temporarily during upgrade.
- The upgrade process is generally non-disruptive for volumes with a replication factor greater than one however verify that all replicas are healthy prior to upgrade

:::

To upgrade Replicated PV Mayastor deployment on the Kubernetes cluster, execute:

**Command**

```bash
kubectl mayastor upgrade -n <mayastor-namespace>
```

To view all the available options and sub-commands that can be used with the upgrade command, execute:

**Command**

```bash
kubectl mayastor upgrade -h
```

**Expected Output**

```text
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

```bash
kubectl mayastor get upgrade-status -n <mayastor-namespace>
```

**Expected Output**

```text
Upgrade From: 2.0.0
Upgrade To: 2.6.1
Upgrade Status: Successfully upgraded Mayastor
```

To view the logs of upgrade job, execute:

**Command**

```bash
kubectl logs <upgrade-job-pod-name> -n <mayastor-namespace>
```

:::info

1. The time taken to upgrade is directly proportional to the number of IO engine nodes and storage volumes.
2. To upgrade to a particular Replicated PV Mayastor version, ensure you are using the same version of kubectl plugin.
3. The above process of upgrade creates one Job in the namespace where Replicated PV Mayastor is installed, one ClusterRole, one ClusterRoleBinding and one ServiceAccount.

:::
