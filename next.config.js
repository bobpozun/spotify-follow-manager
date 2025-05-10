/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Enable static exports - this replaces the 'next export' command
  output: 'export',
  // Configure static image domains
  images: {
    domains: ["i.scdn.co"],
    unoptimized: true, // Required for static export
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
