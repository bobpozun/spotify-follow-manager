Progress: AWS Secrets Manager Integration

- Last Updated: 2025-05-08T22:53:16-04:00
- Completed:
  - Parsed `.agentic` configuration and environment settings
  - Created memories for tech stack and environment
  - Populated techContext.md, productContext.md, systemPatterns.md, activeContext.md
  - Integrated AuthButton into `page.tsx`, centralized auth flow and removed orphaned components
  - Updated CDK stack and workflows to output and fetch AWS Secrets Manager ARNs
  - Created `.env.local.example` and `.env.aws.example` files
  - Updated `.env.dev` and `.env.prod` with GitHub token and CDK output values
  - Added `export` and `preview:export` scripts in `package.json` and updated `amplify.yml` for static export
  - Added **Technologies** section to `README.md`
  - Fixed routing 404 by switching Amplify hosting to static export from `out/`
  - Updated README with local preview instructions
- Next:
  - Test local static preview with `yarn preview:export`
  - Publish static site via `yarn amplify:publish:dev` and verify live site
  - Propagate env updates to production and deploy