---
title: cStor Pool Provisioning in OpenEBS 0.7
author: Ashutosh Kumar
author_info: Software Engineer at MayaData | OpenEBS Reviewer and Contributor | CKA | Gopher | Kubernaut
date: 19-08-2018
tags: Kubernetes, OpenEBS, Pool, Storage
excerpt: OpenEBS team is happy to announce the release of 0.7 which comes with a new storage engine for creating storage pool known as cStor engine.
---

Greetings OpenEBS users!

The OpenEBS team is happy to announce the release of 0.7, which comes with a new storage engine, known as cStor, for creating storage pools.
To find out more details on this specific release, please visit the following links:
[https://github.com/openebs/openebs/releases](https://github.com/openebs/openebs/releases)
[https://blog.openebs.io/openebs-0-7-release-pushes-cstor-storage-engine-to-field-trials-1c41e6ad8c91](https://blog.openebs.io/openebs-0-7-release-pushes-cstor-storage-engine-to-field-trials-1c41e6ad8c91)

To keep this story short and concise I will jump directly into how you can provision a storage pool in 0.7 using the cStor engine. Just for your information, storage pools can also be provisioned using the Jiva engine that we used in previous versions of OpenEBS.

Let’s get started!

There are currently two ways to provision a storage pool using the cStor engine in OpenEBS 0.7. As we move forward with the tutorial, I will assume that you already have a Kubernetes cluster set up. I will follow up this tutorial by having a 3-node Kubernetes cluster with one physical disk attached to every node on GKE.

### Manual Pool Provisioning

To provision a storage pool manually, you run the following command where your kubernetes cluster is configured.

    ashutosh@miracle:~$ kubectl get disk
    NAME                                      CREATED AT
    disk-26ac8d634b31ba497a9fa72ae57d6a24     1d
    disk-2709a1cba9cea9407b92bc1f7d1a1bde     1d
    disk-427145375f85e8a488eeb8bbfae45118     1d
    sparse-4b488677f76c94d681870379168a677a   1d
    sparse-c3ddc8f0de2eb17c50d145cf6713588c   1d
    sparse-e09fe4b5170a7b8fd6b8aabf8c828072   1d

The output with prefix disk represents your physical disks, and the output with prefix sparse represents sparse disks. We will discuss the sparse disk concept in a later blog-post, but for now, let’s concentrate on physical disks! We need to simply copy the physical disks (in the diskList field of the storage pool claim YAML) over which the pool should be created. The SPC YAML will look like the following:

    apiVersion: openebs.io/v1alpha1
    kind: StoragePoolClaim
    metadata:
      name: cstor-disk
    spec:
      name: cstor-disk
      type: disk 
      poolSpec:
        poolType: striped
      disks:
       diskList:
       - disk-26ac8d634b31ba497a9fa72ae57d6a24
       - disk-2709a1cba9cea9407b92bc1f7d1a1bde
       - disk-427145375f85e8a488eeb8bbfae45118

Now you just need to apply the created YAML. That’s it. Done!

    ashutosh@miracle:~$ kubectl apply -f spc.yaml 
    storagepoolclaim.openebs.io/cstor-disk created
    ashutosh@miracle:~$ kubectl get sp
    NAME              CREATED AT
    cstor-disk-5wsi   4s
    cstor-disk-7pgs   4s
    cstor-disk-8fhi   4s
    default           14d

Each disk that we entered in SPC YAML is attached to a specific node. So, 3 cStor pools were created on top of the 3 nodes, and this sp (the output belongs to the applied SPC) belongs to the applied SPC. If all 3 disks were attached to a single node, we would only have one sp.

### Dynamic Pool Provisioning

The steps listed above involved a heavy manual process, but it helps the user to configure a storage pool based on their choices. If you didn’t like that manual process, don’t worry; let’s work some magic here by doing something known as dynamic pool provisioning.

Start by applying the following SPC YAML :

    apiVersion: openebs.io/v1alpha1
    kind: StoragePoolClaim
    metadata:
      name: cstor-disk-dynamic
    spec:
      name: cstor-disk-dynamic
      type: disk
      # required in case of dynamic provisioning
      maxPools: 3 
      # If not provided, defaults to 1 (recommended but not required)
      minPools: 3
      poolSpec:
        poolType: striped
    ashutosh@miracle:~$ kubectl apply -f dynamic_spc.yaml storagepoolclaim.openebs.io/cstor-disk-dynamic created
    ashutosh@miracle:~$ kubectl get sp
    NAME                      CREATED AT
    cstor-disk-dynamic-jwc5   6s
    cstor-disk-dynamic-qot0   6s
    cstor-disk-dynamic-s8va   6s
    default                   14d

That’s it. Done!

Let’s better understand what’s going on here:

1. The dynamic way of pool provisioning will support reconciliation, i.e. the OpenEBS control plane will always try to get the maxPools number of pools specified on storagepoolclaim. If the SPC YAML is applied and the node is down or there are no existing disks, when the resources come up, the pool will be provisioned automatically without any intervention.
2. The manual method of provisioning will not have any such reconciliation.
3. The number of the pool(s) specified by minPools will be created or no pools will be provisioned. So, if maxPool=10 and minPool=6, the Control plane will always try to get to a pool count of 10 but any single shot of provisioning in any one part of the reconciliation loop must provision at least 6 pools. Once the minPools count is reached even if the count of pool increases by only 1, the control plane will execute the action.

### NOTES: 

1. In the above tutorial, we provisioned a striped type of pool for both cases. A mirrored pool can also be provisioned, but at least 2 disks must be attached to the node. Simply change the poolType field in SPC YAML to mirrored.
2. The number of sp resources created is equal to the number of cStor pools created on top of each node, but those belong to a single SPC that spawns them. For applications, the pool is virtually one while we create volumes.

Hopefully, this helps! Feel free to post any queries or concerns and share any feedback. You can reach out on our OpenEBS slack channel as well.
([https://slack.openebs.io/](https://slack.openebs.io/))
