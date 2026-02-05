/**
 * Recipe Manager
 * Main recipe database and management system with favorites
 */

class RecipeManager {
    constructor() {
        this.recipes = this.loadRecipes();
        this.favorites = this.loadFavorites();
        this.favoriteRules = this.loadFavoriteRules();
        this.categories = [
            'Pasta', 'Rice', 'Seafood', 'Chicken', 'Beef', 'Pork', 
            'Vegetarian', 'Salad', 'Soup', 'Stir Fry', 'Baking', 'Other'
        ];
    }
    
    /**
     * Load recipes from storage
     */
    loadRecipes() {
        try {
            const saved = localStorage.getItem('recipe_database');
            return saved ? JSON.parse(saved) : this.getSampleRecipes();
        } catch (e) {
            console.error('Error loading recipes:', e);
            return this.getSampleRecipes();
        }
    }
    
    /**
     * Load favorites from storage
     */
    loadFavorites() {
        try {
            const saved = localStorage.getItem('recipe_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading favorites:', e);
            return [];
        }
    }
    
    /**
     * Load favorite rules from storage
     */
    loadFavoriteRules() {
        try {
            const saved = localStorage.getItem('favorite_rules');
            return saved ? JSON.parse(saved) : {
                minDaysBetween: 7,  // Minimum days between appearances
                maxPerWeek: 2,      // Maximum favorites per week
                autoSchedule: true  // Automatically include in meal plans
            };
        } catch (e) {
            console.error('Error loading favorite rules:', e);
            return {
                minDaysBetween: 7,
                maxPerWeek: 2,
                autoSchedule: true
            };
        }
    }
    
    /**
     * Save recipes to storage
     */
    saveRecipes() {
        localStorage.setItem('recipe_database', JSON.stringify(this.recipes));
    }
    
    /**
     * Save favorites to storage
     */
    saveFavorites() {
        localStorage.setItem('recipe_favorites', JSON.stringify(this.favorites));
    }
    
    /**
     * Save favorite rules to storage
     */
    saveFavoriteRules() {
        localStorage.setItem('favorite_rules', JSON.stringify(this.favoriteRules));
    }
    
    /**
     * Get sample recipes for initial setup
     */
    getSampleRecipes() {
        return [
            {
                id: '1',
                name: 'Spaghetti Bolognese',
                category: 'Pasta',
                cookingTime: 45,
                ingredients: [
                    { name: 'Ground Beef', quantity: 500, unit: 'g' },
                    { name: 'Spaghetti', quantity: 400, unit: 'g' },
                    { name: 'Tomatoes', quantity: 4, unit: 'pieces' },
                    { name: 'Onion', quantity: 1, unit: 'piece' },
                    { name: 'Garlic', quantity: 3, unit: 'cloves' },
                    { name: 'Parmesan Cheese', quantity: 100, unit: 'g' }
                ],
                instructions: '1. Cook pasta...',
                favorite: false,
                lastUsed: null,
                timesUsed: 0,
                rating: 4.5
            },
            {
                id: '2',
                name: 'Chicken Stir Fry',
                category: 'Stir Fry',
                cookingTime: 30,
                ingredients: [
                    { name: 'Chicken Breast', quantity: 2, unit: 'pieces' },
                    { name: 'Rice', quantity: 300, unit: 'g' },
                    { name: 'Broccoli', quantity: 1, unit: 'head' },
                    { name: 'Carrots', quantity: 2, unit: 'pieces' },
                    { name: 'Soy Sauce', quantity: 50, unit: 'ml' }
                ],
                instructions: '1. Cut chicken...',
                favorite: true,
                lastUsed: '2026-02-01',
                timesUsed: 3,
                rating: 4.8
            },
            {
                id: '3',
                name: 'Baked Salmon',
                category: 'Seafood',
                cookingTime: 25,
                ingredients: [
                    { name: 'Salmon', quantity: 2, unit: 'fillets' },
                    { name: 'Lemon', quantity: 1, unit: 'piece' },
                    { name: 'Asparagus', quantity: 200, unit: 'g' },
                    { name: 'Potatoes', quantity: 4, unit: 'pieces' }
                ],
                instructions: '1. Preheat oven...',
                favorite: true,
                lastUsed: '2026-01-28',
                timesUsed: 2,
                rating: 4.7
            },
            {
                id: '4',
                name: 'Vegetable Curry',
                category: 'Vegetarian',
                cookingTime: 40,
                ingredients: [
                    { name: 'Potatoes', quantity: 3, unit: 'pieces' },
                    { name: 'Carrots', quantity: 2, unit: 'pieces' },
                    { name: 'Peas', quantity: 200, unit: 'g' },
                    { name: 'Coconut Milk', quantity: 400, unit: 'ml' },
                    { name: 'Rice', quantity: 300, unit: 'g' }
                ],
                instructions: '1. Chop vegetables...',
                favorite: false,
                lastUsed: null,
                timesUsed: 0,
                rating: 4.2
            },
            {
                id: '5',
                name: 'Beef Tacos',
                category: 'Beef',
                cookingTime: 35,
                ingredients: [
                    { name: 'Ground Beef', quantity: 500, unit: 'g' },
                    { name: 'Taco Shells', quantity: 12, unit: 'pieces' },
                    { name: 'Lettuce', quantity: 1, unit: 'head' },
                    { name: 'Tomatoes', quantity: 3, unit: 'pieces' },
                    { name: 'Cheese', quantity: 200, unit: 'g' }
                ],
                instructions: '1. Cook beef...',
                favorite: true,
                lastUsed: '2026-01-25',
                timesUsed: 5,
                rating: 4.9
            }
        ];
    }
    
    /**
     * Get all recipes
     */
    getAllRecipes() {
        return this.recipes;
    }
    
    /**
     * Get recipe by ID
     */
    getRecipeById(id) {
        return this.recipes.find(recipe => recipe.id === id);
    }
    
    /**
     * Get recipes by category
     */
    getRecipesByCategory(category) {
        return this.recipes.filter(recipe => recipe.category === category);
    }
    
    /**
     * Get favorite recipes
     */
    getFavorites() {
        return this.recipes.filter(recipe => recipe.favorite);
    }
    
    /**
     * Toggle favorite status
     */
    toggleFavorite(recipeId) {
        const recipe = this.getRecipeById(recipeId);
        if (recipe) {
            recipe.favorite = !recipe.favorite;
            
            // Update favorites list
            if (recipe.favorite) {
                this.favorites.push(recipeId);
            } else {
                this.favorites = this.favorites.filter(id => id !== recipeId);
            }
            
            this.saveRecipes();
            this.saveFavorites();
            
            return recipe.favorite;
        }
        return false;
    }
    
    /**
     * Add new recipe
     */
    addRecipe(recipeData) {
        const newRecipe = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: recipeData.name,
            category: recipeData.category || 'Other',
            cookingTime: recipeData.cookingTime || 30,
            ingredients: recipeData.ingredients || [],
            instructions: recipeData.instructions || '',
            favorite: false,
            lastUsed: null,
            timesUsed: 0,
            rating: 0,
            created: new Date().toISOString()
        };
        
        this.recipes.push(newRecipe);
        this.saveRecipes();
        
        return newRecipe;
    }
    
    /**
     * Update recipe
     */
    updateRecipe(recipeId, updates) {
        const index = this.recipes.findIndex(recipe => recipe.id === recipeId);
        if (index >= 0) {
            this.recipes[index] = { ...this.recipes[index], ...updates };
            this.saveRecipes();
            return this.recipes[index];
        }
        return null;
    }
    
    /**
     * Delete recipe
     */
    deleteRecipe(recipeId) {
        const index = this.recipes.findIndex(recipe => recipe.id === recipeId);
        if (index >= 0) {
            this.recipes.splice(index, 1);
            
            // Remove from favorites if present
            this.favorites = this.favorites.filter(id => id !== recipeId);
            
            this.saveRecipes();
            this.saveFavorites();
            return true;
        }
        return false;
    }
    
    /**
     * Mark recipe as used (update lastUsed and timesUsed)
     */
    markRecipeUsed(recipeId) {
        const recipe = this.getRecipeById(recipeId);
        if (recipe) {
            recipe.lastUsed = new Date().toISOString().split('T')[0];
            recipe.timesUsed = (recipe.timesUsed || 0) + 1;
            this.saveRecipes();
            return true;
        }
        return false;
    }
    
    /**
     * Update favorite rules
     */
    updateFavoriteRules(rules) {
        this.favoriteRules = { ...this.favoriteRules, ...rules };
        this.saveFavoriteRules();
        return this.favoriteRules;
    }
    
    /**
     * Get recipes that can be used based on favorite rules
     */
    getAvailableFavorites(lastUsedDates = {}) {
        const today = new Date().toISOString().split('T')[0];
        const favorites = this.getFavorites();
        
        return favorites.filter(recipe => {
            // If recipe has never been used, it's available
            if (!recipe.lastUsed) return true;
            
            // Check if enough days have passed since last use
            const lastUsed = recipe.lastUsed;
            const daysSinceLastUse = this.daysBetween(lastUsed, today);
            
            return daysSinceLastUse >= this.favoriteRules.minDaysBetween;
        });
    }
    
    /**
     * Calculate days between two dates
     */
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    /**
     * Get recipe statistics
     */
    getStats() {
        const stats = {
            totalRecipes: this.recipes.length,
            totalFavorites: this.getFavorites().length,
            byCategory: {},
            mostUsed: [],
            highestRated: []
        };
        
        // Count by category
        this.recipes.forEach(recipe => {
            stats.byCategory[recipe.category] = (stats.byCategory[recipe.category] || 0) + 1;
        });
        
        // Most used recipes
        stats.mostUsed = [...this.recipes]
            .sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0))
            .slice(0, 5);
        
        // Highest rated recipes
        stats.highestRated = [...this.recipes]
            .filter(r => r.rating > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        
        return stats;
    }
    
    /**
     * Search recipes
     */
    searchRecipes(query) {
        const searchTerm = query.toLowerCase();
        return this.recipes.filter(recipe => {
            return recipe.name.toLowerCase().includes(searchTerm) ||
                   recipe.category.toLowerCase().includes(searchTerm) ||
                   recipe.ingredients.some(ing => 
                       ing.name.toLowerCase().includes(searchTerm)
                   );
        });
    }
    
    /**
     * Generate meal plan with favorites consideration
     */
    generateMealPlan(days = 7, includeFavorites = true) {
        const plan = [];
        const availableRecipes = [...this.recipes];
        const usedRecipes = new Set();
        const usedCategories = new Set();
        
        // Get available favorites based on rules
        const availableFavorites = includeFavorites ? this.getAvailableFavorites() : [];
        let favoritesUsed = 0;
        
        for (let i = 0; i < days; i++) {
            // Skip weekends (Friday/Saturday) for takeaway
            const dayOfWeek = this.getDayOfWeek(i);
            if (dayOfWeek === 'Friday' || dayOfWeek === 'Saturday') {
                plan.push({
                    day: dayOfWeek,
                    type: 'Takeaway',
                    recipe: null,
                    isFavorite: false
                });
                continue;
            }
            
            // Try to use a favorite if available and within limits
            let selectedRecipe = null;
            let isFavorite = false;
            
            if (availableFavorites.length > 0 && 
                favoritesUsed < this.favoriteRules.maxPerWeek &&
                Math.random() > 0.3) { // 70% chance to use favorite
                
                // Filter favorites not used yet and with different category from previous day
                const candidateFavorites = availableFavorites.filter(fav => 
                    !usedRecipes.has(fav.id) && 
                    !usedCategories.has(fav.category)
                );
                
                if (candidateFavorites.length > 0) {
                    selectedRecipe = candidateFavorites[Math.floor(Math.random() * candidateFavorites.length)];
                    isFavorite = true;
                    favoritesUsed++;
                }
            }
            
            // If no favorite selected, pick from regular recipes
            if (!selectedRecipe) {
                const candidateRecipes = availableRecipes.filter(recipe => 
                    !usedRecipes.has(recipe.id) && 
                    !usedCategories.has(recipe.category) &&
                    recipe.cookingTime <= 60 // Max 60 min cooking time
                );
                
                if (candidateRecipes.length > 0) {
                    selectedRecipe = candidateRecipes[Math.floor(Math.random() * candidateRecipes.length)];
                }
            }
            
            // If still no recipe, reuse one (avoiding same category as previous day)
            if (!selectedRecipe) {
                const fallbackRecipes = availableRecipes.filter(recipe => 
                    !usedCategories.has(recipe.category)
                );
                
                if (fallbackRecipes.length > 0) {
                    selectedRecipe = fallbackRecipes[Math.floor(Math.random() * fallbackRecipes.length)];
                } else {
                    // Last resort: any recipe
                    selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
                }
            }
            
            // Add to plan
            if (selectedRecipe) {
                plan.push({
                    day: dayOfWeek,
                    type: 'Dinner',
                    recipe: selectedRecipe,
                    isFavorite: isFavorite
                });
                
                usedRecipes.add(selectedRecipe.id);
                usedCategories.add(selectedRecipe.category);
            }
        }
        
        return plan;
    }
    
    /**
     * Get day of week for planning
     */
    getDayOfWeek(offset = 0) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const today = new Date();
        today.setDate(today.getDate() + offset);
        return days[today.getDay()];
    }
    
    /**
     * Export recipes to JSON
     */
    exportRecipes() {
        return JSON.stringify(this.recipes, null, 2);
    }
    
    /**
     * Import recipes from JSON
     */
    importRecipes(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                this.recipes = imported;
                this.saveRecipes();
                return true;
            }
        } catch (e) {
            console.error('Error importing recipes:', e);
        }
        return false;
    }
}

// Create global instance
const recipeManager = new RecipeManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = recipeManager;
}