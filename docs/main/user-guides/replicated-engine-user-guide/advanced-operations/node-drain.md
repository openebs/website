## Mayastor Node Drain

The node drain functionality marks the node as unschedulable and then gracefully moves all the volume targets off the drained node. 
This feature is in line with the [node drain functionality of Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/).


To start the drain operation, execute:
{% tab title="Command" %}
```text
kubectl-mayastor drain node <node_name> <label>
```
{% endtab %}

To get the list of nodes on which the drain operation has been performed, execute:
{% tab title="Command" %}
```text
kubectl-mayastor get drain nodes
```
{% endtab %}

To halt the drain operation or to make the node schedulable again, execute:

{% tab title="Command" %}
```text
kubectl-mayastor uncordon node <node_name> <label>
```
{% endtab %}