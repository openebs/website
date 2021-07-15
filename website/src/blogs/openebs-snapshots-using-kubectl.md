---
title: OpenEBS Snapshots using Kubectl
author: Prateek Pandey
author_info: Contributor and Maintainer @OpenEBS. Software Developer at @mayadata_inc. Open Source Enthusiast
date: 14-12-2018
tags: Clone, Kubernetes, Snapshot, Storage
excerpt: Kubernetes has a very “pluggable” method for adding your own logic in the form of a controller using CustomResourceDefinition(CRD).
---

In Kubernetes 1.8, many of the changes involve storage. For example, volume snapshotting API has been released as a ‘prototype’ level. It is external to core Kubernetes API’s, and you can find the project under the snapshot subdirectory of the [kubernetes-incubator/external-storage](https://github.com/kubernetes-incubator/external-storage) repository. There is, however, an ongoing proposal to add them as a core Kubernetes APIs here. For a detailed explanation of the implementation of volume snapshotting, you can read the design proposal here. The prototype currently supports GCE PD, AWS EBS, OpenStack Cinder, Gluster, Kubernetes hostPath, and OpenEBS volumes. It is important to note that aside from hostPath volumes, the logic for snapshotting a volume is implemented by cloud providers and core Kubernetes storage providers. The purpose of volume snapshotting in Kubernetes is to provide a common API for negotiating with different cloud providers in order to take snapshots and restore it as new persistent volume.

Kubernetes has a very `pluggable` method for adding your own logic in the form of a controller using [CustomResourceDefinition](https://kubernetes.io/docs/concepts/api-extension/custom-resources/#customresourcedefinitions)(CRD). VolumeSnapshot and VolumeSnapshotData are the two new CustomResources, and will be registered with the Kubernetes API server. This [user guide](https://github.com/kubernetes-incubator/external-storage/blob/master/snapshot/doc/user-guide.md#lifecycle-of-a-volume-snapshot-and-volume-snapshot-data) provides an overview of the lifecycle of these two resources. **`Snapshot-controller`** will create a CRD for each of these two CustomResources when it starts and will also watch for VolumeSnapshot resources. It will take snapshots of the volumes based on the referred snapshot plugin. **`Snapshot-provisioner`** will be used to restore a snapshot as a new persistent volume via dynamic provisioning.

The OpenEBS operator will deploy each **`Snapshot-controller`** and **`Snapshot-provisioner`** container inside the single pod called snapshot-controller.

    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: snapshot-controller-runner
      namespace: default
    ---
    apiVersion: rbac.authorization.k8s.io/v1beta1
    kind: ClusterRole
    metadata:
      name: snapshot-controller-role
      namespace: default
    rules:
      - apiGroups: [""]
        resources: ["pods"]
        verbs: ["get", "list", "delete"]
      - apiGroups: [""]
        resources: ["persistentvolumes"]
        verbs: ["get", "list", "watch", "create", "delete"]
      - apiGroups: [""]
        resources: ["persistentvolumeclaims"]
        verbs: ["get", "list", "watch", "update"]
      - apiGroups: ["storage.k8s.io"]
        resources: ["storageclasses"]
        verbs: ["get", "list", "watch"]
      - apiGroups: [""]
        resources: ["events"]
        verbs: ["list", "watch", "create", "update", "patch"]
      - apiGroups: ["apiextensions.k8s.io"]
        resources: ["customresourcedefinitions"]
        verbs: ["create", "list", "watch", "delete"]
      - apiGroups: ["volumesnapshot.external-storage.k8s.io"]
        resources: ["volumesnapshots"]
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
      - apiGroups: ["volumesnapshot.external-storage.k8s.io"]
        resources: ["volumesnapshotdatas"]
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
      - apiGroups: [""]
        resources: ["services"]
        verbs: ["get"]
    ---
    kind: ClusterRoleBinding
    apiVersion: rbac.authorization.k8s.io/v1beta1
    metadata:
      name: snapshot-controller
      namespace: default
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: ClusterRole
      name: snapshot-controller-role
    subjects:
    - kind: ServiceAccount
      name: snapshot-controller-runner
      namespace: default
    ---
    kind: Deployment
    apiVersion: extensions/v1beta1
    metadata:
      name: snapshot-controller
      namespace: default
    spec:
      replicas: 1
      strategy:
        type: Recreate
      template:
        metadata:
          labels:
            app: snapshot-controller
        spec:
          serviceAccountName: snapshot-controller-runner
          containers:
            - name: snapshot-controller
              image: openebs/snapshot-controller:ci
              imagePullPolicy: Always
            - name: snapshot-provisioner
              image: openebs/snapshot-provisioner:ci
              imagePullPolicy: Always

Once **`Snapshot-controller`** is running, you will be able to see the created CustomResourceDefinitions(CRD).

    $ kubectl get crd
    NAME                                                         AGE
    volumesnapshotdatas.volumesnapshot.external-storage.k8s.io   1m
    volumesnapshots.volumesnapshot.external-storage.k8s.io       1m

### Create Snapshot:

To create a snapshot, let’s now create the `PersistentVolumeClaim` to be snapshotted.

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: demo-vol1-claim
      namespace: default
    spec:
      storageClassName: openebs-standard
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5G

Note that this uses the openebs-standard StorageClass, which will dynamically provision an OpenEBS PersistentVolume. Let’s now create a Pod that will create data in the volume. We will take a snapshot of this data and restore it later. For example, in a busy-box application Pod, create date.txt and hostname.txt files in a mounted openEBS volume.

    apiVersion: v1
    kind: Pod
    metadata:
     name: busybox
     namespace: default
    spec:
     containers:
     — command:
     — sh
     — -c
     — ‘date > /mnt/store1/date.txt; hostname >> /mnt/store1/hostname.txt; tail -f /dev/null;’
     image: busybox
     imagePullPolicy: Always
     name: busybox
     volumeMounts:
     — mountPath: /mnt/store1
     name: demo-vol1
     volumes:
     — name: demo-vol1
     persistentVolumeClaim:
     claimName: demo-vol1-claim

Once the busybox pod is in a running state, we are ready to take a snapshot. After we create the VolumeSnapshot resource below, the snapshot-controller will attempt to create the snapshot by interacting with the OpenEBS snapshot APIs. If successful, the VolumeSnapshot resource is bound to a corresponding VolumeSnapshotData resource. To create the snapshot, we need to reference the PersistentVolumeClaim name in the snapshot spec that references the data we want to capture.

    $ cat snapshot.yaml
    apiVersion: volumesnapshot.external-storage.k8s.io/v1
    kind: VolumeSnapshot
    metadata:
      name: snapshot-demo
      namespace: default
    spec:
      persistentVolumeClaimName: demo-vol1-claim
    
    $ kubectl create -f snapshot.yaml
    volumesnapshot "snapshot-demo" created
    $ kubectl get volumesnapshot 
    NAME            AGE 
    snapshot-demo   18s

The conditions listed towards the bottom of the output below show that our snapshot was indeed created successfully. We can also check the snapshot controller’s logs to verify this.

    $ kubectl get volumesnapshot -o yaml
     apiVersion: v1
     items:
       - apiVersion: volumesnapshot.external-storage.k8s.io/v1
      kind: VolumeSnapshot
      metadata:
        clusterName: ""
        creationTimestamp: 2018-01-24T06:58:38Z
        generation: 0
        labels:
          SnapshotMetadata-PVName: pvc-f1c1fdf2-00d2-11e8-acdc-54e1ad0c1ccc
          SnapshotMetadata-Timestamp: "1516777187974315350"
        name: snapshot-demo
        namespace: default
        resourceVersion: "1345"
        selfLink: /apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/fastfurious
        uid: 014ec851-00d4-11e8-acdc-54e1ad0c1ccc
      spec:
        persistentVolumeClaimName: demo-vol1-claim
        snapshotDataName: k8s-volume-snapshot-2a788036-00d4-11e8-9aa2-54e1ad0c1ccc
      status:
        conditions:
        - lastTransitionTime: 2018-01-24T06:59:48Z
          message: Snapshot created successfully
          reason: ""
          status: "True"
          type: Ready
        creationTimestamp: null

We can now look at the corresponding VolumeSnapshotData resource that was created. Notice the reference to the openebsVolume snapshot under spec, which also references the VolumeSnapshot resource we created and the PersistentVolume that from which the snapshot was taken. This PersistentVolume was dynamically provisioned by openebs-provisioner when we created our demo-vol1-claim PersistentVolumeClaim earlier.

    kubectl get volumesnapshotdata -o yaml
    apiVersion: volumesnapshot.external-storage.k8s.io/v1
      kind: VolumeSnapshotData
      metadata:
        clusterName: ""
        creationTimestamp: 2018-01-24T06:59:48Z
        name: k8s-volume-snapshot-2a788036-00d4-11e8-9aa2-54e1ad0c1ccc
        namespace: ""
        resourceVersion: "1344"
        selfLink: /apis/volumesnapshot.external-storage.k8s.io/v1/k8s-volume-snapshot-2a788036-00d4-11e8-9aa2-54e1ad0c1ccc
        uid: 2a789f5a-00d4-11e8-acdc-54e1ad0c1ccc
      spec:
        openebsVolume:
          snapshotId: pvc-f1c1fdf2-00d2-11e8-acdc 54e1ad0c1ccc_1516777187978793304
        persistentVolumeRef:
          kind: PersistentVolume
          name: pvc-f1c1fdf2-00d2-11e8-acdc-54e1ad0c1ccc
        volumeSnapshotRef:
          kind: VolumeSnapshot
          name: default/snapshot-demo
      status:
        conditions:
        - lastTransitionTime: null
          message: Snapshot created successfully
          reason: ""
          status: "True"
          type: Ready
        creationTimestamp: null
    kind: List
    metadata:
      resourceVersion: ""
      selfLink: ""

### Restore Snapshot:

Now that we have created a snapshot, we can restore it to a new PVC. To do this, we need to create a special StorageClass implemented by snapshot-provisioner. We will then create a PersistentVolumeClaim referencing this StorageClass to dynamically provision a new PersistentVolume. An annotation on the PersistentVolumeClaim will communicate to **`Snapshot-provisioner`** where to find the information it needs to deal with the OpenEBS API server to restore the snapshot. The StorageClass can be defined according to the code below.  Here, the provisioner field in the spec defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked.

    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: snapshot-promoter
    provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter

We can now create a PersistentVolumeClaim that will use the StorageClass to dynamically provision a PersistentVolume that contains the info of our snapshot. The annotation field snapshot.alpha.kubernetes.io/snapshot refers to the VolumeSnapshot object. Snapshot-provisioner will use this resource to obtain the information it needs to perform the snapshot restore. After this, snapshot-provisioner will provision a PersistentVolume containing the contents of the snapshot-demo snapshot

    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: demo-snap-vol-claim
      annotations:
        snapshot.alpha.kubernetes.io/snapshot: snapshot-demo
    spec:
      storageClassName: snapshot-promoter
      accessModes: ReadWriteOnce
      resources:
        requests:
          storage: 5Gi

We can check the state of demo-snap-vol-claim to see if it is Bound or not. We can also view the snapshot-provisioner logs to verify that the snapshot was restored successfully.

    $ kubectl logs snapshot-controller-66f7c56c4-ptjmb-c snapshot-provisioner 
    ... 
    ... 
    I1104 11:59:10.563990       1 controller.go:813] volume "pvc-8eed96e4-c157-11e7-8910-42010a840164" for claim "default/demo-snap-vol-claim" created 
    I1104 11:59:10.987620  1 controller.go:830] volume "pvc-8eed96e4-c157-11e7-8910-42010a840164" for claim "default/demo-snap-vol-claim" saved 
    I1104 11:59:10.987740  1 controller.go:866] volume "pvc-8eed96e4-c157-11e7-8910-42010a840164" provisioned for claim "default/demo-snap-vol-claim"

Now, let’s mount the `demo-snap-vol-claim` PersistentVolumeClaim onto a busybox-snapshot Pod to check whether the snapshot was restored properly. After the busybox-snapshot pod is in a running state, we can check the integrity of the files that were created before taking the snapshot.

    apiVersion: v1
    kind: Pod
    metadata:
      name: busybox-snapshot
      namespace: default
    spec:
      containers:
      - command:
           - sh
           - -c
           - 'tail -f /dev/null'
        image: busybox
        imagePullPolicy: Always
        name: busybox
        volumeMounts:
        - mountPath: /mnt/store2
          name: demo-snap-vol
      volumes:
      - name: demo-snap-vol
        persistentVolumeClaim:
          claimName: demo-snap-vol-claim

**Clean-Up:** 

We can delete the VolumeSnapshot resource, which will also delete the corresponding VolumeSnapshotData resource from K8s. This will not affect any PersistentVolumeClaims or PersistentVolumes we have already provisioned using the snapshot. Conversely, deleting any PersistentVolumeClaims or PersistentVolumes that have been used to create the snapshot or have been provisioned using a snapshot will not delete the snapshot from the OpenEBS backend. As such, we must delete them manually.
