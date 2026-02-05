/**
 * Shopping Mode - In-store check-off functionality
 */

class ShoppingMode {
    constructor() {
        this.isShoppingMode = false;
        this.currentList = null;
        this.setupShoppingModeToggle();
    }
    
    /**
     * Setup shopping mode toggle
     */
    setupShoppingModeToggle() {
        // Create shopping mode button in header
        const header = document.querySelector('header');
        if (header) {
            const shoppingBtn = document.createElement('button');
            shoppingBtn.id = 'shopping-mode-toggle';
            shoppingBtn.className = 'p-2 rounded-full bg-blue-600 text-white';
            shoppingBtn.innerHTML = '<i data-lucide="shopping-cart" class="h-5 w-5"></i>';
            shoppingBtn.title = 'Enter Shopping Mode';
            
            shoppingBtn.addEventListener('click', () => {
                this.toggleShoppingMode();
            });
            
            header.appendChild(shoppingBtn);
            
            // Refresh icons
            if (window.lucide) {
                lucide.createIcons();
            }
        }
    }
    
    /**
     * Toggle shopping mode on/off
     */
    toggleShoppingMode() {
        this.isShoppingMode = !this.isShoppingMode;
        
        const toggleBtn = document.getElementById('shopping-mode-toggle');
        const shoppingView = document.getElementById('shopping-view');
        
        if (this.isShoppingMode) {
            // Enter shopping mode
            toggleBtn.innerHTML = '<i data-lucide="check-circle" class="h-5 w-5"></i>';
            toggleBtn.className = 'p-2 rounded-full bg-green-600 text-white';
            toggleBtn.title = 'Exit Shopping Mode';
            
            // Show shopping view
            if (shoppingView) {
                shoppingView.classList.remove('hidden');
                this.enterShoppingMode();
            }
            
            // Update page title
            document.title = '🛒 Shopping Mode - Family Recipes';
            
            // Show shopping mode header
            this.showShoppingHeader();
            
        } else {
            // Exit shopping mode
            toggleBtn.innerHTML = '<i data-lucide="shopping-cart" class="h-5 w-5"></i>';
            toggleBtn.className = 'p-2 rounded-full bg-blue-600 text-white';
            toggleBtn.title = 'Enter Shopping Mode';
            
            // Hide shopping view
            if (shoppingView) {
                shoppingView.classList.add('hidden');
            }
            
            // Restore page title
            document.title = 'Family Recipes';
            
            // Hide shopping header
            this.hideShoppingHeader();
        }
        
        // Refresh icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Show shopping mode header
     */
    showShoppingHeader() {
        // Create shopping header
        const header = document.createElement('div');
        header.id = 'shopping-mode-header';
        header.className = 'sticky top-16 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg';
        header.innerHTML = `
            <div class="max-w-lg mx-auto flex justify-between items-center">
                <div>
                    <h2 class="text-xl font-bold">🛒 Shopping Mode</h2>
                    <p class="text-sm opacity-90">Tap items as you find them</p>
                </div>
                <div class="flex items-center gap-3">
                    <button id="clear-all-checked" class="px-3 py-1 bg-white/20 rounded-lg text-sm">
                        Clear Checked
                    </button>
                    <button id="exit-shopping" class="px-3 py-1 bg-white text-blue-600 rounded-lg font-semibold">
                        Done
                    </button>
                </div>
            </div>
        `;
        
        // Insert after main header
        const mainHeader = document.querySelector('header');
        if (mainHeader) {
            mainHeader.after(header);
        }
        
        // Add event listeners
        header.querySelector('#exit-shopping')?.addEventListener('click', () => {
            this.toggleShoppingMode();
        });
        
        header.querySelector('#clear-all-checked')?.addEventListener('click', () => {
            this.clearAllChecked();
        });
    }
    
    /**
     * Hide shopping mode header
     */
    hideShoppingHeader() {
        const header = document.getElementById('shopping-mode-header');
        if (header) {
            header.remove();
        }
    }
    
    /**
     * Enter shopping mode - optimize UI for in-store use
     */
    enterShoppingMode() {
        // Get current shopping list
        this.currentList = this.getCurrentList();
        
        if (!this.currentList) {
            this.showMessage('No shopping list found', 'error');
            return;
        }
        
        // Optimize UI for shopping
        this.optimizeForShopping();
        
        // Setup item tap handlers
        this.setupItemTapHandlers();
        
        // Update progress
        this.updateShoppingProgress();
    }
    
    /**
     * Get current shopping list
     */
    getCurrentList() {
        // Try to get from shopping list manager
        if (window.shoppingListManager) {
            const mealPlanItems = window.AppLogic?.generateGroceries?.([]) || { items: [], categorized: {} };
            return shoppingListManager.combineLists(mealPlanItems);
        }
        
        // Fallback: check localStorage
        try {
            const saved = localStorage.getItem('current_shopping_list');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Optimize UI for in-store shopping
     */
    optimizeForShopping() {
        const shoppingView = document.getElementById('shopping-view');
        if (!shoppingView) return;
        
        // Make items larger and easier to tap
        shoppingView.classList.add('shopping-mode-active');
        
        // Update item styling
        const items = shoppingView.querySelectorAll('.shopping-item');
        items.forEach(item => {
            item.classList.add('shopping-mode-item');
            
            // Make checkboxes larger
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.classList.add('shopping-mode-checkbox');
            }
        });
        
        // Add swipe instructions
        const instructions = document.createElement('div');
        instructions.className = 'text-center text-gray-500 text-sm mb-6';
        instructions.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <i data-lucide="hand" class="h-4 w-4"></i>
                <span>Tap items to check them off</span>
            </div>
        `;
        
        shoppingView.prepend(instructions);
        
        // Refresh icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Setup item tap handlers
     */
    setupItemTapHandlers() {
        const shoppingView = document.getElementById('shopping-view');
        if (!shoppingView) return;
        
        // Make entire item row clickable
        shoppingView.addEventListener('click', (e) => {
            const itemRow = e.target.closest('.shopping-item');
            if (itemRow && !e.target.closest('.remove-item')) {
                this.toggleItemChecked(itemRow);
            }
        });
        
        // Add swipe gestures for mobile
        this.setupSwipeGestures();
    }
    
    /**
     * Toggle item checked state
     */
    toggleItemChecked(itemRow) {
        const checkbox = itemRow.querySelector('.shopping-item-checkbox');
        if (!checkbox) return;
        
        // Toggle checked state
        const isChecked = checkbox.classList.contains('checked');
        
        if (!isChecked) {
            // Check item
            checkbox.classList.add('checked');
            itemRow.classList.add('checked', 'item-found');
            
            // Add animation
            this.animateItemFound(itemRow);
            
            // Play sound/vibration (optional)
            this.playCheckSound();
            
        } else {
            // Uncheck item
            checkbox.classList.remove('checked');
            itemRow.classList.remove('checked', 'item-found');
        }
        
        // Save state
        this.saveItemState(itemRow, !isChecked);
        
        // Update progress
        this.updateShoppingProgress();
    }
    
    /**
     * Animate item when found
     */
    animateItemFound(itemRow) {
        // Add pulse animation
        itemRow.style.animation = 'itemFound 0.5s ease';
        
        // Remove animation after it completes
        setTimeout(() => {
            itemRow.style.animation = '';
        }, 500);
    }
    
    /**
     * Play check sound (optional)
     */
    playCheckSound() {
        // Simple beep sound (can be disabled in settings)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            
        } catch (e) {
            // Audio not supported or user blocked it
            console.log('Audio not available');
        }
    }
    
    /**
     * Save item checked state
     */
    saveItemState(itemRow, isChecked) {
        const itemId = itemRow.dataset.id;
        const isCustom = itemRow.dataset.custom === 'true';
        
        // Save to shopping list manager if available
        if (window.shoppingListManager && itemId) {
            shoppingListManager.toggleItemChecked(itemId, isCustom);
        }
        
        // Also save to localStorage for persistence
        this.saveToLocalStorage(itemId, isChecked, isCustom);
    }
    
    /**
     * Save to localStorage
     */
    saveToLocalStorage(itemId, isChecked, isCustom) {
        try {
            const key = isCustom ? 'custom_items_checked' : 'recipe_items_checked';
            let checkedItems = JSON.parse(localStorage.getItem(key)) || {};
            
            if (isChecked) {
                checkedItems[itemId] = true;
            } else {
                delete checkedItems[itemId];
            }
            
            localStorage.setItem(key, JSON.stringify(checkedItems));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
    
    /**
     * Update shopping progress
     */
    updateShoppingProgress() {
        const shoppingView = document.getElementById('shopping-view');
        if (!shoppingView) return;
        
        const totalItems = shoppingView.querySelectorAll('.shopping-item').length;
        const checkedItems = shoppingView.querySelectorAll('.shopping-item.checked').length;
        
        // Update progress in header
        const progressHeader = document.getElementById('shopping-mode-header');
        if (progressHeader) {
            const progressText = progressHeader.querySelector('p');
            if (progressText) {
                const percentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
                progressText.textContent = `${checkedItems}/${totalItems} items • ${percentage}% complete`;
            }
        }
        
        // Update category counts
        this.updateCategoryCounts();
        
        // Show completion message if all items checked
        if (checkedItems === totalItems && totalItems > 0) {
            this.showCompletionMessage();
        }
    }
    
    /**
     * Update category counts
     */
    updateCategoryCounts() {
        const categories = document.querySelectorAll('.category-section');
        
        categories.forEach(category => {
            const container = category.querySelector('.shopping-items-container');
            if (!container) return;
            
            const totalItems = container.querySelectorAll('.shopping-item').length;
            const checkedItems = container.querySelectorAll('.shopping-item.checked').length;
            
            const countElement = category.querySelector('.category-count');
            if (countElement) {
                countElement.textContent = `${checkedItems}/${totalItems}`;
            }
        });
    }
    
    /**
     * Show completion message
     */
    showCompletionMessage() {
        const message = document.createElement('div');
        message.id = 'completion-message';
        message.className = 'fixed bottom-4 left-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg z-50';
        message.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <i data-lucide="party-popper" class="h-6 w-6"></i>
                    <div>
                        <h4 class="font-bold">Shopping Complete! 🎉</h4>
                        <p class="text-sm opacity-90">You found all items</p>
                    </div>
                </div>
                <button id="dismiss-completion" class="px-4 py-2 bg-white/20 rounded-lg">
                    Dismiss
                </button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Add dismiss button handler
        message.querySelector('#dismiss-completion').addEventListener('click', () => {
            message.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.body.contains(message)) {
                message.remove();
            }
        }, 10000);
        
        // Refresh icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    /**
     * Clear all checked items
     */
    clearAllChecked() {
        const shoppingView = document.getElementById('shopping-view');
        if (!shoppingView) return;
        
        const checkedItems = shoppingView.querySelectorAll('.shopping-item.checked');
        
        if (checkedItems.length === 0) {
            this.showMessage('No checked items to clear', 'info');
            return;
        }
        
        // Confirm clearing
        if (confirm(`Clear ${checkedItems.length} checked items?`)) {
            checkedItems.forEach(item => {
                const checkbox = item.querySelector('.shopping-item-checkbox');
                if (checkbox) {
                    checkbox.classList.remove('checked');
                }
                item.classList.remove('checked', 'item-found');
                
                // Save state
                const itemId = item.dataset.id;
                const isCustom = item.dataset.custom === 'true';
                this.saveItemState(item, false);
            });
            
            this.updateShoppingProgress();
            this.showMessage(`Cleared ${checkedItems.length} items`, 'success');
        }
    }
    
    /**
     * Setup swipe gestures for mobile
     */
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Check if it's a horizontal swipe (not vertical scroll)
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                const itemRow = e.target.closest('.shopping-item');
                if (itemRow) {
                    // Swipe right to check, left to uncheck
                    if (diffX > 0) {
                        // Swipe right - check item
                        const checkbox = itemRow.querySelector('input[type="checkbox"]');
                        if (checkbox && !checkbox.checked) {
                            this.toggleItemChecked(itemRow);
                        }
                    } else {
                        // Swipe left - uncheck item
                        const checkbox = itemRow.querySelector('input[type="checkbox"]');
                        if (checkbox && checkbox.checked) {
                            this.toggleItemChecked(itemRow);
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Show message
     */
    showMessage(message, type = 'info') {
        // Create toast
        const toast = document.createElement('div');
        toast.className = `fixed bottom-20 left-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'info' ? 'bg-blue-500 text-white' :
            'bg-gray-800 text-white'
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
const shoppingMode = new ShoppingMode();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = shoppingMode;
}