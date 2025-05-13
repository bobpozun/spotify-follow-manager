# Amplify SSR (Web App) Migration Progress

## 2025-05-10

- Updated infra CDK stack to use `@aws-cdk/aws-amplify-alpha` and provision Amplify as SSR (Web App) hosting (`platform: WEB_COMPUTE`).
- Migrated from legacy `aws-cdk-lib/aws-amplify` to modern SSR constructs.
- BuildSpec and env vars are now managed in code, no static rewrites.
- Next steps: install new dependency, build, and deploy infra stack.
- This will create a new Amplify SSR app, replacing the old static one.
- DNS cutover and custom domain steps may be needed after successful deploy.
