---
id: upgrade
title: Upgrading OpenEBS
keywords:
 - Upgrading OpenEBS
 - OpenEBS upgrade
 - Supported upgrade paths
description: Upgrade to the latest OpenEBS 2.11.0 version is supported only from v1.0.0 and later.
---

Latest stable version of OpenEBS is 3.10.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/v3.10.0).

Upgrade to the latest cStor or Jiva version is supported only from 1.12.0 or later. The steps for upgrading can be found [here](https://github.com/openebs/upgrade/blob/develop/docs/upgrade.md).

:::note
- The community e2e pipelines verify upgrade testing only from non-deprecated releases (1.12 and higher) to 3.4.0. If you are running on release older than 1.12, OpenEBS recommends you upgrade to the latest version as soon as possible. 
- OpenEBS has deprecated arch specific container images in favor of multi-arch container images. After 2.6, the arch specific images are not pushed to Docker or Quay repositories. For example, images like `cstor-pool-arm64:2.8.0` should be replaced with corresponding multi-arch image `cstor-pool:2.8.0`. For further queries or support, please reach out to [OpenEBS Community](https://kubernetes.slack.com/archives/CUAKPFU78) for helping you with the upgrade.
- If you are upgrading Jiva volumes that are running in version 1.6 and 1.7, you must use these [pre-upgrade steps](https://github.com/openebs/charts/tree/gh-pages/scripts/jiva-tools) to check if your jiva volumes are impacted by [#2956](https://github.com/openebs/openebs/issues/2956). If they are, please reach out to [OpenEBS Community](https://kubernetes.slack.com/archives/CUAKPFU78) for helping you with the upgrade.
:::

## Mayastor upgrade

Upgrade for Mayastor is supported from v2.0.x to v2.1.0 and above. Before we get into the upgrade documentation for Mayastor, it is important that we understand that there are two ways of deploying Mayastor (since v2.0.0) on to a kubernetes cluster -- the ['mayastor' helm chart](https://github.com/openebs/mayastor-extensions/tree/develop/chart) and the ['openebs' helm chart](https://github.com/openebs/charts/tree/main/charts/openebs). The upgrade instructions differ for these two deployment strategies. The first step of the upgrade is to identify the helm chart that you have used to deploy Mayastor. If you are using the Mayastor with the openebs helm chart, then the instructions for upgrading the mayastor helm chart do not apply to you.

### Identifying the helm chart

You'll need the helm v3 binary to be on your $PATH. Execute the following command to check if you have helm v3:
```
$ helm version --short
v3.9.4+gdbc6d8e
```

Execute the following command to list the helm releases on the namespace where Mayastor is installed:
```
$ helm list -n openebs
NAME            	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART        	APP VERSION
openebs-mayastor	openebs  	1       	2023-05-26 22:03:15.473035 +0530 IST	deployed	openebs-3.6.0	3.6.0   
```
If the value of the 'CHART' column in the row which contains the helm chart for Mayastor, in the output of the above command, reads 'openebs-...', then your Mayastor deployment uses the openebs helm chart. If the CHART column instead reads 'mayastor-...', then it makes use of the mayastor helm chart.
[Click here if your Mayastor deployment uses the 'mayastor' helm chart](https://mayastor.gitbook.io/introduction/additional-information/upgrade).

Continue down this page if your Mayastor deployment uses the 'openebs' helm chart.

### Upgrading Mayastor installed from the openebs helm chart

#### 1. Planning the upgrade
Supported upgrade paths for Mayastor, installed with the openebs chart, are...
Source versions: 3.4.x or above
Target versions: 3.7.y or above
All source versions may upgrade to any of the target versions, so long as the release semver of the target version is greater than that of the source version.

To check for the latest released version of Mayastor available with the openebs helm chart, execute the following commands -- `helm repo update`, `helm search repo openebs --version ">a.b.c"`, where a.b.c is your source version, i.e. the version installed on your cluster. E.g.:
```
$ helm repo update openebs             
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "openebs" chart repository
Update Complete. ⎈Happy Helming!⎈

$ helm search repo openebs --version ">3.5.0"
NAME           	CHART VERSION	APP VERSION	DESCRIPTION                                  
openebs/openebs	3.7.0        	3.7.0      	Containerized Attached Storage for Kubernetes
```

If you want to list all of the versions available for upgrade, execute the following commands:
```
$ helm repo update openebs             
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "openebs" chart repository
Update Complete. ⎈Happy Helming!⎈

$ # Assuming source version of 3.5.0
$ helm search repo openebs --version ">3.5.0,>=3.7.0" -l
NAME           	CHART VERSION	APP VERSION	DESCRIPTION                                  
openebs/openebs	3.7.0        	3.7.0      	Containerized Attached Storage for Kubernetes
```
Pick one from the listed version(s).

#### 2. Building the `helm upgrade` command
The openebs helm chart embeds in to itself all of the OpenEBS storage engines. If you are using more than one of the openebs helm chart's storage engines (e.g. using localpv-provisioner alongside mayastor), then you'd have to include the upgrade options for those storage engines as well into the helm upgrade command.

Going forward, this turtorial assumes that your helm chart release-name is  'openebs-mayastor', that it is installed in the 'openebs' namespace of the kubernetes cluster, it has a source version of 3.6.0 and the target version for the upgrade is 3.7.0.

Execute this shell script/command to get the version of mayastor helm subchart that a particular openebs chart uses:
```
$ # Using 3.7.0 for the input version of the
$ IMG_TAG=$(helm show chart openebs/openebs --version 3.5.0 | grep "name: mayastor" -A 2 | tail -n 1 | tr -d " " | sed -e s/version:/v/)
$ echo $IMG_TAG
v2.2.0
```
The image tag on a released mayastor chart is the value of the chart version, with a 'v' prefix. The above command displays the output after adding the 'v' prefix.

The helm upgrade command with the default options (and using variable from above) should look something like this:
```
helm upgrade openebs openebs/openebs -n openebs --version 3.7.0 --set mayastor.image.tag=$IMG_TAG --set release.version=3.7.0 --reuse-values
```
Refer to the documentation at to see all of the available configuration options:
- https://github.com/openebs/mayastor-extensions/blob/<release-tag\>/chart/README.md
- https://github.com/openebs/mayastor-extensions/blob/<release-tag\>/chart/values.yaml
(e.g.: https://github.com/openebs/mayastor-extensions/blob/v2.2.0/chart/README.md, https://github.com/openebs/mayastor-extensions/blob/v2.2.0/chart/values.yaml)
Prefix any option you'd want to set using the '--set' option, with 'mayastor', like shown in the default command above for the 'image.tag' option. This is due to the mayastor chart being a [subchart of the openebs chart](https://github.com/openebs/charts/blob/openebs-3.7.0/charts/openebs/values.yaml#L400).

Because the mayastor chart is in active development, its helm chart values options may change over time and the convenience of the '--reuse-values' flags may also introduce nil yaml values for values which are required by helm's template engine. The 3.4.0, 3.4.1 and 3.5.0 releases face this issue. These releases require additional options to perform the default upgrade to 3.7.0 or above versions.
Sample helm upgrade command from 3.4.0 to 3.7.0 or above versions:
```
helm upgrade openebs-mayastor openebs/openebs -n openebs --version 3.7.0 --set mayastor.image.tag=$IMG_TAG --set release.version=3.7.0 --reuse-values \
        --set mayastor.image.pullPolicy="IfNotPresent" \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.io_engine.logLevel="info"
```

Sample helm upgrade command from 3.4.1 to 3.7.0 or above versions:
```
helm upgrade openebs-mayastor openebs/openebs -n openebs --version 3.7.0 --set mayastor.image.tag=$IMG_TAG --set release.version=3.7.0 --reuse-values \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.io_engine.logLevel="info"
```

Sample helm upgrade command from 3.5.0 to 3.7.0 or above versions:
```
helm upgrade openebs-mayastor openebs/openebs -n openebs --version 3.7.0 --set mayastor.image.tag=$IMG_TAG --set release.version=3.7.0 --reuse-values \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.image.repoTags.controlPlane="" \
        --set mayastor.image.repoTags.controlPlane=""
```
The release versions 3.6.0 and above do not require special options to upgrade to 3.7.0 or above versions. The default upgrade command, should work here:
```
helm upgrade openebs-mayastor openebs/openebs -n openebs --version 3.8.0 --set mayastor.image.tag=$IMG_TAG --set release.version=3.8.0 --reuse-values
```

Visit the mayastor chart configuration for more configuration options.
Add the options for the other storage engines (if any) to this command.

:::note
It is a good idea to throw in the `--atomic` helm upgrade flag, so that the cluster may be reinstated to its source version, in case the upgrade to the target version fails. E.g.:
```
helm upgrade openebs-mayastor openebs/openebs -n openebs --version 3.8.0 --set mayastor.image.tag=$IMG_TAG --set release.version=3.8.0 --reuse-values --atomic
```
:::

#### 3. Execute the helm upgrade command

Execute the helm upgrade command. Proceed if and only if the command succeeds and all of the Mayastor Pods are ready. Check for Pod status using `kubectl get pods -n openebs`

#### 4. Follow the upgrade instructions for the mayastor helm chart

Follow the upgrade instruction for the mayastor helm chart -> [https://mayastor.gitbook.io/introduction/additional-information/upgrade](https://mayastor.gitbook.io/introduction/additional-information/upgrade).

## Supported upgrade paths

To upgrade to the latest version from your current version, you have to follow the below upgrade path.
- From 1.12.0 and higher to 3.6.0 - Get the steps from [here](https://github.com/openebs/upgrade/blob/develop/docs/upgrade.md).


## See Also:

[See Release Notes](/introduction/releases) [Join our Community](/introduction/community) [Checkout Troubleshooting guides](/troubleshooting)
