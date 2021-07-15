---
title: OpenEBS releases 0.8.1 with stability fixes and improved documentation
author: Uma Mukkara
author_info: Contributor at openebs.io, Co-founder & COO@MayaData. Uma led product development in the early days of MayaData (CloudByte).
date: 25-02-2019
tags: CAS, Cloud Native Storage, Kubernetes, OpenEBS, Stateful Applications
excerpt: OpenEBS 0.8.1 is released today. In spite of being a tagged as a minor release, it has significant stability improvements and few important features. 
---

OpenEBS 0.8.1 is released today. In spite of being a tagged as a minor release, it has significant stability improvements and few important features. OpenEBS community is growing and we are receiving more feedback. Most of the issues fixed in this release are in response to the feedback received from the community. In this blog article, I will capture some important highlights of the 0.8.1 release, for more details on the actual bugs fixed, see release notes.

**Upgrade recommendation:**

We are recommending users of OpenEBS with cStor with Fedora 29 please upgrade to 0.8.1 as it contains an important fix that can increase the stability of the environment including avoiding possible node reboots by addressing underlying iSCSI and Kubernetes bugs. We are available to help on the community so please do get in touch if we can be of assistance.

---

## Highlights of 0.8.1 release:

### Stability fixes:
![image](https://cdn-images-1.medium.com/max/800/1*7BRJmxRw7IKONv7KKAgnkg.png)
#### iSCSI discovery bug leading to Kubernetes node reboots:

Some community users reported that Kubernetes cluster is becoming unstable sometimes when OpenEBS is in use. We worked with community and debugged their issues to find the root cause. After deeper analysis, we found that Kubelet continues to increase in memory usage and finally resulting in that particular node going for a reboot, causing the cluster to becoming unstable. An [issue has been reported already in Kubernetes on Kubelet](https://github.com/kubernetes/kubernetes/issues/70890), and in our case, same situation is being triggered from a different set of components, namely open-iSCSI and Fedora Kernel.

Here are more details:

1. We discovered a [bug Ferora 29’s Kernel](https://bugzilla.redhat.com/show_bug.cgi?id=1679565) . The kernel does not respond to a socket read request if the request size is less than the watermark (in cStor target’s case, the water mark is set to 48) if the data becomes available after the read request is made. This works without issue if the data is already available when the request arrives at the kernel.
2. Kubelet executes an iSCSI client command for discovery of the target. During this target discovery connection, the requested size to the kernel is 16 bytes and could result in the above mentioned situation if you are on Fedora 29. If the iSCSI client or initiator does not receive the response to the discovery request, it times out after 30 seconds and the connection is retried. After 5 retries, the iSCSI client hits a bug where it returns an infinite amount of data to Kubelet, which ends up reading all of the returned data. Kubelet then consumes the entire available memory and creates an out-of-memory situation, causing the node to reboot. We have created an [open issue at open-iscsi](https://github.com/open-iscsi/open-iscsi/issues/155) for this bug as well.

In summary, when using Fedora 29 and open-iscsi, Kubelet experiences an out-of-memory issue if the iSCSI target’s TCP watermark is set to any number greater than 16. It was set to 48 by cStor’s iSCSI target. In 0.8.1, we set the watermark level to 1 and avoided the above bugs or issues (in Fedora, open-iscsi and kubelet)

All users running cStor with Fedora 29 are advised to upgrade to 0.8.1 release.

**Documentation improvements**

Our docs also received significant improvements. Simplified instructions and getting-started steps are provided to new users, and more troubleshooting scenarios are covered for advanced users. We have also certified cStor 0.8.1 for use with many stateful applications like GitLab, ElasticSearch, Minio, and Prometheus with the latest Helm charts and user documentation updated accordingly.

![New docs — Stateful Applications with OpenEBS](/images/blog/stateful-applications-in-openebs.png)

User guides for backup and restore and RWM support are also important parts of this new documentation.

![Backup and Restore Applications using OpenEBS Persistent Volumes](/images/blog/backup-and-restores.png)

**Improved MayaOnline Capabilities**

MayaOnline is always adding more features. You can now debug your OpenEBS-powered Kubernetes cluster even more easily. With the recently added logs feature, OpenEBS volume and pool pod logs are now automatically uploaded and available to you on MayaOnline. You can run a pod describe of any Kubernetes resources in the topology view. This requires only two clicks to get to any Kubernetes resource-describe.

![Kubernetes resource “describe” on MayaOnline topology view](/images/blog/mayaonline-topology-view.png)

**Summary:**

As stated before, we recommend all cStor users upgrade to 0.8.1. We always welcome your feedback, so if you would like to see a new feature or need to report a problem, write a GitHub issue at [https://github.com/openebs/openebs/issues](https://github.com/openebs/openebs/issues)

Join our slack community at [https://slack.openebs.io](https://slack.openebs.io/?__hstc=216392137.be744436714e40be6d0b15e325bdf0b3.1580126064003.1580126064003.1580126064003.1&amp;__hssc=216392137.1.1580126064004&amp;__hsfp=3765904294)

Enjoy using the 0.8.1 code! :)

. . .

## Other Notable Additions

**Liveness Check for cStorPool Pods**

Sometimes when using network disks such as cloud provider disks or iSCSI disks from local SAN, it is common to experience intermittent disconnection of locally mounted disks. In such scenarios, cStorPool could move into a suspended state and require a restart of the cStorPool instance pod on that node. A liveness check probe has been added in 0.8.1 to help fix this issue. In the event of network disks undergoing a network connection flip, the disks get disconnected, cStorPool instance becomes unresponsive, liveness check probe restarts the pod and disk connections are re-established.

Because cStor volumes are replicated into three cStorPool instances, losing a cStorPool instance temporarily because of a restart causes volumes to be resilvered from the other pools.

**Ephemeral Disk Support**

In 0.8.0, cStor does not provide high availability of the data if volumes are set up for replication across local disks of cloud providers such as AWS instance stores or GCP local SSDs. The local SSDs on cloud providers do not retain the data when the VMs are rebooted because a completely new VM is provisioned with newly formatted local disks. This scenario was also discussed in [another blog post](https://blog.openebs.io/introduction-to-openebs-cstor-pools-and-considerations-during-k8s-upgrades-19efe424715a?__hstc=216392137.be744436714e40be6d0b15e325bdf0b3.1580126064003.1580126064003.1580126064003.1&amp;__hssc=216392137.1.1580126064004&amp;__hsfp=3765904294#3fb6) and in the [0.8.0 docs](https://v08-docs.openebs.io/docs/next/cstor.html?__hstc=216392137.be744436714e40be6d0b15e325bdf0b3.1580126064003.1580126064003.1580126064003.1&amp;__hssc=216392137.1.1580126064004&amp;__hsfp=3765904294#known-limitations).

Ephemeral disk support is also added for cStorPools in 0.8.1. Now, users can use AWS instance stores or any other ephemeral local SSDs for setting up a highly available Kubernetes native cloud storage across zones for their stateful needs. When a Kubernetes node is lost, a new node arises with the same label and the same number of disks. OpenEBS detects this new node and a new cStorPool instance is also created. After the pool instance is set up, cStor rebuilds the volume replicas into the new cStorPool instance from the other volume replicas. During this entire process, the volume replica quorum needs to be maintained. For more details on this feature, see the docs section.

**Support to Extend cStorPools onto New Nodes**

cStorPools expansion feature is another good addition in this release. In 0.8.0, the pools, once set up, could not be expanded to new nodes. In 0.8.1, support is added to expand StoragePoolClaim configuration to include more nodes. For example, if you have a StoragePoolClaim config with disks from 3 nodes, and if you are want to add a new cStorPool instance, you can add the disk CRs from the new node to spc-config.yaml and mark the max pools as 4. Once you apply the new spc-config.yaml, the pool configuration will be increased to 4 cStorPool instances.

**cStor targetNodeSelector Policy**

Setting node selectors to targets were limited exclusively to Jiva in 0.8.0. In this release, this policy is extended to cstor as well. With this feature, you can limit the cStorController pod scheduling to one or a set of nodes in the cluster, which gives flexibility to the administrator in managing the resources across nodes.

**Jiva Replicas not Loading when Data is Fragmented**

When Jiva volumes are deeply fragmented, the number of file extends increases to a large number. In such a situation, Jiva replicas were not able to load within a specified time limit, and re-connection was also resulting in the same issue. The 0.8.1 release fixes this issue and Jiva replicas load without issue, even when they are highly fragmented.
