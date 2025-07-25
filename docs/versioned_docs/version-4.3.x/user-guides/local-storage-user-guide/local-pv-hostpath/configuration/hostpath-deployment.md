---
id: hostpath-deployment
title: Deploy an Application
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Deployment
 - Deploy an Application
description: This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by Hostpath. 
---

This section explains the instructions to deploy an application for the OpenEBS Local Persistent Volumes (PV) backed by Hostpath.

Refer to the [Deploy an Application documentation](../../../../quickstart-guide/deploy-a-test-application.md) for deployment instructions.

## Cleanup

Delete the Pod, the PersistentVolumeClaim and StorageClass that you might have created. 

```
kubectl delete pod hello-local-hostpath-pod
kubectl delete pvc local-hostpath-pvc
kubectl delete sc local-hostpath
```

Verify that the PV that was dynamically created is also deleted. 
```
kubectl get pv
```

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../hostpath-installation.md)
- [Create StorageClass(s)](hostpath-create-storageclass.md)