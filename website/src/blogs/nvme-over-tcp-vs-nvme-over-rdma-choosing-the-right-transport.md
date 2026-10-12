---
title: NVMe over TCP vs NVMe over RDMA Choosing the Right Transport
author: Krishna Gajabi
author_info: Krishna is a Technical Customer Engineer specializing in storage, Kubernetes, and Linux.
date: 12-10-2026
tags: OpenEBS, NVMe, NVMe-oF, RDMA, Mayastor
excerpt: A practical comparison of the two most common NVMe-oF transports, NVMe/TCP and NVMe/RDMA, to help you pick the right one for your Kubernetes storage workloads.
not_has_feature_image: true
---

NVMe over Fabrics (NVMe-oF) lets a machine access an NVMe device that lives somewhere else on the network as if it were plugged in locally. That single idea is what makes modern disaggregated and replicated block storage possible: your application runs on one node, its data lives on another, and the gap between them is bridged by a transport fast enough that the application barely notices.

Two transports dominate that space today: **NVMe/TCP** and **NVMe/RDMA**. They solve the same problem in very different ways, and the choice between them has real consequences for latency, hardware cost, and operational complexity. This post walks through how each works, where each wins, and how to decide.

## The common ground

Before the differences, it helps to be clear about what both transports share. Both carry the same NVMe commands — reads, writes, and administrative operations — across a network instead of a local PCIe bus. Both preserve the multi-queue design that makes local NVMe fast, so many I/O streams can flow in parallel rather than funneling through a single bottleneck. And both are standardized under the same NVMe-oF specification, which means an application sitting on top generally does not know or care which transport is carrying its data.

The difference is entirely in *how* the bytes move between the two machines.

## How NVMe/TCP works

NVMe/TCP does exactly what its name suggests: it encapsulates NVMe commands inside standard TCP/IP packets and sends them over the same Ethernet network you already have. No special network cards, no special switches, no special fabric. If two machines can reach each other over ordinary IP, they can speak NVMe/TCP.

That simplicity is the entire value proposition. The data path runs through the host's kernel TCP/IP stack, the same code path that handles every other network connection on the machine. This makes NVMe/TCP trivial to deploy, easy to route across subnets, and friendly to existing network monitoring and troubleshooting tools. Your existing knowledge of TCP — congestion control, retransmission, `tcpdump` — all still applies.

The cost of routing through the kernel is CPU overhead and latency. Every I/O involves the CPU copying data and processing the network stack, which consumes host cycles and adds microseconds to each operation. On a busy storage node serving high IOPS, that CPU tax is not trivial.

## How NVMe/RDMA works

RDMA stands for Remote Direct Memory Access, and the name captures what makes it fast: one machine's network card writes data directly into another machine's memory, without either CPU processing the transfer along the way. The network card does the work, the kernel network stack is bypassed, and the data lands in application memory ready to use.

This "kernel bypass" and "zero copy" behavior is why RDMA delivers lower latency and higher throughput while consuming far less CPU than TCP. For latency-sensitive workloads pushing millions of IOPS, that difference is the whole reason RDMA exists.

RDMA over Ethernet is most commonly deployed as **RoCE** (RDMA over Converged Ethernet), specifically RoCEv2 today. There is also InfiniBand, a separate fabric technology with RDMA built in from the ground up, but in Kubernetes and general datacenter contexts RoCE is the version most people encounter.

The catch is that this performance depends on the network beneath it. RDMA needs specialized RDMA-capable NICs on every participating node, and — crucially — it needs a network configured to not drop packets under load. RoCE traditionally requires a **lossless** Ethernet fabric, which in practice means configuring Priority Flow Control (PFC) and often Explicit Congestion Notification (ECN) on your switches. Getting this right across a fleet of switches is a real networking project, not a checkbox. (Newer RoCE implementations are more tolerant of occasional loss, but the general expectation of a carefully tuned fabric still holds.)

## The tradeoffs side by side

- **Hardware**
  - NVMe/TCP: Any standard NIC and switch
  - NVMe/RDMA (RoCEv2): RDMA-capable NICs on every node
- **Network config**
  - NVMe/TCP: Works on existing IP networks
  - NVMe/RDMA (RoCEv2): Typically needs a lossless fabric (PFC/ECN)
- **Latency**
  - NVMe/TCP: Higher (kernel stack in the path)
  - NVMe/RDMA (RoCEv2): Lower (kernel bypass, direct memory access)
- **CPU usage**
  - NVMe/TCP: Higher per I/O
  - NVMe/RDMA (RoCEv2): Lower per I/O
- **Routability**
  - NVMe/TCP: Routes across subnets easily
  - NVMe/RDMA (RoCEv2): Best within a well-tuned L2/L3 domain
- **Operational complexity**
  - NVMe/TCP: Low — familiar tooling
  - NVMe/RDMA (RoCEv2): Higher — specialized skills and hardware
- **Cost**
  - NVMe/TCP: Uses what you have
  - NVMe/RDMA (RoCEv2): Additional hardware investment

## How to choose

The honest answer is that most teams should start with NVMe/TCP and move to RDMA only when they can prove they need it.

**Reach for NVMe/TCP when** you want to deploy on existing infrastructure without buying new hardware, when your nodes span subnets or the connection has to route across a broader network, when your team is comfortable operating IP networks but not specialized fabrics, or when your workload's latency needs are already well satisfied. For a large share of Kubernetes storage workloads — databases with moderate IOPS, general-purpose persistent volumes, most line-of-business applications — NVMe/TCP is more than fast enough, and its operational simplicity is worth a great deal.

**Reach for NVMe/RDMA when** you are running genuinely latency-sensitive, high-IOPS workloads where microseconds matter and CPU headroom on storage nodes is precious — think high-frequency trading systems, large in-memory databases under heavy write load, or AI/ML pipelines shuttling enormous datasets. Critically, choose RDMA only when you already have (or are prepared to build and operate) RDMA-capable NICs and a properly tuned lossless network. RDMA on a misconfigured fabric can perform *worse* than TCP, because packet loss on a network that assumes losslessness triggers expensive recovery.

A useful rule of thumb: **let the workload and the network you actually have drive the decision, not the spec sheet.** RDMA's headline latency numbers are real, but they are only achievable on infrastructure built to deliver them. If you would be retrofitting RDMA onto a network that was not designed for it, the simpler transport often wins in practice.

## RDMA in Replicated PV Mayastor

Replicated PV Mayastor, the replicated block storage engine in OpenEBS, supports NVMe/RDMA alongside NVMe/TCP. It can be enabled when your nodes have RDMA-capable network cards. See the [Replicated PV Mayastor RDMA documentation](https://openebs.io/docs/main/user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-rdma) for setup details.

## Closing thought

NVMe/TCP and NVMe/RDMA are not really competitors so much as two points on a spectrum of "how much infrastructure are you willing to invest for how much performance." TCP asks almost nothing of your network and gives you very good performance. RDMA asks for specialized hardware and careful network engineering, and in return gives you the best latency and CPU efficiency available. Knowing which end of that spectrum your workload and your infrastructure sit on is the whole decision.
