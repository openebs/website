## Replica Rebuilds

With the previous versions, the control plane ensured replica redundancy by monitoring all volume targets and checking for any volume targets that were in `Degraded` state, indicating that one or more replicas of that volume targets were faulty. When a matching volume targets is found, the faulty replica is removed. Then, a new replica is created and added to the volume targets object. As part of adding the new child data-plane, a full rebuild was initiated from one of the existing `Online` replicas.
However, the drawback to the above approach was that even if a replica was inaccessible for a short period (e.g., due to a node restart), a full rebuild was triggered. This may not have a significant impact on replicas with small sizes, but it is not desirable for large replicas.

The partial rebuild feature, overcomes the above problem and helps in achieving faster rebuild times. When volume target encounters IO error on a child/replica, it marks the child as `Faulted` (removing it from the I/O path) and begins to maintain a write log for all subsequent writes. The Core agent starts a default 10 minute wait for the replica to come back. If the child's replica is online again within timeout, the control-plane requests the volume target to online the child and add it to the IO path along with a partial rebuild process using the aforementioned write log.


{% hint style="info %}
The control plane waits for 10 minutes before initiating the full rebuild process, as the `--faulted-child-wait-period` is set to 10 minutes. To configure this parameter, edit values.yaml.
{% endhint %}


### Replica Rebuild History 

The data-plane handles both full and partial replica rebuilds. To view history of the rebuilds that an existing volume target has undergone during its lifecycle until now, you can use the given `kubectl` command.

To get the output in table format: 

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get rebuild-history {your_volume_UUID} 
```
{% endtab %}

{% tab title="Output" %}
```text
DST                                   SRC                                   STATE      TOTAL  RECOVERED  TRANSFERRED  IS-PARTIAL  START-TIME            END-TIME
b5de71a6-055d-433a-a1c5-2b39ade05d86  0dafa450-7a19-4e21-a919-89c6f9bd2a97  Completed  7MiB   7MiB       0 B          true        2023-07-04T05:45:47Z  2023-07-04T05:45:47Z
b5de71a6-055d-433a-a1c5-2b39ade05d86  0dafa450-7a19-4e21-a919-89c6f9bd2a97  Completed  7MiB   7MiB       0 B          true        2023-07-04T05:45:46Z  2023-07-04T05:45:46Z
```
{% endtab %}
{% endtabs %}

To get the output in JSON format: 

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get rebuild-history {your_volume_UUID} -ojson
```
{% endtab %}

{% tab title="Output" %}
```text
{
  "targetUuid": "c9eb4172-e90c-40ca-9db0-26b2ae372b28",
  "records": [
    {
      "childUri": "nvmf://10.1.0.9:8420/nqn.2019-05.io.openebs:b5de71a6-055d-433a-a1c5-2b39ade05d86?uuid=b5de71a6-055d-433a-a1c5-2b39ade05d86",
      "srcUri": "bdev:///0dafa450-7a19-4e21-a919-89c6f9bd2a97?uuid=0dafa450-7a19-4e21-a919-89c6f9bd2a97",
      "rebuildJobState": "Completed",
      "blocksTotal": 14302,
      "blocksRecovered": 14302,
      "blocksTransferred": 0,
      "blocksRemaining": 0,
      "blockSize": 512,
      "isPartial": true,
      "startTime": "2023-07-04T05:45:47.765932276Z",
      "endTime": "2023-07-04T05:45:47.766825274Z"
    },
    {
      "childUri": "nvmf://10.1.0.9:8420/nqn.2019-05.io.openebs:b5de71a6-055d-433a-a1c5-2b39ade05d86?uuid=b5de71a6-055d-433a-a1c5-2b39ade05d86",
      "srcUri": "bdev:///0dafa450-7a19-4e21-a919-89c6f9bd2a97?uuid=0dafa450-7a19-4e21-a919-89c6f9bd2a97",
      "rebuildJobState": "Completed",
      "blocksTotal": 14302,
      "blocksRecovered": 14302,
      "blocksTransferred": 0,
      "blocksRemaining": 0,
      "blockSize": 512,
      "isPartial": true,
      "startTime": "2023-07-04T05:45:46.242015389Z",
      "endTime": "2023-07-04T05:45:46.242927463Z"
    }
  ]
}
```
{% endtab %}
{% endtabs %}

> For example: kubectl mayastor get rebuild-history e898106d-e735-4edf-aba2-932d42c3c58d -ojson

{% hint style="note" %}
The volume's rebuild history records are stored and maintained as long as the volume target remains intact without any disruptions caused by node failures or recreation.
{% endhint %}
