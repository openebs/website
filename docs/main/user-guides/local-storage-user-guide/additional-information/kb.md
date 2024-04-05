---
id: kb
title: Knowledge Base
keywords: 
 - Knowledge base
 - OpenEBS Knowledge base
 - OpenEBS summary
 - Kubernetes StatefulSet
description: The knowledge base include summaries, manuals, troubleshooting guides, runbooks, and other information that users want or need to know.

---

### How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC {#reuse-pv-after-recreating-sts}

There are some cases where it had to delete the StatefulSet and re-install a new StatefulSet. In the process you may have to delete the PVCs used by the StatefulSet and retain PV policy by ensuring the Retain as the "Reclaim Policy". In this case, following are the procedures for re-using an existing PV in your StatefulSet application.

1. Get the PV name by following command and use it in Step 2.

   ```
   kubectl get pv
   ```

   Following is an example output

   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
   pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            Delete           Bound     default/mongo-persistent-storage-mongo-0   mongo-pv-az              9m
   ```  

2. Patch corresponding PV's reclaim policy from "Delete" to "Retain". So that PV will retain even its PVC is deleted.This can be done by using the steps mentioned [here](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/#why-change-reclaim-policy-of-a-persistentvolume).

   Example Output:

   ```shell hideCopy
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
   pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            Retain           Bound     default/mongo-persistent-storage-mongo-0   mongo-pv-az              9m
   ``` 

3. Get the PVC name by following command and note down the PVC name. You have to use this same PVC name while creating new PVC.

   ```
   kubectl get pvc
   ```

   Example Output:

   ```shell hideCopy
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Lost      pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   0                        mongo-pv-az    4s
   ```

4. Delete StatefulSet application and associated PVCs.

5. Create a new PVC YAML named *newPVC.yaml* with same configuration. Specify old PV name belongs to *volumeName* under the PVC spec.

   ```
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     annotations:
       pv.kubernetes.io/bind-completed: "yes"
       pv.kubernetes.io/bound-by-controller: "yes"
       volume.beta.kubernetes.io/storage-provisioner: openebs.io/provisioner-iscsi
     labels:
       environment: test
       openebs.io/replica-anti-affinity: vehicle-db
       role: mongo
     name: mongo-persistent-storage-mongo-0
     namespace: default
   spec:
     accessModes:
     - ReadWriteOnce
     resources:
       requests:
         storage: 5G
     storageClassName: mongo-pv-az
     volumeName: pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7
   status:
     accessModes:
     - ReadWriteOnce
     capacity:
       storage: 5G
   ```

6. Apply the modified PVC YAML using the following command

   ```
   kubectl apply -f newPVC.yaml
   ```

   Example Output:

   ```shell hideCopy
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Lost      pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   0                        mongo-pv-az    4s
   ```

7. Get the newly created PVC UID using `kubectl get pvc mongo-persistent-storage-mongo-0 -o yaml`.

8. Update the uid under the claimRef in the PV using the following command. The PVC will get attached to the PV after editing the PV with correct uid.

   ```
   kubectl edit pv pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7
   ```
9. Get the updated PVC status using the following command.

   ```
   kubectl get pvc
   ```

   Example Output:

   ```shell hideCopy
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Bound     pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            mongo-pv-az    5m
   ```

10. Apply the same StatefulSet application YAML. The pod will come back online by re-using the existing PVC. The application pod status can be get by following command.

  ```
  kubectl get pods -n <namespace>
  ```

[Go to top](#top)

### How to install OpenEBS in OpenShift 4.x {#openshift-install}

#### Tested versions

OpenEBS has been tested in the following configurations;

| OpenShift Version | OS                                           | Status |
|-------------------|----------------------------------------------|--------|
| 4.2               | [RHEL7.6](../prerequisites.mdx), CoreOS 4.2 | Tested |
| 3.10              | [RHEL7.6](../prerequisites.mdx), CoreOS 4.2 | Tested |

#### Notes on security

**Note:** Earlier documentation for installing OpenEBS on OpenShift required disabling SELinux. This is no longer necessary - SELinux does not need to be disabled now.

**Note:** However, the OpenEBS operator, and some projects that use OpenEBS
volumes do require privileged Security Context Constraints. This is described below. 

#### Installation option: via the OperatorHub

The easiest way to install OpenEBS is by using the operator in the OperatorHub; 

![OpenShift in OperatorHub](../../../assets/openshift-operatorhub.png)

This guide recommends installing the operator into an empty `openebs`
namespace.

![OpenShift in OperatorHub](../../../assets/openshift-operator-installnamespace.png)

#### Installation option: via "manual" install

1. Find the latest OpenEBS release version from [here](/introduction/releases) and download the latest OpenEBS operator YAML in your master node. The latest openebs-operator YAML file can be downloaded using the following way.

    ```
    wget https://openebs.github.io/charts/openebs-operator-1.2.0.yaml
    ```

2. Apply the modified the YAML using the following command. 

    ```
    kubectl apply -f openebs-operator-1.2.0.yaml
    ```

#### Adding `privileged` SCC to the `openebs-maya-operator` service account

The examples below assume you have installed OpenEBS in the `OpenEBS` project.
If you have used another namespace, change `-n` accordingly. 


Add the `privileged` SecurityContextConstraint (SCC) to the OpenEBS service account; 

   ```
   oc adm policy add-scc-to-user privileged -z openebs-maya-operator -n openebs
   ```

Example output:

   ```shell hideCopy
   securitycontextconstraints.security.openshift.io/privileged added to: ["system:serviceaccount:openebs:openebs-maya-operator"]
   ```

#### Quickly verifying the installation

Verify OpenEBS pod status by using `kubectl get pods -n openebs`, all pods
should be "Running" after a few minutes. If pods are not running after a few
minutes, start debugging with `oc get events` and viewing these container logs.
```
NAME                                          READY   STATUS    RESTARTS   AGE
maya-apiserver-594699887-4x6bj                1/1     Running   0          60m
openebs-admission-server-544d8fb47b-lxd52     1/1     Running   0          60m
openebs-localpv-provisioner-59f96b699-dpf8l   1/1     Running   0          60m
openebs-ndm-4v6kj                             1/1     Running   0          60m
openebs-ndm-8g226                             1/1     Running   0          60m
openebs-ndm-kkpk7                             1/1     Running   0          60m
openebs-ndm-operator-74d9c78cdc-lbtqt         1/1     Running   0          60m
openebs-provisioner-5dfd95987b-nhwb9          1/1     Running   0          60m
openebs-snapshot-operator-5d58bd848b-94nnt    2/2     Running   0          60m
```
If you are seeing errors with `hostNetwork` or similar, this is likely because
the serviceAccount for that container has not been added to the `privileged` SCC.

**Next Steps:** 

* You may want to fully [verifying the OpenEBS installation](/user-guides/installation#verifying-openebs-installation) in more detail.
* After verification, you probably want to [select a CNS Engine](/concepts/casengines).

#### Adding `privileged` SCC to projects that use OpenEBS volumes

When you create a PVC using a StorageClass for OpenEBS, a `ctrl` and `rep`
deployment will be created for that PVC. The `rep` containers also need to be
privileged. 

Switch to a project that is using OpenEVS PVs; 

```
oc project myproject
```

To stop the whole project running as privileged, you could create a new serviceAccount for the project, and only run the Deployment/pvc-...-rep using that service account.

However, an easy (and lazy, insecure) workaround is change this project's
`default` ServiceAccount to be privileged.

```
oc adm policy add-scc-to-user privileged -z default -n myproject
```

**Note:** OpenShift automatically creates a project for every namespace, and a `default` ServiceAccount for every project.

Once these permissions have been granted, you can provision persistent volumes using OpenEBS. See [CAS Engines](/concepts/casengines) for more details. 

[Go to top](#top)

### How to enable Admission-Controller in OpenShift 3.10 and above {#enable-admission-controller-in-openshift}

The following procedure will help to enable admission-controller in OpenShift 3.10 and above.

1. Update the `/etc/origin/master/master-config.yaml`  file with below configuration.

   ```
   admissionConfig:
     pluginConfig:
       ValidatingAdmissionWebhook: 
         configuration:
           kind: DefaultAdmissionConfig
           apiVersion: v1
           disable: false 
       MutatingAdmissionWebhook: 
         configuration:
           kind: DefaultAdmissionConfig
           apiVersion: v1
           disable: false 
   ```

2. Restart the API and controller services using the following commands.

   ```
   # master-restart api
   # master-restart controllers
   ```

[Go to top](#top)

### How to setup default PodSecurityPolicy to allow the OpenEBS pods to work with all permissions?


Apply the following YAML in your cluster.

- Create a Privileged PSP

  ```
  apiVersion: extensions/v1beta1
  kind: PodSecurityPolicy
   metadata:
     name: privileged
     annotations:
       seccomp.security.alpha.kubernetes.io/allowedProfileNames: '*'
   spec:
     privileged: true
     allowPrivilegeEscalation: true
     allowedCapabilities:
     - '*'
     volumes:
     - '*'
     hostNetwork: true
     hostPorts:
     - min: 0
       max: 65535
     hostIPC: true
     hostPID: true
     runAsUser:
       rule: 'RunAsAny'
     seLinux:
       rule: 'RunAsAny'
     supplementalGroups:
       rule: 'RunAsAny'
     fsGroup:
       rule: 'RunAsAny'    
  ```

- Associate the above PSP to a ClusterRole

  ```
  kind: ClusterRole
  apiVersion: rbac.authorization.k8s.io/v1
  metadata:
    name: privilegedpsp
  rules:
  - apiGroups: ['extensions']
    resources: ['podsecuritypolicies']
    verbs:     ['use']
    resourceNames:
    - privileged
  ```

- Associate the above Privileged ClusterRole to OpenEBS Service Account

  ```
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
    annotations:
      rbac.authorization.kubernetes.io/autoupdate: "true"
    name: openebspsp
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: privilegedpsp
  subjects:
  - kind: ServiceAccount
    name: openebs-maya-operator
    namespace: openebs
  ```

- Proceed to install the OpenEBS. Note that the namespace and service account name used by the OpenEBS should match what is provided in   the above ClusterRoleBinding.

[Go to top](#top)



### How to prevent container logs from exhausting disk space? {#enable-log-rotation-on-cluster-nodes}

Container logs, if left unchecked, can eat into the underlying disk space causing `disk-pressure` conditions
leading to eviction of pods running on a given node. This can be prevented by performing log-rotation
based on file-size while specifying retention count. One recommended way to do this is by configuring the
docker logging driver on the individual cluster nodes. Follow the steps below to enable log-rotation.


1. Configure the docker configuration file /etc/docker/daemon.json (create one if not already found) with the
log-options similar to ones shown below (with desired driver, size at which logs are rotated, maximum logfile
retention count & compression respectively):

   ```
   {
     "log-driver": "json-file",
     "log-opts": {
        "max-size": "400k",
        "max-file": "3",
        "compress": "true"
     }
   }
   ```

2. Restart the docker daemon on the nodes. This may cause a temporary disruption of the running containers & cause
the node to show up as `Not Ready` until the daemon has restarted successfully.

   ```
   systemctl daemon-reload
   systemctl restart docker
   ```

3. To verify that the newly set log-options have taken effect, the following commands can be used:

   * At a node-level, the docker logging driver in use can be checked via the following command:

     ```
     docker info
     ```

     The `LogConfig` section of the output must show the desired values:

     ```
      "LogConfig": {
      "Type": "json-file",
      "Config": {}
     ```

   - At the individual container level, the log options in use can be checked via the following command:

     ```
     docker inspect <container-id>
     ```

     The `LogConfig` section of the output must show the desired values:

     ```
      "LogConfig": {
             "Type": "json-file",
             "Config": {
                 "max-file": "3",
                 "max-size": "400k",
                 "compress": "true"
              }
      }      
     ```

4. To view the current & compressed files, check the contents of the `/var/lib/docker/containers/<container-id>/` directory. The symlinks at `/var/log/containers/<container-name>` refer to the above.

**NOTES:**

- The steps are common for Linux distributions (tested on CentOS, RHEL, Ubuntu)

- Log rotation via the specified procedure is supported by docker logging driver types: `json-file (default), local`

- Ensure there are no dockerd cli flags specifying the `--log-opts` (verify via `ps -aux` or service definition
  files in `/etc/init.d` or `/etc/systemd/system/docker.service.d`). The docker daemon fails to start if an option
  is duplicated between the file and the flags, regardless their value.

- These log-options are applicable only to the containers created after the dockerd restart (which is automatically
  taken care by the kubelet)

- The `kubectl log` reads the uncompressed files/symlinks at `/var/log/containers` and thereby show rotated/rolled-over
  logs. If you would like to read the retained/compressed log content as well use `docker log` command on the nodes.
  Note that reading from compressed logs can cause temporary increase in CPU utilization (on account of decompression
  actions performed internally)

- The log-opt `compress: true:` is supported from Docker version: 18.04.0. The `max-file` & `max-size` opts are supported
  on earlier releases as well.

[Go to top](#top)

### How to create a BlockDeviceClaim for a particular BlockDevice? {#create-bdc-for-a-blockdevice}

There are certain use cases where the user does not need some of the BlockDevices discovered by OpenEBS to be used by any of the storage engines. In such scenarios, users can manually create a BlockDeviceClaim to claim that particular BlockDevice, so that it won't be used by Local PV. The following steps can be used  to claim a particular BlockDevice: 

1. Download the BDC CR YAML from `node-disk-manager` repository.

   ```
   wget https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_blockdeviceclaim_cr.yaml
   ```

2. Provide the BD name of the corresponding BlockDevice which can be obtained by running `kubectl get bd -n <openebs_installed_namespace>` 

3. Apply the modified YAML spec using the following command:

   ```
   kubectl apply -f openebs_v1alpha1_blockdeviceclaim_cr.yaml -n <openebs_installed_namespace>
   ```
   **Note:** The blockdeviceclaim CR should be created on the same namespace where openebs is installed.

4. Verify if particular BDC is created for the given BD cr using the following command:

   ```
   kubectl get bdc -n <openebs_installed_namespace>
   ```

[Go to top](#top)

### How to provision Local PV on K3OS? {#provision-localpv-on-k3os}

K3OS can be installed on any hypervisor The procedure for deploying K3OS on VMware environment is provided in the following section. There are 3 steps for provisioning OpenEBS Local PV on K3OS.

1. Configure server(master)
2. Configure agent(worker)
3. Deploying OpenEBS

The detailed information of each steps are provided below.

- **Configure server(master)**

  - Download the ISO file from the latest [release](https://github.com/rancher/k3os/releases) and create a virtual machine in VMware. Mount the ISO file into hypervisor and start a virtual machine.

  - Select **Run k3OS LiveCD or Installation** and press `<ENTER>`.

  - The system will boot-up and gives you the login prompt.

  - Login as **rancher** user without providing password.

  - Set a password for **rancher** user to enable connectivity from other machines by running `sudo passwd rancher`.

  - Now, install K3OS into disk. This can be done by running the command `sudo os-config`.

  - Choose the option 1.Install to disk . Answer the proceeding questions and provide rancher user password.

  - As part of above command execution, you can configure the host as either server or agent. Select `1.server` to configure K3s master.

  - While configuring server, set cluster secret which would be used while joining nodes to the server. After successful installation and server reboot, check the cluster status.

  - Run following command to get the details of nodes:

    ```
    kubectl get nodes
    ```

    Example output:

    ```
    NAME         STATUS   ROLES    AGE     VERSION
    k3os-14539   Ready    <none>   2m33s   v1.14.1-k3s.4
    ```

- **Configure agent(worker)**

  - Follow the above steps till installing K3OS into disk in all the hosts that you want to be part of K3s cluster.

  - To configure kubernetes agent with K3OS, select the option `2. agent` while running `sudo os-config` command. You need to provide URL of server and secret configured during server configuration.

  - After performing this, Kubernetes agent will be configured as follows and it will be added to the server.

  - Check the cluster configuration by checking the nodes using the following command:

    ```
    Kubectl get nodes
    ```

    Example output:

    ```
    NAME         STATUS   ROLES    AGE     VERSION
    k3os-14539   Ready    <none>   5m16s   v1.14.1-k3s.4
    k3os-32750   Ready    <none>   49m     v1.14.1-k3s.4
    ```

- **Installing OpenEBS**

  - Run the following command to install OpenEBS from master console:

    ```
    kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.1.0.yaml
    ```

  - Check the OpenEBS components by running the following command:

    ```
    NAME                                           READY   STATUS              RESTARTS   AGE
    maya-apiserver-78c966c446-zpvhh                1/1     Running             2          101s
    openebs-admission-server-66f46564f5-8sz8c      1/1     Running             0          101s
    openebs-localpv-provisioner-698496cf9b-wkf95   1/1     Running             0          101s
    openebs-ndm-9kt4n                              0/1     ContainerCreating   0          101s
    openebs-ndm-mxqcf                              0/1     ContainerCreating   0          101s
    openebs-ndm-operator-7fb4894546-d2whz          1/1     Running             1          101s
    openebs-provisioner-7f9c99cf9-9jlgc            1/1     Running             0          101s
    openebs-snapshot-operator-79f7d56c7d-tk24k     2/2     Running             0          101s
    ```

    Note that `openebs-ndm` pods are in not created successfully. This is due to the lack of udev support in K3OS. More details can be found [here](https://github.com/openebs/openebs/issues/2686).

  - Now user can install Local PV on this cluster. Check the StorageClasses created as part of OpenEBS deployment by running the following command.

    ```
    kubectl get sc
    ```

    Example output:

    ```
    NAME                        PROVISIONER                                                AGE
    openebs-hostpath            openebs.io/local                                           57m
    openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   57m
    ```

  - The default StorageClass `openebs-hostpath` can be used to create local PV on the path `/var/openebs/local` in your Kubernetes node. You can either use `openebs-hostpath` storage class to create volumes or create new storage class by following the steps mentioned [here](/user-guides/localpv-hostpath).

    **Note:** OpenEBS local PV will not be bound until the application pod is scheduled as its **volumeBindingMode** is set to **WaitForFirstConsumer.** Once the application pod is scheduled on a certain node, OpenEBS Local PV will be bound on that node.

[Go to top](#top)
