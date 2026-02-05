@echo off
echo OpenClaw Cloud Backup System
echo ============================
echo.
echo Complete encrypted backup with Google Drive upload
echo.
echo Options:
echo   1. Setup system (first time)
echo   2. Run complete backup (encrypt + upload)
echo   3. Encrypt only (no upload)
echo   4. Upload only (existing files)
echo.
set /p choice="Choose option (1-4): "

if "%choice%"=="1" (
    echo.
    echo Running setup...
    powershell -ExecutionPolicy Bypass -File "%~dp0backup-cloud.ps1" -Setup
) else if "%choice%"=="2" (
    echo.
    echo Running complete backup...
    powershell -ExecutionPolicy Bypass -File "%~dp0backup-cloud.ps1"
) else if "%choice%"=="3" (
    echo.
    echo Encrypting only...
    powershell -ExecutionPolicy Bypass -File "%~dp0backup-cloud.ps1" -EncryptOnly
) else if "%choice%"=="4" (
    echo.
    echo Uploading only...
    powershell -ExecutionPolicy Bypass -File "%~dp0backup-cloud.ps1" -UploadOnly
) else (
    echo Invalid choice
)

echo.
pause