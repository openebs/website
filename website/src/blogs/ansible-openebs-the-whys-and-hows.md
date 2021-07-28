---
title: Ansible @ OpenEBS — The whys and hows
author: Karthik Satchitanand
author_info: Karthik has been into the Design and Development of tools for infrastructure as code, software testing performance & benchmarking & chaos engineering.
tags: Ansible, Ci, DevOps, Jenkins, Vagrant
date: 31-07-2017
excerpt: We are using Ansible as one of the critical moving parts of our automated test suite in the CI pipeline @OpenEBS. The question was expected in some ways,
not_has_feature_image: true
---

During a telephone conversation with a former colleague and good friend I was confronted with an interesting question, “I know Ansible is a great configuration management tool, why bend it as a test automation framework?”

We are using Ansible as one of the critical moving parts of our automated test suite in the CI pipeline @OpenEBS. The question was expected in some ways, what with the friend having spent a few good years working with more “traditional”, proprietary, and hand-built-from-scratch test-automation frameworks based on Perl. The subsequent discussion (mostly answers and follow-up questions) helped me internalize why we chose Ansible at OpenEBS and how better to use it.

Felt this warranted a blog post to make my thoughts public and hey, of course, gain more feedback!

OK, that let the cat out of the bag

## Infrastructure as Code (IaC)

One of the biggest IT trends over the last few years has been managing infrastructure through automation. One might argue that puppet started way back in 2005, thereby making this practice far older than most believe, but the way it has taken ops departments of most organizations by storm in the past 5–6 years is nothing less than a revolution. In fact, the paradigm of DevOps is built on managing infrastructure as code. And when we say code, the expectation of most ops personnel around the “language” would be that it doesn’t require deep programming knowledge and have a steep learning curve — which is what DSL (Domain Specific Language, sometimes also referred to as Domain Scripting Language) based frameworks like ansible achieve. It also helps that ansible adopts an imperative programming model (using YAML) that works well because of its alignment with the traditional command-based approach of ops teams.

![Ansible GitHub trends ](https://cdn-images-1.medium.com/max/800/1*7Di79EF1SxNqF0F0KD1E-A.jpeg)
(***Ansible GitHub trends (Courtesy: [https://www.ansible.com/blog/another-good-year-for-ansible-users](https://www.ansible.com/blog/another-good-year-for-ansible-users))*** )

But, how does the above address our question?

**Answer**: A major portion of the test duration of infrastructure-based software, such as storage software involves “manipulation” of infrastructure. Setting up bare-metal boxes, virtual machines, or containers, installing packages, executing various commands that control & alter system state, monitoring for specific behavior are key aspects of this process. Consider the need to run the above as batch processes and perform parallel execution on multiple nodes — and the inevitability of a workflow orchestrator dawns upon you. Especially so when you are testing a solution like OpenEBS that is designed to provide storage for DevOps use cases (read more about this [here](https://blog.openebs.io/storage-infrastructure-as-code-using-openebs-6a76b37aebe6))

Is not an approach (and the tool) soaked in “**devops-ness**” a pre-requisite to test the storage solution specifically designed for DevOps use cases 🙂 ?

## Why Ansible, why not chef, puppet, salt, etc.?

![Ansible](https://cdn-images-1.medium.com/max/800/0*NQOK_gId-YBZMe02.png)  

Err.., this seems to have been done to death on the internet. Yet, new posts on this topic seem to spring up everytime I look. So, without discussing the why not, let me touch upon the aspects about ansible that appealed most to us.

**Powerful, yet very simple**: Ansible’s power comes from its simplicity. Under the hood, it is just a DSL for a task runner over a secure shell (ssh) with intuitive modules for achieving most (if not all) system functions. The soft learning curve in ansible is one of its major advantages over its rivals (*Ok, I said I won’t do the why-not, but there is a feeling that puppet, chef, etc., are over-designed for the jobs they do.*) In an open-source project like OpenEBS, a need to build a template for the contributors to write their own test workflows without spending too much time was an important consideration.

**Idempotency**: The ansible playbook (a set of tasks written using the modules mentioned previously) when run twice gives the same end result. This is a great help when it comes to reusing testbeds.

**Speed of execution**: One of the benefits of having an agent-less architecture (apart from a complexity-free install and usage experience), ansible playbooks zip through configuration, and other “system” tasks (mostly, test logic) fairly fast. While there are supposedly issues at scale (1000s of nodes), it works just great for our needs. Want to setup a working Kubernetes cluster with OpenEBS storage on-premise in less than 20 min? — check out the playbooks on our [github repo](https://github.com/openebs/openebs/blob/master/e2e/ansible/openebs-on-premise-deployment-guide.md)

**Rich module library**: Ansible has modules for most things under the sun 😐 Nuff said, go look : [Ansible modules](http://docs.ansible.com/ansible/latest/modules_by_category.html)

(*As an aside, this was one of the other reasons why we started using ansible as a test engine, apart from the infrastructure angle*)

**Plugins**: While ansible is great for configuration management, workflow orchestration, etc., it needs to be able to work well with other tools/frameworks that make up the CI-CD pipeline( Jenkins, Vagrant, etc.,) And all these have ansible plugins (How much we use them is a topic for another day, but the point is ansible does have integration if you choose to utilize it). More important than existing integrations is the ease with which you can extend ansible’s capabilities with custom plugins. Python was a dev + ops favourite, even before DevOps became a fad and ansible is built using it -so, there you go!

**Community**: One of the ansible’s biggest strengths is its community. We discussed extending ansible’s capabilities via custom plugins. Chances are you never have to write one, because the community already has two versions of it (*okay, I may be exaggerating*), but the active community makes it a lot easier to adopt. There is a lot of documentation available as well. All of this means, for most purposes, you don’t have to opt for paid support for issues OR add-ons until you really scale or get complex.

## How are we using Ansible?

At OpenEBS, we are using Ansible as :

a) A means to enable rapid deployments of applications in user environments. Today, you can use our Ansible playbooks to get a Percona MySQL server instance or a PostgreSQL statefulset up and running with OpenEBS storage on-premise from plain vanilla VMs in double quick time, with single command execution. Even as I write this, efforts are underway to create playbooks to perform such deployments on the cloud, right from provisioning VM instances to running test loads to verify setup stability.

b) As a “***test orchestrator***”, i.e., for provisioning testbeds, executing test logic, and notifying users. That doesn’t mean we have stopped writing shell scripts or python scripts in QA (there are still functions which one might have to execute via shell or the ansible “shell” module or python, due to lack of actual ansible modules. Not to mention existing scripts which one wouldn’t bother converting into playbooks).

Our current CI workflow involves a Jenkins master polling for updates to git repos, followed by bringing up VMs on-premise using vagrant, configuring those using ansible, followed by execution of test playbooks and user notification on slack. The CI is still evolving and efforts are on to make it more robust — you could join the OpenEBS-CI [slack channel ](http://slack.openebs.io/) & browse the [github pages](https://github.com/openebs/openebs/tree/master/e2e) if you are an enthusiast/would like to contribute!

In forthcoming blogs, I would like to discuss more on the “***How***” and share thoughts, challenges, solutions around using ansible both as a preferred application deployment mechanism as well as a “test orchestrator”.

Thanks for reading !!
