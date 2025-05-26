podman build -t localhost:32000/hello-world-python .
podman push --tls-verify=false localhost:32000/hello-world-python:latest
kubectl create secret generic aws-credentials -n application-aws
kubectl apply -f deployment.yaml
kubectl rollout restart deployment hello-world-python -n application-aws
