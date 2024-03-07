# Tips and Tricks

## What if I have no Disk Devices available that I can use for testing?

For basic test and evaluation purposes it may not always be practical or possible to allocate physical disk devices on a cluster to Mayastor for use within its pools.  As a convenience, Mayastor supports two disk device type emulations for this purpose:

* Memory-Backed Disks \("RAM drive"\)
* File-Backed Disks

Memory-backed Disks are the most readily provisioned if node resources permit, since Mayastor will automatically create and configure them as it creates the corresponding pool.  However they are the least durable option - since the data is held entirely within memory allocated to a Mayastor pod, should that pod be terminated and rescheduled by Kubernetes, that data will be lost.  Therefore it is strongly recommended that this type of disk emulation be used only for short duration, simple testing.  It must not be considered for production use.

File-backed disks, as their name suggests, store pool data within a file held on a file system which is accessible to the Mayastor pod hosting that pool.  Their durability depends on how they are configured;  specifically on which type of volume mount they are located.  If located on a path which uses Kubernetes ephemeral storage \(eg. EmptyDir\), they may be no more persistent than a RAM drive would be.  However, if placed on their own Persistent Volume \(eg. a Kubernetes Host Path volume\) then they may considered 'stable'.  They are slightly less convenient to use than memory-backed disks, in that the backing files must be created by the user as a separate step preceding pool creation.  However, file-backed disks can be significantly larger than RAM disks as they consume considerably less memory resource within the hosting Mayastor pod.

### Using Memory-backed Disks

Creating a memory-backed disk emulation entails using the "malloc" uri scheme within the Mayastor pool resource definition.

```text
apiVersion: "openebs.io/v1alpha1"
kind: DiskPool
metadata:
  name: mempool-1
  namespace: mayastor
spec:
  node: worker-node-1
  disks: ["malloc:///malloc0?size_mb=64"]
```

The example shown defines a pool named "mempool-1".  The Mayastor pod hosted on "worker-node-1" automatically creates a 64MiB emulated disk for it to use, with the device identifier "malloc0" - _provided that at least 64MiB  of 2MiB-sized Huge Pages are available to that pod after the Mayastor container's own requirements have been satisfied_.

#### The malloc:/// URI schema

The pool definition caccepts URIs matching the malloc:/// schema within its `disks` field for the purposes of provisioning memory-based disks.  The general format is:

`malloc:///malloc<DeviceId>?<parameters>`

Where &lt;DeviceId&gt; is an integer value which uniquely identifies the device on that node, and where the parameter collection &lt;parameters&gt; may include the following:

| Parameter | Function | Value Type | Notes |
| :--- | :--- | :--- | :--- |
| size\_mb | Specifies the requested size of the device in MiB | Integer | Mutually exclusive with "num\_blocks" |
| num\_blocks | Specifies the requested size of the device in terms of the number of addressable blocks | Integer | Mutually exclusive with "size\_mb" |
| blk\_size | Specifies the block size to be reported by the device in bytes | Integer \(512 or 4096\) | Optional.  If not used, block size defaults to 512 bytes |

{% hint style="warning" %}
Note:  Memory-based disk devices are not over-provisioned and the memory allocated to them is so from the 2MiB-sized Huge Page resources available to the Mayastor pod.  That is to say,  to create a 64MiB device requires that at least 33 \(32+1\) 2MiB-sized pages are free for that Mayastor container instance to use.  Satisfying the memory requirements of this disk type may require additional configuration on the worker node and changes to the resource request and limit spec of the Mayastor daemonset, in order to ensure that sufficient resource is available.
{% endhint %}

### Using File-backed Disks

Mayastor can use file-based disk emulation in place of physical pool disk devices, by employing the aio:/// URI schema within the pool's declaration in order to identify the location of the file resource.

{% tabs %}
{% tab title="512 Byte Sector Size" %}
```text
apiVersion: "openebs.io/v1alpha1"
kind: DiskPool
metadata:
  name: filepool-1
  namespace: mayastor
spec:
  node: worker-node-1
  disks: ["aio:///var/tmp/disk1.img"]
```
{% endtab %}

{% tab title="4kBSector Size" %}
```
apiVersion: "openebs.io/v1alpha1"
kind: DiskPool
metadata:
  name: filepool-1
  namespace: mayastor
spec:
  node: worker-node-1
  disks: ["aio:///tmp/disk1.img?blk_size=4096"]
```
{% endtab %}
{% endtabs %}

The examples shown seek to create a pool using a file named "disk1.img", located in the /var/tmp directory of the Mayastor container's file system, as its member disk device.  For this operation to succeed, the file must already exist on the specified path \(which should be FULL path to the file\) and this path must be accessible by the Mayastor pod instance running on the corresponding node.

The aio:/// schema requires no other parameters but optionally, "blk\_size" may be specified.  Block size accepts a value of either 512 or 4096, corresponding to the emulation of either a 512-byte or 4kB sector size device.  If this parameter is omitted the device defaults to using a 512-byte sector size.

File-based disk devices are not over-provisioned; to create a 10GiB pool disk device requires that a 10GiB-sized backing file exist on a file system on an accessible path.

The preferred method of creating a backing file is to use the  linux `truncate` command.  The following example demonstrates the creation of a 1GiB-sized file named disk1.img within the directory /tmp.

```text
truncate -s 1G /tmp/disk1.img
```



