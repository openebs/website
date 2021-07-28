---
title: Multi-Node Kubernetes 1.6 Cluster provisioning made easy using SandBox (Vagrant box)
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Kubeadm, Kubernetes, OpenEBS, Vagrant, Virtualbox
date: 23-05-2017
excerpt: Working on OpenEBS, a containerized storage for containers which is orchestrated by Kubernetes, most of our tasks, be it development, testing and demo require us to setup and modify the nodes in Kubernetes cluster.
not_has_feature_image: true
---

### Background

Working on OpenEBS, a containerized storage for containers which is orchestrated by Kubernetes, most of our tasks, be it development, testing and demo require us to setup and modify the nodes in Kubernetes cluster. In addition, a multi-node cluster is a must as we go beyond the initial development and testing, to explore the high availability, scale, performance, and upgrade aspects.

While *minikube* and *minishift* provide an easy way to setup Kubernetes single node cluster — for multi-node cluster the fastest ways to get going are usually cloud or hosted solutions. ***kubeadm*** is the closest we can get to easily setup a cluster, but since it is still in alpha, we keep running into some issues like — [kubadm init v1.6.1 fails](https://github.com/kubernetes/kubeadm/issues/226)

*An ideal solution for a developer would be a Kubernetes Sandbox. A sandbox that can be easily setup on a laptop and can work on the move (without net connectivity.) This Sandbox should be shielded from the different API or CLI changes that happen with the frequent releases of kubeadm and Kubernetes.*

We have used Vagrant, VirtualBox, and Atlas to do just that.

![Vagrant, VirtualBox and Atlas](https://cdn-images-1.medium.com/max/800/1*7kkviZOwgh8ePDYRjFX0mQ.png)

## Try It! It is Easy and Quick!

Once you have Vagrant (1.9.1 or higher) and VirtualBox (5.1.14 or higher) installed on your laptop/machine, just do the following:

Step 1: Download the Vagrantfile from [OpenEBS Github](https://raw.githubusercontent.com/openebs/openebs/master/k8s/lib/vagrant/test/k8s/1.6/Vagrantfile)
Step 2: Run **vagrant up**

Detailed instructions can be found [here](https://github.com/openebs/openebs/tree/master/k8s/lib/vagrant/test/k8s/1.6).

The above two steps will provision the following:

- Ubuntu VM with Kubernetes Master (kubemaster-01)
- Ubuntu VM with Kubernetes Minion (kubeminion-01) associated with (kubemaster-01)
- Setup *weave* as pod network
- Setup the kubectl credentials ( admin.conf) on kubemaster-01
- Sample Kubernetes pod YAML files are located on (kubemaster-01) under the directory (*~/demo/k8s/spec/*)

In addition to the above, the following OpenEBS provisioning tasks are also performed.

- Install OpenEBS iSCSI FlexVolume Driver on the kubeminion-01
- Ubuntu VMs installed with OpenEBS Maya Master and OpenEBS Storage Hosts. (If you don’t want to use the storage, you can skip the installation of these VMs. Check the customization steps below).

## Customizing the Kubernetes Sandbox

The above instructions include setting up Kubernetes and OpenEBS as well, but you can easily customize the Vagrantfile to skip installation of OpenEBS by prefixing ENV variables before the vagrant command as follows:

    MM_NODES=0 MH_NODES=0 vagrant up

Some of the configuration options available are:

- KM_CPU — Number of CPUs for minion (*default 2*)
- KM_MEM — Size of the RAM (in bytes) for minion (*default 2048*)
- KH_NODES — Number of Kubernetes Minion VMs (*default 1*)
- KH_CPU — Number of CPUs for minion (*default 2*)
- KH_MEM— Size of the RAM (in bytes) for minion (*default 1024*)
- MM_NODES — Number of OpenEBS Maya Master VMs (*default 1*)
- MH_NODES — Number of OpenEBS Storage Host VMs (*default 2*)

If you are looking for an older release of Kubernetes, checkout — [kubernetes vagrant boxes with 1.5.5](https://blog.openebs.io/setting-up-kubernetes-1-5-5-cluster-with-vagrant-dda11e33b5bc)

## Contributing to creating Kubernetes Sandboxes

Btw, the process of creating these Kubernetes Sandboxes is Open Sourced.

The majority of the issues that are encountered during the Kubernetes cluster setup using kubeadm are related to the software api/cli options changed across different versions of kubeadm or the interfaces between kubeadm and Kubernetes. Another nagging issue is the need to have connectivity to the network.

These issues are resolved by having Sandbox (vagrant boxes) that pre-package the required software with versions that are compatible. The task of downloading the required software is automated via the scripts.

Once a VM is initialized with network/IP address details, certain initialization tasks will have to be executed. These are placed in the configuration scripts (which are also pre-packaged with the sandboxes) and are invoked from the Vagrantfile itself.

Currently, the Sandboxes use *weave* as a pod network, you can easily extend this to use a different scheme for pod network.

If you like to contribute or learn more about these box generation scripts, check out our [GitHub](https://github.com/openebs/openebs/tree/master/k8s/lib/vagrant) or join our [*Slack Channel*](http://slack.openebs.io).
