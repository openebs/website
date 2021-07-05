---
title: Install OpenEBS using StackPointCloud Trusted Charts?
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 07-01-2018
tags: Digital Ocean, Helm, Kubernetes, Solutions, StackPointCloud
excerpt: What is StackPointCloud Trusted Charts?
StackPointCloud (SPC) introduced a concept of Trusted Charts, a list of validated Helm Charts provided by its partners to quickly spin up a solution in a Kubernetes cluster. 
---

#### What is StackPointCloud Trusted Charts?

[StackPointCloud](https://stackpoint.io/) (SPC) introduced a concept of Trusted Charts, a list of validated [Helm](https://helm.sh/) Charts provided by its partners to quickly spin up a solution in a [Kubernetes](https://kubernetes.io/) cluster. Helm Charts helps you define, install, and upgrade even the most complex Kubernetes application.

Previously, I wrote about few different ways of getting OpenEBS up and running on different cloud vendors. Using Helm Chart is one of the available options to deploy OpenEBS. OpenEBS Helm Charts were available since v.5.0 both on [Github](https://github.com/openebs/openebs/tree/master/k8s/charts/openebs) and as a [packaged chart](https://openebs.github.io/charts/). Recently SPC included OpenEBS into their Trusted Charts repo and made it one-click easy for its customers.

SPC Trusted Charts currently offers 23 solutions including databases, CI/CD, monitoring, storage and ingress solutions. Here is the list of Trusted Charts:

### CI/CD

- [Jenkins](https://jenkins-ci.org/)
- [GitLab Runner](https://docs.gitlab.com/runner/)
- [Spinnaker](https://www.spinnaker.io/)

### Databases

- [CockroachDB](https://www.cockroachlabs.com/)
- [Crunchy PostgreSQL Operator](https://github.com/CrunchyData/postgres-operator)
- [Patroni](https://github.com/turbonomic/kubeturbo)
- [Redis](https://redis.io)
- [RethinkDB](https://www.rethinkdb.com/)
- [MongoDB Replica Set](https://docs.mongodb.com/manual/replication/)

### Ingress/Proxy/Load Balancer

- [Nginx Ingress](https://github.com/kubernetes/ingress-nginx)
- [Traefik](https://traefik.io/)

### Messaging

- [Kafka](https://kafka.apache.org/)
- [Rabbitmq](https://www.rabbitmq.com)

### Storage

- [OpenEBS](https://openebs.io/)
- [Minio](https://www.minio.io/)
- [Etcd-operator](https://github.com/kubernetes/charts/tree/master/stable/etcd-operator)

### Others

- [Grafana](https://grafana.com/)
- [Keel](https://keel.sh/)
- [Kube-lego](https://github.com/jetstack/kube-lego)
- [Kubeturbo](https://github.com/turbonomic/kubeturbo)
- [Memcached](https://memcached.org/)
- [Tensorflow Inception](https://github.com/tensorflow/models/tree/master/research/inception)

I’ll go through the quick steps of deploying OpenEBS.

### Prerequisites

Minimum requirements for deploying your Kubernetes clusters on StackPointCloud:

### Cloud Provider Account

- [Amazon Web Services (AWS)](https://aws.amazon.com/) or
- [DigitalOcean](https://www.digitalocean.com)

### Deploy a New Kubernetes Cluster

First, go to [stackpoint.io](https://stackpoint.io/) and click on **Launch a Cluster** button to start your free trial.

![Universal control plane for managed Kubernetes](https://cdn-images-1.medium.com/max/800/0*0cB3ttYmslFZgH1h.png)

Then choose your cloud provider. In this example, I will use **Digital Ocean**.

![Choose cloud provider](https://cdn-images-1.medium.com/max/800/0*21G24JgfuqlR6snZ.png)

### Configure Access to Digital Ocean

On the next screen, we need to configure our provider. You need to provide Digital Ocean API Token and optionally your SSH Key.

![Configure your provider](https://cdn-images-1.medium.com/max/800/0*wDcMg-_HTjIOFvgb.png)

Click on **Add API Token** button.

![Add API token](https://cdn-images-1.medium.com/max/800/0*53wGtQ7eUt18u6pS.png)

After you add your credentials, click on **Submit**.

### Configure K8s Cluster

On “Configure your cluster” page click the edit button on **Distribution** and choose **Ubuntu 16.04 LTS**.

![Configure your cluster](https://cdn-images-1.medium.com/max/800/0*NvtnryAA8GNi-fyN.png)

Change the **Cluster Name** something meaningful like **OpenEBS Demo**.

![Enter cluster name](https://cdn-images-1.medium.com/max/800/0*LTa6zBooJdTsyqss.png)

Leave everything else as default and click on **Submit**.

In about 10–15 minutes you will get your new cluster deployed.

### Adding OpenEBS to Your Kubernetes Cluster

First, make sure your cluster and all nodes are up.

On the **Control Plane** tab click on your recently created cluster.

![Control plane](https://cdn-images-1.medium.com/max/800/0*RHQ9LbyxydjHkJSk.png)

Once the Kubernetes cluster is up on Digital Ocean with functional Helm, scroll down to the **Solutions** tab and click on **Add Solution** button.

![Add Solution](https://cdn-images-1.medium.com/max/800/0*sH0lzv23vHonV5Zk.png)

Click on **Add Solutions**, and select **Trusted Charts**.

![Select charts](https://cdn-images-1.medium.com/max/800/0*V6iP5PzNAzFk4sME.png)

From the list above select **OpenEBS**.

![OpenEBS namespace](https://cdn-images-1.medium.com/max/800/0*CJkPrkJCS9Fp_GXu.png)

**Release Name** is randomly generated every time. If you want to use OpenEBS example workloads provided in OpenEBS repos without any modification then use `default` as **NameSpace**. Otherwise, you need to modify the namespace for workloads you deploy and make sure to use the same name.

Click on **Install** to deploy OpenEBS on your cluster.

**Note:** Default settings assume that RBAC is enabled. If you disabled RBAC while you are configuring your provider previously then set `rbacEnable: false` otherwise use default values.

State field should be green after OpenEBS is successfully added.

![OpenEBS successfully added](https://cdn-images-1.medium.com/max/800/0*HzCZp3Z5LbT3Hsrh.png)

Now your cluster is ready; you can run your workloads on `openebs-standard` and other predefined storage classes.

To confirm, click on **Kubernetes Dashboard**. This will bring up your Kubernetes Dashboard UI in a new window. You will find all predefined OpenEBS **Storage Classes** here under **Storage Classes** section.

![Kubernetes Storage Classes](https://cdn-images-1.medium.com/max/800/0*mNU-nhwvNy9UB0W5.png)

Now you are ready to deploy your stateful workloads.

Take a look at my previous articles on step-by-step instructions for deploying few popular stateful workloads such as [Cassandra](http://containerized.me/how-to-deploy-a-cassandra-cluster-ring-on-kubernetes-openebs/), [Jenkins](http://containerized.me/how-to-deploy-jenkins-on-kubernetes-openebs/), and [Postgres](http://containerized.me/how-to-deploy-a-postgresql-cluster-on-kubernetes-openebs/) on OpenEBS persistent storage.

---

_Originally published at _[_Containerized Me_](http://containerized.me/install-openebs-using-stackpointcloud-trusted-charts/)_._
