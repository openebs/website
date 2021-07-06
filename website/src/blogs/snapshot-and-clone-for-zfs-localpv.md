---
title: Snapshot and Clone for ZFS LocalPV
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 03-03-2020
tags: OpenEBS, ZFS, Open Source
excerpt: In this post, we will focus on how we can create a snapshot and clone for volumes provisioned by ZFS-LocalPV.
---

Before reading this post, please read my previous [post](https://blog.openebs.io/openebs-dynamic-volume-provisioning-on-zfs-d8670720181d?__hstc=216392137.2b738ae93497639f7465a332e1aef247.1584602510099.1584602510099.1584602510099.1&amp;__hssc=216392137.1.1584602510100&amp;__hsfp=2870217423) for instructions on setting up the ZFS-LocalPV for dynamically provisioning the volumes on the ZFS storage. Here, we will focus on how we can create a snapshot and clone for volumes provisioned by ZFS-LocalPV.

#### **Prerequisite**

For clone, we need to have VolumeSnapshotDataSource support, which is in beta in Kubernetes 1.17. If you are using the Kubernetes version less than 1.17, you have to enable the VolumeSnapshotDataSource feature gate at kubelet and kube-apiserver.

#### **Snapshot**

We can create a snapshot of a volume that can be used further for creating a clone and for taking a backup. To create a snapshot, we have to first create a SnapshotClass just like a storage class where you can provide deletionPolicy as Retain or Delete.

    $ cat snapshotclass.yaml
    kind: VolumeSnapshotClass
    apiVersion: snapshot.storage.k8s.io/v1beta1
    metadata:
      name: zfspv-snapclass
      annotations:
        snapshot.storage.kubernetes.io/is-default-class: "true"
    driver: zfs.csi.openebs.io
    deletionPolicy: Delete

Apply the snapshotclass YAML:

    $ kubectl apply -f snapshotclass.yaml
    volumesnapshotclass.snapshot.storage.k8s.io/zfspv-snapclass created

Find a PVC for which snapshot has to be created

    $ kubectl get pvc
    NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    csi-zfspv   Bound    pvc-73402f6e-d054-4ec2-95a4-eb8452724afb   4Gi        RWO            openebs-zfspv   2m35s

Create the snapshot using the created SnapshotClass for the selected PVC

    $ cat snapshot.yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshot
    metadata:
      name: zfspv-snap
    spec:
      volumeSnapshotClassName: zfspv-snapclass
      source:
        persistentVolumeClaimName: csi-zfspv

Apply the snapshot.yaml

    $ kubectl apply -f snapshot.yaml
    volumesnapshot.snapshot.storage.k8s.io/zfspv-snap created

Please note that you have to create the snapshot in the same namespace where the PVC is created. Check the created snapshot resource, make sure readyToUsefield is true, before using this snapshot for any purpose.

    $ kubectl get volumesnapshot.snapshot
    NAME         AGE
    zfspv-snap   2m8s
    
    $ kubectl get volumesnapshot.snapshot zfspv-snap -o yaml
    apiVersion: snapshot.storage.k8s.io/v1beta1
    kind: VolumeSnapshot
    metadata:
      annotations:
        kubectl.kubernetes.io/last-applied-configuration: |
          {"apiVersion":"snapshot.storage.k8s.io/v1beta1","kind":"VolumeSnapshot","metadata":{"annotations":{},"name":"zfspv-snap","namespace":"default"},"spec":{"source":{"persistentVolumeClaimName":"csi-zfspv"},"volumeSnapshotClassName":"zfspv-snapclass"}}
      creationTimestamp: "2020-02-25T08:25:51Z"
      finalizers:
      - snapshot.storage.kubernetes.io/volumesnapshot-as-source-protection
      - snapshot.storage.kubernetes.io/volumesnapshot-bound-protection
      generation: 1
      name: zfspv-snap
      namespace: default
      resourceVersion: "447494"
      selfLink: /apis/snapshot.storage.k8s.io/v1beta1/namespaces/default/volumesnapshots/zfspv-snap
      uid: 3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd
    spec:
      source:
        persistentVolumeClaimName: csi-zfspv
      volumeSnapshotClassName: zfspv-snapclass
    status:
      boundVolumeSnapshotContentName: snapcontent-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd
      creationTime: "2020-02-25T08:25:51Z"
      readyToUse: true
      restoreSize: "0"

Check the OpenEBS resource for the created snapshot. Check, status should be Ready.

    $ kubectl get zfssnap -n openebs
    NAME                                            AGE
    snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd   3m32s
    
    $ kubectl get zfssnap snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd -n openebs -oyaml
    apiVersion: openebs.io/v1alpha1
    kind: ZFSSnapshot
    metadata:
      creationTimestamp: "2020-02-25T08:25:51Z"
      finalizers:
      - zfs.openebs.io/finalizer
      generation: 2
      labels:
        kubernetes.io/nodename: e2e1-node2
        openebs.io/persistent-volume: pvc-73402f6e-d054-4ec2-95a4-eb8452724afb
      name: snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd
      namespace: openebs
      resourceVersion: "447328"
      selfLink: /apis/openebs.io/v1alpha1/namespaces/openebs/zfssnapshots/snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd
      uid: 6142492c-3785-498f-aa4a-569ec6c0e2b8
    spec:
      capacity: "4294967296"
      fsType: zfs
      ownerNodeID: e2e1-node2
      poolName: test-pool
      volumeType: DATASET
    status:
      state: Ready

We can go to the node and confirm that snapshot has been created:

    # zfs list -t all
    NAME                                                                                               USED  AVAIL  REFER  MOUNTPOINT
    test-pool                                                                                          818K  9.63G    24K  /test-pool
    test-pool/pvc-73402f6e-d054-4ec2-95a4-eb8452724afb                                                  24K  4.00G    24K  /var/lib/kubelet/pods/3862895a-8a67-446e-80f7-f3c18881e391/volumes/kubernetes.io~csi/pvc-73402f6e-d054-4ec2-95a4-eb8452724afb/mount
    test-pool/pvc-73402f6e-d054-4ec2-95a4-eb8452724afb@snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd     0B      -    24K  -

#### **Clone**

We can create a clone volume from a snapshot and use that volume for some application. We can create a PVC YAML and mention the snapshot name in the datasource.

    $ cat clone.yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: zfspv-clone
    spec:
      storageClassName: openebs-zfspv
      dataSource:
        name: zfspv-snap
        kind: VolumeSnapshot
        apiGroup: snapshot.storage.k8s.io
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 4Gi

The above YAML says that create a volume from the snapshot zfspv-snap. Applying the above YAML will create a clone volume on the same node where the original volume is present. The newly created clone PV will also be there on the same node where the original PV is there. Apply the clone YAML

    $ kubectl apply -f clone.yaml 
    persistentvolumeclaim/zfspv-clone created

Note that the clone PVC should also be of the same size as that of the original volume. Currently resize is not supported. Also, note that the poolname should also be same, as across the ZPOOL clone is not supported. So, if you are using a separate storageclass for the clone PVC, please make sure it refers to the same ZPOOL.

    $ kubectl get pvc
    NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    csi-zfspv     Bound    pvc-73402f6e-d054-4ec2-95a4-eb8452724afb   4Gi        RWO            openebs-zfspv   13m
    zfspv-clone   Bound    pvc-c095aa52-8d09-4bbe-ac3c-bb88a0e7be19   4Gi        RWO            openebs-zfspv   34s

We can see in the above output that zfspv-clone claim has been created and it is bound. Also, we can check the zfs list on node and verify that clone volume is created.

    $ zfs list -t all
    NAME                                                                                               USED  AVAIL  REFER  MOUNTPOINT
    test-pool                                                                                          834K  9.63G    24K  /test-pool
    test-pool/pvc-73402f6e-d054-4ec2-95a4-eb8452724afb                                                  24K  4.00G    24K  /var/lib/kubelet/pods/3862895a-8a67-446e-80f7-f3c18881e391/volumes/kubernetes.io~csi/pvc-73402f6e-d054-4ec2-95a4-eb8452724afb/mount
    test-pool/pvc-73402f6e-d054-4ec2-95a4-eb8452724afb@snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd     0B      -    24K  -
    test-pool/pvc-c095aa52-8d09-4bbe-ac3c-bb88a0e7be19                                                   0B  9.63G    24K  none

The clone volume will have properties same as snapshot properties which are the properties when that snapshot has been created. The ZFSVolume object for the clone volume will be something like below:

    $ kubectl describe zv pvc-c095aa52-8d09-4bbe-ac3c-bb88a0e7be19 -n openebs
    Name:         pvc-c095aa52-8d09-4bbe-ac3c-bb88a0e7be19
    Namespace:    openebs
    Labels:       kubernetes.io/nodename=e2e1-node2
    Annotations:  none
    API Version:  openebs.io/v1alpha1
    Kind:         ZFSVolume
    Metadata:
      Creation Timestamp:  2020-02-25T08:34:25Z
      Finalizers:
        zfs.openebs.io/finalizer
      Generation:        1
      Resource Version:  448930
      Self Link:         /apis/openebs.io/v1alpha1/namespaces/openebs/zfsvolumes/pvc-c095aa52-8d09-4bbe-ac3c-bb88a0e7be19
      UID:               e38a9f9a-fb76-466b-a6f9-8d070e0bec6f
    Spec:
      Capacity:       4294967296
      Fs Type:        zfs
      Owner Node ID:  e2e1-node2
      Pool Name:      test-pool
      Snapname:       pvc-73402f6e-d054-4ec2-95a4-eb8452724afb@snapshot-3cbd5e59-4c6f-4bd6-95ba-7f72c9f12fcd
      Volume Type:    DATASET
    Events:           none

Here you can note that this resource has Snapname field which tells that this volume is created from that snapshot.

I hope you found this post useful. Feel free to contact me with any feedback or questions by using the comment section below.
