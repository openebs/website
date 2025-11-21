---
id: diskpool-expansion
title: DiskPool Expansion
keywords:
 - DiskPool Expansion
 - Mayastor DiskPool
description: This guide explains how to configure, monitor, and perform DiskPool expansion.
---

# DiskPool Expansion

## Overview

The DiskPool Expansion feature in Replicated PV Mayastor helps prevent storage outages when a pool allocation approaches capacity. By allowing controlled growth of an existing DiskPool, you can avoid replica failures caused by “no space” (ENOSPC) conditions and maintain uninterrupted application operations.

This document describes how to configure, and perform a DiskPool expansion, including the required CR settings, status fields, and supported expansion methods.

:::note
DiskPools cannot be expanded indefinitely. Each pool has a maximum expansion limit that is defined during creation. Pools created before this feature was introduced may have limited ability to grow.
:::

## Configuring Maximum Expansion

You can configure the maximum pool size using the `maxExpansion` field in the DiskPool CR.

- **Absolute Size:** Specify a fixed value in MiB, GiB, or TiB (for example: `800GiB`, `3.5TiB`, or `1073741824B`). Binary units must be used to avoid ambiguity.

- **Factor:** Specify a multiplier of the initial capacity (for example: `1x`, `5x`, `20x`). A value of `5x` allows the pool to grow up to five times its initial size. If not specified, the default is `1x`.

**Example: Factor-Based Expansion**

```
apiVersion: "openebs.io/v1beta3"
kind: DiskPool
metadata:
  name: <pool-name>
  namespace: <namespace>
spec:
  node: <node-name>
  disks: ["/dev/disk/by-id/<id>"]
  maxExpansion: "20x"
```

**Example: Absolute Size Expansion**

```
apiVersion: "openebs.io/v1beta3"
kind: DiskPool
metadata:
  name: <pool-name>
  namespace: <namespace>
spec:
  node: <node-name>
  disks: ["/dev/disk/by-id/<id>"]
  maxExpansion: "6TiB"
```

Two new fields are available in the DiskPool CR state to track pool expansion:

- `maxExpandableSize` - The absolute maximum size to which the pool can grow. Expansion beyond this limit fails. This does not affect existing volumes or data but makes any extra capacity unusable.

- `diskCapacity` – The size of the underlying disk. Note that `capacity` represents usable space after metadata reservation.

:::important
For any pool, the underlying disk can only be expanded up to (`maxExpandableSize - diskCapacity`). If the disk is grown beyond this value, the expansion request fails.
:::

## Expanding the DiskPool

To expand a pool:

1. Expand the backing disk (must not exceed `maxExpandableSize`).

2. Trigger the Replicated PV Mayastor pool expansion using one of the following methods:

    - Annotate the DSP CR

    Add the annotation `openebs.io/expand: true` to the CR to trigger reconciliation.

    ```
    kubectl annotate dsp <name> openebs.io/expand=true -n <ns>
    ```
    
    The Operator removes the annotation once expansion succeeds or when it encounters an unrecoverable error.

    - Use the OpenEBS plugin

    Run the command `kubectl openebs mayastor expand pool <pool-id> -n openebs` to invoke the pool expansion API.

3. Once successful, both `capacity` and `diskCapacity` values in the CR will reflect the updated size.

:::Important
We recommend using multiple DiskPools instead of over-expanding a single DiskPool (for example, setting `maxExpansion` of 100 GiB to grow up to 50-60 TiB). Increasing the `maxExpansion` value reserves more metadata pages in the pool, which can lengthen pool creation and import times. However, larger pools may be appropriate if the volumes are relatively large.
:::