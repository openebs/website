---
id: redis
title: OpenEBS for Redis
keywords:
  - Redis
  - Inmemory Database
  - OpenEBS community
description: OpenEBS provides persistent volumes on the fly when Storage Managers are scaled up.
---

![OpenEBS and Redis](../assets/o-redis.svg)

## Introduction

Redis is an open source (BSD licensed), in-memory **data structure store**, used as a database, cache and message broker. Redis is deployed usually as a `StatefulSet` on Kubernetes and requires persistent storage for each instance of Redis Storage Manager instance. OpenEBS provides persistent volumes on the fly when Storage Managers are scaled up.

**Advantages of using OpenEBS for Redis:**

- No need to manage the local disks, they are managed by OpenEBS
- Large size PVs can be provisioned by OpenEBS and Redis
- Start with small storage and add disks as needed on the fly. Sometimes Redis instances are scaled up because of capacity on the nodes. With OpenEBS persistent volumes, capacity can be thin provisioned and disks can be added to OpenEBS on the fly without disruption of service
- Redis sometimes need highly available storage, in such cases OpenEBS volumes can be configured with 3 replicas.
- If required, take backup of the Redis data periodically and back them up to S3 or any object storage so that restoration of the same data is possible to the same or any other Kubernetes cluster

_Note: Redis can be deployed both as `Deployment` or as `StatefulSet`. When Redis deployed as `StatefulSet`, you don't need to replicate the data again at OpenEBS level. When Redis is deployed as `Deployment`, consider 3 OpenEBS replicas, choose the StorageClass accordingly._

## Deployment model

[![OpenEBS and Redis](../assets/redis-deployment.svg)](../assets/redis-deployment.svg)

## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/user-guides/installation). If OpenEBS is already installed, go to the next step.

2. **Configure cStor Pool**

   After OpenEBS installation, cStor pool has to be configured. If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/docs/deprecated/spc-based-cstor#creating-cStor-storage-pools). Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. During cStor Pool creation, make sure that the maxPools parameter is set to >=3. If cStor pool is already configured, go to the next step.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. Since Redis is a StatefulSet, it requires storage replication factor as 1. So cStor volume `replicaCount` is >=1. Sample YAML named **openebs-sc-disk.yaml** to consume cStor pool with cStor volume replica count as 1 is provided in the configuration details below.

4. **Launch and test Redis**

   Use stable Redis image with helm to deploy Redis in your cluster using the following command. In the following command, it will create a PVC with 8G size for data volume.

   ```
   helm install --set master.persistence.storageClass=openebs-cstor-disk stable/redis
   ```

   For more information on installation, see Redis [documentation](https://github.com/helm/charts/tree/master/stable/redis).

## Reference at [openebs.ci](https://openebs.ci/)

A live deployment of Redis using OpenEBS volumes as highly available data storage can be seen at the website [www.openebs.ci](https://openebs.ci/)

Deployment YAML spec files for Redis and OpenEBS resources are found [here](https://github.com/openebs/e2e-infrastructure/blob/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/redis-cstor/redis-statefulset.yaml)

[OpenEBS-CI dashboard of Redis](https://openebs.ci/redis-cstor)

## Post deployment Operations

**Monitor OpenEBS Volume size**

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Redis database alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/docs/deprecated/spc-based-cstor#monitor-pool).

## Configuration details

**openebs-config.yaml**

```yaml
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
    # NOTE - Appropriate disks need to be fetched using `kubectl get blockdevices -n openebs`
  #
  # `Block devices` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
  # Replace the following with actual disk CRs from your cluster `kubectl get blockdevices -n openebs`
  # Uncomment the below lines after updating the actual disk names.
  blockDevices:
    blockDeviceList:
# Replace the following with actual disk CRs from your cluster from `kubectl get blockdevices -n openebs`
#   - blockdevice-69cdfd958dcce3025ed1ff02b936d9b4
#   - blockdevice-891ad1b581591ae6b54a36b5526550a2
#   - blockdevice-ceaab442d802ca6aae20c36d20859a0b
```

**openebs-sc-disk.yaml**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "1"
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

## See Also:

[OpenEBS architecture](/docs/concepts/architecture) [OpenEBS use cases](/docs/introduction/usecases) [cStor pools overview](/docs/concepts/cstor#cstor-pools)
