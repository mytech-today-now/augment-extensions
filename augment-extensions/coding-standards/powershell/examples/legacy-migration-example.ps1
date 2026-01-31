<#
.SYNOPSIS
    Before/after migration example showing Windows PowerShell to PowerShell Core migration.

.DESCRIPTION
    Complete example demonstrating:
    - Migration from Windows PowerShell 5.1 to PowerShell 7.4+
    - WMI to CIM cmdlet migration
    - Deprecated feature replacement
    - Cross-platform compatibility improvements
    - Version detection and compatibility checks

    This file shows BEFORE and AFTER versions of common patterns.

.NOTES
    Migration Guide:
    1. Replace Get-WmiObject with Get-CimInstance
    2. Replace ConvertTo-SecureString -AsPlainText with SecureString
    3. Replace Windows-only cmdlets with cross-platform alternatives
    4. Add #Requires -Version 7.4 directive
    5. Test on target platforms (Windows, Linux, macOS)
#>

#region BEFORE: Windows PowerShell 5.1 Code

<#
# ❌ OLD: Windows PowerShell 5.1 - DO NOT USE

function Get-SystemInfoOld
{
    param(
        [string]$ComputerName = $env:COMPUTERNAME
    )
    
    # ❌ DEPRECATED: Get-WmiObject (removed in PowerShell Core)
    $os = Get-WmiObject -Class Win32_OperatingSystem -ComputerName $ComputerName
    $cpu = Get-WmiObject -Class Win32_Processor -ComputerName $ComputerName
    
    # ❌ DEPRECATED: ConvertTo-SecureString -AsPlainText without -Force
    $password = ConvertTo-SecureString "P@ssw0rd" -AsPlainText
    
    # ❌ WINDOWS-ONLY: Get-EventLog (not available on Linux/macOS)
    $events = Get-EventLog -LogName System -Newest 10
    
    # ❌ BAD: No error handling
    # ❌ BAD: No type constraints
    # ❌ BAD: No CmdletBinding
    
    return @{
        OS = $os.Caption
        CPU = $cpu.Name
        Events = $events
    }
}

function Set-UserPasswordOld
{
    param(
        $Username,  # ❌ No type constraint
        $Password   # ❌ Plain text password parameter
    )
    
    # ❌ DEPRECATED: ConvertTo-SecureString -AsPlainText
    $securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
    
    # ❌ No validation
    # ❌ No error handling
    # ❌ No ShouldProcess support
    
    Set-ADAccountPassword -Identity $Username -NewPassword $securePassword
}

function Get-ServiceStatusOld
{
    param($ServiceName)  # ❌ No type constraint
    
    # ❌ No error handling
    # ❌ No validation
    # ❌ No verbose output
    
    $service = Get-Service $ServiceName
    return $service.Status
}
#>

#endregion

#region AFTER: PowerShell 7.4+ Code

#Requires -Version 7.4

# ✅ NEW: PowerShell 7.4+ - RECOMMENDED

function Get-SystemInfoNew
{
    [CmdletBinding()]
    [OutputType([PSCustomObject])]
    param(
        [Parameter()]
        [ValidateNotNullOrEmpty()]
        [string]$ComputerName = $env:COMPUTERNAME
    )
    
    try
    {
        # ✅ GOOD: Get-CimInstance (cross-platform compatible)
        $cimSession = if ($ComputerName -eq $env:COMPUTERNAME)
        {
            New-CimSession -ErrorAction Stop
        }
        else
        {
            New-CimSession -ComputerName $ComputerName -ErrorAction Stop
        }
        
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -CimSession $cimSession -ErrorAction Stop
        $cpu = Get-CimInstance -ClassName Win32_Processor -CimSession $cimSession -ErrorAction Stop | Select-Object -First 1
        
        # ✅ GOOD: Cross-platform event log alternative
        $events = if ($IsWindows)
        {
            # Use Get-WinEvent on Windows (more powerful than Get-EventLog)
            Get-WinEvent -LogName System -MaxEvents 10 -ErrorAction SilentlyContinue
        }
        else
        {
            # Alternative for Linux/macOS
            Write-Verbose "Event logs not available on this platform"
            @()
        }
        
        # ✅ GOOD: Structured output with type
        $result = [PSCustomObject]@{
            ComputerName = $ComputerName
            OperatingSystem = $os.Caption
            OSVersion = $os.Version
            Architecture = $os.OSArchitecture
            Processor = $cpu.Name
            ProcessorCores = $cpu.NumberOfCores
            TotalMemoryGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
            FreeMemoryGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
            LastBootTime = $os.LastBootUpTime
            RecentEvents = $events.Count
        }
        
        # ✅ GOOD: Clean up CIM session
        Remove-CimSession -CimSession $cimSession -ErrorAction SilentlyContinue
        
        return $result
    }
    catch
    {
        Write-Error "Failed to get system information: $_"
        throw
    }
}

function Set-UserPasswordNew
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [string]$Username,

        [Parameter(Mandatory)]
        [ValidateNotNull()]
        [SecureString]$SecurePassword  # ✅ GOOD: SecureString parameter
    )

    if ($PSCmdlet.ShouldProcess($Username, 'Set user password'))
    {
        try
        {
            # ✅ GOOD: Direct SecureString usage (no conversion needed)
            Set-ADAccountPassword -Identity $Username -NewPassword $SecurePassword -ErrorAction Stop
            Write-Verbose "Password updated for user: $Username"
        }
        catch
        {
            Write-Error "Failed to set password for $Username: $_"
            throw
        }
    }
}

function Get-ServiceStatusNew
{
    [CmdletBinding()]
    [OutputType([string])]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [ValidateNotNullOrEmpty()]
        [string]$ServiceName
    )

    process
    {
        try
        {
            # ✅ GOOD: Error handling with specific error action
            $service = Get-Service -Name $ServiceName -ErrorAction Stop

            Write-Verbose "Service '$ServiceName' status: $($service.Status)"

            # ✅ GOOD: Return typed output
            return $service.Status.ToString()
        }
        catch [Microsoft.PowerShell.Commands.ServiceCommandException]
        {
            Write-Error "Service '$ServiceName' not found"
            throw
        }
        catch
        {
            Write-Error "Failed to get service status: $_"
            throw
        }
    }
}

#endregion

#region Migration Compatibility Helpers

function Test-PowerShellVersion
{
    [CmdletBinding()]
    [OutputType([PSCustomObject])]
    param(
        [Parameter()]
        [version]$MinimumVersion = '7.4.0'
    )

    $currentVersion = $PSVersionTable.PSVersion
    $edition = $PSVersionTable.PSEdition

    $result = [PSCustomObject]@{
        CurrentVersion = $currentVersion
        Edition = $edition
        IsCore = $edition -eq 'Core'
        IsDesktop = $edition -eq 'Desktop'
        MeetsMinimum = $currentVersion -ge $MinimumVersion
        Platform = if ($IsWindows) { 'Windows' }
                   elseif ($IsLinux) { 'Linux' }
                   elseif ($IsMacOS) { 'macOS' }
                   else { 'Unknown' }
    }

    if (-not $result.MeetsMinimum)
    {
        Write-Warning "Current version ($currentVersion) is below minimum ($MinimumVersion)"
    }

    return $result
}

function Test-ScriptCompatibility
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ })]
        [string]$ScriptPath
    )

    $issues = [System.Collections.Generic.List[PSObject]]::new()
    $content = Get-Content -Path $ScriptPath -Raw

    # Check for deprecated cmdlets
    $deprecatedPatterns = @{
        'Get-WmiObject' = 'Use Get-CimInstance instead'
        'Set-WmiInstance' = 'Use Set-CimInstance instead'
        'ConvertTo-SecureString.*-AsPlainText' = 'Use SecureString parameter directly'
        'Get-EventLog' = 'Use Get-WinEvent (Windows only) or alternative'
        'New-WebServiceProxy' = 'Use Invoke-RestMethod or Invoke-WebRequest'
    }

    foreach ($pattern in $deprecatedPatterns.GetEnumerator())
    {
        if ($content -match $pattern.Key)
        {
            $issues.Add([PSCustomObject]@{
                Type = 'Deprecated'
                Pattern = $pattern.Key
                Recommendation = $pattern.Value
            })
        }
    }

    return $issues
}

#endregion

#region Example Usage

if ($MyInvocation.InvocationName -ne '.')
{
    Write-Host "`n=== PowerShell Migration Example ===" -ForegroundColor Cyan

    # Check PowerShell version
    Write-Host "`n--- Version Check ---" -ForegroundColor Yellow
    $versionInfo = Test-PowerShellVersion
    $versionInfo | Format-List

    if ($versionInfo.MeetsMinimum)
    {
        # Demonstrate new functions
        Write-Host "`n--- System Information (New Method) ---" -ForegroundColor Yellow
        try
        {
            $systemInfo = Get-SystemInfoNew -Verbose
            $systemInfo | Format-List
        }
        catch
        {
            Write-Warning "System info retrieval failed (may require Windows): $_"
        }

        # Demonstrate service status
        Write-Host "`n--- Service Status (New Method) ---" -ForegroundColor Yellow
        try
        {
            $status = Get-ServiceStatusNew -ServiceName 'Winmgmt' -Verbose
            Write-Host "Service status: $status" -ForegroundColor Green
        }
        catch
        {
            Write-Warning "Service check failed: $_"
        }
    }
    else
    {
        Write-Host "`n✗ PowerShell version does not meet minimum requirements" -ForegroundColor Red
        Write-Host "Please upgrade to PowerShell 7.4 or later" -ForegroundColor Yellow
    }
}

#endregion
