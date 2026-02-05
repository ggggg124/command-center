/**
 * Core Logic Module
 * Handles Metric Conversion and Meal Planning Rules
 */

const AppLogic = {
    // 1. STRICT METRIC CONVERSION
    conversions: {
        'cup': 250, 'cups': 250,
        'tbsp': 15, 'tablespoon': 15, 'tablespoons': 15,
        'tsp': 5, 'teaspoon': 5, 'teaspoons': 5,
        'lb': 454, 'pound': 454, 'pounds': 454,
        'oz': 28, 'ounce': 28, 'ounces': 28,
        'fl oz': 30, 'pint': 473, 'quart': 946
    },

    convertToMetric: function(ingredients) {
        return ingredients.map(ing => {
            const unit = ing.unit.toLowerCase();
            if (this.conversions[unit]) {
                const mlOrG = ing.quantity * this.conversions[unit];
                // Use 'g' for dry, 'ml' for liquid (heuristic)
                const newUnit = ['cup', 'tbsp', 'tsp', 'pint'].includes(unit) ? 'ml' : 'g';
                
                return {
                    ...ing,
                    quantity: Math.round(mlOrG),
                    unit: newUnit,
                    original: `${ing.quantity} ${ing.unit}`
                };
            }
            return ing;
        });
    },

    // 2. MEAL PLANNING RULES (Dinner only)
    generatePlan: function(recipes, skipWeekends = true) {
        const plan = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let lastWasPasta = false;

        days.forEach(day => {
            // Rule: Skip weekends for takeaway/out
            if (skipWeekends && (day === 'Friday' || day === 'Saturday')) {
                plan.push({ day, type: 'Takeaway/Out', recipe: null });
                lastWasPasta = false;
                return;
            }

            // Rule: Filter for Dinner meals and respect Pasta rule
            let suitable = recipes.filter(r => {
                const isPasta = r.tags?.includes('pasta') || r.name.toLowerCase().includes('pasta');
                if (lastWasPasta && isPasta) return false;
                return true;
            });

            if (suitable.length === 0) suitable = recipes; // Fallback

            const selected = suitable[Math.floor(Math.random() * suitable.length)];
            const isSelectedPasta = selected.tags?.includes('pasta') || selected.name.toLowerCase().includes('pasta');
            
            plan.push({ day, type: 'Dinner', recipe: selected });
            lastWasPasta = isSelectedPasta;
        });

        return plan;
    },

    // 3. FRIDGE SUGGESTIONS (The "I have this, what can I make?" button)
    suggestFromFridge: function(recipes, inventory) {
        const availableNames = inventory.map(i => i.name.toLowerCase());
        
        return recipes.map(recipe => {
            const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
            const matches = recipeIngredients.filter(ing => 
                availableNames.some(avail => avail.includes(ing) || ing.includes(avail))
            );
            
            return {
                ...recipe,
                matchCount: matches.length,
                matchPercent: (matches.length / recipeIngredients.length) * 100,
                missing: recipeIngredients.filter(ing => !matches.includes(ing))
            };
        }).sort((a, b) => b.matchPercent - a.matchPercent);
    },

    // 4. SMART GROCERY LIST (Smart categorization)
    generateGroceries: function(plan) {
        const items = {};
        
        // Aggregate ingredients from meal plan
        plan.forEach(day => {
            if (day.recipe) {
                day.recipe.ingredients.forEach(ing => {
                    const key = `${ing.name}|${ing.unit}`;
                    if (items[key]) {
                        items[key].quantity += ing.quantity;
                    } else {
                        items[key] = {
                            name: ing.name,
                            quantity: ing.quantity,
                            unit: ing.unit || '',
                            category: this.categorizeItem(ing.name),
                            checked: false,
                            fromRecipe: true
                        };
                    }
                });
            }
        });
        
        // Convert to categorized object
        const categorized = {};
        Object.values(items).forEach(item => {
            if (!categorized[item.category]) {
                categorized[item.category] = [];
            }
            categorized[item.category].push(item);
        });
        
        return {
            items: Object.values(items),
            categorized: categorized,
            totalItems: Object.keys(items).length
        };
    },
    
    // 5. ITEM CATEGORIZATION (Smart, not supermarket aisles)
    categorizeItem: function(itemName) {
        const name = itemName.toLowerCase();
        
        // Fruits & Vegetables
        if (name.match(/(apple|banana|orange|lemon|lime|grape|berry|melon|pineapple|mango|avocado|tomato|potato|onion|garlic|carrot|lettuce|spinach|broccoli|cauliflower|capsicum|zucchini|cucumber|celery|mushroom|herb|basil|parsley|coriander|mint|ginger)/)) {
            return 'Fruits & Vegetables';
        }
        
        // Meat & Seafood
        if (name.match(/(beef|chicken|pork|lamb|turkey|duck|fish|salmon|tuna|prawn|shrimp|crab|lobster|meat|mince|steak|bacon|sausage|ham|prosciutto)/)) {
            return 'Meat & Seafood';
        }
        
        // Dairy & Eggs
        if (name.match(/(milk|cheese|butter|cream|yogurt|yoghurt|parmesan|cheddar|mozzarella|feta|brie|camembert|ricotta|egg)/)) {
            return 'Dairy & Eggs';
        }
        
        // Dry Goods
        if (name.match(/(flour|sugar|salt|pepper|spice|herb dried|pasta|rice|noodle|bean|lentil|chickpea|oat|quinoa|couscous|breadcrumb|cereal|muesli)/)) {
            return 'Dry Goods';
        }
        
        // Canned & Jarred
        if (name.match(/(canned|tin|jar|passata|tomato paste|beans canned|tuna canned|corn canned|peas canned|olive|pickle|relish|sauce bottled|jam|honey|syrup)/)) {
            return 'Canned & Jarred';
        }
        
        // Sauces & Condiments
        if (name.match(/(soy sauce|worcestershire|oyster sauce|fish sauce|vinegar|oil|olive oil|ketchup|mayonnaise|mustard|bbq sauce|hot sauce|chilli sauce|dressing)/)) {
            return 'Sauces & Condiments';
        }
        
        // Baking
        if (name.match(/(baking powder|baking soda|yeast|vanilla|cocoa|chocolate|chips|nuts|almond|walnut|pecan|hazelnut|seed|sesame|chia|flax)/)) {
            return 'Baking';
        }
        
        // Beverages
        if (name.match(/(water|juice|soda|soft drink|beer|wine|spirit|coffee|tea|milk alternative)/)) {
            return 'Beverages';
        }
        
        // Frozen
        if (name.match(/(frozen|ice cream|peas frozen|berries frozen|vegetable mix frozen)/)) {
            return 'Frozen';
        }
        
        // Default category
        return 'Other';
    },
    
    // 5. DIRECT INGREDIENT EDITING
    // Just edit the numbers directly in the form
    // No automatic adjustments - manual editing only;
