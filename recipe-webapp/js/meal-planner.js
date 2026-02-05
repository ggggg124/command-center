/**
 * Meal Planner Engine
 * Handles weekly dinner planning with rules and recipe swapping
 */

class MealPlanner {
    constructor(recipeManager) {
        this.recipeManager = recipeManager;
        this.currentPlan = this.loadPlan();
        this.rules = {
            noConsecutivePasta: true,
            skipWeekends: true,
            maxCookingTime: 60,
            diversityDays: 3 // Don't repeat category for 3 days
        };
    }

    loadPlan() {
        try {
            const saved = localStorage.getItem('current_meal_plan');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }

    savePlan() {
        localStorage.setItem('current_meal_plan', JSON.stringify(this.currentPlan));
    }

    /**
     * Generate a new 7-day dinner plan
     */
    generateWeeklyPlan() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const plan = [];
        const recipes = this.recipeManager.getAllRecipes();
        const favorites = this.recipeManager.getAvailableFavorites();
        
        let recentCategories = [];
        let favoritesUsedCount = 0;

        days.forEach((day, index) => {
            // Rule: Skip weekends (Fri/Sat) for takeaway as requested
            if (this.rules.skipWeekends && (day === 'Friday' || day === 'Saturday')) {
                plan.push({
                    day,
                    type: 'Takeaway',
                    recipe: null,
                    note: 'Weekend Freedom'
                });
                return;
            }

            let selectedRecipe = null;
            
            // Try to pick a favorite first (if rules allow)
            if (favorites.length > 0 && favoritesUsedCount < 2) {
                const candidateFavorites = favorites.filter(r => 
                    !recentCategories.includes(r.category) &&
                    r.cookingTime <= this.rules.maxCookingTime
                );
                
                if (candidateFavorites.length > 0) {
                    selectedRecipe = candidateFavorites[Math.floor(Math.random() * candidateFavorites.length)];
                    favoritesUsedCount++;
                }
            }

            // Fallback to general recipes
            if (!selectedRecipe) {
                const candidates = recipes.filter(r => 
                    !recentCategories.includes(r.category) &&
                    r.cookingTime <= this.rules.maxCookingTime
                );
                
                if (candidates.length > 0) {
                    selectedRecipe = candidates[Math.floor(Math.random() * candidates.length)];
                } else {
                    // Total fallback: any recipe not from previous day
                    selectedRecipe = recipes.find(r => !recentCategories.slice(-1).includes(r.category)) || recipes[0];
                }
            }

            plan.push({
                day,
                type: 'Dinner',
                recipe: { ...selectedRecipe },
                isFavorite: selectedRecipe.favorite
            });

            // Update recent categories tracking
            recentCategories.push(selectedRecipe.category);
            if (recentCategories.length > this.rules.diversityDays) {
                recentCategories.shift();
            }
        });

        this.currentPlan = plan;
        this.savePlan();
        return plan;
    }

    /**
     * SWAP FEATURE: Change a recipe if the user doesn't like it
     */
    swapRecipe(dayName) {
        const dayIndex = this.currentPlan.findIndex(d => d.day === dayName);
        if (dayIndex === -1 || this.currentPlan[dayIndex].type === 'Takeaway') return null;

        const currentRecipe = this.currentPlan[dayIndex].recipe;
        const allRecipes = this.recipeManager.getAllRecipes();
        
        // Find recipes not currently in the plan to avoid duplicates this week
        const recipesInPlan = this.currentPlan
            .filter(d => d.recipe)
            .map(d => d.recipe.id);
            
        const options = allRecipes.filter(r => !recipesInPlan.includes(r.id));
        
        // Return options for the UI to show to the user
        return options;
    }

    applySwap(dayName, newRecipeId) {
        const dayIndex = this.currentPlan.findIndex(d => d.day === dayName);
        const newRecipe = this.recipeManager.getRecipeById(newRecipeId);
        
        if (dayIndex !== -1 && newRecipe) {
            this.currentPlan[dayIndex].recipe = { ...newRecipe };
            this.currentPlan[dayIndex].isFavorite = newRecipe.favorite;
            this.savePlan();
            return true;
        }
        return false;
    }

    getShoppingList() {
        if (!this.currentPlan) return [];
        
        const ingredients = [];
        this.currentPlan.forEach(day => {
            if (day.recipe && day.recipe.ingredients) {
                // Get day abbreviation (first 3 letters)
                const dayAbbrev = day.day.substring(0, 3);
                day.recipe.ingredients.forEach(ing => {
                    ingredients.push({
                        ...ing,
                        fromRecipe: day.recipe.name,
                        fromDay: dayAbbrev,
                        fromDayFull: day.day
                    });
                });
            }
        });
        return ingredients;
    }
}

// Global instance
let mealPlanner = null;

function initMealPlanner(recipeManager) {
    mealPlanner = new MealPlanner(recipeManager);
    return mealPlanner;
}
