---
id: enable-ext4-quota
title: Enable EXT4 Quota on LocalPV Hostpath
keywords:
 - OpenEBS LocalPV Hostpath Enable EXT4 Quota
 - EXT4 Quota
 - Enable EXT4 Quota
 - Advanced Operations
description: This section describes about enabling EXT4 quotas for OpenEBS LocalPV Hostpath.
---

# Enable EXT4 Quota on LocalPV Hostpath

This document provides the necessary steps to enable and configure EXT4 Quota on OpenEBS LocalPV Hostpath. By following these instructions, you will install the OpenEBS LocalPV provisioner, create a StorageClass with EXT4 Quota support, and set up a PersistentVolumeClaim (PVC) to apply project quotas on the local volumes. It also includes the process for mounting the volume to an application pod and verifying that the quota is successfully applied.

:::important
Complete the [EXT4 Quota Prerequisites](ext4-quota-pre.md) before proceeding. The filesystem holding the `BasePath` must have the `project` and `quota` features enabled and must be mounted with the `prjquota` option.
:::

## Install the OpenEBS Dynamic LocalPV Provisioner

Refer to the [OpenEBS Installation documentation](../../../../../quickstart-guide/installation.md) to install the OpenEBS LocalPV Hostpath Provisioner.

## Create StorageClass

1. To create a hostpath StorageClass with the EXT4Quota configuration option, use the following YAML definition. This configuration will enable the EXT4Quota for the specified path and storage type.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath-ext4
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/openebs/local/"
      - name: EXT4Quota
        enabled: "true"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

2. For advanced configuration of EXT4Quota, you may also set the `softLimitGrace` and `hardLimitGrace` parameters, which define the storage capacity limits beyond the Persistent Volume (PV) storage request. The updated YAML definition is as follows:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath-ext4
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/openebs/local/"
      - name: EXT4Quota
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

  Refer to the [setquota documentation](https://man7.org/linux/man-pages/man8/setquota.8.html) for more detailed information regarding soft and hard limits.
:::

## Create a PVC

1. To create a PVC using the StorageClass's name, use the following definition:

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: local-hostpath-ext4
spec:
  storageClassName: openebs-hostpath-ext4
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
NAME                  STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS            AGE
local-hostpath-ext4   Pending                                      openebs-hostpath-ext4   21s
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
      claimName: local-hostpath-ext4
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

2. Verify that the EXT4 project quota is applied. Run the command on the node where the volume was provisioned.

```
$ sudo repquota -P /var/openebs/local
```

**Example Output**

```
*** Report for project quotas on device /dev/nvme1n1
Block grace time: 7days; Inode grace time: 7days
                        Block limits                File limits
Project         used    soft    hard  grace    used  soft  hard  grace
----------------------------------------------------------------------
#0        --      20       0       0              2     0     0
#1        --       0 5242880 5242880              1     0     0
```

3. You can also confirm the project ID that was assigned to the volume directory.

```
$ sudo lsattr -pd /var/openebs/local/pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
```

**Example Output**

```
    1 --------------P------ /var/openebs/local/pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
```

## Limitation

Resizing of quota is not supported.

## See Also

- [EXT4 Quota Prerequisites](ext4-quota-pre.md)
- [Modify EXT4 Quota on LocalPV Hostpath](modify-ext4-quota.md)
- [EXT4 Quota with Loop Device](loop-device-ext4-quota.md)
