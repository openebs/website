---
id: gke
title: Replicated PV Mayastor Installation on Google Kubernetes Engine
keywords:
 - Replicated PV Mayastor Installation on Google Kubernetes Engine
 - Replicated PV Mayastor Installation on GKE
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - Google Kubernetes Engine
 - GKE
description: This section explains about the Platform Support for Replicated PV Mayastor.
---
# Replicated PV Mayastor Installation on Google Kubernetes Engine

This document provides instructions for installing Replicated PV Mayastor on Google Kubernetes Engine (GKE).

## GKE with Local SSDs

- GKE with local SSDs (Solid State Drive) are ephemeral because local SSDs are physically attached to the node’s host virtual machine instance, any data stored in them only exists on that node. Since the data stored on the disks is local, your application must be resilient to unavailable data.

- A Pod that writes to a local SSD might lose access to the data stored on the disk if the Pod is rescheduled away from that node. Additionally, if the node is terminated, upgraded, or repaired the data will be erased.

- Local SSDs cannot be added to an existing node pool.

Using OpenEBS for GKE with Local SSDs offers several benefits, particularly in managing storage in a cloud-native way. 

**Replication and Resilience:** OpenEBS can manage data replication across multiple nodes, enhancing data availability and resilience. Even though Local SSDs provide high performance, they are ephemeral by nature. OpenEBS can help mitigate the risk of data loss by replicating data to other nodes.

**Performance:** Local SSDs provide high IOPS and low latency compared to other storage options. OpenEBS can leverage these performance characteristics for applications that require fast storage access.


:::info
- GKE supports adding additional disks with local SSD while creating the cluster. 

- Adding additional disks to existing node pool is not supported.

- Each Local SSD disk comes in a fixed size and you can attach multiple Local SSD disks to a single VM when you create it. The number of Local SSD disks that you can attach to a VM depends on the VM's machine type. See the [Local SSD Disks documentation](https://cloud.google.com/compute/docs/disks/local-ssd#choose_number_local_ssds) for more information.
:::

## Prerequisites

Before installing Replicated PV Mayastor, make sure that you meet the following requirements:

- **Image**

    Replicated PV Mayastor is supported exclusively by GKE clusters that are provisioned on the [Ubuntu node images](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images) (ubuntu_containerd). It is necessary to specify the Ubuntu node image when you create the clusters.

- **Hardware Requirements**

    Your machine type must meet the requirements defined in the [prerequisites](../rs-installation.md#prerequisites).

- **GKE Nodes**

    The minimum number of worker nodes that can be supported is three. The number of worker nodes on which IO engine pods are deployed should not be less than the desired replication factor when using the synchronous replication feature (N-way mirroring).

- **Additional Disks**

    Additional node storage disks can be added as [local SSDs](https://cloud.google.com/kubernetes-engine/docs/concepts/local-ssd#block) during the cluster creation based on the machine types. These local SSDs should be created as a Block device storage using the `--local-nvme-ssd-block` option and not as ephemeral storage.

    ```
    gcloud container clusters create <CLUSTER_NAME> --machine-type <MACHINE_TYPE> --num-nodes <NUMBER_OF_NODES> --zone <ZONE> --local-nvme-ssd-block count=1 --image-type ubuntu_containerd
    ```

- **Enable Huge Pages**
    
    2MiB-sized Huge Pages must be supported and enabled on the storage nodes i.e. nodes where IO engine pods are deployed. A minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the IO engine pod on each node.
    Secure Socket Shell (SSH) to the GKE worker node to enable huge pages. See [here](https://cloud.google.com/kubernetes-engine/distributed-cloud/vmware/docs/how-to/ssh-cluster-node) for more details.

- **Kernel Modules**

    SSH to the GKE worker nodes to load nvme_tcp modules.

    ```
    modprobe nvme_tcp
    ```

- **Preparing the Cluster**

    See the [Replicated PV Mayastor Installation documentation](../rs-installation.md#preparing-the-cluster) for instructions on preparing the cluster.

- **ETCD and LOKI Storage Class**

    GKE storage class - standard (rwo) should be used for ETCD and LOKI.

## Install Replicated PV Mayastor on GKE

See the [Installing OpenEBS documentation](../../../../quickstart-guide/installation.md#installation-via-helm) to install Replicated PV Mayastor using Helm.

- **Helm Install Command**

```
helm install openebs --namespace openebs openebs/openebs --create-namespace --set openebs-crds.csi.volumeSnapshots.enabled=false --set mayastor.etcd.localpvScConfig.enabled=false --set mayastor.etcd.persistence.enabled=true --set mayastor.etcd.persistence.storageClass=standard-rwo --set mayastor.loki-stack.localpvScConfig.enabled=false --set mayastor.loki-stack.loki.persistence.enabled=true --set mayastor.loki-stack.loki.persistence.storageClassName=standard-rwo
```

:::info
- GKE storage class - standard (rwo) should be used for ETCD and LOKI.

- GKE comes with Volume snapshot CRD’s. Disable it from the OpenEBS chart as you might face issues with installation as these resources already exist. 
:::

As a next step verify your installation and do the post-installation steps as follows:

```
NAME                                              READY   STATUS    RESTARTS   AGE
openebs-agent-core-674f784df5-7szbm               2/2     Running   0          11m
openebs-agent-ha-node-nnkmv                       1/1     Running   0          11m
openebs-agent-ha-node-pvcrr                       1/1     Running   0          11m
openebs-agent-ha-node-rqkkk                       1/1     Running   0          11m
openebs-api-rest-79556897c8-b824j                 1/1     Running   0          11m
openebs-csi-controller-b5c47d49-5t5zd             6/6     Running   0          11m
openebs-csi-node-flq49                            2/2     Running   0          11m
openebs-csi-node-k8d7h                            2/2     Running   0          11m
openebs-csi-node-v7jfh                            2/2     Running   0          11m
openebs-etcd-0                                    1/1     Running   0          11m
openebs-etcd-1                                    1/1     Running   0          11m
openebs-etcd-2                                    1/1     Running   0          11m
openebs-io-engine-7t6tf                           2/2     Running   0          11m
openebs-io-engine-9df6r                           2/2     Running   0          11m
openebs-io-engine-rqph4                           2/2     Running   0          11m
openebs-localpv-provisioner-6ddf7c7978-4fkvs      1/1     Running   0          11m
openebs-loki-0                                    1/1     Running   0          11m
openebs-lvm-localpv-controller-7b6d6b4665-fk78q   5/5     Running   0          11m
openebs-lvm-localpv-node-mcch4                    2/2     Running   0          11m
openebs-lvm-localpv-node-pdt88                    2/2     Running   0          11m
openebs-lvm-localpv-node-r9jn2                    2/2     Running   0          11m
openebs-nats-0                                    3/3     Running   0          11m
openebs-nats-1                                    3/3     Running   0          11m
openebs-nats-2                                    3/3     Running   0          11m
openebs-obs-callhome-854bc967-5f879               2/2     Running   0          11m
openebs-operator-diskpool-5586b65c-cwpr8          1/1     Running   0          11m
openebs-promtail-2vrzk                            1/1     Running   0          11m
openebs-promtail-mwxk8                            1/1     Running   0          11m
openebs-promtail-w7b8k                            1/1     Running   0          11m
openebs-zfs-localpv-controller-f78f7467c-blr7q    5/5     Running   0          11m
openebs-zfs-localpv-node-h46m5                    2/2     Running   0          11m
openebs-zfs-localpv-node-svfgq                    2/2     Running   0          11m
openebs-zfs-localpv-node-wm9ks                    2/2     Running   0          11m
```

## Pools

The available GKE local SSD disks on worker nodes can be viewed by using the `kubectl-mayastor` plugin.

```
$ kubectl mayastor get block-devices gke-gke-ssd-default-pool-2a0f964a-hv99
 DEVNAME       DEVTYPE  SIZE    AVAILABLE  MODEL       DEVPATH                                              MAJOR  MINOR  DEVLINKS 
 /dev/nvme1n1  disk     375GiB  yes        nvme_card0  /devices/pci0000:00/0000:00:04.0/nvme/nvme1/nvme1n1  259    0      "/dev/disk/by-id/google-local-nvme-ssd-0", "/dev/disk/by-id/nvme-nvme.1ae0-6e766d655f6361726430-6e766d655f6361726430-00000001", "/dev/disk/by-id/nvme-nvme_card0_nvme_card0", "/dev/disk/by-id/nvme-nvme_card0_nvme_card0_1", "/dev/disk/by-path/pci-0000:00:04.0-nvme-1" 
```

The block size of the disks should be specified by the block size of the local SSD in your GKE. Run the following commands from the worker node to find the SSD block size:

**Command**

```
fdisk -l /dev/nvme1n1
```

**Output**

```
root@gke-gke-ssd-default-pool-2a0f964a-980h:~# fdisk -l /dev/nvme1n1
Disk /dev/nvme1n1: 375 GiB, 402653184000 bytes, 98304000 sectors
Disk model: nvme_card0
Units: sectors of 1 * 4096 = 4096 bytes
Sector size (logical/physical): 4096 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
```

**Command**

```
lsblk -o NAME,PHY-SeC
```

**Output**

```
root@gke-gke-ssd-default-pool-2a0f964a-980h:~# lsblk -o NAME,PHY-SeC
NAME         PHY-SEC
nvme0n1          512
├─nvme0n1p1      512
├─nvme0n1p14     512
└─nvme0n1p15     512
nvme1n1         4096
root@gke-gke-ssd-default-pool-2a0f964a-980h:~# 
```

### Pool.yaml

Create a pool with the following pool.yaml:

```
apiVersion: "openebs.io/v1beta2"
kind: DiskPool
metadata:
  name: POOL_NAME
  namespace: mayastor
spec:
  node: NODENAME
  disks: ["aio:////dev/disk/by-id/google-local-nvme-ssd-0?blk_size=4096"]
```

**Command**

```
kubectl apply -f pool.yaml
```

**Output**

```
diskpool.openebs.io/pool-1 created
```

## Configuration

- See the [Replicated PV Mayastor Configuration documentation](../rs-configuration.md#create-replicated-pv-mayastor-storageclasss) for instructions regarding StorageClass creation.

- See [Deploy an Application documentation](../rs-deployment.md) for instructions regarding PVC creation and deploying an application.

## Node Failure Scenario

The GKE worker nodes are a part of a managed instance group. A new node is created with a new local SSD if a node becomes unreachable or faulty. In such cases, recreate the pool with a new name. Once the new pool is created, the OpenEBS Replicated PV Mayastor will rebuild the volume with the replicated data.

:::note
When a node gets replaced with a new node, all the node labels and huge pages configurations will be lost. You must reconfigure these [prerequisites](#prerequisites) on the new node. 
:::

**Example**

When the node `gke-gke-local-ssd-default-pool-dd2b0b02-8twd` is failed, a new node/disk is acquired, resulting in the pool-3 being classified as unknown and the Replicated PV Mayastor volume being classified as degraded due to the failure of one of the replicas.

```
$ kubectl get dsp -n mayastor 
NAME     NODE                                           STATE     POOL_STATUS   CAPACITY       USED         AVAILABLE
pool-1   gke-gke-local-ssd-default-pool-dd2b0b02-08cs   Created   Online        402258919424   5368709120   396890210304
pool-2   gke-gke-local-ssd-default-pool-dd2b0b02-n6wq   Created   Online        402258919424   5368709120   396890210304
pool-3   gke-gke-local-ssd-default-pool-dd2b0b02-8twd   Created   Unknown       0              0            0
```

```
$ kubectl mayastor get volumes 
 ID                                    REPLICAS  TARGET-NODE                                   ACCESSIBILITY  STATUS    SIZE  THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE 
 fa486a03-d806-4b5c-a534-5666900853a2  3         gke-gke-local-ssd-default-pool-dd2b0b02-08cs  nvmf           Degraded  5GiB  false             5GiB       0          <none>
```

Re-configure the node labels/hugepages and load nvme_tcp modules on the node again. Recreate the pool with a new name `pool-4`.

```
$ kubectl apply -f pool-4.yaml 
diskpool.openebs.io/pool-4 created
$ kubectl get dsp -n mayastor 
NAME     NODE                                           STATE     POOL_STATUS   CAPACITY       USED         AVAILABLE
pool-1   gke-gke-local-ssd-default-pool-dd2b0b02-08cs   Created   Online        402258919424   5368709120   396890210304
pool-2   gke-gke-local-ssd-default-pool-dd2b0b02-n6wq   Created   Online        402258919424   5368709120   396890210304
pool-3   gke-gke-local-ssd-default-pool-dd2b0b02-8twd   Created   Unknown       0              0            0
pool-4   gke-gke-local-ssd-default-pool-dd2b0b02-8twd   Created   Online        402258919424   5368709120   396890210304
```

Once the pool is created, the degraded volume is back online after the rebuild.

```
$ kubectl mayastor get volumes 
 ID                                    REPLICAS  TARGET-NODE                                   ACCESSIBILITY  STATUS  SIZE  THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE 
 fa486a03-d806-4b5c-a534-5666900853a2  3         gke-gke-local-ssd-default-pool-dd2b0b02-08cs  nvmf           Online  5GiB  false             5GiB       0          <none> 
$ kubectl mayastor get volume-replica-topologies
 VOLUME-ID                             ID                                    NODE                                          POOL    STATUS  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD 
 fa486a03-d806-4b5c-a534-5666900853a2  772af79e-f277-4ce3-a336-3a2b12a07a02  gke-gke-local-ssd-default-pool-dd2b0b02-n6wq  pool-3  Online  5GiB      5GiB       0 B        Online        <none>  <none> 
 ├─                                    cb6293b8-2121-44b7-b329-606bc9972342  gke-gke-local-ssd-default-pool-dd2b0b02-8twd  pool-5  Online  5GiB      5GiB       0 B        Online        <none>  <none> 
 └─                                    6c21e941-8b41-4b52-8c0d-90ea317f0008  gke-gke-local-ssd-default-pool-dd2b0b02-08cs  pool-1  Online  5GiB      5GiB       0 B        Online        <none>  <none> 
```

**Replicated PV Mayastor Rebuild History** 

```
$ kubectl mayastor get volumes 
 ID                                    REPLICAS  TARGET-NODE                                   ACCESSIBILITY  STATUS  SIZE  THIN-PROVISIONED  ALLOCATED  SNAPSHOTS  SOURCE 
 fa486a03-d806-4b5c-a534-5666900853a2  3         gke-gke-local-ssd-default-pool-dd2b0b02-08cs  nvmf           Online  5GiB  false             5GiB       0          <none> 
$ kubectl mayastor get rebuild-history fa486a03-d806-4b5c-a534-5666900853a2 
 DST                                   SRC                                   STATE      TOTAL  RECOVERED  TRANSFERRED  IS-PARTIAL  START-TIME            END-TIME 
 cb6293b8-2121-44b7-b329-606bc9972342  6c21e941-8b41-4b52-8c0d-90ea317f0008  Completed  5GiB   5GiB       5GiB         false       2024-06-24T07:19:04Z  2024-06-24T07:19:17Z 
$ kubectl mayastor get rebuild-history fa486a03-d806-4b5c-a534-5666900853a2 -o yaml 
targetUuid: 7a8e24bf-4033-4d69-9228-09b6dcc93b25
records:
- childUri: nvmf://10.128.15.222:8420/nqn.2019-05.io.openebs:cb6293b8-2121-44b7-b329-606bc9972342?uuid=cb6293b8-2121-44b7-b329-606bc9972342
  srcUri: bdev:///6c21e941-8b41-4b52-8c0d-90ea317f0008?uuid=6c21e941-8b41-4b52-8c0d-90ea317f0008
  rebuildJobState: Completed
  blocksTotal: 1309434
  blocksRecovered: 1309434
  blocksTransferred: 1309434
  blocksRemaining: 0
  blockSize: 4096
  isPartial: false
  startTime: 2024-06-24T07:19:04.389230666Z
  endTime: 2024-06-24T07:19:17.488855597Z
```

The application data is available without any errors.

```
root@nginx-deployment-7bf66b59f5-mxcdp:/# cd volume
root@nginx-deployment-7bf66b59f5-mxcdp:/volume# ls -lrt
total 16
drwx------ 2 root root 16384 Jun 21 08:15 lost+found
-rw-r--r-- 1 root root     0 Jun 21 08:16 test
-rw-r--r-- 1 root root     0 Jun 21 08:16 testopenebs
-rw-r--r-- 1 root root     0 Jun 21 08:16 testopenebs-1
-rw-r--r-- 1 root root     0 Jun 21 08:16 testopenebs-2
-rw-r--r-- 1 root root     0 Jun 21 08:16 testopenebs-3
root@nginx-deployment-7bf66b59f5-mxcdp:/volume# 
```

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](talos.md)
- [Provisioning Read-Write-Many (RWX) PVCs](rwx.md)