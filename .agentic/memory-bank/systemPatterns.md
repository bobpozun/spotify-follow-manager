# System Patterns

## CI/CD Workflow

The application uses a two-phase deployment pattern:

1. **Infrastructure Deployment (Phase 1)**
   - Triggered by pushes to main or manual dispatch
   - Uses GitHub OIDC for secure AWS authentication
   - Deploys AWS resources via CDK
   - Creates/updates RDS database, Secrets Manager entries, Amplify app
   - Outputs infrastructure values for subsequent deployments

2. **Application Deployment (Phase 2)**
   - Triggered after successful infrastructure deployment
   - Uses AWS Amplify for hosting Next.js application
   - Fetches secrets from AWS Secrets Manager
   - No automatic builds - controlled exclusively through GitHub Actions

## Secrets Management

- **Application Secrets** (AUTH_SECRET, Spotify credentials) stored in AWS Secrets Manager
- **Database Credentials** securely stored and dynamically retrieved
- **Environment Variables** for non-sensitive configuration
- **GitHub Secrets** for CI/CD configuration (AWS_ROLE_TO_ASSUME, AWS_REGION, AMPLIFY_APP_ID)

## Environment Strategy

- **Local Development**: Uses `.env.local` with local database
- **Development Environment**: Uses `.env.dev` with AWS resources
- **Production Environment**: Uses `.env.prod` with separate AWS resources
- All environments use same codebase with environment-specific configuration
