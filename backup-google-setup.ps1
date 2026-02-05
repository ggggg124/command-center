# backup-google-setup.ps1 - Google Drive Integration Setup for Encrypted Backups
# Sets up OAuth authentication and Google Drive upload

param(
    [switch]$Quiet = $false
)

$ConfigDir = "C:\Users\Home\.openclaw\backup-config"
$ConfigFile = "$ConfigDir\backup-config.json"

if (-not $Quiet) {
    Write-Host "☁️  Google Drive Backup Setup" -ForegroundColor Cyan
    Write-Host "============================"
}

# Check if encrypted backup system is configured
if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Encrypted backup system not configured" -ForegroundColor Red
    Write-Host "Run: .\backup-encrypted.ps1 -Setup" -ForegroundColor Yellow
    exit 1
}

# Load configuration
$config = Get-Content $ConfigFile -Raw | ConvertFrom-Json

if (-not $Quiet) {
    Write-Host "Loaded configuration from: $ConfigFile" -ForegroundColor Gray
}

# Check for required files
$ClientSecretFile = "C:\Users\Home\.openclaw\workspace\client_secret.json"
if (-not (Test-Path $ClientSecretFile)) {
    Write-Host "❌ Google OAuth credentials not found: $ClientSecretFile" -ForegroundColor Red
    Write-Host "This file contains your Google API credentials" -ForegroundColor Red
    exit 1
}

if (-not $Quiet) {
    Write-Host "Found Google OAuth credentials: $ClientSecretFile" -ForegroundColor Green
}

# STEP 1: Install required PowerShell modules
if (-not $Quiet) {
    Write-Host "`n📦 Step 1: Checking/installing required modules..." -ForegroundColor Cyan
}

$RequiredModules = @(
    @{Name = "Google.Apis.Drive.v3"; Version = "1.60.0.3050"},
    @{Name = "Google.Apis.Auth"; Version = "1.60.0.3050"},
    @{Name = "Google.Apis"; Version = "1.60.0.3050"}
)

foreach ($module in $RequiredModules) {
    $moduleName = $module.Name
    $moduleVersion = $module.Version
    
    if (-not $Quiet) {
        Write-Host "Checking: $moduleName v$moduleVersion" -ForegroundColor Gray
    }
    
    # Check if module is installed
    $installedModule = Get-Module -ListAvailable -Name $moduleName | Where-Object { $_.Version -ge [version]$moduleVersion }
    
    if (-not $installedModule) {
        if (-not $Quiet) {
            Write-Host "Installing: $moduleName v$moduleVersion" -ForegroundColor Yellow
        }
        
        try {
            Install-Package -Name $moduleName -RequiredVersion $moduleVersion -ProviderName NuGet -Force -ErrorAction Stop
            if (-not $Quiet) {
                Write-Host "✅ Installed: $moduleName" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Failed to install $moduleName : $_" -ForegroundColor Red
            Write-Host "You may need to run PowerShell as Administrator" -ForegroundColor Yellow
            exit 1
        }
    } else {
        if (-not $Quiet) {
            Write-Host "✅ Already installed: $moduleName" -ForegroundColor Green
        }
    }
}

# STEP 2: Create Google Drive authentication
if (-not $Quiet) {
    Write-Host "`n🔑 Step 2: Setting up Google Drive authentication..." -ForegroundColor Cyan
}

# Load client secret
$clientSecretJson = Get-Content $ClientSecretFile -Raw | ConvertFrom-Json
$clientId = $clientSecretJson.installed.client_id
$clientSecret = $clientSecretJson.installed.client_secret

# Create credentials file path
$CredentialsFile = "$ConfigDir\google-drive-credentials.json"

# Check if we already have credentials
if (Test-Path $CredentialsFile) {
    if (-not $Quiet) {
        Write-Host "Google Drive credentials already exist" -ForegroundColor Green
        Write-Host "Credentials file: $CredentialsFile" -ForegroundColor Gray
    }
    
    # Update config to mark Google Drive as configured
    $config.googleDrive.configured = $true
    $config.googleDrive.credentialsFile = $CredentialsFile
    $config.googleDrive.configuredAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigFile -Encoding UTF8 -Force
    
    if (-not $Quiet) {
        Write-Host "✅ Google Drive marked as configured in backup config" -ForegroundColor Green
    }
    
} else {
    if (-not $Quiet) {
        Write-Host "No existing credentials found" -ForegroundColor Yellow
        Write-Host "You need to authenticate with Google Drive" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "⚠️  MANUAL AUTHENTICATION REQUIRED:" -ForegroundColor Red
        Write-Host "1. A browser window will open for Google OAuth" -ForegroundColor Gray
        Write-Host "2. Log in with your Google account" -ForegroundColor Gray
        Write-Host "3. Grant permission for OpenClaw Backup to access Google Drive" -ForegroundColor Gray
        Write-Host "4. The credentials will be saved automatically" -ForegroundColor Gray
        Write-Host ""
        $confirm = Read-Host "Proceed with authentication? (Y/N)"
        
        if ($confirm -notmatch "^[Yy]") {
            Write-Host "Authentication cancelled" -ForegroundColor Yellow
            exit 0
        }
    }
    
    # Import required assemblies
    Add-Type -AssemblyName System.Web
    
    # Create OAuth 2.0 flow
    $scopes = @(
        "https://www.googleapis.com/auth/drive.file"  # Per-file access
    )
    
    # Create authorization code flow
    $initializer = New-Object Google.Apis.Auth.OAuth2.ClientSecrets
    $initializer.ClientId = $clientId
    $initializer.ClientSecret = $clientSecret
    
    $flow = New-Object Google.Apis.Auth.OAuth2.Flows.AuthorizationCodeFlow(
        (New-Object Google.Apis.Auth.OAuth2.Flows.AuthorizationCodeFlow+Initializer) {
            ClientSecrets = $initializer
            Scopes = $scopes
            DataStore = New-Object Google.Apis.Util.Store.FileDataStore($ConfigDir, $true)
        }
    )
    
    # Create authorization code request URL
    $authUri = $flow.CreateAuthorizationCodeRequest("http://localhost").Build()
    
    if (-not $Quiet) {
        Write-Host "Opening browser for authentication..." -ForegroundColor Yellow
    }
    
    # Open browser for authentication
    Start-Process $authUri
    
    # Get authorization code from user
    if (-not $Quiet) {
        Write-Host ""
        Write-Host "After granting permission, you'll get an authorization code." -ForegroundColor Gray
        Write-Host "Paste it here (or press Enter if page redirects automatically):" -ForegroundColor Gray
    }
    
    $authCode = Read-Host "Authorization code"
    
    if ([string]::IsNullOrEmpty($authCode)) {
        if (-not $Quiet) {
            Write-Host "Checking for automatic token exchange..." -ForegroundColor Yellow
        }
        
        # Try to get token from redirect (if user allowed automatic redirect)
        try {
            $credential = [Google.Apis.Auth.OAuth2.GoogleWebAuthorizationBroker]::AuthorizeAsync(
                $initializer,
                $scopes,
                "user",
                [System.Threading.CancellationToken]::None,
                (New-Object Google.Apis.Util.Store.FileDataStore($ConfigDir, $true))
            ).Result
            
            if (-not $Quiet) {
                Write-Host "✅ Automatic authentication successful!" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "❌ Authentication failed: $_" -ForegroundColor Red
            Write-Host "Please run setup again and paste the authorization code" -ForegroundColor Yellow
            exit 1
        }
    } else {
        # Exchange authorization code for tokens
        try {
            $tokenResponse = $flow.ExchangeCodeForTokenAsync("user", $authCode, "http://localhost", [System.Threading.CancellationToken]::None).Result
            
            # Create credential from token response
            $credential = New-Object Google.Apis.Auth.OAuth2.UserCredential($flow, "user", $tokenResponse)
            
            if (-not $Quiet) {
                Write-Host "✅ Manual authentication successful!" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "❌ Token exchange failed: $_" -ForegroundColor Red
            exit 1
        }
    }
    
    # Save credentials info to config
    $config.googleDrive.configured = $true
    $config.googleDrive.credentialsFile = $CredentialsFile
    $config.googleDrive.configuredAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigFile -Encoding UTF8 -Force
    
    if (-not $Quiet) {
        Write-Host "✅ Google Drive authentication configured!" -ForegroundColor Green
        Write-Host "Credentials saved to: $ConfigDir\" -ForegroundColor Gray
    }
}

# STEP 3: Test Google Drive connection
if (-not $Quiet) {
    Write-Host "`n🧪 Step 3: Testing Google Drive connection..." -ForegroundColor Cyan
}

try {
    # Import the Google Drive module
    Import-Module Google.Apis.Drive.v3 -ErrorAction Stop
    
    # Create Drive service
    $service = New-Object Google.Apis.Drive.v3.DriveService(
        (New-Object Google.Apis.Services.BaseClientService+Initializer) {
            HttpClientInitializer = $credential
            ApplicationName = "OpenClaw Backup System"
        }
    )
    
    # Test by getting about info
    $about = $service.About.Get()
    $about.Fields = "user,storageQuota"
    $aboutResult = $about.Execute()
    
    if (-not $Quiet) {
        Write-Host "✅ Google Drive connection successful!" -ForegroundColor Green
        Write-Host "User: $($aboutResult.User.DisplayName)" -ForegroundColor Gray
        Write-Host "Email: $($aboutResult.User.EmailAddress)" -ForegroundColor Gray
        Write-Host "Storage: $([math]::Round($aboutResult.StorageQuota.Limit / 1GB, 2)) GB total" -ForegroundColor Gray
        Write-Host "Used: $([math]::Round($aboutResult.StorageQuota.Usage / 1GB, 2)) GB" -ForegroundColor Gray
    }
    
    # STEP 4: Create OpenClaw backup folder if it doesn't exist
    if (-not $Quiet) {
        Write-Host "`n📁 Step 4: Creating backup folder in Google Drive..." -ForegroundColor Cyan
    }
    
    $folderName = "OpenClaw-Backups"
    
    # Check if folder already exists
    $listRequest = $service.Files.List()
    $listRequest.Q = "name='$folderName' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    $listRequest.Fields = "files(id, name)"
    $folders = $listRequest.Execute().Files
    
    if ($folders.Count -eq 0) {
        # Create folder
        $folderMetadata = New-Object Google.Apis.Drive.v3.Data.File
        $folderMetadata.Name = $folderName
        $folderMetadata.MimeType = "application/vnd.google-apps.folder"
        
        $createRequest = $service.Files.Create($folderMetadata)
        $createRequest.Fields = "id"
        $folder = $createRequest.Execute()
        
        $folderId = $folder.Id
        
        if (-not $Quiet) {
            Write-Host "✅ Created folder: $folderName (ID: $folderId)" -ForegroundColor Green
        }
    } else {
        $folderId = $folders[0].Id
        if (-not $Quiet) {
            Write-Host "✅ Folder already exists: $folderName (ID: $folderId)" -ForegroundColor Green
        }
    }
    
    # Save folder ID to config
    $config.googleDrive.folderId = $folderId
    $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigFile -Encoding UTF8 -Force
    
    if (-not $Quiet) {
        Write-Host "✅ Folder ID saved to configuration" -ForegroundColor Green
    }
    
    # STEP 5: Create upload test file
    if (-not $Quiet) {
        Write-Host "`n📤 Step 5: Testing file upload..." -ForegroundColor Cyan
    }
    
    # Create a small test file
    $TestFile = "$env:TEMP\openclaw-test-upload.txt"
    "OpenClaw Backup System Test - $(Get-Date)" | Out-File -FilePath $TestFile -Encoding UTF8
    
    # Upload test file
    $fileMetadata = New-Object Google.Apis.Drive.v3.Data.File
    $fileMetadata.Name = "openclaw-test-upload.txt"
    $fileMetadata.Parents = @($folderId)
    
    $fileStream = New-Object System.IO.FileStream($TestFile, [System.IO.FileMode]::Open)
    
    $uploadRequest = $service.Files.Create($fileMetadata, $fileStream, "text/plain")
    $uploadRequest.Fields = "id, name, size"
    $uploadedFile = $uploadRequest.Execute()
    
    $fileStream.Close()
    
    if (-not $Quiet) {
        Write-Host "✅ Test file uploaded successfully!" -ForegroundColor Green
        Write-Host "File: $($uploadedFile.Name)" -ForegroundColor Gray
        Write-Host "Size: $([math]::Round($uploadedFile.Size / 1KB, 2)) KB" -ForegroundColor Gray
        Write-Host "ID: $($uploadedFile.Id)" -ForegroundColor Gray
    }
    
    # Clean up test file
    Remove-Item $TestFile -Force -ErrorAction SilentlyContinue
    
    # Delete test file from Drive (optional)
    $deleteRequest = $service.Files.Delete($uploadedFile.Id)
    $deleteRequest.Execute() | Out-Null
    
    if (-not $Quiet) {
        Write-Host "✅ Test file cleaned up from Google Drive" -ForegroundColor Green
    }
    
    # Final success message
    if (-not $Quiet) {
        Write-Host "`n🎉 GOOGLE DRIVE SETUP COMPLETE!" -ForegroundColor Green
        Write-Host "==============================="
        Write-Host "✅ Authentication configured" -ForegroundColor Gray
        Write-Host "✅ Folder created: OpenClaw-Backups" -ForegroundColor Gray
        Write-Host "✅ Upload tested successfully" -ForegroundColor Gray
        Write-Host "✅ Configuration saved" -ForegroundColor Gray
        
        Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run encrypted backup: .\backup-encrypted.ps1" -ForegroundColor Yellow
        Write-Host "2. Check it creates encrypted .aes files" -ForegroundColor Gray
        Write-Host "3. The next version will auto-upload to Google Drive" -ForegroundColor Gray
        
        Write-Host "`n⚠️  Remember:" -ForegroundColor Red
        Write-Host "1. Backup your encryption key from: $ConfigDir\encryption.key" -ForegroundColor Red
        Write-Host "2. Without the key, encrypted backups are useless!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Google Drive test failed: $_" -ForegroundColor Red
    exit 1
}