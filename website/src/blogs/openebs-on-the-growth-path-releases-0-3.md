---
title: OpenEBS on the Growth Path! Releases 0.3
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Jupyter Notebook, Kubernetes, OpenEBS, Postgresql, Storage Containers
date: 29-06-2017
excerpt: It gives me immense pleasure to watch this baby (OpenEBS) successfully cross another milestone with its 0.3 release.
not_has_feature_image: true
---

It gives me immense pleasure to watch this baby (OpenEBS) successfully cross another milestone with its 0.3 release. OpenEBS 0.3 not only marks the delivery of additional functionality but also comes with an all-rounded growth.

Thanks to our growing community (as depicted in the diagram below), we have had great conversations with thought leaders in the container world, who are constantly looking for ways to simplify the usage of Containers and Container Orchestrators. We seem to have hit a sweet spot in terms of what we set out to deliver with OpenEBS, which is resonating loud and clear with anyone, who is venturing to run persistence workloads in containers.

![OpenEBS community tracker](https://cdn-images-1.medium.com/max/800/1*wnMG__-zl8yO06f7AAJh5w.png)  

While we have seen steady growth in the followers/subscribers on our community channels, we have also seen steady growth in the contributors to the project and we are happy to announce that we have been able to expand our team members at CloudByte(from across the world), to work full-time on OpenEBS.

Significant functionality changes include:

- OpenEBS Storage Containers (VSMs) are completely orchestrated and managed via Kubernetes.
- VSMs seamlessly work with your preferred pod networking
- OpenEBS supports dynamic provisioners like EBS and GCP
- *maya*, the Storage CLI can be used to fetch granular IO usage statistics similar to your Amazon Cloud Watch

Additional changes can be looked up at our [OpenEBS Project Tracker](https://github.com/openebs/openebs/wiki/Project-Tracker).

We are very attentive towards making the onboarding experience as smooth and simple as possible. OpenEBS 0.3, fully integrates into Kubernetes, allowing you to use OpenEBS storage on your existing Kubernetes using the following simple commands:

---

`kubectl apply -f openebs-operator.yaml`
`kubectl apply -f openebs-storageclasses.yaml`

---

The YAML files can be downloaded from [here](https://github.com/openebs/openebs/tree/master/k8s). If you don’t have an existing Kubernetes cluster, you can easily set it up using our [vagrant box](https://blog.openebs.io/multi-node-kubernetes-1-6-cluster-provisioning-made-easy-using-sandbox-vagrant-box-53dfc2ecc3cd). Detailed instructions for running OpenEBS on GKE can be found [here](https://github.com/openebs/openebs/blob/master/k8s/hyperconverged/tutorial-configure-openebs-gke.md). You could also use our [Ansible Playbooks](https://github.com/openebs/openebs/blob/master/e2e/ansible/openebs-on-premise-deployment-guide.md) to setup Kubernetes cluster with OpenEBS storage on-premise on physical servers OR virtual machines.

We also have (with the help of the community) focused efforts in providing [examples](https://github.com/openebs/openebs/tree/master/k8s/demo) of persistence work-loads. In the current release, we are happy to provide the following:

- Clustered PostgreSQL Setup (inspired from [CrunchyData](https://www.crunchydata.com/))
- Containerized Jupyter Notebooks (inspired from [kensu.io](http://www.kensu.io/))

The growth, in terms of the distributed teams, comes with the challenges of collaboration and maintaining the quality of the commits. One of our focuses with OpenEBS release 0.3 has been to augment our repositories with the tools that keep a watch on the code and product quality — we are now fully integrated with Travis, Codecov, GoReport and have built Ansible Playbooks for running CI via Jenkins.

---

As we accelerate towards our enterprise version of the product towards the end of this year, we are all excited about the immediate milestones w.r.t:

- Flush-out the details of Storage Infrastructure as Code (single source of truth)
- Integrating into Container Monitoring Frameworks
- Providing a UI
- Optimize for high performance storage and networking infra.
- Provide additional examples of Persistence Workloads that make use of the Application aware intelligence provided by OpenEBS

We always love to hear from you and what you think are the biggest storage operations pain points that you want to see eliminated. Do drop into our *[Slack Channel](http://slack.openebs.io) or stay connected with us via our other channels [Twitter](https://twitter.com/openebs), [GitHub](https://github.com/openebs/openebs/)*.
