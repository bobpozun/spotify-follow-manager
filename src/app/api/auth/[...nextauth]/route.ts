import { handlers } from "@/server/auth";

// For Amplify deployments, we need static generation
// Since this is production code, we use force-static
// For local development, use a separate development branch
export const dynamic = "force-static";

// We explicitly avoid using Edge runtime as it's not compatible with Prisma and Auth.js

export const { GET, POST } = handlers;
