---
title: Storage infrastructure as code using OpenEBS
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
tags: Containerised Storage, DevOps, Kubernetes, OpenEBS, Stateful Applications
date: 29-06-2017
excerpt: With a vision to become de-facto block storage choice for stateful container applications, OpenEBS brings out many unique features to the open source storage space.
not_has_feature_image: true
---

With a vision to become de-facto block storage choice for stateful container applications, OpenEBS brings out many unique features to the open-source storage space. One of the unique features that I talk about in more depth in this blog is “how storage platform builders and storage platform users can manifest their requirements as code using OpenEBS”.

With all the agility in Container and DevOps space, we are moving towards the thinking — “using infrastructure components such as network and storage for the application development should not be external to application development”. What I mean by this is, just like you write the code for your applications, you should be able to write some code or configuration for obtaining the storage and network infrastructure and you should get it.

#### The YAML: Infrastructure coding language

In the paradigm of infrastructure as code, YAML is becoming the default coding language. Thanks to the increasing usage of YAML config files by the DevOps eco-system, they are becoming the default developer language to write the infrastructure code for the application development.

So, let us see what are the areas in which storage as infrastructure has to be thought in terms of code? This can be answered using the angle of who interacts with storage or the user persona. The simple answer would be the application developer and storage platform engineer. Next, what are the challenges today for a developer of a stateful application and the developer or engineer of an underlying persistent storage platform? In short, the developer needs

- Some amount of persistent storage
- With guaranteed availability
- With guaranteed latency

The developer needs to quantify the amount of storage and the latency levels, which is a challenge always. The developer always starts with a guesstimate and refines later. The guaranteed availability is a characteristic of the underlying storage platform, but the developer may still need to decide some aspects related to the availability such as “how many copies of the data is needed, how often backups are to be taken, etc”. All these decisions to be taken by the developer, bring in the need for storage expertise or knowledge to the application developer, which usually is an additional burden to the developer. Traditionally, these decisions are taken by storage administrators who are adjacent to the application developers, creating a gap between what is needed and what is available. As the application scales, this gap widens, the application fails. **Yes, because something went wrong with storage!!**

The solution to this well known and well understood problem is to move towards a system where the application developer auto-magically gets help from the underlying storage system and he/she can continue to express/code the storage needs through the YAML language. The “so-called” storage administrator in the enterprise is going to be helped with an intelligent-storage-robot working continuously to align the storage to the application needs. With OpenEBS, the “intelligent-storage-robot” comes as an inherent component of the storage platform. The storage administrator can scale the platform and manage it at ease and do the job very well.

The intelligent-storage-robot or what we call OpenEBS as “Storage bot” handles the tough job of automating the storage actions such as

- Updating the storage catalogues for application developers
- Work with the storage platform to identify the capacity change needs, migration needs, backup needs and coordinate with the application
- Work with the application for scheduling application aware snapshots, capacity management, data migration changes, automated data recovery etc
- Work with a centralized ML engine (if there is one) to upload the application behaviour or to learn about the application behaviour so that it becomes more intelligent

![Storage bot helping app developer of stateful container application and storage admin of the platform](https://cdn-images-1.medium.com/max/800/1*3wWTPR7i1gAVagzBYlOBmg.png)
(***Storage bot helping app developer of stateful container application and storage admin of the platform***)

As depicted above, the storage solution designer is replaced by a storage-Bot (code) which is more effective as it predicts and updates the parameters of the storage platform as well as the application in real-time.

#### OpenEBS helps to manage storage needs with YAML language/code

OpenEBS divides the storage configuration into two parts. One, that the storage platform engineer has to design/manage and the other that the application developer has to design/manage.

**The platform YAML file**

The platform configuration is specific to OpenEBS and the initial version is available at -

[https://github.com/openebs/openebs/blob/master/k8s/openebs-config.yaml](https://github.com/openebs/openebs/blob/master/k8s/openebs-config.yaml)

The storage platform engineer develops this YAML file to scale the storage platform from few nodes to thousands of nodes across multiple locations. The YAML files can be version-controlled in a git repository and deployed into production to roll out the storage build-up process.

![Storage platform deployment through YAML file automation](https://cdn-images-1.medium.com/max/800/1*WiZS5A4iLPeMtwxUmdxunQ.png)
(***Storage platform deployment through YAML file automation***)

A real example of this automation would be something like —

---

*the storage bot senses that there is a flood of large block size reads about to hit on a postgres-volume-246 which has its copies on node2 and node4 and to satisfy the latency needs of this volume, the read-cache on node4 is insufficient and one of the spare SSD on node4 can be re-purposed as read-cache temporarily. Storage bot learns this situation, makes the decision to do so and modifies the openebs-config.yaml on node4 as a new git version and rolls out the config file. Once the workloads are processed successfully after a few hours/days, the read-cache SSD is re-purposed back by the storage-bot either by updating the config again or by rolling back the config change.*

---

The above is a very simple example and more complex things like “automated data migration to a correct node or correct tier, adding compute and memory resources to the storage controller nodes on the fly, automated software upgrades, etc” can all be achieved by the storage-bot using the git-versioned openebs-config.yaml files

**The application YAML file**

Now to the application developers paradise 🙂

OpenEBS readily provides the storage configuration templates/storage catalogs for various stateful applications and application variants. The storage classes will be an ever-growing list with more participation from the community, but the initial version is at — [OpenEBS Storage Classes](https://github.com/openebs/openebs/blob/master/k8s/openebs-storageclasses.yaml)

The storage class will help the application developer with various storage config parameters. Some of the possibilities are:

— Initial capacity, capacity growth rate per week/month, latency expectations, active data size (hot/cold data ratio), backup schedules, application data patterns, number of copies to be saved, typical instructions during upgrades, data migration boundary conditions, etc

As you can see, the above actions form a major part of the job of storage administrator who plans, designs, and executes the storage parameters. In the case of OpenEBS, the application developer can code these requirements into the application YAML file and the OpenEBS storage bot will enforce and help continuously optimize this file as well. This, I believe is a huge step forward in the journey of simplifying the storage infrastructure interface to the application developers.

OpenEBS is in the early days. With the release of OpenEBS 0.3, the DevOps users have an option to get the container-native block storage for their stateful workloads orchestrated by Kubernetes. OpenEBS 0.3 release is the first step in making the storage infrastructure as code possible.

Looking forward to receiving feedback/comments/criticism on this topic. We are lurking on slack at [https://openebs-community.slack.com/](https://openebs-community.slack.com/)
