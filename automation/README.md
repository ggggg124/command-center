# OpenClaw Automation Scripts

This directory contains automation scripts for monitoring and managing OpenClaw systems.

## Available Scripts

### 1. Bot Health Check (`bot-health-check.js`)
Monitors the status of all three Telegram bots and logs their health.

**Features:**
- Checks if all bots are running and configured
- Tracks last message in/out times
- Logs status to JSON file
- Generates human-readable reports
- Detects potential issues

**Usage:**
```bash
cd C:\Users\Home\.openclaw\workspace\automation
node bot-health-check.js
```

**Output:**
- Console report with status of all bots
- JSON log in `../memory/bot-health-log.json`
- Warning messages for detected issues

**Scheduling:**
Can be scheduled via:
- Windows Task Scheduler (every hour)
- OpenClaw cron jobs
- Manual execution as needed

### 2. Status Check Scripts
- `check-bots-status.bat` - Windows batch file for quick status checks
- `check-bots-status.ps1` - PowerShell script with enhanced logging

## Log Files

### Bot Health Log (`../memory/bot-health-log.json`)
Contains historical status data with timestamps. Useful for:
- Tracking bot availability over time
- Identifying patterns or recurring issues
- Performance monitoring
- Debugging connectivity problems

**Format:**
```json
[
  {
    "timestamp": "2026-02-05T14:30:00.000Z",
    "rawOutput": "...",
    "bots": {
      "admin": { "enabled": true, "running": true, ... },
      "home": { "enabled": true, "running": true, ... },
      "work": { "enabled": true, "running": true, ... }
    }
  }
]
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm init -y
# No external dependencies required - uses Node.js built-ins
```

### 2. Test the Script
```bash
node bot-health-check.js
```

### 3. Schedule Regular Checks

**Using Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Name: "OpenClaw Bot Health Check"
4. Trigger: Daily or hourly
5. Action: Start a program
6. Program: `node.exe`
7. Arguments: `C:\Users\Home\.openclaw\workspace\automation\bot-health-check.js`
8. Start in: `C:\Users\Home\.openclaw\workspace\automation`

**Using OpenClaw Cron:**
```bash
openclaw cron add --name "Bot Health Check" --schedule "0 * * * *" --payload '{"kind":"systemEvent","text":"Run bot health check"}' --sessionTarget main
```

## Monitoring Guidelines

### What to Monitor
1. **Bot Status**: All three bots should show "running"
2. **Message Activity**: Regular in/out messages indicate healthy operation
3. **Error Rates**: Watch for increasing error counts
4. **Response Times**: Consistent response times indicate good performance

### Alert Conditions
Take action if:
- Any bot shows "not running" for more than 5 minutes
- No messages received in over 1 hour (during active hours)
- Error rates increase significantly
- Response times degrade noticeably

### Maintenance Tasks
1. **Daily**: Quick status check using batch/PowerShell scripts
2. **Weekly**: Review health log for patterns
3. **Monthly**: Full system review and cleanup

## Troubleshooting

### Common Issues

#### Script Won't Run
- Verify Node.js is installed: `node --version`
- Check script permissions
- Ensure OpenClaw is running

#### Bots Showing as Not Running
1. Check OpenClaw gateway: `openclaw gateway status`
2. Verify Telegram tokens are valid
3. Check internet connectivity
4. Restart gateway if needed: `openclaw gateway restart`

#### Log File Issues
- Ensure `../memory/` directory exists
- Check file permissions
- Verify JSON format if manually edited

### Debug Mode
Add `--debug` flag or modify script to output more details:
```javascript
// In bot-health-check.js
const DEBUG = true;
if (DEBUG) console.log('Debug info:', details);
```

## Security Notes

### Access Control
- Scripts should only be run by authorized users
- Log files contain system status information
- Keep automation directory secure

### Token Security
- Bot tokens are NOT stored in automation scripts
- Tokens remain in OpenClaw configuration only
- No sensitive data should be logged

### Network Security
- Scripts only make local API calls
- No external network requests
- All communication is local to the machine

## Future Enhancements

### Planned Features
1. **Email/SMS alerts** for critical issues
2. **Performance metrics** collection
3. **Automated recovery** for common issues
4. **Dashboard integration** with Command Center
5. **Historical analysis** and trend reporting

### Integration Points
- Command Center web app
- Telegram bot notifications
- System monitoring dashboards
- Log aggregation services

## Support
For issues with automation scripts:
1. Check the logs in `../memory/bot-health-log.json`
2. Verify OpenClaw is running correctly
3. Review script output for error messages
4. Contact via Admin bot if needed

## Version History
- 2026-02-05: Initial release with basic health monitoring
- Future: Planned enhancements as listed above