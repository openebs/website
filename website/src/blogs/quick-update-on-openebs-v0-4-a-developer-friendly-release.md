---
title: Quick update on OpenEBS v0.4 — a developer friendly release!!
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Container Native Storage, Container Orchestration, minikube, Open Source, Updates, OpenEBS
date: 03-10-2017
excerpt: OpenEBS v0.4.0 is out and I take pride in sharing that it is powered by the same set of tools, used by communities that have adopted DevOps DNA for delivering products.
---

[OpenEBS v0.4.0](https://github.com/openebs/openebs/releases/tag/v0.4.0) is out and I take pride in sharing that it is powered by the same set of tools, used by communities that have adopted DevOps DNA for delivering products.

Personally, for me, the most exciting part of this release is that it involves contributions from community members across the globe. We have crossed more than 100 Pull Requests from 25+ contributors.

Our decision to remain OpenSource is paying off!! As new contributors come on board, the following DevOps tools are helping us to sustain the quality:

- [Github ](https://github.com/openebs/openebs/issues)for collaboration — managing code reviews, releases, and now project management (issues and milestones).
- [Travis ](https://travis-ci.org/openebs/) and [DockerHub ](https://hub.docker.com/r/openebs/)— validate the code commits and release new docker images
- [Jenkins and Ansible](https://github.com/openebs/openebs/tree/master/e2e) — run the e2e tests on the new docker images.
- Static Analysis is provided through a wide range of tools like gofmt, flake8, codecov, goreport, and the list needs to expand.
- [ReadTheDocs ](http://openebs.readthedocs.io/en/latest/index.html) — updating the live documentation site

OpenEBS, like other storage options (EBS, Rook, and others), is already deeply integrated with Kubernetes and is now part of the [kubernetes-incubator project](https://github.com/kubernetes-incubator/external-storage/tree/master/openebs). OpenEBS also provides similar intuitive mechanisms to provide block storage to your stateful application on Kubernetes using concepts like:

- StorageClasses
- PersistentVolumeClaims
- PersistentVolumes
- DynamicProvisioner

In addition, unlike others, OpenEBS delivers container-native storage by *using Kubernetes (as opposed to running on Kubernetes)* itself as the underlying framework for scheduling and storing configuration data. There are also efforts underway for the upcoming release to make use of Kubernetes *LocalStorageManager, Kube-Dashboard, and CNCF projects like Prometheus, FluentD, Grafana, Jaegar*, etc., for managing and monitoring the storage functionality.

You can easily get OpenEBS running on your Kubernetes Cluster with the following two commands and then point your application’s PVC to one of the OpenEBS Storage Classes.

`kubectl apply -f openebs-operator.yaml`  
`kubectl apply -f openebs-storageclasses.yaml`

The above YAML files can be downloaded from [here](https://github.com/openebs/openebs/tree/master/k8s). For detailed instructions refer to our [quick start guide](http://openebs.readthedocs.io/en/latest/getting_started/quick_install.html) or checkout our [sample stateful applications](http://openebs.readthedocs.io/en/latest/install/install_usecases.html) which include Percona, Jupyter, Postgresql, etc.,

While you are at the documentation, you can also check out the additional deployment options that we have added with this release:

- [Running Kubernetes and OpenEBS on AWS](http://openebs.readthedocs.io/en/latest/install/cloud_solutions.html)
- [Running Kubernetes within minikube](http://openebs.readthedocs.io/en/latest/install/dev_solutions.html)

Though we are still in the first leg of our journey, with OpenEBS v0.4, you get usable container-native storage, with enterprise storage capabilities like detailed *Volume IO statistics* and *Snapshots*.

*Please refer to the [CHANGELOG](http://openebs.readthedocs.io/en/latest/release_notes/releasenotes.html), for a summary of updates in v0.4 and [ISSUELOG](https://github.com/issues?q=user%3Aopenebs+and+is%3Apr+and+merged%3A%3E2017-06-23+sort%3Acreated-asc)for the list of Pull Requests.*

And we are always looking for help from OpenSource savvy community members. You can contribute in several ways — take your pick from our growing [task list](https://github.com/openebs/openebs/labels). Join us on [#Slack](http://slack.openebs.io/).
