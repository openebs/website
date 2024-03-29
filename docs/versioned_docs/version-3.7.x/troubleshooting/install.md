---
id: install
title: Troubleshooting OpenEBS Install
keywords:
  - OpenEBS
  - OpenEBS installation
  - OpenEBS installation troubleshooting
description: This page contains list of OpenEBS installation related troubleshooting information.
---

## General guidelines for troubleshooting

- Contact [OpenEBS Community](/docs/introduction/community) for support.
- Search for similar issues added in this troubleshooting section.
- Search for any reported issues on [StackOverflow under OpenEBS tag](https://stackoverflow.com/questions/tagged/openebs)

[Installation failed because insufficient user rights](#install-failed-user-rights)

[iSCSI client is not setup on Nodes. Application Pod is in ContainerCreating state.](#install-failed-iscsi-not-configured)

[Why does OpenEBS provisioner pod restart continuously?](#openebs-provisioner-restart-continuously)

[OpenEBS installation fails on Azure](#install-failed-azure-no-rbac-set).

[A multipath.conf file claims all SCSI devices in OpenShift](#multipath-conf-claims-all-scsi-devices-openshift)

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

### iSCSI client is not setup on Nodes. Pod is in ContainerCreating state. {#install-failed-iscsi-not-configured}

After OpenEBS installation, you may proceed with application deployment which will provision OpenEBS volume. This may fail due to the following error. This can be found by describing the application pod.

```shell hideCopy
MountVolume.WaitForAttach failed for volume “pvc-ea5b871b-32d3-11e9-9bf5-0a8e969eb15a” : open /sys/class/iscsi_host: no such file or directory -
```

**Troubleshooting**

This logs points that iscsid.service may not be enabled and running on your Nodes. You need to check if the service `iscsid.service` is running. If it is not running, you have to `enable` and `start` the service. You can refer [prerequisites](/user-guides/prerequisites) section and choose your platform to get the steps for enabling it.

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

You must enable RBAC on Azure before OpenEBS installation. For more details, see [Prerequisites](/user-guides/prerequisites).

### A multipath.conf file claims all SCSI devices in OpenShift {#multipath-conf-claims-all-scsi-devices-openshift}

A multipath.conf file without either find_multipaths or a manual blacklist claims all SCSI devices.

#### Workaround

1. Add the find _multipaths line to_ \_/etc/multipath.conf\_ file similar to the following snippet.

   ```
   defaults {
       user_friendly_names yes
       find_multipaths yes
   }
   ```

2. Run `multipath -w /dev/sdc` command (replace the devname with your persistent devname).

## See Also:

[FAQs](/docs/additional-info/faqs) [Seek support or help](/docs/introduction/community) [Latest release notes](/docs/introduction/releases)
