---
title: Resize Kubernetes StatefulSets without impact
author: Sai Chaithanya
author_info: A developer who is always eager to learn, loves algorithms, maths, Kubernetes, and programming, Passionate about Data Science. Enjoys playing kabaddi and traveling.
date: 25-08-2020
tags: Kubernetes, OpenEBS
excerpt: Read this post if you are a cStor CSI user who's looking to resize statefulsets without any impact of StatefulSet applcations. 
---

In large scale environments, storage is one of the hard things to manage, and it will be the most crucial component as it has DATA with it. OpenEBS, leading open source Cloud Native Storage, makes managing storage easier in Kubernetes environments. MayaData, the company behind the OpenEBS project, has the vision of achieving data agility by transforming Kubernetes as a data plane. cStor is one of the storage engines of OpenEBS.

This blog is for OpenEBS users, specifically cStor CSI users looking to resize their ***Kubernetes StatefulSets*** without any impact of StatefulSet applications.

### **Steps involved to resize** ***Kubernetes StatefulSets***

1. Increase the volume size of the PVC.

2. Update StatefulSet volumeClaimTemplate storage capacity.

### Infrastructure details:

    Kubernetes Cluster: Bare Metal
    Kubernetes Version: v1.17.2
    OpenEBS Version: 2.0.0

### Installation of CStor setup:

Applied OpenEBS 2.0.0 version of cStor operator [yaml](https://github.com/openebs/charts/blob/gh-pages/2.0.0/cstor-operator.yaml) and ndm operator [yaml](https://github.com/openebs/charts/blob/gh-pages/2.0.0/ndm-operator.yaml) via kubectl apply and provisioned cStor pools using CSPC API by following the steps mentioned [here](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md).

    system@master$ kubectl get cspc -n openebs
    NAME          HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES   AGE
    cspc-stripe   3                  3                      3                  3m23s

### Create StorageClass:

Create a StorageClass pointing to the above cStor pool(cspc-stripe) which will help in provisioning the cStor volume. For expanding the volumes **allowVolumeExpansion** parameter should set to true

    system@master$ cat csi-sc.yaml 
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: openebs-csi-sc
    provisioner: cstor.csi.openebs.io
    allowVolumeExpansion: true
    parameters:
      cas-type: cstor
      replicaCount: "1"
      cstorPoolCluster: cspc-stripe

### Provision StatefulSet:

Create StatefulSet to point to the above storageclass. In this example, mongo statefulset will be provisioned and volume size will be expanded from 5Gi to 15Gi. Below is the sample statefulset used for expansion:

    system@master$ cat mongo-sts.yaml 
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: mongo
      Namespace: mongo-ns
    spec:
      selector:
        matchLabels:
          role: mongo
          environment: test
      serviceName: "mongo"
      replicas: 3
      template:
        metadata:
          labels:
            role: mongo
            environment: test
        spec:
          terminationGracePeriodSeconds: 10
          containers:
          - name: mongo
            image: mongo:latest
            imagePullPolicy: IfNotPresent
            command:
              - mongod
              - "--replSet"
              - rs0
            ports:
              - containerPort: 27017
            volumeMounts:
              - name: mongo-persistent-storage
                mountPath: /data/db
          - name: mongo-sidecar
            image: cvallance/mongo-k8s-sidecar
    ...
    ...
      volumeClaimTemplates:
        - metadata:
            name: mongo-persistent-storage
          spec:
            storageClassName: "openebs-csi-sc"
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 5Gi

After applying the above YAML. This results in the provisioning of volumes with **5Gi** capacity as mentioned in **volumeClaimTemplates,** and applications are in Running state.

    system@master$ kubectl get pods -n mongo-ns
    NAME      READY   STATUS    RESTARTS   AGE
    mongo-0   2/2     Running   0          8m24s
    mongo-1   2/2     Running   0          7m5s
    mongo-2   2/2     Running   0          6m4s
    
    -----------------------------------------------------------------------------------
    system@master$ kubectl get pvc -n mongo-ns
    NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
    mongo-persistent-storage-mongo-0   Bound    pvc-4926e6bb-3226-4de9-add5-e603ea2b948b   5Gi        RWO            openebs-csi-sc   6m48s
    mongo-persistent-storage-mongo-1   Bound    pvc-fcde1fde-65ee-48ab-8f79-b7c68edfb934   5Gi        RWO            openebs-csi-sc   5m29s
    mongo-persistent-storage-mongo-2   Bound    pvc-d94e5304-7f29-4d6c-b157-1e65f75511f1   5Gi        RWO            openebs-csi-sc   4m28s

Now verify the size of the volume by exec into any one of the application pods. In below output **/dev/sde** is the persistent volume and it’s capacity is **5G**.

    system@master$ kubectl exec -it mongo-0 -n mongo-ns -c mongo -- df -h
    Filesystem      Size  Used Avail Use% Mounted on
    overlay          98G   12G   82G  13% /
    tmpfs            64M     0   64M   0% /dev
    tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
    /dev/sde        4.8G  311M  4.5G   7% /data/db
    /dev/sda1        98G   12G   82G  13% /etc/hosts
    shm              64M     0   64M   0% /dev/shm
    tmpfs           3.9G   12K  3.9G   1% /run/secrets/kubernetes.io/serviceaccount
    tmpfs           3.9G     0  3.9G   0% /proc/acpi
    tmpfs           3.9G     0  3.9G   0% /proc/scsi
    tmpfs           3.9G     0  3.9G   0% /sys/firmware

Now, let’s resize the volume capacity by following the steps mentioned in the blog's beginning.

Step1: Increase the volume size of PVC

Expand the size of the PVC size by applying below command on all the StatefulSet volumes:

    kubectl patch pvc mongo-persistent-storage-mongo-0 -p '{ "spec": { "resources": { "requests": { "storage": "15Gi" }}}}' -n mongo-ns
    
    kubectl patch pvc mongo-persistent-storage-mongo-1 -p '{ "spec": { "resources": { "requests": { "storage": "15Gi" }}}}' -n mongo-ns
    
    
    kubectl patch pvc mongo-persistent-storage-mongo-2 -p '{ "spec": { "resources": { "requests": { "storage": "15Gi" }}}}' -n mongo-ns

After patching the above PVCs **openebs-cstor-csi** plugin is responsible for performing the resize operation on cStor volume. Verify whether volumes are expanded successfully by performing the following commands

    system@master:  kubectl get pvc -n mongo-ns
    NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
    mongo-persistent-storage-mongo-0   Bound    pvc-4926e6bb-3226-4de9-add5-e603ea2b948b   15Gi       RWO            openebs-csi-sc   32m
    mongo-persistent-storage-mongo-1   Bound    pvc-fcde1fde-65ee-48ab-8f79-b7c68edfb934   15Gi       RWO            openebs-csi-sc   30m
    mongo-persistent-storage-mongo-2   Bound    pvc-d94e5304-7f29-4d6c-b157-1e65f75511f1   15Gi       RWO            openebs-csi-sc   29m

Above PVC shows that volumes are expanded successfully. Now verify capacity by exec in to any one of the application pods

    system@master$ kubectl exec -it mongo-0 -n mongo-ns -c mongo -- df -h
    Filesystem      Size  Used Avail Use% Mounted on
    overlay          98G   12G   82G  13% /
    tmpfs            64M     0   64M   0% /dev
    tmpfs           3.9G     0  3.9G   0% /sys/fs/cgroup
    /dev/sde         15G  313M   15G   3% /data/db
    /dev/sda1        98G   12G   82G  13% /etc/hosts
    shm              64M     0   64M   0% /dev/shm
    tmpfs           3.9G   12K  3.9G   1% /run/secrets/kubernetes.io/serviceaccount
    tmpfs           3.9G     0  3.9G   0% /proc/acpi
    tmpfs           3.9G     0  3.9G   0% /proc/scsi
    tmpfs           3.9G     0  3.9G   0% /sys/firmware

Note: This step only helps to resize the volumes that are already provisioned for consuming via statefulsets. If StatefulSet is scaled up, then the newly provisioning volume will have the old size(since the volumeClaimTemplate is not yet updated in the application spec).

**Step2: Update StatefulSet volumeClaimTemplate storage size**

Since natively resizing of statefulset volumeClaimTemplates is not yet supported in Kubernetes, one needs to follow this step to update size in the volume claim template. For further updates, track the enhancement proposal [here](https://github.com/kubernetes/enhancements/pull/1848).

Update the capacity in volumeClaimTemplate of applied statefulset yaml lke below example:

    system@master$ cat mongo-sts.yaml
    cat mongo-sts.yaml 
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: mongo
      namespace: mongo-ns
    spec:
      selector:
        matchLabels:
          role: mongo
          environment: test
      serviceName: "mongo"
      replicas: 3
    ...
    ...
      volumeClaimTemplates:
        - metadata:
            name: mongo-persistent-storage
          spec:
            storageClassName: "openebs-csi-sc"
            accessModes: ["ReadWriteOnce"]
            resources:
              requests:
                storage: 15Gi

Now delete the statefulset without deleting the statefulset pods for not to have any down time for application and apply the updated volumeClaimTemplate.

    system@master$ kubectl delete sts mongo -n mongo-ns --cascade=false
    statefulset.apps "mongo" deleted
    
    system@master$ kubectl apply -f mongo-sts.yaml 
    statefulset.apps/mongo created
    service/mongo unchanged

Verify changes by describing the sts

    system@master$ kubectl describe sts mongo -n mongo-ns
    
    Name:               mongo
    Namespace:          mongo-ns
    CreationTimestamp:  Mon, 17 Aug 2020 16:38:51 +0530
    Selector:           environment=test,role=mongo
    ...
    ...
    Volume Claims:
      Name:          mongo-persistent-storage
      StorageClass:  openebs-csi-sc
      Labels:        <none>
      Annotations:   <none>
      Capacity:      15Gi
      Access Modes:  [ReadWriteOnce]

In the above output, capacity has been updated from **5Gi** to **15Gi**. So successfully updated the statefulset capacity without any down time.
