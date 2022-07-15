---
id: jiva-install
title: Install and setup
keywords: 
  - Jiva install and setup
---
This user guide will help you to configure Jiva and use Jiva Volumes for running your stateful workloads. 

### Installing Jiva

- To install the latest Jiva release, execute:

 ```
kubectl apply -f https://openebs.github.io/charts/jiva-operator.yaml
 ```

- Next, verify that the Jiva operator and CSI pods are running on your cluster.
  To get the status of the pods execute:
  ```
  kubectl get pod -n openebs
  ```

  Sample Output:
  ```
NAME                                           READY   STATUS    RESTARTS   AGE
jiva-operator-7765cbfffd-vt787                 1/1     Running   0          10s                                                             
openebs-localpv-provisioner-57b44f4664-klsrw   1/1     Running   0          118s                                                            
openebs-jiva-csi-controller-0                  4/4     Running   0          6m14s                                                           
openebs-jiva-csi-node-56t5g                    2/2     Running   0          6m13s                                                           
openebs-jiva-csi-node-xtyhu                    2/2     Running   0          6m20s                                                           
openebs-jiva-csi-node-h2unk                    2/2     Running   0          6m20s
  ```

### Provisioning Jiva volumes

- The Jiva volume policies need to be defined before creation of a Jiva volume. Given below is a sample Jiva volume policy CR. 
 ```
 apiVersion: openebs.io/v1alpha1
 kind: JivaVolumePolicy
 metadata:
   name: example-jivavolumepolicy
   namespace: openebs
 spec:
   replicaSC: openebs-hostpath
   target:
     # This sets the number of replicas for high-availability
     # replication factor <= no. of (CSI) nodes
     replicationFactor: 3
     # disableMonitor: false
     # auxResources:
     # tolerations:
     # resources:
     # affinity:
     # nodeSelector:
     # priorityClassName:
   # replica:
     # tolerations:
     # resources:
     # affinity:
     # nodeSelector:
     # priorityClassName:
 ```


:::note
By default, the volume data is stored at /var/openebs/<pvc-*> on the worker nodes, to change this behavior, a new replicaSC needs to be created. 
:::

### Creating storage classes

A storage class specifying the above `JivaVolumePolicy` needs to be created. This will be used to dynamically provision Jiva volumes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-csi-sc
provisioner: jiva.csi.openebs.io
allowVolumeExpansion: true
parameters:
  cas-type: "jiva"
  policy: "example-jivavolumepolicy"
```

