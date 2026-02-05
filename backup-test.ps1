# backup-test.ps1 - Test backup to "backup" folder (no dot prefix)
# Uses folder: C:\Users\Home\backup\

param(
    [switch]$Quiet = $false
)

$WorkspacePath = "C:\Users\Home\.openclaw\workspace"
$BackupDir = "C:\Users\Home\backup"  # Changed from .openclaw-backups to backup
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupFile = "$BackupDir\openclaw-workspace-$Timestamp.zip"

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    if (-not $Quiet) {
        Write-Host "Created backup directory: $BackupDir" -ForegroundColor Yellow
    }
}

if (-not $Quiet) {
    Write-Host "OpenClaw Test Backup" -ForegroundColor Cyan
    Write-Host "===================="
    Write-Host "Backup to: $BackupDir (no dot prefix)"
}

# Get all files except sensitive ones
$FilesToBackup = Get-ChildItem -Path $WorkspacePath -Recurse -File | 
    Where-Object { $_.Name -notlike "*secret*" -and $_.Name -notlike "*token*" -and $_.Name -notlike "*password*" -and $_.Name -notlike "*.key" -and $_.Name -notlike "client_secret.json" }

$TotalSizeMB = [math]::Round(($FilesToBackup | Measure-Object Length -Sum).Sum / 1MB, 2)

if (-not $Quiet) {
    Write-Host "Found $($FilesToBackup.Count) safe files ($TotalSizeMB MB)"
    Write-Host "Excluding files with: secret, token, password, .key"
}

# Create backup
try {
    # Create temporary directory
    $TempDir = "$env:TEMP\openclaw-test-$Timestamp"
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
        Write-Host "`n✅ TEST SUCCESS: Backup created in 'backup' folder!" -ForegroundColor Green
        Write-Host "File: $BackupFile"
        Write-Host "Size: $BackupSizeMB MB"
        Write-Host "Files: $($FilesToBackup.Count)"
        
        Write-Host "`n=== Backup Location ===" -ForegroundColor Cyan
        Write-Host "Folder: C:\Users\Home\backup\" -ForegroundColor Yellow
        Write-Host "(No dot prefix - easier to find)" -ForegroundColor Gray
        
        Write-Host "`n=== Contents Sample ===" -ForegroundColor Cyan
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $zip = [System.IO.Compression.ZipFile]::OpenRead($BackupFile)
        $zip.Entries | Select-Object -First 5 FullName, @{Name="Size(KB)";Expression={[math]::Round($_.CompressedLength/1KB, 2)}} | Format-Table -AutoSize
        $zip.Dispose()
        
        Write-Host "`n=== Verification ===" -ForegroundColor Cyan
        Write-Host "1. Check folder: C:\Users\Home\backup\" -ForegroundColor Yellow
        Write-Host "2. Open ZIP file to verify contents" -ForegroundColor Yellow
        Write-Host "3. Confirm no sensitive files included" -ForegroundColor Yellow
        
    } else {
        # Quiet mode - just output JSON for automation
        $result = @{
            success = $true
            backupFile = $BackupFile
            backupDir = $BackupDir
            sizeMB = $BackupSizeMB
            fileCount = $FilesToBackup.Count
            excludedFiles = @("client_secret.json", "*secret*", "*token*", "*password*", "*.key")
            timestamp = $Timestamp
        }
        $result | ConvertTo-Json -Compress
    }
    
} catch {
    if (-not $Quiet) {
        Write-Host "❌ TEST FAILED: Backup error - $_" -ForegroundColor Red
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