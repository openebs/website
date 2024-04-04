---
id: zfs-deployment
title: Deploy an Application
keywords:
 - OpenEBS ZFS Local PV
 - ZFS Local PV
 - Deploy an Application
description: This section explains the instructions to deploy an application the OpenEBS Local Persistent Volumes (PV) backed by the ZFS Storage.
---

This section explains the instructions to deploy an application the OpenEBS Local Persistent Volumes (PV) backed by the ZFS Storage.

Create the deployment yaml using the pvc backed by Local PV ZFS storage.

```
apiVersion: v1
kind: Pod
metadata:
  name: fio
spec:
  restartPolicy: Never
  containers:
  - name: perfrunner
    image: openebs/tests-fio
    command: ["/bin/bash"]
    args: ["-c", "while true ;do sleep 50; done"]
    volumeMounts:
       - mountPath: /datadir
         name: fio-vol
    tty: true
  volumes:
  - name: fio-vol
    persistentVolumeClaim:
      claimName: csi-zfspv
```

After the deployment of the application, we can go to the node and see that the zfs volume is being used by the application for reading/writting the data and space is consumed from the ZFS pool.

## ZFS Property Change

ZFS Volume Property can be changed like compression on/off can be done by just simply editing the kubernetes resource for the corresponding zfs volume by using below command:

```
$ kubectl edit zv pvc-34133838-0d0d-11ea-96e3-42010a800114 -n openebs
```
You can edit the relevant property like make compression on or make dedup on and save it. This property will be applied to the corresponding volume and can be verified using below command on the node:

```
$ zfs get all zfspv-pool/pvc-34133838-0d0d-11ea-96e3-42010a800114
```

## Deprovisioning

To deprovision the volume we can delete the application which is using the volume and then we can go ahead and delete the pv, as part of deletion of pv this volume will also be deleted from the ZFS pool and data will be freed.

```
$ kubectl delete -f fio.yaml
pod "fio" deleted
$ kubectl delete -f pvc.yaml
persistentvolumeclaim "csi-zfspv" deleted
```

:::info
If you are running kernel ZFS on the same set of nodes, the following two points are recommended:

- Disable zfs-import-scan.service service that will avoid importing all pools by scanning all the available devices in the system, disabling scan service will avoid importing pools that are not created by kernel.

- Disabling scan service will not cause harm since zfs-import-cache.service is enabled and it is the best way to import pools by looking at cache file during boot time.

```
$ systemctl stop zfs-import-scan.service
$ systemctl disable zfs-import-scan.service
```

Always maintain upto date /etc/zfs/zpool.cache while performing operations on zfs pools (zpool set cachefile=/etc/zfs/zpool.cache).
:::

## Support

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../quickstart-guide/installation.md)
- [Deploy an Application](../../quickstart-guide/deploy-a-test-application.md)