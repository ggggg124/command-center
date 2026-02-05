# Family Recipe App - Complete Structure

## Your Requirements Implemented:

### ✅ **Core Features:**
1. **All on your hosting** - No external dependencies
2. **Metric system only** - Auto-converts imperial → metric
3. **Dinner meals only** - No breakfast/lunch planning
4. **Smart meal planning** with your rules
5. **Grocery lists** from meal plans
6. **Nutritional info** (estimated)

### ✅ **Your Meal Planning Rules:**
- **No pasta two nights in a row** ✅
- **Skip weekend nights** (Fri/Sat for takeaway) ✅  
- **Configurable skip days** ✅
- **Max cooking time per day type** ✅
- **Category rotation** (seafood every 3 days, etc.) ✅

### ✅ **Technical Simplicity:**
- **Frontend:** HTML/CSS/JS (Apple design)
- **Backend:** PHP + JSON files (simple)
- **Storage:** Your server file system
- **OCR:** I process photos → JSON → your server

## File Structure:

```
/recipes/ (on your hosting)
├── index.html                    # Main app
├── apple-style.css               # Apple design system
├── app.js                        # Main application
├── meal-planner.js               # Smart planning engine
├── grocery-list.js               # List generator
├── metric-converter.js           # Imperial → metric
├── nutrition-calculator.js       # Basic nutrition
├── api/
│   ├── save-recipe.php           # Save recipe to server
│   ├── load-recipes.php          # Load all recipes
│   └── process-ocr.php           # OCR webhook (calls me)
├── data/
│   ├── recipes/                  # JSON recipe files
│   ├── meal-plans/               # Weekly plans
│   └── grocery-lists/            # Shopping lists
└── assets/
    ├── icons/                    # App icons
    └── images/                   # Recipe photos
```

## Workflow:

### 1. **Add Recipe (Photo):**
```
You send photo via Telegram
     ↓
I process with OCR
     ↓
Extract ingredients (convert to metric)
     ↓
Send JSON to your server
     ↓
App shows new recipe
```

### 2. **Add Recipe (Manual):**
```
Web app form
     ↓
Enter details (metric only)
     ↓
Save to server
     ↓
Available for meal planning
```

### 3. **Meal Planning:**
```
Select week
     ↓
Rules engine filters recipes
     ↓
No pasta consecutive nights
     ↓
Skip weekends if desired
     ↓
Generate plan
     ↓
Manual adjustments allowed
```

### 4. **Grocery List:**
```
Select meal plan
     ↓
Aggregate ingredients
     ↓
Convert to metric
     ↓
Categorize (produce, meat, etc.)
     ↓
Generate shopping list
     ↓
Check off items
```

## Metric System Implementation:

### **Storage:**
- All recipes stored in **metric only** (g, ml, cm)
- Original units noted in comments

### **Conversion:**
- OCR detects imperial units
- Auto-converts to metric
- Smart rounding (250g not 250.00g)
- Common conversions baked in

### **Display:**
- Only metric shown to user
- Conversion notes available
- Consistent across app

## Meal Planning Rules Engine:

### **Core Rules:**
```javascript
rules = {
    mealType: 'dinner',
    noConsecutiveCategories: ['pasta', 'rice'],
    skipDays: { friday: true, saturday: true },
    maxCookingTime: { weekday: 45, sunday: 120 },
    maxMealsPerWeek: { pasta: 2, 'red-meat': 3 }
}
```

### **Smart Selection:**
1. Filter by day rules
2. Check consecutive category restriction
3. Consider cooking time
4. Apply weekly limits
5. Ensure variety

## Nutrition Calculator:

### **Basic Estimation:**
- Calories per serving
- Protein, carbs, fat
- Based on ingredient categories
- Rough but useful estimates

### **Future Enhancement:**
- Integration with nutrition API
- More accurate calculations
- Dietary requirement tracking

## Deployment Plan:

### **Phase 1 (Today):**
- Basic app with localStorage
- Manual recipe entry
- Simple meal planner
- Deploy to your hosting

### **Phase 2 (This Week):**
- Server storage (PHP + JSON)
- Photo upload + OCR integration
- Advanced meal planning rules
- Grocery list generator

### **Phase 3 (Next Week):**
- Metric conversion system
- Nutrition calculator
- PWA for mobile
- Export/print features

## Ready to Build?

**This gives you:**
- ✅ All on your hosting
- ✅ Your exact meal planning rules
- ✅ Metric-only system
- ✅ Dinner-focused planning
- ✅ Grocery lists
- ✅ Apple design

**Just need:** Your hosting access and I'll deploy Phase 1 today!