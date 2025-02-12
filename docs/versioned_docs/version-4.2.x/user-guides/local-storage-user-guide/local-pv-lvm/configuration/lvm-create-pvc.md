---
id: lvm-create-pvc
title: Create PersistentVolumeClaim
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM
 - Configuration
 - Create StorageClass
 - Create a PersistentVolumeClaim
description: This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using the Local PV LVM storage class. 
---

# Create PersistentVolumeClaim

This document provides step-by-step instructions to create a PersistentVolumeClaim (PVC) using the Local PV LVM storage class. It explains how to define a PVC manifest with key attributes such as the storage class name, access modes, and storage size requirements.

By following the example provided, you can seamlessly request storage resources that are dynamically provisioned and managed by the LVM driver.

 ```
 $ cat pvc.yaml

kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: csi-lvmpv
spec:
  storageClassName: openebs-lvmpv
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4Gi
 ```

 Create a PVC using the storage class created for the LVM driver.

 ## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../lvm-installation.md)
- [Create StorageClass(s)](lvm-create-storageclass.md)
- [StorageClass Options](lvm-storageClass-options.md)
- [Deploy an Application](lvm-deployment.md)
