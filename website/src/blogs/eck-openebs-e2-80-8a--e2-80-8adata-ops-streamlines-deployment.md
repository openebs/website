---
title: ECK & OpenEBS — Data Ops Streamlines Deployment
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 23-08-2019
tags: Eck, Elasticsearch, Kubernetes, LocalPV, OpenEBS
excerpt: Using OpenEBS, administrators can easily manage local PV storage resources for ECK seamlessly across both on-premises and multiple clouds, simplifying ElasticSearch ECK scaling and resilience while finally delivering a completely declaratively-managed application stack.
---

### TL;DR

Using OpenEBS, administrators can easily manage local PV storage resources for ECK seamlessly across both on-premises and multiple clouds, simplifying ElasticSearch ECK scaling and resilience while finally delivering a completely declaratively-managed application stack. Let’s review how.

**Good News: The recently shipped** [**Elastic Cloud on Kubernetes (ECK)**](https://www.elastic.co/blog/introducing-elastic-cloud-on-kubernetes-the-elasticsearch-operator-and-beyond) delivers Elasticsearch clusters as native, distributed Kubernetes Operators. Elasticsearch is a distributed, open source search and analytics engine for all types of data. Widely used, Elasticsearch is storage-intensive because it builds an inverted index of collections of JSON objects that are related to each other to allow very fast full-text searches. The result is a simplified deployment of ElasticSearch for the Kubernetes admins or SREs as well as a simplified developer experience.

**Bad News: ElasticSearch uses fast local storage but it does not address storage provisioning and management.** ECK use of the [static provisioner for Local](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner) PV requires administrators to manually format, mount, and configure disks on Kubernetes nodes. This is a PITA, as they say.

**Good News: OpenEBS removes the burden of Storage Operations for ECK Deployments.** With OpenEBS, administrators can easily manage local PV storage resources for ECK seamlessly across both on-premises and multiple clouds, simplifying ElasticSearch scaling and resilience.

### Vanilla K8s (PITA)

Typically, ElasticSearch is deployed one of two ways:

- **Dedicated mode:** Elastic pods are using LocalPV which are real disks, and they need to be dynamically provisioned as the pods’ scale.
- **Shared mode:** Elastic pods are using LocalPVs from shared storage for better capacity economics.

  Here is the detail on K8s static provisioners from [K8s documentation](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner)

  *Note that the local storage provisioner is different from most provisioners and does not support dynamic provisioning. Instead, it requires that administrators preconfigure the local volumes on each node and if volumes are supposed to be*

- *Filesystem volumeMode (default) PVs — mount them under discovery directories.*
- *Block volumeMode PVs — create a symbolic link under discovery directory to the block device on the node.*

  *The provisioner will manage the volumes under the discovery directories by creating and cleaning up PersistentVolumes for each volume.*

  *This means a Kubernetes administrator must manually manage storage operations outside of the ECK operator itself. Specifically,*

  *– Capacity resize of underlying volumes.*

  *– Capacity management of shared storage when deployed in shared mode.*

  *– Shifting of some of the data volumes from one node to another automatically in case a node has to be cordoned or drained.*

  *– Move data to other Kubernetes clusters.*

**Note: insert administrator sweat equity here^.**

### OpenEBS LocalPV + Data Ops (Good)

An OpenEBS storage cluster, itself Kubernetes-native, simplifies and automates storage provisioning and management operations either on your data center or in the cloud (or spanning both!). OpenEBS provisioners use OpenEBS disk pool operators and built-in data management capabilities to dynamically provision LocalPVs in a host path or in a disk mode to ECK pods.

![Multiple elastic data nodes sharing a pool of disks for thim provisioning effect](https://cdn-images-1.medium.com/max/800/1*PHw4zrcvJF_w-VcTI90RbA.png)

### K8s Advantage: Declarative Data Plane

OpenEBS uses a Declarative Data Plane to manage storage operations which aligns architecturally with Kubernetes Operators generally, and specifically with the ECK operator. Storage is typically the last “architectural mile” of Kubernetes deployments. Storage has gravity for applications that tends to tie Kubernetes clusters to the storage infrastructure beneath it. The OpenEBS Declarative Data Plane removes that last architectural mile by providing a completely Kubernetes-native software-defined storage infrastructure that spans on-premise and cloud resources and lets administrators manage Kubernetes application gravity consistently across all sites.

**OpenEBS-managed storage means that the end-to-end operations of the entire Kubernetes application stack is finally managed, top to bottom, in a completely declarative way.**

### Configuring a Dynamic localPV for ECK

The StorageClass spec for [OpenEBS LocalPV](https://docs.openebs.io/docs/next/uglocalpv.html) for automatically choosing an available disk on the node and mounting that disk with ext4 volume would look like the following:

    cat <<EOF | kubectl apply -f -
    apiVersion: elasticsearch.k8s.elastic.co/v1alpha1
    kind: Elasticsearch
    metadata:
     name: quickstart
    spec:
     version: 7.2.0
     nodes:
     — nodeCount: 3
     config:
     node.master: true
     node.data: true
     node.ingest: true
     volumeClaimTemplates:
     — metadata:
     name: elasticsearch-data # note: elasticsearch-data must be the name of the Elasticsearch volume
     spec:
     accessModes:
     — ReadWriteOnce
     resources:
     requests:
     storage: 10Gi
     storageClassName: OpenEBS-LocalPV
    EOF

The StorageClass spec for [OpenEBS LocalPV](https://docs.openebs.io/docs/next/uglocalpv.html) for automatically choosing an available disk on the node and mounting that disk with ext4 volume would look like the following:

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: openebs-localpv-disk
      annotations:
        openebs.io/cas-type: local
        cas.openebs.io/config: |
          - name: StorageType
            value: "device"
          - name: FSType
            value: ext4
    provisioner: openebs.io/local
    volumeBindingMode: WaitForFirstConsumer
    reclaimPolicy: Delete
    ---

In my next blog, I will give a simple tutorial of how to configure OpenEBS and ECK to realize the dynamic local PV allocations.

### Summary

Using OpenEBS administrators can easily manage local PV storage resources for ECK seamlessly across both on-premises and multiple clouds, simplifying ElasticSearch ECK scaling and resilience while finally delivering a completely declaratively-managed application stack.

### Important links

- Haven’t joined our wonderful OpenEBS community? Join [here](https://slack.openebs.io).
- [Free forever Kubernetes visibility](https://director.mayadata.io).
