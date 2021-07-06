---
title: Resizing the ZFS-LocalPV Volumes
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 26-03-2020
tags: LocalPV, OpenEBS
excerpt: In this post, we will focus on how we can resize the volumes provisioned by ZFS-LocalPV without restarting the application.
---

Before reading this post, please read my previous [post](https://blog.openebs.io/openebs-dynamic-volume-provisioning-on-zfs-d8670720181d?__hstc=216392137.7dc0753f698b104ea002a16b84268b54.1580207831486.1580207831486.1580207831486.1&amp;__hssc=216392137.1.1580207831487&amp;__hsfp=818904025) for instructions on setting up the ZFS-LocalPV for dynamically provisioning the volumes on the ZFS storage. Here, we will focus on how we can resize the volumes provisioned by ZFS-LocalPV without restarting the application.

### **Prerequisite**

Please make sure you have installed the ZFS-LocalPV Driver version v0.5 or later:

    $ kubectl apply -f
    https://raw.githubusercontent.com/openebs/zfs-localpv/v0.5.x/deploy/zfs-operator.yaml

Make sure you are using k8s version 1.16+ as this feature is in beta. In Kubernetes 1.14 and 1.15, this feature was in alpha status and required enabling the following feature gate:

    --feature-gates=ExpandCSIVolumes=true

Also for Kubernetes 1.14 and 1.15, online expansion feature gate has to be enabled explicitly:

    --feature-gates=ExpandInUsePersistentVolumes=true

### **Introduction**

The ZFS-LocalPV CSI driver supports ONLINE volume expansion, which means, if the application is using the volume, you can perform the volume expansion. This also means that the volume expansion will be performed when an application is using that volume. So, if an application is not running and we have performed the resize operation, the Driver will wait for the application to start for the resize operation to complete.

### **Setup**

Create the StorageClass with allowVolumeExpansion as true. We can resize only those volumes which are using the StorageClass with this flag as true.

    $ cat sc.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
     name: openebs-zfspv
    allowVolumeExpansion: true
    parameters:
     poolname: "zfspv-pool"
    provisioner: zfs.csi.openebs.io
    $ kubectl apply -f sc.yaml
    storageclass.storage.k8s.io/openebs-zfspv created

Create the PVC using the above StorageClass:

    $ cat pvc.yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
     name: csi-zfspv
    spec:
     storageClassName: openebs-zfspv
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5Gi
    $ kubectl apply -f pvc.yaml
    persistentvolumeclaim/csi-zfspv created

Now deploy the application using the above PVC. Here, we will be using below Percona application:

    $ cat percona.yaml
    apiVersion: v1
    kind: ConfigMap
    metadata:
     annotations:
     name: sqltest
     namespace: default
    data:
     sql-test.sh: |
       #!/bin/bash
    DB_PREFIX="Inventory"
       DB_SUFFIX=`echo $(mktemp) | cut -d '.' -f 2`
       DB_NAME="${DB_PREFIX}_${DB_SUFFIX}"
    echo -e "\nWaiting for mysql server to start accepting connections.."
       retries=10;wait_retry=30
       for i in `seq 1 $retries`; do
         mysql -uroot -pk8sDem0 -e 'status' > /dev/null 2>&1
         rc=$?
         [ $rc -eq 0 ] && break
         sleep $wait_retry
       done
    if [ $rc -ne 0 ];
       then
         echo -e "\nFailed to connect to db server after trying for $(($retries * $wait_retry))s, exiting\n"
         exit 1
       fi
       mysql -uroot -pk8sDem0 -e "CREATE DATABASE $DB_NAME;"
       mysql -uroot -pk8sDem0 -e "CREATE TABLE Hardware (id INTEGER, name VARCHAR(20), owner VARCHAR(20),description VARCHAR(20));" $DB_NAME
       mysql -uroot -pk8sDem0 -e "INSERT INTO Hardware (id, name, owner, description) values (1, "dellserver", "basavaraj", "controller");" $DB_NAME
       mysql -uroot -pk8sDem0 -e "DROP DATABASE $DB_NAME;"
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
     name: percona
     labels:
       name: percona
    spec:
     replicas: 1
     selector:
       matchLabels:
         name: percona
     template:
       metadata:
         labels:
           name: percona
       spec:
         containers:
           - resources:
             name: percona
             image: openebs/tests-custom-percona:latest
             imagePullPolicy: IfNotPresent
             args:
               - "--ignore-db-dir"
               - "lost+found"
             env:
               - name: MYSQL_ROOT_PASSWORD
                 value: k8sDem0
             ports:
               - containerPort: 3306
                 name: percona
             volumeMounts:
               - mountPath: /var/lib/mysql
                 name: demo-vol1
               - mountPath: /sql-test.sh
                 subPath: sql-test.sh
                 name: sqltest-configmap
             livenessProbe:
               exec:
                 command: ["bash", "sql-test.sh"]
               initialDelaySeconds: 30
               periodSeconds: 1
               timeoutSeconds: 10
         volumes:
           - name: demo-vol1
             persistentVolumeClaim:
               claimName: csi-zfspv
           - name: sqltest-configmap
             configMap:
               name: sqltest
    ---
    apiVersion: v1
    kind: Service
    metadata:
     name: percona-mysql
     labels:
       name: percona-mysql
    spec:
     ports:
       - port: 3306
         targetPort: 3306
     selector:
         name: percona

Apply the above YAML to deploy the Percona application:

    $ kubectl apply -f percona.yaml
    configmap/sqltest created
    deployment.apps/percona created
    service/percona-mysql created

Now the setup is ready and the application is running:

    $ kubectl get po
    NAME                      READY   STATUS    RESTARTS   AGE
    percona-9449b4b9c-48qpw   1/1     Running   0          38s

Check the volume size at the application size:

    $ kubectl exec -it percona-9449b4b9c-48qpw bash
    root@percona-9449b4b9c-48qpw:/# df -h
    Filesystem      Size  Used Avail Use% Mounted on
    none             91G   18G   69G  21% /
    tmpfs           3.9G     0  3.9G   0% /dev
    tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
    /dev/sda1        91G   18G   69G  21% /etc/hosts
    shm              64M     0   64M   0% /dev/shm
    /dev/zd0        4.9G  234M  4.7G   5% /var/lib/mysql
    tmpfs           3.9G   12K  3.9G   1% /run/secrets/kubernetes.io/serviceaccount
    tmpfs           3.9G     0  3.9G   0% /sys/firmware

From above o/p we can see that the volume has been created of size 5Gi and it is attached to the application at the given mount point (/var/lib/mysql).

### **Volume Resize**

Here, we just have to update the PVC with the new size and apply it. Please note that volume shrinking is not supported, so you have to change the size to a higher value. Here, in our case, we will update the size to 8Gi

    $ cat pvc.yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
     name: csi-zfspv
    spec:
     storageClassName: openebs-zfspv
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 8Gi

Apply the above YAML to perform the resize:

    $ kubectl apply -f pvc.yaml
    persistentvolumeclaim/csi-zfspv configured

Now, we can keep checking the PVC for the new size to be updated, it may take a while. Once resize operation is done we can see the PVC output with the updated size:

    $ kubectl get pvc
    NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    csi-zfspv   Bound    pvc-9b5c22a5-29be-428e-aa96-5e183c1c4c62   8Gi        RWO            openebs-zfspv   33m

We can also exec into the application pod and verify that the new size is visible to the application:

    $ kubectl exec -it percona-9449b4b9c-48qpw bash
    root@percona-9449b4b9c-48qpw:/# df -h
    Filesystem        Size      Used    Avail     Use%    Mounted on
    none               91G       18G      69G      21%    /
    tmpfs             3.9G         0     3.9G       0%    /dev
    tmpfs             3.9G         0     3.9G       0%    /sys/fs/cgroup
    /dev/sda1          91G       18G      69G      21%    /etc/hosts
    shm                64M         0      64M       0%    /dev/shm
    /dev/zd0          7.9G      237M     7.6G       3%    /var/lib/mysql
    tmpfs             3.9G       12K     3.9G       1%    /run/secrets/kubernetes.io/serviceaccount
    tmpfs             3.9G         0     3.9G       0%    /sys/firmware

I hope you find this post useful. Feel free to contact me with any feedback or questions by using the comment section below.
