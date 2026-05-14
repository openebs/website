---
id: zfs-overview
title: Local PV ZFS Overview
keywords:
 - OpenEBS Local PV ZFS
 - Local PV ZFS Overview
 - Installation
 - Prerequisites
description: This section explains the overview of Local PV ZFS.
---

OpenEBS Local PV ZFS leverages the ZFS file system for managing persistent volumes. It offers advanced features such as compression, snapshots, and data integrity checks, making it a powerful choice for applications that require data reliability and volume management capabilities. Volumes are provisioned from ZFS datasets configured on each node, providing high performance along with ZFS's rich data services.

## Advantages

- Built-in data integrity checks – Detect and correct silent data corruption.

- Snapshots and clones – Easily create point-in-time copies for backup/testing.

- Compression and deduplication – Optimize storage efficiency.

- Resilience and fault tolerance – ZFS is known for robust data protection.

- Ideal for databases and critical stateful apps – Offers enterprise-grade storage features.

## Installation

Refer to the [OpenEBS Installation documentation](../../../quickstart-guide/installation.md) to install Local PV ZFS.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)
