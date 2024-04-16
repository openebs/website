---
id: upgrade
title: OpenEBS Upgrades
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 4.0.0 version.
---

:::important
Upgrade from OpenEBS 3.x to OpenEBS 4.0.0 is only supported for the below storages installed from OpenEBS 3.x.

- Local PV Hostpath
- Local PV LVM
- Local PV ZFS
- Replicated PV Mayastor

See the [migration documentation](../user-guides/data-migration/migration-overview.md) for other storages.
:::

## Overview

This upgrade flow allows the users to upgrade to the latest OpenEBS version 4.0.0 which is a unified installer for three Local Storages (a.k.a Local Engines):
- Local PV HostPath
- Local PV LVM 
- Local PV ZFS 

and one Replicated Storage (a.k.a Replicated Engine):
- Replicated PV Mayastor

As a part of upgrade to OpenEBS 4.0.0, the helm chart would install all four engines irrespective of the engine the user was using prior to the upgrade. 

:::info
During the upgrade, advanced users who are only interested in Local PV Storage, can disable the Replicated PV Mayastor by setting the below option:

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

## Local Storage

This section describes the Local Storage upgrade from OpenEBS chart 3.x to OpenEBS 4.0.0. The upgrade process for Local PV Hostpath, Local PV LVM and Local PV ZFS are largely identical, with a few changes in helm values depending on the Local PV Storage variant we are upgrading from.

1. Before upgrading to OpenEBS 4.0.0, write the existing helm values from your OpenEBS helm release to a local YAML file.

```
helm get values openebs -n openebs -a -o yaml > old-values.yaml 
```

2. Execute the 4.0.0 upgrade command. 

```
helm repo update
helm upgrade openebs openebs/openebs -n openebs -f old-values.yaml --version 4.0.0
```

:::note
If the upgrade is from Local PV LVM or Local PV ZFS storage solution, additional helm values must be specified with the above command to prevent upgrade process conflicts. The installed CRDs in 3.x would be in conflict with the CRDs in 4.0.0 as the chart structure has changed. Hence, they must be disabled.


- For Upgrade from Local PV LVM, use

```
--set lvm-localpv.crds.lvmLocalPv.enabled=false
```

- For Upgrade from Local PV ZFS, use

```
--set zfs-localpv.crds.zfsLocalPv.enabled=false
```
:::

3. Verify that the CRDs, Volumes, Snapshots and StoragePools are unaffected by the upgrade process.

## Replicated Storage

This section describes the Replicated Storage upgrade from OpenEBS Umbrella chart 3.x to OpenEBS 4.0.0.

1. Before upgrading to OpenEBS 4.0.0, write the existing helm values from your OpenEBS helm release to a local YAML file.

```
helm get values openebs -n openebs -a -o yaml > old-values.yaml 
```

2. Start the helm upgrade process with the new chart, i.e. 4.0.0 by using the below command:

:::caution
Disable the partial rebuild during the upgrade from specific versions of OpenEBS (3.7.0, 3.8.0, 3.9.0 and 3.10.0) to OpenEBS 4.0.0 to ensure data consistency during upgrade. Input the value `--set mayastor.agents.core.rebuild.partial.enabled=false` in the **helm upgrade** command.
This applies to the **kubectl mayastor upgrade** command as well `kubectl mayastor upgrade --set agents.core.rebuild.partial.enabled=false`.
:::

```
helm upgrade openebs openebs/openebs -n openebs -f old-values.yaml --version 4.0.0 \
  --set localpv-provisioner.release.version=4.0.0 \
  --set localpv-provisioner.localpv.image.tag=4.0.0 \
  --set localpv-provisioner.helperPod.image.tag=4.0.0 \
  --set mayastor.loki-stack.loki.image.tag=2.6.1 \
  --set mayastor.loki-stack.filebeat.imageTag=7.17.3 \
  --set mayastor.loki-stack.logstash.imageTag=1.0.1 \
  --set mayastor.loki-stack.grafana.downloadDashboardsImage.tag=7.85.0 \
  --set mayastor.loki-stack.grafana.image.tag=8.3.5 \
  --set mayastor.loki-stack.grafana.sidecar.image.tag=1.19.2 \
  --set mayastor.loki-stack.prometheus.alertmanager.image.tag=v0.23.0 \
  --set mayastor.loki-stack.prometheus.nodeExporter.image.tag=v1.3.0 \
  --set mayastor.loki-stack.prometheus.pushgateway.image.tag=v1.4.2 \
  --set mayastor.loki-stack.prometheus.server.image.tag=v2.34.0 \
  --set-json 'mayastor.loki-stack.promtail.config.clients[0]={"url": "http://{{ .Release.Name }}-loki:3100/loki/api/v1/push"}' \
  --set mayastor.image.tag="v2.6.0" \
  --set mayastor.csi.image.provisionerTag=v3.5.0 \
  --set mayastor.csi.image.attacherTag=v4.3.0 \
  --set mayastor.csi.image.snapshotterTag=v6.3.3 \
  --set mayastor.csi.image.snapshotControllerTag=v6.3.3 \
  --set mayastor.csi.image.registrarTag=v2.10.0 \
  --set mayastor.crds.enabled=false \
  --set-json 'mayastor.loki-stack.promtail.initContainer=[]' \
  --set mayastor.agents.core.rebuild.partial.enabled=false
```

3. Verify that the CRDs, Volumes, Snapshots and StoragePools are unaffected by the upgrade process.

4. Start the Replicated Storage upgrade process by using the kubectl mayastor plugin v2.6.0.

```
kubectl mayastor upgrade -n openebs --set 'mayastor.agents.core.rebuild.partial.enabled=false'
```

- This deploys an upgrade process of K8s resource type Job.

```
kubectl get jobs -n openebs 

NAME                     COMPLETIONS   DURATION   AGE 
openebs-upgrade-v2-6-0   1/1           4m49s      6m11s
```

- Wait for the upgrade job to complete.

```
kubectl get pods -n openebs

openebs-upgrade-v2-6-0-s58xl                   0/1     Completed   0          7m4s
```

5. Once the upgrade process completes, all the volumes and pools should be online.

6. If you have disabled the partial rebuild during the upgrade, re-enable it by adding the value `--set mayastor.agents.core.rebuild.partial.enabled=true` in the upgrade command.

```
helm upgrade openebs openebs/openebs -n openebs --reuse-values --version 4.0.0 \
  --set mayastor.agents.core.rebuild.partial.enabled=true
```

## See Also

- [Release Notes](../releases.md)
- [Troubleshooting](../troubleshooting/troubleshooting-local-storage.md)
- [Join our Community](../community.md)
