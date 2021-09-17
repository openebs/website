---
title: Provisioning OpenEBS Jiva volumes via CSI
author: Prateek Pandey
author_info: Contributor and Maintainer @OpenEBS. Software Developer at @mayadata_inc. Open Source Enthusiast
date: 09-06-2021
tags: CSI, OpenEBS, Jiva
excerpt: Container Storage Interface (CSI), is the new model for integrating storage system drivers with container orchestration systems like Kubernetes. This new interface is a major benefit to the container ecosystem as it standardizes the model of integrating storage systems with container orchestration systems.
not_has_feature_image: false
---

[Container Storage Interface (CSI)](https://github.com/container-storage-interface/spec), is the new model for integrating storage system drivers with container orchestration systems like [Kubernetes](https://kubernetes.io/). This new interface is a major benefit to the container ecosystem as it standardizes the model of integrating storage systems with container orchestration systems. Specifically for Kubernetes, it frees the storage system driver from being tied to the Kubernetes release schedule due to it being incorporated in the same code base. With CSI, storage system drivers can now be installed asynchronously to container orchestration releases, providing faster bug fixes and features.

The Openebs Jiva CSI driver provides a CSI interface that allows it to manage the lifecycle of OpenEBS Jiva volumes for persistent volumes. OpenEBS has recently released a beta version of the [Jiva CSI driver](https://github.com/openebs/jiva-operator) for one of its Container Attached Storage engines - [Jiva](https://github.com/openebs/jiva).

As of 2.7.0, the supported features are volume provisioning, de-provisioning, volume resize, raw block volume, and volume usage metrics. There are other key differences between the external-provisioner and CSI implementations, are benefits to users, like

- Auto remount
- Protecting against nodes mounting an empty directory accidentally and re-writing. 
- Fix for multi-attach errors on onprem k8s clusters
- Standardised with CSI and further enhancements coming in K8s

This blog will demonstrate how to configure and consume Jiva volumes using the CSI Driver. 

## Prerequisites

1. Kubernetes version 1.18 or higher
2. iSCSI initiator utils installed on all the worker nodes
3. You have access to install RBAC components into the openebs namespace.
4. For resize feature, verify ExpandCSIVolumes and ExpandInUsePersistentVolumes feature gates are enabled on the kubelet of all worker nodes and kube-apiserver.

## Installation

### Using Jiva operator: 

1. Install openebs local PV provisioner to create hostpath based volumes.

    kubectl apply -f https://openebs.github.io/charts/openebs-operator-lite.yaml

2. Install the latest Jiva-operator release.

    $ kubectl apply -f   https://openebs.github.io/charts/jiva-operator.yaml

3. Using Jiva Helm chart:

    $ helm repo add openebs-jiva https://openebs.github.io/jiva-operator
    $ helm repo update  
    $ helm install <release-name> openebs-jiva/jiva

More info related to Jiva charts, its configurable parameters, and their default values can be found [here](https://github.com/openebs/jiva-operator/tree/master/deploy/helm/charts).

## Configure Jiva CSI Driver

### OpenEBS Jiva CSI driver comprises of 2 components:

1. A controller component launched as a StatefulSet, implementing the CSI controller services. The Control Plane services are responsible for creating/deleting the required OpenEBS Volume.
2. A node component that runs as a DaemonSet, implementing the CSI node services. The node component is responsible for performing the iSCSI connection management and connecting to the OpenEBS Volume.

The node components make use of the host iSCSI binaries for iSCSI connection management. Depending on the OS, the spec will have to be modified to load the required iSCSI files into the node pods.

Verify that the OpenEBS CSI Components are installed, one node service pod comes up for each node:

    $ kubectl get pods -n openebs -l role=openebs-jiva-csi

    NAME                   	         READY   STATUS	RESTARTS   AGE
    openebs-csi-controller-0   6/6 	   Running     0      	           6m14s
    openebs-csi-node-56t5g   2/2 	   Running     0      	           6m13s

## Before you provision a volume:

**1. (Optional) Create JivaVolumePolicy (jvp)**

Create Jiva volume policy to configure various tunables required in case of day 2 operations, for example, replicationFactor (defaults to 3), resource limits, tolerations, node-selector, etc.

Although It's not mandatory to create JivaVolumePolicy until the user wants to tune some specific default volume policies. If not provided, jiva operator uses the default policies.

    apiVersion: openebs.io/v1alpha1
    kind: JivaVolumePolicy
    metadata:
    name: example-volume-policy
    namespace: openebs
    spec:
    replicaSC: openebs-hostpath
    enableBufio: false
    autoScaling: false
    target:
        replicationFactor: 1

    $ kubectl get jvp -n openebs
    NAME                              AGE
    example-volume-policy   1m

**2. Create Storage Class**

Create Storage to dynamically provision volumes using Jiva CSI driver with volume policy created above.

Read more about various [jiva volume policies](https://github.com/openebs/jiva-operator/blob/master/docs/tutorials/policies.md).

    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
    name: openebs-jiva-csi-sc
    provisioner: jiva.csi.openebs.io
    allowVolumeExpansion: true
    parameters:
    cas-type: “jiva” 
    policy: "jiva-policy"   // optional

## Volume Provisioning with FIO App Deployment

Run your application by specifying the above Storage Class for the PVCs. For example, we will use the FIO application for demonstration purpose:

**1. Create PVC:**

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
    name: jiva-csi-demo
    spec:
    storageClassName: openebs-jiva-csi-sc
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
        storage: 5Gi

**2. Deploy FIO Application**

When using Pods with PersistentVolumes, we recommend that you use a workload controller (such as a Deployment or StatefulSet). While you would not typically use a standalone Pod, the following example uses one example deployment for simplicity.

The following example consumes the volume that you created in the previous section:

    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: fio
    spec:
    selector:
        matchLabels:
        name: fio
    replicas: 1
    strategy:
        type: Recreate
        rollingUpdate: null
    template:
        metadata:
        labels:
            name: fio
        spec:
        containers:
        - name: perfrunner
            image: openebs/tests-fio
            command: ["/bin/bash"]
            args: ["-c", "while true ;do sleep 50; done"]
            volumeMounts:
            - mountPath: /datadir
            name: fio-vol
        volumes:
        - name: fio-vol
            persistentVolumeClaim:
            claimName: jiva-csi-demo

While the asynchronous handling of the Volume provisioning is in progress, the application pod may throw some errors propagated from CAS pods to the application pods:

* Waiting for JivaVolume to be Ready: Implies volume components are still being created

* Volume is not ready: Replicas yet to connect to controller: Implies volume components are already created but yet to interact with each other.

Verify that the FIO application pod is in running state:

    $ kubectl get pods

    NAME      READY   STATUS    RESTARTS   AGE
    Fio           1/1           Running     0                   97s

## Volume Expansion

**Notes:**

* Only dynamically provisioned volumes can be resized.
* Volumes containing a filesystem of `XFS`, `Ext3`, `Ext4` type, or even raw block volume can be resized.

**Steps:**

1. Update the increased PVC size in the pvc spec section

    kind: PersistentVolumeClaim
    metadata:
    name: jiva-csi-demo
    spec:
    resources:
        requests:
        storage: 10Gi
        volumeName: pvc-136b015f-dac3-11e9-8980-42010a80006c
    status:
    accessModes:
    - ReadWriteOnce
    capacity:
        storage: 5Gi
    phase: Bound

2. Wait for the updated capacity to reflect in PVC status

    kind: PersistentVolumeClaim
    metadata:
    name: jiva-csi-demo
    spec:
    resources:
        requests:
        storage: 10Gi
        volumeName: pvc-136b015f-dac3-11e9-8980-42010a80006c
    status:
    accessModes:
    - ReadWriteOnce
    capacity:
        storage: 10Gi
    phase: Bound

3. Verify the updated size of the mounted volume inside the application pod

```
# df -h /storage
Filesystem            	Size  Used   Available  Use%  Mounted on
/dev/sdb             	9.7G 	11.3M  9.7G       0%    /storage
```

## Volume Scaleup

**Notes:**

* Only 1 replica at a time can be scaled up.
* Scale down is not supported.

**Steps:**

1. Increase the desiredReplicationFactor in the jivaVolume spec section by 1. This will spawn another replica for the sts and the data will be rebuilt on the new replica.

```
apiVersion: openebs.io/v1alpha1
kind: JivaVolume
metadata:
annotations:
    openebs.io/volume-policy: example-jivavolumepolicy
creationTimestamp: "2021-03-22T12:24:23Z"
generation: 23
labels:
    nodeID: k8s-worker-1
    openebs.io/component: jiva-volume
    openebs.io/persistent-volume: pvc-26dc4d24-1e2e-4727-9804-bcd7ce40364d
name: pvc-26dc4d24-1e2e-4727-9804-bcd7ce40364d
namespace: openebs
resourceVersion: "170894664"
selfLink: /apis/openebs.io/v1alpha1/namespaces/openebs/jivavolumes/pvc-26dc4d24-1e2e-4727-9804-bcd7ce40364d
uid: ed2ce0b4-acab-48e8-b659-8753be96f345
spec:
accessType: mount
capacity: 4Gi
desiredReplicationFactor: 3
......
```



