# PowerShell Automation Scripts

Best practices for task automation, scheduled tasks, and output formatting.

## Script Structure

### Complete Automation Script Template

```powershell
#Requires -Version 7.4
<#
.SYNOPSIS
    Brief description of what the script does

.DESCRIPTION
    Detailed description of the script's purpose and functionality

.PARAMETER LogPath
    Path to the log file

.PARAMETER EmailRecipient
    Email address for notifications

.EXAMPLE
    .\Backup-Database.ps1 -LogPath "C:\Logs\backup.log"

.NOTES
    Author: Your Name
    Date: 2024-01-30
    Version: 1.0
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path (Split-Path $_) })]
    [string]$LogPath,
    
    [Parameter()]
    [ValidatePattern('^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')]
    [string]$EmailRecipient
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Script logic here
```

## Logging

### Structured Logging Function

```powershell
function Write-AutomationLog
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [ValidateSet('Info', 'Warning', 'Error', 'Success')]
        [string]$Level = 'Info',
        
        [string]$LogPath = "$PSScriptRoot\automation.log"
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with color
    switch ($Level)
    {
        'Info'    { Write-Host $logEntry -ForegroundColor Cyan }
        'Warning' { Write-Warning $logEntry }
        'Error'   { Write-Error $logEntry }
        'Success' { Write-Host $logEntry -ForegroundColor Green }
    }
    
    # File output
    Add-Content -Path $LogPath -Value $logEntry
}

# Usage
Write-AutomationLog -Message "Starting backup process" -Level Info
Write-AutomationLog -Message "Backup completed successfully" -Level Success
```

## Error Handling for Automation

### Robust Error Handling

```powershell
try
{
    Write-AutomationLog "Starting database backup"
    
    # Backup logic
    Backup-SqlDatabase -ServerInstance "localhost" -Database "MyDB"
    
    Write-AutomationLog "Backup completed successfully" -Level Success
}
catch
{
    $errorMessage = "Backup failed: $($_.Exception.Message)"
    Write-AutomationLog $errorMessage -Level Error
    
    # Send notification
    Send-MailMessage -To $EmailRecipient -Subject "Backup Failed" -Body $errorMessage
    
    # Exit with error code
    exit 1
}
finally
{
    Write-AutomationLog "Backup process finished"
}
```

## Scheduled Task Integration

### Create Scheduled Task

```powershell
# Register scheduled task
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
    -Argument '-NoProfile -ExecutionPolicy Bypass -File "C:\Scripts\Backup-Database.ps1"'

$trigger = New-ScheduledTaskTrigger -Daily -At 2am

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "Daily Database Backup" `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Automated daily database backup"
```

### Script for Scheduled Execution

```powershell
#Requires -Version 7.4
#Requires -RunAsAdministrator

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Set up transcript logging
$transcriptPath = "C:\Logs\Backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
Start-Transcript -Path $transcriptPath

try
{
    # Your automation logic
    Write-Output "Starting automated task at $(Get-Date)"
    
    # Perform work
    
    Write-Output "Task completed successfully at $(Get-Date)"
    exit 0
}
catch
{
    Write-Error "Task failed: $_"
    exit 1
}
finally
{
    Stop-Transcript
}
```

## Output Formatting

### Structured Output

```powershell
# Return objects, not strings
function Get-BackupStatus
{
    [CmdletBinding()]
    param()
    
    [PSCustomObject]@{
        Timestamp = Get-Date
        Status = 'Success'
        FilesBackedUp = 150
        TotalSize = '2.5 GB'
        Duration = '00:05:23'
    }
}

# Usage
$status = Get-BackupStatus
$status | Format-Table
$status | Export-Csv -Path "backup-status.csv" -NoTypeInformation
$status | ConvertTo-Json | Out-File "backup-status.json"
```

### Progress Reporting

```powershell
$items = 1..100
$totalItems = $items.Count

foreach ($i in 0..($totalItems - 1))
{
    $percentComplete = ($i / $totalItems) * 100
    
    Write-Progress -Activity "Processing Items" `
        -Status "Processing item $($i + 1) of $totalItems" `
        -PercentComplete $percentComplete
    
    # Process item
    Start-Sleep -Milliseconds 100
}

Write-Progress -Activity "Processing Items" -Completed
```

## Best Practices

1. **Use comment-based help** - Document all parameters and examples
2. **Enable strict mode** - Catch errors early
3. **Implement logging** - Track execution and errors
4. **Handle errors gracefully** - Use try/catch/finally
5. **Return objects** - Not formatted strings
6. **Use transcript logging** - For scheduled tasks
7. **Set exit codes** - 0 for success, non-zero for failure
8. **Validate parameters** - Use validation attributes
9. **Send notifications** - Email or webhook on failure
10. **Test thoroughly** - Before scheduling

