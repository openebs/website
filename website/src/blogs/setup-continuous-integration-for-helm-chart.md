---
title: Setup Continuous Integration for Helm chart
author: Intakhab Ali
author_info: Software Engineer at MayaData
date: 05-02-2020
tags: Helm, OpenEBS, Tutorials, Kubernetes
excerpt: In this blog, we'll set up a continuous integration of the Helm chart. We'll package the Helm chart with the help of CI tools & push them to chart registry.
---

[Helm](https://www.helm.sh/) is a package manager for Kubernetes that allows developers and operators to easily package, configure, and deploy applications and services onto Kubernetes clusters.

Helm is now an official Kubernetes project and is part of the[ Cloud Native Computing Foundation](https://www.cncf.io/), a non-profit Linux Foundation that supports Open Source projects in and around the Kubernetes ecosystem.

In this tutorial, we will set up a continuous integration of the Helm chart. We will package the Helm chart with the help of CI tools like (Travis, Jenkins), and push it to chart registries like (Harbor, Chartmuseum).

## Prerequisites:

- Registry to store Helm like Harbor or Chartmuseum
- Understanding of Helm and any of the CI platforms (Travis, Jenkins, circle, CI)
- A Git repository to maintain version control of helm chart

**I am going to use Travis as a CI platform and Harbor as a Helm registry to host the helm.**

**As I choose Travis here, .travis.yml consists of the job lifecycle. Let’s write job cycle for the helm chart.**

### Lifecycle 1:

Choose the base language as Python

    ---
    language: python

We need to have some environment variables so that we can update whenever there’s a new version of the Helm release or change of the registry URL.

Here is the list of a variable that we’ll need:

***HELM_URL=[https://storage.googleapis.com/kubernetes-helm](https://storage.googleapis.com/kubernetes-helm) (this is the URL where we can download the helm package)***

***HELM_TGZ=helm-v2.4.2-linux-amd64.tar.gz (this is the Helm tar filename)***

***REPO_DIR=/home/travis/build/inyee786/test-helm (this is the path where Travis keep Git folder)***

***YAMLLINT_VERSION=1.8.1 (this is yamllint version which is used to check lint of file)***

***HARBOR_CHART_URL=https://harbor-test.mayadata.io/chartrepo (change this according to your chart registry url{harbor or Chartmuseum}***

***HARBOR_PROJECT_NAME=maya (this is the Harbor project name, where we will store the chart)***

***CHART_FOLDER=charts (this is the folder name, where we can keep the Helm charts)***

It looks like this

    env:
     global:
       - HELM_URL=https://storage.googleapis.com/kubernetes-helm
       - HELM_TGZ=helm-v2.4.2-linux-amd64.tar.gz
       - REPO_DIR=/home/travis/build/inyee786/test-helm
       - YAMLLINT_VERSION=1.8.1
       - HARBOR_CHART_URL=https://harbor-
    test.mayadata.io/chartrepo
       - HARBOR_PROJECT_NAME=maya
       - CHART_FOLDER=charts

We need some private variables, where we can store the credentials and push it to the Helm registry (Harbor has an excellent feature where we can have bot user, and you can use the bot credential). All we have to feed is-

    HARBOR_USERNAME:
    HARBOR_PASSWORD:

Inside Travis, go to (****settings > Environment Variables****) to set the private env

![Environment variables](/images/blog/environment-variables.png)

### Lifecycle 2 :

Install the Prerequisites to Set up a CI environment to build and check the YAML lint.

Download helm and ****untar**** the chart after downloading

- wget ${HELM_URL}/${HELM_TGZ}
- tar xzfv ${HELM_TGZ}
- PATH=`pwd`/linux-amd64/:$PATH

Initialize the helm client and update the helm repo

- Helm init — client-only
- Helm repo update

Install helm plugin to push chart on the registry

- Helm plugin install[ https://github.com/chartmuseum/helm-push](https://github.com/chartmuseum/helm-push) — version v0.7.1

Install yamllint python package to check the lint

- sudo pip install yamllint==”${YAMLLINT_VERSION}”

It looks like the below config

    install:
    # Installing Helm
     - wget ${HELM_URL}/${HELM_TGZ}
     - tar xzfv ${HELM_TGZ}
     - PATH=`pwd`/linux-amd64/:$PATH
     - helm init --client-only
     # helm plugin to push helm chart
     - helm plugin install https://github.com/chartmuseum/helm-
    push --version v0.7.1
     # Installing pip deps
     - sudo pip install yamllint=="${YAMLLINT_VERSION}"
     - helm repo update

### Lifecycle 3 :

Before going further to build a chart, we need to run some script to check the lint in the chart and Travis file. It is a good practice to check the lint

Check the Helm lint of all Helm chart

- For dir in `ls ${REPO_DIR}/${CHART_FOLDER}`; do
helm lint ${REPO_DIR}/${CHART_FOLDER}/$dir
if [ $? != 0 ]; then
travis_terminate 1
fi

To check the YAML lint for travis.yml, chart.yaml and value.yaml, we use the yamllint python package. We need the rule to check the lint.

- yamllint -c .yamllint.yml -s .travis.yml .yamllint.yml
- yamllint -c .yamllint.yml -s $(find . -type f -name “Chart.yaml”)
- yamllint -c .yamllint.yml -s $(find . -type f -name “values.yaml”)

The script section should look like the below config

    script:
      # Check charts format
      - >
         for dir in `ls ${REPO_DIR}/${CHART_FOLDER}`; do
          helm lint ${REPO_DIR}/${CHART_FOLDER}/$dir
          if [ $? != 0 ]; then
           travis_terminate 1
          fi
         done
      # Check YAML styling
      - yamllint -c .yamllint.yml -s .travis.yml .yamllint.yml
      - yamllint -c .yamllint.yml -s $(find . -type f -name "Chart.yaml")
      - yamllint -c .yamllint.yml -s $(find . -type f -name "values.yaml")

Here comes the interesting part where we are going to build and package the chart.

****Lifecycle 4:****

It’s better to build and push when we merge the chart in the **master** branch. So we run the below command when we merge the chart in the **master** branch

We need a temporary directory where we will build and package the chart

- BUILD_DIR=$(mktemp -d)

Run a loop to all the charts to build, package, and push it to the registry. The below commands will run on each chart

- helm dep update ${REPO_DIR}/${CHART_FOLDER}/$dir

Package the chart with the below command

- helm package ${REPO_DIR}/${CHART_FOLDER}/$dir

Then push the chart to registry

- helm push — username ${HARBOR_USERNAME} — password ${HARBOR_PASSWORD} ${REPO_DIR}/${CHART_FOLDER}/$dir ${HARBOR_CHART_URL}/maya

Below is the what the config will look like

    # Temporary dir for storing new packaged charts and index files
          BUILD_DIR=$(mktemp -d)      # Push temporary directory to the stack
          pushd $BUILD_DIR      # Iterate over all charts are package them push it to Harbor
          for dir in `ls ${REPO_DIR}/${CHART_FOLDER}`; do
           helm dep update ${REPO_DIR}/${CHART_FOLDER}/$dir
           helm package ${REPO_DIR}/${CHART_FOLDER}/$dir
           helm push --username ${HARBOR_USERNAME} --password ${HARBOR_PASSWORD}  ${REPO_DIR}/${CHART_FOLDER}/$dir ${HARBOR_CHART_URL}/maya
           if [ $? != 0 ]; then
            travis_terminate 1
           fi
          done# Pop temporary directory from the stack
          popd

Wow! We have successfully completed all the steps. Now, our setup is ready to build and push the helm chart to the registry.

![Project Dashboard](/images/blog/project-dashboard.png)

Here is the full Travis file
[https://gist.github.com/inyee786/d779f347d7fa272aed4ee8457182af35.js](https://gist.github.com/inyee786/d779f347d7fa272aed4ee8457182af35.js)

Here is .yamllint.yml file which contains lint rule for charts.yaml values.yaml and .travis.yaml
[https://gist.github.com/inyee786/ef15b05c98bb4761b41af5f4fe268239.js](https://gist.github.com/inyee786/ef15b05c98bb4761b41af5f4fe268239.js)

## Conclusion:

Here we packaged the helm chart and pushed it to the helm registry.

## About me

You can follow me at the below profiles and can ask any questions related to Angular, JavaScript, Travis, Kubernetes, etc.

- [GitHub](https://github.com/inyee786/)
- [Linkedin](https://www.linkedin.com/in/intakhab-ali/)
- [Medium](https://medium.com/@intakhab.cusat)

This blog was originally published on 28th Jan 2020 on [MayaData’s blog](https://blog.mayadata.io/openebs/setup-continuous-integration-for-helm-chart).
