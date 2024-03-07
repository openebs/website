---
Title: Volume Restore from a Snapshot
---

Volume restore from an existing snapshot will create an exact replica of a storage volume captured at a specific point in time. They serve as an essential tool for data protection, recovery, and efficient management in Kubernetes environments. This article provides a step-by-step guide on how to create a volume restore.

## Prerequisites

### Step 1: Create a storage class 

To begin, you'll need to create a StorageClass that defines the properties of the snapshot to be restored. Refer to [Storage Class Parameters](../reference/storage-class-parameters.md) for more details. Use the following command to create the StorageClass:

{% hint style="info" %}
thin: "true" and repl: "1" is the only supported combination.
{% endhint %}

{% tabs %}
{% tab title="Command" %}
```text
cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1-restore
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "1"
  thin: "true"
provisioner: io.openebs.csi-mayastor
EOF
```
{% endtab %}
{% tab title="YAML" %}
```text
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1-restore
parameters:
  ioTimeout: "30"
  protocol: nvmf
  repl: "1"
  thin: "true"
provisioner: io.openebs.csi-mayastor
```
{% endtab %}
{% endtabs %}

> Note the name of the StorageClass, which, in this example, is **mayastor-1-restore**.


### Step 2: Create a snapshot 

You need to create a volume snapshot before proceeding with the restore. Follow the steps outlined in [this guide](../reference/snapshot.md) to create a volume snapshot.

> Note the snapshot's name, for example, **pvc-snap-1**.

-------------------

## Create a volume restore of the existing snapshot

After creating a snapshot, you can create a PersistentVolumeClaim (PVC) from it to generate the volume restore. Use the following command:

{% tabs %}
{% tab title="Command" %}
```text
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restore-pvc //add a name for your new volume
spec:
  storageClassName: mayastor-1-restore //add your storage class name 
  dataSource:
    name: pvc-snap-1 //add your volumeSnapshot name
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
 EOF     
 ```
{% endtab %}
{% tab title="YAML" %}
```text
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restore-pvc //add a name for your new volume
spec:
  storageClassName: mayastor-1-restore //add your storage class name 
  dataSource:
    name: pvc-snap-1 //add your volumeSnapshot name
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```
{% endtab %}
{% endtabs %}
      
      
By running this command, you create a new PVC named `restore-pvc` based on the specified snapshot. The restored volume will have the same data and configuration as the original volume had at the time of the snapshot.

