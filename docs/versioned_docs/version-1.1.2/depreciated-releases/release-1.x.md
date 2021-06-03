---
sidebar_position: 1
---

# OpenEBS 1.x Deprecated Releases

## 1.7.0 - Feb 15 2020

Change summary:

- Fixes an issue where Jiva Replicas could get stuck in WO or NA state, when the size of the replica data grows beyond 300GB.

- Fixes an issue where unused custom resources from older versions are left in the etcd, even after openebs is upgraded.

- Fixes an issue where cleanup of Jiva volumes on OpenShift 4.2 environment was failing.

- Fixes an issue where custom resources used by cStor Volumes fail to get deleted when the underlying pool was removed prior to deleting the volumes.

- Fixes an issue where a cStor Volume Replica would be incorrectly marked as invalid due to a race condition caused between a terminating and its corresponding newly launched pool pods.
