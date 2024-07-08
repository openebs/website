---
id: troubleshooting
title: Troubleshooting - Local Storage
slug: /troubleshooting
keywords:
  - OpenEBS
  - OpenEBS troubleshooting
description: This page contains a list of OpenEBS related troubleshooting which contains information like troubleshooting installation, troubleshooting uninstallation, and troubleshooting local storage.
---

<font size="7" color="orange">General Troubleshooting</font>

### PVC in Pending state {#pvc-in-pending-state}

Created a PVC using localpv-hostpath storage class. But the PV is not created and PVC in Pending state.

**Troubleshooting**

The default localpv storage classes from openebs have `volumeBindingMode: WaitForFirstConsumer`. This means that only when the application pod that uses the PVC is scheduled to a node, the provisioner will receive the volume provision request and will create the volume.

**Resolution**

Deploy an application that uses the PVC and the PV will be created and application will start using the PV.


<font size="7" color="orange">Installation Related</font>

### Installation failed because of insufficient user rights {#install-failed-user-rights}

OpenEBS installation can fail in some cloud platform with the following errors.

```shell hideCopy
namespace "openebs" created
serviceaccount "openebs-maya-operator" created
clusterrolebinding.rbac.authorization.k8s.io "openebs-maya-operator" created
deployment.apps "maya-apiserver" created
service "maya-apiserver-service" created
deployment.apps "openebs-provisioner" created
deployment.apps "openebs-snapshot-operator" created
configmap "openebs-ndm-config" created
daemonset.extensions "openebs-ndm" created
Error from server (Forbidden): error when creating "https://raw.githubusercontent.com/openebs/openebs/v0.8.x/k8s/openebs-operator.yaml": clusterroles.rbac.authorization.k8s.io "openebs-maya-operator" is forbidden: attempt to grant extra privileges: [{[*] [*] [nodes] [] []} {[*] [*] [nodes/proxy] [] []} {[*] [*] [namespaces] [] []} {[*] [*] [services] [] []} {[*] [*] [pods] [] []} {[*] [*] [deployments] [] []} {[*] [*] [events] [] []} {[*] [*] [endpoints] [] []} {[*] [*] [configmaps] [] []} {[*] [*] [jobs] [] []} {[*] [*] [storageclasses] [] []} {[*] [*] [persistentvolumeclaims] [] []} {[*] [*] [persistentvolumes] [] []} {[get] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[list] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[watch] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[create] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[update] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[patch] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[delete] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[get] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[list] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[watch] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[create] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[update] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[patch] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[delete] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[get] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[list] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[create] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[update] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[delete] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[*] [*] [disks] [] []} {[*] [*] [storagepoolclaims] [] []} {[*] [*] [storagepools] [] []} {[*] [*] [castemplates] [] []} {[*] [*] [runtasks] [] []} {[*] [*] [cstorpools] [] []} {[*] [*] [cstorvolumereplicas] [] []} {[*] [*] [cstorvolumes] [] []} {[get] [] [] [] [/metrics]}] user=&{user.name@mayadata.io  [system:authenticated] map[user-assertion.cloud.google.com:[AKUJVpmzjjLCED3Vk2Q7wSjXV1gJs/pA3V9ZW53TOjO5bHOExEps6b2IZRjnru9YBKvaj3pgVu+34A0fKIlmLXLHOQdL/uFA4WbKbKfMdi1XC52CcL8gGTXn0/G509L844+OiM+mDJUftls7uIgOIRFAyk2QBixnYv22ybLtO2n8kcpou+ZcNFEVAD6z8Xy3ZLEp9pMd9WdQuttS506x5HIQSpDggWFf9T96yPc0CYmVEmkJm+O7uw==]]} ownerrules=[{[create] [authorization.k8s.io] [selfsubjectaccessreviews selfsubjectrulesreviews] [] []} {[get] [] [] [] [/api /api/* /apis /apis/* /healthz /openapi /openapi/* /swagger-2.0.0.pb-v1 /swagger.json /swaggerapi /swaggerapi/* /version /version/]}] ruleResolutionErrors=[]
```

**Troubleshooting**

You must enable RBAC before OpenEBS installation. This can be done from the kubernetes master console by executing the following command.

```
kubectl create clusterrolebinding  <cluster_name>-admin-binding --clusterrole=cluster-admin --user=<user-registered-email-with-the-provider>
```

### Why does OpenEBS provisioner pod restart continuously?{#openebs-provisioner-restart-continuously}

The following output displays the pod status of all namespaces in which the OpenEBS provisioner is restarting continuously.

```
NAMESPACE     NAME                                         READY     STATUS             RESTARTS   AGE       IP                NODE
default       percona                                      0/1       Pending            0          36m       <none>            <none>
kube-system   calico-etcd-tl4td                            1/1       Running            0          1h        192.168.56.65     master
kube-system   calico-kube-controllers-84fd4db7cd-jz9wt     1/1       Running            0          1h        192.168.56.65     master
kube-system   calico-node-node1                            2/2       Running            0          1h        192.168.56.65     master
kube-system   calico-node-zt95x                            2/2       Running            0          1h        192.168.56.66     node
kube-system   coredns-78fcdf6894-2test                     1/1       Running            0          1h        192.168.219.65    master
kube-system   coredns-78fcdf6894-test7                     1/1       Running            0          1h        192.168.219.66    master
kube-system   etcd-master                                  1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-apiserver-master                        1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-controller-manager-master               1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-proxy-9t98s                             1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-proxy-mwk9f                             1/1       Running            0          1h        192.168.56.66     node
kube-system   kube-scheduler-master                        1/1       Running            0          1h        192.168.56.65     master
openebs       maya-apiserver-5598cf68ff-pod17              1/1       Running            0          1h        192.168.167.131   node
openebs       openebs-provisioner-776846bbff-pod19         0/1       CrashLoopBackOff   16         1h        192.168.167.129   node
openebs       openebs-snapshot-operator-5b5f97dd7f-np79k   0/2       CrashLoopBackOff   32         1h        192.168.167.130   node
```

**Troubleshooting**

Perform the following steps to verify if the issue is due to misconfiguration while installing the network component.

1. Check if your network related pods are running fine.

2. Check if OpenEBS provisioner HTTPS requests are reaching the apiserver

3. Use the latest version of network provider images.

4. Try other network components such as Calico, kube-router etc. if you are not using any of these.

### OpenEBS installation fails on Azure {#install-failed-azure-no-rbac-set}

On AKS, while installing OpenEBS using Helm, you may see the following error.

```
$ helm install openebs/openebs --name openebs --namespace openebs
```

```shell hideCopy
Error: release openebs failed: clusterroles.rbac.authorization.k8s.io "openebs" isforbidden: attempt to grant extra privileges:[PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["nodes"],APIGroups:["*"], Verbs:["list"]}PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["watch"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["get"]}PolicyRule{Resources:["nodes/proxy"], APIGroups:["*"],Verbs:["list"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["watch"]}PolicyRule{Resources:["namespaces"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["services"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["pods"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["deployments"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["events"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["endpoints"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["persistentvolumes"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["persistentvolumeclaims"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["storageclasses"],APIGroups:["storage.k8s.io"], Verbs:["*"]}PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["list"]} PolicyRule{NonResourceURLs:["/metrics"],Verbs:["get"]}] user=&{system:serviceaccount:kube-system:tiller6f3172cc-4a08-11e8-9af5-0a58ac1f1729 [system:serviceaccounts system:serviceaccounts:kube-systemsystem:authenticated] map[]} ownerrules=[]ruleResolutionErrors=[clusterroles.rbac.authorization.k8s.io"cluster-admin" not found]
```

**Troubleshooting**

You must enable RBAC on Azure before OpenEBS installation. For more details, see [Prerequisites](../quickstart-guide/installation.md).

### A multipath.conf file claims all SCSI devices in OpenShift {#multipath-conf-claims-all-scsi-devices-openshift}

A multipath.conf file without either find_multipaths or a manual blacklist claims all SCSI devices.

**Workaround**

1. Add the find _multipaths line to_ \_/etc/multipath.conf\_ file similar to the following snippet.

   ```
   defaults {
       user_friendly_names yes
       find_multipaths yes
   }
   ```

2. Run `multipath -w /dev/sdc` command (replace the devname with your persistent devname).

### Set Cluster-admin User Context

For installation of OpenEBS, cluster-admin user context is a must. OpenEBS installs service accounts and custom resource definitions that are only allowed for cluster administrators. 

Use the `kubectl auth can-i` commands to verify that you have the cluster-admin context. You can use the following commands to verify if you have access: 

```
kubectl auth can-i 'create' 'namespace' -A
kubectl auth can-i 'create' 'crd' -A
kubectl auth can-i 'create' 'sa' -A
kubectl auth can-i 'create' 'clusterrole' -A
```

If there is no cluster-admin user context already present, create one and use it. Use the following command to create the new context.

```
kubectl config set-context NAME [--cluster=cluster_nickname] [--user=user_nickname] [--namespace=namespace]
```

Example:

```
kubectl config set-context admin-ctx --cluster=gke_strong-eon-153112_us-central1-a_rocket-test2 --user=cluster-admin
```

Set the existing cluster-admin user context or the newly created context by using the following command.

Example:

```
kubectl config use-context admin-ctx
```

<font size="7" color="orange">Kubernetes Related</font>

### Application and OpenEBS pods terminate/restart under heavy I/O load {#Pods-restart-terminate-when-heavy-load}

This is caused due to lack of resources on the Kubernetes nodes, which causes the pods to evict under loaded conditions as the node becomes _unresponsive_. The pods transition from _Running_ state to _unknown_ state followed by _Terminating_ before restarting again.

**Troubleshooting**

The above cause can be confirmed from the `kubectl describe pod` which displays the termination reason as _NodeControllerEviction_. You can get more information from the kube-controller-manager.log on the Kubernetes master.

**Workaround**

You can resolve this issue by upgrading the Kubernetes cluster infrastructure resources (Memory, CPU).

<font size="7" color="orange">Others</font>

### Nodes in the cluster reboots frequently almost everyday in openSUSE CaaS {#reboot-cluster-nodes}

Setup the cluster using RKE with openSUSE CaaS MicroOS using CNI Plugin Cilium. Install OpenEBS, create a PVC and allocate to a fio job/busybox. Run FIO test on the same. Observed nodes in the cluster getting restarted on a schedule basis.

**Troubleshooting**

Check journalctl logs of each nodes and check if similar logs are observed. In the following log snippets, showing the corresponding logs of 3 nodes.

Node1:

```shell hideCopy
Apr 12 00:21:01 mos2 transactional-update[7302]: /.snapshots/8/snapshot/root/.bash_history
Apr 12 00:21:01 mos2 transactional-update[7302]: /.snapshots/8/snapshot/var/run/reboot-needed
Apr 12 00:21:01 mos2 transactional-update[7302]: transactional-update finished - rebooting machine
Apr 12 00:21:01 mos2 systemd-logind[1045]: System is rebooting.
Apr 12 00:21:01 mos2 systemd[1]: transactional-update.service: Succeeded.
Apr 12 00:21:01 mos2 systemd[1]: Stopped Update the system.
```

Node2:

```shell hideCopy
01:44:19 mos3 transactional-update[17442]: other mounts and will not be visible to the system:
Apr 12 01:44:19 mos3 transactional-update[17442]: /.snapshots/8/snapshot/root/.bash_history
Apr 12 01:44:19 mos3 transactional-update[17442]: /.snapshots/8/snapshot/var/run/reboot-needed
Apr 12 01:44:19 mos3 transactional-update[17442]: transactional-update finished - rebooting machine
Apr 12 01:44:20 mos3 systemd-logind[1056]: System is rebooting.
Apr 12 01:44:20 mos3 systemd[1]: transactional-update.service: Succeeded.
Apr 12 01:44:20 mos3 systemd[1]: Stopped Update the system.
```

Node3:

```shell hideCopy
Apr 12 03:00:13 mos4 systemd[1]: snapper-timeline.service: Succeeded.
Apr 12 03:30:00 mos4 rebootmgrd[1612]: rebootmgr: reboot triggered now!
Apr 12 03:30:00 mos4 systemd[1]: rebootmgr.service: Succeeded.
Apr 12 03:30:00 mos4 systemd-logind[1064]: System is rebooting.
Apr 12 03:30:00 mos4 systemd[1]: Stopping open-vm-tools: vmtoolsd service for virtual machines hosted on VMware...
Apr 12 03:30:00 mos4 systemd[1]: Stopped target Timers.
Apr 12 03:30:00 mos4 systemd[1]: btrfs-scrub.timer: Succeeded.
Apr 12 03:30:00 mos4 systemd[1]: Stopped Scrub btrfs filesystem, verify block checksums.
Apr 12 03:30:00 mos4 systemd[1]: transactional-update.timer: Succeeded.
```

You can get more details to see if the cause of reboot is due to transactional update using below command outputs.

```
systemctl status rebootmgr
systemctl status transactional-update.timer
cat /etc/rebootmgr.conf
cat /usr/lib/systemd/system/transactional-update.timer
cat /usr/etc/transactional-update.conf
```

**Workaround**

There are 2 possible solutions.

Approach1:

Do the following on each nodes to stop the transactional update.

```
systemctl disable --now rebootmgr.service
systemctl disable --now transactional-update.timer
```

This is the preferred approach.

Approach2:

Set the reboot timer schedule at different time i.e. staggered at various interval of the day, so that only one nodes get rebooted at a time.

### How to fetch the OpenEBS Dynamic Local Provisioner logs?

**Workaround**

Review the logs of the OpenEBS Local PV provisioner. OpenEBS Dynamic Local Provisioner logs can be fetched using:

```
kubectl logs -n openebs -l openebs.io/component-name=openebs-localpv-provisioner
```

### Unable to mount `xfs` File System

The volume is created, but `xfs` is failing to mount.

**Workaround**

If you are trying to use `xfs` volumes and the cluster node hosts are running a kernel version less than 5.10, you may encounter a mount failure of the filesystem. This is due to the incompatibility of newer `xfsprogs` options. In order to alleviate this issue, it is recommended to upgrade the host node kernel version to 5.10 or higher.

## See Also

- [FAQs](../faqs/faqs.md)
- [Release Notes](../releases.md)
- [OpenEBS Community](../community.md)
- [OpenEBS GitHub Repository](https://github.com/openebs/openebs/issues)
- [StackOverflow under OpenEBS Tag](https://stackoverflow.com/questions/tagged/openebs)
