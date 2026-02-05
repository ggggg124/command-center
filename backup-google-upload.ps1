# backup-google-upload.ps1 - Google Drive Upload for Encrypted Backups
# Uploads encrypted .aes files to Google Drive automatically

param(
    [switch]$Quiet = $false,
    [string]$FileToUpload = ""
)

$ConfigDir = "C:\Users\Home\.openclaw\backup-config"
$ConfigFile = "$ConfigDir\backup-config.json"
$EncryptedDir = "C:\Users\Home\backup\encrypted"

if (-not $Quiet) {
    Write-Host "☁️  Google Drive Backup Upload" -ForegroundColor Cyan
    Write-Host "============================="
}

# Check if encrypted backup system is configured
if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Encrypted backup system not configured" -ForegroundColor Red
    Write-Host "Run: .\backup-encrypted.ps1 -Setup" -ForegroundColor Yellow
    exit 1
}

# Load configuration
$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json

# Check if Google Drive is configured
if (-not $config.googleDrive.configured) {
    Write-Host "❌ Google Drive not configured" -ForegroundColor Red
    Write-Host "Run: .\backup-google-setup.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not $Quiet) {
    Write-Host "Configuration loaded from: $ConfigFile" -ForegroundColor Gray
    Write-Host "Google Drive folder: $($config.googleDrive.folderName)" -ForegroundColor Gray
}

# Import required modules
try {
    Import-Module Google.Apis.Drive.v3 -ErrorAction Stop
} catch {
    Write-Host "❌ Google Drive module not installed" -ForegroundColor Red
    Write-Host "Run: .\backup-google-setup.ps1 to install modules" -ForegroundColor Yellow
    exit 1
}

# Load credentials
try {
    $credential = [Google.Apis.Auth.OAuth2.GoogleWebAuthorizationBroker]::AuthorizeAsync(
        (New-Object Google.Apis.Auth.OAuth2.ClientSecrets {
            ClientId = (Get-Content "C:\Users\Home\.openclaw\workspace\client_secret.json" -Raw | ConvertFrom-Json).installed.client_id
            ClientSecret = (Get-Content "C:\Users\Home\.openclaw\workspace\client_secret.json" -Raw | ConvertFrom-Json).installed.client_secret
        }),
        @("https://www.googleapis.com/auth/drive.file"),
        "user",
        [System.Threading.CancellationToken]::None,
        (New-Object Google.Apis.Util.Store.FileDataStore($ConfigDir, $true))
    ).Result
} catch {
    Write-Host "❌ Failed to load Google Drive credentials" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Try running: .\backup-google-setup.ps1" -ForegroundColor Yellow
    exit 1
}

# Create Drive service
$service = New-Object Google.Apis.Drive.v3.DriveService(
    (New-Object Google.Apis.Services.BaseClientService+Initializer) {
        HttpClientInitializer = $credential
        ApplicationName = "OpenClaw Backup System"
    }
)

# Get folder ID
$folderId = $config.googleDrive.folderId
if ([string]::IsNullOrEmpty($folderId)) {
    Write-Host "❌ Google Drive folder ID not found in config" -ForegroundColor Red
    exit 1
}

# Determine which file(s) to upload
if (-not [string]::IsNullOrEmpty($FileToUpload)) {
    # Upload specific file
    if (Test-Path $FileToUpload) {
        $filesToUpload = @(Get-Item $FileToUpload)
    } else {
        Write-Host "❌ File not found: $FileToUpload" -ForegroundColor Red
        exit 1
    }
} else {
    # Upload all encrypted files from encrypted directory
    if (Test-Path $EncryptedDir) {
        $filesToUpload = Get-ChildItem -Path $EncryptedDir -Filter "openclaw-encrypted-*.aes" | Sort-Object LastWriteTime
    } else {
        Write-Host "❌ Encrypted directory not found: $EncryptedDir" -ForegroundColor Red
        exit 1
    }
}

if ($filesToUpload.Count -eq 0) {
    if (-not $Quiet) {
        Write-Host "No encrypted files found to upload" -ForegroundColor Yellow
    }
    exit 0
}

if (-not $Quiet) {
    Write-Host "Found $($filesToUpload.Count) file(s) to upload" -ForegroundColor Green
}

$uploadResults = @()
$successCount = 0
$failCount = 0

foreach ($file in $filesToUpload) {
    $fileName = $file.Name
    $filePath = $file.FullName
    $fileSizeMB = [math]::Round($file.Length / 1MB, 2)
    
    if (-not $Quiet) {
        Write-Host "`n📤 Uploading: $fileName ($fileSizeMB MB)..." -ForegroundColor Cyan
    }
    
    try {
        # Check if file already exists in Google Drive
        $listRequest = $service.Files.List()
        $listRequest.Q = "name='$fileName' and '$folderId' in parents and trashed=false"
        $listRequest.Fields = "files(id, name, size)"
        $existingFiles = $listRequest.Execute().Files
        
        if ($existingFiles.Count -gt 0) {
            if (-not $Quiet) {
                Write-Host "File already exists in Google Drive, skipping..." -ForegroundColor Yellow
            }
            
            $uploadResults += @{
                file = $fileName
                status = "skipped"
                reason = "already exists"
                driveId = $existingFiles[0].Id
                sizeMB = $fileSizeMB
            }
            continue
        }
        
        # Create file metadata
        $fileMetadata = New-Object Google.Apis.Drive.v3.Data.File
        $fileMetadata.Name = $fileName
        $fileMetadata.Parents = @($folderId)
        $fileMetadata.Description = "OpenClaw encrypted backup - AES-256 encrypted workspace backup"
        
        # Open file stream
        $fileStream = New-Object System.IO.FileStream($filePath, [System.IO.FileMode]::Open)
        
        # Upload file
        $uploadRequest = $service.Files.Create($fileMetadata, $fileStream, "application/octet-stream")
        $uploadRequest.Fields = "id, name, size, webViewLink"
        
        # Show progress for large files
        if ($fileSizeMB -gt 1) {
            $uploadRequest.ChunkSize = 256 * 1024 # 256KB chunks
            if (-not $Quiet) {
                Write-Host "Uploading in chunks..." -ForegroundColor Gray
            }
        }
        
        $uploadedFile = $uploadRequest.Execute()
        
        # Close stream
        $fileStream.Close()
        
        $successCount++
        
        if (-not $Quiet) {
            Write-Host "✅ Upload successful!" -ForegroundColor Green
            Write-Host "   Drive ID: $($uploadedFile.Id)" -ForegroundColor Gray
            Write-Host "   Size: $([math]::Round($uploadedFile.Size / 1MB, 2)) MB" -ForegroundColor Gray
        }
        
        $uploadResults += @{
            file = $fileName
            status = "success"
            driveId = $uploadedFile.Id
            sizeMB = $fileSizeMB
            webViewLink = $uploadedFile.WebViewLink
            uploadedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        
    } catch {
        $failCount++
        
        if (-not $Quiet) {
            Write-Host "❌ Upload failed: $_" -ForegroundColor Red
        }
        
        $uploadResults += @{
            file = $fileName
            status = "failed"
            error = $_.ToString()
            sizeMB = $fileSizeMB
        }
    }
}

# Summary
if (-not $Quiet) {
    Write-Host "`n📊 Upload Summary" -ForegroundColor Cyan
    Write-Host "================"
    Write-Host "✅ Successful: $successCount" -ForegroundColor Green
    Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
    Write-Host "⏭️  Skipped: $($uploadResults.Count - $successCount - $failCount)" -ForegroundColor Gray
    
    if ($successCount -gt 0) {
        Write-Host "`n📁 Files uploaded to Google Drive folder:" -ForegroundColor Cyan
        Write-Host "Folder: $($config.googleDrive.folderName)" -ForegroundColor Gray
        Write-Host "Total uploaded size: $([math]::Round(($uploadResults | Where-Object { $_.status -eq "success" } | Measure-Object sizeMB -Sum).Sum, 2)) MB" -ForegroundColor Gray
    }
    
    Write-Host "`n🔒 Encryption Status:" -ForegroundColor Cyan
    Write-Host "All uploaded files are AES-256 encrypted" -ForegroundColor Gray
    Write-Host "Encryption key: $ConfigDir\encryption.key" -ForegroundColor Gray
    Write-Host "Without this key, files cannot be decrypted!" -ForegroundColor Red
}

# Save upload log
$uploadLogFile = "$ConfigDir\google-upload-log.json"
$logEntry = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    uploadResults = $uploadResults
    summary = @{
        successful = $successCount
        failed = $failCount
        skipped = $uploadResults.Count - $successCount - $failCount
        totalSizeMB = [math]::Round(($uploadResults | Where-Object { $_.status -eq "success" } | Measure-Object sizeMB -Sum).Sum, 2)
    }
}

# Load existing log or create new
if (Test-Path $uploadLogFile) {
    $log = Get-Content $uploadLogFile -Raw | ConvertFrom-Json
} else {
    $log = @()
}

$log = @($log) + $logEntry
$log | ConvertTo-Json -Depth 10 | Out-File -FilePath $uploadLogFile -Encoding UTF8 -Force

if (-not $Quiet) {
    Write-Host "`n📝 Upload log saved to: $uploadLogFile" -ForegroundColor Gray
}

# Return results for automation
if ($Quiet) {
    $result = @{
        success = $true
        summary = @{
            successful = $successCount
            failed = $failCount
            skipped = $uploadResults.Count - $successCount - $failCount
            totalSizeMB = [math]::Round(($uploadResults | Where-Object { $_.status -eq "success" } | Measure-Object sizeMB -Sum).Sum, 2)
        }
        uploadResults = $uploadResults
        logFile = $uploadLogFile
    }
    $result | ConvertTo-Json -Depth 10 -Compress
}