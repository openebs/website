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
- The upgrade from OpenEBS 3.x to OpenEBS 4.x is supported only for the following storages installed from OpenEBS 3.x.

    - Local PV Hostpath
    - Local PV LVM
    - Local PV ZFS
    - Replicated PV Mayastor

Refer to the [Migration documentation](../user-guides/data-migration/migration-overview.md) for other storages.

- When deploying with the OpenEBS Helm chart, use the `kubectl openebs upgrade` command to upgrade all storages.

:::

## Overview

This upgrade process allows you to upgrade to the latest OpenEBS version 4.3 which is a unified installer for three Local Storages (a.k.a Local Engines):
- Local PV HostPath
- Local PV LVM 
- Local PV ZFS 

and one Replicated Storage (a.k.a Replicated Engine):
- Replicated PV Mayastor

As a part of the upgrade to OpenEBS 4.3, the Helm chart will install all four engines regardless of the engine you used before the upgrade. 

:::info
During the upgrade, if you are only interested in Local PV Storage, you can disable Replicated PV Mayastor by using the below option:

```
--set engines.replicated.mayastor.enabled=false
```
:::

:::note
Downgrades are not supported.
:::

## Upgrade from 3.x to 4.3

Follow these steps to upgrade OpenEBS from version 3.x to 4.3:

1. Update the helm repository: The OpenEBS Helm chart repository URL has changed. The repository target URL needs to be updated.

```
helm repo remove openebs
helm repo add openebs https://openebs.github.io/openebs
helm repo update
```

2. Download the `kubectl openebs` binary from the [OpenEBS Release repository](https://github.com/openebs/openebs/releases) on GitHub.

3. Execute `kubectl openebs upgrade -n <namespace>` to upgrade OpenEBS.

4. Monitor the upgrade status using `kubectl openebs upgrade status -n <namespace>`.

5. Verify that the CRDs, Volumes, Snapshots, and StoragePools are not affected by the upgrade process.

:::caution
- For upgrades from 3.x to 4.x, include the following option in the kubectl openebs upgrade command to ensure data consistency during the upgrade:

  ```
  --set mayastor.agents.core.rebuild.partial.enabled=false
  ```

  This option is not required for upgrades from 4.x to newer versions.

- If you have disabled the partial rebuild during the upgrade, re-enable it by using the below command after a successful upgrade.
  
  ```
  kubectl openebs upgrade -n <namespace> --set mayastor.agents.core.rebuild.partial.enabled=true
  ```

:::

## Upgrade from 4.x to 4.3

Follow these steps to upgrade OpenEBS from version 4.x to 4.3:

1. Download the `kubectl openebs` binary from the [OpenEBS Release repository](https://github.com/openebs/openebs/releases) on GitHub.

2. Execute `kubectl openebs upgrade -n <namespace>` to upgrade OpenEBS.

3. Monitor the upgrade status using `kubectl openebs upgrade status -n <namespace>`.

4. Verify that the CRDs, Volumes, Snapshots, and StoragePools are not affected by the upgrade process.

## See Also

- [Release Notes](../releases.md)
- [Troubleshooting](../troubleshooting/troubleshooting-local-storage.md)
- [Join our Community](../community.md)