# Family Recipe Database

## Structure
- `recipes/` - Main recipe storage
  - `images/` - Recipe photos you send
  - `data/` - Structured recipe data (JSON)
  - `meal-plans/` - Generated weekly meal plans
  - `grocery-lists/` - Auto-generated shopping lists

## Workflow
1. Send recipe photo → I extract details
2. Store locally + sync to Google Sheets
3. Generate meal plans weekly
4. Create grocery lists from plans

## Categories
- Breakfast
- Lunch
- Dinner
- Snacks
- Desserts
- Vegetarian
- Quick Meals (under 30 min)
- Weekend Cooking