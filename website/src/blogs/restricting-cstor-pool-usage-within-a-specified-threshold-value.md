---
title: Restricting cStor pool usage within a specified threshold value
author: Giridhara Prasad
author_info: Lead Engineer at Mayadata Inc. Giridhar is experienced in software test automation, chaos engineering. Currently, he's working on Litmus, an Open Source chaos engineering project.
date: 20-05-2020
tags: OpenEBS, cStor
excerpt: Learn how to restrict cStor pool usage within a specified threshold value
---

cStor is one of the storage engines provided by OpenEBS. The integral component of the cStor engine is its storage pool from which the volumes are created. The storage pool is constructed with the collection of block devices. When the pool is completely utilized, it may misbehave in such a way that the pool itself cannot be imported successfully to recover from failures.

In order to overcome this situation, cStor recommends the optimal usage of storage capacity in the pool by restricting the write I/Os by converting it into read-only when the threshold limit is exceeded. While creating cStor SPC, the field *roThresholdLimit* has to be specified in percentage value under pool spec as follows:

    apiVersion: openebs.io/v1alpha1
    kind: StoragePoolClaim
    metadata:
      name: cstor-pool
      annotations:
        cas.openebs.io/config: |
          - name: PoolResourceRequests
            value: |-
                memory: 2Gi
          - name: PoolResourceLimits
            value: |-
                memory: 4Gi
    spec:
      name: cstor-pool
      type: disk
      poolSpec:
        poolType: striped
        roThresholdLimit: 80
      blockDevices:
        blockDeviceList:
        - blockdevice-31e0768585cb80ed2352affa73ec94e2
        - blockdevice-ab636ddeba8f8cd45f7e91a6b55c15e5
        - blockdevice-75275112e966e43c2ac1311a7a492fac

In the above snippet, *roThresholdLimit: 80*  indicates that the pool will become read-only when the usage exceeds 80% of its total capacity. Upon trying to create the above SPC, the following CSPs will be created.

    NAME              ALLOCATED   FREE    CAPACITY   STATUS    READONLY   TYPE      AGE
    cstor-pool-0vl0   45G         4.7G   49.8G      Healthy   true      striped   2m8s
    cstor-pool-qnm1   77K         49.7G   49.8G      Healthy   false      striped   2m8s
    cstor-pool-x4gj   77K         49.7G   49.8G      Healthy   false      striped   2m8s

The read-only status of each CSP is indicated, as shown in the above template.

When the usage of the pool crosses 80% of its actual capacity, it will become read-only. It means all the replicas in that pool won’t serve further write IOs irrespective of the amount of space they consumed. As an impact, if the persistent volumes do not have enough healthy storage replicas, then the volume will become read-only.

The status of active replica where write IOs were happening turns offline when the pool becomes read-only whereas, for the idle replica, it remains healthy. The sample output of CVR is as below. Here, one replica is in Offline state as its pool is in a read-only state.

    k8s@master:kubectl get cvr -n openebs
    NAME                                                                  USED    ALLOCATED   STATUS    AGE
    pvc-261d6832-8b23-476c-8aa3-b95104e20030-cstor-pool-0vl0   1.15G   1.04G       Offline   23m
    pvc-f38f5517-a7bc-492d-a6eb-27ac510ced3b-cstor-pool-qnm1   74.7K   17.7K       Healthy   23m56s

The *roThresholdLimit* is the configurable value. In case, if you want to increase/decrease the percentage value, it has to be modified at each CSP level. Editing at SPC config won’t be effective. In case if the administrator didn’t set the *roThresholdLimit* field during SPC creation, the default value would be set to, 85% considering it as the optimal value for usage. Administrators can set the roThresholdLimit value in CSP from 0 to 100 though the OpenEBS team won't recommend setting it to 100 percent.
When the pool became read-only, the administrator can either increase the pool capacity by executing the steps specified [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_add_disks_to_spc.md) or increase the roThresholdLimit value in that CSP to make pool RW.
