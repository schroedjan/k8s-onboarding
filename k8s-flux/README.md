# Flux Setup

TODO: Still under construction. This is a work in progress!

## Installation

Install the flux CLI using your favorite package manager. For example, using Homebrew:

```bash
brew install fluxcd/tap/flux
```

## Install the flux controllers

Install the flux controllers to the cluster. You can create the install manifest with the flux CLI and then apply it to the cluster.

```bash
flux install --export > ./flux-install.yaml

kubectl apply -f ./flux-install.yaml
```

## Install Weave GitOps

First install the gitops CLI.

```bash
brew tap weaveworks/tap
brew install weaveworks/tap/gitops
```

```bash

## Sync OCI artifact using flux

Bootstraop the cluster with flux and install the OCI artifact.

```bash
flux bootstrap registry \
  --url=oci://localhost:32000\artifact \
  --image-ref ghcr.io/fluxcd/oci-helm-repo:latest \
  --export > ./flux-oci-bootstrap.yaml
kubectl apply -f ./flux-oci-bootstrap.yaml
```
