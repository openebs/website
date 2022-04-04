---
id: alphafeatures
title: Alpha Features
keywords: 
 - Alpha version
 - OpenEBS CLI
 - OpenEBS Monitoring
 - Dynamic NFS Provisioner
description: This page provides an overview of OpenEBS components and features that are present in the Alpha version and are under active development. These features are not recommended to be used in production.
---

This page provides an overview of OpenEBS components and features presently in Alpha version and under active development. These features are not recommended to be used in production. We suggest you to familiarize and try these features on test clusters and reach out to [OpenEBS Community](/introduction/community) if you have any queries, feedback or need help on these features.

The list of alpha features include:
- [CSI Driver for Local PV - Device](#csi-driver-for-local-pv-device)
- [Dynamic NFS Provisioner](#dynamic-nfs-provisioner)
- [OpenEBS CLI](#openebs-cli)
- [OpenEBS Monitoring Add-on](#openebs-monitoring-add-on)
- [Data Populator](#data-populator)

:::note
Upgrade is not supported for features in Alpha version.
:::

## CSI Driver for Local PV - Device

OpenEBS is developing a CSI driver for provisioning Local PVs that are backed by block devices. 

For additional details and detailed instructions on how to get started with OpenEBS Local PV - Device CSI Driver please refer this [Quickstart guide](https://github.com/openebs/device-localpv).


## Dynamic NFS Provisioner

OpenEBS is developing a dynamic NFS PV provisioner that can setup a new NFS server on top of any block storage. 

For additional details and detailed instructions on how to get started with OpenEBS NFS PV provisioner please refer this [Quickstart guide](https://github.com/openebs/dynamic-nfs-provisioner).

## OpenEBS CLI

OpenEBS is developing a kubectl plugin for openebs called `openebsctl` that can help perform administrative tasks on OpenEBS volumes and pools. 

For additional details and detailed instructions on how to get started with OpenEBS CLI please refer this [Quickstart guide](https://github.com/openebs/openebsctl).

## OpenEBS Monitoring Add-on

OpenEBS is developing a monitoring add-on package that can be installed via helm or kubectl for setting up a default prometheus, grafana and alert manager stack. The package also will include default service monitors, dashboards and alert rules. 

For additional details and detailed instructions on how to get started with OpenEBS Monitoring Add-on please refer this [Quickstart guide](https://github.com/openebs/monitoring).

## Data Populator

The Data populator can be used to load seed data into a Kubernetes persistent volume from another such volume. The data populator internally uses Rsync, which is a volume populator having the ability to create a volume from any rsync source. 

### Use cases

1. <b>Decommissioning of a node in the cluster</b>: In scenarios where a Kubernetes node needs to be decommissioned whether for upgrade or maintenance, a data populator can be used to migrate the data saved in the local storage of the node, that has to be decommissioned, to another node in the cluster. 
2. <b>Loading seed data to Kubernetes volumes</b>: Data populator can be used to scale applications without using read-write many operation. The application can be pre-populated with the static content available in an existing PV.


### Prerequisites 
 
1. Kubernetes version should be >= 1.22
2. Ensure `AnyVolumeDataSource` feature gate is enabled on the cluster.

### Setting up the Data Populator

1. To get started, the data populator CRD needs to be installed on the setup. To install, execute:

 ```
 kubectl apply -f https://raw.githubusercontent.com/openebs/data-populator/master/deploy/crds/openebs.io_datapopulators.yaml
 ```
2. Next, to install the data populator controller, execute:

 ```
 kubectl apply -f https://raw.githubusercontent.com/openebs/data-populator/master/deploy/yamls/data-populator.yaml
 ```
:::tip NOTE
  The `openebs-data-population` namespace is reserved for populator and no PVC with `dataSourceRef` should be created in this namespace as the data populator controller ignores the PVCs in its working namespace.
:::

### Using Data Populator

This section demonstrates the application of data populator. We will be preparing a source for the data populator with some data and then scale down the application. Next, we will be creating an instance of DataPopulator CR. We will then use the new PVC in the deployment spec of the application.

1. Given below is a sample PVC. Edit the storageClass name based on the requirement.

   ```
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: sample-pvc
   spec:
     storageClassName: openebs-hostpath
     accessModes:
       - ReadWriteOnce
     volumeMode: Filesystem
     resources:
       requests:
         storage: 2Gi   
  ```
2. Next, create an application that would consume the above-created volume. 

  Sample application YAML

  ```
  kind: Deployment
   metadata:
     name: sample-app
     labels:
       app: sample-app
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: sample-app
     template:
       metadata:
         labels:
           app: sample-app
       spec:
         volumes:
           - name: data
             persistentVolumeClaim:
               claimName: sample-pvc
         containers:
           - name: sample-app
             image: busybox
             command: [ "sh", "-c", "sleep 24h" ]
             volumeMounts:
               - name: data
                 mountPath: /data
   ```
3. Input some data into the volume. Given below is a sample input text.

   ```
   kubectl exec -it <pod_name> sh
   ```

   Sample Input:
   ```
   / # cd /data/
   /data # ls -l
   total 0
   /data # echo "hello!" > file
   /data # cat file
   hello!
   /data # exit
  ```

4. Once the data has been written, the deployment of the application has to be scaled down. We will be doing so by setting the replica count for the sample application as 0.

   ```
   kubectl scale deployment <deployment-name> --replicas=0
   ```

5. Next, create an instance of the DataPopulator CR. To do so, execute:

   ```
   apiVersion: openebs.io/v1alpha1
   kind: DataPopulator
   metadata:
     name: sample-data-populator
   spec:
     sourcePVCNamespace: default
     sourcePVC: sample-pvc
     destinationPVC:
       storageClassName: cstor-csi
       accessModes:
       - ReadWriteOnce
       resources:
         requests:
           storage: 2Gi
   ```

:::tip NOTE
  Destination PVC will be created in the same namespace as the data populator instance. Also, destinationPVC field in the above CR has all the PersistentVolumeClaimSpec attributes which will be used to create the destination PVC.
:::
 
  Before proceeding, ensure that the data populator is either in `WaitingForConsumer` or `Completed` state. To check the status of the data populator, execute:

  ```
  kubectl get datapopulator.openebs.io/sample-data-populator -o=jsonpath="{.status.state}{'\n'}"
  ```

  Sample output:
   ``` 
   Completed
   ```

6. Next, the application deployment spec has to be updated with the new PVC name. To list the new PVC, execute:

   ```
   kubectl get pvc -A
   ```

   Sample Output:

   ```
   NAMESPACE   NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS         AGE
   default     sample-pvc              Bound    pvc-bba632ae-98f2-4ee5-abad-b2673caf4835   2Gi        RWO            openebs-hostpath     14d
   default     sample-pvc-populated    Bound    pvc-ab91512c-8514-4952-b558-d711cd21af56   2Gi        RWO            openebs-hostpath-1   20h
   ```

   In the above output, `sample-pvc-populated` is the new PVC.

7. Once the application pod is in `running` status, the new PVC would now contain the data populated from the data-populator.

