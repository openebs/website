---
id: lvm-localpv
title: LVM Local PV User Guide
keywords:
 - OpenEBS LVM Local PV
 - LVM Local PV
 - Prerequisites
 - Install
 - Create StorageClass
 - Install verification
 - Create a PersistentVolumeClaim
description: This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by LVM Local PV. 
---

# LVM Local PV User Guide

This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by LVM Local PV. 

## Prerequisites

Before installing LVM driver, make sure your Kubernetes Cluster must meet the following prerequisites:

1. All the nodes must have lvm2 utils installed and the dm-snapshot kernel module loaded.
2. You have access to install RBAC components into kube-system namespace. The OpenEBS LVM driver components are installed in kube-system namespace to allow them to be flagged as system critical components.

## Setup Volume Group

Find the disk which you want to use for the LVM, for testing you can use the loopback device

```
truncate -s 1024G /tmp/disk.img
sudo losetup -f /tmp/disk.img --show
```

Create the Volume group on all the nodes, which will be used by the LVM Driver for provisioning the volumes

```
sudo pvcreate /dev/loop0
sudo vgcreate lvmvg /dev/loop0       ## here lvmvg is the volume group name to be created
```

## Installation

For installation instructions, see [here](../../quickstart-guide/installation.md).

## Configuration

This section will help you to configure LVM Local PV.

### Create a StorageClass

```
$ cat sc.yaml

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
parameters:
  storage: "lvm"
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
```

Check the doc on [storageclasses](https://github.com/openebs/lvm-localpv/blob/develop/docs/storageclasses.md) to know all the supported parameters for LVM-LocalPV.

#### VolumeGroup Availability

If LVM volume group is available on certain nodes only, then make use of topology to tell the list of nodes where we have the volgroup available. As shown in the below storage class, we can use allowedTopologies to describe volume group availability on nodes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
allowVolumeExpansion: true
parameters:
  storage: "lvm"
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
allowedTopologies:
- matchLabelExpressions:
  - key: kubernetes.io/hostname
    values:
      - lvmpv-node1
      - lvmpv-node2
```

The above storage class tells that volume group "lvmvg" is available on nodes lvmpv-node1 and lvmpv-node2 only. The LVM driver will create volumes on those nodes only.

 :::note
 The provisioner name for LVM driver is "local.csi.openebs.io", we have to use this while creating the storage class so that the volume provisioning/deprovisioning request can come to LVM driver.
 :::

 ### Create a PersistentVolumeClaim

 ```
 $ cat pvc.yaml

kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
 ```

 Create a PVC using the storage class created for the LVM driver.

 ## Deploy the Application

 Create the deployment yaml using the pvc backed by LVM storage.

 ```
 $ cat fio.yaml

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
      claimName: csi-lvmpv
 ```

 After the deployment of the application, we can go to the node and see that the lvm volume is being used by the application for reading/writting the data and space is consumed from the LVM. Please note that to check the provisioned volumes on the node, we need to run pvscan --cache command to update the lvm cache and then we can use lvdisplay and all other lvm commands on the node.

 ## Deprovisioning

To deprovision the volume we can delete the application which is using the volume and then we can go ahead and delete the pv, as part of deletion of pv this volume will also be deleted from the volume group and data will be freed.

```
$ kubectl delete -f fio.yaml
pod "fio" deleted
$ kubectl delete -f pvc.yaml
persistentvolumeclaim "csi-lvmpv" deleted
```

## Limitation

Resize of volumes with snapshot is not supported.

## Support

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

[Installation](../../quickstart-guide/installation.md)
[Deploy an Application](../../quickstart-guide/deploy-a-test-application.md)
