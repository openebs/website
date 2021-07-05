---
title: Git freedom on Kubernetes
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 05-06-2018
tags: DevOps, Git, Gitlab, Kubernetes, OpenEBS
excerpt: Here is one of the fastest ways to get your private repository with Gitlab up and running on your Kubernetes environment — Let’s “Make DevOps lifecycle private again”
---

#### Steps to easily run GitLab

After Microsoft announced the acquisition of GitHub, many developers raised concerns on social media about Microsoft’s history of unsuccessfully running the acquired businesses like Skype, Nokia’s handset business, Navision and other 150 companies (you probably haven’t noticed) they have swallowed up over the years.

Other than keeping the developer’s life-support plugged, one of the biggest concerns is that MS would use its power on GitHub repositories to analyze trends among software development in order to launch competing products. Fears that GitHub privacy may be in jeopardy have already led many developers to jump off the ship or consider alternatives. GitLab’s publicly available [status graphs](https://t.co/svpWpI0Rb2) show spikes of 70x increase in imported repositories (average 100 vs 7.5K), a validation of increased user apprehension.

Here is one of the fastest way to get your private repository with Gitlab up and running on your Kubernetes environment — Let’s “**Make DevOps lifecycle private again**” ©

Currently, the easiest and recommended way to install GitLab on Kubernetes is using the [Gitlab-Omnibus](https://docs.gitlab.com/ee/install/kubernetes/gitlab_omnibus.html) Helm charts.

Gitlab-Omnibus deploys every feature a small deployment would require including the [Container Registry](https://docs.gitlab.com/ee/user/project/coThis year I have attended a number of tech events and in terms of size, organization, and especially the content — Next ’18 is so far my favorite.ntainer_registry.html#gitlab-container-registry), [load balancer (NGINX)](https://github.com/kubernetes/ingress/tree/master/controllers/nginx), [Mattermost](https://docs.gitlab.com/omnibus/gitlab-mattermost/), and [Runner](https://docs.gitlab.com/runner/).

#### **Prerequisites**

Minimum requirements for a multi-node cluster:

**Hardware**

- **Boot node:** 1x 1+ core(s) >= 2.4 GHz CPU, 4GB RAM, >=100 GB disk space
- **Master node:** 1 or 3x 2+ cores >= 2.4 GHz CPU, 4+GB RAM, >=151 GB disk space
- **Worker node:** 3x 2+ cores >= 2.4 GHz CPU, 4+GB RAM, >=100 GB disk space

Since I’m not planning to run anything heavy, I’ll be using 3 nodes, and will install Master, Proxy, and Workers an all 3.

**Software**

- [Ubuntu 16.04 LTS](https://www.ubuntu.com/download/server) (RHEL 7.x is also supported)
- Docker 1.12 to 17.03
- Kubernetes 1.7+ Cluster (You can use [IBM Cloud Private 2.1.0.2](http://containerized.me/how-to-install-openebs-on-ibm-cloud-private/) or [Red Hat OpenShift Origin](http://containerized.me/how-to-install-openebs-on-openshift/))
- [kubectl](https://github.com/kubernetes/kubectl)
- Helm client
- A [GitLab Omnibus](https://docs.gitlab.com/omnibus/) Pod, including Mattermost, Container Registry, and Prometheus
- An auto-scaling [GitLab Runner](https://docs.gitlab.com/runner/) using the Kubernetes executor
- [Redis](https://github.com/kubernetes/charts/tree/master/stable/redis)
- [PostgreSQL](https://github.com/kubernetes/charts/tree/master/stable/postgresql)
- [NGINX Ingress](https://github.com/kubernetes/charts/tree/master/stable/nginx-ingress)
- [OpenEBS](https://github.com/openebs/openebs) persistent volumes for Data, Registry, Postgres, and Redis

The Kubernetes instructions described below using Helm are generic and should work on all other platforms.

**Installing GitLab and OpenEBS using the Helm Chart**

GitLab depends on stateful applications like Redis and PostgeSQL, and requires persistent volumes for its data and the registry. Here, I will simplify the storage provisioning using OpenEBS.

First, install OpenEBS using the chart.

```
helm install — name ‘openebs-gitlab-test’ stable/openebs
```

Optional: If you would like to customize your OpenEBS installation you can also use a copy of the [value.yaml](https://raw.githubusercontent.com/kubernetes/charts/master/stable/openebs/values.yaml) file from the OpenEBS chart and modify parameters listed [here](https://github.com/kubernetes/charts/tree/master/stable/openebs).

```
helm install — name ‘openebs-gitlab-test’ -f values.yaml stable/openebs
```

Next, add the predefined storage classes.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-storageclasses.yaml
```

There are many ways to enable OpenEBS for use by GitLab. The fastest is by making one of the OpenEBS storage classes a default StorageClass:

List available OpenEBS storage classes in your cluster.

```
murat@icpnode1:~$ kubectl get sc
NAME PROVISIONER AGE
openebs-cassandra openebs.io/provisioner-iscsi 18d
openebs-es-data-sc openebs.io/provisioner-iscsi 18d
openebs-jupyter openebs.io/provisioner-iscsi 18d
openebs-kafka openebs.io/provisioner-iscsi 18d
openebs-mongodb openebs.io/provisioner-iscsi 18d
openebs-percona openebs.io/provisioner-iscsi 18d
openebs-redis openebs.io/provisioner-iscsi 18d
openebs-standalone openebs.io/provisioner-iscsi 18d
openebs-standard openebs.io/provisioner-iscsi 18d
openebs-zk openebs.io/provisioner-iscsi 18d
```

Either create your StorageClass or pick one of the predefined classes. _openebs-standard_ creates 3 replicas and is an ideal candidate here to be used for most of the stateful workloads. Let’s mark this StorageClass as default.

```
kubectl patch storageclass openebs-standard -p ‘{“metadata”: {“annotations”:{“storageclass.kubernetes.io/is-default-class”:”true”}}}’
```

No verify that your chosen StorageClass is indeed the **default**.

```
murat@icpnode1:~$ kubectl get sc
NAME PROVISIONER AGE
openebs-cassandra openebs.io/provisioner-iscsi 18d
openebs-es-data-sc openebs.io/provisioner-iscsi 18d
openebs-jupyter openebs.io/provisioner-iscsi 18d
openebs-kafka openebs.io/provisioner-iscsi 18d
openebs-mongodb openebs.io/provisioner-iscsi 18d
openebs-percona openebs.io/provisioner-iscsi 18d
openebs-redis openebs.io/provisioner-iscsi 18d
openebs-standalone openebs.io/provisioner-iscsi 18d
openebs-standard (default) openebs.io/provisioner-iscsi 18d
openebs-zk openebs.io/provisioner-iscsi 18d
```

Next, we can install the GitLab-ce chart. It is recommended to save your configuration options in a values.yaml file for future use.

```
wget https://raw.githubusercontent.com/kubernetes/charts/master/stable/gitlab-ce/values.yaml
```

Edit the _values.yaml_ file and at minimum, add the **externalUrl** field. Otherwise, you’ll end up with a non-functioning release.

Here is how my _values.yaml_ file looks like after these changes:

```
image: gitlab/gitlab-ce:9.4.1-ce.0
externalUrl: http://containerized.me/
serviceType: LoadBalancer
ingress:
annotations:
enabled: false
tls:
url: gitlab.cluster.local
sshPort: 22
httpPort: 80
httpsPort: 443
livenessPort: http
readinessPort: http
resources:
requests:
memory: 1Gi
cpu: 500m
limits:
memory: 2Gi
cpu: 1
persistence:
gitlabEtc:
enabled: true
size: 1Gi
storageClass: openebs-standard
accessMode: ReadWriteOnce
gitlabData:
enabled: true
size: 10Gi
storageClass: openebs-standard
accessMode: ReadWriteOnce
postgresql:
imageTag: “9.6”
cpu: 1000m
memory: 1Gi
postgresUser: gitlab
postgresPassword: gitlab
postgresDatabase: gitlab
persistence:
size: 10Gi
storageClass: openebs-standard
accessMode: ReadWriteOnce
redis:
redisPassword: “gitlab”
resources:
requests:
memory: 1Gi
persistence:
size: 10Gi
storageClass: openebs-standard
accessMode: ReadWriteOnce
```

Now, install the chart.

```
helm install — name gitlab-test -f values.yaml stable/gitlab-ce
```

List the pods and confirm that all pods are ready and running.

```
$ kubectl get pods
NAME READY STATUS RESTARTS AGE
gitlab-test-gitlab-ce-dd69cdf4b-69vmb 1/1 Running 0 11m
gitlab-test-postgresql-75bf9b667d-lwj2b 1/1 Running 0 11m
gitlab-test-redis-998998b59-hzztj 1/1 Running 0 11m
openebs-gitlab-test-apiserver-68fc4488fd-jf8gz 1/1 Running 0 1h
openebs-gitlab-test-provisioner-7dfdf646d8–9wpmg 1/1 Running 0 1h
pvc-cb0fc1b2–6904–11e8–9f57–06a0a9acf800-ctrl-74d4b59c9f-bjtg2 2/2 Running 0 11m
pvc-cb0fc1b2–6904–11e8–9f57–06a0a9acf800-rep-64f56667d-6ds26 1/1 Running 0 11m
pvc-cb0fc1b2–6904–11e8–9f57–06a0a9acf800-rep-64f56667d-99mbh 1/1 Running 0 11m
pvc-cb0fc1b2–6904–11e8–9f57–06a0a9acf800-rep-64f56667d-d8d4z 1/1 Running 0 11m
pvc-cb1064ee-6904–11e8–9f57–06a0a9acf800-ctrl-bd7cff65f-ph8dr 2/2 Running 0 11m
pvc-cb1064ee-6904–11e8–9f57–06a0a9acf800-rep-595dd9c997–2lm4x 1/1 Running 0 11m
pvc-cb1064ee-6904–11e8–9f57–06a0a9acf800-rep-595dd9c997-jldjs 1/1 Running 0 11m
pvc-cb1064ee-6904–11e8–9f57–06a0a9acf800-rep-595dd9c997-kzlrc 1/1 Running 0 11m
pvc-cb111261–6904–11e8–9f57–06a0a9acf800-ctrl-668f5988c5-hv8vb 2/2 Running 0 11m
pvc-cb111261–6904–11e8–9f57–06a0a9acf800-rep-74974f6644-hsn49 1/1 Running 0 11m
pvc-cb111261–6904–11e8–9f57–06a0a9acf800-rep-74974f6644-lj64g 1/1 Running 0 11m
pvc-cb111261–6904–11e8–9f57–06a0a9acf800-rep-74974f6644-z6kfd 1/1 Running 0 11m
pvc-cb11a791–6904–11e8–9f57–06a0a9acf800-ctrl-585cf7c97d-58pnq 2/2 Running 0 11m
pvc-cb11a791–6904–11e8–9f57–06a0a9acf800-rep-79d658d94c-5bzn6 1/1 Running 0 11m
pvc-cb11a791–6904–11e8–9f57–06a0a9acf800-rep-79d658d94c-9dz5f 1/1 Running 0 11m
pvc-cb11a791–6904–11e8–9f57–06a0a9acf800-rep-79d658d94c-snkfb 1/1 Running 0 11m
```

Get the list of persistent volumes.

```
$ kubectl get pv
NAME CAPACITY ACCESS MODES RECLAIM POLICY STATUS CLAIM STORAGECLASS REASON AGE
pvc-cb0fc1b2–6904–11e8–9f57–06a0a9acf800 10Gi RWO Delete Bound default/gitlab-test-postgresql openebs-standard 17m
pvc-cb1064ee-6904–11e8–9f57–06a0a9acf800 10Gi RWO Delete Bound default/gitlab-test-redis openebs-standard 17m
pvc-cb111261–6904–11e8–9f57–06a0a9acf800 10Gi RWO Delete Bound default/gitlab-test-gitlab-ce-data openebs-standard 17m
pvc-cb11a791–6904–11e8–9f57–06a0a9acf800 1Gi RWO Delete Bound default/gitlab-test-gitlab-ce-etc openebs-standard 17m
```

You can see above that four persistent volumes were created (**postgresql, redis, gitlab-ce-etc, gitlab-ce-data**), and each volume is protected by 3 replicas.

Now go to the external endpoint address you have defined and start using GitLab after you set your new password.

![](https://lh4.googleusercontent.com/9UnAe3ZuKt_weq1IbxOrgA_JQMpXE2ZCd80PgDxIodeUdFslr-wCt2DUjbWyoERYWa6RKht8JYvihV-_dQS0EYArc4dJhkPPtN0cGPNfYcDsiHgtjS7unCLOW9MTDre79AjZ660xm6IN94OPew)

Now click on **Create a project**, then import your existing project from GitHub and start using GitLab.

![](https://lh4.googleusercontent.com/CDe7SDXnBmCL5IGVTIOYATjzjZN2iMPsZaVBmuY3-l6qXFX8xReeU6M234eX0ELY1Pips6JfR1FJb4rzfL_d53KLDon0MrzBKqQvuBslQDboCw1yPehiKrSf771PMy79ckmPdLGWnhmijDFkVg)

![](https://lh6.googleusercontent.com/AFqy2l5MohpC1kCk5k2yFoZA90qJGabfUymqmMmI0kFqcpgqXnrapoYCs1dMfrFDqKj-37ncNvoCe7Kf8UfCQq6VRvmFMK742abC58ju6TiRSUk2yeq1OtMBZWPMd3pqyQWawBDgUcSpSZ8Djg)

---

Hopefully, this helps anyone who is motivated to reexamine their approach to Git to quickly and easily start running GitLab on Kubernetes. Thank you for reading, and please provide any feedback below or via Twitter — [**@**muratkarslioglu](https://twitter.com/muratkarslioglu)_Originally published at _[_Containerized Me_](http://containerized.me/git-freedom-on-kubernetes/)_._
