import { config, validateConfig } from './src/config/index.js';
import { logger } from './src/utils/logger.js';
import { moderateContent } from './src/moderation/contentModerator.js';
import { generateApiKey, generateJWTSecret } from './src/auth/index.js';

console.log('🧪 Testing Discord MCP Server Components...\n');

// Test 1: Configuration
console.log('1. Testing Configuration...');
try {
  // Set some basic environment variables for testing
  process.env.DISCORD_TOKEN = 'test_token_123456789';
  process.env.DISCORD_CLIENT_ID = 'test_client_id_123456789';
  process.env.DISCORD_CLIENT_SECRET = 'test_client_secret_123456789';
  process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_for_testing_123456789';
  process.env.API_KEY_SECRET = 'test_api_key_secret_that_is_long_enough_for_testing_123456789';
  
  validateConfig();
  console.log('✅ Configuration validation passed');
  console.log(`   - Server port: ${config.port}`);
  console.log(`   - Content moderation: ${config.contentModeration.enabled}`);
  console.log(`   - Multi-tenancy: ${config.enableMultiTenancy}`);
} catch (error) {
  console.log('❌ Configuration validation failed:', error.message);
}

// Test 2: Logging
console.log('\n2. Testing Logging...');
try {
  logger.info('Test log message');
  logger.warn('Test warning message');
  logger.error('Test error message');
  console.log('✅ Logging system working');
} catch (error) {
  console.log('❌ Logging system failed:', error.message);
}

// Test 3: Content Moderation
console.log('\n3. Testing Content Moderation...');
try {
  const testContent = 'This is a test message with some spam content';
  const result = moderateContent(testContent, 'test-user', 'test-channel', 'test-guild');
  console.log('✅ Content moderation working');
  console.log(`   - Test content: "${testContent}"`);
  console.log(`   - Approved: ${result.isApproved}`);
  console.log(`   - Reason: ${result.reason}`);
  console.log(`   - Severity: ${result.severity}`);
} catch (error) {
  console.log('❌ Content moderation failed:', error.message);
}

// Test 4: Authentication Utilities
console.log('\n4. Testing Authentication Utilities...');
try {
  const apiKey = generateApiKey();
  const jwtSecret = generateJWTSecret();
  console.log('✅ Authentication utilities working');
  console.log(`   - Generated API key: ${apiKey.substring(0, 16)}...`);
  console.log(`   - Generated JWT secret: ${jwtSecret.substring(0, 16)}...`);
} catch (error) {
  console.log('❌ Authentication utilities failed:', error.message);
}

// Test 5: MCP Server Import
console.log('\n5. Testing MCP Server Import...');
try {
  const { DiscordMCPServer } = await import('./src/mcp/server.js');
  const mcpServer = new DiscordMCPServer();
  console.log('✅ MCP Server import successful');
  console.log('   - Server class created successfully');
} catch (error) {
  console.log('❌ MCP Server import failed:', error.message);
}

console.log('\n🎉 All tests completed!');
console.log('\n📝 Next steps:');
console.log('1. Set up your Discord bot and get the required credentials');
console.log('2. Update the .env file with your actual Discord credentials');
console.log('3. Run "npm run dev" to start the server');
console.log('4. Use MCP Inspector or a compatible client to interact with the server'); 