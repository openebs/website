---
id: advanced
title: cStor User Guide - Advanced
keywords:
  - cStor csi
  - cStor User Guide
  - Scaling cStor pools
  - Cloning a cStor Snapshot
  - Cleaning up a cStor setup
  - Expanding a cStor volume
  - Tuning cStor Volumes
description: This user guide of cStor contains advanced level of cStor related topics such as expanding a cStor volume, taking Snapshot and Clone of a cStor volume, scaling up cStor pools, Block Device Tagging, Tuning cStor Pools and Tuning cStor Volumes
---

This user guide of cStor contains advanced level of cStor related topics such as expanding a cStor volume, taking Snapshot and Clone of a cStor volume, scaling up cStor pools, Block Device Tagging, Tuning cStor Pools and Tuning cStor Volumes

- [Scaling up cStor pools](#scaling-cstor-pools)
- [Snapshot and Clone of a cStor volume](#snapshot-and-clone-of-a-cstor-volume)
- [Expanding a cStor volume](#expanding-a-cstor-volume)
- [Block Device Tagging](#block-device-tagging)
- [Tuning cStor Pools](#tuning-cstor-pools)
- [Tuning cStor Volumes](#tuning-cstor-volumes)

## Scaling cStor pools

Once the cStor storage pools are created you can scale-up your existing cStor pool.
To scale-up the pool size, you need to edit the CSPC YAML that was used for creation of CStorPoolCluster.

Scaling up can done by two methods:

1. [Adding new nodes(with new disks) to the existing CSPC](#adding-disk-new-node)
2. [Adding new disks to existing nodes](#adding-disk-same-node)

**Note:** The dataRaidGroupType: can either be set as stripe or mirror as per your requirement. In the following example it is configured as stripe.

### Adding new nodes(with new disks) to the existing CSPC

A new node spec needs to be added to previously deployed YAML,

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:
 pools:
   - nodeSelector:
       kubernetes.io/hostname: "worker-node-1"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-10ad9f484c299597ed1e126d7b857967"
     poolConfig:
       dataRaidGroupType: "stripe"

   - nodeSelector:
       kubernetes.io/hostname: "worker-node-2"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b"
     poolConfig:
       dataRaidGroupType: "stripe"

   - nodeSelector:
       kubernetes.io/hostname: "worker-node-3"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68"
     poolConfig:
       dataRaidGroupType: "stripe"

   # New node spec added -- to create a cStor pool on worker-3
   - nodeSelector:
       kubernetes.io/hostname: "worker-node-4"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-02d9b2dc8954ce0347850b7625375e24"
     poolConfig:
       dataRaidGroupType: "stripe"

```

Now verify the status of CSPC and CSPI(s):

```
kubectl get cspc -n openebs
```

Sample Output:

```shell hideCopyshell hideCopy
NAME                     HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES   AGE
cspc-disk-pool           4                  4                      4                  8m5s
```

```
kubectl get cspi -n openebs
```

Sample Output:

```shell hideCopyshell hideCopy
NAME                  HOSTNAME         FREE     CAPACITY    READONLY   STATUS   AGE
cspc-disk-pool-d9zf   worker-node-1    28800M   28800071k   false      ONLINE   7m50s
cspc-disk-pool-lr6z   worker-node-2    28800M   28800056k   false      ONLINE   7m50s
cspc-disk-pool-x4b4   worker-node-3    28800M   28800056k   false      ONLINE   7m50s
cspc-disk-pool-rt4k   worker-node-4    28800M   28800056k   false      ONLINE   15s

```

As a result of this, we can see that a new pool have been added, increasing the number of pools to 4

### Adding new disks to existing nodes

A new `blockDeviceName` under `blockDevices` needs to be added to previously deployed YAML. Execute the following command to edit the CSPC,

```
kubectl edit cspc -n openebs cstor-disk-pool
```

Sample YAML:

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:
 pools:
   - nodeSelector:
       kubernetes.io/hostname: "worker-node-1"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-10ad9f484c299597ed1e126d7b857967"
           - blockDeviceName: "blockdevice-f036513d98f6c7ce31fd6e1ac3fad2f5" //# New blockdevice added
     poolConfig:
       dataRaidGroupType: "stripe"

   - nodeSelector:
       kubernetes.io/hostname: "worker-node-2"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b"
           - blockDeviceName: "blockdevice-fb7c995c4beccd6c872b7b77aad32932" //# New blockdevice added
     poolConfig:
       dataRaidGroupType: "stripe"

   - nodeSelector:
       kubernetes.io/hostname: "worker-node-3"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68"
           - blockDeviceName: "blockdevice-46ddda7223b35b81415b0a1b12e40bcb" //# New blockdevice added
     poolConfig:
       dataRaidGroupType: "stripe"

```

## Snapshot and Clone of a cStor Volume

An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot act as a detailed table of contents, with accessible copies of data that user can roll back to the required point of instance. Snapshots in OpenEBS are instantaneous and are managed through kubectl.

During the installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates VolumeSnapshot and VolumeSnapshotData custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.

### Creating a cStor volume Snapshot

1.  Before proceeding to create a cStor volume snapshot and use it further for restoration, it is necessary to create a `VolumeSnapshotClass`. Copy the following YAML specification into a file called `snapshot_class.yaml`.

    ```
    kind: VolumeSnapshotClass
    apiVersion: snapshot.storage.k8s.io/v1
    metadata:
    name: csi-cstor-snapshotclass
    annotations:
      snapshot.storage.kubernetes.io/is-default-class: "true"
    driver: cstor.csi.openebs.io
    deletionPolicy: Delete
    ```

    The deletion policy can be set as `Delete or Retain`. When it is set to Retain, the underlying physical snapshot on the storage cluster is retained even when the VolumeSnapshot object is deleted.
    To apply, execute:

    ```
    kubectl apply -f snapshot_class.yaml
    ```

    **Note:** In clusters that only install `v1beta1` version of VolumeSnapshotClass as the supported version(eg. OpenShift(OCP) 4.5 ), the following error might be encountered.

    ```
    no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"
    ```

    In such cases, the apiVersion needs to be updated to `apiVersion: snapshot.storage.k8s.io/v1beta1`

2.  For creating the snapshot, you need to create a YAML specification and provide the required PVC name into it. The only prerequisite check is to be performed is to ensure that there is no stale entries of snapshot and snapshot data before creating a new snapshot. Copy the following YAML specification into a file called `snapshot.yaml`.

    ```
    apiVersion: snapshot.storage.k8s.io/v1
    kind: VolumeSnapshot
    metadata:
    name: cstor-pvc-snap
    spec:
    volumeSnapshotClassName: csi-cstor-snapshotclass
    source:
      persistentVolumeClaimName: cstor-pvc
    ```

    Run the following command to create the snapshot,

    ```
    kubectl create -f snapshot.yaml
    ```

    To list the snapshots, execute:

    ```
    kubectl get volumesnapshots -n default
    ```

    Sample Output:

    ```shell hideCopy
    NAME                        AGE
    cstor-pvc-snap              10s
    ```

    A VolumeSnapshot is analogous to a PVC and is associated with a `VolumeSnapshotContent` object that represents the actual snapshot. To identify the VolumeSnapshotContent object for the VolumeSnapshot execute:

    ```
    kubectl describe volumesnapshots cstor-pvc-snap -n default
    ```

    Sample Output:

    ```shell hideCopy
    Name:         cstor-pvc-snap
    Namespace:    default
    .
    .
    .
    Spec:
    Snapshot Class Name:    cstor-csi-snapshotclass
    Snapshot Content Name:  snapcontent-e8d8a0ca-9826-11e9-9807-525400f3f660
    Source:
      API Group:
      Kind:       PersistentVolumeClaim
      Name:       cstor-pvc
    Status:
    Creation Time:  2020-06-20T15:27:29Z
    Ready To Use:   true
    Restore Size:   5Gi

    ```

    The `SnapshotContentName` identifies the `VolumeSnapshotContent` object which serves this snapshot. The `Ready To Use` parameter indicates that the Snapshot has been created successfully and can be used to create a new PVC.

**Note:** All cStor snapshots should be created in the same namespace of source PVC.

### Cloning a cStor Snapshot

Once the snapshot is created, you can use it to create a PVC. In order to restore a specific snapshot, you need to create a new PVC that refers to the snapshot. Below is an example of a YAML file that restores and creates a PVC from a snapshot.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 name: restore-cstor-pvc
spec:
 storageClassName: cstor-csi-disk
 dataSource:
   name: cstor-pvc-snap
   kind: VolumeSnapshot
   apiGroup: snapshot.storage.k8s.io
 accessModes:
   - ReadWriteOnce
 resources:
   requests:
     storage: 5Gi
```

The `dataSource` shows that the PVC must be created using a VolumeSnapshot named `cstor-pvc-snap` as the source of the data. This instructs cStor CSI to create a PVC from the snapshot. Once the PVC is created, it can be attached to a pod and used just like any other PVC.

To verify the creation of PVC execute:

```
kubectl get pvc
```

Sample Output:

```shell hideCopy
NAME                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS              AGE
restore-cstor-pvc              Bound    pvc-2f2d65fc-0784-11ea-b887-42010a80006c   5Gi        RWO            cstor-csi-disk            5s
```

## Expanding a cStor volume

OpenEBS cStor introduces support for expanding a PersistentVolume using the CSI provisioner. Provided cStor is configured to function as a CSI provisioner, you can expand PVs that have been created by cStor CSI Driver. This feature is supported with Kubernetes versions 1.16 and above.

For expanding a cStor PV, you must ensure the following items are taken care of:

- The StorageClass must support volume expansion. This can be done by editing the StorageClass definition to set the allowVolumeExpansion: true.
- To resize a PV, edit the PVC definition and update the spec.resources.requests.storage to reflect the newly desired size, which must be greater than the original size.
- The PV must be attached to a pod for it to be resized. There are two scenarios when resizing an cStor PV:
  - If the PV is attached to a pod, cStor CSI driver expands the volume on the storage backend, re-scans the device and resizes the filesystem.
  - When attempting to resize an unattached PV, cStor CSI driver expands the volume on the storage backend. Once the PVC is bound to a pod, the driver re-scans the device and resizes the filesystem. Kubernetes then updates the PVC size after the expansion operation has successfully completed.

Below example shows the way for expanding cStor volume and how it works. For an already existing StorageClass, you can edit the StorageClass to include the `allowVolumeExpansion: true` parameter.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: cstor-csi-disk
provisioner: cstor.csi.openebs.io
allowVolumeExpansion: true
parameters:
 replicaCount: "3"
 cstorPoolCluster: "cspc-disk-pool"
 cas-type: "cstor"
```

For example an application busybox pod is using the below PVC associated with PV. To get the status of the pod, execute:

```
$ kubectl get pods
```

The following is a Sample Output:

```shell hideCopy
NAME            READY   STATUS    RESTARTS   AGE
busybox         1/1     Running   0          38m
```

To list PVCs, execute:

```
$ kubectl get pvc
```

Sample Output:

```shell hideCopy
NAME                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS              AGE
cstor-pvc                      Bound    pvc-849bd646-6d3f-4a87-909e-2416d4e00904   5Gi        RWO            cstor-csi-disk            1d
```

To list PVs, execute:

```
$ kubectl get pv
```

Sample Output:

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS        REASON   AGE
pvc-849bd646-6d3f-4a87-909e-2416d4e00904   5Gi        RWO            Delete           Bound    default/cstor-pvc       cstor-csi-disk               40m
```

To resize the PV that has been created from 5Gi to 10Gi, edit the PVC definition and update the spec.resources.requests.storage to 10Gi. It may take a few seconds to update the actual size in the PVC resource, wait for the updated capacity to reflect in PVC status (pvc.status.capacity.storage). It is internally a two step process for volumes containing a file system:

- Volume expansion
- FileSystem expansion

```
$ kubectl edit pvc cstor-pvc
```

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
 annotations:
   pv.kubernetes.io/bind-completed: "yes"
   pv.kubernetes.io/bound-by-controller: "yes"
   volume.beta.kubernetes.io/storage-provisioner: cstor.csi.openebs.io
 creationTimestamp: "2020-06-24T12:22:24Z"
 finalizers:
 - kubernetes.io/pvc-protection
   name: cstor-pvc
 namespace: default
 resourceVersion: "766"
 selfLink: /api/v1/namespaces/default/persistentvolumeclaims/cstor-pvc
 uid: 849bd646-6d3f-4a87-909e-2416d4e00904
spec:
 accessModes:
 - ReadWriteOnce
 resources:
   requests:
     storage: 10Gi
```

Now, we can validate the resize has worked correctly by checking the size of the PVC, PV, or describing the pvc to get all events.

```
$ kubectl describe pvc cstor-pvc
```

```shell hideCopy
Name:          cstor-pvc
Namespace:     default
StorageClass:  cstor-csi-disk
Status:        Bound
Volume:        pvc-849bd646-6d3f-4a87-909e-2416d4e00904
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
              pv.kubernetes.io/bound-by-controller: yes
              volume.beta.kubernetes.io/storage-provisioner: cstor.csi.openebs.io
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      10Gi
Access Modes:  RWO
VolumeMode:    Filesystem
Mounted By:    busybox-cstor
Events:
 Type     Reason                      Age                From                                                                                      Message
 ----     ------                      ----               ----                                                                                      -------
 Normal   ExternalProvisioning        46m (x2 over 46m)  persistentvolume-controller                                                               waiting for a volume to be created, either by external provisioner "cstor.csi.openebs.io" or manually created by system administrator
 Normal   Provisioning                46m                cstor.csi.openebs.io_openebs-cstor-csi-controller-0_bcba3893-c1c4-4e86-aee4-de98858ec0b7  External provisioner is provisioning volume for claim "default/claim-csi-123"
 Normal   ProvisioningSucceeded       46m                cstor.csi.openebs.io_openebs-cstor-csi-controller-0_bcba3893-c1c4-4e86-aee4-de98858ec0b7  Successfully provisioned volume pvc-849bd646-6d3f-4a87-909e-2416d4e00904
 Warning  ExternalExpanding           93s                volume_expand                                                                             Ignoring the PVC: didn't find a plugin capable of expanding the volume; waiting for an external controller to process this PVC.
 Normal   Resizing                    93s                external-resizer cstor.csi.openebs.io                                                     External resizer is resizing volume pvc-849bd646-6d3f-4a87-909e-2416d4e00904
 Normal   FileSystemResizeRequired    88s                external-resizer cstor.csi.openebs.io                                                     Require file system resize of volume on node
 Normal   FileSystemResizeSuccessful  4s                 kubelet, 127.0.0.1                                                                        MountVolume.NodeExpandVolume succeeded for volume "pvc-849bd646-6d3f-4a87-909e-2416d4e00904"
```

```
$ kubectl get pvc
```

Sample Output:

```shell hideCopy
NAME                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS              AGE
cstor-pvc                      Bound    pvc-849bd646-6d3f-4a87-909e-2416d4e00904   10Gi        RWO            cstor-csi-disk            1d
```

```
$ kubectl get pv
```

Sample Output:

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS        REASON   AGE
pvc-849bd646-6d3f-4a87-909e-2416d4e00904   10Gi       RWO            Delete           Bound    default/cstor-pvc       cstor-csi-disk               40m
```

## Block Device Tagging

NDM provides you with an ability to reserve block devices to be used for specific applications via adding tag(s) to your block device(s). This feature can be used by cStor operators to specify the block devices which should be consumed by cStor pools and conversely restrict anyone else from using those block devices. This helps in protecting against manual errors in specifying the block devices in the CSPC yaml by users.

1. Consider the following block devices in a Kubernetes cluster, they will be used to provision a storage pool. List the labels added to these block devices,

```
kubectl get bd -n openebs --show-labels
```

Sample Output:

```shell hideCopy
NAME                                           NODENAME               SIZE          CLAIMSTATE   STATUS   AGE   LABELS
blockdevice-00439dc464b785256242113bf0ef64b9   worker-node-3          21473771008   Unclaimed    Active   34h   kubernetes.io/hostname=worker-node-3,ndm.io/blockdevice-type=blockdevice,ndm.io/managed=true
blockdevice-022674b5f97f06195fe962a7a61fcb64   worker-node-1          21473771008   Unclaimed    Active   34h   kubernetes.io/hostname=worker-node-1,ndm.io/blockdevice-type=blockdevice,ndm.io/managed=true
blockdevice-241fb162b8d0eafc640ed89588a832df   worker-node-2          21473771008   Unclaimed    Active   34h   kubernetes.io/hostname=worker-node-2,ndm.io/blockdevice-type=blockdevice,ndm.io/managed=true

```

2. Now, to understand how block device tagging works we will be adding `openebs.io/block-device-tag=fast` to the block device attached to worker-node-3 _(i.e blockdevice-00439dc464b785256242113bf0ef64b9)_

```
kubectl label bd blockdevice-00439dc464b785256242113bf0ef64b9 -n openebs  openebs.io/block-device-tag=fast
```

```
kubectl get bd -n openebs blockdevice-00439dc464b785256242113bf0ef64b9 --show-labels
```

Sample Output:

```shell hideCopy
NAME                                           NODENAME             SIZE          CLAIMSTATE   STATUS   AGE   LABELS
blockdevice-00439dc464b785256242113bf0ef64b9   worker-node-3        21473771008   Unclaimed    Active   34h   kubernetes.io/hostname=worker-node-3,ndm.io/blockdevice-type=blockdevice,ndm.io/managed=true,openebs.io/block-device-tag=fast
```

Now, provision cStor pools using the following CSPC YAML. Note, `openebs.io/allowed-bd-tags:` is set to `cstor, ssd` which ensures the CSPC will be created using the block devices that either have the label set to cstor or ssd, or have no such label.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
name: cspc-disk-pool
namespace: openebs
annotations:
  # This annotation helps to specify the BD that can be allowed.
  openebs.io/allowed-bd-tags: cstor,ssd
spec:
pools:
  - nodeSelector:
      kubernetes.io/hostname: "worker-node-1"
    dataRaidGroups:
    - blockDevices:
        - blockDeviceName: "blockdevice-022674b5f97f06195fe962a7a61fcb64"
    poolConfig:
      dataRaidGroupType: "stripe"
- nodeSelector:
      kubernetes.io/hostname: "worker-node-2"
    dataRaidGroups:
      - blockDevices:
          - blockDeviceName: "blockdevice-241fb162b8d0eafc640ed89588a832df"
    poolConfig:
      dataRaidGroupType: "stripe"
- nodeSelector:
      kubernetes.io/hostname: "worker-node-3"
    dataRaidGroups:
      - blockDevices:
          - blockDeviceName: "blockdevice-00439dc464b785256242113bf0ef64b9"
    poolConfig:
      dataRaidGroupType: "stripe"
```

Apply the above CSPC file for CSPIs to get created and check the CSPI status.

```
kubectl apply -f cspc.yaml
```

```
kubectl get cspi -n openebs
```

Sample Output:

```shell hideCopy
NAME             HOSTNAME        FREE   CAPACITY    READONLY PROVISIONEDREPLICAS HEALTHYREPLICAS STATUS   AGE
cspc-stripe-b9f6 worker-node-2   19300M 19300614k   false      0                     0          ONLINE   89s
cspc-stripe-q7xn worker-node-1   19300M 19300614k   false      0                     0          ONLINE   89s

```

Note that CSPI for node **worker-node-3** is not created because:

- CSPC YAML created above has `openebs.io/allowed-bd-tags: cstor, ssd` in its annotation. Which means that the CSPC operator will only consider those block devices for provisioning that either do not have a BD tag, openebs.io/block-device-tag, on the block device or have the tag with the values set as `cstor or ssd`.
- In this case, the blockdevice-022674b5f97f06195fe962a7a61fcb64 (on node worker-node-1) and blockdevice-241fb162b8d0eafc640ed89588a832df (on node worker-node-2) do not have the label. Hence, no restrictions are applied on it and they can be used as the CSPC operator for pool provisioning.
- For blockdevice-00439dc464b785256242113bf0ef64b9 (on node worker-node-3), the label `openebs.io/block-device-tag` has the value fast. But on the CSPC, the annotation openebs.io/allowed-bd-tags has value cstor and ssd. There is no fast keyword present in the annotation value and hence this block device cannot be used.

**NOTE:**

1. To allow multiple tag values, the bd tag annotation can be written in the following comma-separated manner:

```
  openebs.io/allowed-bd-tags: fast,ssd,nvme
```

2. BD tag can only have one value on the block device CR. For example,
   - openebs.io/block-device-tag: fast
     Block devices should not be tagged in a comma-separated format. One of the reasons for this is, cStor allowed bd tag annotation takes comma-separated values and values like(i.e fast, ssd ) can never be interpreted as a single word in cStor and hence BDs tagged in above format cannot be utilised by cStor.
3. If any block device mentioned in CSPC has an empty value for `the openebs.io/block-device-tag`, then those block devices will not be considered for pool provisioning and other operations. Block devices with empty tag value are implicitly not allowed by the CSPC operator.

## Tuning cStor Pools

Allow users to set available performance tunings in cStor Pools based on their workload. cStor pool(s) can be tuned via CSPC and is the recommended way to do it. Below are the tunings that can be applied:

**Resource requests and limits:** This ensures high quality of service when applied for the pool manager containers.

**Toleration for pool manager pod:** This ensures scheduling of pool pods on the tainted nodes.

**Set priority class:** Sets the priority levels as required.

**Compression:** This helps in setting the compression for cStor pools.

**ReadOnly threshold:** Helps in specifying read only thresholds for cStor pools.

**Example configuration for Resource and Limits:**

Following CSPC YAML specifies resources and auxResources that will get applied to all pool manager pods for the CSPC. Resources get applied to cstor-pool containers and auxResources gets applied to sidecar containers i.e. cstor-pool-mgmt and pool-exporter.

In the following CSPC YAML we have only one pool spec (@spec.pools). It is also possible to override the resource and limit value for a specific pool.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:
 resources:
   requests:
     memory: "2Gi"
     cpu: "250m"
   limits:
     memory: "4Gi"
     cpu: "500m"

 auxResources:
   requests:
     memory: "500Mi"
     cpu: "100m"
   limits:
     memory: "1Gi"
     cpu: "200m"
 pools:
   - nodeSelector:
       kubernetes.io/hostname: worker-node-1

     dataRaidGroups:
     - blockDevices:
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

     poolConfig:
       dataRaidGroupType: mirror
```

Following CSPC YAML explains how the resource and limits can be overridden. If you look at the CSPC YAML, there are no resources and auxResources specified at pool level for worker-node-1 and worker-node-2 but specified for worker-node-3. In this case, for worker-node-1 and worker-node-2 the resources and auxResources will be applied from @spec.resources and @spec.auxResources respectively but for worker-node-3 these will be applied from @spec.pools[2].poolConfig.resources and @spec.pools[2].poolConfig.auxResources respectively.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:
 resources:
   requests:
     memory: "64Mi"
     cpu: "250m"
   limits:
     memory: "128Mi"
     cpu: "500m"
 auxResources:
   requests:
     memory: "50Mi"
     cpu: "400m"
   limits:
     memory: "100Mi"
     cpu: "400m"
  pools:
   - nodeSelector:
       kubernetes.io/hostname: worker-node-1
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37
     poolConfig:
       dataRaidGroupType: mirror

   - nodeSelector:
       kubernetes.io/hostname: worker-node-2
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40
     poolConfig:
       dataRaidGroupType: mirror

   - nodeSelector:
       kubernetes.io/hostname: worker-node-3
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43
     poolConfig:
       dataRaidGroupType: mirror
       resources:
         requests:
           memory: 70Mi
           cpu: 300m
         limits:
           memory: 130Mi
           cpu: 600m
       auxResources:
         requests:
           memory: 60Mi
           cpu: 500m
         limits:
           memory: 120Mi
           cpu: 500m

```

**Example configuration for Tolerations:**

Tolerations are applied in a similar manner like resources and auxResources. The following is a sample CSPC YAML that has tolerations specified. For worker-node-1 and worker-node-2 tolerations are applied form @spec.tolerations but for worker-node-3 it is applied from @spec.pools[2].poolConfig.tolerations

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:

 tolerations:
 - key: data-plane-node
   operator: Equal
   value: true
   effect: NoSchedule

 pools:
   - nodeSelector:
       kubernetes.io/hostname: worker-node-1

     dataRaidGroups:
     - blockDevices:
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

     poolConfig:
       dataRaidGroupType: mirror

   - nodeSelector:
       kubernetes.io/hostname: worker-node-2

     dataRaidGroups:
     - blockDevices:
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

     poolConfig:
       dataRaidGroupType: mirror

   - nodeSelector:
       kubernetes.io/hostname: worker-node-3

     dataRaidGroups:
     - blockDevices:
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43

     poolConfig:
       dataRaidGroupType: mirror
       tolerations:
       - key: data-plane-node
         operator: Equal
         value: true
         effect: NoSchedule

       - key: apac-zone
         operator: Equal
         value: true
         effect: NoSchedule
```

**Example configuration for Priority Class:**

Priority Classes are also applied in a similar manner like resources and auxResources. The following is a sample CSPC YAML that has a priority class specified. For worker-node-1 and worker-node-2 priority classes are applied from @spec.priorityClassName but for worker-node-3 it is applied from @spec.pools[2].poolConfig.priorityClassName. Check more info about [priorityclass](https://kubernetes.io/docs/concepts/configuration/pod-priority-preemption/#priorityclass).

**Note:**

1. Priority class needs to be created beforehand. In this case, high-priority and ultra-priority priority classes should exist.
2. The index starts from 0 for @.spec.pools list.

   ```
   apiVersion: cstor.openebs.io/v1
   kind: CStorPoolCluster
   metadata:
   name: cstor-disk-pool
   namespace: openebs
   spec:

   priorityClassName: high-priority

   pools:
     - nodeSelector:
         kubernetes.io/hostname: worker-node-1

       dataRaidGroups:
       - blockDevices:
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

       poolConfig:
         dataRaidGroupType: mirror

     - nodeSelector:
         kubernetes.io/hostname: worker-node-2

       dataRaidGroups:
       - blockDevices:
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

       poolConfig:
         dataRaidGroupType: mirror

     - nodeSelector:
         kubernetes.io/hostname: worker-node-3

       dataRaidGroups:
       - blockDevices:
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
           - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43

       poolConfig:
         dataRaidGroupType: mirror
         priorityClassName: utlra-priority
   ```

   **Example configuration for Compression:**

   Compression values can be set at **pool level only**. There is no override mechanism like it was there in case of tolerations, resources, auxResources and priorityClass. Compression value must be one of

   - on
   - off
   - lzjb
   - gzip
   - gzip-[1-9]
   - zle
   - lz4

**Note:** lz4 is the default compression algorithm that is used if the compression field is left unspecified on the cspc. Below is the sample yaml which has compression specified.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:
 pools:
   - nodeSelector:
       kubernetes.io/hostname: worker-node-1

     dataRaidGroups:
     - blockDevices:
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

     poolConfig:
       dataRaidGroupType: mirror
       compression: lz4
```

**Example configuration for Read Only Threshold:**

RO threshold can be set in a similar manner like compression. ROThresholdLimit is the threshold(percentage base) limit for pool read only mode. If ROThresholdLimit (%) amount of pool storage is consumed then the pool will be set to readonly. If ROThresholdLimit is set to 100 then entire pool storage will be used. By default it will be set to 85% i.e when unspecified on the CSPC. ROThresholdLimit value will be 0 < ROThresholdLimit <= 100. Following CSPC yaml has the ReadOnly Threshold percentage specified.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-csi-disk
 namespace: openebs
spec:
 pools:
   - nodeSelector:
       kubernetes.io/hostname: worker-node-1

     dataRaidGroups:
     - blockDevices:
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
         - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

     poolConfig:
       dataRaidGroupType: mirror

       roThresholdLimit : 70
```

## Tuning cStor Volumes

Similar to tuning of the cStor Pool cluster, there are possible ways for tuning cStor volumes. cStor volumes can be provisioned using different policy configurations. However, `cStorVolumePolicy` needs to be created first. It must be created prior to creation of StorageClass as `CStorVolumePolicy` name needs to be specified to provision cStor volume based on configured policy. A sample StorageClass YAML that utilises `cstorVolumePolicy` is given below for reference:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: cstor-csi-disk
provisioner: cstor.csi.openebs.io
allowVolumeExpansion: true
parameters:
 replicaCount: "1"
 cstorPoolCluster: "cstor-disk-pool"
 cas-type: "cstor"
 fsType: "xfs"                 // default type is ext4
 cstorVolumePolicy: "csi-volume-policy"
```

If the volume policy is not created before volume provisioning and needs to be modified later,
it can be changed by editing the cStorVolumeConfig(CVC) resource as per volume bases which will be reconciled by the CVC controller to the respected volume resources.
Each PVC creation request will create a CStorVolumeConfig(cvc) resource which can be used to manage volume, its policies and any supported operations (like, Scale up/down), per volume bases.
To edit, execute:

```
kubectl edit cvc <pv-name> -n openebs
```

Sample Output:

```shell hideCopy
apiVersion: cstor.openebs.io/v1
kind: CStorVolumeConfig
metadata:
 annotations:
   openebs.io/persistent-volume-claim: "cstor-pvc"
   openebs.io/volume-policy: csi-volume-policy
   openebs.io/volumeID: pvc-25e79ecb-8357-49d4-83c2-2e63ebd66278
 creationTimestamp: "2020-07-22T11:36:13Z"
 finalizers:
 - cvc.openebs.io/finalizer
 generation: 3
 labels:
   cstor.openebs.io/template-hash: "3278395555"
   openebs.io/cstor-pool-cluster: cstor-disk-pool
 name: pvc-25e79ecb-8357-49d4-83c2-2e63ebd66278
 namespace: openebs
 resourceVersion: "1283"
 selfLink: /apis/cstor.openebs.io/v1/namespaces/openebs/cstorvolumeconfigs/pvc-25e79ecb-8357-49d4-83c2-2e63ebd66278
 uid: 389320d8-5f0b-439d-8ef2-59f4d01b393a
publish:
 nodeId: 127.0.0.1
spec:
 capacity:
   storage: 1Gi
 cstorVolumeRef:
   apiVersion: cstor.openebs.io/v1
   kind: CStorVolume
   name: pvc-25e79ecb-8357-49d4-83c2-2e63ebd66278
   namespace: openebs
   resourceVersion: "1260"
   uid: ea6e09f2-1e65-41ab-820a-ed1ecd14873c
 policy:
   provision:
     replicaAffinity: true
   replica:
     zvolWorkers: "1"
   replicaPoolInfo:
   - poolName: cstor-disk-pool-vn92
   target:
     affinity:
       requiredDuringSchedulingIgnoredDuringExecution:
       - labelSelector:
           matchExpressions:
           - key: openebs.io/target-affinity
             operator: In
             values:
             - percona
         namespaces:
         - default
         topologyKey: kubernetes.io/hostname
     auxResources:
       limits:
         cpu: 500m
         memory: 128Mi
       requests:
         cpu: 250m
         memory: 64Mi
     luWorkers: 8
     priorityClassName: system-cluster-critical
     queueDepth: "16"
     resources:
       limits:
         cpu: 500m
         memory: 128Mi
       requests:
       .
       .
       .
```

The list of policies that can be configured are as follows:

- [Replica Affinity to create a volume replica on specific pool](#replica-affinity)

- [Volume Target Pod Affinity](#volume-target-pod-affinity)

- [Volume Tunable](#volume-tunable)

- [Memory and CPU Resources QoS](#memory-and-cpu-qos)

- [Toleration for target pod to ensure scheduling of target pods on tainted nodes {#toleration-for-target-pod}](#toleration-for-target-pod)

- [Priority class for volume target deployment](#priority-class-for-volume-target-deployment)

### Replica Affinity to create a volume replica on specific pool {#replica-affinity}

For StatefulSet applications, to distribute single replica volume on specific cStor pool we can use replicaAffinity enabled scheduling. This feature should be used with delay volume binding i.e. `volumeBindingMode: WaitForFirstConsumer` in StorageClass. When `volumeBindingMode` is set to `WaitForFirstConsumer` the csi-provisioner waits for the scheduler to select a node. The topology of the selected node will then be set as the first entry in preferred list and will be used by the volume controller to create the volume replica on the cstor pool scheduled on preferred node.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: cstor-csi-disk
provisioner: cstor.csi.openebs.io
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
parameters:
 replicaCount: "1"
 cstorPoolCluster: "cstor-disk-pool"
 cas-type: "cstor"
 cstorVolumePolicy: "csi-volume-policy" // policy created with replicaAffinity set to true
```

The `replicaAffinity` spec needs to be enabled via volume policy before provisioning the volume

```
apiVersion: cstor.openebs.io/v1
kind: CStorVolumePolicy
metadata:
 name: csi-volume-policy
 namespace: openebs
spec:
 provision:
   replicaAffinity: true
```

### Volume Target Pod Affinity

The Stateful workloads access the OpenEBS storage volume by connecting to the Volume Target Pod. Target Pod Affinity policy can be used to co-locate volume target pod on the same node as the workload. This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels.
For this labels need to be added to both, Application and volume Policy.
Given below is a sample YAML of `CStorVolumePolicy` having target-affinity label using `kubernetes.io/hostname` as a topologyKey in CStorVolumePolicy:

```
apiVersion: cstor.openebs.io/v1
kind: CStorVolumePolicy
metadata:
  name: csi-volume-policy
  namespace: openebs
spec:
  target:
    affinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: openebs.io/target-affinity
            operator: In
            values:
            - fio-cstor                              // application-unique-label
        topologyKey: kubernetes.io/hostname
        namespaces: ["default"]                      // application namespace
```

Set the label configured in volume policy, openebs.io/target-affinity: fio-cstor , on the app pod which will be used to find pods, by label, within the domain defined by topologyKey.

```
apiVersion: v1
kind: Pod
metadata:
  name: fio-cstor
  namespace: default
  labels:
    name: fio-cstor
    openebs.io/target-affinity: fio-cstor
```

### Volume Tunable

Performance tunings based on the workload can be set using Volume Policy. The list of tunings that can be configured are given below:

- **queueDepth:**<br /> This limits the ongoing IO count from iscsi client on Node to cStor target pod. The default value for this parameter is set at 32.
- **luworkers:** <br /> cStor target IO worker threads, sets the number of threads that are working on QueueDepth queue. The default value for this parameter is set at 6. In case of better number of cores and RAM, this value can be 16, which means 16 threads will be running for each volume.
- **zvolWorkers:**<br /> cStor volume replica IO worker threads, defaults to the number of cores on the machine. In case of better number of cores and RAM, this value can be 16.

Given below is a sample YAML that has the above parameters configured.

```
apiVersion: cstor.openebs.io/v1
kind: CStorVolumePolicy
metadata:
  name: csi-volume-policy
  namespace: openebs
spec:
  replica:
    zvolWorkers: "4"
  target:
    luWorkers: 6
    queueDepth: "32"
```

**Note:** These Policy tunable configurations can be changed for already provisioned volumes by editing the corresponding volume CStorVolumeConfig resources.

### Memory and CPU Resources QoS

CStorVolumePolicy can also be used to configure the volume Target pod resource requests and limits to ensure QoS. Given below is a sample YAML that configures the target container's resource requests and limits, and auxResources configuration for the sidecar containers.

_To know more about Resource configuration in Kubernetes, [click here](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)_.

```
apiVersion: cstor.openebs.io/v1
kind: CStorVolumePolicy
metadata:
  name: csi-volume-policy
  namespace: openebs
spec:
  target:
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    auxResources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

**Note:** These resource configuration(s) can be changed, for provisioned volumes, by editing the CStorVolumeConfig resource on per volume level.

An example to patch an already existing `CStorVolumeConfig` resource is given below,
Create a file, say patch-resources-cvc.yaml, that contains the changes and apply the patch on the resource.

```
spec:
  policy:
    target:
      resources:
        limits:
          cpu: 500m
          memory: 128Mi
        requests:
          cpu: 250m
          memory: 64Mi
      auxResources:
        limits:
          cpu: 500m
          memory: 128Mi
        requests:
          cpu: 250m
          memory: 64Mi
```

To apply the patch,

```
kubectl patch cvc -n openebs -p "$(cat patch-resources-cvc.yaml)" pvc-0478b13d-b1ef-4cff-813e-8d2d13bcb316 --type merge
```

### Toleration for target pod to ensure scheduling of target pods on tainted nodes {#toleration-for-target-pod}

This Kubernetes feature allows users to taint the node. This ensures no pods are be scheduled to it, unless a pod explicitly tolerates the taint. This Kubernetes feature can be used to reserve nodes for specific pods by adding labels to the desired node(s).

One such scenario where the above tunable can be used is: all the volume specific pods, to operate flawlessly, have to be scheduled on nodes that are reserved for storage.

Sample YAML:

```
apiVersion: cstor.openebs.io/v1
kind: CStorVolumePolicy
metadata:
  name: csi-volume-policy
  namespace: openebs
spec:
  replica: {}
  target:
    tolerations:
    - key: "key1"
      operator: "Equal"
      value: "value1"
      effect: "NoSchedule"
```

### Priority class for volume target deployment

Priority classes can help in controlling the Kubernetes schedulers decisions to favor higher priority pods over lower priority pods. The Kubernetes scheduler can even preempt lower priority pods that are running, so that pending higher priority pods can be scheduled. Setting pod priority also prevents lower priority workloads from impacting critical workloads in the cluster, especially in cases where the cluster starts to reach its resource capacity.
_To know more about PriorityClasses in Kubernetes, [click here](https://kubernetes.io/docs/concepts/configuration/pod-priority-preemption/#priorityclass)_.

**Note:** Priority class needs to be created before volume provisioning.

Given below is a sample CStorVolumePolicy YAML which utilises priority class.

```
apiVersion: cstor.openebs.io/v1
kind: CStorVolumePolicy
metadata:
  name: csi-volume-policy
  namespace: openebs
spec:
  provision:
    replicaAffinity: true
  target:
    priorityClassName: "storage-critical"
```
