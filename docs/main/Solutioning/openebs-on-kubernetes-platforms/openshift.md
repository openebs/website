---
id: openshift
title: OpenEBS Installation on OpenShift
keywords:
 - OpenEBS Installation on OpenShift
 - Platform Support
 - OpenShift
description: This section explains about the OpenEBS Installation on OpenShift.
---
# OpenEBS Installation on OpenShift

## Overview

This document provides detailed instructions for installing OpenEBS Replicated PV Mayastor and Local PV LVM on OpenShift. It guides you through the required prerequisites, installation steps, and verification procedures to ensure a successful deployment.

Using OpenEBS with OpenShift delivers cloud-native, container-aware storage designed for dynamic provisioning and scalability. This integration simplifies persistent storage management for stateful applications such as databases and message queues, while seamlessly aligning with OpenShift’s ecosystem and DevOps workflows.

## Requirements

Before you begin, make sure that you meet the following requirements:

- Review and follow steps in [Prerequisites documentation](../../quickstart-guide/prerequisites.md).
- 2MiB-sized Huge Pages must be supported and enabled on the storage nodes i.e. nodes where IO engine pods are deployed. A minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the IO engine pod on each node.
Huge pages in the OpenShift Container Platform (OCP) can be enabled during the installation or it can be enabled by creating new machine configs post-installation. Refer to the [Red Hat Documentation](https://access.redhat.com/solutions/5214791) for more details.

## Install Replicated PV Mayastor and Local PV LVM on OpenShift

1. Create a Namespace.

  ```
  oc create ns openebs
  ```

2. Install the OpenEBS Helm chart.

  ```
  helm install openebs --namespace openebs openebs/openebs --create-namespace \
  --set openebs-crds.csi.volumeSnapshots.enabled=false \
  --set engines.local.zfs.enabled=false
  ```

:::important
- **Local PV ZFS Disabled:** The ZFS package is not supported on Red Hat Enterprise Linux CoreOS (RHCOS). As a result, Local PV ZFS is disabled by default for OpenShift installations.
- **VolumeSnapshot CRDs Disabled in Helm:** VolumeSnapshot CustomResourceDefinitions (CRDs) are preinstalled in OpenShift. The Helm chart is configured to skip their installation to avoid redundancy.
:::

3. In a separate client session, add the required service accounts to the privileged Security Context Constraints (SCC).

  ```
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:loki
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:minio-sa
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-lvm-node-sa
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-alloy
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-localpv-provisioner
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-nats
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-service-account
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:default
  ```

4. Verify that all pods in the `openebs` namespace are running.

  ```
  kubectl get pods -n openebs
  ```

  **Sample Output**

  ```
  NAME                                              READY   STATUS             RESTARTS      AGE
  openebs-agent-core-7b94f64c89-jcqv8               2/2     Running            0             13m
  openebs-agent-ha-node-4hxpp                       1/1     Running            0             116s
  openebs-agent-ha-node-lsqw4                       1/1     Running            0             22m
  openebs-agent-ha-node-qmjcr                       1/1     Running            0             22m
  openebs-alloy-8bdnb                               2/2     Running            0             22m
  openebs-alloy-gjjb6                               2/2     Running            0             22m
  openebs-alloy-klkvt                               2/2     Running            0             22m
  openebs-api-rest-85df84c969-srjsg                 1/1     Running            0             25m
  openebs-csi-controller-65d779d999-c8dzz           6/6     Running            0             22m
  openebs-csi-node-49mgj                            2/2     Running            0             19m
  openebs-csi-node-d6ccq                            2/2     Running            0             18m
  openebs-csi-node-zccsl                            2/2     Running            0             19m
  openebs-etcd-0                                    1/1     Running            0             22m
  openebs-etcd-1                                    1/1     Running            0             22m
  openebs-etcd-2                                    1/1     Running            0             22m
  openebs-io-engine-dvzqb                           2/2     Running            0             22m
  openebs-io-engine-jwvr4                           2/2     Running            0             22m
  openebs-io-engine-m8vv6                           2/2     Running            0             10m
  openebs-localpv-provisioner-85c4fd45f9-l5vdd      1/1     Running            0             25m
  openebs-loki-0                                    2/2     Running            0             22m
  openebs-loki-1                                    2/2     Running            0             22m
  openebs-loki-2                                    2/2     Running            0             22m
  openebs-lvm-localpv-controller-57884ddb78-x2zkj   5/5     Running            0             25m
  openebs-lvm-localpv-node-j9wxh                    2/2     Running            0             22m
  openebs-lvm-localpv-node-nmhkp                    2/2     Running            0             22m
  openebs-lvm-localpv-node-w7d2j                    2/2     Running            0             22m
  openebs-minio-0                                   1/1     Running            0             22m
  openebs-minio-1                                   1/1     Running            0             22m
  openebs-minio-2                                   1/1     Running            0             22m
  openebs-nats-0                                    3/3     Running            0             12m
  openebs-nats-1                                    3/3     Running            0             22m
  openebs-nats-2                                    3/3     Running            0             22m
  openebs-obs-callhome-6855f8db6f-q5lx8             2/2     Running            0   
  openebs-operator-diskpool-85795c6f8c-cvv4f        1/1     Running            0             12m
  ```

5. Create a DiskPool Using CLI.
  
  - List available block devices on the node.

    ```
    kubectl openebs mayastor get block-devices <node-name> -n openebs
    ```

    **Sample Output**

    ```
    DEVNAME   DEVTYPE  SIZE    AVAILABLE  MODEL         DEVPATH
    /dev/sdb  disk     10 GiB  yes        Virtual_disk  /devices/pci0000:02/0000:02:00.0/host0/target0:0:1/0:0:1:0/block/sdb
    ```

    :::note
    Modify the name, node, and disks fields in the configuration file to match your environment settings before applying it.
    :::

  - Apply the following configuration to create a DiskPool.

    ```yaml
    cat <<EOF | kubectl create -f -
    apiVersion: "openebs.io/v1beta3"
    kind: DiskPool
    metadata:
      name: pool-on-node-1
      namespace: openebs
    spec:
      node: <node-name>
      disks: ["aio:///dev/disk/by-id/<id>"]
    EOF
    ```

    **Sample Output**

    ```yaml
    cat <<EOF | kubectl create -f -
    apiVersion: "openebs.io/v1beta3"
    kind: DiskPool
    metadata:
      name: pool-on-node-1
      namespace: openebs
    spec:
      node: ocp-cp-3.lab.ocp.lan
      disks: ["aio:///dev/disk/by-id/scsi-36000c299c52a31433ee3887d1efdcc58"]
    EOF
    diskpool.openebs.io/pool-on-node-1 created
    ```

6. Verify DiskPool Status.

  ```
  kubectl get dsp -n openebs
  ```

  **Sample Output**

  ```
  NAME             NODE                   STATE     POOL_STATUS   ENCRYPTED   CAPACITY   USED     AVAILABLE
  pool-on-node-1   ocp-cp-3.lab.ocp.lan   Created   Online        false       10 GiB     64 MiB   9.9 GiB
  ```

7. Create a StorageClass.

  Create a file named `storageclass.yaml` with the following configuration:

  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: mayastor-1
  parameters:
    protocol: nvmf
    repl: "1"
  provisioner: io.openebs.csi-mayastor
  ```

  Apply the configuration:

  ```
  kubectl apply -f storageclass.yaml
  ```

  :::note
  Refer to the [Replicated PV Mayastor StorageClass Parameters documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-storage-class-parameters.md) for detailed information about supported parameters and configuration options.
  :::

8. Create a Persistent Volume Claim (PVC).

  ```yaml
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
  ```

  Verify that the PVC status is Bound.

9. Verify the created StorageClasses.

  ```
  oc get sc
  ```

  **Sample Output**

  ```
  NAME                     PROVISIONER               RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
  mayastor-1               io.openebs.csi-mayastor   Delete          Immediate              false                  113s
  openebs-lvmpv            local.csi.openebs.io      Delete          Immediate              false                  80m
  ```

10. Verify the PVC.

  ```
  oc get pvc
  ```

  **Sample Output**

  ```
  NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
  ms-volume-claim   Bound    pvc-b2cf0473-3aeb-4d8a-844e-7ccfb5508570   1Gi        RWO            mayastor-1     42s
  ```

## Install Local PV LVM on OpenShift

1. Create a Namespace.

  ```
  oc create ns openebs
  ```

2. Install the OpenEBS Helm chart with the Local PV LVM enabled and other storages disabled.

  ```
  helm install openebs --namespace openebs openebs/openebs \
  --set engines.replicated.mayastor.enabled=false \
  --create-namespace \
  --set openebs-crds.csi.volumeSnapshots.enabled=false \
  --set engines.local.zfs.enabled=false
  ```

:::important
- **Local PV ZFS Disabled:** The ZFS package is not supported on Red Hat Enterprise Linux CoreOS (RHCOS). As a result, Local PV ZFS is disabled by default for OpenShift installations.
- **VolumeSnapshot CRDs Disabled in Helm:** VolumeSnapshot CustomResourceDefinitions (CRDs) are preinstalled in OpenShift. The Helm chart is configured to skip their installation to avoid redundancy.
:::  

3. In a separate client session, add the required service accounts to the privileged SCC.

  ```
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:loki
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:minio-sa
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-lvm-node-sa
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-alloy
  oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-localpv-provisioner
  ```

4. Verify that all pods in the `openebs` namespace are running.

  ```
  kubectl get pods -n openebs
  ```

  **Sample Output**

  ```
  NAME                                              READY   STATUS    RESTARTS   AGE
  openebs-alloy-gzt2s                               2/2     Running   0          4m51s
  openebs-alloy-sf2c6                               2/2     Running   0          4m51s
  openebs-alloy-x5r5t                               2/2     Running   0          4m51s
  openebs-localpv-provisioner-85c4fd45f9-2jhbs      1/1     Running   0          4m51s
  openebs-loki-0                                    2/2     Running   0          4m50s
  openebs-loki-1                                    1/2     Running   0          51s
  openebs-loki-2                                    2/2     Running   0          81s
  openebs-lvm-localpv-controller-57884ddb78-qcd6c   5/5     Running   0          4m51s
  openebs-lvm-localpv-node-4vspp                    2/2     Running   0          4m51s
  openebs-lvm-localpv-node-5wxdj                    2/2     Running   0          4m51s
  openebs-lvm-localpv-node-lzq7x                    2/2     Running   0          4m51s
  openebs-minio-0                                   1/1     Running   0          4m50s
  openebs-minio-1                                   1/1     Running   0          4m50s
  openebs-minio-2                                   1/1     Running   0          4m50s
  ```

5. Create a StorageClass.

  Create a file named `storageclass.yaml` with the following configuration:

  ```yaml
  kind: StorageClass
  apiVersion: storage.k8s.io/v1
  metadata:
    name: openebs-lvmpv
  provisioner: local.csi.openebs.io
  parameters:
    storage: lvm
    volgroup: <YOUR-VOLGROUP>
  reclaimPolicy: Delete
  volumeBindingMode: Immediate
  allowedTopologies:
    - matchLabelExpressions:
        - key: kubernetes.io/hostname
          values:
            - <YOUR-NODENAME>
  ```

  Apply the configuration:

  ```
  kubectl apply -f storageclass.yaml
  ```

  :::note
  Refer to the [Local PV LVM StorageClass Parameters documentation](../../user-guides/local-storage-user-guide/local-pv-lvm/configuration/lvm-storageclass-options.md) for detailed information about supported parameters and configuration options.
  :::  

8. Create a PVC.

  ```yaml
  kind: PersistentVolumeClaim
  apiVersion: v1
  metadata:
    name: csi-lvmpv
  spec:
    storageClassName: openebs-lvmpv
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 4Gi
  ```

  Verify that the PVC status is Bound.

9. Verify the created StorageClasses.

  ```
  oc get sc
  ```

  **Sample Output**

  ```
  NAME                    PROVISIONER               RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
  mayastor-1              io.openebs.csi-mayastor   Delete          Immediate              false                  11d
  openebs-hostpath        openebs.io/local          Delete          WaitForFirstConsumer   false                  90m
  openebs-loki-localpv    openebs.io/local          Delete          WaitForFirstConsumer   false                  90m
  openebs-lvmpv           local.csi.openebs.io      Delete          Immediate              false                  3m16s
  openebs-minio-localpv   openebs.io/local          Delete          WaitForFirstConsumer   false                  90m
  ```

10. Verify the PVC.

  ```
  oc get pvc
  ```

  **Sample Output**

  ```
  NAME        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
  csi-lvmpv   Bound    pvc-3573e7b5-9f42-4b84-bafd-0b9b99d958db   4Gi        RWO            openebs-lvmpv   81s
  ```

## Benefits of Using OpenEBS on OpenShift

**Cloud-Native and Container-Aware Storage:** OpenEBS is designed to work in a cloud-native, containerized environment that aligns well with OpenShift's architecture. It offers Container Native Storage (CNS), which runs as microservices in the Kubernetes cluster, providing dynamic storage provisioning with high flexibility.

**Dynamic and Scalable Storage:** OpenEBS allows the provisioning of persistent volumes dynamically. This is particularly useful in OpenShift environments where applications may scale rapidly, and on demand, with minimal manual intervention.

**Storage for Stateful Applications:** OpenShift often hosts stateful applications like databases (MySQL, PostgreSQL, Cassandra), message queues, and other services requiring persistent storage. OpenEBS supports various storage engines, such as Replicated PV Mayastor enabling optimized storage performance depending on the workload type.

**Simplified Storage Operations:** With OpenEBS, storage can be managed and operated by DevOps teams without requiring specialized storage administrators. It abstracts away the complexity of traditional storage solutions, providing a Kubernetes-native experience.

**Easy Integration with OpenShift Features:** OpenEBS can integrate seamlessly with OpenShift’s features like Operators, pipelines, and monitoring tools, making it easier to manage and monitor persistent storage using OpenShift-native tools.

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](talos.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)