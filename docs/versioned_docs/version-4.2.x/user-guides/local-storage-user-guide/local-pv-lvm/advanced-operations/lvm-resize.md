---
id: lvm-resize
title: Resize
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Resize
 - Advanced Operations
description: This section talks about the advanced operations that can be performed in the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage.  
---

We can resize the volume by updating the PVC yaml to the desired size and applying it. The LVM Driver will take care of expanding the volume via lvextend command using "-r" option which will resize the filesystem.

:::note
Online Volume Expansion for `Block` mode and `btrfs` Filesystem mode is supported only from **K8s 1.23+** version.
:::

For resize, storageclass that provisions the PVC must support resize. We should have allowVolumeExpansion as true in storageclass.

```
$ cat sc.yaml

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
allowVolumeExpansion: true
parameters:
  fstype: "ext4"
  volgroup: "lvmpv-vg"
provisioner: local.csi.openebs.io


$ kubectl apply -f sc.yaml
storageclass.storage.k8s.io/openebs-lvmpv created
```

Create the PVC using the above storage class.

```
$ cat pvc.yaml

kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi


$ kubectl apply -f pvc.yaml
persistentvolumeclaim/csi-lvmpv created
```

OpenEBS LVM driver supports Online Volume expansion, which means that we can expand the volume even if volume is being used by the application and we also do not need to restart the application to use the expanded volume, the LVM Driver will take care of making the space available to it. 

:::note
File system expansion does not happen until an application pod references the resized volume, so if no pods referencing the volume are running, file system expansion will not happen.
:::

Deploy the application using the PVC. Here is a sample yaml for the application:

```
$ cat fio.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fio
  labels:
    name: fio
spec:
  replicas: 1
  selector:
    matchLabels:
      name: fio
  template:
    metadata:
      labels:
        name: fio
    spec:
      containers:
        - resources:
          name: perfrunner
          image: ljishen/fio
          imagePullPolicy: IfNotPresent
          command: ["/bin/sh"]
          args: ["-c", "while true ;do sleep 50; done"]
          volumeMounts:
            - mountPath: /datadir
              name: fio-vol
      volumes:
        - name: fio-vol
          persistentVolumeClaim:
            claimName: csi-lvmpv


$ kubectl apply -f fio.yaml
deployment.apps/fio created

$ kubectl get po
NAME                   READY   STATUS    RESTARTS   AGE
fio-5b7884bc7b-4mssk   1/1     Running   0          40s

```

Check the current PVC status.

```
$ kubectl get pvc
NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
csi-lvmpv   Bound    pvc-966b0749-5dea-442f-a584-013cf5d25201   4Gi        RWO            openebs-lvmpv   85s

```
Exec into the application pod and check the size.

```
# df -h /datadir/
Filesystem                                                       Size  Used Avail Use% Mounted on
/dev/mapper/lvmvg-pvc--966b0749--5dea--442f--a584--013cf5d25201  3.9G   16M  3.9G   1% /datadir
```

Deploy the application using the PVC which supports volume expansion. Once the application pod is deployed, we will expand the PVC to 5Gi from 4Gi. Edit the PVC yaml and update the size to 5Gi and apply it:

```
$ cat pvc.yaml

kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

Apply the above yaml which will resize the volume.

```
$ kubectl apply -f pvc.yaml
persistentvolumeclaim/csi-lvmpv configured

```

Check the PVC yaml.

```yaml
$ kubectl get pvc csi-lvmpv -oyaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"PersistentVolumeClaim","metadata":{"annotations":{},"name":"csi-lvmpv","namespace":"default"},"spec":{"accessModes":["ReadWriteOnce"],"r
esources":{"requests":{"storage":"5Gi"}},"storageClassName":"openebs-lvmpv"}}
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: lvm.csi.openebs.io
  creationTimestamp: "2020-03-06T06:40:08Z"
  finalizers:
  - kubernetes.io/pvc-protection
  name: csi-lvmpv
  namespace: default
  resourceVersion: "2547405"
  selfLink: /api/v1/namespaces/default/persistentvolumeclaims/csi-lvmpv
  uid: 966b0749-5dea-442f-a584-013cf5d25201
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: openebs-lvmpv
  volumeMode: Filesystem
  volumeName: pvc-966b0749-5dea-442f-a584-013cf5d25201
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 4Gi
  conditions:
  - lastProbeTime: null
    lastTransitionTime: "2020-03-06T06:41:22Z"
    message: Waiting for user to (re-)start a pod to finish file system resize of
      volume on node.
    status: "True"
    type: FileSystemResizePending
  phase: Bound

```

See in the message that it is waiting on FileSystemResizePending. The resize request will go to the node where the application pod is running. The LVM driver node agent will resize the filesytem for the application. Keep checking the PVC yaml for FileSystemResizePending to go away, once PVC is resized, the yaml will look like this:

```yaml
$ kubectl get pvc csi-lvmpv -oyaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"PersistentVolumeClaim","metadata":{"annotations":{},"name":"csi-lvmpv","namespace":"default"},"spec":{"accessModes":["ReadWriteOnce"],"resources":{"requests":{"storage":"5Gi"}},"storageClassName":"openebs-lvmpv"}}
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: lvm.csi.openebs.io
  creationTimestamp: "2020-03-06T06:40:08Z"
  finalizers:
  - kubernetes.io/pvc-protection
  name: csi-lvmpv
  namespace: default
  resourceVersion: "2547449"
  selfLink: /api/v1/namespaces/default/persistentvolumeclaims/csi-lvmpv
  uid: 966b0749-5dea-442f-a584-013cf5d25201
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: openebs-lvmpv
  volumeMode: Filesystem
  volumeName: pvc-966b0749-5dea-442f-a584-013cf5d25201
status:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 5Gi
  phase: Bound
```

```
$ kubectl get pvc
NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
csi-lvmpv   Bound    pvc-966b0749-5dea-442f-a584-013cf5d25201   5Gi        RWO            openebs-lvmpv   28m
```

Also, we can exec into the application pod and verify the same:

```
# df -h /datadir/
Filesystem                                                       Size  Used Avail Use% Mounted on
/dev/mapper/lvmvg-pvc--966b0749--5dea--442f--a584--013cf5d25201  4.9G   16M  4.9G   1% /datadir

```
As we can see the volume mount point `/datadir` is showing that it has been resized.