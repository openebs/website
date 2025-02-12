---
id: lvm-raw-block-volume
title: Raw Block Volume
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Raw Block Volume
 - Advanced Operations
description: This section talks about the advanced operations that can be performed in the OpenEBS Local Persistent Volumes (PV) backed by the LVM Storage. 
---

Some specialized applications require direct access to a block device because, for example, the file system layer introduces unneeded overhead. The most common case is databases, which prefer to organize their data directly on the underlying storage. Raw block devices are also commonly used by any software which itself implements some kind of storage service (software defined storage systems).

As it becomes more common to run database software and storage infrastructure software inside of Kubernetes, the need for raw block device support in Kubernetes becomes more important.

To provision the raw block volume, we should create a storageclass without any fstype as Raw block volume does not have any fstype.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: lvmpv-block
  allowVolumeExpansion: true
  parameters:
    volgroup: "lvmpv-vg"
    provisioner: local.csi.openebs.io
```

Now we can create a PVC with volumeMode as Block to request for a Raw Block Volume:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: block-claim
spec:
  volumeMode: Block
  storageClassName: lvmpv-block
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

Now we can deploy the application using the above PVC, the LVM-LocalPV driver will attach a Raw block device at the given mount path. We can provide the device path using volumeDevices in the application yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fiob
spec:
  replicas: 1
  selector:
    matchLabels:
      name: fiob
  template:
    metadata:
      labels:
        name: fiob
    spec:
      containers:
        - resources:
          name: perfrunner
          image: openebs/tests-fio
          imagePullPolicy: IfNotPresent
          command: ["/bin/bash"]
          args: ["-c", "while true ;do sleep 50; done"]
          volumeDevices:
            - devicePath: /dev/xvda
              name: storage
      volumes:
        - name: storage
          persistentVolumeClaim:
            claimName: block-claim
```

As requested by application, a Raw block volume will be visible to it at the path /dev/xvda inside the pod.

```
volumeDevices:
  - devicePath: /dev/xvda
  name: storage
```