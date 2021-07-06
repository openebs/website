---
title: Handling node down/cluster scaling on ZFS LocalPV backed workloads
author: Ranjith Raveendran
author_info: Ranjith is working as a Software Engineer at MayaData and working in the OpenEBS project. In his free time, he listens to music, watches movies, and goes for bike riding.
date: 01-09-2020
tags: Kubernetes
excerpt: Step-by-step blog on how MySQL app deployment runs on OpenEBS ZFS LocalPV device, handled when a node down/cluster scale down situation happens in GKE cluster
---

Kubernetes is increasingly used for running production-grade stateful services. Organizations are making progress on a containerized form of their production workloads for running in Kubernetes. There are already solutions available for the containerized version of stateful applications, network, storage, etc.

As everyone knows, OpenEBS is one of the leading containerized storage solutions for Kubernetes, and it is a growing Sandbox project in CNCF. MayaData is the primary maintainer and contributor of OpenEBS along with other companies. MayaData also contributed another open source project, Litmus, into CNCF, which does mostly Chaos engineering in Kubernetes, which helps SREs and developers to do all kinds of testing of their applications and components in Kubernetes before going into Production.

A persistent storage solution for running any stateful application is a must requirement, be it a **Deployment** or **StatefulSet**. OpenEBS provides various storage engines, and each storage engine is suitable for specific applications or workloads. Some engines provide storage level synchronous replication, capable of taking snapshots and cloning, backup and restore, volume expansion, CSI complaint, performance-oriented, etc. So choosing the engine based on the workload requirement is an important activity.

OpenEBS provides dynamic provisioning of ***ZFS LocalPV*** using external device/devices. OpenEBS ZFS driver binds a ZFS file system into the Kubernetes environment and allows users to provision and de-provision volumes dynamically. Using a ***ZFS Local PV*** has the following advantages   as opposed to Kubernetes native Local PV backed by direct-attached devices:

- Sharing of the devices among multiple application pods.
- Enforcing quota on the volumes makes sure the pods don’t consume more than their capacity.
- Ability to take snapshots of the LocalPV
- Ability to sustain the disk failures — using the ZPOOL RAID functionality
- Ability to use data services like compression and encryption.
- Ability to resize the PV capacity.

In this article, we provisioned a MySQL deployment on an ***OpenEBS ZFS LocalPV*** device dynamically.

This article is a step-by-step instruction. We will mention how a MySQL application deployment running on the OpenEBS ZFS LocalPV device volume is getting handled when a Node down scenario or a cluster scale down situation happens in the GKE cluster. In GKE and some other managed clusters like EKS, the node name will change if the cluster undergoes a scale down and scale up operation has performed. So the application running on the OpenEBS ZFS LocalPV device will not be able to attach to the new node since the corresponding PV and ZFS Volume has a binding of volume node affinity. We need to update the new node name details in PV and ZFS volume, where the disk got attached.

In this article, we are discussing the steps that need to be performed to make the application into a running state when a Node down / scale down cluster scenario has happened. This situation is usually required in case of Managed clusters where the Node name will get changed during this scenario. As stated earlier, the following approach works fine for both Deployment type and StatefulSet type, but ensure that the next steps are correctly performed. Let’s start with the step by step instructions once you have scaled up the cluster after a scale down scenario.

1. Verify all nodes are now in Ready state.
    ```
    $ kubectl get node
    NAME                                           STATUS   ROLES    AGE   VERSION
    gke-openebs-mysql-default-pool-dd23ce6b-f8rd   Ready    <none>   24m   v1.16.13-gke.1
    gke-openebs-mysql-default-pool-dd23ce6b-lwr3   Ready    <none>   24m   v1.16.13-gke.1
    gke-openebs-mysql-default-pool-dd23ce6b-zzqx   Ready    <none>   24m   v1.16.13-gke.1
    ```
2. Label all the nodes with the same custom label used in the nodeSelector field in the STS app. In my case, there is no custom node label used in application deployment. So we are skipping this step.

3. Attach the disk randomly to any node in the same zone.
    
    ```
    $ gcloud compute instances attach-disk gke-openebs-mysql-default-pool-dd23ce6b-j894 --disk mysql-disk1 --device-name mysql-disk1 --zone=us-central1-c

    $ gcloud compute instances attach-disk gke-openebs-mysql-default-pool-dd23ce6b-prv2 --disk mysql-disk2 --device-name mysql-disk2 --zone=us-central1-c

    $ gcloud compute instances attach-disk gke-openebs-mysql-default-pool-dd23ce6b-tf5j --disk mysql-disk3 --device-name mysql-disk3 --zone=us-central1-c
    ```
4. Ensure that ZFS utils packages are installed on your worker nodes. If it is not installed, ZFS packages can be installed.
    
    ```
    $ sudo su -
    $ sudo apt-get update
    $ apt-get install zfsutils-linux -y
    $ zpool import zfspv-pool
    ```
    
    Verify Zpool information.
    
    ```
    $ zpool list
    NAME         SIZE  ALLOC   FREE  EXPANDSZ   FRAG    CAP  DEDUP  HEALTH  ALTROOT
    zfspv-pool  14.5G   463M  14.0G         -     0%     3%  1.0
    ```
5. Verify the details of the ZFS dataset detail where the volume is present. This information is required in step 10. In the case of Statefulset, the ZFS dataset will be present on multiple nodes. So you should note down the details of the ZFS dataset and corresponding node information.
    
    ```
    $ sudo su
    $ root@gke-openebs-mysql-default-pool-dd23ce6b-tf5j:~# zfs list
    NAME                                                  USED  AVAIL  REFER  MOUNTPOINT
    zfspv-pool                                           10.6G  3.42G    96K  /zfspv-pool
    zfspv-pool/pvc-e299a9db-0903-417b-8034-03c3dc77af87  10.6G  13.6G   462M  -
    ```

    From the above information, the ZFS dataset is present on Node `gke-openebs-mysql-default-pool-dd23ce6b-tf5j`. We have to update this node information in the nodeSelector field in step 10 and as `ownerNodeID` in step 11.

6. Ensure OpenEBS ZFS driver pods are running in the `kube-system` namespace.
    
    ```
    $ kubectl get pods -n kube-system -l role=openebs-zfs
    NAME                       READY   STATUS           RESTARTS   AGE
    openebs-zfs-controller-0   5/5     Running          0          91m
    openebs-zfs-node-29dlp     2/2     Running          0          14m
    openebs-zfs-node-bssq7     2/2     Running          0          14m
    openebs-zfs-node-p54tq     2/2     Running	    0          14m
    ```
7. Check the status of the application pod. It will be in the `Pending` state.
    
    ```
    $ kubectl get pod
    NAME                      READY   STATUS    RESTARTS   AGE
    percona-9fbdb8678-z79vr   0/1     Pending   0          70m
    ```
8. Get the PV details of the associated application
    
    ```
    $ kubectl get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
    pvc-e299a9db-0903-417b-8034-03c3dc77af87  10Gi         RWO            Delete           Bound    default/demo-vol1-claim   openebs-zfspv           33m
    ```
9. Create a directory and copy the YAML spec of all the associated PVs into it like below.
    
    ```
    $ mkdir mysql-restore
    $ cd mysql-restore/
    $ kubectl get pv pvc-e299a9db-0903-417b-8034-03c3dc77af87 -o yaml --export > pv1.yaml
    ```
    
    Note: If it is StatefulSet, take the YAML spec of all the associated PVs of that application.

10. Modify the above-copied YAML with the new hostname in the copied YAML of PV. The following is a snippet of PV spec where it mentions the new node name where the ZFS volume is created. The node information will be obtained from step 5.
    ```
    nodeAffinity:
        required:
          nodeSelectorTerms:
          - matchExpressions:
            - key: openebs.io/nodename
              operator: In
              values:
              - gke-openebs-mysql-default-pool-dd23ce6b-tf5j
      persistentVolumeReclaimPolicy: Delete
      storageClassName: openebs-zfspv
    ```
11. Also, update the node information where the ZFS dataset resides into `zv`(ZFS volume) cr. The node name has to be given to the path  `spec.ownerNodeID`.
    
    ```
    $ kubectl edit zv pvc-e299a9db-0903-417b-8034-03c3dc77af87 -n openebs
    ```
    
    The following is the snippet of the modified information.
    
    ```
    spec:
      capacity: "10737418240"
      compression: "off"
      dedup: "off"
      fsType: ext4
      ownerNodeID: gke-openebs-mysql-default-pool-dd23ce6b-tf5j
      poolName: zfspv-pool
    ```
12. Now get the PV and then delete the PV
    
    ```
    spec:
      capacity: "10737418240"
      compression: "off"
      dedup: "off"
      fsType: ext4
      ownerNodeID: gke-openebs-mysql-default-pool-dd23ce6b-tf5j
      poolName: zfspv-pool
    ```
    ```
    $ kubectl delete pv pvc-e299a9db-0903-417b-8034-03c3dc77af87
    persistentvolume "pvc-e299a9db-0903-417b-8034-03c3dc77af87" deleted
    ```
    
    The deletion of the PV will not be completed since it has the finaliser set with the PV. So we need to cancel the ongoing operation and then edit the PV and remove Finalizers. Once finalizers are removed, the volume will be automatically deleted.

13. Verify that the PV of the application has been removed successfully.
    
    ```
    $ kubectl delete pv pvc-e299a9db-0903-417b-8034-03c3dc77af87
    persistentvolume "pvc-e299a9db-0903-417b-8034-03c3dc77af87" deleted
    ```
14. Now, apply the updated YAML files of the PV. 
    
    ```
    $ kubectl apply -f  pv1.yaml 
    ```
    
    Note: Perform the same for other PVs as well if the application is a StatefulSet.

15. Verify that if PODs are started `Running` from `Pending` state.
    
    ```
    $ kubectl get pod -o wide
    NAME                      READY   STATUS    RESTARTS   AGE     IP         NODE                                           NOMINATED NODE   READINESS GATES
    percona-9fbdb8678-z79vr   1/1     Running   0          6h43m   10.4.2.2   gke-openebs-mysql-default-pool-dd23ce6b-tf5j   <none>           <none>
    ```
    
    Verify the PV, PVC, and ZV associated with the MySQL application.
    
    ```
    $ kubectl get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS    REASON   AGE
    pvc-e299a9db-0903-417b-8034-03c3dc77af87   10Gi       RWO            Delete           Bound    default/demo-vol1-claim   openebs-zfspv            150m

    $ kubectl get pvc
    NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
    demo-vol1-claim   Bound    pvc-e299a9db-0903-417b-8034-03c3dc77af87   10Gi       RWO            openebs-zfspv   7h7m

    $ kubectl get zv -n openebs
    NAME                                       ZPOOL        NODE                                           SIZE          STATUS   FILESYSTEM   AGE
    pvc-e299a9db-0903-417b-8034-03c3dc77af87   zfspv-pool   gke-openebs-mysql-default-pool-dd23ce6b-tf5j   10737418240   Ready    ext4         7h7m

16. Login to the application and verify that you are able to access the data.
    ```
    $ kubectl exec -it percona-9fbdb8678-z79vr sh
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
    5 rows in set (0.11 sec)
    
    mysql> USE pets;
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