---
title: Provisioning Kubernetes cluster by kubeadm
author: Chandan Kumar
author_info: Software Engineer at MayaData Inc
date: 22-08-2018
tags: Containerized Storage, Kubeadm, Kubernetes, OpenEBS, Stateful Workloads
excerpt: Kubeadm is a new tool that is part of the Kubernetes distribution of 1.4.0. It allows you to install and set up a Kubernetes cluster.
not_has_feature_image: true
---

**Kubeadm** is a new tool that is part of the Kubernetes distribution of 1.4.0. It allows you to install and set up a Kubernetes cluster. One of the most frequent criticisms of Kubernetes is that it’s difficult to install. Kubeadm makes this much easier, so I strongly suggest you give it a try.

### Pre-requisites for creating a cluster:

- One or more machines running the compatible OS (ex: Ubuntu)
- 2-GB or more of RAM per machine
- 2-CPU or more for Master

Network connectivity among all machines in the cluster

### Objectives:

- Install a single master Kubernetes cluster.
- Install a Pod network on the cluster so that your Pods can communicate.

Beginners can set up the pre-requisites in their own machine by creating virtual machines (VMs) in a virtual box, or they can also use multiple machines for creating clusters.

### Installation:

Install these requirements in each node:

- Docker
```
    $ sudo apt-get update
    $ sudo apt-get install -y docker.io
```   

- Kubeadm, Kubelet, Kubectl
```
    $ sudo apt-get update && sudo apt-get install -y apt-transport-https curl
    $ sudo -i
    $ curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
    $ cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
    $ deb http://apt.kubernetes.io/ kubernetes-xenial main
    $ EOF
    $ exit
    $ sudo apt-get update
    $ sudo apt-get install -y kubelet kubeadm kubectl
```  

### Master Node:

The master is the machine where the control plane components run, including etcd (the cluster database) and the API server (which the kubectl CLI communicates with).
![Master Node](https://lh5.googleusercontent.com/BbzeYd9ttUgNLHIn-zS1gndo_sCNLYOiqe-HTHQLDNqegK72Lc7Nzg88tfUCXSo_p6Wyrq-beic2mf0ZR7tFMw3dW_IZvGYC-MT-GVCSWPqoS4OsglbwCQ2ZskBuT2FsJLI9jzY-UdokGUJnpA)
Before running kubeadm init in master node, first, choose a pod network add-on and verify whether it requires any arguments to be passed for kubeadm initialization. Depending on which third-party provider you choose, you might need to set the --pod-network-cidr argument with kubeadm init <args>.

- [list of pod network add-on.](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#pod-network)
- [list of arguments](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/)

### Configure the cgroup Driver used by kubelet
```
    $ sudo sed -i "s/cgroup-driver=systemd/cgroup-driver=cgroupfs/g" /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
```
### Restart kubelet
```
    $ sudo systemctl daemon-reload
    $ sudo systemctl restart kubelet
```  

Example:

```
    $ sudo kubeadm init --apiserver-advertise-address=<master-private-ip> --apiserver-cert-extra-sans=10.0.2.15 --pod-network-cidr 10.1.0.0/16
    $ sudo mkdir -p $HOME/.kube
    $ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    $ sudo chown $(id -u):$(id -g) $HOME/.kube/config
    $ sudo sysctl net.bridge.bridge-nf-call-iptables=1
    $ sudo KUBECONFIG=/etc/kubernetes/admin.conf
    $ kubectl apply -f https://raw.githubusercontent.com/cloudnativelabs/kube-router/master/daemonset/kubeadm-kuberouter.yaml
```

After you finish running kubeadm init in master node, it provides the token, master-ip, sha and hash as follows:
```
    $ kubeadm join --token <token> <master-ip>:<master-port> --discovery-token-ca-cert-hash sha256:<hash>
```
If you do not have the token, you can obtain it by running the following command on the master node:
```
    $ kubeadm token list
```
By default, tokens expire after 24 hours. If you are joining a node to the cluster after the current token has expired, you can create a new token using the following command:
```
    $ kubeadm token create
```
For reference, you can view this document: [https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/)

### Worker nodes:

A worker node in Kubernetes was previously known as a minion. A node may be a VM or a physical machine, depending on the cluster. Each node has the services necessary to run pods and is managed by the master components.

### Joining worker nodes:

To add nodes to your cluster, do the following for each machine:

- SSH to the machine
- Become root (e.g. sudo su -)
- Run the command that was returned by kubeadm init. For example:

    $ kubeadm join — token <token> <master-ip>:<master-port> — discovery-token-ca-cert-hash sha256:<hash>

Now you are all set and can list the nodes from the master by running
```
    $ kubectl get nodes
```
Please leave your valuable comments and questions below.
