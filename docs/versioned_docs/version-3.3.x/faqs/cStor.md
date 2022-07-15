---
id: cstor-faq
title: cStor FAQs
keywords: 
 - cStor FAQ
 - FAQs
description: The FAQ section about cStor helps to address common concerns, questions, and objections that users have about cStor.
---

[Prerequisites to run CStor-CSI in rancher based clusters](#prerequisites-for-rancher)

[How to verify cStor volume is running fine?](#verify-cstor-volume-running-fine)

[How to handle replicas with slow disks or slow connectivity in case of cStor volumes?](#slow-replicas-in-cstor-volumes)

[How OpenEBS detects disks for creating cStor Pool?](#how-openebs-detects-disks-for-creating-cstor-pool)

[What is the difference between cStor Pool creation using manual method and auto method?](#what-is-the-difference-between-cstor-pool-creation-using-manual-method-and-auto-method)

[How the data is distributed when cStor maxPools count is 3 and replicaCount as 2 in StorageClass?](#how-the-data-is-distributed-when-cstor-maxpools-count-is-3-and-replicacount-as-2-in-storageclass)

[How to create a cStor volume on single cStor disk pool?](#create-cstor-volume-single-disk-pool)

[How to get the details of cStor Pool, cStor Volume Replica , Cstor Volumes and Disks ?](#more-info-pool-cvr-cv-disk) 


---

### What are the prerequisites to run CStor-CSI in rancher based clusters {#prerequisites-for-rancher}

For RancherOS, 
If the operating system used is RancherOS, the iSCSI service needs to be enabled. Once it is enabled it must be started on each of the worker nodes.
To run iSCSI services, execute the following commands on each of the cluster hosts or nodes.

```
sudo ros s enable open-iscsi
sudo ros s up open-iscsi
```

Next, run the below mentioned commands on all the nodes. This ensures that these directories are persistent, by default they are ephemeral.

```
ros config set rancher.services.user-volumes.volumes  [/home:/home,/opt:/opt,/var/lib/kubelet:/var/lib/kubelet,/etc/kubernetes:/etc/kubernetes,/var/openebs]
system-docker rm all-volumes
reboot
```

 For Ubuntu or RHEL, 

 If the operating system is Ubuntu or RHEL the following needs to be done, 
  + Verify if iSCSI initiator is installed and its services are running.
  
  The following list of commands can be used to install and verify iSCSI services on the nodes 

| OPERATING SYSTEM | ISCSI PACKAGE         | COMMANDS                                                 |
| ---------------- | --------------------- | -------------------------------------------------------- |
| RHEL/CentOS      | iscsi-initiator-utils | <ul><li>sudo yum install iscsi-initiator-utils -y</li><li>sudo systemctl enable --now iscsid</li><li>modprobe iscsi_tcp</li><li>echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf</li></ul> |
| Ubuntu/ Debian   | open-iscsi            |  <ul><li>sudo apt install open-iscsi</li><li>sudo systemctl enable --now iscsid</li><li>modprobe iscsi_tcp</li><li>echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf</li></ul>|

  + Add the extra_binds under Kubelet service in cluster YAML file to mount the iSCSI binary and configuration inside the kubelet.
    After installing the iSCSI initiator on your nodes, bind them into the kubelet container by editing rancher cluster.yaml, as shown in the sample below.
    
      ```
      services:
      kubelet: 
        extra_binds: 
          - "/etc/iscsi:/etc/iscsi"
          - "/sbin/iscsiadm:/sbin/iscsiadm"
          - "/var/lib/iscsi:/var/lib/iscsi"
          - "/lib/modules"
      ```

[Go to top](#top)

### How to verify cStor volume is running fine? {#verify-cstor-volume-running-fine}

The following steps will help to verify the cStor volume running status.

1. Check PVC is created successfully using the following command.

   ```shell
   kubectl get pvc -n <namespace>
   ```

2. If PVC is created successfully, check corresponding PV is also created successfully.

    ```
    kubectl get pv
    ```

3. Check the corresponding target pod of the cStor volume is running using the following command. 

    ```
    kubectl get pod -n openebs 
    ```

   The target pod should be in running state.

4. Now check the status of cStor volume using the following command.

    ```
    kubectl get cstorvolume -n openebs
    ```

   The output of above command will show status as `Offline` , `Degraded` and `Healthy` . Following are the definition for each of these status.

   **Init:** Init status of cStor volume is due to the following cases:

   - when the cStor volume is created.
   - when the replicas are not connected to target pod.

   **Healthy:** Healthy status of cStor volume represents that 51% of healthy replicas are connected to the target and volume is ready IO operations.

   **Degraded:** Minimum 51% of replicas are connected and some of these replicas are in  degraded state, then volume will be running as degraded state and IOs are operational in this state.

   **Offline:** When number of replicas which is equal to Consistency Factor are not yet connected to the target due to network issues or some other reasons In this case, volume is not ready to perform IOs.

   Note: If target pod of corresponding cStor volume is not running, then the status of cStor volume shown in the output of above command may be stale.

5. Check the cStorVolumeReplica(CVR) status of the corresponding cStor volume using the following command.

    ```
    kubectl get cvr -n openebs
    ```

   Status of each cStor volume Replica can be found under `STATUS` field.

   **Note:** If the pool pod of corresponding cStor volume replica is not running, then the status of CVR shown in the output of the above command may be stale.

   The following are the different type of STATUS information of cStor Volumes Replica and their definition.

   **Healthy:** Healthy state represents volume is healthy and volume data existing on this replica is up to date.

   **Offline:** cStor volume replica status is offline due to the following cases:

   - when the corresponding cStor pool is not available to create volume.
   - when the creation of cStor volume fails.
   - when the replica is not yet connected to the target.
   
   **Degraded:** cStor volume replica status is degraded due to the following case
   
   - when the cStor volume replica is connected to the target and rebuilding is not yet started on this replica.
   
   **Rebuilding:** cStor volume replica status is rebuilding when the cStor volume replica is undergoing rebuilding, that means, data sync with another replica.
   
   **Error:** cStor volume replica status is in error state due to the following cases:
   
   - when the volume replica data set is not existing in the pool.
   - when an error occurs while getting the stats of cStor volume.
   - when the unit of size is not mentioned in PVC spec. For example, if the size is 5 instead of 5G.
   
   **DeletionFailed:** cStor volume replica status is deletion failed while destroying cStor volumes fails.
   
   **Invalid:** cStor volume replica status is invalid when a new cstor-pool-mgmt container in a new pod is communicating with the old cstor-pool container in an old pod.
   
   **Init:** cStor volume replica status init represents the volume is not yet created.
   
   **Recreate:** cStor volume replica status recreate represents an intermediate state before importing the volume(this can happen only when pool pod got restarted) in case of a non-ephemeral disk. If the disk is ephemeral then this status represents volume is going to recreate.
   
   **NewReplicaDegraded:** cStor volume replica is newly created and it make successful connection with the target pod. 
   
   **ReconstructingNewReplica:** cStor volume replica is newly created and it started reconstructing entire data from another healthy replica.


### How to handle replicas with slow disks or slow connectivity in case of cStor volumes? {#slow-replicas-in-cstor-volumes}

CStor target pod disconnects a replica if IO response is not received from a replica within 60 seconds. This can happen due to slow disks in cStor pools or slow connectivity between target pod and cStor pool pods. In order to allow tuning of IO wait time from its default value of 60 seconds, there is an environment variable IO_MAX_WAIT_TIME in `cstor-istgt` container of target pod.
Add below kind of configuration in target pod deployment under `env` section of `cstor-istgt` container:

```
    env:
    - name: IO_MAX_WAIT_TIME
        value: 120
```

Please note that target pod gets restarts which can impact ongoing IOs.

### How OpenEBS detects disks for creating cStor Pool?

Any block disks available on the node (that can be listed with say `lsblk` ) will be discovered by OpenEBS. 
Node Disk Manager(NDM) forms the BlockDevice CRs in the following way

* Scan the list of disks.
* Filter out the OS disks
* Filter out any other disk patterns that are mentioned in `openebs-ndm-config` under `Configmap` in `openebs-operator.yaml`.

NDM do some filtering on the disks to exclude, for example boot disk. By default, NDM excludes the following device path to create blockdevice CR. This configuration is added in `openebs-ndm-config` under `Configmap` in `openebs-operator.yaml` .

```
/dev/loop - loop devices.
/dev/fd - file descriptors.
/dev/sr - CD-ROM devices.
/dev/ram - ramdisks.
/dev/dm -lvm.
/dev/md - multiple device ( software RAID devices).
/dev/rbd - ceph block devices 
/dev/zd - zfs volumes
```

It is also possible to customize by adding more disk types associated with your nodes. For example, used disks, unwanted disks and so on. This change must be done in the 'openebs-operator.yaml' file that you have downloaded before OpenEBS installation.

**Example:**

```
  filterconfigs:
    - key: path-filter
      name: path filter
      state: true
      include: ""
      exclude: "/dev/loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md,/dev/rbd,/dev/zd"
```

[Go to top](#top)
### What is the difference between cStor Pool creation using manual method and auto method?

By using manual method, you must give the selected disk name which is listed by NDM. This details has to be entered in the StoragePoolClaim YAML under `diskList` . See [storage pool](/deprecated/spc-based-cstor#creating-cStor-storage-pools) for more info. 
It is also possible to change `maxPools` count and `poolType` in the StoragePoolClaim YAML. 
Consider you have 4 nodes with 2 disks each. You can select `maxPools` count as 3, then cStor pools will be created in any 3 nodes out of 4. The remaining disks belonging to 4th Node can be used for horizontal scale up in future.
Advantage is that there is no restriction in the number of disks for the creation of cStor storage pool using `striped` or `mirrored` Type.

By auto method, its not need to provide the disk details in the StoragePoolClaim YAML. You have to specify `maxPools` count to limit the storage pool creation in OpenEBS cluster and `poolType` for the type of storage pool such as Mirrored or Striped.  See [storage pool](/deprecated/spc-based-cstor#creating-cStor-storage-pools) for more info.

But the following are the limitations with this approach.

1. For Striped pool, it will take only one disk per Node even Node have multiple disks.
2. For Mirrored pool, it will take only 2 disks attached per Node even Node have multiple disks.

Consider you have 4 nodes with 4 disks each. If you set `maxPools` as 3 and `poolType` as `striped` , then Striped pool will created with Single disk on 3 Nodes out of 4 Nodes.
If you set `maxPools` as 3 and `poolType` as `mirrored` , then Mirrored cStor pool will create with single Mirrored pool with 2 disks on 3 Nodes out of 4 Nodes.

[Go to top](#top)
   
### How the data is distributed when cStor maxPools count is 3 and replicaCount as 2 in StorageClass?

If `maxPool` count is 3 in StoragePoolClaim, then 3 cStor storage pools will be created if it meets the required number of nodes, say 3 in this example.
If `replicaCount` is 2 in StorageClass, then 2 replicas of an OpenEBS volume will be created on the top of any 2 cStor storage pool out of 3.

[Go to top](#top)
### How to create a cStor volume on single cStor disk pool?

You can give the maxPools count as 1 in StoragePoolClaim YAML and `replicaCount` as `1` in StorageClass YAML. In the following sample SPC and SC YAML, cStor pool is created using auto method. After applying this YAML, one cStor pool named cstor-disk will be created only in one Node and `StorageClass` named `openebs-cstor-disk` . Only requirement is that one node has at least one disk attached but unmounted. See [here](/additional-info/faqs#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume) to understand more about disk mount status.

```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  maxPools: 1
  poolSpec:
    poolType: striped
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "1"
provisioner: openebs.io/provisioner-iscsi
```

[Go to top](#top)

### How to get the details like status, capacity etc. of cStor Pool, cStor Volume Replica, cStor Volumes and Disks using kubectl command? {#more-info-pool-cvr-cv-disk}

From 0.8.1 onwards, following command list down the info like status, size etc. using `kubectl get` command. These command will output similar to the following only if Kubernetes version of client and server are above 1.11.

The following command  will give the details of cStor Storage Pool.

```
kubectl get csp -n openebs
```

Following is an example output.

```shell hideCopy
NAME                     ALLOCATED   FREE    CAPACITY    STATUS    TYPE       AGE
sparse-claim-auto-lja7   125K        9.94G   9.94G       Healthy   striped    1h
```

The following command  will give the details of replica status of each cStor volume created in `openebs` namespace.

```
kubectl get cvr -n openebs
```

Following is an example output.

```shell hideCopy
NAME                                                              USED  ALLOCATED  	STATUS    AGE
pvc-9ca83170-01e3-11e9-812f-54e1ad0c1ccc-sparse-claim-auto-lja7   6K    6K         Healthy   1h
```

The following command  will give the details of cStor volume created in `openebs` namespace.

```
kubectl get cstorvolume -n openebs
```

Following is an example output.

```shell hideCopy
NAME                                        STATUS    AGE
pvc-9ca83170-01e3-11e9-812f-54e1ad0c1ccc    Healthy   4h
```

The following command will give the details disks that are attached to all Nodes in the cluster.

```
kubectl get disk
```

Following is an example output.

```shell hideCopy
NAME                                      SIZE          STATUS   AGE
sparse-5a92ced3e2ee21eac7b930f670b5eab5   10737418240   Active   10m
```

[Go to top](#top)