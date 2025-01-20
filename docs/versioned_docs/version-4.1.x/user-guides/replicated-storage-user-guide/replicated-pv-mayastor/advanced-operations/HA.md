---
id: ha
title: High Availability
keywords:
 - High Availability
 - HA
description: This guide will help you to enhance High Availability (HA) of the volume target with the nexus switch-over feature.
---
## High Availability 

Replicated PV Mayastor 2.0 enhances High Availability (HA) of the volume target with the nexus switch-over feature. In the event of the target failure, the switch-over feature quickly detects the failure and spawns a new nexus to ensure I/O continuity.
The HA feature consists of two components:
- HA node agent (which runs in each csi- node) and
- Cluster agent (which runs alongside the agent-core).

The HA node agent looks for I/O path failures from applications to their corresponding targets. If any such broken path is encountered, the HA node agent informs the cluster agent. The cluster-agent then creates a new target on a different (live) node. Once the target is created, the `node-agent` establishes a new path between the application and its corresponding target. The HA feature restores the broken path within seconds, ensuring negligible downtime. 

:::warning
The volume's replica count must be higher than one for a new target to be established as part of switch-over.
:::

To ensure optimal HA in Replicated PV Mayastor clusters:

- Applications constrained to nodes with the `io-engine label` (`openebs.io/engine=mayastor`) will have the Nexus preferably placed on the same node where the application is scheduled. If the `io-engine` pod on a node is in a bad state, the Nexus may be placed on a different node.

- The kernel parameter `nvme_core.multipath=Y` is mandatory to enable HA functionality. Without this configuration, volume target failover is not possible.

### How do I disable this feature? 

:::info
We strongly recommend keeping this feature enabled.
:::

The HA feature is enabled by default; to disable it, pass the parameter `--set=agents.ha.enabled=false` with the helm install command.