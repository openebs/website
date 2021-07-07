---
title: Experience with OpenEBS in this Hacktoberfest
author: Aswath
author_info: FullStack Dev
date: 26-11-2018
tags: OpenEBS, Open Source, Hacktoberfest
excerpt: From Hacktoberfest website, I came to know that Open Source Cafe Bangalore is conducting Hacktoberfest workshops every weekend and they are also providing some awesome goodies for our contributions. 
---

From Hacktoberfest website, I came to know that Open Source Cafe Bangalore is conducting Hacktoberfest workshops every weekend and they are also providing some awesome goodies for our contributions. So, I decided to give it a try.

I was late for the workshop on day one itself (Thanks to traffic in Bangalore!). A session about `Kubernetes` was ongoing. Since I don’t even know what a `Container` is, it was hard for me to understand what `Kubernetes` is all about. The next session was about how we can make our first PR to some open source repository. Since I already made a few PRs, I understood it.

## It’s better to start with simple issues first.

In most of the repositories, people will tag the issues concerning the complexity. Thanks to the [openebs](https://medium.com/@openebs) community for tagging beginner friendly issues. So, I choose to work on a few issues tagged as `hacktoberfest` — a few of them were very simple, such as fixing the linting errors. But a few of them were a little complicated like [adding autocompletion to a CLI tool](https://github.com/openebs/openebs/issues/1987).
Taking up the more straightforward issues initially gave me confidence. And it helped me to understand the conventions to follow for that particular repository such as signing every commit that we make.

## Help is available in the community if you need.

When I decided to work on the project OpenEBS/Maya, I struggled to set up the project on my machine. I was using MacOS, and the build instructions were written for Linux OSes. People like [Satyam Zode](https://medium.com/@satyamz) and Prateek helped me to build the project by changing some lines in the `Makefile`.
This project was written entirely in `Golang`. When I decided to work on this project, I didn’t even know how to write a hello world program in `Golang`. But people were there to help me whenever I got stuck.

## Always consult with some maintainers before you add some external libraries to the project.

I took the issue of adding bash completion to a CLI tool named mayactl, since Akshay has mentioned a library to do the same thing. I learned a bit of `Golang` from A Tour of Go. Then I tried to incorporate the bash completion library to mayactl. After a couple of failed attempts, I was able to implement the essential bash completion. In the review, [Ashutosh Kumar](https://medium.com/@sonasingh46) told me that if we add an external library to our project, we should also be able to maintain it. So, he asked me to decide on it.

## You don’t need to know every bit to fix an issue.

Instead of using some external library, people told me to look into the source code of kubectl to see how they implemented the bash completion. I dug into kubectl’s source and figured out the part where they performed bash completion. I copied it and made it compatible with mayactl.

`Copying code is fine as long as you know what it does is.`

You don’t even need to know a language to work on an issue. You can learn the language on the go. To fix the bash completion issue, all I need to know was three things:

- A little bit of `Golang`
- Know how bash completion works
- Where to add the code inside mayactl

I didn’t know all these things before I started. I learned this by doing it.
I was happy by knowing that this PR was selected as the best PR of the week and I won an **Amazon Echo** from OpenEBS.

[Tweet](https://twitter.com/proaksh/status/1056212237361115136/photo/1?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1056212237361115136&amp;ref_url=https%3A%2F%2Fblog.openebs.io%2Fmedia%2Fa4ac13e292477c21ec22a988cdcc3daf%3FpostId%3D64b9711a22f5)

The next issue that I took was to add some features to a Common Integration Testing Framework (CITF) that OpenEBS is planning to use for all of its projects. I thought this is difficult to work on since I don’t know how OpenEBS works. But the people like Ashutosh, [Prince Rachit](https://medium.com/@princerachit) and [Akash Srivastava](https://medium.com/@srivastavaakash) explained the essential parts of OpenEBS that are required to work on the issue. Without completely understanding it, I worked on it. And with the help from the community, I could complete the tasks.

## Address the review comments properly

After completing the task, I made a PR. People approved the changes, and they asked me to put some screenshots about the feature that I added. But I was not clear about the kind of screenshot that they needed. So, I asked them, and they clarified. I made a `GIF` about adding autocompletion in mayactl and added it along with the PR.

#### `In a community, help others too`

When we were done with issues in CITF, the next task was to test the mayactl with the CITF. I added a few test cases using CITF. Then I helped others in reviewing their code and getting it merged with the master branch. I got to see that a lot of people were facing the issues that I encountered before. So, I shared the solutions that worked for me. I got happy that I also was able to help someone who was in need.

For my contributions to OpenEBS throughout this month, I won a **laptop** from them.

[Tweet](https://twitter.com/openebs/status/1057711263260717056/photo/1)
