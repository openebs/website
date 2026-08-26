---
id: modify-ext4-quota
title: Modify EXT4 Quota on LocalPV Hostpath
keywords:
 - OpenEBS LocalPV Hostpath Modify EXT4 Quota
 - EXT4 Quota
 - Modify EXT4 Quota
 - Advanced Operations
description: This section talks about modifying EXT4 quotas for OpenEBS LocalPV Hostpath.
---

# Modify EXT4 Quota on LocalPV Hostpath

This document provides the necessary steps to modify or remove the EXT4 project quota enforcement for existing OpenEBS LocalPV Hostpath volumes. EXT4 quotas help in managing storage utilization by enforcing soft and hard limits for allocated volumes.

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
NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS            AGE
demo-vol-demo-0   Bound    pvc-0365904e-0add-45ec-9b4e-f4080929d6cd   2Gi        RWO            openebs-hostpath-ext4   21s
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
StorageClass:      openebs-hostpath-ext4
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

## Modify the EXT4 Quota Limits

You can change the soft and/or hard limit of an existing hostpath volume with EXT4 project quota enabled by following the steps below. If you wish to remove the EXT4 project quota entirely, refer to the [Remove Project](#remove-project) section.

### Change Quota Limits

Execute the following commands on the node where the hostpath volume exists:

- Make a note of the Project ID.

```
$ sudo repquota -P /var/openebs/local
```

**Example Output**

```
*** Report for project quotas on device /dev/nvme1n1
Block grace time: 7days; Inode grace time: 7days
                        Block limits                File limits
Project         used    soft    hard  grace    used  soft  hard  grace
----------------------------------------------------------------------
#0        --      20       0       0              2     0     0
#1        -- 1048576 2097152 2097152              1     0     0
```

You can also read the project ID directly from the volume directory:

```
$ sudo lsattr -pd /var/openebs/local/pvc-0365904e-0add-45ec-9b4e-f4080929d6cd
```

- Modify the quota limits using the following command. The arguments are the project ID, the block soft limit, the block hard limit, the inode soft limit, and the inode hard limit, followed by the filesystem. The block limits are expressed in kilobytes.

```
$ sudo setquota -P 1 3145728 5242880 0 0 /var/openebs/local
```

:::note
The command above sets a soft limit of 3 GiB (3145728 KB) and a hard limit of 5 GiB (5242880 KB) for project ID 1. The inode limits are set to 0, which means they are unlimited.
:::

- Verify the updated limits.

```
$ sudo repquota -P /var/openebs/local
```

**Example Output**

```
*** Report for project quotas on device /dev/nvme1n1
Block grace time: 7days; Inode grace time: 7days
                        Block limits                File limits
Project         used    soft    hard  grace    used  soft  hard  grace
----------------------------------------------------------------------
#0        --      20       0       0              2     0     0
#1        -- 1048576 3145728 5242880              1     0     0
```

## Remove Project

To completely remove the EXT4 project quota from a volume, follow these steps:

1. Make a note of the Project ID.

```
$ sudo repquota -P /var/openebs/local
```

2. Set the project limits to 0, effectively removing the quota limits.

```
$ sudo setquota -P 1 0 0 0 0 /var/openebs/local
```

:::note
The command is for a project ID=1 at directory path `/var/openebs/local`.
:::

3. Clear the project ID and the project inheritance attribute from the volume directory.

```
$ sudo chattr -P -p 0 /var/openebs/local/pvc-0365904e-0add-45ec-9b4e-f4080929d6cd
```

4. Verify the changes.

```
$ sudo repquota -P /var/openebs/local
```

**Expected Output**

```
*** Report for project quotas on device /dev/nvme1n1
Block grace time: 7days; Inode grace time: 7days
                        Block limits                File limits
Project         used    soft    hard  grace    used  soft  hard  grace
----------------------------------------------------------------------
#0        -- 1048596       0       0              3     0     0
```

## See Also

- [EXT4 Quota Prerequisites](ext4-quota-pre.md)
- [Enable EXT4 Quota on LocalPV Hostpath](enable-ext4-quota.md)
- [EXT4 Quota with Loop Device](loop-device-ext4-quota.md)
