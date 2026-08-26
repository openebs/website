---
id: legacy-upgrade
title: OpenEBS Replicated PV Mayastor Legacy Upgrades
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 2.6.0 version is supported only from v1.0.0 and later.
---

A legacy installation of Replicated PV Mayastor (1.0.x and below) cannot be seamlessly upgraded and needs manual intervention.

Follow the below steps if you wish to upgrade from Replicated PV Mayastor 1.0.x to Replicated PV Mayastor 2.x and above.
The Replicated PV Mayastor uses etcd as a persistent datastore for its configuration. As a first step, take a snapshot of the etcd. The detailed steps for taking a snapshot can be found in the etcd [documentation](https://etcd.io/docs/v3.3/op-guide/recovery/).

:::warning
As compared to Replicated PV Mayastor 1.0, the Replicated PV Mayastor 2.x feature-set introduces breaking changes in some of the components, due to which the upgrade process from 1.0 to 2.x is not seamless. The list of such changes are given below:

**ETCD:**
  - Control Plane: The prefixes for control plane have changed from `/namespace/$NAMESPACE/control-plane/` to `/openebs.io/mayastor/apis/v0/clusters/$KUBE_SYSTEM_UID/namespaces/$NAMESPACE/`
  - Data Plane: The Data Plane nexus information containing a list of healthy children has been moved from `$nexus_uuid` to `/openebs.io/mayastor/apis/v0/clusters/$KUBE_SYSTEM_UID/namespaces/$NAMESPACE/volume/$volume_uuid/nexus/$nexus_uuid/info`

**RPC:**
  - Control Plane: The RPC for the control plane has been changed from NATS to gRPC.
  - Data Plane: The registration heartbeat has been changed from NATS to gRPC. 

**Pool CRDs:**
  - The pool CRDs have been renamed `DiskPools` (previously, MayastorPools).
  :::

1. To start the upgrade process, the following previously deployed components have to be deleted. 

 - To delete the control-plane components, execute: 

**Commands**

```
kubectl delete deploy core-agents -n mayastor
kubectl delete deploy csi-controller -n mayastor
kubectl delete deploy msp-operator -n mayastor
kubectl delete deploy rest -n mayastor
kubectl delete ds mayastor-csi -n mayastor
```
 
- Next, delete the associated RBAC operator. To do so, execute:

**Commands**

```
kubectl delete -f https://raw.githubusercontent.com/openebs/mayastor-control-plane/<version>/deploy/operator-rbac.yaml
```

:::info
In the above command, add the previously installed Replicated Storage's version in the format v1.x.x
:::

2. Once all the above components have been successfully removed, fetch the latest helm chart from [Mayastor-extension repo](https://github.com/openebs/mayastor-extensions) and save it to a file, say `helm_templates.yaml`. To do so, execute:

**Command**

```
helm template mayastor . -n mayastor --set etcd.persistence.storageClass="manual" --set loki-stack.loki.persistence.storageClassName="manual" --set etcd.initialClusterState=existing > helm_templates.yaml
```

- Next, update the `helm_template.yaml` file, add the following helm label to all the resources that are being created.

**Helm label**

```
metadata: 
  annotations: 
    meta.helm.sh/release-name: $RELEASE_NAME 
    meta.helm.sh/release-namespace: $RELEASE_NAMESPACE 
  labels: 
    app.kubernetes.io/managed-by: Helm
```

- Copy the `etcd` and `io-engine` spec from the `helm_templates.yaml` and save it in two different files say, mayastor_2.0_etcd.yaml and mayastor_io_v2.0.yaml. Once done, remove the `etcd` and `io-engine` specs from `helm_templates.yaml`. These components need to be upgraded separately.  

3. Install the new control-plane components using the `helm-templates.yaml` file. 

**Command**

```
kubectl apply -f helm_templates.yaml -n mayastor
```

:::info
In the above method of installation, the nexus (target) High Availability (HA) is disabled by default. The steps to enable HA are described later in this document.
:::

- Verify the status of the pods. Upon successful deployment, all the pods will be in a running state.

**Command**

```
kubectl get pods -n mayastor
```

**Sample Output**

```
NAME                                         READY   STATUS    RESTARTS   AGE
mayastor-65cxj                               1/1     Running   0          9m42s
mayastor-agent-core-7d7f59bbb8-nwptm         2/2     Running   0          104s
mayastor-api-rest-6d774fbdd8-hgrxj           1/1     Running   0          104s      mayastor-csi-controller-6469fdf8db-bgs2h     3/3     Running   0          104s
mayastor-csi-node-7zm2v                      2/2     Running   0          104s
mayastor-csi-node-gs76x                      2/2     Running   0          104s
mayastor-csi-node-mfqfq                      2/2     Running   0          104s
mayastor-etcd-0                              1/1     Running   0          13m
mayastor-etcd-1                              1/1     Running   0          13m
mayastor-etcd-2                              1/1     Running   0          13m
mayastor-loki-0                              1/1     Running   0          104s
mayastor-mwc9r                               1/1     Running   0          9m42s
mayastor-obs-callhome-588688bb4d-w9dl4       1/1     Running   0          104s
mayastor-operator-diskpool-8cd67554d-c4zpz   1/1     Running   0          104s
mayastor-promtail-66cj6                      1/1     Running   0          104s
mayastor-promtail-cx9m7                      1/1     Running   0          104s
mayastor-promtail-t789g                      1/1     Running   0          104s
mayastor-x8vtc                               1/1     Running   0          9m42s
nats-0                                       2/2     Running   0          13m
nats-1                                       2/2     Running   0          12m
nats-2                                       2/2     Running   0          12m
```

- Verify the etcd prefix and compat mode.

**Command**

```
kubectl exec -it mayastor-etcd-0 -n mayastor -- bash
Defaulted container "etcd" out of: etcd, volume-permissions (init)
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$ export ETCDCTL_API=3
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$ etcdctl get --prefix ""
```

**Sample Output**

```
LINE NO.3 "mayastor_compat_v1":true - compat mode to look for. 
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$ etcdctl get --prefix ""
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/CoreRegistryConfig/db98f8bb-4afc-45d0-85b9-24c99cc443f2
{"id":"db98f8bb-4afc-45d0-85b9-24c99cc443f2","registration":"Automatic","mayastor_compat_v1":true}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NexusSpec/069feb5e-ec65-4e97-b094-99262dfc9f44
uuid=8929e13f-99c0-4830-bcc2-d4b12a541b97"}},{"Replica":{"uuid":"9455811d-480e-4522-b94a-4352ba65cb73","share_uri":"nvmf://10.20.30.64:8420/nqn.2019-05.io.openebs:9455811d-480e-4522-b94a-4352ba65cb73?uuid=9455811d-480e-4522-b94a-4352ba65cb73"}}],"size":1073741824,"spec_status":{"Created":"Online"},"share":"nvmf","managed":true,"owner":"bf207797-b23d-447a-8d3f-98d378acfa8a","operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NodeSpec/worker-0
{"id":"worker-0","endpoint":"10.20.30.56:10124","labels":{}}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NodeSpec/worker-1
{"id":"worker-1","endpoint":"10.20.30.57:10124","labels":{}}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NodeSpec/worker-2
{"id":"worker-2","endpoint":"10.20.30.64:10124","labels":{}}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/PoolSpec/pool-0
{"node":"worker-0","id":"pool-0","disks":["/dev/nvme0n1"],"status":{"Created":"Online"},"labels":{"openebs.io/created-by":"operator-diskpool"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/PoolSpec/pool-1
{"node":"worker-1","id":"pool-1","disks":["/dev/nvme0n1"],"status":{"Created":"Online"},"labels":{"openebs.io/created-by":"operator-diskpool"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/PoolSpec/pool-2
{"node":"worker-2","id":"pool-2","disks":["/dev/nvme0n1"],"status":{"Created":"Online"},"labels":{"openebs.io/created-by":"operator-diskpool"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/ReplicaSpec/8929e13f-99c0-4830-bcc2-d4b12a541b97
{"name":"8929e13f-99c0-4830-bcc2-d4b12a541b97","uuid":"8929e13f-99c0-4830-bcc2-d4b12a541b97","size":1073741824,"pool":"pool-1","share":"nvmf","thin":false,"status":{"Created":"online"},"managed":true,"owners":{"volume":"bf207797-b23d-447a-8d3f-98d378acfa8a"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/ReplicaSpec/9455811d-480e-4522-b94a-4352ba65cb73
{"name":"9455811d-480e-4522-b94a-4352ba65cb73","uuid":"9455811d-480e-4522-b94a-4352ba65cb73","size":1073741824,"pool":"pool-2","share":"nvmf","thin":false,"status":{"Created":"online"},"managed":true,"owners":{"volume":"bf207797-b23d-447a-8d3f-98d378acfa8a"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/ReplicaSpec/f65d9888-7699-4c44-8ee2-f6aaa58dead0
{"name":"f65d9888-7699-4c44-8ee2-f6aaa58dead0","uuid":"f65d9888-7699-4c44-8ee2-f6aaa58dead0","size":1073741824,"pool":"pool-0","share":"none","thin":false,"status":{"Created":"online"},"managed":true,"owners":{"volume":"bf207797-b23d-447a-8d3f-98d378acfa8a"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/StoreLeaseLock/CoreAgent/5e6787b9b88cdc5b
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/StoreLeaseOwner/CoreAgent
{"kind":"CoreAgent","lease_id":"5e6787b9b88cdc5b","instance_name":"mayastor-agent-core-7d7f59bbb8-nwptm"}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/VolumeSpec/bf207797-b23d-447a-8d3f-98d378acfa8a
{"uuid":"bf207797-b23d-447a-8d3f-98d378acfa8a","size":1073741824,"labels":{"local":"true"},"num_replicas":3,"status":{"Created":"Online"},"policy":{"self_heal":true},"topology":{"node":{"Explicit":{"allowed_nodes":["worker-1","worker-2","master","worker-0"],"preferred_nodes":["worker-2","master","worker-0","worker-1"]}},"pool":{"Labelled":{"exclusion":{},"inclusion":{"openebs.io/created-by":"operator-diskpool"}}}},"last_nexus_id":"069feb5e-ec65-4e97-b094-99262dfc9f44","operation":null,"thin":false,"target":{"node":"worker-0","nexus":"069feb5e-ec65-4e97-b094-99262dfc9f44","protocol":"nvmf","active":true,"config":{"controllerIdRange":{"start":1,"end":65519},"reservationKey":1,"reservationType":"ExclusiveAccess","preemptPolicy":"Holder"},"frontend":{"host_acl":[]}},"publish_context":null,"volume_group":null}
069feb5e-ec65-4e97-b094-99262dfc9f44
{"children":[{"healthy":true,"uuid":"f65d9888-7699-4c44-8ee2-f6aaa58dead0"},{"healthy":true,"uuid":"8929e13f-99c0-4830-bcc2-d4b12a541b97"},{"healthy":true,"uuid":"9455811d-480e-4522-b94a-4352ba65cb73"}],"clean_shutdown":false}
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$
```

- Verify if the DiskPools are online.

**Command**

```
kubectl get dsp -n mayastor
```

**Sample Output**

```
NAME     NODE       STATE    POOL_STATUS   CAPACITY       USED         AVAILABLE
pool-0   worker-0   Online   Online        374710730752   3221225472   371489505280
pool-1   worker-1   Online   Online        374710730752   3221225472   371489505280
pool-2   worker-2   Online   Online        374710730752   3221225472   371489505280
```

- Next, verify the status of the volumes.

**Command**

```
kubectl mayastor get volumes
```

**Sample Output**

```
ID                                    REPLICAS  TARGET-NODE  ACCESSIBILITY  STATUS SIZE        THIN-PROVISIONED
bf207797-b23d-447a-8d3f-98d378acfa8a  3         worker-0     nvmf           Online  1073741824  false
``` 

4. After upgrading control-plane components, the data-plane pods have to be upgraded. To do so, deploy the `io-engine` DaemonSet from Replicated PV Mayastor's new version. 

Using the command given below, the data-plane pods (now io-engine pods) will be upgraded to Replicated PV Mayastor v2.0.

**Command**

```
kubectl apply -f mayastor_io_v2.0.yaml -n mayastor
```

- Delete the previously deployed data-plane pods (`mayastor-xxxxx`). The data-plane pods need to be manually deleted as their update-strategy is set to `delete`. Upon successful deletion, the new `io-engine` pods will be up and running.   

- NATS has been replaced by gRPC for Replicated PV Mayastor versions 2.0 or later. Hence, the NATS components (StatefulSets and services) have to be removed from the cluster.

**Command**
```text
kubectl delete sts nats -n mayastor
kubectl delete svc nats -n mayastor
```

5. After `control-plane` and `io-engine`, the etcd has to be upgraded. Before starting the etcd upgrade, label the etcd PV and PVCs with helm. Use the below example to create a `labels.yaml` file. This will be needed to make them helm compatible.

**labels.yaml file**

```
metadata:
  annotations:
    meta.helm.sh/release-name: mayastor
    meta.helm.sh/release-namespace: mayastor
  labels:
    app.kubernetes.io/managed-by: Helm
```

**Command to patch etcd PVC**

```
kubectl patch pvc <data-mayastor-etcd-x> --patch-file labels.yaml n mayastor 
```

**Command to patch etcd PV**

```
kubectl patch pv <etcd-volume-x> --patch-file labels.yaml -n mayastor
```

- Next, deploy the etcd YAML. To deploy, execute:

**Command**

```
kubectl apply -f mayastor_2.0_etcd.yaml -n mayastor
```

Now, verify the etcd space and compat mode, execute:

**Command**

```
kubectl exec -it mayastor-etcd-0 -n mayastor -- bash
Defaulted container "etcd" out of: etcd, volume-permissions (init)
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$ export ETCDCTL_API=3
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$ etcdctl get --prefix ""
```

**Sample Output**

```
LINE NO.3 "mayastor_compat_v1":true - compat mode to look for. 
I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$ etcdctl get --prefix ""
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/CoreRegistryConfig/db98f8bb-4afc-45d0-85b9-24c99cc443f2
{"id":"db98f8bb-4afc-45d0-85b9-24c99cc443f2","registration":"Automatic","mayastor_compat_v1":true}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NexusSpec/069feb5e-ec65-4e97-b094-99262dfc9f44
uuid=8929e13f-99c0-4830-bcc2-d4b12a541b97"}},{"Replica":{"uuid":"9455811d-480e-4522-b94a-4352ba65cb73","share_uri":"nvmf://10.20.30.64:8420/nqn.2019-05.io.openebs:9455811d-480e-4522-b94a-4352ba65cb73?uuid=9455811d-480e-4522-b94a-4352ba65cb73"}}],"size":1073741824,"spec_status":{"Created":"Online"},"share":"nvmf","managed":true,"owner":"bf207797-b23d-447a-8d3f-98d378acfa8a","operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NodeSpec/worker-0
{"id":"worker-0","endpoint":"10.20.30.56:10124","labels":{}}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NodeSpec/worker-1
{"id":"worker-1","endpoint":"10.20.30.57:10124","labels":{}}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/NodeSpec/worker-2
{"id":"worker-2","endpoint":"10.20.30.64:10124","labels":{}}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/PoolSpec/pool-0
{"node":"worker-0","id":"pool-0","disks":["/dev/nvme0n1"],"status":{"Created":"Online"},"labels":{"openebs.io/created-by":"operator-diskpool"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/PoolSpec/pool-1
{"node":"worker-1","id":"pool-1","disks":["/dev/nvme0n1"],"status":{"Created":"Online"},"labels":{"openebs.io/created-by":"operator-diskpool"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/PoolSpec/pool-2
{"node":"worker-2","id":"pool-2","disks":["/dev/nvme0n1"],"status":{"Created":"Online"},"labels":{"openebs.io/created-by":"operator-diskpool"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/ReplicaSpec/8929e13f-99c0-4830-bcc2-d4b12a541b97
{"name":"8929e13f-99c0-4830-bcc2-d4b12a541b97","uuid":"8929e13f-99c0-4830-bcc2-d4b12a541b97","size":1073741824,"pool":"pool-1","share":"nvmf","thin":false,"status":{"Created":"online"},"managed":true,"owners":{"volume":"bf207797-b23d-447a-8d3f-98d378acfa8a"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/ReplicaSpec/9455811d-480e-4522-b94a-4352ba65cb73
{"name":"9455811d-480e-4522-b94a-4352ba65cb73","uuid":"9455811d-480e-4522-b94a-4352ba65cb73","size":1073741824,"pool":"pool-2","share":"nvmf","thin":false,"status":{"Created":"online"},"managed":true,"owners":{"volume":"bf207797-b23d-447a-8d3f-98d378acfa8a"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/ReplicaSpec/f65d9888-7699-4c44-8ee2-f6aaa58dead0
{"name":"f65d9888-7699-4c44-8ee2-f6aaa58dead0","uuid":"f65d9888-7699-4c44-8ee2-f6aaa58dead0","size":1073741824,"pool":"pool-0","share":"none","thin":false,"status":{"Created":"online"},"managed":true,"owners":{"volume":"bf207797-b23d-447a-8d3f-98d378acfa8a"},"operation":null}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/StoreLeaseLock/CoreAgent/5e6787b9b88cdc5b
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/StoreLeaseOwner/CoreAgent
{"kind":"CoreAgent","lease_id":"5e6787b9b88cdc5b","instance_name":"mayastor-agent-core-7d7f59bbb8-nwptm"}
/openebs.io/mayastor/apis/v0/clusters/ce05eb25-50cc-400a-a57f-37e6a5ed9bef/namespaces/mayastor/VolumeSpec/bf207797-b23d-447a-8d3f-98d378acfa8a
{"uuid":"bf207797-b23d-447a-8d3f-98d378acfa8a","size":1073741824,"labels":{"local":"true"},"num_replicas":3,"status":{"Created":"Online"},"policy":{"self_heal":true},"topology":{"node":{"Explicit":{"allowed_nodes":["worker-1","worker-2","master","worker-0"],"preferred_nodes":["worker-2","master","worker-0","worker-1"]}},"pool":{"Labelled":{"exclusion":{},"inclusion":{"openebs.io/created-by":"operator-diskpool"}}}},"last_nexus_id":"069feb5e-ec65-4e97-b094-99262dfc9f44","operation":null,"thin":false,"target":{"node":"worker-0","nexus":"069feb5e-ec65-4e97-b094-99262dfc9f44","protocol":"nvmf","active":true,"config":{"controllerIdRange":{"start":1,"end":65519},"reservationKey":1,"reservationType":"ExclusiveAccess","preemptPolicy":"Holder"},"frontend":{"host_acl":[]}},"publish_context":null,"volume_group":null}
069feb5e-ec65-4e97-b094-99262dfc9f44
{"children":[{"healthy":true,"uuid":"f65d9888-7699-4c44-8ee2-f6aaa58dead0"},{"healthy":true,"uuid":"8929e13f-99c0-4830-bcc2-d4b12a541b97"},{"healthy":true,"uuid":"9455811d-480e-4522-b94a-4352ba65cb73"}],"clean_shutdown":false}
    I have no name!@mayastor-etcd-0:/opt/bitnami/etcd$
```

6. Once all the components have been upgraded, the HA module can now be enabled via the helm upgrade command.  

**Command to check the Helm List**

```
helm upgrade --install mayastor . -n mayastor --set etcd.persistence.storageClass="manual" --set loki-stack.loki.persistence.storageClassName="manual" --set agents.ha.enabled="true"
```

**Sample Output**

```
Release "mayastor" does not exist. Installing it now.
NAME: mayastor
LAST DEPLOYED: Tue Apr 25 19:20:53 2023
NAMESPACE: mayastor
STATUS: deployed
REVISION: 1
NOTES:
OpenEBS Mayastor has been installed. Check its status by running:
$ kubectl get pods -n mayastor
```

7. This concludes the process of legacy upgrade. Run the below commands to verify the upgrade,

**Command to check the helm list**

```
helm list -n mayastor
```

**Sample Output**

```
NAME            NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                           APP VERSION
mayastor        mayastor        1               2023-04-25 19:20:53.43928058 +0000 UTC  deployed        mayastor-2.1.0                  2.1.0
```

**Command to check the status of pods**

```
kubectl get pods -n mayastor
```

**Sample Output**

```
NAME                                         READY   STATUS    RESTARTS   AGE
mayastor-agent-core-7d7f59bbb8-nwptm         2/2     Running   0          34m
mayastor-agent-ha-node-fblrn                 1/1     Running   0          6m29s
mayastor-agent-ha-node-g6rf9                 1/1     Running   0          6m29s
mayastor-agent-ha-node-ktjvz                 1/1     Running   0          6m29s
mayastor-api-rest-6d774fbdd8-hgrxj           1/1     Running   0          34m
mayastor-csi-controller-6469fdf8db-bgs2h     3/3     Running   0          34m
mayastor-csi-node-7zm2v                      2/2     Running   0          34m
mayastor-csi-node-gs76x                      2/2     Running   0          34m
mayastor-csi-node-mfqfq                      2/2     Running   0          34m
mayastor-etcd-0                              1/1     Running   0          4m7s
mayastor-etcd-1                              1/1     Running   0          5m16s
mayastor-etcd-2                              1/1     Running   0          6m28s
mayastor-io-engine-6n6bh                     2/2     Running   0          25m
mayastor-io-engine-7gpsj                     2/2     Running   0          25m
mayastor-io-engine-95jjn                     2/2     Running   0          25m
mayastor-loki-0                              1/1     Running   0          34m
mayastor-obs-callhome-588688bb4d-w9dl4       1/1     Running   0          34m
mayastor-operator-diskpool-8cd67554d-c4zpz   1/1     Running   0          34m
mayastor-promtail-66cj6                      1/1     Running   0          34m
mayastor-promtail-cx9m7                      1/1     Running   0          34m
mayastor-promtail-t789g                      1/1     Running   0          34m
nats-0                                       2/2     Running   0          45m
nats-1                                       2/2     Running   0          45m
nats-2                                       2/2     Running   0          45m
```

**Command to check the Status of Replicated PV Mayastor Volumes**

```
kubectl mayastor get volumes
```

**Sample Output**

```
ID                                    REPLICAS  TARGET-NODE  ACCESSIBILITY  STATUS  SIZE        THIN-PROVISIONED
bf207797-b23d-447a-8d3f-98d378acfa8a  3         worker-0     nvmf           Online  1073741824  false
```
