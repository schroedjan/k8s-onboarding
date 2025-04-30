# Kubernetes KrakenD ConfigMap Example

1. Deploy the KrakenD API Gateway using the provided Kubernetes manifest.
```bash
kubectl apply -k .
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

