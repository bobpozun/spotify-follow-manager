// AWS SDK imports for runtime usage
import { 
  SecretsManagerClient, 
  GetSecretValueCommand
} from "@aws-sdk/client-secrets-manager";
// Type-only imports
import type { SecretsManagerClientConfig } from "@aws-sdk/client-secrets-manager";
import { env } from "@/env";

/**
 * Get the AWS region from environment or use default
 */
function getAwsRegion(): string {
  return process.env.AWS_REGION ?? "us-east-2";
}

// Using a factory pattern to avoid AWS SDK type lint issues
const createSecretsClient = (): SecretsManagerClient => {
  const config: SecretsManagerClientConfig = {
    region: getAwsRegion(),
  };
  return new SecretsManagerClient(config);
};

// The client instance with lazy initialization
let secretsClientInstance: SecretsManagerClient | undefined;

/**
 * Gets or initializes the AWS Secrets Manager client
 */
function getSecretsClient(): SecretsManagerClient {
  // Use nullish coalescing assignment for cleaner code
  secretsClientInstance ??= createSecretsClient();
  return secretsClientInstance;
}

/**
 * Retrieves a secret value from AWS Secrets Manager
 */
async function getSecretValue(secretArn: string): Promise<Record<string, string>> {
  try {
    const client = getSecretsClient();
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretArn,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error(`Secret string is empty for ARN: ${secretArn}`);
    }

    // We know this is a string from the check above
    return JSON.parse(response.SecretString) as Record<string, string>;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error retrieving secret from ${secretArn}: ${errorMessage}`);
    throw new Error(`Failed to retrieve secret: ${errorMessage}`);
  }
}

/**
 * Extracts the secret ARN from a placeholder string format
 */
function extractSecretArn(placeholderString: string): string {
  const secretArnPattern = /{{resolve:secretsmanager:(arn:[^:]+:[^:]+:[^:]+:[^:]+:secret:[^:]+):/;
  const match = secretArnPattern.exec(placeholderString);
  
  if (!match?.[1]) {
    throw new Error("Failed to extract secret ARN from placeholder string");
  }
  
  return match[1];
}

/**
 * Retrieves database credentials from AWS Secrets Manager
 */
export async function getDatabaseCredentials(): Promise<string> {
  // If using a local or hardcoded connection string, just return it
  if (env.DATABASE_URL && !env.DATABASE_URL.includes('{{resolve:secretsmanager:')) {
    return env.DATABASE_URL;
  }

  // Ensure DATABASE_URL is defined
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  try {
    // Extract secret ARN from the placeholder connection string
    const secretArn = extractSecretArn(env.DATABASE_URL);
    
    // Get the secret data
    const secretData = await getSecretValue(secretArn);
    
    // Ensure password is a string to avoid type errors
    const passwordString = String(secretData.password ?? "");
    
    // Replace the placeholder in the connection string with the actual password
    // Using non-null assertion here as we've already checked DATABASE_URL is defined
    return env.DATABASE_URL.replace(
      /{{resolve:secretsmanager:[^}]+}}/,
      passwordString
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving database credentials:", errorMessage);
    throw new Error(`Failed to retrieve database credentials: ${errorMessage}`);
  }
}

/**
 * Interface representing application secrets
 */
export interface AppSecrets {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  AUTH_SECRET: string;
  GH_TOKEN: string;
}

/**
 * Get application secrets from AWS Secrets Manager
 * Falls back to environment variables if secrets manager fails or is not configured
 */
export async function getAppSecrets(secretArn?: string): Promise<AppSecrets> {
  // Default secrets from environment
  const defaultSecrets: AppSecrets = {
    SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID ?? "",
    SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET ?? "",
    AUTH_SECRET: env.NODE_ENV === "production" ? 
      (process.env.AUTH_SECRET ?? "") : 
      (env.AUTH_SECRET ?? ""),
    GH_TOKEN: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? "",
  };
  
  // If no secret ARN is provided or we're in development, use environment variables
  if (!secretArn || env.NODE_ENV !== "production") {
    return defaultSecrets;
  }
  
  try {
    // Get secrets from Secrets Manager
    const secretData = await getSecretValue(secretArn);
    
    // Merge with defaults (secrets manager values take precedence)
    // Cast secretData to unknown first for type safety
    return {
      ...defaultSecrets,
      ...(secretData as unknown as Partial<AppSecrets>),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn("Failed to retrieve app secrets from Secrets Manager, using environment variables:", errorMessage);
    return defaultSecrets;
  }
}
