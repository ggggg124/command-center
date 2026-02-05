# Recipe Database Schema

## Google Sheets Structure
Sheet: "Family Recipes"

Columns:
1. ID - Unique identifier
2. Name - Recipe title
3. Category - Comma-separated categories
4. Prep Time (min)
5. Cook Time (min) 
6. Total Time (min)
7. Servings
8. Difficulty (easy/medium/hard)
9. Ingredients (JSON array)
10. Instructions (JSON array)
11. Notes
12. Tags
13. Image URL (Google Drive link)
14. Created Date
15. Last Made
16. Rating (1-5)
17. Dietary Info (JSON)

## Local Storage
- JSON files in `recipes/data/`
- Images in `recipes/images/`
- Weekly sync to Google Sheets

## Meal Plan Structure
Weekly JSON file with:
- Date range
- Meals per day (breakfast, lunch, dinner)
- Recipes selected
- Shopping list
- Prep schedule