---
id: clean-up
title: cStor User Guide - Clean Up
keywords:
  - cStor csi
  - cStor User Guide
  - Cleaning up a cStor setup
description: This user guide will help you in cleaning up your cStor setup.
---

This user guide will help you in cleaning up your cStor setup.

### Clean up

- [Cleaning up a cStor setup](#cleaning-up-a-cstor-setup)

## Cleaning up a cStor setup

Follow the steps below to cleanup of a cStor setup. On successful cleanup you can reuse the cluster's disks/block devices for other storage engines.

1. Delete the application or deployment which uses CSI based cStor CAS engine. In this example we are going to delete the Busybox application that was deployed previously. To delete, execute:

   ```
   kubectl delete pod <pod-name>
   ```

   Example command:

```
 kubectl delete busybox
```

Verify that the application pod has been deleted

```
kubectl get pods
```

Sample Output:

```shell hideCopy
No resources found in default namespace.
```

2. Next, delete the corresponding PVC attached to the application. To delete PVC, execute:

   ```
   kubectl delete pvc <pvc-name>
   ```

   Example command:

   ```
   kubectl delete pvc cstor-pvc
   ```

   Verify that the application-PVC has been deleted.

   ```
    kubectl get pvc
   ```

   Sample Output:

   ```shell hideCopy
    No resources found in default namespace.
   ```

3. Delete the corresponding StorageClass used by the application PVC.

   ```
    kubectl delete sc <storage-class-name>
   ```

   Example command:

   ```
   kubectl delete sc cstor-csi-disk
   ```

   To verify that the StorageClass has been deleted, execute:

   ```
   kubectl get sc
   ```

   Sample Output:

   ```shell hideCopy
    No resources found
   ```

4. The blockdevices used to create CSPCs will currently be in claimed state. To get the blockdevice details, execute:

   ```
    kubectl get bd -n openebs
   ```

   Sample Output:

   ```shell hideCopy
    NAME                                          NODENAME         SIZE         CLAIMSTATE  STATUS   AGE
    blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68  worker-node-3    21474836480  Claimed     Active   2m10s
    blockdevice-10ad9f484c299597ed1e126d7b857967  worker-node-1    21474836480  Claimed     Active   2m17s
    blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b  worker-node-2    21474836480  Claimed     Active   2m12s
   ```

   To get these blockdevices to unclaimed state delete the associated CSPC. To delete, execute:

   ```
   kubectl delete cspc <CSPC-name> -n openebs
   ```

   Example command:

   ```
   kubectl delete cspc cstor-disk-pool -n openebs
   ```

   Verify that the CSPC and CSPIs have been deleted.

   ```
    kubectl get cspc -n openebs
   ```

   Sample Output:

   ```shell hideCopy
    No resources found in openebs namespace.
   ```

   ```
    kubectl get cspi -n openebs
   ```

   Sample Output:

   ```shell hideCopy
    No resources found in openebs namespace.
   ```

   Now, the blockdevices must be unclaimed state. To verify, execute:

   ```
    kubectl get bd -n openebs
   ```

   Sample output:

   ```shell hideCopy
    NAME                                          NODENAME         SIZE         CLAIMSTATE   STATUS   AGE
    blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68  worker-node-3    21474836480   Unclaimed   Active   21m10s
    blockdevice-10ad9f484c299597ed1e126d7b857967  worker-node-1    21474836480   Unclaimed   Active   21m17s
    blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b  worker-node-2    21474836480   Unclaimed   Active   21m12s
   ```
