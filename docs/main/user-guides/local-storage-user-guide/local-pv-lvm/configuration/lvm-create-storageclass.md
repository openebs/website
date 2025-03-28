---
id: lvm-create-storageclass
title: Create StorageClass(s)
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Configuration
 - Create StorageClass(s)
 - Create Local PV LVM StorageClass(s)
description: This guide will help you to create Local PV LVM StorageClass.
---

# Create StorageClass(s)

This document provides step-by-step instructions on creating a custom StorageClass for Local PV LVM, including detailed explanations of supported parameters and their usage. It covers standard and LVM-specific parameters, their development status, E2E test coverage, and how to configure scheduling logic like SpaceWeighted, CapacityWeighted, or VolumeWeighted.

```
$ cat sc.yaml

apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-lvmpv
parameters:
  storage: "lvm"
  volgroup: "lvmvg"
provisioner: local.csi.openebs.io
```

Refer [Storage Classes](https://github.com/openebs/lvm-localpv/blob/develop/docs/storageclasses.md) to know all the supported parameters for Local PV LVM.

## StorageClass Parameters Conformance Matrix

The following matrix shows standard StorageClass parameters for Local PV LVM.

### Standard StorageClass Parameters

<table>
<tbody>
  <tr>
    <th> Parameter </th>
    <th colSpan={2}> Values </th>
    <th> Development Status </th>
    <th> E2E Coverage </th>
  </tr>
  <tr>
    <td rowSpan={2}> <a href="#allowvolumeexpansion-optional"> allowVolumeExpansion </a> </td>
    <td> true </td>
    <td> Supported </td>
    <td rowSpan={2}> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/functional/lvm-volume-resize#about-this-experiment"> Yes </a> <br></br><i> (Test coverage exist for ext4 & xfs) </i> </td>
  </tr>
  <tr>
    <td> false </td>
    <td> Supported </td>
  </tr>
  <tr>
    <td> <a href="#mountoptions-optional"> MountOptions </a> </td>
    <td> Options supported by filesystem </td>
    <td> Supported </td>
    <td> Pending </td>
  </tr>
  <tr>
    <td rowSpan={2}> <a href="#volumebindingmode-optional"> VolumeBindingMode </a> </td>
    <td> Immediate </td>
    <td> Supported </td>
    <td rowSpan={2}> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/functional/lvmpv-custom-topology#readme"> Yes  </a> </td>
  </tr>
  <tr>
    <td> WaitForFirstConsumer </td>
    <td> Supported </td>
  </tr>
  <tr>
    <td rowSpan={2}> <a href="#reclaim-policy-optional"> Reclaim Policy </a> </td>
    <td>  Retain </td>
    <td> Supported </td>
    <td rowSpan={2}> <a href="https://github.com/openebs/lvm-localpv/blob/HEAD/e2e-tests/apps/percona/deployers/run_e2e_test.yml"> Yes </a> <br></br> <i> (Test coverage exist for Delete reclaim policy) </i> </td>
  </tr>
  <tr>
    <td> Delete </td>
    <td> Supported </td>
  </tr>
  <tr>
    <td> <a href="#storageclass-with-custom-node-labels"> allowedTopologies </a> </td>
    <td> - </td>
    <td> Supported </td>
    <td> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/functional/lvmpv-custom-topology#readme"> Yes </a> </td>
  </tr>
  <tr>
    <td rowSpan={6}> Parameters </td>
    <td> <a href="https://kubernetes-csi.github.io/docs/secrets-and-credentials-storage-class.html#examples"> Passing Secrets </a></td>
    <td> No Use Case </td>
    <td> NA </td>
  </tr>
  <tr>
    <td rowSpan={5}> <a href="#fstype-optional"> fsType </a> </td>
    <td>ext2</td>
    <td rowSpan={5}> Supported </td>
    <td rowSpan={5}> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/functional/lvm-controller-high-availability#readme"> Yes </a> <br></br> <i> (Test coverage exist for ext4 & xfs) </i> </td>
  </tr>
  <tr><td> ext3 </td></tr>
  <tr><td> ext4 </td></tr>
  <tr><td> xfs </td></tr>
  <tr><td> btrfs </td></tr>
</tbody>
</table>

### LVM Supported StorageClass Parameters

<table>
<tbody>
  <tr>
    <th> Parameter </th>
    <th colSpan={2}> Values </th>
    <th> Development Status </th>
    <th> E2E Coverage </th>
  </tr>
  <tr>
    <td rowSpan={6}> Parameters </td>
    <td> <a href="#shared-optional"> shared </a></td>
    <td> yes </td>
    <td> Supported </td>
    <td> <a href="https://github.com/openebs/lvm-localpv/tree/HEAD/e2e-tests/experiments/functional/lvmpv-shared-mount#readme"> Yes </a> </td>
  </tr>
  <tr>
    <td> <a href="#vgpattern-must-parameter-if-volgroup-is-not-provided-otherwise-optional"> vgpattern </a></td>
    <td> Regular expression of volume group name </td>
    <td> Supported </td>
    <td> Yes </td>
  </tr>
  <tr>
    <td> <a href="#volgroup-must-parameter-if-vgpattern-is-not-provided-otherwise-optional"> volgroup </a></td>
    <td> Name of volume group </td>
    <td> Supported </td>
    <td> <a href="https://github.com/openebs/lvm-localpv/blob/HEAD/e2e-tests/experiments/lvm-localpv-provisioner/openebs-lvmsc.j2"> Yes </a> </td>
  </tr>
  <tr>
    <td> <a href="#thinprovision-optional"> thinProvision </a></td>
    <td> yes </td>
    <td> Supported </td>
    <td> Yes </td>
  </tr>
  <tr>
    <td> <a href="#scheduler"> scheduler </a></td>
    <td> SpaceWeighted or CapacityWeighted or VolumeWeighted </td>
    <td> Supported </td>
    <td> Pending </td>
  </tr>
</tbody>
</table>

### StorageClass with Scheduler Parameters

The Local PV LVM Driver supports three types of scheduling logic: SpaceWeighted, VolumeWeighted, and CapacityWeighted (Supported from lvm-driver: v0.9.0).

Add the scheduler parameter in storage class and give its value accordingly.

```
parameters:
  storage: "lvm"
  volgroup: "lvmvg" 
  scheduler: "CapacityWeighted" ## or "VolumeWeighted"
```

SpaceWeighted is the default scheduler in the Local PV LVM driver, so even if we do not use the scheduler parameter in storageclass, the driver will pick the node where there is a vg with the highest free space adhering to the volgroup/vgpattern parameter.

If CapacityWeighted scheduler is used, then the driver will pick the node containing vg that has the least allocated storage in terms of capacity.

If VolumeWeighted scheduler is used, then the driver will pick the node containing vg (adhering to vgpattern/volgroup parameter) that has the least number of volumes provisioned on it.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../lvm-installation.md)
- [StorageClass Options](lvm-storageClass-options.md)
- [Create PersistentVolumeClaim](lvm-create-pvc.md)
- [Deploy an Application](lvm-deployment.md)
