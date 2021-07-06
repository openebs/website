---
title: How to Install OpenEBS with Kubernetes using MiniKube
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
tags: Container, Docker, minikube, Kubernetes, Solutions, OpenEBS
date: 22-10-2017
excerpt: Whether you are a newbie to Kubernetes looking for a small setup to start or a developer who uses Kubernetes on a daily basis, minikube is the tool that helps you quickly set up and run a Kubernetes environment locally. 
---

## What is MiniKube?

Whether you are a newbie to Kubernetes looking for a small setup to start or a developer who uses Kubernetes on a daily basis, minikube is the tool that helps you quickly set up and run a Kubernetes environment locally. minikube runs a single-node Kubernetes cluster inside a VM on your laptop for users looking to try out Kubernetes or develop with it day-to-day.

There are several options available for developers to install minikube based on an operating system. You can read the detailed instructions for the three most popular operating systems in [minikube Setup](https://github.com/kubernetes/minikube).

However, if you are already an experienced minikube user, skip the minikube setup instructions and jump directly to the **Setup OpenEBS** section.

In this post, I will explain how to set up Kubernetes using minikube directly on Ubuntu 16.04 (without using any VM drivers) and how to configure OpenEBS in hyper-converged mode or, more accurately, create your Container-Converged Infrastructure using OpenEBS Container Attached Storage (CAS).

## Prerequisites

Minimum requirements for minikube:

### Hardware

- Machine Type — minimum 4 vCPUs.
- RAM — minimum 4 GB.
- VT-x/AMD-v virtualization must be enabled in your system BIOS

### Software

- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- If using macOS:
- xhyve driver, [VirtualBox](https://www.virtualbox.org/wiki/Downloads), or VMware Fusion.
- If using Linux:
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) or KVM.

**NOTE:** minikube supports the `-vm-driver=none` option that runs Kubernetes components on the host and not in a VM. Docker is required to use this driver, but no the hypervisor.

- If using Windows:
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) or Hyper-V. VMware Workstation is not supported.

Since VirtualBox is available on all three platforms, I will describe this option.

## Install VirtualBox

I will not cover the details of VirtualBox installation since it is very common and instructions are widely available online.

1. Go to the [Virtualbox website](https://www.virtualbox.org/wiki/Downloads).
2. Download and install the binaries required for your operating system.

Make sure that you install [VirtualBox 5.2.0 Oracle VM VirtualBox Extension Pack](http://download.virtualbox.org/virtualbox/5.2.0/Oracle_VM_VirtualBox_Extension_Pack-5.2.0-118431.vbox-extpack) as well.

When I was writing this blog post, the most current version was VirtualBox-5.2.0–118431.

Once VirtualBox is installed, you will see a screen similar to the following:

![Post VirtualBox install screenshot](https://cdn-images-1.medium.com/max/800/0*HztM26xqSWKiYaIx.png)

**NOTE:** You can also use KVM, Hyper-V, and VMware Fusion.

## Install Ubuntu

Create a new VM with 4 vCPUs, 4Gb memory, and 10GB disk space.

![Creating VM](https://cdn-images-1.medium.com/max/800/0*8wqBzAyAPf_LsbFk.png)

Download your preferred version of [Ubuntu](https://www.ubuntu.com/download). I will be using Ubuntu 16.04.3 LTS.

Under **VM Settings/Storage**, mount your ISO image and power on the VM.

Install Ubuntu with default options. I used *openebs/password* as username/password for simplicity. If you use something else make sure to replace it with yours when you follow the instructions.

Finally login to your Ubuntu VM.

On your Ubuntu host, install the SSH server:

    sudo apt-get install openssh-server

Now you should be able to access your VM using SSH. Check the status by running:

    sudo service ssh status

![Accessing your VM using SSH](https://cdn-images-1.medium.com/max/800/0*1rUwIrG2T0EzoBJj.png)

Disable firewall on your Ubuntu VM by running:

    sudo ufw disable
    

Install curl if it’s not already installed:

    sudo apt install curl

By default, for each virtual machine, VirtualBox creates a private network (10.0.2.x) which is connected to your laptop’s network using NAT. However, you may not be able to your VMs from your localhost through SSH just yet. To access your VM, you need to configure port forwarding. In the network setting of the VM. Click on **Advanced/Port Forwarding** and create a rule with the **Host port 3022 **and **Guest Port 22**. Name it *SSH* and leave other fields blank.

![Configuring port forwarding](https://cdn-images-1.medium.com/max/800/0*uDKLTcZapcEZfK3E.png)

Now you can connect to your Ubuntu VM from your laptop using SSH with localhost as the address and port 3022 instead of 22. Connect to your Ubuntu VM using the following credentials: `openebs/password`

## Install Docker

To get the latest version of Docker, install it from the official Docker repository.

On your Ubuntu VM, run the following commands:

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository “deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable”
    sudo apt-get update

![Install the latest version of Docker](https://cdn-images-1.medium.com/max/800/0*-4QRgWvjit9qyKaq.png)

Confirm that you want to install the binaries from the Docker repository instead of the default Ubuntu repository by running:

    sudo apt-get install -y docker-ce

![Install the binaries from the Docker repository](https://cdn-images-1.medium.com/max/800/0*Hh8nFvl7xArgJnN-.png)

Install Docker and make sure it’s up and running after installation is complete:

    sudo apt-get install -y docker-ce
    sudo systemctl status docker

![Install Docker](https://cdn-images-1.medium.com/max/800/0*NTvaIXL4LiPakwEy.png)

## Add iSCSI Support

OpenEBS uses iSCSI to connect to the block volumes. Therefore, you need to install the `open-iscsi` package on your Ubuntu machine.

On your Ubuntu host, run:

    sudo apt-get update
    sudo apt-get install open-iscsi
    sudo service open-iscsi restart

![Install the open-iscsi package on your Ubuntu machine](https://cdn-images-1.medium.com/max/800/0*OmIy-bxY3PrD_HYT.png)

Check that the iSCSI initiator name is configured:

    sudo cat /etc/iscsi/initiatorname.iscsi

Verify the iSCSI service is up and running:

    sudo service open-iscsi status

![Check that the iSCSI initiator name is configured](https://cdn-images-1.medium.com/max/800/0*30EupY6kOMa30SMj.png)

## Set up minikube and kubectl

On your Ubuntu host, install minikube by running:

    curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    chmod +x minikube
    sudo mv minikube /usr/local/bin/

![On Ubuntu host, install minikub](https://cdn-images-1.medium.com/max/800/0*62DCuwG4tX8iU_AX.png)

Install kubectl:

    curl -Lo kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/

![Install kubectl](https://cdn-images-1.medium.com/max/800/0*9jZx-rusvrdn9mEe.png)

Set up directories for storing minkube and kubectl configurations:

    mkdir $HOME/.kube || true touch $HOME/.kube/config

Set up an environment for minikube by adding the following lines to the end of the `~/.profile` file:

     export MINIKUBE_WANTUPDATENOTIFICATION=false
     export MINIKUBE_WANTREPORTERRORPROMPT=false
     export MINIKUBE_HOME=$HOME
     export CHANGE_MINIKUBE_NONE_USER=true
     export KUBECONFIG=$HOME/.kube/config

Confirm that environment variables are saved in your profile file:

    cat ~/.profile

![Confirm that environment variables are saved in your profile file](https://cdn-images-1.medium.com/max/800/0*rxjoxM6qkYkppd5h.png)

Start minikube:

    sudo -E minikube start — vm-driver=none

![Start minikube](https://cdn-images-1.medium.com/max/800/0*UaQ_6Y2m4hv6P4oc.png)

If you forgot to install Docker, you will get the following error:

![Error screenshot when forgot to install Docker](https://cdn-images-1.medium.com/max/800/0*ysp8RnG5DWDu_Q0j.png)

When using the none driver, the kubectl config and credentials generated will be root-owned and will appear in the root home directory. To fix this, set the correct permissions:

    sudo chown -R $USER $HOME/.kube
    sudo chgrp -R $USER $HOME/.kube
    sudo chown -R $USER $HOME/.minikube
    sudo chgrp -R $USER $HOME/.minikube

## Verify minikube configuration

Verify that minikube is configured correctly and it has started by running:

    minikube status

**Example:**

![Verify minikube configuration](https://cdn-images-1.medium.com/max/800/0*yK3Wlyy81I15tNZp.png)

**Note**

- If the minikube status displays **Stopped**, add the `sudo minikube start` command.
- If you forgot to set the permissions, minikube will display errors indicating permissions denied to configuration files, fix the permissions by running the following commands:

    sudo chown -R $USER $HOME/.kube
    sudo chgrp -R $USER $HOME/.kube
    sudo chown -R $USER $HOME/.minikube
    sudo chgrp -R $USER $HOME/.minikube

## Verify Kubernetes configuration

Check that kubectl is configured and services are up and running by getting the list of Kubernetes nodes and pods:

    kubectl get nodes
    kubectl get pods — all-namespaces

![Verify Kubernetes configuration](https://cdn-images-1.medium.com/max/800/0*noWgoiv0GLk43BRB.png)

## Set up OpenEBS

Download the latest OpenEBS Operator files using the following commands:

    git clone https://github.com/openebs/openebs.git
    cd openebs/k8s

![Download the latest OpenEBS Operator files](https://cdn-images-1.medium.com/max/800/0*UNKK2cZhYPJVbTDx.png)

By default, OpenEBS launches OpenEBS Volumes with two replicas. To set one replica, as is the case with a single-node Kubernetes cluster, in the openebs-operator.yaml file, specify the environment variable `DEFAULT_REPLICA_COUNT=1`. This is supported in OpenEBS version 0.4 onward.

![Replica count screenshot](https://cdn-images-1.medium.com/max/800/0*SxXEzbDmpVA5ZhwS.png)

Apply the configuration changes:

    kubectl apply -f openebs-operator.yaml

![Applying configuration change](https://cdn-images-1.medium.com/max/800/0*WB16UScHye4LClft.png)

Add the OpenEBS storage classes that can then be used by developers and applications:

    kubectl apply -f openebs-storageclasses.yaml

![Adding the OpenEBS storage classes](https://cdn-images-1.medium.com/max/800/0*mojNYfZbll-g6bdk.png)

#### Running stateful applications with OpenEBS storage

To use OpenEBS as persistent storage for your stateful workloads, set the storage class in the Persistent Volume Claim (PVC) of your application to one of the OpenEBS storage class.

Get the list of storage classes using the following command. Choose the storage class that best suits your application.

    kubectl get sc

![Getting the list of storage classes](https://cdn-images-1.medium.com/max/800/0*artfNnT8fZSziaKH.png)

You can find samples of YAML files for stateful workloads using OpenEBS under the `openebs/k8s/demo` folder.

![Finding samples of YAML files for stateful workloads](https://cdn-images-1.medium.com/max/800/0*KCn5Z4-av-7Hevj_.png)

Now you have your Kubernetes cluster up and running. In my next blog posts, I will cover the installation of stateful workloads such as Cassandra and [PostgreSQL](http://containerized.me/how-to-deploy-a-postgresql-cluster-on-kubernetes-openebs/), as well as the benefits of running your stateful workloads on OpenEBS. Stay tuned!

---

*Originally published at [Containerized Me](http://containerized.me/how-to-install-openebs-with-kubernetes-using-minikube/)*.
