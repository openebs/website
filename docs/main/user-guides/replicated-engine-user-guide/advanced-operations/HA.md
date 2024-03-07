## High Availability 

Mayastor 2.0 enhances High Availability (HA) of the volume target with the nexus switch-over feature. In the event of the target failure, the switch-over feature quickly detects the failure and spawns a new nexus to ensure I/O continuity.
The HA feature consists of two components: the HA node agent (which runs in each csi- node) and the cluster agent (which runs alongside the agent-core). The HA node agent looks for io-path failures from applications to their corresponding targets. If any such broken path is encountered, the HA node agent informs the cluster agent. The cluster-agent then creates a new target on a different (live) node. Once the target is created, the `node-agent` establishes a new path between the application and its corresponding target. The HA feature restores the broken path within seconds, ensuring negligible downtime. 

{% hint style="warning" %}
The volume's replica count must be higher than 1 for a new target to be established as part of switch-over.
{% endhint %}


### How do I disable this feature? 

{% hint style="info" %}
We strongly recommend keeping this feature enabled.
{% endhint %}

The HA feature is enabled by default; to disable it, pass the parameter `--set=agents.ha.enabled=false` with the helm install command.