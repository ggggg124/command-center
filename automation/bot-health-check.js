// Bot Health Check Automation
// Runs periodic checks on Telegram bot status
// Can be scheduled via cron or Windows Task Scheduler

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'memory', 'bot-health-log.json');
const MAX_LOG_ENTRIES = 100;

function checkBotStatus() {
    return new Promise((resolve, reject) => {
        exec('openclaw channels status', (error, stdout, stderr) => {
            if (error) {
                reject(`Error checking status: ${error.message}`);
                return;
            }
            
            // Parse the status output
            const status = {
                timestamp: new Date().toISOString(),
                rawOutput: stdout,
                bots: {}
            };
            
            // Extract bot information (simplified parsing)
            const lines = stdout.split('\n');
            lines.forEach(line => {
                if (line.includes('Telegram')) {
                    // Parse bot status lines
                    if (line.includes('admin')) {
                        status.bots.admin = parseBotLine(line);
                    } else if (line.includes('home')) {
                        status.bots.home = parseBotLine(line);
                    } else if (line.includes('work')) {
                        status.bots.work = parseBotLine(line);
                    }
                }
            });
            
            resolve(status);
        });
    });
}

function parseBotLine(line) {
    // Simple parsing of status line
    // Example: "- Telegram admin (Admin Assistant): enabled, configured, running, in:just now, out:4m ago"
    
    const bot = {
        enabled: line.includes('enabled'),
        configured: line.includes('configured'),
        running: line.includes('running'),
        lastIn: extractTime(line, 'in:'),
        lastOut: extractTime(line, 'out:')
    };
    
    return bot;
}

function extractTime(line, prefix) {
    const start = line.indexOf(prefix);
    if (start === -1) return null;
    
    const end = line.indexOf(',', start);
    const timeStr = end !== -1 
        ? line.substring(start + prefix.length, end)
        : line.substring(start + prefix.length);
    
    return timeStr.trim();
}

function logStatus(status) {
    let log = [];
    
    // Read existing log
    if (fs.existsSync(LOG_FILE)) {
        try {
            log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading log file:', e.message);
        }
    }
    
    // Add new entry
    log.push(status);
    
    // Keep only recent entries
    if (log.length > MAX_LOG_ENTRIES) {
        log = log.slice(-MAX_LOG_ENTRIES);
    }
    
    // Write back to file
    try {
        fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
        console.log(`Status logged at ${status.timestamp}`);
    } catch (e) {
        console.error('Error writing log file:', e.message);
    }
}

function generateReport(status) {
    const report = [];
    report.push(`Bot Health Check - ${new Date(status.timestamp).toLocaleString()}`);
    report.push('='.repeat(50));
    
    Object.entries(status.bots).forEach(([name, bot]) => {
        report.push(`\n${name.toUpperCase()} Bot:`);
        report.push(`  Status: ${bot.running ? '✅ Running' : '❌ Not Running'}`);
        report.push(`  Enabled: ${bot.enabled ? 'Yes' : 'No'}`);
        report.push(`  Configured: ${bot.configured ? 'Yes' : 'No'}`);
        report.push(`  Last message in: ${bot.lastIn || 'Never'}`);
        report.push(`  Last message out: ${bot.lastOut || 'Never'}`);
    });
    
    // Check for issues
    const issues = [];
    Object.entries(status.bots).forEach(([name, bot]) => {
        if (!bot.running) issues.push(`${name} bot is not running`);
        if (!bot.enabled) issues.push(`${name} bot is not enabled`);
        if (!bot.configured) issues.push(`${name} bot is not configured`);
    });
    
    if (issues.length > 0) {
        report.push('\n⚠️ ISSUES DETECTED:');
        issues.forEach(issue => report.push(`  - ${issue}`));
    } else {
        report.push('\n✅ All systems operational');
    }
    
    return report.join('\n');
}

async function main() {
    console.log('Starting bot health check...');
    
    try {
        const status = await checkBotStatus();
        logStatus(status);
        
        const report = generateReport(status);
        console.log('\n' + report);
        
        // Check if any bot hasn't sent/received in over 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const statusTime = new Date(status.timestamp);
        
        Object.entries(status.bots).forEach(([name, bot]) => {
            if (bot.lastIn && bot.lastIn.includes('ago')) {
                const minutes = parseInt(bot.lastIn);
                if (!isNaN(minutes) && minutes > 60) {
                    console.log(`\n⚠️ Warning: ${name} bot hasn't received a message in over 1 hour`);
                }
            }
        });
        
    } catch (error) {
        console.error('Error during health check:', error);
        
        // Log error
        const errorStatus = {
            timestamp: new Date().toISOString(),
            error: error.toString(),
            bots: {}
        };
        logStatus(errorStatus);
    }
    
    console.log('\nHealth check completed.');
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    checkBotStatus,
    logStatus,
    generateReport,
    main
};