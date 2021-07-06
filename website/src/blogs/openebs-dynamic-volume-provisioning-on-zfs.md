---
title: OpenEBS Dynamic Volume Provisioning on ZFS
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 13-12-2019
tags: CNCF, Kubernetes, Persistent Volume, ZFS, OpenEBS
excerpt: OpenEBS’ ZFS driver binds a ZFS file system into the Kubernetes environment and allows users to provision and de-provision volumes dynamically. This blog will demonstrate how to deploy a Percona application on the ZFS storage system with OpenEBS.
---

OpenEBS’ ZFS driver binds a ZFS file system into the Kubernetes environment and allows users to provision and de-provision volumes dynamically. This blog will demonstrate how to deploy a Percona application on the ZFS storage system with OpenEBS.

Using a ZFS Local PV has the following advantages — as opposed to Kubernetes native Local PV backed by direct attached devices:

- Sharing of the devices among multiple application pods.
- Enforcing quota on the volumes, making sure the pods don’t consume more than the capacity allocated to them.
- Ability to take snapshots of the Local PV
- Ability to sustain the disk failures — using the ZPOOL RAID functionality
- Ability to use data services like compression and encryption.

In this post, I will demonstrate how we can use ZFS Local PV for deploying a Percona application.

**Setup**

We will be using GKE with Kubernetes 1.14+ version with Ubuntu 18.4 installed on each node. We have to set up the node with ZFS utility once the cluster is up and running. We need to install [zfsutils-linux](https://packages.ubuntu.com/bionic/zfsutils-linux) on each node and use [ZFS commands](https://www.thegeekdiary.com/solaris-zfs-command-line-reference-cheat-sheet/) to set up a storage pool.

    $ apt-get install -y zfsutils-linux

Create and attach the disk (if not already attached) to the nodes for setting up the ZPOOL:

    $ gcloud compute disks create <disk-name> --size <size> --type pd-standard  --zone us-central1-a

    $ gcloud compute instances attach-disk <node-name> --disk <disk-name> --zone us-central1-a

Create the zpool on each node using the attached disks (sdb and sdc):

    $ zpool create zfspv-pool mirror /dev/sdb /dev/sdc

Here we are creating a mirrored ZPOOL, we can create any kind of pool as per our requirement (raidz, striped or mirror).

Check the zpool list:

    $ zfs list
    NAME USED AVAIL REFER MOUNTPOINT

    zfspv-pool 644K 96.4G 176K /zfspv-pool

Install OpenEBS ZFS driver :

    $ kubectl apply -f [https://raw.githubusercontent.com/openebs/zfs-localpv/master/deploy/zfs-operator.yaml](https://raw.githubusercontent.com/openebs/zfs-localpv/master/deploy/zfs-operator.yaml)

Check that the driver is installed:

    $ kubectl get pods -n kube-system -l role=openebs-zfs

    NAME READY STATUS RESTARTS AGE

    openebs-zfs-controller-0 4/4 Running 0 5h28m

    openebs-zfs-node-4d94n 2/2 Running 0 5h28m

    openebs-zfs-node-gssh8 2/2 Running 0 5h28m

    openebs-zfs-node-twmx8 2/2 Running 0 5h28m

**Create The Storage Class:**

    $ cat sc.yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: percona-sc
    allowVolumeExpansion: true
    parameters:
      poolname: "zfspv-pool"
    provisioner: zfs.csi.openebs.io

The storage class has a *poolname* parameter, which means that any volume provisioned using this storage class will be provisioned in this pool (zfspv-pool here). The provisioner *zfs.csi.openebs.io* is the provisioner name for the ZFS driver. You can change the poolname to the name of the ZPOOL which you have created for the provisioning. Apply the YAML to create the storage class:

    $ kubectl apply -f sc.yaml

    storageclass.storage.k8s.io/percona-sc created

**Create The PVC:**

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: percona-pvc
    spec:
      storageClassName: percona-sc
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 4Gi

Create the PVC using the storage class created for the ZFS driver. You can request for the storage space via storage parameter as shown in above PVC for putting a request for 4Gi storage. Apply the YAML to create the PVC request.

    $ kubectl apply -f pvc.yaml

    persistentvolumeclaim/percona-pvc

Check the PVC

    $ kubectl get pvc

    NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE

    percona-pvc Bound pvc-ecdb16e2-e03a-11e9-b418–42010a80006b 4Gi RWO percona-sc 5m39s

Here, we can see that the PVC has been created and bound also as well.

**Percona YAML:**

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

    echo -e "nWaiting for mysql server to start accepting connections.."
        retries=10;wait_retry=30
        for i in `seq 1 $retries`; do
          mysql -uroot -pk8sDem0 -e 'status' > /dev/null 2>&1
          rc=$?
          [ $rc -eq 0 ] && break
          sleep $wait_retry
        done

    if [ $rc -ne 0 ];
        then
          echo -e "nFailed to connect to db server after trying for $(($retries * $wait_retry))s, exitingn"
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
                claimName: percona-pvc
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

Apply the configuration:

    $ kubectl apply -f percona.yaml

    configmap/sqltest created
    deployment.apps/percona created
    service/percona-mysql created

Check the status of the Pod.

    $ kubectl get po

    NAME READY STATUS RESTARTS AGE

    percona-7456dc6f7b-nnfcz 1/1 Running 0 67s

We can go the node where percona pod is scheduled and see that a volume has been created in the pool zfspv-pool using the ZFS list command,:-

    $ zfs list

    NAME USED AVAIL REFER MOUNTPOINT

    zfspv-pool 115M 96.3G 176K /zfspv-pool

    zfspv-pool/pvc-ecdb16e2-e03a-11e9-b418–42010a80006b 102M 96.3G 102M -

### Summary

As demonstrated in this blog, OpenEBS makes it easy for the Kubernetes applications to take advantage of all the technical features provided by ZFS storage.

### Important links

[https://github.com/openebs/zfs-localpv](https://github.com/openebs/zfs-localpv)
