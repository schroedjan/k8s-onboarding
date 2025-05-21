podman build -t localhost:32000/hello-world-service .
podman push --tls-verify=false localhost:32000/hello-world-service:latest
kubectl apply -f deployment.yaml
kubectl rollout restart deployment hello-world-service -n application
