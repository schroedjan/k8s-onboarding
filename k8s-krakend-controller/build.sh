podman build -t localhost:32000/krakend-config-controller .
podman push --tls-verify=false localhost:32000/krakend-config-controller:latest
kubectl apply -f deployment.yaml
kubectl rollout restart deployment krakend-config-controller -n api-gateway
kubectl rollout status deployment krakend-config-controller -n api-gateway -w
