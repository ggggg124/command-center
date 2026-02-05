/**
 * Recipe Editor - Fixed Version
 * Allows editing of recipe amounts and details
 */

class RecipeEditorFixed {
    constructor(recipeManager) {
        this.recipeManager = recipeManager;
    }
    
    /**
     * Open recipe editor
     */
    openEditor(recipeId) {
        const recipe = this.recipeManager.getRecipeById(recipeId);
        if (!recipe) return;
        
        this.showEditorModal(recipe);
    }
    
    /**
     * Show editor modal
     */
    showEditorModal(recipe) {
        // Create or show modal
        let modal = document.getElementById('recipe-editor-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'recipe-editor-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Edit Recipe</h3>
                            <button id="close-editor" class="p-2 hover:bg-gray-100 rounded-lg">
                                <i data-lucide="x" class="h-5 w-5"></i>
                            </button>
                        </div>
                        
                        <div class="space-y-6 max-h-[70vh] overflow-y-auto">
                            <!-- Recipe Info -->
                            <div>
                                <h4 class="font-semibold mb-2">Recipe Info</h4>
                                <input type="text" id="edit-recipe-name" 
                                       class="w-full p-3 border border-gray-300 rounded-lg mb-3"
                                       placeholder="Recipe name">
                                
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Category</label>
                                        <select id="edit-recipe-category" class="w-full p-3 border border-gray-300 rounded-lg">
                                            <option value="Pasta">Pasta</option>
                                            <option value="Rice">Rice</option>
                                            <option value="Seafood">Seafood</option>
                                            <option value="Chicken">Chicken</option>
                                            <option value="Beef">Beef</option>
                                            <option value="Vegetarian">Vegetarian</option>
                                            <option value="Salad">Salad</option>
                                            <option value="Soup">Soup</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Cooking Time (min)</label>
                                        <input type="number" id="edit-recipe-time" 
                                               class="w-full p-3 border border-gray-300 rounded-lg"
                                               min="5" max="240" step="5">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Ingredients Editor -->
                            <div>
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="font-semibold">Ingredients</h4>
                                    <button id="add-new-ingredient" class="text-sm text-blue-600">
                                        <i data-lucide="plus" class="h-4 w-4 mr-1"></i> Add Ingredient
                                    </button>
                                </div>
                                
                                <div id="ingredients-edit-list" class="space-y-3">
                                    <!-- Ingredients will be added here -->
                                </div>
                            </div>
                            
                            <!-- Instructions Editor -->
                            <div>
                                <h4 class="font-semibold mb-2">Instructions</h4>
                                <textarea id="edit-recipe-instructions" 
                                          class="w-full p-3 border border-gray-300 rounded-lg h-32"
                                          placeholder="Step-by-step instructions..."></textarea>
                            </div>
                            
                            <!-- Actions -->
                            <div class="flex gap-3 pt-4 border-t">
                                <button id="save-edited-recipe" class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">
                                    Save Changes
                                </button>
                                <button id="cancel-edit" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.setupEventListeners();
        }
        
        // Populate form with recipe data
        this.populateEditorForm(recipe);
        
        modal.style.display = 'flex';
    }
    
    /**
     * Populate editor form with recipe data
     */
    populateEditorForm(recipe) {
        // Set basic info
        document.getElementById('edit-recipe-name').value = recipe.name;
        document.getElementById('edit-recipe-category').value = recipe.category;
        document.getElementById('edit-recipe-time').value = recipe.cookingTime;
        document.getElementById('edit-recipe-instructions').value = recipe.instructions || '';
        
        // Populate ingredients
        const container = document.getElementById('ingredients-edit-list');
        container.innerHTML = recipe.ingredients.map((ing, index) => `
            <div class="ingredient-edit-row flex items-center gap-3 p-3 bg-gray-50 rounded-lg" data-index="${index}">
                <div class="flex-1 grid grid-cols-3 gap-2">
                    <input type="text" 
                           class="p-2 border border-gray-300 rounded ingredient-name"
                           value="${ing.name}"
                           placeholder="Name">
                    <input type="number" 
                           class="p-2 border border-gray-300 rounded ingredient-quantity"
                           value="${ing.quantity}"
                           step="0.1"
                           placeholder="Qty">
                    <input type="text" 
                           class="p-2 border border-gray-300 rounded ingredient-unit"
                           value="${ing.unit}"
                           placeholder="Unit">
                </div>
                <button class="remove-ingredient-edit p-2 text-gray-400 hover:text-red-600">
                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
            </div>
        `).join('');
        
        // Add empty row for new ingredients
        container.innerHTML += `
            <div class="ingredient-edit-row flex items-center gap-3 p-3 bg-gray-50 rounded-lg" data-index="new">
                <div class="flex-1 grid grid-cols-3 gap-2">
                    <input type="text" 
                           class="p-2 border border-gray-300 rounded ingredient-name"
                           placeholder="New ingredient">
                    <input type="number" 
                           class="p-2 border border-gray-300 rounded ingredient-quantity"
                           value="1"
                           step="0.1"
                           placeholder="Qty">
                    <input type="text" 
                           class="p-2 border border-gray-300 rounded ingredient-unit"
                           placeholder="Unit">
                </div>
                <button class="remove-ingredient-edit p-2 text-gray-400 hover:text-red-600">
                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
            </div>
        `;
        
        // Refresh icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const modal = document.getElementById('recipe-editor-modal');
        
        // Close modal
        modal.querySelector('#close-editor').addEventListener('click', () => {
            this.hideEditorModal();
        });
        
        modal.querySelector('#cancel-edit').addEventListener('click', () => {
            this.hideEditorModal();
        });
        
        // Add ingredient button
        modal.querySelector('#add-new-ingredient').addEventListener('click', () => {
            this.addIngredientRow();
        });
        
        // Save recipe
        modal.querySelector('#save-edited-recipe').addEventListener('click', () => {
            this.saveRecipe();
        });
        
        // Remove ingredient buttons (delegated)
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.remove-ingredient-edit')) {
                const row = e.target.closest('.ingredient-edit-row');
                if (row && row.dataset.index !== 'new') {
                    row.remove();
                }
            }
        });
    }
    
    /**
     * Add new ingredient row
     */
    addIngredientRow() {
        const container = document.getElementById('ingredients-edit-list');
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-edit-row flex items-center gap-3 p-3 bg-gray-50 rounded-lg';
        newRow.dataset.index = 'new';
        
        newRow.innerHTML = `
            <div class="flex-1 grid grid-cols-3 gap-2">
                <input type="text" 
                       class="p-2 border border-gray-300 rounded ingredient-name"
                       placeholder="New ingredient">
                <input type="number" 
                       class="p-2 border border-gray-300 rounded ingredient-quantity"
                       value="1"
                       step="0.1"
                       placeholder="Qty">
                <input type="text" 
                       class="p-2 border border-gray-300 rounded ingredient-unit"
                       placeholder="Unit">
            </div>
            <button class="remove-ingredient-edit p-2 text-gray-400 hover:text-red-600">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        `;
        
        container.appendChild(newRow);
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Save edited recipe
     */
    saveRecipe() {
        const name = document.getElementById('edit-recipe-name').value.trim();
        const category = document.getElementById('edit-recipe-category').value;
        const cookingTime = parseInt(document.getElementById('edit-recipe-time').value);
        const instructions = document.getElementById('edit-recipe-instructions').value.trim();
        
        if (!name) {
            this.showToast('Please enter recipe name', 'error');
            return;
        }
        
        if (isNaN(cookingTime) || cookingTime < 5) {
            this.showToast('Please enter valid cooking time', 'error');
            return;
        }
        
        // Collect ingredients
        const ingredients = [];
        const ingredientRows = document.querySelectorAll('.ingredient-edit-row');
        
        ingredientRows.forEach(row => {
            const nameInput = row.querySelector('.ingredient-name');
            const qtyInput = row.querySelector('.ingredient-quantity');
            const unitInput = row.querySelector('.ingredient-unit');
            
            const ingName = nameInput.value.trim();
            const ingQty = parseFloat(qtyInput.value);
            const ingUnit = unitInput.value.trim();
            
            if (ingName && !isNaN(ingQty) && ingQty > 0) {
                ingredients.push({
                    name: ingName,
                    quantity: ingQty,
                    unit: ingUnit
                });
            }
        });
        
        if (ingredients.length === 0) {
            this.showToast('Please add at least one ingredient', 'error');
            return;
        }
        
        // Get recipe ID from modal data
        const modal = document.getElementById('recipe-editor-modal');
        const recipeId = modal.dataset.recipeId;
        
        if (!recipeId) {
            this.showToast('Recipe ID not found', 'error');
            return;
        }
        
        // Update recipe
        const updated = this.recipeManager.updateRecipe(recipeId, {
            name,
            category,
            cookingTime,
            ingredients,
            instructions
        });
        
        if (updated) {
            this.showToast('Recipe updated successfully', 'success');
            this.hideEditorModal();
            
            // Trigger refresh
            window.dispatchEvent(new CustomEvent('recipeUpdated'));
        } else {
            this.showToast('Failed to update recipe', 'error');
        }
    }
    
    /**
     * Hide editor modal
     */
    hideEditorModal() {
        const modal = document.getElementById('recipe-editor-modal');
        if (modal) {
            modal.style.display = 'none';
            delete modal.dataset.recipeId;
        }
    }
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Create toast
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Create global instance
let recipeEditor = null;

function initRecipeEditor(recipeManager) {
    recipeEditor = new RecipeEditorFixed(recipeManager);
    return recipeEditor;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RecipeEditorFixed, initRecipeEditor };
}