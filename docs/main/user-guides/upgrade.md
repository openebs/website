---
id: upgrade
title: Upgrading OpenEBS
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 2.11.0 version is supported only from v1.0.0 and later.
---

Latest stable version of OpenEBS is 3.6.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/v3.6.0).

Upgrade to the latest cStor or Jiva version is supported only from 1.12.0 or later. The steps for upgrading can be found [here](https://github.com/openebs/upgrade/blob/develop/docs/upgrade.md).

:::note
- The community e2e pipelines verify upgrade testing only from non-deprecated releases (1.12 and higher) to 3.4.0. If you are running on release older than 1.12, OpenEBS recommends you upgrade to the latest version as soon as possible. 
- OpenEBS has deprecated arch specific container images in favor of multi-arch container images. After 2.6, the arch specific images are not pushed to Docker or Quay repositories. For example, images like `cstor-pool-arm64:2.8.0` should be replaced with corresponding multi-arch image `cstor-pool:2.8.0`. For further queries or support, please reach out to [OpenEBS Community](https://kubernetes.slack.com/archives/CUAKPFU78) for helping you with the upgrade.
- If you are upgrading Jiva volumes that are running in version 1.6 and 1.7, you must use these [pre-upgrade steps](https://github.com/openebs/charts/tree/gh-pages/scripts/jiva-tools) to check if your jiva volumes are impacted by [#2956](https://github.com/openebs/openebs/issues/2956). If they are, please reach out to [OpenEBS Community](https://kubernetes.slack.com/archives/CUAKPFU78) for helping you with the upgrade.
:::

## Mayastor upgrade

:::note
The below mentioned steps can only be used when Mayastor has been deployed using openebs/openebs helm chart.
::: 
1. Before starting the upgrade, ensure the following:
- All of the mayastor pods must be in `Running` state.
  ```
  kubectl get pods -n <mayastor-namespace>
  ```
- There should not be any in-progress volume rebuilds. To verify, execute:
  ```
  kubectl mayastor get volume-replica-topologies
  ```
  The `CHILD-STATUS` column of the output from the above command should not have the value as `Degraded`.

2. Once the above requirements are met, execute the `helm upgrade` command to upgrade the openebs/openebs helm chart to version 3.6.0.

:::note
The installation parameters present in [values.yaml](https://github.com/openebs/charts/blob/main/charts/openebs/values.yaml) can be configured based on the requirements. 
:::

3. Next, to upgrade the data plane component, select a node that has an `io-engine` pod deployed on it. To get the list of such nodes, execute
```
kubectl get node -l openebs.io/engine=mayastor
```

From the list of nodes obtained using the above command, select a node and perform the Mayastor node-drain operation on it.
```
kubectl mayastor drain node <node-name> <label>
```
:::note
Add a custom drain-label to the above drain process in order to ensure no conflicts with any other node-drain/node-cordon labels. 
:::

Delete the `io-engine` pod on the above selected node, and wait for the pod to get redeployed. 
```
kubectl get pod -n <mayastor-namespace> -l app=io-engine,openebs.io/version!=2.1.0 --field-selector spec.nodeName=<node-name>
kubectl delete pod <pod-name> -n <mayastor-namespace> 
```
Next, verify if the `io-engine` pod is in `Running` state. 
Once, the `io-engine` pod is `Running`, verify the status of the volume rebuilds. 

To make the node schedulable again, execute:
```
kubectl mayastor uncordon node <node-name> <label>
```
Ensure that there are no in-progress rebuilds.


4. Now, repeat step 3 for all of the remaining nodes with `io-engine` pods.


## Supported upgrade paths

To upgrade to the latest version from your current version, you have to follow the below upgrade path.
- From 1.12.0 and higher to 3.6.0 - Get the steps from [here](https://github.com/openebs/upgrade/blob/develop/docs/upgrade.md).
- From 1.0.0 and higher to 1.12.0 - Get the steps from [here](https://github.com/openebs/openebs/blob/master/k8s/upgrades/README.md).
- From 0.9.0 to 1.0.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.9.0-1.0.0).
- From 0.8.2 to 0.9.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.2-0.9.0).
- From 0.8.1 to 0.8.2 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.1-0.8.2).
- From 0.8.0 to 0.8.1 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.0-0.8.1).
- From versions prior to 0.8.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades).


## See Also:

[See Release Notes](/introduction/releases) [Join our Community](/introduction/community) [Checkout Troubleshooting guides](/troubleshooting)
