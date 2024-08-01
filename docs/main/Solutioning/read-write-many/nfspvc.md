---
id: nfspvc
title: Provisioning NFS PVCs
keywords: 
  - Read-Write-Many
  - RWX
  - NFS server
  - Provisioning NFS PVCs
description: In this document, you learn about Provisioning NFS PVCs.
---

# Provisioning NFS PVCs

Provisioning Network File System (NFS) Persistent Volume Claims (PVCs) involves setting up storage that can be simultaneously accessed in read-write mode by multiple nodes or pods within a Kubernetes cluster.

Block storage, such as Persistent Volumes (PVs) in Kubernetes, is generally not designed to be mounted to multiple pods simultaneously. Block storage devices are designed for exclusive access. When multiple pods attempt to read from and write to the same block storage simultaneously, it can cause conflicts.

OpenEBS Replicated PV Mayastor supports ReadWriteMany (RWX) volumes by exposing regular Replicated PV Mayastor volumes via NFSv4 servers as a pod.

## Concept

Replicated PV Mayastor uses the NFS server as a deployment with the NFS CSI driver. This provides PVCs in RWX mode so that multiple applications can access the data in a shared fashion. Replicated PV Mayastor volumes are used as persistent backend storage for these NFS servers to provide a scalable and manageable RWX shared storage solution.

## Requirements

### NFS Server as a Pod

NFS volumes can be mounted as a `PersistentVolume` in Kubernetes pods. It is also possible to pre-populate a NFS volume and pods may share a NFS volume. It is beneficial when certain files must be writable between multiple pods.

### NFS CSI Driver

An NFS CSI driver is a specific type of Container Storage Interface (CSI) driver that enables container orchestration systems, like Kubernetes, to manage storage using the NFS. NFS (A distributed file system protocol) allows multiple machines to share directories over a network. The NFS CSI driver facilitates the use of NFS storage by providing the necessary interface for creating, mounting, and managing NFS volumes within a containerized environment, ensuring that applications running in containers can easily access and use NFS-based storage.

CSI plugin name: `nfs.csi.k8s.io`. This driver requires an existing and already configured NFSv3 or NFSv4 server. It supports dynamic provisioning of Persistent Volumes via PVCs by creating a new sub-directory under the NFS server. This can be deployed using Helm. Refer [NFS CSI driver for Kubernetes](https://github.com/kubernetes-csi/csi-driver-nfs?tab=readme-ov-file#install-driver-on-a-kubernetes-cluster) to install NFS CSI driver on a Kubernetes cluster.

### Replicated PV Mayastor

Replicated PV Mayastor is a performance-optimised Container Native Storage (CNS) solution. The goal of OpenEBS is to extend Kubernetes with a declarative data plane, providing flexible persistent storage for stateful applications.

Make sure you have installed Replicated PV Mayastor before proceeding to the next step. Refer to the [OpenEBS Installation documentation](../../../../quickstart-guide/installation.md#installation-via-helm) to install Replicated PV Mayastor using Helm.

## Details of Setup

### Setting up a Single NFS Server

1. Create a Replicated PV Mayastor Pool.

  Create a Replicated PV Mayastor pool that satisfies the performance and availability requirements. Refer to the [Replicated PV Mayastor Configuration documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#create-diskpools) for more details.

  **Example of a Replicated PV Mayastor Pool**

  **Command**

  ```
  $ kubectl get dsp -n mayastor
  ```

  **Output**

  ``` 
  NAME     NODE                                       STATE     POOL_STATUS   CAPACITY      USED   AVAILABLE
  pool-1   gke-gke-ssd-1-default-pool-d802bc13-3j4s   Created   Online        10724835328   0      10724835328
  pool-2   gke-gke-ssd-1-default-pool-d802bc13-z9hf   Created   Online        10724835328   0      10724835328
  pool-3   gke-gke-ssd-1-default-pool-d802bc13-67bv   Created   Online        10724835328   0      10724835328
  ```

2. Create a Replicated PV Mayastor Storage Class.

  Create a storage class to point to the above created pool. Also, select the number of replicas and the default size of the volume. Refer to the [Replicated PV Mayastor Configuration documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration.md#create-replicated-pv-mayastor-storageclasss) for more details.

  **Example of a Replicated PV Mayastor Storage Class**

  **Command**

  ```
  $ kubectl get sc
  ```

  **Output**

  ```
  mayastor-2                io.openebs.csi-mayastor   Delete          Immediate              false                  24h
  mayastor-3                io.openebs.csi-mayastor   Delete          Immediate              false                  27h
  mayastor-etcd-localpv     openebs.io/local          Delete          WaitForFirstConsumer   false                  27h
  mayastor-loki-localpv     openebs.io/local          Delete          WaitForFirstConsumer   false                  27h
  mayastor-single-replica   io.openebs.csi-mayastor   Delete          Immediate              true                   27h
  ```

3. Create a namespace for deploying the NFS server.

  **Command**
  
  ```
  $ kubectl create ns nfs-server
  ```

  **Output**
  
  ```
  namespace/nfs-server created
  ```

4. Create a PVC with the desired storage for the NFS server using the Replicated PV Mayastor storage class.

  **Command**

  ```
  $ cat <<EOF | kubectl create -f -
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: nfs-server-claim
    namespace: nfs-server
  spec:
    accessModes:
    - ReadWriteOnce
    resources:
      requests:
        storage: 5Gi
    storageClassName: mayastor-3
  EOF
  ```

  **Output**

  ```
  persistentvolumeclaim/nfs-server-claim created
  ```

   - Use the following command to verify the PVC creation:

  **Command**
  
  ```
  $ kubectl get pvc -n nfs-server
  ```

  **Output**

  ```
  NAME               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
  nfs-server-claim   Bound    pvc-3763a93c-dfcd-4be3-8255-038b44bd5432   5Gi        RWO            mayastor-3     <unset>                 8s
  ```

5. Deploy the NFS server.

   - Deployment manifest

  Deploy the NFS server using the following yaml file. Use a Kubernetes deployment to create the NFS server, containing a single pod running. Deploy the server with this deployment manifest.

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

   - Deploy the NFS server using the above deployment manifest by using the following command:

  **Command**

  ```
  $ kubectl apply -f nfs-deploy.yaml 
  ```

  **Output**

  ```
  deployment.apps/nfs-server created
  ```

   - Use the following command to verify the NFS server deployment:

  **Command**
  
  ```
  $ kubectl get pods -n nfs-server
  ```

  **Output**
  
  ```
  NAME                          READY   STATUS    RESTARTS   AGE
  nfs-server-779b64df65-5pqmk   1/1     Running   0          49s
  ```

   - Create a service object that provides a ClusterIP to access the NFS server by using the following command:

  **NFS Server Example: `nfs-server.nfs-server.svc.cluster.local`**

  **YAML**

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

  **Command**

  ```
  $ kubectl apply -f nfs-svc.yaml
  ```

  **Output**
  
  ```
  service/nfs-server created
  ```
   - Use the following command to verify the service object:

  **Command**

  ```
  $ kubectl get svc -n nfs-server
  ```

  **Output**
  
  ```
  NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
  nfs-server   ClusterIP   34.118.238.249   <none>        2049/TCP   8s
  ```

### Setting up a NFS CSI Driver

1. Create a storage class.

   - Edit the values.yaml to use the NFS server.

  **StorageClass Resource Example**

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
  ```

   - Create a new namespace for the NFS CSI Driver.

  **Command**

  ```
  $ kubectl create ns csi-nfs
  ```

  **Output**

  ```
  namespace/csi-nfs created
  ```

   - Install NFS CSI Driver using helm.

  **Command**

  ```
  $ helm install -n csi-nfs  csi-nfs
  ```
  
  **Output**

  ```
  NAME: csi-nfs
  LAST DEPLOYED: Wed Jun 19 15:39:25 2024
  NAMESPACE: csi-nfs
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
  NOTES:
  The CSI NFS Driver is getting deployed to your cluster.
  ```

   - Verify the CSI NFS Driver pods status.
  
  ```
  kubectl --namespace=csi-nfs get pods --selector="app.kubernetes.io/instance=csi-nfs" --watch
  ```

   - Verify the pod status.

  **Command**

  ```
  $ kubectl get pods -n csi-nfs 
  ```

  **Output**

  ```
  NAME                                 READY   STATUS    RESTARTS   AGE
  csi-nfs-controller-7fff64574-cnwdp   4/4     Running   0          53s
  csi-nfs-node-j27w7                   3/3     Running   0          53s
  csi-nfs-node-slp95                   3/3     Running   0          53s
  csi-nfs-node-srsbm                   3/3     Running   0          53s
  ```

   - Verify the storage class.

  **Command**
  
  ```
  $ kubectl get sc | grep nfs-csi
  ```

  **Output**

  ```
  nfs-csi                   nfs.csi.k8s.io            Delete          Immediate              false                  2m29s
  ```

  **Command**
  
  ```
  $ kubectl describe sc nfs-csi
  ```

  **Output**

  ```
  Name:                  nfs-csi
  IsDefaultClass:        No
  Annotations:           meta.helm.sh/release-name=csi-nfs,meta.helm.sh/release-namespace=csi-nfs
  Provisioner:           nfs.csi.k8s.io
  Parameters:            mountPermissions=0,server=nfs-server.nfs-server.svc.cluster.local,share=/
  AllowVolumeExpansion:  <unset>
  MountOptions:
    nfsvers=4.1
  ReclaimPolicy:      Delete
  VolumeBindingMode:  Immediate
  Events:             <none>
  ```

### NFS PVC Creation

1. Create PVC with NFS CSI Driver Storage Class `nfs-csi` (that was created in the last step).

**YAML**

```
$ cat nfs-pvc.yaml 
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: nfs-claim-1
spec:
  storageClassName: nfs-csi
  accessModes: [ "ReadWriteMany" ]
  resources:
    requests:
       # This is the storage capacity that will be available to the application pods.
      storage: 5Gi
```

**Command**

```
$ kubectl apply -f nfs-pvc.yaml 
```

**Output**

```
persistentvolumeclaim/nfs-claim-1 created
```

- Use the following command to verify the PVC:

**Command**

```
$ kubectl get pvc 
```

**Output**

```
NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
nfs-claim-1   Bound    pvc-f795f8bc-58b3-40d7-b9b2-2d16c17f3d47   5Gi        RWX            nfs-csi        <unset>                 10s
```

2. Deploy the application.

**YAML**

```
$ cat nginx.yaml 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
        volumeMounts:
          - mountPath: "/volume"
            name: data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: nfs-claim-1
```

**Command**

```
$ kubectl get pods -o wide
```

**Output**

```
NAME                               READY   STATUS    RESTARTS   AGE   IP           NODE                                       NOMINATED NODE   READINESS GATES
nginx-deployment-6c664cc4c-5kjc8   1/1     Running   0          22s   10.32.1.32   gke-gke-ssd-1-default-pool-d802bc13-67bv   <none>           <none>
nginx-deployment-6c664cc4c-xzlwq   1/1     Running   0          22s   10.32.2.17   gke-gke-ssd-1-default-pool-d802bc13-z9hf   <none>           <none>
nginx-deployment-6c664cc4c-z64h4   1/1     Running   0          22s   10.32.0.14   gke-gke-ssd-1-default-pool-d802bc13-3j4s   <none>           <none>
```

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](../openebs-on-kubernetes-platforms/microkubernetes.md)
- [Replicated PV Mayastor Installation on Talos](../openebs-on-kubernetes-platforms/talos.md)
- [Replicated PV Mayastor Installation on Google Kubernetes Engine](../openebs-on-kubernetes-platforms/gke.md)