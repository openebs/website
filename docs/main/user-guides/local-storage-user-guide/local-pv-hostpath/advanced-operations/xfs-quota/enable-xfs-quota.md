---
id: enable-xfs-quota
title: Enable XFS Quota on LocalPV Hostpath
keywords:
 - OpenEBS LocalPV Hostpath Enable XFS Quota
 - XFS Quota
 - Enable XFS Quota
 - Advanced Operations
description: This section talks about enabling XFS quotas for OpenEBS LocalPV Hostpath. 
---

# Enable XFS Quota on LocalPV Hostpath

This document provides the necessary steps to enable and configure XFS Quota on OpenEBS LocalPV HostPath. By following these instructions, you will install the OpenEBS LocalPV provisioner, create a StorageClass with XFS Quota support, and set up a PersistentVolumeClaim (PVC) to apply project quotas on the local volumes. It also includes the process for mounting the volume to an application pod and verifying that the quota is successfully applied.

## Install the OpenEBS Dynamic LocalPV Provisioner

1. To install the OpenEBS LocalPV Hostpath Provisioner, execute the following command:

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-lite.yaml
```

2. Verify the pods in the `openebs` namespace are running.

```
kubectl get pods -n openebs
```

**Example Output**

```
NAME                                           READY   STATUS    RESTARTS       AGE
openebs-localpv-provisioner-6ddbd95d4d-htp7g   1/1     Running       0          7m12s
```

## Create StorageClass

1. To create a hostpath StorageClass with the XFSQuota configuration option, use the following YAML definition. This configuration will enable the XFSQuota for the specified path and storage type.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath-xfs
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/openebs/local/"
      - name: XFSQuota
        enabled: "true"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

2. For advanced configuration of XFSQuota, you may also set the `softLimitGrace` and `hardLimitGrace` parameters, which define the storage capacity limits beyond the Persistent Volume (PV) storage request. The updated YAML definition is as follows:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath-xfs
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/openebs/local/"
      - name: XFSQuota
        enabled: "true"
        data:
          softLimitGrace: "0%"
          hardLimitGrace: "0%"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

:::note
- `softLimitGrace` and `hardLimitGrace` are used in conjunction with the PV storage request to determine the soft and hard limits of the quota.

- The size of these limits is calculated as **"Size of PV storage request * (1 + LimitGrace%)"**

- If no values are specified, the default is **softLimitGrace: "0%" / hardLimitGrace: "0%"**, meaning the storage capacity is limited to the PV storage request value.
  
  For example, with a PV of 100Gi capacity and values **softLimitGrace: "90%" / hardLimitGrace: "100%"**, the soft limit will be set to 190Gi, and the hard limit will be set to 200Gi.
  You can select to use either `softLimitGrace` or `hardLimitGrace` independently based on your requirements.

  Refer to the relevant [xfs_quota documentation](https://man7.org/linux/man-pages/man8/xfs_quota.8.html#QUOTA_OVERVIEW) for more detailed instructions regarding the configuration of soft and hard limits.
:::

## Create a PVC

1. To create a PVC using the StorageClass's name, use the following definition:

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: local-hostpath-xfs
spec:
  storageClassName: openebs-hostpath-xfs
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

At this stage, the PVC will remain in the 'Pending' state until the volume is successfully mounted.

2. Verify the PVC status.

```
$ kubectl get pvc
```

**Example Output**

```
NAME                  STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS           AGE
local-hostpath-xfs    Pending                                      openebs-hostpath-xfs   21s
```

## Mount the Volume

1. Mount the volume to the application pod container. A sample BusyBox Pod template is as follows:

```
apiVersion: v1
kind: Pod
metadata:
  name: busybox
spec:
  volumes:
  - name: local-storage
    persistentVolumeClaim:
      claimName: local-hostpath-xfs
  containers:
  - name: busybox
    image: busybox
    command:
       - sh
       - -c
       - 'while true; do echo "`date` [`hostname`] Hello from OpenEBS Local PV." >> /mnt/store/greet.txt; sleep $(($RANDOM % 5 + 300)); done'
    volumeMounts:
    - mountPath: /mnt/store
      name: local-storage
```

The PVC status will change to 'Bound' once the volume is successfully mounted and the quota will be applied.

2. Verify that the XFS project quota is applied.

```
$ sudo xfs_quota -x -c 'report -h' /var/openebs/local/
```

**Example Output**

```
Project quota on /var/openebs/local (/dev/loop16)
                        Blocks
Project ID   Used   Soft   Hard Warn/Grace
---------- ---------------------------------
#0              0      0      0  00 [------]
#1              0   5.7G   6.7G  00 [------]
```

## Limitation

Resizing of quota is not supported.

## See Also

- [XFS Quota Prerequisites](xfs-quota-pre.md)
- [Modify XFS Quota on LocalPV Hostpath](modify-xfs-quota.md)
- [XFS Quota with Loop Device](xfs-quota-pre.md)