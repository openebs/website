---
title: How do I configure OpenEBS to use storage on specific Kubernetes nodes?
author: Amit Kumar Das
author_info: Engineer the DAO
date: 18-03-2018
tags: Howdoi, OpenEBS, Solutions, Kubernetes, Tutorials
excerpt: A OpenEBS Volume comprises of a Target pod and Replica pod(s). There can be one or more Replica pods. The Replica pods are the ones that access the underlying disk resources for storing the data.
not_has_feature_image: true
---

This article belongs to **#HowDoI** series on [**Kubernetes**](https://kubernetes.io/) and [**OpenEBS**](https://openebs.io/).

**Note: The approach mentioned in this article applies for OpenEBS version 6.0 or below. One can refer to this [link](https://github.com/openebs/community/pull/20) for OpenEBS version 0.8.0 and above.**

A OpenEBS Volume comprises of a Target pod and Replica pod(s). There can be one or more Replica pods. The Replica pods are the ones that access the underlying disk resources for storing the data.

**Use Case #1: In my Kubernetes Cluster, I have certain nodes that have disks attached. I call these as Storage Nodes. I want the OpenEBS Volume Replica Pods to be scheduled on these Storage Nodes.**

**_Solution:_** Use Kubernetes “taints & tolerations” feature.

As per Kubernetes docs, taints allow a node to repel a set of pods. Taints and tolerations work together to ensure that pods are not scheduled onto inappropriate nodes.

- You can apply `NoSchedule` & `NoExecute` taints to the node(s).
- `NoSchedule` marks that the node should not schedule any pods that do not tolerate the taint.
- `NoExecute` marks that the node should evict existing/running pods that do not tolerate this taint.
- Tolerations are applied to pods, and allow the pods to get scheduled onto nodes with matching taints.
- You need to set an ENV variable in maya API server Deployment specifications, which in turn ensures setting of above tolerations on the replica pods.
- The ENV variable referred to here is `DEFAULT_REPLICA_NODE_TAINT_TOLERATION`

Following are the instructions to do the same:

````
# Step 1  —  Taint the node(s)
```bash
# kubeminion-01 is the name of a Kubernetes node
# The taint effects used here are `NoSchedule` and `NoExecute`
kubectl taint nodes kubeminion-01 storage=ssd:NoSchedule storage=ssd:NoExecute
```

# Step 2  —  Maya API server should be deployed with below specs
# This ensures the replica pods are set with appropriate tolerations
```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: maya-apiserver
spec:
  replicas: 1
  template:
  metadata:
    labels:
    name: maya-apiserver
  spec:
    serviceAccountName: openebs-maya-operator
    containers:
    —  name: maya-apiserver
      imagePullPolicy: Always
      image: openebs/m-apiserver:0.5.3
      ports:
      —  containerPort: 5656
      env:
      —  name: DEFAULT_REPLICA_NODE_TAINT_TOLERATION
        value: storage=ssd:NoSchedule,storage=ssd:NoExecute
```
````

**Use Case #2:** In my Kubernetes Cluster, I have certain nodes that have disks attached. I call these as Storage Nodes. I want the OpenEBS Volume Replica Pods to be scheduled on these Storage Nodes. In addition, I want a better utilization of these nodes by being able to schedule my application Pods on these nodes as well.

**Solution:** Use Kubernetes taints & tolerations feature. You may also want to try with `nodeAffinity` to achieve this. However, this solution focuses on use of tolerations.

- You need to make use of `PreferNoSchedule` as the taint effect.
- This can be thought of as a _soft version_ of `NoSchedule`.
- In other words the system tries to avoid placing a pod that does not tolerate the taint on the node, but it is not mandatory.

Following are the instructions to do the same:

````
# Step 1  —  Taint the node(s)
```bash
# kubeminion-01 is the name of a Kubernetes node
# The taint effect used here is `PreferNoSchedule` i.e. a soft version of `NoSchedule` 
# the system tries to avoid placing a pod that does not tolerate the taint on the node,
# but it is not mandatory.
kubectl taint nodes kubeminion-01 storage=ssd:PreferNoSchedule
```

# Step 2  —  Maya API server should be deployed with below specs
# This ensures the replica pods are set with appropriate tolerations
```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: maya-apiserver
  namespace: default
spec:
  replicas: 1
  template:
  metadata:
    labels:
    name: maya-apiserver
  spec:
    serviceAccountName: openebs-maya-operator
    containers:
    —  name: maya-apiserver
      imagePullPolicy: Always
      image: openebs/m-apiserver:0.5.3
      ports:
      —  containerPort: 5656
      env:
      — name: DEFAULT_REPLICA_NODE_TAINT_TOLERATION
        value: storage=ssd:PreferNoSchedule
  ```
````

If you want to learn more on taints & tolerations, then go through [https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/](https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/)

I shall strive to put more such articles in future. Do let me know if you want any specific topics that I should explain.

_Thanks to Kiran Mova._
