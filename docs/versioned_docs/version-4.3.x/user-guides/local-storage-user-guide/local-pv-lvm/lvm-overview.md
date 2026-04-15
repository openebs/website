---
id: lvm-overview
title: Local PV LVM Overview
keywords:
 - OpenEBS Local PV LVM
 - Local PV LVM Overview
 - Installation
 - Prerequisites
description: This section explains the overview of Local PV LVM.
---

OpenEBS Local PV LVM enables dynamic provisioning of persistent volumes backed by Logical Volume Manager (LVM) on the host system. It is suitable for environments that require volume management features like resizing, better disk abstraction, and performance isolation. LVM volumes are created from pre-configured volume groups on individual nodes, making this engine ideal for production-grade local storage use cases.

## Advantages

- Support for volume resizing – Increase capacity without recreating the volume.

- Better performance isolation – LVM provides storage boundaries per application.

- Dynamic provisioning from Volume Groups – Automates local volume creation.

- Suitable for production workloads – Leverages tried-and-tested LVM technology.

## Installation

Refer to the [OpenEBS Installation documentation](../../../quickstart-guide/installation.md) to install Local PV LVM.

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../quickstart-guide/installation.md)
- [Deploy an Application](../../../quickstart-guide/deploy-a-test-application.md)