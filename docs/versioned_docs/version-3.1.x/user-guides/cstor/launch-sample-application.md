---
id: launch-sample-application
title: cStor User Guide - Deploying a sample application
keywords:
  - cStor csi
  - cStor User Guide
  - Deploying a sample application
description: This user guide will guide you in deploying your sample application in a cStor setup.
---

This user guide will guide you in deploying your sample application in a cStor setup.

### Launch Sample Application

- [Deploying a sample application](#deploying-a-sample-application)

## Deploying a sample application

To deploy a sample application using the above created CSPC and StorageClass, a PVC, that utilises the created StorageClass, needs to be deployed. Given below is an example YAML for a PVC which uses the SC created earlier.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-pvc
spec:
  storageClassName: cstor-csi-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

Apply the above PVC yaml to dynamically create volume and verify that the PVC has been successfully created and bound to a PersistentVolume (PV).

```
kubectl get pvc
```

Sample Output:

```shell hideCopy
NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
cstor-pvc        Bound    pvc-f1383b36-2d4d-4e9f-9082-6728d6c55bd1   5Gi        RWO            cstor-csi-disk   12s
```

Now, to deploy an application using the above created PVC specify the `claimName` parameter under `volumes`.

Given below is a sample busybox application YAML that uses the PVC created earlier.

```
apiVersion: v1
kind: Pod
metadata:
  name: busybox
  namespace: default
spec:
  containers:
  - command:
       - sh
       - -c
       - 'date >> /mnt/openebs-csi/date.txt; hostname >> /mnt/openebs-csi/hostname.txt; sync; sleep 5; sync; tail -f /dev/null;'
    image: busybox
    imagePullPolicy: Always
    name: busybox
    volumeMounts:
    - mountPath: /mnt/openebs-csi
      name: demo-vol
  volumes:
  - name: demo-vol
    persistentVolumeClaim:
      claimName: cstor-pvc
```

Apply the above YAML.
Verify that the pod is running and is able to write data to the volume.

```
kubectl get pods
```

Sample Output:

```shell hideCopy
NAME      READY   STATUS    RESTARTS   AGE
busybox   1/1     Running   0          97s
```

The example busybox application will write the current date into the mounted path, i.e, _/mnt/openebs-csi/date.txt_ when it starts. To verify, exec into the busybox container.

```
kubectl exec -it busybox -- cat /mnt/openebs-csi/date.txt
```

Sample Output:

```shell hideCopy
Fri May 28 05:00:31 UTC 2021
```
