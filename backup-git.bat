@echo off
REM backup-git.bat - Easy Git Backup for OpenClaw Workspace
REM Double-click to run automatic git backup

echo ========================================
echo    OpenClaw Git Backup
echo ========================================
echo.
echo This will automatically commit and push
echo all workspace changes to GitHub.
echo.
echo Press Ctrl+C to cancel, or any key to continue...
pause >nul

echo.
echo Starting git backup...
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0backup-git.ps1" -Verbose

echo.
echo ========================================
echo    Backup Complete
echo ========================================
echo.
echo Check memory\git-backup-log.md for details.
echo.
pause