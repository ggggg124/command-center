#!/bin/bash
# Family calendar shortcut script
FAMILY_CALENDAR_ID="family00496021584127005789@group.calendar.google.com"

case "$1" in
    "events")
        gog calendar events "$FAMILY_CALENDAR_ID" --from "$2" --to "$3"
        ;;
    "add")
        # Example: ./family-calendar.sh add "2026-02-07T14:00:00+11:00" "2026-02-07T15:00:00+11:00" "Family Dinner"
        # Note: gog doesn't have direct event creation yet, but we can prepare the command structure
        echo "To add events, use Google Calendar UI or API directly for now"
        echo "Calendar ID: $FAMILY_CALENDAR_ID"
        ;;
    "today")
        TODAY=$(date +%Y-%m-%d)
        TOMORROW=$(date -d "+1 day" +%Y-%m-%d)
        gog calendar events "$FAMILY_CALENDAR_ID" --from "$TODAY" --to "$TOMORROW"
        ;;
    "week")
        TODAY=$(date +%Y-%m-%d)
        NEXT_WEEK=$(date -d "+7 days" +%Y-%m-%d)
        gog calendar events "$FAMILY_CALENDAR_ID" --from "$TODAY" --to "$NEXT_WEEK"
        ;;
    "id")
        echo "Family Calendar ID: $FAMILY_CALENDAR_ID"
        ;;
    *)
        echo "Usage: $0 {events|today|week|id|add}"
        echo "  events [from] [to]  - Show events between dates"
        echo "  today               - Show today's events"
        echo "  week                - Show this week's events"
        echo "  id                  - Show calendar ID"
        echo "  add                 - Instructions for adding events"
        ;;
esac