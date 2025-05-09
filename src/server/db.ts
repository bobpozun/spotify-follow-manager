/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { PrismaClient } from "@prisma/client";
import { env } from "@/env";
import { getDatabaseCredentials } from "./services/secretsService";

// Initialize Prisma client with database credentials from AWS Secrets Manager
async function initPrismaClient() {
  try {
    // If we're in a production environment, try to get credentials from AWS Secrets Manager
    if (env.NODE_ENV === "production" || env.DATABASE_URL.includes('secretsmanager')) {
      // Get the actual connection string with resolved secrets
      const connectionString = await getDatabaseCredentials();
      
      return new PrismaClient({
        datasources: {
          db: {
            url: connectionString,
          },
        },
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });
    } else {
      // For local development without secrets manager
      return new PrismaClient({
        log: ["query", "error", "warn"],
      });
    }
  } catch (error) {
    console.error("Failed to initialize Prisma client with AWS credentials:", error);
    
    // Fallback to environment variable if available
    return new PrismaClient({
      log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPromise: Promise<PrismaClient> | undefined;
};

// Create a promise for the Prisma client initialization
globalForPrisma.prismaPromise ??= initPrismaClient();

// Export a function to get the database connection
export async function getDb(): Promise<PrismaClient> {
  if (!globalForPrisma.prisma) {
    // Make sure prismaPromise is initialized
    globalForPrisma.prismaPromise ??= initPrismaClient();
    globalForPrisma.prisma = await globalForPrisma.prismaPromise;
  }
  
  // At this point prisma is guaranteed to be initialized
  return globalForPrisma.prisma!;
}

// For backward compatibility - this will initialize the client on first use
export const db = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Initialize the global instance in development
if (env.NODE_ENV !== "production" && !globalForPrisma.prisma) {
  initPrismaClient().then(client => {
    globalForPrisma.prisma = client;
  });
}
