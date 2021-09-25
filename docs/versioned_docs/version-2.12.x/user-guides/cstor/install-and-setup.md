---
id: install-and-setup
title: cStor User Guide - install and setup
slug: /user-guides/cstor
keywords:
  - cStor csi
  - cStor User Guide
  - Creating cStor storage pools
  - Creating cStor storage classes
description: This user guide will help you to configure cStor storage and use cStor Volumes for running your stateful workloads.
---

This user guide will help you to configure cStor storage and use cStor Volumes for running your stateful workloads.

:::note
If you are an existing user of cStor and have [setup cStor storage using StoragePoolClaim(SPC)](/concepts/cstor), we strongly recommend you to migrate to using CStorPoolCluster(CSPC). CSPC based cStor uses Kubernetes CSI Driver, provides additional flexibility in how devices are used by cStor and has better resiliency against node failures. For detailed instructions, refer to the [cStor SPC to CSPC migration guide](https://github.com/openebs/upgrade/blob/master/docs/migration.md).
:::

### Install and Setup

- [Pre-requisites](#prerequisites)
- [Creating cStor storage pools](#creating-cstor-storage-pools)
- [Creating cStor storage classes](#creating-cstor-storage-classes)

## Prerequisites

- cStor uses the raw block devices attached to the Kubernetes worker nodes to create cStor Pools. Applications will connect to cStor volumes using `iSCSI`. This requires you ensure the following:

  - There are raw (unformatted) block devices attached to the Kubernetes worker nodes. The devices can be either direct attached devices (SSD/HDD) or cloud volumes (GPD, EBS)
  - `iscsi` utilities are installed on all the worker nodes where Stateful applications will be launched. The steps for setting up the iSCSI utilities might vary depending on your Kubernetes distribution. Please see [prerequisites verification](/user-guides/prerequisites)

- If you are setting up OpenEBS in a new cluster. You can use one of the following steps to install OpenEBS. If OpenEBS is already installed, skip this step.

  Using helm,

  ```
  helm repo add openebs https://openebs.github.io/charts
  helm repo update
  helm install openebs --namespace openebs openebs/openebs --set cstor.enabled=true --create-namespace
  ```

  The above command will install all the default OpenEBS components along with cStor.

  Using kubectl,

  ```
  kubectl apply -f https://openebs.github.io/charts/cstor-operator.yaml
  ```

  The above command will install all the required components for running cStor.

- Enable cStor on already existing OpenEBS

  Using helm, you can enable cStor on top of your openebs installation as follows:

  ```
  helm ls -n openebs
  # Note the release name used for OpenEBS
  # Upgrade the helm by enabling cStor
  # helm upgrade [helm-release-name] [helm-chart-name] flags
  helm upgrade openebs openebs/openebs  --set cstor.enabled=true --reuse-values --namespace openebs
  ```

  Using kubectl,

  ```
  kubectl apply -f https://openebs.github.io/charts/cstor-operator.yaml
  ```

- Verify cStor and NDM pods are running in your cluster.

  To get the status of the pods execute:

  ```
  kubectl get pod -n openebs
  ```

  Sample Output:

  ```shell hideCopy
  NAME                                             READY   STATUS    RESTARTS    AGE
  cspc-operator-5fb7db848f-wgnq8                    1/1    Running       0      6d7h
  cvc-operator-7f7d8dc4c5-sn7gv                     1/1    Running       0      6d7h
  openebs-cstor-admission-server-7585b9659b-rbkmn   1/1    Running       0      6d7h
  openebs-cstor-csi-controller-0                    6/6    Running       0      6d7h
  openebs-cstor-csi-node-dl58c                      2/2    Running       0      6d7h
  openebs-cstor-csi-node-jmpzv                      2/2    Running       0      6d7h
  openebs-cstor-csi-node-tfv45                      2/2    Running       0      6d7h
  openebs-ndm-gctb7                                 1/1    Running       0      6d7h
  openebs-ndm-operator-7c8759dbb5-58zpl             1/1    Running       0      6d7h
  openebs-ndm-sfczv                                 1/1    Running       0      6d7h
  openebs-ndm-vgdnv                                 1/1    Running       0      6d7h
  ```

- Nodes must have disks attached to them. To get the list of attached block devices, execute:

  ```
  kubectl get bd -n openebs
  ```

  Sample Output:

  ```shell hideCopy
  NAME                                          NODENAME         SIZE         CLAIMSTATE  STATUS   AGE
  blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68  worker-node-3    21474836480   Unclaimed   Active   2m10s
  blockdevice-10ad9f484c299597ed1e126d7b857967  worker-node-1    21474836480   Unclaimed   Active   2m17s
  blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b  worker-node-2    21474836480   Unclaimed   Active   2m12s
  ```

## Creating cStor storage pools

You will need to create a Kubernetes custom resource called **CStorPoolCluster**, specifying the details of the nodes and the devices on those nodes that must be used to setup cStor pools. You can start by copying the following **Sample CSPC yaml** into a file named `cspc.yaml` and modifying it with details from your cluster.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
 name: cstor-disk-pool
 namespace: openebs
spec:
 pools:
   - nodeSelector:
       kubernetes.io/hostname: "worker-node-1"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-10ad9f484c299597ed1e126d7b857967"
     poolConfig:
       dataRaidGroupType: "stripe"

   - nodeSelector:
       kubernetes.io/hostname: "worker-node-2"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b"
     poolConfig:
       dataRaidGroupType: "stripe"

   - nodeSelector:
       kubernetes.io/hostname: "worker-node-3"
     dataRaidGroups:
       - blockDevices:
           - blockDeviceName: "blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68"
     poolConfig:
       dataRaidGroupType: "stripe"
```

- Get all the node labels present in the cluster with the following command, these node labels will be required to modify the CSPC yaml.

  ```
  kubectl get node --show-labels
  ```

  Sample Output:

  ```shell hideCopy
    NAME               STATUS   ROLES    AGE    VERSION   LABELS

    master             Ready    master   5d2h   v1.20.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=master,kubernetes.io/os=linux,node-role.kubernetes.io/master=

    worker-node-1      Ready    <none>   5d2h   v1.20.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=worker-node-1,kubernetes.io/os=linux

    worker-node-2      Ready    <none>   5d2h   v1.20.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=worker-node-2,kubernetes.io/os=linux

    worker-node-3      Ready    <none>   5d2h   v1.18.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=worker-node-3,kubernetes.io/os=linux
  ```

- Modify the CSPC yaml to use the worker nodes. Use the value from labels `kubernetes.io/hostname=&lt; node_name &gt;`. This label value and node name could be different in some platforms. In this case, the label values and node names are: `kubernetes.io/hostname:"worker-node-1"`, `kubernetes.io/hostname: "worker-node-2"` and `kubernetes.io/hostname: "worker-node-3"`.

- Modify CSPC yaml file to specify the block device attached to the above selected node where the pool is to be provisioned. You can use the following command to get the available block devices on each of the worker node:

  ```
  kubectl get bd -n openebs
  ```

  Sample Output:

  ```
  NAME                                          NODENAME         SIZE         CLAIMSTATE  STATUS   AGE
  blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68  worker-node-3    21474836480   Unclaimed   Active   2m10s
  blockdevice-10ad9f484c299597ed1e126d7b857967  worker-node-1    21474836480   Unclaimed   Active   2m17s
  blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b  worker-node-2    21474836480   Unclaimed   Active   2m12s
  ```

- The `dataRaidGroupType:` can either be set as `stripe` or `mirror` as per your requirement. In the following example it is configured as `stripe`.

  We have named the configuration YAML file as `cspc.yaml`. Execute the following command for CSPC creation,

  ```
  kubectl apply -f cspc.yaml
  ```

  To verify the status of created CSPC, execute:

  ```
  kubectl get cspc -n openebs
  ```

  Sample Output:

  ```shell hideCopy
  NAME                   HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES     AGE
  cstor-disk-pool        3                  3                      3                    2m2s
  ```

  Check if the pool instances report their status as **ONLINE** using the below command:

  ```
  kubectl get cspi -n openebs
  ```

  Sample Output:

  ```shell hideCopy
  NAME                  HOSTNAME             ALLOCATED   FREE    CAPACITY   STATUS   AGE
  cstor-disk-pool-vn92  worker-node-1        60k         9900M    9900M     ONLINE   2m17s
  cstor-disk-pool-al65  worker-node-2        60k         9900M    9900M     ONLINE   2m17s
  cstor-disk-pool-y7pn  worker-node-3        60k         9900M    9900M     ONLINE   2m17s
  ```

  Once all the pods are in running state, these pool instances can be used for creation of cStor volumes.

## Creating cStor storage classes

StorageClass definition is an important task in the planning and execution of OpenEBS storage. The real power of CAS architecture is to give an independent or a dedicated storage engine like cStor for each workload, so that granular policies can be applied to that storage engine to tune the behaviour or performance as per the workload's need.

Steps to create a cStor StorageClass

1. Decide the CStorPoolCluster for which you want to create a Storage Class. Let us say you pick up `cstor-disk-pool` that you created in the above step.
2. Decide the replicaCount based on your requirement/workloads. OpenEBS doesn't restrict the replica count to set, but a **maximum of 5** replicas are allowed. It depends how users configure it, but for the availability of volumes **at least (n/2 + 1) replicas** should be up and connected to the target, where n is the replicaCount. The Replica Count should be always less than or equal to the number of cStor Pool Instances(CSPIs). The following are some example cases:
   - If a user configured replica count as 2, then always 2 replicas should be available to perform operations on volume.
   - If a user configured replica count as 3 it should require at least 2 replicas should be available for volume to be operational.
   - If a user configured replica count as 5 it should require at least 3 replicas should be available for volume to be operational.
3. Create a YAML spec file `cstor-csi-disk.yaml` using the template given below. Update the pool, replica count and other policies. By using this sample configuration YAML, a StorageClass will be created with 3 OpenEBS cStor replicas and will configure themselves on the pool instances.

   ```
   kind: StorageClass
   apiVersion: storage.k8s.io/v1
   metadata:
     name: cstor-csi-disk
   provisioner: cstor.csi.openebs.io
   allowVolumeExpansion: true
   parameters:
     cas-type: cstor
     # cstorPoolCluster should have the name of the CSPC
     cstorPoolCluster: cstor-disk-pool
     # replicaCount should be <= no. of CSPI created in the selected CSPC
     replicaCount: "3"
   ```

   To deploy the YAML, execute:

   ```
   kubectl apply -f cstor-csi-disk.yaml
   ```

   To verify, execute:

   ```
   kubectl get sc
   ```

   Sample Output:

   ```shell hideCopy
   NAME                        PROVISIONER                                                RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
   cstor-csi                   cstor.csi.openebs.io                                       Delete          Immediate              true                   4s
   ```
