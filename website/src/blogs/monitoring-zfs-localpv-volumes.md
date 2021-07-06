---
title: Monitoring ZFS-LocalPV Volumes
author: Pawan Prakash Sharma
author_info: It's been an amazing experience in Software Engineering because of my love for coding. In my free time, I read books, play table tennis and watch tv series
date: 28-01-2020
tags: OpenEBS, LocalPV, ZFS
excerpt: In this post, we will focus on how we can set up the Prometheus alert for Provisioned volumes when space utilization has reached a critical point.
---

Before reading this post, please read my previous [post](https://blog.openebs.io/openebs-dynamic-volume-provisioning-on-zfs-d8670720181d?__hstc=216392137.7dc0753f698b104ea002a16b84268b54.1580207831486.1580207831486.1580207831486.1&amp;__hssc=216392137.1.1580207831487&amp;__hsfp=818904025) for instructions on setting up the ZFS-LocalPV for dynamically provisioning the volumes on the ZFS storage. Here, we will focus on how we can set up the Prometheus alert for Provisioned volumes when space utilization has reached a critical point.

### Prerequisite

Make sure you are using k8s version 1.15+ to access the CSI volume metrics.

### Setup helm

This step uses helm as the Kubernetes package manager. If you have not setup the helm, execute the below configuration. Otherwise, you can move on to the next step.

    $ helm version
    Client: &version.Version{SemVer:"v2.16.1", GitCommit:"bbdfe5e7803a12bbdf97e94cd847859890cf4050", GitTreeState:"clean"}
    Server: &version.Version{SemVer:"v2.16.1", GitCommit:"bbdfe5e7803a12bbdf97e94cd847859890cf4050", GitTreeState:"clean"}
    
    $ helm init
    Tiller (the Helm server-side component) has been installed into your Kubernetes Cluster.
    
    Please note: By default, Tiller is deployed with an insecure 'allow unauthenticated users' policy.
    To prevent this, run `helm init` with the --tiller-tls-verify flag.
    For more information on securing your installation see: (https://docs.helm.sh/using_helm/#securing-your-helm-installation)[https://docs.helm.sh/using_helm/#securing-your-helm-installation]
    
    $ kubectl create serviceaccount --namespace kube-system tiller
    serviceaccount/tiller created
    
    $ kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
    clusterrolebinding.rbac.authorization.k8s.io/tiller-cluster-rule created
    
    $ kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'
    deployment.extensions/tiller-deploy patched

### Install Prometheus Operator

Once the helm is ready and the related tiller pods are up and running, use the Prometheus chart from the helm repository.

    $ helm install stable/prometheus-operator --name prometheus-operator

Check all the required pods are up and running

    $ kubectl get pods -l "release=prometheus-operator"
    NAME                                                 READY   STATUS    RESTARTS   AGE
    prometheus-operator-grafana-85bb5d49d-bffdg          2/2     Running   0          2m21s
    prometheus-operator-operator-64844759f7-rpwws        2/2     Running   0          2m21s
    prometheus-operator-prometheus-node-exporter-p9rl8   1/1     Running   0          2m21s

### Set up the alert rule

Check all the rules available in the system:

    $ kubectl get PrometheusRule
    NAME                                                       AGE
    prometheus-operator-alertmanager.rules                     4m21s
    prometheus-operator-etcd                                   4m21s
    prometheus-operator-general.rules                          4m21s
    prometheus-operator-k8s.rules                              4m21s
    prometheus-operator-kube-apiserver-error                   4m21s
    prometheus-operator-kube-apiserver.rules                   4m21s
    prometheus-operator-kube-prometheus-node-recording.rules   4m21s
    prometheus-operator-kube-scheduler.rules                   4m21s
    prometheus-operator-kubernetes-absent                      4m21s
    prometheus-operator-kubernetes-apps                        4m21s
    prometheus-operator-kubernetes-resources                   4m21s
    prometheus-operator-kubernetes-storage                     4m21s
    prometheus-operator-kubernetes-system                      4m21s
    prometheus-operator-kubernetes-system-apiserver            4m21s
    prometheus-operator-kubernetes-system-controller-manager   4m21s
    prometheus-operator-kubernetes-system-kubelet              4m21s
    prometheus-operator-kubernetes-system-scheduler            4m21s
    prometheus-operator-node-exporter                          4m21s
    prometheus-operator-node-exporter.rules                    4m21s
    prometheus-operator-node-network                           4m21s
    prometheus-operator-node-time                              4m21s
    prometheus-operator-node.rules                             4m21s
    prometheus-operator-prometheus                             4m21s
    prometheus-operator-prometheus-operator                    4m21s

You can edit any of the default rules or create a new rule to get the alerts. Below is a sample rule to start generating alerts when available storage space is less than 10%.

    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      labels:
        app: prometheus-operator
        chart: prometheus-operator-8.5.4
        heritage: Tiller
        release: prometheus-operator
      name: prometheus-operator-zfs-alertmanager.rules
      namespace: default
    spec:
      groups:
      - name: zfsalertmanager.rules
        rules:
        - alert: ZFSVolumeUsageCritical
          annotations:
            message: The PersistentVolume claimed by {{ $labels.persistentvolumeclaim
              }} in Namespace {{ $labels.namespace }} is only {{ printf "%0.2f" $value
              }}% free.
          expr: |
            100 * kubelet_volume_stats_available_bytes{job="kubelet"}
              /
            kubelet_volume_stats_capacity_bytes{job="kubelet"}
              < 10
          for: 1m
          labels:
            severity: critical

Now apply the above YAML so that Prometheus can fire the alerts when available space is less than 10%.

### Check the Prometheus alert

To view the Prometheus web UI, you must expose it through a Service. A simple way to accomplish this is to use a Service of type NodePort.

    $ cat prometheus-service.yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: prometheus-service
    spec:
      type: NodePort
      ports:
      - name: web
        nodePort: 30090
        port: 9090
        protocol: TCP
        targetPort: web
      selector:
        prometheus: prometheus-operator-prometheus

Apply the above YAML

    $ kubectl apply -f prometheus-service.yaml
    service/prometheus-service created

Now you can access the alert manager UI via “node’s-external-ip:30090”.

    $ kubectl get nodes -owide
    NAME                                         STATUS   ROLES    AGE    VERSION          INTERNAL-IP   EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION   CONTAINER-RUNTIME
    gke-zfspv-pawan-default-pool-3e407350-xvzp   Ready    <none>   103m   v1.15.4-gke.22   10.168.0.45   34.94.3.140   Ubuntu 18.04.3 LTS   5.0.0-1022-gke   docker://19.3.2

Here, we can access the alert manager via URL: [http://34.94.3.140:30090/](http://34.94.3.140:30090/)

### Check the Alert Manager

To view the Alert Manager web UI, expose it through a Service of type NodePort.

    $ cat alertmanager-service.yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: alertmanager-service
    spec:
      type: NodePort
      ports:
      - name: web
        nodePort: 30093
        port: 9093
        protocol: TCP
        targetPort: web
      selector:
        alertmanager: prometheus-operator-alertmanager

Apply the above YAML

    $ kubectl apply -f alertmanager-service.yaml
    service/alertmanager-service created

Now you can access the alert manager UI via “node’s-external-ip:30093”.

    $ kubectl get nodes -owide
    NAME                                         STATUS   ROLES    AGE    VERSION          INTERNAL-IP   EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION   CONTAINER-RUNTIME
    gke-zfspv-pawan-default-pool-3e407350-xvzp   Ready    <none>   103m   v1.15.4-gke.22   10.168.0.45   34.94.3.140   Ubuntu 18.04.3 LTS   5.0.0-1022-gke   docker://19.3.2

Again, we can access the alert manager via URL: [http://34.94.3.140:30093/.](http://34.94.3.140:30093/)

I hope you found this post to be useful. Feel free to contact me with any feedback or questions by using the comment section below.

This blog was originally published on [Jan 22, 2020, on the MayaData blog](https://blog.mayadata.io/openebs/monitoring-zfs-localpv-volumes).
