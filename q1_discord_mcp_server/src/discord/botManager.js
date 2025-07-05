import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { discordConfig } from '../config/index.js';
import { logDiscordEvent, logDiscordError, logger } from '../utils/logger.js';

// Store active bot instances
const activeBots = new Map();

// Create a new Discord bot instance
export const createBot = (botConfig) => {
  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
      ],
    });

    // Set up event handlers
    client.on('ready', () => {
      logger.info(`Bot ${botConfig.name} (${client.user.tag}) is ready!`);
      logDiscordEvent('BOT_READY', null, null, client.user.id, {
        botId: botConfig.id,
        botName: botConfig.name,
        guildCount: client.guilds.cache.size,
      });
    });

    client.on('messageCreate', async (message) => {
      try {
        // Ignore bot messages
        if (message.author.bot) return;

        logDiscordEvent('MESSAGE_CREATED', 
          message.guild?.id, 
          message.channel.id, 
          message.author.id,
          {
            botId: botConfig.id,
            messageId: message.id,
            contentLength: message.content.length,
          }
        );

        // Handle commands or other message processing here
        if (message.content.startsWith('!mcp')) {
          await handleMCPCommand(message, botConfig);
        }
      } catch (error) {
        logDiscordError('MESSAGE_CREATE_ERROR', error, 
          message.guild?.id, 
          message.channel.id, 
          message.author.id
        );
      }
    });

    client.on('error', (error) => {
      logDiscordError('BOT_ERROR', error, null, null, null);
    });

    client.on('disconnect', () => {
      logger.warn(`Bot ${botConfig.name} disconnected`);
      logDiscordEvent('BOT_DISCONNECTED', null, null, null, {
        botId: botConfig.id,
        botName: botConfig.name,
      });
    });

    return client;
  } catch (error) {
    logDiscordError('BOT_CREATION_ERROR', error, null, null, null);
    throw error;
  }
};

// Handle MCP-specific commands
const handleMCPCommand = async (message, botConfig) => {
  const args = message.content.split(' ');
  const command = args[1];

  switch (command) {
    case 'status':
      await message.reply(`🤖 MCP Discord Bot Status: Online\nBot ID: ${botConfig.id}\nGuilds: ${message.client.guilds.cache.size}`);
      break;
    case 'help':
      await message.reply(`📚 Available MCP Commands:\n!mcp status - Check bot status\n!mcp help - Show this help\n!mcp info - Bot information`);
      break;
    case 'info':
      await message.reply(`ℹ️ Bot Information:\nName: ${botConfig.name}\nOwner: ${botConfig.ownerId}\nCreated: ${botConfig.createdAt.toDateString()}`);
      break;
    default:
      await message.reply(`❓ Unknown command. Use !mcp help for available commands.`);
  }
};

// Initialize and start a bot
export const startBot = async (botConfig) => {
  try {
    if (activeBots.has(botConfig.id)) {
      logger.warn(`Bot ${botConfig.id} is already running`);
      return activeBots.get(botConfig.id);
    }

    const client = createBot(botConfig);
    
    await client.login(botConfig.token);
    
    activeBots.set(botConfig.id, {
      client,
      config: botConfig,
      startedAt: new Date(),
      isActive: true,
    });

    logger.info(`Bot ${botConfig.name} started successfully`);
    logDiscordEvent('BOT_STARTED', null, null, null, {
      botId: botConfig.id,
      botName: botConfig.name,
    });

    return client;
  } catch (error) {
    logDiscordError('BOT_START_ERROR', error, null, null, null);
    throw error;
  }
};

// Stop a bot
export const stopBot = async (botId) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      logger.warn(`Bot ${botId} is not running`);
      return false;
    }

    await botInstance.client.destroy();
    activeBots.delete(botId);

    logger.info(`Bot ${botId} stopped successfully`);
    logDiscordEvent('BOT_STOPPED', null, null, null, {
      botId,
      botName: botInstance.config.name,
    });

    return true;
  } catch (error) {
    logDiscordError('BOT_STOP_ERROR', error, null, null, null);
    throw error;
  }
};

// Get bot instance
export const getBot = (botId) => {
  return activeBots.get(botId);
};

// Get all active bots
export const getAllBots = () => {
  return Array.from(activeBots.values()).map(bot => ({
    id: bot.config.id,
    name: bot.config.name,
    isActive: bot.isActive,
    startedAt: bot.startedAt,
    guildCount: bot.client.guilds.cache.size,
  }));
};

// Send message to a channel
export const sendMessage = async (botId, channelId, content, options = {}) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      throw new Error(`Bot ${botId} is not running`);
    }

    const channel = await botInstance.client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const message = await channel.send(content, options);
    
    logDiscordEvent('MESSAGE_SENT', 
      channel.guild?.id, 
      channelId, 
      botInstance.client.user.id,
      {
        botId,
        messageId: message.id,
        contentLength: content.length,
      }
    );

    return {
      id: message.id,
      content: message.content,
      channelId: message.channel.id,
      guildId: message.guild?.id,
      timestamp: message.createdTimestamp,
    };
  } catch (error) {
    logDiscordError('SEND_MESSAGE_ERROR', error, null, channelId, null);
    throw error;
  }
};

// Get message history from a channel
export const getMessageHistory = async (botId, channelId, limit = 50) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      throw new Error(`Bot ${botId} is not running`);
    }

    const channel = await botInstance.client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const messages = await channel.messages.fetch({ limit });
    
    const messageHistory = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        bot: msg.author.bot,
      },
      timestamp: msg.createdTimestamp,
      attachments: msg.attachments.map(att => ({
        id: att.id,
        name: att.name,
        url: att.url,
      })),
    }));

    logDiscordEvent('MESSAGE_HISTORY_RETRIEVED', 
      channel.guild?.id, 
      channelId, 
      botInstance.client.user.id,
      {
        botId,
        messageCount: messageHistory.length,
      }
    );

    return messageHistory;
  } catch (error) {
    logDiscordError('GET_MESSAGE_HISTORY_ERROR', error, null, channelId, null);
    throw error;
  }
};

// Get channel metadata
export const getChannelMetadata = async (botId, channelId) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      throw new Error(`Bot ${botId} is not running`);
    }

    const channel = await botInstance.client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const metadata = {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      guildId: channel.guild?.id,
      guildName: channel.guild?.name,
      topic: channel.topic,
      position: channel.position,
      createdAt: channel.createdTimestamp,
      lastMessageId: channel.lastMessageId,
      messageCount: channel.messages?.cache.size || 0,
    };

    logDiscordEvent('CHANNEL_METADATA_RETRIEVED', 
      channel.guild?.id, 
      channelId, 
      botInstance.client.user.id,
      {
        botId,
        channelName: channel.name,
      }
    );

    return metadata;
  } catch (error) {
    logDiscordError('GET_CHANNEL_METADATA_ERROR', error, null, channelId, null);
    throw error;
  }
};

// Search messages in a channel
export const searchMessages = async (botId, channelId, query, limit = 10) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      throw new Error(`Bot ${botId} is not running`);
    }

    const channel = await botInstance.client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    
    const searchResults = messages
      .filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase()) ||
        msg.author.username.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .map(msg => ({
        id: msg.id,
        content: msg.content,
        author: {
          id: msg.author.id,
          username: msg.author.username,
        },
        timestamp: msg.createdTimestamp,
        relevance: msg.content.toLowerCase().includes(query.toLowerCase()) ? 'content' : 'author',
      }));

    logDiscordEvent('MESSAGE_SEARCH_PERFORMED', 
      channel.guild?.id, 
      channelId, 
      botInstance.client.user.id,
      {
        botId,
        query,
        resultCount: searchResults.length,
      }
    );

    return searchResults;
  } catch (error) {
    logDiscordError('SEARCH_MESSAGES_ERROR', error, null, channelId, null);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (botId, channelId, messageId) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      throw new Error(`Bot ${botId} is not running`);
    }

    const channel = await botInstance.client.channels.fetch(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    await message.delete();

    logDiscordEvent('MESSAGE_DELETED', 
      channel.guild?.id, 
      channelId, 
      botInstance.client.user.id,
      {
        botId,
        messageId,
        originalAuthor: message.author.id,
      }
    );

    return { success: true, messageId };
  } catch (error) {
    logDiscordError('DELETE_MESSAGE_ERROR', error, null, channelId, null);
    throw error;
  }
};

// Get guild (server) information
export const getGuildInfo = async (botId, guildId) => {
  try {
    const botInstance = activeBots.get(botId);
    if (!botInstance) {
      throw new Error(`Bot ${botId} is not running`);
    }

    const guild = await botInstance.client.guilds.fetch(guildId);
    if (!guild) {
      throw new Error(`Guild ${guildId} not found`);
    }

    const guildInfo = {
      id: guild.id,
      name: guild.name,
      description: guild.description,
      memberCount: guild.memberCount,
      ownerId: guild.ownerId,
      createdAt: guild.createdTimestamp,
      channels: guild.channels.cache.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
      })),
      roles: guild.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.color,
        position: role.position,
      })),
    };

    logDiscordEvent('GUILD_INFO_RETRIEVED', 
      guildId, 
      null, 
      botInstance.client.user.id,
      {
        botId,
        guildName: guild.name,
      }
    );

    return guildInfo;
  } catch (error) {
    logDiscordError('GET_GUILD_INFO_ERROR', error, guildId, null, null);
    throw error;
  }
};

// Initialize default bot
export const initializeDefaultBot = async () => {
  try {
    const defaultBotConfig = {
      id: 'default',
      token: discordConfig.token,
      clientId: discordConfig.clientId,
      clientSecret: discordConfig.clientSecret,
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

    await startBot(defaultBotConfig);
    return defaultBotConfig;
  } catch (error) {
    logger.error('Failed to initialize default bot:', error);
    throw error;
  }
};

// Cleanup function
export const cleanup = async () => {
  try {
    const stopPromises = Array.from(activeBots.keys()).map(botId => stopBot(botId));
    await Promise.all(stopPromises);
    logger.info('All bots stopped successfully');
  } catch (error) {
    logger.error('Error during cleanup:', error);
  }
}; 