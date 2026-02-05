# schedule-git-backup.ps1 - Windows Task Scheduler setup for automatic git backups
# This script creates a scheduled task that runs daily git backups

param(
    [switch]$CreateTask = $false,
    [switch]$DeleteTask = $false,
    [switch]$TestTask = $false,
    [switch]$ListTasks = $false
)

$TaskName = "OpenClaw Git Backup"
$TaskDescription = "Daily automatic git backup of OpenClaw workspace to GitHub"
$ScriptPath = "C:\Users\Home\.openclaw\workspace\backup-git.ps1"
$WorkingDirectory = "C:\Users\Home\.openclaw\workspace"
$TriggerTime = "23:30"  # 11:30 PM daily
$Author = "OpenClaw Backup System"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Create-ScheduledTask {
    Write-ColorOutput "Creating scheduled task: $TaskName" "Cyan"
    
    if (-not (Test-Administrator)) {
        Write-ColorOutput "ERROR: This script requires Administrator privileges to create scheduled tasks." "Red"
        Write-ColorOutput "Please run PowerShell as Administrator and try again." "Yellow"
        return $false
    }
    
    if (-not (Test-Path $ScriptPath)) {
        Write-ColorOutput "ERROR: Backup script not found at: $ScriptPath" "Red"
        return $false
    }
    
    try {
        # Define the action (what to run)
        $action = New-ScheduledTaskAction `
            -Execute "powershell.exe" `
            -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`"" `
            -WorkingDirectory $WorkingDirectory
        
        # Define the trigger (when to run)
        $trigger = New-ScheduledTaskTrigger `
            -Daily `
            -At $TriggerTime
        
        # Define task settings
        $settings = New-ScheduledTaskSettingsSet `
            -AllowStartIfOnBatteries `
            -DontStopIfGoingOnBatteries `
            -StartWhenAvailable `
            -WakeToRun `
            -RestartCount 3 `
            -RestartInterval (New-TimeSpan -Minutes 5)
        
        # Define task principal (who runs it)
        $principal = New-ScheduledTaskPrincipal `
            -UserId "SYSTEM" `
            -LogonType ServiceAccount `
            -RunLevel Highest
        
        # Register the task
        Register-ScheduledTask `
            -TaskName $TaskName `
            -Action $action `
            -Trigger $trigger `
            -Settings $settings `
            -Principal $principal `
            -Description $TaskDescription `
            -Force
        
        Write-ColorOutput "SUCCESS: Scheduled task created successfully!" "Green"
        Write-ColorOutput "Task Name: $TaskName" "White"
        Write-ColorOutput "Runs Daily At: $TriggerTime" "White"
        Write-ColorOutput "Script: $ScriptPath" "White"
        Write-ColorOutput "Working Directory: $WorkingDirectory" "White"
        
        return $true
    }
    catch {
        Write-ColorOutput "ERROR: Failed to create scheduled task: $_" "Red"
        return $false
    }
}

function Delete-ScheduledTask {
    Write-ColorOutput "Deleting scheduled task: $TaskName" "Cyan"
    
    if (-not (Test-Administrator)) {
        Write-ColorOutput "ERROR: This script requires Administrator privileges to delete scheduled tasks." "Red"
        return $false
    }
    
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
        Write-ColorOutput "SUCCESS: Scheduled task deleted successfully!" "Green"
        return $true
    }
    catch {
        Write-ColorOutput "ERROR: Failed to delete scheduled task: $_" "Red"
        return $false
    }
}

function Test-ScheduledTask {
    Write-ColorOutput "Testing scheduled task execution..." "Cyan"
    
    try {
        # Test running the backup script directly
        Write-ColorOutput "Running backup script in test mode..." "White"
        $result = powershell -ExecutionPolicy Bypass -File $ScriptPath -DryRun -Verbose
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "SUCCESS: Backup script test passed!" "Green"
            return $true
        } else {
            Write-ColorOutput "ERROR: Backup script test failed with exit code: $LASTEXITCODE" "Red"
            return $false
        }
    }
    catch {
        Write-ColorOutput "ERROR: Failed to test backup script: $_" "Red"
        return $false
    }
}

function List-ScheduledTasks {
    Write-ColorOutput "Listing OpenClaw related scheduled tasks..." "Cyan"
    
    try {
        $tasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*OpenClaw*" -or $_.TaskName -like "*Claw*" }
        
        if ($tasks.Count -eq 0) {
            Write-ColorOutput "No OpenClaw related tasks found." "Yellow"
        } else {
            foreach ($task in $tasks) {
                Write-ColorOutput "`nTask Name: $($task.TaskName)" "White"
                Write-ColorOutput "State: $($task.State)" "White"
                Write-ColorOutput "Description: $($task.Description)" "White"
                
                # Get trigger information
                $triggers = $task.Triggers
                if ($triggers) {
                    foreach ($trigger in $triggers) {
                        if ($trigger.DaysInterval) {
                            Write-ColorOutput "Schedule: Daily at $($trigger.StartBoundary.ToString('HH:mm'))" "White"
                        } elseif ($trigger.Repetition) {
                            Write-ColorOutput "Schedule: Repeating every $($trigger.Repetition.Interval)" "White"
                        }
                    }
                }
            }
        }
        
        return $true
    }
    catch {
        Write-ColorOutput "ERROR: Failed to list scheduled tasks: $_" "Red"
        return $false
    }
}

function Show-Usage {
    Write-ColorOutput "`nOpenClaw Git Backup Scheduler" "Cyan"
    Write-ColorOutput "==============================" "Cyan"
    Write-ColorOutput "Usage:" "White"
    Write-ColorOutput "  .\schedule-git-backup.ps1 -CreateTask    # Create daily scheduled task" "White"
    Write-ColorOutput "  .\schedule-git-backup.ps1 -DeleteTask    # Delete scheduled task" "White"
    Write-ColorOutput "  .\schedule-git-backup.ps1 -TestTask      # Test backup script" "White"
    Write-ColorOutput "  .\schedule-git-backup.ps1 -ListTasks     # List OpenClaw tasks" "White"
    Write-ColorOutput "`nNote: -CreateTask and -DeleteTask require Administrator privileges." "Yellow"
}

# Main execution
Write-ColorOutput "`n=== OpenClaw Git Backup Scheduler ===" "Cyan"
Write-ColorOutput "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "White"

if ($CreateTask) {
    $success = Create-ScheduledTask
    if ($success) {
        Write-ColorOutput "`nNext steps:" "Cyan"
        Write-ColorOutput "1. Task will run daily at $TriggerTime" "White"
        Write-ColorOutput "2. Check memory\git-backup-log.md for backup history" "White"
        Write-ColorOutput "3. Manual backup: run backup-git.bat" "White"
    }
}
elseif ($DeleteTask) {
    Delete-ScheduledTask
}
elseif ($TestTask) {
    Test-ScheduledTask
}
elseif ($ListTasks) {
    List-ScheduledTasks
}
else {
    Show-Usage
}

Write-ColorOutput "`n=== Script Complete ===" "Cyan"