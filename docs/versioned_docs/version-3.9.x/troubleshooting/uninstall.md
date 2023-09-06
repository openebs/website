---
id: uninstall
title: Troubleshooting OpenEBS - Uninstall
keywords:
  - OpenEBS
  - OpenEBS uninstallation
  - OpenEBS uninstallation troubleshooting
description: This page contains a list of OpenEBS uninstallation related troubleshooting information.
---

## General guidelines for troubleshooting

- Contact [OpenEBS Community](/docs/introduction/community) for support.
- Search for similar issues added in this troubleshooting section.
- Search for any reported issues on [StackOverflow under OpenEBS tag](https://stackoverflow.com/questions/tagged/openebs)

## Uninstall

[Whenever a Jiva PVC is deleted, a job will created and status is seeing as `completed`](#jiva-deletion-scrub-job)

[cStor Volume Replicas are not getting deleted properly](#cvr-deletion)

### Whenever a Jiva based PVC is deleted, a new job gets created.{#jiva-deletion-scrub-job}

As part of deleting the Jiva Volumes, OpenEBS launches scrub jobs for clearing data from the nodes. This job will be running in OpenEBS installed namespace. The completed jobs can be cleared using following command.

```
kubectl delete jobs -l openebs.io/cas-type=jiva -n <openebs_namespace>
```

In addition, the job is set with a TTL to get cleaned up, if the cluster version is greater than 1.12. However, for the feature to work, the alpha feature needs to be enabled in the cluster. More information can be read from [here](https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/#clean-up-finished-jobs-automatically).

### cStor Volume Replicas are not getting deleted properly{#cvr-deletion}

Sometimes, there are chances that cStor volumes Replicas (CVR) may not be deleted properly if some unforeseen scenarios happened such as network loss during the deletion of PVC. To resolve this issue, perform the following command.

```
kubectl edit cvr <cvr_name> -n openebs
```

And then remove finalizers from the corresponding CVR. Need to remove following entries and save it.

```shell hideCopy
finalizers:
- cstorvolumereplica.openebs.io/finalizer
```

This will automatically remove the pending CVR and delete the cStor volume completely.

## See Also:

[FAQs](/docs/additional-info/faqs) [Seek support or help](/docs/introduction/community) [Latest release notes](/docs/introduction/releases)
