---
title: Mayastor 1.0 has arrived
author: Prasoon Pushkar
author_info: Prasoon works as a Product Marketing Manager in DataCore Software. His day to day activities revolve around ideating & executing positioning & messaging to grow OpenEBS & Mayastor. His free time is all about travelling, munching & playing FIFA
date: 18-01-2022
tags: Mayastor, Kubernetes, Solutions
excerpt: In this blog, we will go through Mayastor architecture, evolution of project over the years, benefits for the community and different use cases
---

Mayastor was started in late 2019 as a sub-project of OpenEBS and has been under development by the [MayaData](https://mayadata.io/) team as an advancement of earlier storage engines. Over the years, Mayastor remained in beta and the culmination of efforts of the engineering team of MayaData, the Cloud Native Computing Foundation and the vibrant open-source community led us to build the foundation of various features and stability. In that spirit, today we are proud to release the first community version of Mayastor .  

In this blog, we will go through Mayastor architecture, evolution of project over the years, benefits for the community and different use cases.

## What is Mayastor  

As a sub-project of the [OpenEBS](https://openebs.io/) [CAS](https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/) (Container Attached Storage) solution, the Mayastor storage engine is designed to provide persistent storage that is easy to manage and readily deployable. Mayastor is a cloud-native storage platform by MayaData that abstracts storage resources to enable persistent storage with low abstraction overhead for stateful Kubernetes applications.  

Built on the Container Attached Storage framework, the storage engine leverages a hyper-converged deployment model, where data is stored locally then shared with other nodes via synchronous replication.

## Mayastor Architecture 

The platform is built for cloud-native storage orchestration and is workload-driven to simplify Kubernetes storage for enterprises. Through a declarative data plane, Mayastor abstracts storage resources to enable persistent storage for Kubernetes applications. To do so, Mayastor storage engine components are deployed as containers in Kubernetes, allowing for simple scaling, provisioning and management of storage for clusters.

**Control Plane -** The Mayastor control plane is primarily a single instance Kubernetes controller that implements both the Container Storage Interface (CSI) specification and private interfaces for the storage system. The controller is containerized and runs as deployment in Kubernetes. The control plane also includes CSI plugins deployed on each node to implement CSI protocol services. 

**Data Plane -** The Mayastor data plane creates a Nexus for every Persistent Volume Claim (PVC) loosely coupled to the storage class. Each Nexus instance acts as a virtual storage router, connecting the PVC with a Persistent Volume (PV). The Nexus instance provides an abstraction of the input-output controller while managing all requests for the Persistent Volume attached to the PVC.  

**NVMe and NVMe-oF-** Mayastor is designed to leverage the benefits of both NVMe and NVMe-oF to support low latency workloads for converged and segregated storage. With Mayastor, organizations can benefit from the performance capabilities of new generation high performance SSDs.

**[Storage Performance Development Kit (SPDK)](https://spdk.io/) :** Developed and maintained by Intel, SPDK offers valuable libraries, tools and user-level I/O execution to enhance the performance of storage media in a data centre. Mayastor integrates with the SPDK, helping storage administrators leverage its features for improved throughput performance and efficient SSD storage. The platform also helps provision high availability storage using poll mode drivers and user-level I/O execution capabilities. 

## Why Choose Mayastor ? 

The Mayastor data plane leverages the full performance potential of storage systems, delivering high IOPS with less than 10% overhead. The declarative data plane utilizes developments of NVMe and SPDK to enable easy storage management. The following section outlines various features and benefits Mayastor offers. 

## Benefits of Mayastor 1.0  

**Reduced Latency – Meet IO-intensive Applications Requirements**

Mayastor is developed using an architecture that is targeted at meeting the storage performance requirements of IO-intensive Kubernetes applications. Mayastor uses a CSI driver with application and platform awareness to speed up migration for single and replicated volumes.  

**Guaranteed Efficient Memory Transfer** 

The Mayastor data plane is implemented in Rust, which includes a safe compiler that guarantees efficient memory transfer. NVMe architecture also ensures that each SSD controller communicates with one ring per CPU. This ensures the I/O controllers aren’t prone to internal locking, enabling simpler memory management. 

**Cloud-Agnostic Storage – Eliminate Vendor Lock-in** 

Mayastor storage controllers are orchestrated by Kubernetes, and data is accessed via containers. As the storage engine is deployed using a CSI driver, volumes can be provisioned using any container orchestrator or runtime, eliminating vendor lock-in. This construct allows organizations to use Mayastor to orchestrate any open-source storage service running on different Kubernetes distributions. 

**Felxible Horizontal Scalability** 

Mayastor integrates with OpenEBS Logical Volume Management (LVM), which pools underlying volumes and divides them into immutable logical units. These units can be replicated and distributed across multiple availability zones, enabling flexible horizontal scalability for storage workloads. 

**Seamless storage replication** 

The Mayadata storage controller simplifies the provisioning and replication of storage instances across pods, thereby enabling efficient deployment of cross-cloud storage for stateful applications. 
 

**Highly Available persistent data storage**  

Mayastor relies on Intel’s industry-leading Storage Performance Development Kit to deliver reliable access to persistent storage services and devices. The storage engine offers resilient volume services through synchronous replication that guarantees availability in case of node failures.  
 

**Easy deployment and management of storage services** 

The gRPC API simplifies operations management while providing security and easy configuration of the Mayastor data plane. The control plane implements application-aware data placement for fine-grained control over timeouts, restarts and errors of Kubernetes storage volumes.  
 

**Low-overhead storage abstraction** 

Mayastor follows the Container-Attached Storage (CAS) pattern, which orchestrates storage as a workload in Kubernetes. With CAS, storage scales predictably, allowing workloads to operate seamlessly with the storage system. Besides this, as Mayastor is built from the ground up to leverage the benefits of NVMe storage, the platform further reduces performance overhead. 

## Mayastor Evolution  

The section below explores Mayastor’s release history, noting the major milestones in the storage engine’s development.  

**V 0.1.0** 

This Alpha release was intended mostly for testing and development purposes and featured persistent volumes that could be exported over iSCI transport. 

**V 0.2.0** 

The first pre-release version of Mayastor included various useful features, such as: 

- NVMe-oF Support - The storage engine had the capability to create and share a Nexus with an established front-end target. 

- Mayastor Node CRD - With the resource definition enabled, storage admins can configure observability and persistence for Mayastor nodes.  

- Rebuild Process - This mechanism allowed to synchronously bring in new replicas without disrupting IO workloads by scheduling concurrent rebuild tasks. 
 

**V 0.3.0** 

Released on 12th August 2020, the second pre-release version of the storage engine included features such as:  

- NVMe-oF support for CSI plugins 

- Block mode for raw block access 

- Direct device access for Mayastor pools 

- Automatic replica replacement 

**V 0.4.0** 

Released on September 4, 2020, the fourth major version included numerous enhancements and new features. Major enhancements included: 

- Restart tolerance for the rebuild process 

- Nexus I/O internal retries for failed operations 

- Automatic generation of Mayastor pool names  
 

New features included:  

- Mayastor support for Kubernetes clusters built on K3s 

- Enhanced user documentation with simple navigation, improved UI and search 
 

**V 0.5.0** 

Features and enhancements of Mayastor 0.5.0 include: 

- Block device discovery through the gRPC API 

- Storage pool finalizers to prevent inadvertent deletion of volumes that contain replicas  
 

Mayastor V0.6.0 and 0.7.0 were maintenance releases, while V0.8.0 was a patch release that included various stability fixes in preparation for the first major production release.


**Mayastor 1.0** 

Mayastor 1.0 is released now with multiple enhancements and stable features that make the storage engine respond more resilient to failures. Some features to be included in the release are: 

- TCP access support 

- N-way synchronous replication for workload protection 

- Support for Prometheus metrics and visualization in Grafana 

- CSI driver for volume management 

Details on exactly what’s changed can be found in the release notes here.

## Why Choose Mayastor ? 

The Mayastor data plane leverages the full performance potential of storage systems, delivering high IOPS with less than 10% overhead. The declarative data plane utilizes developments of NVMe and SPDK to enable easy storage management. The following section outlines various features and benefits Mayastor offers.

## Mayastor Use-Cases 

**Storage unification** 

The Mayastor data plane can be deployed on any cloud running a Kubernetes environment. Storage teams can deploy storage controllers on multiple environments, on-premises and from cloud storage providers, and manage them from a central interface. 
 

**Low latency workloads** 

NVMe and NVMe-oF architectures reduce storage network latency and support high-speed storage media by eliminating bottlenecks caused by SATA connections.  
 

**Programmatic storage access** 

With CAS, the storage controller does not have to make system calls for IOPS operations. Storage access is simplified since the controllers write to file and block storage devices directly from within the application. 
 

**Server consolidation** 

Mayastor can manage heterogeneous workloads by orchestrating multiple data planes from a single control plane. This allows storage experts to reduce the number of compute resources required to process IO requests, reducing storage costs while increasing efficiency. 
 

**Containers on Micro-VM servers** 

Mayastor volumes can be used to provide storage over vhost users, enabling storage teams to persist data for multi-tenant containers in virtual machines. Mayastor storage controllers can be deployed on lightweight virtual machines (MicroVMs) and function-based services to enable the efficient execution of IO tasks for serverless and container workloads. 

## Summary  

OpenEBS Mayastor is the first Container Attached Storage engine developed with the tremendous performance capabilities of the NVMe protocol itself in mind. Written in Rust and open source, Mayastor should be the preferred choice for workloads that need the ease of  use and portability of OpenEBS plus the performance otherwise only delivered by the much harder to manage and to protect direct access to high performing disks and cloud volumes. 
 

To know more on how Mayastor can help provision lightning fast storage solution for your dynamic workloads, drop us a message [here](https://openebs.io/community). Alternatively, you can also visit the official documentation to learn more about Mayastor, its appropriate use-cases, and feature announcements. 
