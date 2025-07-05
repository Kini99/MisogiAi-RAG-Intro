/**
 * Basic Usage Example for Discord MCP Server
 * 
 * This example demonstrates how to use the Discord MCP Server
 * with Claude for Desktop or other MCP clients.
 */

// Example 1: Send a message to a Discord channel
const sendMessageExample = {
  tool: 'send_message',
  parameters: {
    channel: 'general',
    message: 'Hello from the MCP Server! This is a test message.',
  }
};

// Example 2: Get recent messages from a channel
const getMessagesExample = {
  tool: 'get_messages',
  parameters: {
    channel: 'general',
    limit: 10,
  }
};

// Example 3: Get channel information
const getChannelInfoExample = {
  tool: 'get_channel_info',
  parameters: {
    channel: 'general',
  }
};

// Example 4: Search for messages containing a specific term
const searchMessagesExample = {
  tool: 'search_messages',
  parameters: {
    channel: 'general',
    query: 'meeting',
    limit: 20,
  }
};

// Example 5: Moderate content (delete a message)
const moderateContentExample = {
  tool: 'moderate_content',
  parameters: {
    channel: 'general',
    messageId: '123456789012345678',
    action: 'delete',
    reason: 'Spam content',
  }
};

// Example 6: Using with server specification
const multiServerExample = {
  tool: 'send_message',
  parameters: {
    server: 'My Discord Server',
    channel: 'announcements',
    message: 'Important announcement from MCP!',
  }
};

// Example 7: Using with specific bot ID (for multi-tenancy)
const multiBotExample = {
  tool: 'send_message',
  parameters: {
    channel: 'general',
    message: 'Message from specific bot instance',
    botId: 'my-custom-bot',
  }
};

console.log('Discord MCP Server Usage Examples:');
console.log('===================================');
console.log();

console.log('1. Send Message:');
console.log(JSON.stringify(sendMessageExample, null, 2));
console.log();

console.log('2. Get Messages:');
console.log(JSON.stringify(getMessagesExample, null, 2));
console.log();

console.log('3. Get Channel Info:');
console.log(JSON.stringify(getChannelInfoExample, null, 2));
console.log();

console.log('4. Search Messages:');
console.log(JSON.stringify(searchMessagesExample, null, 2));
console.log();

console.log('5. Moderate Content:');
console.log(JSON.stringify(moderateContentExample, null, 2));
console.log();

console.log('6. Multi-Server Usage:');
console.log(JSON.stringify(multiServerExample, null, 2));
console.log();

console.log('7. Multi-Bot Usage:');
console.log(JSON.stringify(multiBotExample, null, 2));
console.log();

console.log('Usage Instructions:');
console.log('==================');
console.log('1. Copy the example JSON to your MCP client');
console.log('2. Replace parameters with your actual values');
console.log('3. Ensure your Discord bot has proper permissions');
console.log('4. Make sure the bot is in the target server/channel');
console.log();

console.log('Authentication:');
console.log('===============');
console.log('Use API keys or JWT tokens in the Authorization header:');
console.log('- API Key: Authorization: Bearer <your-api-key>');
console.log('- JWT Token: Authorization: Bearer <your-jwt-token>');
console.log();

console.log('Content Moderation:');
console.log('===================');
console.log('The server automatically moderates content based on:');
console.log('- Forbidden words (spam, scam, malware, etc.)');
console.log('- Excessive capitalization');
console.log('- Repeated characters');
console.log('- Suspicious links');
console.log('- Message length limits');
console.log();

console.log('For more information, see the README.md file.'); 