---
id: hostpath-deployment
title: Deployment
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Deployment
 - Deployment
description: This section explains the deployment instructions for the OpenEBS Local Persistent Volumes (PV) backed by Hostpath. 
---

This section explains the deployment instructions for the OpenEBS Local Persistent Volumes (PV) backed by Hostpath.

## Deploy an Application

For deployment instructions, see [here](../../quickstart-guide/deploy-a-test-application.md).

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

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../quickstart-guide/installation.md)
- [Deploy an Application](../../quickstart-guide/deploy-a-test-application.md)