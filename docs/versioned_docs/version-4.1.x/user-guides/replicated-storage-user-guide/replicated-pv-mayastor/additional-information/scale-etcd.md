---
id: scale-etcd
title: Scaling Up etcd Members
keywords:
 - Scaling Up etcd Members
 - Scale etcd
description: This section explains about the Scaling Up etcd Members.
---

By default, Replicated PV Mayastor allows the creation of three etcd members. If you wish to increase the number of etcd replicas, you will encounter an error. However, you can make the necessary configuration changes discussed in this guide to make it work.

## Overview of StatefulSets

StatefulSets are Kubernetes resources designed for managing stateful applications. They provide stable network identities and persistent storage for pods. StatefulSets ensure ordered deployment and scaling, support persistent volume claims, and manage the state of applications. They are commonly used for databases, messaging systems, and distributed file systems. Here is how StatefulSets function:
* For a StatefulSet with N replicas, when pods are deployed, they are created sequentially in order from {0..N-1}.
* When pods are deleted, they are terminated in reverse order from {N-1..0}.
* Before a scaling operation is applied to a pod, all of its predecessors must be running and ready.
* Before a pod is terminated, all of its successors must be completely shut down.
* Replicated PV Mayastor uses etcd database for persisting configuration and state information. Etcd is setup as a Kubernetes StatefulSet when Replicated PV Mayastor is installed.

**Command**

``` 
kubectl get dsp -n openebs
```

**Output**

``` 
NAME     NODE       STATE    POOL_STATUS   CAPACITY       USED          AVAILABLE
pool-0   worker-0   Online   Online        374710730752   22561161216   352149569536
pool-1   worker-1   Online   Online        374710730752   21487419392   353223311360
pool-2   worker-2   Online   Online        374710730752   21793603584   352917127168
```

:::note
Take a snapshot of the etcd. Click [here](https://etcd.io/docs/v3.5/op-guide/recovery/) for the detailed documentation.
:::

* From etcd-0/1/2, we can see that all the values are registered in the database. Once we scale up etcd with "n" replicas, all the key-value pairs should be available across all the pods.

To scale up the etcd members, the following steps can be performed:

1. Add a new etcd member
2. Add a peer URL
3. Create a PV (Persistent Volume)
4. Validate key-value pairs


## Step 1: Adding a New etcd Member (Scaling Up etcd Replica)

To increase the number of replicas to 4, use the following `kubectl scale` command:

**Command**

``` 
kubectl scale sts mayastor-etcd -n openebs --replicas=4
```

**Output**

``` 
statefulset.apps/mayastor-etcd scaled
```

> The new pod will be created on available nodes but will be in a **pending state** as there is no PV/PVC created to bind the volumes.

**Command**

``` 
kubectl get pods -n openebs -l app=etcd
```

**Output**

``` 
NAME              READY   STATUS    RESTARTS   AGE
mayastor-etcd-0   1/1     Running   0          28d
mayastor-etcd-1   1/1     Running   0          28d
mayastor-etcd-2   1/1     Running   0          28d
mayastor-etcd-3   0/1     Pending   0          2m34s
```

## Step 2: Add a New Peer URL

Before creating a PV, we need to add the new peer URL [mayastor-etcd-3=](http://mayastor-etcd-3.mayastor-etcd-headless.mayastor.svc.cluster.local:2380) and change the cluster's initial state from "new" to "existing" so that the new member will be added to the existing cluster when the pod comes up after creating the PV. Since the new pod is still in a pending state, the changes will not be applied to the other pods as they will be restarted in reverse order from {N-1..0}. It is expected that all of its predecessors must be running and ready.

**Command**

```text 
kubectl edit sts mayastor-etcd -n openebs 
```

**Output**

```text 
        - name: ETCD_INITIAL_CLUSTER_STATE
          value: existing
        - name: ETCD_INITIAL_CLUSTER
          value: mayastor-etcd-0=http://mayastor-etcd-0.mayastor-etcd-headless.mayastor.svc.cluster.local:2380,mayastor-etcd-1=http://mayastor-etcd-1.mayastor-etcd-headless.mayastor.svc.cluster.local:2380,mayastor-etcd-2=http://mayastor-etcd-2.mayastor-etcd-headless.mayastor.svc.cluster.local:2380,mayastor-etcd-3=http://mayastor-etcd-3.mayastor-etcd-headless.mayastor.svc.cluster.local:2380
```

## Step 3: Create a Persistent Volume

Create a PV with the following YAML. Change the pod name/claim name based on the pod's unique identity.

:::note
This is only for the volumes created with "manual" storage class. 
:::

**YAML**

``` 
apiVersion: v1
kind: PersistentVolume
metadata:
  annotations:
    meta.helm.sh/release-name: openebs
    meta.helm.sh/release-namespace: openebs
    pv.kubernetes.io/bound-by-controller: "yes"
  finalizers:
  - kubernetes.io/pv-protection
  labels:
    app.kubernetes.io/managed-by: Helm
    statefulset.kubernetes.io/pod-name: mayastor-etcd-3
  name: etcd-volume-3
spec:
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 2Gi
  claimRef:
    apiVersion: v1
    kind: PersistentVolumeClaim
    name: data-mayastor-etcd-3
    namespace: openebs
  hostPath:
    path: /var/local/mayastor/etcd/pod-3
    type: ""
  persistentVolumeReclaimPolicy: Delete
  storageClassName: manual
  volumeMode: Filesystem
```

**Output**

``` 
kubectl apply -f pv-etcd.yaml -n openebs
persistentvolume/etcd-volume-3 created
```

## Step 4: Validate Key-Value Pairs

Run the following command from the new etcd pod and ensure that the values are the same as those in etcd-0/1/2. Otherwise, it indicates a data loss issue.

**Command**

``` 
kubectl exec -it mayastor-etcd-3 -n openebs -- bash
#ETCDCTL_API=3
#etcdctl get --prefix ""
```
