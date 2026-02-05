# backup-git.ps1 - Automatic Git Backup for OpenClaw Workspace
# Part of Backup & Recovery System - Phase 2: GitHub Repository Backup
# This script automatically commits and pushes workspace changes to GitHub

param(
    [string]$CommitMessage = "Auto-backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [switch]$Force = $false,
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

# Configuration
$WorkspacePath = "C:\Users\Home\.openclaw\workspace"
$LogFile = "C:\Users\Home\.openclaw\workspace\memory\git-backup-log.md"
$MaxCommitSizeMB = 50  # Safety limit for actual committed files (after .gitignore)

# Colors for console output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "**$timestamp** [$Level] $Message"
    
    # Ensure log directory exists
    $logDir = Split-Path -Path $LogFile -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Append to log file
    Add-Content -Path $LogFile -Value $logEntry
    
    # Also output to console if verbose mode is enabled
    if ($Verbose -or $Level -eq "ERROR" -or $Level -eq "WARNING") {
        switch ($Level) {
            "ERROR" { Write-ColorOutput $Message $ErrorColor }
            "WARNING" { Write-ColorOutput $Message $WarningColor }
            "SUCCESS" { Write-ColorOutput $Message $SuccessColor }
            default { Write-ColorOutput $Message $InfoColor }
        }
    }
}

function Test-GitAvailable {
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            Write-Log "Git is available: $gitVersion" "INFO"
            return $true
        }
    }
    catch {
        Write-Log "Git is not available or not in PATH" "ERROR"
        return $false
    }
    return $false
}

function Test-GitRepository {
    param([string]$Path)
    
    try {
        Push-Location $Path
        $gitDir = git rev-parse --git-dir 2>$null
        Pop-Location
        
        if ($gitDir) {
            Write-Log "Git repository found at: $Path" "INFO"
            return $true
        }
    }
    catch {
        Pop-Location
    }
    
    Write-Log "Not a git repository: $Path" "ERROR"
    return $false
}

function Get-GitStatus {
    param([string]$Path)
    
    try {
        Push-Location $Path
        $status = git status --porcelain
        $branch = git branch --show-current
        $remote = git remote get-url origin
        Pop-Location
        
        return @{
            HasChanges = ($status.Count -gt 0)
            ChangeCount = $status.Count
            Branch = $branch
            Remote = $remote
            StatusLines = $status
        }
    }
    catch {
        Pop-Location
        return $null
    }
}

function Get-WorkspaceSize {
    param([string]$Path)
    
    try {
        # Get size of files that would actually be committed (respects .gitignore)
        # We'll check what files are tracked or would be added
        Push-Location $Path
        
        # Get list of files that would be committed (already tracked + new files not ignored)
        $trackedFiles = git ls-files 2>$null
        $untrackedFiles = git status --porcelain 2>$null | Where-Object { $_ -match '^\?\? ' } | ForEach-Object { $_.Substring(3) }
        
        # Combine and get unique files
        $allFiles = @($trackedFiles) + @($untrackedFiles) | Select-Object -Unique
        
        $totalSize = 0
        foreach ($file in $allFiles) {
            if (Test-Path $file) {
                $fileInfo = Get-Item $file -Force -ErrorAction SilentlyContinue
                if ($fileInfo) {
                    $totalSize += $fileInfo.Length
                }
            }
        }
        
        Pop-Location
        
        $sizeMB = [math]::Round($totalSize / 1MB, 2)
        return $sizeMB
    }
    catch {
        Pop-Location
        return 0
    }
}

function Backup-ToGitHub {
    param([string]$Path, [string]$Message, [bool]$ForceCommit)
    
    Write-Log "Starting GitHub backup..." "INFO"
    Write-Log "Workspace: $Path" "INFO"
    Write-Log "Commit message: $Message" "INFO"
    
    # Check if git is available
    if (-not (Test-GitAvailable)) {
        Write-Log "Git is not available. Please install Git and ensure it's in your PATH." "ERROR"
        return $false
    }
    
    # Check if we're in a git repository
    if (-not (Test-GitRepository -Path $Path)) {
        Write-Log "The workspace is not a git repository. Please initialize git first." "ERROR"
        return $false
    }
    
    # Get current status
    $status = Get-GitStatus -Path $Path
    if (-not $status) {
        Write-Log "Failed to get git status" "ERROR"
        return $false
    }
    
    Write-Log "Current branch: $($status.Branch)" "INFO"
    Write-Log "Remote: $($status.Remote)" "INFO"
    
    if (-not $status.HasChanges -and -not $ForceCommit) {
        Write-Log "No changes to commit. Skipping backup." "INFO"
        return $true
    }
    
    Write-Log "Found $($status.ChangeCount) changed files" "INFO"
    
    # Check workspace size (safety measure)
    $workspaceSizeMB = Get-WorkspaceSize -Path $Path
    Write-Log "Workspace size: ${workspaceSizeMB}MB" "INFO"
    
    if ($workspaceSizeMB -gt $MaxCommitSizeMB) {
        Write-Log "Workspace size (${workspaceSizeMB}MB) exceeds safety limit (${MaxCommitSizeMB}MB). Aborting." "WARNING"
        Write-Log "Consider using .gitignore to exclude large files or split the backup." "WARNING"
        return $false
    }
    
    # Show what's being changed (first 10 files)
    if ($status.StatusLines.Count -gt 0) {
        Write-Log "Changes to commit:" "INFO"
        $status.StatusLines | Select-Object -First 10 | ForEach-Object {
            Write-Log "  $_" "INFO"
        }
        if ($status.StatusLines.Count -gt 10) {
            Write-Log "  ... and $($status.StatusLines.Count - 10) more files" "INFO"
        }
    }
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would commit and push changes" "INFO"
        return $true
    }
    
    try {
        Push-Location $Path
        
        # Stage all changes
        Write-Log "Staging changes..." "INFO"
        git add -A 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to stage changes" "ERROR"
            Pop-Location
            return $false
        }
        
        # Commit changes
        Write-Log "Committing changes..." "INFO"
        git commit -m $Message 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to commit changes" "ERROR"
            Pop-Location
            return $false
        }
        
        # Get the commit hash
        $commitHash = git rev-parse --short HEAD 2>&1
        Write-Log "Committed with hash: $commitHash" "SUCCESS"
        
        # Push to remote
        Write-Log "Pushing to remote repository..." "INFO"
        git push origin $($status.Branch) 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to push to remote. Trying with --force if specified..." "WARNING"
            
            if ($Force) {
                git push origin $($status.Branch) --force 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    Write-Log "Failed to force push to remote" "ERROR"
                    Pop-Location
                    return $false
                }
                Write-Log "Force push successful" "SUCCESS"
            } else {
                Write-Log "Push failed. Use -Force flag to force push." "ERROR"
                Pop-Location
                return $false
            }
        } else {
            Write-Log "Push successful" "SUCCESS"
        }
        
        Pop-Location
        
        # Log success
        Write-Log "GitHub backup completed successfully!" "SUCCESS"
        Write-Log "Commit: $commitHash" "SUCCESS"
        Write-Log "Message: $Message" "SUCCESS"
        Write-Log "Files: $($status.ChangeCount)" "SUCCESS"
        
        return $true
    }
    catch {
        Write-Log "Error during backup: $_" "ERROR"
        Pop-Location
        return $false
    }
}

# Main execution
Write-Log "=== OpenClaw Git Backup Started ===" "INFO"
Write-Log "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "INFO"
Write-Log "Workspace: $WorkspacePath" "INFO"

# Create log file header if it doesn't exist
if (-not (Test-Path $LogFile)) {
    $logHeader = @"
# Git Backup Log

This file tracks automatic git backups of the OpenClaw workspace.

## Backup Statistics
- **Total backups:** 0
- **Last successful:** Never
- **Last failure:** Never

## Backup History

"@
    Add-Content -Path $LogFile -Value $logHeader
}

# Perform the backup
$success = Backup-ToGitHub -Path $WorkspacePath -Message $CommitMessage -ForceCommit $Force

if ($success) {
    Write-Log "=== Backup Completed Successfully ===" "SUCCESS"
    
    # Update backup statistics in log
    $logContent = Get-Content -Path $LogFile -Raw
    if ($logContent -match "Total backups: (\d+)") {
        $currentCount = [int]$matches[1]
        $newCount = $currentCount + 1
        $logContent = $logContent -replace "Total backups: $currentCount", "Total backups: $newCount"
        $logContent = $logContent -replace "Last successful: [^\n]*", "Last successful: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Set-Content -Path $LogFile -Value $logContent
    }
    
    exit 0
} else {
    Write-Log "=== Backup Failed ===" "ERROR"
    
    # Update failure statistics in log
    $logContent = Get-Content -Path $LogFile -Raw
    if ($logContent -match "Last failure: [^\n]*") {
        $logContent = $logContent -replace "Last failure: [^\n]*", "Last failure: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Set-Content -Path $LogFile -Value $logContent
    }
    
    exit 1
}