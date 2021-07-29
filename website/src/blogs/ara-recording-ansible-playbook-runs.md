---
title: ARA - Recording Ansible Playbook Runs
author: Karthik Satchitanand
author_info: Karthik has been into the Design and Development of tools for infrastructure as code, software testing performance & benchmarking & chaos engineering.
tags: Ansible, Automation, DevOps, OpenEBS
date: 31-08-2017
excerpt: Ansible playbooks can generate quite a lot of console data. Add the -v (I do it by default!) and you have quite a lot to scroll through.
not_has_feature_image: true
---

Ansible playbooks can generate quite a lot of console data. Add the -v (I do it by default!) and you have quite a lot to scroll through. Oftentimes, one tends to feel the need for a better reporting mechanism — one which is easy to scour for specific task status, whilst having the luxury to extract additional debug info for the same if needed. Also, it would be great if this aid is available for playbook runs across time, i.e., for older playbook runs as well. This would be especially beneficial when running ansible-based CI suites, like @OpenEBS, where the application deployments, test setup & execution are driven by Ansible.

Sounds like a perfect requirement for a UI-based solution, doesn’t it?

A lot of people using Ansible for medium-large scale deployments are known to use **Tower**, **Rundeck**, or the opensource alternative **semaphore** to achieve this (Tower has a lifelong self-support trial license without a few features for under 10 nodes). There is also **Foreman**, which is great in environments where a hybrid tool set — a puppet with ansible, or chef with ansible, etc., is used. Most of these are workflow management tools that do more than *just* what we desired above, i.e, playbook recording. These tools provide a centralized management capability wherein inventory, users, task/play scheduling, notifications can all be controlled from a dashboard. Now, it is also possible to integrate these with other popular CI tools like Jenkins (watch [this](https://www.youtube.com/watch?v=CqjeIiHvy30&amp;feature=youtu.be)).

However, if there is already a system in place to perform some of the things these tools do (dynamic inventories, playbook triggers/scheduling) while not really needing others (access control, graphs), and you are only looking for the ability to store and analyze playbook runs via UI, then **ARA** (Ansible Run Analysis) is your tool.

![ARA (Ansible Run Analysis)](/images/blog/ansible-run-analysis.png)

Heavily used by the OpenStack community in their CI projects, ARA is built to just *"record"* playbook runs (Read ARA’s [manifesto](http://ara.readthedocs.io/en/latest/manifesto.html#manifesto), to understand more about its narrow focus). It does this via an ansible callback plugin to store run details into a database and a web interface to visualize the database.

![Viewing playbook tasks summary in ARA](/images/blog/playbook-tasks-summary-in-ara.png)  
(***Viewing playbook tasks summary in ARA!***)

![Viewing task details in ARA](/images/blog/viewing-tasks-details-in-ara.png)  
(***Viewing task details in ARA***)

While it uses SQLite and an embedded webserver, respectively, for these purposes, you could even customize it to use MySQL & Apache. The UI includes nifty features like host fact lookup, playbook params page, search filter, property based sort, and link to code snippets!

![ARA code snippet](/images/blog/see-specific-task-ran.png)  
(***Click on action to see where the specific task ran***)

A nice video explaining the web interface, with playbooks from the OpenStack-Ansible project is [here](https://www.youtube.com/watch?v=k3i8VPCanGo)

In addition to these, ARA also provides

- Couple of Ansible modules for persisting & viewing some user data that one may want to view on the browser-based UI (like an ansible “fact”, but for visualization purposes :P).
- A CLI to query the database (While I haven’t found much use for it till now, it is useful to custom create some reports)

ARA follows the same support cycle as the upstream Ansible community and is under active development (See [github](https://github.com/openstack/ara))

Here is an [ansible role](https://github.com/openebs/openebs/tree/master/e2e/ansible/roles/ara) we have written that you could use to quickly setup ARA on your ubuntu box 🙂

We @OpenEBS, have found great benefit in using this tool and would happily recommend it for the use cases discussed. !!
