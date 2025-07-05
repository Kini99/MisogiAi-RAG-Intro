import { DiscordMCPServer } from './mcp/server.js';
import { initializeDefaultBot, cleanup } from './discord/botManager.js';
import { initializeDefaultUser } from './auth/index.js';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop the MCP server
    if (global.mcpServer) {
      await global.mcpServer.stop();
    }
    
    // Cleanup Discord bots
    await cleanup();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Main application startup
const startApplication = async () => {
  try {
    logger.info('Starting Discord MCP Server...');
    
    // Initialize default admin user and API key
    logger.info('Initializing default admin user...');
    const { adminUser, apiKeyData } = initializeDefaultUser();
    
    // Initialize default Discord bot
    logger.info('Initializing default Discord bot...');
    await initializeDefaultBot();
    
    // Create and start MCP server
    logger.info('Starting MCP server...');
    const mcpServer = new DiscordMCPServer();
    global.mcpServer = mcpServer;
    
    await mcpServer.start();
    
    logger.info('Discord MCP Server started successfully!');
    logger.info('Default admin credentials:');
    logger.info(`Username: ${adminUser.username}`);
    logger.info(`Password: admin123`);
    logger.info(`API Key: ${apiKeyData.apiKey}`);
    logger.info('Please change these credentials in production!');
    
    // Keep the process running
    process.stdin.resume();
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
};

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  startApplication();
}

export { startApplication }; 