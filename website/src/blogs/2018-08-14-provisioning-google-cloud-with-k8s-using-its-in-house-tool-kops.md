---
title: Provisioning Google Cloud with k8s using it’s in-house tool, KOPS
author: Harshvardhan Karn
author_info: Harshvardhan Karn works at MayaData Inc. He is a public speaker, has talked in few local meetups and at two major conferences. In his free time, he likes to play Guitar, Netflix.
date: 14-08-2018
tags: Docker, Kubernetes, OpenEBS, Kops
excerpt: Setting up and using a cluster in GCP offers a few significant advantages over using GKE. For instance, using GCP gives the user the liberty to use their custom binaries or a pure Open Source Kubernetes.
---

I am very excited for this post, as I have been working on this content for a few weeks. I might sound naive throughout this, mainly because I am, to be honest. Setting up and using a cluster in _GCP_ offers a few significant advantages over using _GKE_. For instance, using GCP gives the user the liberty to use their _custom binaries_ or a _pure Open Source Kubernetes_. Also, _GKE_ does not support modification or access to the master node, whereas a manually setup-ed k8s cluster over _VMs_ does.

To gain the full understanding of Kubernetes, some people like to get their hands dirty for a course of interval. Luckily, we have a few more tools to get a Kubernetes cluster up and running in VM instances of **Google Cloud**. I find that tools like _kubernetes-incubator/kubespray , crosscloudci/cross-cloud_ and kops, are not very straightforward to use, but _kops, kubespray_ is somewhat close. _Cross-cloud_ on the other hand, has poor documentation and is not very stable. _kops_ here stands for ‘_Kubernetes Operations._’ To be honest, I find this to be a good tool to deploy the Cluster over Google Cloud Platform (**GCP**) or Amazon Web Services (**AWS**). I certainly would not say it is the best, but this tool is documented to the extent that one can use it. The original idea of KOPS was to create user a production ready cluster in **AWS**. Allowing it to provision the GCP is luxury since GCP already provides with GKE and AWS does not.

### **Requirements**

These items are required to deploy the production-ready k8s cluster in GCP:

- **KOPS**

  ```
  wget -O kops
  https://github.com/kubernetes/kops/releases/download/$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)/kops-linux-amd64

  chmod +x ./kops

  sudo mv ./kops /usr/local/bin/
  ```

- **GCloud**

  [https://cloud.google.com/sdk/](https://cloud.google.com/sdk/)

  Once you are done installing GCloud SDK, you must run _gcloud init_. This will configure your gcloud with your existing GCP project.

- **kubectl**

  From the [Official Kubernetes kubectl release:](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

  ```
  wget -O kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl
  chmod +x ./kubectl
  sudo mv ./kubectl /usr/local/bin/kubectl
  ```

- A little patience …

## Let’s Begin!

A quick note: every time you create a cluster, it also creates a _Virtual Private Cloud_ (**VPC**), per se. Google Cloud allows you to create only a maximum of 5 VPC’s in one project, and a total of only 5 clusters. So, to resolve this problem, we can create a **VPC** explicitly and use it as a common Network for the rest of the clusters.

### Create a VPC

Here I am using subnet-mode as auto, and it will create a VPC _openebs-e2e_ with a subnet in every zone.

```
gcloud compute networks create openebs-e2e --project=openebs-ci --subnet-mode=auto
```

### Create a Bucket

Kops needs a State Store to hold the configuration of our cluster. In our case, it is Google Cloud Storage Buckets. So, let’s create one empty Bucket using the following:

```
gsutil mb gs://openebs-dev/
```

Now, since we are ready with the Bucket, we can populate it with our cluster’s State Store, i.e. Cluster object and InstanceGroup object.

**Create the Cluster & InstanceGroup Objects in Our State Store**

_kops create cluster_, creates the Cluster object and InstanceGroup object. Here, we’ll be working within kops.

```
PROJECT=`gcloud config get-value project`
export KOPS_FEATURE_FLAGS=AlphaAllowGCE # to unlock the GCE features
kops create cluster openebs-dev.k8s.local --zones us-central1-a
--state gs://openebs-dev/ --project=${PROJECT}
--kubernetes-version=1.11.1 --node-count 3
```

Now we can list the Cluster objects in our kops State Store (the GCS bucket we created):

```
kops get cluster --state gs://openebs-dev/
NAME                     CLOUD        ZONES
openebs-dev.k8s.local    gce          us-central1-a
```

**NB:** It is not necessary to use the same name for the Bucket and Cluster; you are free to use whatever name you wish.

### Create a Cluster

We are now ready with all of the changes and the cluster configuration, so we will proceed with the creation of the cluster. _kops create cluster_ created the Cluster object and the InstanceGroup object in our State Store, but it did not actually create any instances or other cloud objects in GCE. To do that, we’ll use _kops update cluster_.

_kops update cluster_ without _--yes_ will show us a preview of changes that will be made. It comes handy in case we want to see or verify the specs before creation.

```
kops update cluster openebs-dev.k8s.local --state gs://openebs-dev/ --yes
```

Cheers!

We have now deployed the Kubernetes cluster on GCP. If you go to the _Compute Engine_ in _Google Cloud Platform_, you will find 4 new nodes, where 1 is the master and the rest are worker nodes. Just to save your day, if you are wondering why you could not find your nascent cluster inside _Google Kubernetes Engine_, this is not a mistake or error because it is not a GKE Cluster. All GzCP knows is that there are 4 VMs running in the project, which we know is a K8s cluster.

## Out-of-the-Box

We are now ready with the cluster, but is it ready for the deployments? Once the kops is finished creating the cluster, we can validate its readiness using the following:

```
kops validate cluster --state gs://openebs-dev/


I0808 12:34:10.238009   25907 gce_cloud.go:273] Scanning zones: [us-central1-c us-central1-a us-central1-f us-central1-b]
INSTANCE GROUPS
NAME                 ROLE   MACHINETYPE    MIN MAX SUBNETS
master-us-central1-a Master n1-standard-1  1   1   us-central1
nodes                Node   n1-standard-2  3   3   us-central1
NODE STATUS
NAME                       ROLE   READY
master-us-central1-a-067f  master True
nodes-6rt6                 node   True
nodes-lvs5                 node   True
nodes-wbb8                 node   True
Your cluster openebs-dev.k8s.local is ready
```

If you find that the cluster not ready, wait for a few minutes as it takes some time to configure the cluster. You can even check using _kubectl_ from your control machine:

```
kubectl get nodes
```

You will see the node counts once your Cluster is up, viz. _kubelets_ are configured. If you are wondering how you got your _kubectl_ configured to this cluster, _kops_ does that for you. It exports a kubecfg file for a cluster from the state store to your _~/.kube/config_ local machine where you are running _kops_. If you want to export this config to some other path, you can the following:

```
kops export kubecfg openebs-dev.k8s.local
```

I wrote an Ansible playbook for [Litmus](https://github.com/openebs/litmus/), which is actually a wrapper for all of these to bring up the cluster on GCP. You can check it out here:

[https://github.com/openebs/litmus/tree/master/k8s/gcp/k8s-installer](https://github.com/openebs/litmus/tree/master/k8s/gcp/k8s-installer)

The playbook also checks the cluster availability implicitly using a python script. This will hold the playbook from termination until the cluster is ready to use. _kops validate_ works well, but **not** for **k8s version < 1.9,** up to the day of writing this post.

Godspeed!
