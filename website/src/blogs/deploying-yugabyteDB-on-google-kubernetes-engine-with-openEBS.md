---
title: Deploying YugabyteDB on Google Kubernetes Engine with OpenEBS
author: OpenEBS
author_info: OpenEBS is the most widely deployed and easy to use open source storage solution for Kubernetes
tags: OpenEBS, Open Source, Yugabyte, Cloud Native Gke
date: 05-04-2021
excerpt: In this blog post, we’ll walk you through the necessary steps to get a 3 node YugabyteDB cluster running on top of GKE, backed by OpenEBS.
---

[OpenEBS](https://www.openebs.io/) is a CNCF project backed by [MayaData](https://mayadata.io/) that provides cloud-native, open source container attached storage (CAS). OpenEBS delivers persistent block storage and other capabilities such as integrated back-up, management of local and cloud disks, and more. For enterprise cloud-native applications, OpenEBS provides storage functionality that is idiomatic with cloud-native development environments, with granular storage policies and isolation that enable cloud developers and architects to optimize storage for specific workloads.

Because [YugabyteDB](https://www.yugabyte.com/) is a cloud-native, distributed SQL database that runs in Kubernetes environments, it can interoperate with OpenEBS and many other CNCF projects.

**Wait, what is YugabyteDB?** _It is an open source, and high-performance distributed SQL database built on a scalable and fault-tolerant design inspired by Google Spanner. Yugabyte’s YSQL API is PostgreSQL wire compatible._

In this blog post we’ll walk you through the necessary steps to get a 3 node YugabyteDB cluster running on top of GKE, backed by OpenEBS.

[![Deploying YugabyteDB on Google Kubernetes Engine with OpenEBS](/images/blog/deploying-yugabytedb-on-google-kubernetes-engine-with-openebs-video-preview.png)](https://player.vimeo.com/video/530995643?app_id=122963)


**Why OpenEBS and YugabyteDB?**  
Because YugabyteDB is a transactional database often used as a system of record, it needs to be deployed as a StatefulSet on Kubernetes and requires persistent storage. OpenEBS can be used for backing YugabyteDB local disks, allowing the provisioning of large-scale persistent volumes. 

Here are a few of the advantages of using OpenEBS in conjunction with a YugabyteDB database cluster:

- There’s no need to manage the local disks as OpenEBS manages them.
- OpenEBS and YugabyteDB can provision large size persistent volumes.
- With OpenEBS persistent volumes, capacity can be thin provisioned, and disks can be added to OpenEBS on the fly without disruption of service. When this capability is combined with YugabyteDB, which already supports multi-TB data density per node, this can prove to be[ massive cost savings on storage.](https://docs.openebs.io/features.html#reduced-storage-tco-upto-50)
- Both OpenEBS and YugabyteDB support multi-cloud deployments [helping organizations avoid cloud lock-in.](https://docs.openebs.io/docs/next/features.html#truely-cloud-native-storage-for-kubernetes)
- Both OpenEBS and YugabyteDB integrate with another CNCF project, [Prometheus](https://prometheus.io/). This makes it easy to [monitor both storage and the database](https://docs.openebs.io/docs/next/features.html#prometheus-metrics-for-workload-tuning) from a single system.

Additionally, OpenEBS can do [synchronous replication](https://docs.openebs.io/docs/next/features.html#synchronous-replication) inside a geographic region. In a scenario where YugabyteDB is deployed across regions, and a node in any one region fails, YugaByteDB would have to rebuild this node with data from another region. This would incur cross-region traffic, which is more expensive and lower in performance. But, with OpenEBS, this rebuilding of a node can be done seamlessly because OpenEBS is replicating locally inside the region. This means YugabyteDB does not end up having to copy data from another region, which ends up being less expensive and higher in performance. In this deployment setup, only if the entire region failed, YugabyteDB would need to do a cross-region node rebuild. Additional detailed descriptions of OpenEBS enabled use cases can be found [here.](https://docs.openebs.io/docs/next/usecases.html)

Ok, let’s get started!

**Prerequisites**  

![Yugabyte work flow](/images/blog/yugabyte-work-flow.png)

Using the latest and greatest versions of the available software (as of this blog’s writing), below is the environment which we’ll use to run a YugabyteDB cluster on top of a Google Kubernetes Engine (GKE) cluster backed by OpenEBS

1. YugabyteDB - [Version 2.5.3.1](https://docs.yugabyte.com/latest/quick-start/install/)
2. OpenEBS - [Version 2.7.0](https://github.com/openebs/openebs)
3. A [Google Cloud Platform](https://cloud.google.com/gcp/) account

**Step 1: Setting Up a Cluster on GKE**  
To deploy YugabyteDB on the Google Cloud Platform (GCP), we first have to set up a cluster using Ubuntu as our base node image.

**Note**: _GKE’s Container-Optimized OS does not come with an iSCSI client pre-installed and does not allow the installation of an iSCSI client. Therefore, we’ll be using the Ubuntu with Docker image type for our nodes._

For the purposes of this demo, I used the Google Cloud Console to configure my Kubernetes cluster. Aside from the typical defaults, here’s the options under the* Node Pools > default-pool > Nodes*  I selected

- **Image Type:** Ubuntu with Docker
- **Series:** N1
- **Machine Type:** n1-standard-4 (4 vCPU, 15 GB memory)

![Yugabyte nodes](/images/blog/yugabyte-nodes.png)

Click _Create_ and wait for the Kubernetes cluster to come online.

**Step 2: Configure iSCSI**  
The iSCSI client is a prerequisite for provisioning cStor and Jiva volumes. However, it is recommended that the iSCSI client is setup and *iscsid* service is running on worker nodes before proceeding with the OpenEBS installation. In order to set up iSCSI, we’ll first need to determine the names of the nodes in our cluster

    $ kubectl get nodes

    NAME                                       	STATUS   ROLES    	AGE   	VERSION
    gke-cluster-1-default-pool-be95f6dd-5x65  	Ready    <none>   	18h   	v1.18.15-gke.1501
    gke-cluster-1-default-pool-be95f6dd-rs6c  	Ready    <none>   	18h 	v1.18.15-gke.1501
    gke-cluster-1-default-pool-be95f6dd-t4cp  	Ready    <none> 	18h  	v1.18.15-gke.1501

    Now that we have the names of our nodes, we’ll want to log into each node and enable the iSCSI service.

    $ gcloud compute ssh <node name>
    $ sudo systemctl enable iscsid && sudo systemctl start iscsid

    You can check the status of the iSCSI service using the following command:

    $ systemctl status iscsid

    iscsid.service - iSCSI initiator daemon (iscsid)
       Loaded: loaded (/lib/systemd/system/iscsid.service; enabled; vendor preset: enabled)
       Active: active (running) since Fri 2021-03-26 02:25:42 UTC; 18h ago
         Docs: man:iscsid(8)
      Process: 10052 ExecStart=/sbin/iscsid (code=exited, status=0/SUCCESS)
      Process: 10038 ExecStartPre=/lib/open-iscsi/startup-checks.sh (code=exited, status=0/SUCCESS)
     Main PID: 10059 (iscsid)
        Tasks: 2 (limit: 4915)
       CGroup: /system.slice/iscsid.service
               ├─10057 /sbin/iscsid
               └─10059 /sbin/iscsid
    Mar 26 02:25:42 gke-cluster-1-default-pool-be95f6dd-5x65 systemd[1]: Starting iSCSI initiator daemon (iscsid)...
    Mar 26 02:25:42 gke-cluster-1-default-pool-be95f6dd-5x65 iscsid[10052]: iSCSI logger with pid=10057 started!
    Mar 26 02:25:42 gke-cluster-1-default-pool-be95f6dd-5x65 systemd[1]: Started iSCSI initiator daemon (iscsid).

**Step 3: Install OpenEBS**  
Next, let’s install OpenEBS. I’ve found that the OpenEBS Operator is one of the simplest ways to get the software up and running.

    $ kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml

Once the installation is completed, check and verify the status of the pods. You should something similar to this:

    $ kubectl get pods -n openebs

    NAME                                            READY   STATUS
    maya-apiserver-dd655ff87-rbgmd                  1/1     Running
    openebs-admission-server-5965c94767-4h8rc       1/1     Running
    openebs-localpv-provisioner-5495669c66-z46lr    1/1     Running
    openebs-ndm-dss64                               1/1     Running
    openebs-ndm-gnv75                               1/1     Running
    openebs-ndm-operator-68949644b9-mqvlx           1/1     Running
    openebs-ndm-r5pws                               1/1     Running
    openebs-provisioner-544cb85449-w9spl            1/1     Running
    openebs-snapshot-operator-6d65b778dd-79zcn      2/2     Running

**Step 4: Create and Attach Disks to Nodes**  
Our worker nodes need to have disks attached. These disks need to be unmounted and not have a filesystem on them. To accomplish this we’ll need to execute the following commands on each node.

    $ gcloud compute disks create disk1 --size=10GB
    $ gcloud compute instances attach-disk gke-cluster-1-default-pool-be95f6dd-5x65 --disk disk1

    $ gcloud compute disks create disk2 --size=10GB
    $ gcloud compute instances attach-disk gke-cluster-1-default-pool-be95f6dd-rs6c --disk disk2

    $ gcloud compute disks create disk3 --size=10GB
    $ gcloud compute instances attach-disk gke-cluster-1-default-pool-be95f6dd-t4cp --disk disk3

    Next let’s verify that our block devices are indeed attached.

    $ kubectl get blockdevice -n openebs

    NAME              NODENAME                           SIZE          CLAIMSTATE   STATUS
    blockdevice-03... gke-cluster-1-default-pool-be9...  10736352768   Claimed      Active
    blockdevice-85... gke-cluster-1-default-pool-be9...  10736352768   Claimed      Active
    blockdevice-b0... gke-cluster-1-default-pool-be9...  10736352768   Claimed      Active

**Step 5: Create a Storage Pool Claim**  
Now that we have the names of our block devices and have verified that they are active, the next step is to create a Storage Pool Claim. We’ll use this to then create a Storage Class, and finally use that for our Persistent Volume Claims. The first step in this chain of steps is to configure our Storage Pool Claim YAML file. In this demo, I’ve named it “cstor-pool1-config.yaml”.

    $ vim cstor-pool1-config.yaml

    #Use the following YAMLs to create a cStor Storage Pool.
    apiVersion: openebs.io/v1alpha1
    kind: StoragePoolClaim
    metadata:
      name: cstor-disk-pool
      annotations:
        cas.openebs.io/config: |
          - name: PoolResourceRequests
            value: |-
                memory: 2Gi
          - name: PoolResourceLimits
            value: |-
                memory: 4Gi
    spec:
      name: cstor-disk-pool
      type: disk
      poolSpec:
        poolType: striped
      blockDevices:
        blockDeviceList:
    - blockdevice-03e93d010db5169322eb16f3e18e33ed
    - blockdevice-22591882979084d0fe580fe229e0d84f
    - blockdevice-4d1b4bacbeec1650b337c2cfda7e3a48
    ---

    Once you’ve figured out how to exit vim, the next step is to create the resource.
    $ kubectl create -f cstor-pool1-config.yaml

We can verify our storage pool with the following command:

    $ kubectl get csp

    NAME                   ALLOCATED   FREE    CAPACITY   STATUS    READONLY   TYPE
    cstor-disk-pool-6cmf   1.85M       9.94G   9.94G      Healthy   false      striped
    cstor-disk-pool-jql6   40.6M       9.90G   9.94G      Healthy   false      striped
    cstor-disk-pool-vbz5   68.2M       9.87G   9.94G      Healthy   false      striped

**Step 6: Create a Storage Class**  
Now that we have a storage pool, let’s configure the YAML file for our storage class.  In this demo, I’ve named it “openebs-sc-rep1.yaml”.

    $ vim openebs-sc-rep1.yaml

    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: openebs-sc-rep1
      annotations:
        openebs.io/cas-type: cstor
        cas.openebs.io/config: |
          - name: StoragePoolClaim
            value: "cstor-disk-pool"
          - name: ReplicaCount
            value: "1"
    provisioner: openebs.io/provisioner-iscsi

Assuming you have remembered how to exit vim from the previous step, we now need to create the storage class.

    $ kubectl create -f openebs-sc-rep1.yaml

Finally, let’s verify the storage class.

    $ kubectl get sc

    NAME                  PROVISIONER                  RECLAIMPOLICY   VOLUMEBINDINGMODE
    openebs-device        openebs.io/local             Delete          WaitForFirstConsumer
    openebs-hostpath      openebs.io/local             Delete          WaitForFirstConsumer
    openebs-jiva-default  openebs.io/provisioner-iscsi Delete          Immediate
    openebs-sc-rep1       openebs.io/provisioner-iscsi Delete          Immediate
    openebs-snapshot...   volumesnapshot.external...   Delete          Immediate
    premium-rwo           pd.csi.storage.gke.io        Delete          WaitForFirstConsumer
    standard (default)    kubernetes.io/gce-pd         Delete          Immediate
    standard-rwo          pd.csi.storage.gke.io        Delete          WaitForFirstConsumer

At this point, we are now set up for Persistent Volume Claims.

**Step 7: Install YugabyteDB**  
In this final step we’ll install a 3 node YugabyteDB cluster running on top of GKE that will be backed by the OpenEBS deployment we just completed.

The first step is to create a namespace.

_$ kubectl create namespace yb-demo_

Next, let’s install the cluster using Helm.

    $ helm install yb-demo yugabytedb/yugabyte --set resource.master.requests.cpu=1,resource.master.requests.memory=1Gi,\
    resource.tserver.requests.cpu=1,resource.tserver.requests.memory=1Gi,\
    enableLoadBalancer=True --namespace yb-demo  --set storage.master.storageClass=openebs-sc-rep1,storage.tserver.storageClass=openebs-sc-rep1 --set persistence.storageClass=openebs-cstor-disk --wait

Note that in the command above we are specifying the following so that YugabyteDB makes explicit use of OpenEBS:

- _storage.master.storageClass=openebs-sc-rep1_
- _storage.tserver.storageClass=openebs-sc-rep1_
- _persistence.storageClass=openebs-cstor-disk_

Once the installation is complete you should be able log into the PostgreSQL compatible YSQL shell on port 5433 with the following command:

    $ kubectl --namespace yb-demo exec -it yb-tserver-0 -- sh -c "cd /home/yugabyte && ysqlsh -h yb-tserver-0"

    ysqlsh (11.2-YB-2.5.3.1-b0)
    Type "help" for help.
    yugabyte=#

You can also access the basic YugabyteDB web admin portal at:

_http://<yb-master-ui-endpoint>:7000_

![Yugabyte master](/images/blog/yugabyte-master.png)

**Viewing Services and Ingress**  
A quick and visual way to check out all the services and ingress is to go to the “Services and Ingress” view in the Google Cloud Console. If you’ve made it this far you should see something like this:

![Yugabyte ingress](/images/blog/yugabyte-ingress.png)

Note: I have omitted the “Endpoints” column from the screenshot above, but in your view you’ll be able to see the IPs and ports of the various endpoints.

That’s it! You now have a 3 node YugabyteDB cluster running on GKE with OpenEBS storage.

**Next Steps**  
As mentioned, MayData is the chief sponsor of the OpenEBS project. It offers an enterprise-grade OpenEBS platform that makes it easier to run stateful applications on Kubernetes by helping get your workloads provisioned, backed-up, monitored, logged, managed, tested, and even migrated across clusters and clouds. You can learn more about MayaData [here.](https://mayadata.io/)

- Learn more about OpenEBS by visiting the [GitHub](https://github.com/openebs/openebs) and [official Docs](https://docs.openebs.io/) pages.
- Learn more about YugabyteDB by visiting the [GitHub](https://github.com/yugabyte/yugabyte-db) and [official Docs](https://docs.yugabyte.com/) pages.

**About the author:**

![Jimmy Guerrero](/images/blog/authors/jimmy-guerrero.png)

Jimmy Guerrero, VP Marketing, and Community at YugaByte.