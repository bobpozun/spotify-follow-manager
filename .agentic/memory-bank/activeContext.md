Active Context: AWS Infrastructure and CI/CD Pipeline

- Last Updated: 2025-05-09T08:55:00-04:00
- Current focus: Fixing deployment issues and ensuring proper CI/CD workflow sequencing
- Recent changes:
  - Added GitHub OIDC provider creation to CDK stack for secure auth between GitHub Actions and AWS
  - Disabled automatic Amplify builds to ensure proper workflow sequencing
  - Fixed Prisma client TypeScript errors causing build failures
  - Removed unused variable warnings in infrastructure stack
- Current architecture:
  - Next.js app hosted on AWS Amplify
  - Infrastructure deployed via AWS CDK with GitHub OIDC integration
  - CI/CD workflow using chained GitHub Actions workflows
  - Secrets Manager integration for DB and application secrets
  - PostgreSQL RDS database
- Next:
  - Test full CI/CD pipeline after OIDC provider creation
  - Add comprehensive first-time setup documentation for contributors
  - Add error handling in deployment scripts
  - Create bootstrap script for initial OIDC provider setup
