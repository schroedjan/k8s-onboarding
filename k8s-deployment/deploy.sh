podman build -t hello-world-service .
podman tag hello-world-service 192.168.64.4:32000/hello-world-service:latest
podman push --tls-verify=false 192.168.64.4:32000/hello-world-service:latest
kubectl apply -f deployment.yaml
kubectl rollout restart deployment hello-world-service
