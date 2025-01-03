---
id: uninstall
title: Uninstalling OpenEBS
keywords:
 - Uninstalling OpenEBS
 - Uninstall OpenEBS
description: This section is to describe about the graceful deletion/uninstallation of your OpenEBS cluster.
---

This section describes about the graceful deletion/uninstallation of your OpenEBS cluster.

## Prerequisites

It is expected that the following prerequisites are met before uninstalling OpenEBS:

1. Volumes are cleaned up
2. Pools are cleaned up

:::warning
If the prerequisites are not met, there might be some troubles/errors while uninstalling OpenEBS as the finalizers and other protection rules are imposed by the engine.
:::

## Uninstalling OpenEBS using Helm

Run the following command to uninstall OpenEBS:

```
helm uninstall openebs -n <OPENEBS_NAMESPACE>
```

:::note
Uninstalling the Helm chart does not remove/uninstall the CustomResourceDefinitions (CRDs).

```
diskpools.openebs.io
volumesnapshotclasses.snapshot.storage.k8s.io
volumesnapshotcontents.snapshot.storage.k8s.io
volumesnapshots.snapshot.storage.k8s.io
```
:::

## See Also

- [Installation](../quickstart-guide/installation.md)
- [Deployment](../quickstart-guide/deploy-a-test-application.md)
- [Release Notes](../releases.md)
- [Troubleshooting](../troubleshooting/troubleshooting-local-storage.md)
- [Join our Community](../community.md)
- [FAQs](../faqs/faqs.md)