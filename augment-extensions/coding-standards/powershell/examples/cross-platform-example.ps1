<#
.SYNOPSIS
    Cross-platform PowerShell script demonstrating OS detection and path normalization.

.DESCRIPTION
    Complete example showing:
    - OS detection using automatic variables ($IsWindows, $IsLinux, $IsMacOS)
    - Platform-specific code execution
    - Cross-platform path handling with Join-Path
    - Environment variable handling across platforms
    - File system operations that work on all platforms

.PARAMETER Action
    Action to perform (SystemInfo, CreateConfig, ListProcesses)

.PARAMETER ConfigPath
    Optional custom configuration path

.EXAMPLE
    .\cross-platform-example.ps1 -Action SystemInfo

.EXAMPLE
    .\cross-platform-example.ps1 -Action CreateConfig -ConfigPath ~/myapp
#>

#Requires -Version 7.4

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('SystemInfo', 'CreateConfig', 'ListProcesses')]
    [string]$Action,
    
    [Parameter()]
    [string]$ConfigPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

#region OS Detection Functions

function Get-OperatingSystemInfo
{
    [CmdletBinding()]
    [OutputType([PSCustomObject])]
    param()
    
    $osInfo = [PSCustomObject]@{
        IsWindows = $IsWindows
        IsLinux = $IsLinux
        IsMacOS = $IsMacOS
        Platform = if ($IsWindows) { 'Windows' } 
                   elseif ($IsLinux) { 'Linux' } 
                   elseif ($IsMacOS) { 'macOS' } 
                   else { 'Unknown' }
        Version = [System.Environment]::OSVersion.Version
        Architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
        ProcessArchitecture = [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture
        FrameworkDescription = [System.Runtime.InteropServices.RuntimeInformation]::FrameworkDescription
        UserName = [System.Environment]::UserName
        MachineName = [System.Environment]::MachineName
        ProcessorCount = [System.Environment]::ProcessorCount
    }
    
    return $osInfo
}

function Get-PlatformSpecificInfo
{
    [CmdletBinding()]
    param()
    
    $info = @{}
    
    switch ($true)
    {
        $IsWindows
        {
            $info['Shell'] = 'PowerShell on Windows'
            $info['PathSeparator'] = ';'
            $info['DirectorySeparator'] = '\'
            $info['HomeDirectory'] = $env:USERPROFILE
            $info['TempDirectory'] = $env:TEMP
            $info['ConfigDirectory'] = $env:APPDATA
        }
        
        $IsLinux
        {
            $info['Shell'] = 'PowerShell on Linux'
            $info['PathSeparator'] = ':'
            $info['DirectorySeparator'] = '/'
            $info['HomeDirectory'] = $env:HOME
            $info['TempDirectory'] = '/tmp'
            $info['ConfigDirectory'] = Join-Path $env:HOME '.config'
        }
        
        $IsMacOS
        {
            $info['Shell'] = 'PowerShell on macOS'
            $info['PathSeparator'] = ':'
            $info['DirectorySeparator'] = '/'
            $info['HomeDirectory'] = $env:HOME
            $info['TempDirectory'] = $env:TMPDIR
            $info['ConfigDirectory'] = Join-Path $env:HOME 'Library/Application Support'
        }
        
        default
        {
            throw "Unsupported operating system"
        }
    }
    
    return [PSCustomObject]$info
}

#endregion

#region Path Handling Functions

function Get-CrossPlatformConfigPath
{
    [CmdletBinding()]
    [OutputType([string])]
    param(
        [Parameter()]
        [string]$AppName = 'MyApp',
        
        [Parameter()]
        [string]$ConfigFileName = 'config.json',
        
        [Parameter()]
        [string]$CustomPath
    )
    
    # Use custom path if provided
    if ($CustomPath)
    {
        $basePath = $CustomPath
    }
    else
    {
        # ✅ GOOD: Platform-specific config directory
        $basePath = if ($IsWindows)
        {
            Join-Path $env:APPDATA $AppName
        }
        elseif ($IsLinux)
        {
            Join-Path $env:HOME ".config/$($AppName.ToLower())"
        }
        elseif ($IsMacOS)
        {
            Join-Path $env:HOME "Library/Application Support/$AppName"
        }
        else
        {
            throw "Unsupported platform"
        }
    }
    
    # ✅ GOOD: Use Join-Path for cross-platform path construction
    $configPath = Join-Path $basePath $ConfigFileName
    
    return $configPath
}

function New-CrossPlatformConfig
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter()]
        [string]$ConfigPath
    )

    $fullPath = Get-CrossPlatformConfigPath -CustomPath $ConfigPath
    $directory = Split-Path $fullPath -Parent

    if ($PSCmdlet.ShouldProcess($fullPath, 'Create configuration file'))
    {
        try
        {
            # Create directory if it doesn't exist
            if (-not (Test-Path $directory))
            {
                New-Item -Path $directory -ItemType Directory -Force | Out-Null
                Write-Verbose "Created directory: $directory"
            }

            # Create configuration object
            $config = @{
                Version = '1.0.0'
                Created = Get-Date -Format 'o'
                Platform = if ($IsWindows) { 'Windows' }
                          elseif ($IsLinux) { 'Linux' }
                          elseif ($IsMacOS) { 'macOS' }
                          else { 'Unknown' }
                Settings = @{
                    EnableLogging = $true
                    LogLevel = 'Info'
                    MaxLogSize = 10MB
                }
            }

            # Save configuration
            $config | ConvertTo-Json -Depth 10 | Set-Content -Path $fullPath -Encoding UTF8

            Write-Host "✓ Configuration created: $fullPath" -ForegroundColor Green
            return $fullPath
        }
        catch
        {
            Write-Error "Failed to create configuration: $_"
            throw
        }
    }
}

function Get-RunningProcessesCrossPlatform
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [int]$Top = 10
    )

    # Get processes (works on all platforms)
    $processes = Get-Process |
        Sort-Object CPU -Descending |
        Select-Object -First $Top -Property Name, Id, CPU, WorkingSet, Path

    # Format working set for readability
    $processes | ForEach-Object {
        [PSCustomObject]@{
            Name = $_.Name
            Id = $_.Id
            'CPU (s)' = [math]::Round($_.CPU, 2)
            'Memory (MB)' = [math]::Round($_.WorkingSet / 1MB, 2)
            Path = $_.Path
        }
    }
}

#endregion

#region Main Execution

try
{
    Write-Host "Executing cross-platform action: $Action" -ForegroundColor Cyan

    switch ($Action)
    {
        'SystemInfo'
        {
            Write-Host "`n=== Operating System Information ===" -ForegroundColor Yellow
            $osInfo = Get-OperatingSystemInfo
            $osInfo | Format-List

            Write-Host "`n=== Platform-Specific Information ===" -ForegroundColor Yellow
            $platformInfo = Get-PlatformSpecificInfo
            $platformInfo | Format-List

            Write-Host "`n✓ System information retrieved successfully" -ForegroundColor Green
        }

        'CreateConfig'
        {
            Write-Host "`n=== Creating Cross-Platform Configuration ===" -ForegroundColor Yellow

            $configPath = New-CrossPlatformConfig -ConfigPath $ConfigPath

            if (Test-Path $configPath)
            {
                Write-Host "`nConfiguration contents:" -ForegroundColor Cyan
                Get-Content $configPath | Write-Host
            }
        }

        'ListProcesses'
        {
            Write-Host "`n=== Top 10 Processes by CPU Usage ===" -ForegroundColor Yellow

            $processes = Get-RunningProcessesCrossPlatform -Top 10
            $processes | Format-Table -AutoSize

            Write-Host "`n✓ Process list retrieved successfully" -ForegroundColor Green
        }
    }
}
catch
{
    Write-Host "`n✗ Action failed: $_" -ForegroundColor Red
    exit 1
}

#endregion
