---
id: kb
title: Knowledge Base
keywords: 
 - Knowledge base
 - OpenEBS Knowledge base
 - OpenEBS summary
 - Kubernetes StatefulSet
description: The knowledge base include summaries, manuals, troubleshooting guides, runbooks, and other information that users want or need to know.

---

<span id="top"></span>

### How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC {#reuse-pv-after-recreating-sts}

There are some cases where it had to delete the StatefulSet and re-install a new StatefulSet. In the process you may have to delete the PVCs used by the StatefulSet and retain PV policy by ensuring the Retain as the "Reclaim Policy". In this case, following are the procedures for re-using an existing PV in your StatefulSet application.

1. Get the PV name by following command and use it in Step 2.

   ```
   kubectl get pv
   ```

   Following is an example output

   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
   pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            Delete           Bound     default/mongo-persistent-storage-mongo-0   mongo-pv-az              9m
   ```  

2. Patch corresponding PV's reclaim policy from "Delete" to "Retain". So that PV will retain even its PVC is deleted.This can be done by using the steps mentioned [here](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/#why-change-reclaim-policy-of-a-persistentvolume).

   Example Output:

   ```shell hideCopy
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
   pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            Retain           Bound     default/mongo-persistent-storage-mongo-0   mongo-pv-az              9m
   ``` 

3. Get the PVC name by following command and note down the PVC name. You have to use this same PVC name while creating new PVC.

   ```
   kubectl get pvc
   ```

   Example Output:

   ```shell hideCopy
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Lost      pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   0                        mongo-pv-az    4s
   ```

4. Delete StatefulSet application and associated PVCs.

5. Create a new PVC YAML named *newPVC.yaml* with same configuration. Specify old PV name belongs to *volumeName* under the PVC spec.

   ```
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     annotations:
       pv.kubernetes.io/bind-completed: "yes"
       pv.kubernetes.io/bound-by-controller: "yes"
       volume.beta.kubernetes.io/storage-provisioner: openebs.io/provisioner-iscsi
     labels:
       environment: test
       openebs.io/replica-anti-affinity: vehicle-db
       role: mongo
     name: mongo-persistent-storage-mongo-0
     namespace: default
   spec:
     accessModes:
     - ReadWriteOnce
     resources:
       requests:
         storage: 5G
     storageClassName: mongo-pv-az
     volumeName: pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7
   status:
     accessModes:
     - ReadWriteOnce
     capacity:
       storage: 5G
   ```

6. Apply the modified PVC YAML using the following command

   ```
   kubectl apply -f newPVC.yaml
   ```

   Example Output:

   ```shell hideCopy
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Lost      pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   0                        mongo-pv-az    4s
   ```

7. Get the newly created PVC UID using `kubectl get pvc mongo-persistent-storage-mongo-0 -o yaml`.

8. Update the uid under the claimRef in the PV using the following command. The PVC will get attached to the PV after editing the PV with correct uid.

   ```
   kubectl edit pv pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7
   ```
9. Get the updated PVC status using the following command.

   ```
   kubectl get pvc
   ```

   Example Output:

   ```shell hideCopy
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Bound     pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            mongo-pv-az    5m
   ```

10. Apply the same StatefulSet application YAML. The pod will come back online by re-using the existing PVC. The application pod status can be get by following command.

  ```
  kubectl get pods -n <namespace>
  ```

### How to prevent container logs from exhausting disk space? {#enable-log-rotation-on-cluster-nodes}

Container logs, if left unchecked, can eat into the underlying disk space causing `disk-pressure` conditions
leading to eviction of pods running on a given node. This can be prevented by performing log-rotation
based on file-size while specifying retention count. One recommended way to do this is by configuring the
docker logging driver on the individual cluster nodes. Follow the steps below to enable log-rotation.


1. Configure the docker configuration file /etc/docker/daemon.json (create one if not already found) with the
log-options similar to ones shown below (with desired driver, size at which logs are rotated, maximum logfile
retention count and compression respectively):

   ```
   {
     "log-driver": "json-file",
     "log-opts": {
        "max-size": "400k",
        "max-file": "3",
        "compress": "true"
     }
   }
   ```

2. Restart the docker daemon on the nodes. This may cause a temporary disruption of the running containers and cause
the node to show up as `Not Ready` until the daemon has restarted successfully.

   ```
   systemctl daemon-reload
   systemctl restart docker
   ```

3. To verify that the newly set log-options have taken effect, the following commands can be used:

   * At a node-level, the docker logging driver in use can be checked via the following command:

     ```
     docker info
     ```

     The `LogConfig` section of the output must show the desired values:

     ```
      "LogConfig": {
      "Type": "json-file",
      "Config": {}
     ```

   - At the individual container level, the log options in use can be checked via the following command:

     ```
     docker inspect <container-id>
     ```

     The `LogConfig` section of the output must show the desired values:

     ```
      "LogConfig": {
             "Type": "json-file",
             "Config": {
                 "max-file": "3",
                 "max-size": "400k",
                 "compress": "true"
              }
      }      
     ```

4. To view the current and compressed files, check the contents of the `/var/lib/docker/containers/<container-id>/` directory. The symlinks at `/var/log/containers/<container-name>` refer to the above.

:::note

- The steps are common for Linux distributions (tested on CentOS, RHEL, Ubuntu).

- Log rotation via the specified procedure is supported by docker logging driver types: `json-file (default), local`.

- Ensure there are no dockerd cli flags specifying the `--log-opts` (verify via `ps -aux` or service definition
  files in `/etc/init.d` or `/etc/systemd/system/docker.service.d`). The docker daemon fails to start if an option
  is duplicated between the file and the flags, regardless their value.

- These log-options are applicable only to the containers created after the dockerd restart (which is automatically
  taken care by the kubelet).

- The `kubectl log` reads the uncompressed files/symlinks at `/var/log/containers` and thereby show rotated/rolled-over logs. If you would like to read the retained/compressed log content as well use `docker log` command on the nodes. Note that reading from compressed logs can cause temporary increase in CPU utilization (on account of decompression actions performed internally).

- The log-opt `compress: true:` is supported from Docker version: 18.04.0. The `max-file` and `max-size` opts are supported on earlier releases as well.
:::
