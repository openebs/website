---
sidebar_position: 2
---

# Using OpenEBS as TSDB for Prometheus

# Introduction

Each and every DevOps and SRE's are looking for ease of deployment of their applications in Kubernetes. After successful installation, they will be looking for how easily it can be monitored to maintain the availability of applications in a real-time manner. They can take proactive measures before an issue arise by monitoring the application. Prometheus is the mostly widely used application for scraping cloud native application metrics. Prometheus and OpenEBS together provide a complete open source stack for monitoring.

In this document, we will explain how you can easily set up a monitoring environment in your K8s cluster using Prometheus and use OpenEBS Local PV as the persistent storage for storing the metrics. This guide provides the installation of Prometheus using Helm on dynamically provisioned OpenEBS volumes.
