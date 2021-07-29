---
title: Becoming a Kubernaut - Top Learnings in my journey of becoming a CKA
author: Ashutosh Kumar
author_info: Software Engineer at MayaData | OpenEBS Reviewer and Contributor | CKA | Gopher | Kubernaut
date: 05-03-2019
tags: Cka, Kubernauts, Kubernetes, MayaData, OpenEBS
excerpt: I would like to tell you about my experience with the Certified Kubernetes Administrator (CKA) exam.
not_has_feature_image: true
---

Hello, my fellow Kubernetes Developers,

I would like to tell you about my experience with the Certified Kubernetes Administrator (CKA) exam.

I was first exposed to Kubernetes when I started to work on OpenEBS, a Container Attached Storage solution.

After working on the project for a period of time, I thought about taking the CKA certification exam. I took approximately one and a half months to practice and get my hands dirty. I completed the exam on the 28th of December 2018 and was excitedly able to pass the exam.

![](https://lh6.googleusercontent.com/xjqXS1OHG4peRCNCbgIucCHlqEEgY4dzFr2vCot0pj0dRz075Xv7Ed2p9yBiqYMWLkvKOFLLIkXL-6lTtqIap981KBWebNZvfBn8SYmOstKa-SjdUruWyli92vsGatDvXt5Nveq2)

## CKA is about making friends!

![](https://lh6.googleusercontent.com/y-dr6deMc6gBAJs4UKCCdA_rmDTbRLyyUd5OLMj1u6_deX1JIDWVUJq-iQvBnJXKMrs3z5pqcT6FPEfaH8qJ80Gt0BdoQ5qOOEdDoy5ZI6KNfySYzr-dy52ojIb-U-W4ZiCXHJDR)

When I was involved in developing the OpenEBS control plane, I was required to understand some basic concepts, specifically, the storage concepts of Kubernetes.

I started to explore Kubernetes Docs which, in my opinion, is the greatest source for learning Kubernetes. I applied my newfound knowledge to the project. My in-house team members my company MayaData, namely Karthik, Amit, Vishnu, and Kiran just to name a few, groomed me and provided me with the right knowledge. From there, I started to develop more interest in the subject.

In mid-November 2018, I started to do an exhaustive walk through of Kubernetes docs and practiced it.

Obviously, there were a few things that did not make sense to me as Kubernetes covers a vast domain, e.g. Network, Linux, etc.

Throughout my experience, I frequently used the Kubernetes Slack channel and asked questions. I also began to attend local meetups. From there, my journey in making friends and a Kubernetes Mastermind began. I met Suraj Narwade on one of the meetups, where he shared his experience on how he learned Kubernetes.

I came to know about the Kubernaut Slack channel, space where you can join and ask about Kubernetes-related information, such as setting up CNI, performing workload operations, etc.

This journey was very exciting, and it became a journey to make new friends and, of course, this led to becoming a CKA.

## About the Exam

![](https://lh6.googleusercontent.com/8O1iFmqiXACiozyrrBeMHHX3GKf9HstipsrtEK7MnPyppP9kQVxxIL1aXogrCYs8fdOCYe1952aBSpqp2bokSxpMpvkn770m4wfMjuBlNEWeeETInd7cSX-l70GUq1o3QI3SonVq)

- The duration of the exam is 3 hours.
- There will be 6 Kubernetes clusters on which the questions are based.
- There are 24 total questions.
- You are allowed to open only Kubernetes Docs in the exam.

Visit the following link to learn more about exam
[https://www.cncf.io/certification/cka/](https://www.cncf.io/certification/cka/)

Read the candidate handbook and exam tips PDF carefully. These can be found on the website link given above.

To learn more about the exam syllabus, visit the following link:

[https://github.com/cncf/curriculum](https://github.com/cncf/curriculum)

## Preparation and Tips

![](https://lh3.googleusercontent.com/y5Y0lbm9j0gl9pMSf2pV9cAwHrLHzk2As5oReKk-gtz--IeZvCs4V1lPQeUKQImkpKQvoX3N7YGl-3OMMva5-vNzQpEYT6curv_PbRdDIZgMuKkGzx9wj4yD5CAc62xMU5YrOdid)

- Go through the Kubernetes docs exhaustively, especially the concepts and task sections, so that when you see a question you can easily open the relevant topic in docs quickly.
- Practice with Kubectl, e.g. create a deployment, service etc., without writing YAML.
[https://kubernetes.io/docs/reference/kubectl/conventions/](https://kubernetes.io/docs/reference/kubectl/conventions/)

- Avoid writing YAMLs as much as possible in the exam.
- Don’t just read the docs, but put them into practice.
- Know about systemctl commands.
- Set up your own cluster from scratch using [Kubernetes Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way). I applied a little trick here; first I became familiar with basic Kubernetes constructs, played with workloads(e.g. Deployment, daemon set, etc), services etc., on an already configured Kubernetes cluster. Then I did it the hard way.
- Some folks also advise studying books and other learning materials, but I personally did not follow any books.

I will paste some useful resource links that might be helpful in addition to the Kubernetes docs.

[https://suraj.pro/post/journey-to-cka/](https://suraj.pro/post/journey-to-cka/)

[https://github.com/walidshaari/Kubernetes-Certified-Administrator](https://github.com/walidshaari/Kubernetes-Certified-Administrator)

[https://medium.com/@sonasingh46/static-pod-in-kubernetes-e3854507655f](https://medium.com/@sonasingh46/static-pod-in-kubernetes-e3854507655f)

[https://medium.com/@sonasingh46/story-of-pod-manifest-to-running-8e4b38f074ec](https://medium.com/@sonasingh46/story-of-pod-manifest-to-running-8e4b38f074ec)

Definitely join the Google Kubernaut Slack channel.
Channel id: [https://kubernauts-slack-join.herokuapp.com/](https://kubernauts-slack-join.herokuapp.com/)

All the best for your journey in making new friends and cracking the Certified Kubernetes Administrator (CKA) exam!
