import { handlers } from "@/server/auth";

// Static export config for Amplify deployments
// Use force-static when running as a static export (Amplify) but force-dynamic locally
// Note: This checks for AMPLIFY_APP_ID which is present in Amplify environments
export const dynamic = process.env.AMPLIFY_APP_ID ? "force-static" : "force-dynamic";

// We explicitly avoid using Edge runtime as it's not compatible with Prisma and Auth.js

export const { GET, POST } = handlers;
