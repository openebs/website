---
title: How we built multi-tenant ChatOps.. for MayaOnline!
author: Satyam Zode
author_info: Go Developer @openebs | Open Source Contributor | Avid Learner
date: 31-12-2017
tags: Kubernetes, Slack, Chatbots, ChatOps, Chatbot Design
excerpt: Maya-ChatOps is one of the core areas of MayaOnline, covering the storage operational support of Kubernetes clusters.
---

## What is Maya ChatOps?

Maya-ChatOps is one of the core areas of [MayaOnline](https://mayaonline.io/), covering the storage operational support of Kubernetes clusters. DevOps developers and admins get the alerts and analytics of their OpenEBS volumes deployed across multi-cloud Kubernetes clusters right into their [slack](https://slack.com/) channels. Our vision of ChatOps extends beyond just simply providing alerts and providing a way to query any configuration and status from slack. It goes all the way to interact with DevOps developers and admins to manage the YAML config files in their CI/CD system.

## What is MuleBot ?

![MuleBot](/images/blog/mule-bot.png)

MuleBot is the name of the bot or slack application from Maya. MuleBot is a distributed slack application. MuleBot responds to user’s queries about configuration and status of the OpenEBS volumes. Sometimes, MuleBot tries to surprise you with smart alerts prior to a real situation happens.

## How to use Maya ChatOps?

You can start using ChatOps by adding Slack integration in MayaOnline. The MuleBot slack application will be installed in your workspace. Subsequent steps involve configuring a single or multiple clusters to the desired slack channel. This mapping is maintained in the MO in the form of a “slack-card”.

You can add as many slack cards as you want for your clusters. Through this channel, you will be able to interact with clusters imported in the MayaOnline.

## What are we using underneath for powering our ChatOps?

Well, this is why I am writing this blog, to tell you the various choices we had and why we ended up with a particular choice. Some of the design goals we kept while choosing the bot framework are:

- Users of MayaOnline will be in thousands to begin with, so, the bot framework has to be multi-tenant
- The bot has to be a micro service and suitable to run seamlessly on Kubernetes
- The bot framework has to have the NLP AI support for us to get that capability out to the users in the near future

So, we looked at [Hubot](https://hubot.github.com/), [StackStorm](https://github.com/StackStorm)/errBot and [BotMan](https://botman.io/)

Each one of them had their benefits but none of them were multi-tenant. Then we looked at which is easiest to add the multi-tenant support to, BotMan came surprisingly easy to add this support to. BotMan is thin, and is written as a stateless application. The preliminary approach involved passing the user configuration in environment variables. All it needed was a thin shim to get user-config details dynamically and we had achieved multi-tenancy! It is that simple.

We kept a combination of slack **team_id**, **channel-id** as the key of the mulebot to manage the link between the slack user config and MayaOnline user config.

![Chat Ops Architecture](/images/blog/bot-architecture.jpeg)

With the above design Maya ChatOps allows users to configure different slack channels for different Kubernetes clusters at MayaOnline.

Next steps:

- In the coming weeks, we will try to post some example scenarios suggesting how smart our MuleBot can be 😄
- We plan to extend the BotMan framework to provide Maya ChatOps API. A DevOps developer/admin can use these APIs to integrate better into their CI/CD
- Currently it is integrated with Slack. PagerDuty is on our horizon.
