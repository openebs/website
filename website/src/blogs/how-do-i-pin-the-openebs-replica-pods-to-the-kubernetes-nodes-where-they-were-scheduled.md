---
title: How do I pin the OpenEBS Replica Pod(s) to the Kubernetes Nodes where they were scheduled?
author: Amit Kumar Das
author_info: Engineer the DAO
date: 26-03-2018
tags: Howdoi, Kubernetes, OpenEBS, Storage, Solutions, Tutorials
excerpt: A OpenEBS Volume comprises of a Controller pod and one or more Replica pod(s). Controller pod (also known as a Target pod) is the one to which the application can make an iSCSI connection.
not_has_feature_image: true
---

This article belongs to #HowDoI series on Kubernetes and OpenEBS.

A OpenEBS Volume comprises of a Controller pod and one or more Replica pod(s). Controller pod (also known as a Target pod) is the one to which the application can make an iSCSI connection. The Replica pods are the ones that access the underlying disk resources for storing the data.

**Use Case #1: In my Kubernetes cluster, [_OpenEBS volume pods are scheduled on appropriate nodes_](https://blog.openebs.io/how-do-i-configure-openebs-to-use-storage-on-specific-kubernetes-nodes-361e3e842a78). This is all fine till the cluster experiences a disruption due to network partition. Kubernetes tries to evict & re-schedule these volume pods into newer nodes that does not have the underlying data. This results in volume getting into offline state. I want the OpenEBS volume pods to stick to the nodes they were originally placed.**

**Solution**: Patch the Replica deployment with **nodeAffinity** property

As per Kubernetes docs, nodeAffinity allows you to constrain which nodes your pod is eligible to be scheduled on. It is based on labels on the node.

There are currently two types of node affinity:

– `requiredDuringSchedulingIgnoredDuringExecution` &

– `preferredDuringSchedulingIgnoredDuringExecution`

These node affinity types can be thought of “_hard_” vs. “_soft_” affinity respectively.

- _Hard_ affinity states that pod will be scheduled only if the conditions are met.
- _Soft_ affinity implies Kubernetes will make a best effort but the affinity may not be guaranteed.

We shall make use of `hard affinity` as this fits perfectly to the needs of Replica deployment.

Steps required to patch the Replica deployment are summarised below:

**Step 1**:- Replica pod(s) gets scheduled by Kubernetes default scheduler (via OpenEBS provisioner — a dynamic Kubernetes storage provisioner)

**Step 2**:- Wait till replica pod(s) get into `Running` state

**Step 3**:- Operator determines the node(s) on which the replica pod(s) are scheduled

**Step 4**:- Replica deployment is patched with nodeAffinity

```bash
# REPLACE <namespace-where-openebs-pods-are-deployed> WITH ACTUAL NAMESPACE
# REPLACE <name-of-persistentvolume> WITH ACTUAL PV NAME
# TAKE A NOTE OF THE NODE NAME(S) TO BE USED IN THE PATCH.YAML

kubectl get po -n <namespace-where-openebs-pods-are-deployed> \
  -o=custom-columns=NAME:metadata.name,NODE:spec.nodeName,STATUS:status.phase \
  | grep -E 'NAME|<name-of-persistentvolume>-rep'
```

```bash
$ cat replica_patch.yaml
```

```yaml
spec:
  template:
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - key: kubernetes.io/hostname
                    operator: In
                    values:
                      - nodename_where_replica_pod_1_got_scheduled
                      - nodename_where_replica_pod_2_got_scheduled
                      - nodename_where_replica_pod_3_got_scheduled
```

```bash
# REPLACE <name-of-persistentvolume> WITH ACTUAL PV NAME

kubectl patch deployment <name-of-persistentvolume>-rep \
  -p "$(cat replica_patch.yaml)"
```

```bash
# VERIFY IF PODs ARE BACK TO `Running` AFTER PATCH
# REPLACE <namespace-where-openebs-pods-are-deployed> WITH ACTUAL NAMESPACE
# REPLACE <name-of-persistentvolume> WITH ACTUAL PV NAME

kubectl get po -n <namespace-where-openebs-pods-are-deployed> \
  | grep -E 'NAME|<name-of-persistentvolume>-rep'
```

Learn more about nodeAffinity from Kubernetes docs at [https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/#affinity-and-anti-affinity).

If you want to understand more on kubectl patch operation, then go through [https://kubernetes.io/docs/tasks/run-application/update-api-object-kubectl-patch/](https://kubernetes.io/docs/tasks/run-application/update-api-object-kubectl-patch/).
