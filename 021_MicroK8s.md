# MicroK8s on WSL

## Prerequisites

Make sure to follow all steps in the [Basic Prerequisites](./010_Basic_Prerequisites.md) document before proceeding with this guide.

## Installation

1. install microk8s

```bash
sudo snap install microk8s --classic
```

2. add default user to group

```shell
sudo usermod -aG microk8s $USER
newgrp microk8s
```

3. test microk8s status

```shell
microk8s status
```

## Enable MicroK8s Addons

```bash
microk8s enable registry
```

## Create cluster config for kubectl

```bash
microk8s kubectl config view --raw > ~/.kube/config
```

## Set Kubernetes Context

```bash
kubectl config use-context microk8s
```
