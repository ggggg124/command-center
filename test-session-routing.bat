@echo off
echo Testing Telegram Session Routing Fix...
echo.

echo 1. Testing HOME session with shopping list message:
node telegram-session-router.js "agent:main:telegram:home:dm:5086862672" "On the shopping list I want all the fruit and veg items grouped together"
echo.

echo 2. Testing WORK session with system status message:
node telegram-session-router.js "agent:main:telegram:work:dm:5086862672" "Do what you think"
echo.

echo 3. Testing ADMIN session with development message:
node telegram-session-router.js "agent:main:telegram:admin:dm:5086862672" "Check the OpenClaw config"
echo.

echo 4. Testing CROSS-CONTEXT warning (home message in work session):
node telegram-session-router.js "agent:main:telegram:work:dm:5086862672" "Add milk to shopping list"
echo.

echo 5. Testing CROSS-CONTEXT warning (work message in home session):
node telegram-session-router.js "agent:main:telegram:home:dm:5086862672" "Check system backup status"
echo.

echo Session routing test complete!
pause