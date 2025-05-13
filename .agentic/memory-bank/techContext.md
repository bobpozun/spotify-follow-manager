# Technical Context

## Stack Components

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **API Layer**: tRPC for type-safe API queries
- **Authentication**: NextAuth.js with Spotify OAuth
- **Database Access**: Prisma ORM with PostgreSQL
- **Infrastructure**: AWS CDK for infrastructure as code
- **CI/CD**: GitHub Actions with OIDC authentication
- **Hosting**: AWS Amplify
- **Database**: AWS RDS PostgreSQL
- **Secrets Management**: AWS Secrets Manager
- **Package Manager**: Yarn exclusively

## Development Environment

- **Local Database**: Docker PostgreSQL container
- **Local Auth**: Spotify developer credentials in `.env.local`
- **Local Previewing**: `yarn preview:export` for static export testing

## Deployment Architecture

- **Infrastructure Pipeline**: GitHub Action → CDK → AWS CloudFormation
- **Application Pipeline**: GitHub Action → Amplify Build → Amplify Hosting
- **Authentication**: GitHub OIDC for secure AWS role assumption
- **Database Credentials**: Managed by Secrets Manager, fetched at runtime
- **Application Configuration**: Environment-specific settings via ENV_NAME variable
