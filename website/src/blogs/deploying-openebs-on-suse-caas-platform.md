---
title: Deploying OpenEBS on SUSE CaaS platform
author: Ashok Babu
author_info: Senior DevOps consultant at Wipro works on App Anywhere & cloud-native technologies.
date: 24-04-2019
tags: Kubernetes, Cloud Native Storage, MayaData, SUSE, Container attached storage, OpenEBS
excerpt: I am recently introduced to OpenEBS, an easy to use persistent storage option for Kubernetes and found it nicely working on the SuSE CaaS platform where I could certify the cloud native databases. 
---

I am recently introduced to OpenEBS, an easy to use persistent storage option for Kubernetes and found it nicely working on the SuSE CaaS platform where I could certify the cloud native databases. In this blog, I cover a few quirks to get it running on the SuSE CaaS platform.

SuSE CaaS Platform is an enterprise-class container management solution that leverage Kubernetes as the orchestration layer and SuSE MicroOS as the host operating system for master and worker nodes.

SuSE CaaS provides enhanced security policies such as predefined pod security policies.

In SuSE MicroOS, a read-only Btrfs file system is used for the root file system with OverlayFS. Sub-volumes for data sharing is read-write.

Outlined below are some of the steps that need to be taken care while installing OpenEBS version 0.8.1 on SuSE CaaS Platform 3

## Issue

Default OpenEBS installation would fail on SuSE CaaS platform due to the following restrictions by the platform

- NDM Daemonset fails to spin up as it requires privilege permission
- Sparse pools will not be created as it uses by default /var/openebs directory which is read-only directory under root filesystem in SuSE CaaS.
- Runtasks in operator uses /var/openebs directory for temporary file creation due to this cstor-target pods or cstor-pool pod gets stuck in “ContainerCreating” status

## Resolution

### Step1

To install OpenEBS on SuSE platform run the following custom YAML file instead of default operator YAML

    kubectl apply -f https://openebs.github.io/charts/openebs-operator-susecaas.yaml

This is a customized operator YAML file for SuSE CaaS platform that uses the role `suse:caasp:psp:privileged` for creating privileged DaemonSet

[https://www.suse.com/documentation/suse-caasp-3/singlehtml/book_caasp_admin/book_caasp_admin.html#ex.admin.security.pod_policies.daemonset](https://www.suse.com/documentation/suse-caasp-3/singlehtml/book_caasp_admin/book_caasp_admin.html#ex.admin.security.pod_policies.daemonset)

### Step2:

Perform the following changes in the runtask after completing step1

Note: — This step is not required if you are using the OpenEBS version 0.9 which is the upcoming release.

- **Change the path in runtask for cstor-pool-create-putcstorpooldeployment**

        kubectl edit runtask cstor-pool-create-putcstorpooldeployment-default-0.8.1 -n openebs

    Change from

        path: /var/openebs/shared-

    Change to

        path /var/lib/overlay/openebs/shared-

- **Change the path in runtask for cstor-volume-create-puttargetdeployment**

        kubectl edit runtask cstor-volume-create-puttargetdeployment-default-0.8.1 -n openebs

    Change from

        path: /var/openebs/shared--target

    Change to

        path: path /var/lib/overlay/openebs/shared--target

### Step 3:

**Optional:** If you need to use sparse pool

    kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/5860c0a4619a9feddf5d75d11f50f2ea8fdcec82/k8s/demo/fio/demo-cstor-sparse-pool-limits.yaml

### Step 4:

Configuration of storage pool, storage class and PVC are like any other platform and the steps are outlined in [https://docs.openebs.io](https://docs.openebs.io/?__hstc=216392137.a6c0b8ba8416b65c52c0226c0e0b69fd.1579867391229.1579867391229.1579867391229.1&amp;__hssc=216392137.1.1579867391230&amp;__hsfp=3765904294)

Pool Configuration — [https://docs.openebs.io/docs/next/configurepools.html#manual-mode](https://docs.openebs.io/docs/next/configurepools.html?__hstc=216392137.a6c0b8ba8416b65c52c0226c0e0b69fd.1579867391229.1579867391229.1579867391229.1&amp;__hssc=216392137.1.1579867391230&amp;__hsfp=3765904294#manual-mode)

Storage class — [https://docs.openebs.io/docs/next/configuresc.html#creating-a-new-class](https://docs.openebs.io/docs/next/configuresc.html?__hstc=216392137.a6c0b8ba8416b65c52c0226c0e0b69fd.1579867391229.1579867391229.1579867391229.1&amp;__hssc=216392137.1.1579867391230&amp;__hsfp=3765904294#creating-a-new-class)

Volume — [https://docs.openebs.io/docs/next/provisionvols.html#provision-from-a-disk-pool](https://docs.openebs.io/docs/next/provisionvols.html?__hstc=216392137.a6c0b8ba8416b65c52c0226c0e0b69fd.1579867391229.1579867391229.1579867391229.1&amp;__hssc=216392137.1.1579867391230&amp;__hsfp=3765904294#provision-from-a-disk-pool)

## Conclusion:

Above approach can be followed to install OpenEBS 0.8 on SuSE CaaS platform 3.0 which needs additional configuration.

With OpenEBS 0.9 it would be simplified such that you would need to only apply the operator YAML to perform the installation.

**SUSE CaaS Platform:** (Container as a Service Platform) is an integrated software platform which automates the process of building, managing and upgrading of Kubernetes clusters. It combines the benefits of an enterprise-ready operating system with the agility of an orchestration platform for containerized applications. More details — [https://www.suse.com/products/caas-platform/](https://www.suse.com/products/caas-platform/)

**OpenEBS:** OpenEBS is the leading open-source project for container-attached and container-native storage on Kubernetes. OpenEBS adopts Container Attached Storage (CAS) approach, where each workload is provided with a dedicated storage controller. OpenEBS implements granular storage policies and isolation that enable users to optimize storage for each specific workload. OpenEBS runs in userspace and does not have any Linux kernel module dependencies. More details — [https://openebs.io/](https://openebs.io/?__hstc=216392137.a6c0b8ba8416b65c52c0226c0e0b69fd.1579867391229.1579867391229.1579867391229.1&amp;__hssc=216392137.1.1579867391230&amp;__hsfp=3765904294)

They have a very responsive community. Visit [https://slack.openebs.io](https://slack.openebs.io)
