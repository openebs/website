---
id: kubevirt
title: KubeVirt VM Live Migration with Replicated PV Mayastor and NFS
keywords: 
  - KubeVirt
  - KubeVirt VM Live Migration
  - NFS server
  - Provisioning NFS PVCs
description: In this document, you learn about KubeVirt VM Live Migration with NFS and OpenEBS Replicated PV Mayastor.
---

## Overview

KubeVirt extends Kubernetes with virtual machine (VM) management capabilities, enabling a unified platform for both containerized and virtualized workloads. Live migration of VMs is a critical feature for achieving high availability, zero-downtime maintenance, and workload mobility. However, live migration in KubeVirt requires shared ReadWriteMany (RWX) storage that can be accessed across multiple nodes.

OpenEBS Replicated PV Mayastor is a high-performance, container-native block storage engine that provides persistent storage for Kubernetes. While Replicated PV Mayastor does not natively support RWX volumes, it can be integrated with an NFS server pod and the NFS CSI driver to provide shared access to storage volumes. This document guides you through the setup and validation of a KubeVirt live migration environment using OpenEBS Replicated PV Mayastor and NFS.

## Environment

| Component | Version |
| :--- | :--- |
| KubeVirt | v1.5.0 |
| Kubernetes (3 nodes) | v1.29.6 |
| OpenEBS | v4.2.0 |
| NFS CSI Driver | v4.11.0 |
| Containerized Data Importer (CDI) | v1.62.0 |
| kubectl-mayastor Plugin | v2.7.4+0 |
| virtctl | v1.5.0 |

## Prerequisites

### Setup OpenEBS

- **Install OpenEBS**
  
  Ensure that OpenEBS is installed in your cluster. Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md) for step-by-step instructions.

- **Install the `kubectl-mayastor` Plugin**
  
  Ensure that `kubectl-mayastor` plugin is installed. Refer to the [Mayastor Kubectl Plugin Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/kubectl-plugin.md) to install the plugin.

- **Create StorageClass for NFS Pod (3 Replicas):**

1. Create a file named `StorageClass1.yaml`.
  
**StorageClass1.yaml**
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-3
parameters:
  protocol: nvmf
  repl: "3"  
  thin: "true"
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

2. Apply the configuration.
  
```
kubectl create -f StorageClass1.yaml
```

- **Create StorageClass for Scratch Space (1 Replica)**

1. Create a file named `StorageClass2.yaml`.
  
**StorageClass2.yaml**
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  protocol: nvmf
  repl: "1"  
  thin: "true"
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

2. Apply the configuration.
  
```
kubectl create -f StorageClass2.yaml
```

- **Setup VolumeSnapshotClass**

1. Create a file named `VolumeSnapshotClass.yaml`.
  
**VolumeSnapshotClass.yaml**
```
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
```

2. Apply the configuration.
  
```
kubectl create -f VolumeSnapshotClass.yaml
```

### Deploying an NFS Server Pod

1. Create a Namespace.

```
kubectl create ns nfs-server
```

2. Create PersistentVolumeClaim (PVC) for NFS Storage.
  
**nfspvc.yaml**
```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: nfs-server-claim
  namespace: nfs-server
spec:
  storageClassName: mayastor-3
  accessModes: 
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

3. Deploy NFS Server Pod.

**nfs-server-deployment.yaml**
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nfs-server
  namespace: nfs-server
spec:
  replicas: 1
  selector:
    matchLabels:
      role: nfs-server
  template:
    metadata:
      labels:
        role: nfs-server
    spec:
      volumes:
      - name: nfs-vol
        persistentVolumeClaim:
          claimName: nfs-server-claim
      restartPolicy: Always
      containers:
      - name: nfs-server
        image: itsthenetwork/nfs-server-alpine
        env:
        - name: SHARED_DIRECTORY
          value: /nfsshare
        ports:
          - name: nfs
            containerPort: 2049
        securityContext:
          privileged: true
        volumeMounts:
          - mountPath: /nfsshare
            name: nfs-vol
```

4. Apply the configuration.

```
kubectl apply -f nfs-server-deployment.yaml
```

5. Create NFS Service.

**nfs-server-service.yaml**
```
apiVersion: v1
kind: Service
metadata:
  name: nfs-server
  namespace: nfs-server
spec:
  ports:
    - name: nfs
      port: 2049
  selector:
    role: nfs-server
```

6. Apply the configuration.

```
kubectl apply -f nfs-server-service.yaml
```

### Deploy NFS CSI Driver and StorageClass

1. Create Namespace.

```
kubectl create ns csi-nfs
```

2. Create Helm Values for StorageClass.

**values.yaml**
```
storageClass:
  create: true
  name: nfs-csi
  parameters:
    server: nfs-server.nfs-server.svc.cluster.local
    share: /
  reclaimPolicy: Delete
  volumeBindingMode: Immediate
  mountOptions:
    - nfsvers=4.1
    - hard   # Example: Ensure persistent mounting
    - timeo=600  # Example: Set timeout to avoid delays
```

3. Install Using Helm.

```
helm repo add csi-driver https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/master/charts
helm repo update
helm install csi-nfs csi-driver/csi-driver-nfs --namespace csi-nfs -f values.yaml
```

## KubeVirt Setup

1. Install KubeVirt Operator.

```
export VERSION=$(curl -s https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
echo $VERSION
kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-operator.yaml"
```

**Sample Output**
```
namespace/kubevirt created
customresourcedefinition.apiextensions.k8s.io/kubevirts.kubevirt.io created
priorityclass.scheduling.k8s.io/kubevirt-cluster-critical created
clusterrole.rbac.authorization.k8s.io/kubevirt.io:operator created
serviceaccount/kubevirt-operator created
role.rbac.authorization.k8s.io/kubevirt-operator created
rolebinding.rbac.authorization.k8s.io/kubevirt-operator-rolebinding created
clusterrole.rbac.authorization.k8s.io/kubevirt-operator created
clusterrolebinding.rbac.authorization.k8s.io/kubevirt-operator created
deployment.apps/virt-operator created
```

2. Create KubeVirt Custom Resource.

```
kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-cr.yaml "
```

**Sample Output**
```
kubevirt.kubevirt.io/kubevirt created
```

3. Patch to Use Emulation (Optional).

```
kubectl -n kubevirt patch kubevirt kubevirt --type=merge --patch '{"spec":{"configuration":{"developerConfiguration":{"useEmulation":true}}}}'
```

:::note
To perform operations such as accessing the VM console or triggering live migration, you must install the `virtctl` CLI tool. Refer to the [Official KubeVirt Documentation](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/)
:::

4. Verify KubeVirt Installation.

```
kubectl get all -n kubevirt
```

**Sample Output**
```
Warning: kubevirt.io/v1 VirtualMachineInstancePresets is now deprecated and will be removed in v2.
NAME                                         READY       STATUS          RESTARTS      AGE
pod/virt-api-595d49d6fd-474xq                1/1         Running         1 (25h ago)   26h
pod/virt-api-595d49d6fd-xg6w4                1/1         Running         1 (25h ago)   26h
pod/virt-controller-6bbb8667fd-587nh         1/1         Running         1 (25h ago)   26h
pod/virt-controller-6bbb8667fd-kzp2h         1/1         Running         1 (25h ago)   26h
pod/virt-handler-6g4tr                       1/1         Running         0             26h
pod/virt-handler-982bg                       1/1         Running         0             26h
pod/virt-handler-dpwcf                       1/1         Running         0             26h
pod/virt-operator-64b9cfbdcc-hjg75           1/1         Running         0             26h
pod/virt-operator-64b9cfbdcc-st7rj           1/1         Running         0             26h

NAME                                         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)      AGE
service/kubevirt-operator-webhook            ClusterIP   10.106.71.24    <none>        443/TCP      26h
service/kubevirt-prometheus-metrics          ClusterIP   None            <none>        443/TCP      26h
service/virt-api                             ClusterIP   10.101.219.70   <none>        443/TCP      26h
service/virt-exportproxy                     ClusterIP   10.108.108.12   <none>        443/TCP      26h

NAME                                         DESIRED     CURRENT         READY         UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE
daemonset.apps/virt-handler                  3           3               3             3            3           kubernetes.io/os=linux   26h

NAME                                         READY       UP-TO-DATE      AVAILABLE     AGE
deployment.apps/virt-api                     2/2         2               2             26h
deployment.apps/virt-controller              2/2         2               2             26h
deployment.apps/virt-operator                2/2         2               2             26h

NAME                                         DESIRED   CURRENT   READY   AGE
replicaset.apps/virt-api-595d49d6fd          2         2         2       26h
replicaset.apps/virt-controller-6bbb8667fd   2         2         2       26h
replicaset.apps/virt-operator-64b9cfbdcc     2         2         2       26h

NAME                                         AGE       PHASE
kubevirt.kubevirt.io/kubevirt                26h       Deployed
```

## CDI Setup

1. Install CDI Operator and Custom Resource.

```
export TAG=$(curl -s -w %{redirect_url} https://github.com/kubevirt/containerized-data-importer/releases/latest)
export VERSION=$(echo ${TAG##*/})
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-operator.yaml
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-cr.yaml
```

**Sample Output**
```
namespace/cdi created
customresourcedefinition.apiextensions.k8s.io/cdis.cdi.kubevirt.io created
clusterrole.rbac.authorization.k8s.io/cdi-operator-cluster created
clusterrolebinding.rbac.authorization.k8s.io/cdi-operator created
serviceaccount/cdi-operator created
role.rbac.authorization.k8s.io/cdi-operator created
rolebinding.rbac.authorization.k8s.io/cdi-operator created
deployment.apps/cdi-operator created
```

2. Configure Scratch Space StorageClass.

```
kubectl edit cdi cdi
```

Add the following under `spec.config`:

```
spec:
  config:
    featureGates:
    - HonorWaitForFirstConsumer
    scratchSpaceStorageClass: mayastor-1
```

:::important
CDI always requests scratch space with a Filesystem volume mode regardless of the volume mode of the related DataVolume. It also always requests it with a ReadWriteOnce accessMode. Therefore, when using block mode DataVolumes, you must ensure that a storage class capable of provisioning Filesystem mode PVCs with ReadWriteOnce accessMode is configured.
:::

3. Verify CDI Installation.

```
kubectl get all -n cdi
```

**Sample Output**
```  
Warning: kubevirt.io/v1 VirtualMachineInstancePresets is now deprecated and will be removed in v2.
NAME                                         READY       STATUS          RESTARTS        AGE
pod/cdi-apiserver-5bbd7b4df5-28gm8           1/1         Running         1 (2m55s ago)   3m
pod/cdi-deployment-84d584dbdd-g8mfn          1/1         Running         0               3m
pod/cdi-operator-7cfb4db845-fg6vt            1/1         Running         0               3m46s
pod/cdi-uploadproxy-856554cb9c-m7kll         1/1         Running         1 (2m54s ago)   3m

NAME                                         TYPE        CLUSTER-IP      EXTERNAL-IP     PORT(S)    AGE
service/cdi-api                              ClusterIP   10.103.42.202   <none>          443/TCP    3m1s
service/cdi-prometheus-metrics               ClusterIP   10.105.45.246   <none>          8080/TCP   3m1s
service/cdi-uploadproxy                      ClusterIP   10.96.255.119   <none>          443/TCP    3m1s

NAME                                         READY       UP-TO-DATE      AVAILABLE       AGE
deployment.apps/cdi-apiserver                1/1         1               1               3m2s
deployment.apps/cdi-deployment               1/1         1               1               3m2s
deployment.apps/cdi-operator                 1/1         1               1               3m48s
deployment.apps/cdi-uploadproxy              1/1         1               1               3m2s

NAME                                         DESIRED     CURRENT         READY           AGE
replicaset.apps/cdi-apiserver-5bbd7b4df5     1           1               1               3m2s
replicaset.apps/cdi-deployment-84d584dbdd    1           1               1               3m2s
replicaset.apps/cdi-operator-7cfb4db845      1           1               1               3m48s
replicaset.apps/cdi-uploadproxy-856554cb9c   1           1               1               3m2s
```

## Deploying a Virtual Machine with NFS Storage

- **Create DataVolume**

1. Create a file named `dv.yaml`.

**dv.yaml**
```
apiVersion: cdi.kubevirt.io/v1beta1
kind: DataVolume
metadata:
  name: "fedora-1"
spec:
  storage:
    accessModes:
      - ReadWriteMany
    resources:
      requests:
        storage: 8Gi
    storageClassName: nfs-csi 
    volumeMode: Filesystem
  source:
    http:
      url: "https://download.fedoraproject.org/pub/fedora/linux/releases/40/Cloud/x86_64/images/Fedora-Cloud-Base-AmazonEC2.x86_64-40-1.14.raw.xz"
```

2. Apply the Configuration.

```
kubectl create -f dv.yaml
```

:::note
You will see two Scratch PVC being created as NFS Provisioner also creates a scratch PVC before provisioning the orignal KubeVirt Scratch PVC.
:::

- **Create a Virtual Machine**

1. Create a file named vm1_pvc.yaml to use the PVC prepared by DataVolume as a root disk.

**vm1_pvc.yaml**
```
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  creationTimestamp: 2018-07-04T15:03:08Z
  generation: 1
  labels:
    kubevirt.io/os: linux
  name: vm1
spec:
  runStrategy: Always
  template:
    metadata:
      creationTimestamp: null
      labels:
        kubevirt.io/domain: vm1
    spec:
      terminationGracePeriodSeconds: 30
      evictionStrategy: LiveMigrate
      networks:
      - name: default
        pod: {}
      domain:
        cpu:
          cores: 2
        devices:
          interfaces:
          - name: default
            masquerade: {}
          disks:
          - disk:
              bus: virtio
            name: disk0
          - cdrom:
              bus: sata
              readonly: true
            name: cloudinitdisk
        machine:
          type: q35
        resources:
          requests:
            memory: 1024M
      volumes:
      - name: disk0
        persistentVolumeClaim:
          claimName: fedora-1
      - cloudInitNoCloud:
          userData: |
            #cloud-config
            hostname: vm1
            ssh_pwauth: True
            disable_root: false
            chpasswd:
              list: |
                root:test
              expire: false
        name: cloudinitdisk
```

2. Apply the configuration.

```
kubectl create -f vm1_pvc.yaml
```

3. Connect to the VM Console.

```
virtctl console vm1
```

- Login credentials:
    Username: `root`
    Password: `MySecurePassword123`

4. Install Guest Agent.

```
virtctl console vm1   
yum install -y qemu-guest-agent
systemctl enable --now qemu-guest-agent
```

**Check Agent Status**
```
kubectl get vm vm1 -o yaml
```

## Enable Live Migration

```
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubevirt-config
  namespace: kubevirt
  labels:
    kubevirt.io: ""
data:
  feature-gates: "LiveMigration"
EOF
```

## Validate Live Migration

1. Insert Sample Data into VM.

**Use the VM console to create test files.**
```
kubevirt virtctl console vm1
Successfully connected to vm1 console. The escape sequence is ^]

vm1 login: root
Password:
Last login: Wed May  7 09:07:08 on ttyS0
[root@vm1 ~]# 
[root@vm1 ~]# 
[root@vm1 ~]# 
[root@vm1 ~]# touch sampledata.txt
[root@vm1 ~]# echo "This is some test Data" > sampledata.txt
[root@vm1 ~]# 
[root@vm1 ~]# cat sampledata.txt
This is some test Data
[root@vm1 ~]#
```

2. Verify VM Node Location.

```
kubectl get pods -o wide
```

3. Trigger Live Migration.

```
virtctl migrate vm1 -n default
```

4. Monitor Migration Progress.

```
kubectl get vmi vm1 -o yaml | grep -A2 migrationState
```

**Sample Output**
```
migrationState:
  completed: true
  endTimestamp: "2025-05-07T10:42:00Z"
➜  kubevirt 
```

5. Verify Post-Migration State.

Ensure the VM is running on a new node and that all previously created data remains intact.

## See Also

- [Replicated PV Mayastor Installation on OpenShift](../openebs-on-kubernetes-platforms/openshift.md)
- [Replicated PV Mayastor Installation on Talos](../openebs-on-kubernetes-platforms/talos.md)
- [Kasten Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/kasten-br-fs.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)