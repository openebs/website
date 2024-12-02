---
id: eks-isv
title: Replicated PV Mayastor Installation on Amazon Elastic Kubernetes Service with Instance Store Volumes
keywords:
 - Replicated PV Mayastor Installation on Amazon Elastic Kubernetes Service with Instance Store Volumes
 - Replicated PV Mayastor Installation on EKS with Instance Store Volumes
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - Elastic Kubernetes Service with Instance Store Volumes
 - EKS
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on Amazon Elastic Kubernetes Service with Instance Store Volumes

This document provides instructions for installing Replicated PV Mayastor on Amazon Elastic Kubernetes Service (EKS) with Instance Store Volumes. Replicated PV Mayastor is designed to work with Amazon EKS with Instance Store Volumes. It provides high-performance storage for stateful applications running in a Kubernetes environment. 

Using OpenEBS Replicated PV Mayastor in EKS with Instance store volumes addresses many of the limitations associated with the ephemeral nature of local SSDs by introducing a layer of persistent storage management. Here's how OpenEBS helps mitigate these limitations:

**Data Persistence through Replication**

- OpenEBS abstracts the underlying storage (Instance store volumes) into a set of persistent volumes. Even if local SSDs are inherently ephemeral, OpenEBS can ensure data persistence by replicating the data across multiple worker nodes.

- For instance, using OpenEBS with replication (Example: 2 or 3 replicas), ensures that even if one node fails or is terminated, the data exists on other nodes, avoiding data loss.

- Without OpenEBS, if a node with Instance store volumes is terminated, all the data is lost. OpenEBS ensures the data is replicated to other nodes, so even if the original node is lost, the data persists elsewhere.

In AWS Elastic Kubernetes Service (EKS), when provisioning worker nodes with instance store volumes, the storage provided by these SSDs is ephemeral due to the following reasons:

1. Instance Store Characteristics

  - **Physical Attachment to Hardware:** In AWS EC2 instances, instance store volumes are physically attached to the underlying hardware (i.e., the host machine running the instance). This configuration provides high-speed access but is inherently non-persistent.
  
  - **Data Loss on Instance Stop or Termination:** When an EC2 instance is stopped, terminated, or fails, the instance store is automatically wiped, resulting in the loss of any data on those volumes. This is a design of instance store volumes and applicable across all AWS services, including EKS.

2. Ephemeral Storage by Design

  - Local SSDs in EC2 instances are designed for temporary storage of data that does not need to persist beyond the instance's lifecycle, such as caches, scratch data, or intermediary results.

  - In a Kubernetes environment, this storage type is typically used for temporary logs, caches, or data that can be readily recreated. However, instance store volumes are unsuitable for long-term or critical data storage because the data will be lost if the node is replaced or terminated.

3. Kubernetes Dynamic Scheduling

  In EKS (or any Kubernetes environment), worker nodes can be dynamically scaled up or down, and nodes can be replaced when they fail. If an EKS node using Instance store volumes is replaced, the new node will not have access to the data stored on the local SSD of the previous node.

4. Pod Displacement and Node Termination

  In Kubernetes, pods can be scheduled on any node in the cluster. When a node is terminated or fails, pods may be rescheduled on another node. Any data stored on the terminated node’s instance store SSDs is lost, leading to potential data loss unless the data is persisted using an external storage solution like EBS or S3.

5. Use Case Limitations in EKS

  Although local SSDs offer high performance and low-latency storage suitable for temporary data such as logs or caching, they are not designed for persistent storage needs within EKS.


## Prerequisites

Before installing Replicated PV Mayastor, make sure that you meet the following requirements:

- **Hardware Requirements**

    Your machine type must meet the requirements defined in the [prerequisites](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md#prerequisites).

- **EKS Nodes**

    You need to configure launch templates to create node groups with hardware/OS/kernel requirements. When using the synchronous replication feature (N-way mirroring), the number of worker nodes on which IO engine pods are deployed should be no less than the desired replication factor. 

- **Additional Disks**

    Additional storage disks for nodes can be added during the cluster creation using launch templates. Each Instance store volumes disk comes in a fixed size. The number of disks that you can attach to a VM depends on the VM's machine type. In this guide, we are using m5d.4xlarge machine type.

- **Ports**

    Ensure security groups are having the OpenEBS ports allowed. Refer to the [Replicated PV Mayastor Installation Documentation](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md#network-requirements) for more details.

- **Enable Huge Pages**
    
    2MiB-sized Huge Pages must be supported and enabled on the storage nodes i.e. nodes where IO engine pods are deployed. A minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the IO engine pod on each node.
    Secure Socket Shell (SSH) to the EKS worker node to enable huge pages.

- **Kernel Modules**

    SSH to the EKS worker nodes to load nvme_tcp modules.

    ```
    modprobe nvme_tcp
    ```

- **Preparing the Cluster**

    Refer to the [Replicated PV Mayastor Installation Documentation](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md#preparing-the-cluster) for instructions on preparing the cluster.

## Install Replicated PV Mayastor on Amazon EKS

- Refer to the [OpenEBS Installation Documentation](../../../quickstart-guide/installation.md#installation-via-helm) to install Replicated PV Mayastor using Helm.
- Refer to the [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/ebs-csi.html#managing-ebs-csi) to install Amazon EBS CSI driver add-on during the cluster creation.

:::note
EKS storage class should be used for ETCD and LOKI.
:::

- **Helm Install Command**

**Command**

```
kubectl get sc
```

**Output**

```
NAME            PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
ebs-sc          ebs.csi.aws.com         Retain          WaitForFirstConsumer   false                  4s
gp2 (default)   kubernetes.io/aws-ebs   Delete          WaitForFirstConsumer   false                  171m
```

**Helm Install Command**

```
helm install openebs --namespace openebs openebs/openebs --create-namespace --set mayastor.etcd.localpvScConfig.enabled=false --set mayastor.etcd.persistence.enabled=true --set mayastor.etcd.persistence.storageClass=ebs-sc --set mayastor.loki-stack.localpvScConfig.enabled=false --set mayastor.loki-stack.loki.persistence.enabled=true --set mayastor.loki-stack.loki.persistence.storageClassName=ebs-sc
```

**Command**

```
root@ip-172-31-2-236:~# kubectl get pods -n openebs
```

**Output**

```
NAME                                              READY   STATUS    RESTARTS   AGE
openebs-agent-core-7454f6cc79-hhjfh               2/2     Running   0          2m49s
openebs-agent-ha-node-84hhj                       1/1     Running   0          2m50s
openebs-agent-ha-node-lxxdf                       1/1     Running   0          2m50s
openebs-agent-ha-node-twrg9                       1/1     Running   0          2m50s
openebs-api-rest-5b44d6665c-zgrxr                 1/1     Running   0          2m49s
openebs-csi-controller-5d9cbbbcd7-sftm5           6/6     Running   0          2m49s
openebs-csi-node-22n8v                            2/2     Running   0          2m49s
openebs-csi-node-szg4p                            2/2     Running   0          2m49s
openebs-csi-node-zkcrg                            2/2     Running   0          2m50s
openebs-etcd-0                                    1/1     Running   0          2m49s
openebs-etcd-1                                    1/1     Running   0          2m49s
openebs-etcd-2                                    1/1     Running   0          2m49s
openebs-localpv-provisioner-55bf478db6-w94bm      1/1     Running   0          2m50s
openebs-loki-0                                    1/1     Running   0          2m49s
openebs-lvm-localpv-controller-668c75f94f-2crlv   5/5     Running   0          2m49s
openebs-lvm-localpv-node-5g5gr                    2/2     Running   0          2m50s
openebs-lvm-localpv-node-rxq88                    2/2     Running   0          2m50s
openebs-lvm-localpv-node-wkng5                    2/2     Running   0          2m50s
openebs-nats-0                                    3/3     Running   0          2m49s
openebs-nats-1                                    3/3     Running   0          2m49s
openebs-nats-2                                    3/3     Running   0          2m49s
openebs-obs-callhome-7d7d5799d6-tjztd             2/2     Running   0          2m49s
openebs-operator-diskpool-f755cbd4b-sp6tv         1/1     Running   0          2m49s
openebs-promtail-27szp                            1/1     Running   0          2m50s
openebs-promtail-fp89c                            1/1     Running   0          2m50s
openebs-promtail-ztswr                            1/1     Running   0          2m50s
openebs-zfs-localpv-controller-65d698cfcc-zs8bt   5/5     Running   0          2m49s
openebs-zfs-localpv-node-k4jtb                    2/2     Running   0          2m49s
openebs-zfs-localpv-node-nsfw7                    2/2     Running   0          2m49s
openebs-zfs-localpv-node-svvls                    2/2     Running   0          2m49s
```

**Command**

```
kubectl get pvc -n openebs
```

**Output**

```
NAME                     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
data-openebs-etcd-0      Bound    pvc-de3180be-b2c0-4fe5-b927-90186c44cbce   2Gi        RWO            ebs-sc         <unset>                 3m4s
data-openebs-etcd-1      Bound    pvc-f6429d28-c6dc-49d2-b928-7133004ed8ec   2Gi        RWO            ebs-sc         <unset>                 3m4s
data-openebs-etcd-2      Bound    pvc-54ee0ce2-1cae-400d-9126-7146d64035a8   2Gi        RWO            ebs-sc         <unset>                 3m4s
storage-openebs-loki-0   Bound    pvc-85fdeb88-c3bf-4a38-b222-f26228fad5ce   10Gi       RWO            ebs-sc         <unset>                 3m4s
```

## Pools

The available local SSD disks on worker nodes can be viewed by using the `kubectl-mayastor` plugin.

**Command**

```
kubectl mayastor get block-devices ip-10-0-1-213.ec2.internal -n openebs
```

**Output**

```
 DEVNAME       DEVTYPE  SIZE      AVAILABLE  MODEL                             DEVPATH                                              MAJOR  MINOR  DEVLINKS
 /dev/nvme1n1  disk     279.4GiB  yes        Amazon EC2 NVMe Instance Storage  /devices/pci0000:00/0000:00:1e.0/nvme/nvme1/nvme1n1  259    1      "/dev/disk/by-path/pci-0000:00:1e.0-nvme-1", "/dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_AWS23558744BCB1E907D", "/dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_AWS23558744BCB1E907D-ns-1", "/dev/disk/by-id/nvme-nvme.1d0f-4157533233353538373434424342314539303744-416d617a6f6e20454332204e564d6520496e7374616e63652053746f72616765-00000001"
 /dev/nvme2n1  disk     279.4GiB  yes        Amazon EC2 NVMe Instance Storage  /devices/pci0000:00/0000:00:1f.0/nvme/nvme2/nvme2n1  259    0      "/dev/disk/by-path/pci-0000:00:1f.0-nvme-1", "/dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_AWS289FE564FADBF1A72", "/dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_AWS289FE564FADBF1A72-ns-1", "/dev/disk/by-id/nvme-nvme.1d0f-4157533238394645353634464144424631413732-416d617a6f6e20454332204e564d6520496e7374616e63652053746f72616765-00000001"
```

It is highly recommended to specify the disk using a unique device link that remains unaltered across node reboots. Examples of such device links are: by-path or by-id.

**Sample pool.yaml**

```
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: pool-on-node-3
  namespace: openebs
spec:
  node: ip-10-0-1-222.ec2.internal
  disks: ["/dev/disk/by-id/nvme-Amazon_EC2_NVMe_Instance_Storage_AWS221DD9D8F573CA7B2"]
```

**Available Disk Pools**

**Command**

```
kubectl get dsp -n openebs
```

**Output**

```
NAME             NODE                         STATE     POOL_STATUS   CAPACITY       USED   AVAILABLE
pool-on-node-1   ip-10-0-0-201.ec2.internal   Created   Online        299703992320   0      299703992320
pool-on-node-2   ip-10-0-1-213.ec2.internal   Created   Online        299703992320   0      299703992320
pool-on-node-3   ip-10-0-1-222.ec2.internal   Created   Online        299703992320   0      299703992320
```

## Configuration

- Refer to the [Replicated PV Mayastor Configuration Documentation](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#create-replicated-pv-mayastor-storageclasss) for instructions regarding StorageClass creation.

Replicated PV Mayastor dynamically provisions PersistentVolumes (PVs) based on StorageClass definitions created. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. We have created a storage class with three replication as below. 

**Command**

```
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  protocol: nvmf
  repl: "3"
provisioner: io.openebs.csi-mayastor
EOF
```

**Output**

```
storageclass.storage.k8s.io/mayastor-3 created
```

## Deployment

- Refer to the [Deploy an Application Documentation](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-deployment.md) for instructions regarding PVC creation and deploying an application.

- If all verification steps in the preceding stages were satisfied, then Replicated PV Mayastor has been successfully deployed within the cluster. In order to verify basic functionality, we will now dynamically provision a Persistent Volume based on a Replicated PV Mayastor StorageClass.

- Use `kubectl` to create a PVC based on a StorageClass that you created. In the example shown below, we will consider that StorageClass to have been named "mayastor-3". Replace the value of the field "storageClassName" with the name of your own Replicated PV Mayastor-based StorageClass.

**Command**

```
kubectl get pvc
```

**Output**

```
NAME         STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
mongo-data   Bound    pvc-77b149ad-e94f-406c-a155-d515b30d795c   20Gi       RWO            mayastor-3     <unset>                 10s
```

- We have created a mongo application as below with pvc mongo-data.

**Command**

```
kubectl get pods -o wide
```

**Output**

```
NAME                            READY   STATUS    RESTARTS   AGE     IP           NODE                         NOMINATED NODE   READINESS GATES
mongo-7d484bd55c-jfmbl          1/1     Running   0          6m33s   10.0.1.102   ip-10-0-1-222.ec2.internal   <none>           <none>
```

**Random data in Mongo**

```
root@mongo-7d484bd55c-jfmbl:/# mongosh mongodb://admin:admin123@mongo.default.svc.cluster.local:27017/admin
Current Mongosh Log ID: 66dabe016df3c013015e739b
Connecting to:          mongodb://<credentials>@mongo.default.svc.cluster.local:27017/admin?directConnection=true&appName=mongosh+2.3.0
Using MongoDB:          7.0.14
Using Mongosh:          2.3.0

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/

------
   The server generated these startup warnings when booting
   2024-09-06T08:22:37.686+00:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
   2024-09-06T08:22:38.589+00:00: vm.max_map_count is too low
------

admin> use myRandomDB
switched to db myRandomDB
myRandomDB> db.users.find().pretty()
[
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739c'),
    name: 'John Doe',
    age: 29,
    email: 'johndoe@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739d'),
    name: 'Jane Smith',
    age: 34,
    email: 'janesmith@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739e'),
    name: 'Sam Johnson',
    age: 21,
    email: 'samj@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739f'),
    name: 'Lisa Ray',
    age: 25,
    email: 'lisaray@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e73a0'),
    name: 'Alex White',
    age: 40,
    email: 'alexw@example.com'
  }
]
myRandomDB>
```

## Node Failure Scenario

EKS worker nodes are part of Managed Instance groups, if a node failed for some reasons during reboot or any other scenario, a new node gets created with new Instance store Disk. In that case, you have to recreate the pool with a new name. Once the new pool got created “OpenEBS Replicated Storage Mayastor” will take care of rebuilding the volume with the replicated data.

:::important
When a node is replaced with a new one, all node labels and huge page configurations are removed. You have to do this configuration once again on the new node.
:::

**Example**

From the below example: the node `ip-10-0-1-222.ec2.internal` is failed and we got a new node/disks which caused the `pool-on-node-3` to be in unknown status and the Replicated PV Mayastor volume would be in degraded status as one of the replica is down.

**Command**

```
kubectl get dsp -n openebs
```

**Output**

```
NAME             NODE                         STATE     POOL_STATUS   CAPACITY       USED          AVAILABLE
pool-on-node-1   ip-10-0-0-201.ec2.internal   Created   Online        299703992320   21474836480   278229155840
pool-on-node-2   ip-10-0-1-213.ec2.internal   Created   Online        299703992320   21474836480   278229155840
pool-on-node-3   ip-10-0-1-222.ec2.internal   Created   Unknown       0              0             0
```

We have re-configured the node labels/hugepages and loaded nvme_tcp modules on the new node. Also, a new pool has been created with it with named `pool-on-node-4`.

**Command**

```
kubectl get dsp -n openebs
```

**Output**

```
NAME             NODE                         STATE     POOL_STATUS   CAPACITY       USED          AVAILABLE
pool-on-node-1   ip-10-0-0-201.ec2.internal   Created   Online        299703992320   21474836480   278229155840
pool-on-node-2   ip-10-0-1-213.ec2.internal   Created   Online        299703992320   21474836480   278229155840
pool-on-node-3   ip-10-0-1-222.ec2.internal   Created   Unknown       0              0             0
pool-on-node-4   ip-10-0-1-211.ec2.internal   Created   Online        299703992320   0             299703992320
```

Once the pool got created, the degraded volume is back online after the rebuild.

**Command**

```
kubectl mayastor get volumes -n openebs
```

**Output**

```
ID                                    REPLICAS  TARGET-NODE                 ACCESSIBILITY  STATUS  SIZE   THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE
77b149ad-e94f-406c-a155-d515b30d795c  3         ip-10-0-1-213.ec2.internal  nvmf           Online  20GiB  false             20GiB      0          <none>
```

**Command**

```
kubectl mayastor get volumes -n openebs
```

**Output**

```
ID                                    REPLICAS  TARGET-NODE                 ACCESSIBILITY  STATUS  SIZE   THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE
77b149ad-e94f-406c-a155-d515b30d795c  3         ip-10-0-1-213.ec2.internal  nvmf           Online  20GiB  false             20GiB      0          <none>
```

**Command**

```
kubectl mayastor get volume-replica-topologies -n openebs
```

**Output**

```
VOLUME-ID                             ID                                    NODE                        POOL            STATUS  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD
77b149ad-e94f-406c-a155-d515b30d795c  cca31bf5-c1b4-42f0-a014-aa9bb3721358  ip-10-0-1-213.ec2.internal  pool-on-node-2  Online  20GiB     20GiB      0 B        Online        <none>  <none>
├─                                    d5e73da6-9135-4e0b-aacb-860d27a79a8f  ip-10-0-1-211.ec2.internal  pool-on-node-4  Online  20GiB     20GiB      0 B        Online        <none>  <none>
└─                                    daad3142-4182-4eb0-8532-c57ef9a29cbd  ip-10-0-0-201.ec2.internal  pool-on-node-1  Online  20GiB     20GiB      0 B        Online        <none>  <none>
```

- **Replicated PV Mayastor Rebuild History**

**Command**

```
kubectl mayastor get rebuild-history 77b149ad-e94f-406c-a155-d515b30d795c -n openebs
```

**Output**

```
DST                                   SRC                                   STATE      TOTAL  RECOVERED  TRANSFERRED  IS-PARTIAL  START-TIME            END-TIME
d5e73da6-9135-4e0b-aacb-860d27a79a8f  cca31bf5-c1b4-42f0-a014-aa9bb3721358  Completed  20GiB  20GiB      20GiB        false       2024-09-06T09:36:56Z  2024-09-06T09:38:16Z
```

Meanwhile, Kubernetes moved the pod to the next available node as the node where the pod was scheduled was failed. We see the data still available without any issues.

**Command**

```
kubectl get pods -o wide
```

**Output**

```
NAME                            READY   STATUS    RESTARTS   AGE   IP           NODE                         NOMINATED NODE   READINESS GATES
mongo-7d484bd55c-k7dhx          1/1     Running   0          60m   10.0.1.76    ip-10-0-1-213.ec2.internal   <none>           <none>
root@ip-172-31-2-236:~/pool# kubectl exec -it mongo-client-754c65cfc9-wdpbh -- bash
root@mongo-client-754c65cfc9-wdpbh:/# mongosh mongodb://admin:admin123@mongo.default.svc.cluster.local:27017/admin
Current Mongosh Log ID: 66dace9e2245442c225e739b
Connecting to:          mongodb://<credentials>@mongo.default.svc.cluster.local:27017/admin?directConnection=true&appName=mongosh+2.3.0
Using MongoDB:          7.0.14
Using Mongosh:          2.3.0

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/


To help improve our products, anonymous usage data is collected and sent to MongoDB periodically (https://www.mongodb.com/legal/privacy-policy).
You can opt-out by running the disableTelemetry() command.

------
   The server generated these startup warnings when booting
   2024-09-06T09:03:20.971+00:00: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine. See http://dochub.mongodb.org/core/prodnotes-filesystem
   2024-09-06T09:03:21.798+00:00: vm.max_map_count is too low
------

admin> use myRandomDB
switched to db myRandomDB
myRandomDB> db.users.find().pretty()
[
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739c'),
    name: 'John Doe',
    age: 29,
    email: 'johndoe@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739d'),
    name: 'Jane Smith',
    age: 34,
    email: 'janesmith@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739e'),
    name: 'Sam Johnson',
    age: 21,
    email: 'samj@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e739f'),
    name: 'Lisa Ray',
    age: 25,
    email: 'lisaray@example.com'
  },
  {
    _id: ObjectId('66dabd2a5f2c51c1495e73a0'),
    name: 'Alex White',
    age: 40,
    email: 'alexw@example.com'
  }
]
myRandomDB>
```

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](../microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](../talos.md)
- [Provisioning NFS PVCs](../../read-write-many/nfspvc.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../../backup-and-restore/velero-br-fs.md)