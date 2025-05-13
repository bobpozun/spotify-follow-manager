/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';

export class SpotifyInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Determine environment name for resource naming
    const envName = String(process.env.ENV_NAME ?? 'dev');
    
    // Create VPC for database resources
    const vpc = new ec2.Vpc(this, `DatabaseVpc${envName}`, {
      maxAzs: 2,
      natGateways: 0, // Use lower cost option for dev environments
      subnetConfiguration: [
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        }
      ],
    });
    
    // Security group for database instance
    const dbSecurityGroup = new ec2.SecurityGroup(this, `DbSecurityGroup${envName}`, {
      vpc,
      description: `Security group for ${envName} database access`,
      allowAllOutbound: true,
    });
    
    // Allow database connections from anywhere (restrict this for production)
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      `Allow PostgreSQL from anywhere for ${envName}`
    );
    
    // Generate a random password for the database
    const databaseCredentials = new secretsmanager.Secret(this, `DbCredentials${envName}`, {
      secretName: `spotify-follow-manager-${envName}-db-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 16,
      },
    });
    
    // Store application secrets in Secrets Manager
    const appSecrets = new secretsmanager.Secret(this, `AppSecrets${envName}`, {
      secretName: `spotify-follow-manager-${envName}-app-secrets`,
      secretStringValue: cdk.SecretValue.unsafePlainText(JSON.stringify({
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? '',
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ?? '',
        AUTH_SECRET: process.env.AUTH_SECRET ?? '',
        GH_TOKEN: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? ''
      })),
    });

    // Create GitHub OIDC Provider for GitHub Actions
    const githubOidcProvider = new iam.OpenIdConnectProvider(this, `GitHubOIDCProvider-${envName}`, {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1'], // GitHub tokens thumbprint
    });
    
    // Create IAM role that GitHub Actions can assume
    const deployRole = new iam.Role(this, `GitHubActionsRole-${envName}`, {
      roleName: `spotify-actions-deploy-${envName}`,
      description: 'Role for GitHub Actions to deploy Spotify Follow Manager',
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': 'repo:bobpozun/spotify-follow-manager:*',
          },
        }
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'), // You should restrict this for production
      ],
      maxSessionDuration: cdk.Duration.hours(1),
    });
    
    new cdk.CfnOutput(this, `AWS_ROLE_TO_ASSUME_${envName}`, {
      value: deployRole.roleArn,
      description: 'OIDC IAM role ARN for GitHub Actions',
    });

    // Create RDS PostgreSQL instance
    const dbInstance = new rds.DatabaseInstance(this, `Database${envName}`, {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_14 }),
      credentials: rds.Credentials.fromSecret(databaseCredentials),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // Free tier eligible
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'spotifyFollowManager',
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageType: rds.StorageType.GP2,
      deletionProtection: false, // Set to true for production
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
      publiclyAccessible: true, // Makes the DB accessible from outside the VPC
    });
    
    // Output the database connection information
    const dbConnectionString = `postgresql://postgres:${databaseCredentials.secretValueFromJson('password').toString()}@${dbInstance.dbInstanceEndpointAddress}:${dbInstance.dbInstanceEndpointPort}/spotifyFollowManager`;
    
    // Output the constructed RDS connection string
    new cdk.CfnOutput(this, `DatabaseURL${envName}`, {
      value: dbConnectionString,
      description: 'PostgreSQL connection string for the application',
    });
    
    // Store the database credentials in Secrets Manager
    new cdk.CfnOutput(this, `DatabaseSecretArn${envName}`, {
      value: databaseCredentials.secretArn,
      description: 'ARN of the secret containing database credentials',
    });
    
    // Output the app secrets ARN
    new cdk.CfnOutput(this, `AppSecretArn${envName}`, {
      value: appSecrets.secretArn,
      description: 'ARN of the secret containing application credentials',
    });

    // Validate GitHub OAuth token for Amplify SSR
    const oauthToken = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
    if (!oauthToken) {
      throw new Error('Missing GH_TOKEN or GITHUB_TOKEN environment variable for Amplify App creation');
    }

    // SSR Amplify App using aws-amplify-alpha
    const amplifyApp = new amplify.App(this, `AmplifyApp${envName}`, {
      appName: `spotify-follow-manager-${envName}`,
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'bobpozun',
        repository: 'spotify-follow-manager',
        oauthToken: cdk.SecretValue.unsafePlainText(oauthToken),
      }),
      platform: amplify.Platform.WEB_COMPUTE, // SSR/Node.js hosting
      // Use the project root amplify.yml as the build spec for Amplify SSR (Web App) hosting
      buildSpec: codebuild.BuildSpec.fromSourceFilename('amplify.yml'),
      environmentVariables: {
        AUTH_SECRET: process.env.AUTH_SECRET ?? '',
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? '',
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ?? '',
        DATABASE_URL: dbConnectionString,
        NEXTAUTH_URL: '', // set below after domain is known
        ENV_NAME: envName,
      },
      autoBranchCreation: {
        patterns: ['main'],
        pullRequestPreview: false,
        environmentVariables: {
          AUTH_SECRET: process.env.AUTH_SECRET ?? '',
          SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ?? '',
          SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ?? '',
          DATABASE_URL: dbConnectionString,
          NEXTAUTH_URL: '', // set below after domain is known
          ENV_NAME: envName,
        },
      },
    });

    // Output the Amplify App ID
    new cdk.CfnOutput(this, `AMPLIFY_APP_ID`, {
      value: amplifyApp.appId,
      description: 'Amplify App ID',
    });

    // Output the Amplify Branch URL
    const appDomain = `${amplifyApp.appId}.amplifyapp.com`;
    new cdk.CfnOutput(this, `AmplifyBranchURL${envName}`, {
      value: `https://main.${appDomain}`,
      description: 'Amplify App Branch URL',
    });




  }
}
