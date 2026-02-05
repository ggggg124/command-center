# OpenClaw Cloud Backup System - Phase 2
## 🔒 Encrypted Google Drive Backup

## Overview
Complete encrypted backup solution with automatic Google Drive upload. All backups are **AES-256 encrypted** before leaving your computer.

## Security Features
- ✅ **Military-grade encryption**: AES-256-CBC with PBKDF2 key derivation
- ✅ **Zero-knowledge**: Google only sees encrypted blobs, cannot read your data
- ✅ **Sensitive file exclusion**: API keys, tokens, passwords excluded at source
- ✅ **Secure key management**: Encryption key stored separately from backups

## Files Created

### Core Scripts:
1. **`backup-cloud.ps1`** - Complete solution (encrypt + upload)
2. **`backup-cloud.bat`** - Easy menu-driven interface
3. **`backup-encrypted.ps1`** - Encryption engine (AES-256)
4. **`backup-google-setup.ps1`** - Google Drive OAuth setup
5. **`backup-google-upload.ps1`** - Google Drive upload engine

### Configuration:
- **`C:\Users\Home\.openclaw\backup-config\`** - Configuration directory
- **`encryption.key`** - Your AES-256 encryption key (BACKUP THIS!)
- **`backup-config.json`** - System configuration
- **`backup-log.json`** - Backup history
- **`google-upload-log.json`** - Upload history

## How It Works

### 1. **Encryption Process**
```
Workspace Files → ZIP Archive → AES-256 Encryption → .aes file
```
- **Algorithm**: AES-256-CBC (military grade)
- **Key derivation**: PBKDF2 with 10,000 iterations
- **Output**: `.aes` encrypted files (cannot be read without key)

### 2. **Google Drive Upload**
- Encrypted `.aes` files uploaded to `OpenClaw-Backups` folder
- Google sees only encrypted blobs (zero-knowledge)
- Automatic duplicate detection (won't re-upload same file)

### 3. **Retention Policy**
- **Local backups**: Keep last 7 days
- **Encrypted backups**: Keep last 30 days locally
- **Google Drive**: Keep forever (or manage via Google Drive)

## Setup Instructions

### Step 1: Initial Setup
```powershell
# Run setup once
.\backup-cloud.bat
# Choose option 1 (Setup)
```

This will:
1. Generate AES-256 encryption key
2. Create configuration files
3. Install required PowerShell modules
4. Guide you through Google Drive OAuth setup

### Step 2: Backup Your Encryption Key
**⚠️ CRITICAL: BACKUP YOUR ENCRYPTION KEY!**
```
Location: C:\Users\Home\.openclaw\backup-config\encryption.key
```
- Save to password manager (Bitwarden, 1Password, etc.)
- Print and store physically
- **Without this key, encrypted backups are useless!**

### Step 3: Test the System
```powershell
# Test complete backup
.\backup-cloud.bat
# Choose option 2 (Complete backup)
```

## Usage

### Manual Backup (Menu)
```powershell
.\backup-cloud.bat
```
Options:
1. **Setup system** (first time only)
2. **Complete backup** (encrypt + upload to Google Drive)
3. **Encrypt only** (create encrypted backup locally)
4. **Upload only** (upload existing encrypted files)

### Command Line
```powershell
# Complete backup
.\backup-cloud.ps1

# Encrypt only
.\backup-cloud.ps1 -EncryptOnly

# Upload only  
.\backup-cloud.ps1 -UploadOnly

# Quiet mode (for cron jobs)
.\backup-cloud.ps1 -Quiet
```

### Automated (Cron Job)
Already configured to run **daily at 11:00 PM**:
- Creates encrypted backup
- Uploads to Google Drive (if configured)
- Applies retention policies
- Logs everything

## Restoring Backups

### Step 1: Download from Google Drive
1. Go to Google Drive → `OpenClaw-Backups` folder
2. Download the `.aes` file you want to restore

### Step 2: Decrypt (Decryption script to be created in Phase 3)
```powershell
# Coming in Phase 3
.\backup-decrypt.ps1 -InputFile "backup.aes" -OutputFile "restored.zip"
```

### Step 3: Extract
Extract the ZIP file to restore your workspace.

## Security Notes

### What's Encrypted?
- All workspace files (except sensitive exclusions)
- File names and directory structure
- File contents (AES-256 encrypted)

### What's NOT Encrypted (by design)?
- Google Drive knows file names and sizes
- Google Drive knows upload timestamps
- Metadata needed for Google Drive functionality

### What's Excluded (never backed up)?
- `client_secret.json` (Google OAuth credentials)
- Any file with "secret", "token", "password" in name
- `.key`, `.pem`, `.pfx` files (private keys)

## File Structure
```
C:\Users\Home\backup\
├── openclaw-workspace-*.zip          # Regular backups (7 days retention)
└── encrypted\
    └── openclaw-encrypted-*.aes      # Encrypted backups (30 days retention)

C:\Users\Home\.openclaw\backup-config\
├── encryption.key                    # ⚠️ BACKUP THIS FILE!
├── backup-config.json               # System configuration
├── backup-log.json                  # Backup history
├── google-upload-log.json           # Upload history
└── Google.Apis.Auth.*               # OAuth tokens
```

## Google Drive Integration

### Folder Structure on Google Drive:
```
Google Drive/
└── OpenClaw-Backups/
    ├── openclaw-encrypted-20260205-230001.aes
    ├── openclaw-encrypted-20260206-230001.aes
    └── ...
```

### Permissions:
- **Scope**: `drive.file` (per-file access only)
- **Access**: Can only access files it creates
- **Security**: Cannot read/delete other files in your Drive

## Monitoring

### Check Backup Status:
```powershell
# View backup log
Get-Content "C:\Users\Home\.openclaw\backup-config\backup-log.json" | ConvertFrom-Json

# View upload log  
Get-Content "C:\Users\Home\.openclaw\backup-config\google-upload-log.json" | ConvertFrom-Json
```

### Check Google Drive Folder:
1. Visit: https://drive.google.com
2. Navigate to `OpenClaw-Backups` folder
3. Verify encrypted `.aes` files are present

## Troubleshooting

### Common Issues:

1. **"Google Drive not configured"**
   - Run: `.\backup-google-setup.ps1`
   - Complete OAuth authentication

2. **"Encryption key not found"**
   - Check: `C:\Users\Home\.openclaw\backup-config\encryption.key`
   - If missing, restore from your password manager backup

3. **Upload fails**
   - Check internet connection
   - Verify Google Drive has space
   - Check OAuth tokens are valid

4. **"Module not installed"**
   - Run setup again: `.\backup-cloud.ps1 -Setup`
   - May need PowerShell run as Administrator

## Phase 3 (Future)
- **Decryption tool**: Restore from encrypted backups
- **Selective restore**: Restore individual files
- **Backup verification**: Verify backup integrity
- **Multiple cloud providers**: Add Dropbox, OneDrive support
- **Web interface**: Manage backups via browser

## Important Reminders
1. **⚠️ BACKUP YOUR ENCRYPTION KEY!** (Cannot be recovered if lost)
2. Test restore process before relying on backups
3. Monitor backup logs regularly
4. Keep encryption key in password manager + physical backup
5. Google Drive is for backup only, not primary storage

## Support
- Check logs in `C:\Users\Home\.openclaw\backup-config\`
- Review this documentation
- Test with small backups first
- Phase 3 will add decryption and verification tools