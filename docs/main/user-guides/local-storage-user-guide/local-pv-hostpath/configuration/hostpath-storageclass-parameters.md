---
id: hostpath-storageclass-parameters
title: StorageClass Parameters
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Configuration
 - Configuration
 - StorageClass Parameters
 - Local PV Hostpath StorageClass Parameters
description: This document describes the supported StorageClass parameters for Local PV Hostpath.
---

# StorageClass Parameters

This document describes the StorageClass fields and parameters supported by Local PV Hostpath and explains how to configure them. These settings control where the volume directory is created on the node, the permissions it is created with, how volumes are placed across nodes, and whether a quota is enforced on the directory.

Unlike the other Local Storage engines, Local PV Hostpath is provisioned by an out-of-tree provisioner and does not use the `parameters` field of the StorageClass. Its settings are supplied through the `cas.openebs.io/config` annotation, alongside the `openebs.io/cas-type: local` annotation:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/local-hostpath"
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

Each entry under `cas.openebs.io/config` has a `name`, and supplies its setting through `value`, `data`, or `list`, depending on the parameter.

## Standard StorageClass Fields

| Field | Values |
|-------|--------|
| `provisioner` | Must be `openebs.io/local` |
| `volumeBindingMode` | Must be `WaitForFirstConsumer` |
| `reclaimPolicy` | `Delete`, `Retain` |
| `allowedTopologies` | Node label key and the values to match |

## Supported cas-config Parameters

| Parameter | Form | Values |
|-----------|------|--------|
| `StorageType` | `value` | `hostpath` |
| `BasePath` | `value` | Absolute path on the node, for example `/var/local-hostpath` |
| `NodeAffinityLabels` | `list` | Node label keys used to identify a node instead of its hostname |
| `FilePermissions` | `data` | `mode`, the permissions used to create the volume directory |
| `XFSQuota` | `data` | `softLimitGrace` and `hardLimitGrace` |
| `EXT4Quota` | `data` | `softLimitGrace` and `hardLimitGrace` |

## StorageType

`StorageType` selects the kind of storage that backs the volume. For Local PV Hostpath, set it to `hostpath`, which provisions the volume as a subdirectory under `BasePath` on the node where the application pod is scheduled.

## BasePath

`BasePath` is the directory on the node under which volume directories are created. Each volume gets its own subdirectory, named after the persistent volume.

If `BasePath` is not specified, the provisioner uses the base path it was installed with, which is `/var/openebs/local` by default. The default `openebs-hostpath` StorageClass also uses `/var/openebs/local`.

:::note
The value must be a valid absolute path. If the directory does not exist on the node, the provisioner creates it when the first volume of this StorageClass is scheduled onto that node.
:::

## NodeAffinityLabels

`NodeAffinityLabels` lists the node label keys that are used to identify the node in the node affinity of the provisioned volume, instead of the default `kubernetes.io/hostname` label. This is useful when the hostname of a node can change, for example when a node is removed and added back with its disks intact.

```yaml
      - name: NodeAffinityLabels
        list:
          - "openebs.io/custom-node-unique-id"
```

:::note
`NodeAffinityLabels` does not influence the scheduling of the application pod. Use [allowedTopologies](#allowedtopologies) to constrain scheduling.
:::

Refer to [Custom Node Labeling](hostpath-create-storageclass.md#optional-custom-node-labeling) for a complete example.

## FilePermissions

`FilePermissions` sets the permissions that the volume directory is created with. The permissions are given through the `mode` key:

```yaml
      - name: FilePermissions
        data:
          mode: "0770"
```

If `FilePermissions` is not specified, the volume directory is created with `0777`.

The permissions are applied when the directory is created, so changing this setting does not affect volumes that already exist.

Refer to [File Permissions](hostpath-create-storageclass.md#optional-file-permissions) for more details, including how to set the permissions for an individual volume.

## XFSQuota

`XFSQuota` enforces a quota on the volume directory, so that an application cannot write more data than the capacity requested in the PersistentVolumeClaim. It requires the filesystem holding `BasePath` to be XFS and to be mounted with project quota enabled.

```yaml
      - name: XFSQuota
        enabled: "true"
        data:
          softLimitGrace: "80%"
          hardLimitGrace: "85%"
```

`softLimitGrace` and `hardLimitGrace` are expressed as a percentage of the requested capacity of the volume.

Refer to [XFS Quota](../advanced-operations/xfs-quota/xfs-quota-pre.md) for the prerequisites and the full configuration workflow.

## EXT4Quota

`EXT4Quota` enforces a quota on the volume directory in the same way as `XFSQuota`, for a `BasePath` that is held on an ext4 filesystem mounted with project quota enabled. It takes the same `softLimitGrace` and `hardLimitGrace` keys.

```yaml
      - name: EXT4Quota
        enabled: "true"
        data:
          softLimitGrace: "80%"
          hardLimitGrace: "85%"
```

An ext4 filesystem additionally requires the `project` and `quota` features to be enabled on it before project quotas can be used. Refer to [EXT4 Quota](../advanced-operations/ext4-quota/ext4-quota-pre.md) for the prerequisites and the full configuration workflow.

## VolumeBindingMode

Local PV Hostpath requires `volumeBindingMode` to be set to `WaitForFirstConsumer`. The volume directory is created on the node where the application pod is scheduled, so the provisioner needs Kubernetes to select that node first.

With `Immediate`, no node is selected at provisioning time and the PersistentVolumeClaim remains pending.

## ReclaimPolicy

Local PV Hostpath supports both the reclaim policies that are `Delete` and `Retain`. If it is not specified, it defaults to `Delete`.

- `Delete` indicates that the volume directory on the node is removed when the PersistentVolumeClaim is deleted.
- `Retain` indicates that the volume directory and its data are kept on the node after the PersistentVolumeClaim is deleted.

## AllowedTopologies

By default, a Local PV Hostpath volume can be provisioned on any node in the cluster. If `BasePath` is present on certain nodes only, use `allowedTopologies` to restrict provisioning to those nodes.

Unlike `NodeAffinityLabels`, `allowedTopologies` also influences the scheduling of the application pod.

Refer to [Restrict Volume Placement Using Allowed Topologies](hostpath-create-storageclass.md#restrict-volume-placement-using-allowed-topologies) for examples, including how to set it on the default `openebs-hostpath` StorageClass through the Helm chart.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](hostpath-create-storageclass.md)
- [Create PersistentVolumeClaim](hostpath-create-pvc.md)
- [Deploy an Application](hostpath-deployment.md)
