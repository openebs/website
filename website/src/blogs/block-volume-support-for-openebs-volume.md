---
title: Block volume support for OpenEBS volume
author: Prateek Pandey
author_info: Contributor and Maintainer @OpenEBS. Software Developer at @mayadata_inc. Open Source Enthusiast
date: 27-03-2019
tags: Block, Iscsi, Kubernetes, OpenEBS, Volume
excerpt: A block volume is a volume that appears as a block device inside the container and allows low-level access to the storage without intermediate layers, as with file-system volumes.
---

By extending the API for *PersistentVolumes* to specifically request a raw block device, k8s provides an explicit method for volume consumption. Previously, any request for storage was always fulfilled using a formatted *filesystem*, even when the underlying storage was block storage. Kubernetes v1.13 moves raw block volume support to beta and allows persistent volumes to be exposed inside containers as a block device instead of as a mounted file system.

In addition, the ability to use a raw block device without a *filesystem* will give Kubernetes better support for high-performance applications that are capable of consuming and manipulating block storage for their needs. Block volumes are critical to applications such as databases (MongoDB, Cassandra) that require consistent I/O performance and low latency.

## Block Volume Provisioning

In order to create a block volume, provisioners need to support *volumeMode*, then create a persistent volume with the desired volumeMode. If the admin selects an external provisioner that is capable of provisioning both filesystem and block volumes, he/she will have to carefully prepare the Kubernetes environment for their users as it is necessary for both Kubernetes itself and the external provisioner to support block volume functionality. Support for [block volume in Kubernetes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#raw-block-volume-support) was introduced in v1.9 and promoted to beta in Kubernetes 1.13

With the release of OpenEBS 0.7.0, users can create a block volume via the OpenEBS external-provisioner. With this provisioner, during volume creation, the user requests the PersistentVolumeClaim, which sets *volumeMode=”Block”* in the *PersistentVolumeClaimSpec*, binds it with *PersistentVolume* objects, and Block devices are eventually attached to the pods by including them in the volumes array of the *podSpec.*

Regardless of the *volumeMode*, provisioner can set *FSType* into the plugin’s volumeSource, but the value will be ignored at the volume plugin side if volumeMode = Block. Leaving *volumeMode* blank is essentially the same as specifying *volumeMode = “Filesystem,”* which results in the traditional behavior.

When using a raw block volume in your Pods, you must specify a *VolumeDevice *attributein the Container section of the *PodSpec* rather than a *VolumeMount*. *VolumeDevices* utilize *devicePaths* instead of *mountPaths*. Inside the container, applications will see a device at that path instead of a mounted file system.

## How to Use Block Volume

There are a number of use cases where using a raw block device can be useful. For example, A user can use a raw block device for database applications such as MySQL to read data from and write the results to a disk that has a formatted filesystem to be displayed via the ***nginx*** web server.

The following sections detail some sample volume specifications and steps to dynamically provision a raw block volume and attach it to an application pod.

## Creating a new raw block PVC

Here, the user creates one raw block volume and another formatted filesystem based volume that dynamically creates PersistentVolumes(PV).

1. ***Raw Block volume:***

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: demo-block-pvc
    spec:
      volumeMode: Block
      storageClassName: openebs-default
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5G

2. ***Filesystem based volume:***

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: demo-vol-pvc
    spec:
      storageClassName: openebs-default
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5G

## Using a raw block PVC in POD

Here, the user creates an application pod whose containers consume both block and filesystem volumes. We must choose devicePath for the block device inside the Mysql container rather than the mountPath for the file system.

    apiVersion: v1
    kind: Pod
    metadata:
      name: my-db
    spec:
      volumes:
      - name: my-db-data
        persistentVolumeClaim:
          claimName: demo-block-pvc
      - name: my-nginx-data
        persistentVolumeClaim:
          claimName: demo-vol-pvc
      containers
        - name: mysql
          image: mysql
          volumeDevices: 
          - name: my-db-data
            devicePath: /var/lib/mysql/data
        - name: nginx
          image: nginx
          ports:
          - containerPort: 80
          volumeMounts:
          - mountPath: /usr/share/nginx/html
            name: my-nginx-data 
     readOnly: false

## Conclusion

A *block volume* is a volume that appears as a block device inside the container and allows low-level access to the storage without intermediate layers, as with file-system volumes. There are several advantages *of raw disk partitions*, including:

- Block devices that are actually SCSI disks support the sending of SCSI commands to the device using Linux ioctls.
- Faster I/O without an overhead UNIX file system, more synchronous I/O without UNIX file system buffering, etc.

Thanks to [Karthik Satchitanand](https://medium.com/@karthik.s_5236?source=post_page).
