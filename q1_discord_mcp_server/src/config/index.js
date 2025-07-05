import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Validation schema for environment variables
const envSchema = Joi.object({
  // Discord Configuration
  DISCORD_TOKEN: Joi.string().required(),
  DISCORD_CLIENT_ID: Joi.string().required(),
  DISCORD_CLIENT_SECRET: Joi.string().required(),

  // MCP Server Configuration
  MCP_SERVER_PORT: Joi.number().default(3000),
  MCP_SERVER_HOST: Joi.string().default('localhost'),

  // Authentication & Security
  JWT_SECRET: Joi.string().min(32).required(),
  API_KEY_SECRET: Joi.string().min(32).required(),
  BCRYPT_ROUNDS: Joi.number().default(12),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Multi-tenancy Support
  ENABLE_MULTI_TENANCY: Joi.boolean().default(true),
  DEFAULT_BOT_ID: Joi.string().optional(),

  // Logging Configuration
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs/mcp-server.log'),

  // MCP Inspector Configuration
  ENABLE_MCP_INSPECTOR: Joi.boolean().default(true),
  MCP_INSPECTOR_PORT: Joi.number().default(3001),

  // Discord API Configuration
  DISCORD_API_VERSION: Joi.string().default('v10'),
  DISCORD_GATEWAY_INTENTS: Joi.string().default('GUILDS,MESSAGES,MESSAGE_CONTENT,GUILD_MEMBERS'),

  // Security Headers
  ENABLE_CORS: Joi.boolean().default(true),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Audit Logging
  ENABLE_AUDIT_LOGGING: Joi.boolean().default(true),
  AUDIT_LOG_FILE_PATH: Joi.string().default('./logs/audit.log'),

  // Content Moderation
  ENABLE_CONTENT_MODERATION: Joi.boolean().default(true),
  MAX_MESSAGE_LENGTH: Joi.number().default(2000),
  FORBIDDEN_WORDS: Joi.string().default('spam,scam,malware'),

  // Testing Configuration
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  TEST_DISCORD_TOKEN: Joi.string().optional(),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Parse Discord Gateway Intents
const parseGatewayIntents = (intentsString) => {
  const intentMap = {
    GUILDS: 1 << 0,
    GUILD_MEMBERS: 1 << 1,
    GUILD_BANS: 1 << 2,
    GUILD_EMOJIS_AND_STICKERS: 1 << 3,
    GUILD_INTEGRATIONS: 1 << 4,
    GUILD_WEBHOOKS: 1 << 5,
    GUILD_INVITES: 1 << 6,
    GUILD_VOICE_STATES: 1 << 7,
    GUILD_PRESENCES: 1 << 8,
    GUILD_MESSAGES: 1 << 9,
    GUILD_MESSAGE_REACTIONS: 1 << 10,
    GUILD_MESSAGE_TYPING: 1 << 11,
    DIRECT_MESSAGES: 1 << 12,
    DIRECT_MESSAGE_REACTIONS: 1 << 13,
    DIRECT_MESSAGE_TYPING: 1 << 14,
    MESSAGE_CONTENT: 1 << 15,
    GUILD_SCHEDULED_EVENTS: 1 << 16,
    AUTO_MODERATION_CONFIGURATION: 1 << 20,
    AUTO_MODERATION_EXECUTION: 1 << 21,
  };

  return intentsString
    .split(',')
    .map(intent => intent.trim())
    .reduce((acc, intent) => {
      if (intentMap[intent]) {
        return acc | intentMap[intent];
      }
      return acc;
    }, 0);
};

// Parse forbidden words
const parseForbiddenWords = (wordsString) => {
  return wordsString
    .split(',')
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length > 0);
};

// Export configuration
export const config = {
  port: envVars.MCP_SERVER_PORT,
  host: envVars.MCP_SERVER_HOST,
  jwtSecret: envVars.JWT_SECRET,
  apiKeySecret: envVars.API_KEY_SECRET,
  bcryptRounds: envVars.BCRYPT_ROUNDS,
  enableMultiTenancy: envVars.ENABLE_MULTI_TENANCY,
  defaultBotId: envVars.DEFAULT_BOT_ID,
  enableAuditLogging: envVars.ENABLE_AUDIT_LOGGING,
  enableContentModeration: envVars.ENABLE_CONTENT_MODERATION,
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests, please try again later.',
  },
  contentModeration: {
    enabled: envVars.ENABLE_CONTENT_MODERATION,
    maxMessageLength: envVars.MAX_MESSAGE_LENGTH,
    forbiddenWords: parseForbiddenWords(envVars.FORBIDDEN_WORDS),
    autoDelete: true,
    warnThreshold: 3,
  },
  mcpInspector: {
    enabled: envVars.ENABLE_MCP_INSPECTOR,
    port: envVars.MCP_INSPECTOR_PORT,
  },
};

// Discord-specific configuration
export const discordConfig = {
  token: envVars.DISCORD_TOKEN,
  clientId: envVars.DISCORD_CLIENT_ID,
  clientSecret: envVars.DISCORD_CLIENT_SECRET,
  apiVersion: envVars.DISCORD_API_VERSION,
  gatewayIntents: parseGatewayIntents(envVars.DISCORD_GATEWAY_INTENTS),
  testToken: envVars.TEST_DISCORD_TOKEN,
};

// Logging configuration
export const loggingConfig = {
  level: envVars.LOG_LEVEL,
  filePath: envVars.LOG_FILE_PATH,
  auditLogPath: envVars.AUDIT_LOG_FILE_PATH,
};

// Security configuration
export const securityConfig = {
  enableCors: envVars.ENABLE_CORS,
  corsOrigin: envVars.CORS_ORIGIN,
  nodeEnv: envVars.NODE_ENV,
};

// Default Discord bot configuration for single-tenant setups
export const defaultBotConfig = {
  id: 'default',
  token: envVars.DISCORD_TOKEN,
  clientId: envVars.DISCORD_CLIENT_ID,
  clientSecret: envVars.DISCORD_CLIENT_SECRET,
  name: 'MCP Discord Bot',
  ownerId: 'system',
  permissions: [
    'SendMessages',
    'ReadMessageHistory',
    'ViewChannel',
    'ManageMessages',
    'ModerateMembers',
  ],
  isActive: true,
  createdAt: new Date(),
  lastUsed: new Date(),
};

// Export validation function for runtime checks
export const validateConfig = () => {
  const requiredFields = [
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'JWT_SECRET',
    'API_KEY_SECRET',
  ];

  for (const field of requiredFields) {
    if (!process.env[field]) {
      throw new Error(`Missing required environment variable: ${field}`);
    }
  }

  if (config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (config.apiKeySecret.length < 32) {
    throw new Error('API_KEY_SECRET must be at least 32 characters long');
  }
};

// Initialize configuration
validateConfig(); 