Active Context: Memory Bank Update

- Last Updated: 2025-05-08T22:53:16-04:00
- Current focus: Synchronizing agent memory with recent environment and deployment enhancements
- Recent changes:
  - Created `.env.local.example` and `.env.aws.example` files
  - Updated `.env.dev` and `.env.prod` with GitHub tokens and AWS CDK output values
  - Added `export` script in `package.json` and updated `amplify.yml` for static export
  - Added **Technologies** section to `README.md`
  - Introduced `preview:export` local preview workflow
- Current architecture:
  - Static export hosted by AWS Amplify from `out/` directory
  - Secrets Manager integration for DB and application secrets
- Next:
  - Test static preview locally
  - Publish static site via `yarn amplify:publish:dev` and verify
  - Propagate env updates to production and deploy