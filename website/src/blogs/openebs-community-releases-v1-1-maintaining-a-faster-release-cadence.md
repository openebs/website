---
title: OpenEBS community releases v1.1, maintaining a faster release cadence.
author: Kiran Mova
author_info: Contributor and Maintainer OpenEBS projects. Chief Architect MayaData. Kiran leads overall architecture & is responsible for architecting, solution design & customer adoption of OpenEBS.
tags: Kubernetes, Microservices, OpenEBS, Persistent Volume, Stateful Workloads
date: 08-08-2019
excerpt: In this blog, I will provide a quick summary of the changes that were released as part of OpenEBS version 1.1 and also share some thoughts on the evolving project management process in OpenEBS and how it is helping to maintain a faster release cadence.
---

In this blog, I will provide a quick summary of the changes that were released as part of OpenEBS version 1.1 and also share some thoughts on the evolving project management process in OpenEBS and how it is helping to maintain a faster release cadence.

OpenEBS Release 1.1 has been about fixing and documenting the cross-platform usability issues reported by users and also laying the foundation for some of the long-overdue backlogs like CSI Driver, automated upgrades, day 2 operations, and others.

Before we get into the specifics of the current release, the last three OpenEBS releases have set an interesting precedent towards attaining a *monthly release cadence*.

OpenEBS was built by adopting the cloud-native and microservices principles, and it is almost only natural to also reap the benefits of true DevOps product with faster releases. It is easier said than done though! After having experimented with several tools and having looked at various open-source projects including Kubernetes, we have arrived at the following process, which is helping us maintain release cadence and thereby being responsive to the user requirements.

- Responsiveness — Almost all the active contributors and maintainers of the OpenEBS project are reachable and online in the OpenEBS Community Slack. OpenEBS has been credited as being one of the most responsive CNCF community projects — and thanks to the community, OpenEBS Developers are getting feedback directly from end-users. This eliminates layers of requirements for implementation and improves the feedback loop.
- Clarity of criteria for alpha and beta — Recently we clarified that our release gates are defined by OpenEBS Litmus based GitLab pipelines that run end-to-end tests on multiple different platforms and stateful workloads. Perhaps goes without saying — however we use these pipelines to catch any regressions. What is more — a feature is marked as Beta only after it has been added to the test pipelines. For example, LocalPV as of OpenEBS 1.1 is now Beta because it is passing these tests — and also is seeing a lot of production usage as well.
- Backlog grooming — At the start of the release, we look at the backlogs which are on [GitHub](https://github.com/openebs/openebs/issues). Items are selected based on contributor availability and balancing the development of new features, fixing existing features, updating and improving documentation, improving e2e coverage, and hardening the usage of OpenEBS on new platforms. As an example of a new platform, we have seen quite a bit of usage of especially the low footprint Jiva on ARM and are now releasing container images for built for the ARM64 architecture, making OpenEBS operational on RPi4 as well as Amazon A1 instances or Packet’s powerful ARM Compute servers. As another example, we are hardening the use of OpenEBS for Konvoy from our friends at Day2IQ — and shortly we will see Konvoy on OpenEBS.ci. As reminder OpenEBS.ci is a public way for showing that all commits to OpenEBS master are tested against a set of workloads and platforms. OpenEBS also now appears in the [OpenShift Operator Hub](https://github.com/openebs/helm-operator/blob/master/olm/README.md) and on the [AWS Marketplace](https://aws.amazon.com/marketplace/pp/MayaData-OpenEBS-Cloud-Native-Storage/B07TFS9Q8D) as well
- Tracking items — The list of selected items is tracked for the current release using these [Google Sheets](https://docs.google.com/spreadsheets/d/1bbphUqbxShBhgr1VHaEQUzIGMaJJacPNKc1ckNXU1QE/). It is not fancy, but it helps to get all the collaborators together and very easily provides a no-barrier objective follow-up — between release manager, leads, and reviewers. The format of the sheet is a modified version of what is used by Kubernetes sig-storage.
- Role of core committers — As core contributors, our responsibility is to detail the design and to list the implementation tasks — including covering the integration and upgrade tests. Each granular task is updated in the above project sheet and then we ask for help from the community to fix some of these items. The designs themselves are discussed and maintained as GitHub PRs [here](https://github.com/openebs/openebs/tree/master/contribute/design).
- Role of RC1 and RC2 — functionality must be checked into master before RC1 builds are started. Post RC1 it is mostly about corner cases, integration and upgrade tests. Only those features that can complete the upgrade testing within the RC2 timelines are considered for the current release.
- Role of release manager — Conducts follow-ups via daily standups on pending items and mitigating the risks by seeking additional help or by pushing the feature out of the release.
- The final two weeks — As we reach the end of a one month release cycle the focus turns to refactoring and adding more test cases while stabilizing the features rather than introducing new features. The last two weeks are also about polishing documentation and trying to reach out to users whose requests have been incorporated into the product to get some early feedback.
- What else? I haven’t spoken about the role of beta tests or dogfooding of the releases by using OpenEBS in our own hosted services such as OpenEBS director. Perhaps I’ll dig into these in a future blog. Bookkeeping tasks that start after the release also take a lot of time. For example, OpenEBS can be deployed via different partner platforms, each of which maintains their repositories for their Helm charts. Each of these partners are evolving with new guidelines for check-ins and they tend to go at their own pace. There is definitely room for improvement here and hopefully, the way the kubernetes apps are delivered will be standardized so that such bookkeeping tasks can be reduced.

*How do you run your Open Source projects? What tools do you use to improve productivity? Please drop in a comment. Would love to hear from you and improve the care and feeding of the OpenEBS community.*

Getting back to OpenEBS 1.1. The major features, enhancements and bug fixes in this release include:

- Upgrades! Support for the upgrade of OpenEBS storage pools and volumes through Kubernetes Job. As a user, you no longer have to download scripts to upgrade. The procedure to upgrade via Kubernetes Job is provided [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/1.0.0-1.1.0). Kubernetes Job-based upgrade is a step towards completely automating the upgrades in the upcoming releases. Would love to hear your feedback on the [proposed design](https://github.com/openebs/openebs/tree/master/contribute/design/1.x/upgrade). Note: Upgrade job makes use of a new container image called quay.io/openebs/m-upgrade:1.1.0.
- CSI — The CSI driver reached Alpha with initial functionality for provisioning and de-provisioning of cStor volumes. Once you have OpenEBS 1.1 installed, take the CSI driver for a spin on your development clusters using the instructions provided [here](https://github.com/openebs/csi). The addition of the CSI driver also requires a shift in the paradigm of how the configuration of the storage class parameters should be passed on to the drivers. We want to keep this seamless, please let us know if you have any inputs on what you notice as some of the nice to have as we shift towards the [CSI driver](https://github.com/openebs/openebs/tree/master/contribute/design/1.x/csi).
- Day 2 automation ongoing — There is a tremendous amount of work ongoing to further automate Day 2 operations of the cStor storage engine. Most of these changes did not make the current release because the nature of schema changes were larger than could be taken within the current release cycle. The feature is under active development and if you are interested in providing feedback on how this feature is shaping up, you can find the proposed design [here](https://github.com/openebs/openebs/pull/2595). Thank you to everyone that has already chipped in with ideas and feedback.

Perhaps the greatest highlight of this release is an increased involvement from OpenEBS user community pitching in with GitHub Issues as well as providing contributions.

![Giacomo Longo Message](https://cdn-images-1.medium.com/max/800/1*hZ7FK18EK2_PfjdCJB2OTQ.png)

Here are some issues that were raised and fixed within the current release.

- Fixed an issue where backup and restore of cStor volume using OpenEBS velero-plugin was failing when OpenEBS was installed through Helm. [@gridworkz](https://github.com/gridworkz)
- Fixed an issue with NDM where the kubernetes.io/hostname for Block Devices on AWS Instances was being set as the nodeName. This was resulting in cStor Pools not being scheduled to the node as there was a mismatch between hostname and nodename in AWS instances. [@obeyler](https://github.com/obeyler)
- Fixed an issue where NDM was seen to crash intermittently on nodes where NVMe devices are attached. There was an issue in the handling of NVMe devices with write cache supported resulting in a segfault. [Private User]
- Added support to disable the generation of default storage configuration like StorageClasses, in case the administrators would like to run a customized OpenEBS configuration. [@nike38rus](https://github.com/nike38rus)
- Fixed an issue where the cStor Target would fail to start when the NDM sparse path is customized. [@obeyler](https://github.com/obeyler)
- Fixed a regression that was introduced into the cStor Sparse Pool that would cause the entire Volume Replica to be recreated upon the restart of a cStor Sparse Pool. The fix was to make sure the data is rebuilt from the peer Sparse pools instead of recreating. Test cases have been added to the e2e pipeline to catch this behavior with Sparse Pools. Note that this doesn’t impact the cStor Pools created on Block Devices. [@vishnuitta](https://github.com/vishnuitta)
- For Jiva Volumes, created a utility that can clear the internal snapshots created during replica restart and rebuild. For long-running volumes that have gone through multiple restarts, the number of internal snapshots can hit the maximum supported value of 255, after which the Replica will fail to start. The utility to check and clear the snapshots is available [here](https://github.com/openebs/openebs/tree/master/k8s/jiva). [@rgembalik](https://github.com/rgembalik)[@amarshaw](https://github.com/amarshaw)
- Enhanced velero-plugin to allow users to specify a backupPathPrefix for storing the volume snapshots in a custom location. This allows users to save/backup configuration and volume snapshot data under the same location rather than saving the configuration and data in different locations. [@amarshaw](https://github.com/amarshaw)

***For detailed change summary, steps to upgrade from a previous version, or to get started with v1.1 please refer to:*** [***Release 1.1 Change Summary***](https://github.com/openebs/openebs/releases/tag/1.1.0)

In short, OpenEBS 1.1 shows that OpenEBS development is marching ahead faster and faster and delivering more and more features, fixes and platforms.

As always if you have any feedback or inputs regarding the OpenEBS project or project management — please reach out to me on [Slack](https://slack.openebs.io) or [GitHub](https://github.com/openebs/openebs/) or via comments here.



    Example yaml file:

        ---
        apiVersion: openebs.io/v1alpha1
        kind: StoragePool
        metadata:
        name: default
        type: hostdir
        spec:
        path: "/mnt/disks/ssd0"
        ---