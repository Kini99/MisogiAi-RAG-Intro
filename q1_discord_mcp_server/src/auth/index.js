import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { logAudit, logSecurityEvent } from '../utils/logger.js';

// In-memory storage for API keys (in production, use a database)
const apiKeys = new Map();
const users = new Map();

// Generate a secure API key
export const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate a secure JWT secret
export const generateJWTSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Create a new API key for a user
export const createApiKey = (userId, permissions = []) => {
  const apiKey = generateApiKey();
  const hashedKey = bcrypt.hashSync(apiKey, config.bcryptRounds);
  
  const keyData = {
    userId,
    hashedKey,
    permissions,
    createdAt: new Date(),
    lastUsed: null,
    isActive: true,
  };
  
  apiKeys.set(apiKey, keyData);
  
  logAudit('API_KEY_CREATED', userId, 'api_key', { permissions });
  
  return {
    apiKey,
    permissions,
    createdAt: keyData.createdAt,
  };
};

// Validate API key
export const validateApiKey = (apiKey) => {
  if (!apiKey) {
    return null;
  }
  
  const keyData = apiKeys.get(apiKey);
  if (!keyData || !keyData.isActive) {
    return null;
  }
  
  // Update last used timestamp
  keyData.lastUsed = new Date();
  apiKeys.set(apiKey, keyData);
  
  return {
    userId: keyData.userId,
    permissions: keyData.permissions,
  };
};

// Check if user has permission
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  return userPermissions.includes(requiredPermission) || 
         userPermissions.includes('admin') ||
         userPermissions.includes('*');
};

// Generate JWT token
export const generateToken = (userId, permissions = []) => {
  const payload = {
    userId,
    permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  };
  
  return jwt.sign(payload, config.jwtSecret);
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return {
      userId: decoded.userId,
      permissions: decoded.permissions || [],
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    logSecurityEvent('JWT_VERIFICATION_FAILED', 'warning', { error: error.message });
    return null;
  }
};

// Create a new user
export const createUser = (username, email, password, permissions = []) => {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const hashedPassword = bcrypt.hashSync(password, config.bcryptRounds);
  
  const user = {
    id: userId,
    username,
    email,
    hashedPassword,
    permissions,
    createdAt: new Date(),
    lastLogin: null,
    isActive: true,
  };
  
  users.set(userId, user);
  
  logAudit('USER_CREATED', userId, 'user', { username, email, permissions });
  
  return {
    id: userId,
    username,
    email,
    permissions,
    createdAt: user.createdAt,
  };
};

// Authenticate user with username/password
export const authenticateUser = (username, password) => {
  const user = Array.from(users.values()).find(u => 
    u.username === username && u.isActive
  );
  
  if (!user) {
    logSecurityEvent('LOGIN_FAILED', 'info', { username, reason: 'user_not_found' });
    return null;
  }
  
  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    logSecurityEvent('LOGIN_FAILED', 'warning', { username, reason: 'invalid_password' });
    return null;
  }
  
  // Update last login
  user.lastLogin = new Date();
  users.set(user.id, user);
  
  logAudit('USER_LOGIN', user.id, 'user', { username });
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    permissions: user.permissions,
    lastLogin: user.lastLogin,
  };
};

// Middleware for API key authentication
export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY',
    });
  }
  
  const keyData = validateApiKey(apiKey);
  if (!keyData) {
    logSecurityEvent('INVALID_API_KEY', 'warning', { ip: req.ip });
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
  }
  
  req.user = {
    id: keyData.userId,
    permissions: keyData.permissions,
    authType: 'api_key',
  };
  
  next();
};

// Middleware for JWT authentication
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'JWT token required',
      code: 'MISSING_JWT_TOKEN',
    });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid JWT token',
      code: 'INVALID_JWT_TOKEN',
    });
  }
  
  req.user = {
    id: decoded.userId,
    permissions: decoded.permissions,
    authType: 'jwt',
  };
  
  next();
};

// Middleware for permission checking
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }
    
    if (!hasPermission(req.user.permissions, permission)) {
      logSecurityEvent('PERMISSION_DENIED', 'warning', {
        userId: req.user.id,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        ip: req.ip,
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permission,
      });
    }
    
    next();
  };
};

// Middleware for multi-tenancy support
export const requireBotAccess = (req, res, next) => {
  const botId = req.params.botId || req.body.botId || req.query.botId;
  
  if (!botId) {
    return res.status(400).json({
      error: 'Bot ID required',
      code: 'MISSING_BOT_ID',
    });
  }
  
  // Check if user has access to this bot
  if (!hasPermission(req.user.permissions, 'admin') && 
      !hasPermission(req.user.permissions, `bot:${botId}`)) {
    return res.status(403).json({
      error: 'Access denied to bot',
      code: 'BOT_ACCESS_DENIED',
      botId,
    });
  }
  
  req.botId = botId;
  next();
};

// Rate limiting middleware
export const createRateLimiter = (windowMs, maxRequests) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user ? req.user.id : req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    requests.set(key, validRequests);
    
    if (validRequests.length >= maxRequests) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', 'warning', {
        userId: req.user?.id,
        ip: req.ip,
        requests: validRequests.length,
      });
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }
    
    validRequests.push(now);
    next();
  };
};

// Initialize default admin user and API key
export const initializeDefaultUser = () => {
  // Create default admin user if it doesn't exist
  const adminUser = createUser(
    'admin',
    'admin@discord-mcp.com',
    'admin123', // In production, use a secure password
    ['admin', '*']
  );
  
  // Create API key for admin user
  const apiKeyData = createApiKey(adminUser.id, ['admin', '*']);
  
  console.log('Default admin user created:');
  console.log(`Username: ${adminUser.username}`);
  console.log(`Password: admin123`);
  console.log(`API Key: ${apiKeyData.apiKey}`);
  console.log('Please change these credentials in production!');
  
  return { adminUser, apiKeyData };
}; 