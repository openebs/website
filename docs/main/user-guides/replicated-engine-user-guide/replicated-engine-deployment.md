---
id: replicated-engine-deployment
title: Replicated Engine Deployment
keywords: 
  - Deployment
  - Replicated Engine Deployment
description: This guide will help you to deploy OpenEBS Replicated Engine.
---

# Replicated Engine Deployment

## Create DiskPool\(s\)

When a node allocates storage capacity for a replica of a persistent volume (PV) it does so from a DiskPool. Each node may create and manage zero, one, or more such pools. The ownership of a pool by a node is exclusive. A pool can manage only one block device, which constitutes the entire data persistence layer for that pool and thus defines its maximum storage capacity.

A pool is defined declaratively, through the creation of a corresponding `DiskPool` Custom Resource (CR) on the cluster. The DiskPool must be created in the same namespace where Replicated Engine has been deployed. User configurable parameters of this resource type include a unique name for the pool, the node name on which it will be hosted and a reference to a disk device which is accessible from that node. The pool definition requires the reference to its member block device to adhere to a discrete range of schemas, each associated with a specific access mechanism/transport/ or device type.

:::info
Replicated Engine versions before 2.0.1 had an upper limit on the number of retry attempts in the case of failure in `create events` in the DSP operator. With this release, the upper limit has been removed, which ensures that the DiskPool operator indefinitely reconciles with the CR.
:::

**Permissible Schemes for `spec.disks` under DiskPool Custom Resource**

:::info
It is highly recommended to specify the disk using a unique device link that remains unaltered across node reboots. Examples of such device links are: by-path or by-id.

Easy way to retrieve device link for a given node:
`kubectl mayastor get block-devices worker`

```
DEVNAME       DEVTYPE  SIZE      AVAILABLE  MODEL                             DEVPATH                                                           MAJOR  MINOR  DEVLINKS 
/dev/nvme0n1  disk     894.3GiB  yes        Dell DC NVMe PE8010 RI U.2 960GB  /devices/pci0000:30/0000:30:02.0/0000:31:00.0/nvme/nvme0/nvme0n1  259    0      "/dev/disk/by-id/nvme-eui.ace42e00164f0290", "/dev/disk/by-path/pci-0000:31:00.0-nvme-1", "/dev/disk/by-dname/nvme0n1", "/dev/disk/by-id/nvme-Dell_DC_NVMe_PE8010_RI_U.2_960GB_SDA9N7266I110A814"
```

Usage of the device name (for example, /dev/sdx) is not advised, as it may change if the node reboots, which might cause data corruption.
:::

| Type | Format | Example |
| :--- | :--- | :--- |
| Disk(non PCI) with disk-by-guid reference <i><b>(Best Practice)</b></i> | Device File | aio:///dev/disk/by-id/<id> OR uring:///dev/disk/by-id/</id> |
| Asynchronous Disk\(AIO\) | Device File | /dev/sdx |
| Asynchronous Disk I/O \(AIO\) | Device File | aio:///dev/sdx |
| io\_uring | Device File | uring:///dev/sdx |


Once a node has created a pool it is assumed that it henceforth has exclusive use of the associated block device; it should not be partitioned, formatted, or shared with another application or process. Any pre-existing data on the device will be destroyed.

:::warning
A RAM drive is not suitable for use in production as it uses volatile memory for backing the data. The memory for this disk emulation is allocated from the hugepages pool. Make sure to allocate sufficient additional hugepages resource on any storage nodes which will provide this type of storage.
:::

### Configure Pools

To get started, it is necessary to create and host at least one pool on one of the nodes in the cluster. The number of pools available limits the extent to which the synchronous N-way mirroring (replication) of PVs can be configured; the number of pools configured should be equal to or greater than the desired maximum replication factor of the PVs to be created. Also, while placing data replicas ensure that appropriate redundancy is provided. Replicated Engine's control plane will avoid placing more than one replica of a volume on the same node. For example, the minimum viable configuration for a Replicated Engine deployment which is intended to implement 3-way mirrored PVs must have three nodes, each having one DiskPool, with each of those pools having one unique block device allocated to it.

Using one or more the following examples as templates, create the required type and number of pools.

**Example DiskPool Definition**
```text
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1beta1"
kind: DiskPool
metadata:
  name: pool-on-node-1
  namespace: mayastor
spec:
  node: workernode-1-hostname
  disks: ["/dev/disk/by-id/<id>"]
EOF
```

**YAML**
```text
apiVersion: "openebs.io/v1beta1"
kind: DiskPool
metadata:
  name: INSERT_POOL_NAME_HERE
  namespace: mayastor
spec:
  node: INSERT_WORKERNODE_HOSTNAME_HERE
  disks: ["INSERT_DEVICE_URI_HERE"]
```

:::info
When using the examples given as guides to creating your own pools, remember to replace the values for the fields "metadata.name", "spec.node" and "spec.disks" as appropriate to your cluster's intended configuration. Note that whilst the "disks" parameter accepts an array of values, the current version of Replicated Engine supports only one disk device per pool.
:::

:::note
Existing schemas in CR definitions (in older versions) will be updated from v1alpha1 to v1beta1 after upgrading to Replicated Engine 2.4 and above. To resolve errors encountered pertaining to the upgrade, click [here](../troubleshooting/troubleshooting-replicated-engine.md).
:::

### Verify Pool Creation and Status

The status of DiskPools may be determined by reference to their cluster CRs. Available, healthy pools should report their State as `online`. Verify that the expected number of pools have been created and that they are online.

**Command**
```text
kubectl get dsp -n mayastor
```

**Example Output**
```text
NAME             NODE          STATE    POOL_STATUS   CAPACITY      USED   AVAILABLE
pool-on-node-1   node-1-14944  Created   Online        10724835328   0      10724835328
pool-on-node-2   node-2-14944  Created   Online        10724835328   0      10724835328
pool-on-node-3   node-3-14944  Created   Online        10724835328   0      10724835328
```

## Create Replicated Engine StorageClass\(s\)

Replicated Engine dynamically provisions PersistentVolumes \(PVs\) based on StorageClass definitions created by the user. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. For a detailed description of these parameters see [storage class parameter description](https://mayastor.gitbook.io/introduction/reference/storage-class-parameters). Most importantly StorageClass definition is used to control the level of data protection afforded to it \(that is, the number of synchronous data replicas which are maintained, for purposes of redundancy\). It is possible to create any number of StorageClass definitions, spanning all permitted parameter permutations.

We illustrate this quickstart guide with two examples of possible use cases; one which offers no data redundancy \(i.e. a single data replica\), and another having three data replicas. 
:::info
Both the example YAMLs given below have [thin provisioning](#thin) enabled. You can modify these as required to match your own desired test cases, within the limitations of the cluster under test.
:::

**Command \(1 replica example\)**
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "1"
provisioner: io.openebs.csi-mayastor
EOF
```

**Command \(3 replicas example\)**
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "3"
provisioner: io.openebs.csi-mayastor
EOF
```

:::info
The default installation of Replicated Engine includes the creation of a StorageClass with the name `mayastor-single-replica`. The replication factor is set to 1. Users may either use this StorageClass or create their own.
:::

## Storage Class Parameters

Storage Class resource in Kubernetes is used to supply parameters to volumes when they are created. It is a convenient way of grouping volumes with common characteristics. All parameters take a string value. Brief explanation of each supported Replicated Engine parameter follows.


:::info
The Storage Class parameter `local` has been deprecated and is a breaking change in Replicated Engine version 2.0. Ensure that this parameter is not used.
:::

### "fsType"

File system that will be used when mounting the volume. 
The supported file systems are **ext4**, **xfs** and **btrfs** and the default file system when not specified is **ext4**. We recommend to use **xfs** that is considered to be more advanced and performant. 
Please ensure the requested filesystem driver is installed on all worker nodes in the cluster before using it.

### "protocol"

The parameter 'protocol' takes the value `nvmf`(NVMe over TCP protocol). It is used to mount the volume (target) on the application node.

### "repl"

The string value should be a number and the number should be greater than zero. Replicated Engine control plane will try to keep always this many copies of the data if possible. If set to one then the volume does not tolerate any node failure. If set to two, then it tolerates one node failure. If set to three, then two node failures, etc.

### "thin"

The volumes can either be `thick` or `thin` provisioned. Adding the `thin` parameter to the StorageClass YAML allows the volume to be thinly provisioned. To do so, add `thin: true` under the `parameters` spec, in the StorageClass YAML. [Sample YAML](#create-replicated-engine-storageclasss)
When the volumes are thinly provisioned, the user needs to monitor the pools, and if these pools start to run out of space, then either new pools must be added or volumes deleted to prevent thinly provisioned volumes from getting degraded or faulted. This is because when a pool with more than one replica runs out of space, Replicated Engine moves the largest out-of-space replica to another pool and then executes a rebuild. It then checks if all the replicas have sufficient space; if not, it moves the next largest replica to another pool, and this process continues till all the replicas have sufficient space.

:::info
The capacity usage on a pool can be monitored using [exporter metrics](../user-guides/replicated-engine-user-guide/advanced-operations/monitoring.md#pool-metrics-exporter).
:::

The `agents.core.capacity.thin` spec present in the Replicated Engine helm chart consists of the following configurable parameters that can be used to control the scheduling of thinly provisioned replicas:

1. **poolCommitment** parameter specifies the maximum allowed pool commitment limit (in percent).
2. **volumeCommitment** parameter specifies the minimum amount of free space that must be present in each replica pool in order to create new replicas for an existing volume. This value is specified as a percentage of the volume size.
3. **volumeCommitmentInitial** minimum amount of free space that must be present in each replica pool in order to create new replicas for a new volume. This value is specified as a percentage of the volume size.


:::note
- By default, the volumes are provisioned as `thick`. 
- For a pool of a particular size, say 10 Gigabytes, a volume > 10 Gigabytes cannot be created, as Replicated Engine currently does not support pool expansion.
- The replicas for a given volume can be either all thick or all thin. Same volume cannot have a combination of thick and thin replicas.
:::

### "stsAffinityGroup" 

 `stsAffinityGroup` represents a collection of volumes that belong to instances of Kubernetes StatefulSet. When a StatefulSet is deployed, each instance within the StatefulSet creates its own individual volume, which collectively forms the `stsAffinityGroup`. Each volume within the `stsAffinityGroup` corresponds to a pod of the StatefulSet.

This feature enforces the following rules to ensure the proper placement and distribution of replicas and targets so that there is not any single point of failure affecting multiple instances of StatefulSet.

1. Anti-Affinity among single-replica volumes:
 This rule ensures that replicas of different volumes are distributed in such a way that there is no single point of failure. By avoiding the colocation of replicas from different volumes on the same node.

2.  Anti-Affinity among multi-replica volumes: 

If the affinity group volumes have multiple replicas, they already have some level of redundancy. This feature ensures that in such cases, the replicas are distributed optimally for the stsAffinityGroup volumes.

3. Anti-affinity among targets:

The [High Availability](../user-guides/replicated-engine-user-guide/advanced-operations/HA.md) feature ensures that there is no single point of failure for the targets.
The `stsAffinityGroup` ensures that in such cases, the targets are distributed optimally for the stsAffinityGroup volumes.

By default, the `stsAffinityGroup` feature is disabled. To enable it, modify the storage class YAML by setting the `parameters.stsAffinityGroup` parameter to true.

### "cloneFsIdAsVolumeId"

`cloneFsIdAsVolumeId` is a setting for volume clones/restores with two options: `true` and `false`. By default, it is set to `false`.
- When set to `true`, the created clone/restore's filesystem `uuid` will be set to the restore volume's `uuid`. This is important because some file systems, like XFS, do not allow duplicate filesystem `uuid` on the same machine by default.
- When set to `false`, the created clone/restore's filesystem `uuid` will be same as the orignal volume `uuid`, but it will be mounted using the `nouuid` flag to bypass duplicate `uuid` validation.

:::note
This option needs to be set to true when using a `btrfs` filesystem, if the application using the restored volume is scheduled on the same node where the original volume is mounted, concurrently.
:::

# Deploy a Test Application

## Objective

If all verification steps in the preceding stages were satisfied, then Replicated Engine has been successfully deployed within the cluster. In order to verify basic functionality, we will now dynamically provision a Persistent Volume based on a Replicated Engine StorageClass, mount that volume within a small test pod which we'll create, and use the [**Flexible I/O Tester**](https://github.com/axboe/fio) utility within that pod to check that I/O to the volume is processed correctly.

## Define the PVC

Use `kubectl` to create a PVC based on a StorageClass that you created in the [previous stage](#create-replicated-engine-storageclasss). In the example shown below, we will consider that StorageClass to have been named "mayastor-1". Replace the value of the field "storageClassName" with the name of your own Replicated Engine-based StorageClass.

For the purposes of this quickstart guide, it is suggested to name the PVC "ms-volume-claim", as this is what will be illustrated in the example steps which follow.

**Command**
```text
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: mayastor-1
EOF
```

**YAML**
```text
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: INSERT_YOUR_STORAGECLASS_NAME_HERE
```

If you used the storage class example from previous stage, then volume binding mode is set to `WaitForFirstConsumer`. That means, that the volume won't be created until there is an application using the volume. We will go ahead and create the application pod and then check all resources that should have been created as part of that in kubernetes.

## Deploy the FIO Test Pod

The Replicated Engine CSI driver will cause the application pod and the corresponding Replicated Engine volume's NVMe target/controller ("Nexus") to be scheduled on the _same_ Replicated Engine Node, in order to assist with restoration of volume and application availabilty in the event of a storage node failure.

:::warning
In this version, applications using PVs provisioned by Replicated Engine can only be successfully scheduled on Replicated Engine Nodes. This behaviour is controlled by the `local:` parameter of the corresponding StorageClass, which by default is set to a value of `true`. Therefore, this is the only supported value for this release - setting a non-local configuration may cause scheduling of the application pod to fail, as the PV cannot be mounted to a worker node other than a MSN. This behaviour will change in a future release.
:::

**Command \(GitHub Latest\)**
```text
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/v1.0.2/deploy/fio.yaml
```

**YAML**
```text
kind: Pod
apiVersion: v1
metadata:
  name: fio
spec:
  nodeSelector:
    openebs.io/engine: mayastor
  volumes:
    - name: ms-volume
      persistentVolumeClaim:
        claimName: ms-volume-claim
  containers:
    - name: fio
      image: nixery.dev/shell/fio
      args:
        - sleep
        - "1000000"
      volumeMounts:
        - mountPath: "/volume"
          name: ms-volume
```

## Verify the Volume and the Deployment

We will now verify the Volume Claim and that the corresponding Volume and Replicated Engine Volume resources have been created and are healthy.

### Verify the Volume Claim

The status of the PVC should be "Bound".

**Command**
```text
kubectl get pvc ms-volume-claim
```
**Example Output**
```text
NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
ms-volume-claim     Bound    pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b   1Gi        RWO            mayastor-1       15s
```

### Verify the Persistent Volume

:::info
Substitute the example volume name with that shown under the "VOLUME" heading of the output returned by the preceding "get pvc" command, as executed in your own cluster
:::

**Command**
```text
kubectl get pv pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b
```
**Example Output**
```text
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS     REASON   AGE
pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b   1Gi        RWO            Delete           Bound    default/ms-volume-claim     mayastor-1       16m
```

### Verify the Replicated Engine Volume 

The status of the volume should be "online".

:::info
To verify the status of volume [Replicated Engine Kubectl plugin](../user-guides/replicated-engine-user-guide/advanced-operations/kubectl-plugin.md) is used.
:::

**Command**
```text
kubectl mayastor get volumes
```
**Example Output**
```text
ID                                    REPLICAS  TARGET-NODE                ACCESSIBILITY STATUS  SIZE

18e30e83-b106-4e0d-9fb6-2b04e761e18a  3         aks-agentpool-12194210-0   nvmf           Online  1073741824 
```

### Verify the Application

Verify that the pod has been deployed successfully, having the status "Running". It may take a few seconds after creating the pod before it reaches that status, proceeding via the "ContainerCreating" state.

:::info
Note: The example FIO pod resource declaration included with this release references a PVC named `ms-volume-claim`, consistent with the example PVC created in this section of the quickstart. If you have elected to name your PVC differently, deploy the Pod using the example YAML, modifying the `claimName` field appropriately.
:::

**Command**
```text
kubectl get pod fio
```
**Example Output**
```text
NAME   READY   STATUS    RESTARTS   AGE
fio    1/1     Running   0          34s
```

## Run the FIO Tester Application

We now execute the FIO Test utility against the Replicated Engine PV for 60 seconds, checking that I/O is handled as expected and without errors. In this quickstart example, we use a pattern of random reads and writes, with a block size of 4k and a queue depth of 16.

**Command**
```text
kubectl exec -it fio -- fio --name=benchtest --size=800m --filename=/volume/test --direct=1 --rw=randrw --ioengine=libaio --bs=4k --iodepth=16 --numjobs=8 --time_based --runtime=60
```

**Example Output**
```text
benchtest: (g=0): rw=randrw, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=16
fio-3.20
Starting 1 process
benchtest: Laying out IO file (1 file / 800MiB)
Jobs: 1 (f=1): [m(1)][100.0%][r=376KiB/s,w=340KiB/s][r=94,w=85 IOPS][eta 00m:00s]
benchtest: (groupid=0, jobs=1): err= 0: pid=19: Thu Aug 27 20:31:49 2020
  read: IOPS=679, BW=2720KiB/s (2785kB/s)(159MiB/60011msec)
    slat (usec): min=6, max=19379, avg=33.91, stdev=270.47
    clat (usec): min=2, max=270840, avg=9328.57, stdev=23276.01
     lat (msec): min=2, max=270, avg= 9.37, stdev=23.29
    clat percentiles (msec):
     |  1.00th=[    3],  5.00th=[    3], 10.00th=[    4], 20.00th=[    4],
     | 30.00th=[    4], 40.00th=[    4], 50.00th=[    4], 60.00th=[    4],
     | 70.00th=[    4], 80.00th=[    4], 90.00th=[    7], 95.00th=[   45],
     | 99.00th=[  136], 99.50th=[  153], 99.90th=[  165], 99.95th=[  178],
     | 99.99th=[  213]
   bw (  KiB/s): min=  184, max= 9968, per=100.00%, avg=2735.00, stdev=3795.59, samples=119
   iops        : min=   46, max= 2492, avg=683.60, stdev=948.92, samples=119
  write: IOPS=678, BW=2713KiB/s (2778kB/s)(159MiB/60011msec); 0 zone resets
    slat (usec): min=6, max=22191, avg=45.90, stdev=271.52
    clat (usec): min=454, max=241225, avg=14143.39, stdev=34629.43
     lat (msec): min=2, max=241, avg=14.19, stdev=34.65
    clat percentiles (msec):
     |  1.00th=[    3],  5.00th=[    3], 10.00th=[    3], 20.00th=[    3],
     | 30.00th=[    3], 40.00th=[    3], 50.00th=[    3], 60.00th=[    3],
     | 70.00th=[    3], 80.00th=[    4], 90.00th=[   22], 95.00th=[  110],
     | 99.00th=[  155], 99.50th=[  157], 99.90th=[  169], 99.95th=[  197],
     | 99.99th=[  228]
   bw (  KiB/s): min=  303, max= 9904, per=100.00%, avg=2727.41, stdev=3808.95, samples=119
   iops        : min=   75, max= 2476, avg=681.69, stdev=952.25, samples=119
  lat (usec)   : 4=0.01%, 250=0.01%, 500=0.01%, 750=0.01%, 1000=0.01%
  lat (msec)   : 2=0.02%, 4=82.46%, 10=7.20%, 20=1.62%, 50=1.50%
  lat (msec)   : 100=2.58%, 250=4.60%, 500=0.01%
  cpu          : usr=1.19%, sys=3.28%, ctx=134029, majf=0, minf=17
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=40801,40696,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
   READ: bw=2720KiB/s (2785kB/s), 2720KiB/s-2720KiB/s (2785kB/s-2785kB/s), io=159MiB (167MB), run=60011-60011msec
  WRITE: bw=2713KiB/s (2778kB/s), 2713KiB/s-2713KiB/s (2778kB/s-2778kB/s), io=159MiB (167MB), run=60011-60011msec

Disk stats (read/write):
  sdd: ios=40795/40692, merge=0/9, ticks=375308/568708, in_queue=891648, util=99.53%
```

If no errors are reported in the output then Replicated Engine has been correctly configured and is operating as expected. You may create and consume additional Persistent Volumes with your own test applications.
