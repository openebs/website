---
id: upgrade
title: OpenEBS Upgrades
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS version.
---

:::important
The upgrade from OpenEBS 3.x to OpenEBS 4.x is supported only for the following storages installed from OpenEBS 3.x.

- Local PV Hostpath
- Local PV LVM
- Local PV ZFS
- Replicated PV Mayastor

Refer to the [Migration documentation](../user-guides/data-migration/migration-overview.md) for other storages.
:::

## Overview

This upgrade process allows you to upgrade to the latest OpenEBS version 4.2 which is a unified installer for three Local Storages (a.k.a Local Engines):
- Local PV HostPath
- Local PV LVM 
- Local PV ZFS 

and one Replicated Storage (a.k.a Replicated Engine):
- Replicated PV Mayastor

As a part of the upgrade to OpenEBS 4.2, the helm chart will install all four engines irrespective of the engine you used before the upgrade. 

:::info
During the upgrade, if you are only interested in Local PV Storage, you can disable Replicated PV Mayastor by setting the below option:

```
--set engines.replicated.mayastor.enabled=false
```
:::

## Update Helm Repository

The OpenEBS helm chart repository is available from a different URL than before. The repository target URL needs to be updated.

```
helm repo remove openebs
helm repo add openebs https://openebs.github.io/openebs
helm repo update
```

## Extract Helm Values

Execute the following command to capture the helm values configuration of your helm release.

```
helm get values openebs -n openebs -o yaml > old-values.yaml 
```

:::note
If you are using a custom helm chart to use OpenEBS, compare your set of helm values against the new helm values and the values of the dependency helm charts. Refer [values.yaml](https://github.com/openebs/openebs/blob/HEAD/charts/values.yaml) for more details.

If you have used helm v3.13 or above to install their chart, and not used helm's `--set` and/or `-f` options to configure their chart values, using the `-a` option with your `helm get values` command will let you capture your configuration values.
 
Feel free to reach out via our [communication channels](../community.md).
:::

## Local Storage Upgrade

The upgrade process for Local PV Hostpath, Local PV LVM, and Local PV ZFS are largely identical, with a few changes in helm values depending on the Local PV Storage variant we are upgrading from.

:::note
Downgrades are not supported.
:::

### From 3.x to 4.2

This section describes the Local Storage upgrade from OpenEBS chart 3.x to OpenEBS 4.2.

1. Execute the 4.2 upgrade command. 

```
helm upgrade openebs openebs/openebs -n openebs -f old-values.yaml --version 4.2
```

:::note
If upgrading from Local PV LVM or Local PV ZFS storage solution, additional helm values must be specified with the above command to prevent upgrade process conflicts. The installed CRDs in 3.x would conflict with the CRDs in 4.2 as the chart structure has changed. Hence, they must be disabled.

- For Upgrade from Local PV LVM, use

```
--set lvm-localpv.crds.lvmLocalPv.enabled=false
```

- For Upgrade from Local PV ZFS, use

```
--set zfs-localpv.crds.zfsLocalPv.enabled=false
```

Add both of these options, if your chart has both of these enabled.
:::

2. Verify that the CRDs, Volumes, Snapshots, and StoragePools are not affected by the upgrade process.

### From 4.x to 4.2

This section describes the Local Storage upgrade from OpenEBS chart 4.x to OpenEBS 4.2.

1. Execute the 4.2 upgrade command. 

```
helm upgrade openebs openebs/openebs -n openebs -f old-values.yaml --version 4.2
```

2. Verify that the CRDs, Volumes, Snapshots, and StoragePools are not affected by the upgrade process.

## Replicated Storage Upgrade

:::note
Downgrades are not supported.
:::

### From 3.x to 4.2

This section describes the Replicated Storage upgrade from OpenEBS Umbrella chart 3.x to OpenEBS 4.2.

1. Start the helm upgrade process with the new chart, i.e. 4.2 by using the below command:

:::caution
Upgrades from 3.x to 4.x require the option `--set mayastor.agents.core.rebuild.partial.enabled=false` in the **helm upgrade** command to ensure data consistency during the upgrade. Upgrades from 4.x onwards to newer versions do not require it.

This applies to the **kubectl mayastor upgrade** command as well, if you're using the `mayastor/mayastor` chart and not the `openebs/openebs` chart: `kubectl mayastor upgrade --set agents.core.rebuild.partial.enabled=false`
:::

```
# Add the option --set mayastor.agents.core.rebuild.partial.enabled=false if
# the source version is a 3.x release.
helm upgrade openebs openebs/openebs -n openebs -f old-values.yaml --version 4.2 \
  --set openebs-crds.csi.volumeSnapshots.enabled=false
```

:::important
The `--reuse-values` option should not be used with `helm upgrade`, as it may cause the pre-upgrade images to be used instead of the new images. Instead the `--reset-then-reuse-values` option is recommended.
:::

2. Verify that the CRDs, Volumes, Snapshots, and StoragePools are not affected by the upgrade process.

3. Start the Replicated Storage upgrade process by using the kubectl mayastor plugin v2.7.1.

```
kubectl mayastor upgrade -n openebs --set 'mayastor.agents.core.rebuild.partial.enabled=false'
```

- This deploys an upgrade process of K8s resource type Job.

```
kubectl get jobs -n openebs 

NAME                     COMPLETIONS   DURATION   AGE 
openebs-upgrade-v2-7-1   1/1           4m49s      6m11s
```

- Wait for the upgrade job to complete.

```
kubectl get pods -n openebs

openebs-upgrade-v2-7-1-s58xl                   0/1     Completed   0          7m4s
```

4. Once the upgrade process is completed, all the volumes and pools should be online.

5. If you have disabled the partial rebuild during the upgrade, re-enable it by adding the value `--set mayastor.agents.core.rebuild.partial.enabled=true` in the upgrade command.

```
helm upgrade openebs openebs/openebs -n openebs --reuse-values --version 4.2 \
  --set mayastor.agents.core.rebuild.partial.enabled=true
```

### From 4.x to 4.2

This section describes the Replicated Storage upgrade from OpenEBS Umbrella chart 4.x to OpenEBS 4.2.

1. Start the helm upgrade process with the new chart, i.e. 4.2 by using the below command:

```
helm upgrade openebs openebs/openebs -n openebs -f old-values.yaml --version 4.2
```

2. Verify that the CRDs, Volumes, Snapshots and StoragePools are unaffected by the upgrade process.

3. Start the Replicated Storage upgrade process by using the kubectl mayastor plugin v2.7.1.

```
kubectl mayastor upgrade -n openebs
```

- This deploys an upgrade process of K8s resource type Job.

```
kubectl get jobs -n openebs 

NAME                     COMPLETIONS   DURATION   AGE 
openebs-upgrade-v2-7-1   1/1           4m49s      6m11s
```

- Wait for the upgrade job to complete.

```
kubectl get pods -n openebs

openebs-upgrade-v2-7-1-s58xl                   0/1     Completed   0          7m4s
```

4. Once the upgrade process is completed, all the volumes and pools should be online.

## See Also

- [Release Notes](../releases.md)
- [Troubleshooting](../troubleshooting/troubleshooting-local-storage.md)
- [Join our Community](../community.md)