# Kubernetes Job Example

1. Build the image

```bash
./build.sh
```

2. Create the job

```bash
kubectl apply -f job.yaml
```

3. Check the job status

```bash
kubectl get jobs
```
