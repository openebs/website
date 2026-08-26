---
id: airgapped-installation
title: OpenEBS Air-Gapped Installation
keywords:
  - OpenEBS air-gapped installation
  - offline installation
  - private registry
  - Local PV
  - Replicated PV Mayastor
description: This section explains how to install OpenEBS in an air-gapped (offline) environment using a private container registry, covering all storage components, including Local PV Hostpath, LVM, ZFS, Rawfile, and Replicated PV Mayastor.
---

# OpenEBS Air-Gapped Installation

## Overview

This document describes how to install OpenEBS into a Kubernetes cluster that has no direct access to the public internet (an "air-gapped" or "offline" environment).

An air-gapped cluster has no direct access to Docker Hub, GHCR, Quay, or `registry.k8s.io`. The installation therefore follows this workflow:

1. On an internet-connected host, gather the Helm chart, the `kubectl-openebs` plugin, and the full list of container images.
2. Pull every image, then retag and push them into a private registry that the air-gapped cluster can reach.
3. On the air-gapped cluster, install the Helm chart with image overrides that point every component at the private registry.

:::important
This document's commands and YAML samples use **OpenEBS v4.5.1**. Keep the chart version, the `images.txt` file you download, and the `--version` flag you pass to Helm on the same tag. Mixing versions (for example, a 4.5.0 chart with a 4.5.1 image list) leads to missing-image and digest-mismatch errors that are tedious to debug. If you are installing a different release, replace `4.5.1` throughout and regenerate the image list from the matching tag.
:::

## Storage Components

The OpenEBS umbrella chart bundles several storage components along with their dependencies.

| Component | Type | Notes |
| :--- | :--- | :--- |
| Local PV Hostpath | Storage (default) | Provisioner only; requires the `xfsprogs` package for quotas. |
| Local PV LVM | Storage (default) | Node must have LVM2 and a volume group. |
| Local PV ZFS | Storage (default) | Node must have ZFS and a zpool. |
| Local PV Rawfile | Storage | Provisioner only (experimental - not installed by default). |
| Replicated PV Mayastor | Storage (default) | Dependency set: NATS, etcd, MinIO, and the io-engine, which requires HugePages and the `nvme_tcp` kernel module on every storage node. |

:::note
The dependencies (Grafana Loki/Alloy, NATS, MinIO, the prometheus-operator config-reloader, the kiwigrid sidecar, and some upstream Kubernetes CSI sidecars) are pulled in mainly by Replicated PV Mayastor and the observability stack. If you only need the Local PV storage, you can install a much smaller image set. Refer to [Trimming the Image List](#trimming-the-image-list-optional).
:::

## Requirements

A supported Kubernetes version and a working CNI. Refer to [Prerequisites](../quickstart-guide/prerequisites.md).

### On the Internet-Connected Host

- `docker` or `podman` (set `CONTAINER_CLI=podman` to use Podman).
- `helm` v3 and `kubectl` (matching your cluster's minor version).
- `wget` or `curl`.
- Network access to your private registry, and credentials to push to it.
- Enough disk space to hold all images (if you export a tarball).

### On the Air-Gapped Cluster

- A reachable private container registry (Harbor, Nexus, Zot, the CNCF `distribution` registry, a cloud registry mirror, and so on), and every node must be able to pull from it. If the registry uses a private CA, install that CA on every node's container runtime before you begin.
- Kubernetes nodes prepared for the storage components you intend to use, as follows.

## Download the Artifacts (Internet-Connected Host)

Create a working directory and download everything for the pinned version.

```bash
# Keep the chart version, the images.txt file, and the --version flag passed to Helm on the same tag.
export OPENEBS_VERSION=4.5.1
mkdir -p openebs-airgap && cd openebs-airgap
```

### Image List

```bash
wget https://raw.githubusercontent.com/openebs/openebs/refs/tags/v${OPENEBS_VERSION}/charts/images.txt
```

:::tip
If you do not need every storage component, you can download a smaller `images.txt`. Refer to [Trimming the Image List](#trimming-the-image-list-optional) for a minimal example.
:::

### Helm Binary (for Transferring to the Air-Gapped Side, if Needed)

If the air-gapped host does not already have Helm, download the binary now so it can be copied across.

```bash
# Pick the version/architecture you need; example for Helm on linux/amd64:
wget https://get.helm.sh/helm-v3.16.2-linux-amd64.tar.gz
tar -zxvf helm-v3.16.2-linux-amd64.tar.gz
# The binary is at linux-amd64/helm
```

### Helm Chart Package

Add the repository, then pull the chart as a `.tgz` file so it can be moved offline.

```bash
helm repo add openebs https://openebs.github.io/openebs
helm repo update
helm pull openebs/openebs --version ${OPENEBS_VERSION}
# Produces openebs-${OPENEBS_VERSION}.tgz
```

Retain this `.tgz` file; [Install the Helm Chart](#3-install-the-helm-chart-air-gapped-cluster) uses it as a local source.

### `kubectl-openebs` Plugin (Optional but Recommended)

The [plugin](https://openebs.io/docs/main/user-guides/kubectl-openebs) is useful for managing and troubleshooting OpenEBS. Download the release binary that matches your platform and version from the OpenEBS releases page, and copy it across with the other artifacts. Install it into the `PATH` on the host from which you will run `kubectl` against the air-gapped cluster, so that `kubectl openebs ...` works.

## Pull Images and Push to Your Private Registry

Two scripts handle this step. They deliberately preserve each image's original org/path and only rewrite the source-registry host. This matters for OpenEBS because its image list spans multiple registries (`docker.io`, `quay.io`, and `registry.k8s.io`), as well as the same image at multiple tags (for example, `csi-snapshotter` at `v7.0.0`, `v8.2.0`, and `v8.2.1`). Preserving the path keeps these distinct, and means the Helm overrides only need to change the registry host, not every repository path.

The transformation applied is:

```text
docker.io/openebs/lvm-driver:1.9.1
  -> <your-registry>/openebs/lvm-driver:1.9.1

registry.k8s.io/sig-storage/csi-attacher:v4.8.1
  -> <your-registry>/sig-storage/csi-attacher:v4.8.1
```

### Save (Pull) Images

Run [`openebs-save-images.sh`](#save-images-script) on the connected host. If the connected host can reach the private registry directly, the tarball step can be skipped and you can go straight to the push step. Otherwise, export a tarball to carry across the air gap.

```bash
# Pull only (connected host can push to the registry directly):
./openebs-save-images.sh --image-list images.txt

# Or pull AND export to a tarball for transfer:
./openebs-save-images.sh --image-list images.txt --images openebs-images.tar.gz
```

### Transfer (Only if a Tarball Was Exported)

Copy `openebs-images.tar.gz`, the chart `.tgz`, `images.txt`, the Helm binary, the plugin, and the pull and push scripts to a host that can reach the private registry.

### Push Images

Log in to your private registry, then run [`openebs-push-images.sh`](#push-images-script):

```bash
docker login <registry-url>

# If a tarball was transferred, load and push it:
./openebs-push-images.sh \
  --registry <registry-url> \
  --image-list images.txt \
  --images openebs-images.tar.gz

# If the images are already present locally (no tarball), push directly:
./openebs-push-images.sh \
  --registry <registry-url> \
  --image-list images.txt
```

After this step completes, every image in `images.txt` exists in your private registry under its original org/path.

### Trimming the Image List (Optional)

For a Local PV-only install, remove the Replicated PV Mayastor and observability images from `images.txt` before running the scripts. For example:

```
docker.io/openebs/provisioner-localpv:4.5.1
docker.io/openebs/lvm-driver:1.9.1
docker.io/openebs/zfs-driver:2.10.1
docker.io/openebs/rawfile-localpv:v0.14.1
docker.io/openebs/linux-utils:4.5.0
docker.io/openebs/alpine-bash:4.5.0
# plus the CSI sidecars used by the LVM/ZFS/Rawfile drivers you enable
```

:::note
The `ghcr.io/openebs/mayastor/dev/*` images are only needed if Mayastor is explicitly pointed at the `dev` image set; most installations do not need them. When in doubt, keep the full list, since the extra images are harmless.
:::

## Install the Helm Chart (Air-Gapped Cluster)

Install from the local chart package transferred in the previous step, overriding the image locations so every component pulls from your private registry.

### Create a Pull Secret (if Your Registry Requires Authentication)

```bash
kubectl create namespace openebs

kubectl create secret docker-registry openebs-regcred \
  --namespace openebs \
  --docker-server=<registry-url> \
  --docker-username='<user>' \
  --docker-password='<password>'
```

### Build a `values.yaml` File with Your Registry

Create `airgap-values.yaml`. The block below shows the shape of the override; replace the placeholder keys with the ones confirmed above.

```yaml
global:
  imageRegistry: "<registry-url>" # Used by ZFS, LVM, Rawfile, Mayastor components and etcd
  imagePullSecrets:
    - openebs-regcred # Used by ZFS, LVM, Rawfile, Mayastor components and etcd
  image:
    registry: "<registry-url>" # Used by Loki and Alloy
    pullSecrets:
      - name: openebs-regcred # Used by Alloy

mayastor:
  nats:
    imagePullSecrets:
      - name: openebs-regcred
    nats:
      image:
        registry: "<registry-url>"
    reloader:
      image:
        registry: "<registry-url>"
    exporter:
      image:
        registry: "<registry-url>"

loki:
  imagePullSecrets:
    - name: openebs-regcred
  minio:
    imagePullSecrets:
      - name: openebs-regcred
    image:
      repository: "<registry-url>/minio/minio"
    mcImage:
      repository: "<registry-url>/minio/mc"
  sidecar:
    image:
      repository: "<registry-url>/kiwigrid/k8s-sidecar"
```

### Install

```bash
helm install openebs ./openebs-4.5.1.tgz \
  --namespace openebs \
  --create-namespace \
  --values airgap-values.yaml
```

## Verify the Installation

```bash
# All pods should reach Running/Completed with no ImagePullBackOff:
kubectl get pods -n openebs -o wide

# Confirm images resolve to your private registry:
kubectl get pods -n openebs \
  -o jsonpath='{range .items[*]}{range .spec.containers[*]}{.image}{"\n"}{end}{end}' \
  | sort -u

# Confirm imagePullSecrets is set on all pods:
kubectl get pods -n openebs -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.imagePullSecrets}{"\n"}{end}'

# StorageClasses created by the enabled storage components:
kubectl get sc
```

If any pod is stuck in `ImagePullBackOff`, describe it to read the exact image reference Kubernetes is trying to pull:

```bash
kubectl describe pod -n openebs <pod-name> | grep -iA2 image
```

A wrong host, a missing org/path segment, or a missing pull secret is almost always the cause. Cross-check the failing reference against what the push script wrote into your registry.

## Save Images Script

:::note
Save this file, run `chmod +x openebs-save-images.sh`, and run it on the internet-connected host.
:::

```bash
#!/usr/bin/env bash
#
# openebs-save-images.sh
# Pulls every image in an OpenEBS images.txt on an internet-connected host,
# and (optionally) exports them to a single tar.gz for transfer into an
# air-gapped environment.
#
# Unlike a single-namespace flatten, this script does NOT rewrite image
# paths. It pulls each reference exactly as listed so the full
# registry/org/path structure is preserved for the push step.

list="images.txt"
CONTAINER_CLI=${CONTAINER_CLI:-docker}

while [[ $# -gt 0 ]]; do
	key="$1"
	case $key in
		-i|--images)
		images="$2"
		shift; shift
		;;
		-l|--image-list)
		list="$2"
		shift; shift
		;;
		-p|--platform)
		platform="$2"
		shift; shift
		;;
		-h|--help)
		help="true"
		shift
		;;
		*)
		echo "Error! invalid flag: ${key}"
		help="true"
		break
		;;
	esac
done

usage () {
	echo "USAGE: $0 [--image-list images.txt] [--images openebs-images.tar.gz] [--platform linux/amd64]"
	echo "  [-l|--image-list path]   text file with a list of images, one per line."
	echo "  [-p|--platform os/arch]  pull each image for the specified platform (e.g. linux/amd64)."
	echo "  [-i|--images path]       tar.gz to create via 'save'. If omitted, images are only pulled,"
	echo "                           not exported (use this when the connected host can push directly"
	echo "                           to the private registry)."
	echo "  [-h|--help]              this message."
	echo ""
	echo "To use podman instead of docker set the environment variable CONTAINER_CLI=podman"
}

if [[ $help ]]; then
	usage
	exit 0
fi

if [[ ! -f "$list" ]]; then
	echo "Error: image list '$list' not found." >&2
	exit 1
fi

set -e -x

# Ignore blank lines and comments so the list stays editable.
mapfile -t refs < <(grep -vE '^[[:space:]]*(#|$)' "${list}")

for i in "${refs[@]}"; do
	if [ -n "$platform" ]; then
		$CONTAINER_CLI pull "${i}" --platform "$platform"
	else
		$CONTAINER_CLI pull "${i}"
	fi
done

if [[ $images ]]; then
	$CONTAINER_CLI save "${refs[@]}" | gzip -c > "${images}"
fi
```

## Push Images Script

:::note
Save this file, run `chmod +x openebs-push-images.sh`, and run it on the host that can reach your private registry.
:::

```bash
#!/usr/bin/env bash
#
# openebs-push-images.sh
# Loads images (optionally from a tar.gz) and pushes them to a private
# registry, PRESERVING each image's original org/path and tag.
#
# The OpenEBS image list spans several source registries
# (docker.io, ghcr.io, quay.io, registry.k8s.io). This script rewrites
# ONLY the source-registry host, e.g.
#
#   docker.io/openebs/lvm-driver:1.9.1
#     -> my.registry:5000/openebs/lvm-driver:1.9.1
#
#   registry.k8s.io/sig-storage/csi-attacher:v4.8.1
#     -> my.registry:5000/sig-storage/csi-attacher:v4.8.1
#
#   ghcr.io/openebs/mayastor/dev/mayastor-io-engine:v2.11.1
#     -> my.registry:5000/openebs/mayastor/dev/mayastor-io-engine:v2.11.1
#
# Preserving the path keeps otherwise-identical basenames distinct
# (the docker.io/openebs/* set vs the ghcr.io/openebs/mayastor/dev/* set)
# and keeps multiple tags of the same image (e.g. csi-snapshotter v7/v8)
# intact. It also means your Helm overrides only need to change the
# registry host, not every repository path.

list=""
CONTAINER_CLI=${CONTAINER_CLI:-docker}

while [[ $# -gt 0 ]]; do
	key="$1"
	require_value () {
		if [[ -z "$2" || "$2" == -* ]]; then
			echo "Error: option '$1' requires a value." >&2
			exit 1
		fi
	}
	case $key in
		-r|--registry)
		require_value "$key" "$2"
		reg="$2"
		shift; shift
		;;
		-l|--image-list)
		require_value "$key" "$2"
		list="$2"
		shift; shift
		;;
		-i|--images)
		require_value "$key" "$2"
		images="$2"
		shift; shift
		;;
		-h|--help)
		help="true"
		shift
		;;
		*)
		echo "Error! invalid flag: ${key}"
		help="true"
		break
		;;
	esac
done

usage () {
	echo "USAGE: $0 --registry <registry-url> --image-list images.txt [--images openebs-images.tar.gz]"
	echo "  [-r|--registry host:port] target private registry (required)."
	echo "  [-l|--image-list path]    text file with a list of images, one per line (required)."
	echo "  [-i|--images path]        tar.gz produced by the save step. If omitted, the script"
	echo "                            assumes the images are already present locally."
	echo "  [-h|--help]               this message."
	echo ""
	echo "To use podman instead of docker set the environment variable CONTAINER_CLI=podman"
}

if [[ $help ]]; then
	usage
	exit 0
fi

if [[ -z $reg ]]; then
	echo "Error: --registry is required." >&2
	usage
	exit 1
fi

if [[ -z $list ]]; then
	echo "Error: --image-list is required." >&2
	usage
	exit 1
fi

if [[ ! -f "$list" ]]; then
	echo "Error: image list '$list' not found." >&2
	exit 1
fi

set -e -x

if [[ $images ]]; then
	$CONTAINER_CLI load --input "${images}"
fi

 mapfile -t refs < <(grep -vE '^[[:space:]]*(#|$)' "${list}")

for src in "${refs[@]}"; do
	# Strip the source-registry host (first path segment) only.
	# All source refs here are fully qualified (docker.io/..., ghcr.io/...,
	# quay.io/..., registry.k8s.io/...), so the first segment before the
	# first '/' is always the host.
	path="${src#*/}"
	dst="${reg}/${path}"

	# Resolve the locally-stored reference. Docker Hub images are normalized
	# on pull: 'docker.io/grafana/alloy:x' is stored as 'grafana/alloy:x',
	# and 'docker.io/nats:x' (implicit library/) as 'nats:x'. Try the ref as
	# listed first, then the docker.io-stripped form, then the bare name.
	local_ref=""
	for cand in "${src}" "${src#docker.io/}" "${src#docker.io/library/}"; do
		if $CONTAINER_CLI image inspect "${cand}" >/dev/null 2>&1; then
			local_ref="${cand}"
			break
		fi
	done

	if [[ -z $local_ref ]]; then
		echo "ERROR: image not found locally for '${src}'." >&2
		echo "       Run the save step first, or pass --images <tarball> to load it." >&2
		exit 1
	fi

	$CONTAINER_CLI tag "${local_ref}" "${dst}"
	$CONTAINER_CLI push "${dst}"
done
```

## See Also

- [Prerequisites](../quickstart-guide/prerequisites.md)
- [OpenEBS Installation](../quickstart-guide/installation.md)
- [Configuration](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-create-diskpool.md)
- [Deploy an Application](../user-guides/replicated-storage-user-guide/replicated-pv-mayastor/configuration/rs-deployment.md)
