---
title: ARMing Kubernetes with OpenEBS \#1
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 02-08-2018
tags: Arm64, Kubernetes, Lepotato, Owncloud, Solutions
excerpt: Running stateful containers on Le Potato. Why not! It’s fun and extremely efficient! I know many people (including me) used to run ownCloud on their desktop computers.
---

## Running stateful containers on Le Potato

Why not! It’s fun and extremely efficient! I know many people (including me) used to run ownCloud on their desktop computers. I have finally decided to retire my old desktop computer and was looking ways to keep my ownCloud instance alive and maybe even improve it a bit.

First, I ran **ownCloud** on GKE Kubernetes cluster and came to a decison quickly that it’s not what I needed:

- I am used to the speed of USB 3.0 for large uploads when needed. I wanted to keep the option of (50MB+/sec) using USB. Which means, if I choose a budget ARM SoC route, then the board should have **non-shared bandwidth** for LAN and USB.
- 4 node GKE cluster using n1-standard-1 + 200GB storage costs ~$225/month, I would rather use Dropbox for $20/month = 240$/year (still doesn’t give me what I need).
- **Low-power**, possibly solar-powered. I’ll share my power consumption findings in the series of blog articles.
- Everything on **Kubernetes** is more fun, right?

I was looking into [Raspberry Pi 3 Model B](http://amzn.to/2GMjYt4) option and after a quick trial realized that shared USB/Ethernet bandwidth and lack of MicroSD UHS support is not going to give me the performance I need and found the **AML-S905X-CC Le Potato** board.

Libre Computer Board, code name Le Potato, is designed as a drop in hardware replacement for the Raspberry Pi 3 Model B (In fact it has the exact same form factor and port locations) and offers faster performance, more memory, lower power, higher IO throughput, 4K capabilities, open market components, improved media acceleration and removal of the vendor locked-in interfaces. This platform uses the latest technologies and is built upon proven long-term available chips. It is supported by upstream Linux and has a downstream development package based on Linux 4.9 LTS that offers ready-to-go 4K media decoding, 3D acceleration, and more.

Most importantly, Le Potato has almost double the performance of RPi 3 with 2GB memory and 50% faster CPU and GPU. It also has non-shared bandwidth for LAN and USB and MicroSD UHS support. I was able to get over 70MB/s read&write performance vs ~15–20MB/s on RPi 3. I also noticed that even under heavy load Le Potato has lower power consumption compared to Rpi 3.

It sounds too good to be true, right? Since Le Potato is new, I’ve decided to run both side-to-side and publish my experience.

In this blog post, I will focus on setting up a Kubernetes on a Le Potato Clusters, install ownCloud on top, and compare it to Rpi 3.

## Prerequisites

### Hardware

- 4 x [Libre Computer Board AML-S905X-CC (Le Potato) 64-bit (2GB)](http://amzn.to/2ptxGJS) $45
- 4 x 32GB MicroSD Card ([Samsung 32GB 95MB/s MicroSD](http://amzn.to/2uayTe4) $9.99)
- 4 x 128GB USB Drive ([Samsung 128GB USB 3.0 Flash Drive Fit (MUF-128BB/AM)](http://amzn.to/2psgFPC) $39)
- 1 x Desktop Switch ([TP-link 5-Port Gigabit Desktop Switch](http://amzn.to/2u3TCQN) $29.99)
- 1 x Active USB Hub ([Generic 7-Port USB Hub with ON/OFF Switch](http://amzn.to/2IBIZaO) $5.64)
- 4 x short USB to Micro USB cable ([ZiBay Micro USB Short Sync Cable for Select Models/Device, 7-Inch — Pack of 5](http://amzn.to/2G8Doub) $6.99)
- For comparison: 4 x [Raspberry Pi 3 Model B](http://amzn.to/2GMjYt4) $34.62

### Optional:

- Short cables make it look clean and nice:
  6-inch CAT6 flat network cables ([5-PACK 6-inch CAT6 Network UTP Ethernet RJ45 Flat-Design](http://amzn.to/2GcT5AV) $12.48)
- One touchscreen to access the cluster when nothing else available:
  1x 3.5 inch TFT Touch Screen ([kuman 3.5 Inch 480×320 TFT Touch Screen Monitor for Raspberry Pi](http://amzn.to/2pwR9tt) $19.39)
- I also build a mobile version to run in my car using this with a Tmobile line ([SIM800 Module GSM GPRS Expansion Board UART V2.0](http://amzn.to/2GLBeyE) $25.99)

### Software components used

- [Armbian 5.38 Ubuntu Xenial](https://dl.armbian.com/lepotato/) (for Le Potato)
- [Raspbian Stretch Lite](https://www.raspberrypi.org/downloads/raspbian/) 2017–11–29 (for Rpi 3)
- [Etcher](https://etcher.io/) v1.3.1
- Kubernetes v1.9.2+
- OpenEBS 0.5.3 arm64
- ownCloud

I will start with Le Potato and compare against Raspberry Pi 3 on my next blog.

### Flash Le Potato Armbian image on SD Cards

**Armbian** provides Debian and Ubuntu based builds for ARM development boards. Armbian Ubuntu is pretty much same as Ubuntu, except the desktop interface. Armbian uses the Xfce desktop environment, which is a lighter than Gnome or KDE. Its main advantage is its speed, and it’s ideal for systems with 256 MB to 512 MB of RAM. And, I plan to disable desktop anyways.

Download the [Armbian Ubuntu image](https://dl.armbian.com/lepotato/Ubuntu_xenial_next_desktop.7z) from the link [here](https://dl.armbian.com/lepotato/), extract and burn it to your SD cards using Etcher.

![Etcher flashing](https://cdn-images-1.medium.com/max/800/0*XI8xSg4dCl_IWvbz.png)

Plug the SD card into your Le Potato board and power on.

![Terminal Window](https://cdn-images-1.medium.com/max/800/0*ojAbBScZY7giAV7b.jpg)

Login as `root` and use password `1234`. You will be prompted to change this password at first login. Next, you will be asked to create a normal user account that is sudo enabled.

### Prepare Armbian host

After reboot, you will auto login to your host with the new user you have created.

![Armbian Le Potato](https://cdn-images-1.medium.com/max/800/0*UOLgX8I0Oz9hw7I8.jpg)

Change the hostname and set static IP by using armbian-config utility:

`sudo armbian-config`

![armbian-config utility](https://cdn-images-1.medium.com/max/800/0*s8fjc1-L-9pkDzRE.png)

Disable swap by running the following commands:

```
sudo systemctl disable zram-configsudo swapoff -a
```

And also comment out the reference to swap in /etc/fstab file:

```
sudo vi /etc/fstab
```

After reboot, confirm that swap space is disabled by running the following command. It should return empty.

```
sudo swapon — summary
```

Install Golang 1.10:

```
wget https://dl.google.com/go/go1.10.linux-arm64.tar.gz
sudo tar -C /usr/local -xzf go1.10.linux-arm64.tar.gz
export PATH=$PATH:/usr/local/go/bin
mkdir go
export GOPATH=”$HOME/go”
go get github.com/kubernetes-incubator/cri-tools/cmd/crictl
```

Repeat all the steps above on all your nodes.

#### Install Docker on Armbian Ubuntu (arm64)

Run the following command to install Docker on all nodes. The second line is to use Docker as a non-root user, use your username instead of mine below (murat):

```
curl -sL https://get.docker.com | sh
sudo usermod murat -aG docker
```

Successful installation would look like below:

```
murat@kubenode1:~$ curl -sL https://get.docker.com | sh
 # Executing docker install script, commit: 02d7c3c
 + sudo -E sh -c apt-get update -qq >/dev/null
 + sudo -E sh -c apt-get install -y -qq apt-transport-https ca-certificates curl >/dev/null
 + sudo -E sh -c curl -fsSL “https://download.docker.com/linux/ubuntu/gpg" | apt-key add -qq →/dev/null
 + sudo -E sh -c echo “deb [arch=arm64] https://download.docker.com/linux/ubuntu xenial edge” > /etc/apt/sources.list.d/docker.list
 + [ ubuntu = debian ]
 + sudo -E sh -c apt-get update -qq >/dev/null
 + sudo -E sh -c apt-get install -y -qq — no-install-recommends docker-ce >/dev/null
 + sudo -E sh -c docker version
Client:
 Version: 18.02.0-ce
 API version: 1.36
 Go version: go1.9.3
 Git commit: fc4de44
 Built: Wed Feb 7 21:11:48 2018
 OS/Arch: linux/arm64
 Experimental: false
 Orchestrator: swarm
Server:
 Engine:
 Version: 18.02.0-ce
 API version: 1.36 (minimum version 1.12)
 Go version: go1.9.3
 Git commit: fc4de44
 Built: Wed Feb 7 21:09:57 2018
 OS/Arch: linux/arm64
 Experimental: false
If you would like to use Docker as a non-root user, you should now consider
adding your user to the “docker” group with something like:
sudo usermod -aG docker murat
Remember that you will have to log out and back in for this to take effect!
WARNING: Adding a user to the “docker” group will grant the ability to run
 containers which can be used to obtain root privileges on the
 docker host.
 Refer to https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface
 for more information.
```

Repeat all the steps above on all your nodes.

#### Install Kubernetes on Armbian for Le Potato

Run the following command to install Kubeadm on all nodes:

```
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add — && \
 echo “deb http://apt.kubernetes.io/ kubernetes-xenial main” | sudo tee /etc/apt/sources.list.d/ kubernetes.list && \
 sudo apt-get update -q && \
 sudo apt-get install -qy kubeadm
```

Repeat all the steps above on all your nodes.

#### Initialize Kubernetes master node

Initialize your master K8s node:

```
sudo kubeadm init — pod-network-cidr=10.20.0.0/24 — apiserver-advertise-address=10.10.0.131
```

By default, token expires in 24h. If you need it longer, then you can add `— token-ttl=0` to the end of the command above to generate token that does not expire.

This step may take around 10 minutes and after that, you will see a summary like below:

```
…
Your Kubernetes master has initialized successfully!
To start using your cluster, you need to run the following as a regular user:
mkdir -p $HOME/.kube
 sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
 sudo chown $(id -u):$(id -g) $HOME/.kube/config
You should now deploy a pod network to the cluster.
 Run “kubectl apply -f [podnetwork].yaml” with one of the options listed at:
 https://kubernetes.io/docs/concepts/cluster-administration/addons/
You can now join any number of machines by running the following on each node
as root:
kubeadm join — token 17c6f2.bd9fa915e6a2fcfb 10.10.0.131:6443 — discovery-token-ca-cert-hash sha256:b4995d14fc8995d5ac271e49772b1cf5aa9fee48fa2729fd4ca7fefbbb0564ac
```

Run the following:

```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Deploy a pod network to the cluster. I used flannel, you can see your other options [here](https://kubernetes.io/docs/concepts/cluster-administration/addons/).

```
sudo sysctl net.bridge.bridge-nf-call-iptables=1
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

By default, pods cannot be scheuled on the master node. If you want to be able to schedule pods on the master, e.g. for a single-machine Kubernetes cluster for development, run:

```
kubectl taint nodes — all node-role.kubernetes.io/master-
```

As soon as the pod network has been installed, you can continue by joining your nodes.

To confirm that kube-dns pod is up run the command below and check the output:

```
murat@kubenode1:~$ kubectl get pods — all-namespaces
 NAMESPACE NAME READY STATUS RESTARTS AGE
 kube-system etcd-kubenode1 1/1 Running 0 1m
 kube-system kube-apiserver-kubenode1 1/1 Running 0 1m
 kube-system kube-controller-manager-kubenode1 1/1 Running 0 1m
 kube-system kube-dns-6448b967fc-bc58z 3/3 Running 0 1m
 kube-system kube-proxy-h7p6s 1/1 Running 0 1m
 kube-system kube-scheduler-kubenode1 1/1 Running 0 1m
 [/cce_bash]
```

Note: If kube-dns is stuck in the Pending state. Follow the steps below to fix it and re init your master. This issue and the solution was mentioned [here](https://github.com/kubernetes/kubernetes/issues/43815).

```
kubeadm reset
sudo nano /etc/systemd/system/kubelet.service.d/10-kubeadm.conf
```

Remove the `$KUBELET_NETWORK_ARGS` entry from the ExecStart, save the file, and reload systemd and kube services.

```
systemctl daemon-reload
systemctl restart kubelet.service
```

Initialize your master K8s node again.

## Join Kubernetes nodes to the cluster

You can now join any number of nodes by running the command with the token generated during the K8s master initialization:

```
murat@kubenode2:~$ kubeadm join — token 17c6f2.bd9fa915e6a2fcfb 10.10.0.131:6443 — discovery-token-ca-cert-hash sha256:b4995d14fc8995d5ac271e49772b1cf5aa9fee48fa2729fd4ca7fefbbb0564ac
 [preflight] Running pre-flight checks.
 [preflight] Some fatal errors occurred:
 [ERROR IsPrivilegedUser]: user is not running as root
 [preflight] If you know what you are doing, you can make a check non-fatal with ` — ignore-preflight-errors=…`
 murat@kubenode2:~$ sudo kubeadm join — token 17c6f2.bd9fa915e6a2fcfb 10.10.0.131:6443 — discovery-token-ca-cert-hash sha256:b4995d14fc8995d5ac271e49772b1cf5aa9fee48fa2729fd4ca7fefbbb0564ac
 [preflight] Running pre-flight checks.
 [WARNING SystemVerification]: docker version is greater than the most recently validated version. Docker version: 18.03.0-ce. Max validated version: 17.03
 [discovery] Trying to connect to API Server “10.10.0.131:6443”
 [discovery] Created cluster-info discovery client, requesting info from “https://10.10.0.131:6443"
 [discovery] Requesting info from “https://10.10.0.131:6443" again to validate TLS against the pinned public key
 [discovery] Cluster info signature and contents are valid and TLS certificate validates against pinned roots, will use API Server “10.10.0.131:6443”
 [discovery] Successfully established connection with API Server “10.10.0.131:6443”
This node has joined the cluster:
 * Certificate signing request was sent to master and a response
 was received.
 * The Kubelet was informed of the new secure connection details.
```

Run `kubectl get nodes` on the master to see this node join the cluster.

If you forgot the cluster token, you can generate a new one with the command:

```
kubeadm token generate
```

Repeat all the steps above on all your nodes.

## Install OpenEBS on ARM (Le Potato)

Similar to most of the arm based hobby boards, Le Potato doesn’t provide any additional redundancy. Even using a RAID protected external USB device wouldn’t give me protection against node failure unless it’s some form of a shared network storage. They are both way over my affordability requirement. All I need is a replicated block device, so my container can survive a node or USB device failures.

OpenEBS provides a great solution for modern x64 architecture but currently doesn’t have a build for [arm64](https://en.wikipedia.org/wiki/ARM_architecture#64/32-bit_architecture) (armv8) architecture. Therefore, I’ve opened an issue [here](https://github.com/openebs/openebs/issues/1295) and started working on it myself. I did successfully build OpenEBS images for arm64 architecture from the repo base on the 0.5.3 release and uploaded custom images to my personal docker registry [here](https://hub.docker.com/u/muratkarslioglu/). So, it is work in progress and please use it at your own risk, until it’s merged.

```
sudo apt-get install -y curl open-iscsi
kubectl apply -f https://raw.githubusercontent.com/muratkars/openebs/lepotato-arm64/k8s/openebs-operator-arm64.yaml
kubectl apply -f https://raw.githubusercontent.com/muratkars/openebs/lepotato-arm64/k8s/openebs-storageclasses.yaml
```

Now, get the list of storage classes using the below command:

```
$ kubectl get sc
 NAME PROVISIONER AGE
 openebs-cassandra openebs.io/provisioner-iscsi 1h
 openebs-es-data-sc openebs.io/provisioner-iscsi 1h
 openebs-jupyter openebs.io/provisioner-iscsi 1h
 openebs-kafka openebs.io/provisioner-iscsi 1h
 openebs-mongodb openebs.io/provisioner-iscsi 1h
 openebs-percona openebs.io/provisioner-iscsi 1h
 openebs-redis openebs.io/provisioner-iscsi 1h
 openebs-standalone openebs.io/provisioner-iscsi 1h
 openebs-standard openebs.io/provisioner-iscsi 4d
 openebs-zk openebs.io/provisioner-iscsi 1h
```

**Voila…!**

`openebs-standard` storage class creates 3 replicas. That’s what I will use for my application.

To test the OpenEBS installation you can try my Jenkins example here:

```
kubectl apply -f https://raw.githubusercontent.com/muratkars/openebs/lepotato-arm64/k8s/demo/jenkins/jenkins-arm64.yaml
```

## Next — Installing containerized OwnCloud on OpenEBS

Finding right container images to run on arm64 architecture is challenging. On the next article, I will build an OwnCloud container image running on Postgres database and both containers will store their data on OpenEBS persistent volumes.

My final goal is to build a mobile OwnCloud cluster installed in my family van, where storage is replicated to another cluster in my home lab.

Stay tuned!

---

_Originally published at _[_Containerized Me_](http://containerized.me/arming-kubernetes-with-openebs-1/)_._
