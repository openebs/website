---
id: openshift
title: Replicated PV Mayastor Installation on OpenShift
keywords:
 - Replicated PV Mayastor Installation on OpenShift
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - OpenShift
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on OpenShift

This document provides instructions for installing Replicated PV Mayastor on OpenShift. Using OpenEBS Replicated PV Mayastor with OpenShift offers several benefits for persistent storage management in Kubernetes environments, especially in the context of DevOps and Cloud-Native applications.

**Cloud-Native and Container-Aware Storage:** OpenEBS is designed to work in a cloud-native, containerized environment that aligns well with OpenShift's architecture. It offers Container Native Storage (CNS), which runs as microservices in the Kubernetes cluster, providing dynamic storage provisioning with high flexibility.

**Dynamic and Scalable Storage:** OpenEBS allows the provisioning of persistent volumes dynamically. This is particularly useful in OpenShift environments where applications may scale rapidly, and on demand, with minimal manual intervention.

**Storage for Stateful Applications:** OpenShift often hosts stateful applications like databases (MySQL, PostgreSQL, Cassandra), message queues, and other services requiring persistent storage. OpenEBS supports various storage engines, such as Replicated PV Mayastor enabling optimized storage performance depending on the workload type.

**Simplified Storage Operations:** With OpenEBS, storage can be managed and operated by DevOps teams without requiring specialized storage administrators. It abstracts away the complexity of traditional storage solutions, providing a Kubernetes-native experience.

**Easy Integration with OpenShift Features:** OpenEBS can integrate seamlessly with OpenShift’s features like Operators, pipelines, and monitoring tools, making it easier to manage and monitor persistent storage using OpenShift-native tools.

## Prerequisites

Before installing Replicated PV Mayastor, make sure that you meet the following requirements:

- **Hardware Requirements**

    Your machine type must meet the requirements defined in the [prerequisites](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md#prerequisites).

- **Worker Nodes**

    The number of worker nodes on which IO engine pods are deployed should not be less than the desired replication factor when using the synchronous replication feature (N-way mirroring).

- **Additional Disks**

    Your worker nodes should have additional storage disks attached. The additional storage disks should not be mounted or contain a filesystem.

- **Enable Huge Pages**
    
    2MiB-sized Huge Pages must be supported and enabled on the storage nodes i.e. nodes where IO engine pods are deployed. A minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the IO engine pod on each node.
    Huge pages in the OpenShift Container Platform (OCP) can be enabled during the installation or it can be enabled by creating new machine configs post-installation. Refer to the [Red Hat Documentation](https://access.redhat.com/solutions/5214791) for more details.

- **Kernel Modules**

    nvme modules are loaded by default in coreOS.

- **Preparing the Cluster**

    Refer to the [Replicated PV Mayastor Installation Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation.md#preparing-the-cluster) for instructions on preparing the cluster.

- **Security Context Constraint (SCC)**

    Ensure that the service account used for the OpenEBS deployments is added to the privileged SCC.

    ```
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-promtail
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-loki
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-localpv-provisioner
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-nats
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-lvm-controller-sa
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-lvm-node-sa
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-promtail
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-service-account
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-zfs-controller-sa
    oc adm policy -n openebs add-scc-to-user privileged -z openebs-zfs-node-sa
    oc adm policy -n openebs add-scc-to-user privileged -z default
    ```

## Install Replicated PV Mayastor on OpenShift

Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md#installation-via-helm) to install Replicated PV Mayastor using Helm.

- **Helm Install Command**

```
helm install openebs --namespace openebs openebs/openebs --create-namespace --set openebs-crds.csi.volumeSnapshots.enabled=false 
```

:::info
OCP includes VolumeSnapshot CRDs by default. To avoid potential installation issues, it is recommended to disable these CRDs in the OpenEBS Helm chart, as these resources already exist in the OCP environment.
:::

## Pools

The available worker nodes can be viewed using the `kubectl-mayastor` plugin. To use this functionality, you must install `kubectl` (or execute the binary using `./kubectl-mayastor`). The plugin is not compatible with the `oc` binary directly.

```
kubectl mayastor get block-devices NODE_ID -n openebs
```

It is highly recommended to specify the disk using a unique device link that remains unaltered across node reboots. Examples of such device links are: by-path or by-id (Sample disk-pools as below):

**Command**

```
kubectl mayastor get nodes -n openebs
```

**Output**

```
ID      GRPC ENDPOINT      STATUS  VERSION
worker  10.200.31.4:10124  Online  v2.7.1
```

**Command**

```
kubectl mayastor get block-devices worker  -n openebs
```

**Output**

```
DEVNAME   DEVTYPE  SIZE   AVAILABLE  MODEL         DEVPATH                                                               MAJOR  MINOR  DEVLINKS
/dev/sdb  disk     30GiB  yes        Virtual_disk  /devices/pci0000:00/0000:00:10.0/host2/target2:0:1/2:0:1:0/block/sdb  8      16     "/dev/disk/by-id/scsi-SVMware_Virtual_disk_6000c2915164f6cc7af0aa6cb040cf67", "/dev/disk/by-id/wwn-0x6000c2915164f6cc7af0aa6cb040cf67", "/dev/disk/by-id/scsi-36000c2915164f6cc7af0aa6cb040cf67", "/dev/disk/by-diskseq/2", "/dev/disk/by-path/pci-0000:00:10.0-scsi-0:0:1:0"
```

The status of DiskPools can be determined by referencing their corresponding cluster Custom Resources (CRs). Pools that are available and healthy should report their state as `online`. Verify that the expected number of pools has been created and that all are in the "online" state.

**Command**

```
oc get dsp -n openebs
```

**Output**

```
NAME             NODE     STATE     POOL_STATUS   CAPACITY      USED   AVAILABLE
pool-on-worker   worker   Created   Online        32178700288   0      32178700288
```

## Configuration

- Refer to the [Replicated PV Mayastor Configuration Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#create-replicated-pv-mayastor-storageclasss) for instructions regarding StorageClass creation.

Replicated PV Mayastor dynamically provisions Persistent Volumes (PVs) based on StorageClass definitions that you create. Parameters of the definition are used to set the characteristics and behaviour of its associated PVs. Most importantly StorageClass definition is used to control the level of data protection afforded to it (i.e. the number of synchronous data replicas that are maintained for purposes of redundancy). It is possible to create any number of StorageClass definitions, spanning all permitted parameter permutations. An example is given below:

```
cat <<EOF | oc create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  protocol: nvmf
  repl: "3"
provisioner: io.openebs.csi-mayastor
EOF
storageclass.storage.k8s.io/mayastor-3 created
```

- Refer to the [Deploy an Application Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-deployment.md) for instructions regarding PVC creation and deploying an application.

If all verification steps in the preceding stages were satisfied, then the Replicated PV Mayastor has been successfully deployed within the cluster. To verify basic functionality, we will now dynamically provision a Persistent Volume based on a Replicated PV Mayastor StorageClass, mount that volume within a small test pod which we'll create, and use the Flexible I/O Tester utility within that pod to check that I/O to the volume is processed correctly.

Use `oc` to create a PVC based on a StorageClass created. In the example shown below, we will consider StorageClass to have been named "openebs-single-replica" which was created as part of OpenEBS Installation. 

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
  storageClassName: openebs-single-replica
EOF
persistentvolumeclaim/ms-volume-claim created
```

As a next step verify the PV/PVC and the Replicated PV Mayastor volumes.

**Command**

```
oc get pvc
```

**Output**

```
NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             VOLUMEATTRIBUTESCLASS   AGE
ms-volume-claim   Bound    pvc-144d54db-a3cf-4194-821d-34eae9dafc1d   1Gi        RWO            openebs-single-replica   <unset>                 40s
```

**Command**

```
oc get pv
```

**Output**

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                            STORAGECLASS             VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-02333bf8-8a07-4ce0-a00e-bd6bc67af380   2Gi        RWO            Delete           Bound    openebs/data-openebs-etcd-0      mayastor-etcd-localpv    <unset>                          47h
pvc-144d54db-a3cf-4194-821d-34eae9dafc1d   1Gi        RWO            Delete           Bound    default/ms-volume-claim          openebs-single-replica   <unset>                          42s
pvc-233aafb1-59e9-4836-b8a1-f74ab2f5a6e4   10Gi       RWO            Delete           Bound    openebs/storage-openebs-loki-0   mayastor-loki-localpv    <unset>                          47h
```

**Command**

```
kubectl mayastor get volumes -n openebs
```

**Output**

```
ID                                    REPLICAS  TARGET-NODE  ACCESSIBILITY  STATUS  SIZE  THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE
144d54db-a3cf-4194-821d-34eae9dafc1d  1         <none>       <none>         Online  1GiB  false             1GiB       0          <none>
```

The Replicated PV Mayastor CSI driver will cause the application pod and the corresponding Replicated PV Mayastor volume's NVMe target/controller ("Nexus") to be scheduled on the same Replicated PV Mayastor Node, to assist with the restoration of volume and application availability in the event of a storage node failure.

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
oc get pods fio
```

**Output**

```
NAME   READY   STATUS    RESTARTS   AGE
fio    1/1     Running   0          34s
```

Execute the Fio-tester application: The FIO Test utility is now run against the Replicated PV Mayastor for 60 seconds to verify that I/O operations are handled as expected and without errors. In this example, the test uses a pattern of random reads and writes, with a block size of 4KB, and a queue depth of 16.

```
oc exec -it fio -- fio --name=benchtest --size=800m --filename=/volume/test --direct=1 --rw=randrw --ioengine=libaio --bs=4k --iodepth=16 --numjobs=8 --time_based --runtime=60
benchtest: (g=0): rw=randrw, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=16
...
fio-3.36
Starting 8 processes
benchtest: Laying out IO file (1 file / 800MiB)
Jobs: 8 (f=8): [m(8)][100.0%][r=116MiB/s,w=117MiB/s][r=29.6k,w=30.0k IOPS][eta 00m:00s]
benchtest: (groupid=0, jobs=1): err= 0: pid=18: Thu Oct 17 09:32:51 2024
  read: IOPS=3969, BW=15.5MiB/s (16.3MB/s)(930MiB/60001msec)
    slat (nsec): min=1677, max=40848k, avg=110715.28, stdev=698721.56
    clat (usec): min=54, max=63044, avg=1803.95, stdev=2806.20
     lat (usec): min=88, max=63048, avg=1914.67, stdev=2908.60
    clat percentiles (usec):
     |  1.00th=[  202],  5.00th=[  258], 10.00th=[  297], 20.00th=[  388],
     | 30.00th=[  570], 40.00th=[  865], 50.00th=[ 1303], 60.00th=[ 1713],
     | 70.00th=[ 2089], 80.00th=[ 2540], 90.00th=[ 3228], 95.00th=[ 3949],
     | 99.00th=[15139], 99.50th=[22676], 99.90th=[35390], 99.95th=[39060],
     | 99.99th=[47449]
   bw (  KiB/s): min= 8744, max=37536, per=12.64%, avg=15914.12, stdev=5192.43, samples=119
   iops        : min= 2186, max= 9384, avg=3978.51, stdev=1298.10, samples=119
  write: IOPS=3970, BW=15.5MiB/s (16.3MB/s)(931MiB/60001msec); 0 zone resets
    slat (nsec): min=1814, max=62267k, avg=114899.56, stdev=760970.15
    clat (usec): min=61, max=63047, avg=1998.54, stdev=3009.44
     lat (usec): min=99, max=65162, avg=2113.44, stdev=3119.35
    clat percentiles (usec):
     |  1.00th=[  210],  5.00th=[  260], 10.00th=[  297], 20.00th=[  388],
     | 30.00th=[  594], 40.00th=[  947], 50.00th=[ 1450], 60.00th=[ 1909],
     | 70.00th=[ 2343], 80.00th=[ 2868], 90.00th=[ 3589], 95.00th=[ 4424],
     | 99.00th=[16909], 99.50th=[24511], 99.90th=[35914], 99.95th=[39584],
     | 99.99th=[52691]
   bw (  KiB/s): min= 8960, max=38384, per=12.62%, avg=15918.06, stdev=5234.51, samples=119
   iops        : min= 2240, max= 9596, avg=3979.50, stdev=1308.62, samples=119
  lat (usec)   : 100=0.01%, 250=4.12%, 500=22.54%, 750=9.09%, 1000=6.39%
  lat (msec)   : 2=22.61%, 4=29.42%, 10=4.26%, 20=0.87%, 50=0.70%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.97%, sys=5.38%, ctx=258345, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=238158,238242,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=19: Thu Oct 17 09:32:51 2024
  read: IOPS=3972, BW=15.5MiB/s (16.3MB/s)(931MiB/60001msec)
    slat (nsec): min=1645, max=62660k, avg=112845.88, stdev=759955.37
    clat (usec): min=48, max=79437, avg=1803.30, stdev=2842.41
     lat (usec): min=102, max=79447, avg=1916.14, stdev=2959.18
    clat percentiles (usec):
     |  1.00th=[  204],  5.00th=[  258], 10.00th=[  297], 20.00th=[  379],
     | 30.00th=[  562], 40.00th=[  865], 50.00th=[ 1287], 60.00th=[ 1696],
     | 70.00th=[ 2089], 80.00th=[ 2540], 90.00th=[ 3228], 95.00th=[ 3982],
     | 99.00th=[15008], 99.50th=[22938], 99.90th=[35390], 99.95th=[39060],
     | 99.99th=[55837]
   bw (  KiB/s): min= 8600, max=36376, per=12.60%, avg=15870.52, stdev=5211.45, samples=119
   iops        : min= 2150, max= 9094, avg=3967.60, stdev=1302.85, samples=119
  write: IOPS=3988, BW=15.6MiB/s (16.3MB/s)(935MiB/60001msec); 0 zone resets
    slat (nsec): min=1805, max=52632k, avg=112704.51, stdev=702426.72
    clat (usec): min=68, max=79425, avg=1988.30, stdev=3004.24
     lat (usec): min=107, max=79432, avg=2101.01, stdev=3097.47
    clat percentiles (usec):
     |  1.00th=[  210],  5.00th=[  262], 10.00th=[  297], 20.00th=[  383],
     | 30.00th=[  578], 40.00th=[  947], 50.00th=[ 1467], 60.00th=[ 1926],
     | 70.00th=[ 2343], 80.00th=[ 2835], 90.00th=[ 3589], 95.00th=[ 4424],
     | 99.00th=[16319], 99.50th=[23725], 99.90th=[35914], 99.95th=[40109],
     | 99.99th=[56886]
   bw (  KiB/s): min= 8032, max=36824, per=12.63%, avg=15928.29, stdev=5221.29, samples=119
   iops        : min= 2008, max= 9206, avg=3982.04, stdev=1305.30, samples=119
  lat (usec)   : 50=0.01%, 100=0.01%, 250=4.01%, 500=23.30%, 750=8.66%
  lat (usec)   : 1000=6.16%
  lat (msec)   : 2=22.69%, 4=29.23%, 10=4.40%, 20=0.87%, 50=0.67%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.98%, sys=5.35%, ctx=257255, majf=0, minf=14
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=238379,239299,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=20: Thu Oct 17 09:32:51 2024
  read: IOPS=3990, BW=15.6MiB/s (16.3MB/s)(935MiB/60001msec)
    slat (nsec): min=1674, max=46763k, avg=108948.50, stdev=684481.01
    clat (usec): min=46, max=57542, avg=1799.98, stdev=2814.98
     lat (usec): min=103, max=57545, avg=1908.93, stdev=2913.17
    clat percentiles (usec):
     |  1.00th=[  202],  5.00th=[  258], 10.00th=[  293], 20.00th=[  375],
     | 30.00th=[  545], 40.00th=[  848], 50.00th=[ 1287], 60.00th=[ 1696],
     | 70.00th=[ 2089], 80.00th=[ 2540], 90.00th=[ 3228], 95.00th=[ 3982],
     | 99.00th=[15533], 99.50th=[22938], 99.90th=[34866], 99.95th=[38011],
     | 99.99th=[44827]
   bw (  KiB/s): min= 7384, max=37928, per=12.63%, avg=15908.76, stdev=5877.84, samples=119
   iops        : min= 1846, max= 9482, avg=3977.16, stdev=1469.47, samples=119
  write: IOPS=3984, BW=15.6MiB/s (16.3MB/s)(934MiB/60001msec); 0 zone resets
    slat (nsec): min=1827, max=53530k, avg=116353.42, stdev=778360.86
    clat (usec): min=66, max=57694, avg=1985.18, stdev=2972.87
     lat (usec): min=105, max=62854, avg=2101.53, stdev=3088.50
    clat percentiles (usec):
     |  1.00th=[  208],  5.00th=[  260], 10.00th=[  297], 20.00th=[  379],
     | 30.00th=[  562], 40.00th=[  930], 50.00th=[ 1450], 60.00th=[ 1926],
     | 70.00th=[ 2343], 80.00th=[ 2868], 90.00th=[ 3589], 95.00th=[ 4424],
     | 99.00th=[16909], 99.50th=[23987], 99.90th=[35390], 99.95th=[39060],
     | 99.99th=[49021]
   bw (  KiB/s): min= 6656, max=37400, per=12.60%, avg=15884.69, stdev=5850.86, samples=119
   iops        : min= 1664, max= 9350, avg=3971.14, stdev=1462.72, samples=119
  lat (usec)   : 50=0.01%, 100=0.01%, 250=4.17%, 500=23.66%, 750=8.53%
  lat (usec)   : 1000=6.09%
  lat (msec)   : 2=22.41%, 4=29.24%, 10=4.33%, 20=0.87%, 50=0.71%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.95%, sys=5.35%, ctx=258391, majf=0, minf=13
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=239416,239079,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=21: Thu Oct 17 09:32:51 2024
  read: IOPS=3945, BW=15.4MiB/s (16.2MB/s)(925MiB/60001msec)
    slat (nsec): min=1679, max=57091k, avg=112833.11, stdev=729500.11
    clat (usec): min=43, max=60128, avg=1809.92, stdev=2786.26
     lat (usec): min=101, max=61887, avg=1922.75, stdev=2897.31
    clat percentiles (usec):
     |  1.00th=[  202],  5.00th=[  258], 10.00th=[  297], 20.00th=[  388],
     | 30.00th=[  578], 40.00th=[  889], 50.00th=[ 1303], 60.00th=[ 1696],
     | 70.00th=[ 2089], 80.00th=[ 2540], 90.00th=[ 3228], 95.00th=[ 3982],
     | 99.00th=[15139], 99.50th=[22938], 99.90th=[34341], 99.95th=[37487],
     | 99.99th=[47973]
   bw (  KiB/s): min= 8400, max=30112, per=12.56%, avg=15821.85, stdev=4767.47, samples=119
   iops        : min= 2100, max= 7528, avg=3955.43, stdev=1191.87, samples=119
  write: IOPS=3957, BW=15.5MiB/s (16.2MB/s)(927MiB/60001msec); 0 zone resets
    slat (nsec): min=1822, max=46725k, avg=112747.26, stdev=701951.55
    clat (usec): min=69, max=60974, avg=2011.59, stdev=3015.94
     lat (usec): min=115, max=61537, avg=2124.33, stdev=3112.04
    clat percentiles (usec):
     |  1.00th=[  210],  5.00th=[  260], 10.00th=[  297], 20.00th=[  392],
     | 30.00th=[  603], 40.00th=[  971], 50.00th=[ 1467], 60.00th=[ 1926],
     | 70.00th=[ 2376], 80.00th=[ 2868], 90.00th=[ 3621], 95.00th=[ 4424],
     | 99.00th=[17171], 99.50th=[24773], 99.90th=[35390], 99.95th=[39584],
     | 99.99th=[51119]
   bw (  KiB/s): min= 8560, max=30392, per=12.59%, avg=15870.71, stdev=4726.69, samples=119
   iops        : min= 2140, max= 7598, avg=3967.66, stdev=1181.66, samples=119
  lat (usec)   : 50=0.01%, 100=0.01%, 250=4.04%, 500=22.29%, 750=9.02%
  lat (usec)   : 1000=6.34%
  lat (msec)   : 2=22.91%, 4=29.46%, 10=4.34%, 20=0.87%, 50=0.73%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.98%, sys=5.36%, ctx=256425, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=236731,237425,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=22: Thu Oct 17 09:32:51 2024
  read: IOPS=3857, BW=15.1MiB/s (15.8MB/s)(904MiB/60001msec)
    slat (nsec): min=1683, max=61810k, avg=116738.35, stdev=755427.94
    clat (usec): min=57, max=62408, avg=1859.74, stdev=2879.46
     lat (usec): min=105, max=65792, avg=1976.47, stdev=2991.02
    clat percentiles (usec):
     |  1.00th=[  206],  5.00th=[  262], 10.00th=[  302], 20.00th=[  400],
     | 30.00th=[  611], 40.00th=[  938], 50.00th=[ 1369], 60.00th=[ 1762],
     | 70.00th=[ 2147], 80.00th=[ 2606], 90.00th=[ 3261], 95.00th=[ 4015],
     | 99.00th=[16057], 99.50th=[23200], 99.90th=[35390], 99.95th=[40633],
     | 99.99th=[54789]
   bw (  KiB/s): min= 8886, max=29192, per=12.28%, avg=15462.86, stdev=4379.20, samples=119
   iops        : min= 2221, max= 7298, avg=3865.68, stdev=1094.80, samples=119
  write: IOPS=3867, BW=15.1MiB/s (15.8MB/s)(906MiB/60001msec); 0 zone resets
    slat (nsec): min=1833, max=43026k, avg=115101.99, stdev=697178.26
    clat (usec): min=67, max=65774, avg=2045.95, stdev=3000.79
     lat (usec): min=116, max=70716, avg=2161.06, stdev=3095.03
    clat percentiles (usec):
     |  1.00th=[  212],  5.00th=[  265], 10.00th=[  306], 20.00th=[  404],
     | 30.00th=[  635], 40.00th=[ 1037], 50.00th=[ 1532], 60.00th=[ 1975],
     | 70.00th=[ 2409], 80.00th=[ 2900], 90.00th=[ 3654], 95.00th=[ 4490],
     | 99.00th=[16909], 99.50th=[24511], 99.90th=[35390], 99.95th=[39060],
     | 99.99th=[44827]
   bw (  KiB/s): min= 7976, max=28144, per=12.30%, avg=15505.83, stdev=4457.92, samples=119
   iops        : min= 1994, max= 7036, avg=3876.42, stdev=1114.47, samples=119
  lat (usec)   : 100=0.01%, 250=3.73%, 500=21.59%, 750=8.73%, 1000=6.32%
  lat (msec)   : 2=23.07%, 4=30.35%, 10=4.59%, 20=0.90%, 50=0.71%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.95%, sys=5.29%, ctx=254521, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=231450,232042,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=23: Thu Oct 17 09:32:51 2024
  read: IOPS=3949, BW=15.4MiB/s (16.2MB/s)(926MiB/60001msec)
    slat (nsec): min=1629, max=56463k, avg=112903.64, stdev=734056.03
    clat (usec): min=34, max=62460, avg=1823.89, stdev=2849.09
     lat (usec): min=104, max=62466, avg=1936.80, stdev=2959.39
    clat percentiles (usec):
     |  1.00th=[  200],  5.00th=[  255], 10.00th=[  293], 20.00th=[  383],
     | 30.00th=[  578], 40.00th=[  881], 50.00th=[ 1303], 60.00th=[ 1713],
     | 70.00th=[ 2114], 80.00th=[ 2573], 90.00th=[ 3261], 95.00th=[ 3982],
     | 99.00th=[15795], 99.50th=[22676], 99.90th=[34866], 99.95th=[39060],
     | 99.99th=[53216]
   bw (  KiB/s): min= 7984, max=32360, per=12.57%, avg=15833.08, stdev=4822.55, samples=119
   iops        : min= 1996, max= 8090, avg=3958.24, stdev=1205.63, samples=119
  write: IOPS=3945, BW=15.4MiB/s (16.2MB/s)(925MiB/60001msec); 0 zone resets
    slat (nsec): min=1817, max=60365k, avg=113824.88, stdev=718109.73
    clat (usec): min=67, max=62443, avg=1998.15, stdev=3012.39
     lat (usec): min=107, max=62465, avg=2111.98, stdev=3111.31
    clat percentiles (usec):
     |  1.00th=[  208],  5.00th=[  260], 10.00th=[  297], 20.00th=[  388],
     | 30.00th=[  586], 40.00th=[  955], 50.00th=[ 1450], 60.00th=[ 1926],
     | 70.00th=[ 2343], 80.00th=[ 2835], 90.00th=[ 3589], 95.00th=[ 4424],
     | 99.00th=[16712], 99.50th=[23987], 99.90th=[35390], 99.95th=[40109],
     | 99.99th=[52691]
   bw (  KiB/s): min= 8359, max=32168, per=12.54%, avg=15816.73, stdev=4930.83, samples=119
   iops        : min= 2089, max= 8042, avg=3954.16, stdev=1232.72, samples=119
  lat (usec)   : 50=0.01%, 100=0.01%, 250=4.24%, 500=22.52%, 750=8.74%
  lat (usec)   : 1000=6.38%
  lat (msec)   : 2=22.48%, 4=29.70%, 10=4.32%, 20=0.90%, 50=0.70%
  lat (msec)   : 100=0.02%
  cpu          : usr=1.02%, sys=5.23%, ctx=256231, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=236984,236722,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=24: Thu Oct 17 09:32:51 2024
  read: IOPS=3819, BW=14.9MiB/s (15.6MB/s)(895MiB/60001msec)
    slat (nsec): min=1677, max=57801k, avg=117509.54, stdev=737545.05
    clat (usec): min=67, max=79746, avg=1883.58, stdev=2864.22
     lat (usec): min=105, max=79772, avg=2001.09, stdev=2973.45
    clat percentiles (usec):
     |  1.00th=[  208],  5.00th=[  265], 10.00th=[  306], 20.00th=[  412],
     | 30.00th=[  644], 40.00th=[  979], 50.00th=[ 1385], 60.00th=[ 1778],
     | 70.00th=[ 2180], 80.00th=[ 2606], 90.00th=[ 3294], 95.00th=[ 4080],
     | 99.00th=[15664], 99.50th=[23462], 99.90th=[34341], 99.95th=[38011],
     | 99.99th=[55313]
   bw (  KiB/s): min= 8678, max=29024, per=12.13%, avg=15280.55, stdev=4467.88, samples=119
   iops        : min= 2169, max= 7256, avg=3820.09, stdev=1116.97, samples=119
  write: IOPS=3820, BW=14.9MiB/s (15.6MB/s)(895MiB/60001msec); 0 zone resets
    slat (nsec): min=1832, max=54734k, avg=118351.24, stdev=745855.46
    clat (usec): min=91, max=63088, avg=2064.30, stdev=3010.71
     lat (usec): min=109, max=63098, avg=2182.65, stdev=3114.39
    clat percentiles (usec):
     |  1.00th=[  212],  5.00th=[  265], 10.00th=[  306], 20.00th=[  416],
     | 30.00th=[  660], 40.00th=[ 1074], 50.00th=[ 1565], 60.00th=[ 2008],
     | 70.00th=[ 2442], 80.00th=[ 2933], 90.00th=[ 3687], 95.00th=[ 4490],
     | 99.00th=[17171], 99.50th=[25035], 99.90th=[34866], 99.95th=[39584],
     | 99.99th=[50594]
   bw (  KiB/s): min= 8183, max=29496, per=12.12%, avg=15284.41, stdev=4551.42, samples=119
   iops        : min= 2045, max= 7374, avg=3821.05, stdev=1137.87, samples=119
  lat (usec)   : 100=0.01%, 250=3.57%, 500=20.87%, 750=8.71%, 1000=6.34%
  lat (msec)   : 2=23.39%, 4=30.73%, 10=4.78%, 20=0.84%, 50=0.74%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.87%, sys=5.32%, ctx=253743, majf=0, minf=14
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=229203,229205,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16
benchtest: (groupid=0, jobs=1): err= 0: pid=25: Thu Oct 17 09:32:51 2024
  read: IOPS=3980, BW=15.5MiB/s (16.3MB/s)(933MiB/60001msec)
    slat (nsec): min=1688, max=52894k, avg=107730.90, stdev=677814.73
    clat (usec): min=73, max=68793, avg=1800.44, stdev=2831.21
     lat (usec): min=101, max=79115, avg=1908.17, stdev=2929.53
    clat percentiles (usec):
     |  1.00th=[  202],  5.00th=[  255], 10.00th=[  293], 20.00th=[  371],
     | 30.00th=[  545], 40.00th=[  848], 50.00th=[ 1287], 60.00th=[ 1680],
     | 70.00th=[ 2089], 80.00th=[ 2540], 90.00th=[ 3228], 95.00th=[ 3982],
     | 99.00th=[15270], 99.50th=[22676], 99.90th=[34866], 99.95th=[38536],
     | 99.99th=[49021]
   bw (  KiB/s): min= 7664, max=29984, per=12.65%, avg=15932.27, stdev=4578.87, samples=119
   iops        : min= 1916, max= 7496, avg=3983.03, stdev=1144.72, samples=119
  write: IOPS=3988, BW=15.6MiB/s (16.3MB/s)(935MiB/60001msec); 0 zone resets
    slat (nsec): min=1786, max=60613k, avg=115691.17, stdev=768902.91
    clat (usec): min=87, max=79083, avg=1986.90, stdev=3033.43
     lat (usec): min=94, max=79160, avg=2102.59, stdev=3150.36
    clat percentiles (usec):
     |  1.00th=[  208],  5.00th=[  258], 10.00th=[  293], 20.00th=[  375],
     | 30.00th=[  562], 40.00th=[  914], 50.00th=[ 1434], 60.00th=[ 1909],
     | 70.00th=[ 2343], 80.00th=[ 2835], 90.00th=[ 3589], 95.00th=[ 4424],
     | 99.00th=[17171], 99.50th=[24249], 99.90th=[35914], 99.95th=[39584],
     | 99.99th=[51119]
   bw (  KiB/s): min= 7992, max=30024, per=12.66%, avg=15968.08, stdev=4521.38, samples=119
   iops        : min= 1998, max= 7506, avg=3991.99, stdev=1130.35, samples=119
  lat (usec)   : 100=0.01%, 250=4.25%, 500=23.68%, 750=8.54%, 1000=6.09%
  lat (msec)   : 2=22.49%, 4=29.04%, 10=4.35%, 20=0.85%, 50=0.71%
  lat (msec)   : 100=0.01%
  cpu          : usr=0.95%, sys=5.40%, ctx=256084, majf=0, minf=12
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=238814,239331,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
   READ: bw=123MiB/s (129MB/s), 14.9MiB/s-15.6MiB/s (15.6MB/s-16.3MB/s), io=7379MiB (7738MB), run=60001-60001msec
  WRITE: bw=123MiB/s (129MB/s), 14.9MiB/s-15.6MiB/s (15.6MB/s-16.3MB/s), io=7388MiB (7747MB), run=60001-60001msec

Disk stats (read/write):
  nvme0n1: ios=1887670/1889945, sectors=15101752/15119704, merge=0/0, ticks=1220328/1167147, in_queue=2387475, util=99.31%
```

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](talos.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)