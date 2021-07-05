---
title: Using chaoskube with OpenEBS.
author: Sudarshan Darga
author_info: Senior Software Engineer at MayaData
date: 12-04-2018
tags: OpenEBS, Chaos Engineering, Kubernetes, Solutions
excerpt: Chaos Engineering is the discipline of proving the reliability of any system by causing “chaos”. The word ‘Chaos’ means the state of confusion or failure caused due to unexpected reason.
---

**Chaos Engineering** is the discipline of proving the reliability of any system by causing “chaos”. The word ‘Chaos’ means the state of confusion or failure caused due to unexpected reason.

### Failures can be caused due to:

- Power outages.
- Software bugs.
- Human Error.

### Since failure is unavoidable.

- Why not deliberately introduce failure to ensure the system can deal with the failure?
- Chaoskube is one such tool, which can be used to introduce pod failures on Kubernetes Cluster.

### Overview of Chaoskube:

- Chaoskube is an open source Chaos Testing tool.
- Written in GO language.
- Can induce pod/controller failures on K8s Cluster.
- Can kill pods by specifying the labels, namespaces.
- Simple and easy to run.

## Setup Chaoskube infrastructure on 3 node Kubernetes Cluster:

```
ubuntu@kubemaster-01:~$ kubectl get nodes
NAME            STATUS    ROLES     AGE       VERSION
kubemaster-01   Ready     master    2d        v1.8.8
kubeminion-01   Ready     <none>    2d        v1.8.8
kubeminion-02   Ready     <none>    2d        v1.8.8
kubeminion-03   Ready     <none>    2d        v1.8.8
ubuntu@kubemaster-01:~$ kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/e2e/ansible/playbooks/resiliency/test-ctrl-failure/chaoskube.yaml
deployment "chaoskube" created
serviceaccount "chaoskube" created
ubuntu@kubemaster-01:~$ kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/e2e/ansible/playbooks/resiliency/test-ctrl-failure/rbac.yaml
clusterrole "chaoskube" created
clusterrolebinding "chaoskube" created
ubuntu@kubemaster-01:~$ kubectl get pods
NAME                                   READY     STATUS    RESTARTS   AGE
chaoskube-55fc8f5f6d-tb6hj             1/1       Running   0          32s
maya-apiserver-69f9db69-b9qxk          1/1       Running   0          2d
openebs-provisioner-77cb47986c-w6wbz   1/1       Running   1          2d
```

## Deploy Percona application on OpenEBS volume with Liveness probe:

```
ubuntu@kubemaster-01:~$ kubectl apply -f https://raw.githubusercontent.com/openebs/elves/master/e2e/percona-liveness/percona.yaml
deployment "percona" created
persistentvolumeclaim "demo-vol1-claim" created
service "percona-mysql" created
ubuntu@kubemaster-01:~$ kubectl create configmap sqltest https://raw.githubusercontent.com/openebs/elves/master/e2e/percona-liveness/sql-test.sh
configmap "sqltest" created
ubuntu@kubemaster-01:~$ kubectl get pods
NAME                                                             READY     STATUS    RESTARTS   AGE
chaoskube-55fc8f5f6d-tb6hj                                       1/1       Running   0          6m
maya-apiserver-69f9db69-b9qxk                                    1/1       Running   0          2d
openebs-provisioner-77cb47986c-w6wbz                             1/1       Running   1          2d
percona-85b8997987-dg6jm                                         1/1       Running   0          1m
pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-ctrl-6fcb879bdb-vd8t5   2/2       Running   0          1m
pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-rep-5df559c66c-64rv5    1/1       Running   0          1m
pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-rep-5df559c66c-b5v25    1/1       Running   0          1m
pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-rep-5df559c66c-gs69w    1/1       Running   0          1m
```

## Induce controller failure using Chaoskube:

- Induce failure on pod with label ‘openebs/controller=jiva-controller’ for duration of 60 seconds with interval of 20 seconds, which means it will induce controller pod failure for every 20 seconds for 3 times.

  ```
  kubectl exec chaoskube-55fc8f5f6d-tb6hj -- timeout -t 60 chaoskube --labels 'openebs/controller=jiva-controller' --no-dry-run --interval=20s --debug
  ```

- Output should look something like this:

  ```
  time="2018-04-13T09:50:36Z" level=info msg="terminating pod" name=pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-ctrl-6fcb879bdb-vd8t5 namespace=default
  time="2018-04-13T09:50:36Z" level=debug msg=sleeping duration=20s
  ```

- Lets observe the failure induces by watching `kubectl get pods` for every 2 seconds.

  ```
  Every 2.0s: kubectl get pods Fri Apr 13 09:55:35 2018
  NAME READY STATUS RESTARTS AGE
  chaoskube-55fc8f5f6d-tb6hj 1/1 Running 0 16m
  maya-apiserver-69f9db69-b9qxk 1/1 Running 0 2d
  openebs-provisioner-77cb47986c-w6wbz 1/1 Running 1 2d
  percona-85b8997987-dg6jm 1/1 Running 7 12m
  pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-ctrl-6fcb879bdb-nh5fk 2/2 Running 0 15s
  pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-rep-5df559c66c-64rv5 1/1 Running 0 12m
  pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-rep-5df559c66c-b5v25 1/1 Running 0 12m
  pvc-0f07b9ae-3eff-11e8-8f7e-02b983f0a4db-rep-5df559c66c-gs69w 1/1 Running 0 12m
  ```

- Observe that percona application pod with liveness probe is still running after inducing openebs controller pod failure using chaoskube. Hence, the system is reliable after causing ‘Chaos’.

### Reference Links:

- [https://github.com/linki/chaoskube](https://github.com/linki/chaoskube)
- [https://docs.openebs.io/](https://docs.openebs.io/)
