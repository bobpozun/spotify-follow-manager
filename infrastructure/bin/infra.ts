#!/usr/bin/env node
import 'source-map-support/register';
import { resolve } from 'path';

// Environment variables are loaded via dotenv-cli in npm scripts
import * as cdk from 'aws-cdk-lib';
import { SpotifyInfraStack } from '../lib/infra-stack';

const app = new cdk.App();

// Get environment name from .env file
const envName = process.env.ENV_NAME ?? 'dev';

// Create stack with environment suffix
new SpotifyInfraStack(app, `SpotifyFollowManagerInfraStack-${envName}`);

console.log(`Deploying stack for environment: ${envName}`);
