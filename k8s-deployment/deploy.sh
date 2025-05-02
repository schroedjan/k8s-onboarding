buildah build -t hello-world-service .
buildah tag hello-world-service localhost:32000/hello-world-service:latest
buildah push --tls-verify=false localhost:32000/hello-world-service:latest
kubectl apply -f deployment.yaml
kubectl rollout restart deployment hello-world-service -n application
