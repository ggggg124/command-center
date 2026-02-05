@echo off
echo OpenClaw Backup
echo ===============
echo.
echo Creates safe backup in: C:\Users\Home\backup\
echo Excludes sensitive files (client_secret.json, API keys, etc.)
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0backup-final.ps1"

echo.
echo Backup complete!
echo Check: C:\Users\Home\backup\
pause