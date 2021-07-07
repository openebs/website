---
title: How to deploy Jenkins on Kubernetes + OpenEBS
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 16-11-2017
tags: Jenkins, Kubernetes, Open Source, Solutions, OpenEBS
excerpt: Modern development requires Continuous Integration / Continuous Delivery (CI/CD) and it means building and validating your software on every commit to make sure your development & test environments are always up-to-date. 
---

Modern development requires [Continuous Integration](https://aws.amazon.com/devops/continuous-integration/) / [Continuous Delivery](https://aws.amazon.com/devops/continuous-delivery/) (**CI/CD**) and it means building and validating your software on every commit to make sure your development & test environments are always up-to-date. This level of automation is a combination of cultural philosophies (aka **DevOps**) and practices. CI/CD increases an organization’s ability to deliver applications and services at high velocity. Jenkins serves as the **workflow engine** to manage this **CI/CD pipeline** from source to delivery.

Deploying Jenkins on Kubernetes provides the following benefits:

- Isolates different jobs from one another
- Quickly clean a job’s workspace
- Dynamically deploy or schedule jobs with Kubernetes pods
- Allows increased resource utilization and efficiency
- Dynamically scale up Jenkins slaves on demand

Especially, running dynamic slaves in a Kubernetes/Docker environment and automating the scaling of Jenkins slaves running in Kubernetes on top of OpenEBS can **minimize the deployment time and cost**. With OpenEBS, you can build extremely scalable test cycles. You will be able to create instant snapshots (thanks to the [**CoW**](https://en.wikipedia.org/wiki/Copy-on-write)) from the master and **deploy new slaves faster and dynamically on-demand**. This process will eliminate the need to perform container-to-container copies.

In Jenkins, slaves are optional. OpenEBS can also help when you have a smaller environment and running a **monolithic master**. In that model, state on the master would be lost when you shut down the Jenkins master service. When using monolithic master on OpenEBS, your volume is persistent and replicated over to n nodes *(defined in your OpenEBS storage class)*. In that case, the master can exit, even if your node fails it can start on other nodes, migrate from private to public cloud, vice-versa when needed and your data will follow you.

Let’s deploy Jenkins on our existing K8s cluster with OpenEBS. You will notice that it’s not much different than deploying on local storage, except your data will be protected with OpenEBS.

## Prerequisites

### Software

- [Docker](https://docs.docker.com/engine/installation/) installed
- Kubernetes 1.7.3+ RBAC enabled cluster
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) installed
- [OpenEBS](https://github.com/openebs/openebs) installed

### Cloud Provider

- [Amazon Web Services (AWS)](https://aws.amazon.com/) account

## Deploy Jenkins Pod with Persistent Storage

Once you have OpenEBS storage classes created on your K8s cluster, you can use the following simple steps to launch Jenkins service with a monolithic master.

Before getting started, check the status of the cluster using the following command.

    kubectl get nodes

In my environment, I have one master and two worker nodes.

    ubuntu@ip-172–23–1–115:~$ kubectl get nodes
    NAME STATUS ROLES AGE VERSION
    ip-172–23–1–115.us-west-2.compute.internal Ready master 2h v1.8.3
    ip-172–23–1–144.us-west-2.compute.internal Ready <none> 2h v1.8.3
    ip-172–23–1–244.us-west-2.compute.internal Ready <none> 2h v1.8.3

Download the `Jenkins.yml` file to your host, which has access to kubectl.

    wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/jenkins/jenkins.yml

This file looks like below. You can edit and specify a different OpenEBS storage class before you apply.

    kind: PersistentVolumeClaim
     apiVersion: v1
     metadata:
     name: jenkins-claim
     annotations:
     volume.beta.kubernetes.io/storage-class: openebs-standard
     spec:
     accessModes:
     — ReadWriteOnce
     resources:
     requests:
     storage: 5G
     — -
     apiVersion: extensions/v1beta1
     kind: Deployment
     metadata:
     name: jenkins
     spec:
     replicas: 1
     template:
     metadata:
     labels:
     app: jenkins-app
     spec:
     securityContext:
     fsGroup: 1000
     containers:
     — name: jenkins
     imagePullPolicy: IfNotPresent
     image: jenkins/jenkins:lts
     ports:
     — containerPort: 8080
     volumeMounts:
     — mountPath: /var/jenkins_home
     name: jenkins-home
     volumes:
     — name: jenkins-home
     persistentVolumeClaim:
     claimName: jenkins-claim
     — -
     apiVersion: v1
     kind: Service
     metadata:
     name: jenkins-svc
     spec:
     ports:
     — port: 80
     targetPort: 8080
     selector:
     app: jenkins-app
     type: NodePort

Now apply `jenkins.yml` file.

    kubectl apply -f jenkins.yml

![results](/images/blog/results.png)

Get the status of running pods using the following command.

    kubectl get pods

Result should like similar to below, and the Jenkins pod running.

    ubuntu@ip-172–23–1–115:~$ kubectl get pods
     NAME READY STATUS RESTARTS AGE
     jenkins-797b888448-pfx8x 1/1 Running 0 11m
     maya-apiserver-5994b58bbb-ck2tv 1/1 Running 0 2h
     openebs-provisioner-6f45dcf459-qjdlx 1/1 Running 0 2h
     pvc-94586807-cb09–11e7-b125–064dff6dc2a2-ctrl-864fcb6f74–2phfw 1/1 Running 0 11m
     pvc-94586807-cb09–11e7-b125–064dff6dc2a2-rep-575d85d96c-dk4dq 1/1 Running 0 11m
     pvc-94586807-cb09–11e7-b125–064dff6dc2a2-rep-575d85d96c-pzrgn 1/1 Running 0 11m

As you noticed, your OpenEBS controller `pvc-…-ctrl-…` and two copies of persistent volumes `pvc-…-rep-…` are also deployed and running.

Get the status of underlying persistent volumes used by Jenkins deployment using the following command.

    kubectl get pvc

Example output below:

    ubuntu@ip-172–23–1–115:~$ kubectl get pvc
     NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE
     jenkins-claim Bound pvc-94586807-cb09–11e7-b125–064dff6dc2a2 5G RWO openebs-standard 22m

Get the status of Jenkins service using the following command:

    kubectl get svc

Example output below:

    ubuntu@ip-172–23–1–115:~$ kubectl get svc
    NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
    jenkins-svc NodePort 10.3.0.17 <none> 80:31705/TCP 25m
    kubernetes ClusterIP 10.3.0.1 <none> 443/TCP 3h
    maya-apiserver-service ClusterIP 10.3.0.34 <none> 5656/TCP 3h
    pvc-94586807-cb09–11e7-b125–064dff6dc2a2-ctrl-svc ClusterIP 10.3.0.100 <none> 3260/TCP,9501/TCP 25m

### Launching Jenkins

The Jenkins deployment YAML file `jenkins.yaml` we have used above creates a NodePort service type to make Jenkins available outside the cluster.

Get the node IP Address that is running the Jenkins pod using the following command.

Note: Replace your pod name with your the pod name returned when you ran `kubectl get pods` command.

    kubectl describe pod jenkins-797b888448-pfx8x | grep Node:

Example output below:

    kubectl describe pod jenkins-797b888448-pfx8x | grep Node:
     Node: ip-172–23–1–144.us-west-2.compute.internal/172.23.1.144

Get the port number from the Jenkins service using the following command:

    kubectl describe svc jenkins-svc | grep NodePort:

Example output below:

    ubuntu@ip-172–23–1–115:~$ kubectl describe svc jenkins-svc | grep NodePort:
     NodePort: <unset> 31705/TCP

IP above is your private IP on AWS, which can be used if you are accessing through another instance on AWS. To access it remotely, you also need to open that port on E2C instance’s security group.

Go to the Network & Security -> Security Group settings in the left hand navigation
Find the **Security Group** that your instance is a part of. Click on **Inbound Rules**. Click on **Edit** and **Add Rule** button. Then add HTTP (port 31705). Click **Save**.

Now, combine your public IP and port number and open that in your browser. In my case, it is [https://34.223.235.50:31705.](https://34.223.235.50:31705.)

Once you access the URL the Getting Started page is displayed. Follow the procedure below to setup Jenkins.

Provide the [cci]initialAdminPassword[/cci] in the Unlock Jenkins screen and copy the password in the [cci]Administrator password[/cci] field. Click **Continue**.

![unclock jenkins](/images/blog/unlock-jenkins.png)

Get the password using the following command:

    kubectl exec -it jenkins-797b888448-pfx8x cat /var/jenkins_home/secrets/initialAdminPassword

Example output below:

    ubuntu@ip-172–23–1–115:~$ kubectl exec -it jenkins-797b888448-pfx8x cat /var/jenkins_home/secrets/initialAdminPassword
     5aa044d226d1466eb84621e75e369c64

On the **Customize Jenkins** screen click on **Install suggested plugins**.

![customize jenkins](/images/blog/customize-jenkins.png)

Configure the Administrator user in the **Create First Admin User** screen. Fill in the following fields.

**Username:** — Key in the administrator username.
**Password:** — Key in the password for the administrator.
**Confirm password:** — Key in the password again and confirm.
**Full name:** — Key in the administrator’s full name.

Click **Continue as admin** if you want to perform further administrator tasks or click **Save and Finish**.
 You can now start using Jenkins!

![jenkins-is-ready](/images/blog/jenkins-is-ready.png)


_Originally published at [*Containerized Me*](http://containerized.me/how-to-deploy-jenkins-on-kubernetes-openebs/)_.
