---
title: The Myth of THE database
author: Evan Powell
author_info: Founding CEO of a few companies including StackStorm (BRCD) and Nexenta — and CEO & Chairman of OpenEBS/MayaData. ML and DevOps and Python, oh my!
date: 21-08-2019
tags: DevOps, Kubernetes, OpenEBS, Postgresql, Database
excerpt: In this blog I briefly discuss the disaggregation of the DB at what might be called the macro or architecture level and then at the micro or intra DB level. 
---

I feel blessed these days to be on the front lines of Kubernetes becoming the preferred platform for running all workloads, including high value stateful workloads.

One pattern many of my investor friends — and even new MayaData team members not already encamped in the CNCF ecosystem may be overlooking — is the demise of the THE database pattern. Actually looking back at a DBaaS on Kubernetes blog I wrote less than a year ago I think I didn’t emphasize enough that there is rarely one layer, or one DB at the core of it all. (see that blog [here](https://blog.openebs.io/running-your-own-dbaas-based-on-your-preferred-dbs-kubernetes-operators-and-containerized-storage-3cc36ba115b8) if you are curious — it is a popular one :))

In *this* blog I briefly discuss the disaggregation of the DB at what might be called the macro or architecture level and then at the micro or intra DB level. I then offer a couple of considerations.

### Macro level — the THE database evaporates

As has been explained by Zhamak Deghani of ThoughtWorks in her excellent blog How to [Move Beyond a Monolithic Data Lake to a Distributed Data Mesh](https://martinfowler.com/articles/data-monolith-to-mesh.html) and on [Software Engineering Daily ](https://softwareengineeringdaily.com/2019/07/29/data-mesh-with-zhamak-deghani)— the data mesh pattern implies:

- Disaggregating or distributing responsibility and autonomy
- Disaggregating or distributing the role of the DB itself

Typically this pattern can be easily identified when chatting with a larger user of OpenEBS when we ask “so, what DBs and other stateful workloads like logging systems are you running?”

If they give us an answer such as MySql, Prometheus, one of the 438 new *SQL projects* and maybe Elastic and then *stop* — then we know they are either early in their Kubernetes deployment or that IT still runs the show. As such they may not be a great fit for doing the work necessary to achieve the data agility that comes from containerizing and distributing your data and data management in a cloud native and cloud agnostic way.

Conversely if their reply to the question is to sort of look at us like that’s an *interesting* question — and reply by saying “pretty much all of them — whatever the teams need” then we are off and running — we’ve found a kindred spirit and we typically dig into a discussion covering all sorts of topics such as:

- How they use GitOps to manage storage classes and possibly extend them to cover data resilience and back up?
- What do they do about anti patterns that persist — such as the use of NFS?
- What is the average tenure of a cluster? (often not long)
- Rolling upgrades of stateful workloads?
- Favorite and not so favorite operators?
- WeaveScope / Kubera director for visualization or something else?
- Lock-in — anyone care? (meh — bosses do)
- Blast radius — anyone care? (generally yes)
- How about consistency between dev, test, and production?
- Encryption — key management — in flight and at rest?

We invariably learn a lot and by sharing what we have learned we teach a bit as well. I had such a conversation before sitting down to write this and the lessons the engineer had learned while helping to build a very large container based environment at a NYC financial environments were priceless.

In short, instead of having a central database to store all the things — or a data lake or similar — one disaggregates control over the data in order to “shift left” and enable small teams to move faster. A primary role of Kubernetes engineers working with data — sometimes the data ops or analytics infrastructure teams — then becomes to provide paved paths that come with compliance, back-up, monitoring and more “for free” from the perspective of the small loosely coupled teams building particular stateful microservices.

### Micro level — the THE database itself is complex

Examine any database closely and you’ll find that it is comprised of a number of components and that increasingly the architecture is pluggable — so you can have many different flavors of a database.

An example PostgreSQL has 5 primary types of configurations to consider — as explained in this well written blog by Chitji Chauhan of severalnines.

[https://severalnines.com/database-blog/guide-postgresql-server-configuration-parameters](https://severalnines.com/database-blog/guide-postgresql-server-configuration-parameters)

And choosing which one to use depends in part upon where the data is being stored and how that storage is configured.

So what can you do about it — how can you or your central committee of data architects pick THE right solution?

Again — the answer is to distribute the decision to those closest to the use cases for the data itself — the engineers building the microservices that include these workloads. Instead of endless meetings or design reviews to arrive at the perfect central DB or DB service — try what works for you and move along. If you run in a containerized way with the help of Kubernetes and a cloud agnostic storage layer like the CNCF project OpenEBS and you use something like Kafka or just NATS for messaging or maybe Pulsar for that matter — then you don’t have an irrevocable choice that may plague you for years to come and can better fit a particular database with a particular set of configurations for a particular job you want done.

We see users adopting OpenEBS for truly per workload, per DB storage, and deciding whether to use one of the storage engines within OpenEBS, either LocalPV or cStor, and settling upon some tuning and some patterns with the help of Litmus or other testing systems and Kubera Director or some other means of tracking performance and visualization. These best practices — for example which time series DB to use and how to configure it and even where to run it and how to back it up — are then encoded in YAML. And then something like Flux from Weaveworks or a home built GitOps solution is used to manage these artifacts. The promise is the ease of use of a public cloud — for the developer at least — with massively greater customization and control including freedom from cloud lock-in.

Databases will evolve further to leverage Kubernetes by using Kubernetes for capabilities that previously every distributed data system had to build and operate itself. As an example you have in almost all distributed systems including DBs a means of determining what resources are available — if you know Kubernetes than you’ll know that etcd plays this role in Kubernetes and that when it comes to storage resources such as disks and cloud volumes that the NDM components of OpenEBS extend etcd to play this role. Increasingly we see savvy technology companies looking at Kubernetes as their common denominator, and expecting their infrastructure to add to Kubernetes where appropriate as opposed to every piece of software reinventing the wheel.

### TL;DR — Freedom from disaggregation is good

The good news is that it is increasingly less likely you’ll be stuck managing someone else’s NoSql or NewSql system du jour years after the choice was made. Yes, databases are sticky and important however increasingly they are also fit for *specific purposes* and able to be used and disposed of when no longer needed. As the team at MayaData has pointed out many times in various blogs and Slack sessions and talks, the average size of a database on Kubernetes in a microservices environment is smaller than in traditional centralized architectures featuring THE database.

What is more — many of the benefits of going towards a distributed data model and moving beyond the “THE database” pattern are best captured if the underlying storage itself is disaggregated and distributed. Conversely, if you shift away from one central DB or data lake to a disaggregated model and then tie everything together with a single storage system or service or cloud then actually you’ve just shoved the issue and the constraints down a level. And they will bob to the surface when you are dealing with the rapids of the non happy path — for example, upgrades, or replacements, or migrations, or when you have an outage from which you need to recover.

So if you think that disaggregation and distributed control and responsibility are important for your databases, please do stop by and say hi to us in the OpenEBS community. There are a lot of folks there now helping to build the disaggregated data future — integrators, fellow developers, contributors from databases and OpenEBS and other projects.

I hope to see you there. [https://openebs.io/join-our-slack-community](https://openebs.io/join-our-slack-community)

![Join OpenEBS channel](https://cdn-images-1.medium.com/max/800/1*L1XVBW58MDn_wksYj2nKgg.png)
