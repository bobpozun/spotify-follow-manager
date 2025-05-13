# Active Context: Amplify SSR Migration

- The infra stack provisions Amplify as SSR (Web App) via `@aws-cdk/aws-amplify-alpha`.
- All build, environment, and branch config is managed in CDK.
- Local dev, bootstrap.sh, and CI/CD workflows are compatible with this setup.
- The user is migrating from static to SSR hosting to resolve 404s and enable dynamic API routes.
