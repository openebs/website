---
title: Scaling up cStor Volume Replica
author: Abhishek
author_info: Abhishek is a Customer Success Engineer at Mayadata. He is currently working with Kubernetes and Docker.
date: 07-10-2020
tags: OpenEBS
excerpt: OpenEBS provides volume replication through different storage engines. Learn how to scale up cStor Volume Replica.
---

Even if a cluster is reliable, nodes can and do fail. Rebooting a node does not simulate a crash. There can be many reasons, such as catastrophic hardware failure, Operating System failure, or communication failure among the nodes. To overcome this hazardous situation, the Replication of volume becomes necessary.

Replication is the process by which one or more volumes can be copied to maintain the significance of a cluster and to avoid data loss. OpenEBS provides volume replication through different storage engines. One of them is cStor Volume Replication.
![Synchronous replication of data](https://lh5.googleusercontent.com/ijS24Ywabw-QkWWYbSLoOshGTi2SHZhdEFATaHIYbkNGK8lUq5SJrct6fNHfPjWcPTHGyvByS7uD1vYct2m5D6-HdRC2ZoMpS_c4Crw-9sREhPU-tXE8KAt-nWj7vYw99Ee_s1pE)
#### Prerequisite for scaling up the replicas of cStor volume:

- A cStor pool should be available, and replicas of this cStor volume should not be present on this cStor pool.
- The OpenEBS version should be 1.3.0 or more.

### Please follow the below steps for cStor Volume Replication:

Get the StorageClass name using the following command:

    kubectl get sc

Example Output:
![](https://lh5.googleusercontent.com/lTma7ZqsAavmXEzGG_b4BXDMUEYXjFXf0xxnWgE70znfR_EzP3IorVFp0evkKoLMsBQ0D7gwOQxivB_bZxEcv2vhYZOe17k7mNyDBaPewTgiUdusrd3ow12ClBeQvZVmVzjDrdsI)
The storage class for cStor is ***openebs-sc-cstor***. Perform the following command to get the details of the corresponding StorageClass, which is used for creating the cStor volume :

    Kubectl get sc openebs-sc-cstor

We will get the Yaml file of the corresponding StorageClass ***openebs-sc-cstor***.
![](https://lh5.googleusercontent.com/81DQJ-DhT3AKseMRfCZ4NpkmOPl2Tckm76jrUxE2eECY7lrejvNz3OjomFWmNiCRwm0L2seAWzmJJhe-8xcqFirBsEUedf2xzPN4NHq2RM2YYEZZv-iKpsE03j06EQi_D5kqnDCi)
In the Yaml above, We can see the Replica count Value is 1.

Get the volume name using the following command:

    Kubectl get pvc

Get the VOLUME name and use it in the following command to get the details of corresponding cStor volume. All commands are performed by considering the above PVC.

    kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=<Vol-name>

Example output:
![](https://lh4.googleusercontent.com/FIOJchscq3lm7UJLwnk7i1oNne_RxhjIJzI3FMANxxkRhz4yWZAue-Wu1jD03ii2aMjtdDu3zr9C-0ZGaeazkvxb_JkGnxBBDza605w_p-v9BY1ER40f6DityHwimJvhvuAR8FcT)
Get the details of existing cStor Volume Replica details using the following command:

    kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8

Example output:
![](https://lh3.googleusercontent.com/68NvgkfD7audTNZN1QLt6SVw4OvN_B3MIlnFnWm8MfgDziiexFX2qeI3tX6H1TCJJgrCA8b-nZQJoM6hx1QoYWOv4q74tKwB7nrZLc9xdluXRCvWTpj-sU6sIv7aJ0AMgL3rr1AR)
Perform the following command to get complete details of the existing cStor volume replica:

    kubectl get cvr -n openebs -l openebs.io/persistent-volume=pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8

Get the available cStor Pools for creating new cStor volume replica. The following command will get the other associated cStor pools details:

    kubectl get csp -l openebs.io/storage-pool-claim=cstor-disk-pool | grep -v cstor-disk-pool-hgt4

Example Output:
![](https://lh6.googleusercontent.com/lcbO830nSZgValr-I4ci7FHRa6Qvqf3eG-bycWHHAniRD8mb8dwRHOwxeVObFqj4FqvXbNkb_oZUdWhMgAQuHvU1pYDecvWXhDetYGdJADBQhWfzMuwJm4d9Ywgg6bAKkj-Sd79a)
From the above example output, there are 2 cStor pools available, i.e., ***cstor-disk-pool-2phf*** and ***cstor-disk-pool-zm8l***. So it is possible to scale up the current volume replica count to 3 from 1. If there are no cStor pools available to perform volume replica scale-up, then follow the [steps](https://docs.openebs.io/docs/next/ugcstor.html#expanding-cStor-pool-to-a-new-node) to create a new cStor pool by updating existing SPC configuration.

Perform the following command to get the details of the cStor Pool where new replica will be created:

    kubectl get csp -n openebs cstor-disk-pool-2phf -oyaml

Note down following parameters from the output:

- metadata.labels.cstorpool.openebs.io/name
- metadata.labels.cstorpool.cstorpool.openebs.io/uid
- metadata.annotations.cstorpool.openebs.io/hostname

The sample CVR Yaml is provided below:
![](https://lh3.googleusercontent.com/JePqVqyIryf396SEkCf9NoS3kmPDXM0huqehkN3kX5f-eE7nX3-mCr42xriJeDKSNRgfVxSeQG_SUHkbqEZS4ktIzzcJ8VKCsFXuz4VhtdXpikLADE3eJdkgwH3zFd5PXRPfYc70)
Apply the updated CVR YAML spec to create the new replica of cStor volume using the following command:

    kubectl apply -f cvr.yaml

Example Output:
![](https://lh5.googleusercontent.com/JElB0d8zFXHoUh6wM0QpAshOmYbVXOvH5RIR9UjJ_svM67ZR2pq6cQ4ckrq0Qw6ACpRnOqO-6nUbvLUrDhFKvgZxjrh-ke0VHnKW-pR2oyzkgXdQuRATSwy9EVN19G458ZyR_9Xd)
Verify if new CVR is created successfully using the following command:

    kubectl get cvr -n openebs

Example output:
![](https://lh4.googleusercontent.com/ql9j6Zcod6DT1vKhJrlJJaxk4YUN8Mf_o7LT3e-fBjjoybINByEwwDS5fln6K5BEJGW6vFfE8h2JA_2tFvQY5PQKo62eJvQfTE5j5JwECIz2oO3u_ypKHWRylL3gmU4KYlo4axtU)
From the above output, a new replica of the cStor volume is created, and STATUS is showing as Offline.

Update Desired Replication Factor in cStor volume with a new replica count. This can be updated by editing corresponding cStor volume CR YAML.

    kubectl edit cstorvolume pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8 -n openebs

The following is the snippet of updated cStor volume CR YAML:
![](https://lh3.googleusercontent.com/lAisXwgequP2MyeCw1cVuwUYFG9G9L5U88olJ2CjbjIOpHjlMwn-K8p11ktaCjQfxK-u5EL-ebpZofD0W_LOKmfFa-wW3eTLtBpqSt7EPYvz5rQciYeaFdT6_7PCsJkdxPVHZCVg)

In the above snippet, the desiredReplicationFactor is updated to 2 from 1. Example output:
![](https://lh6.googleusercontent.com/uBkJft958gfjATk070ZFZOMXaq7Sb1xnd5lBVMa2sKuXo-nxwrRxQS58TPgdpoLjMuMHvT4LwPscxPdT6kgwpaDVSraLmsNwWhfanMUrNVO72K8WgxwT3_or4EdzqQkWBgI-Ka84)
Verify if the rebuilding has started on the new replica of the cStor volume. Once rebuilding has been completed, it will update its STATUS as Healthy. Get the latest status of the CVRs using the following command:

    kubectl get cvr -n openebs

Example output:
![](https://lh6.googleusercontent.com/1KjmeLgtvoFcBh0vVmB0iwj_gjo-Tkd3vVTTmaw3OaREY9KbvDUQLqyEu0Hj_aYKDpTIRSDVG2sOrTPMczJAPASlzFitSHDyocPV4Bb6IgajW-ArUpDKhi8StFesnHYZrUc3X9DJ)
