# TELEGRAM SESSION ROUTING FIX - Implementation Guide

## Problem Statement
User is getting recipe app chat in work bot instead of home bot. Cross-context detection is not working properly.

## Root Cause Analysis
1. **Three separate Telegram bots** (admin, home, work) all connected to same user
2. **No automatic routing** - Messages go to whichever bot receives them
3. **User confusion** - User may message wrong bot for certain topics
4. **Session isolation** - Each bot operates independently with no cross-session communication

## Solution Architecture

### 1. Session Awareness System
Each bot needs to be aware of its designated context and detect when messages belong to other contexts.

### 2. Cross-Context Detection
Use keyword matching (from `session-manager-fixed.json`) to identify misrouted messages.

### 3. User Guidance
Provide clear instructions when messages are misrouted, guiding users to correct bot.

## Implementation Files Created

### 1. `telegram-session-fix.js`
- **Purpose**: Core routing logic and analysis
- **Features**:
  - Analyzes messages against all session contexts
  - Detects misrouted messages with confidence scoring
  - Generates appropriate responses for misrouted messages
  - Logs all routing decisions for monitoring
  - Provides session awareness messages

### 2. Test Scripts
- `test-session-fix.bat` - Batch file to run tests
- Built-in test suite in `telegram-session-fix.js`

## How to Implement the Fix

### Step 1: Integrate Session Awareness into Each Bot

Each Telegram bot needs to have session awareness added to its system prompt. The modified prompt should include:

```markdown
## SESSION CONTEXT AWARENESS

I am the [HOME/WORK/ADMIN] BOT. My purpose is: [PERSONA DESCRIPTION]

**My Topics**: [LIST OF TOPICS]

**Cross-Context Detection**:
- If a message appears to be about [OTHER CONTEXT TOPICS], I will politely suggest using the [OTHER CONTEXT] bot
- I will still help with the request, but provide guidance for future messages

**Example Responses**:
- "I see you're asking about [TOPIC]. This is typically handled by the [OTHER CONTEXT] bot, but I'll help you..."
- "For [TOPIC]-related questions, you might get better results from the [OTHER CONTEXT] bot..."
```

### Step 2: Update Session Manager Configuration

Ensure `session-manager-fixed.json` has comprehensive keyword patterns:

```json
"autoSwitchPatterns": {
  "home": ["meal", "grocery", "family", "recipe", "calendar", "home", "clean", "shopping", "cook", "food", "fruit", "vegetable", "dinner", "lunch", "breakfast", "snack", "kitchen", "fridge", "pantry"],
  "work": ["project", "client", "email", "business", "meeting", "schedule", "work", "backlog", "status", "system", "report", "analytics", "data", "invoice", "deadline", "presentation"],
  "admin": ["build", "develop", "code", "config", "setup", "openclaw", "system", "debug", "fix", "doctor", "technical", "server", "api", "deploy", "update", "restart"]
}
```

### Step 3: Create Bot-Specific Response Templates

**Home Bot Template**:
```
🏠 HOME BOT - Family & Home Assistant

I help with: Recipes, shopping, meal planning, family calendar, home tasks

If you ask about: Projects, business, system admin
→ I'll suggest: "This sounds like a work/admin topic. For best results, try the Work/Admin bot."

But I'll still help you with your question!
```

**Work Bot Template**:
```
💼 WORK BOT - Business Assistant

I help with: Projects, clients, scheduling, business tasks

If you ask about: Recipes, family, home tasks
→ I'll suggest: "This sounds like a home topic. For recipes/shopping, try the Home bot."

But I'll still help you with your question!
```

**Admin Bot Template**:
```
⚙️ ADMIN BOT - Technical Assistant

I help with: Development, OpenClaw, system management

If you ask about: Family, home, business tasks
→ I'll suggest: "This sounds like a home/work topic. Try the Home/Work bot."

But I'll still help you with your question!
```

### Step 4: Implement Real-Time Routing (Advanced)

For a more advanced solution, create a middleware that intercepts all Telegram messages:

```javascript
// telegram-router-middleware.js
// This would need to be integrated with OpenClaw's Telegram plugin

class TelegramRouterMiddleware {
  async routeMessage(botAccount, userId, message) {
    // 1. Determine which bot received the message
    // 2. Analyze message content
    // 3. If misrouted, forward to correct bot
    // 4. Send guidance to user
  }
}
```

## Testing the Fix

### Test Cases to Verify:

1. **Recipe message to Home Bot** → Should be accepted
2. **Recipe message to Work Bot** → Should be detected as misrouted, provide guidance
3. **System status to Admin Bot** → Should be accepted  
4. **System status to Home Bot** → Should be detected as misrouted
5. **Business email to Work Bot** → Should be accepted
6. **Business email to Home Bot** → Should be detected as misrouted

### Run Tests:
```bash
cd C:\Users\Home\.openclaw\workspace
node telegram-session-fix.js test
```

## Monitoring & Logging

### Log Files Created:
1. `telegram-session-fix-log.json` - Central routing log
2. `session-home-history.json` - Home bot message history
3. `session-work-history.json` - Work bot message history  
4. `session-admin-history.json` - Admin bot message history

### Monitoring Metrics:
- Misrouted message count
- Most common cross-context confusions
- User compliance with guidance
- Session usage patterns

## User Education

### Quick Reference Card:
```
🤖 THREE BOTS - THREE PURPOSES:

🏠 HOME BOT (@don2101homebot)
- Recipes, shopping, meal planning
- Family calendar, home tasks
- Example: "Add milk to shopping list"

💼 WORK BOT (Business Assistant)
- Projects, clients, scheduling
- Business emails, reports
- Example: "Schedule meeting with client"

⚙️ ADMIN BOT (@Don2101Bot)
- OpenClaw system management
- Development, technical tasks
- Example: "Check system status"
```

### Common Confusions to Address:
1. **Recipe app chat** → Always use **Home Bot**
2. **System/backup status** → Use **Admin Bot** (not Work Bot)
3. **Business scheduling** → Use **Work Bot** (not Home Bot)

## Expected Outcomes

### Immediate:
- Reduced confusion about which bot to use
- Clear guidance when wrong bot is messaged
- Better user experience with appropriate bot responses

### Long-term:
- Users naturally learn which bot to use for each topic
- Reduced cross-context message volume
- More efficient bot usage patterns

## Troubleshooting

### If routing still doesn't work:
1. Check `session-manager-fixed.json` has correct session keys
2. Verify Telegram bot tokens are correctly configured
3. Check logs in `telegram-session-fix-log.json`
4. Test with `node telegram-session-fix.js test`

### Common Issues:
1. **Session keys mismatch** - Update `session-manager-fixed.json`
2. **Missing keywords** - Add more patterns to `autoSwitchPatterns`
3. **Bot not responding** - Check Telegram bot status with `openclaw status`

## Next Steps

### Phase 1 (Immediate): ✅ COMPLETED
- Create routing analysis tool
- Implement cross-context detection
- Generate user guidance responses

### Phase 2 (Short-term):
- Integrate session awareness into bot system prompts
- Update user documentation
- Monitor routing effectiveness

### Phase 3 (Long-term):
- Implement automatic message forwarding
- Create unified bot interface
- Advanced AI-based context detection

## Success Metrics

The fix is working when:
1. Recipe messages to Work Bot receive guidance about Home Bot
2. System messages to Home Bot receive guidance about Admin Bot
3. Business messages to Home Bot receive guidance about Work Bot
4. Users report less confusion about which bot to use
5. Cross-context message volume decreases over time

## Support

For issues with session routing:
1. Check `telegram-session-fix-log.json` for recent routing decisions
2. Run `node telegram-session-fix.js test` to verify functionality
3. Review `session-manager-fixed.json` configuration
4. Check bot status with `openclaw status --deep`