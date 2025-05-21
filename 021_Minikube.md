# Minikube on WSL

## Prerequisites

See [Basic Prerequisites](./021_Basic_Prerequisites.md) for the basic prerequisites.

## Install Minikube

```bash
brew install minikube
```


## Configure Minikube

```bash
minikube config set rootless true
```

## Start Minikube

To start Minikube with 4 CPUs and 4GB of memory, run the following command:
```bash
minikube start --cpus 4 --memory 4096
```

After starting Minikube, you can check the status of the cluster by running:
```bash
minikube status
```

## Local Registry

To enable the built-in registry, run:
```bash
minikube addons enable registry
```

Running in podman, the registry receives a diffent port every time you start minikube. To get the current port and write it to your environment, run:

```bash
echo "export REGISTRY_PORT=$(podman port minikube 5000 | sed 's/.*://')" >> .envrc
direnv allow
```

After that, you can use the Environment Variabke `REGISTRY_PORT` in your build scripts to access the registry.
Example:

```bash
podman build -t localhost:${REGISTRY_PORT}/my-image:latest .
podman push localhost:${REGISTRY_PORT}/my-image:latest
```

After pushing the image, you can use it in your Kubernetes cluster by referencing the image as `localhost:5000/my-image:latest` in your Kubernetes manifests.
See the fixed port for internal use!
