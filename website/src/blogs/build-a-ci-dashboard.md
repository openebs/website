---
title: How to Easily Build a CI Dashboard
author: Chandan Kumar
author_info: Software Engineer at MayaData Inc
date: 26-04-2019
tags: CI Dashboard, Git, Kubernetes, Pipeline, GitLab
excerpt: In this tutorial, we’ll go through all the necessary steps for setting up the CI dashboard
---

A code that is never executed for users is essentially a digital waste product. To prevent this building of waste and to showcase the results of code on the Kubernetes environment, we can use the CI Dashboard, along with chaos testing.

The CI dashboard allows users to view the commit and release-based build and run a chaos test using litmus on a different platform with different versions of Kubernetes.

In this tutorial, we’ll go through all the necessary steps for setting up the CI dashboard:

1. *Create a project*
2. *Push the code to GitHub*
3. *Setup the CI of the project using GitLab*
4. *Select the chaos test from [*Litmus*](https://github.com/openebs/litmus)*
5. *Add the script in GitLab YAML to create pipelines for executing the chaos tests*
6. *Build a CI dashboard(ex: *[*openebs.ci*](https://openebs.ci/)* ) to display the gitlab pipeline history and status*
7. *Conclusion*

### Step 1: Create a project

First, create a [project](https://github.com/openebs/maya) and write some automated testing for it. You should also add the Dockerfile in the project to set up the CI.

### Step 2: Put the codes on GitHub

Create a repository on GitHub and add a `.gitignore` file to ignore the auto-generated folder or file. Follow the script below to put changes into GitHub.

    $ git init
    $ git add .
    $ git commit -s -m "Initial commit"
    $ git remote add origin <origin_url>.git
    $ git push origin master

### Step 3: Setup the CI using gitlab

Add a *.gitlab.yaml* file to project and write the build and test steps. 
(Ex: [https://github.com/openebs/maya/blob/master/.gitlab-ci.yml](https://github.com/openebs/maya/blob/master/.gitlab-ci.yml)). Import the project in gitlab from GitHub. Setup the gitlab pipeline environment variable to push the docker image, or any other, if required. Add the pipeline trigger command in *.gitlab.yaml* file.

### Step 4: Selection of chaos test

Select the chaos test (litmus book) from the [litmus](https://github.com/openebs/litmus) repository or write your own litmus book if needed. This will be used to test the product performance on different Kubernetes versions and with different cloud vendors.

### Step 5: Add script in gitlab.yaml

Create a [repository](https://github.com/openebs/e2e-packet) for the execution of the platform-based pipeline. Add `.gitlab.yaml` file and related script to create a cluster, or use the executing cluster and run the different chaos tests in various stages of the [pipeline](https://gitlab.openebs.ci/openebs/e2e-packet/pipelines).

Reference the `.gitlab.yaml` file
[https://raw.githubusercontent.com/openebs/e2e-packet/master/.gitlab-ci.yml](https://raw.githubusercontent.com/openebs/e2e-packet/master/.gitlab-ci.yml)

    cleanup-packet:
      when: always
      image: chandankumar4/packet:v4
      dependencies:
        - packet-cluster
      stage: CLUSTER-CLEANUP
      script: 
        - chmod 755 ./script/packet-cleanup
        - ./script/packet-cleanup
    

### Step 6: Build a CI dashboard

![CI Dashboard](https://lh4.googleusercontent.com/hoDf2G6VnpIhhkmkQXlF07ocFRm7bJjP5f1ZkA8TZCT6PXMOPkdCO966EecYpk7koCbHPKdMemOA3_kYz8M5qrvLevRDJPw2c0MfYn-yp-iLn4j-qV8wpwT_av2iBYBuMH-4EUeB)

Create a project called [Ci dashboard backend](https://github.com/openebs/ci-e2e-dashboard-go-backend) that will fetch the pipeline details from gitlab by accessing their API and exposing the same on different API after some enhancement. Create another project called [Ci dashboard](http://github.com/openebs/ci-e2e-dashboard) that will display the gitlab pipeline details by accessing the data from the back end API.

### Step 7: Conclusion

CI dashboard will display the build history of the imported project and analyze the performance on different platforms and versions of Kubernetes.

### References

[https://openebs.ci/](https://openebs.ci/)

[openebs/ci-e2e-dashboard](https://github.com/openebs/ci-e2e-dashboard)
[Contribute to openebs/ci-e2e-dashboard development by creating an account on GitHub.github.com](https://github.com/openebs/ci-e2e-dashboard)

[openebs/ci-e2e-dashboard-go-backend](https://github.com/openebs/ci-e2e-dashboard-go-backend)
[OpenEBS CI Dashboard backend using Go and PostgreSQL. — openebs/ci-e2e-dashboard-go-backendgithub.com](https://github.com/openebs/ci-e2e-dashboard-go-backend)[openebs/maya](https://github.com/openebs/maya)
[OpenEBS Maya extends Kubernetes capabilities to orchestrate CAS containers. — openebs/mayagithub.com](https://github.com/openebs/maya)
