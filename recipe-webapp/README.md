# Family Recipe Web App

A mobile-friendly web application for managing recipes, meal plans, and grocery lists, storing everything in your Google Drive.

## Features
- 📱 Mobile-first responsive design
- 📸 Recipe photo upload to Google Drive
- 📝 Recipe management (CRUD)
- 📅 Weekly meal planning
- 🛒 **Smart Categorized Shopping Lists** - Items automatically grouped by category (fruits & vegetables, meat, dairy, dry goods, etc.)
- 🔍 Search and filter recipes
- 📊 Recipe statistics

## Tech Stack
- **Frontend:** Vanilla JavaScript + Tailwind CSS
- **Storage:** Google Drive API
- **Authentication:** Google OAuth 2.0
- **Icons:** Lucide Icons
- **No build step** - runs directly in browser

## Smart Shopping List Features

The shopping list automatically groups items into smart categories:

### Categories:
1. **Fruits & Vegetables** 🥕 - All produce items together
2. **Meat & Seafood** 🍗 - Meat, poultry, fish, seafood
3. **Dairy & Eggs** 🥚 - Milk, cheese, yogurt, eggs
4. **Dry Goods** 🍚 - Pasta, rice, flour, grains
5. **Canned & Jarred** 🥫 - Canned goods, sauces, preserves
6. **Sauces & Condiments** 🧂 - Spices, oils, dressings
7. **Baking** 🧁 - Baking ingredients
8. **Beverages** ☕ - Drinks, coffee, tea
9. **Frozen** ❄️ - Frozen foods
10. **Other** 📦 - Miscellaneous items
11. **Custom Items** ✏️ - Manually added items

### Smart Features:
- **Auto-categorization**: Items automatically sorted into appropriate categories
- **Quantity merging**: Duplicate items combined with quantities added
- **Custom items**: Manually add items with auto-category suggestion
- **Check/uncheck**: Track what you've purchased
- **Category toggles**: Expand/collapse categories
- **Print-friendly**: Clean layout for printing shopping lists

### How it works:
1. Meal plans generate shopping items automatically
2. Items are categorized based on keywords (e.g., "apple" → Fruits & Vegetables)
3. Custom items can be added manually
4. List can be shared via email or WhatsApp
5. Check off items as you shop

## File Structure
```
recipe-webapp/
├── index.html              # Main app
├── style.css              # Custom styles
├── app.js                 # Main application logic
├── drive-api.js           # Google Drive integration
├── recipe-manager.js      # Recipe CRUD operations
├── meal-planner.js        # Meal planning logic
├── shopping-list-manager.js # Smart categorized shopping lists
├── shopping-list.css      # Shopping list styles
├── shopping-list-sharer.js # Share functionality
└── assets/                # Images, icons, etc.
```

## Setup
1. Create Google Cloud project
2. Enable Drive API
3. Configure OAuth credentials
4. Update config.js with your client ID
5. Open index.html in browser

## Usage
- All data stored in your Google Drive
- No server required
- Works offline (with caching)
- Syncs when online