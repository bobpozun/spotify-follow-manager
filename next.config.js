/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ["i.scdn.co"],
  },
  // Completely exclude the infrastructure directory from Next.js
  // This prevents Next.js from trying to compile AWS CDK code
  webpack: (config, { isServer }) => {
    // Tell webpack to ignore the infrastructure directory
    config.externals = [...(config.externals || []), 'aws-cdk-lib', 'constructs'];
    return config;
  },
  // Only include directories that contain our application code
  // This will prevent Next.js from processing the infrastructure directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => `page.${ext}`),
  transpilePackages: [],
};

export default config;
