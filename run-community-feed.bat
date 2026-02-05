@echo off
echo OpenClaw Community Feed Generator
echo ==================================
echo.
echo This script creates a simple HTML feed of OpenClaw community updates.
echo.
echo Running PowerShell script...
powershell -ExecutionPolicy Bypass -File "community-feed-simple.ps1"
echo.
echo Feed generated at: C:\Users\Home\.openclaw\workspace\community-feed.html
echo.
echo To view: Open the HTML file in your browser
echo.
pause