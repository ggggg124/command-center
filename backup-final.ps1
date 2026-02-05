# backup-final.ps1 - Final OpenClaw Backup Script
# Uses folder: C:\Users\Home\backup\ (no dot prefix, easier to find)

param(
    [switch]$Quiet = $false
)

$WorkspacePath = "C:\Users\Home\.openclaw\workspace"
$BackupDir = "C:\Users\Home\backup"  # Simple folder name, no dot prefix
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupFile = "$BackupDir\openclaw-workspace-$Timestamp.zip"

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

if (-not $Quiet) {
    Write-Host "OpenClaw Backup" -ForegroundColor Cyan
    Write-Host "================"
    Write-Host "Backup folder: $BackupDir"
}

# Get all files except sensitive ones
$FilesToBackup = Get-ChildItem -Path $WorkspacePath -Recurse -File | 
    Where-Object { $_.Name -notlike "*secret*" -and $_.Name -notlike "*token*" -and $_.Name -notlike "*password*" -and $_.Name -notlike "*.key" -and $_.Name -notlike "client_secret.json" }

$TotalSizeMB = [math]::Round(($FilesToBackup | Measure-Object Length -Sum).Sum / 1MB, 2)

if (-not $Quiet) {
    Write-Host "Backing up $($FilesToBackup.Count) safe files ($TotalSizeMB MB)"
    Write-Host "Excluded: client_secret.json, *secret*, *token*, *password*, *.key"
}

# Create backup
try {
    # Create temporary directory
    $TempDir = "$env:TEMP\openclaw-backup-$Timestamp"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    # Copy files
    foreach ($file in $FilesToBackup) {
        $relativePath = $file.FullName.Substring($WorkspacePath.Length + 1)
        $destPath = Join-Path $TempDir $relativePath
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item $file.FullName -Destination $destPath -Force
    }
    
    # Create ZIP (Fastest compression for speed)
    Compress-Archive -Path "$TempDir\*" -DestinationPath $BackupFile -CompressionLevel Fastest
    
    # Clean up
    Remove-Item $TempDir -Recurse -Force
    
    # Calculate backup size
    $BackupSizeMB = [math]::Round((Get-Item $BackupFile).Length / 1MB, 2)
    
    if (-not $Quiet) {
        Write-Host "`n✅ Backup successful!" -ForegroundColor Green
        Write-Host "Location: $BackupFile"
        Write-Host "Size: $BackupSizeMB MB"
        Write-Host "Files: $($FilesToBackup.Count)"
        
        Write-Host "`n=== Quick Verification ===" -ForegroundColor Cyan
        Write-Host "Folder: C:\Users\Home\backup\" -ForegroundColor Yellow
        Write-Host "File: openclaw-workspace-$Timestamp.zip" -ForegroundColor Yellow
        
        Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
        Write-Host "1. Check the backup folder" -ForegroundColor Gray
        Write-Host "2. Review ZIP contents (no sensitive files)" -ForegroundColor Gray
        Write-Host "3. Upload to cloud if satisfied" -ForegroundColor Gray
        Write-Host "4. Delete local copy after upload" -ForegroundColor Gray
        
    } else {
        # Quiet mode for cron jobs
        $result = @{
            success = $true
            backupFile = $BackupFile
            backupDir = $BackupDir
            sizeMB = $BackupSizeMB
            fileCount = $FilesToBackup.Count
            timestamp = $Timestamp
        }
        $result | ConvertTo-Json -Compress
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
        $result | ConvertTo-Json -Compress
    }
    exit 1
}