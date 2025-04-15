# Kubernetes KrakenD Example

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
curl http://localhost:30080/ # from wsl

curl http://172.29.238.34:30080 # from host
```

4. Change the krakend configuration to use the headless service
```json
...
"host": [
  "http://hello-world-service-headless:3000"
]
```

5. Change the krakend configuration to use the cluster local service address: <service-name>.<namespace>.svc.cluster.local:<service-port>
```json
...
"host": [
  "http://hello-world-service.default.svc.cluster.local:3000"
]
```

6. Open a shell on a krakend pod and check dns resolution for services
```bash
kubectl exec -it <krakend-pod-name> -- /bin/sh

nslookup hello-world-service
```
