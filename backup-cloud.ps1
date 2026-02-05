# backup-cloud.ps1 - Complete Cloud Backup Solution
# Phase 2: Creates encrypted backup and uploads to Google Drive

param(
    [switch]$Quiet = $false,
    [switch]$Setup = $false,
    [switch]$EncryptOnly = $false,
    [switch]$UploadOnly = $false
)

if (-not $Quiet) {
    Write-Host "☁️  OpenClaw Cloud Backup System" -ForegroundColor Cyan
    Write-Host "================================="
}

# SETUP MODE
if ($Setup) {
    if (-not $Quiet) {
        Write-Host "⚙️  Running complete setup..." -ForegroundColor Yellow
    }
    
    # Step 1: Setup encrypted backup system
    Write-Host "`n🔒 Step 1: Setting up encrypted backup system..." -ForegroundColor Cyan
    & "$PSScriptRoot\backup-encrypted.ps1" -Setup -Quiet:$Quiet
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Encrypted backup setup failed" -ForegroundColor Red
        exit 1
    }
    
    # Step 2: Setup Google Drive integration
    Write-Host "`n☁️  Step 2: Setting up Google Drive integration..." -ForegroundColor Cyan
    & "$PSScriptRoot\backup-google-setup.ps1" -Quiet:$Quiet
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Google Drive setup failed or skipped" -ForegroundColor Yellow
        Write-Host "You can run it manually later: .\backup-google-setup.ps1" -ForegroundColor Gray
    }
    
    if (-not $Quiet) {
        Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
        Write-Host "Run: .\backup-cloud.ps1 to test the complete system" -ForegroundColor Yellow
    }
    
    exit 0
}

# UPLOAD ONLY MODE
if ($UploadOnly) {
    if (-not $Quiet) {
        Write-Host "📤 Uploading existing encrypted backups to Google Drive..." -ForegroundColor Cyan
    }
    
    & "$PSScriptRoot\backup-google-upload.ps1" -Quiet:$Quiet
    
    exit $LASTEXITCODE
}

# ENCRYPT ONLY MODE
if ($EncryptOnly) {
    if (-not $Quiet) {
        Write-Host "🔒 Creating encrypted backup only..." -ForegroundColor Cyan
    }
    
    & "$PSScriptRoot\backup-encrypted.ps1" -Quiet:$Quiet
    
    exit $LASTEXITCODE
}

# COMPLETE BACKUP MODE (default)
if (-not $Quiet) {
    Write-Host "Starting complete cloud backup process..." -ForegroundColor Cyan
    Write-Host "This will:"
    Write-Host "1. 🔒 Create encrypted backup (AES-256)" -ForegroundColor Gray
    Write-Host "2. ☁️  Upload to Google Drive" -ForegroundColor Gray
    Write-Host "3. 📝 Log everything" -ForegroundColor Gray
    Write-Host ""
}

$startTime = Get-Date

# Step 1: Create encrypted backup
if (-not $Quiet) {
    Write-Host "`n🔒 Step 1: Creating encrypted backup..." -ForegroundColor Cyan
}

$encryptResult = & "$PSScriptRoot\backup-encrypted.ps1" -Quiet:$Quiet

if ($LASTEXITCODE -ne 0) {
    if (-not $Quiet) {
        Write-Host "❌ Encrypted backup failed" -ForegroundColor Red
    }
    exit 1
}

# Parse the JSON result from encrypt script
try {
    $encryptData = $encryptResult | ConvertFrom-Json
    $encryptedFile = $encryptData.encryptedBackup.file
    $encryptedFilePath = "C:\Users\Home\backup\encrypted\$encryptedFile"
} catch {
    if (-not $Quiet) {
        Write-Host "⚠️  Could not parse encrypt result, trying to find latest encrypted file..." -ForegroundColor Yellow
    }
    
    # Find the most recent encrypted file
    $encryptedDir = "C:\Users\Home\backup\encrypted"
    if (Test-Path $encryptedDir) {
        $latestFile = Get-ChildItem -Path $encryptedDir -Filter "openclaw-encrypted-*.aes" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestFile) {
            $encryptedFilePath = $latestFile.FullName
            $encryptedFile = $latestFile.Name
        } else {
            if (-not $Quiet) {
                Write-Host "❌ No encrypted files found" -ForegroundColor Red
            }
            exit 1
        }
    } else {
        if (-not $Quiet) {
            Write-Host "❌ Encrypted directory not found" -ForegroundColor Red
        }
        exit 1
    }
}

# Step 2: Upload to Google Drive
if (-not $Quiet) {
    Write-Host "`n☁️  Step 2: Uploading to Google Drive..." -ForegroundColor Cyan
    Write-Host "File: $encryptedFile" -ForegroundColor Gray
}

$uploadResult = & "$PSScriptRoot\backup-google-upload.ps1" -Quiet:$Quiet -FileToUpload $encryptedFilePath

if ($LASTEXITCODE -ne 0) {
    if (-not $Quiet) {
        Write-Host "⚠️  Google Drive upload failed or skipped" -ForegroundColor Yellow
        Write-Host "Encrypted backup was created locally: $encryptedFilePath" -ForegroundColor Gray
    }
    
    # Upload failed, but backup was created - partial success
    $partialSuccess = $true
} else {
    $partialSuccess = $false
}

# Step 3: Summary
$endTime = Get-Date
$duration = $endTime - $startTime

if (-not $Quiet) {
    Write-Host "`n📊 Backup Complete Summary" -ForegroundColor Cyan
    Write-Host "========================"
    Write-Host "Duration: $([math]::Round($duration.TotalSeconds, 1)) seconds" -ForegroundColor Gray
    
    if ($partialSuccess) {
        Write-Host "Status: ⚠️  Partial success" -ForegroundColor Yellow
        Write-Host "- 🔒 Encrypted backup created locally" -ForegroundColor Green
        Write-Host "- ☁️  Google Drive upload failed/skipped" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Encrypted file: $encryptedFilePath" -ForegroundColor Gray
        Write-Host "You can upload it manually later" -ForegroundColor Gray
    } else {
        Write-Host "Status: ✅ Complete success" -ForegroundColor Green
        Write-Host "- 🔒 Encrypted backup created" -ForegroundColor Green
        Write-Host "- ☁️  Uploaded to Google Drive" -ForegroundColor Green
        
        # Parse upload results if available
        try {
            $uploadData = $uploadResult | ConvertFrom-Json
            if ($uploadData.summary.successful -gt 0) {
                Write-Host "Uploaded: $($uploadData.summary.successful) file(s)" -ForegroundColor Gray
                Write-Host "Total size: $($uploadData.summary.totalSizeMB) MB" -ForegroundColor Gray
            }
        } catch {
            # Couldn't parse upload results
        }
    }
    
    Write-Host "`n🔒 Encryption Key Location:" -ForegroundColor Red
    Write-Host "C:\Users\Home\.openclaw\backup-config\encryption.key" -ForegroundColor Yellow
    Write-Host "BACKUP THIS KEY TO A PASSWORD MANAGER!" -ForegroundColor Red
    Write-Host "Without it, encrypted backups cannot be restored!" -ForegroundColor Red
    
    Write-Host "`n📝 Logs:" -ForegroundColor Cyan
    Write-Host "Backup log: C:\Users\Home\.openclaw\backup-config\backup-log.json" -ForegroundColor Gray
    Write-Host "Upload log: C:\Users\Home\.openclaw\backup-config\google-upload-log.json" -ForegroundColor Gray
    
    Write-Host "`n🔄 Next scheduled backup:" -ForegroundColor Cyan
    Write-Host "11:00 PM tonight (via cron job)" -ForegroundColor Gray
}

# Return result for automation
if ($Quiet) {
    $result = @{
        success = $true
        partialSuccess = $partialSuccess
        encryptedFile = $encryptedFile
        encryptedFilePath = $encryptedFilePath
        durationSeconds = [math]::Round($duration.TotalSeconds, 1)
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    if (-not $partialSuccess) {
        try {
            $uploadData = $uploadResult | ConvertFrom-Json
            $result.upload = $uploadData
        } catch {
            $result.upload = @{ error = "Could not parse upload results" }
        }
    }
    
    $result | ConvertTo-Json -Depth 10 -Compress
}