---
sidebar_position: 1
---

# Managed database service like RDS

## Introduction

MySQL is most ubiquitous and commonly used database. RDS is a service that make deploying and making MYSQL easy. With OpenEBS CAS architecture each user is assigned an independent stack of storage that serves just one instance of MySQL database, making it easy to handle the provisioning and post deployment operations like capacity increase and upgrades.

Use OpenEBS and MySQL containers to quickly launch an RDS like service, where database launch is instantaneous, availability is provided across zones and increase in requested capacity can happen on the fly.
