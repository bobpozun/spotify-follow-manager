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

# Ensure local Amplify project exists
if [ ! -d "amplify" ]; then
  echo "No local Amplify project detected. Initializing with amplify init..."
  npx dotenv -e "$ENV_FILE" -o -- amplify init --appId "$AMPLIFY_APP_ID" --envName "$ENV" --yes \
    --projectName "spotify-follow-manager" \
    --amplify '{"envName":"'$ENV'"}' \
    --providers '{"awscloudformation":{"region":"'$REGION'","useProfile":true,"profileName":"default"}}' \
    --categories '{}'
else
  echo "Local Amplify project detected."
fi

# Ensure Amplify backend environment exists
if ! npx dotenv -e "$ENV_FILE" -o -- aws amplify list-backend-environments --app-id "$AMPLIFY_APP_ID" --query 'backendEnvironments[*].environmentName' --output text | grep -qw "$ENV"; then
  echo "Amplify backend environment '$ENV' does not exist. Creating it via amplify env add..."
  npx dotenv -e "$ENV_FILE" -o -- amplify env add --appId "$AMPLIFY_APP_ID" --envName "$ENV" --yes
else
  echo "Amplify backend environment '$ENV' already exists."
fi

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

echo "Setting up environment variables in Amplify..."
echo "Getting secrets from AWS Secrets Manager..."

# Get details from CloudFormation outputs
APP_SECRETS_ARN=$(npx dotenv -e "$ENV_FILE" -o -- aws cloudformation describe-stacks --stack-name SpotifyFollowManagerInfraStack-$ENV --query "Stacks[0].Outputs[?OutputKey=='AppSecretArn${ENV}'].OutputValue" --output text)
DB_SECRET_ARN=$(npx dotenv -e "$ENV_FILE" -o -- aws cloudformation describe-stacks --stack-name SpotifyFollowManagerInfraStack-$ENV --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn${ENV}'].OutputValue" --output text)
DB_URL=$(npx dotenv -e "$ENV_FILE" -o -- aws cloudformation describe-stacks --stack-name SpotifyFollowManagerInfraStack-$ENV --query "Stacks[0].Outputs[?OutputKey=='DatabaseURL${ENV}'].OutputValue" --output text)
AMPLIFY_BRANCH_URL=$(npx dotenv -e "$ENV_FILE" -o -- aws cloudformation describe-stacks --stack-name SpotifyFollowManagerInfraStack-$ENV --query "Stacks[0].Outputs[?OutputKey=='AmplifyBranchURL${ENV}'].OutputValue" --output text)
echo "[DEBUG] AMPLIFY_BRANCH_URL: $AMPLIFY_BRANCH_URL"

# Start with some basic environment vars
echo "Creating environment variables file for Amplify"
echo "{" > amplify-env.json
echo "  \"NODE_ENV\": \"production\"," >> amplify-env.json
echo "  \"NEXTAUTH_URL\": \"$AMPLIFY_BRANCH_URL\"," >> amplify-env.json
echo "  \"ENV_NAME\": \"$ENV\"," >> amplify-env.json
echo "  \"AMPLIFY_APP_ID\": \"$AMPLIFY_APP_ID\"" >> amplify-env.json

# Get app secrets
if [ ! -z "$APP_SECRETS_ARN" ]; then
  echo "Retrieved App Secrets ARN: $APP_SECRETS_ARN"
  
  # Get the app secrets from AWS Secrets Manager
  SECRETS=$(npx dotenv -e "$ENV_FILE" -o -- aws secretsmanager get-secret-value --secret-id $APP_SECRETS_ARN --query SecretString --output text)
  
  # Parse the JSON and set environment variables
  AUTH_SECRET=$(echo $SECRETS | jq -r '.AUTH_SECRET')
  SPOTIFY_CLIENT_ID=$(echo $SECRETS | jq -r '.SPOTIFY_CLIENT_ID')
  SPOTIFY_CLIENT_SECRET=$(echo $SECRETS | jq -r '.SPOTIFY_CLIENT_SECRET')
  
  # Add to Amplify env file
  echo "," >> amplify-env.json
  echo "  \"AUTH_SECRET\": \"$AUTH_SECRET\"," >> amplify-env.json
  echo "  \"SPOTIFY_CLIENT_ID\": \"$SPOTIFY_CLIENT_ID\"," >> amplify-env.json
  echo "  \"SPOTIFY_CLIENT_SECRET\": \"$SPOTIFY_CLIENT_SECRET\"" >> amplify-env.json
fi

# Get database credentials
if [ ! -z "$DB_SECRET_ARN" ]; then
  echo "Retrieved Database Secret ARN: $DB_SECRET_ARN"
  
  # Get the DB password from AWS Secrets Manager
  DB_SECRETS=$(npx dotenv -e "$ENV_FILE" -o -- aws secretsmanager get-secret-value --secret-id $DB_SECRET_ARN --query SecretString --output text)
  DB_PASSWORD=$(echo $DB_SECRETS | jq -r '.password')
  
  # Process the DATABASE_URL and replace the placeholder
  PROCESSED_DB_URL=$(echo $DB_URL | sed "s|{{resolve:secretsmanager:[^}]\+}}|$DB_PASSWORD|") 
  echo "," >> amplify-env.json
  echo "  \"DATABASE_URL\": \"$PROCESSED_DB_URL\"" >> amplify-env.json
fi

# Close JSON
echo "}" >> amplify-env.json

# Set environment variables in Amplify
echo "Setting environment variables in Amplify..."

# Collect all environment variables as a JSON object
ENV_JSON=$(cat amplify-env.json)
echo "[DEBUG] Setting all Amplify environment variables at once: $ENV_JSON"

npx dotenv -e "$ENV_FILE" -o -- aws amplify update-app \
  --app-id $AMPLIFY_APP_ID \
  --environment-variables "$ENV_JSON" \
  --output json > /dev/null

if [ $? -ne 0 ]; then
  echo "❌ Failed to set environment variables in Amplify"
  exit 1
fi

echo "✅ Successfully set all environment variables in Amplify"

echo "Publishing app to Amplify (release)..."
echo "Using standalone Next.js build for API route support"
npx dotenv -e "$ENV_FILE" -o -- aws amplify start-job --app-id $AMPLIFY_APP_ID --branch-name main --job-type RELEASE --commit-id HEAD --no-cli-pager

echo "Bootstrap complete for $ENV. Next: yarn dev or yarn amplify:publish:$ENV"

exit 0
