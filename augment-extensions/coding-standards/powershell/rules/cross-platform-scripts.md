# PowerShell Cross-Platform Scripts

Best practices for cross-platform PowerShell development, OS-agnostic patterns, and path handling.

## OS Detection

### Detect Operating System

```powershell
#Requires -Version 7.4

function Get-OperatingSystemInfo
{
    [CmdletBinding()]
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
    }
    
    return $osInfo
}

# Usage
$os = Get-OperatingSystemInfo
Write-Output "Running on $($os.Platform) $($os.Architecture)"
```

### Platform-Specific Code

```powershell
function Invoke-PlatformSpecificCommand
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$TaskName
    )
    
    switch ($true)
    {
        $IsWindows
        {
            Write-Verbose "Executing Windows-specific code for: $TaskName"
            # Windows-specific implementation
            Get-Service | Where-Object Status -eq 'Running'
        }
        
        $IsLinux
        {
            Write-Verbose "Executing Linux-specific code for: $TaskName"
            # Linux-specific implementation
            systemctl list-units --type=service --state=running
        }
        
        $IsMacOS
        {
            Write-Verbose "Executing macOS-specific code for: $TaskName"
            # macOS-specific implementation
            launchctl list | Where-Object { $_ -match 'Running' }
        }
        
        default
        {
            throw "Unsupported operating system"
        }
    }
}
```

## Path Handling

### Cross-Platform Path Construction

```powershell
# ✅ GOOD: Use Join-Path for cross-platform paths
function Get-ConfigFilePath
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$ConfigFileName = 'config.json'
    )
    
    # Get platform-specific config directory
    $configDir = if ($IsWindows)
    {
        Join-Path $env:APPDATA 'MyApp'
    }
    elseif ($IsLinux)
    {
        Join-Path $env:HOME '.config/myapp'
    }
    elseif ($IsMacOS)
    {
        Join-Path $env:HOME 'Library/Application Support/MyApp'
    }
    
    # Ensure directory exists
    if (-not (Test-Path $configDir))
    {
        New-Item -Path $configDir -ItemType Directory -Force | Out-Null
    }
    
    return Join-Path $configDir $ConfigFileName
}

# ❌ BAD: Hardcoded path separators
# $path = "C:\Users\$env:USERNAME\config.json"  # Windows-only
# $path = "/home/$env:USER/config.json"  # Linux-only
```

### Path Normalization

```powershell
function ConvertTo-NormalizedPath
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [string]$Path
    )
    
    process
    {
        # Convert to absolute path
        $absolutePath = [System.IO.Path]::GetFullPath($Path)
        
        # Normalize separators for current platform
        $normalizedPath = $absolutePath -replace '[\\/]', [System.IO.Path]::DirectorySeparatorChar
        
        return $normalizedPath
    }
}

# Usage
$path = 'some/mixed\path/to\file.txt'
$normalized = ConvertTo-NormalizedPath -Path $path
```

### Temporary File Handling

```powershell
function New-CrossPlatformTempFile
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$Prefix = 'temp',
        
        [Parameter()]
        [string]$Extension = '.tmp'
    )
    
    # Get platform-specific temp directory
    $tempDir = [System.IO.Path]::GetTempPath()
    
    # Generate unique filename
    $fileName = "$Prefix-$(Get-Date -Format 'yyyyMMdd-HHmmss')-$([guid]::NewGuid().ToString('N').Substring(0,8))$Extension"
    
    $tempFile = Join-Path $tempDir $fileName
    
    # Create empty file
    New-Item -Path $tempFile -ItemType File -Force | Out-Null
    
    return $tempFile
}
```

## Environment Variables

### Cross-Platform Environment Access

```powershell
function Get-UserHomeDirectory
{
    [CmdletBinding()]
    param()
    
    $homeDir = if ($IsWindows)
    {
        $env:USERPROFILE
    }
    else
    {
        $env:HOME
    }
    
    return $homeDir
}

function Get-PathSeparator
{
    [CmdletBinding()]
    param()
    
    return if ($IsWindows) { ';' } else { ':' }
}

function Add-ToPathEnvironment
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Directory,

        [Parameter()]
        [ValidateSet('User', 'Machine', 'Process')]
        [string]$Scope = 'Process'
    )

    $separator = Get-PathSeparator
    $currentPath = [Environment]::GetEnvironmentVariable('PATH', $Scope)

    if ($currentPath -notlike "*$Directory*")
    {
        $newPath = "$currentPath$separator$Directory"
        [Environment]::SetEnvironmentVariable('PATH', $newPath, $Scope)
        Write-Verbose "Added $Directory to PATH ($Scope)"
    }
}
```

## Line Endings

### Handle Line Endings Correctly

```powershell
function ConvertTo-PlatformLineEndings
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$FilePath,

        [Parameter()]
        [switch]$InPlace
    )

    $content = Get-Content -Path $FilePath -Raw

    # Determine platform-specific line ending
    $lineEnding = if ($IsWindows) { "`r`n" } else { "`n" }

    # Normalize to platform line endings
    $normalized = $content -replace '(\r\n|\r|\n)', $lineEnding

    if ($InPlace)
    {
        Set-Content -Path $FilePath -Value $normalized -NoNewline
        Write-Verbose "Updated line endings in: $FilePath"
    }
    else
    {
        return $normalized
    }
}
```

## Process Management

### Cross-Platform Process Execution

```powershell
function Start-CrossPlatformProcess
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Command,

        [Parameter()]
        [string[]]$Arguments = @(),

        [Parameter()]
        [string]$WorkingDirectory = (Get-Location).Path
    )

    try
    {
        $processInfo = @{
            FilePath = $Command
            ArgumentList = $Arguments
            WorkingDirectory = $WorkingDirectory
            NoNewWindow = $true
            Wait = $true
            PassThru = $true
            ErrorAction = 'Stop'
        }

        # On non-Windows, may need to use full path
        if (-not $IsWindows)
        {
            $commandPath = (Get-Command $Command -ErrorAction SilentlyContinue).Source
            if ($commandPath)
            {
                $processInfo['FilePath'] = $commandPath
            }
        }

        $process = Start-Process @processInfo

        return [PSCustomObject]@{
            ExitCode = $process.ExitCode
            Success = $process.ExitCode -eq 0
        }
    }
    catch
    {
        Write-Error "Failed to start process: $_"
        throw
    }
}
```

## File Permissions

### Cross-Platform Permission Handling

```powershell
function Set-CrossPlatformExecutable
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ })]
        [string]$FilePath
    )

    if ($IsWindows)
    {
        # Windows doesn't use execute permissions
        Write-Verbose "Windows detected - no permission changes needed"
    }
    else
    {
        # Unix-like systems: set execute permission
        try
        {
            chmod +x $FilePath
            Write-Verbose "Set execute permission on: $FilePath"
        }
        catch
        {
            Write-Error "Failed to set execute permission: $_"
            throw
        }
    }
}

function Test-FileExecutable
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$FilePath
    )

    if ($IsWindows)
    {
        # On Windows, check file extension
        $extension = [System.IO.Path]::GetExtension($FilePath)
        return $extension -in @('.exe', '.bat', '.cmd', '.ps1')
    }
    else
    {
        # On Unix-like, check execute permission
        $fileInfo = Get-Item $FilePath
        return $fileInfo.UnixMode -match 'x'
    }
}
```

## Character Encoding

### Handle Encoding Consistently

```powershell
function Read-CrossPlatformTextFile
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$FilePath,

        [Parameter()]
        [System.Text.Encoding]$Encoding = [System.Text.Encoding]::UTF8
    )

    try
    {
        $content = Get-Content -Path $FilePath -Encoding $Encoding -Raw
        return $content
    }
    catch
    {
        Write-Error "Failed to read file: $_"
        throw
    }
}

function Write-CrossPlatformTextFile
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$FilePath,

        [Parameter(Mandatory)]
        [string]$Content,

        [Parameter()]
        [System.Text.Encoding]$Encoding = [System.Text.Encoding]::UTF8
    )

    try
    {
        # Use UTF8 without BOM for cross-platform compatibility
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($FilePath, $Content, $utf8NoBom)
        Write-Verbose "Wrote file with UTF-8 (no BOM): $FilePath"
    }
    catch
    {
        Write-Error "Failed to write file: $_"
        throw
    }
}
```

## Testing Cross-Platform Code

### Platform-Specific Tests

```powershell
Describe 'Cross-Platform Functionality' {
    Context 'Path Handling' {
        It 'Should create platform-appropriate paths' {
            $path = Get-ConfigFilePath
            $path | Should -Not -BeNullOrEmpty
            Test-Path (Split-Path $path) | Should -Be $true
        }
    }

    Context 'OS Detection' {
        It 'Should detect current OS' {
            $os = Get-OperatingSystemInfo
            $os.Platform | Should -BeIn @('Windows', 'Linux', 'macOS')
        }
    }

    Context 'Platform-Specific Behavior' -Skip:(-not $IsLinux) {
        It 'Should execute Linux-specific code' {
            # Linux-only test
            { Invoke-PlatformSpecificCommand -TaskName 'Test' } | Should -Not -Throw
        }
    }
}
```

## Best Practices

1. **Use automatic variables** - $IsWindows, $IsLinux, $IsMacOS
2. **Use Join-Path** - Never hardcode path separators
3. **Normalize paths** - Convert to platform-appropriate format
4. **Handle line endings** - Use platform-appropriate line endings
5. **Use UTF-8 without BOM** - For maximum compatibility
6. **Test on all platforms** - Use CI/CD for multi-platform testing
7. **Avoid platform-specific cmdlets** - Or provide alternatives
8. **Use [System.IO.Path]** - For path operations
9. **Document platform requirements** - Clearly state limitations
10. **Provide fallbacks** - Graceful degradation when features unavailable


