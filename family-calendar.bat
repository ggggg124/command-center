@echo off
REM Family calendar shortcut for Windows
set FAMILY_CALENDAR_ID=family00496021584127005789@group.calendar.google.com

if "%1"=="" goto usage

if "%1"=="events" (
    gog calendar events "%FAMILY_CALENDAR_ID%" --from "%2" --to "%3"
    goto :eof
)

if "%1"=="today" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set TODAY=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
    set TOMORROW=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
    REM Simple date increment - this is basic, for production use proper date math
    echo Today's events (if any):
    gog calendar events "%FAMILY_CALENDAR_ID%" --from "%TODAY%" --to "%TODAY%"
    goto :eof
)

if "%1"=="week" (
    echo This week's events (if any):
    gog calendar events "%FAMILY_CALENDAR_ID%" --from "%date:~10,4%-%date:~4,2%-%date:~7,2%" --to "%date:~10,4%-%date:~4,2%-%date:~7,2%"
    goto :eof
)

if "%1"=="id" (
    echo Family Calendar ID: %FAMILY_CALENDAR_ID%
    goto :eof
)

if "%1"=="add" (
    echo To add events to Family calendar:
    echo 1. Open Google Calendar
    echo 2. Make sure "Family" calendar is selected (left sidebar)
    echo 3. Create your event
    echo.
    echo Calendar ID for API use: %FAMILY_CALENDAR_ID%
    goto :eof
)

:usage
echo Usage: family-calendar.bat [events^|today^|week^|id^|add]
echo   events [from] [to]  - Show events between dates
echo   today               - Show today's events
echo   week                - Show this week's events
echo   id                  - Show calendar ID
echo   add                 - Instructions for adding events