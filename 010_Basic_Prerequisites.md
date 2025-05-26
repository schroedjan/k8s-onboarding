# Basic Prerequisites

The following prerequisites are required to run the Kubernetes cluster on your local machine.

## Enable Hyper-V

Open a PowerShell terminal as Administrator and run the following command:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All -NoRestart
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All -NoRestart
```

This command enables the Hyper-V Feature in Windows, needed to run virtual machines. You may need to restart after this step to complete the configuration.

## Update WSL Version

Make sure you are using WSL Version 2.

```powershell
wsl --version
wsl --install
wsl --update
wsl --set-default-version 2
```

Enable SystemD in WSL

```powershell
echo -e "[boot]\nsystemd=true" | sudo tee /etc/wsl.conf
```

Restart WSL

```powershell
wsl --shutdown
```

## Install WSL Distribution

You can install a WSL distribution of your choice. For this guide, we will use Ubuntu.

```powershell
wsl --install Ubuntu --location c:\dev\wsl\k8s --name k8s
wsl -d k8s
> Provisioning the new WSL instance k8s
> This might take a while...
> Create a default Unix user account: <myusername>
> New password:
> Retype new password:
> passwd: password updated successfully
```

After the installation you can start the WSL distribution by running:

```powershell
wsl -d k8s
```

All following commands will be run in the WSL distribution. You can also use the WSL terminal in Visual Studio Code by opening the command palette (Ctrl + Shift + P) and selecting "Remote-WSL: New Window". This will open a new window connected to your WSL distribution.

## Update Packages and install package manager

To continue with the local configuration, we need to update the packages and install some additional tools.
Run the following commands in your WSL terminal:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential procps curl file git uidmap iptables
```

To install further tooling, we use homebrew as package manager. Run the following commands to install homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After the installation, you need to add homebrew to your PATH. Run the following command:

```bash
test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bashrc
```

## Install and configure tools

To run kubernetes locally and work with it, we need to install some additional tools. As container runtime we will use Podman. If you want to use Docker, you can install it instead of Podman.

```bash
brew install podman k9s kubectl direnv
```

For direnv to work, you need to hook it into your shell. Run the following command:

```bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
```
