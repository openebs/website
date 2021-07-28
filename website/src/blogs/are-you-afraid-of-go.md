---
title: Are you afraid of Go?
author: Amit Kumar Das
author_info: Engineer the DAO
tags: Docker, Go, OpenEBS, Programming Languages, Programming Tips, Tutorials
date: 27-07-2017
excerpt: Are you an experienced C programmer or perhaps an adept Java hacker finding Go somewhat awkward to deal with.
not_has_feature_image: true
---

Are you an experienced **C** programmer or perhaps an adept **Java** hacker finding [**Go**](https://github.com/golang/go/wiki/whygo) somewhat awkward to deal with? There may be different elements of surprise or familiarity based on the programmer’s background e.g a Java programmer may relate the GOPATH settings with the settings associated with JAVA_HOME. On a similar note, the very same programmer might be surprised with Makefiles that are used to script the compilation, build & other stuff. I am sure though that this experience will be different for a seasoned C programmer.

If the above and perhaps multiple other reasons inhibit you from familiarising yourself with Go then you are not the only one. The best thing is there is a similar number of solutions that will help you play along with the Go pitch.

Going back in time, this thorny feeling was exactly what we had faced when we started [***OpenEBS***](http://openebs.io) development a year back. However one of the core goals of *OpenEBS* is ease of use; whether it is for the admin or the operator or the developer, tester, and so on. In other words, different personas involved during the Software Life cycle, Deployment & Maintenance should not go through a learning curve and rather experience *OpenEBS* as the simplest form of storage software that cuts through all the storage noise. This meant we did not want Go or any other programming language, as a matter of fact, to limit our way towards this enlightened journey.

During those days we implemented some of the strategies that helped nullify the above pain points and provide a smooth cruise to all current & future contributors of *OpenEBS*. This article will focus on our strategies meant for the newbies trying to get their hands dirty with Go.

***I have itemized our strategies as these steps:***

1. Start your baby steps at GO [**Playground**](https://play.golang.org/). This will remove the initial hassles of downloading Go and setting up GOPATH & stimulate you towards coding (read *familiarising with the newer syntax*) & start believing the language by viewing & analyzing the output expected from your logic i.e. *WYSIWYG*.
2. Get familiar with [**Vagrant**](https://www.vagrantup.com/) (*I understand this is a different tool & is in no way related to Go programming*). Vagrant with its pitch for ‘*Development Environments Made Easy*’ will help you to set up VMs which has all the necessary Go based downloads and GOPATH settings. One can search for simple open-source projects that does below:

**a**.Vagrantfile that makes use of some sample Go programs (probably scripting a *git clone to <some-github-url>*), &

**b**. Makefiles that have the logic to compile & build.

There is one catch though! One has to install Vagrant & a preferred Hypervisor to enjoy the benefits of Step 2. So there is a bit of a learning curve involved.

***However, this should not deter one to avoid Step 2, as it has huge benefits going forward. You will appreciate this step once you understand the difficulties in managing projects with their right versions and dependencies. A trivial mistake here will lead to bug injections. This step will rather help you enjoy the taste of CI right from your laptop.***

After gathering enough confidence via these steps one can try out fancier stuff. Does ***running the builds in Travis*** or ***compiling the source code in a Docker container*** challenge you. You might as well explore some of this stuff & others in our [**tool-room**](https://github.com/openebs).

There may be various other options (*probably even simpler ones*) available in this '**DevOps**' world that are not mentioned here. E.g. [**GVM**](https://github.com/moovweb/gvm). However, I have tried to list down the game plans that have worked well for us. Do get back with your valuable insights on how you have succeeded to tame the initial apprehensions while trying out a new language.
