---
title: Setting up WordPress and SQL with OpenEBS
author: Ashish Ranjan
author_info: An enthusiastic person when it comes to software & computers. I don't mind getting out of my comfort zone when things related to computing need to be done at the spur of the moment.
date: 14-08-2018
tags: OpenEBS, Kubernetes, Cloud Native Storage, Open Source, State Department
excerpt: Wordpress is a well-known blogging platform. New bloggers are often surprised when they find out how easy it is to get set up and start their first piece in this popular tool.
---

[Wordpress](https://en.wikipedia.org/wiki/WordPress) is a well-known blogging platform. New bloggers are often surprised when they find out how easy it is to get set up and start their first piece in this popular tool. In this blog, we will show how to deploy WordPress and MySQL on OpenEBS in their Kubernetes cluster.

## What is OpenEBS?

OpenEBS offers containerized persistent block storage using Docker containers. Those blocks are often referred to as Virtual Storage Machines (similar to K8s pods). OpenEBS seamlessly provides scalable storage volumes and manages them effortlessly. For more information, you can visit [https://openebs.io/join-our-slack-community](https://openebs.io/join-our-slack-community?__hstc=216392137.b7acacf689e0cc4579eea008f86d0c72.1579857743065.1579857743065.1579857743065.1&__hssc=216392137.1.1579857743066&__hsfp=3765904294).

### Prerequisites:

- A k8s cluster with at least one minion.
- Basic knowledge of writing services, deployment in k8s.
- Kubectl, already configured.
- A code editor for writing a yamls.
- Brains.

Let’s get started!

## Setting up OpenEBS

Before starting with WordPress, we need to set up OpenEBS. For this article, I will be using OpenEBS v0.6 (you are free to use newer versions if you wish).

When setting up OpenEBS, you need to apply the following yamls:

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml
```

The first yaml is for the openebs-operator, and the second one is for openebs-storage-classes. For more information look [here](https://docs.openebs.io/?__hstc=216392137.b7acacf689e0cc4579eea008f86d0c72.1579857743065.1579857743065.1579857743065.1&__hssc=216392137.1.1579857743066&__hsfp=3765904294). After applying the above yamls, the output of kubectl get pods — all-namespaces will look like this:

```
$ kubectl get pods --all-namespaces
NAMESPACE NAME READY STATUS RESTARTS AGE
kube-system event-exporter-v0.2.1-5f5b89fcc8-bhv7r 2/2 Running 0 16m
kube-system fluentd-gcp-scaler-7c5db745fc-tb2zw 1/1 Running 0 16m
kube-system fluentd-gcp-v3.0.0-wqgzx 2/2 Running 0 14m
kube-system heapster-v1.5.3-77c6fcd568-q8txc 3/3 Running 0 15m
kube-system kube-dns-788979dc8f-4lgsf 4/4 Running 0 16m
kube-system kube-dns-autoscaler-79b4b844b9-jldbr 1/1 Running 0 16m
kube-system kube-proxy-gke-ashish-ranjan-default-pool-b3a38b91-cv5d 1/1 Running 0 16m
kube-system l7-default-backend-5d5b9874d5-hvrgb 1/1 Running 0 16m
kube-system metrics-server-v0.2.1-7486f5bd67-hls82 2/2 Running 0 15m
openebs maya-apiserver-68c98fdb76-vbslv 1/1 Running 0 1m
openebs openebs-provisioner-5569654c96-hmhb5 1/1 Running 0 1m
openebs openebs-snapshot-operator-5f7c4d9bd8-7fnfv 2/2 Running 0 1m
```

Wait until all openebs namespaced pods move into a running state. Once this is completed, we’ll start by creating a secret for sql.

## Creating a Secret

```
kubectl create secret generic mysql-pass --from-literal=password=w0rdPres5
```

Run the above kubectl command to create a mysql password.

## Wordpress Deployment

Now, let's start writing the WordPress deployment yaml. Copy and save the above into a Wordpress.yaml file and execute a kubectl apply on it. Once this is done, the output of kubectl get pods,svc,pvc — all-namespaces will look similar to this:

```
$ kubectl get pods,svc,pvc --all-namespaces
NAMESPACE NAME READY STATUS RESTARTS AGE
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-ctrl-766678794-jtltg 2/2 Running 0 2m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-rep-6689868cf4-2pkt4 1/1 Running 0 2m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-rep-6689868cf4-htdxh 1/1 Running 0 2m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-rep-6689868cf4-rdtlk 1/1 Running 0 2m
default pod/wordpress-7bdfd5557c-5b4nh 1/1 Running 2 2m
kube-system pod/event-exporter-v0.2.1-5f5b89fcc8-wprbm 2/2 Running 0 8m
kube-system pod/fluentd-gcp-scaler-7c5db745fc-s9mp9 1/1 Running 0 8m
kube-system pod/fluentd-gcp-v3.0.0-49vq6 2/2 Running 0 5m
kube-system pod/fluentd-gcp-v3.0.0-kfjsx 2/2 Running 0 5m
kube-system pod/fluentd-gcp-v3.0.0-tg5hh 2/2 Running 0 5m
kube-system pod/heapster-v1.5.3-76f7f5f544-z7xk9 3/3 Running 0 6m
kube-system pod/kube-dns-788979dc8f-2chf4 4/4 Running 0 8m
kube-system pod/kube-dns-788979dc8f-ls4ln 4/4 Running 0 7m
kube-system pod/kube-dns-autoscaler-79b4b844b9-8745z 1/1 Running 0 8m
kube-system pod/kube-proxy-gke-ashish-ranjan-default-pool-f0958e58-8866 1/1 Running 0 7m
kube-system pod/kube-proxy-gke-ashish-ranjan-default-pool-f0958e58-8fh5 1/1 Running 0 7m
kube-system pod/kube-proxy-gke-ashish-ranjan-default-pool-f0958e58-9jjf 1/1 Running 0 8m
kube-system pod/l7-default-backend-5d5b9874d5-k9mn8 1/1 Running 0 8m
kube-system pod/metrics-server-v0.2.1-7486f5bd67-wlnlg 2/2 Running 0 6m
openebs pod/maya-apiserver-68c98fdb76-5bt2z 1/1 Running 0 4m
openebs pod/openebs-provisioner-5569654c96-4n4hp 1/1 Running 0 4m
openebs pod/openebs-snapshot-operator-5f7c4d9bd8-shk58 2/2 Running 0 4m
NAMESPACE NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
default service/kubernetes ClusterIP 10.55.240.1 <none> 443/TCP 8m
default service/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-ctrl-svc ClusterIP 10.55.253.18 <none> 3260/TCP,9501/TCP 2m
default service/wordpress LoadBalancer 10.55.253.170 104.154.224.12 80:31392/TCP 2m
kube-system service/default-http-backend NodePort 10.55.243.156 <none> 80:30045/TCP 8m
kube-system service/heapster ClusterIP 10.55.248.200 <none> 80/TCP 8m
kube-system service/kube-dns ClusterIP 10.55.240.10 <none> 53/UDP,53/TCP 8m
kube-system service/metrics-server ClusterIP 10.55.244.66 <none> 443/TCP 8m
openebs service/maya-apiserver-service ClusterIP 10.55.240.121 <none> 5656/TCP 4m
NAMESPACE NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE
default persistentvolumeclaim/wp-pv-claim Bound pvc-7030ae5f-9d40-11e8-afcb-42010a800179 20Gi RWO openebs-standard 2m
```

## MySql deployment

Follow the same procedure as done for WordPress deployment and execute a kubectl apply on it. The output of kubectl get pods,svc ,pvc — all-namespaces will look similar to this:

```
$ kubectl get pods,svc,pvc --all-namespaces
NAMESPACE NAME READY STATUS RESTARTS AGE
default pod/pvc-082a54c8-9d41-11e8-afcb-42010a800179-ctrl-b5c4f588f-lrl2l 2/2 Running 0 2m
default pod/pvc-082a54c8-9d41-11e8-afcb-42010a800179-rep-66d7f6fb46-2jcgx 1/1 Running 0 2m
default pod/pvc-082a54c8-9d41-11e8-afcb-42010a800179-rep-66d7f6fb46-j5tsk 1/1 Running 0 2m
default pod/pvc-082a54c8-9d41-11e8-afcb-42010a800179-rep-66d7f6fb46-q9kww 1/1 Running 0 2m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-ctrl-766678794-jtltg 2/2 Running 0 6m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-rep-6689868cf4-2pkt4 1/1 Running 0 6m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-rep-6689868cf4-htdxh 1/1 Running 0 6m
default pod/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-rep-6689868cf4-rdtlk 1/1 Running 0 6m
default pod/wordpress-7bdfd5557c-5b4nh 1/1 Running 4 6m
default pod/wordpress-mysql-bcc89f687-zlt5q 1/1 Running 0 2m
kube-system pod/event-exporter-v0.2.1-5f5b89fcc8-wprbm 2/2 Running 0 11m
kube-system pod/fluentd-gcp-scaler-7c5db745fc-s9mp9 1/1 Running 0 11m
kube-system pod/fluentd-gcp-v3.0.0-49vq6 2/2 Running 0 9m
kube-system pod/fluentd-gcp-v3.0.0-kfjsx 2/2 Running 0 9m
kube-system pod/fluentd-gcp-v3.0.0-tg5hh 2/2 Running 0 9m
kube-system pod/heapster-v1.5.3-76f7f5f544-z7xk9 3/3 Running 0 10m
kube-system pod/kube-dns-788979dc8f-2chf4 4/4 Running 0 11m
kube-system pod/kube-dns-788979dc8f-ls4ln 4/4 Running 0 10m
kube-system pod/kube-dns-autoscaler-79b4b844b9-8745z 1/1 Running 0 11m
kube-system pod/kube-proxy-gke-ashish-ranjan-default-pool-f0958e58-8866 1/1 Running 0 11m
kube-system pod/kube-proxy-gke-ashish-ranjan-default-pool-f0958e58-8fh5 1/1 Running 0 11m
kube-system pod/kube-proxy-gke-ashish-ranjan-default-pool-f0958e58-9jjf 1/1 Running 0 11m
kube-system pod/l7-default-backend-5d5b9874d5-k9mn8 1/1 Running 0 11m
kube-system pod/metrics-server-v0.2.1-7486f5bd67-wlnlg 2/2 Running 0 10m
openebs pod/maya-apiserver-68c98fdb76-5bt2z 1/1 Running 0 7m
openebs pod/openebs-provisioner-5569654c96-4n4hp 1/1 Running 0 7m
openebs pod/openebs-snapshot-operator-5f7c4d9bd8-shk58 2/2 Running 0 7m
NAMESPACE NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
default service/kubernetes ClusterIP 10.55.240.1 <none> 443/TCP 12m
default service/pvc-082a54c8-9d41-11e8-afcb-42010a800179-ctrl-svc ClusterIP 10.55.251.84 <none> 3260/TCP,9501/TCP 2m
default service/pvc-7030ae5f-9d40-11e8-afcb-42010a800179-ctrl-svc ClusterIP 10.55.253.18 <none> 3260/TCP,9501/TCP 6m
default service/wordpress LoadBalancer 10.55.253.170 104.154.224.12 80:31392/TCP 6m
default service/wordpress-mysql ClusterIP None <none> 3306/TCP 2m
kube-system service/default-http-backend NodePort 10.55.243.156 <none> 80:30045/TCP 11m
kube-system service/heapster ClusterIP 10.55.248.200 <none> 80/TCP 11m
kube-system service/kube-dns ClusterIP 10.55.240.10 <none> 53/UDP,53/TCP 11m
kube-system service/metrics-server ClusterIP 10.55.244.66 <none> 443/TCP 11m
openebs service/maya-apiserver-service ClusterIP 10.55.240.121 <none> 5656/TCP 7m
NAMESPACE NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE
default persistentvolumeclaim/mysql-pv-claim Bound pvc-082a54c8-9d41-11e8-afcb-42010a800179 20Gi RWO openebs-standard 2m
default persistentvolumeclaim/wp-pv-claim Bound pvc-7030ae5f-9d40-11e8-afcb-42010a800179 20Gi RWO openebs-standard 6m
```

If all of the pods are running, check the external IP of the WordPress load balancer. For example, in my case it is **104.154.224.12**. Open the your web browser IP if you are redirected to your WordPress setup page. Congratulations! Your WordPress is now ready for you to start your blog!

Happy blogging!

### Proof:

![wordpress](/images/blog/wordpress.png)
