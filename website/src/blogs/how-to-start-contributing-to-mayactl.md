---
title: How to start contributing to mayactl
author: Sumit Lalwani
author_info: Sumit Lalwani is a Software Engineer at Mayadata. He is a Kubernetes enthusiast and passionate about open source, containers, cloud, and arm. He loves to learn and code.
date: 14-08-2018
tags: Docker, OpenEBS, Kubernetes
excerpt: mayactl is the command line tool for interacting with OpenEBS volumes. mayactl is not used/required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting.
---

## What is mayactl?

- mayactl is the command line tool for interacting with OpenEBS volumes. mayactl is not used/required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting.
- mayactl is the client like kubectl which requests to maya-apiserver to get specific information whereas kubectl requests to Kubernetes apiserver to get specific information.
- mayactl helps retrieve storage related information for debugging/troubleshooting storage related issues. mayactl provides various commands to create volume, get volume details and create, list and revert snapshot and many more.

To know more about the mayactl visit:

[https://docs.openebs.io/docs/next/mayactl.html](https://docs.openebs.io/docs/next/mayactl.html)

## OpenEBS Architecture

![OpenEBS Architecture](/images/blog/openebs-architecture.png)

To know about the OpenEBS visit: [https://docs.openebs.io/docs/next/introduction.html](https://docs.openebs.io/docs/next/introduction.html)

### These few things are required to be installed in your system (with Ubuntu host) to run mayactl

1. **Docker**

- To install docker run these commands

  ```
  sudo apt-get update
  sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
  sudo apt-get update
  sudo apt-get install docker.io
  ```

- Or you can visit the official docker website to install docker

[https://docs.openebs.io/docs/next/mayactl.html](https://docs.openebs.io/docs/next/mayactl.html)

2. **open-iscsi package**

- To install open-iscsi package run these commands

  ```
  sudo apt-get update
  sudo apt-get install open-iscsi
  sudo service open-iscsi restart
  ```

3. **Golang**

- To install golang, visit the official golang website: [https://golang.org/doc/install](https://golang.org/doc/install)

4. **minikube**.

- To install minikube, run these commands:

  ```
  # minikube requires virtualbox to be installed as a dependency

  sudo apt-get install virtualbox virtualbox-ext-pack
  sudo apt-get update

  # minikube version 0.24.0

  curl -Lo minikube https://storage.googleapis.com/minikube/releases/v0.24.0/minikube-linux-amd64 && chmod +x minikube && sudo mv minikube /usr/local/bin/
  ```

5. **Kubectl**.

- Run these commands to install Kubectl:

  ```
  curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/linux/amd64/kubectl
  chmod +x ./kubectl
  sudo mv ./kubectl /usr/local/bin/kubectl
  ```

### How do I run mayactl in a local machine for development purposes?

1. Open the openebs repo ( [https://github.com/openebs/openebs](https://github.com/openebs/openebs)) and star the openebs repo.. 😄 (Not Mandatory)

2. Fork the openebs/openebs and openebs/maya repositories into your GitHub account.

- Visit and click on the fork option (both repositories)

[a) openebs/openebs](https://github.com/openebs/openebs)

[OpenEBS is containerized block storage written in Go for cloud native and other environments w/ per container (or pod)…](https://github.com/openebs/openebs)[github.com](https://github.com/openebs/openebs)

[b) openebs/maya](https://github.com/openebs/maya)

[maya — OpenEBS Maya extends Kubernetes capabilities to orchestrate CAS containers.](https://github.com/openebs/maya)[github.com](https://github.com/openebs/maya)

3. Clone the openebs and maya repositories inside your gopath. Then run these commands to clone:

```
# if directories not present create the directories in same hierarchy

cd $GOPATH/src/github.com/openebs
git clone https://github.com/<your-github-username>/openebs.git
git clone https://github.com/<your-github-username>/maya.git
```

4. Run the single node cluster using the minikube command.

```
minikube start --vm-driver=none

# To check whether minikube is configured and running

minikube status
```

5. Install OpenEBS by executing these commands:

```
cd $GOPATH/src/github.com/openebs/openebs/k8s/
kubectl apply -f openebs-operator.yaml
kubectl apply -f openebs-storageclasses.yaml
```

![kubernetes commands](/images/blog/install-openebs-by-commands.png)

6. Now we have the openebs-provisioner and maya-apiserver running as a pod in the Kubernetes (minikube) cluster.

- To get the pods, run this command:

  ```
  kubectl get pods
  NAME READY STATUS RESTARTS AGE
  maya-apiserver-7b8d5496cc-kgmnn 1/1 Running 0 3m
  openebs-provisioner-6797d44769-phnnc 1/1 Running 2 3m
  ```

7. To run/access mayactl, you will need to login/execute into the maya-apiserver pod on Kubernetes.

- Find out the name of the maya api-server pod by running the following commands:

  ```
  kubectl get pods

  # It will access the bash shell inside the pod

  kubectl exec -it <maya-apiserver-podname> /bin/bash
  ```

8. Now you can run all mayactl commands as you are inside the maya-apiserver pod.

- Try running these commands after exececute/login into the pod.

  ```
  mayactl -help
  ```

Go through the issues ([https://github.com/openebs/maya/issues](https://github.com/openebs/maya/issues)) and start modifying the mayactl code, located in $GOPATH/src/github.com/openebs/maya/cmd/mayactl, and start contributing to OpenEBS. Also, you can start contributing by writing a small unit test code in mayactl. For every PR you raise, you will also receive goodies from the OpenEBS team. 😃

**How do I test the changes made in mayactl?**

1. After modifying the mayactl code, go into the maya directory, i.e $GOPATH/src/github.com/openebs/maya, and run these commands:

```
# run this if not currently in maya directory

cd $GOPATH/src/github.com/openebs/maya

# this will create the mayactl binary into the bin folder inside maya directory

make mayactl
```

2. After the build has been completed, copy the mayactl binary from the bin folder to the maya-apiserver pod using the command:

```
kubectl cp $GOPATH/src/github.com/openebs/maya/bin/maya/mayactl <maya-apiserver-podname>:/tmp/
```

3. Login/execute into the maya-apiserver pod to run the mayactl binary.

```
kubectl exec -it <maya-apiserver-podname> /bin/bash
cd /tmp/
```

4. Here the mayactl binary you copied is shown.

- To run that binary, use the following command:

  ```
  ./mayactl -help
  ```

Now you can easily see the changes you made in the mayactl command line tool. You are also now ready to raise the PR’s. 😃

**Reference:**

- [https://www.youtube.com/watch?v=yzMEYT-yzRU](https://www.youtube.com/watch?v=yzMEYT-yzRU)
- [https://docs.openebs.io/docs/next/introduction.html](https://docs.openebs.io/docs/next/introduction.html?__hstc=216392137.2d2e61b1b8f85b3675bfaef604437f8a.1580205967521.1580205967521.1580205967521.1&__hssc=216392137.1.1580205967522&__hsfp=2262740235)
