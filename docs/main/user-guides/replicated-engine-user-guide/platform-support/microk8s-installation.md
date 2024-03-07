# Mayastor Installation on MicroK8s

## Install Mayastor on MicroK8s

{% hint style="info" %}
**Prerequisite**: Prepare a cluster by following the steps outlined in this [guide](https://mayastor.gitbook.io/introduction/quickstart/preparing-the-cluster).
{% endhint %}

To install Mayastor using Helm on MicroK8s, execute the following command:

{% tabs %}
{% tab title="Command" %}
```text 
helm install mayastor mayastor/mayastor -n mayastor --create-namespace  --set csi.node.kubeletDir="/var/snap/microk8s/common/var/lib/kubelet"
```
{% endtab %}

{% tab title="Output" %}
```text
NAME: mayastor
LAST DEPLOYED: Thu Sep 22 18:59:56 2022
NAMESPACE: mayastor
STATUS: deployed
REVISION: 1
NOTES:
OpenEBS Mayastor has been installed. Check its status by running:
$ kubectl get pods -n mayastor
For more information or to view the documentation, visit our website at https://openebs.io.
```
{% endtab %}
{% endtabs %}

## Resolve Known Issue (Calico Vxlan)

During the installation of Mayastor in MicroK8s, Pods with hostnetwork might encounter a known issue where they get stuck in the init state due to the Calico Vxlan bug.

**Expected error:**

![](https://hackmd.io/_uploads/Syigxz7u3.png)

**Resolution:**

To resolve this error, execute the following command:

{% tabs %}
{% tab title="Command" %}

```text
microk8s kubectl patch felixconfigurations default --patch '{"spec":{"featureDetectOverride":"ChecksumOffloadBroken=true"}}' --type=merge
```
{% endtab %}
{% endtabs %}

> For more details about this issue, refer to the [GitHub issue](https://github.com/canonical/microk8s/issues/3695).

{% hint style="info" %}
For further **configuration of Mayastor** including storage pools, storage class, persistent volume claims, and application setup, refer to the [offical documentation](https://mayastor.gitbook.io/introduction/quickstart/configure-mayastor). 
{% endhint %}
