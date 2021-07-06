---
title: Storage is Evolving!
author: Nick Connolly
author_info: Nick is the Chief Scientist at MayaData and a pioneer of storage virtualization, holding patents ranging from highly-scalable algorithms through to data protection techniques.
tags: OpenEBS
date: 11-12-2020
excerpt: Learn how storage has evolved over the years. 
--- 

Before the turn of the century, storage systems were typically controlled by dedicated firmware running on custom hardware. These proprietary systems were time-consuming to design, expensive to build, and resistant to innovation.

In 1998, Software-Defined Storage was pioneered by DataCore Software with its SANsymphony suite of products, based on the realization that general-purpose computers had become fast enough to handle the demands of a high-performance storage stack. For context, this was an era when a system with more than two cores was a rarity and both memory and storage were measured in MBs! The primary protocol in use in the enterprise was SCSI, whether directly connected or accessed through a Fibre Channel network, response times were measured in the tens of milliseconds, and accessing storage over Ethernet using iSCSI was only just starting to be worked on.

## The hardware environment is changing!

In the last few years, the hardware environment has changed significantly. Instead of the relentless drive for ever-increasing clock speeds, systems with over a hundred cores are now mainstream. Developing highly-performant algorithms that operate at this scale of parallelism is a complex and time-consuming process that, generally speaking, is uneconomic to pursue.  Storage media has also undergone a transformation, with SSDs based on flash memory delivering orders of magnitude better performance than spinning disks. Their response time, which can be measured in microseconds, has highlighted the inefficiencies of the decades-old SCSI protocol.

NVMe is a ‘state of the art’ storage protocol for a new era. Designed from the ground up for maximum parallelism and lock-free operation, it offers up to 64k independent I/O queues each with 64k entries and a simplified command set. Connected over PCIe, it delivers low latency and high bandwidth data directly to an application, enabling it to fully utilize the capabilities of the underlying flash memory. NVMe over Fabrics (NVMe-oF) provides network access to remote storage and targets less than 10 microseconds in additional latency.

## Application development is changing!

Rather than building the large monolithic codebases that were the norm at the turn of the century, modern development practices are based around composable architectures; containerized microservices that scale dynamically to meet performance requirements. For more background on this trend, see my [earlier post](https://www.datacore.com/blog/5-changes-that-are-reshaping-software-development/) and the excellent articles in [MayaData’s blog](https://blog.mayadata.io/). Kubernetes is rapidly becoming the control plane for the enterprise.

## A New Era

![New Era](https://lh3.googleusercontent.com/5C8pUrteH4V8JB1li4myidOdIP1xAefDES3ksqG1SaxFX4YHhFZz2gX-tNQV7n4UVuHS-BvZejBVnDnLJiwte6LgGgHN2dzsKDKxC2cd-popha9Ljnw9CWNQ2JUvL_1a2F-w8x0i)

A new era requires a new kind of storage stack! A stack that is based around today’s technologies rather than being anchored to the last century. A stack that is portable and flexible. A stack that supports rapid innovation. That delivers the performance that applications require.

## Container Attached Storage

The new category of [Container Attached Storage](https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/), of which OpenEBS is the de-facto open source standard, orchestrates the storage stack with the same flexibility as the application.  Implemented as a microservices based architecture, it runs within Kubernetes and gives users the freedom to define the way that they want to access, protect, and manage their data. The days of the dedicated storage administrator are coming to an end!

For Mayastor, the latest storage engine to be added to OpenEBS, flexibility, and performance are achieved by basing the stack around the [Storage Platform Development Kit (SPDK)](https://spdk.io/), which provides a set of tools and libraries for writing high performance, scalable, user-mode storage applications. Based on the NVMe protocol, it delivers blistering performance from today’s hardware as well as being ready for the next generation of Intel Optane based SSDs that are just becoming available. For more details, see some [recent results](https://openebs.io/blog/mayastor-nvme-of-tcp-performance/).

## Microsoft Windows

However, amid all the discussions about flexibility and portability, there is one small footnote that often goes unnoticed: ‘not *supported on Windows*’. It’s understandable, because most of the projects that are shaping this new era have their roots on Linux or FreeBSD, but it overlooks the sheer scale of Windows Server deployments in enterprise environments. Things are changing, with significant investments being made in Kubernetes on Windows, but it’s a slow process; one project at a time!

MayaData’s mission is to enable data agility - so we were uncomfortable with our high-performance Container Attached Storage solution, OpenEBS Mayastor, not being available on Windows platforms. With that in mind, we have created the [Windows Platform Development Kit (WPDK)](https://github.com/wpdk/wpdk) to act as a foundational layer to make it easier to port the SPDK to Windows. In addition, we are working with the SPDK community to make a few changes to the code base to support this.  It is a testament to the quality of the excellent SPDK project that so few changes have been required so far.

The project also benefits from the work done by the DPDK on Windows community who has invested a significant amount of time porting the underlying [Data Plane Development Kit (DPDK)](https://www.dpdk.org/), a Linux Foundation project that consists of libraries to accelerate packet processing workloads running on a wide variety of CPU architectures.

## Windows Platform Development Kit

![Windows Platform Development Kit](https://lh4.googleusercontent.com/UDp5t-uCJeM6QlsMpoZCz-oxp2CyYDPS1BMhkdeaXn4asIPhdLzy0GLG74xdceDyWAa8bCrijsMLOZfrwKC7vQyQLNS-uGJbGLXyeDtBljMvMNDQphRtcfgMJ65mhZBTC7v6wFwg)

The MayaData developed and contributed Windows Platform Development Kit has currently reached ‘alpha’. Most of the required functionality is believed to be present, unit tested, and working correctly, but there are still areas that need further development.

It is possible to build the SPDK tree, run the associated unit tests, serve an iSCSI target on Windows, and mount it as a volume.

It is anticipated that this collaboration will deliver the following benefits to Windows users:

1. Enable high-performance access to NVMe storage directly from applications.
2. Native software-defined storage stacks, including OpenEBS Mayastor.
3. Support for NVMe-oF adaptors from manufacturers such as Mellanox and Broadcom.

The Windows Platform Development Kit is open source, under a BSD-3 clause license. Community contributions are welcomed and needed! To get started please head to [https://wpdk.github.io](https://wpdk.github.io) or access the WPDK code and documentation on [GitHub](https://github.com/wpdk/wpdk).