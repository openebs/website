---
title: How to deploy a PostgreSQL Cluster on Kubernetes + OpenEBS
author: Murat Karslioglu
author_info: VP @OpenEBS & @MayaData_Inc. Lives to innovate! Opinions my own!
tags: Crunchy, Kubectl, Solutions, Kubernetes, OpenEBS
date: 02-11-2017
excerpt: Why Postgres on Kubernetes? Well, the answer is in the question. If you are already running Kubernetes on some form of cloud, you understand the ease-of-use, scalability, and monitoring benefits of Kubernetes that you can apply to your database at scale.
---

## Why Postgres on Kubernetes?

Well, the answer is in the question. If you are already running Kubernetes on some form of cloud, you understand the **ease-of-use**, **scalability**, and **monitoring** benefits of Kubernetes that you can apply to your database at scale.

PostgreSQL is the **preferred** relational database for most developers around, although setting up a highly available Postgres cluster from scratch is always a challenge, being **cloud-native** adds a bit to the difficulty.

There are many ways to run **high availability** with PostgreSQL; for a list, see the [PostgreSQL Documentation](https://wiki.postgresql.org/wiki/Replication,_Clustering,_and_Connection_Pooling). To be honest, manually setting it up is quite painful, while there are better ways available. My favorite **cloud-native** Postgres cluster deployment projects are [Crunchy Data](https://www.crunchydata.com/)’s, [Sorint.lab](https://www.sorint.it/)’s [Stolon](https://github.com/sorintlab/stolon) and [Zalando](https://jobs.zalando.com/tech/)’s [Patroni](https://github.com/zalando/patroni)/[Spilo](https://github.com/zalando/spilo).

Since availability requires multi-node Kubernetes deployment instead of local minikube setup, I’ll deploy crunchy-postgres on my existing K8s cluster on AWS with two worker nodes. If you don’t have a Kubernetes cluster yet, see the [instructions to deploy one using StackPointCloud](http://containerized.me/how-to-install-openebs-on-aws-using-stackpointcloud/). Instructions after that are the same in any cloud or on-premises deployment.

## Prerequisites

### Software

- [crunchy-postgres](https://hub.docker.com/r/crunchydata/crunchy-postgres/) (for cluster deployment)
- [Docker](https://docs.docker.com/engine/installation/)installed
- Kubernetes 1.5+ cluster installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) installed
- [OpenEBS](https://github.com/openebs/openebs) installed

### Cloud Provider

- [Amazon Web Services (AWS)](https://aws.amazon.com/) account

### Deploy Crunchy PostgreSQL cluster using kubectl

Once you have OpenEBS storage classes created on your K8s cluster, you can use the following simple steps to launch a highly available PostgreSQL service with one master and one replica.

Download the files to your host, which has access to kubectl

     cd $HOME
     git clone https://github.com/openebs/openebs.git
     cd openebs/k8s/demo/crunchy-postgres 

### Create the Stateful Set

The deployment will use the default images and credentials defined in the set.json file. To set custom users and passwords:

    vi ~/openebs/k8s/demo/crunchy-postgres/set.json

JSON file should look like below, feel free to edit the number of replicas, credentials and storage capacity. Default uses the **openebs-standard** storage class, and it is 400M.

    {
      "apiVersion": "apps/v1beta1",
      "kind": "StatefulSet",
      "metadata": {
        "name": "pgset"
      },
      "spec": {
        "serviceName": "pgset",
        "replicas": 2,
        "template": {
          "metadata": {
            "labels": {
              "app": "pgset"
            }
          },
          "spec": {
            "containers": [
              {
                "name": "pgset",
                "image": "crunchydata/crunchy-postgres:centos7–9.6–1.4.0",
                "ports": [
                  {
                    "containerPort": 5432,
                    "name": "postgres"
                  }
                ],
                "env": [
                  {
                    "name": "PG_MASTER_USER",
                    "value": "master"
                  },
                  {
                    "name": "PGHOST",
                    "value": "/tmp"
                  },
                  {
                    "name": "PG_MODE",
                    "value": "master"
                  },
                  {
                    "name": "PG_MASTER_PASSWORD",
                    "value": "password"
                  },
                  {
                    "name": "PG_USER",
                    "value": "testuser"
                  },
                  {
                    "name": "PG_PASSWORD",
                    "value": "password"
                  },
                  {
                    "name": "PG_DATABASE",
                    "value": "userdb"
                  },
                  {
                    "name": "PG_ROOT_PASSWORD",
                    "value": "password"
                  }
                ],
                "volumeMounts": [
                  {
                    "name": "pgdata",
                    "mountPath": "/pgdata",
                    "readOnly": false
                  }
                ]
              }
            ]
          }
        },
        "volumeClaimTemplates": [
          {
            "metadata": {
              "name": "pgdata"
            },
            "spec": {
              "accessModes": [
                "ReadWriteOnce"
              ],
              "storageClassName": "openebs-standard",
              "resources": {
                "requests": {
                  "storage": "400M"
                }
              }
            }
          }
        ]
      }
    }

Save the file and run the statefulset:

    ./run.sh

The above step will automatically create the OpenEBS volumes required for master and replica postgresql containers and few other Kubernetes objects:

- Persistent Volumes (pvc-{UID1}, pvc-{UID2})
- Persistent Volume Claim (pgdata-pgset-0, pgdata-pgset-1)
- Replica Sets (pvc-{UID1}-ctrl-{random1},pvc-{UID1}-rep-{random2},pvc-{UID2}-ctrl-{random3},pvc-{UID4}-ctrl-{random4})
- Service Account (pgset-sa)
- Services (pgset, pgset-master, pgset-replica)
- StatefulSet (pgset)
- Pods (pgset-0, pgset-1)

![GIF displaying OpenEBS volumes required for master and replica postgresql containers and few other Kubernetes objects](https://cdn-images-1.medium.com/max/800/0*_WTDmIAcGNUGL0zn.gif)

The volume details can be inspected using the standard kubectl commands. To check **persistent volume claims**:

    kubectl get pvc

![Screenshot showing persistent volume claims](https://cdn-images-1.medium.com/max/800/0*Jj59F2CWdQqKOkjW.png)

Check **persistent volumes**:

    kubectl get pv

![Screenshot showing persistent volumes](https://cdn-images-1.medium.com/max/800/0*cm0u7Ea_12FvQRC4.png)

List the **services**, and you will see pgset, master and replica created:

    kubectl get service

![Listing services](https://cdn-images-1.medium.com/max/800/0*d5PjsFswTOOSBAcq.png)

List the **statefulsets**, and you will see pgset listed with two desired and current sets:

![Listing statefulsets](https://cdn-images-1.medium.com/max/800/0*F3eKWl181xp3yKLJ.png)

If you use the **Kubernetes Dashboard**, you can see the same under **Workloads > Stateful Sets** and quickly scale up as well.

![Kubernetes Dashboard](https://cdn-images-1.medium.com/max/800/0*fQO6h-cj00rbePIi.png)

### Test your Database

If it is not installed previously, install psql client:

    sudo apt-get install postgresql-client

Test the master as follows (default password is “password”, unless you changed it):

    psql -h pgset-master -U testuser password -c ‘table pg_stat_replication’

Above command should return output indicating that a single replica is connecting to the master.

Now, test the replica as follows:

    psql -h pgset-replica -U testuser password -c ‘create table foo (id int)’

This command should fail as the replica is read-only within a PostgreSQL cluster.

---

*Originally published at [Containerized Me](http://containerized.me/how-to-deploy-a-postgresql-cluster-on-kubernetes-openebs/)*.
