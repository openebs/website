---
id: talos
title: OpenEBS Installation on Talos
keywords:
 - OpenEBS Installation on Talos
 - Replicated PV Mayastor Installation on Talos
 - Replicated PV Mayastor - Platform Support
 - Platform Support
 - Talos
description: This section explains about the Platform Support for OpenEBS on Talos Linux.
---
# OpenEBS Installation on Talos

:::info
All the below configurations can be applied either during initial cluster creation or on running worker nodes.
:::

:::important
Talos 1.14 deprecated two settings this document previously relied on:
`.machine.kubelet.extraMounts` and `.machine.kernel.modules`. Both continue to work on clusters
upgraded from earlier versions, but neither is available in a newly generated 1.14 configuration.
See [Kernel Modules](#kernel-modules) and [Data Mount Paths](#data-mount-paths).
:::

## Requirements

- A running Talos Kubernetes cluster
- `talosctl`, `kubectl` and `helm` installed
- Administrative access to the Talos nodes
- Block devices available for storage

## Pod Security

By default, Talos Linux applies a baseline pod security profile across namespaces except for the
kube-system namespace. This restricts OpenEBS's ability to manage and access system resources.

Label the namespace to allow privileged pods:

```bash
kubectl create ns openebs

kubectl label ns openebs \
  pod-security.kubernetes.io/enforce=privileged \
  pod-security.kubernetes.io/enforce-version=latest \
  pod-security.kubernetes.io/audit=privileged \
  pod-security.kubernetes.io/audit-version=latest \
  pod-security.kubernetes.io/warn=privileged \
  pod-security.kubernetes.io/warn-version=latest --overwrite
```

This applies to the namespace alone and needs no control plane configuration change. Refer to the
[Talos Documentation](https://www.talos.dev/latest/kubernetes-guides/configuration/pod-security/) for
details on Pod Security in Talos.

## Kernel Modules

LocalPV ZFS and btrfs-backed volumes need kernel modules that are not in the base Talos image.
Getting them onto a node is two separate steps.

Local PV Hostpath needs neither step. Replicated PV Mayastor over NVMe/TCP needs neither step
either - `nvme_tcp` is built into the base image.

:::note
RDMA is not covered by this document. In Talos, `nvme_rdma` is a loadable kernel module and is not
built into the base image, there is no system extension for it, and RDMA on Talos has not been
tested with OpenEBS. Refer to
[Replicated PV Mayastor RDMA](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-rdma.md)
for the general RDMA requirements.
:::

### Step 1: Install the system extension

A system extension is a package that adds kernel modules or tools to the Talos operating system.
Extensions are part of the Talos image. Because Talos is immutable, an extension cannot be installed
into a running node - the image itself must change.

Only some engines need an extension. Include an extension only when you use the engine or
filesystem it supports:

| Extension | Needed for |
|---|---|
| None | Local PV Hostpath, and Replicated PV Mayastor over NVMe/TCP |
| `siderolabs/zfs` | Local PV ZFS |
| `siderolabs/btrfs` | Volumes formatted with the `btrfs` filesystem type |

Build an image with the extensions you need using the [Talos Image Factory](https://factory.talos.dev/),
with a schematic such as the following, which includes every extension in the table:

```yaml
customization:
  systemExtensions:
    officialExtensions:
      - siderolabs/btrfs
      - siderolabs/zfs
```

Apply it either by installing nodes from that image, or on an existing cluster by upgrading to it:

```bash
talosctl upgrade -n <node ip> --image factory.talos.dev/installer/<schematic id>:v1.14.1
```

Verify the extensions are present on each node:

```bash
talosctl --talosconfig talosconfig -n <node ip> get extensions
```

Remove any extension you do not need from the schematic.

### Step 2: Load the module

The extension ships the kernel module, but it is not loaded until the machine config says so.
Load only the modules for the extensions you installed.

**Talos 1.14 and later** - one `KernelModuleConfig` document per module:

```yaml
apiVersion: v1alpha1
kind: KernelModuleConfig
name: btrfs
---
apiVersion: v1alpha1
kind: KernelModuleConfig
name: zfs
```

```bash
talosctl patch machineconfig -n <worker node ip> --patch @modules.yaml
```

Module parameters, when needed, go in an optional `parameters` list and take effect after a reboot.
See the [KernelModuleConfig reference](https://docs.siderolabs.com/talos/v1.14/reference/configuration/runtime/kernelmoduleconfig).

**Talos 1.13 and earlier:**

```yaml
machine:
  kernel:
    modules:
      - name: btrfs
      - name: zfs
```

:::note
`.machine.kernel.modules` is deprecated in favour of the multi-document `KernelModuleConfig`. It is
still honoured on upgraded clusters but is no longer documented and should not be used for new
deployments.
:::

Verify the modules are loaded:

```bash
talosctl --talosconfig talosconfig -n <worker node ip> list /sys/module/ | grep -E 'zfs|btrfs'
```

## Talos Worker Node Changes

### Huge Pages

2MiB-sized Huge Pages must be supported and enabled on the Replicated PV Mayastor storage nodes. A
minimum number of 1024 such pages (i.e. 2GiB total) must be available exclusively to the Replicated
PV Mayastor pod on each node.

Set the number of Huge Pages in the machine configuration:

```yaml
machine:
  sysctls:
    vm.nr_hugepages: "1024"
```

Verify after applying the configuration:

```bash
talosctl --talosconfig talosconfig -n <worker node ip> read /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
```

The expected output is `1024`.

### NVMe Requirements

The `nvme_tcp` kernel module is built into Talos images. Confirm it is present, and that native NVMe
multipath is enabled:

```bash
talosctl --talosconfig talosconfig -n <worker node ip> list /sys/module/ | grep -i nvme
talosctl --talosconfig talosconfig -n <worker node ip> read /sys/module/nvme_core/parameters/multipath
```

The expected output of the second command is `Y`.

### Labels

All Replicated PV Mayastor storage nodes must be labelled with the OpenEBS engine type "mayastor".
This label is used as a node selector by the IO engine DaemonSet deployed as part of the Replicated
PV Mayastor data plane components.

```yaml
machine:
  nodeLabels:
    openebs.io/engine: "mayastor"
```

or, on a running cluster:

```bash
kubectl label node <node name> openebs.io/engine=mayastor
```

### Data Mount Paths

LocalPV Hostpath volumes - used by the hostpath engine, and by Replicated PV Mayastor's etcd, Loki
and MinIO - are mounted by the kubelet. On Talos the kubelet runs as a container with a fixed mount
list, so the host path holding those volumes must be visible inside it.

How you achieve that depends on the Talos version.

#### Talos 1.13 and earlier, and clusters upgraded to 1.14+

Use `.machine.kubelet.extraMounts` to expose the path to the kubelet.

**Create a file wp.yaml**

```yaml
machine:
  sysctls:
    vm.nr_hugepages: "1024"
  nodeLabels:
    openebs.io/engine: "mayastor"
  kubelet:
    extraMounts:
      - destination: /var/local
        type: bind
        source: /var/local
        options:
          - bind
          - rshared
          - rw
```

:::note
`.machine.kubelet.extraMounts` is deprecated. It continues to work on upgraded 1.14 clusters,
including with workload isolation enabled, but it is not available in newly generated 1.14
configurations. Plan to migrate to user volumes before you regenerate a cluster's machine config.
:::

#### Talos 1.14 and later, newly created clusters

`talosctl gen config` on 1.14+ emits a `KubeletConfig` document, which has no `extraMounts` field and
is mutually exclusive with `.machine.kubelet`. There is no place to declare an extra kubelet mount.

Instead, Talos automatically exposes `/var/mnt` - the user volume mount point - to the kubelet.
Declare a user volume and point the storage paths at it.

**Create a file uv.yaml**

```yaml
apiVersion: v1alpha1
kind: UserVolumeConfig
name: openebs
volumeType: directory
```

`volumeType: directory` requires no disk or partition. Apply it to **every** node that will host
LocalPV Hostpath volumes:

```bash
talosctl patch machineconfig -n <worker node ip> --patch @uv.yaml
talosctl get volumestatus -n <worker node ip> | grep u-openebs
```

The volume must report `ready` before installing. Then set the chart's base paths so that every
hostpath-backed component stores its data in its own subdirectory of `/var/mnt/openebs`:

```bash
--set localpv-provisioner.localpv.basePath=/var/mnt/openebs/localpv-provisioner/
--set mayastor.etcd.localpvScConfig.basePath=/var/mnt/openebs/etcd/
--set loki.localpvScConfig.loki.basePath=/var/mnt/openebs/loki/
--set loki.localpvScConfig.minio.basePath=/var/mnt/openebs/minio/
```

Each base path is set separately. The chart has no single setting that applies a common prefix to
all of them.

:::important
Use these base paths for new installations only. Do not change the base paths of an existing
release, and do not change the base paths during an upgrade. A volume records its path when it is
created and cannot be repointed, so volumes that already exist are not moved to the new path.
Existing volumes can become inaccessible, and their data can be lost.
:::

:::important
Only paths under a declared user volume work. A directory created by hand under `/var/mnt` is not a
separate mount, so it inherits the read-only bind of `/var/mnt` itself and the kubelet cannot write
to it. Each writable location must have its own `UserVolumeConfig`.
:::

:::note
Ordinary `hostPath` volumes declared in a pod spec are unaffected - they are set up by the container
runtime, not the kubelet, and continue to work at any path. Replicated PV Mayastor's own data volumes
are also unaffected, because CSI mounts them under `/var/lib/kubelet`.
:::

The base path of a Local PV Hostpath volume comes from its StorageClass. When the chart creates
the class, it writes the base path into the `cas.openebs.io/config` annotation as the `BasePath`
entry. By default, the classes are:

| StorageClass | Used by |
|---|---|
| `openebs-hostpath` | Local PV Hostpath |
| `mayastor-etcd-localpv` | Replicated PV Mayastor etcd |
| `openebs-loki-localpv` | Loki |
| `openebs-minio-localpv` | MinIO |

After installing, confirm that each class uses the expected path and that the volumes land there:

```bash
kubectl get sc <storage class> -o jsonpath='{.metadata.annotations.cas\.openebs\.io/config}'
talosctl -n <worker node ip> ls -l /var/mnt/openebs
```

:::important
The base path is written into the StorageClass's `cas.openebs.io/config` annotation when the class is
created. Changing the Helm value does not rewrite an existing class - delete the StorageClass and let
the chart recreate it.
:::

### Applying the configuration

Combine the settings above in a machine configuration patch file such as `wp.yaml`, and apply it
with one of the following methods. The `uv.yaml` and `modules.yaml` documents are applied in the
same way.

1. By using `talosctl gen config`:

    ```bash
    talosctl gen config talos-k8s-tutorial https://mytaloscluster:443 --config-patch-worker @wp.yaml
    ```

2. By patching a running node:

    ```bash
    talosctl patch --mode=no-reboot machineconfig -n <worker node ip> --patch @wp.yaml
    ```

3. By editing the machine config on a running node:

    ```bash
    talosctl edit -n <node ip> machineconfig --talosconfig <path to talosconfig file>
    ```

:::important
Restart kubelet or reboot the node if you modify the `vm.nr_hugepages` configuration of a node.
Replicated PV Mayastor will not deploy correctly if the available Huge Page count as reported by the
node's kubelet instance does not meet the minimum requirements.

```bash
talosctl -n <node ip> service kubelet restart
```
:::

## Install OpenEBS on Talos

Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md#installation-via-helm)
for the general Helm installation procedure.

On Talos 1.14 or later, a new installation typically looks like:

```bash
helm install openebs openebs/openebs -n openebs \
  --set localpv-provisioner.localpv.basePath=/var/mnt/openebs/localpv-provisioner/ \
  --set mayastor.etcd.localpvScConfig.basePath=/var/mnt/openebs/etcd/ \
  --set loki.localpvScConfig.loki.basePath=/var/mnt/openebs/loki/ \
  --set loki.localpvScConfig.minio.basePath=/var/mnt/openebs/minio/
```

The base paths are required for new installations on 1.14+ so that hostpath volumes land inside the user volume. On Talos
1.13 or earlier, or on an upgraded cluster still using `extraMounts`, omit them and keep the chart
defaults.

:::note
Helm does not carry forward values from a previous release when new values are supplied on the
command line. For anything long-lived, keep these settings in a values file and pass it with `-f` on
every upgrade.
:::

Verify all components are running:

```bash
kubectl get pods -n openebs
```

## Troubleshooting

### Pod fails to mount a volume: path does not exist

```
MountVolume.NewMounter initialization failed for volume "pvc-..." : path "/var/openebs/local/pvc-..." does not exist
```

The base path is outside the kubelet's mount namespace. The directory usually does exist on the node -
it is simply not visible to the kubelet. On Talos 1.14+ without `extraMounts`, move the base path under
a declared user volume as described in [Data Mount Paths](#data-mount-paths), then delete and recreate
the StorageClass so the new path is picked up.

### ZFS or btrfs volumes fail to provision

Confirm the system extension is installed and the module is loaded:

```bash
talosctl --talosconfig talosconfig -n <node ip> get extensions
talosctl --talosconfig talosconfig -n <node ip> list /sys/module/ | grep -E 'zfs|btrfs'
```

If the extension is present but the module is missing, the `KernelModuleConfig` document has not been
applied to that node.

## Talos Upgrade

The Talos operating system provides a streamlined upgrade process for maintaining and enhancing
system performance. Follow the appropriate steps based on the version of Talos you are using to
ensure data integrity and system stability during upgrades.

### Version 1.7 or Lower

1. Upgrade a node using the `--preserve` flag.

```bash
talosctl -n <node-ip> upgrade --preserve --image $IMAGE_URL
```

:::note
The `--preserve` flag explicitly instructs Talos to retain ephemeral data. Upgrading without this
flag will compel Talos to reset node configurations and data, resulting in a more intrusive process
that will erase the existing etcd state and other stored data.
:::

2. Verify that the node is operating on the new version.

```bash
talosctl -n <node-ip> version
```

3. Repeat this process for all nodes in the cluster.

### Version 1.8 or Above

In the Talos Linux installer, the system disk is never wiped during upgrades. Consequently, the
`--preserve` flag is automatically applied to the `talosctl upgrade` command, ensuring a seamless
upgrade experience while preserving existing data.

Refer [Upgrades](https://www.talos.dev/v1.8/introduction/what-is-new/#upgrades) for more details.

### Upgrading to Version 1.14

An upgrade to 1.14 does not change the machine configuration, so existing
`.machine.kubelet.extraMounts` and `.machine.kernel.modules` settings are preserved and continue to
work. This remains true if you later enable workload isolation with the `SecurityProfileConfig`
document.

Migration becomes necessary when the machine configuration is regenerated, because a 1.14-generated
configuration contains a `KubeletConfig` document and can no longer express
`.machine.kubelet.extraMounts`.

:::warning
Do not simply change the base paths or the data mount configuration of an existing installation
when you upgrade or regenerate the machine configuration. Existing LocalPV Hostpath volumes stay
on their original paths, and if that path is no longer mounted on the node, the volumes become
inaccessible and their data can be lost. Migrate existing volumes to the new path before you
remove the old configuration.
:::

This affects **LocalPV Hostpath volumes only** - the hostpath engine, and Replicated PV Mayastor's
etcd, Loki and MinIO. Those volumes must be recreated on the new path, one at a time, because a PV
records its path at creation and cannot be repointed. Replicated PV Mayastor's own data volumes are
not affected: they are CSI volumes mounted under `/var/lib/kubelet`, which the kubelet always sees.

## See Also

- [Replicated PV Mayastor Installation on MicroK8s](microkubernetes.md)
- [Replicated PV Mayastor Installation on Google Kubernetes Engine](gke.md)
- [Provisioning NFS PVCs](../read-write-many/nfspvc.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)
