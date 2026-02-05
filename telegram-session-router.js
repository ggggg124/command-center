// Telegram Session Router
// Fixes session routing confusion between home/work/admin Telegram bots
// Usage: node telegram-session-router.js <sessionKey> <message>

const fs = require('fs');
const path = require('path');

const SESSION_MANAGER_PATH = path.join(__dirname, 'session-manager-fixed.json');
const SESSIONS_JSON_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');

class TelegramSessionRouter {
  constructor() {
    this.sessionManager = this.loadSessionManager();
    this.sessions = this.loadSessions();
  }

  loadSessionManager() {
    try {
      const data = fs.readFileSync(SESSION_MANAGER_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading session manager:', error.message);
      return null;
    }
  }

  loadSessions() {
    try {
      const data = fs.readFileSync(SESSIONS_JSON_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading sessions:', error.message);
      return {};
    }
  }

  getSessionContext(sessionKey) {
    if (!this.sessionManager || !this.sessions) {
      return { error: 'Failed to load session data' };
    }

    // Map session key to context
    const context = this.sessionManager.sessionMapping[sessionKey];
    if (!context) {
      return { error: `Unknown session key: ${sessionKey}` };
    }

    const sessionInfo = this.sessionManager.sessions[context];
    if (!sessionInfo) {
      return { error: `No session info for context: ${context}` };
    }

    // Get session data from sessions.json
    const sessionData = this.sessions[sessionKey];
    
    return {
      context,
      sessionInfo,
      sessionData: sessionData || { error: 'Session not found in sessions.json' },
      persona: sessionInfo.persona,
      topics: sessionInfo.topics,
      telegramAccount: sessionInfo.telegramAccount,
      lastActive: sessionInfo.lastActive
    };
  }

  validateMessageContext(sessionKey, message) {
    const context = this.getSessionContext(sessionKey);
    if (context.error) {
      return { valid: false, error: context.error };
    }

    const { context: sessionContext, topics, persona } = context;
    const messageLower = message.toLowerCase();

    // Check if message matches session topics
    let topicMatches = 0;
    const matchedTopics = [];
    
    topics.forEach(topic => {
      if (messageLower.includes(topic.toLowerCase())) {
        topicMatches++;
        matchedTopics.push(topic);
      }
    });

    // Also check autoSwitchPatterns for broader matching
    const autoPatterns = this.sessionManager.autoSwitchPatterns[sessionContext] || [];
    let patternMatches = 0;
    const matchedPatterns = [];
    
    autoPatterns.forEach(pattern => {
      if (messageLower.includes(pattern.toLowerCase())) {
        patternMatches++;
        matchedPatterns.push(pattern);
      }
    });

    // Combine matches
    const totalMatches = topicMatches + patternMatches;
    const allMatched = [...matchedTopics, ...matchedPatterns];

    // Check for cross-context confusion
    const otherContexts = Object.keys(this.sessionManager.sessions).filter(c => c !== sessionContext);
    let crossContextMatches = 0;
    const crossContextWarnings = [];

    otherContexts.forEach(otherContext => {
      // Check other session's topics
      const otherTopics = this.sessionManager.sessions[otherContext].topics;
      otherTopics.forEach(topic => {
        if (messageLower.includes(topic.toLowerCase())) {
          crossContextMatches++;
          crossContextWarnings.push({
            context: otherContext,
            topic: topic,
            type: 'topic',
            sessionKey: this.sessionManager.sessions[otherContext].sessionKey
          });
        }
      });

      // Check other session's autoSwitchPatterns
      const otherPatterns = this.sessionManager.autoSwitchPatterns[otherContext] || [];
      otherPatterns.forEach(pattern => {
        if (messageLower.includes(pattern.toLowerCase())) {
          crossContextMatches++;
          crossContextWarnings.push({
            context: otherContext,
            topic: pattern,
            type: 'pattern',
            sessionKey: this.sessionManager.sessions[otherContext].sessionKey
          });
        }
      });
    });

    return {
      valid: true,
      sessionContext,
      persona,
      topicAnalysis: {
        matches: totalMatches,
        matchedTopics: allMatched,
        topicMatches,
        patternMatches,
        crossContextMatches,
        crossContextWarnings,
        confidence: totalMatches > 0 ? 'high' : (crossContextMatches > 0 ? 'low' : 'neutral')
      },
      recommendation: totalMatches > 0 
        ? 'Message context matches session persona'
        : crossContextMatches > 0
        ? `WARNING: Message may belong to ${crossContextWarnings[0].context} context`
        : 'Message context neutral'
    };
  }

  logSessionActivity(sessionKey, message) {
    const context = this.getSessionContext(sessionKey);
    if (context.error) {
      console.error('Cannot log activity:', context.error);
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      sessionKey,
      context: context.context,
      messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      validation: this.validateMessageContext(sessionKey, message)
    };

    const logFile = path.join(__dirname, 'telegram-session-logs.json');
    let logs = [];
    
    try {
      const existing = fs.readFileSync(logFile, 'utf8');
      logs = JSON.parse(existing);
    } catch (error) {
      // File doesn't exist or is invalid
    }

    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    return logEntry;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node telegram-session-router.js <sessionKey> <message>');
    console.log('Example: node telegram-session-router.js "agent:main:telegram:home:dm:5086862672" "Add milk to shopping list"');
    process.exit(1);
  }

  const sessionKey = args[0];
  const message = args.slice(1).join(' ');
  
  const router = new TelegramSessionRouter();
  
  console.log('=== Telegram Session Router ===');
  console.log(`Session Key: ${sessionKey}`);
  console.log(`Message: ${message}`);
  console.log('');
  
  const context = router.getSessionContext(sessionKey);
  if (context.error) {
    console.error('Error:', context.error);
    process.exit(1);
  }

  console.log('Session Context:');
  console.log(`- Context: ${context.context}`);
  console.log(`- Persona: ${context.persona}`);
  console.log(`- Telegram Account: ${context.telegramAccount}`);
  console.log(`- Topics: ${context.topics.join(', ')}`);
  console.log('');
  
  const validation = router.validateMessageContext(sessionKey, message);
  console.log('Message Validation:');
  console.log(`- Confidence: ${validation.topicAnalysis.confidence}`);
  console.log(`- Topic Matches: ${validation.topicAnalysis.matches}`);
  
  if (validation.topicAnalysis.matchedTopics.length > 0) {
    console.log(`- Matched Topics: ${validation.topicAnalysis.matchedTopics.join(', ')}`);
  }
  
  if (validation.topicAnalysis.crossContextWarnings.length > 0) {
    console.log('\n⚠️  CROSS-CONTEXT WARNINGS:');
    validation.topicAnalysis.crossContextWarnings.forEach(warning => {
      console.log(`  - Message may belong to ${warning.context} context (topic: ${warning.topic})`);
    });
  }
  
  console.log(`\nRecommendation: ${validation.recommendation}`);
  
  // Log the activity
  const logEntry = router.logSessionActivity(sessionKey, message);
  console.log(`\nLogged activity to telegram-session-logs.json`);
}

module.exports = TelegramSessionRouter;