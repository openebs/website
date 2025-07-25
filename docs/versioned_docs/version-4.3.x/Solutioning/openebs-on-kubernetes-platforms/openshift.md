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

    Your machine type must meet the requirements defined in the [prerequisites](../../quickstart-guide/prerequisites.md).

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

    Refer to the [Replicated PV Mayastor Installation Documentation](../../quickstart-guide/prerequisites.md#preparing-the-cluster) for instructions on preparing the cluster.

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
helm install openebs --namespace openebs openebs/openebs \
  --create-namespace \
  --set openebs-crds.csi.volumeSnapshots.enabled=false \
  --set engines.local.zfs.enabled=false
```

:::info
- Note: The --set engines.local.zfs.enabled=false flag is included because the ZFS kernel driver is not shipped by default with Red Hat-based platforms. This avoids deploying unnecessary or unsupported components.
- OCP includes VolumeSnapshot CRDs by default. To avoid potential installation issues, it is recommended to disable these CRDs in the OpenEBS Helm chart, as these resources already exist in the OCP environment.
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

- Refer to the [Replicated PV Mayastor Configuration Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-create-storageclass.md#create-storageclasss) for instructions regarding StorageClass creation.

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

- Refer to the [Deploy an Application Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-deployment.md) for instructions regarding PVC creation and deploying an application.

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

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](talos.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)