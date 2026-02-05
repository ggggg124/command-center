/**
 * Shopping List Manager
 * Handles smart categorization and custom item additions
 */

class ShoppingListManager {
    constructor() {
        this.customItems = this.loadCustomItems();
        this.categories = [
            'Fruits & Vegetables',
            'Meat & Seafood', 
            'Dairy & Eggs',
            'Dry Goods',
            'Canned & Jarred',
            'Sauces & Condiments',
            'Baking',
            'Beverages',
            'Frozen',
            'Other',
            'Custom Items' // For manually added items
        ];
    }
    
    /**
     * Load custom items from storage
     */
    loadCustomItems() {
        try {
            const saved = localStorage.getItem('shopping_custom_items');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Save custom items to storage
     */
    saveCustomItems() {
        localStorage.setItem('shopping_custom_items', JSON.stringify(this.customItems));
    }
    
    /**
     * Combine meal plan items with custom items
     */
    combineLists(mealPlanItems, customItems = null) {
        const custom = customItems || this.customItems;
        
        // Start with meal plan items
        const combined = { ...mealPlanItems };
        
        // Add custom items to appropriate categories
        custom.forEach(item => {
            const category = item.category || 'Custom Items';
            
            if (!combined.categorized[category]) {
                combined.categorized[category] = [];
            }
            
            // Check if item already exists in this category
            const existingIndex = combined.categorized[category].findIndex(
                existing => existing.name.toLowerCase() === item.name.toLowerCase() && 
                           existing.unit === item.unit
            );
            
            if (existingIndex >= 0) {
                // Merge quantities
                combined.categorized[category][existingIndex].quantity += item.quantity;
                combined.categorized[category][existingIndex].isCustom = true;
            } else {
                // Add new item
                combined.categorized[category].push({
                    ...item,
                    isCustom: true,
                    checked: item.checked || false
                });
            }
        });
        
        // Update total items count
        combined.totalItems = Object.values(combined.categorized)
            .reduce((total, category) => total + category.length, 0);
        
        return combined;
    }
    
    /**
     * Add custom item to shopping list
     */
    addCustomItem(name, quantity = 1, unit = '', category = null) {
        const item = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            quantity: quantity,
            unit: unit.trim(),
            category: category || this.autoCategorize(name),
            isCustom: true,
            checked: false,
            addedDate: new Date().toISOString()
        };
        
        this.customItems.push(item);
        this.saveCustomItems();
        
        return item;
    }
    
    /**
     * Auto-categorize custom item
     */
    autoCategorize(itemName) {
        const name = itemName.toLowerCase();
        
        // Use similar logic to recipe categorization
        if (name.match(/(apple|banana|orange|tomato|potato|onion|garlic|carrot|lettuce|spinach|broccoli)/)) {
            return 'Fruits & Vegetables';
        }
        
        if (name.match(/(beef|chicken|pork|fish|meat|mince|steak|bacon|sausage)/)) {
            return 'Meat & Seafood';
        }
        
        if (name.match(/(milk|cheese|butter|cream|yogurt|egg)/)) {
            return 'Dairy & Eggs';
        }
        
        if (name.match(/(bread|pasta|rice|flour|sugar|salt|pepper)/)) {
            return 'Dry Goods';
        }
        
        if (name.match(/(canned|tin|jar|sauce|ketchup|mayonnaise)/)) {
            return 'Canned & Jarred';
        }
        
        return 'Custom Items';
    }
    
    /**
     * Get meal abbreviation from recipe name
     */
    getMealAbbreviation(recipeName) {
        if (!recipeName) return '';
        
        // Common meal name abbreviations
        const abbreviations = {
            'spaghetti': 'SPG',
            'bolognese': 'BOL',
            'chicken': 'CHK',
            'stir fry': 'STF',
            'salmon': 'SLM',
            'curry': 'CRY',
            'tacos': 'TAC',
            'salad': 'SLD',
            'soup': 'SUP',
            'pasta': 'PST',
            'beef': 'BEF',
            'pork': 'PRK',
            'fish': 'FSH',
            'vegetable': 'VEG',
            'rice': 'RCE'
        };
        
        const name = recipeName.toLowerCase();
        
        // Check for exact matches first
        for (const [key, abbr] of Object.entries(abbreviations)) {
            if (name.includes(key)) {
                return abbr;
            }
        }
        
        // Fallback: first 3 letters of first word
        const firstWord = recipeName.split(' ')[0];
        return firstWord.substring(0, 3).toUpperCase();
    }
    
    /**
     * Remove custom item
     */
    removeCustomItem(itemId) {
        const index = this.customItems.findIndex(item => item.id === itemId);
        if (index >= 0) {
            this.customItems.splice(index, 1);
            this.saveCustomItems();
            return true;
        }
        return false;
    }
    
    /**
     * Update custom item
     */
    updateCustomItem(itemId, updates) {
        const index = this.customItems.findIndex(item => item.id === itemId);
        if (index >= 0) {
            this.customItems[index] = { ...this.customItems[index], ...updates };
            this.saveCustomItems();
            return this.customItems[index];
        }
        return null;
    }
    
    /**
     * Toggle item checked state
     */
    toggleItemChecked(itemId, isCustom = false) {
        if (isCustom) {
            const item = this.customItems.find(item => item.id === itemId);
            if (item) {
                item.checked = !item.checked;
                this.saveCustomItems();
                return item.checked;
            }
        }
        return false;
    }
    
    /**
     * Clear all checked items
     */
    clearCheckedItems() {
        // Clear checked custom items
        this.customItems = this.customItems.filter(item => !item.checked);
        this.saveCustomItems();
        
        return this.customItems.length;
    }
    
    /**
     * Get shopping list statistics
     */
    getListStats(combinedList) {
        const stats = {
            totalItems: combinedList.totalItems || 0,
            byCategory: {},
            customItems: this.customItems.length,
            checkedItems: 0,
            uncheckedItems: 0
        };
        
        // Count by category
        Object.entries(combinedList.categorized || {}).forEach(([category, items]) => {
            stats.byCategory[category] = items.length;
            
            items.forEach(item => {
                if (item.checked) {
                    stats.checkedItems++;
                } else {
                    stats.uncheckedItems++;
                }
            });
        });
        
        return stats;
    }
    
    /**
     * Create shopping list UI
     */
    createShoppingListUI(combinedList) {
        const container = document.createElement('div');
        container.className = 'shopping-list-container';
        
        // Stats header
        const stats = this.getListStats(combinedList);
        container.innerHTML = `
            <div class="shopping-stats bg-gray-50 p-4 rounded-xl mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-lg">Shopping List</h3>
                        <p class="text-gray-600 text-sm">${stats.totalItems} items • ${stats.customItems} custom</p>
                    </div>
                    <button id="add-custom-item" class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <i data-lucide="plus"></i> Add Item
                    </button>
                </div>
                
                <div class="flex gap-4 mt-4 text-sm">
                    <div class="text-green-600">
                        <i data-lucide="check-circle" class="inline h-4 w-4 mr-1"></i>
                        ${stats.checkedItems} checked
                    </div>
                    <div class="text-blue-600">
                        <i data-lucide="circle" class="inline h-4 w-4 mr-1"></i>
                        ${stats.uncheckedItems} to buy
                    </div>
                </div>
            </div>
            
            <!-- Categories will be inserted here -->
            <div id="shopping-categories"></div>
            
            <!-- Add Item Modal (hidden) -->
            <div id="add-item-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-md p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold">Add Custom Item</h3>
                        <button id="close-modal" class="p-2 hover:bg-gray-100 rounded-lg">
                            <i data-lucide="x" class="h-5 w-5"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Item Name</label>
                            <input type="text" id="item-name" 
                                   class="w-full p-3 border border-gray-300 rounded-lg"
                                   placeholder="e.g., Milk, Bread, Coffee">
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Quantity</label>
                                <input type="number" id="item-quantity" 
                                       class="w-full p-3 border border-gray-300 rounded-lg"
                                       value="1" step="0.1">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Unit</label>
                                <input type="text" id="item-unit" 
                                       class="w-full p-3 border border-gray-300 rounded-lg"
                                       placeholder="e.g., L, g, pieces">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Category</label>
                            <select id="item-category" class="w-full p-3 border border-gray-300 rounded-lg">
                                ${this.categories.map(cat => 
                                    `<option value="${cat}">${cat}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="flex gap-3 pt-4">
                            <button id="save-item" class="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold">
                                Add to List
                            </button>
                            <button id="cancel-add" class="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add categories
        this.renderCategories(container.querySelector('#shopping-categories'), combinedList);
        
        // Setup event listeners
        this.setupEventListeners(container);
        
        return container;
    }
    
    /**
     * Render categorized items - Apple Style
     */
    renderCategories(container, combinedList) {
        if (!container) return;
        
        let html = '';
        
        // Show categories in order
        this.categories.forEach(category => {
            const items = combinedList.categorized?.[category];
            if (!items || items.length === 0) return;
            
            const checkedCount = items.filter(item => item.checked).length;
            
            html += `
                <div class="category-section">
                    <div class="category-header" data-category="${category}" data-expanded="true">
                        <h4>
                            <i data-lucide="${this.getCategoryIcon(category)}" class="h-5 w-5"></i>
                            ${category}
                        </h4>
                        <div class="category-count">
                            ${checkedCount}/${items.length}
                        </div>
                    </div>
                    
                    <div class="shopping-items-container">
                        ${items.map(item => `
                            <div class="shopping-item ${item.checked ? 'checked' : ''}" 
                                 data-id="${item.id || ''}" 
                                 data-custom="${item.isCustom || false}">
                                <div class="shopping-item-checkbox ${item.checked ? 'checked' : ''}"></div>
                                
                                <div class="item-content">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-details">
                                        <span class="item-quantity">${item.quantity}</span>
                                        <span class="item-unit">${item.unit}</span>
                                        ${item.fromRecipe ? `<span class="item-meal">${this.getMealAbbreviation(item.fromRecipe)}</span>` : ''}
                                        ${item.isCustom ? '<span class="item-source">Custom</span>' : ''}
                                    </div>
                                </div>
                                
                                ${item.isCustom ? `
                                    <button class="remove-item">
                                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || `
            <div class="empty-state text-center py-12">
                <i data-lucide="shopping-cart" class="h-12 w-12 mx-auto mb-4 text-gray-300"></i>
                <p class="text-gray-500">No items in shopping list</p>
                <p class="text-gray-400 text-sm mt-2">Add items from meal plans or manually</p>
            </div>
        `;
        
        // Add category toggle functionality
        this.setupCategoryToggles();
        
        // Refresh icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Get icon for category
     */
    getCategoryIcon(category) {
        const icons = {
            'Fruits & Vegetables': 'carrot',
            'Meat & Seafood': 'drumstick',
            'Dairy & Eggs': 'milk',
            'Dry Goods': 'wheat',
            'Canned & Jarred': 'package',
            'Sauces & Condiments': 'flask-conical',
            'Baking': 'cake',
            'Beverages': 'coffee',
            'Frozen': 'snowflake',
            'Other': 'package',
            'Custom Items': 'plus-circle'
        };
        
        return icons[category] || 'package';
    }
    
    /**
     * Setup category toggle functionality
     */
    setupCategoryToggles() {
        const headers = document.querySelectorAll('.category-header');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const container = header.nextElementSibling;
                const isExpanded = header.dataset.expanded === 'true';
                
                if (isExpanded) {
                    container.style.display = 'none';
                    header.dataset.expanded = 'false';
                } else {
                    container.style.display = 'block';
                    header.dataset.expanded = 'true';
                }
            });
        });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners(container) {
        // Add item button
        container.querySelector('#add-custom-item')?.addEventListener('click', () => {
            this.showAddItemModal();
        });
        
        // Checkbox toggles
        container.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.shopping-item')) {
                const itemElement = e.target.closest('.shopping-item');
                const itemId = itemElement.dataset.id;
                const isCustom = itemElement.dataset.custom === 'true';
                
                this.toggleItemChecked(itemId, isCustom);
                
                // Update UI
                if (e.target.checked) {
                    itemElement.classList.add('item-checked');
                } else {
                    itemElement.classList.remove('item-checked');
                }
            }
        });
        
        // Remove item buttons
        container.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item')) {
                const itemElement = e.target.closest('.shopping-item');
                const itemId = itemElement.dataset.id;
                
                if (this.removeCustomItem(itemId)) {
                    itemElement.remove();
                    this.showToast('Item removed', 'success');
                }
            }
        });
        
        // Modal events
        this.setupModalEvents();
    }
    
    /**
     * Setup modal event listeners
     */
    setupModalEvents() {
        // These will be attached when modal is shown
        document.addEventListener('click', (e) => {
            // Close modal
            if (e.target.id === 'close-modal' || e.target.id === 'cancel-add') {
                this.hideAddItemModal();
            }
            
            // Save item
            if (e.target.id === 'save-item') {
                this.saveNewItem();
            }
        });
    }
    
    /**
     * Show add item modal
     */
    showAddItemModal() {
        const modal = document.getElementById('add-item-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Reset form
            modal.querySelector('#item-name').value = '';
            modal.querySelector('#item-quantity').value = '1';
            modal.querySelector('#item-unit').value = '';
            modal.querySelector('#item-category').value = 'Custom Items';
            
            // Focus on name field
            setTimeout(() => {
                modal.querySelector('#item-name').focus();
            }, 100);
        }
    }
    
    /**
     * Hide add item modal
     */
    hideAddItemModal() {
        const modal = document.getElementById('add-item-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
    
    /**
     * Save new custom item
     */
    saveNewItem() {
        const modal = document.getElementById('add-item-modal');
        if (!modal) return;
        
        const name = modal.querySelector('#item-name').value.trim();
        const quantity = parseFloat(modal.querySelector('#item-quantity').value);
        const unit = modal.querySelector('#item-unit').value.trim();
        const category = modal.querySelector('#item-category').value;
        
        if (!name) {
            this.showToast('Please enter item name', 'error');
            return;
        }
        
        if (isNaN(quantity) || quantity <= 0) {
            this.showToast('Please enter valid quantity', 'error');
            return;
        }
        
        // Add item
        const item = this.addCustomItem(name, quantity, unit, category);
        
        // Hide modal
        this.hideAddItemModal();
        
        // Show success message
        this.showToast(`Added "${name}" to shopping list`, 'success');
        
        // Refresh shopping list UI
        window.dispatchEvent(new CustomEvent('shoppingListUpdated'));
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
const shoppingListManager = new ShoppingListManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = shoppingListManager;
}