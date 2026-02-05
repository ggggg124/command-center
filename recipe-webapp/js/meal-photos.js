/**
 * Meal Photos System
 * Handles meal images for recipes
 */

class MealPhotos {
    constructor() {
        this.photoDatabase = this.loadPhotoDatabase();
        this.defaultPhotos = this.getDefaultPhotos();
    }
    
    /**
     * Load photo database from storage
     */
    loadPhotoDatabase() {
        try {
            const saved = localStorage.getItem('meal_photos');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    
    /**
     * Save photo database to storage
     */
    savePhotoDatabase() {
        localStorage.setItem('meal_photos', JSON.stringify(this.photoDatabase));
    }
    
    /**
     * Get default photos for common meals
     */
    getDefaultPhotos() {
        return {
            'Spaghetti Bolognese': '🍝',
            'Chicken Stir Fry': '🍗',
            'Baked Salmon': '🐟',
            'Vegetable Curry': '🍛',
            'Beef Tacos': '🌮',
            'Pasta': '🍝',
            'Chicken': '🍗',
            'Salmon': '🐟',
            'Curry': '🍛',
            'Tacos': '🌮',
            'Salad': '🥗',
            'Soup': '🍲',
            'Pizza': '🍕',
            'Burger': '🍔',
            'Sushi': '🍣',
            'Ramen': '🍜',
            'Steak': '🥩',
            'Fish': '🐟',
            'Rice': '🍚',
            'Noodles': '🍜'
        };
    }
    
    /**
     * Get photo for a recipe
     */
    getPhotoForRecipe(recipeName) {
        // Check if we have a custom photo
        if (this.photoDatabase[recipeName]) {
            return this.photoDatabase[recipeName];
        }
        
        // Try to find a matching default photo
        const name = recipeName.toLowerCase();
        
        for (const [key, emoji] of Object.entries(this.defaultPhotos)) {
            if (name.includes(key.toLowerCase())) {
                return emoji;
            }
        }
        
        // Fallback: category-based emoji
        return this.getCategoryEmoji(recipeName);
    }
    
    /**
     * Get emoji based on recipe category
     */
    getCategoryEmoji(recipeName) {
        // This would use recipe category from recipe manager
        // For now, use generic food emoji
        const foodEmojis = ['🍽️', '🥘', '🍳', '🧆', '🥣', '🍴'];
        return foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
    }
    
    /**
     * Set custom photo for recipe
     */
    setCustomPhoto(recipeName, photoData) {
        this.photoDatabase[recipeName] = photoData;
        this.savePhotoDatabase();
    }
    
    /**
     * Create photo element for recipe
     */
    createPhotoElement(recipeName, size = 'medium') {
        const photo = this.getPhotoForRecipe(recipeName);
        
        const sizes = {
            small: 'w-12 h-12 text-2xl',
            medium: 'w-16 h-16 text-3xl',
            large: 'w-24 h-24 text-4xl'
        };
        
        const div = document.createElement('div');
        div.className = `${sizes[size]} rounded-lg bg-gray-100 flex items-center justify-center`;
        div.textContent = photo;
        
        return div;
    }
    
    /**
     * Create photo upload interface
     */
    createUploadInterface(recipeName) {
        const container = document.createElement('div');
        container.className = 'photo-upload-interface p-4 bg-gray-50 rounded-lg';
        
        container.innerHTML = `
            <div class="flex items-center gap-4 mb-4">
                <div id="current-photo" class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                    ${this.getPhotoForRecipe(recipeName)}
                </div>
                <div>
                    <h4 class="font-semibold">Meal Photo</h4>
                    <p class="text-sm text-gray-500">Add a photo for ${recipeName}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-4 gap-2 mb-4">
                ${Object.entries(this.defaultPhotos).map(([name, emoji]) => `
                    <button class="emoji-option w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xl hover:bg-blue-50 hover:border-blue-300"
                            data-emoji="${emoji}">
                        ${emoji}
                    </button>
                `).join('')}
            </div>
            
            <div class="text-center">
                <button id="save-photo" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Use This Photo
                </button>
            </div>
        `;
        
        // Add event listeners
        container.querySelectorAll('.emoji-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const emoji = btn.dataset.emoji;
                container.querySelector('#current-photo').textContent = emoji;
            });
        });
        
        container.querySelector('#save-photo').addEventListener('click', () => {
            const selectedEmoji = container.querySelector('#current-photo').textContent;
            this.setCustomPhoto(recipeName, selectedEmoji);
            
            // Show success message
            this.showToast('Photo updated successfully', 'success');
            
            // Close interface
            container.remove();
        });
        
        return container;
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
const mealPhotos = new MealPhotos();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mealPhotos;
}