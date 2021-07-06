---
title: Handling node down/cluster scaling on LocalPV backed workloads
author: Ranjith Raveendran
author_info: Ranjith is working as a Software Engineer at MayaData and working in the OpenEBS project. In his free time, he listens to music, watches movies, and goes for bike riding.
date: 21-08-2020
tags: LocalPV, OpenEBS
excerpt: In this article, we'll discuss the steps that is getting handled when a node down/cluster scaling on LocalPV backs workloads.
---

Kubernetes is increasingly used for running production-grade stateful services. Organizations are making progress on a containerized form of their production workloads for running in Kubernetes. There are already solutions available for the containerized version of stateful applications, network, storage, etc.

### Handling node down / cluster scaling on Local PV backed workloads

OpenEBS is one of the leading containerized storage solutions for Kubernetes, and it is a rapidly growing Sandbox project in CNCF. MayaData is the primary maintainer and contributor of OpenEBS along with other companies. MayaData also contributed another open source project, Litmus, into CNCF, which does mostly Chaos engineering in Kubernetes, which helps SREs and developers to do all kinds of testing of their applications and components in Kubernetes before going into production.

It is a must requirement of a persistent storage solution for running the stateful application, be it a **Deployment** or **StatefulSet**. OpenEBS provides many storage engines, and each storage engine is suitable for specific applications or workloads. Some engines provide storage level synchronous replication, capable of taking snapshots and cloning, backup and restore, volume expansion, CSI complaint, performance-oriented, etc. So choosing the engine based on the workload requirement is an important activity.

OpenEBS provides dynamic provisioning of LocalPV using an external device, and this external device will be allocated entirely to an application. You can also use the partitioned disk for using OpenEBS LocalPV by using the `openebs-hostpath` storage engine. In this article, we provisioned a MySQL deployment on an OpenEBS LocalPV device dynamically.

This article is a step-by-step instruction. We will mention how a MySQL application deployment running on ***OpenEBS LocalPV*** device volume is getting handled when a Node down scenario or a cluster scale down situation happens in the GKE cluster. In GKE and some other managed clusters like EKS, the node name will change if the cluster undergoes a scale down and scale-up operation has performed. So the application running on the ***OpenEBS LocalPV*** device will not be able to attach to the new node since the corresponding PV has volume node affinity. We need to update the new node name details in PV, where the disk got attached.

In this article, we discuss the steps that need to be performed to make the application into a running state when a Node down / scale down cluster scenario has happened. This situation is usually required in case of managed clusters where the node name will get changed during this scenario. As stated earlier, the following approach works fine for both Deployment type and StatefulSet type, but ensure that the following steps are correctly satisfied. Let’s start with the step by step instructions once you have scaled up the cluster after a scale down scenario.

1. Verify all nodes are now in Ready state.
    ```
    $ kubectl get node
    NAME                                           STATUS   ROLES    AGE   VERSION
    gke-openebs-mysql-default-pool-d55297a7-bjjp   Ready    <none>   74s   v1.16.13-gke.1
    gke-openebs-mysql-default-pool-d55297a7-j1vm   Ready    <none>   80s   v1.16.13-gke.1
    gke-openebs-mysql-default-pool-d55297a7-pvg4   Ready    <none>   85s   v1.16.13-gke.1
    ```
2. Ensure OpenEBS pods are in Running state.
    ```
    $ kubectl get pod -n openebs
    NAME                                           READY   STATUS    RESTARTS   AGE
    maya-apiserver-76cb4df9b8-wpbf6                1/1     Running   0          22m
    openebs-admission-server-5cf696b8d5-d97bn      1/1     Running   0          22m
    openebs-localpv-provisioner-7654f6dbd9-hskq8   1/1     Running   0          22m
    openebs-ndm-7dtts                              1/1     Running   0          2m19s
    openebs-ndm-c4r4m                              1/1     Running   0          2m23s
    openebs-ndm-lnb5c                              1/1     Running   0          2m12s
    openebs-ndm-operator-6cfc59b69b-684nx          1/1     Running   0          22m
    openebs-provisioner-7d9884d4ff-tfcxj           1/1     Running   0          22m
    openebs-snapshot-operator-7ff577c889-kfttj     2/2     Running   0          22m
    ```
3. Check the status of the application pod. It will be in the `Pending` state.
    ```
    $ kubectl get pod
    NAME                      READY   STATUS    RESTARTS   AGE
    percona-9fbdb8678-lncd5   0/1     Pending   0          17m
    ```
4. Label all the nodes with the same custom label used in the `nodeSelector` field in the STS app. In my case, there is no custom node label used in application deployment. So we are skipping this step.

5. Attach the disk randomly to any node in the same zone. Note down the device name and node name where it is getting attached. This information will be needed in step 9.
    ```
    $ gcloud compute instances attach-disk gke-openebs-mysql-default-pool-d55297a7-bjjp --disk mysql-disk1 --device-name mysql-disk1 --zone=us-central1-c

    $ gcloud compute instances attach-disk gke-openebs-mysql-default-pool-d55297a7-j1vm --disk mysql-disk2 --device-name mysql-disk2 --zone=us-central1-c

    $ gcloud compute instances attach-disk gke-openebs-mysql-default-pool-d55297a7-pvg4 --disk mysql-disk3 --device-name mysql-disk3 --zone=us-central1-c
    ```
6. Verify BDs are updated with new node names
    ```
    $ kubectl get bd -n openebs
    NAME                                           NODENAME                                       SIZE          CLAIMSTATE   STATUS   AGE
    blockdevice-4f51859193d333687a873af7acf8ad78   gke-openebs-mysql-default-pool-d55297a7-j1vm   32212254720   Unclaimed    Active   37m
    blockdevice-967d7816c2a2d73b91c8c6310dc70465   gke-openebs-mysql-default-pool-d55297a7-bjjp   32212254720   Claimed      Active   37m
    blockdevice-ddfc782ea661fc9007a896438f483e3d   gke-openebs-mysql-default-pool-d55297a7-pvg4   32212254720   Unclaimed    Active   37m
    ```
7. Get the PV details of the associated application
    ```
    $ kubectl get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
    pvc-5cd17649-efe4-46e1-a5f3-f779b0e03999   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-device            33m
    ```
8. Create a directory and copy the YAML spec of all the associated PVs into it like below
    ```
    $ mkdir mysql-restore
    $ cd mysql-restore/
    $ kubectl get pv pvc-5cd17649-efe4-46e1-a5f3-f779b0e03999 -o yaml --export > pv1.yaml
    ```
    Note: If it is StatefulSet, take the YAML spec of all the associated PVs of that application.

9. Modify the above-copied YAML with the new hostname in the copied YAML of PV. The following is that snippet of PV spec where it mentions the new node name where the Local disk is attached.
    ```
    path: /dev/disk/by-id/scsi-0Google_PersistentDisk_mysql-disk1
      nodeAffinity:
        required:
          nodeSelectorTerms:
          - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
              - gke-openebs-mysql-default-pool-d55297a7-bjjp
    ```
10. Now get the PV and then delete the PV
   
    ```
    $ kubectl get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
    pvc-5cd17649-efe4-46e1-a5f3-f779b0e03999   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-device            36m
 
    $ kubectl delete pv pvc-5cd17649-efe4-46e1-a5f3-f779b0e03999
    persistentvolume "pvc-5cd17649-efe4-46e1-a5f3-f779b0e03999" deleted
    ```
    The deletion of the PV will not be completed since it has the finaliser set with the PV. So we need to cancel the ongoing operation and then edit the PV and remove Finalizers. Once finalizers are removed, the volume will be automatically deleted.

11. Verify that the PV of the application has been removed successfully.
    ```
    $ kubectl get pv
    No resources were found in the default namespace.
    ```
12. Now, apply the updated YAML files of the PV.
    ```
    $ kubectl apply -f  pv1.yaml 
    ```
    Note: Perform the same for other PVs as well if the application is a StatefulSet.

13. Verify that if PODs are started `Running` from `Pending` state.
    ```
    $ kubectl get pod -o wide
    NAME                      READY   STATUS    RESTARTS   AGE   IP          NODE                                           NOMINATED NODE   READINESS GATES
    percona-9fbdb8678-lncd5   1/1     Running   0          29m   10.16.0.2   gke-openebs-mysql-default-pool-d55297a7-bjjp   <none>           <none>
    ```
14. Log in to the application and verify that you are able to access the data.

    ```
    $ kubectl exec -it percona-9fbdb8678-lncd5 sh
    kubectl exec [POD] [COMMAND] is DEPRECATED and will be removed in a future version. Use kubectl kubectl exec [POD] -- [COMMAND] instead.
    sh-4.2$ mysql -uroot -pk8sDem0;
    mysql: [Warning] Using a password on the command line interface can be insecure.
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 2
    Server version: 5.7.30-33 Percona Server (GPL), Release 33, Revision 6517692
    
    Copyright (c) 2009-2020 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

    mysql> SHOW DATABASES;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | pets               |
    | sys                |
    +--------------------+
    5 rows in set (0.07 sec)
    
    mysql> use pets;
    
    Reading table information for completion of table and column names
    You can turn off this feature to get a quicker startup with -A
    
    Database changed
    mysql> SELECT * FROM cats;
    +----+---------+--------+------------+
    | id | name    | owner  | birth      |
    +----+---------+--------+------------+
    |  1 | Sandy   | Lennon | 2015-01-03 |
    |  2 | Cookie  | Casey  | 2013-11-13 |
    |  3 | Charlie | River  | 2016-05-21 |
    +----+---------+--------+------------+
    3 rows in set (0.00 sec)
    ```