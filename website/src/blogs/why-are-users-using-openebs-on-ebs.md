---
title: Why are users using OpenEBS *on* EBS?
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
tags: Container Native Storage, Featured, MySQL, Kubernetes, OpenEBS
date: 19-10-2017
excerpt: We were a little surprised to see OpenEBS started to be used on top of EBS itself. So we dug in and asked why?
not_has_feature_image: true
---

We were a little surprised to see OpenEBS started to be used on top of EBS itself. So we dug in and asked why?

The following lays out what we learned, focusing mostly on the most common use case.

As you likely know, broadly speaking, there are two types of stateful applications. We call them Mercy Apps and NoMercy apps (Not generic names, but we started using these names in the OpenEBS community discussions 🙂)

1. **Mercy Apps** — The apps deal with data resiliency at the application level; for example, they synchronously replicate and disperse the data and will have less dependency on the high availability of storage underneath. Some examples of mercy apps are Cassandra and even (usually) MongoDB.
2. **NoMercy Apps** — The apps that have a single copy of the data and have no idea of synchronous replication of data. These applications assume that the underlying storage is always (at least highly) available. The most famous example for NoMercy apps is the famous “MySQL server”.

Today, most of the legacy apps are NoMercy Apps. Also, MySQL or Postgres tends to be the first choice for most of the developers and remains the most commonly used database for quick application development and deployment. The applications that use MySQL underneath are being containerized and probably being moved to the cloud container services such as Amazon ECS. It is important to note that even NoSql databases like MongoDB that protect the data across nodes are often deployed as a single copy (as a NoMercy App) and that we are seeing cases where users of NoSql use the storage for node pre-population for example instead of relying on node rebalancing at the application / NoSql level.

![Shifting from legacy to microservices](https://cdn-images-1.medium.com/max/800/1*Bayd4nQST787TIbYo_5aWg.png)  
(***Shifting from legacy to microservices***)

Once you lift and shift your legacy app onto containers and the cloud, you ideally want to allow for Kubernetes to orchestrate the dynamism of container movements among various hosts; while this dynamism is core to the value of containerization, it also creates a unique challenge for the availability of data/storage to the application.

![EBS volume may not be immediately available](https://cdn-images-1.medium.com/max/800/1*ISz4kvGREGlXZkBwiwSRjQ.png)  
(***EBS volume may not be immediately available***)  

As the above drawing suggests, we learned from some OpenEBS community users that when app containers move from one host to another, the time it takes to detach the EBS volume from one host and to attach the same EBS volume to the new host can *cause downtime for the stateful application*.

### There are two solutions to this problem.

***First solution:*** Re-architect your application and make it a mercy application. Use the new age databases like Cassandra or MongoDB and configure them to protect the data at the application layer, which of course needs special training and quite a bit of work. Even the flavor of SQL support may change, so you may find yourself rewriting your queries, always a source of fun and enjoyment 🙂

![Sync replicate at the DB level](https://cdn-images-1.medium.com/max/800/1*rdabUhTkx6iF3Ncv3EKlrQ.png)  
(***Sync replicate at the DB level***)

Btw, if the thought of moving to a new Database is daunting, you would be interested in using plug-in code to the existing no-mercy apps to perform the synchronous replication. In the case of MySQL, one option is to migrate to MariaDB and then use the Galera sync replication plugin. You would be lucky if you already have a plugin that is resilient and doesn’t add performance overheads.

***A second solution*** — that is probably the top reason users are running OpenEBS and similar containerized storage controllers ON EBS — is a more elegant one : *protect the data at the storage layer*. By putting OpenEBS into your pods as the provider of storage and letting it handle data placement on the local nodes (in this case one or more, yes, EBS volumes) while also replicating the data per the policies you prefer, you avoid rewiring your application.

![Using OpenEBS for high availability of Mysql DB data on AWS EBS](https://cdn-images-1.medium.com/max/800/1*3npgXXxGEOFD4uh_KRvPng.png)  
(***Using OpenEBS for high availability of Mysql DB data on AWS EBS***)

Ok, great, however — you are now doing storage differently. Isn’t that itself a challenge?

Well, if you are already moving towards Kubernetes then you are already learning the skills needed to run OpenEBS. OpenEBS is integrated into the Kubernetes storage architecture to make the volume provisioning basically the same behind the scenes experience as attaching the EBS volume for a given pod. Instead of attaching the AWS EBS volume to the application pod using kubernetes.io/aws-ebs provisioner, the developer simply uses kubernetes.io/openebs provisioner. The underlying pieces such as integrating the AWS EBS volume into OpenEBS volume are handled by the OpenEBS provisioner.

Mileage may of course vary. We are building OpenEBS in the open in part to get feedback from users like those that prompted me to write this blog in the first place. Please share with the community experience of running OpenEBS on your Kubernetes based AWS ECS — whether your applications are Mercy or NoMercy. You can find the instructions and help [here](http://openebs.readthedocs.io/en/latest/install/cloud_solutions.html#amazon-cloud). And — yes — we welcome other bloggers 🙂 We’ve seen a huge ramp in issues and PRs and so forth in the last couple of months. The next step might be user blogging — please feel free and we’ll help if useful.
