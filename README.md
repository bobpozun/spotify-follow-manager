# Spotify Follow Manager

Manage and follow Spotify artists from your playlists. Built with Next.js, tRPC, and deployed to AWS Amplify.

## Features

- View artists you currently follow
- Discover artists in your playlists you don't yet follow
- Select and follow multiple artists at once

## Technologies

- Next.js: React framework for server-rendered and static web applications.
- tRPC: End-to-end typesafe API layer for building APIs.
- Prisma: Type-safe ORM for database modelling and migrations.
- Zod: Runtime schema validation for environment variables and data structures.
- NextAuth.js: Authentication library for Next.js applications.
- AWS Amplify: Hosting, CI/CD pipelines, and environment management.
- @aws-sdk/client-secrets-manager: Dynamically fetch secrets at runtime.
- Docker & PostgreSQL: Containerized local database for development.

## Local Development

```bash
# Install dependencies
yarn install

# Setup your local database
yarn db:setup

# Start the development server
yarn dev
```

## Deployment

The app uses two environments (dev and prod) with GitHub Actions for CI/CD:

### GitHub Setup

1. Create two environments in your repository settings:
   - `dev` - For development deployments
   - `prod` - For production deployments

2. Add these to **each** environment:
   - **Environment Variables**:
     - `ENV_NAME`: `dev` or `prod` (matching the environment name)
   - **Environment Secrets** (different for each environment):
     - `AWS_ROLE_TO_ASSUME`: Environment-specific IAM role ARN (e.g., `spotify-actions-deploy-dev` vs `spotify-actions-deploy-prod`)
     - `AMPLIFY_APP_ID`: Environment-specific Amplify app ID (separate apps for dev and prod)
     - `AWS_REGION`: AWS region (e.g., `us-east-2`) - may be the same across environments

### AWS Secrets Manager Integration

The application uses AWS Secrets Manager to securely store sensitive credentials:

- **Database Credentials**: Stored securely and accessed dynamically during runtime
- **Application Secrets**: Includes Spotify API keys, NextAuth secret, and GitHub token

**Secrets Flow**:
1. Secrets are created during infrastructure deployment (`yarn infra:deploy:dev/prod`)
2. Application retrieves secrets at runtime using AWS SDK
3. CI/CD pipeline fetches secrets during deployment process

**Benefits**:
- No sensitive credentials in environment files or GitHub secrets
- Central management of secrets in AWS
- Secure rotation of credentials without code changes

### Workflow

Automated GitHub deployments:
- **Dev**: Auto-deploys on every push to `main`
- **Prod**: Only deploys manually via GitHub Actions workflow_dispatch

### First-time Setup

```bash
# 1. Deploy infrastructure for each environment to create the IAM OIDC roles 
# and Amplify apps
yarn infra:deploy:dev
yarn infra:deploy:prod

# 2. Get the role ARNs and App IDs from each environment's output
# - GitHubActionsRoleArndev=
# - AmplifyAppIddev=

# 3. Add those to GitHub environment secrets

## 4. Initialize Amplify locally for each environment
```bash
# For first-time setup, use environment-specific init commands:
yarn amplify:init:dev  # Initializes the dev environment 
yarn amplify:init:prod # Initializes the prod environment

# If you encounter app ID mismatch issues with existing Amplify projects:
rm -rf amplify  # Remove the old configuration
yarn amplify:init:dev  # Start fresh with the new app ID
```

### Local Deployment Commands

```bash
# Deploy dev infrastructure + frontend
yarn deploy:dev

# Deploy prod infrastructure + frontend
yarn deploy:prod

# Only deploy infrastructure (dev)
yarn infra:deploy:dev

# Only deploy infrastructure (prod)
yarn infra:deploy:prod
```

## License

MIT
