---
sidebar_position: 4
---

## Node Disk Manager

Node Disk Manager(NDM) is an important component in the OpenEBS architecture. NDM treats block devices as resources that need to be monitored and managed just like other resources such as CPU, Memory and Network. It is a daemonset which runs on each node, detects attached block devices based on the filters and loads them as block devices custom resource into Kubernetes. These custom resources are aimed towards helping hyper-converged Storage Operators by providing abilities like:

Easy to access inventory of Block Devices available across the Kubernetes Cluster.
Predict failures on the Disks to help with taking preventive actions.
Allow dynamically attaching/detaching disks to a storage pod, without restarting the corresponding NDM pod running on the Node where the disk is attached/detached.
In spite of doing all of the above, NDM contributes to overall ease of provisioning persistent volumes.
