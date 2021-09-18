---
title: Life cycle of PVC with Volume Populator
author: Shovan Maity
author_info: Shovan works as a Software Engineer at MayaData, who's experienced in Load Balancer, gRPC, WebSocket, REST APIs, and has good hands-on experience on Kubernetes. In his free time, Shovan likes to read blogs on distributed systems. He also likes Travelling and Photography.
date: 05-07-2021
tags: PVC, Volume Populator
excerpt: This blog is on the life cycle of pvc with a volume populator. Volume populator feature is in alpha in Kubernetes (v1.21 release). Creating a volume with base or seed data is one of the requirements in storage.
---

This blog is on the life cycle of pvc with a [volume populator](https://github.com/kubernetes/enhancements/tree/master/keps/sig-storage/1495-volume-populators). Volume populator feature is in alpha in Kubernetes (v1.21 release). Creating a volume with base or seed data is one of the requirements in storage. In Kubernetes 1.12, the _DataSource_ field is added to the PVC spec. The field was implemented as a _TypedLocalObjectReference_ to give flexibility in the future about what objects could be data sources for new volumes. Since then, it supports only two things to be the source of a new volume - existing PVC(clone volume) and snapshots(restore a snapshot). Implementation of these two data sources relies on the CSI plugin to do the actual work. As it can point to any CR in Kubernetes validation on the DataSource field of PVC is relaxed and relies on a new async controller to perform the validation on those data sources and provide feedback to users. A new CRD is introduced to register valid dataSource, and we need to create a resource for individual volume populators to inform that the volume populator is a valid dataSource for a PVC.

In the first part we will see the volume lifecycle without a volume populator. In this process involved components are _**API server**, **etcd**, **CSI external provisioner**_ and _**CSI controller plugin**._ We will not go into the CSI node plugin, we will stop as soon as PVC is in bound state. Let's understand the responsibility of some modules present here.

![volume lifecycle without a volume populator](https://lh6.googleusercontent.com/rX9n7NSjDPiwL0xf1YR0hfOF0pf5TY7qgzMrKhhQyARxREFOUakXS0aAWFZ4Y1MKE7b6tUZ33iYVidZdPyOXPhgW0G60lmIGZOz5KadBJaQirYK6pjTWUix2Hvk4laXXzFPfg803)

**CSI external provisioner**

This is a CSI driver sidecar component. It is a control loop on PVC. As clone and restore volumes come under CSI workflow if _DataSource_ is present and it is PVC or snapshot then only it takes some actions for that PVC else it will ignore that PVC.

**CSI controller plugin**

This is a CSI driver sidecar component provided by the storage provider(SP). It is a gRPC server which implements CSI controller services. CSI external provisioner makes a CreateVolume gRPC call to it once new PVC is created.

*   User creates a pvc and it is written in etcd with the help of API server and the pvc goes to the pending state.
*   CSI external provisioner observes that pvc and makes _CreateVolume_ call to the CSI controller plugin sidecar. On successful response it creates a PV for that PVC and applies bi-directional reference between them.
*   Once bi-directional reference is done, pvc goes to bound state.

Now we will see the volume lifecycle with the data populator. Involved components are _**API server**, **etcd**, **CSI external provisioner**, **CSI controller plugin** and **Volume Populator controller**._ We will not go into the CSI node plugin, we will stop as soon as PVC is in bound state. Let's understand the responsibility of some modules present here.  

![volume lifecycle with the data populator](https://lh4.googleusercontent.com/-uuZ8z1w6y-jGSOomfn_VuIQt_6nOtOUv11fS1Qac0p7FhneZMM617gfjf49ek-YKiKVHpEYqbc2787UhIvxq7lTeVm4OKCsMFwdy_iZ-fNpzrgqaU4RP2864LNlcTC0JWKCeXoF)

**Volume Populator Controller**

It is a control loop on PVC, responsible to manage PVC pointing to a particular dataSource. Namespace in which this controller is deployed is reserved for creating some intermediate PVC and pod to populate the data in the volume. If we create a PVC in that namespace for our application with a valid dataSource it will not work, this control loop will skip that PVC. This controller adds a finalizer to the initial PVC. It is written using [lib volume populator](https://github.com/kubernetes-csi/lib-volume-populator). [This](https://github.com/kubernetes-csi/lib-volume-populator/tree/master/example/hello-populator) is an example of a data populator written using lib volume populator. One new CRD _Volume Populator_ is introduced_._ Like CSI drivers we have to register the volume populator.

*   User creates a PVC with dataSource pointing to a volume populator and it is written in etcd with the help of API server and the PVC goes to the pending state.
*   CSI external provisioner observes that PVC and takes no action as the dataSource is not pointing to a PVC or snapshot.
*   Volume populator controller is another watcher on pvc. It creates a PVC’ which is the same as the PVC created by the user without the dataSource field.
*   As PVC’ does not have a dataSource CSI external provisioner makes a CreateVolume gRPC call to the CSI controller plugin. Once the gRPC call is successful PV’ is created and bi-directional reference applied on PVC’ and PV’. Then PVC’ goes to the bound state.
*   Once PVC’ is in bound state, the volume populator controller creates a pod to populate the data for that PVC’.
*   Once data is populated it patches PVC and PV’ and applies a bi-directional reference between  them. After this PVC will be in bound state and PVC’ will be in lost state. Then the populator pod and PVC’ are deleted by this controller.

As mentioned above in core Kubernetes validation on the DataSource field is relaxed now we can create PVC pointing to any data source. To add validation around it one new asynchronous PVC [controller](https://github.com/kubernetes-csi/volume-data-source-validator) is added. This controller is responsible for posting warning events if PVC is pointing to invalid DataSource. One new CRD of kind VolumePopulator and API version populator.storage.k8s.io/v1alpha1 is introduced to specify a valid volume populator.

Here is one valid data source -

```
    kind: VolumePopulator
    apiVersion: populator.storage.k8s.io/v1alpha1
    metadata:
      name: valid-populator
    sourceKind:
      group: valid.storage.k8s.io
      kind: Valid
```

Here is an example PVC with valid data source -

```
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: valid-pvc-datasource
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
      dataSource:
        apiGroup: valid.storage.k8s.io
        kind: Valid
        name: valid
```

Here is an example of PVC with invalid data source -

```
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: invalid-pvc-datasource
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
      dataSource:
        apiGroup: invalid.storage.k8s.io
        kind: Invalid
        name: invalid
```

Event in invalid data source PVC-

```
    shovan@probot:~$ kubectl get event | grep Warning
    58s         Warning   UnrecognizedDataSourceKind   persistentvolumeclaim/invalid-pvc-datasource   The data source for this PVC does not match any registered VolumePopulator

    shovan@probot:~$ kubectl describe pvc invalid-pvc-datasource
    Events:
      Type     Reason                      Age                  From                                                                    Message
      ----     ------                      ----                 ----                                                                    -------
      Normal   ExternalProvisioning        115s (x2 over 115s)  persistentvolume-controller                                             waiting for a volume to be created, either by external provisioner "k8s.io/minikube-hostpath" or manually created by system administrator
      Normal   Provisioning                114s                 k8s.io/minikube-hostpath_minikube_e7c97d0c-eb52-42bc-af55-d8a167ab3987  External provisioner is provisioning volume for claim "default/invalid-pvc-datasource"
      Normal   ProvisioningSucceeded       113s                 k8s.io/minikube-hostpath_minikube_e7c97d0c-eb52-42bc-af55-d8a167ab3987  Successfully provisioned volume pvc-7df410d5-1efe-4d69-b481-57cbde9f10cd
      Warning  UnrecognizedDataSourceKind  33s (x6 over 114s)   data-source-validator                                                   The data source for this PVC does not match any registered VolumePopulator
```

Please join our [community](https://openebs.io/community) if you have any feedback or queries on the article or anything related to [OpenEBS](https://openebs.io/)
