---
title: Running OpenEBS On Custom Rancher Cluster
author: Chandan Sagar Pradhan
author_info: Software Engineer at MayaData
date: 22-10-2018
tags: CAS, Cloud Native Storage, Kubernetes, OpenEBS, Rancher
excerpt: In this blog, I will be explaining how to deploy an application in a custom Rancher cluster on an OpenEBS volume.
---

In this blog, I will be explaining how to deploy an application in a custom Rancher cluster on an OpenEBS volume. **OpenEBS** is a leading open-source storage platform that provides persistent and containerized block storage for DevOps and container environments. **Rancher** is enterprise management for Kubernetes. Before you begin, please make sure all the prerequisites are met.

## Node Requirements:

- Ubuntu 16.04(64-bit)
- 4 vCPUS and 16 GB RAM
- Docker 17.03.2

## Prerequisites:

- Rancher 2.0 UI installed and running.

After the installation of the docker, I used the below command to install Rancher. For more information on installing Rancher visit Rancher docs at [https://rancher.com/docs/rancher/v2.x/en/](https://rancher.com/docs/rancher/v2.x/en/)

    sudo docker run -d --restart=unless-stopped -p 8080:8080 rancher/server:stable

- Minimum of 1 master and 3 worker
- (Optional) 6 nodes for the cluster ( 3 master and 3 workers)
- *iscsiadm* should be present only on kubelet (And verification steps)

### Remove iscsiadm from nodes:

Check the below commands on all worker nodes.

    iscsiadm -V
    docker exec kubelet iscsiadm -V

Sample Output:

    root@worker1 ~ # iscsiadm -V
    iscsiadm version 2.0–873
    root@worker1 ~ # sudo docker exec kubelet iscsiadm -V
    iscsiadm version 2.0–874

If your output is similar to the sample above, then you have to remove iscsi from the node. OpenEBS target will use the iscsi inside the kubelet. Run the commands below to remove iscsi from the node.

    service iscsid stop
    sudo apt remove open-iscsi

### Load iscsi_tcp module:

The above step may remove the iscsi_tcp probe, and after a reboot, the node will not start the iscsi_tcp service, and OpenEBS volume mount will fail. It should be the same with the command below.

    lsmod | grep iscsi

SampleOutput:

    root@worker113:~# lsmod | grep iscsi
    iscsi_tcp 20480 0
    libiscsi_tcp 24576 1 iscsi_tcp
    libiscsi 53248 2 libiscsi_tcp,iscsi_tcp
    scsi_transport_iscsi 98304 2 libiscsi,iscsi_tcp

If your output is similar to the sample above, then, you are good to go. If your output doesn’t have `iscsi_tcp`, you need to follow the below steps to load the `iscsi_tcp` module.

    modprobe iscsi_tcp

You can verify the same from the command below. Now the output should be similar to the sample output mentioned above

    lsmod | grep iscsi

### Persist iscsi_tcp module to load after reboot:

You can make the kernel load iscsi_tcp automatically every time the node reboots by appending the line `iscsi_tcp in /etc/` modules.

Example:

    # /etc/modules: kernel modules to load at boot time.
    #
    # This file contains the names of kernel modules that should be loaded
    # at boot time, one per line. Lines beginning with “#” are ignored.
    iscsi_tcp

Now if all prerequisites have been met, go ahead with setting up the cluster. You can go directly to deploy the OpenEBS section if you already have a k8s cluster.

### Creating a Custom k8s cluster on Rancher:

- Once you have deployed Rancher, you should be able to access the UI. Login to your rancher UI using your credentials

![rancher login screen](/images/blog/rancher-login-screen.png)

- Now click on the global tab and then click on add cluster button. We should see the `add cluster` window.

Example:
![rancher ui add cluster](/images/blog/rancher-ui-add-cluster.png)

- Under the add cluster option, click on the custom. Then give the cluster a name. You can customize the cluster under Cluster Options. You can choose Kubernetes version, Network provider and other options. Here, I have selected Kubernetes Version as V.1.11.2-rancher1–1, Network provider as Canal and Cloud Provider as none.

Example:
![rancher ui add custom](/images/blog/rancher-ui-add-custom.png)

![rancher ui custom options](/images/blog/rancher-ui-custom-options.png)

- Now, click on the Next button; it will open another page. On this page, you can select node roles like etcd/ Control Plane / Worker. Click on `Show advanced options.` Now add the i/p address of the node in the Internal Address section.

Example:

![rancher ui cluster summary](/images/blog/rancher-ui-cluster-summary.png)

- Copy the command mentioned in the page to the node, which will be added to the cluster. Once you run the command, the page will show `1 new node registered.`

![rancher ui more options](/images/blog/rancher-ui-more-options.png)

- Now click on *Done*. Follow the same process to add more nodes to the cluster.
- Once all the nodes are added, you can deploy OpenEBS on the cluster.

### Deploy OpenEBS:

**Note:** Ensure that you have met the prerequisites before installation.

The latest version of OpenEBS, i.e., 0.7 can be installed using the below steps.

    kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.7.0.yaml

### Select Your Storage Engine:

You can now choose the storage engine to provision Jiva or cStor volumes. As a cluster admin, you can provision jiva or cStor based on your requirements.

Here I am going to use the Jiva storage engine.

### Provisioning Jiva Storage Engine:

Jiva can be provisioned in your Kubernetes cluster by using the following procedure.

### Verify if the OpenEBS installation is complete.

OpenEBS pods are created under `openebs` namespace, default Storage Pool and default Storage Classes are created after installation.

You can get the OpenEBS pods status by running following command

    kubectl get pods -n openebs

You can use the default Jiva storage class in your application YAML to run the application. You can get the storage classes that are already created by using the following command.

    kubectl get sc

### Following is an example output.

    NAME                 PROVISIONER                  AGE
    openebs-cstor-sparse openebs.io/provisioner-iscsi 4m
    openebs-jiva-default openebs.io/provisioner-iscsi 4m
    openebs-snapshot-promoter volumesnapshot.external-storage.k8s.io/snapshot-promoter 4m

OpenEBS installation will create Jiva storage pool also. It will be created by default on `/var/openebs` inside the hosted path on the nodes.

You can get the storage pool details by running the following command.

    kubectl get sp

Following is an example output.

    NAME                   AGE
    cstor-sparse-pool-gjo0 5m
    cstor-sparse-pool-str9 5m
    cstor-sparse-pool-x4dm 5m
    default                5m

From the above output, cstor-sparse-pools are default cstor engine pools whereas *default* is the jiva storage engine default pool.

### Deploying applications on OpenEBS:

Now I will deploy Percona DB on OpenEBS volume.

You can get the percona deployment YAML from the command below:

    wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/percona/percona-openebs-deployment.yaml

You have to edit the percona-openebs-deployment.yaml to use the jiva storage engine.

Use vi command to edit the YAML file. Inside the YAML file under the PersistentVolumeClaim section, you have to update the storageClassName. You have to use the `openebs-jiva-default` storage class.

Example:

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
     name: demo-vol1-claim
    spec:
     storageClassName: openebs-jiva-default 
     accessModes:
     — ReadWriteOnce
     resources:
     requests:
     storage: 5G

Run the below command to deploy percona application.

    kubectl apply -f percona-openebs-deployment.yaml

Run the below command to check percona pods should be running now.

    kubectl get pods

Example Scenario 1:

    NAME READY STATUS RESTARTS AGE
    default-demo-vol1-claim-3213556361-ctrl-c96bdd757–4fhqq 2/2 Running 0 2m
    default-demo-vol1-claim-3213556361-rep-58b96b64d6-glkbs 1/1 Running 0 2m
    default-demo-vol1-claim-3213556361-rep-58b96b64d6-jxwvr 1/1 Running 0 2m
    default-demo-vol1-claim-3213556361-rep-58b96b64d6-stcbb 1/1 Running 0 2m
    percona-86d6cf8547–7t6bz 1/1 Running 0 2m

Now we are running an application successfully on an OpenEBS volume on a Rancher custom cluster.

## Troubleshooting:

**If application pod is stuck in containercreating for more time you have to follow the below steps**:

Example Scenario 2:

    NAME READY STATUS RESTARTS AGE
    default-demo-vol1-claim-3213556361-ctrl-c96bdd757–4fhqq 2/2 Running 0 2m
    default-demo-vol1-claim-3213556361-rep-58b96b64d6-glkbs 1/1 Running 0 2m
    default-demo-vol1-claim-3213556361-rep-58b96b64d6-jxwvr 1/1 Running 0 2m
    default-demo-vol1-claim-3213556361-rep-58b96b64d6-stcbb 1/1 Running 0 2m
    percona-86d6cf8547–7t6bz 1/1 ContainerCreating 0 2m

**Cause:**

- As part of the startup of the node, iscsi was already installed and running on the node.
- Kubelet startup doesn’t start the iscsid as it is already running on the node.
- When volume login is initiated, iscsiadm from kubelet is trying to contact the iscsid (running on the host) to initiate the connection. The version doesn’t match that results in an error from iscsid to iscsiadm and prints `12 — module not loaded`.

**Recovery Step:**

- Refer to the remove iscsiadm section in pre-requisites

**After rebooting the nodes, the pods will stick again in container creating state.**

**Cause:**

- After reboot, the kernel may not load the `iscsi_tcp` module automatically.

**Recovery Step:**

Refer to the persist iscsi_tcp module to load after reboot section in the pre-requisites section.

Hopefully, this will help you to configure OpenEBS on top of Rancher 2.0. Thank you for reading, and please provide any feedback below or on twitter — [@chandan4147](https://twitter.com/chandan4147). For more details on OpenEBS installation and troubleshooting visit [https://docs.openebs.io/](https://docs.openebs.io/).
