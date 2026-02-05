// Google Drive API Integration for Family Recipe Manager

class DriveAPI {
    constructor() {
        this.gapiLoaded = false;
        this.gisLoaded = false;
        this.tokenClient = null;
        this.user = null;
        this.appFolderId = null;
        this.subfolders = {};
        
        // Initialize Google APIs
        this.loadGoogleAPIs();
    }
    
    // Load Google APIs
    loadGoogleAPIs() {
        // Load Google API Client library
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => this.gapiLoad();
        document.head.appendChild(gapiScript);
        
        // Load Google Identity Services library
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => this.gisLoad();
        document.head.appendChild(gisScript);
    }
    
    gapiLoad() {
        gapi.load('client', () => this.initializeGapiClient());
    }
    
    gisLoad() {
        this.gisLoaded = true;
        this.maybeEnableSignIn();
    }
    
    async initializeGapiClient() {
        try {
            await gapi.client.init({
                apiKey: CONFIG.GOOGLE.API_KEY,
                discoveryDocs: CONFIG.GOOGLE.DISCOVERY_DOCS,
            });
            
            this.gapiLoaded = true;
            this.maybeEnableSignIn();
            
            console.log('Google API client initialized');
        } catch (error) {
            console.error('Error initializing Google API client:', error);
            this.showError('Failed to initialize Google API. Please refresh the page.');
        }
    }
    
    maybeEnableSignIn() {
        if (this.gapiLoaded && this.gisLoaded) {
            this.initializeTokenClient();
            document.getElementById('auth-button').disabled = false;
        }
    }
    
    initializeTokenClient() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.GOOGLE.CLIENT_ID,
            scope: CONFIG.GOOGLE.SCOPES,
            callback: (response) => this.handleTokenResponse(response),
        });
    }
    
    // Authentication
    async signIn() {
        if (!this.tokenClient) {
            this.showError('Google API not loaded yet. Please wait.');
            return;
        }
        
        this.showStatus('Signing in...');
        
        try {
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError('Failed to sign in. Please try again.');
        }
    }
    
    async handleTokenResponse(response) {
        if (response.error) {
            console.error('Token error:', response);
            this.showError('Authentication failed. Please try again.');
            return;
        }
        
        // Set the access token
        gapi.client.setToken(response);
        
        // Get user info
        await this.getUserInfo();
        
        // Initialize app folder structure
        await this.initializeAppFolder();
        
        this.showStatus('Signed in successfully!');
        this.updateUIForSignedIn();
    }
    
    async getUserInfo() {
        try {
            const userInfo = await gapi.client.oauth2.userinfo.get();
            this.user = userInfo.result;
            console.log('User info:', this.user);
        } catch (error) {
            console.error('Error getting user info:', error);
        }
    }
    
    // Drive Operations
    async initializeAppFolder() {
        try {
            // Check if app folder already exists
            const response = await gapi.client.drive.files.list({
                q: `name='${CONFIG.APP.DRIVE_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            
            let folder = response.result.files[0];
            
            if (!folder) {
                // Create app folder
                folder = await this.createFolder(CONFIG.APP.DRIVE_FOLDER, 'root');
                console.log('Created app folder:', folder);
            }
            
            this.appFolderId = folder.id;
            
            // Create subfolders
            for (const [key, folderName] of Object.entries(CONFIG.APP.SUBFOLDERS)) {
                const subfolder = await this.ensureSubfolder(folderName, this.appFolderId);
                this.subfolders[key.toLowerCase()] = subfolder.id;
            }
            
            console.log('App folder structure initialized:', this.subfolders);
            
        } catch (error) {
            console.error('Error initializing app folder:', error);
            throw error;
        }
    }
    
    async createFolder(name, parentId = 'root') {
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        };
        
        const response = await gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id, name'
        });
        
        return response.result;
    }
    
    async ensureSubfolder(folderName, parentId) {
        // Check if subfolder exists
        const response = await gapi.client.drive.files.list({
            q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        
        let folder = response.result.files[0];
        
        if (!folder) {
            folder = await this.createFolder(folderName, parentId);
        }
        
        return folder;
    }
    
    // File Operations
    async uploadFile(file, folderId, fileName = null) {
        const metadata = {
            name: fileName || file.name,
            parents: [folderId]
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);
        
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
            body: form
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    async uploadImage(file) {
        if (!this.subfolders.images) {
            throw new Error('Images folder not initialized');
        }
        
        // Validate file type
        if (!CONFIG.STORAGE.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            throw new Error(`Unsupported image type: ${file.type}. Supported types: ${CONFIG.STORAGE.SUPPORTED_IMAGE_TYPES.join(', ')}`);
        }
        
        // Validate file size
        if (file.size > CONFIG.STORAGE.MAX_IMAGE_SIZE) {
            throw new Error(`Image too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${CONFIG.STORAGE.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
        }
        
        return await this.uploadFile(file, this.subfolders.images);
    }
    
    async saveRecipe(recipeData) {
        if (!this.subfolders.recipes) {
            throw new Error('Recipes folder not initialized');
        }
        
        const fileName = `${CONFIG.APP.FILE_NAMES.RECIPE_PREFIX}${recipeData.id}.json`;
        const fileContent = JSON.stringify(recipeData, null, 2);
        
        const blob = new Blob([fileContent], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        
        return await this.uploadFile(file, this.subfolders.recipes, fileName);
    }
    
    async getRecipe(recipeId) {
        const fileName = `${CONFIG.APP.FILE_NAMES.RECIPE_PREFIX}${recipeId}.json`;
        
        const response = await gapi.client.drive.files.list({
            q: `name='${fileName}' and '${this.subfolders.recipes}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        
        const file = response.result.files[0];
        if (!file) {
            return null;
        }
        
        // Download file content
        const fileResponse = await gapi.client.drive.files.get({
            fileId: file.id,
            alt: 'media'
        });
        
        return fileResponse.result;
    }
    
    async getAllRecipes() {
        const response = await gapi.client.drive.files.list({
            q: `'${this.subfolders.recipes}' in parents and name contains '${CONFIG.APP.FILE_NAMES.RECIPE_PREFIX}' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive'
        });
        
        const recipes = [];
        
        for (const file of response.result.files) {
            try {
                const recipe = await this.getRecipe(file.name.replace(CONFIG.APP.FILE_NAMES.RECIPE_PREFIX, '').replace('.json', ''));
                if (recipe) {
                    recipes.push(recipe);
                }
            } catch (error) {
                console.error(`Error loading recipe from ${file.name}:`, error);
            }
        }
        
        return recipes;
    }
    
    async updateRecipe(recipeData) {
        // First, find the existing file
        const fileName = `${CONFIG.APP.FILE_NAMES.RECIPE_PREFIX}${recipeData.id}.json`;
        
        const response = await gapi.client.drive.files.list({
            q: `name='${fileName}' and '${this.subfolders.recipes}' in parents and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive'
        });
        
        if (response.result.files.length === 0) {
            throw new Error('Recipe not found');
        }
        
        const fileId = response.result.files[0].id;
        
        // Update the file
        const fileContent = JSON.stringify(recipeData, null, 2);
        
        const updateResponse = await gapi.client.drive.files.update({
            fileId: fileId,
            uploadType: 'media',
            media: {
                mimeType: 'application/json',
                body: fileContent
            }
        });
        
        return updateResponse.result;
    }
    
    async deleteRecipe(recipeId) {
        const fileName = `${CONFIG.APP.FILE_NAMES.RECIPE_PREFIX}${recipeId}.json`;
        
        const response = await gapi.client.drive.files.list({
            q: `name='${fileName}' and '${this.subfolders.recipes}' in parents and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive'
        });
        
        if (response.result.files.length === 0) {
            throw new Error('Recipe not found');
        }
        
        const fileId = response.result.files[0].id;
        
        await gapi.client.drive.files.delete({
            fileId: fileId
        });
        
        return true;
    }
    
    // Meal Plans and Grocery Lists
    async saveMealPlan(mealPlanData) {
        const fileName = `${CONFIG.APP.FILE_NAMES.MEAL_PLAN_PREFIX}${mealPlanData.id}.json`;
        const fileContent = JSON.stringify(mealPlanData, null, 2);
        
        const blob = new Blob([fileContent], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        
        return await this.uploadFile(file, this.subfolders.mealplans, fileName);
    }
    
    async saveGroceryList(groceryListData) {
        const fileName = `${CONFIG.APP.FILE_NAMES.GROCERY_LIST_PREFIX}${groceryListData.id}.json`;
        const fileContent = JSON.stringify(groceryListData, null, 2);
        
        const blob = new Blob([fileContent], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        
        return await this.uploadFile(file, this.subfolders.grocerylists, fileName);
    }
    
    // Index file for faster loading
    async updateIndex(recipes) {
        const indexData = {
            updated: new Date().toISOString(),
            count: recipes.length,
            recipes: recipes.map(recipe => ({
                id: recipe.id,
                name: recipe.name,
                category: recipe.category,
                prep_time_minutes: recipe.prep_time_minutes,
                difficulty: recipe.difficulty,
                tags: recipe.tags
            }))
        };
        
        const fileName = CONFIG.APP.FILE_NAMES.INDEX;
        const fileContent = JSON.stringify(indexData, null, 2);
        
        const blob = new Blob([fileContent], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        
        return await this.uploadFile(file, this.appFolderId, fileName);
    }
    
    // UI Helpers
    showStatus(message) {
        const statusEl = document.getElementById('status');
        const statusText = document.getElementById('status-text');
        
        statusText.textContent = message;
        statusEl.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }
    
    showError(message) {
        const statusEl = document.getElementById('status');
        const statusText = document.getElementById('status-text');
        
        statusText.textContent = message;
        statusEl.className = 'mb-6 p-4 bg-red-50 rounded-lg';
        statusEl.classList.remove('hidden');
        
        // Change icon to error
        const icon = statusEl.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', 'alert-circle');
            icon.className = 'h-5 w-5 text-red-600 mr-2';
            lucide.createIcons();
        }
    }
    
    updateUIForSignedIn() {
        const authButton = document.getElementById('auth-button');
        authButton.textContent = `Signed in as ${this.user?.email || 'User'}`;
        authButton.className = 'px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg';
        authButton.disabled = true;
        
        // Enable other UI elements
        document.getElementById('add-recipe-btn').disabled = false;
        document.getElementById('plan-meals-btn').disabled = false;
        document.getElementById('grocery-list-btn').disabled = false;
        
        // Trigger recipe loading
        if (typeof window.loadRecipes === 'function') {
            window.loadRecipes();
        }
    }
    
    // Check if user is signed in
    isSignedIn() {
        return !!this.user && !!gapi.client.getToken();
    }
    
    // Sign out
    async signOut() {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken(null);
        }
        
        this.user = null;
        this.appFolderId = null;
        this.subfolders = {};
        
        // Reset UI
        const authButton = document.getElementById('auth-button');
        authButton.textContent = 'Sign in with Google';
        authButton.className = 'px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition';
        authButton.disabled = false;
        
        // Disable other UI elements
        document.getElementById('add-recipe-btn').disabled = true;
        document.getElementById('plan-meals-btn').disabled = true;
        document.getElementById('grocery-list-btn').disabled = true;
        
        // Clear recipe grid
        const recipesGrid = document.getElementById('recipes-grid');
        recipesGrid.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i data-lucide="chef-hat" class="h-12 w-12 mx-auto mb-4 text-gray-300"></i>
                <p>Sign in to see your recipes</p>
            </div>
        `;
        
        lucide.createIcons();
    }
}

// Create global instance
window.driveAPI = new DriveAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DriveAPI;
}