---
title: Recover from Volume Multi Attach Error in On-Prem Kubernetes Clusters
author: Prateek Pandey
author_info: Contributor and Maintainer @OpenEBS. Software Developer at @mayadata_inc. OpenSource Enthusiast
date: 27-08-2020
tags: Kubernetes
excerpt: In this blog, we'll talk about recovering from volume multi attach error in On-Prem Kubernetes clusters.
---

If you have an unmanaged Kubernetes Cluster that you have deployed on-prem or on cloud, you would have noticed that your Stateful Application pods error out with Multi-attach error whenever the node running the stateful application is abruptly shut down.

This has been a long outstanding issue in Kubernetes and is being actively worked on. Please refer to the following Kubernetes issues:

- [https://github.com/kubernetes/enhancements/pull/1116](https://github.com/kubernetes/enhancements/pull/1116)
- [https://github.com/kubernetes/kubernetes/issues/86281](https://github.com/kubernetes/kubernetes/issues/86281)
- [https://github.com/kubernetes/kubernetes/issues/53059#issuecomment-619428689](https://github.com/kubernetes/kubernetes/issues/53059#issuecomment-619428689)

The main reason for this issue being hard to resolve is that there is no right way to determine if the node is really shut down or if it is due to a network/split-brain condition to the master nodes. And it gets a little harder with Stateful applications as we need to really determine that data is written down from older nodes to the disks, before forcibly remounting onto the new node.

In this blog, I will provide an alternate approach that can be used to work around this issue and bring your applications back online. The solution is loosely based on the same approach that Managed Kubernetes clusters like GKE/EKS perform to handle this scenario. The managed clusters use out-of-band communication to determine if the node is shut down and delete the node resources.

I will demonstrate the approach of removing the node resource as a safe way to recover volumes using the following example.

## **Problem**

1. ### Start with a Stateful application:
    I have a three node cluster with k8s version 1.15.3, to reproduce the Volume multi-attach error scenario. Deployed OpenEBS version 1.3, using cstor csi based volume and mounted to Percona pod scheduled in node csi-node2.mayalabs.io.
    ```
    $ kubectl get nodes
    NAME                     STATUS     ROLES    AGE   VERSION
    csi-master.mayalabs.io   Ready      master   39d   v1.15.3
    csi-node1.mayalabs.io    Ready      none   39d   v1.15.3
    csi-node2.mayalabs.io    Ready      none   39d   v1.15.3
    csi-node3.mayalabs.io    Ready      none   39d   v1.15.3


    $ kubectl get pvc
    NAME                     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS               AGE
    demo-csi-vol-claim   Bound    pvc-b39248ab-5a99-439b-ad6f-780aae30626c   10Gi       RWO            openebs-csi-cstor-sparse   72m


    $ kubectl get pods -owide
    NAME                       READY   STATUS    RESTARTS   AGE    NODE
    percona-6795d6fb68-pqvqh   1/1     Running   0          66m    csi-node2.mayalabs.io
    ```

    VolumeAttachment resource created only for volume attached to Node2 in case of CSI based persistent volumes
    ```
    $ kubectl get volumeattachment
    NAME                                                                   ATTACHER                 PV                                         NODE                    ATTACHED   AGE
    csi-9f7704015b456f146ce8c6c3bd80a5ec6cc55f4f5bfb90c61c250d0b050a283c   openebs-csi.openebs.io   pvc-b39248ab-5a99-439b-ad6f-780aae30626c   csi-node2.mayalabs.io   true       66m
    ```

2. ### Node ShutDown:

    Shutting down kubelet service in Node2 as Percona application pod has been scheduled here, to make node `NotReady` state in the Kubernetes cluster.

        $ kubectl get nodes
        NAME                     STATUS     ROLES    AGE   VERSION
        csi-master.mayalabs.io   Ready      master   39d   v1.15.3
        csi-node1.mayalabs.io    Ready      none   39d   v1.15.3
        csi-node2.mayalabs.io    NotReady   none    5m   v1.15.3
        csi-node3.mayalabs.io    Ready      none   37d   v1.15.3
        

    In this case, the Percona pod will get stuck in a container creating a state with a multi-attach error.

## **Solution:**

Although these solutions are generic to recover the volume from the multi attach error. Based on some extra steps, I have divided them into two different sanctions based on the type of Kubernetes volumes. One is dynamic in-tree or external Kubernetes volumes, an older way of provisioning Kubernetes volumes, and the other one is CSI based Kubernetes volumes.

### **Dynamic/Static Provisioner Based Volumes:**

#### **Deleting Node Resource:**

Here after deleting the Node resource below node related events will be generated which will trigger the force deletion of the pods, and they apparently will be scheduled to other available nodes:

    $ kubectl delete nodes csi-node2.mayalabs.io
    node "csi-node2.mayalabs.io" deleted
    

    $ kubectl get nodes
    NAME                     STATUS     ROLES    AGE   VERSION
    csi-master.mayalabs.io   Ready      master   39d   v1.15.3
    csi-node1.mayalabs.io    Ready      none   39d   v1.15.3
    csi-node3.mayalabs.io    Ready      none   37d   v1.15.3
    

##### **Check the kube-controller logs for events:**

    I1021 10:37:44.336523       1 attach_detach_controller.go:573] error removing node "csi-node2.mayalabs.io" from desired-state-of-world: failed to delete node "csi-node2.mayalabs.io" from list of nodes managed by attach/detach controller--the node still contains 1 volumes in its list of volumes to attach
    I1021 10:37:45.003243       1 event.go:258] Event(v1.ObjectReference{Kind:"Node", Namespace:"", Name:"csi-node2.mayalabs.io", UID:"30ca0f5e-3a8f-4d0f-99fc-776d7051fd3d", APIVersion:"", ResourceVersion:"", FieldPath:""}): type: 'Normal' reason: 'RemovingNode' Node csi-node2.mayalabs.io event: Removing Node csi-node2.mayalabs.io from Controller
    
    
    I1021 10:37:55.273070       1 gc_controller.go:62] PodGC is force deleting Pod: kube-system/openebs-csi-node-cjzlz
    I1021 10:37:55.318908       1 gc_controller.go:166] Forced deletion of orphaned Pod kube-system/openebs-csi-node-cjzlz succeeded
    I1021 10:37:55.318979       1 gc_controller.go:62] PodGC is force deleting Pod: openebs/openebs-ndm-8ntsv
    I1021 10:37:55.352796       1 gc_controller.go:166] Forced deletion of orphaned Pod openebs/openebs-ndm-8ntsv succeeded
    I1021 10:37:55.354071       1 gc_controller.go:62] PodGC is force deleting Pod: openebs/cspc-sparse-disk-pool-gg82-d9b4bff4d-9fmbn
    I1021 10:37:55.420779       1 event.go:258] Event(v1.ObjectReference{Kind:"Pod", Namespace:"openebs", Name:"cspc-sparse-disk-pool-gg82-d9b4bff4d-9fmbn", UID:"", APIVersion:"", ResourceVersion:"", FieldPath:""}): type: 'Normal' reason: 'TaintManagerEviction' Cancelling deletion of Pod openebs/cspc-sparse-disk-pool-gg82-d9b4bff4d-9fmbn
    I1021 10:37:55.442403       1 gc_controller.go:166] Forced deletion of orphaned Pod openebs/cspc-sparse-disk-pool-gg82-d9b4bff4d-9fmbn succeeded
    I1021 10:37:55.442568       1 gc_controller.go:62] PodGC is force deleting Pod: default/percona-6795d6fb68-b7dvl
    I1021 10:37:55.446368       1 event.go:258] Event(v1.ObjectReference{Kind:"ReplicaSet", Namespace:"openebs", Name:"cspc-sparse-disk-pool-gg82-d9b4bff4d", UID:"04f87ed3-c401-4688-8691-0716dc4693fe", APIVersion:"apps/v1", ResourceVersion:"7063677", FieldPath:""}): type: 'Normal' reason: 'SuccessfulCreate' Created pod: cspc-sparse-disk-pool-gg82-d9b4bff4d-q2l2b
    I1021 10:37:55.541929       1 event.go:258] Event(v1.ObjectReference{Kind:"Pod", Namespace:"default", Name:"percona-6795d6fb68-b7dvl", UID:"", APIVersion:"", ResourceVersion:"", FieldPath:""}): type: 'Normal' reason: 'TaintManagerEviction' Cancelling deletion of Pod default/percona-6795d6fb68-b7dvl
    I1021 10:37:55.599155       1 gc_controller.go:166] Forced deletion of orphaned Pod default/percona-6795d6fb68-b7dvl succeeded
    I1021 10:37:55.599224       1 gc_controller.go:62] PodGC is force deleting Pod: kube-system/kube-proxy-b9q25
    I1021 10:37:55.613517       1 event.go:258] Event(v1.ObjectReference{Kind:"ReplicaSet", Namespace:"default", Name:"percona-6795d6fb68", UID:"50b82272-9874-4688-8362-7c759ae63aef", APIVersion:"apps/v1", ResourceVersion:"7063669", FieldPath:""}): type: 'Normal' reason: 'SuccessfulCreate' Created pod: percona-6795d6fb68-pqvqh
    W1021 10:37:55.621461       1 reconciler.go:328] Multi-Attach error for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" (UniqueName: "kubernetes.io/csi/openebs-csi.openebs.io^pvc-b39248ab-5a99-439b-ad6f-780aae30626c") from node "csi-node1.mayalabs.io" Volume is already exclusively attached to node csi-node2.mayalabs.io and can't be attached to another
    I1021 10:37:55.629191       1 event.go:258] Event(v1.ObjectReference{Kind:"Pod", Namespace:"default", Name:"percona-6795d6fb68-pqvqh", UID:"26ee6109-9d7e-4729-843b-18bb88926c87", APIVersion:"v1", ResourceVersion:"7063944", FieldPath:""}): type: 'Warning' reason: 'FailedAttachVolume' Multi-Attach error for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" Volume is already exclusively attached to one node and can't be attached to another
    I1021 10:37:55.742498       1 gc_controller.go:166] Forced deletion of orphaned Pod kube-system/kube-proxy-b9q25 succeeded
    I1021 10:37:55.742697       1 gc_controller.go:62] PodGC is force deleting Pod: kube-system/calico-node-4fv7n
    I1021 10:37:55.787435       1 gc_controller.go:166] Forced deletion of orphaned Pod kube-system/calico-node-4fv7n succeeded
    

### **CSI Based Volumes:**

#### **Attach-Detach Controller:**

If the volume is created using CSI Provisioner, a custom resource `volumeattachment` would be created. The Attach-detach controller will wait for the `maxWaitForUnmountDuration` i.e., 6 minutes to forcefully detach the attached volume from the node. Then the CR will be recreated and attach to any available node. To recover from the multi-attach error, this `volumeattachment` CR can be deleted along with node CR. Therefore the time taken to mount the volume on a new node will be reduced by 6 minutes.

    $ kubectl get volumeattachment pvc-b39248ab-5a99-439b-ad6f-780aae30626c
    NAME                                                                   ATTACHER                 PV                                         NODE                    ATTACHED   AGE
    csi-6ae3ead0d1c3a6e73e7d4c8e27f9098b927f3e4edc21bcf6bb7cf3fcdb4101de   openebs-csi.openebs.io   pvc-b39248ab-5a99-439b-ad6f-780aae30626c   csi-node1.mayalabs.io   true       11m
    

    
    $ kubectl logs -f kube-controller-manager-csi-master.mayalabs.io -n kube-system

    
    ```
    W1021 10:43:55.629673       1 reconciler.go:232] attacherDetacher.DetachVolume started for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" (UniqueName: "kubernetes.io/csi/openebs-csi.openebs.io^pvc-b39248ab-5a99-439b-ad6f-780aae30626c") on node "csi-node2.mayalabs.io" This volume is not safe to detach, but maxWaitForUnmountDuration 6m0s expired, force detaching
    I1021 10:43:55.671000       1 operation_generator.go:526] DetachVolume.Detach succeeded for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" (UniqueName: "kubernetes.io/csi/openebs-csi.openebs.io^pvc-b39248ab-5a99-439b-ad6f-780aae30626c") on node "csi-node2.mayalabs.io" 
    I1021 10:43:55.730390       1 reconciler.go:288] attacherDetacher.AttachVolume started for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" (UniqueName: "kubernetes.io/csi/openebs-csi.openebs.io^pvc-b39248ab-5a99-439b-ad6f-780aae30626c") from node "csi-node1.mayalabs.io" 
    I1021 10:43:55.752273       1 operation_generator.go:358] AttachVolume.Attach succeeded for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" (UniqueName: "kubernetes.io/csi/openebs-csi.openebs.io^pvc-b39248ab-5a99-439b-ad6f-780aae30626c") from node "csi-node1.mayalabs.io" 
    I1021 10:43:55.753344       1 event.go:258] Event(v1.ObjectReference{Kind:"Pod", Namespace:"default", Name:"percona-6795d6fb68-pqvqh", UID:"26ee6109-9d7e-4729-843b-18bb88926c87", APIVersion:"v1", ResourceVersion:"7063944", FieldPath:""}): type: 'Normal' reason: 'SuccessfulAttachVolume' AttachVolume.Attach succeeded for volume "pvc-b39248ab-5a99-439b-ad6f-780aae30626c" 
    ```
    

That's it for today's post. I hope you find it helpful. Feedback and comments are appreciated.
