# Deploy a Test Application

## Objective

If all verification steps in the preceding stages were satisfied, then Mayastor has been successfully deployed within the cluster. In order to verify basic functionality, we will now dynamically provision a Persistent Volume based on a Mayastor StorageClass, mount that volume within a small test pod which we'll create, and use the [**Flexible I/O Tester**](https://github.com/axboe/fio) utility within that pod to check that I/O to the volume is processed correctly.

## Define the PVC

Use `kubectl` to create a PVC based on a StorageClass that you created in the [previous stage](configure-mayastor.md#create-mayastor-storageclass-s). In the example shown below, we'll consider that StorageClass to have been named "mayastor-1". Replace the value of the field "storageClassName" with the name of your own Mayastor-based StorageClass.

For the purposes of this quickstart guide, it is suggested to name the PVC "ms-volume-claim", as this is what will be illustrated in the example steps which follow.

{% tabs %}
{% tab title="Command" %}
```text
cat <<EOF | kubectl create -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: mayastor-1
EOF
```
{% endtab %}

{% tab title="YAML" %}
```text
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ms-volume-claim
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: INSERT_YOUR_STORAGECLASS_NAME_HERE
```
{% endtab %}
{% endtabs %}

If you used the storage class example from previous stage, then volume binding mode is set to `WaitForFirstConsumer`. That means, that the volume won't be created until there is an application using the volume. We will go ahead and create the application pod and then check all resources that should have been created as part of that in kubernetes.

## Deploy the FIO Test Pod

The Mayastor CSI driver will cause the application pod and the corresponding Mayastor volume's NVMe target/controller ("Nexus") to be scheduled on the _same_ Mayastor Node, in order to assist with restoration of volume and application availabilty in the event of a storage node failure.

{% hint style="warning" %}
In this version, applications using PVs provisioned by Mayastor can only be successfully scheduled on Mayastor Nodes.  This behaviour is controlled by the `local:` parameter of the corresponding StorageClass, which by default is set to a value of `true`.  Therefore, this is the only supported value for this release - setting a non-local configuration may cause scheduling of the application pod to fail, as the PV cannot be mounted to a worker node other than a MSN.  This behaviour will change in a future release.
{% endhint %}

{% tabs %}
{% tab title="Command \(GitHub Latest\)" %}
```text
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/v1.0.2/deploy/fio.yaml
```
{% endtab %}

{% tab title="YAML" %}
```text
kind: Pod
apiVersion: v1
metadata:
  name: fio
spec:
  nodeSelector:
    openebs.io/engine: mayastor
  volumes:
    - name: ms-volume
      persistentVolumeClaim:
        claimName: ms-volume-claim
  containers:
    - name: fio
      image: nixery.dev/shell/fio
      args:
        - sleep
        - "1000000"
      volumeMounts:
        - mountPath: "/volume"
          name: ms-volume
```
{% endtab %}
{% endtabs %}

## Verify the Volume and the Deployment

We will now verify the Volume Claim and that the corresponding Volume and Mayastor Volume resources have been created and are healthy.

### Verify the Volume Claim

The status of the PVC should be "Bound".

{% tabs %}
{% tab title="Command" %}
```text
kubectl get pvc ms-volume-claim
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
ms-volume-claim     Bound    pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b   1Gi        RWO            mayastor-1       15s
```
{% endtab %}
{% endtabs %}

### Verify the Persistent Volume

{% tabs %}
{% tab title="Command" %}
{% hint style="info" %}
Substitute the example volume name with that shown under the "VOLUME" heading of the output returned by the preceding "get pvc" command, as executed in your own cluster
{% endhint %}

```text
kubectl get pv pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS     REASON   AGE
pvc-fe1a5a16-ef70-4775-9eac-2f9c67b3cd5b   1Gi        RWO            Delete           Bound    default/ms-volume-claim     mayastor-1       16m
```
{% endtab %}
{% endtabs %}

### Verify the Mayastor Volume 

The status of the volume should be "online".

{% hint style="info" %}
To verify the status of volume [Mayastor Kubectl plugin](https://mayastor.gitbook.io/introduction/reference/kubectl-plugin) is used.
{% endhint %}

{% tabs %}
{% tab title="Command" %}
```text
kubectl mayastor get volumes
```
{% endtab %}

{% tab title="Example Output" %}
```text
ID                                    REPLICAS  TARGET-NODE                ACCESSIBILITY STATUS  SIZE

18e30e83-b106-4e0d-9fb6-2b04e761e18a  3         aks-agentpool-12194210-0   nvmf           Online  1073741824 
```
{% endtab %}
{% endtabs %}

### Verify the application

Verify that the pod has been deployed successfully, having the status "Running". It may take a few seconds after creating the pod before it reaches that status, proceeding via the "ContainerCreating" state.

{% hint style="info" %}
Note: The example FIO pod resource declaration included with this release references a PVC named `ms-volume-claim`, consistent with the example PVC created in this section of the quickstart. If you have elected to name your PVC differently, deploy the Pod using the example YAML, modifying the `claimName` field appropriately.
{% endhint %}

{% tabs %}
{% tab title="Command" %}
```text
kubectl get pod fio
```
{% endtab %}

{% tab title="Example Output" %}
```text
NAME   READY   STATUS    RESTARTS   AGE
fio    1/1     Running   0          34s
```
{% endtab %}
{% endtabs %}

## Run the FIO Tester Application

We now execute the FIO Test utility against the Mayastor PV for 60 seconds, checking that I/O is handled as expected and without errors. In this quickstart example, we use a pattern of random reads and writes, with a block size of 4k and a queue depth of 16.

{% tabs %}
{% tab title="Command" %}
```text
kubectl exec -it fio -- fio --name=benchtest --size=800m --filename=/volume/test --direct=1 --rw=randrw --ioengine=libaio --bs=4k --iodepth=16 --numjobs=8 --time_based --runtime=60
```
{% endtab %}

{% tab title="Example Output" %}
```text
benchtest: (g=0): rw=randrw, bs=(R) 4096B-4096B, (W) 4096B-4096B, (T) 4096B-4096B, ioengine=libaio, iodepth=16
fio-3.20
Starting 1 process
benchtest: Laying out IO file (1 file / 800MiB)
Jobs: 1 (f=1): [m(1)][100.0%][r=376KiB/s,w=340KiB/s][r=94,w=85 IOPS][eta 00m:00s]
benchtest: (groupid=0, jobs=1): err= 0: pid=19: Thu Aug 27 20:31:49 2020
  read: IOPS=679, BW=2720KiB/s (2785kB/s)(159MiB/60011msec)
    slat (usec): min=6, max=19379, avg=33.91, stdev=270.47
    clat (usec): min=2, max=270840, avg=9328.57, stdev=23276.01
     lat (msec): min=2, max=270, avg= 9.37, stdev=23.29
    clat percentiles (msec):
     |  1.00th=[    3],  5.00th=[    3], 10.00th=[    4], 20.00th=[    4],
     | 30.00th=[    4], 40.00th=[    4], 50.00th=[    4], 60.00th=[    4],
     | 70.00th=[    4], 80.00th=[    4], 90.00th=[    7], 95.00th=[   45],
     | 99.00th=[  136], 99.50th=[  153], 99.90th=[  165], 99.95th=[  178],
     | 99.99th=[  213]
   bw (  KiB/s): min=  184, max= 9968, per=100.00%, avg=2735.00, stdev=3795.59, samples=119
   iops        : min=   46, max= 2492, avg=683.60, stdev=948.92, samples=119
  write: IOPS=678, BW=2713KiB/s (2778kB/s)(159MiB/60011msec); 0 zone resets
    slat (usec): min=6, max=22191, avg=45.90, stdev=271.52
    clat (usec): min=454, max=241225, avg=14143.39, stdev=34629.43
     lat (msec): min=2, max=241, avg=14.19, stdev=34.65
    clat percentiles (msec):
     |  1.00th=[    3],  5.00th=[    3], 10.00th=[    3], 20.00th=[    3],
     | 30.00th=[    3], 40.00th=[    3], 50.00th=[    3], 60.00th=[    3],
     | 70.00th=[    3], 80.00th=[    4], 90.00th=[   22], 95.00th=[  110],
     | 99.00th=[  155], 99.50th=[  157], 99.90th=[  169], 99.95th=[  197],
     | 99.99th=[  228]
   bw (  KiB/s): min=  303, max= 9904, per=100.00%, avg=2727.41, stdev=3808.95, samples=119
   iops        : min=   75, max= 2476, avg=681.69, stdev=952.25, samples=119
  lat (usec)   : 4=0.01%, 250=0.01%, 500=0.01%, 750=0.01%, 1000=0.01%
  lat (msec)   : 2=0.02%, 4=82.46%, 10=7.20%, 20=1.62%, 50=1.50%
  lat (msec)   : 100=2.58%, 250=4.60%, 500=0.01%
  cpu          : usr=1.19%, sys=3.28%, ctx=134029, majf=0, minf=17
  IO depths    : 1=0.1%, 2=0.1%, 4=0.1%, 8=0.1%, 16=100.0%, 32=0.0%, >=64=0.0%
     submit    : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.0%, 32=0.0%, 64=0.0%, >=64=0.0%
     complete  : 0=0.0%, 4=100.0%, 8=0.0%, 16=0.1%, 32=0.0%, 64=0.0%, >=64=0.0%
     issued rwts: total=40801,40696,0,0 short=0,0,0,0 dropped=0,0,0,0
     latency   : target=0, window=0, percentile=100.00%, depth=16

Run status group 0 (all jobs):
   READ: bw=2720KiB/s (2785kB/s), 2720KiB/s-2720KiB/s (2785kB/s-2785kB/s), io=159MiB (167MB), run=60011-60011msec
  WRITE: bw=2713KiB/s (2778kB/s), 2713KiB/s-2713KiB/s (2778kB/s-2778kB/s), io=159MiB (167MB), run=60011-60011msec

Disk stats (read/write):
  sdd: ios=40795/40692, merge=0/9, ticks=375308/568708, in_queue=891648, util=99.53%
```
{% endtab %}
{% endtabs %}

If no errors are reported in the output then Mayastor has been correctly configured and is operating as expected. You may create and consume additional Persistent Volumes with your own test applications.

