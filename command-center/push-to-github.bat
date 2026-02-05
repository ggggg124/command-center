@echo off
echo ========================================
echo 🚀 PUSH COMMAND CENTER TO GITHUB
echo ========================================
echo.
echo This will push your working Command Center to GitHub.
echo.
echo Prerequisites:
echo 1. GitHub Personal Access Token with "repo" permissions
echo 2. Repository created at: https://github.com/ggggg124/command-center
echo.
echo If you haven't created the repository yet:
echo 1. Go to: https://github.com/new
echo 2. Name: command-center
echo 3. Description: Apple-inspired OpenClaw dashboard
echo 4. DO NOT initialize with README, .gitignore, or license
echo 5. Click "Create repository"
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Configuring Git...
git config user.email "ggggg1@gmail.com"
git config user.name "ggggg124"

echo.
echo Step 2: Pushing to GitHub...
echo.
echo When prompted for credentials:
echo - Username: ggggg124
echo - Password: USE YOUR GITHUB PERSONAL ACCESS TOKEN (not your password)
echo.
echo (The token needs "repo" permissions)
echo.
pause

git push -u origin master

echo.
if errorlevel 1 (
    echo ❌ Push failed. Possible reasons:
    echo 1. Repository doesn't exist: https://github.com/ggggg124/command-center
    echo 2. PAT doesn't have "repo" permissions
    echo 3. Internet connection issue
    echo.
    echo Try manually:
    echo git push -u origin master
) else (
    echo ✅ SUCCESS! Command Center pushed to GitHub!
    echo.
    echo Repository: https://github.com/ggggg124/command-center
    echo.
    echo Next: Deploy to Vercel
    echo 1. Go to: https://vercel.com/new
    echo 2. Import from GitHub
    echo 3. Select "command-center" repository
    echo 4. Click "Deploy" (takes 2 minutes)
    echo 5. Your live URL will be: command-center-ggggg124.vercel.app
)

echo.
pause