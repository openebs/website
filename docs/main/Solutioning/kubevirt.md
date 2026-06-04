---
id: kubevirt
title: KubeVirt VM Live Migration with Experimental RWX Block Volumes
keywords:
  - KubeVirt
  - RWX
  - ReadWriteMany
  - block volume
  - live migration
  - Replicated PV Mayastor
description: Learn how to test the experimental native RWX block volume support in Replicated PV Mayastor for KubeVirt live migration.
---

## Overview

Replicated PV Mayastor has **experimental** native support for RWX (ReadWriteMany) **block** volumes, specifically designed to enable KubeVirt VM live migration without an NFS intermediary. This allows two KubeVirt nodes to hold concurrent NVMe-oF connections to the same volume while the migration is in progress.

This guide helps you test the workflow and provide feedback to the OpenEBS team.

For design details, see:
- [OEP: RWX Block Volume Support in Mayastor for KubeVirt](https://github.com/openebs/openebs/blob/develop/designs/replicated-pv/mayastor/rwx-kubevirt.md)

:::warning Experimental feature
This feature is experimental and should be evaluated in non-production environments only. Feedback is actively requested so the team can harden the implementation before it becomes generally available.
:::

## Scope and constraints

- Intended for **KubeVirt** VM live migration use cases only.
- Only **block** mode volumes are supported (`volumeMode: Block`).
- `ReadWriteMany` for **filesystem** mode volumes is not supported by this mechanism.
- Complex network-fault scenarios during migration have known gaps (see [Known limitation](#known-limitation)).

## Environment used for validation

| Component | Version |
| :--- | :--- |
| KubeVirt | v1.8.3 |
| Kubernetes | v1.33.12 |
| OpenEBS | v4.5.0 |
| CDI | v1.65.0 |

## Prerequisites

- OpenEBS Replicated PV Mayastor installed and healthy. Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md).
- At least 3 worker nodes for migration testing.

## Install KubeVirt

1. Install the KubeVirt Operator.

   ```bash
   export VERSION=$(curl -s https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
   echo $VERSION
   kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-operator.yaml"
   ```

   **Sample output**
   ```
   namespace/kubevirt created
   customresourcedefinition.apiextensions.k8s.io/kubevirts.kubevirt.io created
   priorityclass.scheduling.k8s.io/kubevirt-cluster-critical created
   clusterrole.rbac.authorization.k8s.io/kubevirt.io:operator created
   serviceaccount/kubevirt-operator created
   role.rbac.authorization.k8s.io/kubevirt-operator created
   rolebinding.rbac.authorization.k8s.io/kubevirt-operator-rolebinding created
   clusterrole.rbac.authorization.k8s.io/kubevirt-operator created
   clusterrolebinding.rbac.authorization.k8s.io/kubevirt-operator created
   deployment.apps/virt-operator created
   ```

2. Create the KubeVirt Custom Resource.

   ```bash
   kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-cr.yaml"
   ```

   **Sample output**
   ```
   kubevirt.kubevirt.io/kubevirt created
   ```

3. (Optional) Enable emulation if hardware virtualisation is unavailable on the nodes.

   ```bash
   kubectl -n kubevirt patch kubevirt kubevirt --type=merge \
     --patch '{"spec":{"configuration":{"developerConfiguration":{"useEmulation":true}}}}'
   ```

4. Wait for KubeVirt to become available.

   ```bash
   kubectl -n kubevirt wait kv kubevirt --for condition=Available --timeout=5m
   ```

5. Verify the installation.

   ```bash
   kubectl get all -n kubevirt
   ```

   **Sample output**
   ```
   NAME                                         READY   STATUS    RESTARTS      AGE
   pod/virt-api-595d49d6fd-474xq                1/1     Running   1 (25h ago)   26h
   pod/virt-api-595d49d6fd-xg6w4                1/1     Running   1 (25h ago)   26h
   pod/virt-controller-6bbb8667fd-587nh         1/1     Running   1 (25h ago)   26h
   pod/virt-controller-6bbb8667fd-kzp2h         1/1     Running   1 (25h ago)   26h
   pod/virt-handler-6g4tr                       1/1     Running   0             26h
   pod/virt-handler-982bg                       1/1     Running   0             26h
   pod/virt-handler-dpwcf                       1/1     Running   0             26h
   pod/virt-operator-64b9cfbdcc-hjg75           1/1     Running   0             26h
   pod/virt-operator-64b9cfbdcc-st7rj           1/1     Running   0             26h

   NAME                            AGE   PHASE
   kubevirt.kubevirt.io/kubevirt   26h   Deployed
   ```

## Install CDI

CDI (Containerized Data Importer) manages the import and cloning of VM disk images into PersistentVolumes.

1. Install the CDI Operator and Custom Resource.

   ```bash
   export VERSION=$(basename $(curl -s -w %{redirect_url} https://github.com/kubevirt/containerized-data-importer/releases/latest))
   kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-operator.yaml
   kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-cr.yaml
   ```

   **Sample output**
   ```
   namespace/cdi created
   customresourcedefinition.apiextensions.k8s.io/cdis.cdi.kubevirt.io created
   clusterrole.rbac.authorization.k8s.io/cdi-operator-cluster created
   clusterrolebinding.rbac.authorization.k8s.io/cdi-operator created
   serviceaccount/cdi-operator created
   role.rbac.authorization.k8s.io/cdi-operator created
   rolebinding.rbac.authorization.k8s.io/cdi-operator created
   deployment.apps/cdi-operator created
   ```

2. Configure containerd for CDI block-device imports.

   On some kubeadm/containerd environments, CDI importer pods can fail block-mode DataVolume imports with:

   ```
   exit status 1, blockdev: cannot open /dev/cdi-block-volume: Permission denied
   ```

   Set `device_ownership_from_security_context = true` in containerd on each Kubernetes node:

   ```bash
   sudo sed -i 's/device_ownership_from_security_context = false/device_ownership_from_security_context = true/' /etc/containerd/config.toml
   ```

   :::tip
   If the key does not already exist in your `config.toml`, open the file manually and add the following section:

   ```toml
   [plugins."io.containerd.cri.v1.runtime"]
     device_ownership_from_security_context = true
   ```
   :::

   Restart containerd after the config change:

   ```bash
   sudo systemctl restart containerd
   ```

3. Wait for CDI to become available.

   ```bash
   kubectl -n cdi wait cdi cdi --for condition=Available --timeout=5m
   ```

4. Verify the installation.

   ```bash
   kubectl get all -n cdi
   ```

   **Sample output**
   ```
   NAME                                         READY   STATUS    RESTARTS        AGE
   pod/cdi-apiserver-5bbd7b4df5-28gm8           1/1     Running   1 (2m55s ago)   3m
   pod/cdi-deployment-84d584dbdd-g8mfn          1/1     Running   0               3m
   pod/cdi-operator-7cfb4db845-fg6vt            1/1     Running   0               3m46s
   pod/cdi-uploadproxy-856554cb9c-m7kll         1/1     Running   1 (2m54s ago)   3m
   ```

## Install virtctl

`virtctl` is the CLI companion to `kubectl` for KubeVirt operations such as accessing the VM console and triggering live migration.

Download the binary that matches your installed KubeVirt version:

```bash
VERSION=$(kubectl get kubevirt.kubevirt.io/kubevirt -n kubevirt -o=jsonpath="{.status.observedKubeVirtVersion}")
ARCH=$(uname -s | tr A-Z a-z)-$(uname -m | sed 's/x86_64/amd64/') || windows-amd64.exe
echo ${ARCH}
curl -L -o virtctl https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-${ARCH}
sudo install -m 0755 virtctl /usr/local/bin
```

Verify:

```bash
virtctl version
```

### Alternative: install `virtctl` via krew

If you already use kubectl plugins through krew, you can install the `virt` plugin:

```bash
kubectl krew install virt
kubectl virt version
```

Refer to the [official virtctl documentation](https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/) for installation on other operating systems.

## 1) Create a StorageClass

Create a StorageClass backed by Replicated PV Mayastor using the NVMe-oF protocol. Two replicas are sufficient for migration testing.

**storageclass-rwx-block.yaml**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-rwx-block
parameters:
  protocol: nvmf
  repl: "2"
  thin: "true"
  rwxBlock: "true"
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

Apply it:

```bash
kubectl apply -f storageclass-rwx-block.yaml
```

## 2) Create a block-mode DataVolume

Create a DataVolume using `accessModes: ReadWriteMany` and `volumeMode: Block`. This provisions a native RWX block PVC directly via Mayastor — no NFS pod is required.

**dv-rwx-block.yaml**
```yaml
apiVersion: cdi.kubevirt.io/v1beta1
kind: DataVolume
metadata:
  name: ubuntu-rwx-block
spec:
  storage:
    accessModes:
      - ReadWriteMany
    resources:
      requests:
        storage: 8Gi
    storageClassName: mayastor-rwx-block
    volumeMode: Block
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
```

Apply it:

```bash
kubectl apply -f dv-rwx-block.yaml
```

Wait until the DataVolume reports `Succeeded`:

```bash
kubectl get datavolume ubuntu-rwx-block -w
```

## 3) Create a VM

Create a VM manifest that:
- references the `ubuntu-rwx-block` PVC as a block disk
- sets `evictionStrategy: LiveMigrate`

**vm-rwx-block.yaml**
```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: vm-rwx
spec:
  runStrategy: Always
  template:
    metadata:
      labels:
        kubevirt.io/domain: vm-rwx
    spec:
      evictionStrategy: LiveMigrate
      terminationGracePeriodSeconds: 30
      networks:
      - name: default
        pod: {}
      domain:
        cpu:
          cores: 1
        devices:
          interfaces:
          - name: default
            masquerade: {}
          disks:
          - disk:
              bus: virtio
            name: disk0
        machine:
          type: q35
        resources:
          requests:
            memory: 1024M
      volumes:
      - name: disk0
        persistentVolumeClaim:
          claimName: ubuntu-rwx-block
```

Apply it:

```bash
kubectl apply -f vm-rwx-block.yaml
```

Verify the VM reaches `Running` state:

```bash
kubectl get vm vm-rwx
kubectl get vmi vm-rwx -o wide
```

## 4) Trigger and validate live migration

Trigger migration:

```bash
virtctl migrate vm-rwx
```

Monitor migration progress:

```bash
kubectl get vmi vm-rwx -o yaml | grep -A4 migrationState
```

After migration completes, verify:
- VM is running on a different node
- Data is intact inside the VM

## Known limitation

During migration, if a network partition causes this asymmetry:
- **source node can still reach the NVMe-oF target**, but
- **target node cannot reach the NVMe-oF target**,

then the current high-availability behavior may repeatedly trigger failover/republish attempts (connection "ping-pong") until migration recovery fails.

This is a known gap in the current HA logic, which currently detects path failures on a **per node-path** basis independently. A more robust fix would require the **Mayastor HA node agent** to become volume-aware for multi-attach migration scenarios, so that a republish result for one path is shared with all other connected nodes rather than triggering a chain of independent failover requests.

## Feedback requested

Please test this feature and share your results, especially around:
- migration stability under normal conditions
- failover and reconnection behavior
- behavior under network faults

You can report your findings in:
- [OpenEBS issues](https://github.com/openebs/openebs/issues)
- [OpenEBS discussions](https://github.com/openebs/openebs/discussions)

Please include:
- OpenEBS, Kubernetes, and KubeVirt versions
- StorageClass and VM specs (sanitized)
- Migration timeline and relevant events or logs

## See also

- [KubeVirt VM Live Migration with Replicated PV Mayastor and NFS](./read-write-many/kubevirt-nfs.md)
- [Provisioning NFS PVCs](./read-write-many/nfspvc.md)
- [KubeVirt VM Backup and Restore](../backup-and-restore/kubevirt-backup.md)
