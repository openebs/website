---
id: localpv-hostpath
title: Local PV Hostpath User Guide
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath
 - Prerequisites
 - Install
 - Create StorageClass
 - Support
description: This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by Hostpath. 
---

# Local PV Hostpath User Guide

This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by Hostpath. 

*OpenEBS Dynamic Local PV provisioner* can create Kubernetes Local Persistent Volumes using a unique Hostpath (directory) on the node to persist data, hereafter referred to as *OpenEBS Local PV Hostpath* volumes. 

*OpenEBS Local PV Hostpath* volumes have the following advantages compared to native Kubernetes hostpath volumes. 
- OpenEBS Local PV Hostpath allows your applications to access hostpath via StorageClass, PVC, and PV. This provides you the flexibility to change the PV providers without having to redesign your Application YAML. 
- Data protection using the Velero Backup and Restore.
- Protect against hostpath security vulnerabilities by masking the hostpath completely from the application YAML and pod.

OpenEBS Local PV uses volume topology aware pod scheduling enhancements introduced by [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local)

:::tip QUICKSTART

OpenEBS Local PV Hostpath volumes will be created under `/var/openebs/local` directory. You can customize the location by [configuring install parameters](#install) or by creating new [StorageClass](#create-storageclass). 

If you have OpenEBS already installed, you can create an example pod that persists data to *OpenEBS Local PV Hostpath* with following kubectl commands. 
```
kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pvc.yaml
kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pod.yaml
```

Verify using below kubectl commands that example pod is running and is using a OpenEBS Local PV Hostpath.
```
kubectl get pod hello-local-hostpath-pod
kubectl get pvc local-hostpath-pvc
```

For a more detailed walkthrough of the setup, follow along the rest of this document.
:::

## Prerequisites

Setup the directory on the nodes where Local PV Hostpaths will be created. This directory will be referred to as `BasePath`. The default location is `/var/openebs/local`.  

`BasePath` can be any of the following:
- A directory on root disk (or `os disk`). (Example: `/var/openebs/local`). 
- In the case of bare-metal Kubernetes nodes, a mounted directory using the additional drive or SSD. (Example: An SSD available at `/dev/sdb`, can be formatted with Ext4 and mounted as `/mnt/openebs-local`) 
- In the case of cloud or virtual instances, a mounted directory created from attaching an external cloud volume or virtual disk. (Example, in GKE, a Local SSD can be used which will be available at `/mnt/disk/ssd1`.)

:::note air-gapped environment
If you are running your Kubernetes cluster in an air-gapped environment, make sure the following container images are available in your local repository.
- openebs/localpv-provisioner
- openebs/linux-utils
:::

:::note Rancher RKE cluster
If you are using the Rancher RKE cluster, you must configure kubelet service with `extra_binds` for `BasePath`. If your `BasePath` is the default directory `/var/openebs/local`, then extra_binds section should have the following details:
```
services:
  kubelet:
    extra_binds:
      - /var/openebs/local:/var/openebs/local
```
:::

## Install 

For installation instructions, see [here](../../quickstart-guide/installation.md).

## Configuration

This section will help you to configure Local PV Hostpath.

### Create StorageClass

You can skip this section if you would like to use default OpenEBS Local PV Hostpath StorageClass created by OpenEBS. 

The default Storage Class is called `openebs-hostpath` and its `BasePath` is configured as `/var/openebs/local`. 

1. To create your own StorageClass with custom `BasePath`, save the following StorageClass definition as `local-hostpath-sc.yaml`

   ```
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: local-hostpath
     annotations:
       openebs.io/cas-type: local
       cas.openebs.io/config: |
         - name: StorageType
           value: hostpath
         - name: BasePath
           value: /var/local-hostpath
   provisioner: openebs.io/local
   reclaimPolicy: Delete
   volumeBindingMode: WaitForFirstConsumer
   ```
    #### (Optional) Custom Node Labelling

    In Kubernetes, Hostpath LocalPV identifies nodes using labels such as `kubernetes.io/hostname=<node-name>`. However, these default labels might not ensure each node is distinct across the entire cluster. To solve this, you can make custom labels. As an admin, you can define and set these labels when configuring a **StorageClass**. Here's a sample storage class:

    ```
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: local-hostpath
      annotations:
        openebs.io/cas-type: local
        cas.openebs.io/config: |
          - name: StorageType
            value: "hostpath"
          - name: NodeAffinityLabels
            list:
              - "openebs.io/custom-node-unique-id"
    provisioner: openebs.io/local
    volumeBindingMode: WaitForFirstConsumer

    ```
  :::note 
  Using NodeAffinityLabels does not influence scheduling of the application Pod. Use kubernetes [allowedTopologies](https://github.com/openebs/dynamic-localpv-provisioner/blob/develop/docs/tutorials/hostpath/allowedtopologies.md) to configure scheduling options.
  :::

2. Edit `local-hostpath-sc.yaml` and update with your desired values for `metadata.name` and `cas.openebs.io/config.BasePath`.

   :::note 
   If the `BasePath` does not exist on the node, *OpenEBS Dynamic Local PV Provisioner* will attempt to create the directory, when the first Local Volume is scheduled on to that node. You MUST ensure that the value provided for `BasePath` is a valid absolute path. 
   :::

3. Create OpenEBS Local PV Hostpath Storage Class. 
   ```
   kubectl apply -f local-hostpath-sc.yaml
   ```

4. Verify that the StorageClass is successfully created. 
   ```
   kubectl get sc local-hostpath -o yaml
   ```

## Deployment

For deployment instructions, see [here](../../quickstart-guide/deploy-a-test-application.md).

## Install verification

Once you have installed OpenEBS, verify that *OpenEBS Local PV provisioner* is running and Hostpath StorageClass is created. 

1. To verify *OpenEBS Local PV provisioner* is running, execute the following command. Replace `-n openebs` with the namespace where you installed OpenEBS. 

   ```
   kubectl get pods -n openebs -l openebs.io/component-name=openebs-localpv-provisioner
   ```

   The output should indicate `openebs-localpv-provisioner` pod is running. 
   ```shell hideCopy
   NAME                                           READY   STATUS    RESTARTS   AGE
   openebs-localpv-provisioner-5ff697f967-nb7f4   1/1     Running   0          2m49s
   ```

2. To verify *OpenEBS Local PV Hostpath* StorageClass is created, execute the following command. 

   ```
   kubectl get sc
   ```

   The output should indicate either the default StorageClass `openebs-hostpath` and/or custom StorageClass `local-hostpath` are displayed.
   ```shell hideCopy
   NAME                        PROVISIONER                                                AGE
   local-hostpath              openebs.io/local                                           5h26m
   openebs-hostpath            openebs.io/local                                           6h4m
   ```

## Cleanup

Delete the Pod, the PersistentVolumeClaim and StorageClass that you might have created. 

```
kubectl delete pod hello-local-hostpath-pod
kubectl delete pvc local-hostpath-pvc
kubectl delete sc local-hostpath
```

Verify that the PV that was dynamically created is also deleted. 
```
kubectl get pv
```

## Support

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

[Installation](../../quickstart-guide/installation.md)
[Deploy an Application](../../quickstart-guide/deploy-a-test-application.md)
