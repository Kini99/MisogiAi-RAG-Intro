# Discord MCP Server

A comprehensive Model Context Protocol (MCP) server that enables AI models to interact with Discord through a secure, authenticated, and feature-rich interface. This server provides Discord integration tools with advanced security features, content moderation, and multi-tenancy support.

## Features

### 🔧 MCP Tools
- **send_message** - Send messages to Discord channels
- **get_messages** - Retrieve message history from channels
- **get_channel_info** - Fetch channel metadata and information
- **search_messages** - Search messages with filters and queries
- **moderate_content** - Delete messages and manage users

### 🔐 Authentication & Security
- **API Key Authentication** for MCP clients
- **JWT Token Support** for user sessions
- **Permission System** with granular access control
- **Multi-tenancy Support** for multiple Discord bots
- **Audit Logging** for all operations
- **Rate Limiting** to prevent abuse

### 🛡️ Content Moderation
- **Automated Content Filtering** with configurable rules
- **Spam Detection** using pattern matching
- **Forbidden Words Filtering** with customizable lists
- **Excessive Caps Detection** and repeated character filtering
- **Suspicious Link Detection** for security
- **Configurable Action Escalation** (warn, delete, timeout, kick, ban)

### 🔍 MCP Inspector Integration
- **Request/Response Monitoring** in real-time
- **Connection Tracking** for debugging
- **Detailed Logging** for all MCP operations
- **Performance Metrics** and timing information

### 🧪 Testing & Quality
- **Unit Tests** with >80% coverage
- **Integration Tests** for all major components
- **Discord API Compliance** with proper error handling
- **Comprehensive Error Handling** and validation

## Prerequisites

- Node.js 16.x or higher
- A Discord bot token
- Discord bot with proper permissions:
  - Read Messages/View Channels
  - Send Messages
  - Read Message History
  - Manage Messages (for moderation)
  - Moderate Members (for user management)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd q1_discord_mcp_server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example.txt .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Discord Bot Configuration
   DISCORD_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   DISCORD_CLIENT_SECRET=your_discord_client_secret_here
   
   # Security
   JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
   API_KEY_SECRET=your_api_key_secret_here_minimum_32_characters
   
   # Other settings...
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

### Starting the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Using with Claude for Desktop

1. **Open Claude for Desktop configuration:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the Discord MCP server configuration:**
   ```json
   {
     "mcpServers": {
       "discord": {
         "command": "node",
         "args": ["path/to/q1_discord_mcp_server/dist/index.js"],
         "env": {
           "DISCORD_TOKEN": "your_discord_bot_token_here",
           "JWT_SECRET": "your_jwt_secret_here",
           "API_KEY_SECRET": "your_api_key_secret_here"
         }
       }
     }
   }
   ```

3. **Restart Claude for Desktop**

### Using with MCP Inspector

For debugging and development:

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run the server with inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## API Tools

### send_message
Send a message to a Discord channel.

**Parameters:**
- `server` (optional): Server name or ID
- `channel`: Channel name (e.g., "general") or ID
- `message`: Message content to send
- `botId` (optional): Bot ID to use

**Example:**
```json
{
  "channel": "general",
  "message": "Hello from MCP!"
}
```

### get_messages
Retrieve recent messages from a Discord channel.

**Parameters:**
- `server` (optional): Server name or ID
- `channel`: Channel name or ID
- `limit` (optional): Number of messages (default: 50, max: 100)
- `before` (optional): Message ID to get messages before
- `after` (optional): Message ID to get messages after
- `botId` (optional): Bot ID to use

**Example:**
```json
{
  "channel": "general",
  "limit": 10
}
```

### get_channel_info
Get information about a Discord channel.

**Parameters:**
- `server` (optional): Server name or ID
- `channel`: Channel name or ID
- `botId` (optional): Bot ID to use

**Example:**
```json
{
  "channel": "general"
}
```

### search_messages
Search messages in a Discord channel with filters.

**Parameters:**
- `server` (optional): Server name or ID
- `channel`: Channel name or ID
- `query`: Search query to find in message content
- `limit` (optional): Number of messages to return (default: 50)
- `author` (optional): Filter by author user ID
- `botId` (optional): Bot ID to use

**Example:**
```json
{
  "channel": "general",
  "query": "meeting",
  "limit": 20
}
```

### moderate_content
Moderate content by deleting messages or managing users.

**Parameters:**
- `server` (optional): Server name or ID
- `channel`: Channel name or ID
- `messageId`: ID of the message to moderate
- `action`: Moderation action ('delete', 'warn', 'timeout', 'kick', 'ban')
- `reason` (optional): Reason for moderation action
- `duration` (optional): Duration in minutes (for timeout action)
- `botId` (optional): Bot ID to use

**Example:**
```json
{
  "channel": "general",
  "messageId": "123456789012345678",
  "action": "delete",
  "reason": "Spam content"
}
```

## Authentication

### API Keys
Generate API keys for programmatic access:

```typescript
import { generateApiKey } from './src/auth';

const apiKey = generateApiKey('user-id', 'My API Key', ['send_message', 'read_messages']);
console.log(apiKey.key); // Use this key in Authorization header
```

### JWT Tokens
For user sessions:

```typescript
import { generateJwtToken } from './src/auth';

const token = generateJwtToken(user);
// Use token in Authorization: Bearer <token> header
```

## Content Moderation

The server includes comprehensive content moderation:

### Configuration
```typescript
import { contentModerator } from './src/moderation/contentModerator';

// Update moderation settings
contentModerator.updateConfig({
  enabled: true,
  maxMessageLength: 2000,
  forbiddenWords: ['spam', 'scam', 'malware'],
  autoDelete: true,
  warnThreshold: 3,
});
```

### Adding Forbidden Words
```typescript
contentModerator.addForbiddenWord('newbadword');
contentModerator.removeForbiddenWord('oldbadword');
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## Development

### Project Structure
```
src/
├── auth/           # Authentication and authorization
├── config/         # Configuration management
├── discord/        # Discord bot integration
├── moderation/     # Content moderation system
├── mcp/           # MCP server implementation
├── types/         # TypeScript type definitions
├── utils/         # Utilities and logging
└── __tests__/     # Test files
```

### Adding New Tools

1. **Define the tool in the MCP server:**
   ```typescript
   // In src/mcp/server.ts
   {
     name: 'new_tool',
     description: 'Description of the new tool',
     inputSchema: {
       type: 'object',
       properties: {
         // Define parameters
       },
       required: ['required_param'],
     },
   }
   ```

2. **Implement the handler:**
   ```typescript
   private async handleNewTool(params: NewToolParams): Promise<MCPResponse<any>> {
     // Implementation
   }
   ```

3. **Add to executeTool method:**
   ```typescript
   case 'new_tool':
     return await this.handleNewTool(args as NewToolParams);
   ```

### Logging

The server uses Winston for comprehensive logging:

```typescript
import { logger, logAuditEvent, logSecurityEvent } from './src/utils/logger';

// General logging
logger.info('Server started');
logger.error('An error occurred', { context: 'additional info' });

// Security events
logSecurityEvent('authentication_failed', 'medium', { userId: '123' });

// Audit logging
logAuditEvent('user', 'username', 'action', 'resource', 'id', {}, 'ip', 'user-agent', true);
```

## Security Considerations

- **Environment Variables**: Never commit sensitive data to version control
- **Token Security**: Keep Discord bot tokens secure and rotate regularly
- **Permission Principle**: Grant minimum required permissions to bots
- **Rate Limiting**: Configure appropriate rate limits for your use case
- **Audit Logging**: Monitor audit logs for suspicious activity
- **Content Moderation**: Regularly update forbidden words and moderation rules

## Troubleshooting

### Common Issues

1. **Bot not connecting to Discord:**
   - Verify bot token is correct
   - Check bot has required permissions
   - Ensure bot is invited to server

2. **Permission errors:**
   - Verify user has required permissions
   - Check bot has necessary Discord permissions
   - Review audit logs for details

3. **Rate limiting:**
   - Adjust rate limit configuration
   - Implement exponential backoff
   - Monitor usage patterns

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

### MCP Inspector

Use MCP Inspector for debugging:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

1. Check the GitHub Issues section
2. Review the MCP documentation at https://modelcontextprotocol.io
3. Open a new issue with detailed reproduction steps

## Acknowledgments

- Based on the [v-3/discordmcp](https://github.com/v-3/discordmcp) project
- Uses the Model Context Protocol (MCP) specification
- Built with Discord.js for Discord API integration 