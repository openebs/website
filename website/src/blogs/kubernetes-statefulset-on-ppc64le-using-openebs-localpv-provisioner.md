---
title: Kubernetes StatefulSet on ppc64le using OpenEBS LocalPV provisioner
author: Peeyush Gupta
author_info: Peeyush, Sr. Developer Advocate, DigitalOcean, is a cloud enthusiast with 5+ years of experience in developing cloud platforms and helping customers migrate their legacy applications to the cloud.
date: 16-07-2020
tags: OpenEBS, Kubernetes, LocalPV
excerpt: In this blog, we'll explain how to install OpenEBS on Kubernetes StatefulSet running on the ppc64le platform & to using the OpenEBS LocalPV provisioner to deploy a StatefulSet.
---

Guest post by Peeyush Gupta, Sr. Developer Advocate, DigitalOcean

**OpenEBS** is the leading open-source project for container-attached and container-native storage on **Kubernetes**. OpenEBS adopts Container Attached Storage (CAS) approach, where each workload is provided with a dedicated storage controller. OpenEBS implements granular storage policies and isolation that enable users to optimize storage for each specific workload. OpenEBS runs in userspace and does not have any Linux kernel module dependencies. Here is how the setup looks like for OpenEBS LocalPV hostpath:
![Kubernetes StatefulSet on ppc64le using OpenEBS LocalPV provisioner](https://lh4.googleusercontent.com/-erccwTcJCmyJGswEZ3Pul1-pvJO-kvn34nr22mqYumR1IHUVhX8BWOeennt1u91EYUKtpUfAPBSiP1XD_1z6XYmG8Tlywvl9GellLpkr8EyYTFLXT3YpIZ_nneRcen_G8uKVV6Q)
In this tutorial, we will see how we can install OpenEBS on Kubernetes running on the ppc64le platform. Then we will use the OpenEBS LocalPV provisioner to deploy a StatefulSet. The ppc64le servers used in this tutorial are running on IBM Cloud.
Kubernetes support multi-arch platforms. You can deploy the cluster on ppc64le based servers using kubeadm. For this tutorial, I am using a 3 node cluster:

    root@openebs-k8s-server:~# kubectl  get nodes
    NAME                 STATUS   ROLES    AGE   VERSION
    openebs-k8s-server   Ready    master   17h   v1.18.5
    openebs-worker-1     Ready    <none>   17h   v1.18.5
    openebs-worker-2     Ready    <none>   17h   v1.18.5

We will be deploying OpenEBS lite on this cluster. Here is an excellent blog post on how to do that: [https://help.mayadata.io/hc/en-us/articles/360031969532-Installing-OpenEBS-with-only-Local-PV-support](https://help.mayadata.io/hc/en-us/articles/360031969532-Installing-OpenEBS-with-only-Local-PV-support). To get started, deploy the openebs-operator-lite.yaml file for ppc64le using:

    kubectl apply -f https://openebs.github.io/charts/openebs-operator-lite-ppc64le.yaml

Once deployed, you should be able to see the node-disk-manager and LocalPV components running. Note that node-disk-manager is not a mandatory component for provisioning LocalPV hostpath volumes. OpenEBS LocalPV provisioner can be installed and run standalone as well.

    root@openebs-k8s-server:~# kubectl  get pods --all-namespaces
    NAMESPACE     NAME                                           READY   STATUS    RESTARTS   AGE
    kube-system   coredns-66bff467f8-njjc9                       1/1     Running   0          17h
    kube-system   coredns-66bff467f8-tndsx                       1/1     Running   0          17h
    kube-system   etcd-openebs-k8s-server                        1/1     Running   0          17h
    kube-system   kube-apiserver-openebs-k8s-server              1/1     Running   0          17h
    kube-system   kube-controller-manager-openebs-k8s-server     1/1     Running   0          17h
    kube-system   kube-proxy-55fbj                               1/1     Running   0          17h
    kube-system   kube-proxy-gt5rw                               1/1     Running   0          17h
    kube-system   kube-proxy-l5pz2                               1/1     Running   0          17h
    kube-system   kube-scheduler-openebs-k8s-server              1/1     Running   0          17h
    kube-system   weave-net-c2gmk                                2/2     Running   1          17h
    kube-system   weave-net-qp5c7                                2/2     Running   0          17h
    kube-system   weave-net-trgr6                                2/2     Running   1          17h
    openebs       openebs-localpv-provisioner-7bb7dc9958-ln284   1/1     Running   0          16h
    openebs       openebs-ndm-kqhpr                              1/1     Running   0          16h
    openebs       openebs-ndm-nxswk                              1/1     Running   0          16h
    openebs       openebs-ndm-operator-746d6cd4fd-bm2fp          1/1     Running   1          16h

Next, we will deploy the storage class. This storage class will be used with PersistentVolumeClaim to create volumes.

    kubectl apply -f https://openebs.github.io/charts/openebs-lite-sc.yaml 

This will create 2 storage classes, openebs-device, and openebs-hostpath, on the cluster. 

    root@openebs-k8s-server:~/openebs-localpv# kubectl  get sc
    NAME               PROVISIONER        RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
    openebs-device     openebs.io/local   Delete          WaitForFirstConsumer   false                  6m12s
    openebs-hostpath   openebs.io/local   Delete          WaitForFirstConsumer   false                  6m12s

In our case, we are interested in the `openebs-hostpath` storage class for this tutorial. Now, we are ready to deploy the StatefulSet that will consume the volume created using the above storage class. Here is a sample StatefulSet:

    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: local-test
    spec:
      serviceName: "local-service"
      replicas: 1
      selector:
        matchLabels:
          app: local-test
      template:
        metadata:
          labels:
            app: local-test
        spec:
          containers:
          - name: test-container
            image: busybox
            command:
            - "/bin/sh"
            args:
            - "-c"
            - "sleep 100000"
            volumeMounts:
            - name: openebs-localpv-hostpath
              mountPath: /usr/test-pod
      volumeClaimTemplates:
      - metadata:
          name: openebs-localpv-hostpath
        spec:
          accessModes: [ "ReadWriteOnce" ]
          storageClassName: "openebs-hostpath"
          resources:
            requests:
              storage: 5G

The above YAML creates a StatefulSet named `local-test`, which has a container named `test-container`. This container has a volume mounted at path `/usr/test-pod`. The claim for this particular volume references the `openebs-hostpath` storage class. We will save this YAML using the name openebs-localpv-stateful.yaml, and this can be deployed using kubectl create:

    kubectl apply -f openebs-localpv-stateful.yaml

You can verify the respective pv and pvc:

    root@openebs-k8s-server:~/openebs-localpv# kubectl  get pvc
    NAME                                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
    openebs-localpv-hostpath-local-test-0   Bound    pvc-e61a4156-b0bb-4199-b991-9c42b1830ec5   5G         RWO            openebs-hostpath   17s
    root@openebs-k8s-server:~/openebs-localpv# kubectl  get pv
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                           STORAGECLASS       REASON   AGE
    pvc-e61a4156-b0bb-4199-b991-9c42b1830ec5   5G         RWO            Delete           Bound    default/openebs-localpv-hostpath-local-test-0   openebs-hostpath            18s

Once the volume is bound to the claim, the relevant pod i.e. local-test-0 comes up in running state:

    root@openebs-k8s-server:~/openebs-localpv# kubectl  get pods --all-namespaces
    NAMESPACE     NAME                                           READY   STATUS    RESTARTS   AGE
    default       local-test-0                                   1/1     Running   0          13s
    kube-system   coredns-66bff467f8-njjc9                       1/1     Running   0          21h
    kube-system   coredns-66bff467f8-tndsx                       1/1     Running   0          21h
    kube-system   etcd-openebs-k8s-server                        1/1     Running   0          21h
    kube-system   kube-apiserver-openebs-k8s-server              1/1     Running   0          21h
    kube-system   kube-controller-manager-openebs-k8s-server     1/1     Running   0          21h
    kube-system   kube-proxy-55fbj                               1/1     Running   0          21h
    kube-system   kube-proxy-gt5rw                               1/1     Running   0          21h
    kube-system   kube-proxy-l5pz2                               1/1     Running   0          21h
    kube-system   kube-scheduler-openebs-k8s-server              1/1     Running   0          21h
    kube-system   weave-net-c2gmk                                2/2     Running   1          21h
    kube-system   weave-net-qp5c7                                2/2     Running   0          21h
    kube-system   weave-net-trgr6                                2/2     Running   1          21h
    openebs       openebs-localpv-provisioner-6fc9664557-njvbg   1/1     Running   0          24m
    openebs       openebs-ndm-754qs                              1/1     Running   0          24m
    openebs       openebs-ndm-operator-798f74c6b9-24jvv          1/1     Running   0          24m
    openebs       openebs-ndm-x96ks                              1/1     Running   0          24m

If you describe the pvc, you can see the volume is being provisioned using openebs-localpv-provsioner:

    root@openebs-k8s-server:~/openebs-localpv# kubectl  describe pvc
    Name:          openebs-localpv-hostpath-local-test-0
    Namespace:     default
    StorageClass:  openebs-hostpath
    Status:        Bound
    Volume:        pvc-b89a1c70-beeb-4bdc-a555-348b01832443
    Labels:        app=local-test
    Annotations:   pv.kubernetes.io/bind-completed: yes
                   pv.kubernetes.io/bound-by-controller: yes
                   volume.beta.kubernetes.io/storage-provisioner: openebs.io/local
                   volume.kubernetes.io/selected-node: openebs-worker-1
    Finalizers:    [kubernetes.io/pvc-protection]
    Capacity:      5G
    Access Modes:  RWO
    VolumeMode:    Filesystem
    Mounted By:    local-test-0
    Events:
      Type    Reason                 Age                From                                                                                                Message
      ----    ------                 ----               ----                                                                                                -------
      Normal  WaitForFirstConsumer   13s                persistentvolume-controller                                                                         waiting for first consumer to be created before binding
      Normal  ExternalProvisioning   13s (x2 over 13s)  persistentvolume-controller                                                                         waiting for a volume to be created, either by external provisioner "openebs.io/local" or manually created by system administrator
      Normal  Provisioning           13s                openebs.io/local_openebs-localpv-provisioner-6fc9664557-njvbg_884920b8-e474-4635-9daf-8b4a8f113b10  External provisioner is provisioning volume for claim "default/openebs-localpv-hostpath-local-test-0"
      Normal  ProvisioningSucceeded  11s                openebs.io/local_openebs-localpv-provisioner-6fc9664557-njvbg_884920b8-e474-4635-9daf-8b4a8f113b10  Successfully provisioned volume pvc-b89a1c70-beeb-4bdc-a555-348b01832443

You can cleanup the whole setup using:

    kubectl delete -f openebs-localpv-stateful.yaml
    kubectl delete -f openebs-lite-sc.yaml
    kubectl delete -f openebs-operator-lite-ppc64le.yaml

### About the author:

Peeyush Gupta is a cloud enthusiast with 5+ years of experience in developing cloud platforms and helping customers migrate their legacy applications to the cloud. He has also been a speaker at multiple meetups and loves to contribute to open-source projects. He is currently working with DigitalOcean as Sr. Developer Advocate.
