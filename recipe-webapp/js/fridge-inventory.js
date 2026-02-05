/**
 * Fridge Inventory Module
 * Integrates with Samsung fridge camera for automatic inventory tracking
 */

class FridgeInventory {
    constructor() {
        this.inventory = this.loadInventory();
        this.categories = {
            'produce': ['apple', 'banana', 'carrot', 'lettuce', 'tomato', 'onion', 'garlic', 'potato'],
            'dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'eggs'],
            'meat': ['chicken', 'beef', 'pork', 'fish', 'bacon', 'sausage'],
            'condiments': ['ketchup', 'mayo', 'soy sauce', 'olive oil', 'vinegar'],
            'beverages': ['water', 'juice', 'soda', 'beer', 'wine'],
            'leftovers': ['container', 'tupperware', 'plate']
        };
    }
    
    /**
     * Load inventory from server
     */
    loadInventory() {
        try {
            const saved = localStorage.getItem('fridge_inventory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading inventory:', e);
            return [];
        }
    }
    
    /**
     * Save inventory to server
     */
    saveInventory() {
        localStorage.setItem('fridge_inventory', JSON.stringify(this.inventory));
        // Also sync to server if backend available
        this.syncToServer();
    }
    
    /**
     * Sync inventory to server
     */
    async syncToServer() {
        try {
            const response = await fetch('/api/save-inventory.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.inventory)
            });
            return await response.json();
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    /**
     * Process fridge photo (manual upload)
     * @param {File} photo - Fridge photo file
     */
    async processFridgePhoto(photo) {
        // Show loading state
        this.showLoading(true);
        
        try {
            // In production: Send to server for AI processing
            // For now, simulate processing
            const items = await this.simulatePhotoAnalysis(photo);
            
            // Update inventory
            this.updateInventoryFromPhoto(items);
            
            // Save changes
            this.saveInventory();
            
            // Update UI
            this.updateInventoryDisplay();
            
            // Suggest recipes based on new inventory
            this.suggestRecipes();
            
            return { success: true, itemsFound: items.length };
            
        } catch (error) {
            console.error('Photo processing error:', error);
            return { success: false, error: error.message };
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Simulate AI photo analysis
     * In production, this would call an AI service
     */
    async simulatePhotoAnalysis(photo) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock detected items (would be AI results)
        const mockItems = [
            { name: 'milk', quantity: 1, unit: 'L', confidence: 0.95, category: 'dairy' },
            { name: 'eggs', quantity: 6, unit: 'pieces', confidence: 0.92, category: 'dairy' },
            { name: 'chicken breast', quantity: 2, unit: 'pieces', confidence: 0.88, category: 'meat' },
            { name: 'carrots', quantity: 3, unit: 'pieces', confidence: 0.85, category: 'produce' },
            { name: 'lettuce', quantity: 1, unit: 'head', confidence: 0.82, category: 'produce' },
            { name: 'tomatoes', quantity: 4, unit: 'pieces', confidence: 0.80, category: 'produce' }
        ];
        
        return mockItems;
    }
    
    /**
     * Update inventory from photo analysis results
     */
    updateInventoryFromPhoto(detectedItems) {
        detectedItems.forEach(item => {
            // Find existing item or add new
            const existingIndex = this.inventory.findIndex(
                inv => inv.name === item.name && inv.unit === item.unit
            );
            
            if (existingIndex >= 0) {
                // Update existing item
                this.inventory[existingIndex] = {
                    ...this.inventory[existingIndex],
                    quantity: item.quantity,
                    lastSeen: new Date().toISOString(),
                    confidence: item.confidence
                };
            } else {
                // Add new item
                this.inventory.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category || this.categorizeItem(item.name),
                    addedDate: new Date().toISOString(),
                    lastSeen: new Date().toISOString(),
                    confidence: item.confidence,
                    estimatedExpiry: this.estimateExpiry(item.name)
                });
            }
        });
        
        // Remove items not seen in photo (optional)
        // this.cleanOldItems();
    }
    
    /**
     * Categorize item based on name
     */
    categorizeItem(itemName) {
        const name = itemName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }
        
        return 'other';
    }
    
    /**
     * Estimate expiry date for item
     */
    estimateExpiry(itemName) {
        const name = itemName.toLowerCase();
        const today = new Date();
        
        // Simple expiry estimation
        if (name.includes('milk')) {
            today.setDate(today.getDate() + 7); // Milk: 7 days
        } else if (name.includes('chicken') || name.includes('meat')) {
            today.setDate(today.getDate() + 3); // Meat: 3 days
        } else if (name.includes('lettuce') || name.includes('spinach')) {
            today.setDate(today.getDate() + 5); // Leafy greens: 5 days
        } else if (name.includes('carrot') || name.includes('potato')) {
            today.setDate(today.getDate() + 14); // Root veg: 14 days
        } else if (name.includes('egg')) {
            today.setDate(today.getDate() + 30); // Eggs: 30 days
        } else {
            today.setDate(today.getDate() + 10); // Default: 10 days
        }
        
        return today.toISOString();
    }
    
    /**
     * Suggest recipes based on current inventory
     */
    suggestRecipes() {
        // Get available ingredients
        const availableItems = this.inventory.map(item => item.name.toLowerCase());
        
        // In production: Query recipe database for matches
        // For now, return mock suggestions
        const suggestions = [
            {
                name: 'Chicken Stir Fry',
                matchScore: 0.85,
                missingItems: ['soy sauce', 'ginger'],
                useItems: ['chicken', 'carrots', 'lettuce']
            },
            {
                name: 'Omelette',
                matchScore: 0.90,
                missingItems: ['butter'],
                useItems: ['eggs', 'tomatoes']
            }
        ];
        
        // Update UI with suggestions
        this.displayRecipeSuggestions(suggestions);
        
        return suggestions;
    }
    
    /**
     * Generate grocery list based on meal plan and inventory
     */
    generateSmartGroceryList(mealPlan) {
        const neededItems = {};
        
        // Aggregate ingredients from meal plan
        mealPlan.forEach(day => {
            if (day.recipe && day.recipe.ingredients) {
                day.recipe.ingredients.forEach(ingredient => {
                    const key = `${ingredient.name}|${ingredient.unit}`;
                    neededItems[key] = (neededItems[key] || 0) + ingredient.quantity;
                });
            }
        });
        
        // Subtract what's already in inventory
        this.inventory.forEach(item => {
            const key = `${item.name}|${item.unit}`;
            if (neededItems[key]) {
                neededItems[key] = Math.max(0, neededItems[key] - item.quantity);
                if (neededItems[key] === 0) {
                    delete neededItems[key];
                }
            }
        });
        
        // Convert to array
        const groceryList = Object.entries(neededItems).map(([key, quantity]) => {
            const [name, unit] = key.split('|');
            return { name, quantity, unit };
        });
        
        return groceryList;
    }
    
    /**
     * Check for items expiring soon
     */
    getExpiringItems(daysThreshold = 3) {
        const today = new Date();
        const thresholdDate = new Date(today);
        thresholdDate.setDate(today.getDate() + daysThreshold);
        
        return this.inventory.filter(item => {
            if (!item.estimatedExpiry) return false;
            const expiryDate = new Date(item.estimatedExpiry);
            return expiryDate <= thresholdDate;
        });
    }
    
    /**
     * Update inventory display in UI
     */
    updateInventoryDisplay() {
        const container = document.getElementById('inventory-container');
        if (!container) return;
        
        // Group by category
        const byCategory = {};
        this.inventory.forEach(item => {
            const category = item.category || 'other';
            if (!byCategory[category]) {
                byCategory[category] = [];
            }
            byCategory[category].push(item);
        });
        
        // Generate HTML
        let html = '';
        
        for (const [category, items] of Object.entries(byCategory)) {
            html += `
                <div class="category-section">
                    <h3 class="category-title">${category.toUpperCase()}</h3>
                    <div class="items-grid">
                        ${items.map(item => `
                            <div class="inventory-item">
                                <div class="item-name">${item.name}</div>
                                <div class="item-quantity">${item.quantity} ${item.unit}</div>
                                ${item.estimatedExpiry ? `
                                    <div class="item-expiry ${this.getExpiryClass(item.estimatedExpiry)}">
                                        ${this.formatExpiry(item.estimatedExpiry)}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html || '<p class="empty-state">Fridge is empty. Take a photo to start tracking!</p>';
    }
    
    /**
     * Get CSS class for expiry date
     */
    getExpiryClass(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 0) return 'expired';
        if (daysUntil <= 2) return 'expiring-soon';
        if (daysUntil <= 5) return 'expiring-week';
        return 'expiring-later';
    }
    
    /**
     * Format expiry date for display
     */
    formatExpiry(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 0) return 'Expired';
        if (daysUntil === 1) return 'Tomorrow';
        if (daysUntil <= 7) return `${daysUntil} days`;
        return expiry.toLocaleDateString();
    }
    
    /**
     * Show/hide loading state
     */
    showLoading(show) {
        const loader = document.getElementById('fridge-loading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }
    
    /**
     * Display recipe suggestions
     */
    displayRecipeSuggestions(suggestions) {
        const container = document.getElementById('recipe-suggestions');
        if (!container) return;
        
        if (suggestions.length === 0) {
            container.innerHTML = '<p>No recipe suggestions based on current inventory.</p>';
            return;
        }
        
        const html = suggestions.map(suggestion => `
            <div class="recipe-suggestion">
                <h4>${suggestion.name}</h4>
                <div class="match-score">${Math.round(suggestion.matchScore * 100)}% match</div>
                <div class="use-items">
                    <strong>Use:</strong> ${suggestion.useItems.join(', ')}
                </div>
                ${suggestion.missingItems.length > 0 ? `
                    <div class="missing-items">
                        <strong>Need:</strong> ${suggestion.missingItems.join(', ')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    /**
     * Initialize fridge inventory UI
     */
    initUI() {
        // Create upload button
        const uploadBtn = document.createElement('button');
        uploadBtn.id = 'upload-fridge-photo';
        uploadBtn.className = 'btn-ios';
        uploadBtn.innerHTML = '<i data-lucide="camera"></i> Scan Fridge';
        uploadBtn.onclick = () => this.openPhotoUpload();
        
        // Add to page
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(uploadBtn);
        }
        
        // Create inventory container
        const container = document.createElement('div');
        container.id = 'inventory-container';
        container.className = 'inventory-section';
        
        // Add to main content
        const main = document.querySelector('main');
        if (main) {
            main.insertBefore(container, main.firstChild);
        }
        
        // Initial display
        this.updateInventoryDisplay();
    }
    
    /**
     * Open photo upload dialog
     */
    openPhotoUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Prefer rear camera on mobile
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.processFridgePhoto(file);
            }
        };
        
        input.click();
    }
}

// Create global instance
const fridgeInventory = new FridgeInventory();

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fridgeInventory.initUI());
} else {
    fridgeInventory.initUI();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = fridgeInventory;
}