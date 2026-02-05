# Telegram Bots - Quick Reference Card

## 🤖 ADMIN BOT (@Don2101Bot)
**Purpose**: Technical/Development/System Admin
**When to use**: System tasks, configuration, development

### Quick Commands:
- `/status` - System status
- `/config` - View configuration  
- `/restart` - Restart gateway
- `/logs` - Show system logs
- `/update` - Check for updates

### Common Tasks:
- OpenClaw management
- Command Center updates
- System troubleshooting
- Development work
- Technical configuration

---

## 🏠 HOME BOT (@don2101homebot)
**Purpose**: Family/Personal/Home Management
**When to use**: Family, meals, home, personal tasks

### Quick Commands:
- `What's for dinner?`
- `Add [item] to grocery list`
- `What's on the calendar?`
- `Remind me to [task]`
- `Plan meals for [timeframe]`

### Common Tasks:
- Meal planning
- Grocery lists
- Family calendar
- Home maintenance
- Personal reminders
- Family coordination

---

## 💼 WORK BOT (Business Assistant)
**Purpose**: Business/Professional/Projects
**When to use**: Work, clients, projects, business tasks

### Quick Commands:
- `Today's priorities?`
- `Schedule meeting with [client]`
- `Update project [name]`
- `Generate [report]`
- `Follow up on [task]`

### Common Tasks:
- Project management
- Client communications
- Business reports
- Time management
- Professional tasks
- Business analytics

---

## 🔧 STATUS & MAINTENANCE

### Quick Checks:
```bash
# Check all bots
openclaw channels status

# Quick script
check-bots-status.bat

# PowerShell version
check-bots-status.ps1
```

### Health Monitoring:
```bash
# Automated check
cd automation
node bot-health-check.js

# View logs
type memory\bot-health-log.json
```

### Troubleshooting:
1. **Bot not responding?** → Check status first
2. **Wrong context?** → Make sure you're using correct bot
3. **System issues?** → Use Admin bot for technical help

---

## 📞 CONTACT INFO

### Bot Usernames:
- **Admin**: @Don2101Bot
- **Home**: @don2101homebot  
- **Work**: Business Assistant (username pending)

### Your Telegram ID:
`5086862672` (only you can access all bots)

### Security Status:
✅ **LOCKDOWN ACTIVE**
- Only you can access
- No group chats
- Session isolation enabled

---

## 🚀 GETTING STARTED

### First Time Using a Bot:
1. Open Telegram
2. Search for bot username
3. Send `/start` or any message
4. Bot will respond (may take a moment)

### Switching Between Bots:
- Each bot is separate in Telegram
- No need to "log out" - just switch chats
- Context stays separate automatically

### Best Practices:
- Use natural language
- Be specific in requests
- Stay in appropriate context
- Report issues to Admin bot

---

## ⚠️ TROUBLESHOOTING QUICK GUIDE

### Problem: Bot not responding
**Solution:**
1. Check internet connection
2. Verify correct bot username
3. Wait 30 seconds and try again
4. Use Admin bot to check system status

### Problem: Context seems mixed
**Solution:**
1. Make sure you're in correct bot chat
2. Start fresh message with clear context
3. Use bot name in message if needed

### Problem: Can't find bot
**Solution:**
1. Search exact username in Telegram
2. Check TELEGRAM_SETUP.md for tokens
3. Use @BotFather to resend bot link

---

## 📚 DOCUMENTATION

### Full Documentation:
- `TELEGRAM_SETUP.md` - Complete setup details
- `BOT_USAGE_GUIDE.md` - Detailed usage guide
- `automation/README.md` - Monitoring scripts

### Key Files:
- `openclaw.json` - Main configuration
- `memory/bot-health-log.json` - Status history
- Session transcripts in memory folder

---

## 🔄 UPDATES & MAINTENANCE

### Regular Tasks:
- **Daily**: Quick status check
- **Weekly**: Review health logs  
- **Monthly**: Full system review

### Update Process:
1. Changes via Admin bot
2. Configuration updates
3. Gateway restart if needed
4. Test all bots after changes

### Backup:
- Configuration files backed up
- Session transcripts preserved
- Health logs maintained

---

## 🆘 EMERGENCY CONTACT

### For Critical Issues:
1. **Direct computer access** - Most reliable
2. **Admin bot** - For system issues
3. **Check logs** - `openclaw channels logs`

### Recovery Steps:
1. Check gateway status
2. Review error logs
3. Restart if needed
4. Test basic functionality

---

**Last Updated**: 2026-02-05  
**Status**: ✅ All systems operational  
**Security**: 🔒 Maximum lockdown active