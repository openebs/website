---
title: How do I run a litmus test to compare storage performance on Kubernetes
author: Karthik Satchitanand
author_info: Karthik has been into the Design and Development of tools for infrastructure as code, software testing performance & benchmarking & chaos engineering.
date: 16-07-2018
tags: Benchmarking, Kubernetes, Litmus, OpenEBS, Solutions, Chaos Engineering
excerpt: Ever so often, developers and devops engineers building or managing stateful applications on Kubernetes are on the lookout for for suitable storage options which serves their application’s specific needs.
not_has_feature_image: true
---

This article belongs to a #HowDoI series on Kubernetes and Litmus

Ever so often, developers and devops engineers building or managing stateful applications on Kubernetes are on the lookout for for suitable storage options which serves their application’s specific needs. The emphasis could be on high-availability, provisioning ease, performance etc.., **Litmus** (as detailed in this [article](https://blog.openebs.io/litmus-release-a-chaos-monkey-on-your-kubernetes-stateful-workloads-6345e01b637d)), is an attempt to arm them with the necessary info to make the right choice. One of the important storage tests is to simulate application workloads or multiply its effect using synthetic workload generators like fio. In this article, we list the steps to run a fio-based benchmark test using litmus

![Evaluating storage performance w/ Litmus](https://cdn-images-1.medium.com/max/800/1*zRIZ9WjL7S0wq6Sp_IbzCw.png)

## PRE-REQUISITES

- At least a single-node Kubernetes cluster with the necessary disk resources, mounted on the node. (**_Note_**: _Certain storage solutions need minimum Kubernetes versions from which they are supported. For ex: Local PVs are beta from 1.10, OpenEBS needs 1.7.5+_)
- Storage operator installed (typically, this includes control-plane elements like the static/dynamic provisioners, storage classes and other elements) with appropriate references to the node & disk resources (**_For example_**: _This may involve storage pool creation OR updating disk and node details in the static provisioners etc.,_)

## STEP-1: Setup Litmus essentials on the Kubernetes cluster

- Obtain the Litmus Git repository via a Git Clone operation on the Kubernetes master/Control machine used to manage cluster & set up the Litmus namespace, service account & clusterrolebinding by applying _rbac.yaml_

```
karthik_s@cloudshell:~ (strong-eon-153112)$ git clone https://github.com/openebs/litmus.git

Cloning into 'litmus'...

remote: Counting objects: 2627, done.

remote: Compressing objects: 100% (16/16), done.

remote: Total 2627 (delta 2), reused 9 (delta 2), pack-reused 2609

Receiving objects: 100% (2627/2627), 10.50 MiB | 4.23 MiB/s, done.

Resolving deltas: 100% (740/740), done.

karthik_s@cloudshell:~ (strong-eon-153112)$ cd litmus/

karthik_s@cloudshell:~/litmus (strong-eon-153112)$ kubectl apply -f hack/rbac.yaml

namespace "litmus" created

serviceaccount "litmus" created

clusterrole "litmus" created

clusterrolebinding "litmus" created
```

- Create a configmap resource out of the cluster’s config file, typically at _~/.kube/config_, _/etc/kubernetes/admin.conf_ or elsewhere depending on the type of cluster or setup method

(**Note**: _Copy the config file to admin.conf before creating the configmap out of it, as the litmus job expects this path_)

```
karthik_s@cloudshell:~ (strong-eon-153112)$ kubectl create configmap kubeconfig --from-file=admin.conf -n litmus

configmap "kubeconfig" created
```

## STEP-2: Update the Litmus test job as per need

The litmus fio test job allows the developer to specify certain test parameters via ENV variables, such as the following:

- The litmus fio test job allows the developer to specify the storage provider (PROVIDER_STORAGE_CLASS) and the node on which to schedule the application. (APP_NODE_SELECTOR)
- The desired fio profile can also be specified. Currently, litmus supports simple [test-templates](https://github.com/ksatchit/litmus/tree/fio_test/tools/fio/templates), and is expected to grow to include multiple standard profiles. (FIO_TEST_PROFILE)
- Certain simple test parameters such as the size of the test file (FIO_SAMPLE_SIZE) and duration of I/O (FIO_TESTRUN_PERIOD) can be specified as well, while the core I/O params continue to be housed in the templates.
- The developer can choose to specify a comma-separated list of pods whose logs need to be collected for analysis of results, as well as the logs’ location on the host in the spec for the logger.

```
karthik_s@cloudshell:~ (strong-eon-153112)$ cd litmus/tests/fio/

karthik_s@cloudshell:~/litmus/tests/fio (strong-eon-153112)$ cat run_litmus_test.yaml

***

apiVersion: batch/v1

kind: Job

metadata:

name: litmus

namespace: litmus

spec:

template:

      metadata:

        name: litmus

      spec:

        serviceAccountName: litmus

        restartPolicy: Never

        containers:

        - name: ansibletest

          image: openebs/ansible-runner

          env:

            - name: ANSIBLE_STDOUT_CALLBACK

              value: log_plays


            - name: PROVIDER_STORAGE_CLASS

              value: openebs-standard



            - name: APP_NODE_SELECTOR

              value: kubeminion-01


            - name: FIO_TEST_PROFILE

              value: standard-ssd


            - name: FIO_SAMPLE_SIZE

              value: "128m"


            - name: FIO_TESTRUN_PERIOD

              value: "60"


          command: ["/bin/bash"]

          args: ["-c", "ansible-playbook ./fio/test.yaml -i /etc/ansible/hosts -v; exit 0"]

          volumeMounts:

            - name: logs

              mountPath: /var/log/ansible

          tty: true

        - name: logger

          image: openebs/logger

          command: ["/bin/bash"]

          args: ["-c", "./logger.sh -d 10 -r fio,openebs; exit 0"]

          volumeMounts:

            - name: kubeconfig

              mountPath: /root/admin.conf

              subPath: admin.conf

            - name: logs

              mountPath: /mnt

          tty: true

        volumes:

          - name: kubeconfig

            configMap:

              name: kubeconfig

          - name: logs

            hostPath:

              path: /mnt

              type: Directory
```

## STEP 3: Run the Litmus fio test job.

The job creates the Litmus test pod, which contains both the test runner as well as the (stern-based) logger sidecar. The test runner then launches an fio test job that uses a persistent volume (PV) based on the specified storage class.

```
karthik_s@cloudshell:~/litmus/tests/fio (strong-eon-153112)$ kubectl apply -f run_litmus_test.yaml

job "litmus" created
```

## STEP 4: View the fio run results.

The results can be obtained from the log directory on the node in which the litmus pod is executed (By default, it is stored in _/mnt_). The fio & other specified pod logs are available in a tarfile (\_Logstash*<timestamp>*.tar\_\_).

```
root@gke-oebs-staging-default-pool-7cc7e313-bf16:/mnt# ls

Logstash_07_07_2018_04_10_AM.tar  hosts  systemd_logs
```

The fio results are captured in JSON format with job-specific result sections. Below is a truncated snippet reproduced from the log for a sample basic rw run:

```
{
  "jobname": "basic-readwrite",
  "groupid": 0,
  "error": 0,
  "eta": 0,
  "elapsed": 61,
  "read": {
    "io_bytes": 28399748,
    "bw": 473321,
    "iops": 118330.31,
    "runtime": 60001,
    "total_ios": 7099937,
    "short_ios": 0,
    "drop_ios": 0,
    "slat": {
      "min": 0,
      "max": 0,
      "mean": 0,
      "stddev": 0
    },
    "write": {
      "io_bytes": 28400004,
      "bw": 473325,
      "iops": 118331.38,
      "runtime": 60001,
      "total_ios": 7100001,
      "short_ios": 0,
      "drop_ios": 0,
      "slat": {
        "min": 0,
        "max": 0,
        "mean": 0,
        "stddev": 0
      }
    }
  }
}
```

## CONCLUSION

How is this different from doing an fio package installation on the Kubernetes nodes and running tests?

- Running an fio Kubernetes job will offer better control to simulating actual application loads when used with resource limits.
- The litmus fio jobs with various profiles can be included as part of a larger suite using the executor framework, thereby obtaining results for different profiles.
- Litmus (as it continues to mature) will provide jobs that perform Chaos tests against storage while running different types of workloads. Running a fio job lends itself to that model.
- Finally, it is a more “Kubernetes” way of doing things!

Let us know your experience with using fio-based performance tests with Litmus. Any feedback is greatly appreciated!
