---
title: How to deploy a Cassandra Cluster/Ring on Kubernetes + OpenEBS
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 25-11-2017
tags: Cassandra, Kubernetes, NoSQL, Solutions
excerpt: Apache Cassandra is a distributed key-value store intended to run in a data center and also across multiple data centers. Initially it was designed as Facebook as an infrastructure for their messaging platform.
---


Apache  Cassandra is a **distributed key-value store** intended to run in a data center and also across multiple data centers. Initially, it was designed as Facebook as an infrastructure for their messaging platform. Later it is open sourced, and today it’s one of the most active Apache projects.
If you are using eBay, Twitter, Spotify, or Netflix you are consuming data provided by Cassandra. For example, Netflix uses Cassandra to keep track of your current place in a streaming video, as well as movie ratings, bookmarks, and user history of 90+ million users.
Amazing to see how much of this technology we consume in our day-to-day life. The feature that allowed me and my wife to start watching Stranger Things on our long trip on a tablet and continued on TV was depending on Cassandra. To give you an idea of its size, according to a [recent presentation](https://www.youtube.com/watch?v=2l0_onmQsPI), Cassandra serving Netflix has 250+ Clusters, 10,000+ Nodes, and 3+ PB of data.
In summary, Cassandra solves the problem of mapping the key-value pair to a server/node, in our case to a container. This mapping is called the **partitioner**. There are two common placement strategies used by Cassandra: **SimpleStrategy** or **NetworkTopologyStrategy**. SimpleStrategy uses partitioner Murmur3Partitioner by default. Both **Murmur3Partitioner** and **RandomPartitioner** partitioners uniformly distribute data to nodes across the cluster. Read and write requests to the cluster are evenly distributed while using these partitioners. Load balancing is simplified as each part of the hash range receives an equal number of rows on average. **Byte-Order Partitioner **is not recommended other than key range queries.

For development work, the SimpleStrategy class is acceptable. For production work, the NetworkTopologyStrategy class must be set. In production, you will end up with multiple rings using mostly NetworkTopology placement which is by itself extremely complex to plan.
If you want to learn the architecture of Cassandra, the University of Illinois has a great course on [Cloud Computing Concepts](https://www.coursera.org/learn/cloud-computing/home/welcome) and [Key-Value Stores](https://www.coursera.org/learn/cloud-computing/home/week/4) which covers internals of Cassandra. You can also find more about custom SeedProvider and Snitches [here](https://github.com/kubernetes/kubernetes/issues/24286).
Cassandra doesn’t like shared storage, therefore use of NFS or GlusterFS not recommended for Cassandra rings. It’s also recommended to use SSD or NVMe, since it’s essential to have low latency random reads and good sequential writes at the same time. These kinds of requirements can be only satisfied with OpenEBS like local and persistent storage solutions.
To achieve the best fault tolerance with Cassandra, you need to have an excellent understanding of the [**snitch**](http://cassandra.apache.org/doc/latest/operating/snitch.html)and placement strategies. There is a big debate on whether if Cassandra or the storage should handle the placement of data. My suggestion would be to have a balanced approach and have both. OpenEBS can help you to place your persistent volumes across the datacenter, multiple cloud vendors, and fault domains against Cassandra replica failures. First, you can **avoid rebalancing** your cluster in case of a datacenter failure. Second, in case of node failures in a rack, you can bring up the same node from a snapshot and **minimize the time needed to rebalance**.

I will use Cassandra custom Kubernetes SeedProvider that allows discovery within Kubernetes clusters as they join the cluster and deploy using `gcr.io/google-samples/cassandra:v11` image from Google’s container registry.

Let’s deploy our first three replica Cassandra cluster on our existing AWS K8s cluster with OpenEBS. If you are using on local minikube or datacenter, you can keep the default **SimpleStrategy** and **Murmur3Partitioner** in `cassandra.yaml` file.

#### **Prerequisites**

**Software**

- [Docker ](https://docs.docker.com/engine/installation/)installed
- Kubernetes 1.8.3+ RBAC enabled cluster
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) installed
- [OpenEBS](https://github.com/openebs/openebs) installed
- Cassandra 3.x

**Cloud Provider**

- [Amazon Web Services (AWS)](https://aws.amazon.com/) account

#### **Deploy Cassandra Stateful with Persistent Storage in one Region**

Once you have OpenEBS storage classes created on your K8s cluster, you can use the following steps to launch a Cassandra service with any number of nodes you like.

By using environment variables, you can change values that are inserted into `cassandra.yaml`. Default **endpoint_snitch** is set to SimpleSnitch. I will change the Snitch to Ec2Snitch and also increase the replicas from 3 to 4 later.

Before getting started, check the status of the cluster using the following command.

    kubectl get nodes

On my setup, I have one master and four worker nodes on AWS in the same US West (Oregon) region and availability zone (us-west-2a).

    ubuntu@ip-172–23–1–236:~$ kubectl get nodes
     NAME STATUS ROLES AGE VERSION
     ip-172–23–1–225.us-west-2.compute.internal Ready <none> 21h v1.8.3
     ip-172–23–1–236.us-west-2.compute.internal Ready master 21h v1.8.3
     ip-172–23–1–32.us-west-2.compute.internal Ready <none> 21h v1.8.3
     ip-172–23–1–35.us-west-2.compute.internal Ready <none> 21h v1.8.3
     ip-172–23–1–46.us-west-2.compute.internal Ready <none> 21h v1.8.3

Download OpenEBS GitHub repo to your host, where sample YAML files are stored.

    git clone [https://github.com/openebs/openebs.git](https://github.com/openebs/openebs.git)

First list predefined OpenEBS storage classes available to you.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get storageclasses
    NAME PROVISIONER
    default kubernetes.io/aws-ebs
    etcd-backup-gce-pd kubernetes.io/gce-pd
    gp2 (default) kubernetes.io/aws-ebs
    openebs-cassandra openebs.io/provisioner-iscsi
    openebs-es-data-sc openebs.io/provisioner-iscsi
    openebs-jupyter openebs.io/provisioner-iscsi
    openebs-kafka openebs.io/provisioner-iscsi
    openebs-mongodb openebs.io/provisioner-iscsi
    openebs-percona openebs.io/provisioner-iscsi
    openebs-redis openebs.io/provisioner-iscsi
    openebs-standalone openebs.io/provisioner-iscsi
    openebs-standard openebs.io/provisioner-iscsi
    openebs-zk openebs.io/provisioner-iscsi

Go to `openebs/k8s/demo/cassandra/` folder and edit `cassandra-statefulset.yaml` file.

    vi cassandra-statefulset.yaml

This file should look like below. You can edit and specify number of replicas preferred and your own OpenEBS storage class before applying.

    apiVersion: apps/v1beta1
     kind: StatefulSet
     metadata:
     name: cassandra
     labels:
     app: cassandra
     spec:
     serviceName: cassandra
     replicas: 3
     selector:
     matchLabels:
     app: cassandra
     template:
     metadata:
     labels:
     app: cassandra
     spec:
     containers:
     — name: cassandra
     image: gcr.io/google-samples/cassandra:v11
     imagePullPolicy: Always
     ports:
     — containerPort: 7000
     name: intra-node
     — containerPort: 7001
     name: tls-intra-node
     — containerPort: 7199
     name: jmx
     — containerPort: 9042
     name: cql
     resources:
     limits:
     cpu: “500m”
     memory: 1Gi
     requests:
     cpu: “500m”
     memory: 1Gi
     securityContext:
     capabilities:
     add:
     — IPC_LOCK
     lifecycle:
     preStop:
     exec:
     command: [“/bin/sh”, “-c”, “PID=$(pidof java) && kill $PID && while ps -p $PID > /dev/null; do sleep 1; done”]
     env:
     — name: MAX_HEAP_SIZE
     value: 512M
     — name: HEAP_NEWSIZE
     value: 100M
     — name: CASSANDRA_SEEDS
     value: “cassandra-0.cassandra.default.svc.cluster.local”
     — name: CASSANDRA_CLUSTER_NAME
     value: “K8Demo”
     — name: CASSANDRA_DC
     value: “DC1-K8Demo”
     — name: CASSANDRA_RACK
     value: “Rack1-K8Demo”
     — name: CASSANDRA_AUTO_BOOTSTRAP
     value: “false”
     — name: POD_IP
     valueFrom:
     fieldRef:
     fieldPath: status.podIP
     readinessProbe:
     exec:
     command:
     — /bin/bash
     — -c
     — /ready-probe.sh
     initialDelaySeconds: 15
     timeoutSeconds: 5
     # These volume mounts are persistent. They are like inline claims,
     # but not exactly because the names need to match exactly one of
     # the stateful pod volumes.
     volumeMounts:
     — name: cassandra-data
     mountPath: /cassandra_data
     volumeClaimTemplates:
     — metadata:
     name: cassandra-data
     annotations:
     volume.beta.kubernetes.io/storage-class: openebs-cassandra
     spec:
     accessModes: [ “ReadWriteOnce” ]
     resources:
     requests:
     storage: 5G

Note: There are few parameters you may want to modify.

`apiVersion: apps/v1beta2` API group and version is introduced 1.8 release.

`replicas: 3`, I’m starting with 3 replicas and will increase later.

`image: gcr.io/google-samples/cassandra:v12` is the latest image available at the time I've tested.

`volume.beta.kubernetes.io/storage-class: openebs-cassandra` I’m using a predefined OpenEBS storage class. You can modify it separately.

#### Create a Cassandra Headless Service

To be able to have a simple discovery of the Cassandra seed node we need to create a “headless” service. If you view the `cassandra-service.yaml`file, you will notice that `clusterIP` is set to None. This will allow us to use KubeDNS for the Pods to discover the IP address of the Cassandra seed.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ cat cassandra-service.yaml
     apiVersion: v1
     kind: Service
     metadata:
     labels:
     app: cassandra
     name: cassandra
     spec:
     clusterIP: None
     ports:
     — port: 9042
     selector:
     app: cassandra

Now apply `cassandra-service.yaml` file to create headless service.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl apply -f cassandra-service.yaml
     service “cassandra” created

#### Create a Cassandra StatefulSet

Most applications deployed on Kubernetes should be **cloud-native** and rely on external resources for their data and state. However, stateful application and databases like Cassandra require stateful sets and persistent volumes to ensure resiliency. In this case, OpenEBS will provide us our persistent volume.

The StatefulSet is responsible for creating the Pods. Run the following command to start our Cassandra replicas.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl apply -f cassandra-statefulset.yaml
     statefulset “cassandra” created

#### Validate the StatefulSet

Check if your StatefulSet has deployed using the command below. Time may take around 4–5 minutes to complete.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get statefulsets
     NAME DESIRED CURRENT AGE
     cassandra 3 3 5m

If you don’t see all 3 replicas ready, you can check status of pods to watch progress. For example, I ran `kubectl get pods` after 2 minutes below. First node was ready and second was still creating. All three pods were ready after around 5 minutes.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get pods
     NAME READY STATUS RESTARTS AGE
     cassandra-0 1/1 Running 0 2m
     cassandra-1 0/1 ContainerCreating 0 12s
     maya-apiserver-5994b58bbb-ss7mr 1/1 Running 0 13m
     openebs-provisioner-6f45dcf459-hqldl 1/1 Running 0 13m
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-ctrl-9c7dcdcfc-bgmrp 1/1 Running 0 12s
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-rep-78bf89ff99–572j8 0/1 ContainerCreating 0 12s
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-rep-78bf89ff99–66qtf 1/1 Running 0 12s
     pvc-d13bf437-d225–11e7–955b-062af127ae24-ctrl-584956b667-n88mv 1/1 Running 0 2m
     pvc-d13bf437-d225–11e7–955b-062af127ae24-rep-74d4cf4b84–5m8nz 1/1 Running 0 2m
     pvc-d13bf437-d225–11e7–955b-062af127ae24-rep-74d4cf4b84-c4t9c 1/1 Running 0

Verify that all the OpenEBS persistent volumes are created, the Cassandra headless service and replicas are running.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get pods -o wide
     NAME READY STATUS RESTARTS AGE IP NODE
     cassandra-0 1/1 Running 0 6m 10.2.2.4 ip-172–23–1–32.us-west-2.compute.internal
     cassandra-1 1/1 Running 0 4m 10.2.4.6 ip-172–23–1–46.us-west-2.compute.internal
     cassandra-2 1/1 Running 0 2m 10.2.1.6 ip-172–23–1–35.us-west-2.compute.internal
     maya-apiserver-5994b58bbb-ss7mr 1/1 Running 0 17m 10.2.4.3 ip-172–23–1–46.us-west-2.compute.internal
     openebs-provisioner-6f45dcf459-hqldl 1/1 Running 0 17m 10.2.3.2 ip-172–23–1–225.us-west-2.compute.internal
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-ctrl-9c7dcdcfc-bgmrp 1/1 Running 0 4m 10.2.3.4 ip-172–23–1–225.us-west-2.compute.internal
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-rep-78bf89ff99–572j8 1/1 Running 0 4m 10.2.4.5 ip-172–23–1–46.us-west-2.compute.internal
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-rep-78bf89ff99–66qtf 1/1 Running 0 4m 10.2.3.5 ip-172–23–1–225.us-west-2.compute.internal
     pvc-5383da78-d226–11e7–955b-062af127ae24-ctrl-9c4bfcd6–4ss2r 1/1 Running 0 2m 10.2.1.4 ip-172–23–1–35.us-west-2.compute.internal
     pvc-5383da78-d226–11e7–955b-062af127ae24-rep-5bbbd9ff45–7tss8 1/1 Running 0 2m 10.2.3.6 ip-172–23–1–225.us-west-2.compute.internal
     pvc-5383da78-d226–11e7–955b-062af127ae24-rep-5bbbd9ff45-vfkrn 1/1 Running 0 2m 10.2.1.5 ip-172–23–1–35.us-west-2.compute.internal
     pvc-d13bf437-d225–11e7–955b-062af127ae24-ctrl-584956b667-n88mv 1/1 Running 0 6m 10.2.1.3 ip-172–23–1–35.us-west-2.compute.internal
     pvc-d13bf437-d225–11e7–955b-062af127ae24-rep-74d4cf4b84–5m8nz 1/1 Running 0 6m 10.2.3.3 ip-172–23–1–225.us-west-2.compute.internal
     pvc-d13bf437-d225–11e7–955b-062af127ae24-rep-74d4cf4b84-c4t9c 1/1 Running 0 6m 10.2.4.4 ip-172–23–1–46.us-west-2.compute.internal

On the list of the Pods above, you see 3 Pods running. Your Pod names should be cassandra-0, cassandra-1, cassandra-2 and the next pods would follow the ordinal number (cassandra-3, cassandra-4,...). Use this command to view the Pods created by the StatefulSet:

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get svc
     NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
     cassandra ClusterIP None <none> 9042/TCP 7m
     kubernetes ClusterIP 10.3.0.1 <none> 443/TCP 22h
     maya-apiserver-service ClusterIP 10.3.0.204 <none> 5656/TCP 18m
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-ctrl-svc ClusterIP 10.3.0.188 <none> 3260/TCP,9501/TCP 5m
     pvc-5383da78-d226–11e7–955b-062af127ae24-ctrl-svc ClusterIP 10.3.0.23 <none> 3260/TCP,9501/TCP 3m
     pvc-d13bf437-d225–11e7–955b-062af127ae24-ctrl-svc ClusterIP 10.3.0.187 <none> 3260/TCP,9501/TCP 7m

#### Verifying Successful Cassandra Deployment

Check if the Cassandra nodes are up, perform a **`nodetool status`** on cassandra-0 node :

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl exec -ti cassandra-0 — nodetool status
     Datacenter: DC1-K8Demo
     ======================
     Status=Up/Down
     |/ State=Normal/Leaving/Joining/Moving
     — Address Load Tokens Owns (effective) Host ID Rack
     UN 10.2.4.6 83.17 KiB 32 75.6% 3c93c7b7–61a7–4cf1-a407-cb47b1de0763 Rack1-K8Demo
     UN 10.2.1.6 65.65 KiB 32 59.5% 552569fe-c6df-4edb-a553–9efdcf682fb3 Rack1-K8Demo
     UN 10.2.2.4 83.12 KiB 32 64.9% 92060271-d8cd-48be-a489-c830a8553462 Rack1-K8Demo

UN means node is **up** and in **normal** state. You will also notice that each node has 32 tokens. This is the default value, in production workloads, a good default value for this is 256. See more information [here](http://docs.datastax.com/en/archived/cassandra/2.0/cassandra/architecture/architectureDataDistributeVnodesUsing_c.html).

The **Owns** column suggests the data distribution percentage for the content placed into the Cassandra keyspaces.

#### Create a Test Keyspace with Tables

Identify the IP Address of any of the Cassandra replicas, for example, Cassandra-0. This is available from the output of the `nodetool status` command executed above (10.2.4.6, 10.2.1.6, 10.2.2.4).

**Cqlsh** is a Python-based utility that enables you to execute Cassandra Query Language (CQL). **CQL** is a declarative language that allows users to query Cassandra using semantics similar to SQL.

Install the python-minimal and python-pip apt packages and perform a pip install of Csqlsh using the following commands.

    sudo apt-get install -y python-minimal python-pip
     pip install cqlsh

Login to the CQL shell using the Cqlsh utility using the following command.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ cqlsh 10.2.4.6 9042 — cqlversion=”3.4.2"
     Connected to K8Demo at 10.2.4.6:9042.
     [cqlsh 5.0.1 | Cassandra 3.9 | CQL spec 3.4.2 | Native protocol v4]
     Use HELP for help.
     cqlsh>

As I mentioned earlier, you have two placement options while creating a keyspace. You can either use SimpleStrategy or NetworkTopologyStrategy.

You can create a keyspace using SimpleStrategy with replication factor 2 by running the following commands.

    cqlsh> create keyspace ssks with replication = { ‘class’ : ‘SimpleStrategy’ , ‘replication_factor’ : 2 };

I will create a keyspace using NetworkTopologyStrategy by running the following commands.

    cqlsh> create keyspace ntsks with replication = { ‘class’ : NetworkTopologyStrategy’, ‘DC1-K8Demo’ : 1 };

    cqlsh> describe keyspaces;

    ntsks system_schema system_auth system system_distributed system_traces

To use NetworkTopologyStrategy with data centers in a production environment, you need to change the default snitch, **SimpleSnitch** to a network-aware **Ec2Snitch**. You need to define one or more data center names in the snitch properties file, and use those data center names to define the keyspace; otherwise, Cassandra will fail to find a node. You can find the instructions to change the default Snitch [here](https://docs.datastax.com/en/cassandra/2.1/cassandra/operations/ops_switch_snitch.html).

Create a table with test content and view the data using the following commands.

    cqlsh> use ntsks;

    cqlsh:ntsks> create table inventory (id uuid,Username text,Email text,Age int,PRIMARY KEY ((id), Username));

    cqlsh:ntsks> insert into inventory (id, Username, Email, Age) values (1234b130-ae79–11e4-ab27–0700500c9a24, ‘Murat’, ‘murat@cloudbyte.com’, 40);

    cqlsh:ntsks> select * from inventory;

    id | username | age | email
     — — — — — — — — — — — — — — — — — — — + — — — — — + — — -+ — — — — — — — — — — -
     1234b130-ae79–11e4-ab27–0700500c9a24 | Murat | 37 | murat@cloudbyte.com

    (1 rows)

Flush the data to ensure it is written to a disk from the memtable (memory) using the following command.

    kubectl exec cassandra-0 — nodetool flush ntsks

#### Delete the Test Keyspace

Verify the masterless nature of Cassandra StatefulSet by deleting the keyspace from another replica, in this example, Cassandra-1.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ cqlsh 10.2.1.6 9042 — cqlversion=”3.4.2"
     Connected to K8Demo at 10.2.1.6:9042.
     [cqlsh 5.0.1 | Cassandra 3.9 | CQL spec 3.4.2 | Native protocol v4]
     Use HELP for help.
     cqlsh> use ntsks;

    cqlsh:ssks> select * from Inventory;

    id | username | age | email
     — — — — — — — — — — — — — — — — — — — + — — — — — + — — -+ — — — — — — — — — — -
     1234b130-ae79–11e4-ab27–0700500c9a24 | Murat | 37 | murat@cloudbyte.com

    (1 rows)

    cqlsh> drop keyspace ntsks;

Verify that the keyspace is deleted successfully using the following command.

    cqlsh> describe keyspaces

    system_traces system_schema system_auth system system_distributed

#### Scale the StatefulSet

To increase or decrease the size of your StatefulSet you can use the scale command:

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl scale — replicas=4 statefulset/cassandra
     statefulset “cassandra” scaled

Wait a minute or two and check if it worked:

    $ kubectl get statefulsets
     NAME DESIRED CURRENT AGE
     cassandra 4 4 1h

If you watch the Cassandra pods deploy, they should be created sequentially.

You can view the list of the Pods again to confirm that your Pods are up and running.

    ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get statefulsets
     NAME DESIRED CURRENT AGE
     cassandra 4 4 1h
     ubuntu@ip-172–23–1–236:~/openebs/k8s/demo/cassandra$ kubectl get pods -o wide
     NAME READY STATUS RESTARTS AGE IP NODE
     cassandra-0 1/1 Running 0 1h 10.2.2.4 ip-172–23–1–32.us-west-2.compute.internal
     cassandra-1 1/1 Running 0 1h 10.2.4.6 ip-172–23–1–46.us-west-2.compute.internal
     cassandra-2 1/1 Running 0 1h 10.2.1.6 ip-172–23–1–35.us-west-2.compute.internal
     cassandra-3 0/1 Running 0 1m 10.2.3.9 ip-172–23–1–225.us-west-2.compute.internal
     maya-apiserver-5994b58bbb-ss7mr 1/1 Running 0 1h 10.2.4.3 ip-172–23–1–46.us-west-2.compute.internal
     openebs-provisioner-6f45dcf459-hqldl 1/1 Running 0 1h 10.2.3.2 ip-172–23–1–225.us-west-2.compute.internal
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-ctrl-9c7dcdcfc-bgmrp 1/1 Running 0 1h 10.2.3.4 ip-172–23–1–225.us-west-2.compute.internal
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-rep-78bf89ff99–572j8 1/1 Running 0 1h 10.2.4.5 ip-172–23–1–46.us-west-2.compute.internal
     pvc-13a2ebce-d226–11e7–955b-062af127ae24-rep-78bf89ff99–66qtf 1/1 Running 0 1h 10.2.3.5 ip-172–23–1–225.us-west-2.compute.internal
     pvc-5383da78-d226–11e7–955b-062af127ae24-ctrl-9c4bfcd6–4ss2r 1/1 Running 0 1h 10.2.1.4 ip-172–23–1–35.us-west-2.compute.internal
     pvc-5383da78-d226–11e7–955b-062af127ae24-rep-5bbbd9ff45–7tss8 1/1 Running 0 1h 10.2.3.6 ip-172–23–1–225.us-west-2.compute.internal
     pvc-5383da78-d226–11e7–955b-062af127ae24-rep-5bbbd9ff45-vfkrn 1/1 Running 0 1h 10.2.1.5 ip-172–23–1–35.us-west-2.compute.internal
     pvc-5c9e5136-d22f-11e7–955b-062af127ae24-ctrl-5b6d99869–7gxv5 1/1 Running 0 1m 10.2.3.7 ip-172–23–1–225.us-west-2.compute.internal
     pvc-5c9e5136-d22f-11e7–955b-062af127ae24-rep-5fc8b95cd-6vfbt 1/1 Running 0 1m 10.2.2.5 ip-172–23–1–32.us-west-2.compute.internal
     pvc-5c9e5136-d22f-11e7–955b-062af127ae24-rep-5fc8b95cd-h22qz 1/1 Running 0 1m 10.2.3.8 ip-172–23–1–225.us-west-2.compute.internal
     pvc-d13bf437-d225–11e7–955b-062af127ae24-ctrl-584956b667-n88mv 1/1 Running 0 1h 10.2.1.3 ip-172–23–1–35.us-west-2.compute.internal
     pvc-d13bf437-d225–11e7–955b-062af127ae24-rep-74d4cf4b84–5m8nz 1/1 Running 0 1h 10.2.3.3 ip-172–23–1–225.us-west-2.compute.internal
     pvc-d13bf437-d225–11e7–955b-062af127ae24-rep-74d4cf4b84-c4t9c 1/1 Running 0 1h 10.2.4.4 ip-172–23–1–46.us-west-2.compute.internal

You can perform a `nodetool status` to check if the other Cassandra nodes have joined and formed a Cassandra cluster.

    $ kubectl exec -ti cassandra-0 — nodetool status
     Datacenter: DC1-K8Demo
     ======================
     Status=Up/Down
     |/ State=Normal/Leaving/Joining/Moving
     — Address Load Tokens Owns (effective) Host ID Rack
     UN 10.2.4.6 174.97 KiB 32 59.7% 3c93c7b7–61a7–4cf1-a407-cb47b1de0763 Rack1-K8Demo
     UN 10.2.1.6 182.32 KiB 32 43.8% 552569fe-c6df-4edb-a553–9efdcf682fb3 Rack1-K8Demo
     UN 10.2.2.4 169.7 KiB 32 42.5% 92060271-d8cd-48be-a489-c830a8553462 Rack1-K8Demo
     UN 10.2.3.9 90.81 KiB 32 54.1% 47e8c9e2-a6d9–4276–88ae-6fe2256ca2af Rack1-K8Demo

You will need to wait for the status of the nodes to be Up and Normal (UN) to execute the commands in the next steps.

#### Troubleshooting

If your Cassandra instance is not running properly, you may check the logs using the command below. Replace <your-pod-name> with your pod name. For example, `cassandra-0`:

    kubectl logs <your-pod-name>

If your Cassandra nodes are not joining, delete your controller/statefulset then delete your Cassandra service:

    kubectl delete statefulset cassandra

If you created the Cassandra StatefulSet:

    kubectl delete svc cassandra

To delete everything:

    kubectl delete statefulset,pvc,pv,svc -l app=cassandra

---

*Originally published at [Containerized Me](http://containerized.me/how-to-deploy-a-cassandra-cluster-ring-on-kubernetes-openebs/)*.
