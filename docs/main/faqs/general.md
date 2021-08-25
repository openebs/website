---
id: general
title: OpenEBS FAQs
keywords: 
 - OpenEBS FAQ
 - FAQs
description: The FAQ section about OpenEBS helps to address common concerns, questions, and objections that users have about OpenEBS.
---

[What is most distinctive about the OpenEBS architecture?](#What-is-most-distinctive-about-the-OpenEBS-architecture)

[Why did you choose iSCSI? Does it introduce latency and decrease performance? ](#Why-did-you-choose-iSCSI)

[Where is my data stored and how can I see that?](#where-is-my-data)

[What changes are needed for Kubernetes or other subsystems to leverage OpenEBS?](#changes-on-k8s-for-openebs)

[How do you get started and what is the typical trial deployment?](#get-started)

[What is the default OpenEBS Reclaim policy?](#default-reclaim-policy)

[Why NDM daemon set required privileged mode?](#why-ndm-privileged)

[Is OpenShift supported?](#openebs-in-openshift)

[Can I use replica count as 2 in StorageClass if it is a single node cluster?](#replica-count-2-in-a-single-node-cluster)

[How backup and restore is working with OpenEBS volumes?](#backup-restore-openebs-volumes)

[Why customized parameters set on default OpenEBS StorageClasses are not getting persisted?](#customized-values-not-persisted-after-reboot)

[Why NDM listens on host network?](#why-ndm-listens-on-host-network)

[How is data protected? What happens when a host, client workload, or a data center fails?](#how-is-data-protected-what-happens-when-a-host-client-workload-or-a-data-center-fails)

[How does OpenEBS provide high availability for stateful workloads?](#how-does-openebs-provide-high-availability-for-stateful-workloads)

[What are the recommended iscsi timeout settings on the host?](#what-are-the-recommended-iscsi-timeout-settings-on-the-host)

[What changes must be made to the containers on which OpenEBS runs?](#what-changes-must-be-made-to-the-containers-on-which-openebs-runs)

[What are the minimum requirements and supported container orchestrators?](#what-are-the-minimum-requirements-and-supported-container-orchestrators)

[Why would you use OpenEBS on EBS?](#why-would-you-use-openebs-on-ebs)

[Can I use the same PVC for multiple Pods?](#can-i-use-the-same-pvc-for-multiple-pods)

[Warning Messages while Launching PVC](#warning-messages-while-launching-pvc)

[Why *OpenEBS_logical_size* and *OpenEBS_actual_used* are showing in different size?](#why-openebs-logical-size-and-openebs-actual-used-are-showing-in-different-size)

[What must be the disk mount status on Node for provisioning OpenEBS volume?](#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume)

[Does OpenEBS support encryption at rest?](#encryption-rest)

[Can the same BDC name be used for claiming a new block device?](#same-bdc-claim-new-bd)

-----

<font size="6" color="blue">General</font>

### What is most distinctive about the OpenEBS architecture? {#What-is-most-distinctive-about-the-OpenEBS-architecture}

The OpenEBS architecture is an example of Container Attached Storage (CAS). These approaches containerize the storage controller, called IO controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, a delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

[Go to top](#top)

### Why did you choose iSCSI? Does it introduce latency and decrease performance? {#Why-did-you-choose-iSCSI}

We at OpenEBS strive to make OpenEBS simple to use using Kubernetes as much as possible to manage OpenEBS itself. iSCSI allows you to be more resilient in cases where the workload and the controller are not on the same host. In other words, the OpenEBS user or architect will not suffer an outage when the storage IO controller is not scheduled locally to the workload in need of storage. OpenEBS does a variety of things to improve performance elsewhere in the stack. More is to come via the cStor storage engine in order to have this level of flexibility.

[Go to top](#top)

### Where is my data stored and how can I see that? {#where-is-my-data}

OpenEBS stores data in a configurable number of replicas. These are placed to maximize resiliency. For example, they are placed in different racks or availability zones.

To determine exactly where your data is physically stored, you can run the following kubectl commands.

* Run `kubectl get pvc` to fetch the volume name. The volume name looks like: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be*.

* For each volume, you will notice one IO controller pod and one or more replicas (as per the storage class configuration). For the above PVC, run the following command to get the IO controller and replica pods. 

  ```
  kubectl get pods --all-namespaces | grep pvc-ee171da3-07d5-11e8-a5be-42010a8001be
  ```

  The output displays the following pods.

  ```
  IO Controller: pvc-ee171da3-07d5-11e8-a5be-42010a8001be-ctrl-6798475d8c-7node
  Replica 1: pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s     
  Replica 2: pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-tr28f  
  ```

* To check the location where the data is stored, get the details of the replica pod. For getting the details of Replica 1 above, use the `kubectl get pod -o yaml pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s` command. Check the volumes section. 

  ```
  volumes:
        - hostPath:
        path: /var/openebs/pvc-ee171da3-07d5-11e8-a5be-42010a8001be
            type: ""
        - name: openebs
  ```

[Go to top](#top)

### What changes are needed for Kubernetes or other subsystems to leverage OpenEBS? {#changes-on-k8s-for-openebs}

One of the major differences of OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload and the easy management of it is crucial especially as the Container Attached Storage (CAS) approach entails putting containers that are IO controller and replica controllers.

You can access the OpenEBS IO controller via iSCSI, exposed as a service. The nodes require iSCSI initiator to be installed. In case the kubelet is running in a container for example, as in the case of Rancher and so on, the iSCSI initiator should be installed within the kubelet container.

[Go to top](#top)

### How do you get started and what is the typical trial deployment? {#get-started}

If you have a Kubernetes environment, you can deploy OpenEBS using the following command.

 `kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml`

You can then begin running a workload against OpenEBS. There is a large and growing number of workload that have storage classes that use OpenEBS. You need not use these specific storage classes. However, they may be helpful as they save time and allow for per workload customization. If you need additional help, get in touch with [OpenEBS Community](/introduction/community).
 
[Go to top](#top)


### What is the default OpenEBS Reclaim policy? {#default-reclaim-policy}

The default retention is the same used by K8s. For dynamically provisioned PersistentVolumes, the default reclaim policy is “Delete”. This means that a dynamically provisioned volume is automatically deleted when a user deletes the corresponding PersistentVolumeClaim. 

In case of cStor volumes, data was being deleted as well. 

For jiva, from 0.8.0 version, the data is deleted via scrub jobs. The completed job can be deleted using `kubectl delete job <job_name> -n <namespace>`

[Go to top](#top)

### Why NDM Daemon set required privileged mode? {#why-ndm-privileged}

Currently, NDM Daemon set runs in the privileged mode. NDM requires privileged mode because it requires access to `/dev` and `/sys` directories for monitoring the devices attached and also to fetch the details of the attached device using various probes. 

[Go to top](#top)

### Is OpenShift supported? {#openebs-in-openshift}

Yes. See the [detailed installation instructions for OpenShift](kb.md#openshift-install) for more information.

[Go to top](#top)

### Can I use replica count as 2 in StorageClass if it is a single node cluster? {#replica-count-2-in-a-single-node-cluster}

While creating a StorageClass, if user mention replica count as 2 in a single node cluster, OpenEBS will not create the volume from 0.9  version onwards. It is required to match the number of replica count and number of nodes available in the cluster for provisioning OpenEBS Jiva and cStor volumes.

### How backup and restore is working with OpenEBS volumes? {#backup-restore-openebs-volumes}

OpenEBS cStor volume is working based on cStor/ZFS snapshot using Velero. For OpenEBS Local PV and Jiva volume, it is based on restic using Velero.

### Why customized parameters set on default OpenEBS StorageClasses are not getting persisted? {#customized-values-not-persisted-after-reboot}

The customized parameters set on default OpenEBS StorageClasses will not persist after restarting `maya-apiserver` pod or restarting the node where `maya-apiserver` pod is running. StorageClasses created by maya-apiserver are owned by it and it tries to overwrite them upon its creation.

### Why NDM listens on host network?

NDM uses `udev` to monitor dynamic disk attach and detach events. `udev` listens on netlink socket of the host system to get those events. A container requires host network access so that it can listen on the socket. Therefore NDM requires host network access for the `udev` running inside the container to listen those disk related events.

### How is data protected? What happens when a host, client workload, or a data center fails?

Kubernetes provides many ways to enable resilience. OpenEBS leverages these wherever possible.  For example, say the IO container that has the iSCSI target fails. Well, it is spun back up by Kubernetes. The same applies to the underlying replica containers, where the data is actually stored. They are spun back up by Kubernetes. Now, the point of replicas is to ensure that when one or more of these replicas are being respond and then repopulated in the background by OpenEBS, the client applications still run.  OpenEBS takes a simple approach to ensuring that multiple replicas can be accessed by an IO controller using a configurable quorum or the minimum number of replica requirements. In addition, our new cStor checks for silent data corruption and in some cases can fix it in the background.  Silent data corruption, unfortunately, can occur from poorly engineered hardware and from other underlying conditions including those that your cloud provider is unlikely to report or identify.  

[Go to top](#top)

### How does OpenEBS provide high availability for stateful workloads?

An OpenEBS Jiva volume is a controller deployed during OpenEBS installation. Volume replicas are defined by the parameter that you set. The controller is an iSCSI target while the replicas play the role of a disk. The controller exposes the iSCSI target while the actual data is written. The controller and each replica run inside a dedicated container. An OpenEBS Jiva volume controller exists as a single instance, but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is synchronized between replicas. OpenEBS Jiva volume high availability is based on various scenarios as explained in the following sections. 

**Note:** Each replica is scheduled in a unique K8s node, and a K8s node never has two replicas of one OpenEBS volume.

### What are the recommended iscsi timeout settings on the host?

There are cases when application pod and OpenEBS cStor target pod are running on different nodes. In such cases, there may be chances that application can go to read only when K8s takes around 5 mins to re-schedule OpenEBS target pod to a new Node. To avoid such scenarios, default iscsi timeout values can be configured to the recommended one. 

#### Configure the iscsi timeout value
The following explains the configuration change for 2 different scenarios.

1. For New iSCSI sessions
2. For those sessions already logged in to iSCSI target.

**For New iSCSI sessions**:

Do below configuration settings on the host node to change the default iscsi timeout value.

1. Edit iscsid.conf file.

2. Modify **node.session.timeo.replacement_timeout** with 300 seconds.

   

**For those sessions already logged in to iSCSI target:**

Below command can be used to change the setting for logged in sessions:

```
iscsiadm -m node -T <target> -p ip:port -o update -n node.session.timeo.replacement_timeout -v 300
```

#### Verify the iscsi timeout settings {#verify-iscsi-timeout}

Verify the configured value by running “iscsiadm -m session -P 3”  and check "Recovery Timeout" value under "Timeouts". It should be configured as 300.

You may notice the change in the “Attached scsi disk” value. This causes volume to get unmounted and thus volume need to be remounted. Detailed steps for remounting volume are mentioned [here](https://openebs.io/blog/keeping-openebs-volumes-in-rw-state-during-node-down-scenarios/).

### What changes must be made to the containers on which OpenEBS runs?

OpenEBS has been engineered so that it does not require any changes to the containers on which it runs. Similarly, Kubernetes itself does not require to be altered and no additional external orchestrator is required. However, the workloads that need storage must be running on hosts that have iSCSI initiators, which is a default configuration in almost all operating systems.

[Go to top](#top)

### What are the minimum requirements and supported container orchestrators?

OpenEBS is currently tightly integrated into Kubernetes. Support for Docker Swarm is something OpenEBS is looking at in future releases.

The system requirements depend on the number of volumes being provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster. The OpenEBS control plane comprises of minimum two pods i.e. apiserver and dynamic provisioner. You can run these using 2GB RAM and 2 CPUs.

Each volume will spin up IO controller and replica pods. Each of these will require 1GB RAM and 0.5 CPU by default.

For enabling high availability, OpenEBS recommends having a minimum of 3 nodes in the Kubernetes cluster.

[Go to top](#top)

### Why would you use OpenEBS on EBS?

There are at least four common reasons for running OpenEBS on Amazon EBS that are listed as follows:

Attach / Detach: The attach / detach process can slow the environment operations dependent on EBS.

No volume management needed: OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume manager. This saves time and reduces operational complexity.

Expansion and inclusion of NVMe: OpenEBS allows users to add additional capacity without experiencing downtime. This online addition of capacity can include NVMe and SSD instances from cloud providers or deployed in physical servers. This means that as performance requirements increase, or decrease, you can use Kubernetes via storage policies to instruct OpenEBS to change capacity accordingly.

Other enterprise capabilities: OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption. Snapshots and clones facilitate much more efficient CI/CD workflows as zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these without incurring additional storage space or administrative effort. The snapshot capabilities can also be used for replication. As of February 2018 these replication capabilities are under development.

[Go to top](#top)

### Can I use the same PVC for multiple Pods?

Jiva and cStor volumes are exposed via block storage using iSCSI. Currently, only RWO is supported.

[Go to top](#top)

### Why OpenEBS_logical_size and OpenEBS_actual_used are showing in different size?

The `OpenEBS_logical_size` and `OpenEBS_actual_used` parameters will start showing different sizes when there are replica node restarts and internal snapshots are created for synchronizing replicas.

[Go to top](#top)

### What must be the disk mount status on Node for provisioning OpenEBS volume?

OpenEBS have three storage Engines, Jiva, cStor and LocalPV which can be used to provision OpenEBS volumes. 

Jiva requires the disk to be mounted (i.e., attached, formatted with a filesystem and mounted). 

For LocalPV based on device, details of disk mount status can be obtained [here](/user-guides/ndm).

cStor can consume disks that are attached (are visible to OS as SCSI devices) to the Nodes which does not have any filesystem and it should be unmounted on the Node. It is recommended to wipe out the disk if it was previously used. 

In case you need to use Local SSDs as block devices for provisioning cStor volume, you will have to first unmount them and remove any the filesystem if it has. On GKE, the Local SSDs are formatted with ext4 and mounted under "/mnt/disks/". If local SSDs are mounted and contains any file system, then cStor pool creation will fail.

[Go to top](#top)


### Does OpenEBS support encryption at rest? {#encryption-rest}

OpenEBS recommends LUKS encrypted drives with dm-crypt to achieve block-device encryption at rest. 

OpenEBS team is working on introducing native encryption capabilities with the release of the Mayastor storage engine.

Currently, device encryption is a manual operation, and the steps for encrypting the devices consumed by OpenEBS storage engines are explained separately for cStor and LocalPV below:

[How to use encryption with cStor](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_volume_encrypt.md)

[How to use encryption with LocalPV](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/uglocalpv_volume_encrypt.md)

It is recommended to store encryption keys in a secure secret store. Kubernetes Secrets or Vault can be used as a secret provider. 

Although block-level encryption is faster than filesystem encryption such as eCryptfs you should be aware that encryption overall increases CPU utilization and will have a small performance overhead on the LUKS encrypted devices.

[Go to top](#top)

### Can the same BDC name be used for claiming a new block device? {#same-bdc-claim-new-bd}

No. It is recommended to create different BDC name for claiming an unclaimed disk manually.

[Go to top](#top)

-----