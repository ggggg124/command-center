@echo off
REM schedule-git-backup.bat - Easy Windows Task Scheduler setup
REM Double-click to manage automatic git backups

echo ========================================
echo    OpenClaw Git Backup Scheduler
echo ========================================
echo.
echo Options:
echo   1. Create daily scheduled task (11:30 PM)
echo   2. Delete scheduled task
echo   3. Test backup script
echo   4. List OpenClaw tasks
echo   5. Exit
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Creating daily scheduled task...
    echo Note: This requires Administrator privileges.
    echo.
    powershell -ExecutionPolicy Bypass -File "%~dp0schedule-git-backup.ps1" -CreateTask
) else if "%choice%"=="2" (
    echo.
    echo Deleting scheduled task...
    echo Note: This requires Administrator privileges.
    echo.
    powershell -ExecutionPolicy Bypass -File "%~dp0schedule-git-backup.ps1" -DeleteTask
) else if "%choice%"=="3" (
    echo.
    echo Testing backup script...
    echo.
    powershell -ExecutionPolicy Bypass -File "%~dp0schedule-git-backup.ps1" -TestTask
) else if "%choice%"=="4" (
    echo.
    echo Listing OpenClaw tasks...
    echo.
    powershell -ExecutionPolicy Bypass -File "%~dp0schedule-git-backup.ps1" -ListTasks
) else if "%choice%"=="5" (
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
echo ========================================
echo    Press any key to exit...
pause >nul