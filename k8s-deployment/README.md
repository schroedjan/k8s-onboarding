# Kubernetes Deployment Example

1. Build the image

```bash
./deploy.sh
```

2. Check the deployment status

```bash
kubectl get deployments
```

3. Call the service

```bash
curl http://localhost:3000 # from wsl

curl http://172.29.238.34:3000 # from host
```
