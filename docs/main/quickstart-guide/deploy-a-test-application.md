---
id: deployment
title: Deploy a Test Application
keywords: 
  - Deploy
  - Deployment
  - Deploy a Test Application 
description: This guide will help you to deploy a test application
---

# Deploy a Test Application

This guide will help you to deploy OpenEBS.

## Create StorageClass

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
    ### (Optional) Custom Node Labelling

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

## Create a PersistentVolumeClaim

The next step is to create a PersistentVolumeClaim. Pods will use PersistentVolumeClaims to request Hostpath Local PV from *OpenEBS Dynamic Local PV provisioner*.

1. Here is the configuration file for the PersistentVolumeClaim. Save the following PersistentVolumeClaim definition as `local-hostpath-pvc.yaml`

   ```
   kind: PersistentVolumeClaim
   apiVersion: v1
   metadata:
     name: local-hostpath-pvc
   spec:
     storageClassName: openebs-hostpath
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5G
   ```

2. Create the PersistentVolumeClaim

   ```
   kubectl apply -f local-hostpath-pvc.yaml
   ```

3. Look at the PersistentVolumeClaim:
   
   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The output shows that the `STATUS` is `Pending`. This means PVC has not yet been used by an application pod. The next step is to create a Pod that uses your PersistentVolumeClaim as a volume.

   ```shell hideCopy
   NAME                 STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Pending                                      openebs-hostpath   3m7s
   ```

## Create Pod to consume OpenEBS Local PV Hostpath Storage

1. Here is the configuration file for the Pod that uses Local PV. Save the following Pod definition to `local-hostpath-pod.yaml`.

   ```
   apiVersion: v1
   kind: Pod
   metadata:
     name: hello-local-hostpath-pod
   spec:
     volumes:
     - name: local-storage
       persistentVolumeClaim:
         claimName: local-hostpath-pvc
     containers:
     - name: hello-container
       image: busybox
       command:
          - sh
          - -c
          - 'while true; do echo "`date` [`hostname`] Hello from OpenEBS Local PV." >> /mnt/store/greet.txt; sleep $(($RANDOM % 5 + 300)); done'
       volumeMounts:
       - mountPath: /mnt/store
         name: local-storage
   ```

   :::note
   As the Local PV storage classes use `waitForFirstConsumer`, do not use `nodeName` in the Pod spec to specify node affinity. If `nodeName` is used in the Pod spec, then PVC will remain in `pending` state. For more details refer https://github.com/openebs/openebs/issues/2915.
   :::

2. Create the Pod:

   ```
   kubectl apply -f local-hostpath-pod.yaml
   ```

3. Verify that the container in the Pod is running.

   ```
   kubectl get pod hello-local-hostpath-pod
   ```
4. Verify that the data is being written to the volume.

   ```
   kubectl exec hello-local-hostpath-pod -- cat /mnt/store/greet.txt
   ```
   
5. Verify that the container is using the Local PV Hostpath.
   ```
   kubectl describe pod hello-local-hostpath-pod
   ```

   The output shows that the Pod is running on `Node: gke-user-helm-default-pool-3a63aff5-1tmf` and using the persistent volume provided by `local-hostpath-pvc`.

   ```shell hideCopy
   Name:         hello-local-hostpath-pod
   Namespace:    default
   Priority:     0
   Node:         gke-user-helm-default-pool-3a63aff5-1tmf/10.128.0.28
   Start Time:   Thu, 16 Apr 2020 17:56:04 +0000  
   ...  
   Volumes:
     local-storage:
       Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
       ClaimName:  local-hostpath-pvc
       ReadOnly:   false
   ...
   ```

6. Look at the PersistentVolumeClaim again to see the details about the dynamically provisioned Local PersistentVolume
   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The output shows that the `STATUS` is `Bound`. A new Persistent Volume `pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425` has been created. 

   ```shell hideCopy
   NAME                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Bound    pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425   5G         RWO            openebs-hostpath   28m
   ```

7. Look at the PersistentVolume details to see where the data is stored. Replace the PVC name with the one that was displayed in the previous step. 
   ```
   kubectl get pv pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425 -o yaml
   ```
   The output shows that the PV was provisioned in response to PVC request  `spec.claimRef.name: local-hostpath-pvc`. 

   ```shell hideCopy
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
     annotations:
       pv.kubernetes.io/provisioned-by: openebs.io/local
     ...
   spec:
     accessModes:
       - ReadWriteOnce
     capacity:
       storage: 5G
     claimRef:
       apiVersion: v1
       kind: PersistentVolumeClaim
       name: local-hostpath-pvc
       namespace: default
       resourceVersion: "291148"
       uid: 864a5ac8-dd3f-416b-9f4b-ffd7d285b425  
     ...
     ...
     local:
       fsType: ""
       path: /var/openebs/local/pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
     nodeAffinity:
       required:
         nodeSelectorTerms:
         - matchExpressions:
           - key: kubernetes.io/hostname
             operator: In
             values:
             - gke-user-helm-default-pool-3a63aff5-1tmf
     persistentVolumeReclaimPolicy: Delete
     storageClassName: openebs-hostpath
     volumeMode: Filesystem
   status:
     phase: Bound
   ```
   <br/>

:::note 
A few important characteristics of a *OpenEBS Local PV* can be seen from the above output: 
- `spec.nodeAffinity` specifies the Kubernetes node where the Pod using the Hostpath volume is scheduled. 
- `spec.local.path` specifies the unique subdirectory under the `BasePath (/var/local/openebs)` defined in corresponding StorageClass.
:::
  
:::info
- See [Local Engine Deployment](../user-guides/local-engine-user-guide/local-engine-deployment.md) for LVM Local PV Deployment and ZFS Local PV Deployment.
- See [Replicated Engine Deployment](../user-guides/replicated-engine-user-guide/replicated-engine-deployment.md) for Replicated Engine Deployment.
:::
