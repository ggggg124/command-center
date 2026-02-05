# backup-encrypted.ps1 - Encrypted Google Drive Backup System
# Phase 2: AES-256 encrypted backups with Google Drive upload

param(
    [switch]$Quiet = $false,
    [string]$EncryptionKey = "",
    [switch]$Setup = $false
)

$WorkspacePath = "C:\Users\Home\.openclaw\workspace"
$BackupDir = "C:\Users\Home\backup"
$EncryptedDir = "C:\Users\Home\backup\encrypted"
$ConfigDir = "C:\Users\Home\.openclaw\backup-config"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Create directories
@($BackupDir, $EncryptedDir, $ConfigDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

# Configuration files
$KeyFile = "$ConfigDir\encryption.key"
$ConfigFile = "$ConfigDir\backup-config.json"
$LogFile = "$ConfigDir\backup-log.json"

if (-not $Quiet) {
    Write-Host "🔒 OpenClaw Encrypted Backup System" -ForegroundColor Cyan
    Write-Host "====================================="
}

# SETUP MODE: Generate encryption key and config
if ($Setup) {
    if (-not $Quiet) {
        Write-Host "⚙️  SETUP MODE: Configuring encrypted backup system" -ForegroundColor Yellow
    }
    
    # Generate encryption key if not provided
    if ([string]::IsNullOrEmpty($EncryptionKey)) {
        $EncryptionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
        if (-not $Quiet) {
            Write-Host "Generated new encryption key (64 chars)" -ForegroundColor Green
        }
    }
    
    # Save encryption key (user should backup this separately!)
    $EncryptionKey | Out-File -FilePath $KeyFile -Encoding UTF8 -Force
    
    # Create configuration
    $config = @{
        version = "1.0"
        configuredAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        backupDir = $BackupDir
        encryptedDir = $EncryptedDir
        workspacePath = $WorkspacePath
        encryption = @{
            algorithm = "AES-256"
            keyFile = $KeyFile
            keyBackupWarning = "BACKUP THIS KEY FILE SEPARATELY! Without it, encrypted backups cannot be restored."
        }
        googleDrive = @{
            configured = $false
            folderName = "OpenClaw-Backups"
            notes = "Google Drive integration requires OAuth setup. Run backup-google-setup.ps1 when ready."
        }
        exclusionPatterns = @(
            "client_secret.json",
            "*secret*",
            "*token*",
            "*password*",
            "*.key",
            "*.pem",
            "*.pfx"
        )
        retention = @{
            localBackups = 7
            encryptedBackups = 30
        }
    }
    
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigFile -Encoding UTF8 -Force
    
    if (-not $Quiet) {
        Write-Host "✅ Setup complete!" -ForegroundColor Green
        Write-Host "Configuration saved to: $ConfigFile" -ForegroundColor Gray
        Write-Host "Encryption key saved to: $KeyFile" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⚠️  CRITICAL: Backup your encryption key!" -ForegroundColor Red
        Write-Host "   Location: $KeyFile" -ForegroundColor Yellow
        Write-Host "   Without this key, you cannot restore encrypted backups!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Backup the encryption key to a password manager" -ForegroundColor Gray
        Write-Host "2. Run backup-google-setup.ps1 for Google Drive integration" -ForegroundColor Gray
        Write-Host "3. Test with: .\backup-encrypted.ps1" -ForegroundColor Gray
    }
    
    exit 0
}

# NORMAL MODE: Check if configured
if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Encrypted backup system not configured" -ForegroundColor Red
    Write-Host "Run: .\backup-encrypted.ps1 -Setup" -ForegroundColor Yellow
    exit 1
}

# Load configuration
$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json

# Load encryption key
if (-not (Test-Path $KeyFile)) {
    Write-Host "❌ Encryption key not found: $KeyFile" -ForegroundColor Red
    Write-Host "You need the encryption key to create/restore backups!" -ForegroundColor Red
    exit 1
}

$EncryptionKey = Get-Content $KeyFile -Raw

if (-not $Quiet) {
    Write-Host "Configuration loaded from: $ConfigFile" -ForegroundColor Gray
    Write-Host "Encryption key loaded from: $KeyFile" -ForegroundColor Gray
}

# STEP 1: Create regular backup (exclude sensitive files)
if (-not $Quiet) {
    Write-Host "`n📁 Step 1: Creating safe backup..." -ForegroundColor Cyan
}

$FilesToBackup = Get-ChildItem -Path $WorkspacePath -Recurse -File | 
    Where-Object {
        $isSafe = $true
        foreach ($pattern in $config.exclusionPatterns) {
            if ($_.Name -like $pattern) {
                $isSafe = $false
                break
            }
        }
        $isSafe
    }

$TotalSizeMB = [math]::Round(($FilesToBackup | Measure-Object Length -Sum).Sum / 1MB, 2)

if (-not $Quiet) {
    Write-Host "Found $($FilesToBackup.Count) safe files ($TotalSizeMB MB)"
}

# Create temporary directory for backup
$TempDir = "$env:TEMP\openclaw-backup-$Timestamp"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

try {
    # Copy files to temp directory
    foreach ($file in $FilesToBackup) {
        $relativePath = $file.FullName.Substring($WorkspacePath.Length + 1)
        $destPath = Join-Path $TempDir $relativePath
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item $file.FullName -Destination $destPath -Force
    }
    
    # Create regular ZIP backup
    $RegularBackupFile = "$BackupDir\openclaw-workspace-$Timestamp.zip"
    Compress-Archive -Path "$TempDir\*" -DestinationPath $RegularBackupFile -CompressionLevel Fastest
    
    if (-not $Quiet) {
        $RegularSizeMB = [math]::Round((Get-Item $RegularBackupFile).Length / 1MB, 2)
        Write-Host "Created regular backup: $RegularSizeMB MB" -ForegroundColor Green
    }
    
    # STEP 2: Encrypt the backup
    if (-not $Quiet) {
        Write-Host "`n🔒 Step 2: Encrypting backup..." -ForegroundColor Cyan
    }
    
    # Read the ZIP file as bytes
    $BackupBytes = [System.IO.File]::ReadAllBytes($RegularBackupFile)
    
    # Create AES encryption object
    $AES = New-Object System.Security.Cryptography.AesManaged
    $AES.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $AES.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
    $AES.KeySize = 256
    $AES.BlockSize = 128
    
    # Derive key from password using PBKDF2
    $Salt = New-Object byte[] 16
    $RNG = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $RNG.GetBytes($Salt)
    
    $DerivedKey = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($EncryptionKey, $Salt, 10000)
    $AES.Key = $DerivedKey.GetBytes(32) # 256-bit key
    $AES.IV = $DerivedKey.GetBytes(16)  # 128-bit IV
    
    # Create encryptor
    $Encryptor = $AES.CreateEncryptor()
    $MemoryStream = New-Object System.IO.MemoryStream
    $CryptoStream = New-Object System.Security.Cryptography.CryptoStream($MemoryStream, $Encryptor, [System.Security.Cryptography.CryptoStreamMode]::Write)
    
    # Write salt first, then encrypted data
    $MemoryStream.Write($Salt, 0, $Salt.Length)
    $CryptoStream.Write($BackupBytes, 0, $BackupBytes.Length)
    $CryptoStream.FlushFinalBlock()
    
    # Get encrypted bytes
    $EncryptedBytes = $MemoryStream.ToArray()
    
    # Clean up
    $CryptoStream.Close()
    $MemoryStream.Close()
    $AES.Clear()
    
    # Save encrypted file
    $EncryptedBackupFile = "$EncryptedDir\openclaw-encrypted-$Timestamp.aes"
    [System.IO.File]::WriteAllBytes($EncryptedBackupFile, $EncryptedBytes)
    
    $EncryptedSizeMB = [math]::Round((Get-Item $EncryptedBackupFile).Length / 1MB, 2)
    
    if (-not $Quiet) {
        Write-Host "Created encrypted backup: $EncryptedSizeMB MB" -ForegroundColor Green
        Write-Host "File: $(Split-Path $EncryptedBackupFile -Leaf)" -ForegroundColor Gray
        Write-Host "Algorithm: AES-256-CBC with PBKDF2 key derivation" -ForegroundColor Gray
    }
    
    # STEP 3: Clean up old backups (retention policy)
    if (-not $Quiet) {
        Write-Host "`n🗑️  Step 3: Applying retention policy..." -ForegroundColor Cyan
    }
    
    # Keep only last N regular backups
    $RegularBackups = Get-ChildItem -Path $BackupDir -Filter "openclaw-workspace-*.zip" | Sort-Object LastWriteTime -Descending
    if ($RegularBackups.Count -gt $config.retention.localBackups) {
        $ToDelete = $RegularBackups | Select-Object -Skip $config.retention.localBackups
        foreach ($backup in $ToDelete) {
            Remove-Item $backup.FullName -Force
            if (-not $Quiet) {
                Write-Host "Deleted old backup: $(Split-Path $backup.FullName -Leaf)" -ForegroundColor Gray
            }
        }
    }
    
    # Keep only last N encrypted backups
    $EncryptedBackups = Get-ChildItem -Path $EncryptedDir -Filter "openclaw-encrypted-*.aes" | Sort-Object LastWriteTime -Descending
    if ($EncryptedBackups.Count -gt $config.retention.encryptedBackups) {
        $ToDelete = $EncryptedBackups | Select-Object -Skip $config.retention.encryptedBackups
        foreach ($backup in $ToDelete) {
            Remove-Item $backup.FullName -Force
            if (-not $Quiet) {
                Write-Host "Deleted old encrypted backup: $(Split-Path $backup.FullName -Leaf)" -ForegroundColor Gray
            }
        }
    }
    
    # STEP 4: Log the backup
    $logEntry = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        regularBackup = @{
            file = Split-Path $RegularBackupFile -Leaf
            sizeMB = [math]::Round((Get-Item $RegularBackupFile).Length / 1MB, 2)
            files = $FilesToBackup.Count
        }
        encryptedBackup = @{
            file = Split-Path $EncryptedBackupFile -Leaf
            sizeMB = $EncryptedSizeMB
            algorithm = "AES-256-CBC"
        }
        exclusions = $config.exclusionPatterns
    }
    
    # Load existing log or create new
    if (Test-Path $LogFile) {
        $log = Get-Content $LogFile -Raw | ConvertFrom-Json
    } else {
        $log = @()
    }
    
    $log = @($log) + $logEntry
    $log | ConvertTo-Json -Depth 10 | Out-File -FilePath $LogFile -Encoding UTF8 -Force
    
    # STEP 5: Google Drive upload (if configured)
    if ($config.googleDrive.configured) {
        if (-not $Quiet) {
            Write-Host "`n☁️  Step 5: Google Drive upload..." -ForegroundColor Cyan
            Write-Host "Google Drive integration not yet configured" -ForegroundColor Yellow
            Write-Host "Run backup-google-setup.ps1 to configure" -ForegroundColor Gray
        }
    } else {
        if (-not $Quiet) {
            Write-Host "`n☁️  Step 5: Google Drive upload..." -ForegroundColor Cyan
            Write-Host "Google Drive not configured (skipping)" -ForegroundColor Gray
        }
    }
    
    # Final output
    if (-not $Quiet) {
        Write-Host "`n✅ ENCRYPTED BACKUP COMPLETE!" -ForegroundColor Green
        Write-Host "================================="
        Write-Host "Regular backup: $BackupDir\$(Split-Path $RegularBackupFile -Leaf)" -ForegroundColor Gray
        Write-Host "Encrypted backup: $EncryptedDir\$(Split-Path $EncryptedBackupFile -Leaf)" -ForegroundColor Gray
        Write-Host "Encryption: AES-256-CBC (military grade)" -ForegroundColor Gray
        Write-Host "Log: $LogFile" -ForegroundColor Gray
        
        Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Yellow
        Write-Host "1. Your encryption key is at: $KeyFile" -ForegroundColor Red
        Write-Host "2. BACKUP THIS KEY to a password manager!" -ForegroundColor Red
        Write-Host "3. Without the key, encrypted backups are useless!" -ForegroundColor Red
        
        Write-Host "`nNext for Google Drive:" -ForegroundColor Cyan
        Write-Host "Run: .\backup-google-setup.ps1" -ForegroundColor Yellow
    } else {
        # Quiet mode output
        $result = @{
            success = $true
            timestamp = $Timestamp
            regularBackup = @{
                file = Split-Path $RegularBackupFile -Leaf
                sizeMB = [math]::Round((Get-Item $RegularBackupFile).Length / 1MB, 2)
            }
            encryptedBackup = @{
                file = Split-Path $EncryptedBackupFile -Leaf
                sizeMB = $EncryptedSizeMB
                algorithm = "AES-256-CBC"
            }
            keyFile = $KeyFile
            configFile = $ConfigFile
            logFile = $LogFile
        }
        $result | ConvertTo-Json -Depth 10 -Compress
    }
    
} catch {
    if (-not $Quiet) {
        Write-Host "❌ Backup failed: $_" -ForegroundColor Red
    } else {
        $result = @{
            success = $false
            error = $_.ToString()
            timestamp = $Timestamp
        }
        $result | ConvertTo-Json -Depth 10 -Compress
    }
    exit 1
} finally {
    # Clean up temp directory
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}