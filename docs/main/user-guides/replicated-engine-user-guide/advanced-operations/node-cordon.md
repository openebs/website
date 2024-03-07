## Mayastor Node Cordon

Cordoning a node marks or taints the node as unschedulable. This prevents the scheduler from deploying new resources on that node. However, the resources that were deployed prior to cordoning off the node will remain intact.

This feature is in line with the node-cordon functionality of Kubernetes.

To add a label and cordon a node, execute:
{% tab title="Command" %}
```text
kubectl-mayastor cordon node <node_name> <label>
```
{% endtab %}

To get the list of cordoned nodes, execute:

{% tab title="Command" %}
```text
kubectl-mayastor get cordon nodes
```
{% endtab %}

To view the labels associated with a cordoned node, execute:
{% tab title="Command" %}
```text
kubectl-mayastor get cordon node <node_name>
```
{% endtab %}


#### How to uncordon a node?

In order to make a node schedulable again, execute:
{% tab title="Command" %}
```text
kubectl-mayastor uncordon node <node_name> <label>
{% endtab %}
The above command allows the Kubernetes scheduler to deploy resources on the node.

