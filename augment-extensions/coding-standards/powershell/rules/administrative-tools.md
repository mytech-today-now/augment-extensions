# PowerShell Administrative Tools

Best practices for AD, Exchange, SQL management, filtering, and bulk operations.

## Active Directory Management

### Efficient User Queries

```powershell
#Requires -Modules ActiveDirectory

# ✅ GOOD: Server-side filtering with -Filter
function Get-InactiveADUsers
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [int]$DaysInactive = 90,
        
        [Parameter()]
        [string]$SearchBase
    )
    
    $cutoffDate = (Get-Date).AddDays(-$DaysInactive)
    
    $params = @{
        Filter = "LastLogonDate -lt '$cutoffDate' -and Enabled -eq 'True'"
        Properties = 'LastLogonDate', 'EmailAddress', 'Department'
        ErrorAction = 'Stop'
    }
    
    if ($SearchBase)
    {
        $params['SearchBase'] = $SearchBase
    }
    
    Get-ADUser @params | Select-Object Name, SamAccountName, LastLogonDate, EmailAddress, Department
}

# ❌ BAD: Client-side filtering with Where-Object
# Get-ADUser -Filter * | Where-Object { $_.LastLogonDate -lt $cutoffDate }
```

### Bulk User Operations

```powershell
function Update-ADUsersBulk
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [Microsoft.ActiveDirectory.Management.ADUser[]]$Users,
        
        [Parameter(Mandatory)]
        [hashtable]$Properties
    )
    
    begin
    {
        $successCount = 0
        $failureCount = 0
        $errors = @()
    }
    
    process
    {
        foreach ($user in $Users)
        {
            if ($PSCmdlet.ShouldProcess($user.SamAccountName, 'Update AD User'))
            {
                try
                {
                    Set-ADUser -Identity $user.SamAccountName @Properties -ErrorAction Stop
                    $successCount++
                    Write-Verbose "Updated user: $($user.SamAccountName)"
                }
                catch
                {
                    $failureCount++
                    $errors += [PSCustomObject]@{
                        User = $user.SamAccountName
                        Error = $_.Exception.Message
                    }
                    Write-Warning "Failed to update $($user.SamAccountName): $_"
                }
            }
        }
    }
    
    end
    {
        Write-Output "Bulk update complete: $successCount succeeded, $failureCount failed"
        if ($errors.Count -gt 0)
        {
            Write-Output "Errors:"
            $errors | Format-Table -AutoSize
        }
    }
}

# Usage
Get-InactiveADUsers -DaysInactive 90 | Update-ADUsersBulk -Properties @{ Department = 'Inactive' }
```

### Group Membership Management

```powershell
function Add-ADUserToGroupsBulk
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$UserName,
        
        [Parameter(Mandatory)]
        [string[]]$GroupNames
    )
    
    try
    {
        $user = Get-ADUser -Identity $UserName -ErrorAction Stop
        
        foreach ($groupName in $GroupNames)
        {
            if ($PSCmdlet.ShouldProcess($groupName, "Add $UserName to group"))
            {
                try
                {
                    Add-ADGroupMember -Identity $groupName -Members $user -ErrorAction Stop
                    Write-Verbose "Added $UserName to $groupName"
                }
                catch
                {
                    Write-Warning "Failed to add to $groupName: $_"
                }
            }
        }
    }
    catch
    {
        Write-Error "User not found: $UserName"
        throw
    }
}
```

## Exchange Management

### Mailbox Operations

```powershell
#Requires -Modules ExchangeOnlineManagement

function Get-LargeMailboxes
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [int]$SizeThresholdGB = 50
    )
    
    $thresholdBytes = $SizeThresholdGB * 1GB
    
    Get-Mailbox -ResultSize Unlimited | ForEach-Object {
        $stats = Get-MailboxStatistics -Identity $_.Identity
        
        if ($stats.TotalItemSize.Value.ToBytes() -gt $thresholdBytes)
        {
            [PSCustomObject]@{
                DisplayName = $_.DisplayName
                PrimarySmtpAddress = $_.PrimarySmtpAddress
                SizeGB = [math]::Round($stats.TotalItemSize.Value.ToBytes() / 1GB, 2)
                ItemCount = $stats.ItemCount
                LastLogonTime = $stats.LastLogonTime
            }
        }
    }
}
```

### Distribution List Management

```powershell
function Export-DistributionListMembers
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$GroupName,

        [Parameter(Mandatory)]
        [string]$OutputPath
    )

    try
    {
        $members = Get-DistributionGroupMember -Identity $GroupName -ResultSize Unlimited

        $members | Select-Object DisplayName, PrimarySmtpAddress, RecipientType |
            Export-Csv -Path $OutputPath -NoTypeInformation

        Write-Output "Exported $($members.Count) members to $OutputPath"
    }
    catch
    {
        Write-Error "Failed to export distribution list: $_"
        throw
    }
}
```

## SQL Server Management

### Database Queries

```powershell
#Requires -Modules SqlServer

function Invoke-SQLQueryWithRetry
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ServerInstance,

        [Parameter(Mandatory)]
        [string]$Database,

        [Parameter(Mandatory)]
        [string]$Query,

        [Parameter()]
        [int]$QueryTimeout = 30,

        [Parameter()]
        [int]$MaxRetries = 3
    )

    $attempt = 0

    while ($attempt -lt $MaxRetries)
    {
        $attempt++

        try
        {
            $params = @{
                ServerInstance = $ServerInstance
                Database = $Database
                Query = $Query
                QueryTimeout = $QueryTimeout
                ErrorAction = 'Stop'
            }

            $result = Invoke-Sqlcmd @params
            return $result
        }
        catch
        {
            Write-Warning "Query attempt $attempt failed: $_"

            if ($attempt -lt $MaxRetries)
            {
                Start-Sleep -Seconds 2
            }
            else
            {
                throw
            }
        }
    }
}
```

### Database Backup

```powershell
function Backup-SQLDatabaseWithValidation
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ServerInstance,

        [Parameter(Mandatory)]
        [string]$Database,

        [Parameter(Mandatory)]
        [string]$BackupPath
    )

    try
    {
        $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
        $backupFile = Join-Path $BackupPath "$Database`_$timestamp.bak"

        # Perform backup
        Backup-SqlDatabase -ServerInstance $ServerInstance `
                          -Database $Database `
                          -BackupFile $backupFile `
                          -CompressionOption On `
                          -ErrorAction Stop

        Write-Verbose "Backup created: $backupFile"

        # Verify backup
        $verifyQuery = "RESTORE VERIFYONLY FROM DISK = '$backupFile'"
        Invoke-Sqlcmd -ServerInstance $ServerInstance -Query $verifyQuery -ErrorAction Stop

        Write-Output "Backup verified successfully: $backupFile"

        return $backupFile
    }
    catch
    {
        Write-Error "Backup failed: $_"
        throw
    }
}
```

## Auditing and Logging

### Comprehensive Audit Logging

```powershell
function Write-AuditLog
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Info', 'Warning', 'Error', 'Success')]
        [string]$Level,

        [Parameter(Mandatory)]
        [string]$Message,

        [Parameter()]
        [string]$LogPath = 'C:\Logs\AdminTools.log',

        [Parameter()]
        [hashtable]$AdditionalData = @{}
    )

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $computer = $env:COMPUTERNAME

    $logEntry = [PSCustomObject]@{
        Timestamp = $timestamp
        Level = $Level
        User = $user
        Computer = $computer
        Message = $Message
        AdditionalData = ($AdditionalData | ConvertTo-Json -Compress)
    }

    # Ensure log directory exists
    $logDir = Split-Path $LogPath
    if (-not (Test-Path $logDir))
    {
        New-Item -Path $logDir -ItemType Directory -Force | Out-Null
    }

    # Write to log file
    $logEntry | Export-Csv -Path $LogPath -Append -NoTypeInformation

    # Also write to appropriate stream
    switch ($Level)
    {
        'Info' { Write-Verbose $Message }
        'Warning' { Write-Warning $Message }
        'Error' { Write-Error $Message }
        'Success' { Write-Output $Message }
    }
}
```

### Change Tracking

```powershell
function Invoke-AdminTaskWithAudit
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$TaskName,

        [Parameter(Mandatory)]
        [scriptblock]$ScriptBlock,

        [Parameter()]
        [hashtable]$Parameters = @{}
    )

    $startTime = Get-Date

    Write-AuditLog -Level Info -Message "Starting task: $TaskName" -AdditionalData $Parameters

    try
    {
        $result = & $ScriptBlock
        $duration = (Get-Date) - $startTime

        Write-AuditLog -Level Success -Message "Task completed: $TaskName" -AdditionalData @{
            Duration = $duration.TotalSeconds
            Result = ($result | ConvertTo-Json -Compress -Depth 2)
        }

        return $result
    }
    catch
    {
        $duration = (Get-Date) - $startTime

        Write-AuditLog -Level Error -Message "Task failed: $TaskName" -AdditionalData @{
            Duration = $duration.TotalSeconds
            Error = $_.Exception.Message
        }

        throw
    }
}
```

## Best Practices

1. **Use server-side filtering** - Filter with -Filter parameter, not Where-Object
2. **Implement bulk operations** - Process multiple items efficiently
3. **Add comprehensive logging** - Track all administrative actions
4. **Use ShouldProcess** - For all destructive operations
5. **Implement retry logic** - Handle transient failures
6. **Validate before execution** - Check prerequisites
7. **Export results** - Save operation results for auditing
8. **Use specific properties** - Don't retrieve all properties unnecessarily
9. **Handle errors gracefully** - Continue processing on individual failures
10. **Document changes** - Maintain audit trail of all modifications


