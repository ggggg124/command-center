// Smart Meal Planning Rules Engine
// Dinner-only planning with custom rules

class MealPlannerRules {
    constructor() {
        // Default rules (can be customized)
        this.rules = {
            // Meal type restrictions
            mealType: 'dinner', // Only dinner meals
            
            // Category restrictions
            noConsecutiveCategories: ['pasta', 'rice'], // No pasta/rice two nights in row
            minDaysBetweenCategories: {
                'seafood': 3,    // Wait 3 days between seafood
                'red-meat': 2,   // Wait 2 days between red meat
            },
            
            // Day-specific rules
            skipDays: {
                'friday': true,      // Usually takeaway/takeout
                'saturday': true,    // Usually takeaway/takeout
                'sunday': false      // Plan Sunday dinner
            },
            
            // Dietary preferences
            maxMealsPerWeek: {
                'pasta': 2,          // Max 2 pasta meals per week
                'red-meat': 3,       // Max 3 red meat meals
                'vegetarian': 3,     // Min 3 vegetarian (auto-calculated)
            },
            
            // Cooking time preferences
            maxCookingTime: {
                'weekday': 45,       // Max 45 min on weekdays
                'sunday': 120        // Up to 2 hours on Sunday
            },
            
            // Leftover management
            useLeftovers: true,
            leftoverDays: ['monday', 'wednesday'], // Plan leftovers these days
        };
        
        // Metric conversion factors
        this.metricConversions = {
            // Volume
            'cup': 250,           // 1 cup = 250ml
            'cups': 250,
            'tablespoon': 15,     // 1 tbsp = 15ml
            'tablespoons': 15,
            'tbsp': 15,
            'teaspoon': 5,        // 1 tsp = 5ml
            'teaspoons': 5,
            'tsp': 5,
            'fluid-ounce': 30,    // 1 fl oz = 30ml
            'fl-oz': 30,
            'pint': 473,          // 1 pint = 473ml
            'quart': 946,         // 1 quart = 946ml
            'gallon': 3785,       // 1 gallon = 3.785L
            
            // Weight
            'ounce': 28,          // 1 oz = 28g
            'ounces': 28,
            'oz': 28,
            'pound': 454,         // 1 lb = 454g
            'pounds': 454,
            'lb': 454,
            'lbs': 454,
            
            // Length
            'inch': 2.54,         // 1 inch = 2.54cm
            'inches': 2.54,
        };
    }
    
    /**
     * Generate a weekly meal plan based on rules
     * @param {Array} recipes - Available recipes
     * @param {Object} preferences - User preferences
     * @returns {Array} Weekly meal plan
     */
    generateWeeklyPlan(recipes, preferences = {}) {
        const plan = [];
        const today = new Date();
        
        // Merge user preferences with default rules
        const rules = { ...this.rules, ...preferences };
        
        // Generate 7-day plan
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            
            // Check if we should skip this day
            if (rules.skipDays[dayName]) {
                plan.push({
                    date: date.toISOString().split('T')[0],
                    day: dayName,
                    meal: null,
                    reason: 'skip_day',
                    note: 'Takeaway or eat out'
                });
                continue;
            }
            
            // Filter recipes for this day
            const availableRecipes = this.filterRecipesForDay(recipes, dayName, rules, plan.slice(-1)[0]);
            
            if (availableRecipes.length === 0) {
                // No suitable recipes found
                plan.push({
                    date: date.toISOString().split('T')[0],
                    day: dayName,
                    meal: null,
                    reason: 'no_suitable_recipes',
                    note: 'No recipes match criteria'
                });
                continue;
            }
            
            // Select a recipe (simple random for now, could be smarter)
            const selectedRecipe = this.selectRecipe(availableRecipes, dayName, rules);
            
            plan.push({
                date: date.toISOString().split('T')[0],
                day: dayName,
                meal: selectedRecipe,
                category: selectedRecipe.category || [],
                cookingTime: selectedRecipe.prep_time_minutes + selectedRecipe.cook_time_minutes
            });
        }
        
        return plan;
    }
    
    /**
     * Filter recipes for a specific day based on rules
     */
    filterRecipesForDay(recipes, dayName, rules, previousDayMeal) {
        return recipes.filter(recipe => {
            // 1. Check meal type (dinner only)
            if (!this.isDinnerRecipe(recipe)) {
                return false;
            }
            
            // 2. Check cooking time for day
            const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
            const maxTime = rules.maxCookingTime[dayName === 'sunday' ? 'sunday' : 'weekday'];
            
            if (totalTime > maxTime) {
                return false;
            }
            
            // 3. Check consecutive category rule (NO PASTA TWO NIGHTS IN A ROW)
            if (previousDayMeal && previousDayMeal.meal) {
                const prevCategories = previousDayMeal.meal.category || [];
                const currentCategories = recipe.category || [];
                
                // Check for consecutive pasta/rice
                const hasConsecutivePasta = prevCategories.some(cat => 
                    rules.noConsecutiveCategories.includes(cat)) &&
                    currentCategories.some(cat => rules.noConsecutiveCategories.includes(cat));
                
                if (hasConsecutivePasta) {
                    return false;
                }
            }
            
            // 4. Check days between categories
            if (this.violatesDaysBetweenRule(recipe, dayName, rules)) {
                return false;
            }
            
            // 5. Check weekly limits (would need weekly context)
            // Implemented in selectRecipe method
            
            return true;
        });
    }
    
    /**
     * Check if recipe violates days-between-categories rule
     */
    violatesDaysBetweenRule(recipe, dayName, rules) {
        // This would need history of previous meals
        // For now, simple implementation
        const recipeCategories = recipe.category || [];
        
        for (const [category, minDays] of Object.entries(rules.minDaysBetweenCategories)) {
            if (recipeCategories.includes(category)) {
                // Check if we've had this category recently
                // Would need meal history - implement later
            }
        }
        
        return false;
    }
    
    /**
     * Select the best recipe from available options
     */
    selectRecipe(availableRecipes, dayName, rules) {
        // Simple selection for now - prioritize:
        // 1. Not cooked recently
        // 2. Fits weekly category limits
        // 3. Cooking time appropriate for day
        
        // For MVP: random selection
        const randomIndex = Math.floor(Math.random() * availableRecipes.length);
        return availableRecipes[randomIndex];
    }
    
    /**
     * Check if recipe is suitable for dinner
     */
    isDinnerRecipe(recipe) {
        const categories = recipe.category || [];
        const dinnerCategories = ['dinner', 'main', 'main-course'];
        
        // If recipe has explicit dinner category
        if (categories.some(cat => dinnerCategories.includes(cat))) {
            return true;
        }
        
        // If recipe doesn't have breakfast/lunch categories
        const nonDinnerCategories = ['breakfast', 'brunch', 'lunch', 'snack', 'dessert'];
        if (!categories.some(cat => nonDinnerCategories.includes(cat))) {
            return true; // Assume dinner if not marked otherwise
        }
        
        return false;
    }
    
    /**
     * Convert imperial units to metric in ingredient list
     */
    convertToMetric(ingredients) {
        return ingredients.map(ingredient => {
            const converted = { ...ingredient };
            
            // Check if unit needs conversion
            const unit = (ingredient.unit || '').toLowerCase();
            
            if (this.metricConversions[unit]) {
                // Convert to metric
                const conversionFactor = this.metricConversions[unit];
                converted.quantity = ingredient.quantity * conversionFactor;
                
                // Set appropriate metric unit
                if (['cup', 'cups', 'tablespoon', 'tablespoons', 'tbsp', 
                     'teaspoon', 'teaspoons', 'tsp', 'fluid-ounce', 'fl-oz',
                     'pint', 'quart', 'gallon'].includes(unit)) {
                    // Volume conversions to ml
                    if (converted.quantity >= 1000) {
                        converted.quantity = Math.round(converted.quantity / 100) / 10; // Convert to L
                        converted.unit = 'L';
                    } else {
                        converted.quantity = Math.round(converted.quantity);
                        converted.unit = 'ml';
                    }
                } else if (['ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs'].includes(unit)) {
                    // Weight conversions to g
                    if (converted.quantity >= 1000) {
                        converted.quantity = Math.round(converted.quantity / 100) / 10; // Convert to kg
                        converted.unit = 'kg';
                    } else {
                        converted.quantity = Math.round(converted.quantity);
                        converted.unit = 'g';
                    }
                } else if (['inch', 'inches'].includes(unit)) {
                    // Length conversions to cm
                    converted.quantity = Math.round(converted.quantity * 10) / 10; // 1 decimal place
                    converted.unit = 'cm';
                }
                
                // Add conversion note
                if (!converted.notes) {
                    converted.notes = '';
                }
                converted.notes += ` (converted from ${ingredient.quantity} ${ingredient.unit})`.trim();
            }
            
            return converted;
        });
    }
    
    /**
     * Generate grocery list from meal plan
     */
    generateGroceryList(mealPlan) {
        const groceryItems = {};
        
        // Aggregate ingredients from all planned meals
        mealPlan.forEach(day => {
            if (day.meal && day.meal.ingredients) {
                day.meal.ingredients.forEach(ingredient => {
                    const key = `${ingredient.name}|${ingredient.unit || ''}`;
                    
                    if (groceryItems[key]) {
                        // Sum quantities
                        groceryItems[key].quantity += ingredient.quantity;
                    } else {
                        // New item
                        groceryItems[key] = { ...ingredient };
                    }
                });
            }
        });
        
        // Convert to array and categorize
        const items = Object.values(groceryItems);
        
        // Categorize items (simple categorization)
        const categorized = {
            'Produce': items.filter(item => this.isProduce(item)),
            'Meat & Seafood': items.filter(item => this.isMeatOrSeafood(item)),
            'Dairy': items.filter(item => this.isDairy(item)),
            'Pantry': items.filter(item => this.isPantry(item)),
            'Bakery': items.filter(item => this.isBakery(item)),
            'Other': items.filter(item => !this.isCategorized(item))
        };
        
        return {
            totalItems: items.length,
            categorized,
            items: items.sort((a, b) => a.name.localeCompare(b.name))
        };
    }
    
    // Categorization helpers
    isProduce(item) {
        const produceKeywords = ['onion', 'garlic', 'tomato', 'potato', 'carrot', 'lettuce', 
                                'spinach', 'broccoli', 'apple', 'banana', 'orange', 'lemon',
                                'herb', 'basil', 'parsley', 'coriander', 'vegetable', 'fruit'];
        return produceKeywords.some(keyword => 
            item.name.toLowerCase().includes(keyword));
    }
    
    isMeatOrSeafood(item) {
        const meatKeywords = ['beef', 'chicken', 'pork', 'lamb', 'fish', 'salmon', 'tuna',
                             'shrimp', 'prawn', 'meat', 'mince', 'steak', 'bacon', 'sausage'];
        return meatKeywords.some(keyword => 
            item.name.toLowerCase().includes(keyword));
    }
    
    isDairy(item) {
        const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt',
                              'parmesan', 'cheddar', 'mozzarella', 'feta'];
        return dairyKeywords.some(keyword => 
            item.name.toLowerCase().includes(keyword));
    }
    
    isPantry(item) {
        const pantryKeywords = ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar',
                               'pasta', 'rice', 'bean', 'lentil', 'spice', 'herb',
                               'canned', 'tomato paste', 'stock', 'broth'];
        return pantryKeywords.some(keyword => 
            item.name.toLowerCase().includes(keyword));
    }
    
    isBakery(item) {
        const bakeryKeywords = ['bread', 'roll', 'baguette', 'croissant', 'pastry'];
        return bakeryKeywords.some(keyword => 
            item.name.toLowerCase().includes(keyword));
    }
    
    isCategorized(item) {
        return this.isProduce(item) || this.isMeatOrSeafood(item) || 
               this.isDairy(item) || this.isPantry(item) || this.isBakery(item);
    }
    
    /**
     * Calculate nutritional info for a recipe
     */
    calculateNutrition(recipe) {
        // Simple estimation based on ingredients
        // In production, would use nutrition database API
        
        const nutrition = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };
        
        // Very basic estimation (would need proper database)
        recipe.ingredients?.forEach(ingredient => {
            const name = ingredient.name.toLowerCase();
            
            // Rough estimates per 100g
            if (name.includes('chicken') || name.includes('beef')) {
                nutrition.calories += 165 * (ingredient.quantity / 100);
                nutrition.protein += 31 * (ingredient.quantity / 100);
            } else if (name.includes('pasta') || name.includes('rice')) {
                nutrition.calories += 130 * (ingredient.quantity / 100);
                nutrition.carbs += 28 * (ingredient.quantity / 100);
            } else if (name.includes('vegetable') || name.includes('tomato')) {
                nutrition.calories += 20 * (ingredient.quantity / 100);
                nutrition.fiber += 2 * (ingredient.quantity / 100);
            }
            // Add more categories as needed
        });
        
        // Adjust for servings
        const servings = recipe.servings || 4;
        Object.keys(nutrition).forEach(key => {
            nutrition[key] = Math.round(nutrition[key] / servings);
        });
        
        return nutrition;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MealPlannerRules;
}