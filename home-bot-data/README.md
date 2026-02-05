# Home Bot Management System

## Overview
Local home management system for family calendar, meal planning, grocery lists, and home tasks.

## File Structure
- `family-calendar.json` - Main data file with all home systems
- `backups/` - Automatic backups (to be implemented)
- `exports/` - Calendar exports (to be implemented)

## System Components

### 1. Family Calendar
**Calendars:**
- `family` - General family events (blue)
- `meals` - Meal planning (green)
- `appointments` - Doctor/dentist appointments (red)
- `school` - School activities (yellow)
- `home` - Home maintenance tasks (purple)

**Event Structure:**
```json
{
  "id": "unique_id",
  "title": "Event title",
  "calendar": "family",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "attendees": ["Don", "Wife"],
  "reminders": ["1h", "30m"]
}
```

### 2. Meal Planning
**Weekly meal plans with recipes:**
- Plan meals for each day of the week
- Link to recipe database
- Generate grocery lists automatically

### 3. Recipe Database
**Structured recipe storage:**
- Ingredients with quantities
- Preparation instructions
- Prep/cook times
- Tags for categorization

### 4. Grocery Management
**Auto-generated from meal plans:**
- Categorized items
- Quantity tracking
- Purchase status

### 5. Home Tasks
**Recurring home maintenance:**
- Weekly tasks (cleaning, vacuuming)
- Monthly tasks (appliance maintenance)
- Assignment tracking

## Planned Commands

### Calendar Commands
```
/add-event "Family Dinner" 2026-02-05 18:30 family
/view-events today
/view-events week
/view-calendar meals
```

### Meal Planning Commands
```
/meal-plan monday "Spaghetti Bolognese"
/view-meal-plan week
/generate-grocery-list
```

### Recipe Commands
```
/recipe-add "Spaghetti Bolognese" ingredients...
/recipe-view "Spaghetti Bolognese"
/recipe-search pasta
```

### Home Task Commands
```
/home-task-add "Vacuum living room" weekly monday
/home-task-complete "Vacuum living room"
/view-tasks due
```

## Integration Plans

### Phase 2: Google Calendar Sync
- OAuth setup for ggggg1@gmail.com
- Two-way sync with Google Calendar
- Google Keep integration for grocery lists

### Phase 3: Mobile Access
- Web interface for family access
- Mobile-friendly views
- Real-time updates

## Backup & Export
- Automatic daily backups
- JSON export for migration
- Calendar export to iCal format

## Usage Notes
- All times in 24-hour format
- Dates in YYYY-MM-DD format
- System uses Australia/Sydney timezone
- Regular backups recommended

## Version History
- v1.0 (2026-02-05): Initial system created
  - Basic calendar structure
  - Meal planning database
  - Grocery list generator
  - Home task management