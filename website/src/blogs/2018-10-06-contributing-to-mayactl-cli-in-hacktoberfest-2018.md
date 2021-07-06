---
title: Contributing to mayactl cli in Hacktoberfest 2018
author: Ashish Ranjan
author_info: An enthusiastic person when it comes to software & computers. I don't mind getting out of my comfort zone when things related to computing need to be done at the spur of the moment.
date: 05-10-2018
tags: OpenEBS, Minikube, Hacktoberfest, Ubuntu, Kubernetes
excerpt: Hacktoberfest is an excellent platform for first-time, open-source hackers to start their journey. mayactl is a tool that allows for contribution at any level.
---

Hacktoberfest is an excellent platform for first-time, open-source hackers to start their journey. mayactl is a tool that allows for contribution at any level. Users can find easy fixes or find features with medium complexity that take anywhere from one to three weeks for those who are new to OpenEBS.

mayactl is a command line tool designed for configuring/debugging OpenEBS. It helps with the status of various resources related to OpenEBS on a given Kubernetes cluster. For those who want to contribute to these type of features, this blog post will help you get started with mayactl. We will cover:

- How to set up the development environment of OpenEBS
- Tips on hacking mayactl
- How to test the changes before you send a PR

Pre-requisites:

- Beginner knowledge of Kubernetes
- Basic knowledge of GO Language
- Basic understanding of how OpenEBS functions. You can get started with OpenEBS [docs](https://docs.openebs.io/?__hstc=216392137.a9b75e72cb4b227999b631a7d9fb75d2.1579850476359.1579850476359.1579850476359.1&amp;__hssc=216392137.1.1579850476359&amp;__hsfp=3765904294) and the OpenEBS [white paper](https://www.openebs.io/assets/docs/WP-OpenEBS-0_7.pdf?__hstc=216392137.a9b75e72cb4b227999b631a7d9fb75d2.1579850476359.1579850476359.1579850476359.1&amp;__hssc=216392137.1.1579850476359&amp;__hsfp=3765904294)

## Setting up the Development Environment for mayactl

So, let’s start with the setup for the development environment of mayactl.

Some pre-requisites for this:

1. Any Linux system (Ubuntu recommended). For installing Ubuntu 18.04, you can follow this great article [here](https://linuxconfig.org/how-to-install-ubuntu-18-04-bionic-beaver).
2. Golang. A very good article regarding this is available [here](https://linuxconfig.org/install-go-on-ubuntu-18-04-bionic-beaver-linux).
3. Git. As with Ubuntu, the git tool comes preinstalled, but if it is missing, you can install it by sudo apt install git.
4. Docker. Docker can be easily installed on Ubuntu by following the commands given below:

    sudo apt-get update
    sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
    sudo apt-get update
    sudo apt-get install docker.io

5. Open-iscsi. For installing open-iscsi on Ubuntu, use the below commands.

    sudo apt-get update
    sudo apt-get install open-iscsi
    sudo service open-iscsi restart

6. Kubectl. For installing kubectl on Ubuntu, you can visit this [link](https://kubernetes.io/docs/tasks/tools/install-kubectl/).

7. Minikube. Install the latest version of minikube from [here](https://github.com/kubernetes/minikube/releases).

## Cloning and making maya resources ready 

Once you have completed the previous steps, it’s time to [fork](https://guides.github.com/activities/forking/) and [clone](https://help.github.com/articles/cloning-a-repository/) the [openebs/maya](https://github.com/openebs/maya) repo in your system. The repo should be cloned in following path `$GOPATH/src/github.com/openebs/`.

    mkdir -p $GOPATH/src/github.com/src/openebs
    cd $GOPATH/src/github.com/src/openebs
    git clone https://github.com/<your username>/maya.git

These commands will clone maya into your local system.

Once successful, go into the maya project directory using cd maya, and run the make command in the terminal. This will build all the images of the openebs component and other important binaries, along with mayactl.

Once the command is complete, we will be ready with the mayactl binaries and other maya for testing. You can verify this by running docker images.

If the output is similar to the code above, then you are good to go.

## Minikube Setup for Running a Single-Node Cluster

What is Minikube?

Minikube is a tool that enables users to run Kubernetes locally. Minikube runs a single-node Kubernetes cluster inside a VM on your local system (Learn [more](https://kubernetes.io/docs/setup/minikube/)).

To spin up a kubernetes cluster with minikube, you can use the following command:

    sudo minikube start --vm-driver none

You can verify your cluster by using the kubectl command that was previously installed. Running kubectl get nodes should generate an output similar to the one given below.

    NAME STATUS ROLES AGE VERSIONminikube Ready master 26m v1.10.0

## Setting up OpenEBS on Minikube

Once the Kubernetes cluster is ready, it’s time to install OpenEBS. Installing OpenEBS on Kubernetes is very easy; just apply the openebs-operator to the cluster using the following command:

    kubectl appy -fhttps://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-operator.yaml.

Applying the openebs-operator creates OpenEBS resources in Kubernetes. We can obtain the openebs-related resources in the OpenEBS namespace, and we can verify it by typing the following command:

    ashishranjan738@Ashish-PC:~$ kubectl get pods -n openebs
    
    NAME READY STATUS RESTARTS AGE
    
    cstor-sparse-pool-ni3o-8485bf44cd-fndj6 2/2 Running 0 5m
    
    maya-apiserver-674c77bb4c-dhnw5 1/1 Running 0 6m
    
    openebs-ndm-rd7hf 1/1 Running 0 6m
    
    openebs-provisioner-6d6c9ccf75-s57j8 1/1 Running 2 6m
    
    openebs-snapshot-operator-5cdd4ddc46-c2qj5 2/2 Running 0 6m

## Obtaining Access to mayactl

Once all of the pods are in the Running state, and once the maya-apiserver pod is in the Running state, we can access the mayactl binary by accessing the maya-apiserver pod’s shell. We can gain access to mayactl by using the following command:

    kubectl exec -it <maya-api server pod name> -n openebs

(e.g the pod name in my case is `maya-apiserver-674c77bb4c-dhnw5`). This will open the pod’s terminal over your system terminal. Typing `mayactl version` should produce something similar to this:

    bash-4.3# mayactl version
    
    Version: 0.7.0-unreleased
    
    Git commit: 0fa41c79dde0f6378056093d62494cd2fbb1eea4
    
    GO Version: go1.11
    
    GO ARCH: amd64
    
    GO OS: linux
    
    m-apiserver url:  http://172.17.0.5:5656
    
    m-apiserver status: running
    
    Provider: KUBERNETES
    
    You can explore the current features of mayactl using the mayactl -help.command. Now we will look at where you can find the mayactl source code for hacking and how you can test the mayactl binary.

## Exploring mayactl Code

The source code of mayactl can be found in cmd/mayactl in the maya [repository](https://github.com/openebs/maya/tree/master/cmd/mayactl). mayactl uses [cobra](https://github.com/spf13/cobra) cli framework for its implementation, so knowledge of this will be very helpful when starting with [good-first issues](https://github.com/openebs/openebs/labels/good%20first%20issue).

## Building the mayactl Binary

After playing with the code, it’s time to compile the code to binary and test it against the maya-apiserver. For building the mayactl binary, you can use the make mayactl command. This will trigger the build process, and the newly-built binary can found in `bin/maya` under the maya directory that you have cloned. This will generate an output of ls -ltr `bin/maya/` -ltr :

## Copying the mayactl Binary to a maya-apiserver Pod

Once we are ready with the binary, we can run a test by copying it to the maya-apiserver pod’s `/tmp` folder. For copying the binary, run the following command:

    kubectl cp bin/maya/mayactl <maya-apiserver pod name>:/tmp -n openebs.

This will copy your mayactl binary to the maya-apiserver pod.

## Testing the mayactl Binary

In order to test the mayactl binary, again get into the pod's shell using
kubectl exec -it <maya-api server pod name> -n openebs. Then access the tmp directory using cd `/tmp`. You can run your new mayactl binary by prefixing the `./` before mayactl using `./mayactl` version.

## A Bash Shortcut for the Above Process

Hmm…, so that much work is required just to test my small code change?

Don’t worry, here is a shortcut that you can use to build and copy the mayactl binary to a maya-apiserver pod:

    make mayactl && kubectl cp bin/maya/mayactl `kubectl get pods -n openebs | grep maya-apiserver | awk {'print $1'}`:/tmp -n openebs && kubectl exec -it `kubectl get pods -n openebs | grep maya-apiserver | awk {'print $1'}` bash -n openebs

Running the above command will build the mayactl binary and copy to the maya-apiserver pod under `/tmp` directory.

## Raising a PR

Once finished with the hacking, you can raise the PR to the maya repo. Before raising, however, it’s a good idea to have a look at the [contributer’s guideline](https://github.com/openebs/openebs/blob/master/CONTRIBUTING.md). Also, don’t forget to [sign](https://github.com/probot/dco/blob/master/README.md) your commit.

## Joining the Slack Channel

You can reach us for any queries/announcements on our [hacktoberfest2018](https://openebs-community.slack.com/?redir=%2Fmessages%2Fhacktoberfest2018%2F) Slack channel.

## Hacking begins…

So, what are you waiting for? Start your hacking now by picking some issues from [here](https://github.com/openebs/openebs/issues)! Contribution to the *hack-fest* can get you a chance to get into the *OpenEBS contributor's list* and a chance to win some exciting goodies.

## Helpful References

[Weekly Contributor’s Meet videos](https://www.youtube.com/watch?v=y-7mwbdVgwk&amp;list=PLMvwgr-vV2NVdgQsU6sfFZXPMuiQGi4Hh)
