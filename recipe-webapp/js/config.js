// Google Drive Configuration
const CONFIG = {
    // Google OAuth Client ID (you'll get this from Google Cloud Console)
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    
    // Google Drive API Scopes
    SCOPES: [
        'https://www.googleapis.com/auth/drive.file',  // Create/access files
        'https://www.googleapis.com/auth/drive.appdata', // App-specific data
        'https://www.googleapis.com/auth/userinfo.email', // User email
        'https://www.googleapis.com/auth/userinfo.profile' // User profile
    ].join(' '),
    
    // Google Drive Folder ID for recipe storage
    // Will be created on first run if not specified
    DRIVE_FOLDER_ID: null,
    
    // Folder structure in Google Drive
    FOLDERS: {
        RECIPES: 'recipes',
        IMAGES: 'images',
        MEAL_PLANS: 'meal-plans',
        GROCERY_LISTS: 'grocery-lists'
    },
    
    // File names
    FILES: {
        INDEX: 'index.json',
        SETTINGS: 'settings.json'
    },
    
    // App settings
    APP: {
        NAME: 'Family Recipe Manager',
        VERSION: '1.0.0',
        STORAGE_KEY: 'familyRecipeManager'
    },
    
    // UI Settings
    UI: {
        THEME: 'light', // light, dark, auto
        RECIPES_PER_PAGE: 12,
        DEFAULT_CATEGORIES: [
            'breakfast', 'lunch', 'dinner', 'dessert', 'snack',
            'vegetarian', 'vegan', 'quick', 'family-favorite', 'meal-prep'
        ]
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}