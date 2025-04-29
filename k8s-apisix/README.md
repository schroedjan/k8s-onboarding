# K8s ApiSix Example

This is an example of how to use K8s ApiSix with a simple web application. The application is a simple express server that returns "Hello World" when accessed. The application is deployed on a Kubernetes cluster and is exposed to the internet using ApiSix.

## Prerequisites

Make sure you have enabled the MicroK8s features `registry`. Furthermore you need the `kubectl` and `helm` cli tools.

Make sure to already have deployed the [K8s Deployment](../k8s-deployment/README.md) example service!

## Example

1. Deploy the ApiSix API Gateway using helm.
```bash
helm repo add apisix https://charts.apiseven.com
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install apisix apisix/apisix --create-namespace --namespace apisix \
--set service.type=NodePort \
--set ingress-controller.enabled=true \
--set ingress-controller.config.apisix.serviceNamespace=apisix \
--set ingress-controller.config.apisix.adminAPIVersion=v3
```

Expose the service using apisix CRDs

```bash
kubectl apply -f apisix.yaml
```

This creates an ingress object for the hello-world-service utilizing the proxy-rewrite plugin of apisix enabling the following routes:
- <gateway>/* -> <service>/*
- <gateway>/api/v1/hello* -> <service>/hello*
- <gateway>/api/v1/error -> <service>/error

You can test the service endpoints utilizing the node IP and the apisix gateway service port:
```bash
export GATEWAY_IP = kubectl get node -o json | jq '.items[0].status.addresses[] | select(.type == "InternalIP")'
export GATEWAY_PORT kubectl get svc apisix-gateway -n apisix -o json | jq '.spec.ports[0].nodePort'

curl -X GET -H "Host: local.hello-world.com" $GATEWAY_IP:$GATEWAY_PORT/api/v1/hello
curl -X GET -H "Host: local.hello-world.com" $GATEWAY_IP:$GATEWAY_PORT/api/v1/hello/Name
```


