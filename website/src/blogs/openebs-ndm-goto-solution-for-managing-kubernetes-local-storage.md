---
title: OpenEBS NDM, go-to solution for managing Kubernetes Local Storage
author: Akhil Mohan
author_info: Software Engineer @ MayaData, working on Cloud Native Tech.
tags: OpenEBS
date: 13-01-2021
excerpt: Read about OpenEBS NDM, the go-to solution for managing Kubernetes Local Storage.
--- 

Ever since Local Volumes have become generally available (GA) in Kubernetes 1.14, the use of Local Volumes has skyrocketed. This can be attributed to the nature of cloud-native workloads distributed in nature and can sustain node failures. The bare metal underpinning Kubernetes clusters, both on-prem and cloud, can now be configured with local storage to manage stateful workloads. Kubernetes doesn’t treat storage like a native resource on par with CPU or Memory, making it a little difficult to make Kubernetes work out of the box to create effective node-attached storage. OpenEBS NDM helps alleviate this gap by discovering the different storage types attached to each worker node and then creating Kubernetes resources called block devices.

Application or storage operators can then use the information exposed via block devices to determine how to orchestrate the workloads best.

OpenEBS NDM (Node Device Manager) has been declared GA after being deployed in production for several months as part of the OpenEBS control plane. With the release of version 1.0, NDM adds out-of-the-box support for partitions, LVMs, LUKS encrypted devices, in addition to the unique identification of virtual disks within the cluster. Now offering support for partitions, a single disk can be partitioned. Each partition will be considered a separate block device used by different storage engines like cStor / local PV. NDM also tracks the movement of the devices within a cluster across the nodes.

## Key Storage Problems solved by NDM

* Local Storage Discovery - detecting partitions, devices used as a LUKS device or LVM device, or if it can be accessed as a raw block device.
* Cluster-wide storage visibility
* Detect the movement of storage devices across nodes
* Book-keeping/storage asset management  - allocating/reserving, which type of storage should be provided to which workloads.

## Getting Started with NDM

Let us see how NDM helps detect the block devices in the cluster with 3 nodes, each having a completely different disk configuration. The Disk configuration of the nodes are as follows:

Master: 2 virtual disks

Worker1: 3 virtual disks, one being used by LUKS and two other disks which are partitioned, several partitions are being used as PV's by the LVM.

![](https://lh3.googleusercontent.com/7r1RKQF4udqvigbryA6XFOxRuoOccQSFqhM5C_e27ArTSXnsXIXZk7b3lwgJm4C2VxxWj4rHoED-pZl4PS_KVkF_SC4D2-NLJzokpg2cqlP2upSNva5PLCaBKtQCBueUhWFYTtS9)


Worker 2: 4 physical disks

* Deploy NDM into the Kubernetes cluster along with OpenEBS LocalPV
    ```
    kubectl apply -f https://openebs.github.io/charts/openebs-operator-lite.yaml
    ```
    (The latest helm charts for deploying NDM are available [here](https://openebs.github.io/node-disk-manager/))

* Once deployed, check the blockdevices present in the cluster using
    ```
    kubectl get bd -n openebs -o wide
    ```

![](https://lh4.googleusercontent.com/v-iVUrfW6v3wSaXmb06pbek7as_RfFTlRJCmsPzhmId460JIsP0LvXVDBkA0FUnBdO3yt203HqHIBYorT-nP6ZtCZTKdRcao0Ws3tlNyvz8yQF9ytQN_UXxbyO9ZFs6-PeLYHQOD)

Some block devices show partitions that did not exist initially. E.g., sdb1 instead of sdb. This is because NDM creates a partition on virtual disks to identify the disk uniquely. Also, block device resources are now created for LVMs and LUKS encrypted devices. All the block devices listed above will now be treated as individual devices and can be used by any storage engine.

* Deploy a sample application to use the block device

Download the minio yaml and apply it. (NOTE: A node selector has been added to the minio application pod so that it gets scheduled on worker-1)
```
kubectl apply -f [minio-official.yaml](https://gist.githubusercontent.com/akhilerm/194a1606c514d8930addcaef56f9f19f/raw/7d339e5042b4e5e958dde558f1f3509e26c214f3/minio-official.yaml)
```
Now check the status of block devices again  

![](https://lh3.googleusercontent.com/A_JL0jXsZhmIPPrRYCSeMHVcPsey6ahFYV1_LVUapmbPLTrcgGEAao_ohbx9zU_SZl-lHmKGYgdMqh4czUCISSezbcOi4rznQNuX0sTAomO4y5HQLVYicTD4s1mPOZfUciacEOU_)

We can see that the device `dm-2`, is the LUKS device, has been claimed and used by the application.

* Pool movement across nodes

  NDM helps in seamlessly moving cStor pools from one node to another. Whenever the devices that constitute a pool are moved from one node to another (disconnecting disks from one node and reconnecting on another), the block device resource is updated with the latest information. NDM tracks this movement. cStor can use this information to migrate pools as required.

* Reserving storage for workloads

  NDM provides a feature to reserve devices for certain workloads. E.g., Users can reserve all SSDs for a performance intensive workload. This reservation is achieved using block-device-tags. More information on using block-device-tags with LocalPV can be found [here](https://docs.openebs.io/docs/next/uglocalpv-device.html#optional-block-device-tagging).

## Future Roadmap

* Southbound provisioning
* Metrics (currently in alpha)
* API Service to interact with NDM
* Ability to create partitions or LVM volume groups - preparing storage in general.

## Interested in Contributing to NDM?

NDM is an OpenEBS project, which itself is a CNCF sandbox project. [OpenEBS on GitHub](https://github.com/openebs/node-disk-manager) is a great place to join if you want to contribute to our codebase. You can also interact with us on the OpenEBS channel in [Kubernetes Slack](https://kubernetes.slack.com/?redir=%2Fmessages%2Fopenebs%2F).