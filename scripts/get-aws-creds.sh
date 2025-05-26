#!/bin/bash

set -e

# Defaults
SECRET_NAME="aws-credentials"
NAMESPACE=""
AWS_PROFILE="${AWS_PROFILE:-default}"
ROLE_NAME="icp/maintainer"

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -n|--secret-name)
      SECRET_NAME="$2"
      shift
      shift
      ;;
    -ns|--namespace)
      NAMESPACE="$2"
      shift
      shift
      ;;
    -p|--aws-profile)
      AWS_PROFILE="$2"
      shift
      shift
      ;;
    -r|--role-name)
      ROLE_ARN="$2"
      shift
      shift
      ;;
    *)
      echo "Usage: $0 [--secret-name name] --namespace ns [--aws-profile profile] [--role-name name]"
      exit 1
      ;;
  esac
done

# Check if namespace is provided, if not set a default
if [ -z "$NAMESPACE" ]; then
  # Read namespace from kubectl default
  NAMESPACE=$(kubectl config view --minify -o jsonpath='{..namespace}')
  if [ -z "$NAMESPACE" ]; then
    echo "Error: No namespace provided and no default namespace found in kubectl config."
    exit 1
  fi
fi

# print paramater values for debug
echo "Secret Name: $SECRET_NAME"
echo "Namespace: $NAMESPACE"
echo "AWS Profile: $AWS_PROFILE"
echo "Role Name: $ROLE_NAME"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)

# Get temporary credentials using assume-role if ROLE_NAME is set, else exit with error
if [ -z "$ROLE_NAME" ]; then
  echo "Error: --role-name is required."
  exit 1
fi

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

CREDS_JSON=$(aws sts assume-role --role-arn "$ROLE_ARN" --role-session-name crossplane-session --profile "$AWS_PROFILE")

AWS_ACCESS_KEY_ID=$(echo "$CREDS_JSON" | jq -r '.Credentials.AccessKeyId')
AWS_SECRET_ACCESS_KEY=$(echo "$CREDS_JSON" | jq -r '.Credentials.SecretAccessKey')
AWS_SESSION_TOKEN=$(echo "$CREDS_JSON" | jq -r '.Credentials.SessionToken')

kubectl delete secret "$SECRET_NAME" --namespace "$NAMESPACE" --ignore-not-found

kubectl create secret generic "$SECRET_NAME" \
  --namespace "$NAMESPACE" \
  --from-literal=creds="[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
aws_session_token = $AWS_SESSION_TOKEN
"

echo "Kubernetes secret '$SECRET_NAME' created/updated in namespace '$NAMESPACE' using AWS profile '$AWS_PROFILE'."
