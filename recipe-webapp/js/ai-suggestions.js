/**
 * AI Recipe Suggestions
 * Generates recipe suggestions based on your existing recipes
 */

class AISuggestions {
    constructor(recipeManager) {
        this.recipeManager = recipeManager;
        this.suggestions = this.loadSuggestions();
    }
    
    /**
     * Load saved suggestions from storage
     */
    loadSuggestions() {
        try {
            const saved = localStorage.getItem('ai_recipe_suggestions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading AI suggestions:', e);
            return [];
        }
    }
    
    /**
     * Save suggestions to storage
     */
    saveSuggestions() {
        localStorage.setItem('ai_recipe_suggestions', JSON.stringify(this.suggestions));
    }
    
    /**
     * Generate AI suggestions based on user's recipe patterns
     */
    generateSuggestions() {
        const recipes = this.recipeManager.getAllRecipes();
        const favorites = this.recipeManager.getFavorites();
        const stats = this.recipeManager.getStats();
        
        // Analyze user preferences
        const preferences = this.analyzePreferences(recipes, favorites, stats);
        
        // Generate suggestions
        const newSuggestions = [];
        
        // 1. Suggest based on favorite categories
        if (preferences.favoriteCategories.length > 0) {
            const category = this.getRandomItem(preferences.favoriteCategories);
            const suggestion = this.generateCategorySuggestion(category, preferences);
            if (suggestion) newSuggestions.push(suggestion);
        }
        
        // 2. Suggest based on cooking time preference
        if (preferences.avgCookingTime) {
            const suggestion = this.generateTimeBasedSuggestion(preferences);
            if (suggestion) newSuggestions.push(suggestion);
        }
        
        // 3. Suggest based on ingredient patterns
        if (preferences.commonIngredients.length > 0) {
            const suggestion = this.generateIngredientBasedSuggestion(preferences);
            if (suggestion) newSuggestions.push(suggestion);
        }
        
        // 4. Suggest trying something new (different category)
        if (preferences.leastUsedCategories.length > 0) {
            const category = this.getRandomItem(preferences.leastUsedCategories);
            const suggestion = this.generateNewCategorySuggestion(category);
            if (suggestion) newSuggestions.push(suggestion);
        }
        
        // 5. Suggest based on season (simplified)
        const seasonalSuggestion = this.generateSeasonalSuggestion();
        if (seasonalSuggestion) newSuggestions.push(seasonalSuggestion);
        
        // Save and return
        this.suggestions = newSuggestions.slice(0, 5); // Keep top 5
        this.saveSuggestions();
        
        return this.suggestions;
    }
    
    /**
     * Analyze user preferences from recipe data
     */
    analyzePreferences(recipes, favorites, stats) {
        const preferences = {
            favoriteCategories: [],
            avgCookingTime: 0,
            commonIngredients: [],
            leastUsedCategories: [],
            dietaryPatterns: []
        };
        
        // Analyze favorite categories
        const categoryCount = {};
        favorites.forEach(recipe => {
            categoryCount[recipe.category] = (categoryCount[recipe.category] || 0) + 1;
        });
        
        preferences.favoriteCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);
        
        // Calculate average cooking time
        const totalTime = recipes.reduce((sum, recipe) => sum + (recipe.cookingTime || 30), 0);
        preferences.avgCookingTime = Math.round(totalTime / recipes.length);
        
        // Find common ingredients
        const ingredientCount = {};
        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                const name = ing.name.toLowerCase();
                ingredientCount[name] = (ingredientCount[name] || 0) + 1;
            });
        });
        
        preferences.commonIngredients = Object.entries(ingredientCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ingredient]) => ingredient);
        
        // Find least used categories
        const allCategories = [...new Set(recipes.map(r => r.category))];
        const usedCategories = new Set(favorites.map(r => r.category));
        preferences.leastUsedCategories = allCategories.filter(cat => !usedCategories.has(cat));
        
        return preferences;
    }
    
    /**
     * Generate suggestion based on favorite category
     */
    generateCategorySuggestion(category, preferences) {
        const categoryRecipes = {
            'Pasta': [
                'Creamy Garlic Pasta',
                'Pesto Pasta with Cherry Tomatoes',
                'One-Pot Tomato Basil Pasta'
            ],
            'Chicken': [
                'Lemon Herb Chicken',
                'Honey Garlic Chicken',
                'Creamy Chicken Marsala'
            ],
            'Beef': [
                'Beef Stroganoff',
                'Korean Beef Bowl',
                'Beef and Broccoli Stir Fry'
            ],
            'Seafood': [
                'Garlic Butter Shrimp',
                'Lemon Herb Salmon',
                'Creamy Tuscan Shrimp'
            ],
            'Vegetarian': [
                'Vegetable Lasagna',
                'Mushroom Risotto',
                'Stuffed Bell Peppers'
            ]
        };
        
        const suggestions = categoryRecipes[category] || [
            'New ' + category + ' Recipe',
            'Special ' + category + ' Dish',
            category + ' Delight'
        ];
        
        return {
            id: 'cat_' + Date.now(),
            type: 'category_based',
            title: `Try a New ${category} Recipe`,
            description: `Based on your love for ${category} dishes, try one of these variations.`,
            recipeName: this.getRandomItem(suggestions),
            category: category,
            confidence: 0.85,
            reason: `You frequently cook ${category} recipes`,
            ingredients: this.generateIngredientsForCategory(category),
            cookingTime: preferences.avgCookingTime + 5
        };
    }
    
    /**
     * Generate suggestion based on cooking time preference
     */
    generateTimeBasedSuggestion(preferences) {
        const timeRanges = {
            quick: ['30 minutes or less', 'Quick and Easy'],
            medium: ['45-60 minutes', 'Weeknight Favorite'],
            long: ['60+ minutes', 'Weekend Special']
        };
        
        let timeRange, label;
        if (preferences.avgCookingTime <= 30) {
            timeRange = 'quick';
            label = timeRanges.quick;
        } else if (preferences.avgCookingTime <= 60) {
            timeRange = 'medium';
            label = timeRanges.medium;
        } else {
            timeRange = 'long';
            label = timeRanges.long;
        }
        
        const quickRecipes = [
            '15-Minute Garlic Noodles',
            'Speedy Chicken Stir Fry',
            'Rapid Rice Bowl'
        ];
        
        const mediumRecipes = [
            'Herb Crusted Chicken',
            'Creamy Tomato Pasta',
            'Beef and Vegetable Skewers'
        ];
        
        const longRecipes = [
            'Slow Cooked Beef Stew',
            'Homemade Lasagna',
            'Sunday Roast Chicken'
        ];
        
        const recipeLists = {
            quick: quickRecipes,
            medium: mediumRecipes,
            long: longRecipes
        };
        
        return {
            id: 'time_' + Date.now(),
            type: 'time_based',
            title: `${label[1]} Recipe`,
            description: `Based on your average cooking time of ${preferences.avgCookingTime} minutes.`,
            recipeName: this.getRandomItem(recipeLists[timeRange]),
            category: 'Various',
            confidence: 0.75,
            reason: `Matches your preferred cooking time`,
            cookingTime: preferences.avgCookingTime
        };
    }
    
    /**
     * Generate suggestion based on common ingredients
     */
    generateIngredientBasedSuggestion(preferences) {
        if (preferences.commonIngredients.length === 0) return null;
        
        const commonIngredient = this.getRandomItem(preferences.commonIngredients.slice(0, 3));
        const ingredientRecipes = {
            'chicken': ['Chicken Parmesan', 'Chicken Curry', 'Chicken Fajitas'],
            'beef': ['Beef Tacos', 'Beef Stir Fry', 'Beef Burgers'],
            'tomato': ['Tomato Soup', 'Tomato Basil Pasta', 'Tomato Salad'],
            'rice': ['Fried Rice', 'Rice Pilaf', 'Rice Bowl'],
            'pasta': ['Pasta Primavera', 'Pasta Carbonara', 'Pasta Salad']
        };
        
        const recipes = ingredientRecipes[commonIngredient] || [
            `${commonIngredient.charAt(0).toUpperCase() + commonIngredient.slice(1)} Special`,
            `New ${commonIngredient} Recipe`,
            `${commonIngredient} Delight`
        ];
        
        return {
            id: 'ing_' + Date.now(),
            type: 'ingredient_based',
            title: `Make the Most of ${commonIngredient.charAt(0).toUpperCase() + commonIngredient.slice(1)}`,
            description: `You use ${commonIngredient} frequently. Try a new recipe featuring it.`,
            recipeName: this.getRandomItem(recipes),
            category: 'Various',
            confidence: 0.80,
            reason: `Uses ${commonIngredient} which you often cook with`,
            mainIngredient: commonIngredient
        };
    }
    
    /**
     * Generate suggestion for trying a new category
     */
    generateNewCategorySuggestion(category) {
        if (!category) return null;
        
        const newCategoryRecipes = {
            'Seafood': ['Garlic Butter Scallops', 'Lemon Herb Fish', 'Shrimp Scampi'],
            'Vegetarian': ['Vegetable Curry', 'Stuffed Mushrooms', 'Ratatouille'],
            'Baking': ['Homemade Bread', 'Savory Muffins', 'Herb Focaccia'],
            'Soup': ['Hearty Vegetable Soup', 'Creamy Mushroom Soup', 'Chicken Noodle Soup']
        };
        
        const recipes = newCategoryRecipes[category] || [
            `New ${category} Recipe`,
            `${category} Discovery`,
            `Try ${category}`
        ];
        
        return {
            id: 'newcat_' + Date.now(),
            type: 'new_category',
            title: `Explore ${category}`,
            description: `Try something different! You haven't cooked ${category} recipes yet.`,
            recipeName: this.getRandomItem(recipes),
            category: category,
            confidence: 0.70,
            reason: `New category for you to explore`,
            isNewCategory: true
        };
    }
    
    /**
     * Generate seasonal suggestion
     */
    generateSeasonalSuggestion() {
        const month = new Date().getMonth();
        let season, recipes;
        
        // Simple season detection (Southern Hemisphere - Australia)
        if (month >= 11 || month <= 1) { // Dec-Feb
            season = 'Summer';
            recipes = ['BBQ Chicken Salad', 'Cold Pasta Salad', 'Fish Tacos', 'Fruit Salad'];
        } else if (month >= 2 && month <= 4) { // Mar-May
            season = 'Autumn';
            recipes = ['Pumpkin Soup', 'Apple Crisp', 'Shepherd\'s Pie', 'Roast Vegetables'];
        } else if (month >= 5 && month <= 7) { // Jun-Aug
            season = 'Winter';
            recipes = ['Beef Stew', 'Chicken Pot Pie', 'Lentil Soup', 'Hot Chocolate'];
        } else { // Sep-Nov
            season = 'Spring';
            recipes = ['Asparagus Risotto', 'Spring Rolls', 'Lemon Chicken', 'Berry Salad'];
        }
        
        return {
            id: 'season_' + Date.now(),
            type: 'seasonal',
            title: `${season} Special`,
            description: `Perfect ${season} recipe for the current weather.`,
            recipeName: this.getRandomItem(recipes),
            category: 'Seasonal',
            confidence: 0.90,
            reason: `Seasonally appropriate for ${season}`,
            season: season
        };
    }
    
    /**
     * Generate ingredients for a category
     */
    generateIngredientsForCategory(category) {
        const ingredientTemplates = {
            'Pasta': ['Pasta', 'Tomato Sauce', 'Garlic', 'Olive Oil', 'Herbs'],
            'Chicken': ['Chicken Breast', 'Vegetables', 'Herbs', 'Spices', 'Oil'],
            'Beef': ['Beef', 'Onions', 'Garlic', 'Stock', 'Vegetables'],
            'Seafood': ['Fish/Seafood', 'Lemon', 'Herbs', 'Butter', 'Vegetables'],
            'Vegetarian': ['Mixed Vegetables', 'Grains', 'Beans', 'Herbs', 'Sauce']
        };
        
        return ingredientTemplates[category] || ['Main ingredient', 'Vegetables', 'Seasonings', 'Sauce', 'Garnish'];
    }
    
    /**
     * Get random item from array
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    /**
     * Get all suggestions
     */
    getSuggestions() {
        if (this.suggestions.length === 0) {
            return this.generateSuggestions();
        }
        return this.suggestions;
    }
    
    /**
     * Clear all suggestions
     */
    clearSuggestions() {
        this.suggestions = [];
        this.saveSuggestions();
    }
    
    /**
     * Mark suggestion as used
     */
    markSuggestionUsed(suggestionId) {
        this.suggestions = this.suggestions.filter(s => s.id !== suggestionId);
        this.saveSuggestions();
    }
    
    /**
     * Create AI suggestion card HTML
     */
    createSuggestionCard(suggestion) {
        const card = document.createElement('div');
        card.className = 'ai-suggestion-card';
        card.dataset.suggestionId = suggestion.id;
        
        const icon = this.getSuggestionIcon(suggestion.type);
        const confidencePercent = Math.round(suggestion.confidence * 100);
        
        card.innerHTML = `
            <div class="ai-suggestion-header">
                <i data-lucide="${icon}"></i>
                <span class="ai-suggestion-title">${suggestion.title}</span>
            </div>
            
            <div class="ai-suggestion-text">
                ${suggestion.description}
            </div>
            
            <div class="flex justify-between items-center mb-3">
                <div>
                    <div class="font-semibold">${suggestion.recipeName}</div>
                    <div class="text-sm opacity-80">${suggestion.category} • ${suggestion.cookingTime || '30'} min</div>
                </div>
                <div class="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    ${confidencePercent}% match
                </div>
            </div>
            
            <div class="ai-suggestion-actions">
                <button class="flex-1 bg-white text-purple-700 py-2 rounded-lg font-semibold use-suggestion">
                    Use This Recipe
                </button>
                <button class="px-4 py-2 bg-white bg-opacity-20 rounded-lg not-interested">
                    Not Now
                </button>
            </div>
            
            <div class="mt-3 text-xs opacity-70">
                <i data-lucide="lightbulb" class="h-3 w-3 inline mr-1"></i>
                ${suggestion.reason}
            </div>
        `;
        
        return card;
    }
    
    /**
     * Get icon for suggestion type
     */
    getSuggestionIcon(type) {
        const icons = {
            'category_based': 'heart',
            'time_based': 'clock',
            'ingredient_based': 'carrot',
            'new_category': 'compass',
            'seasonal': 'sun'
        };
        return icons[type] || 'sparkles';
    }
    
    /**
     * Add AI-generated recipe to recipe manager
     */
    addAIGeneratedRecipe(suggestion) {
        const recipeData = {
            name: suggestion.recipeName,
            category: suggestion.category,
            cookingTime: suggestion.cookingTime || 30,
            ingredients: (suggestion.ingredients || []).map(ing => ({
                name: ing,
                quantity: 1,
                unit: 'portion'
            })),
            instructions: `1. Prepare ingredients\n2. Cook according to ${suggestion.category} method\n3. Season to taste\n4. Serve hot`,
            notes: `AI-suggested recipe based on: ${suggestion.reason}`
        };
        
        const newRecipe = this.recipeManager.addRecipe(recipeData);
        
        // Mark suggestion as used
        this.markSuggestionUsed(suggestion.id);
        
        return newRecipe;
    }
}

// Create global instance (will be initialized after recipeManager)
let aiSuggestions = null;

function initAISuggestions(recipeManager) {
    aiSuggestions = new AISuggestions(recipeManager);
    return aiSuggestions;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AISuggestions, initAISuggestions };
}