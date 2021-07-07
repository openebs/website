---
title: PostgreSQL anywhere — via Kubernetes with some help from OpenEBS and credativ engineering
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
date: 18-03-2019
tags: DevOps, Kubernetes, Postgres, Postgresql, Solutions
excerpt: In this blog, we’d like to briefly cover how using cloud-native or “container attached” storage can help in the deployment and ongoing operations of PostgreSQL on Kubernetes.
---

by [Murat Karslioglu](https://twitter.com/muratkarslioglu), [OpenEBS](https://openebs.io/) and [Adrian Vondendriesch](https://twitter.com/__discostu__), [credativ](https://www.credativ.com)

### Introduction

If you are already running Kubernetes on some form of cloud whether on-premises or as a service, you understand the ease-of-use, scalability and monitoring benefits of Kubernetes — and you may well be looking at how to apply those benefits to the operation of your databases.

PostgreSQL remains a preferred relational database, and although setting up a highly available Postgres cluster from scratch might be challenging at first, we are seeing patterns emerging that allow PostgreSQL to run as a first class citizen within Kubernetes, improving availability, reducing management time and overhead, and limiting cloud or data center lock-in.

There are many ways to run high availability with PostgreSQL; for a list, see the [PostgreSQL Documentation](https://wiki.postgresql.org/wiki/Replication,_Clustering,_and_Connection_Pooling). Some common cloud-native Postgres cluster deployment projects include [Crunchy Data](https://www.crunchydata.com/)’s, [Sorint.lab](https://www.sorint.it/)’s [Stolon](https://github.com/sorintlab/stolon) and [Zalando](https://jobs.zalando.com/tech/)’s [Patroni](https://github.com/zalando/patroni)/[Spilo](https://github.com/zalando/spilo). Thus far we are seeing Zalando’s operator as a preferred solution in part because it seems to be simpler to understand and we’ve seen it operate well.

Some quick background on your authors:

- OpenEBS is a broadly deployed OpenSource storage and storage management project sponsored by MayaData.
- [credativ](https://www.credativ.com) is a leading open source support and engineering company with particular depth in PostgreSQL.

> **In this blog, we’d like to briefly cover how using cloud-native or “container attached” storage can help in the deployment and ongoing operations of PostgreSQL on Kubernetes. This is the first of a series of blogs we are considering — this one focuses more on *why* users are adopting this pattern and future ones will dive more into the specifics of *how* they are doing so.**

> **At the end you can see how to use a Storage Class and a preferred operator to deploy PostgreSQL with OpenEBS underlying**

If you are curious about what container attached storage of CAS is , you can read more from the Cloud Native Computing Foundation (CNCF) here:

[https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/](https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/)

Conceptually, you can think of CAS as the decomposition of previously monolithic storage software into containerized microservices that run on Kubernetes. This provides the same advantages of running Kubernetes to the storage and data management layer as well. Like Kubernetes, OpenEBS runs anywhere, so the same advantages below apply whether it is used on-premises or on any of the hosted Kubernetes services.

**PostgreSQL plus OpenEBS**

![Postgres Operator using OpenEBS](/images/blog/postgres-operator-using-openebs.png)
(***Postgres-Operator using OpenEBS as the Storage Provider***)

We have seen joint users adopting OpenEBS as a substrate to PostgreSQL for a variety of reasons. Here are a few of the reasons that stand out:

**Consistency in underlying disk or cloud volume management.**

One of the most annoying things about setting up a system to run PostgreSQL, even if it is on Kubernetes, is configuring the underlying disks and storage systems as needed. With a solution such as OpenEBS, you specify how you want the underlying systems configured via storage classes. OpenEBS, with the help of Kubernetes, ensures that the system delivers the required storage capacity and is configured as you need. An example of such a storage class is shared below. This automation can remove a source of human error and annoyance.

**Thin provisioning and on-demand expansion.**

Now that you have turned over to OpenEBS and the provisioning and management of the underlying storage hardware and services, you simply tell it the amount of storage you need for your PostgreSQL and everything will work, right? In reality, knowing how much data your PostgreSQL instance or instances will consume is difficult and arguably impossible as it is beyond your control.

OpenEBS can also help here as it supports both thin provisioning and on-the-fly pool expansion. The thin provisioning allows you to claim more space than you actually can provision, allowing your PostgreSQL to scale in space usage without interruption. This is done by allowing the addition of more storage to the running system without the need to stop the database.

Thin provisioning, however, is not a good idea if there is no on-the-fly expansion of the underlying capacity for obvious reasons: as the PostgreSQL expands, you want to ensure it can claim space as needed. Otherwise, at some point you will have to interrupt operations and again perform manual tasks. OpenEBS helps here as well — if configured to do so, it can expand its underlying pools, whether these are of physical disks, underlying storage systems, or storage services from a cloud. The capacity of the pool can be expanded on demand by simply adding more disks to the cStor pool.

The cStor architecture also supports the resizing of a provisioned volume on the fly, which will be fully automated as of OpenEBS 0.9. With these enhancements, volumes and underlying pools will be able to scale automatically on any cloud providing K8s support.

In addition to reducing the risk and hassle of manual operations, the combination of thin provisioning and on-demand scaling can reduce costs. This is the case because you don’t over-provision capacity to achieve performance, which reduces unnecessary cloud service spending and can increase average utilization of hardware usage as well.

**Disaster recovery and migration.**

With a solution like OpenEBS, your storage classes can also include backup schedules. These can be easily managed either via Kubectl or MayaOnline, which is free to use. Again, these storage classes can be applied on a per-container basis, which offers quite a bit of granularity and control by each team running their PostgreSQL.

Additionally, we are working together to increase integration with PostgreSQL to this per-snapshot based workload, per container backup capability, called DMaaS by MayaData and OpenEBS. With this additional integration, an option will be added to the storage classes and to OpenEBS that flushes active transactions before taking the snapshot. The additional integration of storage snapshots in conjunction with Write Ahead Log (WAL) archiving will provide additional PITR functionality. DMaaS leverages the open-source Velero from Heptio and marries it to the COW based capabilities of the cStor OpenEBS engine to deliver highly-efficient backups and migrations.

With DMaaS, backups that are taken to one location can be recovered from another. This can be very useful for a variety of use cases, including the use of relatively ephemeral clusters as a part of a rolling upgrade of an environment. Additionally, the same capability can be used to move workloads from one Kubernetes environment to another, thereby reducing lock-in.

**Snapshots and clones for development and troubleshooting.**

DBAs have long been using snapshots and clones to assist in troubleshooting and allow teams to develop and test against a read-only copy of production data. For example, with OpenEBS you can easily use Kubernetes to invoke a snapshot, then promote that snapshot to a clone and spawn a container from that clone. You now have the ability to do anything you want with that container and the contained dataset, and can destroy it when you are finished.

One use case that clones can support is improved reporting. For example, let’s say you use computationally expensive analytical queries and build roll-up queries for monthly reports. With OpenEBS, it is simple to clone the underlying OLTP system, therefore allowing you to work on a static copy of your database and remove load from your production DBs. This ensures you have a verifiable source of information for those reports.

**Closing the loop with per workload visibility and optimization.**

In addition to the benefits of using OpenEBS, there is also value in using MayaOnline for the management of stateful workloads. We may address these in future blogs that examine common day 2 operations and optimization of your PostgreSQL on Kubernetes.

**Running Postgres-Operator on OpenEBS**

![PostgreSQL with OpenEBS persistent volumes](/images/blog/postgres-operator-on-openebs.png)(***PostgreSQL with OpenEBS persistent volumes***)

**Software Requirements**

- [Postgres-Operator](https://github.com/zalando/postgres-operator) (for cluster deployment)
- [Docker](https://docs.docker.com/install/)
- Kubernetes 1.9+
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [OpenEBS](https://github.com/openebs/openebs)

**Installing OpenEBS**

1. If OpenEBS is not installed in your K8s cluster, you can do it [here](https://docs.openebs.io/docs/next/installation.html?__hstc=216392137.adc0011a00126e4785bfdeb5ec4f8c03.1580115966430.1580115966430.1580115966430.1&amp;__hssc=216392137.1.1580115966431&amp;__hsfp=818904025). If OpenEBS is already installed, move on to the next step.
2. Connect to MayaOnline (Optional). Connecting the Kubernetes cluster to [MayaOnline](https://docs.openebs.io/docs/next/app.mayaonline.io?__hstc=216392137.adc0011a00126e4785bfdeb5ec4f8c03.1580115966430.1580115966430.1580115966430.1&amp;__hssc=216392137.1.1580115966431&amp;__hsfp=818904025) provides enhanced visibility of storage resources. MayaOnline has various support options for enterprise customers.

**Configure cStor Pool**

1. If cStor Pool is not configured in your OpenEBS cluster, follow the steps presented [here](https://docs.openebs.io/docs/next/configurepools.html?__hstc=216392137.adc0011a00126e4785bfdeb5ec4f8c03.1580115966430.1580115966430.1580115966430.1&amp;__hssc=216392137.1.1580115966431&amp;__hsfp=818904025). As PostgreSQL is a StatefulSet application, it requires a single storage replication factor. If you prefer additional redundancy, you can always increase the replica count to 3.
During cStor Pool creation, make sure that the maxPools parameter is set to >=3. If a cStor pool is already configured, move on to the next step. A sample YAML named openebs-config.yaml can be used for configuring cStor Pool and is provided in the Configuration details below.

**openebs-config.yaml**

    #Use the following YAMLs to create a cStor Storage Pool.
    # and associated storage class.
    apiVersion: openebs.io/v1alpha1
    kind: StoragePoolClaim
    metadata:
     name: cstor-disk
    spec:
     name: cstor-disk
     type: disk
     poolSpec:
     poolType: striped
     # NOTE — Appropriate disks need to be fetched using `kubectl get disks`
     #
     # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
     # as the disk operator
    # Replace the following with actual disk CRs from your cluster `kubectl get disks`
    # Uncomment the below lines after updating the actual disk names.
     disks:
     diskList:
    # Replace the following with actual disk CRs from your cluster from `kubectl get disks`
    # — disk-184d99015253054c48c4aa3f17d137b1
    # — disk-2f6bced7ba9b2be230ca5138fd0b07f1
    # — disk-806d3e77dd2e38f188fdaf9c46020bdc
    # — disk-8b6fb58d0c4e0ff3ed74a5183556424d
    # — disk-bad1863742ce905e67978d082a721d61
    # — disk-d172a48ad8b0fb536b9984609b7ee653
     — -

**Create the Storage Class**

1. You must configure a StorageClass to provision a cStor volume on a cStor pool. In this solution, we use a StorageClass to consume the cStor Pool. This is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](https://docs.openebs.io/docs/next/configurepools.html?__hstc=216392137.adc0011a00126e4785bfdeb5ec4f8c03.1580115966430.1580115966430.1580115966430.1&amp;__hssc=216392137.1.1580115966431&amp;__hsfp=818904025) section. In this solution, PostgreSQL is a deployment. Because this requires replication at the storage level, the cStor volume replicaCount is 3. A sample YAML named openebs-sc-pg.yaml used to consume the cStor pool with a cStorVolume Replica count of 3 is provided in the configuration details below.

**openebs-sc-pg.yaml**

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: openebs-postgres
      annotations:
        openebs.io/cas-type: cstor
        cas.openebs.io/config: |
          - name: StoragePoolClaim
            value: "cstor-disk"
          - name: ReplicaCount
            value: "3"       
    provisioner: openebs.io/provisioner-iscsi
    reclaimPolicy: Delete
    ---

**Launch and Test Postgres Operator**

1. Clone Zalando’s Postgres Operator.

    git clone https://github.com/zalando/postgres-operator.git
    cd postgres-operator

**Use the OpenEBS Storage Class**

1. Edit the manifest file and add openebs-postgres as the storage class.

    nano manifests/minimal-postgres-manifest.yaml

After adding the storage class, it should look similar to the example below:

    apiVersion: "acid.zalan.do/v1"
    kind: postgresql
    metadata:
      name: acid-minimal-cluster
      namespace: default
    spec:
      teamId: "ACID"
      volume:
        size: 1Gi
        storageClass: openebs-postgres
      numberOfInstances: 2
      users:
        # database owner
        zalando:
        - superuser
        - createdb
    # role for application foo
        foo_user: []
    #databases: name->owner
      databases:
        foo: zalando
      postgresql:
        version: "10"
        parameters:
          shared_buffers: "32MB"
          max_connections: "10"
          log_statement: "all"

**Start the Operator**

1. Run the following command to start the operator:

    kubectl create -f manifests/configmap.yaml # configuration
    kubectl create -f manifests/operator-service-account-rbac.yaml # identity and permissions
    kubectl create -f manifests/postgres-operator.yaml # deployment

**Create a Postgres Cluster on OpenEBS (Optional)**

The operator can run in a namespace other than default. This may be done to use the test namespace, for example. Run the following before deploying the operator’s manifests:

    kubectl create namespace test
    kubectl config set-context $(kubectl config current-context) — namespace=test

1. Run the command below to deploy from the example manifest:

    kubectl create -f manifests/minimal-postgres-manifest.yaml

2. It only takes a few seconds to get the persistent volume (PV) for the *pgdata-acid-minimal-cluster-0* up and running. Check the PVs created by the operator using the k*ubectl get pv* command:

    $ kubectl get pv
    NAME CAPACITY ACCESS MODES RECLAIM POLICY STATUS CLAIM STORAGECLASS REASON AGE
    pvc-8852ceef-48fe-11e9–9897–06b524f7f6ea 1Gi RWO Delete Bound default/pgdata-acid-minimal-cluster-0 openebs-postgres 8m44s
    pvc-bfdf7ebe-48fe-11e9–9897–06b524f7f6ea 1Gi RWO Delete Bound default/pgdata-acid-minimal-cluster-1 openebs-postgres 7m14s

**Connect to the Postgres Master and Test**

1. If not installed previously, install psql client using this command:

    sudo apt-get install postgresql-client

2. Run the command below and note the hostname and host port.

    kubectl get service — namespace default |grep acid-minimal-cluster

3. Next, run the following commands to connect to your PostgreSQL DB and test. Replace the *[HostPort]* below with the port number from the output of the above command:

    export PGHOST=$(kubectl get svc -n default -l application=spilo,spilo-role=master -o jsonpath="{.items[0].spec.clusterIP}")
    export PGPORT=[HostPort]
    export PGPASSWORD=$(kubectl get secret -n default postgres.acid-minimal-cluster.credentials -o ‘jsonpath={.data.password}’ | base64 -d)
    psql -U postgres -c ‘create table foo (id int)’

Congratulations! You now have the Postgres-Operator and your first test database operating with the help of cloud-native OpenEBS storage.

**Partnership and Future Direction**

As this blog indicates, the teams at MayaData/OpenEBS and credativ are increasingly working together to offer more benefits for organizations running PostgreSQL and other stateful workloads. In future blogs, we’ll provide more hands-on tips.

We are certainly looking for feedback and suggestions on the strategic direction of this collaboration. Please provide feedback below or find us on [Twitter](https://twitter.com/openebs) or the OpenEBS slack community: [http://slack.openebs.io](http://slack.openebs.io/?__hstc=216392137.adc0011a00126e4785bfdeb5ec4f8c03.1580115966430.1580115966430.1580115966430.1&amp;__hssc=216392137.1.1580115966431&amp;__hsfp=818904025)
