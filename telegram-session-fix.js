// Telegram Session Fix - Immediate Routing Solution
// Fixes cross-context message routing between home/work/admin Telegram bots

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class TelegramSessionFix {
  constructor() {
    this.workspacePath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
    this.sessionManagerPath = path.join(this.workspacePath, 'session-manager-fixed.json');
    this.sessionsJsonPath = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'agents', 'main', 'sessions', 'sessions.json');
    this.sessionManager = this.loadSessionManager();
    this.sessions = this.loadSessions();
  }

  loadSessionManager() {
    try {
      const data = fs.readFileSync(this.sessionManagerPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading session manager:', error.message);
      return null;
    }
  }

  loadSessions() {
    try {
      const data = fs.readFileSync(this.sessionsJsonPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading sessions:', error.message);
      return {};
    }
  }

  // Analyze message and determine correct context
  analyzeMessage(sessionKey, message) {
    if (!this.sessionManager) {
      return { error: 'Session manager not loaded' };
    }

    const sessionContext = this.sessionManager.sessionMapping[sessionKey];
    if (!sessionContext) {
      return { error: `Unknown session: ${sessionKey}` };
    }

    const messageLower = message.toLowerCase();
    let bestMatch = { context: sessionContext, score: 0, matches: [] };
    const allMatches = [];

    // Check all contexts for matches
    Object.keys(this.sessionManager.autoSwitchPatterns).forEach(context => {
      const patterns = this.sessionManager.autoSwitchPatterns[context] || [];
      let score = 0;
      const matches = [];

      patterns.forEach(pattern => {
        if (messageLower.includes(pattern.toLowerCase())) {
          score++;
          matches.push(pattern);
        }
      });

      // Also check topics
      const sessionInfo = this.sessionManager.sessions[context];
      if (sessionInfo && sessionInfo.topics) {
        sessionInfo.topics.forEach(topic => {
          if (messageLower.includes(topic.toLowerCase())) {
            score++;
            matches.push(topic);
          }
        });
      }

      if (score > 0) {
        allMatches.push({ context, score, matches });
        if (score > bestMatch.score) {
          bestMatch = { context, score, matches };
        }
      }
    });

    // Determine if message is misrouted
    const isMisrouted = bestMatch.context !== sessionContext && bestMatch.score > 0;
    const currentSessionInfo = this.sessionManager.sessions[sessionContext];
    const targetSessionInfo = this.sessionManager.sessions[bestMatch.context];

    return {
      currentContext: sessionContext,
      recommendedContext: bestMatch.context,
      isMisrouted,
      confidence: bestMatch.score,
      matches: bestMatch.matches,
      allMatches,
      currentSession: currentSessionInfo,
      recommendedSession: targetSessionInfo,
      message: `Message appears to be about: ${bestMatch.matches.join(', ')}`
    };
  }

  // Generate response for misrouted message
  generateMisrouteResponse(analysis) {
    if (!analysis.isMisrouted) {
      return null;
    }

    const responses = {
      home: {
        title: "🏠 Home Bot Response",
        message: `I see you're talking about ${analysis.matches.join(', ')}. This looks like a home/family topic!`,
        suggestion: `For home/family topics like recipes, shopping, or calendar, please message the **Home Bot** (@${analysis.recommendedSession.telegramAccount || 'home_bot'})`,
        redirect: `I'll help you with this, but remember for future: Home topics → Home Bot`
      },
      work: {
        title: "💼 Work Bot Response", 
        message: `I see you're talking about ${analysis.matches.join(', ')}. This looks like a work/business topic!`,
        suggestion: `For work/business topics like projects, emails, or scheduling, please message the **Work Bot** (@${analysis.recommendedSession.telegramAccount || 'work_bot'})`,
        redirect: `I'll help you with this, but remember for future: Work topics → Work Bot`
      },
      admin: {
        title: "⚙️ Admin Bot Response",
        message: `I see you're talking about ${analysis.matches.join(', ')}. This looks like a technical/admin topic!`,
        suggestion: `For technical topics like development, OpenClaw config, or system management, please message the **Admin Bot** (@${analysis.recommendedSession.telegramAccount || 'admin_bot'})`,
        redirect: `I'll help you with this, but remember for future: Technical topics → Admin Bot`
      }
    };

    const response = responses[analysis.recommendedContext];
    if (!response) return null;

    return `
${response.title}

${response.message}

${response.suggestion}

${response.redirect}

**Current Bot:** ${analysis.currentSession.name}
**Recommended Bot:** ${analysis.recommendedSession.name}
**Matched Keywords:** ${analysis.matches.join(', ')}
`;
  }

  // Generate session awareness message
  generateSessionAwareness(sessionKey) {
    const sessionContext = this.sessionManager.sessionMapping[sessionKey];
    if (!sessionContext) return null;

    const sessionInfo = this.sessionManager.sessions[sessionContext];
    if (!sessionInfo) return null;

    const awareness = {
      home: `
🏠 **Home Bot - Family Assistant**
I help with: Recipes, shopping lists, meal planning, family calendar, home tasks
Examples: "Add milk to shopping list", "What's for dinner?", "Plan meals for week"
`,
      work: `
💼 **Work Bot - Business Assistant**  
I help with: Projects, client communication, scheduling, business analytics
Examples: "Check project status", "Schedule meeting", "Send email to client"
`,
      admin: `
⚙️ **Admin Bot - Technical Assistant**
I help with: Development, OpenClaw management, system configuration, debugging
Examples: "Check OpenClaw status", "Fix config issue", "Build new feature"
`
    };

    return awareness[sessionContext] || `I am the ${sessionInfo.name}. ${sessionInfo.persona}`;
  }

  // Update session history
  updateSessionHistory(sessionKey, message, analysis) {
    const sessionContext = this.sessionManager.sessionMapping[sessionKey];
    if (!sessionContext) return;

    const historyFile = path.join(this.workspacePath, `session-${sessionContext}-history.json`);
    const timestamp = new Date().toISOString();
    
    const entry = {
      timestamp,
      sessionKey,
      context: sessionContext,
      message: message.substring(0, 200),
      analysis: {
        isMisrouted: analysis.isMisrouted,
        recommendedContext: analysis.recommendedContext,
        matches: analysis.matches
      }
    };

    let history = { entries: [] };
    try {
      const data = fs.readFileSync(historyFile, 'utf8');
      history = JSON.parse(data);
      if (!history.entries) {
        history.entries = [];
      }
    } catch (error) {
      // File doesn't exist or is invalid, create new structure
      history = { entries: [], created: timestamp };
    }

    history.entries.push(entry);
    
    // Keep only last 50 entries
    if (history.entries.length > 50) {
      history.entries = history.entries.slice(-50);
    }

    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  }

  // Main fix function
  async fixSessionRouting(sessionKey, message) {
    console.log('=== TELEGRAM SESSION ROUTING FIX ===');
    console.log(`Session: ${sessionKey}`);
    console.log(`Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    console.log('');

    // Load data
    if (!this.sessionManager) {
      console.error('ERROR: Cannot load session manager');
      return { error: 'Session manager not available' };
    }

    // Analyze message
    const analysis = this.analyzeMessage(sessionKey, message);
    if (analysis.error) {
      console.error('ERROR:', analysis.error);
      return { error: analysis.error };
    }

    console.log('ANALYSIS RESULTS:');
    console.log(`- Current Context: ${analysis.currentContext}`);
    console.log(`- Recommended Context: ${analysis.recommendedContext}`);
    console.log(`- Is Misrouted: ${analysis.isMisrouted ? 'YES ⚠️' : 'No'}`);
    console.log(`- Confidence Score: ${analysis.confidence}`);
    console.log(`- Matched Keywords: ${analysis.matches.join(', ') || 'None'}`);
    console.log('');

    // Generate responses
    const awareness = this.generateSessionAwareness(sessionKey);
    const misrouteResponse = analysis.isMisrouted ? this.generateMisrouteResponse(analysis) : null;

    // Update history
    this.updateSessionHistory(sessionKey, message, analysis);

    // Return complete response
    const response = {
      analysis,
      awareness,
      misrouteResponse,
      recommendations: []
    };

    if (analysis.isMisrouted) {
      response.recommendations.push({
        type: 'redirect',
        message: `Message appears to belong to ${analysis.recommendedContext} context`,
        action: `Consider using ${analysis.recommendedSession.name} for similar messages`
      });
    }

    // Log to central log
    this.logToCentralLog(sessionKey, message, analysis);

    console.log('FIX APPLIED:');
    if (misrouteResponse) {
      console.log(misrouteResponse);
    } else {
      console.log('✓ Message correctly routed to appropriate context');
    }

    return response;
  }

  // Log to central log file
  logToCentralLog(sessionKey, message, analysis) {
    const logFile = path.join(this.workspacePath, 'telegram-session-fix-log.json');
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      timestamp,
      sessionKey,
      messagePreview: message.substring(0, 100),
      analysis: {
        currentContext: analysis.currentContext,
        recommendedContext: analysis.recommendedContext,
        isMisrouted: analysis.isMisrouted,
        matches: analysis.matches
      },
      fixApplied: analysis.isMisrouted
    };

    let logs = [];
    try {
      const data = fs.readFileSync(logFile, 'utf8');
      logs = JSON.parse(data);
    } catch (error) {
      // File doesn't exist
    }

    logs.push(logEntry);
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }

  // Test the fix with example messages
  async testFix() {
    console.log('🧪 TESTING SESSION ROUTING FIX\n');

    const testCases = [
      {
        session: 'agent:main:telegram:work:dm:5086862672',
        message: 'Add milk to shopping list',
        expected: 'home'
      },
      {
        session: 'agent:main:telegram:home:dm:5086862672', 
        message: 'Check system backup status',
        expected: 'admin'
      },
      {
        session: 'agent:main:telegram:admin:dm:5086862672',
        message: 'Plan meals for the week',
        expected: 'home'
      },
      {
        session: 'agent:main:telegram:home:dm:5086862672',
        message: 'What should we have for dinner?',
        expected: 'home'
      },
      {
        session: 'agent:main:telegram:work:dm:5086862672',
        message: 'Schedule meeting with client',
        expected: 'work'
      }
    ];

    for (const test of testCases) {
      console.log(`Test: "${test.message.substring(0, 40)}..."`);
      console.log(`Sent to: ${test.session.split(':')[3]} bot`);
      
      const result = await this.fixSessionRouting(test.session, test.message);
      
      if (result.analysis) {
        const correct = result.analysis.recommendedContext === test.expected;
        console.log(`Expected: ${test.expected}, Got: ${result.analysis.recommendedContext} ${correct ? '✓' : '✗'}`);
        console.log(`Misrouted: ${result.analysis.isMisrouted ? 'YES' : 'No'}`);
      }
      
      console.log('---\n');
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const fix = new TelegramSessionFix();

  if (args.length === 0) {
    // Run tests
    fix.testFix();
  } else if (args[0] === 'test') {
    fix.testFix();
  } else if (args.length >= 2) {
    // Analyze specific message
    const sessionKey = args[0];
    const message = args.slice(1).join(' ');
    fix.fixSessionRouting(sessionKey, message);
  } else {
    console.log('Usage:');
    console.log('  node telegram-session-fix.js test                    - Run tests');
    console.log('  node telegram-session-fix.js <sessionKey> <message>  - Analyze message');
    console.log('');
    console.log('Example:');
    console.log('  node telegram-session-fix.js "agent:main:telegram:work:dm:5086862672" "Add milk to shopping list"');
  }
}

module.exports = TelegramSessionFix;