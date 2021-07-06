---
title: Uniquely identifying disks in OpenEBS on VMWare platform
author: Akhil Mohan
author_info: Software Engineer @ MayaData, working on Cloud Native Tech.
date: 22-01-2020
tags: OpenEBS, Vmware, Vcenter, Virtual Disk, Kubernetes
excerpt: A little bit of background. I work at a company called MayaData who develops a very cool Open Source software called OpenEBS (CNCF Sandbox project) that simplifies the deployment of stateful applications on Kubernetes.
---

A little bit of background. I work at a company called [MayaData](https://mayadata.io/) who develops a very cool Open Source software called OpenEBS (CNCF Sandbox project) that simplifies the deployment of stateful applications on Kubernetes. You should check it out at [www.openebs.io](http://www.openebs.io/?__hstc=216392137.84d52389458ef57b0491fddb252202d6.1570688281471.1578466343199.1578469779597.19&amp;__hssc=216392137.2.1578469779597&amp;__hsfp=2854279793).

Kubernetes can be installed on any type of machine; be it a Virtual Machine, bare metal, or cloud machine. Kubernetes abstracts away most of the significant bits of a system, except storage. When it comes to storage, the main reason an abstraction will not work is that there is no uniqueness among the storage devices themselves. Every vendor and every virtualization platform implements it differently.

We hit this issue of unique virtual disks while deploying OpenEBS on Kubernetes backed by VMware VMS or other virtualization platforms because OpenEBS NDM is not able to uniquely identify the block devices themselves.

Changing the absolute configuration on the Virtual Machine can help you get around this issue.

Here are the steps to enable unique disk IDs in VMware via vSphere client:

1. Right-click the virtual machine for which you want to enable the disk UUID attribute, and select Power > Power Off.
2. The virtual machine powers off.
3. Right-click the virtual machine, and click Edit Settings.
4. Click the Options tab, and select the General entry in the settings column.
5. Click Configuration Parameters. The Configuration Parameters window appears.
6. Click Add Row.
7. In the Name column, enter disk.Enable UUID
8. In the Value column, enter TRUE.
9. Click OK and click Save.
10. Power on the virtual machine.

This will assign WWN to each disk in the Virtual Machine

That is it for today’s tutorial. If you have any questions, feedback, or any topic that you feel I should cover next, feel free to comment on our blog or reach out to us on our [Slack](https://slack.openebs.io./) channel.

This blog was originally published on [Oct 01, 2019, on the MayaData blog](https://blog.mayadata.io/openebs/uniquely-identifying-disks-in-openebs-on-vmware-platform).
