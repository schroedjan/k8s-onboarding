# KrakenD Controller

A custom Kubernetes controller to manage KrakenD Config. It enables the user to dynamically create Endpoint configuration using custom resources, which then will be applied to the KrakenD instance. The controller watches for changes in the custom resources and updates the KrakenD configuration accordingly.

## Build

```bash
./build.sh
```

## Create the K8s resources

```bash
kubectl apply -f crd.yaml

kubectl apply -f deployment.yaml
```

## Create the custom resource

```bash
kubectl apply -f endpoint.yaml
```

```

```
