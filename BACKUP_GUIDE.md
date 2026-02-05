# OpenClaw Safe Backup System

## Overview
Lightweight backup solution that **excludes sensitive files** (API keys, tokens, passwords) before creating archives. Designed for **manual cloud upload** with security review.

## Files Created
1. `backup-final.ps1` - Main backup script (uses `C:\Users\Home\backup\`)
2. `backup.bat` - Easy double-click backup launcher
3. `backup-test.ps1` - Test script (same as final)
4. `test-backup-folder.bat` - Test batch file
5. `BACKUP_GUIDE.md` - This documentation

## What Gets Backed Up
- All workspace files **EXCEPT**:
  - `client_secret.json` (Google OAuth credentials)
  - Any file with "secret" in the name
  - Any file with "token" in the name  
  - Any file with "password" in the name
  - Any `.key` files
- **Result:** ~0.06 MB ZIP file with 47 safe files

## What Gets Excluded (For Security)
- ✅ `client_secret.json` - Google OAuth credentials
- ✅ Any API keys/tokens (if present)
- ✅ Any password files
- ✅ Private keys (`.key`, `.pem`, `.pfx`)

## How to Use

### Quick Backup (Recommended)
1. Double-click `backup.bat`
2. Backup creates in `C:\Users\Home\backup\` (no dot prefix, easier to find)
3. File named: `openclaw-workspace-YYYYMMDD-HHMMSS.zip`
4. **Size:** ~70KB (tiny!)

### Manual Steps After Backup
1. **Review** the backup ZIP file
2. **Upload** to cloud (Google Drive, Dropbox, etc.) if satisfied
3. **Delete** local backup after successful upload
4. **Keep** `client_secret.json` separate (password manager)

## Performance
- **Time:** < 2 seconds
- **Size:** 0.06 MB per backup
- **Frequency:** Can run hourly with no performance impact
- **Storage:** 100 backups = ~6 MB

## Security Model
**NO ENCRYPTION** in this phase - by design:
1. Script **excludes** sensitive files at source
2. You **manually review** before cloud upload
3. You control when/where to upload
4. No automatic cloud sync = no accidental leaks

## Phase 2: Encrypted Google Drive Backup ✅ COMPLETE!
**Complete encrypted cloud backup system now available!**

### Features:
- ✅ **AES-256 encryption** (military grade)
- ✅ **Automatic Google Drive upload**
- ✅ **Zero-knowledge** (Google cannot read your data)
- ✅ **Cron job integration** (11:00 PM daily)

### Get Started:
1. **Setup:** `.\backup-cloud.bat` (choose option 1)
2. **Test:** `.\backup-cloud.bat` (choose option 2)
3. **Documentation:** See `BACKUP_PHASE2.md`

### Important:
- **⚠️ BACKUP YOUR ENCRYPTION KEY!** (Cannot be recovered if lost)
- Key location: `C:\Users\Home\.openclaw\backup-config\encryption.key`
- Save to password manager + physical backup

## Phase 3 (Future)
1. **Decryption tool:** Restore from encrypted backups
2. **Selective restore:** Restore individual files
3. **Backup verification:** Verify backup integrity
4. **Multiple cloud providers:** Add Dropbox, OneDrive support

## Verification
To verify backup contents:
```powershell
# List files in backup
$zip = [System.IO.Compression.ZipFile]::OpenRead("C:\Users\Home\.openclaw-backups\openclaw-workspace-*.zip")
$zip.Entries | Select-Object FullName
$zip.Dispose()
```

## Notes
- Backups go to `C:\Users\Home\backup\` (no dot prefix, easier to find)
- Cloud upload is **manual** for security control
- Workspace is tiny (0.14 MB) so backups are instant
- Excluded `client_secret.json` should be backed up separately via password manager