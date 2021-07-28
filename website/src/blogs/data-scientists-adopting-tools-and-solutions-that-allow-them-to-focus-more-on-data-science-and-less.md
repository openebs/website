---
title: Data Scientists adopting tools and solutions that allow them to focus more on Data Science and less…
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Adalog, Data Science, Kubernetes, OpenEBS, Jupyter Notebook, Solutions
date: 24-05-2017
excerpt: Data Science as we all know is becoming crucial to many if not most businesses around the world. Data Science and ML are decidedly, the most trendy skills that a lot of people are aspiring to acquire or be associated with.
not_has_feature_image: true
---

Data Science as we all know is becoming crucial to many if not most businesses around the world. Data Science and ML are decidedly, the most trendy skills that a lot of people are aspiring to acquire or be associated with. In my recent interactions (in the context of hiring for OpenEBS) with college graduates and software engineers, the one question that pops up is, if they join OpenEBS, will they get a chance to work on ML / Data Science (and the answer is a definite “maybe” :)).

The lure towards “Data Science” has gone beyond the $$ paid to the Data Scientists. It is about the process of creating wonders. “Data Science” puts forth a unique mix of interesting challenges, that requires grappling with the enormous amounts of data and the mind numbing application of machine learning and computational algorithms, visualization, and soft skills. These aspects associated with “Data Science” are evolving, as depicted in this [data science Venn diagram](https://www.infoq.com/articles/christine-doig-data-science-team-discipline).

![Data Science Venn Diagrams](https://cdn-images-1.medium.com/max/800/0*FEPtZ-3YF48YMkRs.)

You can see this trend expressed in this graph of searches on Google as well. An interesting point is that “Machine Learning” has been neck and neck with “Data Science” until recently when “Machine Learning” started to be searched approximately 30% more frequently. And the gap between searches about Data Science and about Data Scientists has widened in the last couple of years; it seems people are about 3x more likely to be interested in Data Science than in the Data Scientists that actually do the work 🙂

![Graph of Machine Learning, Data Science, Data Scientist, and Deep Learning searches on Google](https://cdn-images-1.medium.com/max/800/0*Usx-pyQi3bHCTyJe.)

Interestingly, we have seen early OpenEBS users and contributors asking about OpenEBS delivering storage to containers running distributing nodes for Kafka or Spark or other pieces of a Data Science pipeline. We wanted to learn more about the needs of these users.

Thankfully, we are a little bit of a sister company to [Kensu.io](http://www.kensu.io/) as our Chairman [Evan Powell](https://twitter.com/epowell101) has been advising [Kensu](https://twitter.com/kensuio) as well. So we got in touch with the Kensu.io founders [Andy](https://twitter.com/noootsab) and [Xavier](https://twitter.com/xtordoir), who are co-creators of the [spark-notebook](http://spark-notebook.io/), which is the leading Scala notebook for data scientists working in the Spark community. [Andy](https://twitter.com/noootsab) and [Xavier](https://twitter.com/xtordoir) and their team have built and have helped to run some of the largest Data Science pipelines in finance and related fields in Europe; plus they are O’Reilly authors. They have been really generous with their time.

The TL;DR is — *data scientists still spend way too much time hacking together Data Science pipelines and if they only could orchestrate the end to end pipeline with Kubernetes/Mesos (which seems to be common in these environments) so that storage itself worked simply, this could be more productive, could recreate their results more easily, and might even work together better.*

In the rest of the blog I set out a little more specifically what we have learned and we share the beginnings of a recipe for Data Science on containers with OpenEBS as the storage. Please provide feedback to this blog or join the now hundreds of people on the [OpenEBS slack channel](http://slack.openebs.io/) and post your comments and feedback there.

**Data Science workflow hindered by infrastructure management tasks**

The workflow of a data science project typically comprises four stages as outlined below, with data scientists going back and forth between these stages, before arriving at product/insights in the form of a report, dashboard, or data service.

![Data Science workflow](https://cdn-images-1.medium.com/max/800/0*UCJHD8p2bNOemyC9.)

Each of these stages involves tasks that can be further classified into three distinct types depending on the nature of the task as follows:

Type 1: Data Science

Type 2: Best Practices or Governance

Type 3: Administer Infrastructure/Tools

Data Scientists are primarily interested in *Type 1: Data Science tasks*, some sample tasks under this category (at different stages of the workflow) are:

![Data Science tasks at different stages of the workflow](https://cdn-images-1.medium.com/max/800/0*t41w0qHFapFBWtX_.)

*One of the crucial requirements for the data scientist is to produce accurate and reproducible analysis by collaborating with larger teams. *[Martin Hack](https://twitter.com/mhackster)*, commented that he has come across situations where the accuracy of the models change from the time the models were generated to the time that they are presented to a wider audience. This is usually attributed to the change in the data using which the model was generated.*

The efficiency and confidence with which these tasks are performed or improved (in an iterative way) are dependent, in the current scenario, on some *best practices*. The best practices range from following certain naming conventions for the data files used to tuning infrastructure/tools — like databases, distributed systems that are used to run the analytical or modeling tasks.

Some sample Type 2: Tasks at different phases of the Data Science workflow are as follows:

![Tasks at different phases of the Data Science workflow](https://cdn-images-1.medium.com/max/800/0*IKPVzSqbyirvwZW5.)

The tasks mentioned above just provide a glimpse into the challenges associated with a typical data science workflow. In workflows that require creating models by using data from multiple live sources, tracking the accuracy of the data without having something like application error logs, becomes a harder problem to solve, if not impossible. This also leads to anxious data scientists who tend to keep their work private, unless a higher level of confidence is achieved on the models generated.

Talking of confidence, today we take pride in writing code that goes into production on day one, using automated continuous integration systems. Kensu is doing something similar, which can be considered as *Continuous Integration mixed with Live Monitoring of Data Sources.*

Andy and Xavier and the team are rolling out ***Adalog***, their software and SaaS solution, first for their existing professional service customers and then more broadly. While you can learn much more about Adalog on their website — [http://www.kensu.io](http://www.kensu.io) — as I understand its Adalog picks up all the relevant metadata of the data science pipeline and uses it, as well as the underlying systems themselves, to deliver compliance reporting and controls.

Data Science Notebooks (like [*Jupyter*](http://jupyter.org/), [Spark-Notebook](https://github.com/spark-notebook/spark-notebook), etc.,) and integrated products like Adalog have enabled improved and reproducible data since workflows, and deploying these notebooks towards containers have helped in boosting the productivity.

Yet, there are a few infrastructure related tasks that are not fully integrated into this workflow, which creates a manual dependency on the expertise of infrastructure administrators. At the same time, it also burdens the administrators/operations team to manage a new kind of workload in their environment.

Some of the tasks that fall under this *Type 3: Infrastructure / Operations* tasks from (from a storage operations perspective) are:

![Infrastructure / Operations tasks from (from a storage operations perspective)](https://cdn-images-1.medium.com/max/800/0*gcVdcir6RcbetPXe.)

*Andy and Xavier stated that they have the integration pieces with the data science tools, he finds that storage infrastructure related challenges remain and many of these would seem to be best solved with tighter integration by-products like OpenEBS that are fully containerized and hyper coverged, with products like Adalog.*

*Without a solution like OpenEBS that natively integrates into the orchestration and that containerizes the storage itself*

- *Capacity management is very tricky, where some of the tasks involve non-deterministic data bloating. Hitting disk space errors may result in the loss of many hours of processing.*
- *Managing the capacity for the local copies that need to be maintained for external data sources and keeping them in sync and distributing to team members can be very time consuming*
- *The dynamic nature of jobs that require bursts of IOPS/Throughput means that to be safe the systems are massively over provisioned which then means you need a large budget request even to just mess around in trying out new models for example*
- *Maintaining the provenance of the data along with the models for reproducing the results with the same accuracy they had during model generation is extremely difficult and without that the human workflow of many data science users is broken; imagine, for example, trying to compare the performance of multiple teams who are being evaluated based on the quality of their models if you cannot be sure that the training sets have remained trusted.*

*Andy says, these infrastructure and hand-holding of the workflow operations are what makes Data Science more of engineering than science.*

**Data Science workflow — storage management tasks automated by OpenEBS**

Docker and Kubernetes have eased the operations around maintaining large scale computational clusters, and with containerized and hyper-converged storage like OpenEBS, the operations can now provide storage for millions of containers without having to maintain separate storage silos.

Kubernetes and OpenEBS will help in further simplifying the infrastructure management tasks for the data science workflows by supporting automated storage capacity management based on the data source changes, auto-tuning of the QoS depending on the priority of the analytical task, and provide data provenance without laying an extra burden on the data scientists by deeper integration with the notebooks.

*For instance, the following is a glimpse of what can be achieved through deeper integration of Adalog with Kubernetes and OpenEBS:*

1. *Data scientists starts a new notebook ( or project ). This project is instantiated on the container cluster (say Kubernetes).*
2. *When a data source is specified for download, it would trigger provisioning of a new OpenEBS storage volume from this cluster for the data source. The capacity for this new volume is auto-managed by OpenEBS. Adalog would maintain the information of the volumes associated with a notebook.*
3. *When the notebook finishes downloading the data, it will trigger to create a snapshot of the downloaded data. Notebook can allow for regular syncing with the source to check for updates and download the incremental data etc., Adalog would track the snapshots of the volume used by the notebook.*
4. *As data scientists start exploring the data, there are provided with read-only access to the snapshot of the data-source that is already downloaded. And new storage volumes are created for storing the temporary files. Adalog can associate the volume created with the user who initiated the data generation.*
5. *When a certain exploration is aborted or cleared from the notebook, the associated volume ( and all the temporary files) are also cleared from the storage. Adalog would keep track of the functions and models generated via the exploration phase along with metadata information about the results generated, even though the volumes (data) is deleted.*
6. *OpenEBS volumes come with fine-grained allocation of resources and auto-tuning which can help with running high-priority modeling jobs faster than the others.*
7. *From Adalog, the user can trigger OpenEBS volumes (data) to be backed up or restored from S3 bucket.*

As a next step, we are planning to provide a sandboxed version of adalog running on Kubernetes and storage managed by OpenEBS. Much like the vagrant box we built to enable OpenEBS to be tried out on Kubernetes, and then became a favorite tool of some largely for trying out Kubernetes — we are hopeful that this sandbox will be useful as well as being a way to see OpenEBS in action.

*If you want to earn massive open-source karma (and stickers of course) — let us know on our *[*OpenEBS Slack channel*](http://slack.openebs.io/)* that you’d like to help with this solution building exercise.*
