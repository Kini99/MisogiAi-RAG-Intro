import { config } from '../config/index.js';
import { logMCPRequest, logMCPResponse, logMCPError, logger } from '../utils/logger.js';
import { moderateContent } from '../moderation/contentModerator.js';
import { 
  sendMessage, 
  getMessageHistory, 
  getChannelMetadata, 
  searchMessages, 
  deleteMessage,
  getGuildInfo,
  getBot,
  getAllBots 
} from '../discord/botManager.js';

// MCP Server implementation
export class DiscordMCPServer {
  constructor() {
    this.server = null;
    this.setupErrorHandling();
  }

  async initialize() {
    try {
      // Dynamic imports for MCP SDK
      const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
      const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js');
      const { 
        CallToolRequestSchema, 
        ListToolsRequestSchema 
      } = await import('@modelcontextprotocol/sdk/types.js');

      this.Server = Server;
      this.StdioServerTransport = StdioServerTransport;
      this.CallToolRequestSchema = CallToolRequestSchema;
      this.ListToolsRequestSchema = ListToolsRequestSchema;

      this.server = new Server(
        {
          name: 'discord-mcp-server',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      this.setupTools();
    } catch (error) {
      logger.error('Failed to initialize MCP server:', error);
      throw error;
    }
  }

  setupTools() {
    // Send message tool
    this.server.setRequestHandler(this.ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'send_discord_message',
            description: 'Send a message to a Discord channel',
            inputSchema: {
              type: 'object',
              properties: {
                botId: {
                  type: 'string',
                  description: 'The ID of the bot to use',
                },
                channelId: {
                  type: 'string',
                  description: 'The Discord channel ID to send the message to',
                },
                content: {
                  type: 'string',
                  description: 'The message content to send',
                },
                options: {
                  type: 'object',
                  description: 'Additional message options (embeds, files, etc.)',
                  additionalProperties: true,
                },
              },
              required: ['botId', 'channelId', 'content'],
            },
          },
          {
            name: 'get_discord_message_history',
            description: 'Retrieve message history from a Discord channel',
            inputSchema: {
              type: 'object',
              properties: {
                botId: {
                  type: 'string',
                  description: 'The ID of the bot to use',
                },
                channelId: {
                  type: 'string',
                  description: 'The Discord channel ID to get messages from',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of messages to retrieve (default: 50)',
                  default: 50,
                },
              },
              required: ['botId', 'channelId'],
            },
          },
          {
            name: 'get_discord_channel_metadata',
            description: 'Get metadata about a Discord channel',
            inputSchema: {
              type: 'object',
              properties: {
                botId: {
                  type: 'string',
                  description: 'The ID of the bot to use',
                },
                channelId: {
                  type: 'string',
                  description: 'The Discord channel ID to get metadata for',
                },
              },
              required: ['botId', 'channelId'],
            },
          },
          {
            name: 'search_discord_messages',
            description: 'Search for messages in a Discord channel',
            inputSchema: {
              type: 'object',
              properties: {
                botId: {
                  type: 'string',
                  description: 'The ID of the bot to use',
                },
                channelId: {
                  type: 'string',
                  description: 'The Discord channel ID to search in',
                },
                query: {
                  type: 'string',
                  description: 'The search query',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 10)',
                  default: 10,
                },
              },
              required: ['botId', 'channelId', 'query'],
            },
          },
          {
            name: 'delete_discord_message',
            description: 'Delete a message from a Discord channel',
            inputSchema: {
              type: 'object',
              properties: {
                botId: {
                  type: 'string',
                  description: 'The ID of the bot to use',
                },
                channelId: {
                  type: 'string',
                  description: 'The Discord channel ID where the message is located',
                },
                messageId: {
                  type: 'string',
                  description: 'The ID of the message to delete',
                },
              },
              required: ['botId', 'channelId', 'messageId'],
            },
          },
          {
            name: 'get_discord_guild_info',
            description: 'Get information about a Discord guild (server)',
            inputSchema: {
              type: 'object',
              properties: {
                botId: {
                  type: 'string',
                  description: 'The ID of the bot to use',
                },
                guildId: {
                  type: 'string',
                  description: 'The Discord guild ID to get information for',
                },
              },
              required: ['botId', 'guildId'],
            },
          },
          {
            name: 'get_discord_bots',
            description: 'Get information about all active Discord bots',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'moderate_discord_content',
            description: 'Moderate content using the built-in content moderation system',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The content to moderate',
                },
                userId: {
                  type: 'string',
                  description: 'The user ID for moderation tracking',
                },
                channelId: {
                  type: 'string',
                  description: 'The channel ID for moderation tracking',
                },
                guildId: {
                  type: 'string',
                  description: 'The guild ID for moderation tracking',
                },
              },
              required: ['content'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(this.CallToolRequestSchema, async (request) => {
      const startTime = Date.now();
      const { name, arguments: args } = request.params;

      try {
        logMCPRequest(name, args, request.params.userId || 'unknown', request.params.botId || 'unknown');

        let result;

        switch (name) {
          case 'send_discord_message':
            result = await this.handleSendMessage(args);
            break;
          case 'get_discord_message_history':
            result = await this.handleGetMessageHistory(args);
            break;
          case 'get_discord_channel_metadata':
            result = await this.handleGetChannelMetadata(args);
            break;
          case 'search_discord_messages':
            result = await this.handleSearchMessages(args);
            break;
          case 'delete_discord_message':
            result = await this.handleDeleteMessage(args);
            break;
          case 'get_discord_guild_info':
            result = await this.handleGetGuildInfo(args);
            break;
          case 'get_discord_bots':
            result = await this.handleGetBots(args);
            break;
          case 'moderate_discord_content':
            result = await this.handleModerateContent(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        const duration = Date.now() - startTime;
        logMCPResponse(name, result, request.params.userId || 'unknown', request.params.botId || 'unknown', duration);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        logMCPError(name, error, request.params.userId || 'unknown', request.params.botId || 'unknown');
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                code: 'TOOL_EXECUTION_ERROR',
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupErrorHandling() {
    // Error handling will be set up when server is initialized
  }

  async handleSendMessage(args) {
    const { botId, channelId, content, options = {} } = args;

    // Validate inputs
    if (!botId || !channelId || !content) {
      throw new Error('Missing required parameters: botId, channelId, content');
    }

    // Moderate content before sending
    const moderationResult = moderateContent(content, 'mcp-user', channelId, 'unknown-guild');
    if (!moderationResult.isApproved) {
      return {
        success: false,
        error: 'Content moderation failed',
        reason: moderationResult.reason,
        severity: moderationResult.severity,
        actions: moderationResult.actions,
      };
    }

    const message = await sendMessage(botId, channelId, content, options);
    return {
      success: true,
      message,
    };
  }

  async handleGetMessageHistory(args) {
    const { botId, channelId, limit = 50 } = args;

    if (!botId || !channelId) {
      throw new Error('Missing required parameters: botId, channelId');
    }

    const messages = await getMessageHistory(botId, channelId, limit);
    return {
      success: true,
      messages,
      count: messages.length,
    };
  }

  async handleGetChannelMetadata(args) {
    const { botId, channelId } = args;

    if (!botId || !channelId) {
      throw new Error('Missing required parameters: botId, channelId');
    }

    const metadata = await getChannelMetadata(botId, channelId);
    return {
      success: true,
      metadata,
    };
  }

  async handleSearchMessages(args) {
    const { botId, channelId, query, limit = 10 } = args;

    if (!botId || !channelId || !query) {
      throw new Error('Missing required parameters: botId, channelId, query');
    }

    const results = await searchMessages(botId, channelId, query, limit);
    return {
      success: true,
      results,
      count: results.length,
      query,
    };
  }

  async handleDeleteMessage(args) {
    const { botId, channelId, messageId } = args;

    if (!botId || !channelId || !messageId) {
      throw new Error('Missing required parameters: botId, channelId, messageId');
    }

    const result = await deleteMessage(botId, channelId, messageId);
    return {
      success: true,
      result,
    };
  }

  async handleGetGuildInfo(args) {
    const { botId, guildId } = args;

    if (!botId || !guildId) {
      throw new Error('Missing required parameters: botId, guildId');
    }

    const guildInfo = await getGuildInfo(botId, guildId);
    return {
      success: true,
      guildInfo,
    };
  }

  async handleGetBots(args) {
    const bots = getAllBots();
    return {
      success: true,
      bots,
      count: bots.length,
    };
  }

  async handleModerateContent(args) {
    const { content, userId = 'mcp-user', channelId = 'unknown-channel', guildId = 'unknown-guild' } = args;

    if (!content) {
      throw new Error('Missing required parameter: content');
    }

    const result = moderateContent(content, userId, channelId, guildId);
    return {
      success: true,
      moderation: {
        isApproved: result.isApproved,
        reason: result.reason,
        severity: result.severity,
        actions: result.actions,
        timestamp: result.timestamp,
      },
    };
  }

  async start() {
    try {
      await this.initialize();
      
      const transport = new this.StdioServerTransport();
      await this.server.connect(transport);
      
      // Set up error handling after server is created
      this.server.onerror = (error) => {
        logger.error('MCP Server error:', error);
      };
      
      logger.info('MCP Server started successfully');
      logger.info('Available tools:');
      logger.info('- send_discord_message');
      logger.info('- get_discord_message_history');
      logger.info('- get_discord_channel_metadata');
      logger.info('- search_discord_messages');
      logger.info('- delete_discord_message');
      logger.info('- get_discord_guild_info');
      logger.info('- get_discord_bots');
      logger.info('- moderate_discord_content');
    } catch (error) {
      logger.error('Failed to start MCP Server:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.server) {
        await this.server.close();
        logger.info('MCP Server stopped');
      }
    } catch (error) {
      logger.error('Error stopping MCP Server:', error);
    }
  }
} 