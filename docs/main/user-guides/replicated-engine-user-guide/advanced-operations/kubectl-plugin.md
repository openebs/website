# Mayastor kubectl plugin

The **Mayastor kubectl plugin** can be used to view and manage Mayastor resources such as nodes, pools and volumes. It is also used for operations such as scaling the replica count of volumes. 

## Install kubectl plugin

- The Mayastor kubectl plugin is available for the Linux platform. The binary for the plugin can be found [here](https://github.com/mayadata-io/mayastor-control-plane/releases). 

- Add the downloaded Mayastor kubectl plugin under $PATH.

To verify the installation, execute:

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor -V
```
{% endtab %}

{% tab title="Expected Output" %}
```text
kubectl-plugin 1.0.0
```
{% endtab %}
{% endtabs %}


---------


## Use kubectl plugin to retrieve data 

Sample command to use kubectl plugin:

```
USAGE:
    kubectl-mayastor [OPTIONS] <SUBCOMMAND>

OPTIONS:
    -h, --help
            Print help information
    -j, --jaeger <JAEGER>
            Trace rest requests to the Jaeger endpoint agent
    -k, --kube-config-path <KUBE_CONFIG_PATH>
            Path to kubeconfig file
    -n, --namespace <NAMESPACE>
            Kubernetes namespace of mayastor service, defaults to mayastor [default: mayastor]
    -o, --output <OUTPUT>
            The Output, viz yaml, json [default: none]
    -r, --rest <REST>
            The rest endpoint to connect to
    -t, --timeout <TIMEOUT>
            Timeout for the REST operations [default: 10s]
    -V, --version
            Print version information
SUBCOMMANDS:
    cordon      'Cordon' resources
    drain       'Drain' resources
    dump        `Dump` resources
    get         'Get' resources
    help        Print this message or the help of the given subcommand(s)
    scale       'Scale' resources
    uncordon    'Uncordon' resources
```

You can use the plugin with the following options:

### Get Mayastor Volumes

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get volumes
```
{% endtab %}

{% tab title="Expected Output" %}
```text
ID                                    REPLICAS  TARGET-NODE  ACCESSIBILITY STATUS  SIZE

18e30e83-b106-4e0d-9fb6-2b04e761e18a  4         mayastor-1   nvmf          Online  10485761
0c08667c-8b59-4d11-9192-b54e27e0ce0f  4         mayastor-2   <none>        Online  10485761
```
{% endtab %}
{% endtabs %}
 

### Get Mayastor Pools

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get pools
```
{% endtab %}

{% tab title="Expected Output" %}
```text
ID               TOTAL CAPACITY  USED CAPACITY  DISKS                                                     NODE      STATUS  MANAGED

mayastor-pool-1  5360320512      1111490560     aio:///dev/vdb?uuid=d8a36b4b-0435-4fee-bf76-f2aef980b833  kworker1  Online  true
mayastor-pool-2  5360320512      2172649472     aio:///dev/vdc?uuid=bb12ec7d-8fc3-4644-82cd-dee5b63fc8c5  kworker1  Online  true
mayastor-pool-3  5360320512      3258974208     aio:///dev/vdb?uuid=f324edb7-1aca-41ec-954a-9614527f77e1  kworker2  Online  false
    
```
{% endtab %}
{% endtabs %}

### Get Mayastor Nodes

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get nodes
```
{% endtab %}

{% tab title="Expected Output" %}
```text

ID          GRPC ENDPOINT   STATUS
mayastor-2  10.1.0.7:10124  Online
mayastor-1  10.1.0.6:10124  Online
mayastor-3  10.1.0.8:10124  Online
```
{% endtab %}
{% endtabs %}

 {% hint style="warning" %}
 All the above resource information can be retrieved for a particular resource using its ID. The command to do so is as follows:
 kubectl mayastor get &lt;resource_name&gt; &lt;resource_id&gt;
 {% endhint %}


### Scale the replica count of a volume

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor scale volume <volume_id> <size>
```
{% endtab %}

{% tab title="Expected Output" %}
```text
Volume 0c08667c-8b59-4d11-9192-b54e27e0ce0f Scaled Successfully 🚀
```
{% endtab %}
{% endtabs %}


### Retrieve resource in any of the output formats (table, JSON or YAML)

> Table is the default output format. 

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor -ojson get <resource_type>
```
{% endtab %}

{% tab title="Expected Output" %}
```text
[{"spec":{"num_replicas":2,"size":67108864,"status":"Created","target":{"node":"ksnode-2","protocol":"nvmf"},"uuid":"5703e66a-e5e5-4c84-9dbe-e5a9a5c805db","topology":{"explicit":{"allowed_nodes":["ksnode-1","ksnode-3","ksnode-2"],"preferred_nodes":["ksnode-2","ksnode-3","ksnode-1"]}},"policy":{"self_heal":true}},"state":{"target":{"children":[{"state":"Online","uri":"bdev:///ac02cf9e-8f25-45f0-ab51-d2e80bd462f1?uuid=ac02cf9e-8f25-45f0-ab51-d2e80bd462f1"},{"state":"Online","uri":"nvmf://192.168.122.6:8420/nqn.2019-05.io.openebs:7b0519cb-8864-4017-85b6-edd45f6172d8?uuid=7b0519cb-8864-4017-85b6-edd45f6172d8"}],"deviceUri":"nvmf://192.168.122.234:8420/nqn.2019-05.io.openebs:nexus-140a1eb1-62b5-43c1-acef-9cc9ebb29425","node":"ksnode-2","rebuilds":0,"protocol":"nvmf","size":67108864,"state":"Online","uuid":"140a1eb1-62b5-43c1-acef-9cc9ebb29425"},"size":67108864,"status":"Online","uuid":"5703e66a-e5e5-4c84-9dbe-e5a9a5c805db"}}]
```
{% endtab %}
{% endtabs %}


### Retrieve replica topology for specific volumes

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get volume-replica-topology <volume_id>
```
{% endtab %}

{% tab title="Expected Output" %}
```text
 ID                                    NODE         POOL    STATUS  CAPACITY  ALLOCATED  SNAPSHOTS  CHILD-STATUS  REASON  REBUILD 
 a34dbaf4-e81a-4091-b3f8-f425e5f3689b  io-engine-1  pool-1  Online  12MiB     0 B        12MiB      <none>        <none>  <none> 
```
{% endtab %}
{% endtabs %}


{% hint style="warning" %}
The plugin requires access to the `Mayastor REST server` for execution. It gets the master node IP from the kube-config file. In case of any failure, the REST endpoint can be specified using the ‘–rest’ flag.
{% endhint %}

### List available volume snapshots

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get volume-snapshots
```
{% endtab %}

{% tab title="Expected Output" %}
```text
 ID                                    TIMESTAMP             SOURCE-SIZE  ALLOCATED-SIZE  TOTAL-ALLOCATED-SIZE  SOURCE-VOL 
 25823425-41fa-434a-9efd-a356b70b5d7c  2023-07-07T13:20:17Z  10MiB        12MiB           12MiB                 ec4e66fd-3b33-4439-b504-d49aba53da26 
```
{% endtab %}
{% endtabs %}

--------


## Limitations of kubectl plugin

- The plugin currently does not have authentication support.
- The plugin can operate only over HTTP.

_[Learn more](https://github.com/openebs/mayastor-extensions/blob/develop/k8s/plugin/README.md)_