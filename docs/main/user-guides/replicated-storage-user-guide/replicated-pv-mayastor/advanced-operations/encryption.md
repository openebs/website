---
id: encryption
title: Encryption
keywords:
 - Encryption
 - Data Encryption
 - Encrypted Volumes
description: This guide explains about the Data Encryption At-Rest feature.
---

## Overview

OpenEBS supports data-at-rest encryption to ensure the confidentiality of persistent disk data. By configuring disk pools with user-defined encryption keys, the pools themselves are encrypted, and volume replicas placed on these pools are automatically encrypted. This approach is especially beneficial for meeting security and regulatory compliance requirements.

This guide outlines how to enable encryption in Mayastor DiskPools and use them for volume replica placement.

## Prerequisites

Before provisioning encrypted volumes, ensure the following are set up:

### Create a Kubernetes Secret with AES-XTS Keys

Encryption in Mayastor uses the AES-XTS cipher, which requires two 128-bit hex-encoded keys.

**Example: Kubernetes Secret**
```
apiVersion: v1
kind: Secret
metadata:
  name: pool-encr-secret
  namespace: mayastor
type: Opaque
immutable: true
stringData:
  encryption_parameters: |
    {
      "cipher": "AesXts",
      "key": "2b7e151628aed2a6abf7158809cf4f3c",
      "key_len": 128,
      "key2": "2b7e151628aed2a6abf7158809cf4f3d",
      "key2_len": 128
    }
```

:::note
You can additionally use Kubernetes built-in resource encryption to secure this Secret resource. Refer to the [Encrypting Confidential Data at Rest Documentation](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/) for more information.
:::

### Configure DiskPool to Use the Encryption Secret

Reference the encryption secret in the `DiskPool` resource to enable encrypted storage.

**Example: DiskPool Configuration**
```
apiVersion: "openebs.io/v1beta3"
kind: DiskPool
metadata:
  name: <POOL_NAME>
  namespace: mayastor
spec:
  node: <NODE_NAME>
  disks: ["/dev/disk/by-id/<DEVICE_NAME>"]
  encryptionConfig:
    source:
      secret:
        name: pool-encr-secret
```

### Define StorageClass for Encrypted Volumes

To place volume replicas on encrypted pools, set `encrypted: "true"` in the `StorageClass`.

**Example: StorageClass**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-2-encr
parameters:
  protocol: nvmf
  repl: "2"
  encrypted: "true"
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
```

## Migrating from Non-Encrypted to Encrypted Pools

Currently, there is no automatic support for migrating existing unencrypted volumes. The following manual migration steps are recommended:

**Migration Steps**

1. Identify Target Pool: Select a non-encrypted pool (Example: P1) to migrate.
2. List Volumes on P1: Identify all volumes with replicas on P1.
3. (Optional) Scale Up Volumes: Increase replica count (Example: from 2 to 3) to maintain availability.
4. Mayastor Cordon Node: Cordon the mayastor node hosting P1 to stop new replicas from being scheduled using the plugin command `kubectl mayastor cordon node N1 key=value`.
5. Update Volume Config: Set encrypted: true using the Mayastor plugin command `kubectl mayastor set volume <volume-id> encryption true`.
6. Scale Down Volumes: Reduce replica count to remove replicas from P1.
7. Recreate Encrypted Pool:
    - Delete the non-encrypted pool.
    - Recreate it with encryption using the previously defined secret.
8. Scale-up Volumes: Increase replica count to allow new encrypted replicas to be created on the new pool.
9. Optional Replica Adjustment: After migration, optionally reduce replica count back to the original.

:::note
Monitor disk space and health throughout the migration to avoid service disruption.
:::

## Validation and Tips

- The Kubernetes Secret must be created before applying the DiskPool.
- Key rotation is not supported at this time.
- Persistent device paths are required for pool creation. Retrieve them using:
```
kubectl mayastor get block-devices <node-id>
```
:::note
Pool and volume migration is manual and requires careful planning.
:::