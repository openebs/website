---
id: uninstall
title: Uninstalling OpenEBS
keywords:
 - Uninstalling OpenEBS
 - Uninstall OpenEBS
 - Deletion of Jiva Volumes
description: This section is to describe about the graceful deletion/uninstall of your OpenEBS cluster. OpenEBS cluster has three different storage engine, cStor, Local PV and Jiva. The deletion for the data from the disks after this operation is different for these storage Engines.
---

This section is to describe about the graceful deletion/uninstall of your OpenEBS cluster. OpenEBS cluster has three different storage engine, cStor,Local PV and Jiva. The deletion for the data from the disks after this operation is different for these storage Engines. 

## Uninstall OpenEBS Gracefully

The recommended steps to uninstall the OpenEBS cluster gracefully is as follows.

- Delete all the OpenEBS PVCs that were created. You can check the status of PVC using the following command. 

  ```
  kubectl get pvc -n <namespace>
  ```

  There should not have any entries of OpenEBS PVC.

- Delete all the SPCs (In case of cStor storage engine).  You can check the status of SPC using the following command.

  ```
  kubectl get spc 
  ```

  There should not have any entries of OpenEBS SPC. 
  
- Ensure that there are no stale BlockDeviceClaims present in the cluster. You can verify the status using the following command. 
  
  ```
  kubectl get bdc -n <openebs-namespace>
  ```
  
  If present, remove the finalizer entry from the corresponding BDC. To remove the finalizer, use the following command
  ```
  kubectl patch -n openebs bdc <bdc-name> -p '{"metadata":{"finalizers":null}}' --type=merge
  ```

- Ensure that no OpenEBS volume or pool pods are in terminating state . You can check the running status of Pods using the following command.

  ```
  kubectl get pods -n <openebs namespace>
  ```

- Ensure that no cStor volume custom resources are present using the following command.

  ```
  kubectl get cvr -n <openebs namespace>
  kubectl get cstorvolume -n <openebs namespace>
  ```

- Ensure to delete OpenEBS related `StorageClass`. You can check the status of OpenEBS related StorageClasses using the following command.

  ```
  kubectl get sc
  ```
  
- Ensure that there are no stale BlockDevices present in the cluster. You can verify the status using the following command. 
  
  ```
  kubectl get bd -n <openebs namespace>
  ```
  
  If present, remove the finalizer entry from the corresponding BD and then delete it. To remove the finalizer, use the following command
  ```
  kubectl patch -n openebs bd <blockdevice-xxx> -p '{"metadata":{"finalizers":null}}' --type=merge
  ```
  
- Delete the OpenEBS namespace using helm either via `helm delete <chart name> --purge` (if helm version is v2) or `helm uninstall <chart name> -n <namespace>` (if helm version is v3). It can also be deleted using kubectl as  `kubectl delete ns openebs` or you can delete the corresponding `openebs-operator` YAML using `kubectl delete -f <openebs-operator.yaml>`. You can check the status of OpenEBS namespace using the following command.

  ```
  kubectl get ns
  ```

- Uninstalling the OpenEBS doesn't automatically delete the CRDs that were created. If you would like to completely remove the CRDs and the associated objects, run the following commands:

  ```
  kubectl delete crd castemplates.openebs.io
  kubectl delete crd cstorpools.openebs.io
  kubectl delete crd cstorpoolinstances.openebs.io
  kubectl delete crd cstorvolumeclaims.openebs.io
  kubectl delete crd cstorvolumereplicas.openebs.io
  kubectl delete crd cstorvolumepolicies.openebs.io
  kubectl delete crd cstorvolumes.openebs.io
  kubectl delete crd runtasks.openebs.io
  kubectl delete crd storagepoolclaims.openebs.io
  kubectl delete crd storagepools.openebs.io
  kubectl delete crd volumesnapshotdatas.volumesnapshot.external-storage.k8s.io
  kubectl delete crd volumesnapshots.volumesnapshot.external-storage.k8s.io
  kubectl delete crd blockdevices.openebs.io
  kubectl delete crd blockdeviceclaims.openebs.io
  kubectl delete crd cstorbackups.openebs.io
  kubectl delete crd cstorrestores.openebs.io
  kubectl delete crd cstorcompletedbackups.openebs.io
  kubectl delete crd upgradetasks.openebs.io
  kubectl delete crd cstorpoolclusters.cstor.openebs.io
  kubectl delete crd cstorpoolinstances.cstor.openebs.io
  kubectl delete crd cstorvolumeattachments.cstor.openebs.io
  kubectl delete crd cstorvolumeconfigs.cstor.openebs.io
  kubectl delete crd cstorvolumepolicies.cstor.openebs.io
  kubectl delete crd cstorvolumereplicas.cstor.openebs.io
  kubectl delete crd cstorvolumes.cstor.openebs.io
  ```

  OpenEBS also installs some generic Kubernetes/CSI CRDs. In case OpenEBS is the only storage installed on your cluster, you can proceed to delete the following CRDs as well. 
  ```
  kubectl delete crd csidrivers.csi.storage.k8s.io
  kubectl delete crd csinodeinfos.csi.storage.k8s.io
  kubectl delete crd volumesnapshotclasses.snapshot.storage.k8s.io
  kubectl delete crd volumesnapshotcontents.snapshot.storage.k8s.io
  kubectl delete crd volumesnapshots.snapshot.storage.k8s.io
  ```

- After removing a PVC, you may find a directory `/var/openebs/` on the nodes where the replica was created having some of the volume sub-directory to store metadata info related to the volume, for example `shared-pvc-69adec76-665e-46bc-b957-2b2f58338429-target` with no content. This can be removed manually using the `rm -rf` command once you successfully uninstall the OpenEBS cluster.


:::tip NOTE 
An uninstall script is available [here](https://github.com/openebs/charts/blob/gh-pages/scripts/uninstall/uninstall.sh) to perform all the above steps.
:::

## Deletion of Jiva Volumes

As part of deleting the Jiva Volumes - OpenEBS launches scrub jobs for clearing the data from the nodes.  This job will be running in OpenEBS installed namespace. The completed jobs need to be cleared using the following command.

```
kubectl delete jobs -l openebs.io/cas-type=jiva -n <openebs_namespace>
```

In addition, the job is set with a TTL to get cleaned up, if the Kubernetes version is greater than 1.12. However, for the feature to work, the Kubernetes alpha flag needs to be enabled in the cluster. More information can be read from [here](https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/#clean-up-finished-jobs-automatically).


## See Also:

[FAQ](/additional-info/faqs) [Troubleshooting](/troubleshooting)
