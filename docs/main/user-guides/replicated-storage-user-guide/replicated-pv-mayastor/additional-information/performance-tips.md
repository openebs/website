---
id: performance-tips
title: Performance Tips
keywords:
 - Performance Tips
 - Tips
description: This section explains the recommended practices for better performance.
---
# Performance Tips

## CPU Isolation

The Replicated PV Mayastor will fully utilize each CPU core that it was configured to run on. It will spawn a thread on each and the thread will run in an endless loop serving tasks dispatched to it without sleeping or blocking. There are also other IO engine threads that are not bound to the CPU and those are allowed to block and sleep. However, the bound threads \(also called reactors\) rely on being interrupted by the kernel and other userspace processes as little as possible. Otherwise, the latency of I/O may suffer.

Ideally, the only thing that interrupts IO engine's reactor would be only kernel time-based interrupts responsible for CPU accounting. However, that is far from trivial. `isolcpus` option that we will be using does not prevent:

* kernel threads and
* other k8s pods to run on the isolated CPU

However, it prevents system services including kubelet from interfering with IO engine.

### Set Linux kernel Boot Parameter

:::info
The best way to accomplish this step may differ, based on the Linux distro that you are using.
:::

Add the `isolcpus` kernel boot parameter to `GRUB_CMDLINE_LINUX_DEFAULT` in the grub configuration file, with a value which identifies the CPUs to be isolated \(indexing starts from zero here\). The location of the configuration file to change is typically `/etc/default/grub` but may vary. For example when running Ubuntu 20.04 in AWS EC2 Cloud boot parameters are in `/etc/default/grub.d/50-cloudimg-settings.cfg`.

In the following example we assume a system with 4 CPU cores in total, and that the third and the fourth CPU cores are to be dedicated to the IO engine.

```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash isolcpus=2,3"
```

### Update Grub

**Command**

```
sudo update-grub
```

**Example Output**

```
Sourcing file `/etc/default/grub'
Sourcing file `/etc/default/grub.d/40-force-partuuid.cfg'
Sourcing file `/etc/default/grub.d/50-cloudimg-settings.cfg'
Sourcing file `/etc/default/grub.d/init-select.cfg'
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.8.0-29-generic
Found initrd image: /boot/microcode.cpio /boot/initrd.img-5.8.0-29-generic
Found linux image: /boot/vmlinuz-5.4.0-1037-aws
Found initrd image: /boot/microcode.cpio /boot/initrd.img-5.4.0-1037-aws
Found Ubuntu 20.04.2 LTS (20.04) on /dev/xvda1
done
```

### Reboot the System

**Command**

```
sudo reboot
```

### Verify Isolcpus

Basic verification is by outputting the boot parameters of the currently running kernel:

**Command**

```
cat /proc/cmdline
```

**Example Output**
```
BOOT_IMAGE=/boot/vmlinuz-5.8.0-29-generic root=PARTUUID=7213a253-01 ro console=tty1 console=ttyS0 nvme_core.io_timeout=4294967295 isolcpus=2,3 panic=-1
```

You can also print a list of isolated CPUs:

**Command**

```
cat /sys/devices/system/cpu/isolated
```

**Example Output**
```
2-3
```

### Update Replicated PV Mayastor Helm Chart for CPU Core Specification

:::info
Update the [Helm value](https://github.com/openebs/mayastor-extensions/blob/6df062eb5a0864b82dcc709ab4d84a135252fe45/chart/values.yaml#L407) in the Replicated PV Mayastor Helm chart to specify the CPU core.
:::

To allot specific CPU cores for IO engine's reactors, follow these steps:

1. Ensure that you have the Replicated PV Mayastor kubectl plugin installed, matching the version of your Replicated PV Mayastor Helm chart deployment ([releases](https://github.com/openebs/mayastor/releases)). You can find installation instructions in the [kubectl plugin documentation](../advanced-operations/kubectl-plugin.md).

2. Execute the following command to update Replicated PV Mayastor's configuration. Replace `<namespace>` with the appropriate Kubernetes namespace where Replicated PV Mayastor is deployed.

```
kubectl mayastor upgrade -n <namespace> --set-args 'io_engine.coreList={2,3}'
```

In the above command, `io_engine.coreList={2,3}` specifies that IO engine's reactors should operate on the third and fourth CPU cores.

:::info
The cores are numbered from 0.
:::

## Network Isolation

By default, the NVMe-oF target binds to the IO engine pod's own IP address, which places volume
traffic on the same cluster pod network as application and control plane traffic. On a busy
node, replication and client I/O then compete with everything else for the same link.

Pointing the target at a dedicated interface - a separate NIC, a VLAN, or a storage-only subnet
- keeps that traffic on its own path.

The `io_engine.target.nvmf.iface` Helm value selects the interface. The IP address resolved from
it becomes the target address advertised to initiators, and all of the target's listeners share
that address, differing only in transport and port. Both application-to-volume traffic and
replication between nodes therefore follow the interface you choose.

### Select the Interface

The value takes the form `<kind>:<value>`:

| Kind | Example | Matches |
| --- | --- | --- |
| `name` | `name:eth1` | the interface with that name |
| `subnet` | `subnet:10.10.0.0/24` | an interface holding an address inside that CIDR |

A value with no prefix is matched as an interface name. An unprefixed CIDR therefore matches
nothing, and the IO engine fails to start with `Network interface matching '<value>' not found`.

### One Value Applies to Every Node

This is a single Helm value, rendered into the IO engine DaemonSet, so every IO engine pod
receives the same value. Choose the kind accordingly:

* Use `name:` only when the interface carries the same name on every IO engine node.
* Use `subnet:` when interface names differ between nodes. Each node independently selects its
  own interface holding an address in that subnet, which makes it the safer choice for mixed
  hardware.

:::info
The interface must exist, be up, and hold an address on **every** IO engine node. A node where
it cannot be resolved will fail to start its IO engine.
:::

### Apply the Setting

At install time:

```
helm install ... --set io_engine.target.nvmf.iface=subnet:10.10.0.0/24
```

On an existing deployment, using the kubectl plugin:

```
kubectl mayastor upgrade -n <namespace> --set-args 'io_engine.target.nvmf.iface=subnet:10.10.0.0/24'
```

### Verify

The IO engine logs the interface it was given and the address it resolved from it at startup:

**Command**

```
kubectl logs -n <namespace> <io-engine-pod> | grep "NVMF target network interface"
```

**Example Output**

```
Detecting IP address (prefer ipv4: true) for NVMF target network interface specified as 'subnet:10.10.0.0/24' ...
```

Check this on each IO engine node, and confirm that the nodes can reach one another over the
chosen subnet. If you are using jumbo frames, make sure the MTU is consistent across every node
and switch on the path.

### What This Does Not Move

Only the NVMe-oF data path follows this setting. The gRPC traffic between the control plane
agents and the IO engines, the etcd traffic, and the REST API continue to use the pod network.

### Using This with RDMA

When RDMA is enabled, set the value to a netdev that an RDMA device is bound to, as listed by
the `rdma link` command. See [RDMA](../configuration/rs-rdma.md) for the full set of
prerequisites.
