---
id: jiva-launch
title: Launch
keywords: 
  - Jiva Applications
  - Jiva Launch
---
This user guide will guide you in deploying your sample application in a Jiva setup.

### Deploying a sample application

To deploy a sample application using the previously created StorageClass, a PVC, that utilises the created StorageClass, needs to be deployed. Given below is an example YAML for a PVC which uses the SC created earlier.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: example-jiva-csi-pvc
spec:
  storageClassName: openebs-jiva-csi-sc
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
```

Apply the above PVC yaml to dynamically create volume and verify that the PVC has been successfully created and bound to a PersistentVolume (PV).

```
kubectl get pvc
```

Sample Output:

```shell hideCopy
NAME                   STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
example-jiva-csi-pvc   Bound    pvc-ffc1e885-0122-4b5b-9d36-ae131717a77b   4Gi        RWO            openebs-jiva-csi-sc    1m
```

Also, verify if volume is ready to serve IOs.

Sample Command:
```
kubectl get jivavolume pvc-ffc1e885-0122-4b5b-9d36-ae131717a77b -n openebs
```

Sample Output:

```shell hideCopy
NAME                                       REPLICACOUNT   PHASE   STATUS
pvc-ffc1e885-0122-4b5b-9d36-ae131717a77b   1              Ready   RW
```

Now, to deploy an application using the above created PVC specify the `claimName` parameter under volumes.

```
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: busybox
    labels:
      app: busybox
  spec:
    replicas: 1
    strategy:
      type: RollingUpdate
    selector:
      matchLabels:
        app: busybox
    template:
      metadata:
        labels:
          app: busybox
      spec:
        containers:
        - resources:
            limits:
              cpu: 0.5
          name: busybox
          image: busybox
          command: ['sh', '-c', 'echo Container 1 is Running ; sleep 3600']
          imagePullPolicy: IfNotPresent
          ports:
          - containerPort: 3306
            name: busybox
          volumeMounts:
          - mountPath: /var/lib/mysql
            name: demo-vol1
        volumes:
        - name: demo-vol1
          persistentVolumeClaim:
            claimName: example-jiva-csi-pvc
```

Apply the above YAML. Verify that the pod is running.

```
kubectl get pods
```

Sample Output:

```shell hideCopy
NAME      READY   STATUS    RESTARTS   AGE
busybox   1/1     Running   0          97s
```