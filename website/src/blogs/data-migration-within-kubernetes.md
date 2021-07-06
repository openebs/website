---
title: Data Migration Within Kubernetes Clusters
author: Sai Chaithanya
author_info: A developer who is always eager to learn, loves algorithms, maths, Kubernetes, and programming, passionate about Data Science. Enjoys playing kabaddi and traveling.
date: 02-07-2020
tags: Kubernetes
excerpt: In this blog, we'll talk about migrating data within Kubernetes from one node to another without any downtime of the application.
---

In large scale environments, storage is one of the hard things to manage, and it will be the most crucial component as it has DATA with it. OpenEBS, leading open source Cloud Native Storage, makes managing storage easier in Kubernetes environments. MayaData, the company behind the OpenEBS project, has the vision of achieving data agility by transforming Kubernetes as a data plane. cStor is one of the storage engines of OpenEBS. 
This blog is for OpenEBS users, specifically **cStor CSI** users looking to **migrate data within Kubernetes** from one node to another without any downtime of the application.

![Data Migration within Kubernetes from Node2 to Node3](/images/blog/Data-migration-diagram.png)

### Create cStor Pools(CSPC):

Create cStor pools by following the steps mentioned [here](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md). Once the pools are created, wait till all the cStor pools marked as Healthy. Check the cStor pools status by executing `kubectl get cspc -n openebs` command(cspc - cStorPoolCluster)

    NAME            HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES   AGE
    cspc-stripe-pool   3                  3                       3              4m13s

Following command `kubectl get cspi -n openebs`(cStorPoolInstances) will be helpful to know more information about the pool.

    NAME                   HOSTNAME   ALLOCATED FREE CAPACITY READONLY  TYPE   STATUS  AGE
    cspc-stripe-pool-6qkw  e2e1-node1   230k    9630M   10G   false   stripe   ONLINE  21m
    cspc-stripe-pool-pn9p  e2e1-node2   230k    9630M   10G   false   stripe   ONLINE  12s
    cspc-stripe-pool-psz5  e2e1-node3   230k    9630M   10G   false   stripe   ONLINE  21m

### Create CSI Volume:

Create CSI volumes on cStor pools created above by following the steps mentioned [here](https://github.com/openebs/cstor-csi#provision-a-cstor-volume-using-openebs-cstor-csi-driver). As part of volume provisioning, a resource called `CStorVolumeConfig` will be created. Once the volume is provisioned successfully, then CVC(cStorVolumeConfig) status will update to Bound, which means all the CStorVolume resources are successfully created. Following is the command which will help to get CVC status `kubectl get cvc -n openebs`.

    NAME                                       STATUS     AGE
    pvc-d1b26676-5035-4e5b-b564-68869b023306   Bound      5m56s
    

### **Inspect CVC**:

Interfere CVC to know on which node data exists. When we do `kubectl get cvc <PV_NAME> -n <openebs_namespace> -o yaml`.

    apiVersion: cstor.openebs.io/v1
    kind: CStorVolumeConfig
    name: pvc-d1b26676-5035-4e5b-b564-68869b023306
    …
    …
    spec:
      capacity:
        storage: 5Gi
    ...
    ...
      policy:
        replicaPoolInfo:
        - poolName: cspc-stripe-pool-6qkw
        - poolName: cspc-stripe-pool-pn9p
    status:
      phase: Bound
      poolInfo:
      - cspc-stripe-pool-6qkw
      - cspc-stripe-pool-pn9p

From the above info CStorVolumeReplicas(CVR) are scheduled on cStor pools **cspc-stripe-pool-6qkw** and **cspc-stripe-pool-pn9p** from the **status.poolInfo** since above pools are on **e2e1-node1** and **e2e1-node2** (able to find node info from cspi output) sodata also will be available on the same node. Info under spec i.e **spec.policy.replicaPoolInfo** will convey where to schedule cStorVolumeReplicas.

To know more details of CVR we can get from `kubectl get cvr -n openebs`

    NAME                                                             USED    ALLOCATED   STATUS     AGE
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-6qkw   1.47G    1.26G      Healthy    15h
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-pn9p   1.47G    1.26G      Healthy    15h

**Steps to migrate data from one node to other:**

1. Scale the CStorVolumeReplica to the desired Node.
2. Scale down the CStorVolumeReplicas from unwanted Node.

**Step1: Scale the CStorVolumeReplicas to the desired node**

Get cStor pool name, which doesn’t have corresponding volume CVR in it and add it under **spec.policy.replicaPoolInfo** of CVC.

We can get pool name name which doesn’t have CVR in it by comparing outputs of `kubectl get cspi -n openebs -l openebs.io/cstor-pool-cluster=<cspc_name>` and `kubectl get cvc <pv_name> -o yaml` as stated inspect CVC. In this example CVR of volume pvc-d1b26676-5035-4e5b-b564-68869b023306 doesn’t not exist in cStor pool **cspc-stripe-pool-psz5.** After finding the pool name add it under **policy.replicaPoolInfo** list in CVC.

    apiVersion: cstor.openebs.io/v1
    kind: CStorVolumeConfig
    name: pvc-d1b26676-5035-4e5b-b564-68869b023306
    …
    …
    spec:
    …
    ...
      policy:
        replicaPoolInfo:
        - poolName: cspc-stripe-pool-6qkw
        - poolName: cspc-stripe-pool-pn9p
        - poolName: cspc-stripe-pool-psz5
    …
    …
    status:
      poolInfo:
      - cspc-stripe-pool-6qkw
      - cspc-stripe-pool-pn9p
      - cspc-stripe-pool-psz5

**Superb!**
Once the pool was added into the `spec.replicaPoolInfo` then the status of CVC will be updated with a new pool name as shown above, and raise an event which means that CVR was created on a newly added pool. We can get the CVR status by executing `kubectl get cvr -n openebs`

**Events**: Events on corresponding CVC

    Events:
    Type        Reason                Age                 From                         Message
    ----      ------                  ----                ----                         -------
    Normal   ScalingVolumeReplicas  14s (x2 over 15h)   cstorvolumeclaim-controller  successfully scaled volume replicas to 3

**CVR status(by executing the command)**:

    NAME                                                             USED    ALLOCATED           STATUS              AGE
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-6qkw   1.48G    1.25G              Healthy             16h
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-pn9p   1.48G    1.26G              Healthy             16h
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-psz5   91.4M    42.4M   ReconstructingNewReplica       33s

In the above output, newly created CVRs convey that it reconstructed data from scratch by talking to peer replicas. Wait till the newly created CVR marked as **Healthy**. To know status periodically execute `kubectl get cvr -n openebs` command.

    NAME                                                             USED    ALLOCATED           STATUS           AGE
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-6qkw   1.48G     1.25G             Healthy          16h
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-pn9p   1.48G     1.25G             Healthy          16h
    pvc-d1b26676-5035-4e5b-b564-68869b023306-cspc-stripe-pool-psz5   1.48G     1.25G             Healthy          5m28s

Note:

- Reconstructing will take time, depending on the amount of data it has to rebuild.

**Step2: Scale down the CStorVolumeReplicas from unwanted nodes**

Once the newly created CVR is marked as Healthy, then we can remove the unwanted pool name from Spec of CVC replicaInfo and save it. 

In this example, I need to remove the data from the pool **cspc-stripe-pool-pn9p**, scheduled on **e2e1-node2**. Once the pool name is removed from CVC **spec.policy.replicaPoolInfo**, then corresponding CVR in that pool will be deleted. CVC will generate events and status of CVC also will be updated.

Events on CVR:

    Events:
    Type       Reason                  Age                       From                            Message
    ----       ------                  ----                       ----                            -------
    Warning    ScalingVolumeReplicas   4s (x2 over 64m)     cstorvolumeclaim-controller     Scaling down volume replicas from 3 to 2 is in progress
    Normal     ScalingVolumeReplicas   4s (x2 over 64m)     cstorvolumeclaim-controller     successfully scaled volume replicas to 2

From output of `kubectl get cspi -n openebs`

    NAME                     HOSTNAME       ALLOCATED   FREE     CAPACITY    READONLY     TYPE       STATUS    AGE
    cspc-stripe-pool-6qkw    e2e1-node1      1260M      8370M    9630M         false      stripe      ONLINE   17h
    cspc-stripe-pool-pn9p    e2e1-node2      230k       9630M    9630M         false      stripe      ONLINE   16h
    cspc-stripe-pool-psz5    e2e1-node3      1260M      8370M    9630M         false      stripe      ONLINE   17h

**Perfect!**

From the above storage usage, I can successfully migrate the data from one node to another without any downtime of the application.
