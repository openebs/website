---
title: Creating manual BlockDevice
author: Akhil Mohan
author_info: Software Engineer @ MayaData, working on Cloud Native Tech.
excerpt: BlockDevices are the consumable units of storage in the OpenEBS storage solution. Users can create BlockDevices manually to support custom partitions/lvms, etc., which are not detected by NDM. To create a manual BlockDevice, follow the steps below
tags: Block Devices, Docker, Uncategorized, Disk, OpenEBS, Kubernetes
date: 16-01-2020
---

BlockDevices are the consumable units of storage in the OpenEBS storage solution. Currently, NDM supports the discovery and management of only a complete disk.

However, users can create BlockDevices manually to support custom partitions/lvms, etc., which are not detected by NDM. To create a manual BlockDevice, follow the steps below:

1. Download the sample block device custom resource YAML file. 
    ```
    wget
    https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_blockdevice_cr.yaml
    ```

2.  Edit the file and fill in the details of the blockdevice. Fields marked with optional are not mandatory and can be removed. All other fields are required and information provided will be used while claiming.
    ```
    apiVersion: openebs.io/v1alpha1
    kind: BlockDevice
    metadata:
      name: example-blockdevice
      labels:
        kubernetes.io/hostname: <host name of the node in which disk/blockdevice is attached> # like gke-openebs-user-default-pool-044afcb8-bmc0
        ndm.io/managed: "false" # for manual disk creation put false
        ndm.io/blockdevice-type: blockdevice
    status:
      claimState: Unclaimed
      state: Active
    spec:
      capacity:
           storage: <total capacity in bytes> #like 53687091200
      details:
        firmwareRevision: <firmware revision> #optional
        model: <model name of blockdevice> # like PersistentDisk, optional
        serial: <serial no of disk> # like google-disk-2, optional
        compliance: <compliance of disk> #like "SPC-4", optional
        vendor: <vendor of disk> #like Google, optional
      devlinks:
      - kind: by-id
        links:
        - <link1> # like /dev/disk/by-id/scsi-0Google_PersistentDisk_disk-2
        - <link2> # like /dev/disk/by-id/google-disk-2
      - kind: by-path
        links:
        - <link1> # like /dev/disk/by-path/virtio-pci-0000:00:03.0-scsi-0:0:2:0
      nodeAttributes:
        nodeName: <node name> # output of `kubectl get nodes` can be used
      path: <devpath> # like /dev/sdb
      ```
3.  Apply the YAML file.
    ```
    kubectl apply -f openebs_v1alpha1_blockdevice_cr.yaml
    ```

The BlockDevice CR will be created and is then used by NDM Operator for claiming, but it won’t be managed by NDM Daemon for any changes that happen on the device. However, all the Claim/Unclaim operations and cleanup operations will be performed on this BlockDevice.

Please provide your valuable feedback & comments below and let me know what I can cover in my next blog.

This blog was originally published on Oct 22nd, 2019, on the [MayaData blog](https://blog.mayadata.io/openebs/creating-manual-blockdevice).
