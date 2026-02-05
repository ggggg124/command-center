# OpenClaw Cron Jobs Schedule

## Current Overnight Jobs

### 1. **Night Shift** (10:30 PM)
- **Purpose:** Work on BACKLOG.md items
- **Action:** Picks ONE item from backlog, makes real progress
- **Output:** Updates backlog, logs to night-shift-log.md
- **Goal:** Surprise you with tangible progress each morning

### 2. **Overnight Backup** (11:00 PM) 
- **Purpose:** Safe workspace backup
- **Action:** Runs backup-auto.ps1 (excludes sensitive files)
- **Output:** Creates backup ZIP, updates BACKUP_GUIDE.md
- **Optional:** May upload to cloud if credentials available
- **Logs:** backup-log.md

### 3. **System Maintenance** (2:00 AM)
- **Purpose:** OpenClaw health check and cleanup
- **Action:** Runs status checks, cleans temp files, organizes memory
- **Output:** System optimization, documentation updates
- **Logs:** maintenance-log.md

## Schedule Summary
```
10:30 PM ── Night Shift (backlog work)
11:00 PM ── Overnight Backup (safe backup)
 2:00 AM ── System Maintenance (health check)
```

## Job Details

### Night Shift (d44e6f43-4730-43f4-aab7-9d31743696d6)
- **Time:** 22:30 (10:30 PM) Sydney time
- **Duration:** Up to 1 hour
- **Focus:** Building actual projects/tools from backlog
- **Success metric:** Real working code/features delivered

### Overnight Cloud Backup (3cdcdf07-118b-4318-b79f-12829f8b31aa)
- **Time:** 23:00 (11:00 PM) Sydney time
- **Type:** **Encrypted Google Drive backup** (Phase 2)
- **Process:** Creates AES-256 encrypted backup → Uploads to Google Drive
- **Security:** Zero-knowledge (Google cannot read your data)
- **Encryption:** AES-256-CBC with PBKDF2 key derivation
- **Size:** ~0.07 MB per encrypted backup
- **Storage:** Local (30 days) + Google Drive (forever)

### System Maintenance (c325c2db-3793-40ae-84b0-bf281aec1df1)
- **Time:** 02:00 (2:00 AM) Sydney time
- **Tasks:** Health checks, cleanup, optimization
- **Goal:** Keep OpenClaw running smoothly
- **Frequency:** Daily preventative maintenance

## Monitoring
- Check `memory/night-shift-log.md` for nightly work results
- Check `memory/backup-log.md` for backup history
- Check `memory/maintenance-log.md` for system health
- Use `openclaw cron list` to see job status

## Notes
- All jobs run in isolated sessions (won't interrupt your chats)
- Jobs can be disabled/enabled via `openclaw cron` commands
- Times are Sydney/Australia timezone
- Each job has 1-hour timeout maximum