---
description: >-
  This section provides an overview of the topology and function of the Mayastor
  data plane.  Developer level documentation is maintained within the project's
  GitHub repository.
---

# I/O Path Description

## Glossary of Terms

### Mayastor Instance

An  instance of the `mayastor` binary running inside a Mayastor container, which is encapsulated by a Mayastor Pod. 

### Nexus

Mayastor terminology.  A data structure instantiated within a Mayastor instance which performs I/O operations for a single Mayastor volume. Each nexus acts as an NVMe controller for the volume it exports. Logically it is composed chiefly of a 'static' function table which determines its base I/O handling behaviour \(held in common with all other nexus of the cluster\), combined with configuration information specific to the Mayastor volume it [_exports_](i-o-path-description.md#export), such as the identity of its [_children_](i-o-path-description.md#child).  The function of a nexus is to route I/O requests for its exported volume which are received on its host container's target to the underlying persistence layer, via any applied transformations \("data services"\), and to return responses to the calling initiator back along that same I/O path.

### Pool / Storage Pool / Mayastor Storage Pool \(MSP\)

Mayastor's volume management abstraction.  Block devices contributing storage capacity to a Mayastor deployment do so by their inclusion within configured storage pools.  Each Mayastor node can host zero or more pools and each pool can "contain" a single base block device as a member.  The total capacity of the pool is therefore determined by the size of that device.  Pools can only be hosted on nodes running an instance of a mayastor pod.

Multiple volumes can share the capacity of one pool but thin provisioning is not supported.  Volumes cannot span multiple pools for the purposes of creating a volume larger in size than could be accommodated by the free capacity in any one pool.

Internally a storage pool is an implementation of an SPDK [Logical Volume Store](https://spdk.io/doc/logical_volumes.html)

### Bdev

A code abstraction of a block-level device to which I/O requests may be sent, presenting a consistent device-independent interface.  Mayastor's bdev abstraction layer is based upon that of Intel's [Storage Performance Development Kit](https://spdk.io/) \(SPDK\).

* **base** bdev - Handles I/O directly, e.g. a representation of a physical  SSD device
* **logical volume** -  A bdev representing an [SPDK Logical Volume](https://spdk.io/doc/logical_volumes.html) \("lvol bdev"\)

### Replica

Mayastor terminology.  An lvol bdev \(a "logical volume", created within a pool and consuming pool capacity\) which is being exported by a Mayastor instance, for consumption by a nexus \(local or remote to the exporting instance\) as a "child"

### Child

Mayastor terminology.  A  NVMe controller created and owned by a given Nexus and which handles I/O downstream from the nexus' target, by routing it to a replica associated with that child.

A nexus has a minimum of one child, which must be local \(local: exported as a replica from a pool hosted by the same mayastor instance as hosts the nexus itself\).  If the Mayastor volume being exported by the nexus is derived from a StorageClass with a replication factor greater than 1 \(i.e. synchronous N-way mirroring is enabled\), then the nexus will have additional children, up to the  desired number of data copies. 

### Export

To allow the discovery of, and acceptance of I/O for, a volume by a client initiator, over a Mayastor storage target.

## Basics of I/O Flow

### Non-Replicated Volume I/O Path

```text
 ____________________________________________________________
|                         Front-end                          |
|                          NVMe-oF                           |
|                        (user space)                        |
|____________________________________________________________|
                              |                              
 _____________________________v______________________________
|  [Nexus]                    |  I/O path                    |
|                             |                              |  
|                     ________V________                      |
|                    |        |         |                    |
|                    |    NexusChild    |                    |
|                    |                  |                    |
|                    |________|_________|                    |
|_____________________________|______________________________| 
                              |                     
                          <loopback>
                              |  
                        ______V________ 
                       |    Replica    |
                       |    (local)    |   
                       |==== pool =====|
                       |               |
                       |    +----+     |
                       |    |lvol|     |  
                       |    +----+     |   
                       |_______________| 
                              |
                        ______V________ 
                       |  base bdev    |
                       |_______________|
                              |
                              V
                          DISK DEVICE
                         e.g. /dev/sda                              
```

For volumes based on a StorageClass defined as having a replication factor of 1, a single data copy is maintained by Mayastor.  The I/O path is largely \(entirely, if using malloc:/// pool devices\) constrained to within the bounds of a single mayastor instance, which hosts both the volume's nexus and the storage pool in use as its persistence layer.

Each mayastor instance presents a user-space storage target over NVMe-oF TCP.  Worker nodes mounting a Mayastor volume for a scheduled application pod to consume are directed by Mayastor's CSI driver implementation to connect to the appropriate transport target for that volume and perform discovery, after which they are able to send I/O to it, directed at the volume in question.  Regardless of how many volumes, and by extension how many nexus a mayastor instance hosts, all share the same target instances.

Application I/O received on a target for a volume is passed to the virtual bdev at the front-end of the nexus hosting that volume.  In the case of a non-replicated volume, the nexus is composed of a single child, to which the I/O is necessarily routed.  As a virtual bdev itself, the child handles the I/O by routing it to the next device, in this case the replica that was created for this child.  In non-replicated scenarios, both the volume's nexus and the pool which hosts its replica are co-located within the same mayastor instance, hence the I/O is passed from child to replica using SPDK bdev routines, rather than a network level transport.  At the pool layer, a blobstore maps the lvol bdev exported as the replica concerned to the base bdev on which the pool was constructed.  From there, other than for malloc:/// devices, the I/O passes to the host kernel via either aio or io\_uring, thence via the appropriate storage driver to the physical disk device.

The disk devices' response to the I/O request is returns back along the same path to the caller's initiator. 

### Replicated Volume I/O Path

```text
 _______________________________________________________________    _
|                           Front-end                           |    |
|                              NVMe-oF                          |    |
|                          (user space)                         |    |
|_______________________________________________________________|    |
                                |                                    |
 _______________________________|_______________________________     |
|  [Nexus]                      |  I/O path                     |    |
|           ____________________|____________________           |    |
|          |                    |                    |          |    |
|  ________V________    ________V________    ________V________  |    |
| |child 1          |  |child 2          |  |child 3          | |    |
| |                 |  |                 |  |                 | |    |
| |      NVMe-oF    |  |     NVMe-oF     |  |      NVMe-oF    | |    |
| |                 |  |                 |  |                 | |    |  Mayastor
| |________|________|  |________|________|  |________|________| |    |  Instance
|__________|____________________|____________________|__________|    |    "A"
           |                    |                    |               | 
       <network>            <loopback>           <network>           |
           |                    |                    |               | 
           |              ______V________            |               |
           |             |    Replica    |           |               |
           |             |    (local)    |           |               |
           |             |==== pool =====|           |               |  
           |             |               |           |               |
           |             |    +----+     |           |               |
           |             |    |lvol|     |           |               |  
           |             |    +----+     |           |               |  
           |             |_______________|           |               |
           |                    |                    |               |
           |              ______V________            |               |
           |             |  base bdev    |           |               |
           |             |_______________|           |              _|
           |                    |                    |
           |                    V                    |
           |                DISK DEVICE              |               ]  Node "A"
           |                                         |
           |                                         |
           |                                         |
           |                                         |  
     ______V________    _                      ______V________      _
    |    Replica    |    |                    |    Replica    |      |
    |    (remote)   |    |                    |    (remote)   |      |
    |  nvmf target  |    |                    |  nvmf target  |      |
    |               |    |                    |               |      |
    |==== pool =====|    |                    |==== pool =====|      |
    |               |    | Mayastor           |               |      | Mayastor
    |    +----+     |    | Instance           |    +----+     |      | Instance
    |    |lvol|     |    |   "B"              |    |lvol|     |      |   "C"
    |    +----+     |    |                    |    +----+     |      | 
    |_______________|    |                    |_______________|      |
           |             |                           |               |
     ______V________     |                     ______V________       |
    |  base bdev    |    |                    |  base bdev    |      |
    |_______________|   _|                    |_______________|     _|
           |                                         |
           V                                         V
       DISK DEVICE       ] Node "B"              DISK DEVICE         ] Node "C"
```

If the StorageClass on which a volume is based specifies a replication factor of greater than one, then a synchronous mirroring scheme is employed to maintain multiple redundant data copies.  For a replicated volume,  creation and configuration of the volume's nexus requires additional orchestration steps.  Prior to creating the nexus, not only must a local replica be created and exported as for the non-replicated case, but the requisite count of additional remote replicas required to meet the replication factor must be created and exported from Mayastor instances other than that hosting the nexus itself.  The control plane core-agent component will select appropriate pool candidates, which includes ensuring sufficient available capacity and that no two replicas are sited on the same Mayastor instance \(which would compromise availability during co-incident failures\).  Once suitable replicas have been successfully exported, the control plane completes the creation and configuration of the volume's nexus, with the replicas as its children.  In contrast to their local counterparts, remote replicas are exported, and so connected to by the nexus, over NVMe-F using a user-mode initiator and target implementation from the SPDK.

Write I/O requests to the nexus are handled synchronously; the I/O is dispatched to all \(healthy\) children and only when completion is acknowledged by all is the I/O acknowledged to the calling initiator via the nexus front-end.  Read I/O requests are similarly issued to all children, with just the first response returned to the caller. 



