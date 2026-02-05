# Telegram Bot Setup - Complete Documentation

## Overview
Three specialized Telegram bots configured with complete isolation and security lockdown.

## Bot Configuration

### 🤖 **Admin Bot** (Technical/Development)
- **Bot Name**: Don2101Bot
- **Token**: `7902539700:AAEjquwbU4VTPAtg4Gvu9lzihYj7tpOwkaA`
- **Username**: @Don2101Bot
- **Purpose**: System administration, development tasks, Command Center management
- **Access**: Only Telegram ID `5086862672`
- **Session**: `agent:main:telegram:admin:dm:5086862672`

### 🏠 **Home Bot** (Family/Personal)
- **Bot Name**: don2101homebot
- **Token**: `8542754857:AAHNPMf4w8iq6_E4OazC19XuZjg2tUEVS7s`
- **Username**: @don2101homebot
- **Purpose**: Meal planning, grocery lists, family calendar, home management
- **Access**: Telegram ID `5086862672` (wife to be added later)
- **Persona**: Friendly, family-oriented, helpful
- **Session**: `agent:main:telegram:home:dm:5086862672`

### 💼 **Work Bot** (Business/Professional)
- **Bot Name**: Business Assistant
- **Token**: `8491589638:AAF4Coj8TvUeIT-dWD_lc4qujv9cCsxifJI`
- **Username**: (To be obtained from @BotFather)
- **Purpose**: Project management, client communication, business analytics
- **Access**: Only Telegram ID `5086862672`
- **Persona**: Professional, concise, business-focused
- **Session**: `agent:main:telegram:work:dm:5086862672`

## Security Configuration

### 🔒 **Lockdown Settings (Applied to All Bots)**
- **dmPolicy**: `allowlist` (only specified users can DM)
- **allowFrom**: `["5086862672"]` (only Don's Telegram ID)
- **groupPolicy**: `disabled` (no group chat access)
- **groups**: `{}` (empty - no groups configured)
- **Session Isolation**: `per-account-channel-peer` (prevents context mixing)

### ✅ **Allowed Access**
- Telegram ID `5086862672` (Don) via all three bots
- Direct computer access to OpenClaw

### ❌ **Blocked Access**
- All other Telegram users
- All group chats
- Any unauthorized access attempts

## Session Isolation

### **Complete Separation Achieved**
Each bot maintains completely separate:
1. **Conversation histories** (no mixing between bots)
2. **Session contexts** (separate memory and context)
3. **Transcript files** (independent logging)
4. **Telegram chat threads** (different bots in Telegram app)

### **Session Keys**
- Admin: `agent:main:telegram:admin:dm:5086862672`
- Home: `agent:main:telegram:home:dm:5086862672`
- Work: `agent:main:telegram:work:dm:5086862672`

### **Transcript Files**
- Admin: `025a0bf5-2c8c-4e97-b423-197cbbd12af3.jsonl`
- Home: `0dbc05f8-e2c1-4414-91fe-c4105948119b.jsonl`
- Work: `2bf931ab-7759-43e3-b069-39973e695e57.jsonl`

## Usage Guidelines

### **When to Use Each Bot**

#### 🤖 **Admin Bot** (@Don2101Bot)
- System configuration changes
- OpenClaw management tasks
- Development work
- Technical troubleshooting
- Command Center updates

#### 🏠 **Home Bot** (@don2101homebot)
- Meal planning and recipes
- Grocery shopping lists
- Family calendar coordination
- Home maintenance reminders
- Personal projects
- Family communications

#### 💼 **Work Bot** (Business Assistant)
- Project management tasks
- Client communications
- Business analytics
- Work scheduling
- Professional correspondence
- Business document management

### **Best Practices**
1. **Stay in context** - Use the appropriate bot for each type of task
2. **Clear separation** - Don't mix work and personal in same bot
3. **Security first** - Never share bot tokens or add unauthorized users
4. **Regular checks** - Monitor bot status with `openclaw channels status`

## Technical Details

### **OpenClaw Configuration**
```json
"channels": {
  "telegram": {
    "enabled": true,
    "dmPolicy": "pairing",
    "groupPolicy": "allowlist",
    "streamMode": "partial",
    "accounts": {
      "admin": { "botToken": "7902539700:AAEjquwbU4VTPAtg4Gvu9lzihYj7tpOwkaA", ... },
      "home": { "botToken": "8542754857:AAHNPMf4w8iq6_E4OazC19XuZjg2tUEVS7s", ... },
      "work": { "botToken": "8491589638:AAF4Coj8TvUeIT-dWD_lc4qujv9cCsxifJI", ... }
    }
  }
},
"session": {
  "dmScope": "per-account-channel-peer"
}
```

### **Monitoring Commands**
```bash
# Check all bot status
openclaw channels status

# Check specific bot logs
openclaw channels logs --channel telegram --lines 20

# List active sessions
openclaw sessions list --kinds agent

# Restart gateway if needed
openclaw gateway restart
```

## Troubleshooting

### **Common Issues**

#### **Bot Not Responding**
1. Check status: `openclaw channels status`
2. Verify token is correct in configuration
3. Restart gateway: `openclaw gateway restart`
4. Check Telegram app connectivity

#### **Messages Not Being Received**
1. Verify Telegram ID `5086862672` is in allowFrom list
2. Check session isolation is working
3. Look for errors in logs: `openclaw channels logs --channel telegram`

#### **Context Mixing Between Bots**
1. Verify `session.dmScope` is set to `per-account-channel-peer`
2. Check session keys are different for each bot
3. Restart gateway to apply configuration changes

### **Maintenance Tasks**
- Regularly check bot status
- Monitor for unauthorized access attempts
- Update tokens if compromised (via @BotFather)
- Review session transcripts for issues
- Test all three bots periodically

## Future Enhancements

### **Planned Improvements**
1. **Add wife to home bot** - Configure additional allowlist entry
2. **Work bot username** - Get from @BotFather when needed
3. **Advanced personas** - Custom system prompts for each bot
4. **Automated monitoring** - Cron jobs to check bot health
5. **Usage analytics** - Track which bot is used for what

### **Security Considerations**
- Keep bot tokens secure (never share publicly)
- Regularly review access logs
- Consider rotating tokens periodically
- Monitor for unusual activity patterns

## Last Updated
2026-02-05 - Complete multi-bot setup with security lockdown and session isolation

## Status
✅ **All systems operational**
✅ **Security lockdown active**
✅ **Session isolation working**
✅ **All three bots tested and functional**