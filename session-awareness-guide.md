# Session Awareness Guide for Telegram Bots

## Problem Identified
**URGENT**: Telegram session routing confusion. User is in `work:dm` session but we were discussing recipe app in `home:dm` session.

## Root Causes
1. **Incorrect Session Keys**: `session-manager.json` was using generic `agent:main:main` instead of actual Telegram session keys
2. **Missing Session Mapping**: No way to map Telegram session keys to context (home/work/admin)
3. **Context Bleed**: Assistant was responding in work session with home session context

## Fix Implemented

### 1. Updated Session Manager (`session-manager.json`)
- **Fixed session keys** to match actual Telegram session keys:
  - `agent:main:telegram:home:dm:5086862672` → Home bot
  - `agent:main:telegram:work:dm:5086862672` → Work bot  
  - `agent:main:telegram:admin:dm:5086862672` → Admin bot
- **Added session mapping** for quick lookup
- **Removed global `activeSession`** - each session maintains its own state
- **Enhanced topics** for better context detection

### 2. Created Session Router (`telegram-session-router.js`)
- **Validates message context** against session persona
- **Detects cross-context confusion** (e.g., shopping list in work session)
- **Logs session activity** for debugging
- **Provides recommendations** for appropriate responses

### 3. Session Context Definitions

#### Home Bot (`agent:main:telegram:home:dm:5086862672`)
- **Persona**: Friendly family assistant
- **Topics**: family, meals, calendar, grocery, home_tasks, shopping_list, recipes
- **Example messages**: 
  - "Add milk to shopping list"
  - "What's for dinner?"
  - "Family calendar update"

#### Work Bot (`agent:main:telegram:work:dm:5086862672`)
- **Persona**: Professional business assistant
- **Topics**: projects, clients, email, scheduling, business, backlog, system_status
- **Example messages**:
  - "Check system status"
  - "Update project backlog"
  - "Schedule client meeting"

#### Admin Bot (`agent:main:telegram:admin:dm:5086862672`)
- **Persona**: Technical system administrator
- **Topics**: development, system_management, command_center, config, setup
- **Example messages**:
  - "Fix OpenClaw config"
  - "Build command center feature"
  - "Check system logs"

## How to Use Session Awareness

### For Agents/Assistants:
1. **Check session context** before responding
2. **Validate message matches session persona**
3. **Warn about cross-context confusion**
4. **Maintain session isolation**

### Example Response Flow:
```javascript
// When receiving message in work session about shopping:
if (sessionContext === 'work' && message.includes('shopping')) {
  return "I notice you're asking about shopping in the work session. Would you like me to:\n1. Switch to home session for shopping topics\n2. Continue in work session (shopping may be work-related)\n3. Help you with work-appropriate tasks instead?";
}
```

### Testing the Fix:
Run `test-session-routing.bat` to verify:
1. Home session correctly handles shopping messages
2. Work session correctly handles system messages
3. Cross-context warnings are triggered appropriately

## Immediate Actions Taken

1. ✅ **Fixed session manager** with correct Telegram session keys
2. ✅ **Created session router** for context validation
3. ✅ **Updated session definitions** with clear personas and topics
4. ✅ **Added cross-context detection** to prevent confusion
5. ✅ **Created testing tools** to verify the fix

## Monitoring

Check `telegram-session-logs.json` for:
- Session activity tracking
- Cross-context warnings
- Message validation results
- Session switching patterns

## Future Improvements

1. **Automatic session switching** based on message content
2. **Session history preservation** when switching
3. **User preferences** for session behavior
4. **Integration with OpenClaw hooks** for automatic routing
5. **Visual indicators** in Telegram (e.g., "[Home]", "[Work]" prefixes)

## Emergency Contact

If session confusion occurs again:
1. Check `telegram-session-logs.json` for recent activity
2. Run `node telegram-session-router.js <sessionKey> <message>` to diagnose
3. Review session definitions in `session-manager.json`
4. Check OpenClaw logs for routing issues