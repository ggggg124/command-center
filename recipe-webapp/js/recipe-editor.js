/**
 * Recipe Editor Module
 * Allows manual editing of ingredient quantities
 */

class RecipeEditor {
    constructor() {
        this.currentRecipe = null;
        this.originalRecipe = null;
    }
    
    /**
     * Open recipe editor
     */
    openEditor(recipe) {
        this.currentRecipe = { ...recipe };
        this.originalRecipe = { ...recipe };
        
        this.showEditorModal();
        this.populateEditorForm();
    }
    
    /**
     * Show editor modal
     */
    showEditorModal() {
        // Create or show modal
        let modal = document.getElementById('recipe-editor-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'recipe-editor-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Edit Recipe</h3>
                            <button id="close-editor" class="p-2 hover:bg-gray-100 rounded-lg">
                                <i data-lucide="x" class="h-5 w-5"></i>
                            </button>
                        </div>
                        
                        <div class="space-y-6">
                            <!-- Recipe Info -->
                            <div>
                                <h4 class="font-semibold mb-2">Recipe Info</h4>
                                <input type="text" id="recipe-name" 
                                       class="w-full p-3 border border-gray-300 rounded-lg"
                                       placeholder="Recipe name">
                            </div>
                            
                            <!-- Simple Editing Note -->
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="flex items-center gap-2 text-gray-700">
                                    <i data-lucide="edit" class="h-5 w-5"></i>
                                    <p class="text-sm">Edit ingredient amounts directly. Change 500g to 800g, etc.</p>
                                </div>
                            </div>
                            
                            <!-- Ingredients Editor -->
                            <div>
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="font-semibold">Ingredients</h4>
                                    <button id="add-ingredient" class="text-sm text-blue-600">
                                        <i data-lucide="plus" class="h-4 w-4 mr-1"></i> Add
                                    </button>
                                </div>
                                
                                <div id="ingredients-editor" class="space-y-3">
                                    <!-- Ingredients will be added here -->
                                </div>
                            </div>
                            
                            <!-- Actions -->
                            <div class="flex gap-3 pt-4 border-t">
                                <button id="save-recipe" class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">
                                    Save Changes
                                </button>
                                <button id="save-as-new" class="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold">
                                    Save as New
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
        
        modal.style.display = 'flex';
    }
    
    /**
     * Populate editor form with recipe data
     */
    populateEditorForm() {
        if (!this.currentRecipe) return;
        
        // Set recipe name
        const nameInput = document.getElementById('recipe-name');
        if (nameInput) {
            nameInput.value = this.currentRecipe.name;
        }
        
        // Populate ingredients
        const container = document.getElementById('ingredients-editor');
        if (container && this.currentRecipe.ingredients) {
            container.innerHTML = this.currentRecipe.ingredients.map((ing, index) => `
                <div class="ingredient-row flex items-center gap-3 p-3 bg-gray-50 rounded-lg" data-index="${index}">
                    <div class="flex-1">
                        <input type="text" 
                               class="w-full p-2 border border-gray-300 rounded mb-2"
                               value="${ing.name}"
                               placeholder="Ingredient name">
                        <div class="flex gap-2">
                            <input type="number" 
                                   class="flex-1 p-2 border border-gray-300 rounded"
                                   value="${ing.quantity}"
                                   step="0.1"
                                   placeholder="Quantity">
                            <input type="text" 
                                   class="flex-1 p-2 border border-gray-300 rounded"
                                   value="${ing.unit || ''}"
                                   placeholder="Unit (g, ml, etc.)">
                        </div>
                    </div>
                    <button class="remove-ingredient p-2 text-gray-400 hover:text-red-600">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            `).join('');
            
            // Refresh icons
            if (window.lucide) {
                lucide.createIcons();
            }
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const modal = document.getElementById('recipe-editor-modal');
        if (!modal) return;
        
        // Close button
        modal.querySelector('#close-editor')?.addEventListener('click', () => {
            this.closeEditor();
        });
        
        // Cancel button
        modal.querySelector('#cancel-edit')?.addEventListener('click', () => {
            this.closeEditor();
        });
        
        // Save button
        modal.querySelector('#save-recipe')?.addEventListener('click', () => {
            this.saveRecipe(false);
        });
        
        // Save as new button
        modal.querySelector('#save-as-new')?.addEventListener('click', () => {
            this.saveRecipe(true);
        });
        
        // Quick adjustment buttons
        modal.querySelectorAll('[data-adjust]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const adjustment = e.target.dataset.adjust;
                this.applyQuickAdjustment(adjustment);
            });
        });
        
        // Add ingredient button
        modal.querySelector('#add-ingredient')?.addEventListener('click', () => {
            this.addIngredientRow();
        });
        
        // Remove ingredient buttons (delegated)
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.remove-ingredient')) {
                const row = e.target.closest('.ingredient-row');
                if (row) {
                    row.remove();
                }
            }
        });
        
        // Update recipe on input changes
        modal.addEventListener('input', (e) => {
            this.updateRecipeFromForm();
        });
    }
    
    /**
     * Apply quick adjustment (simplified - just reset)
     */
    applyQuickAdjustment(adjustment) {
        if (!this.currentRecipe) return;
        
        if (adjustment === 'reset') {
            this.resetToOriginal();
            this.populateEditorForm();
        }
    }
    
    /**
     * Reset to original recipe
     */
    resetToOriginal() {
        if (this.originalRecipe) {
            this.currentRecipe = { ...this.originalRecipe };
        }
    }
    
    /**
     * Add new ingredient row
     */
    addIngredientRow() {
        const container = document.getElementById('ingredients-editor');
        if (!container) return;
        
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row flex items-center gap-3 p-3 bg-gray-50 rounded-lg';
        newRow.innerHTML = `
            <div class="flex-1">
                <input type="text" 
                       class="w-full p-2 border border-gray-300 rounded mb-2"
                       placeholder="Ingredient name">
                <div class="flex gap-2">
                    <input type="number" 
                           class="flex-1 p-2 border border-gray-300 rounded"
                           value="1"
                           step="0.1"
                           placeholder="Quantity">
                    <input type="text" 
                           class="flex-1 p-2 border border-gray-300 rounded"
                           placeholder="Unit (g, ml, etc.)">
                </div>
            </div>
            <button class="remove-ingredient p-2 text-gray-400 hover:text-red-600">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        `;
        
        container.appendChild(newRow);
        
        // Refresh icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Update recipe from form inputs
     */
    updateRecipeFromForm() {
        if (!this.currentRecipe) return;
        
        // Update name
        const nameInput = document.getElementById('recipe-name');
        if (nameInput) {
            this.currentRecipe.name = nameInput.value;
        }
        
        // Update ingredients
        const container = document.getElementById('ingredients-editor');
        if (container) {
            const rows = container.querySelectorAll('.ingredient-row');
            this.currentRecipe.ingredients = Array.from(rows).map(row => {
                const nameInput = row.querySelector('input[type="text"]:first-of-type');
                const quantityInput = row.querySelector('input[type="number"]');
                const unitInput = row.querySelector('input[type="text"]:last-of-type');
                
                return {
                    name: nameInput?.value || '',
                    quantity: parseFloat(quantityInput?.value) || 0,
                    unit: unitInput?.value || ''
                };
            }).filter(ing => ing.name.trim() !== '');
        }
    }
    
    /**
     * Save recipe changes
     */
    async saveRecipe(saveAsNew = false) {
        this.updateRecipeFromForm();
        
        if (!this.currentRecipe) {
            this.showMessage('No recipe to save', 'error');
            return;
        }
        
        if (!this.currentRecipe.name || this.currentRecipe.name.trim() === '') {
            this.showMessage('Please enter a recipe name', 'error');
            return;
        }
        
        if (!this.currentRecipe.ingredients || this.currentRecipe.ingredients.length === 0) {
            this.showMessage('Please add at least one ingredient', 'error');
            return;
        }
        
        try {
            // Generate new ID if saving as new
            if (saveAsNew) {
                this.currentRecipe.id = Date.now().toString();
                this.currentRecipe.created = new Date().toISOString();
            }
            
            // Save to server
            const response = await fetch('/api/save-recipe.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.currentRecipe)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Recipe saved successfully!', 'success');
                this.closeEditor();
                
                // Trigger recipe update event
                window.dispatchEvent(new CustomEvent('recipeUpdated', {
                    detail: { recipe: this.currentRecipe, isNew: saveAsNew }
                }));
            } else {
                this.showMessage('Error saving recipe: ' + (result.error || 'Unknown error'), 'error');
            }
            
        } catch (error) {
            console.error('Save error:', error);
            this.showMessage('Error saving recipe: ' + error.message, 'error');
        }
    }
    
    /**
     * Close editor
     */
    closeEditor() {
        const modal = document.getElementById('recipe-editor-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        this.currentRecipe = null;
        this.originalRecipe = null;
    }
    
    /**
     * Show message
     */
    showMessage(message, type = 'info') {
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
    
    /**
     * Add edit button to recipe cards
     */
    addEditButtonToRecipe(recipeElement, recipeData) {
        const editBtn = document.createElement('button');
        editBtn.className = 'absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white';
        editBtn.innerHTML = '<i data-lucide="edit-2" class="h-4 w-4"></i>';
        editBtn.title = 'Edit recipe';
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditor(recipeData);
        });
        
        recipeElement.style.position = 'relative';
        recipeElement.appendChild(editBtn);
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Create global instance
const recipeEditor = new RecipeEditor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = recipeEditor;
}