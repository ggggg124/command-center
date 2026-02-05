@echo off
echo ========================================
echo Telegram Bot Status Check
echo ========================================
echo Date: %date%
echo Time: %time%
echo.

echo Checking OpenClaw gateway status...
openclaw gateway status
echo.

echo Checking all Telegram bot channels...
openclaw channels status
echo.

echo Listing active sessions...
openclaw sessions list --kinds agent --limit 5
echo.

echo ========================================
echo Status Summary
echo ========================================
echo.
echo To check logs: openclaw channels logs --channel telegram --lines 20
echo To restart: openclaw gateway restart
echo.

pause