# Replica Operations

## Basics

When a Mayastor volume is provisioned based on a StorageClass which has a replication factor greater than one \(set by its `repl` parameter)\, the control plane will attempt to maintain through a 'Kubernetes-like' reconciliation loop that number of identical copies of the volume's data  "replicas" (a replica is a nexus target "child"\) at any point in time.  When a volume is first provisioned the control plane will attempt to create the required number of replicas, whilst adhering to its internal heuristics for their location within the cluster \(which will be discussed shortly\).  If it succeeds, the volume will become available and will bind with the PVC.  If the control plane cannot identify a sufficient number of eligble Mayastor Pools in which to create required replicas at the time of provisioning, the operation will fail; the Mayastor Volume will not be created and the associated PVC will not be bound.  Kubernetes will periodically re-try the volume creation and if at any time the appropriate number of pools can be selected, the volume provisioning should succeed.

Once a volume is processing I/O, each of its replicas will also receive I/O.  Reads are round-robin distributed across replicas, whilst writes must be written to all.  In a real world environment this is attended by the possibility that I/O to one or more replicas might fail at any time.  Possible reasons include transient loss of network connectivity, node reboots, node or disk failure.  If a volume's nexus \(NVMe controller\) encounters 'too many' failed I/Os for a replica, then that replica's child status will be marked `Faulted` and it will no longer receive I/O requests from the nexus.  It will remain a member of the volume, whose departure from the desired state with respect to replica count will be reflected with a volume status of `Degraded`.  How many I/O failures are considered "too many" in this context is outside the scope of this discussion.

The control plane will first 'retire' the old, faulted one which will then no longer be associated to the volume. Once retired, a replica will become available for garbage collection (deletion from the Mayastor Pool containing it), assuming that the nature of the failure was such that the pool itself is still viable (i.e. the underlying disk device is still accessible).
 Then it will attempt to restore the desired state \(replica count\) by creating a new replica, following its replica placement rules.  If it succeeds, the nexus will "rebuild" that new replica - performing a full copy of all data from a healthy replica `Online`, i.e. the source.  This process can proceed whilst the volume continues to process application I/Os although it will contend for disk throughput at both the source and destination disks.     

If a nexus is cleanly restarted, i.e. the Mayastor pod hosting it restarts gracefully, with the assistance of the control plane it will 'recompose' itself; all of the previous healthy member replicas will be re-attached to it.  If previously faulted replicas are available to be re-connected (`Online`), then the control plane will attempt to reuse and rebuild them directly, rather than seek replacements for them first. This edge-case therefore does not result in the retirement of the affected replicas; they are simply reused.  If the rebuild fails then we follow the above process of removing a `Faulted` replica and adding a new one. On an unclean restart (i.e. the Mayastor pod hosting the nexus crashes or is forcefully deleted) only one healthy replica will be re-attached and all other replicas will eventually be rebuilt.

Once provisioned, the replica count of a volume can be changed using the kubectl-mayastor plugin `scale` subcommand.  The value of the `num_replicas` field may be either increased or decreased by one and the control plane will attempt to satisfy the request by creating or destroying a replicas as appropriate, following the same replica placement rules as described herein.  If the replica count is reduced, faulted replicas will be selected for removal in preference to healthy ones.

## Replica Placement Heuristics

Accurate predictions of the behaviour of Mayastor with respect to replica placement and management of replica faults can be made by reference to these 'rules', which are a simplified representation of the actual logic:

* "Rule 1": A volume can only be provisioned if the replica count \(and capacity\) of its StorageClass can be satisfied at the time of creation
* "Rule 2": Every replica of a volume must be placed on a different Mayastor Node)
* "Rule 3": Children with the state `Faulted` are always selected for retirement in preference to those with state `Online`

N.B.: By application of the 2nd rule, replicas of the same volume cannot exist within different pools on the same Mayastor Node. 

## Example Scenarios

### Scenario One

A cluster has two Mayastor nodes deployed, "Node-1" and "Node-2".  Each Mayastor node hosts two Mayastor pools and currently, no Mayastor volumes have been defined.  Node-1 hosts pools "Pool-1-A" and "Pool-1-B", whilst Node-2 hosts "Pool-2-A and "Pool-2-B".  When a user creates a PVC from a StorageClass which defines a replica count of 2, the Mayastor control plane will seek to place one replica on each node (it 'follows' Rule 2).  Since in this example it can find a suitable candidate pool with sufficient free capacity on each node, the volume is provisioned and becomes "healthy" (Rule 1).  Pool-1-A is selected on Node-1, and Pool-2-A selected on Node-2 (all pools being of equal capacity and replica count, in this initial 'clean' state).

Sometime later, the physical disk of Pool-2-A encounters a hardware failure and goes offline.  The volume is in use at the time, so its nexus \(NVMe controller\) starts to receive I/O errors for the replica hosted in that Pool.  The associated replica's child from Pool-2-A enters the `Faulted` state and the volume state becomes `Degraded` (as seen through the kubectl-mayastor plugin).


Expected Behaviour: The volume will maintain read/write access for the application via the remaining healthy replica. The faulty replica from Pool-2-A will be removed from the Nexus thus changing the nexus state to `Online` as the remaining is healthy. A new replica is created on either Pool-2-A or Pool-2-B and added to the nexus.  The new replica child is rebuilt and eventually the state of the volume returns to `Online`.

### Scenario Two

A cluster has three Mayastor nodes deployed, "Node-1", "Node-2" and "Node-3".  Each Mayastor node hosts one pool: "Pool-1" on Node-1, "Pool-2" on Node-2 and "Pool-3" on Node-3.  No Mayastor volumes have yet been defined; the cluster is 'clean'.  A user creates a PVC from a StorageClass which defines a replica count of 2.  The control plane determines that it is possible to accommodate one replica within the available capacity of each of Pool-1 and Pool-2, and so the volume is created.  An application is deployed on the cluster which uses the PVC, so the volume receives I/O.

Unfortunately, due to user error the SAN LUN which is used to persist Pool-2 becomes detached from Node-2, causing I/O failures in the replica which it hosts for the volume.  As with scenario one, the volume state becomes `Degraded` and the faulted child's becomes `Faulted`.

Expected Behaviour: Since there is a Mayastor pool on Node-3 which has sufficient capacity to host a replacement replica, a new replica can be created (Rule 2: this 'third' incoming replica isn't located on either of the nodes that the two original ones are). The faulted replica in Pool-2 is retired from the nexus and a new replica is created on Pool-3 and added to the nexus.  The new replica is rebuilt and eventually the state of the volume returns to `Online`.

### Scenario Three

In the cluster from Scenario three, sometime after the Mayastor volume has returned to the `Online` state, a user scales up the volume, increasing the `num_replicas` value from 2 to 3.  Before doing so they corrected the SAN misconfiguration and ensured that the pool on Node-2 was `Online`.

Expected Behaviour:  The control plane will attempt to reconcile the difference in current (replicas = 2) and desired (replicas = 3) states.  Since Node-2 no longer hosts a replica for the volume (the previously faulted replica was successfully retired and is no longer a member of the volume's nexus), the control plane will select it to host the new replica required (Rule 2 permits this).  The volume state will become initially `Degraded` to reflect the difference in actual vs required redundant data copies but a rebuild of the new replica will be performed and eventually the volume state will be `Online` again.

### Scenario Four

A cluster has three Mayastor nodes deployed; "Node-1", "Node-2" and "Node-3".  Each Mayastor node hosts two Mayastor pools and currently, no Mayastor volumes have been defined.  Node-1 hosts pools "Pool-1-A" and "Pool-1-B", whilst Node-2 hosts "Pool-2-A and "Pool-2-B" and Node-3 hosts "Pool-3-A" and "Pool-3-B".  A single volume exists in the cluster, which has a replica count of 3.  The volume's replicas are all healthy and are located on Pool-1-A, Pool-2-A and Pool-3-A.  An application is using the volume, so all replicas are receiving I/O.

The host Node-3 goes down causing failure of all I/O sent to the replica it hosts from Pool-3-A.

Expected Behaviour:  The volume will enter and remain in the `Degraded` state.  The associated child from the replica from Pool-3-A will be in the state `Faulted`, as observed in the volume through the kubectl-mayastor plugin.  Said replica will be removed from the Nexus thus changing the nexus state to `Online` as the other replicas are healthy. The replica will then be disowned from the volume (it won't be possible to delete it since the host is down). Since Rule 2 dictates that every replica of a volume must be placed on a different Mayastor Node no new replica can be created at this point and the volume remains `Degraded` indefinitely.


### Scenario Five

Given the post-host failure situation of Scenario four, the user scales down the volume, reducing the value of `num_replicas` from 3 to 2.

Expected Behaviour:  The control plane will reconcile the actual \(replicas=3\) vs desired \(replicas=2\) state of the volume.  The volume state will become `Online` again.

### Scenario Six

In scenario Five, after scaling down the Mayastor volume the user waits for the volume state to become `Online` again.  The desired and actual replica count are now 2.  The volume's replicas are located in pools on both Node-1 and Node-2.  The Node-3 is now back up and its pools Pool-3-A and Pool-3-B are `Online`. The user then scales the volume again, increasing  the `num_replicas` from 2 to 3 again.

Expected Behaviour:  The volume's state will become `Degraded`, reflecting the difference in desired vs actual replica count.  The control plane will select a pool on Node-3 as the location for the new replica required.  Node-3 is therefore again a suitable candidate and has online pools with sufficient capacity. 
