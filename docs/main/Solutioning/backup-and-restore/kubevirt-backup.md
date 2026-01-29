---
id: kubevirt-backup
title: KubeVirt VM Backup and Restore using Replicated PV Mayastor VolumeSnapshots and Velero - FileSystem
keywords: 
  - KubeVirt
  - KubeVirt VM Live Migration
  - KubeVirt VM Backup and Restore
  - KubeVirt VM Backup and Restore using Replicated PV Mayastor VolumeSnapshots and Velero - FileSystem
description: In this document, you learn about KubeVirt VM Backup and Restore using Replicated PV Mayastor VolumeSnapshots and Velero.
---

## Overview

As Kubernetes continues to gain traction in enterprise environments, there is a growing need to support traditional workloads like virtual machines (VMs) alongside containerized applications. KubeVirt extends Kubernetes by enabling the deployment and management of VMs within a Kubernetes-native ecosystem.

To protect KubeVirt-based VMs, a robust backup strategy is essential. This document outlines a step-by-step method to back up KubeVirt virtual machines using Velero, a popular backup and disaster recovery tool for Kubernetes, in combination with Replicated PV Mayastor VolumeSnapshots. This approach provides consistent, point-in-time VM backups that are fully integrated with Kubernetes storage primitives and cloud-native workflows.

## Environment

| Component | Version |
| :--- | :--- |
| KubeVirt | v1.5.0 |
| Kubernetes (3 nodes) | v1.29.6 |
| OpenEBS | v4.2.0 |
| NFS CSI Driver | v4.11.0 |
| Containerized Data Importer (CDI) | v1.62.0 |
| kubectl-mayastor Plugin | v2.7.4+0 |
| virtctl | v1.5.0 |

## Prerequisites

### Setup OpenEBS

- **Install OpenEBS**
  
  Ensure that OpenEBS is installed in your cluster. Refer to the [OpenEBS Installation Documentation](../../quickstart-guide/installation.md) for step-by-step instructions.

- **Install the `kubectl-mayastor` Plugin**
  
  Ensure that `kubectl-mayastor` plugin is installed. Refer to the [Mayastor Kubectl Plugin Documentation](../../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/kubectl-plugin.md) to install the plugin.

- **Create a StorageClass**

1. Create a file named `StorageClass.yaml`.
  
**StorageClass.yaml**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mayastor-1
parameters:
  protocol: nvmf
  repl: "1"
  thin: "true"  
provisioner: io.openebs.csi-mayastor
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
```

2. Apply the configuration.
  
```
kubectl create -f StorageClass.yaml
```

### Create a VolumeSnapshotClass

1. Create a file named `VolumeSnapshotClass.yaml`.

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshotClass
metadata:
  name: csi-mayastor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
driver: io.openebs.csi-mayastor
deletionPolicy: Delete
```

2. Apply the configuration.
  
```
kubectl create -f VolumeSnapshotClass.yaml
```

## KubeVirt Setup

1. Install KubeVirt Operator.

```
export VERSION=$(curl -s https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
echo $VERSION
kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-operator.yaml"
```

**Sample Output**
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

2. Create KubeVirt Custom Resource.

```
kubectl create -f "https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/kubevirt-cr.yaml"
```

**Sample Output**
```
kubevirt.kubevirt.io/kubevirt created
```

3. Patch to Use Emulation (Optional).

```
kubectl -n kubevirt patch kubevirt kubevirt --type=merge --patch '{"spec":{"configuration":{"developerConfiguration":{"useEmulation":true}}}}'
```

4. Verify KubeVirt Installation.

```
kubectl get all -n kubevirt
```

**Sample Output**
```
➜  kubevirt kubectl get all -n kubevirt
Warning: kubevirt.io/v1 VirtualMachineInstancePresets is now deprecated and will be removed in v2.

NAME                                         READY       STATUS            RESTARTS                   AGE
pod/virt-api-c8c86b5b-fjcdt                  1/1         Running           1  (2m32s ago)             17m
pod/virt-api-c8c86b5b-vsznq                  1/1         Running           1  (2m32s ago)             17m
pod/virt-controller-5f57b7cc79-6qgv2         1/1         Running           1  (2m37s ago)             16m
pod/virt-controller-5f57b7cc79-qwlzv         1/1         Running           1  (2m37s ago)             16m
pod/virt-handler-684vj                       1/1         Running           0                          16m
pod/virt-handler-njqxj                       1/1         Running           0                          16m
pod/virt-handler-sk8bf                       1/1         Running           0                          16m
pod/virt-operator-584c7dd444-5r9d8           1/1         Running           0                          20m
pod/virt-operator-584c7dd444-tcxs4           1/1         Running           0                          20m

NAME                                         TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)      AGE
service/kubevirt-operator-webhook            ClusterIP   10.106.160.8      <none>        443/TCP      17m
service/kubevirt-prometheus-metrics          ClusterIP   None              <none>        443/TCP      17m
service/virt-api                             ClusterIP   10.111.142.175    <none>        443/TCP      17m
service/virt-exportproxy                     ClusterIP   10.106.210.218    <none>        443/TCP      17m

NAME                                         DESIRED     CURRENT           READY          UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE
daemonset.apps/virt-handler                  3           3                 3              3            3           kubernetes.io/os=linux   16m

NAME                                         READY       UP-TO-DATE        AVAILABLE      AGE
deployment.apps/virt-api                     2/2         2                 2              17m
deployment.apps/virt-controller              2/2         2                 2              16m
deployment.apps/virt-operator                2/2         2                 2              20m

NAME                                         DESIRED     CURRENT           READY          AGE
replicaset.apps/virt-api-c8c86b5b            2           2                 2              17m
replicaset.apps/virt-controller-5f57b7cc79   2           2                 2              16m
replicaset.apps/virt-operator-584c7dd444     2           2                 2              20m

NAME                                         AGE         PHASE
kubevirt.kubevirt.io/kubevirt                17m         Deployed

```

## CDI Setup

1. Install CDI Operator and Custom Resource.

```
export TAG=$(curl -s -w %{redirect_url} https://github.com/kubevirt/containerized-data-importer/releases/latest)
export VERSION=$(echo ${TAG##*/})
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-operator.yaml
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-cr.yaml
```

**Sample Output - CDI**
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

**Sample Output - CR**
```
kubectl create -f https://github.com/kubevirt/containerized-data-importer/releases/download/$VERSION/cdi-cr.yaml
cdi.cdi.kubevirt.io/cdi created
```

2. Configure Scratch Space StorageClass.

```
kubectl edit cdi cdi
```

Add the following under `spec.config`:

```
spec:
  config:
    featureGates:
    - HonorWaitForFirstConsumer
    scratchSpaceStorageClass: mayastor-1
```

:::important
CDI always requests scratch space with a Filesystem volume mode regardless of the volume mode of the related DataVolume. It also always requests it with a ReadWriteOnce accessMode. Therefore, when using block mode DataVolumes, you must ensure that a storage class capable of provisioning Filesystem mode PVCs with ReadWriteOnce accessMode is configured.
:::

3. Verify CDI Installation.

```
kubectl get all -n cdi
```

**Sample Output**
```  
Warning: kubevirt.io/v1 VirtualMachineInstancePresets is now deprecated and will be removed in v2.
NAME                                         READY       STATUS          RESTARTS        AGE
pod/cdi-apiserver-5bbd7b4df5-28gm8           1/1         Running         1 (2m55s ago)   3m
pod/cdi-deployment-84d584dbdd-g8mfn          1/1         Running         0               3m
pod/cdi-operator-7cfb4db845-fg6vt            1/1         Running         0               3m46s
pod/cdi-uploadproxy-856554cb9c-m7kll         1/1         Running         1 (2m54s ago)   3m

NAME                                         TYPE        CLUSTER-IP      EXTERNAL-IP     PORT(S)    AGE
service/cdi-api                              ClusterIP   10.103.42.202   <none>          443/TCP    3m1s
service/cdi-prometheus-metrics               ClusterIP   10.105.45.246   <none>          8080/TCP   3m1s
service/cdi-uploadproxy                      ClusterIP   10.96.255.119   <none>          443/TCP    3m1s

NAME                                         READY       UP-TO-DATE      AVAILABLE       AGE
deployment.apps/cdi-apiserver                1/1         1               1               3m2s
deployment.apps/cdi-deployment               1/1         1               1               3m2s
deployment.apps/cdi-operator                 1/1         1               1               3m48s
deployment.apps/cdi-uploadproxy              1/1         1               1               3m2s

NAME                                         DESIRED     CURRENT         READY           AGE
replicaset.apps/cdi-apiserver-5bbd7b4df5     1           1               1               3m2s
replicaset.apps/cdi-deployment-84d584dbdd    1           1               1               3m2s
replicaset.apps/cdi-operator-7cfb4db845      1           1               1               3m48s
replicaset.apps/cdi-uploadproxy-856554cb9c   1           1               1               3m2s
```

## Deploying a Virtual Machine

- **Create DataVolume**

1. Create a file named `dv.yaml`.

**dv.yaml**
```yaml
apiVersion: cdi.kubevirt.io/v1beta1
kind: DataVolume
metadata:
  name: "fedora-1"
spec:
  storage:
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 8Gi
    storageClassName: mayastor-1
    volumeMode: Block
  source:
    http:
      url: "https://download.fedoraproject.org/pub/fedora/linux/releases/40/Cloud/x86_64/images/Fedora-Cloud-Base-AmazonEC2.x86_64-40-1.14.raw.xz"
```

2. Apply the Configuration.

```
kubectl create -f dv.yaml
```

3. Monitor the Import.

```
kubectl logs -f pod/importer-fedora
```

- **Create a Virtual Machine**

1. Create a file named `vm1_pvc.yaml` to use the PVC prepared by DataVolume as a root disk.

**vm1_pvc.yaml**
```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  creationTimestamp: 2018-07-04T15:03:08Z
  generation: 1
  labels:
    kubevirt.io/os: linux
  name: vm1
spec:
  runStrategy: Always
  template:
    metadata:
      creationTimestamp: null
      labels:
        kubevirt.io/domain: vm1
    spec:
      domain:
        cpu:
          cores: 2
        devices:
          disks:
          - disk:
              bus: virtio
            name: disk0
          - cdrom:
              bus: sata
              readonly: true
            name: cloudinitdisk
        machine:
          type: q35
        resources:
          requests:
            memory: 1024M
      volumes:
      - name: disk0
        persistentVolumeClaim:
          claimName: fedora-1
      - cloudInitNoCloud:
          userData: |
            #cloud-config
            hostname: vm1
            ssh_pwauth: True
            disable_root: false
            chpasswd:
              list: |
                root:MySecurePassword123
              expire: false
        name: cloudinitdisk
```

2. Apply the configuration.

```
kubectl create -f vm1_pvc.yaml
```

3. Connect to the VM Console.

```
virtctl console vm1
```

- Login credentials:
    Username: `root`
    Password: `MySecurePassword123`

4. Install Guest Agent.

```
virtctl console vm1   
yum install -y qemu-guest-agent
systemctl enable --now qemu-guest-agent
```

**Check Agent Status**
```
kubectl get vm vm1 -o yaml
```

5. Insert Sample Data: Connect to the VM and create sample files in the root user home directory for backup verification.

## Velero Setup

- **Configuring an AWS S3 Bucket for Velero Backup-Location**

1. Configure AWS CLI (Optionally you can use the AWS GUI). Refer to the [AWS CLI Setup Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) for setting up AWS CLI.

2. Create an AWS S3 Bucket.

```
BUCKET=kubevirtbackup2025                 
REGION=ap-south-1
aws s3api create-bucket \
    --bucket $BUCKET \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION
```

3. Create Velero User.

```
aws iam create-user --user-name velero
```

4. Create an IAM policy with appropriate permissions.

```
cat > velero-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeVolumes",
                "ec2:DescribeSnapshots",
                "ec2:CreateTags",
                "ec2:CreateVolume",
                "ec2:CreateSnapshot",
                "ec2:DeleteSnapshot"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:AbortMultipartUpload",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::${BUCKET}/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::${BUCKET}"
            ]
        }
    ]
}
EOF
```

5. Assign the IAM policy to velero user.

```
aws iam put-user-policy \
  --user-name velero \
  --policy-name velero \
  --policy-document file://velero-policy.json
```

6. Generate Access Keys.

```
aws iam create-access-key --user-name velero
```

**Sample Output**

```
{
    "AccessKey": {
        "UserName": "velero",
        "AccessKeyId": <AWS_ACCESS_KEY_ID>,
        "Status": "Active",
        "SecretAccessKey": <AWS_SECRET_ACCESS_KEY>,
        "CreateDate": "2025-04-24T13:32:14+00:00"
    }
}
```

- **Install Velero Utility**

Install the Velero utility with Homebrew.

```
brew install velero
```

- **Install Velero**

1. Create `credentials-velero` file with the access key and secret access key.

```
[default]
aws_access_key_id=<AWS_ACCESS_KEY_ID>
aws_secret_access_key=<AWS_SECRET_ACCESS_KEY>
```

2. Install Velero.

```
velero install \
    --provider aws \
    --plugins velero/velero-plugin-for-aws:v1.10.0 \
    --bucket $BUCKET \
    --backup-location-config region=$REGION \
    --snapshot-location-config region=$REGION \
    --secret-file ./credentials-velero \
    --use-volume-snapshots=true \
    --features=EnableCSI \
    --use-node-agent \
    --privileged-node-agent
```

3. Verify the Installation.

**Command**
```
kubectl get all -n velero
```

**Sample Output**
```
Warning: kubevirt.io/v1 VirtualMachineInstancePresets is now deprecated and will be removed in v2.
NAME                                 READY       STATUS         RESTARTS     AGE
pod/node-agent-2nbdm                 1/1         Running        0            7s
pod/node-agent-ckw7f                 1/1         Running        0            7s
pod/node-agent-mzxx9                 1/1         Running        0            7s
pod/velero-c67f8df7b-9d47t           1/1         Running        0            7s

NAME                                 DESIRED     CURRENT        READY        UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
daemonset.apps/node-agent            3           3              3            3            3           <none>          8s

NAME                                 READY       UP-TO-DATE     AVAILABLE    AGE
deployment.apps/velero               1/1         1              1            8s

NAME                                 DESIRED     CURRENT        READY        AGE
replicaset.apps/velero-c67f8df7b     1           1              1            9s
```

4. Check Velero backup storage location details.

**Command**
```
velero get backup-location
```

**Sample Output**
```
NAME      PROVIDER   BUCKET/PREFIX       PHASE      LAST VALIDATED                 ACCESS MODE   DEFAULT
default   aws        kubevirtbackup2025  Available  2025-05-05 12:32:25 +0530 IST  ReadWrite     true
```

- **Add KubeVirt-Velero Plugin**

The KubeVirt-Velero plugin automates reliable backups of KubeVirt and CDI objects.

1. Add the plugin.

```
velero plugin add quay.io/kubevirt/kubevirt-velero-plugin:v0.2.0
```

2. Verify the plugin installation.

```
velero get plugins | grep kubevirt
```

## Backing Up a KubeVirt VM

1. Create a Velero backup object that includes the KubeVirt VM, CDI objects, and persistent volumes backed by OpenEBS.

```
velero backup create vm1backup1 --snapshot-volumes --include-namespaces=default --volume-snapshot-locations=default --storage-location=default --snapshot-move-data
```

2. Check Backup Status.

```
velero get backup vm1backup1
```

**Sample Output**

```
NAME        STATUS     ERRORS  WARNINGS  CREATED                         EXPIRES  STORAGE LOCATION  SELECTOR
vm1backup1  Completed  0       0         2025-05-05 13:36:09 +0530 IST    29d      default           <none>
```

3. After the backup is completed, delete the original VM (`vm1`) in the default namespace to demonstrate a successful restore.

```
kubectl delete vm vm1
```

**Sample Output**

```
virtualmachine.kubevirt.io "vm1" deleted
```

4. Delete the DataVolume.

```
kubectl delete datavolumes.cdi.kubevirt.io fedora-1
```

**Sample Output**

```
datavolume.cdi.kubevirt.io "fedora-1" deleted
```

:::note
When backing up a running virtual machine with the guest agent installed and the KubeVirt-Velero plugin enabled, Velero automatically executes backup hooks. These hooks freeze the guest file systems before the snapshot is taken and unfreeze them afterward, ensuring application-consistent snapshots. If the guest agent is not present, Velero performs a best-effort snapshot.
:::

## Restoring a KubeVirt VM

1. Create a new namespace to restore the virtual machine and associated resources.

```
kubectl create ns restoredvm
```

2. Create a Velero restore object.

```
velero restore create vm1restorenew --from-backup vm1backup1 --restore-volumes=true --namespace-mappings default:restoredvm
```

3. Check the `datadownload` status.

```
kubectl get datadownload -n velero
```

**Sample Output**

```
NAME                   STATUS     STARTED  BYTES DONE   TOTAL BYTES  STORAGE LOCATION  AGE  NODE
vm1restorenew-v56ft    Completed  71m      8342339584   8584674304   default           71m  node-0-347244
```

Once the restore completes, Velero recreates:

  - The KubeVirt virtual machine (vm1)
  - The associated DataVolume (fedora)
  - All dependent Kubernetes resources

These resources are restored into the restoredvm namespace.

## Verification of Restored Data

After the restore operation completes, verify that both the virtual machine and its data have been successfully recovered.

1. Connect to the restored virtual machine using the console.
2. Navigate to the root user’s home directory.
3. Verify the presence of the sample data that was created before the backup.

```
virtctl console vm1 -n restoredvm
```

**Sample Output**
```
Successfully connected to vm1 console. The escape sequence is ^]

vm1 login: root
Password:
Last login: Mon May  5 08:03:43 on ttyS0

[root@vm1 ~]# ls
sampledata  test1  test2

[root@vm1 ~]# cat sampledata
This is some sample data

[root@vm1 ~]# logout

Fedora Linux 40 (Cloud Edition)
Kernel 6.8.5-301.fc40.x86_64 on an x86_64 (ttyS0)

eth0: 10.244.1.45 fe80::3ce0:f7ff:fe1e:53c6
vm1 login:
```

This verification confirms that:

  - The virtual machine configuration was restored correctly.
  - The persistent storage contents were fully preserved.
  - The backup and restore workflow functions end-to-end as expected.

Validating restored data is a critical step, as it ensures that the Velero backup accurately captured the VM state along with its underlying persistent volumes.

## See Also

- [Replicated PV Mayastor Installation on OpenShift](../openebs-on-kubernetes-platforms/openshift.md)
- [Replicated PV Mayastor Installation on Talos](../openebs-on-kubernetes-platforms/talos.md)
- [Kasten Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/kasten-br-fs.md)
- [Velero Backup and Restore using Replicated PV Mayastor Snapshots - FileSystem](../backup-and-restore/velero-br-fs.md)