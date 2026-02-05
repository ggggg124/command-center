# Hosting Setup Guide for Family Recipe Manager

## What I Need From You

### 1. **Hosting Access Information**
Please provide:
```
FTP/SFTP Details:
- Host: ftp.yourdomain.com or server IP
- Username: your_username
- Password: your_password
- Port: 21 (FTP) or 22 (SFTP)

OR

Control Panel Access:
- URL: https://yourdomain.com/cpanel
- Username: your_username  
- Password: your_password

Domain:
- Primary: yourdomain.com
- Subdomain (optional): recipes.yourdomain.com
```

### 2. **Server Requirements Checklist**
Your hosting should have:
- [ ] **Static file hosting** (HTML/CSS/JS)
- [ ] **HTTPS/SSL certificate** (essential for OAuth)
- [ ] **PHP 7.4+** (for optional backend features)
- [ ] **.htaccess support** (for clean URLs)
- [ ] **At least 100MB storage**
- [ ] **Ability to create subdomains** (optional but nice)

### 3. **Google Cloud Setup (You Do This)**
1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "Create Project"
   - Name: "Family Recipe Manager"
   - Click "Create"

2. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search for and enable:
     - **Google Drive API**
     - **People API** (for user profile)

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: **Web application**
   - Name: "Family Recipe Web App"

4. **Add Authorized Domains**
   ```
   Authorized JavaScript origins:
   - https://yourdomain.com
   - https://www.yourdomain.com
   - https://recipes.yourdomain.com (if using subdomain)
   
   Authorized redirect URIs:
   - https://yourdomain.com/recipes/oauth2callback.html
   - https://www.yourdomain.com/recipes/oauth2callback.html
   ```

5. **Get Your Client ID**
   - After creation, copy the **Client ID**
   - Format: `1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
   - Share this with me

## What I'll Do For You

### Phase 1: Deployment
1. **Upload all files** to your hosting
2. **Configure .htaccess** for clean URLs
3. **Set up SSL/HTTPS** if not already configured
4. **Test the installation**

### Phase 2: Configuration
1. **Update config.js** with your Google Client ID
2. **Set up OAuth callback** page
3. **Configure database structure**
4. **Test Google Drive integration**

### Phase 3: Testing
1. **Verify website loads** at your domain
2. **Test Google sign-in**
3. **Test recipe photo upload**
4. **Verify meal planning works**

## File Structure I'll Deploy
```
/recipes/  (on your server)
├── index.html                    # Main app
├── apple-index.html              # Apple-style landing
├── oauth2callback.html           # OAuth handler
├── css/
│   └── style.css                 # Apple-inspired styles
├── js/
│   ├── config.js                 # Your configuration
│   ├── drive-api.js              # Google Drive integration
│   ├── recipe-manager.js         # Recipe CRUD operations
│   ├── meal-planner.js           # Meal planning logic
│   ├── grocery-list.js           # Shopping list generator
│   └── app.js                    # Main application
├── assets/                       # Images, icons
└── .htaccess                     # URL rewriting
```

## Security Measures

### 1. **Your Data Protection**
- All recipe data stored in **your Google Drive**
- No third-party databases
- You control all access permissions
- Regular backups to your Drive

### 2. **Website Security**
- HTTPS required for all access
- OAuth tokens never stored on server
- CORS properly configured
- X-Frame-Options: DENY
- Content Security Policy headers

### 3. **Access Control**
- Only you can access your Drive data
- No user registration required
- Single Google account access
- Revocable at any time via Google

## Maintenance & Support

### 1. **Regular Backups**
- Automatic: Google Drive versioning
- Manual: Export recipes as JSON
- Schedule: Weekly export recommended

### 2. **Updates**
- I'll handle code updates
- You'll get notifications
- One-click update process

### 3. **Troubleshooting**
Common issues and solutions documented
Direct support via Telegram
Error logging and reporting

## Next Steps

### Immediate (Today):
1. **Share hosting credentials** with me
2. **Set up Google Cloud** project
3. **Get Client ID** from Google

### Within 24 Hours:
1. I'll **deploy the app** to your hosting
2. You'll **test the installation**
3. We'll **verify everything works**

### Ongoing:
1. Start **sending recipe photos** via Telegram
2. I'll **process with OCR** and add to database
3. Use the **web app** to manage recipes
4. Generate **meal plans** and **grocery lists**

## Ready to Start?

**Reply with:**
1. Your hosting access details (FTP/control panel)
2. Your domain name
3. Confirmation that you've created Google Cloud project

I'll handle everything else! 🚀

---

**Note:** All credentials will be used only for deployment and immediately discarded after setup. Your security is paramount.