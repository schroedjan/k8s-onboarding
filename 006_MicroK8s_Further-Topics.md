# MicroK8s Housekeeping

## Using the microk8s built-in registry

### Enable the registry
```bash
microk8s enable registry
```

### Push an image to the registry

Using a locally exported image
```bash
microk8s ctr image import <image>.tar
```

Building with buildah
```bash
buildah build -t hello-world-app .
buildah tag hello-world-app localhost:32000/hello-world-app:latest
buildah push --tls-verify=false localhost:32000/hello-world-app:latest
```


### Pruning images
```bash
microk8s ctr images ls | awk '{ print $1 }' | while read line || [[ -n $line ]]; do microk8s ctr images rm $line; done;
```
