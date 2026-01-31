# PowerShell Error Handling

Comprehensive error handling patterns and best practices for robust PowerShell code.

## Error Action Preference

### Set Global Preference

```powershell
# Stop on all errors (recommended for scripts)
$ErrorActionPreference = 'Stop'

# Continue on errors (default, not recommended for scripts)
$ErrorActionPreference = 'Continue'

# Silently continue (use sparingly)
$ErrorActionPreference = 'SilentlyContinue'
```

### Per-Command Error Action

```powershell
# Override global preference for specific command
Get-Item -Path 'C:\NonExistent.txt' -ErrorAction SilentlyContinue

# Use common parameter
Test-Path -Path $filePath -ErrorAction Stop
```

## Try-Catch-Finally

### Basic Pattern

```powershell
try
{
    # Code that might throw errors
    $content = Get-Content -Path $filePath -ErrorAction Stop
    $data = $content | ConvertFrom-Json
}
catch
{
    # Handle all errors
    Write-Error "Failed to process file: $_"
}
finally
{
    # Always executes (cleanup)
    if ($fileStream)
    {
        $fileStream.Close()
    }
}
```

### Specific Exception Handling

```powershell
try
{
    $result = Invoke-RestMethod -Uri $apiUrl -Method Get
}
catch [System.Net.WebException]
{
    Write-Error "Network error: $($_.Exception.Message)"
}
catch [System.UnauthorizedAccessException]
{
    Write-Error "Access denied: $($_.Exception.Message)"
}
catch
{
    Write-Error "Unexpected error: $($_.Exception.Message)"
    throw  # Re-throw if you can't handle it
}
```

### Nested Try-Catch

```powershell
try
{
    # Outer operation
    $connection = Connect-Database -Server $server
    
    try
    {
        # Inner operation
        $data = Get-DatabaseData -Connection $connection
    }
    catch
    {
        Write-Warning "Data retrieval failed: $_"
        # Handle inner error
    }
}
catch
{
    Write-Error "Connection failed: $_"
}
finally
{
    if ($connection)
    {
        Disconnect-Database -Connection $connection
    }
}
```

## Error Objects

### Accessing Error Information

```powershell
try
{
    Get-Item -Path 'C:\NonExistent.txt' -ErrorAction Stop
}
catch
{
    # Current error
    Write-Output "Error: $($_.Exception.Message)"
    Write-Output "Type: $($_.Exception.GetType().FullName)"
    Write-Output "Stack: $($_.ScriptStackTrace)"
    
    # Error record properties
    Write-Output "Category: $($_.CategoryInfo.Category)"
    Write-Output "Target: $($_.TargetObject)"
}
```

### $Error Automatic Variable

```powershell
# Most recent error
$Error[0]

# All errors in session
$Error

# Clear error history
$Error.Clear()
```

## Custom Errors

### Throw Custom Errors

```powershell
function Get-UserAge
{
    param([int]$Age)
    
    if ($Age -lt 0)
    {
        throw "Age cannot be negative: $Age"
    }
    
    if ($Age -gt 150)
    {
        throw [System.ArgumentOutOfRangeException]::new(
            'Age',
            $Age,
            'Age must be between 0 and 150'
        )
    }
    
    return $Age
}
```

### Write-Error vs Throw

```powershell
# Write-Error: Non-terminating (continues execution)
function Test-WriteError
{
    Write-Error "This is a non-terminating error"
    Write-Output "This still executes"
}

# Throw: Terminating (stops execution)
function Test-Throw
{
    throw "This is a terminating error"
    Write-Output "This never executes"
}
```

## Validation and Guards

### Parameter Validation

```powershell
function Get-FileContent
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [ValidateScript({ Test-Path $_ })]
        [string]$Path,
        
        [Parameter()]
        [ValidateSet('UTF8', 'ASCII', 'Unicode')]
        [string]$Encoding = 'UTF8'
    )
    
    Get-Content -Path $Path -Encoding $Encoding
}
```

### Guard Clauses

```powershell
function Process-Data
{
    param([string]$Data)
    
    # Guard clauses at the start
    if ([string]::IsNullOrWhiteSpace($Data))
    {
        throw "Data cannot be null or empty"
    }
    
    if ($Data.Length -gt 1000)
    {
        throw "Data exceeds maximum length of 1000 characters"
    }
    
    # Main logic
    return $Data.ToUpper()
}
```

## Best Practices

### 1. Always Use Try-Catch for External Operations

```powershell
# ✅ Correct
try
{
    $response = Invoke-RestMethod -Uri $apiUrl
}
catch
{
    Write-Error "API call failed: $_"
}

# ❌ Incorrect (no error handling)
$response = Invoke-RestMethod -Uri $apiUrl
```

### 2. Provide Context in Error Messages

```powershell
# ✅ Descriptive
catch
{
    Write-Error "Failed to process user '$userName' from file '$filePath': $($_.Exception.Message)"
}

# ❌ Generic
catch
{
    Write-Error "Error: $_"
}
```

### 3. Clean Up Resources

```powershell
$stream = $null
try
{
    $stream = [System.IO.File]::OpenRead($path)
    # Process stream
}
finally
{
    if ($stream)
    {
        $stream.Dispose()
    }
}
```

### 4. Don't Swallow Errors

```powershell
# ❌ Bad: Silent failure
try
{
    Remove-Item $path
}
catch
{
    # Empty catch - error is lost
}

# ✅ Good: Log or re-throw
try
{
    Remove-Item $path
}
catch
{
    Write-Warning "Could not remove $path: $_"
    # Or re-throw if critical
    throw
}
```

