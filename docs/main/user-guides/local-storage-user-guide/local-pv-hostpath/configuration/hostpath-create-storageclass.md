---
id: hostpath-create-storageclass
title: Create StorageClass(s)
keywords:
 - OpenEBS Local PV Hostpath
 - Local PV Hostpath Configuration
 - Configuration
 - Create StorageClass(s)
 - Create Local PV Hostpath StorageClass(s)
description: This guide will help you to create Local PV Hostpath StorageClass.
---

# Create StorageClass(s)

This document provides step-by-step instructions for creating a custom StorageClass for OpenEBS Local PV Hostpath. It explains how to create the StorageClass using a YAML definition and highlights the use of the default `openebs-hostpath` StorageClass.

:::important
You can skip this section if you would like to use the default OpenEBS Local PV Hostpath StorageClass created by OpenEBS.
:::

The default Storage Class is called `openebs-hostpath` and its `BasePath` is configured as `/var/openebs/local`. 

1. To create your own StorageClass with custom `BasePath`, save the following StorageClass definition as `local-hostpath-sc.yaml`

   ```
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: local-hostpath
     annotations:
       openebs.io/cas-type: local
       cas.openebs.io/config: |
         - name: StorageType
           value: hostpath
         - name: BasePath
           value: /var/local-hostpath
   provisioner: openebs.io/local
   reclaimPolicy: Delete
   volumeBindingMode: WaitForFirstConsumer
   ```
    ## (Optional) Custom Node Labeling

    In Kubernetes, Local PV Hostpath identifies nodes using labels such as `kubernetes.io/hostname=<node-name>`. However, these default labels might not ensure each node is distinct across the entire cluster. To solve this, you can make custom labels. As an admin, you can define and set these labels when configuring a **StorageClass**. Here's a sample storage class:

    ```
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: local-hostpath
      annotations:
        openebs.io/cas-type: local
        cas.openebs.io/config: |
          - name: StorageType
            value: "hostpath"
          - name: NodeAffinityLabels
            list:
              - "openebs.io/custom-node-unique-id"
    provisioner: openebs.io/local
    volumeBindingMode: WaitForFirstConsumer

    ```
    :::note 
    Using NodeAffinityLabels does not influence the scheduling of the application Pod. Use Kubernetes [Allowed Topologies](#restrict-volume-placement-using-allowed-topologies) to configure scheduling options.
    :::

2. Edit `local-hostpath-sc.yaml` and update with your desired values for `metadata.name` and `cas.openebs.io/config.BasePath`.

   :::note 
   If the `BasePath` does not exist on the node, *OpenEBS Dynamic Local PV Provisioner* will attempt to create the directory, when the first Local Volume is scheduled on to that node. You must ensure that the value provided for `BasePath` is a valid absolute path. 
   :::

3. Create OpenEBS Local PV Hostpath Storage Class. 
   ```
   kubectl apply -f local-hostpath-sc.yaml
   ```

4. Verify that the StorageClass is successfully created. 
   ```
   kubectl get sc local-hostpath -o yaml
   ```

## Restrict Volume Placement Using Allowed Topologies

By default, a Local PV Hostpath volume can be provisioned on any node in the cluster. If the `BasePath` is present on certain nodes only, then make use of topology to tell the list of nodes where the path is available. As shown in the below storage class, we can use `allowedTopologies` to provision volumes on the specified nodes only.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/local-hostpath"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
allowedTopologies:
- matchLabelExpressions:
  - key: kubernetes.io/hostname
    values:
      - worker-2
      - worker-3
```

The above storage class tells that the `BasePath` is available on nodes worker-2 and worker-3 only. Volumes of this StorageClass will be provisioned and scheduled on those nodes only.

Unlike `NodeAffinityLabels`, `allowedTopologies` also influences the scheduling of the application Pod.

To set `allowedTopologies` on the `openebs-hostpath` StorageClass created by the Helm chart, use the `localpv-provisioner.hostpathClass.allowedTopologies` value:

```yaml
localpv-provisioner:
  hostpathClass:
    allowedTopologies:
      - matchLabelExpressions:
          - key: kubernetes.io/hostname
            values:
              - worker-2
              - worker-3
```

Apply the updated values:

```bash
helm upgrade openebs openebs/openebs --namespace openebs -f values.yaml
```

## Support

If you encounter issues or have a question, file a [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also

- [Installation](../../../../quickstart-guide/installation.md)
- [Deploy an Application](hostpath-deployment.md)