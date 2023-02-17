---
id: mayastor
title: Mayastor User Guide
keywords: 
 - Mayastor
description: Mayastor documentation is hosted and actively maintained at https://mayastor.gitbook.io/introduction/
---

### Install and Setup

:::warning
Mayastor is incompatible with NDM (openebs-ndm) and cStor (cstor). Installing or upgrading Mayastor with `--set mayastor.enabled=true` will either not deploy LocalPV Provisioner and NDM or will remove them (if they already exist).

However, installing Mayastor will not affect any preexisting LocalPV volumes.
:::

Before deploying and using Mayastor ensure that all of the [prerequisites](https://mayastor.gitbook.io/introduction/quickstart/prerequisites) are met.

- To install Mayastor in a new cluster using OpenEBS chart, execute:
  
```
helm repo add openebs https://openebs.github.io/charts
helm repo update
helm install openebs --namespace openebs openebs/openebs --set mayastor.enabled=true --create-namespace
```

Once the installation is complete, move to the next step: [configuring Mayastor](https://mayastor.gitbook.io/introduction/quickstart/configure-mayastor).


_For more information about Mayastor check out the [Mayastor documentation](https://mayastor.gitbook.io/introduction/)._