# PowerShell Universal Standards

Cross-cutting standards that apply to ALL PowerShell code regardless of project category.

## Core Principles

### 1. Readability First
- Code is read more often than written
- Optimize for maintainability over cleverness
- Use descriptive names over comments when possible

### 2. Consistency
- Follow established patterns within the codebase
- Use consistent formatting and style
- Maintain consistent error handling approaches

### 3. Explicit Over Implicit
- Prefer explicit parameter names
- Avoid positional parameters in scripts
- Use full cmdlet names in scripts (aliases OK in console)

## Script Structure

### Script Header Template

```powershell
<#
.SYNOPSIS
    Brief description of what the script does

.DESCRIPTION
    Detailed description of functionality, requirements, and behavior

.PARAMETER ParameterName
    Description of each parameter

.EXAMPLE
    Example-Command -Parameter Value
    Description of what this example does

.NOTES
    Author: Your Name
    Version: 1.0.0
    Last Modified: 2026-01-30
    Requires: PowerShell 7.4+

.LINK
    https://docs.microsoft.com/powershell/
#>
```

### Strict Mode

**ALWAYS** enable strict mode at the beginning of scripts:

```powershell
#Requires -Version 7.4
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
```

**Why:**
- Catches undefined variables
- Enforces best practices
- Prevents silent failures

### Script Organization

```powershell
#Requires -Version 7.4
Set-StrictMode -Version Latest

# 1. Script header (comment-based help)
# 2. Parameters
# 3. Functions (if any)
# 4. Main script logic
# 5. Cleanup (if needed)
```

## Code Style

### Indentation
- **4 spaces** (not tabs)
- Consistent throughout file

### Brace Style
Use **Allman style** (opening brace on new line):

```powershell
# ✅ Correct
if ($condition)
{
    Write-Output "True"
}

# ❌ Incorrect
if ($condition) {
    Write-Output "True"
}
```

### Line Length
- **Maximum 120 characters** per line
- Break long lines at logical points
- Use splatting for long parameter lists

```powershell
# ✅ Use splatting for readability
$params = @{
    Path        = 'C:\Logs\application.log'
    Filter      = '*.log'
    Recurse     = $true
    ErrorAction = 'Stop'
}
Get-ChildItem @params
```

### Whitespace
- One blank line between functions
- No trailing whitespace
- Blank line at end of file

## Comments

### When to Comment

✅ **DO comment:**
- Complex algorithms or business logic
- Non-obvious workarounds
- Regex patterns
- Magic numbers

❌ **DON'T comment:**
- Obvious code
- What the code does (use descriptive names instead)
- Commented-out code (use version control)

### Comment Style

```powershell
# Single-line comment for brief explanations

<#
Multi-line comment for:
- Longer explanations
- Temporarily disabling code blocks
- Documentation
#>
```

## Output and Logging

### Use Appropriate Streams

```powershell
# Information (default output)
Write-Output "Processing complete"

# Verbose (detailed progress)
Write-Verbose "Processing file: $fileName" -Verbose:$VerbosePreference

# Warning (non-fatal issues)
Write-Warning "File not found, using default"

# Error (fatal issues)
Write-Error "Cannot proceed without required file"

# Debug (troubleshooting)
Write-Debug "Variable value: $myVar" -Debug:$DebugPreference
```

### Structured Logging

```powershell
function Write-Log
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [ValidateSet('Info', 'Warning', 'Error')]
        [string]$Level = 'Info'
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level)
    {
        'Info'    { Write-Output $logMessage }
        'Warning' { Write-Warning $logMessage }
        'Error'   { Write-Error $logMessage }
    }
}
```

