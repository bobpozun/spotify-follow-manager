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

The app uses two environments (dev and prod) with GitHub Actions for CI/CD. **Amplify is now provisioned as SSR (Web App) hosting via CDK (`@aws-cdk/aws-amplify-alpha`)—all hosting, build, and environment configuration is managed in code.**

### Amplify SSR (Web App) Hosting

- The infrastructure stack provisions Amplify using SSR/Node.js (Web App) hosting, not static hosting.
- This enables full support for dynamic API routes (NextAuth, tRPC, etc.) and resolves all 404/static-site issues.
- If you see 404s after a successful build, ensure you are using SSR hosting (check the Amplify Console for "Web App" hosting type, not "Static").
- All configuration (buildSpec, env vars, domains, etc.) is managed in `infrastructure/lib/infra-stack.ts`.

### GitHub Setup

1. Create two environments in your repository settings:
   - `dev` - For development deployments
   - `prod` - For production deployments

2. Add these to **each** environment:
   - **Environment Variables**:
     - `ENV_NAME`: `dev` or `prod` (matching the environment name)
   - **Environment Secrets** (different for each environment):
     - `AWS_ROLE_TO_ASSUME`: Environment-specific IAM role ARN (e.g., `spotify-actions-deploy-dev` vs `spotify-actions-deploy-prod`)
     - `AMPLIFY_APP_ID`: Environment-specific Amplify app ID (separate apps for dev and prod, auto-provisioned by CDK)
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
- **Dev**: Auto-deploys on every push to `main` (infra, then frontend via Amplify SSR)
- **Prod**: Only deploys manually via GitHub Actions workflow_dispatch

### First-time Setup

Run the bootstrap script for your environment:

```bash
./scripts/bootstrap.sh dev
```

Repeat for prod:

```bash
./scripts/bootstrap.sh prod
```

#### What the Bootstrap Script Does

1. Installs dependencies
2. Bootstraps CDK in your AWS account
3. Deploys the infrastructure stack (including Amplify SSR app)
4. **Cleans up Amplify webhooks** to prevent duplicate builds
5. Initializes the Amplify environment
6. Triggers an initial build


#### Manual Webhook Cleanup

You can manually clean webhooks using the provided utility script:

```bash
# Clean webhooks for dev environment
./scripts/clean-webhooks.js dev

# Clean webhooks for prod environment
./scripts/clean-webhooks.js prod
```

This is useful if you need to remove webhooks without redeploying infrastructure.

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
