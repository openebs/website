---
title: Setting up persistent volumes in RWX mode using OpenEBS
author: Ashish Ranjan
author_info: An enthusiastic person when it comes to software & computers. I don't mind getting out of my comfort zone when things related to computing need to be done at the spur of the moment.
date: 02-10-2018
tags: OpenEBS, Solutions, wordpress, Nfs, Cloud Native Storage
excerpt: Many stateful applications like WordPress require persistent storage in Read-Write-Many or RWX mode. OpenEBS is popular in the open-source community for its ease of use, and its simplistic design for pluggable storage engines.
---

Many stateful applications like WordPress require persistent storage in Read-Write-Many or RWX mode. OpenEBS is popular in the open-source community for its ease of use, and its simplistic design for pluggable storage engines.

Currently, block volume or iSCSI support is provided natively by OpenEBS. Here, native iSCSI support means that the iSCSI stack is part of OpenEBS project and has full support for synchronous replication, granular monitoring, day 2 storage operations like backup restore, etc. iSCSI is typically used in Read-Write-Once or RWO mode which is common for all block storage engines. There have been multiple inquiries from the OpenEBS community about RWX support from OpenEBS, in other words, support for NFS. Though native support for NFS is being considered, it is already possible today to provision RWX mode storage using OpenEBS and to use it for applications like WordPress that require RXW mode.

![openebs-nfs](/images/blog/wordpress-with-openebs-over-nfs.png)

In this blog, an example of WordPress is taken to show how OpenEBS storage volumes are exposed in RWX mode through the use of NFS in between WordPress and the Jiva volumes of OpenEBS.

WordPress, when deployed on Kubernetes, requires both shared storage volumes on NFS and block storage volumes on iSCSI. The shared storage is required to store the core WordPress content or the admin managed content so that all the WordPress PODs can share the same data quickly. When PODs are spawned by Kubernetes on the fly to service more traffic, the PODs need to initialize quickly and require the core data to be available close to the application and in RWX mode. As an extremely high percentage of the shared storage traffic is Read traffic, the RWX volume need not be highly performant for writes and therefore the data can be served through NFS sitting in front of an iSCSI volume.

The typical deployment of a scalable WordPress application is shown in the below diagram.

![wordpress-deployment-architecture](/images/blog/wordpress-deployment-architecture.png)

As shown in the above, OpenEBS can be used to serve the storage volumes in both RWO and RWX modes. The NFS storage volume for WordPress is served through the Kubernetes external storage plugin “[nfs](https://github.com/kubernetes-incubator/external-storage/tree/master/nfs)”. The block storage for the database needs of WordPress is provided through OpenEBS JIVA volumes. If distributed databases like Percona or MariaDB are used then a common approach is that the database is deployed as a StatefulSet for horizontal scalability and Jiva volumes are deployed as a single replica. Alternatively one can use MySQL with jiva persistent volume replicating to three copies for enhanced resiliency.

## Configuration details of PVC's and Storage Classes

![pvc-and-storage-classes](/images/blog/pvc-and-storage-classes.png)

The PVC construct openebs-nfs-pvc and storage class construct openebs-nfs-sc are used to create an NFS share in RWX mode to be consumed by the WordPress pod. The deployment spec of nfs-provisioner uses an OpenEBS PVC claim which dynamically provisions the JIVA volumes in RWO mode and mounts them inside the nfs-provisioner pod. The entire process can take under 10–15 seconds.

## A note on the required size of the NFS volume and the provisioned size of Jiva volume

As we are providing RWX volume over and above the RWO Jiva volume, iSCSI space overhead needs to be considered. It is recommended that the OpenEBS storage class specifies 10% more space than what is required by the NFS PVC.

For example, if WordPress NFS PVC spec specifies 100G as the required storage of the NFS volume, it is recommended to request 110G as the required storage from the OpenEBS Jiva volume.

### TL;DR

Shared storage can be provisioned in RWX mode on OpenEBS through a single PVC request.

## YAML spec examples:

The same YAML spec can be found in the Kubernetes external storage NFS plugin. The YAML specs below show how to provision the OpenEBS iSCSI storage in the nfs-provisioner pod automatically.

## YAML spec for NFS provisioner security policy

GitHub Code Snippet:

    
    kind: PodSecurityPolicy
    metadata:
      name: openebs-nfs-provisioner
    spec:
      fsGroup:
        rule: RunAsAny
      allowedCapabilities:
      - DAC_READ_SEARCH
      - SYS_RESOURCE
      runAsUser:
        rule: RunAsAny
      seLinux:
        rule: RunAsAny
      supplementalGroups:
        rule: RunAsAny
      volumes:
      - configMap
      - downwardAPI
      - emptyDir
      - persistentVolumeClaim
      - secret
      - hostPath

By applying the above YAML we will create PodSecurityPolicy for the NFS server.

## YAML spec for ClusterRoleBinding for NFS provisioner

GitHub Code Snippet:

    kind: ClusterRole
    apiVersion: rbac.authorization.k8s.io/v1
    metadata:
      name: openebs-nfs-provisioner-runner
    rules:
      - apiGroups: [""]
        resources: ["persistentvolumes"]
        verbs: ["get", "list", "watch", "create", "delete"]
      - apiGroups: [""]
        resources: ["persistentvolumeclaims"]
        verbs: ["get", "list", "watch", "update"]
      - apiGroups: ["storage.k8s.io"]
        resources: ["storageclasses"]
        verbs: ["get", "list", "watch"]
      - apiGroups: [""]
        resources: ["events"]
        verbs: ["create", "update", "patch"]
      - apiGroups: [""]
        resources: ["services", "endpoints"]
        verbs: ["get"]
      - apiGroups: ["extensions"]
        resources: ["podsecuritypolicies"]
        resourceNames: ["nfs-provisioner"]
        verbs: ["use"]
    ---
    kind: ClusterRoleBinding
    apiVersion: rbac.authorization.k8s.io/v1
    metadata:
      name: openebs-run-nfs-provisioner
    subjects:
      - kind: ServiceAccount
        name: openebs-nfs-provisioner
         # replace with namespace where provisioner is deployed
        namespace: default
    roleRef:
      kind: ClusterRole
      name: openebs-nfs-provisioner-runner
      apiGroup: rbac.authorization.k8s.io
    ---
    kind: Role
    apiVersion: rbac.authorization.k8s.io/v1
    metadata:
      name: openebs-leader-locking-nfs-provisioner
    rules:
      - apiGroups: [""]
        resources: ["endpoints"]
        verbs: ["get", "list", "watch", "create", "update", "patch"]
    ---
    kind: RoleBinding
    apiVersion: rbac.authorization.k8s.io/v1
    metadata:
      name: openebs-leader-locking-nfs-provisioner
    subjects:
      - kind: ServiceAccount
        name: openebs-nfs-provisioner
        # replace with namespace where provisioner is deployed
    roleRef:
      kind: Role
      name: openebs-leader-locking-nfs-provisioner
      apiGroup: rbac.authorization.k8s.io

The above YAML will successfully create role bindings for the NFS provisioner. So it’s time to configure NFS provisioner YAML to use OpenEBS volumes and apply them to the Kubernetes cluster.

## YAML spec for NFS provisioner deployment

GitHub Code Snippet:

    ---
    apiVersion: v1
    kind: ServiceAccount # Creating a service account for openebs-nfs-provisioner
    metadata:
     name: openebs-nfs-provisioner
    ---
    apiVersion: v1
    kind: Service # Creating a service for openebs-nfs-provisioner
    metadata:
     name: openebs-nfs-provisioner
     labels:
       app: openebs-nfs-provisioner
    spec:
     ports:
       - name: nfs
         port: 2049
       - name: mountd
         port: 20048
       - name: rpcbind
         port: 111
       - name: rpcbind-udp
         port: 111
         protocol: UDP
     selector:
       app: openebs-nfs-provisioner
    ---
    apiVersion: apps/v1
    kind: Deployment # Creating deployment for openebs-nfs-provisoner
    metadata:
     name: openebs-nfs-provisioner
    spec:
     selector:
       matchLabels:
         app: openebs-nfs-provisioner
     replicas: 1
     strategy:
       type: Recreate
     template:
       metadata:
         labels:
           app: openebs-nfs-provisioner
       spec:
         serviceAccount: openebs-nfs-provisioner
         containers:
           - name: openebs-nfs-provisioner
             image: quay.io/kubernetes_incubator/nfs-provisioner:latest
             ports:
               - name: nfs
                 containerPort: 2049
               - name: mountd
                 containerPort: 20048
               - name: rpcbind
                 containerPort: 111
               - name: rpcbind-udp
                 containerPort: 111
                 protocol: UDP
             securityContext:
               capabilities:
                 add:
                   - DAC_READ_SEARCH
                   - SYS_RESOURCE
             args:
               - "-provisioner=openebs.io/nfs" # Name of the provisioner
             env:
               - name: POD_IP
                 valueFrom:
                   fieldRef:
                     fieldPath: status.podIP
               - name: SERVICE_NAME
                 value: openebs-nfs-provisioner
               - name: POD_NAMESPACE
                 valueFrom:
                   fieldRef:
                     fieldPath: metadata.namespace
             imagePullPolicy: "IfNotPresent"
             volumeMounts:
               - name: export-volume
                 mountPath: /export
         volumes:
         - name: export-volume
           persistentVolumeClaim:
             claimName: openebspvc
    ---
    apiVersion: v1
    kind: PersistentVolumeClaim # Creating PVC for openebs-nfs-provisoner to mount on it
    metadata:
     name: openebspvc
    spec:
     storageClassName: openebs-jiva-default
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: "110G"
    ---
    apiVersion: storage.k8s.io/v1
    kind: StorageClass # Creating storage class for applications to point to openebs-nfs-provisioner
    metadata:
     name: openebs-nfs
    provisioner: openebs.io/nfs 
    parameters:
     mountOptions: "vers=4.1"  # TODO: reconcile with StorageClass.mountOptions

In the above YAML under the args users can see we are providing -provisioner=openebs.io/nfs this means that the NFS provisioner will claim volumes for those applications whose PVC is pointing this provisioner and these applications will be deployed on top of NFS provisioner, I will explain it further. Now at the end of the YAML, you can see that we are creating a PVC under which the storage class is pointing to openebs-jiva-default this means we want to use Jiva storage engine for provisioning volume for NFS provisioner.

## YAML Spec for accessing NFS from WordPress

GitHub Code Snippet:

    - -
    apiVersion: v1
    kind: Service
    metadata:
     name: wordpress-mysql
     labels:
     app: wordpress
    ....
    # Specs for the application
    ....
    volumes:
     - name: wordpress-persistent-storage
     persistentVolumeClaim:
     claimName: openebs-nfs
     - -
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
     name: openebs-nfs
     annotations:
     volume.beta.kubernetes.io/storage-class: "openebs-nfs" # Pointing to OpensEBS-NFS-Provisioner
    spec:
     accessModes:
      - ReadWriteMany # Making this RWX to mount on multiple applications
     resources:
     requests:
     storage: 100G

## Summary

OpenEBS storage can be used in RWX mode by deploying NFS provisioner in front of OpenEBS storage volume which is in RWO mode. This model is scalable for applications like WordPress. If you know or have any applications or workloads that require RWX access mode in the PVC, please comment below. Thank you for reading and connect with us at [OpenEBS Community](https://slack.openebs.io/?__hstc=216392137.d133cc61899b42c9a03d23aff802a1df.1579851978877.1579851978877.1579851978877.1&amp;__hssc=216392137.1.1579851978878&amp;__hsfp=3765904294)or at our Twitter handle [@openebs](http://twitter.com/openebs).
