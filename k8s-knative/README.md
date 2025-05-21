# K8s KNative Example

This is a simple example of how to use KNative with K8s.

## Prerequisites

Deploy the test application `hello-world-service` by following the steps in the example [k8s-deployment](../k8s-deployment/README.md).

## KNative installation

### Install Operator via helm

```bash
helm repo add knative-operator https://knative.github.io/operator
helm repo update

helm install knative-operator --create-namespace --namespace knative-operator knative-operator/knative-operator
```

### Install KNative Serving

```bash
kubectl apply -f knative-serving.yaml
```

## Deploy KNative Service

```bash
kubectl apply -f service.yaml
```

## Access KNative Service

```bash
curl -H "Host: hello-world.knative-services.svc.kn" localhost:31080/           # from wsl
curl -H "Host: hello-world.knative-services.svc.kn" localhost:31080/hello      # from wsl
curl -H "Host: hello-world.knative-services.svc.kn" localhost:31080/hello/name # from wsl
```

To measure the time it takes to get a response, you can use the following command:

```bash
curl -s -w '\n\nTotal: %{time_total}s\n' -H "Host: hello-world.knative-services.svc.kn" localhost:31080/
```
