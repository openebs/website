---
title: Test Driven Development — The DevOps Way
author: Amit Kumar Das
author_info: Engineer the DAO
tags: Docker, Kubernetes, OpenEBS, TDD, Software Development, DevOps
date: 13-07-2017
excerpt: TDD is the abbreviated form for `Test Driven Development`. It might also be true in-case of newbies to have never heard of TDD in the current season where DevOps, NoOps, DataOps, ML, IOT rule the roost.
not_has_feature_image: true
---

We might have all heard of TDD, don’t we? TDD is the abbreviated form for 'Test Driven Development'. It might also be true in case of newbies to have never heard of TDD in the current season where DevOps, NoOps, DataOps, ML, IOT rule the roost.

TDD in simpler terms would be planning and implementing test logic before implementing its development logic. However, I find it very difficult to do this in practice. What I do instead is a little bit of planning & start building the development logic. In the next iteration, I would start writing corresponding test logic i.e. unit test programming (*remember those jUnit days*).

Readers may still be wondering how “*DevOps is related to TDD*”. Well, here it is:

> *How about using the best of DevOps tools towards TDD implementation?*

The logic behind this is no brainier.

> I find the very best of the open-source community busy in building & tuning tools old & new that are meant to satisfy DevOps culture & practices.

It makes sense for us to use these tools that meet our TDD needs.

The question that might be lingering now would be about DevOps vis-a-vis TDD. ***Is TDD not part of DevOps culture***? The answer is an emphatic yes. However, I am trying to pick up one thread at-a-time from the DevOps culture/practice. That thread here is TDD & is the focus area for this article. I would like to emphasize that TDD does not necessarily mean unit testing. It can be thought of as applying test logic, scenarios, etc as the team continues with its development efforts, that in-turn brings in changes, discoveries, ideas in test as well as in development. ***To sum it up, it tries to remove the pain associated with latter stage design changes*** In addition, the team is ***no more afraid*** of new features, bug fixes, requirement changes, etc. due to the presence of test logic that gets triggered due to any of these changes.

Hope to talk again about some tangible implementations we are doing in [OpenEBS](https://blog.openebs.io/). I would end the story here with a tip.

> *The popular currency of current age DevOps’ tooling is Docker & Kubernetes.*
