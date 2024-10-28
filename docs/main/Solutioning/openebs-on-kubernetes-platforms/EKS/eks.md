---
id: eks
title: Replicated PV Mayastor Installation on Amazon Elastic Kubernetes Service
keywords:
 - Replicated PV Mayastor Installation on Amazon Elastic Kubernetes Service
 - Replicated PV Mayastor Installation on EKS
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - Elastic Kubernetes Service
 - EKS
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on Amazon Elastic Kubernetes Service

This document provides instructions for installing Replicated PV Mayastor on Amazon Elastic Kubernetes Service (EKS). Replicated PV Mayastor is designed to work with Amazon EKS. It provides high-performance storage for stateful applications running in a Kubernetes environment. 

Using Replicated PV Mayastor with Amazon EKS offers several benefits, particularly in offering container-native storage solutions.

**Scalability and Flexibility:** Amazon EKS provides a managed Kubernetes service that scales easily with the needs of the application. OpenEBS adds a layer of flexibility by enabling dynamic provisioning of storage, allowing for seamless scaling of storage resources alongside your EKS clusters.

**Container-Native Storage:** OpenEBS is designed for Kubernetes, offering container-native storage solutions. This is particularly advantageous in EKS environments, where applications often require fast, scalable, and reliable storage that integrates natively with Kubernetes.

**Data Resiliency and High Availability:** OpenEBS provides storage replication and data protection features, ensuring that your application data is highly available and resilient to node or disk failures within EKS. This is critical for applications requiring high availability and disaster recovery.

**Storage Agility:** OpenEBS supports multiple storage engines that can be tailored to your application’s specific needs. This allows you to select the most suitable storage engine for different workloads running on EKS, providing agility in how storage is managed.

**Cloud-Native Best Practices:** Amazon EKS, combined with OpenEBS, allows you to follow cloud-native best practices for deploying, managing, and scaling stateful applications. This approach leverages the benefits of both Kubernetes and cloud infrastructure to build resilient and scalable applications.

## Prerequisites

Before installing Replicated PV Mayastor, make sure that you meet the following requirements:

- **Hardware Requirements**

    Your machine type must meet the requirements defined in the [prerequisites](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md#prerequisites).

- **EKS Nodes**

    You need to configure launch templates to create node groups with hardware/OS/kernel requirements. When using the synchronous replication feature (N-way mirroring), the number of worker nodes on which IO engine pods are deployed should be no less than the desired replication factor. 

- **Additional Disks**

    Additional storage disks for nodes can be added during the cluster creation using launch templates.

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

Refer to the [OpenEBS Installation Documentation](../../../quickstart-guide/installation.md#installation-via-helm) to install Replicated PV Mayastor using Helm.

- **Helm Install Command**

```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```

## Pools

The available GKE local SSD disks on worker nodes can be viewed by using the `kubectl-mayastor` plugin.

```
kubectl mayastor get block-devices NODE_ID -n openebs 
```

It is highly recommended to specify the disk using a unique device link that remains unaltered across node reboots. Examples of such device links are: by-path or by-id.

The status of DiskPools may be determined by reference to their cluster CRs. Available, healthy pools should report their State as online. Verify that the expected number of pools has been created and that they are online.

**Command**

```
kubectl get dsp -n openebs
```

**Output**

```
NAME             NODE                         STATE     POOL_STATUS   CAPACITY      USED   AVAILABLE
pool-on-node-1   ip-10-0-2-122.ec2.internal   Created   Online        10724835328   0      10724835328
pool-on-node-2   ip-10-0-2-46.ec2.internal    Created   Online        10724835328   0      10724835328
pool-on-node-3   ip-10-0-3-54.ec2.internal    Created   Online        10724835328   0      10724835328
```

## Configuration

- Refer to the [Replicated PV Mayastor Configuration Documentation](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#create-replicated-pv-mayastor-storageclasss) for instructions regarding StorageClass creation.

Replicated PV Mayastor dynamically provisions PersistentVolumes (PVs) based on StorageClass definitions created. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. Most importantly StorageClass definition is used to control the level of data protection afforded to it (i.e. the number of synchronous data replicas that are maintained for purposes of redundancy). It is possible to create any number of StorageClass definitions, spanning all permitted parameter permutations. See the below example.

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

- Refer to the [Deploy an Application Documentation](../../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-deployment.md) for instructions regarding PVC creation and deploying an application.

If all verification steps in the preceding stages were satisfied, then Replicated PV Mayastor has been successfully deployed within the cluster. In order to verify basic functionality, we will now dynamically provision a Persistent Volume based on a Replicated PV Mayastor StorageClass, mount that volume within a small test pod which we'll create, and use the [Flexible I/O Tester](https://github.com/axboe/fio) utility within that pod to check that I/O to the volume is processed correctly.

Use `kubectl` to create a PVC based on a StorageClass that you created. In the example shown below, we will consider that StorageClass to have been named "mayastor-3". Replace the value of the field "storageClassName" with the name of your own Replicated PV Mayastor-based StorageClass.

**Command**

```
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
  storageClassName: mayastor-3
EOF
```

**Output**

```
persistentvolumeclaim/ms-volume-claim created
```

Verify PV/PVC and Replicated Mayastor PV Volumes.

**Command**

```
kubectl get pvc
```

**Output**
NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
ms-volume-claim   Bound    pvc-143581bb-76f9-4abe-a4f9-9ae5099c286d   1Gi        RWO            mayastor-3     unset                   2m42s

**Command**

```
kubectl get pv
```

**Output**

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                            STORAGECLASS            VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-143581bb-76f9-4abe-a4f9-9ae5099c286d   1Gi        RWO            Delete           Bound    default/ms-volume-claim          mayastor-3              unset                            2m46s
pvc-6064b04a-ceb4-4b46-b44b-eb15f77ecf41   2Gi        RWO            Delete           Bound    openebs/data-openebs-etcd-0      mayastor-etcd-localpv   unset                            119m
pvc-94b34749-c33a-42d2-85fb-c8935f0a6b25   2Gi        RWO            Delete           Bound    openebs/data-openebs-etcd-2      mayastor-etcd-localpv   unset                            119m
pvc-9ff4ae1b-f6f9-4e4d-a616-d1e40c17effc   2Gi        RWO            Delete           Bound    openebs/data-openebs-etcd-1      mayastor-etcd-localpv   unset                            119m
pvc-fdd82823-7f3b-4f19-8346-0d037ebb61d8   10Gi       RWO            Delete           Bound    openebs/storage-openebs-loki-0   mayastor-loki-localpv   unset                            119m
```

**Command**

```
kubectl mayastor get volumes -n openebs
```

**Output**

```
 ID                                    REPLICAS  TARGET-NODE                ACCESSIBILITY  STATUS  SIZE  THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE
 143581bb-76f9-4abe-a4f9-9ae5099c286d  3         ip-10-0-3-54.ec2.internal  nvmf           Online  1GiB  false             1GiB       0          <none>
```

The Replicated PV Mayastor CSI driver will cause the application pod and the corresponding Replicated PV Mayastor volume's NVMe target/controller ("Nexus") to be scheduled on the same Replicated PV Mayastor Node, in order to assist with restoration of volume and application availabilty in the event of a storage node failure.

```
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

Verify the application.

**Command**

```
kubectl get pod fio
```

**Output**

```
NAME   READY   STATUS    RESTARTS   AGE
fio    1/1     Running   0          94s
```

Run the Fio-tester application - We now execute the FIO Test utility against the Replicated PV Mayastor for 60 seconds, checking that I/O is handled as expected and without errors. In this example, we use a pattern of random reads and writes, with a block size of 4k and a queue depth of 16.

**Command**

```
kubectl exec -it fio -- fio --name=benchtest --size=800m --filename=/volume/test --direct=1 --rw=randrw --ioengine=libaio --bs=4k --iodepth=16 --numjobs=8 --time_based --runtime=60
```

**Output**

```
benchtest: (g=0): rw=randrw, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=16
...
fio-3.36
Starting 8 processes
benchtest: Laying out IO file (1 file / 800MiB)
Jobs: 8 (f=8): [m(8)][100.0%][r=9053KiB/s,w=8976KiB/s][r=2263,w=2244 IOPS][eta 00m:00s]
benchtest: (groupid=0, jobs=1): err= 0: pid=13: Mon Sep  2 09:32:19 2024
  read: IOPS=284, BW=1139KiB/s (1166kB/s)(66.7MiB/60016msec)
    slat (nsec): min=1601, max=125008k, avg=1724338.47, stdev=3085086.64
    clat (usec): min=36, max=159997, avg=20166.40, stdev=10783.00
     lat (usec): min=455, max=172590, avg=21890.74, stdev=11579.61
    clat percentiles (usec):
     |  1.00th=[  1844],  5.00th=[  3851], 10.00th=[  7046], 20.00th=[ 10814],
     | 30.00th=[ 13829], 40.00th=[ 16450], 50.00th=[ 19268], 60.00th=[ 22152],
     | 70.00th=[ 25297], 80.00th=[ 28705], 90.00th=[ 33817], 95.00th=[ 38536],
     | 99.00th=[ 49021], 99.50th=[ 53740], 99.90th=[ 63177], 99.95th=[ 66847],
     | 99.99th=[156238]
   bw (  KiB/s): min=  816, max= 3032, per=12.44%, avg=1138.65, stdev=212.81, samples=119
   iops        : min=  204, max=  758, avg=284.66, stdev=53.20, samples=119
  write: IOPS=284, BW=1138KiB/s (1165kB/s)(66.7MiB/60016msec); 0 zone resets
    slat (nsec): min=1725, max=35463k, avg=1703640.62, stdev=2895657.27
    clat (msec): min=2, max=194, avg=32.63, stdev=11.93
     lat (msec): min=2, max=194, avg=34.33, stdev=12.43
    clat percentiles (msec):
     |  1.00th=[    8],  5.00th=[   16], 10.00th=[   19], 20.00th=[   24],
     | 30.00th=[   27], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   38], 80.00th=[   42], 90.00th=[   48], 95.00th=[   53],
     | 99.00th=[   65], 99.50th=[   69], 99.90th=[   84], 99.95th=[  136],
     | 99.99th=[  184]
   bw (  KiB/s): min=  848, max= 3280, per=12.44%, avg=1138.57, stdev=231.71, samples=119
   iops        : min=  212, max=  820, avg=284.64, stdev=57.93, samples=119
  lat (usec)   : 50=0.01%, 500=0.02%, 750=0.03%, 1000=0.02%
  lat (msec)   : 2=0.65%, 4=2.10%, 10=6.81%, 20=22.93%, 50=63.44%
  lat (msec)   : 100=3.96%, 250=0.04%
  cpu          : usr=0.58%, sys=2.10%, ctx=14814, majf=0, minf=13
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17084,17075,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=14: Mon Sep  2 09:32:19 2024
  read: IOPS=285, BW=1142KiB/s (1169kB/s)(66.9MiB/60020msec)
    slat (nsec): min=1597, max=23196k, avg=1709153.32, stdev=2886338.76
    clat (usec): min=359, max=155159, avg=19902.59, stdev=10850.82
     lat (usec): min=390, max=156933, avg=21611.74, stdev=11557.58
    clat percentiles (usec):
     |  1.00th=[  1909],  5.00th=[  3949], 10.00th=[  7111], 20.00th=[ 10552],
     | 30.00th=[ 13435], 40.00th=[ 16188], 50.00th=[ 18744], 60.00th=[ 21627],
     | 70.00th=[ 24511], 80.00th=[ 28443], 90.00th=[ 33817], 95.00th=[ 39060],
     | 99.00th=[ 49546], 99.50th=[ 53740], 99.90th=[ 64750], 99.95th=[ 76022],
     | 99.99th=[149947]
   bw (  KiB/s): min=  760, max= 2816, per=12.49%, avg=1142.34, stdev=211.20, samples=119
   iops        : min=  190, max=  704, avg=285.58, stdev=52.80, samples=119
  write: IOPS=288, BW=1152KiB/s (1180kB/s)(67.5MiB/60020msec); 0 zone resets
    slat (nsec): min=1638, max=32026k, avg=1675278.69, stdev=2906765.96
    clat (msec): min=2, max=156, avg=32.45, stdev=11.98
     lat (msec): min=2, max=156, avg=34.12, stdev=12.53
    clat percentiles (msec):
     |  1.00th=[    9],  5.00th=[   16], 10.00th=[   19], 20.00th=[   23],
     | 30.00th=[   26], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   38], 80.00th=[   42], 90.00th=[   48], 95.00th=[   53],
     | 99.00th=[   65], 99.50th=[   70], 99.90th=[   82], 99.95th=[  153],
     | 99.99th=[  157]
   bw (  KiB/s): min=  824, max= 3136, per=12.62%, avg=1155.45, stdev=223.21, samples=119
   iops        : min=  206, max=  784, avg=288.86, stdev=55.80, samples=119
  lat (usec)   : 500=0.01%, 750=0.02%, 1000=0.01%
  lat (msec)   : 2=0.56%, 4=2.06%, 10=7.11%, 20=23.61%, 50=62.45%
  lat (msec)   : 100=4.12%, 250=0.05%
  cpu          : usr=0.64%, sys=2.12%, ctx=14968, majf=0, minf=13
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17134,17288,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=15: Mon Sep  2 09:32:19 2024
  read: IOPS=282, BW=1131KiB/s (1159kB/s)(66.3MiB/60016msec)
    slat (nsec): min=1630, max=35114k, avg=1708769.91, stdev=2915405.81
    clat (usec): min=579, max=168050, avg=20105.34, stdev=11467.49
     lat (usec): min=608, max=180845, avg=21814.11, stdev=12213.47
    clat percentiles (usec):
     |  1.00th=[  1860],  5.00th=[  3720], 10.00th=[  6587], 20.00th=[ 10290],
     | 30.00th=[ 13435], 40.00th=[ 16188], 50.00th=[ 19006], 60.00th=[ 21890],
     | 70.00th=[ 25035], 80.00th=[ 28705], 90.00th=[ 34341], 95.00th=[ 39584],
     | 99.00th=[ 50594], 99.50th=[ 55837], 99.90th=[ 71828], 99.95th=[158335],
     | 99.99th=[166724]
   bw (  KiB/s): min=  792, max= 3256, per=12.36%, avg=1130.24, stdev=239.32, samples=119
   iops        : min=  198, max=  814, avg=282.55, stdev=59.83, samples=119
  write: IOPS=284, BW=1138KiB/s (1165kB/s)(66.7MiB/60016msec); 0 zone resets
    slat (nsec): min=1691, max=137351k, avg=1719277.92, stdev=3113475.24
    clat (msec): min=2, max=188, avg=32.84, stdev=12.13
     lat (msec): min=2, max=193, avg=34.55, stdev=12.72
    clat percentiles (msec):
     |  1.00th=[    9],  5.00th=[   15], 10.00th=[   19], 20.00th=[   23],
     | 30.00th=[   27], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   39], 80.00th=[   43], 90.00th=[   49], 95.00th=[   55],
     | 99.00th=[   66], 99.50th=[   71], 99.90th=[   83], 99.95th=[   85],
     | 99.99th=[  169]
   bw (  KiB/s): min=  848, max= 3136, per=12.41%, avg=1136.69, stdev=230.12, samples=119
   iops        : min=  212, max=  784, avg=284.17, stdev=57.53, samples=119
  lat (usec)   : 750=0.01%, 1000=0.07%
  lat (msec)   : 2=0.60%, 4=2.18%, 10=7.46%, 20=22.96%, 50=62.03%
  lat (msec)   : 100=4.64%, 250=0.04%
  cpu          : usr=0.70%, sys=1.93%, ctx=14820, majf=0, minf=14
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=16976,17071,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=16: Mon Sep  2 09:32:19 2024
  read: IOPS=285, BW=1143KiB/s (1171kB/s)(67.0MiB/60016msec)
    slat (nsec): min=1618, max=30887k, avg=1691097.70, stdev=2878481.16
    clat (usec): min=369, max=149488, avg=19793.89, stdev=10916.62
     lat (usec): min=372, max=149499, avg=21484.99, stdev=11647.33
    clat percentiles (usec):
     |  1.00th=[  1893],  5.00th=[  3654], 10.00th=[  6718], 20.00th=[ 10421],
     | 30.00th=[ 13304], 40.00th=[ 15926], 50.00th=[ 18744], 60.00th=[ 21627],
     | 70.00th=[ 24511], 80.00th=[ 28181], 90.00th=[ 33817], 95.00th=[ 39060],
     | 99.00th=[ 50070], 99.50th=[ 54789], 99.90th=[ 70779], 99.95th=[ 84411],
     | 99.99th=[145753]
   bw (  KiB/s): min=  800, max= 2800, per=12.51%, avg=1144.69, stdev=209.02, samples=119
   iops        : min=  200, max=  700, avg=286.17, stdev=52.26, samples=119
  write: IOPS=288, BW=1153KiB/s (1181kB/s)(67.6MiB/60016msec); 0 zone resets
    slat (nsec): min=1798, max=27242k, avg=1685333.62, stdev=2906147.46
    clat (usec): min=1863, max=146625, avg=32502.88, stdev=12058.60
     lat (usec): min=1871, max=147725, avg=34188.21, stdev=12586.99
    clat percentiles (msec):
     |  1.00th=[    9],  5.00th=[   16], 10.00th=[   19], 20.00th=[   23],
     | 30.00th=[   26], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   38], 80.00th=[   42], 90.00th=[   48], 95.00th=[   54],
     | 99.00th=[   66], 99.50th=[   71], 99.90th=[   91], 99.95th=[  140],
     | 99.99th=[  146]
   bw (  KiB/s): min=  864, max= 2928, per=12.62%, avg=1155.12, stdev=206.02, samples=119
   iops        : min=  216, max=  732, avg=288.77, stdev=51.51, samples=119
  lat (usec)   : 500=0.01%, 750=0.02%, 1000=0.03%
  lat (msec)   : 2=0.58%, 4=2.32%, 10=7.05%, 20=24.00%, 50=61.67%
  lat (msec)   : 100=4.26%, 250=0.06%
  cpu          : usr=0.66%, sys=2.07%, ctx=14966, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17155,17303,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=17: Mon Sep  2 09:32:19 2024
  read: IOPS=287, BW=1152KiB/s (1179kB/s)(67.5MiB/60019msec)
    slat (nsec): min=1565, max=132497k, avg=1671415.17, stdev=3032902.98
    clat (usec): min=340, max=167766, avg=19629.25, stdev=10969.24
     lat (usec): min=351, max=167768, avg=21300.67, stdev=11698.70
    clat percentiles (usec):
     |  1.00th=[  1942],  5.00th=[  3556], 10.00th=[  6587], 20.00th=[ 10290],
     | 30.00th=[ 13304], 40.00th=[ 15795], 50.00th=[ 18482], 60.00th=[ 21365],
     | 70.00th=[ 24249], 80.00th=[ 28181], 90.00th=[ 33817], 95.00th=[ 38536],
     | 99.00th=[ 49021], 99.50th=[ 53216], 99.90th=[ 65274], 99.95th=[ 77071],
     | 99.99th=[166724]
   bw (  KiB/s): min=  816, max= 2896, per=12.59%, avg=1151.27, stdev=225.02, samples=119
   iops        : min=  204, max=  724, avg=287.82, stdev=56.25, samples=119
  write: IOPS=288, BW=1153KiB/s (1181kB/s)(67.6MiB/60019msec); 0 zone resets
    slat (nsec): min=1715, max=38400k, avg=1702041.91, stdev=2893786.78
    clat (msec): min=2, max=170, avg=32.52, stdev=11.88
     lat (msec): min=2, max=186, avg=34.22, stdev=12.40
    clat percentiles (msec):
     |  1.00th=[    9],  5.00th=[   16], 10.00th=[   19], 20.00th=[   23],
     | 30.00th=[   26], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   38], 80.00th=[   42], 90.00th=[   48], 95.00th=[   54],
     | 99.00th=[   65], 99.50th=[   69], 99.90th=[   80], 99.95th=[   92],
     | 99.99th=[  169]
   bw (  KiB/s): min=  888, max= 3000, per=12.61%, avg=1154.77, stdev=205.91, samples=119
   iops        : min=  222, max=  750, avg=288.69, stdev=51.48, samples=119
  lat (usec)   : 500=0.01%, 750=0.01%, 1000=0.01%
  lat (msec)   : 2=0.57%, 4=2.32%, 10=7.32%, 20=24.02%, 50=61.62%
  lat (msec)   : 100=4.07%, 250=0.04%
  cpu          : usr=0.70%, sys=2.01%, ctx=14902, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17278,17304,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=18: Mon Sep  2 09:32:19 2024
  read: IOPS=287, BW=1150KiB/s (1177kB/s)(67.4MiB/60019msec)
    slat (nsec): min=1694, max=37818k, avg=1681510.11, stdev=2853298.55
    clat (usec): min=348, max=143525, avg=19937.27, stdev=10994.25
     lat (usec): min=351, max=143535, avg=21618.78, stdev=11700.02
    clat percentiles (usec):
     |  1.00th=[  1876],  5.00th=[  3785], 10.00th=[  6849], 20.00th=[ 10421],
     | 30.00th=[ 13435], 40.00th=[ 16057], 50.00th=[ 18744], 60.00th=[ 21627],
     | 70.00th=[ 24511], 80.00th=[ 28705], 90.00th=[ 34341], 95.00th=[ 39584],
     | 99.00th=[ 51119], 99.50th=[ 55313], 99.90th=[ 66323], 99.95th=[ 71828],
     | 99.99th=[137364]
   bw (  KiB/s): min=  902, max= 2736, per=12.59%, avg=1151.35, stdev=193.89, samples=119
   iops        : min=  225, max=  684, avg=287.83, stdev=48.48, samples=119
  write: IOPS=284, BW=1138KiB/s (1166kB/s)(66.7MiB/60019msec); 0 zone resets
    slat (nsec): min=1756, max=121652k, avg=1719106.50, stdev=3080740.90
    clat (msec): min=2, max=146, avg=32.66, stdev=11.98
     lat (msec): min=2, max=149, avg=34.38, stdev=12.54
    clat percentiles (msec):
     |  1.00th=[   10],  5.00th=[   16], 10.00th=[   19], 20.00th=[   23],
     | 30.00th=[   26], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   38], 80.00th=[   42], 90.00th=[   48], 95.00th=[   54],
     | 99.00th=[   66], 99.50th=[   70], 99.90th=[   82], 99.95th=[  130],
     | 99.99th=[  148]
   bw (  KiB/s): min=  864, max= 2552, per=12.45%, avg=1139.11, stdev=162.50, samples=119
   iops        : min=  216, max=  638, avg=284.77, stdev=40.63, samples=119
  lat (usec)   : 500=0.02%, 750=0.03%, 1000=0.02%
  lat (msec)   : 2=0.62%, 4=2.08%, 10=7.14%, 20=24.00%, 50=61.65%
  lat (msec)   : 100=4.40%, 250=0.04%
  cpu          : usr=0.75%, sys=1.93%, ctx=14986, majf=0, minf=11
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17252,17082,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=19: Mon Sep  2 09:32:19 2024
  read: IOPS=285, BW=1143KiB/s (1170kB/s)(67.0MiB/60018msec)
    slat (nsec): min=1604, max=35506k, avg=1694360.97, stdev=2891225.18
    clat (usec): min=360, max=168466, avg=20046.97, stdev=11221.74
     lat (usec): min=368, max=175111, avg=21741.33, stdev=11904.51
    clat percentiles (usec):
     |  1.00th=[  1975],  5.00th=[  4047], 10.00th=[  6915], 20.00th=[ 10552],
     | 30.00th=[ 13566], 40.00th=[ 16188], 50.00th=[ 18744], 60.00th=[ 21627],
     | 70.00th=[ 24773], 80.00th=[ 28705], 90.00th=[ 34341], 95.00th=[ 39060],
     | 99.00th=[ 50070], 99.50th=[ 54789], 99.90th=[ 66323], 99.95th=[154141],
     | 99.99th=[162530]
   bw (  KiB/s): min=  776, max= 2320, per=12.51%, avg=1144.02, stdev=172.29, samples=119
   iops        : min=  194, max=  580, avg=286.00, stdev=43.07, samples=119
  write: IOPS=283, BW=1133KiB/s (1161kB/s)(66.4MiB/60018msec); 0 zone resets
    slat (nsec): min=1727, max=151096k, avg=1732878.83, stdev=3134558.13
    clat (msec): min=2, max=169, avg=32.80, stdev=11.76
     lat (msec): min=2, max=169, avg=34.54, stdev=12.33
    clat percentiles (msec):
     |  1.00th=[   11],  5.00th=[   16], 10.00th=[   20], 20.00th=[   23],
     | 30.00th=[   27], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   39], 80.00th=[   43], 90.00th=[   48], 95.00th=[   54],
     | 99.00th=[   65], 99.50th=[   69], 99.90th=[   82], 99.95th=[   92],
     | 99.99th=[  161]
   bw (  KiB/s): min=  728, max= 2280, per=12.38%, avg=1133.80, stdev=166.49, samples=119
   iops        : min=  182, max=  570, avg=283.45, stdev=41.62, samples=119
  lat (usec)   : 500=0.01%, 750=0.01%, 1000=0.04%
  lat (msec)   : 2=0.47%, 4=2.04%, 10=7.12%, 20=23.49%, 50=62.29%
  lat (msec)   : 100=4.48%, 250=0.05%
  cpu          : usr=0.99%, sys=1.76%, ctx=14776, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17146,17006,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=20: Mon Sep  2 09:32:19 2024
  read: IOPS=286, BW=1146KiB/s (1173kB/s)(67.1MiB/60020msec)
    slat (nsec): min=1649, max=138252k, avg=1698880.94, stdev=3086269.79
    clat (usec): min=60, max=165697, avg=19939.09, stdev=10850.76
     lat (usec): min=449, max=169441, avg=21637.98, stdev=11636.78
    clat percentiles (usec):
     |  1.00th=[  1893],  5.00th=[  3523], 10.00th=[  6652], 20.00th=[ 10421],
     | 30.00th=[ 13566], 40.00th=[ 16319], 50.00th=[ 18744], 60.00th=[ 21627],
     | 70.00th=[ 25035], 80.00th=[ 28705], 90.00th=[ 34341], 95.00th=[ 39060],
     | 99.00th=[ 48497], 99.50th=[ 51643], 99.90th=[ 58983], 99.95th=[ 66323],
     | 99.99th=[149947]
   bw (  KiB/s): min=  816, max= 2760, per=12.53%, avg=1146.10, stdev=198.73, samples=119
   iops        : min=  204, max=  690, avg=286.52, stdev=49.68, samples=119
  write: IOPS=286, BW=1145KiB/s (1173kB/s)(67.1MiB/60020msec); 0 zone resets
    slat (nsec): min=1701, max=26023k, avg=1703121.12, stdev=2827873.05
    clat (msec): min=2, max=159, avg=32.52, stdev=11.83
     lat (msec): min=2, max=159, avg=34.22, stdev=12.33
    clat percentiles (msec):
     |  1.00th=[    9],  5.00th=[   16], 10.00th=[   19], 20.00th=[   23],
     | 30.00th=[   27], 40.00th=[   29], 50.00th=[   32], 60.00th=[   35],
     | 70.00th=[   38], 80.00th=[   42], 90.00th=[   48], 95.00th=[   54],
     | 99.00th=[   64], 99.50th=[   68], 99.90th=[   80], 99.95th=[  146],
     | 99.99th=[  159]
   bw (  KiB/s): min=  768, max= 2952, per=12.52%, avg=1146.44, stdev=214.89, samples=119
   iops        : min=  192, max=  738, avg=286.61, stdev=53.72, samples=119
  lat (usec)   : 100=0.01%, 500=0.01%, 750=0.01%, 1000=0.02%
  lat (msec)   : 2=0.59%, 4=2.35%, 10=7.07%, 20=23.37%, 50=62.45%
  lat (msec)   : 100=4.07%, 250=0.04%
  cpu          : usr=0.52%, sys=2.13%, ctx=14844, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=17189,17188,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
   READ: bw=9145KiB/s (9364kB/s), 1131KiB/s-1152KiB/s (1159kB/s-1179kB/s), io=536MiB (562MB), run=60016-60020msec
  WRITE: bw=9151KiB/s (9371kB/s), 1133KiB/s-1153KiB/s (1161kB/s-1181kB/s), io=536MiB (562MB), run=60016-60020msec

Disk stats (read/write):
  nvme0n1: ios=136865/137033, sectors=1095400/1096400, merge=0/17, ticks=975929/2614694, in_queue=3590624, util=99.92%
```

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](../microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](../talos.md)
- [Provisioning NFS PVCs](../../read-write-many/nfspvc.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../../backup-and-restore/velero-br-fs.md)