---
title: OpenEBS on DigitalOcean Marketplace
author: Abhishek
author_info: Abhishek is a Customer Success Engineer at Mayadata. He is currently working with Kubernetes and Docker.
tags: openebs,chaosengineering,tutorials
date: 3-12-2020
excerpt: Learn how to deploy OpenEBS on the DigitalOcean marketplace
--- 

Deploying OpenEBS on DigitalOcean can directly be done from the console. DigitalOcean provides the feature to create a cluster with OpenEBS deployed on it already. To get started, follow the below-mentioned steps:

WORKFLOW:

STEP 1: Getting started
Login to your [DigitalOcean](https://cloud.digitalocean.com/login) account.

STEP 2: Creation of cluster
Once you log in, you arrive at the dashboard, click on Marketplace under DISCOVER located on the left sidebar.

Next, scroll down to find OpenEBS. On clicking, you will be redirected to a page where you will find the details about OpenEBS and the Create OpenEBS button on the right side.

Next, you need to provide the necessary details such as Data Center region, cluster capacity, cluster name, etc. (It is advisable to provision 3 nodes with 4vCPUs and 8 GB memory to ensure that the resources are sufficient at all times.)

STEP 3: Connecting your cluster
Creation, resizing, and deletion can be carried out from UI, but you require command-line tools from your local machine or a remote management server to perform administrative tasks. The detailed steps to install the management tools and connect the cluster to your local machine can be found under the Overview section.

To verify, execute the following command:

```$ kubectl get ns```

Output:
```
NAME     STATUS    AGE
default  Active    13m
openebs  Active    13m
```
The output must contain openebs ns in an Active state.

Next, execute:

```$ kubectl get pods -n openebs```

Output:
```
NAME                                                 READY     STATUS    RESTARTS AGE
openebs-admission-server-5c4d545647-r4vgr            1/1       Running   0        13m
openebs-apiserver-56f77c9965-xft68                   1/1       Running   2        13m
openebs-localpv-provisioner-64c67b5b89-czv8b         1/1       Running   0        13m
openebs-ndm-5f6nt                                    1/1       Running   0        13m
openebs-ndm-74njq                                    1/1       Running   0        13m
openebs-ndm-operator-7bc769dcff-b45bc                1/1       Running   1        13m
openebs-ndm-spttv                                    1/1       Running   0        13m
openebs-provisioner-755f465f9d-fr67l                 1/1       Running   0        13m
openebs-snapshot-operator-7988fc8646-zpd98           2/2       Running   0        13m
```
All the pods must be in a running state.

STEP 4: Attaching BlockDevices
To attach BlockDevices to the created nodes, click on Volumes on the left sidebar and then click on the Add Volume button.

Next, select the volume size ( provision at least 30 GB), select the node(droplet) to which it gets attached and provides a name, then click on the Create Volume button. Repeat these steps for each node (droplet).

NOTE:

*For cStor, choose Manually Mount and Format under Choose Configuration Options.*

*For Jiva, choose Automatically Format and Mount under Choose Configuration Options.*

*After the BlockDevices get attached for all the nodes, you can see an output similar to the below image.*

Next, you have to provision OpenEBS volumes.  Click [here](https://docs.openebs.io/docs/next/ugcstor.html#provisioning-a-cStor-volume) to know more.