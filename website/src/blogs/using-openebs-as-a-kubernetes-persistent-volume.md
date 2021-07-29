---
title: Using OpenEBS as a Kubernetes persistent volume
author: Jimmy Song
author_info: Developer Advocate at Ant Financial, CNCF Ambassador, co-founder of ServiceMesher community, blog https://jimmysong.io
date: 10-01-2018
tags: Kubernetes, OpenEBS, Docker, Cloud Native
excerpt: OpenEBS is a containerized block storage written in Go for cloud native and other environments which make the data workloads more reliable in Kubernetes.
not_has_feature_image: true
---

[OpenEBS](https://www.openebs.io/) is a containerized block storage written in Go for cloud native and other environments which make the data workloads more reliable in Kubernetes.

OpenEBS is open sourced by [MayaData](http://www.mayadata.io/) who is a professional containerized storage company formerly known as CloudByte. Their vision is to make data workloads easy to use in Kubernetes across clouds or on premise.

We know that [EBS](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://amazonaws-china.com/cn/ebs/&usg=ALkJrhhv8rYmHkvvZS_bPmr_Ca1Wj24SnA) (Elastic Block Storage) is available in AWS, persistent block storage for Amazon EC2 to meet the functional and performance requirements of the most demanding applications, and OpenEBS is its open source implementation.

## Introduction

With OpenEBS, you can treat containers that have persistent data as you would any other common container. OpenEBS itself is also deployed through containers that support Kubernetes, Swarm, Mesos, Rancher orchestration scheduling, and storage services can be assigned to each pod, application, cluster, or container level, including:

- Data persistence across nodes
- Synchronize data across available zones and cloud vendors
- Use commercial hardware and container engines to provide highly scalable block storage
- Integration with the container orchestration engine, the developer’s application can automatically configure OpenEBS
- Based on CloudByte’s container-based experience in BSD, we provide users with OpenEBS QoS assurance

## Architecture

The OpenEBS storage controller itself runs in a container. OpenEBS Volume consists of one or more containers that run microservices. This storage controller function is based on a microservices architecture — the data for each volume is provided by its own set of containers, not by a single monolithic storage controller that provides control for multiple volumes at the same time To provide. This is the essential difference between OpenEBS and traditional storage devices.

The OpenEBS architecture can be divided into Data Plane (Data Plane) and Control Plane (Control Plane) in two parts:

- Data Plane: Provides data storage for applications
- Control Plane: Managing OpenEBS Volume Containers, which typically uses the functionality of container layout software

## Data plane

The following figure shows the architecture of OpenEBS deployed on Kubernetes cluster. Among them, the yellow or orange part is the OpenEBS persistent storage volume, created by Kubernetes’ PVs, implemented using iSCSI, and stored on host nodes or in the cloud (such as EBS, GPD, etc.) depending on where your cluster is deployed. The OpenEBS volume is completely independent of the user’s application life cycle to manage, which is Kuberentes PV in the basic idea.

![OpenEBS Cluster - Data Pane](/images/blog/openebs-data-plane.png)

OpenEBS volumes provide persistent storage for containers with resiliency to system failures and faster access to storage, snapshots and backups. In addition, it provides mechanisms for monitoring usage and enforcing QoS policies.

The disk that stores the data is called the storage backend and can be a host directory, an attached block device, or a remote disk. Each OpenEBS volume contains an iSCSI target container (represented as openebs-vol1 in the previous figure) and one or more replica containers (openebs-vol1-R1 and openebs-vol1-R2).

The application pod accesses the storage through the iSCSI target container, which copies the data to all of its replicas. In the event of a node failure, the iSCSI target container starts from one of the remaining online nodes and provides data by connecting to the available replica containers.

**Source**

The implementation of this section consists of two containers:

- [openebs/jiva](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/jiva&usg=ALkJrhhhCfHb4LkQReHbpayqLJwjwdctgw) : storage control functions, including copy logic

- [openebs/gotgt](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/gotgt&usg=ALkJrhgoXb10SL2TVf8_urB_TIfEVSDBxg) : iSCSI target features used by openebs/jiva

## Control plane

The OpenEBS control plane is also known as maya. The purpose is to create a hyper-converged OpenEBS that is mounted on a container scheduling engine such as Kubernetes, Swarm, Nomad, etc. to extend the storage capabilities provided by a particular container orchestration system.

![OpenEBS Cluster - Control Plane](/images/blog/openebs-control-plane.png)

OpenEBS’s control plane is also based on microservices, and its services can be divided into the following sections:

Container layout plug-in, used to enhance the function of the strong container layout framework:

- **Kubernetes Dynamic Configuration** : [openebs-provisioner](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/external-storage/tree/master/openebs&usg=ALkJrhjuOf_IBvwR0NC-g734l_p4Ia14hg)
- **Kubernetes-dashboard** : [openebs-dashboard](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/dashboard&usg=ALkJrhigRmJSDzmVT_NRMupygPwAM5EX9g)
- **Extended schema** : Kubernetes-based CRDs (custom resource defination) that store OpenEBS-related configuration data

Cluster services provide OpenEBS-specific storage intelligence such as:

- **maya-apiserver** : Contains APIs for performing volume operations that translate requests into container-specific system-specific operations
- **maya-mulebot** : Use the information collected to suggest optimized layout and event handling tips
- **maya-connect** : Allows monitoring data to be uploaded to `maya-cloud` for further storage access mode analysis

Node Services, which provide OpenEBS-specific storage intelligence that runs with kubelet, such as:

- **maya-agent** : Includes storage management features

By using prometheus, heapster, grafana and jaegar for these services, you can add monitoring and tracking capabilities.

**Source**

- [openebs / maya](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/maya&usg=ALkJrhgksSLVDOSt9WRSnCdGdaf4nezkyQ) : All of the specific binary code (non-plugins) is stored in this repository, such as `maya-apiserver` , `maya-agent` , `maya-mulebot` , `maya-connect` , `mayactl` and more.
- [openebs-dashboard](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/dashboard&usg=ALkJrhigRmJSDzmVT_NRMupygPwAM5EX9g) : A branch of the kubernetes-dashboard project that extends storage capabilities.
- [openebs-provisioner](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=https://github.com/openebs/external-storage/tree/master/openebs&usg=ALkJrhjuOf_IBvwR0NC-g734l_p4Ia14hg) : The OpenEBS K8s Provisioner from the Kubernetes incubator project.

## Install OpenEBS on Kubernetes

Below we will use the way to install OpenEBS operator, you need to make sure you have already installed iSCSI on your node before installation.

## Prerequisites

OpenEBS relies on iSCSI for storage management, so you need to make sure that you have OpenEBS installed on your cluster.

**Note** : If you are using kubeadm, container-mounted kublet, it comes with iSCSI and does not need to be manually installed. For a kubelet installed directly on the bare metal in binary form, you need to install iSCSI yourself.

The iSCSI (Internet Small Computer System Interface) is a TCP / IP-based protocol used to establish and manage interconnections between IP storage devices, hosts and clients, and to create storage area networks (SANs ). The SAN makes it possible for the SCSI protocol to be used in high-speed data transmission networks, with block-level data transfer between multiple data storage networks. The SCSI architecture is based on C/S mode and is typically used in environments where devices are close to each other and these devices are connected by a SCSI bus.

OpenEBS needs to use iSCSI as a storage protocol, and CentOS default does not have iSCSI installed, so we need to manually install.

There are two types of roles in iSCSI:

- **target** : used to provide storage (server)
- **initiator** : use the stored client (client)

The following figure in Kubernetes uses iSCSI architecture (Source: [http://rootfs.github.io/iSCSI-Kubernetes/)](https://translate.googleusercontent.com/translate_c?depth=1&hl=en&rurl=translate.google.co.in&sl=zh-CN&sp=nmt4&tl=en&u=http://rootfs.github.io/iSCSI-Kubernetes/%25EF%25BC%2589&usg=ALkJrhgk4iuBd1pHB1zGq6XKLwffkSGZew)

![iSCSI-Kubernetes](/images/blog/iscsi-kubernetes.png)

Installing the iSCSI service is very simple, you do not need additional configuration, just start the service after installation.

Execute the following command on each node node:

```
yum -y install iscsi-initiator-utils systemctl enable iscsid systemctl start iscsid
```

## Quick start

Run the OpenEBS service using Operator:

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-operator.yaml kubectl apply -f openebs-operator.yaml
```

Use the default or custom storageclass:

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-storageclasses.yaml kubectl apply -f openebs-storageclasses.yaml
```

Mirror used are:

- openebs/m-apiserver: 0.5.1-RC1
- openebs/openebs-k8s-provisioner: 0.5.1-RC2
- openebs/jiva: 0.5.1-RC1
- openebs/m-exporter: 0.5.0

## Test

Let’s use the Example from the official OpenEBS documentation to install the Jenkins test:

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/jenkins/jenkins.yml kubectl apply -f jenkins.yml
```

Check PV and PVC

```
$ kubectl get pv
NAME CAPACITY ACCESS MODES RECLAIM POLICY STATUS CLAIM STORAGECLASS REASON AGE
pvc-8e203e86-f1e5-11e7-aa47-f4e9d49f8ed0 5G RWO Delete Bound default/jenkins-claim openebs-standard 1h
$ kubectl get pvc kubectl get pvc NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE
jenkins-claim Bound pvc-8e203e86-f1e5-11e7-aa47-f4e9d49f8ed0 5G RWO openebs-standard 1h
```

View Jenkins pod:

```
Events: Type Reason Age From Message ---- ------ ---- ---- ------- Warning FailedScheduling 29m (x2 over 29m) default-scheduler PersistentVolumeClaim is not bound: "jenkins-claim" (repeated 3 times) Normal Scheduled 29m default-scheduler Successfully assigned jenkins-668dfbd847-vhg4c to 172.20.0.115 Normal SuccessfulMountVolume 29m kubelet, 172.20.0.115 MountVolume.SetUp succeeded for volume "default-token-3l9f0" Warning FailedMount 27m kubelet, 172.20.0.115 Unable to mount volumes for pod "jenkins-668dfbd847-vhg4c_default(8e2ad467-f1e5-11e7-aa47-f4e9d49f8ed0)": timeout expired waiting for volumes to attach/mount for pod "default"/"jenkins-668dfbd847-vhg4c". list of unattached/unmounted volumes=[jenkins-home] Warning FailedSync 27m kubelet, 172.20.0.115 Error syncing pod Normal SuccessfulMountVolume 26m kubelet, 172.20.0.115 MountVolume.SetUp succeeded for volume "pvc-8e203e86-f1e5-11e7-aa47-f4e9d49f8ed0" Normal Pulling 26m kubelet, 172.20.0.115 pulling image "sz-pg-oam-docker-hub-001.tendcloud.com/library/jenkins:lts" Normal Pulled 26m kubelet, 172.20.0.115 Successfully pulled image "sz-pg-oam-docker-hub-001.tendcloud.com/library/jenkins:lts" Normal Created 26m kubelet, 172.20.0.115 Created container Normal Started 26m kubelet, 172.20.0.115 Started container
```

Start up successful. The Jenkins configuration uses **NodePort** mode access and now accesses the NodePort of Jenkins service for any node in the cluster.

## Reference

- [OpenEBS Documentation](http://openebs.readthedocs.io/)
- [CentOS 7.x 下配置 iSCSI 网络存储](http://blog.csdn.net/wh211212/article/details/52981305)
- [Configure iSCSI Initiator](https://www.server-world.info/en/note?os=CentOS_7&p=iscsi&f=2)
- [https://www.openebs.io/](https://www.openebs.io/)
- [https://github.com/openebs/openebs](https://github.com/openebs/openebs)
- [Data Scientists adopting tools and solutions that allow them to focus more on Data Science and less on the infrastructure around them](https://blog.openebs.io/data-scientists-adopting-tools-and-solutions-that-allow-them-to-focus-more-on-data-science-and-less-db9654063bd5)
- [RHEL7: Configure a system as either an iSCSI target or initiator that persistently mounts an iSCSI target.](https://www.certdepot.net/rhel7-configure-iscsi-target-initiator-persistently/)

Original page: [https://jimmysong.io/posts/using-openebs-as-kubernetes-persistent-volume/](https://jimmysong.io/posts/using-openebs-as-kubernetes-persistent-volume/)

Translated from Chinese to English by Google Translate
