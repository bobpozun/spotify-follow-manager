/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Enable static exports only in production for Amplify deployment
  ...(process.env.NODE_ENV === 'production' && process.env.AMPLIFY_APP_ID
    ? { output: 'export' }
    : {}),
  // Configure image domains
  images: {
    domains: ["i.scdn.co"],
    // Only use unoptimized images in production with static export
    ...(process.env.NODE_ENV === 'production' && process.env.AMPLIFY_APP_ID
      ? { unoptimized: true }
      : {}),
  },
  // Completely exclude the infrastructure directory from Next.js
  // This prevents Next.js from trying to compile AWS CDK code
  webpack: (config, { isServer }) => {
    // Tell webpack to ignore the infrastructure directory
    config.externals = [...(config.externals || []), 'aws-cdk-lib', 'constructs'];
    return config;
  },
  transpilePackages: [],
};

export default config;
