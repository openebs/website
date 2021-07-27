---
title: Repeatable OpenEBS Mayastor deployments and benchmarks
author: OpenEBS
author_info: OpenEBS is the most widely deployed and easy to use open source storage solution for Kubernetes
tags: Mayastor,OpenEBS
date: 22-03-2021
excerpt: Learn about Repeatable OpenEBS Mayastor deployments and benchmarks
--- 

## Introduction

OpenEBS is one of the most popular Storage-related projects in CNCF, and the newest addition to OpenEBS - Mayastor, is a missing piece that has been absent from the Kubernetes stack for a long time - Kubernetes-native, high performance, distributed Software-Defined Storage or what is increasingly called Container Attached Storage (CAS).

As the lead developers of OpenEBS Mayastor, we want to be sure our message of an extremely high performing CAS is not only exciting, but also honest and easy to check. We want every interested user to be able to quickly and easily bring OpenEBS Mayastor up, properly tuned and ready for testing with whatever workload the user prefers to try.

In order to deliver on that promise, we have started a [“Demo Playground” project, open sourced on Github](https://github.com/mayadata-io/deployment-automation-playground/tree/main/demo-playground).  Contributions and feedback are welcome.


## OpenEBS

OpenEBS is a project with multiple storage engines, with each engine providing the user with different feature sets as well as different usage and performance characteristics. The currently available options can roughly be split into two categories:

* LocalPV: Excellent for workloads that deal with storage resilience at the application level, creating and managing their own replicas and capable of sustaining the loss of a single or multiple nodes, such as  Cassandra, and requiring very good storage performance, especially latency-wise.
* Replicated storage  (cStor, Jiva) - for workloads that are less performance-sensitive and some of the more advanced storage features such as synchronous data replication, snapshots, clones, thin provisioning of data, high resiliency of data, data consistency, and on-demand increase of capacity or performance.

Advanced features come at the cost of higher latency and lower performance, and yet, technology keeps advancing and trying to get the best of both worlds.


## OpenEBS Mayastor

OpenEBS Mayastor delivers on the promise of exciting new technology, utilizing NVMe (not just the disks, but the protocol and standards), NVMEoF, SPDK and io_uring. NVMes inside our servers deliver amazing speeds and latencies, huge numbers of IOPS, and using old SCSI or FC protocols only waste resources introducing overheads. Harnessing SPDK and NVMEoF OpenEBS Mayastor achieves speeds that are close to in-host NVMes, without compromising on workload mobility, resilience, flexibility, and enterprise features.

Still, all this exciting tech needs some proper care before it behaves as it should, and we still have a ways to go before it autotunes and autoconfigures itself just right with the help of Kubernetes and workload operators; and yet, as a user willing to take Mayastor for a spin, there should be no reason to wait, if the tuning and preparation can be automated now.


## Introducing: the Automation Playground

The Automation Playground provides an easy onramp for trying out OpenEBS Mayastor in a cloud or self-hosted environment and attempts to keep the installation process correct, standardized, and consistently reproducible, yet both simple and flexible.

The Playground utilizes popular and familiar software in order to apply the desired state configuration, as well as following a familiar Jenkins-pipeline-like approach.

The entire process is split into stages, with each stage extensible, replaceable and skippable, if need be, and each stage is called from a simple bash script, where each step is a function, easily copied into a CI engine as a pipeline stage.

The user experience is as simple as editing a single variables file in order to define the benchmark setup variables and running up.sh. The script will then iterate over the predefined stages, relying on the outcomes of each stage to run the next one

Variables are used to define such things as the setup name (prefixed in all the provisioned resources), user access credentials, Kubernetes installation types, provisioning details, and of course, OpenEBS Mayastor tuning as well as the benchmark itself. For more details, please see the vars file at [https://github.com/mayadata-io/deployment-automation-playground/blob/main/demo-playground/vars](https://github.com/mayadata-io/deployment-automation-playground/blob/main/demo-playground/vars)


## Stages

Each software lifecycle consists of several stages - provisioning, deployment, operations, and teardown.

Since we are flexible here, each stage can be skipped if it isn’t required in a given setup.

When running a benchmark on a set of self-hosted bare metal machines, the provisioning stage is not needed.

If Kubernetes is already installed, the Kubernetes installation stage can be skipped.

When running the Demo Playground on a host that has direct access to the machines executing the benchmark, the VPN stage can be skipped.

The only truly essential stages are node preparation and the actual OpenEBS Mayastor workload playbooks that will be installed.


#### Stage 1: Provisioning

At this step, we use Terraform to create a separate environment for the benchmark. Currently, the supported provisioning options are Azure and AWS EC2, with GCP support not too far behind. As a reminder, contributions (and feedback) are welcome.

Terraform is used to create a separate VPC (in EC2) or Resource Group (in Azure), where networking is configured, and VMs are provisioned as per the definitions in the vars file.

The nodes provisioned are of three varieties

* Master nodes (for Kubernetes Masters)
* Worker nodes (Kubernetes workers that will be running the workload - make sure these are powerful enough and include fast networking if you want to be able to stress Mayastor)
* Storage nodes (Kubernetes workers that will be running Mayastor). These instances should have fast local NVMe disks, which means LXs_v2 on Azure, m5d/m5ad/m5dn/i3 on AWS or n1/n2_standard with added Local-SSDs on GCP.

When provisioning is complete, an Ansible inventory file is generated by Terraform, to be used in later stages. The inventory contains all the node IPs split into groups and adjusted for the various Kubernetes installers in use.

If the provisioning stage is skipped, the user must provide the inventory.ini file in the workspace directory, with the file containing the [mayastor_clients] (non-storage workers) and [mayastor_storage] (storage nodes) groups.

#### Stage 2: Start VPN

This is a small stage, only required when the host executing Demo Playground is not inside the same subnet as the cluster nodes. The stage starts sshuttle after creating a script in the workspace directory. Sshuttle is described as a “poor man’s VPN” - an easy to use package that will tunnel all traffic for a given subnet through an SSH tunnel to a Bastion host.

During provisioning, the first Kubernetes Master host has designated the Bastion and will be used for this purpose, effectively working as a VPN concentrator for the Demo Playground setup, placing the executor host in the same subnet as the Kubernetes nodes.

#### Stage 3: Kubernetes setup

At this step, the Playground will deploy a pre-configured version of Kubernetes on the hosts as described in the inventory. If Provisioning was skipped, this means that the inventory file will have to be expanded with groups that are pertinent to the Kubernetes deployment in use; otherwise, the inventory generated in the Provisioning stage will contain all the required groups.

Currently two installation types are supported with more planned:

* Kubespray - a well known Ansible based feature rich Kubernetes installer
* K3S - a simplified and downsized Kubernetes distribution, which can be perfect for a small demo setup. This is also installed via Ansible.

At the end of the step, the script will extract the KUBECONFIG credentials file from a Master node and place it under workspace/admin.conf. If this stage is skipped, the user will have to extract and add this file manually.

#### Stage 4: Node preparation

In order to run OpenEBS Mayastor as well as other OpenEBS storage engines, some prerequisites need to be applied to the Kubernetes workers, both the storage and client nodes.

This includes making sure the iSCSI and NVMeo-TCP client packages are present, installing and enabling the various Linux kernel modules, enabling hugepages, and so on. Some of these settings might require a host restart.

The stage is implemented as an Ansible playbook, which allows it to reach into the hosts directly in order to prepare them, performing some actions a Kubernetes pod has limited access to.

At this point, we should have a working Kubernetes setup, with the different worker nodes prepared for using Mayastor either as storage hosts or storage clients.

## Playbooks

Actually, the proper stages end at Node Preparation, and then the playbooks take over.  The vars file contains a PLAYBOOKS variable, which lists all the playbooks the Playground will apply in sequence.

Currently, there is one playbook relevant to testing Mayastor - mayastor.yml

But the script will attempt to run any playbooks mentioned from the deployments directory one after another.

The Mayastor playbook follows the Mayastor installation instructions, creating the Kubernetes manifests and applying them to the setup, so that all the relevant Mayastor pods, DaemonSets, StorageClasses, Pools etc. are created in the Mayastor namespace, PVCs are created and ready to be used by the user’s workload.

The Mayastor playbook also contains an optional FIO test, which will create an FIO pod using the first created PVC and run a quick 1-minute benchmark.

## Conclusion

The Demo Playground project is still in very early stages, and we invite everyone to use, contribute and expand upon it. The goal here is to give the user interested in giving OpenEBS Mayastor a try, a ready tool that does the job in an open, honest, consistent, and reproducible manner.

The project’s flexibility allows for anyone to add in additional playbooks, which will deploy and run different workloads on top of Mayastor, and we intend to expand upon it, adding some workloads of our own beyond the basic FIO benchmark.

Please visit us at [https://mayadata.io](https://mayadata.io) and give the Demo Playground a spin at [https://github.com/mayadata-io/deployment-automation-playground/tree/main/demo-playground](https://github.com/mayadata-io/deployment-automation-playground/tree/main/demo-playground).

You can also find my colleagues and me spending time on the Kubernetes #OpenEBS slack, or at a [Discord room](https://discord.com/invite/zsFfszM8J2) set up to focus mostly on open source collaboration with Mayastor developers (Rusticians may be especially interested), and on the Data on Kubernetes community where a huge variety of users of Kubernetes for data are sharing their perspectives (https://dok.community/).


****About the author:****

![Dan Yasny](/images/blog/authors/dan-yasny.png)

Dan Yasny is a Principal Field Engineer at MayaData, previously he worked as a Field Engineer at ScyllaDB, an SDET, Technical Product Manager and a Sustaining Engineer at Red Hat, working on such projects as ScyllaDB, Kubernetes, OpenShift, KubeVirt, OpenStack, oVirt/RHV and more.