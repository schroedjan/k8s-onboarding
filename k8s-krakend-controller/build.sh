buildah build -t krakend-config-controller .
buildah tag krakend-config-controller localhost:32000/krakend-config-controller:latest
buildah push --tls-verify=false localhost:32000/krakend-config-controller:latest
kubectl apply -f deployment.yaml
kubectl rollout restart deployment krakend-config-controller -n api-gateway
kubectl rollout status deployment krakend-config-controller -n api-gateway -w
