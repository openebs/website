---
id: hostpath-deployment
title: Deploy an Application
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Deployment
 - Deploy an Application
description: This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by Hostpath.
---

This document explains how to deploy an application that uses OpenEBS Local Persistent Volumes (PV) backed by Hostpath. It walks through deploying a Pod that consumes a PersistentVolumeClaim (PVC) and verifying that the storage is dynamically provisioned and attached to the application.

## Before You Begin

- Install OpenEBS by following the [Installation](../../../../quickstart-guide/installation.md) guide.
- Create the `local-hostpath-pvc` PVC by following [Create PersistentVolumeClaim](hostpath-create-pvc.md). The PVC remains in `Pending` state until a Pod that uses it is scheduled, which is expected.

## Create a Pod to Consume OpenEBS Local PV Hostpath Storage

1. Save the following Pod definition as `local-hostpath-pod.yaml`.

   ```yaml
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
   The Local PV StorageClasses use `WaitForFirstConsumer`. Do not use `nodeName` in the Pod spec to select a node. If you do, the PVC remains in `Pending` state. Refer to the issue [#2915](https://github.com/openebs/openebs/issues/2915) for more details.
   :::

2. Create the Pod.

   ```
   kubectl apply -f local-hostpath-pod.yaml
   ```

## Verify the Deployment

1. Verify that the container in the Pod is running.

   **Command**

   ```
   kubectl get pod hello-local-hostpath-pod
   ```

2. Verify that the data is being written to the volume.

   **Command**

   ```
   kubectl exec hello-local-hostpath-pod -- cat /mnt/store/greet.txt
   ```

3. Verify that the container is using the Local PV Hostpath.

   **Command**

   ```
   kubectl describe pod hello-local-hostpath-pod
   ```

   The output shows the node that the Pod is running on and the persistent volume provided by `local-hostpath-pvc`.

   **Sample Output**

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

4. Check the PVC again to see the dynamically provisioned Local PV.

   **Command**

   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The `STATUS` is now `Bound`, and a new PV is listed under `VOLUME`.

   **Sample Output**

   ```shell hideCopy
   NAME                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Bound    pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425   5Gi        RWO            openebs-hostpath   28m
   ```

5. Look at the PV details to see where the data is stored. Replace the PV name with the one displayed in the previous step.

   **Command**

   ```
   kubectl get pv pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425 -o yaml
   ```

   The output shows that the PV was provisioned in response to the PVC request `spec.claimRef.name: local-hostpath-pvc`.

   **Sample Output**

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
       storage: 5Gi
     claimRef:
       apiVersion: v1
       kind: PersistentVolumeClaim
       name: local-hostpath-pvc
       namespace: default
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

:::note
The output shows the following characteristics of an OpenEBS Local PV:
- `spec.nodeAffinity` specifies the Kubernetes node where the Pod that uses the Hostpath volume is scheduled.
- `spec.local.path` specifies the unique subdirectory under the `BasePath` defined in the StorageClass. The default `BasePath` is `/var/openebs/local`.
:::

## Cleanup

Delete the Pod and the PersistentVolumeClaim that you created.

```
kubectl delete pod hello-local-hostpath-pod
kubectl delete pvc local-hostpath-pvc
```

Verify that the PV that was dynamically created is also deleted.

```
kubectl get pv
```

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Create StorageClass(s)](hostpath-create-storageclass.md)
- [StorageClass Parameters](hostpath-storageclass-parameters.md)
- [Create PersistentVolumeClaim](hostpath-create-pvc.md)
