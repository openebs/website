---
title: How to Install OpenEBS on AWS using StackPointCloud?
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
tags: Kubernetes, Solutions, StackPointCloud, Ubuntu, OpenEBS
date: 23-10-2017
excerpt: What is StackPointCloud? StackPointCloud is a managed Kubernetes control plane to build cloud-native stacks on AWS, Google Cloud (GKE & GCE), Azure & DigitalOcean. 
---

## What is StackPointCloud?

StackPointCloud is a managed Kubernetes control plane to build cloud-native stacks on AWS, Google Cloud (GKE & GCE), Azure & DigitalOcean. StackPointCloud simplifies installation and aggregation of multiple Kubernetes clusters pretty much on any platform. Even if you are an expert, provisioning your own Kubernetes stack their easy to use interface and capabilities to centralize all your deployments in one place is compelling. StackPointCloud is free for the first 30 days and $49.95 a month after for any number of Kubernetes clusters.

## Prerequisites

Minimum requirements for deploying your Kubernetes clusters on StackPointCloud:

### Hardware

- None

### Software

- [OpenEBS](https://github.com/openebs/openebs)

### Cloud Provider

- [Amazon Web Services (AWS)](https://aws.amazon.com/) account (Other major providers supported by StackPoint, but not covered in this article)

## Start your StackPoint Trial

First, go to [stackpoint.io](https://stackpoint.io/) and click on the **Launch a Cluster** button to start your free trial.

![Launch a Cluster button in stackpoint.io](https://cdn-images-1.medium.com/max/800/0*3Iro4mlPVlQolQfh.png)

Then choose your cloud provider. In this example, I will use **AWS**.

![Configure Access to AWS](https://cdn-images-1.medium.com/max/800/0*s0vkUYR7sJXoR6IU.png)

#### Configure Access to AWS

On the next screen, we need to configure our provider. You need to provide AWS Access Key ID and Secret Access Key and optionally your SSH Key.

![Cloud providers](https://cdn-images-1.medium.com/max/800/0*_2SUsICymTDtGlwK.png)

If you don’t know where to find them, follow the instructions [here](https://stackpointcloud.com/community/tutorial/how-to-create-auth-credentials-on-amazon-web-services-aws) to create your user.

Click on **Add Credentials** button.

![Add Credentials](https://cdn-images-1.medium.com/max/800/0*5LX2XDbBqhnm1au8.png)

After you add your credentials, click on **Submit**.

## Configure K8s Cluster

On the “Configure your cluster” page click the edit button on **Distribution** and choose **Ubuntu 16.04 LTS**.

![Configure K8s Cluster](https://cdn-images-1.medium.com/max/800/0*ty0IA_1uuDxaCQoX.png)

Change the **Cluster Name** something meaningful like **OpenEBS Demo**.

![Change the Cluster Name](https://cdn-images-1.medium.com/max/800/0*50cyzQI-2DZIX-AG.png)

I could separate my etcd into 3 nodes dedicated cluster, but for a functional demo hosting it on the same cluster works perfectly fine. You can leave all other options as default. Now click on **Submit** to create your cluster. This should take around 5–8 minutes to bring up one Master and two Workers Kubernetes Cluster.

## Import OpenEBS Helm Charts

Click on the **Solutions** tab on the top of the screen and select **Import Charts** from the upper left.

![Import OpenEBS Helm Charts](https://cdn-images-1.medium.com/max/800/0*vZr9hqN35SCCsx-a.png)

Add the chart repo with the following details:  
 — **name :** openebs-charts  
 — **type :** packaged-charts  
 — **repo url : **[https://openebs.github.io/charts/](https://openebs.github.io/charts/)

Click on **Review Repository**.

![Update chart repo](https://cdn-images-1.medium.com/max/800/0*lkT38CLmsESK2i1T.png)

Make sure **Access Verified** shows ok and click on the **Save Repository** button to finish adding chart repo.

![Save Repository](https://cdn-images-1.medium.com/max/800/0*tS9uArAROjoOLc05.png)

## Adding OpenEBS to Your Kubernetes Cluster

First, make sure your cluster and all nodes are up.

On the **Control Plane** tab click on your cluster name **OpenEBS Demo**.

![Control Plane tab](https://cdn-images-1.medium.com/max/800/0*0wxTlbbO_yPMJZ8F.png)

Once the Kubernetes cluster is up on AWS with functional Helm, click on the **Solutions** tab and **Add Solution** button.

![Solutions tab](https://cdn-images-1.medium.com/max/800/0*QofakUAHAb_DRYWp.png)

Add the solution with the following details:

– **namespace :** default  
– **values -> rbacEnabled :** false  

![Install OpenEBS into your cluster](https://cdn-images-1.medium.com/max/800/0*JiSAsRHf5SND0Cbp.png)

Click on **Install** to finally add OpenEBS into your cluster.

State field should be green after OpenEBS is successfully added.

![OpenEBS post install screenshot](https://cdn-images-1.medium.com/max/800/0*1nY357dtw3PNOfAi.png)

Now your cluster is ready; you can run your workloads on openebs-standard storage class.

To confirm, click on **K8s Dashboard**. This will bring up your Kubernetes Dashboard UI in a new window. You should be able to find the **openebs-standard** option under **Storage Classes**.

![ K8s Dashboard](https://cdn-images-1.medium.com/max/800/0*E5eYS81HcguHaG1r.png)

I’ll cover some workload examples such as MongoDB, Percona, Cassandra, and [Postgres](http://containerized.me/how-to-deploy-a-postgresql-cluster-on-kubernetes-openebs/) running OpenEBS on my next blogs (stay tuned).

---

*Originally published at [Containerized Me](http://containerized.me/how-to-install-openebs-on-aws-using-stackpointcloud/)*.
