---
id: jiva-prerequisites
title: Jiva User Guide
keywords: 
  - Jiva User Guide
  - Jiva prerequisites
---


For details of how Jiva works, see [Jiva overview page](/concepts/jiva)

Jiva is a light weight storage engine that is recommended to use for low capacity workloads. The snapshot and storage management features of the other cStor engine are more advanced and is recommended when snapshots are a need. 

## Prerequisites

1. Kubernetes version 1.18 or higher.
2. iSCSI initiator utils installed on all the worker nodes<details>
<summary><i>(Click here to view commands to install iSCSI on different OS)</i></summary>
<table>
<tr>
 <th>OPERATING SYSTEM</th>
 <th>iSCSI PACKAGE</th>
 <th>Commands to install iSCSI</th>
 <th>Verify iSCSI Status</th>
</tr>
<tr>
 <td>RHEL/CentOS</td>
 <td>iscsi-initiator-utils</td>
 <td>
 <ul>
 <li>sudo yum install iscsi-initiator-utils -y</li>
<li>sudo systemctl enable --now iscsid</li>
<li>modprobe iscsi_tcp</li>
<li>echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf</li>
 <li>sudo systemctl status iscsid.service</li></ul></td>
 <td>sudo systemctl status iscsid.service</td>
</tr>
<tr>
 <td>Ubuntu/Debian</td>
 <td>open-iscsi</td>
 <td>
 <ul>
 <li>sudo apt install open-iscsi</li>
<li>sudo systemctl enable --now iscsid</li>
<li>modprobe iscsi_tcp</li>
<li>echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf</li></ul>
 </td>
 <td>sudo systemctl status iscsid.service</td>
</tr>
<tr>
 <td>RancherOS</td>
 <td>open-iscsi</td>
 <td>
 <ul>
 <li>sudo ros s enable open-iscsi</li>
 <li>sudo ros s up open-iscsi</li>
 </ul>
 </td>
 <td>ros service list iscsi</td>
</tr>
</table>
</details>
3. Access to install RBAC components into kube-system namespace.
4. OpenEBS localpv-hostpath version 2.6.0 or higher.
   ```
   kubectl apply -f  https://openebs.github.io/charts/hostpath-operator.yaml
   ```
  Sample hostpath storage class
   ```
   #Sample storage classes for OpenEBS Local PV
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      # hostpath type will create a PV by 
      # creating a sub-directory under the
      # BASEPATH provided below.
      - name: StorageType
        value: "hostpath"
      # Specify the location (directory) where
      # where PV(volume) data will be saved. 
      # A sub-directory with pv-name will be 
      # created. When the volume is deleted, 
      # the PV sub-directory will be deleted.
      #Default value is /var/openebs/local
      - name: BasePath
        value: "/var/openebs/local/"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
   ```



## See Also:

[Understanding Jiva](/concepts/jiva)

