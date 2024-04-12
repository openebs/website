---
id: re-resize
title: Resize
keywords:
 - Resize
 - Volume Resize
 - Replicated Storage Volume Resize
description: This guide explains about the volume resize feature.
---

The Volume Resize feature allows Kubernetes (or any other CO) end-users to expand a persistent volume (PV) after creation by resizing a dynamically provisioned persistent volume claim (PVC). This is allowed only if the `StorageClass` has `allowVolumeExpansion` boolean flag set to _true_. The end-users can edit the `allowVolumeExpansion` boolean flag in Kubernetes `StorageClass` to toggle the permission for PVC resizing. This is useful for users to optimise their provisioned space and not have to worry about pre-planning the future capacity requirements. The users can provision a volume with just about right size based on current usage and trends, and in the future if the need arises to have more capacity in the same volume, the volume can be easily expanded.

Replicated Storage (a.k.a Replicated Engine or Mayastor) CSI plugin provides the ability to expand volume in the _ONLINE_ and _OFFLINE_ states.

## Prerequisites

- Only dynamically provisioned PVCs can be resized.

- Only volume size expansion is allowed, shrinking a volume is not allowed.

- The `StorageClass` that provisions the PVC must support resize. The `allowVolumeExpansion` flag is set to _true_ by default in the Replicated Storage `StorageClass` since version 2.6.0.

- The disk pools hosting volume replicas have sufficient capacity for volume expansion.

- All the replicas of the volume are _Online_.

**Example**

1. Ensure that the storage class is allowing volume expansion.

```
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "1"
provisioner: io.openebs.csi-mayastor
allowVolumeExpansion: true
EOF
```

2. Create a PVC.

```
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:

-  ReadWriteOnce
resources:
requests:
  storage: 1Gi
storageClassName: mayastor-1
EOF
```

3. Start an application pod that uses this PVC.

4. Edit the PVC to expand.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:

- ReadWriteOnce
resources:
requests:
  storage: 2Gi
storageClassName: mayastor-1
EOF
```

5. The PV should get resized and reflecting the new capacity.

```
# kubectl get pvc ms-volume-claim
NAME               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
ms-volume-claim   Bound     pvc-e6aa58e7-84e9-457a-ba21-9819558cf360   2Gi       RWO            mayastor-1     54s
# kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                      STORAGECLASS   REASON    AGE
pvc-e6aa58e7-84e9-457a-ba21-9819558cf360   2Gi       RWO            Delete  
```

## Current Limitations and Known Behavior

Currently, a volume that has a snapshot present on the system, or the volume is a restore volume (i.e. created from a snapshot), the resize is disallowed.

For _OFFLINE_ volume expansion of filesystem-mode volumes, the filesystem is expanded when the application pod starts up and publishes the volume again. In the sequence of events, the CSI request to expand the filesystem on node (NodeExpandVolume) arrives about a second after the CSI request to publish the volume on node (NodePublishVolume). If within that small window application tries to fetch/check the filesystem size, it’ll see the old size of volume because filesystem isn’t yet expanded. Depending on the application behaviour, If at all this happens, restarting the application pod should mitigate this.