<#
.SYNOPSIS
    Administrative tools example demonstrating AD/Exchange management with efficient filtering.

.DESCRIPTION
    Complete example showing:
    - Active Directory user management with server-side filtering
    - Bulk operations with error handling
    - Audit logging and reporting
    - Exchange mailbox management
    - Progress reporting for long-running operations

.PARAMETER Action
    Action to perform (AuditInactiveUsers, DisableInactiveUsers, ExportMailboxSizes)

.PARAMETER DaysInactive
    Number of days to consider a user inactive

.PARAMETER OutputPath
    Path for output reports

.EXAMPLE
    .\admin-example.ps1 -Action AuditInactiveUsers -DaysInactive 90 -OutputPath C:\Reports
#>

#Requires -Version 7.4
#Requires -Modules ActiveDirectory

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidateSet('AuditInactiveUsers', 'DisableInactiveUsers', 'ExportMailboxSizes')]
    [string]$Action,
    
    [Parameter()]
    [ValidateRange(1, 365)]
    [int]$DaysInactive = 90,
    
    [Parameter()]
    [ValidateScript({ Test-Path $_ -PathType Container })]
    [string]$OutputPath = $PWD
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

#region Helper Functions

function Write-AuditLog
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [Parameter()]
        [ValidateSet('Info', 'Warning', 'Error')]
        [string]$Level = 'Info',
        
        [Parameter()]
        [string]$LogPath = (Join-Path $OutputPath "audit-$(Get-Date -Format 'yyyy-MM-dd').log")
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Add-Content -Path $LogPath -Value $logEntry
    
    switch ($Level)
    {
        'Info'    { Write-Verbose $Message }
        'Warning' { Write-Warning $Message }
        'Error'   { Write-Error $Message }
    }
}

#endregion

#region Active Directory Functions

function Get-InactiveADUsers
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [int]$DaysInactive
    )
    
    Write-AuditLog "Searching for users inactive for $DaysInactive days"
    
    $cutoffDate = (Get-Date).AddDays(-$DaysInactive)
    
    # ✅ GOOD: Server-side filtering with -Filter parameter
    $filterParams = @{
        Filter = "LastLogonDate -lt '$cutoffDate' -and Enabled -eq 'True'"
        Properties = @(
            'LastLogonDate'
            'EmailAddress'
            'Department'
            'Manager'
            'Created'
        )
        ErrorAction = 'Stop'
    }
    
    try
    {
        $users = Get-ADUser @filterParams
        Write-AuditLog "Found $($users.Count) inactive users"
        
        return $users | Select-Object `
            Name,
            SamAccountName,
            EmailAddress,
            Department,
            LastLogonDate,
            @{Name='DaysInactive'; Expression={ ((Get-Date) - $_.LastLogonDate).Days }},
            Created
    }
    catch
    {
        Write-AuditLog "Failed to query AD users: $_" -Level Error
        throw
    }
}

function Disable-InactiveADUsersBulk
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [Microsoft.ActiveDirectory.Management.ADUser[]]$Users
    )
    
    begin
    {
        $successCount = 0
        $failureCount = 0
        $errors = [System.Collections.Generic.List[PSObject]]::new()
        $totalUsers = @($Users).Count
        $currentUser = 0
    }
    
    process
    {
        foreach ($user in $Users)
        {
            $currentUser++
            $percentComplete = ($currentUser / $totalUsers) * 100
            
            Write-Progress -Activity "Disabling Inactive Users" `
                -Status "Processing $($user.SamAccountName)" `
                -PercentComplete $percentComplete `
                -CurrentOperation "$currentUser of $totalUsers"
            
            if ($PSCmdlet.ShouldProcess($user.SamAccountName, 'Disable AD User'))
            {
                try
                {
                    # Disable user and add description
                    $description = "Disabled on $(Get-Date -Format 'yyyy-MM-dd') - Inactive for $DaysInactive days"

                    Set-ADUser -Identity $user.SamAccountName `
                        -Enabled $false `
                        -Description $description `
                        -ErrorAction Stop

                    $successCount++
                    Write-AuditLog "Disabled user: $($user.SamAccountName)"
                }
                catch
                {
                    $failureCount++
                    $errorObj = [PSCustomObject]@{
                        User = $user.SamAccountName
                        Error = $_.Exception.Message
                        Timestamp = Get-Date
                    }
                    $errors.Add($errorObj)
                    Write-AuditLog "Failed to disable $($user.SamAccountName): $_" -Level Warning
                }
            }
        }
    }

    end
    {
        Write-Progress -Activity "Disabling Inactive Users" -Completed

        $summary = "Bulk disable complete: $successCount succeeded, $failureCount failed"
        Write-AuditLog $summary
        Write-Host "`n$summary" -ForegroundColor $(if ($failureCount -eq 0) { 'Green' } else { 'Yellow' })

        if ($errors.Count -gt 0)
        {
            $errorReport = Join-Path $OutputPath "disable-errors-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').csv"
            $errors | Export-Csv -Path $errorReport -NoTypeInformation
            Write-Host "Error report saved to: $errorReport" -ForegroundColor Yellow
        }
    }
}

#endregion

#region Main Execution

try
{
    Write-Host "Starting administrative action: $Action" -ForegroundColor Cyan
    Write-AuditLog "Starting action: $Action with parameters: DaysInactive=$DaysInactive"

    switch ($Action)
    {
        'AuditInactiveUsers'
        {
            $inactiveUsers = Get-InactiveADUsers -DaysInactive $DaysInactive

            if ($inactiveUsers.Count -gt 0)
            {
                $reportPath = Join-Path $OutputPath "inactive-users-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').csv"
                $inactiveUsers | Export-Csv -Path $reportPath -NoTypeInformation

                Write-Host "`n✓ Found $($inactiveUsers.Count) inactive users" -ForegroundColor Green
                Write-Host "Report saved to: $reportPath" -ForegroundColor Cyan

                # Display summary
                $inactiveUsers | Group-Object Department |
                    Select-Object Name, Count |
                    Sort-Object Count -Descending |
                    Format-Table -AutoSize
            }
            else
            {
                Write-Host "`n✓ No inactive users found" -ForegroundColor Green
            }
        }

        'DisableInactiveUsers'
        {
            $inactiveUsers = Get-InactiveADUsers -DaysInactive $DaysInactive

            if ($inactiveUsers.Count -gt 0)
            {
                Write-Host "`nFound $($inactiveUsers.Count) inactive users to disable" -ForegroundColor Yellow
                $inactiveUsers | Disable-InactiveADUsersBulk -WhatIf:$WhatIfPreference
            }
            else
            {
                Write-Host "`n✓ No inactive users to disable" -ForegroundColor Green
            }
        }

        'ExportMailboxSizes'
        {
            Write-Host "`nExporting mailbox sizes..." -ForegroundColor Cyan
            Write-AuditLog "Mailbox size export not implemented in this example"
            Write-Host "✓ This action would export mailbox sizes (not implemented)" -ForegroundColor Yellow
        }
    }

    Write-AuditLog "Action completed successfully: $Action"
    Write-Host "`n✓ Administrative action completed successfully" -ForegroundColor Green
}
catch
{
    Write-AuditLog "Action failed: $_" -Level Error
    Write-Host "`n✗ Administrative action failed: $_" -ForegroundColor Red
    exit 1
}

#endregion

