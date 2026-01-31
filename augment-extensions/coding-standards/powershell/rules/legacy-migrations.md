# PowerShell Legacy Migrations

Best practices for migrating from Windows PowerShell to PowerShell Core, handling deprecated features, and compatibility testing.

## Migration Strategy

### Assessment Phase

```powershell
# Check PowerShell version
function Get-PowerShellVersion
{
    [CmdletBinding()]
    param()
    
    $version = $PSVersionTable.PSVersion
    $edition = $PSVersionTable.PSEdition
    
    [PSCustomObject]@{
        Version = $version
        Edition = $edition
        IsCore = $edition -eq 'Core'
        IsDesktop = $edition -eq 'Desktop'
        Platform = if ($IsWindows) { 'Windows' } 
                   elseif ($IsLinux) { 'Linux' } 
                   elseif ($IsMacOS) { 'macOS' } 
                   else { 'Unknown' }
    }
}

# Scan for compatibility issues
function Test-ScriptCompatibility
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ })]
        [string]$ScriptPath
    )
    
    $issues = @()
    $content = Get-Content -Path $ScriptPath -Raw
    
    # Check for deprecated cmdlets
    $deprecatedCmdlets = @(
        'ConvertTo-SecureString -AsPlainText',
        'New-WebServiceProxy',
        'Register-PSSessionConfiguration',
        'Get-WmiObject',
        'Set-WmiInstance'
    )
    
    foreach ($deprecated in $deprecatedCmdlets)
    {
        if ($content -match [regex]::Escape($deprecated))
        {
            $issues += "Found deprecated: $deprecated"
        }
    }
    
    # Check for Windows-only cmdlets
    $windowsOnlyCmdlets = @(
        'Get-EventLog',
        'Get-Counter',
        'Get-WinEvent'
    )
    
    foreach ($cmdlet in $windowsOnlyCmdlets)
    {
        if ($content -match "\b$cmdlet\b")
        {
            $issues += "Windows-only cmdlet: $cmdlet"
        }
    }
    
    return $issues
}
```

## Deprecated Feature Handling

### WMI to CIM Migration

```powershell
# ❌ OLD: Windows PowerShell (WMI)
# Get-WmiObject -Class Win32_OperatingSystem

# ✅ NEW: PowerShell Core (CIM)
function Get-OperatingSystemInfo
{
    [CmdletBinding()]
    param()
    
    try
    {
        $os = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction Stop
        
        [PSCustomObject]@{
            Caption = $os.Caption
            Version = $os.Version
            BuildNumber = $os.BuildNumber
            OSArchitecture = $os.OSArchitecture
            LastBootUpTime = $os.LastBootUpTime
            FreePhysicalMemory = $os.FreePhysicalMemory
        }
    }
    catch
    {
        Write-Error "Failed to get OS info: $_"
        throw
    }
}
```

### Event Log Migration

```powershell
# ❌ OLD: Get-EventLog (not available in PowerShell Core)
# Get-EventLog -LogName Application -Newest 100

# ✅ NEW: Get-WinEvent (cross-platform where available)
function Get-ApplicationEvents
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [int]$MaxEvents = 100,
        
        [Parameter()]
        [string]$LogName = 'Application'
    )
    
    if (-not $IsWindows)
    {
        Write-Warning "Event logs are only available on Windows"
        return
    }
    
    try
    {
        $filterHash = @{
            LogName = $LogName
            MaxEvents = $MaxEvents
        }
        
        Get-WinEvent -FilterHashtable $filterHash -ErrorAction Stop
    }
    catch
    {
        Write-Error "Failed to get events: $_"
        throw
    }
}
```

### Secure String Handling

```powershell
# ❌ OLD: ConvertTo-SecureString with -AsPlainText (deprecated)
# $securePassword = ConvertTo-SecureString 'P@ssw0rd' -AsPlainText -Force

# ✅ NEW: Use Read-Host or certificate-based encryption
function New-SecureCredential
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$UserName
    )
    
    # Prompt for password securely
    $securePassword = Read-Host -Prompt "Enter password for $UserName" -AsSecureString
    
    $credential = [PSCredential]::new($UserName, $securePassword)
    
    return $credential
}
```

## Compatibility Testing

### Multi-Version Testing

```powershell
function Test-ScriptOnMultipleVersions
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ScriptPath,

        [Parameter()]
        [string[]]$PowerShellVersions = @('5.1', '7.4')
    )

    $results = @()

    foreach ($version in $PowerShellVersions)
    {
        Write-Verbose "Testing on PowerShell $version"

        $pwshPath = if ($version -like '5.*')
        {
            'powershell.exe'
        }
        else
        {
            'pwsh.exe'
        }

        try
        {
            $output = & $pwshPath -File $ScriptPath -ErrorAction Stop

            $results += [PSCustomObject]@{
                Version = $version
                Success = $true
                Output = $output
                Error = $null
            }
        }
        catch
        {
            $results += [PSCustomObject]@{
                Version = $version
                Success = $false
                Output = $null
                Error = $_.Exception.Message
            }
        }
    }

    return $results
}
```

### Compatibility Wrapper Functions

```powershell
function Get-ComputerInfoCompat
{
    [CmdletBinding()]
    param()

    if ($PSVersionTable.PSVersion.Major -ge 7)
    {
        # PowerShell Core
        if ($IsWindows)
        {
            Get-ComputerInfo
        }
        else
        {
            Write-Warning "Get-ComputerInfo is Windows-only"
            return $null
        }
    }
    else
    {
        # Windows PowerShell
        Get-ComputerInfo
    }
}
```

## Module Compatibility

### Conditional Module Loading

```powershell
function Import-ModuleCompat
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter()]
        [string]$AlternativeModule
    )

    try
    {
        Import-Module $ModuleName -ErrorAction Stop
        Write-Verbose "Loaded module: $ModuleName"
    }
    catch
    {
        if ($AlternativeModule)
        {
            Write-Warning "Failed to load $ModuleName, trying $AlternativeModule"
            Import-Module $AlternativeModule -ErrorAction Stop
        }
        else
        {
            throw
        }
    }
}

# Usage
Import-ModuleCompat -ModuleName 'ActiveDirectory' -AlternativeModule 'Microsoft.Graph.Identity.DirectoryManagement'
```

### Windows Compatibility Module

```powershell
# For PowerShell Core on Windows, use Windows Compatibility
if ($PSVersionTable.PSVersion.Major -ge 7 -and $IsWindows)
{
    # Import Windows PowerShell modules via compatibility layer
    Import-Module -Name ActiveDirectory -UseWindowsPowerShell -ErrorAction SilentlyContinue
}
```

## Migration Patterns

### Gradual Migration Approach

```powershell
# Step 1: Add version detection
#Requires -Version 5.1

$isPowerShellCore = $PSVersionTable.PSEdition -eq 'Core'

# Step 2: Use conditional logic for version-specific code
if ($isPowerShellCore)
{
    # PowerShell Core implementation
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
}
else
{
    # Windows PowerShell implementation
    $os = Get-WmiObject -Class Win32_OperatingSystem
}

# Step 3: Gradually replace with Core-compatible code
# Eventually remove conditional logic once fully migrated
```

### Feature Detection Over Version Detection

```powershell
# ✅ GOOD: Feature detection
function Invoke-CommandWithFeatureDetection
{
    [CmdletBinding()]
    param()

    # Check if cmdlet exists
    if (Get-Command -Name Get-CimInstance -ErrorAction SilentlyContinue)
    {
        Get-CimInstance -ClassName Win32_OperatingSystem
    }
    elseif (Get-Command -Name Get-WmiObject -ErrorAction SilentlyContinue)
    {
        Get-WmiObject -Class Win32_OperatingSystem
    }
    else
    {
        throw "No compatible cmdlet found"
    }
}

# ❌ BAD: Hard version checks
# if ($PSVersionTable.PSVersion.Major -eq 5) { ... }
```

## Common Migration Issues

### Issue 1: .NET Framework vs .NET Core

```powershell
# Windows PowerShell uses .NET Framework
# PowerShell Core uses .NET Core/.NET 5+

# Check .NET runtime
$runtime = [System.Runtime.InteropServices.RuntimeInformation]::FrameworkDescription
Write-Output "Running on: $runtime"

# Some .NET Framework APIs are not available in .NET Core
# Use cross-platform alternatives
```

### Issue 2: Default Encoding Changes

```powershell
# Windows PowerShell: Default encoding varies
# PowerShell Core: Default encoding is UTF-8 (no BOM)

# ✅ GOOD: Explicitly specify encoding
function Write-FileWithEncoding
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Path,

        [Parameter(Mandatory)]
        [string]$Content
    )

    # Use UTF-8 without BOM for cross-platform compatibility
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}
```

### Issue 3: Remoting Differences

```powershell
# Windows PowerShell: Uses WSMan by default
# PowerShell Core: Supports WSMan and SSH

function New-RemoteSessionCompat
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ComputerName,

        [Parameter()]
        [PSCredential]$Credential,

        [Parameter()]
        [ValidateSet('WSMan', 'SSH')]
        [string]$Protocol = 'WSMan'
    )

    $sessionParams = @{
        ComputerName = $ComputerName
    }

    if ($Credential)
    {
        $sessionParams['Credential'] = $Credential
    }

    if ($Protocol -eq 'SSH' -and $PSVersionTable.PSVersion.Major -ge 7)
    {
        $sessionParams['HostName'] = $ComputerName
        $sessionParams.Remove('ComputerName')
        New-PSSession @sessionParams -SSHTransport
    }
    else
    {
        New-PSSession @sessionParams
    }
}
```

## Best Practices

1. **Test on both versions** - Validate scripts on Windows PowerShell 5.1 and PowerShell Core 7.4+
2. **Use CIM instead of WMI** - CIM cmdlets are cross-platform
3. **Avoid deprecated cmdlets** - Replace with modern equivalents
4. **Feature detection over version detection** - Check for cmdlet availability
5. **Explicit encoding** - Always specify UTF-8 encoding
6. **Use compatibility modules** - Leverage Windows Compatibility when needed
7. **Gradual migration** - Migrate incrementally, not all at once
8. **Document compatibility** - Note minimum PowerShell version requirements
9. **Use #Requires statements** - Specify minimum version and modules
10. **Automated testing** - Test on multiple PowerShell versions in CI/CD


