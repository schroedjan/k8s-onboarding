buildah build --build-arg ENV=dev -t krakend:latest .
buildah tag krakend localhost:32000/krakend:latest
buildah push --tls-verify=false localhost:32000/krakend:latest
kubectl apply -f ./krakend.yaml
kubectl rollout restart deployment krakend
