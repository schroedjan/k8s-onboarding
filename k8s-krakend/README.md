# Kubernetes KrakenD Example

## Prerequisites

Deploy the test application `hello-world-service` by following the steps in the example [k8s-deployment](../k8s-deployment/README.md).

## KrakenD API Gateway

1. Deploy the KrakenD API Gateway using the provided Kubernetes manifest.

```bash
kubectl apply -f krakend.yaml
```

2. Verify the deployment and service are running.

```bash
kubectl get pods
kubectl get svc
```

3. Access the KrakenD API Gateway

```bash
curl http://localhost:30080/                  # from wsl
curl http://localhost:30080/api/v1/           # from wsl
curl http://localhost:30080/api/v1/hello      # from wsl
curl http://localhost:30080/api/v1/hello/name # from wsl
```

## Configuration

Configuration is done via a JSON file. The configuration file is mounted as a ConfigMap in the KrakenD deployment.
See [krakend.yaml](krakend.yaml) for the configuration and change the configuration as described in the following steps.

1. Change the krakend configuration to use the headless service.

```json
...
"host": [
  "http://hello-world-service-headless:3000"
]
```

2. Change the krakend configuration to use the cluster local service address: <service-name>.<namespace>.svc.cluster.local:<service-port>

```json
...
"host": [
  "http://hello-world-service.default.svc.cluster.local:3000"
]
```

3. Open a shell on a krakend pod and check dns resolution for services

```bash
kubectl exec -it <krakend-pod-name> -- /bin/sh

nslookup hello-world-service
```
