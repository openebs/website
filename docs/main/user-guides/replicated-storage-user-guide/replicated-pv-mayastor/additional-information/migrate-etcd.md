---
id: migrate-etcd
title: Etcd Migration Procedure
keywords:
 - Etcd Migration Procedure
 - Migrate etcd
description: This section explains the Etcd Migration Procedure.
---

By following the given steps, you can successfully migrate etcd from one node to another during maintenance activities like node drain etc., ensuring the continuity and integrity of the etcd data.

:::note
Take a snapshot of the etcd. Refer to [Disaster Recovery documentation](https://etcd.io/docs/v3.5/op-guide/recovery/) for more information.
:::

## Step 1: Draining the etcd Node

- Assuming we have a three-node cluster with three etcd replicas, verify the etcd pods with the following commands:

**Command to Verify Pods**

```
kubectl get pods -n openebs -l app=etcd -o wide
```

**Output**

```
NAME              READY   STATUS    RESTARTS   AGE     IP             NODE       NOMINATED NODE   READINESS GATES
mayastor-etcd-0   1/1     Running   0          4m9s    10.244.1.212   worker-1   <none>           <none>
mayastor-etcd-1   1/1     Running   0          5m16s   10.244.2.219   worker-2   <none>           <none>
mayastor-etcd-2   1/1     Running   0          6m28s   10.244.3.203   worker-0   <none>           <none>
```

- From etcd-0/1/2, we could see all the values are registered in the database. Once we migrated etcd to new node, all the key-value pairs should be available across all the pods. Run the following commands from any etcd pod.

**Commands to get etcd data**

```
kubectl exec -it mayastor-etcd-0 -n openebs -- bash
#ETCDCTL_API=3
#etcdctl get --prefix ""
```

- In this example, we drain the etcd node **worker-0** and migrate it to the next available node (in this case, the worker-4 node), use the following command:

**Command to Drain the Node**

```
kubectl drain worker-0 --ignore-daemonsets --delete-emptydir-data
```

**Output**

```
node/worker-0 cordoned
Warning: ignoring DaemonSet-managed Pods: kube-system/kube-flannel-ds-pbm7r, kube-system/kube-proxy-jgjs4, mayastor/mayastor-agent-ha-node-jkd4c, mayastor/mayastor-csi-node-mb89n, mayastor/mayastor-io-engine-q2n28, mayastor/mayastor-promethues-prometheus-node-exporter-v6mfs, mayastor/mayastor-promtail-6vgvm, monitoring/node-exporter-fz247
evicting pod mayastor/mayastor-etcd-2
evicting pod mayastor/mayastor-agent-core-7c594ff676-2ph69
evicting pod mayastor/mayastor-operator-diskpool-c8ddb588-cgr29
pod/mayastor-operator-diskpool-c8ddb588-cgr29 evicted
pod/mayastor-agent-core-7c594ff676-2ph69 evicted
pod/mayastor-etcd-2 evicted
node/worker-0 drained
```

## Step 2: Migrating etcd to the New Node

- After draining the **worker-0** node, the etcd pod will be scheduled on the next available node, which is the worker-4 node.

- The pod may end up in a **CrashLoopBackOff status** with specific errors in the logs.

- When the pod is scheduled on the new node, it attempts to bootstrap the member again, but since the member is already registered in the cluster, it fails to start the etcd server with the error message **member already bootstrapped**.

- To fix this issue, change the cluster's initial state from **new** to **existing** by editing the StatefulSet for etcd:

**Command to Check new etcd Pod Status**

```
kubectl get pods -n openebs -l app=etcd -o wide
```

**Output**

```
NAME              READY   STATUS             RESTARTS      AGE   IP             NODE       NOMINATED NODE   READINESS GATES
mayastor-etcd-0   1/1     Running            0   35m   10.244.1.212   worker-1   <none>           <none>
mayastor-etcd-1   1/1     Running            0   36m   10.244.2.219   worker-2   <none>           <none>
mayastor-etcd-2   0/1     CrashLoopBackOff   5 (44s ago)   10m   10.244.0.121   worker-4     <none>           <none>

```

**Command to edit the StatefulSet**

```
kubectl edit sts mayastor-etcd -n openebs
```

**Output**

```text
        - name: ETCD_INITIAL_CLUSTER_STATE
          value: existing
```

## Step 3: Validating etcd Key-Value Pairs

Run the appropriate command from the migrated etcd pod to validate the key-value pairs and ensure they are the same as in the existing etcd.

:::caution
This step is crucial to avoid any data loss during the migration process.
:::

**Command**

```
kubectl exec -it mayastor-etcd-0 -n openebs -- bash
#ETCDCTL_API=3
#etcdctl get --prefix ""
```
