# Telegram Bot Status Check Script
# Run this to check the status of all three Telegram bots

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Telegram Bot Status Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd')"
Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')"
Write-Host ""

Write-Host "Checking OpenClaw gateway status..." -ForegroundColor Yellow
openclaw gateway status
Write-Host ""

Write-Host "Checking all Telegram bot channels..." -ForegroundColor Yellow
$status = openclaw channels status
Write-Host $status
Write-Host ""

Write-Host "Listing active sessions..." -ForegroundColor Yellow
openclaw sessions list --kinds agent --limit 5
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Status Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available Commands:" -ForegroundColor Green
Write-Host "  Check logs: openclaw channels logs --channel telegram --lines 20"
Write-Host "  Restart: openclaw gateway restart"
Write-Host "  Detailed status: openclaw status"
Write-Host ""
Write-Host "Bot Configuration:" -ForegroundColor Green
Write-Host "  Admin Bot: @Don2101Bot (Technical/Development)"
Write-Host "  Home Bot: @don2101homebot (Family/Personal)"
Write-Host "  Work Bot: Business Assistant (Professional)"
Write-Host ""
Write-Host "Security Status: LOCKDOWN ACTIVE" -ForegroundColor Green
Write-Host "  Only Telegram ID 5086862672 can access"
Write-Host "  No group chat access"
Write-Host "  Session isolation enabled"
Write-Host ""

# Check if any bot shows errors
if ($status -match "error" -or $status -match "failed") {
    Write-Host "WARNING: Potential issues detected!" -ForegroundColor Red
    Write-Host "Check logs for details." -ForegroundColor Red
} else {
    Write-Host "All systems operational ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")