kubectl apply -k .
kubectl rollout restart deployment api-gateway -n api-gateway
