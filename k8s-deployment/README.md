# Kubernetes Deployment Example

1. build the image and deploy the application by running:

```bash
./deploy.sh
```

2. check the deployment status

```bash
kubectl get deployments
```

3. call the service

```bash
curl http://localhost:30001            # from wsl
curl http://localhost:30001/hello      # from wsl
curl http://localhost:30001/hello/name # from wsl
```
