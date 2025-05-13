#!/usr/bin/env node

/**
 * Script to clean up Amplify webhooks for a given environment
 * Usage: node clean-webhooks.js <env>
 * Where <env> is 'dev' or 'prod'
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Get environment from command line
const env = process.argv[2];
if (!env || !['dev', 'prod'].includes(env)) {
  console.error('Error: Please specify environment (dev or prod)');
  process.exit(1);
}

// Read the outputs file
const outputsFile = path.resolve(__dirname, '../infra-outputs.json');
if (!fs.existsSync(outputsFile)) {
  console.error(`Error: Outputs file not found: ${outputsFile}`);
  console.error('Run "yarn infra:deploy:[env]" first to generate the outputs file');
  process.exit(1);
}

try {
  console.log(`🧹 Cleaning up Amplify webhooks for ${env} environment`);
  
  // Read and parse outputs
  const outputs = JSON.parse(fs.readFileSync(outputsFile, 'utf8'));
  // Need to handle stack key with special characters
  const stackKey = `SpotifyFollowManagerInfraStack-${env}`;
  const amplifyAppId = outputs[stackKey]?.AMPLIFYAPPID;
  
  if (!amplifyAppId) {
    console.error(`Error: Could not find AMPLIFY_APP_ID in outputs file for ${stackKey}`);
    process.exit(1);
  }
  
  console.log(`📱 Amplify App ID: ${amplifyAppId}`);
  
  // List webhooks
  console.log('🔍 Listing webhooks...');
  const webhooksCmd = `aws amplify list-webhooks --app-id ${amplifyAppId} --query 'webhooks[*].webhookId' --output text`;
  let webhooks;
  
  try {
    webhooks = execSync(webhooksCmd, { encoding: 'utf8' }).trim();
  } catch (err) {
    console.error('Error listing webhooks:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
  
  if (!webhooks) {
    console.log('✅ No webhooks found to remove');
    process.exit(0);
  }
  
  // Delete each webhook
  const webhookIds = webhooks.split(/\s+/);
  console.log(`🗑️ Found ${webhookIds.length} webhook(s) to remove`);
  
  webhookIds.forEach(id => {
    try {
      console.log(`🗑️ Deleting webhook: ${id}`);
      execSync(`aws amplify delete-webhook --webhook-id ${id}`, { encoding: 'utf8' });
    } catch (err) {
      console.error(`Error deleting webhook ${id}:`, err instanceof Error ? err.message : String(err));
      // Continue with other webhooks even if one fails
    }
  });
  
  console.log('✅ Webhook cleanup complete');
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
