---
id: modify-xfs-quota
title: Modify XFS Quota on LocalPV Hostpath
keywords:
 - OpenEBS LocalPV Hostpath Modify XFS Quota
 - XFS Quota
 - Modify XFS Quota
 - Advanced Operations
description: This section talks about modifying XFS quotas for OpenEBS LocalPV Hostpath. 
---

# Modify XFS Quota on LocalPV Hostpath

This document provides the necessary steps to modify or remove the XFS project quota enforcement for existing OpenEBS LocalPV Hostpath volumes. XFS quotas help in managing storage utilization by enforcing soft and hard limits for allocated volumes.

## Identify the BasePath Directory

Make a note of the BasePath directory used for the hostpath volume. The default BasePath is `/var/openebs/local`. You can retrieve the BasePath from the StorageClass by executing the following command:

```
$ kubectl describe sc <storageclass-name>
```

## Locate the Node

1. Log in to the node where the volume exists. You can determine the node by describing the Persistent Volume (PV) resource. To retrieve information about the PV, use the following command:

```
$ kubectl get pvc --namespace demo
```

**Example Output**

```
NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
demo-vol-demo-0   Bound    pvc-0365904e-0add-45ec-9b4e-f4080929d6cd   2Gi        RWO            openebs-hostpath   21s
```

2. Describe the PV.

```
$ kubectl describe pv pvc-0365904e-0add-45ec-9b4e-f4080929d6cd
```

**Example Output**

```
Name:              pvc-0365904e-0add-45ec-9b4e-f4080929d6cd
Labels:            openebs.io/cas-type=local-hostpath
Annotations:       pv.kubernetes.io/provisioned-by: openebs.io/local
Finalizers:        [kubernetes.io/pv-protection]
StorageClass:      openebs-hostpath
Status:            Bound
Claim:             demo/demo-vol-demo-0
Reclaim Policy:    Delete
Access Modes:      RWO
VolumeMode:        Filesystem
Capacity:          2Gi
Node Affinity:     
  Required Terms:  
    Term 0:        kubernetes.io/hostname in [storage-node-2]
Message:           
Source:
    Type:  LocalVolume (a persistent volume backed by local storage on a node)
    Path:  /var/openebs/local/pvc-0365904e-0add-45ec-9b4e-f4080929d6cd
Events:    <none>
```

3. Identify the node name.

```
$ kubectl get node -l 'kubernetes.io/hostname in (storage-node-2)'
```

**Example Output**

```
NAME             STATUS   ROLES    AGE   VERSION
storage-node-2   Ready    worker   10m   v1.22.1
```

## Modify the XFS Quota Limits

You can change the soft and/or hard limit of an existing hostpath volume with XFS project quota enabled by following the steps below. If you wish to remove the XFS project quota entirely, refer to the [Remove Project](#remove-project) section.

### Change Quota Limits

Execute the following commands on the node where the hostpath volume exists:

- Make a note of the Project ID.

```
$ sudo xfs_quota -x -c 'report -h' /var/openebs/local
```

**Example Output**

```
Project quota on /var/openebs/local (/dev/nvme1n1)
                        Blocks
Project ID   Used   Soft   Hard Warn/Grace
---------- ---------------------------------
#0           0      0      0   00 [------]
#1           1G     2.0G   2.0G 00 [------]
```

- Modify the quota limits using the following command. The values for `bsoft` (soft limit) and `bhard` (hard limit) must be in B/KB/MB/GB (not KiB/MiB/GiB).

```
$ sudo xfs_quota -x -c 'limit -p bsoft=3G bhard=5G 1' /var/openebs/local
```

- Verify the updated limits.

```
$ sudo xfs_quota -x -c 'report -h' /var/openebs/local
```

**Example Output**

```
Project quota on /var/openebs/local (/dev/nvme1n1)
                        Blocks              
Project ID   Used   Soft   Hard Warn/Grace   
---------- --------------------------------- 
#0              0      0      0  00 [------]
#1             1G     3G     5G  00 [------]
```

## Remove Project

To completely remove the XFS project quota from a volume, follow these steps:

1. Make a note of the Project ID.

```
$ sudo xfs_quota -x -c 'report -h' /var/openebs/local
```

**Example Output**

```
Project quota on /var/openebs/local (/dev/nvme1n1)
                        Blocks              
Project ID   Used   Soft   Hard Warn/Grace   
---------- --------------------------------- 
#0              0      0      0  00 [------]
#1             1G   2.0G   2.0G  00 [------]
```

2. Set the project limits to 0, effectively removing the quota limits.

```
$ sudo xfs_quota -x -c 'limit -p bsoft=0 bhard=0 1' /var/openebs/local
```

:::note
The command is for a project ID=1 at directory path `/var/openebs/local`.
:::

3. Clear the directory tree from the XFS project quota.

```
$ sudo xfs_quota 'project -C -p /var/openebs/local 1' /var/openebs/local
```

4. Verify the changes.

```
$ sudo xfs_quota -x -c 'report -h' /var/openebs/local
```

**Example Output**

```
Project quota on /var/openebs/local (/dev/nvme1n1)
                        Blocks
Project ID   Used   Soft   Hard Warn/Grace
---------- ---------------------------------
#0           1G     0      0   00 [------]
```

## See Also

- [XFS Quota Prerequisites](xfs-quota-pre.md)
- [Enable XFS Quota on LocalPV Hostpath](enable-xfs-quota.md)
- [XFS Quota with Loop Device](xfs-quota-pre.md)