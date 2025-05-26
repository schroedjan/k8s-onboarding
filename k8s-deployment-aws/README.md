# K8s Deployment with AWS access

The following sample app is a simple REST API that returns a list of S3 buckets in the configured AWS account. It showcases how to deploy a simple application on the local Microk8s cluster and access AWS resources with temporary credentials.
Its written in Python and uses the Flask framework.

## Prerequisites

You need to have worked through the following tutorials:

- [Basic Prerequisites](../010_Basic_Prerequisites.md)
- [MicroK8s](../021_MicroK8s.md)

## Installation

Build and deploy the application by running:

```bash
./deploy.sh
```

To make sure the application can access AWS resources, you need to create temporary credentials. This can be done by running the following command:

```bash
../scripts/get-aws-creds.sh -r <role-name:-icp/maintainer> -ns application-aws -p <aws-profile:-default>
```

## Accessing the application

Afet installation you can access the application by running the following command:

```bash
curl localhost:30002/hello
curl localhost:30002/sns
```

If the aws permissions are correct, you should see the list of existing SNS topics in your account.
