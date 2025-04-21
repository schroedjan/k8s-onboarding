# MicroK8s on WSL

## WSL Configuration

Enable SystemD in WSL
```powershell
echo -e "[boot]\nsystemd=true" | sudo tee /etc/wsl.conf
```

Restart WSL
```powershell
wsl --shutdown
```

## Install WSL Distribution

Install fresh wsl distribution
```powershell
wsl --install Ubuntu --location D:\wsl\k8s --name k8s
```

Startup wsl distro and setup default user
```powershell
❯ wsl -d k8s
Provisioning the new WSL instance k8s
This might take a while...
Create a default Unix user account: jan
New password:
Retype new password:
passwd: password updated successfully
```

Update packages
```bash
sudo apt update && sudo apt upgrade -y
```

## MicroK8s

install microk8s
```bash
sudo snap install microk8s --classic
```

add default user to group
```shell
sudo usermod -aG microk8s $USER
newgrp microk8s
```

test microk8s status
```shell
microk8s status
```

## Install and configure tools

```bash
sudo snap install k9s
alias m8s=microk8s
alias kubectl='microk8s kubectl'
alias k=kubectl

sudo apt update && sudo apt install -y podman
```

## Enable MicroK8s Addons

```bash
microk8s enable registry
```

## Create cluster config for kubectl
```bash
microk8s kubectl config view --raw > ~/.kube/config
```


## Set Kubernetes Context
```bash
kubectl config set-context microk8s
```
