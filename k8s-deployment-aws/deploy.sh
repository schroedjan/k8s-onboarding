podman build -t localhost:32000/hello-world-python .
podman push --tls-verify=false localhost:32000/hello-world-python:latest
kubectl apply -f deployment.yaml
kubectl rollout restart deployment hello-world-python -n application-aws
