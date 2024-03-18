---
id: backupandrestore
title: Backup and Restore
keywords: 
 - Backup
 - Restore
 - Backup and Restore
description: This section explains how to backup and restore local engines.
---

## Backup and Restore

OpenEBS Local Volumes can be backed up and restored along with the application using [Velero](https://velero.io).

:::note
The following steps assume that you already have Velero with Restic integration is configured. If not, follow the [Velero Documentation](https://velero.io/docs/) to proceed with install and setup of Velero.  If you encounter any issues or have questions, talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).
:::

### Backup

The following steps will help you to prepare and backup the data from the volume created for the example pod (`hello-local-hostpath-pod`), with the volume mount (`local-storage`). 

1. Prepare the application pod for backup. Velero uses Kubernetes labels to select the pods that need to be backed up. Velero uses annotation on the pods to determine which volumes need to be backed up. For the example pod launched in this guide, you can inform Velero to backup by specifying the following label and annotation. 
   
   ```
   kubectl label pod hello-local-hostpath-pod app=test-velero-backup
   kubectl annotate pod hello-local-hostpath-pod backup.velero.io/backup-volumes=local-storage
   ```
2. Create a Backup using Velero. 

   ```
   velero backup create bbb-01 -l app=test-velero-backup
   ```

3. Verify that backup is successful. 

   ```
   velero backup describe bbb-01 --details
   ```

   On successful completion of the backup, the output of the backup describe command will show the following:
   ```shell hideCopy
   ...
   Restic Backups:
     Completed:
       default/hello-local-hostpath-pod: local-storage
   ```
 
### Restore

1. Install and Setup Velero, with the same provider where backups were saved. Verify that backups are accessible. 
   
   ```
   velero backup get
   ```
   
   The output of should display the backups that were taken successfully. 
   ```shell hideCopy
   NAME     STATUS      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
   bbb-01   Completed   2020-04-25 15:49:46 +0000 UTC   29d       default            app=test-velero-backup
   ```

2. Restore the application. 

   :::note
   Local PVs are created with node affinity. As the node names will change when a new cluster is created, create the required PVC(s) prior to proceeding with restore.
   :::
   
   Replace the path to the PVC yaml in the below commands, with the PVC that you have created. 
   ```
   kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pvc.yaml
   velero restore create rbb-01 --from-backup bbb-01 -l app=test-velero-backup
   ```

3. Verify that application is restored.

   ```
   velero restore describe rbb-01
   ```
   
   Depending on the data, it may take a while to initialize the volume. On successful restore, the output of the above command should show:
   ```shell hideCopy
   ...
   Restic Restores (specify --details for more information):
     Completed:  1
   ```
   
4. Verify that data has been restored. The application pod used in this example, write periodic messages (greetings) to the volume. 

   ```
   kubectl exec hello-local-hostpath-pod -- cat /mnt/store/greet.txt
   ```
   
   The output will show that backed up data as well as new greetings that started appearing after application pod was restored. 
   ```shell hideCopy
   Sat Apr 25 15:41:30 UTC 2020 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
   Sat Apr 25 15:46:30 UTC 2020 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
   Sat Apr 25 16:11:25 UTC 2020 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
   ```
