---
title: Atlassian Jira Deployment on OpenEBS
author: Abhishek
author_info: Abhishek is a Customer Success Engineer at Mayadata. He is currently working with Kubernetes and Docker.
tags: OpenEBS
date: 20-11-2020
excerpt: Learn how to deploy Atlassian Jira on OpenEBS in this short post.
--- 

***Jira*** Software is part of a family of products designed to help teams of all types manage work. Originally, **Jira** was designed as a bug and issue tracker. But today, **Jira** has evolved into a powerful work management tool for all kinds of use cases, from requirements and test case management to agile software development.

## Requirements

#### Install OpenEBS

If OpenEBS is not installed in your K8s cluster, this can be done from [here](https://docs.openebs.io/docs/next/installation.html). If OpenEBS is already installed, go to the next step.

#### Configure cStor Pool

If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](https://docs.openebs.io/docs/next/ugcstor.html#creating-cStor-storage-pools). Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided:

```
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
#   - blockdevice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
#   - blockdevice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
#   - blockdevice-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

---
```

#### Create Storage Class

You must configure a StorageClass to provision cStor volume on the cStor pool. In this solution, we are using a StorageClass to consume the cStor Pool, which is created using external disks attached to the Nodes. Since Jira is a deployment application, it requires three replications at the storage level. So cStor volume replicaCount is 3. Sample YAML named **openebs-sc-disk.yaml** to consume cStor pool with cStor volume replica count as 3 is provided:

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
        value: "3"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
```

### Deployment of Jira

Sample Jira Yaml:

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  labels:
    app: jira
  name: jira
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: jira
      name: jira
    spec:
      containers:
        - name: jira
          image: "doriftoshoes/jira:7.3.6"
          resources:
            requests:
              cpu: "2"
              memory: "2G"
          volumeMounts:
            - name: "jira-home"
              mountPath: /opt/jira-home
      volumes:
        - name: jira-home
          persistentVolumeClaim:
            claimName: demo-vol1-claim
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: jira
  name: jira
spec:
  ports:
    - port: 8080
      targetPort: 8080
  selector:
    app: jira
  type: LoadBalancer
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10G
```

Next, apply both the ***Jira deployment*** and service to your Kubernetes cluster.

```
kubectl apply -f jira.yaml
```

#### Verify Jira Pods:

#### Run the following to get the status of Jira pods:

```
kubectl get pods
```

Following is an example output:

```
NAME                    READY   STATUS    RESTARTS   AGE
jira-5xxxxxxxx-2xxxx    1/1     Running   0          1d12h
```

That's it for today's blog. Thanks for reading. Please leave your questions or feedback, if any, in the comment section below.