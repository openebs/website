---
id: lvm-fs-group
title: FSGroup
keywords:
 - OpenEBS Local PV LVM
 - Local PV FSGroup
 - Advanced Operations
description: This section talks about the advanced operations that can be performed in the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 
---

## Manage FSGroup Using Pod Security Context and CSI Driver Spec
	
We can manage permission change of volume using fsGroup. This helps non-root process to access the volume. CSI driver spec and Pod security context help us on when to apply permission change using fsGroup.

## External Links Describing this Feature

- [CSI Driver Skip Permission](https://github.com/kubernetes/enhancements/blob/master/keps/sig-storage/1682-csi-driver-skip-permission)
- [Skip Permission Change](https://github.com/kubernetes/enhancements/tree/master/keps/sig-storage/695-skip-permission-change)
- [CSI Mounter](https://github.com/kubernetes/kubernetes/blob/master/pkg/volume/csi/csi_mounter.go)
- [Volume](https://github.com/kubernetes/kubernetes/blob/master/pkg/volume/volume.go)

## Implementation Details

Volume ownership and permission are managed by kubelet. To mount CSI volume kubelet calls `NodePublishVolume` implemented by `SP`, after successful mount it tries to apply ownership and permission if required. Every volume in Kubernetes like configmap, secret, CSI volume implements `Mounter` and `Unmounter` interface. Volume ownership and permission are part of the `SetUp` method of CSI Mounter.

```bash
 _________________________ Kubernetes Node _________________________________
|   _________ kubelet ___________     _________ CSI Node Driver _________   |
|  |                             |   |                                   |  |
|  |  - CSI Mounter              |   |                                   |  |
|  |    - Task a                 |   |                                   |  |
|  |    - Task b                 |   |  -  NodePublishVolume             |  |
|  |    - NodePublishVolume      |   |     (How to mount the volume)     |  |
|  |    - SetVolumeOwnership     |   |                                   |  |
|  |    - Task x                 |   |                                   |  |
|  |    - Task y                 |   |                                   |  |
|  |_____________________________|   |___________________________________|  |
|___________________________________________________________________________|
```

## Configuration

Storage admin can set `FSGroupPolicy` in CSI Driver spec with 3 values.
- **ReadWriteOnceWithFSType** - Modify the volume ownership and permissions to the defined `fsGroup` when the `accessMode` is `RWO` and `fsType` is set.
- **None** - Mount the volume without attempting to modify volume ownership or permissions.
- **File** - Always attempt to apply the defined `fsGroup` to modify volume ownership and permissions regardless of `fsType` or `accessMode`.

Sample CSI Driver
```yaml
apiVersion: storage.k8s.io/v1
kind: CSIDriver
metadata:
  name: local.csi.openebs.io
spec:
  attachRequired: false
  fsGroupPolicy: File
  #fsGroupPolicy: None
  #fsGroupPolicy: ReadWriteOnceWithFSType
  podInfoOnMount: true
  volumeLifecycleModes:
  - Persistent
```
Application developer can set `PodFSGroupChangePolicy` in Pod spec with 2 values.
- **OnRootMismatch** - Only perform permission and ownership change if permissions of top-level directory do not match with expected permissions and ownership.
- **Always** - Always change the permissions and ownership to match `fsGroup`.

Sample Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: security-context
spec:
  securityContext:
    runAsUser: 2000
    runAsGroup: 3000
    fsGroup: 6000
    fsGroupChangePolicy: OnRootMismatch
    #fsGroupChangePolicy: Always
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: csi-volume
  containers:
  - name: security-context
    image: busybox
    imagePullPolicy: IfNotPresent
    command: [ "sh", "-c", "sleep 24h" ]
    volumeMounts:
    - name: data
      mountPath: /data
```

## Test Plans

Test plans are a combination of:
- CSIDriver.Spec.FSGroupPolicy 
  - File
  - None
  - ReadWriteOnceWithFSType
- PersistentVolumeClaim.Status.AccessModes 
  - ReadWriteOnce
  - ReadOnlyMany
  - ReadWriteMany

LVM CSI driver supports only ReadWriteOnly access mode so updated combination:
- CSIDriver.Spec.FSGroupPolicy 
  - File
  - None
  - ReadWriteOnceWithFSType
- PersistentVolumeClaim.Status.AccessModes 
  - ReadWriteOnce

`FSGroupPolicy` `File` and `ReadWriteOnceWithFSType` are equal for accesstype `ReadWriteOnce`.

Here are the test cases -
1. Deploy CSI Driver with `FSGroupPolicy` `ReadWriteOnceWithFSType` initial and updated non-root process should be able to access the volume.
2. Deploy CSI Driver with `FSGroupPolicy` `File` initial and updated non-root process should be able to access the volume.
3. Deploy CSI Driver with `FSGroupPolicy` `None` initial and updated non-root process should not be able to access the volume.
4. For all `FSGroupPolicy` root process should be able to access volume.
5. If `fsGroup` is missing from the Pod spec then non-root process should not be able to access the volume.