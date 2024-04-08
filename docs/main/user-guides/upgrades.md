---
id: upgrade
title: OpenEBS Upgrades
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 2.11.0 version is supported only from v1.0.0 and later.
---

This upgrade flow would allow users to upgrade to the latest OpenEBS version 4.0.0 which is an unified installer for three local storages Local PV HostPath, Local PV LVM, Local PV ZFS and one replicated storage (f.k.a Mayastor). Users who were initially using any one of these storages, can checkout the workflow for that specific storage.
The newer chart would install all four storages irrespective of the storage the user is using prior to the upgrade. This unified approach is taken in consideration of upcoming OpenEBS storage solution which will be a single provisioner to handle all of these variants.
Hence, we recommend users to go with the default upgrade flow i.e. upgrade to all the storages.  

If you do not want to use the replicated storage, you can disable it using the helm value while upgrading. See the below example:

```
helm upgrade openebs openebs/openebs -n openebs --reuse-values --set lvm-localpv.crds.lvmLocalPv.enabled=false --set mayastor.enabled=false
```

## See Also

- [Release Notes](../releases.md)
- [Join our Community](../community.md)
- [Troubleshooting](../troubleshooting/troubleshooting-local-engine.md)
