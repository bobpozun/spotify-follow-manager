#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

ENV=$1
ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
  echo "Environment file $ENV_FILE not found!"
  exit 1
fi

echo "Bootstrapping environment: $ENV"

# Load environment variables
echo "Loading environment variables from $ENV_FILE"
# Use dotenv CLI to load env vars for subsequent commands

echo "Installing root dependencies..."
npx dotenv -e "$ENV_FILE" -o -- yarn install --frozen-lockfile

echo "Retrieving AWS account ID and AWS_REGION..."
ACCOUNT_ID=$(npx dotenv -e "$ENV_FILE" -o -- aws sts get-caller-identity --query Account --output text)
REGION=$(npx dotenv -e "$ENV_FILE" -o -- sh -c 'echo $AWS_REGION')
AMPLIFY_APP_ID=$(npx dotenv -e "$ENV_FILE" -o -- sh -c 'echo $AMPLIFY_APP_ID')

echo "Bootstrapping CDK..."
npx dotenv -e "$ENV_FILE" -o -- sh -c "cd infrastructure && npx cdk bootstrap aws://$ACCOUNT_ID/$REGION --require-approval never --progress events"

echo "Deploying CDK infrastructure..."
npx dotenv -e "$ENV_FILE" -o -- sh -c "cd infrastructure && npx cdk deploy --require-approval never --progress events --outputs-file ../infra-outputs.json"

echo "Cleaning up Amplify webhooks..."
# Extract Amplify App ID from outputs file
AMPLIFY_APP_ID=$(cat infra-outputs.json | jq -r ".\"SpotifyFollowManagerInfraStack-$ENV\".AMPLIFYAPPID")
echo "Extracted Amplify App ID: $AMPLIFY_APP_ID"

# List and remove all webhooks
webhooks=$(npx dotenv -e "$ENV_FILE" -o -- aws amplify list-webhooks --app-id $AMPLIFY_APP_ID --query 'webhooks[*].webhookId' --output text)
if [ ! -z "$webhooks" ]; then
  for id in $webhooks; do
    echo "Deleting webhook: $id"
    npx dotenv -e "$ENV_FILE" -o -- aws amplify delete-webhook --webhook-id $id
  done
  echo "All webhooks removed"
else
  echo "No webhooks found to remove"
fi

echo "Initializing Amplify environment..."
npx dotenv -e "$ENV_FILE" -o -- yarn amplify:init:$ENV

echo "Publishing app to Amplify (release)..."
npx dotenv -e "$ENV_FILE" -o -- aws amplify start-job --app-id $AMPLIFY_APP_ID --branch-name main --job-type RELEASE --commit-id HEAD

echo "Bootstrap complete for $ENV. Next: yarn dev or yarn amplify:publish:$ENV"
