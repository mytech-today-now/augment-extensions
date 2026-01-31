# PowerShell Naming Conventions

Comprehensive naming standards for PowerShell code following Microsoft best practices.

## Function and Cmdlet Names

### Verb-Noun Pattern

**ALWAYS** use approved verbs with singular nouns:

```powershell
# ✅ Correct
Get-User
Set-Configuration
New-LogEntry
Remove-TempFile

# ❌ Incorrect
GetUser          # Missing hyphen
Get-Users        # Plural noun
Fetch-User       # Unapproved verb
Get_User         # Underscore instead of hyphen
```

### Approved Verbs

Use `Get-Verb` to see all approved verbs. Common categories:

**Common Verbs:**
- `Get`, `Set`, `New`, `Remove`
- `Add`, `Clear`, `Copy`, `Move`
- `Find`, `Search`, `Select`, `Show`
- `Start`, `Stop`, `Restart`, `Suspend`
- `Read`, `Write`, `Update`, `Invoke`

**Data Verbs:**
- `Backup`, `Restore`, `Save`, `Sync`
- `Compare`, `Convert`, `Export`, `Import`
- `Merge`, `Split`, `Compress`, `Expand`

**Lifecycle Verbs:**
- `Initialize`, `Register`, `Unregister`
- `Enable`, `Disable`, `Install`, `Uninstall`

**Diagnostic Verbs:**
- `Test`, `Trace`, `Measure`, `Debug`
- `Confirm`, `Assert`, `Validate`

### Verb Selection Guidelines

```powershell
# ✅ Use Get for retrieval
Get-UserProfile

# ✅ Use Set for modification
Set-UserProfile

# ✅ Use New for creation
New-UserProfile

# ✅ Use Remove for deletion
Remove-UserProfile

# ✅ Use Test for validation (returns boolean)
Test-UserExists

# ✅ Use Invoke for execution
Invoke-UserScript
```

## Variable Names

### PascalCase for Variables

```powershell
# ✅ Correct
$UserName = "john.doe"
$FilePath = "C:\Logs\app.log"
$MaxRetryCount = 3
$IsEnabled = $true

# ❌ Incorrect
$username        # camelCase
$file_path       # snake_case
$MAXRETRYCOUNT   # ALL CAPS (reserved for constants)
$is-enabled      # kebab-case
```

### Descriptive Names

```powershell
# ✅ Descriptive
$DatabaseConnectionString
$UserEmailAddress
$MaximumRetryAttempts

# ❌ Too short/cryptic
$dcs
$email
$max
```

### Boolean Variables

Prefix with `Is`, `Has`, `Should`, `Can`:

```powershell
$IsValid = $true
$HasPermission = $false
$ShouldContinue = $true
$CanWrite = Test-Path $path -PathType Leaf
```

### Collections

Use plural nouns:

```powershell
$Users = @()
$Files = Get-ChildItem
$ErrorMessages = @()
```

## Parameter Names

### PascalCase and Descriptive

```powershell
function Get-UserData
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$UserName,
        
        [Parameter()]
        [string]$DomainName = 'contoso.com',
        
        [Parameter()]
        [switch]$IncludeGroups
    )
}
```

### Common Parameter Names

Follow PowerShell conventions:

```powershell
# ✅ Standard names
-Path           # File/folder paths
-Name           # Object names
-ComputerName   # Remote computer
-Credential     # PSCredential object
-Force          # Override confirmations
-WhatIf         # Simulation mode
-Confirm        # Confirmation prompts
-Verbose        # Verbose output
-Debug          # Debug output
```

## Constants and Enums

### ALL_CAPS with Underscores

```powershell
# Constants
$MAX_RETRY_COUNT = 5
$DEFAULT_TIMEOUT_SECONDS = 30
$API_BASE_URL = 'https://api.example.com'

# Enums
enum LogLevel
{
    DEBUG
    INFO
    WARNING
    ERROR
    CRITICAL
}
```

## File Names

### Script Files (.ps1)

```powershell
# ✅ Correct
Get-UserReport.ps1
Deploy-Application.ps1
Backup-Database.ps1

# ❌ Incorrect
getUserReport.ps1      # camelCase
get_user_report.ps1    # snake_case
script1.ps1            # Non-descriptive
```

### Module Files

```powershell
# Module manifest (.psd1)
MyModule.psd1

# Module script (.psm1)
MyModule.psm1

# Module folder
MyModule/
```

## Class Names

### PascalCase

```powershell
class UserAccount
{
    [string]$UserName
    [string]$Email
    [datetime]$CreatedDate
    
    UserAccount([string]$userName, [string]$email)
    {
        $this.UserName = $userName
        $this.Email = $email
        $this.CreatedDate = Get-Date
    }
}
```

## Anti-Patterns

### Avoid These

```powershell
# ❌ Hungarian notation
$strUserName
$intCount
$arrUsers

# ❌ Abbreviations (unless widely known)
$usr
$cnt
$msg

# ❌ Single letters (except loop counters)
$x
$y
$z

# ✅ Loop counters are OK
for ($i = 0; $i -lt 10; $i++)
{
    # Process
}
```

## Best Practices

1. **Be consistent** - Follow the same pattern throughout your codebase
2. **Be descriptive** - Names should explain purpose without comments
3. **Use approved verbs** - Check with `Get-Verb`
4. **Avoid abbreviations** - Unless universally understood (URL, API, SQL)
5. **Follow PowerShell conventions** - Match built-in cmdlet patterns

