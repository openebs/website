---
title: Migrate CSPIs to a different node by moving the disks
author: Sai Chaithanya
author_info: A developer who is always eager to learn, loves algorithms, maths, Kubernetes, and programming, passionate about Data Science. Enjoys playing kabaddi and traveling.
date: 04-11-2020
tags: OpenEBS
excerpt: Step by step guide to migrate CStorPoolInstances from one node to different nodes by moving the set of underlying disks
---

This blog describes steps to migrate CStorPoolInstances from one node to different nodes by **moving the set of underlying disks to a new node that participates in the pool provisioning**. There were a couple of use cases where this feature can be helpful:

1. Scaling down and scaling up nodes in the cluster(in a cloud environment) by retaining external volumes(for cost savings).
2. Replacing failed storage nodes with new nodes by attaching the same old disks to the new node.

**Steps to migrate the CSPI to different node:**

1. Detach the disks belonging to the CSPI that you wish to migrate from the node and attach it to the new node. If you are using a cloud platform, check on their documentation, or ask the administrator about the steps to do this.
2. Change the node selector in the CSPC YAML (next section describes how to do this).

![](https://lh4.googleusercontent.com/XTwKu6lE3lyoZ3cHRO9HNJGUaTOoGfE-OWGuscrmukbxEKJNPSaEqxUPbbNnnc3dcD-Aybc2_AF0y2Scf0QBxSDG_f9QZWRu67sXZjoMKO6nymhgelEWfDzPjfGKi4D9UwLBaN0D)

**Existing setup**:

I have a three-node cluster with CSPC and CSI volumes already provisioned(To create CSPC pools and CSI volume click [here](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md#quickstart)). Here is detailed information:

**Cluster details**:

    Kubernetes Cluster: AWS
    Kubernetes Version: v1.15.9
    OpenEBS Version: 2.2.0

**Node and BlockDevice details**: Attached three disks to three nodes(each node has one disk)

    Kubectl get nodes

    NAME                STATUS   ROLES    AGE   VERSION
    ip-192-168-29-151   Ready    <none>   16m   v1.15.9
    ip-192-168-36-89    Ready    <none>   8h    v1.15.9
    ip-192-168-74-129   Ready    <none>   8h    v1.15.9

    Kubectl get bd -n openebs
    NAME                                           NODENAME          SIZE          CLAIMSTATE   STATUS
    blockdevice-7d311a98255a454a717427b5c2d38426   ip-192-168-36-89  10737418240   Claimed      Active
    blockdevice-c2c846cce1befec7fbdcbae254329b0b   ip-192-168-74-129 10737418240   Claimed      Active
    blockdevice-c608881cd3edbeab674a1aee7e0a1fc3   ip-192-168-29-151 10737418240   Claimed      Active

**CSPC Manifest**: Applied following CSPC manifest to provision cStor pools

    apiVersion: cstor.openebs.io/v1
    kind: CStorPoolCluster
    metadata:
      name: cstor-disk-cspc
      namespace: openebs
    spec:
      pools:
        - nodeSelector:
            kubernetes.io/hostname: "ip-192-168-74-129"
          dataRaidGroups:
          - blockDevices:
              - blockDeviceName: "blockdevice-c2c846cce1befec7fbdcbae254329b0b"
          poolConfig:
            dataRaidGroupType: "stripe"
        - nodeSelector:
            kubernetes.io/hostname: "ip-192-168-36-89"
          dataRaidGroups:
          - blockDevices:
              - blockDeviceName: "blockdevice-7d311a98255a454a717427b5c2d38426"
          poolConfig:
            dataRaidGroupType: "stripe"
        - nodeSelector:
            kubernetes.io/hostname: "ip-192-168-29-151"
          dataRaidGroups:
          - blockDevices:
              - blockDeviceName: "blockdevice-c608881cd3edbeab674a1aee7e0a1fc3"
          poolConfig:
            dataRaidGroupType: "stripe"

After applying the above CSPC manifest, the following three CStorPoolInstances(CSPI) were created.

    kubectl get cspi -n openebs

    NAME                  HOSTNAME          FREE     CAPACITY    READONLY  STATUS   AGE
    cstor-disk-cspc-dvc2  ip-192-168-74-129 24100M   24111M      false     ONLINE   8h
    cstor-disk-cspc-f56z  ip-192-168-36-89  24100M   24113200k   false     ONLINE   8h
    cstor-disk-cspc-q9yt  ip-192-168-29-151   24100M   24113200k   false     ONLINE   8h

Now everything looks good. After some time, the cluster has been scaled down **0** nodes and scaled back to **3** nodes. So after scaling operations following are new nodes in the cluster.

    Kubectl get nodes

    NAME               STATUS   ROLES    AGE     VERSION
    ip-192-168-14-90   Ready    <none>   118s    v1.15.9
    ip-192-168-49-43   Ready    <none>   5m55s   v1.15.9
    ip-192-168-94-113  Ready    <none>   4m6s    v1.15.9

Attached old disks that participated in pool creation to new nodes, and the following is blockdevice output.

    Kubectl get bd -n openebs

    NAME                                           NODENAME            SIZE          CLAIMSTATE   STATUS
    blockdevice-7d311a98255a454a717427b5c2d38426   ip-192-168-49-43    10737418240   Claimed      Active
    blockdevice-c2c846cce1befec7fbdcbae254329b0b   ip-192-168-94-113   10737418240   Claimed      Active
    blockdevice-c608881cd3edbeab674a1aee7e0a1fc3   ip-192-168-14-90    10737418240   Claimed      Active

From the above and previous output following are blockdevice mappings with zn old node and new node:

    Blockdevice  Name                                    Old Node            New Node
    blockdevice-7d311a98255a454a717427b5c2d38426    ip-192-168-36-89        ip-192-168-49-43
    blockdevice-c2c846cce1befec7fbdcbae254329b0b    ip-192-168-74-129       ip-192-168-94-113
    blockdevice-c608881cd3edbeab674a1aee7e0a1fc3    ip-192-168-29-151       ip-192-168-14-90

OpenEBS **NodeDiskManager**(NDM) will automatically update the details in blockdevice CRs when the disks migrate to a new node. Based on the above output, update the CSPC manifest with new **nodeSelector** values.

**Updated CSPC Manifest**:

    apiVersion: cstor.openebs.io/v1
    kind: CStorPoolCluster
    metadata:
      name: cstor-disk-cspc
      namespace: openebs
    spec:
      pools:
        - nodeSelector:
            kubernetes.io/hostname: "ip-192-168-94-113"
          dataRaidGroups:
          - blockDevices:
              - blockDeviceName: "blockdevice-c2c846cce1befec7fbdcbae254329b0b"
          poolConfig:
            dataRaidGroupType: "stripe"
        - nodeSelector:
            kubernetes.io/hostname: "ip-192-168-49-43"
          dataRaidGroups:
          - blockDevices:
              - blockDeviceName: "blockdevice-7d311a98255a454a717427b5c2d38426"
          poolConfig:
            dataRaidGroupType: "stripe"
        - nodeSelector:
            kubernetes.io/hostname: "ip-192-168-14-90"
          dataRaidGroups:
          - blockDevices:
              - blockDeviceName: "blockdevice-c608881cd3edbeab674a1aee7e0a1fc3"
          poolConfig:
            dataRaidGroupType: "stripe"

Once the CSPC manifest is updated then CSPIs will automatically migrate to the new node (which can be verified using **kubectl get cspi -n openebs**).

    kubectl get cspi -n openebs

    NAME                  HOSTNAME          FREE     CAPACITY    READONLY  STATUS   AGE
    cstor-disk-cspc-dvc2  ip-192-168-94-113   24100M   24111M      false     ONLINE   8h
    cstor-disk-cspc-f56z  ip-192-168-49-43    24100M   24113200k   false     ONLINE   8h
    cstor-disk-cspc-q9yt  ip-192-168-14-90    24100M   24113200k   false     ONLINE   8h

**Note:** Along with CStorPoolInstance migration, CStorVolumeReplicas belongs to CSPI will also migrate automatically.
