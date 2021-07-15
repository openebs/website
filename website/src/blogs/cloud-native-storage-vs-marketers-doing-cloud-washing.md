---
title: Cloud Native storage vs. marketers doing Cloud Washing
author: Evan Powell
author_info: Founding CEO of a few companies including StackStorm (BRCD) and Nexenta — and CEO & Chairman of OpenEBS/MayaData. ML and DevOps and Python, oh my!
tags: Cloud Native, DevOps, Docker, Kubernetes, OpenEBS
date: 18-07-2017
excerpt: Let’s try to protect the phrases Cloud-Native storage and Container Native storage; or maybe we should start using a yet more specific phrase such as Containerized Storage for Containers
---

Some years ago, back when I was founding CEO of Nexenta during our high growth days, I tried to bring some rigor to the discussion around “software-defined storage” by setting out a definition. My basic point was that it wasn’t enough for storage to have APIs of some sort and hence to be able to be controlled by software -> in addition the storage ought itself to *be software*, and hence be able to be provisioned as software and so forth.*1*

I wrote those blogs setting out a definition for software-defined storage because I was disgusted by the number of legacy storage vendors that went from denying that software-defined storage was a thing to, almost overnight, claiming that they *already did* software-defined storage. The risk was that the large sales and marketing budgets of legacy vendors would drown out the innovative companies that were actually building software that delivered on the benefits of software-defined storage thanks to, you know, *actually being software-defined*.

Fast forward 6 or 7 years and — **here we go again!**

This time we are seeing “Cloud Native storage” as a term being abused along with “Container Native storage.” Logically Cloud Native storage should be storage software that itself is, you know, *Cloud Native*. And that term is defined by people far smarter than me, however typically it includes some sense of microservices, and [12-factor approaches](https://12factor.net/), and the ability to consume cloud services. One great and lengthy definition of the term is explained by the inestimable Joe Beda [here](https://blog.heptio.com/cloud-native-part-1-definition-716ed30e9193).

We are even seeing Cloud Native storage applied to *any storage that serves Cloud Native applications*. Thanks to the work of Docker and Kubernetes and others, nearly any storage *can* serve storage for containers — albeit in a way that typically requires the user to change the way that they run the containers that are attached to the underlying storage to such an extent that many of the benefits of containerization are lost; I talk more about benefits of truly container-native storage below. Calling hardware based storage that ties into a Kubernetes environment via plug-ins “Cloud Native storage” is absurd and yet it is starting to happen. Such storage is no more Cloud Native than any legacy monolithic application is “Cloud Native” just because you’ve been able to cram it onto a container somehow.

Speaking of cramming monolithic apps into containers, if you have a famously difficult to manage monolithic storage solution that you cram onto a container or two — even if you integrate it nicely into Kubernetes or other Cloud Native environments — what you have maybe useful however it is NOT Cloud Native. Because, you know, it predates 12 factor and cloud-native approaches to building software by many years and, as such, is no more Cloud Native than ye old SAP or other traditional n tier app.

Ahh, that feels better.

But you might ask — *so what*? What’s the big deal about marketers abusing the English language for their own ends and distorting the definition of Cloud Native storage?

Well, that comes down to whether we believe that the benefits of Cloud Native applications could apply to building storage software in a cloud-native manner. Is what’s good for the goose, good for the gander? Is Cloud Native storage even a term worth fighting over? Could a truly Cloud Native storage solution deliver benefits much as other Cloud Native software does?

![Picture showing gooses](/images/blog/goose.png)

**Let’s all be cloud native like the whale: goose, gander, OpenEBS mules, and friends**

Well, why wouldn’t benefits such as:

- better resiliency
- better resource utilization
- innate horizontal scalability
- ease of troubleshooting

and other benefits that apply to decomposed microservice based applications (aka “Cloud Native”) apply to software that is delivering storage?

Perhaps just as importantly, wouldn’t the teams and communities that are building the software be able to be better organized — themselves loosely coupled and able to *DevOps on* — than those that are working on monolithic software? [Conway’s Law ](https://en.wikipedia.org/wiki/Conway%27s_law)does seem to be a major reason for the success of Cloud Native and microservices.

The benefit of that better team organization in my experience can be massively greater developer productivity. As many have pointed out, the productivity of developers in high performing DevOps / Microservices organizations is far, far superior; these developers deliver usable code 10–100x more quickly than developers stuck building to long release cycles with massive dependencies.

So, in short, here is my request of you. Just as we have been so careful in (not entirely successfully) protecting the term DevOps, let’s try to protect the phrases Cloud Native storage and Container Native storage; or maybe we should start using a yet more specific phrase such as ***Containerized Storage for Containers*** (warning, that’s a term we coined at OpenEBS). Otherwise, we risk polluting everyone’s efforts for a better way to build and run software in a Cloud Native way with marketing BS.

1. (note — as I’ve tried to [explain elsewhere](https://blog.openebs.io/software-defined-storage-finally-37fdffc0e37c), much of what we hoped to achieve with software-defined storage is only now being enabled, largely thanks to Kubernetes and other open orchestrators and containers as well).
