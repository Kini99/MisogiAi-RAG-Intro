import { config } from '../config/index.js';
import { logSecurityEvent, logger } from '../utils/logger.js';

// Content moderation rules and patterns
const moderationRules = {
  // Forbidden words (case-insensitive)
  forbiddenWords: new Set(config.contentModeration.forbiddenWords),
  
  // Spam patterns
  spamPatterns: [
    /(.)\1{4,}/g, // Repeated characters (5+ times)
    /(https?:\/\/[^\s]+){3,}/g, // Multiple URLs
    /([A-Za-z0-9])\1{10,}/g, // Repeated alphanumeric (10+ times)
  ],
  
  // Suspicious patterns
  suspiciousPatterns: [
    /\b(?:buy|sell|discount|free|money|cash|bitcoin|eth|crypto)\b/gi,
    /\b(?:click|link|url|website|join|subscribe)\b/gi,
  ],
};

// Content moderation result
export class ModerationResult {
  constructor(isApproved, reason, severity, actions) {
    this.isApproved = isApproved;
    this.reason = reason;
    this.severity = severity; // 'low', 'medium', 'high', 'critical'
    this.actions = actions || [];
    this.timestamp = new Date();
  }
}

// Check message length
const checkMessageLength = (content) => {
  const maxLength = config.contentModeration.maxMessageLength;
  
  if (content.length > maxLength) {
    return new ModerationResult(
      false,
      `Message exceeds maximum length of ${maxLength} characters`,
      'medium',
      ['truncate', 'warn']
    );
  }
  
  return new ModerationResult(true, 'Message length acceptable', 'low');
};

// Check for forbidden words
const checkForbiddenWords = (content) => {
  const lowerContent = content.toLowerCase();
  const foundWords = [];
  
  for (const word of moderationRules.forbiddenWords) {
    if (lowerContent.includes(word)) {
      foundWords.push(word);
    }
  }
  
  if (foundWords.length > 0) {
    const severity = foundWords.length >= 3 ? 'high' : 'medium';
    const actions = severity === 'high' ? ['delete', 'warn', 'timeout'] : ['warn'];
    
    return new ModerationResult(
      false,
      `Forbidden words detected: ${foundWords.join(', ')}`,
      severity,
      actions
    );
  }
  
  return new ModerationResult(true, 'No forbidden words detected', 'low');
};

// Check for spam patterns
const checkSpamPatterns = (content) => {
  for (const pattern of moderationRules.spamPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      return new ModerationResult(
        false,
        'Spam pattern detected',
        'medium',
        ['warn', 'delete']
      );
    }
  }
  
  return new ModerationResult(true, 'No spam patterns detected', 'low');
};

// Check for suspicious content
const checkSuspiciousContent = (content) => {
  const lowerContent = content.toLowerCase();
  let suspiciousCount = 0;
  
  for (const pattern of moderationRules.suspiciousPatterns) {
    const matches = lowerContent.match(pattern);
    if (matches) {
      suspiciousCount += matches.length;
    }
  }
  
  if (suspiciousCount >= 3) {
    return new ModerationResult(
      false,
      'Suspicious content detected',
      'medium',
      ['flag', 'warn']
    );
  }
  
  return new ModerationResult(true, 'Content appears normal', 'low');
};

// Check for excessive mentions
const checkExcessiveMentions = (content) => {
  const mentionPattern = /<@!?\d+>/g;
  const mentions = content.match(mentionPattern);
  
  if (mentions && mentions.length > 5) {
    return new ModerationResult(
      false,
      'Excessive mentions detected',
      'medium',
      ['warn', 'delete']
    );
  }
  
  return new ModerationResult(true, 'Mention count acceptable', 'low');
};

// Check for excessive emojis
const checkExcessiveEmojis = (content) => {
  const emojiPattern = /<a?:.+?:\d+>/g;
  const emojis = content.match(emojiPattern);
  
  if (emojis && emojis.length > 10) {
    return new ModerationResult(
      false,
      'Excessive emojis detected',
      'low',
      ['warn']
    );
  }
  
  return new ModerationResult(true, 'Emoji count acceptable', 'low');
};

// Check for caps spam
const checkCapsSpam = (content) => {
  const letters = content.replace(/[^a-zA-Z]/g, '');
  const upperCase = content.replace(/[^A-Z]/g, '');
  
  if (letters.length > 10 && (upperCase.length / letters.length) > 0.7) {
    return new ModerationResult(
      false,
      'Excessive capitalization detected',
      'low',
      ['warn']
    );
  }
  
  return new ModerationResult(true, 'Capitalization acceptable', 'low');
};

// Main content moderation function
export const moderateContent = (content, userId, channelId, guildId) => {
  try {
    if (!config.contentModeration.enabled) {
      return new ModerationResult(true, 'Content moderation disabled', 'low');
    }
    
    const checks = [
      checkMessageLength(content),
      checkForbiddenWords(content),
      checkSpamPatterns(content),
      checkSuspiciousContent(content),
      checkExcessiveMentions(content),
      checkExcessiveEmojis(content),
      checkCapsSpam(content),
    ];
    
    // Find the most severe violation
    const violations = checks.filter(check => !check.isApproved);
    
    if (violations.length === 0) {
      return new ModerationResult(true, 'Content approved', 'low');
    }
    
    // Sort by severity
    const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const worstViolation = violations.sort((a, b) => 
      severityOrder[b.severity] - severityOrder[a.severity]
    )[0];
    
    // Log the moderation event
    logSecurityEvent('CONTENT_MODERATED', worstViolation.severity, {
      userId,
      channelId,
      guildId,
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      reason: worstViolation.reason,
      actions: worstViolation.actions,
    });
    
    return worstViolation;
  } catch (error) {
    logger.error('Content moderation error:', error);
    return new ModerationResult(true, 'Moderation check failed', 'low');
  }
};

// Moderate user behavior (rate limiting, etc.)
export const moderateUserBehavior = (userId, guildId, action) => {
  // This would typically integrate with a database to track user behavior
  // For now, we'll use a simple in-memory store
  const userActions = new Map();
  
  const key = `${userId}-${guildId}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  
  if (!userActions.has(key)) {
    userActions.set(key, []);
  }
  
  const actions = userActions.get(key);
  const recentActions = actions.filter(time => now - time < windowMs);
  
  // Check for excessive actions
  if (recentActions.length > 10) {
    logSecurityEvent('USER_BEHAVIOR_MODERATED', 'medium', {
      userId,
      guildId,
      action,
      actionCount: recentActions.length,
    });
    
    return {
      shouldModerate: true,
      reason: 'Excessive activity detected',
      actions: ['timeout', 'warn'],
    };
  }
  
  recentActions.push(now);
  userActions.set(key, recentActions);
  
  return {
    shouldModerate: false,
    reason: 'User behavior acceptable',
  };
};

// Get moderation statistics
export const getModerationStats = () => {
  return {
    enabled: config.contentModeration.enabled,
    maxMessageLength: config.contentModeration.maxMessageLength,
    forbiddenWordsCount: moderationRules.forbiddenWords.size,
    spamPatternsCount: moderationRules.spamPatterns.length,
    suspiciousPatternsCount: moderationRules.suspiciousPatterns.length,
  };
};

// Add custom forbidden word
export const addForbiddenWord = (word) => {
  if (typeof word === 'string' && word.trim().length > 0) {
    moderationRules.forbiddenWords.add(word.trim().toLowerCase());
    logger.info(`Added forbidden word: ${word}`);
    return true;
  }
  return false;
};

// Remove forbidden word
export const removeForbiddenWord = (word) => {
  if (moderationRules.forbiddenWords.has(word.toLowerCase())) {
    moderationRules.forbiddenWords.delete(word.toLowerCase());
    logger.info(`Removed forbidden word: ${word}`);
    return true;
  }
  return false;
};

// Get all forbidden words
export const getForbiddenWords = () => {
  return Array.from(moderationRules.forbiddenWords);
};

// Test content moderation
export const testModeration = (content) => {
  const result = moderateContent(content, 'test-user', 'test-channel', 'test-guild');
  
  return {
    content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
    result: {
      isApproved: result.isApproved,
      reason: result.reason,
      severity: result.severity,
      actions: result.actions,
    },
  };
}; 