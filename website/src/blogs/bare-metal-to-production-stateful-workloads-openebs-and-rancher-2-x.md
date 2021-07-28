---
title: Bare metal to production stateful workloads- OpenEBS and Rancher 2.x
author: Dave Cook
author_info: Building Cooby Cloud at Hetzner
date: 18-12-2018
tags: OpenEBS, Stateful Workloads, Bare metal, Docker
excerpt: Besides having a really cool name, Montel Intergalactic is also a cool company to work with. I met one of their engineers in an OpenEBS Slack forum and explained to him what I was up to
not_has_feature_image: true
---

Besides having a really cool name, [Montel Intergalactic](https://www.montel.fi/index.en.html) is also a cool company to work with. I met one of their engineers in an OpenEBS Slack forum and explained to him what I was up to. The next thing was that within a week we had everything setup at Hetzner. All Montel wanted in return was this humble blog post. A note to others in the space, THIS is how you build customer loyalty and a simple gesture like this can go a long way.

Needless to say when we decide on our next vendor these guys will be at the top of the list. In fact, they’ll probably be the only ones on that list (next to [OpenEBS](https://www.openebs.io/?__hstc=216392137.052f484bfa6105a863fd21af0f05de61.1579868893254.1579868893254.1579868893254.1&amp;__hssc=216392137.1.1579868893255&amp;__hsfp=3765904294) of course!).

This blog will outline the detailed steps we took to achieve our goal of setting up a bare-metal Kubernetes cluster at Hetzner from scratch using Rancher 2.x, Hetzner node driver, OpenEBS, Cert-Manager, Nginx Ingress loadbalancing and the deployment of the Tutem — Hello World app to demonstrate loadbalancing and Let’s Encrypt.

**NOTE:** All nodes are created with Hetzner CX21 type servers. Our root domain is `cooby.tech` and an `A` record called `rancher.cooby.tech` points to the instance IP.

### Initial Setup

We’ll be creating 4 Hetzner cluster servers:

1. `front-1` nginx-ingress loadbalancing (type: worker)
2. `control-1` control plane (type: etcd, control)
3. `worker-1` first worker (type: worker)
4. `worker-2` second worker (type: worker)

- Spin up a Hetzner CX21 instance with a Ubuntu 18.04 image
- Generate a keypair and make sure you can ssh into the instance
- Install docker and docker-compose from your local machine:

    curl https://gist.githubusercontent.com/gridworkz/d78c290c4e6fd7753dc21bb50601745a/raw/625fc3b7ddb7a654fe379f67d0bb9c6ac5b9413a/InstallDockerCompose | ssh -i ~/.ssh/<privkey> root@rancher.cooby.tech
    “/bin/bash -s”

- Login to the instance and add a docker-compose.yml file to run Rancher:

    ![Login to instance](/images/blog/login-to-instance.png)

- Run:

    docker-compose up -d

- `Install Hetzner node-driver from:` [https://mxschmitt.github.io](https://mxschmitt.github.io/ui-driver-hetzner/)
- `Create a node-template for frontend`
- `Add label loadbalancer=true`
- `Remove iscsi driver with cloud-init:`

![Remove iscsi driver](/images/blog/remove-iscsi-driver.png)
- Create a node template for workers using the same cloud-config

## Application Configuration

Schedule pods so that they are not running on a node with tag **loadbalancer**. This is not a hard requirement, but in our example cluster it really makes sense.

![application config](/images/blog/application-config.png)

## Adding Nginx-Ingress

DNS scheme is configured like this:

- `.cooby.tech` A <`loadbalancer machines`>

Which enables you to use:

- **Example 1.** `cooby.tech` and to use nginx ingress to route it to the example1 workload. Also in the DNS server, you can do, for example, cooby.in.montel.care CNAME montel.cooby.tech and again use our nginx-loadbalancer to route cooby.in.montel.care to your desired workload.

**Pro Tip:** Once an Ingress service is created it defaults to port 42. Remember to edit the services’ YAML and change it to the port your application requires. You will save yourself hours of confusion.

## Let’s Encrypt Issuer

The simplest way to add Let’s Encrypt in Rancher is to install it via catalog apps.

After that every ingress that contains the following annotations:

![ingress](/images/blog/ingress.png)

Will be automatically handled by Let’s Encrypt.

The first time you add an ingress you have to give the certificate a name by editing YAML and adding only the underlined parts below. Other ingresses can be added within the Rancher UI.

![rancher-ui](/images/blog/rancher-ui.png)

## Adding OpenEBS

- Login to each node and run: *apt-get install open-iscsi*
- Confirm that open-iscsi is active: *systemctl status open-iscsi*
- Navigate to global -> catalog in Rancher UI and enable Helm/Stable
- Select OpenEBS and install it via Helm Charts

This will install base OpenEBS complete with storage classes. The next step is to create a persistent volume / persistent volume claim. This can be easily accomplished by running the following YAML:

![pvc](/images/blog/pvc.png)

This will create a persistent volume claim named demo-vol1-claim with 10 GB of space in the storageClass: openebs-jiva-default. This storageClassName can then be passed as a parameter to various applications that require persistent and scale-able storage.

## Conclusion

In this blog, we set out to build a simple Kubernetes cluster on Hetzner server instances. The goal was to put together an introduction to building Kubernetes from scratch by using some of the great tools that are out there that make this process simpler. This should act as a good foundation for any development or POC system. In fact, we use this setup over at [Cooby Cloud](http://cooby.io/). With the goodwill gesture from [Montel Intergalactic](https://www.montel.fi/index.en.html), I was able to get this up and running within a week. Hats off to them and the great folks on the [OpenEBS](https://www.openebs.io/?__hstc=216392137.052f484bfa6105a863fd21af0f05de61.1579868893254.1579868893254.1579868893254.1&amp;__hssc=216392137.1.1579868893255&amp;__hsfp=3765904294) Slack channel.

Next up in this series I’ll demonstrate how to install Postgres and Odoo on this design utilizing some of the wicked tools over at [XOE Solutions](https://xoe.solutions/).

`Originally published at `[coobycloud.blogspot.com](https://coobycloud.blogspot.com/)` on December 19, 2018.`
