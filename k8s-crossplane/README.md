# CrossPlane

Crossplane is an open-source Kubernetes add-on that enables you to manage cloud resources using Kubernetes-style APIs. It allows you to provision and manage infrastructure resources such as databases, storage, and networking directly from your Kubernetes cluster.

## Prerequisites

## Installation

1. add the crossplane helm repo

```bash
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update
```

2. install crossplane

```bash
helm install crossplane --namespace crossplane-system --create-namespace crossplane-stable/crossplane
```

3. install the aws provider

```bash
kubectl apply -f aws-provider.yaml
```

4. create temporary credentials. You can use the given `get-aws-credentials.sh` script to create temporary credentials. This will assume the given role with the aws cli and store the credentials in a kubernetes secret. The secret is already configured to be used by the crossplane provider. You can rerun the script to update the credentials at any time.

```bash
./get-aws-credentials.sh -r <role-name:-icp/maintainer> -p <aws-profile:-default>
```

5. create the aws resource. See the example in `aws-sns-topic.yaml`:

```bash
kubectl apply -f aws-sns-topic.yaml
```

## Further Reading

- [Crossplane AWS Provider Examples](https://github.com/crossplane-contrib/provider-aws/tree/master/examples)
