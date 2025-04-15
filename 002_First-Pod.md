# First Pod

## Deploy first Pod

```bash
kubectl run --restart=Never --image=gcr.io/kuar-demo/kuard-amd64:blue kuard
kubectl expose pod --type=NodePort --port=8080 kuard
```

Use the calico-node pod IP to access the application from windows host system.

```bash
kubectl get pod -l k8s-app=calico-node -n kube-system -o wide
```

