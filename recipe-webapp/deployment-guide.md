# Deployment Guide: Family Recipe Manager

## Option A: Your Own Website Hosting (Recommended)

### 1. **File Structure on Your Server**
```
/var/www/yourdomain.com/recipes/  (or your hosting path)
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── drive-api.js
│   ├── recipe-manager.js
│   ├── meal-planner.js
│   ├── grocery-list.js
│   └── app.js
├── assets/
│   ├── favicon.svg
│   └── logo.png
└── .htaccess (for Apache)
```

### 2. **Google Cloud Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Family Recipe Manager"
3. Enable APIs: Drive API, People API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized JavaScript origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
6. Add authorized redirect URIs:
   - `https://yourdomain.com/recipes/oauth2callback.html`

### 3. **Update Configuration**
Edit `js/config.js`:
```javascript
const CONFIG = {
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
    REDIRECT_URI: 'https://yourdomain.com/recipes/oauth2callback.html',
    // ... rest of config
};
```

### 4. **Create OAuth Callback Page**
Create `oauth2callback.html` in your recipes folder:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Authentication Complete</title>
</head>
<body>
    <script>
        // Parse OAuth response and close window
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            // Send token to parent window
            window.opener.postMessage({
                type: 'oauth_callback',
                access_token: accessToken
            }, '*');
        }
        
        window.close();
    </script>
</body>
</html>
```

### 5. **Upload to Your Server**
```bash
# Example using FTP/SFTP
scp -r recipe-webapp/* user@yourserver:/var/www/yourdomain.com/recipes/
```

### 6. **Access Your App**
Visit: `https://yourdomain.com/recipes/`

## Option B: Static Hosting (Netlify/Vercel/GitHub Pages)

### 1. **Create GitHub Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/family-recipes.git
git push -u origin main
```

### 2. **Deploy to Netlify**
1. Go to [Netlify](https://netlify.com)
2. "New site from Git"
3. Connect GitHub repository
4. Build settings:
   - Build command: (leave empty - static site)
   - Publish directory: `.`
5. Add environment variable:
   - `GOOGLE_CLIENT_ID`: your-client-id-here

### 3. **Update Config for Netlify**
```javascript
const CONFIG = {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
    REDIRECT_URI: 'https://yoursite.netlify.app/oauth2callback.html',
    // ...
};
```

## Option C: Local Development First

### 1. **Test Locally**
```bash
# Install local server
npm install -g live-server

# Run locally
cd recipe-webapp
live-server --port=8080
```

### 2. **Configure for Local Testing**
For `js/config.js` during development:
```javascript
const CONFIG = {
    CLIENT_ID: 'your-client-id',
    REDIRECT_URI: 'http://localhost:8080/oauth2callback.html',
    // Add localhost to authorized origins in Google Cloud
};
```

## Security Considerations

### 1. **Restrict Google Drive Access**
- Use `drive.file` scope (not full `drive` scope)
- App folder pattern keeps user data organized
- Regular audit of OAuth tokens

### 2. **Website Security**
- HTTPS required for OAuth
- Content Security Policy headers
- X-Frame-Options: DENY
- CORS properly configured

### 3. **Data Backup**
- Regular export of recipe data
- Google Takeout for Drive backup
- Local backup script

## Performance Optimization

### 1. **Caching Strategy**
- Service Worker for offline access
- LocalStorage for recent recipes
- CDN for libraries (Tailwind, Lucide)

### 2. **Image Optimization**
- Compress recipe photos before upload
- Lazy loading for recipe images
- Responsive image sizes

### 3. **API Optimization**
- Batch Drive API requests
- Cache folder structure
- Paginate recipe lists

## Maintenance

### 1. **Regular Updates**
- Update dependencies quarterly
- Test with new browser versions
- Monitor Google API changes

### 2. **Backup Schedule**
- Weekly: Export recipe JSON
- Monthly: Full Drive backup
- Quarterly: Test restore process

### 3. **User Support**
- FAQ page
- Contact form
- Error reporting

## Getting Started Recommendation

1. **Start with local development** to test functionality
2. **Deploy to your existing hosting** for best control
3. **Use your domain** for professional appearance
4. **Start with basic features**, add advanced features later

Your existing website hosting is perfect for this - you get full control, better performance, and a professional appearance!