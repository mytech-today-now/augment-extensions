# PowerShell Security Practices

Security best practices for PowerShell scripts and modules.

## Credential Management

### Use PSCredential Objects

```powershell
# ✅ Correct: Use PSCredential
function Connect-Service
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [PSCredential]$Credential
    )
    
    $userName = $Credential.UserName
    $password = $Credential.GetNetworkCredential().Password
    
    # Use credentials securely
}

# Usage
$cred = Get-Credential -Message "Enter service credentials"
Connect-Service -Credential $cred
```

### Never Store Plain-Text Passwords

```powershell
# ❌ NEVER do this
$password = "MyPassword123"
$userName = "admin"

# ❌ NEVER do this
$password = "MyPassword123" | ConvertTo-SecureString -AsPlainText -Force

# ✅ Correct: Prompt for credentials
$cred = Get-Credential

# ✅ Correct: Use Windows Credential Manager
$cred = Get-StoredCredential -Target "MyService"
```

### Secure String Storage

```powershell
# Export encrypted credential (user-specific)
$cred = Get-Credential
$cred.Password | ConvertFrom-SecureString | Out-File "C:\Secure\cred.txt"

# Import encrypted credential
$password = Get-Content "C:\Secure\cred.txt" | ConvertTo-SecureString
$cred = New-Object PSCredential("username", $password)
```

**WARNING:** This encryption is user and machine-specific. Not portable.

### Azure Key Vault Integration

```powershell
# ✅ Best practice for production
function Get-SecurePassword
{
    param([string]$SecretName)
    
    $secret = Get-AzKeyVaultSecret -VaultName "MyVault" -Name $SecretName
    return $secret.SecretValue
}
```

## Script Signing

### Sign Scripts for Production

```powershell
# Get code signing certificate
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert

# Sign script
Set-AuthenticodeSignature -FilePath ".\MyScript.ps1" -Certificate $cert
```

### Verify Signatures

```powershell
# Check signature
$signature = Get-AuthenticodeSignature -FilePath ".\MyScript.ps1"

if ($signature.Status -eq 'Valid')
{
    Write-Output "Script signature is valid"
}
else
{
    Write-Warning "Script signature is invalid or missing"
}
```

## Execution Policies

### Understanding Execution Policies

```powershell
# Check current policy
Get-ExecutionPolicy

# Set execution policy (requires admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Bypass for specific script (use cautiously)
PowerShell.exe -ExecutionPolicy Bypass -File ".\MyScript.ps1"
```

**Execution Policy Levels:**
- `Restricted` - No scripts allowed
- `AllSigned` - Only signed scripts
- `RemoteSigned` - Downloaded scripts must be signed
- `Unrestricted` - All scripts allowed (prompts for downloaded)
- `Bypass` - No restrictions (dangerous)

### Recommended Settings

```powershell
# Development
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Production
Set-ExecutionPolicy -ExecutionPolicy AllSigned -Scope LocalMachine
```

## Input Validation

### Validate All Input

```powershell
function Remove-UserFiles
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [ValidatePattern('^[a-zA-Z0-9_-]+$')]  # Alphanumeric only
        [string]$UserName,
        
        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ -PathType Container })]
        [string]$BasePath
    )
    
    # Prevent path traversal
    $safePath = Join-Path $BasePath $UserName
    $resolvedPath = Resolve-Path $safePath -ErrorAction Stop
    
    if (-not $resolvedPath.Path.StartsWith($BasePath))
    {
        throw "Path traversal detected"
    }
    
    if ($PSCmdlet.ShouldProcess($resolvedPath, "Remove files"))
    {
        Remove-Item -Path $resolvedPath -Recurse -Force
    }
}
```

### Sanitize File Paths

```powershell
function Get-SafeFileName
{
    param([string]$FileName)
    
    # Remove invalid characters
    $invalidChars = [System.IO.Path]::GetInvalidFileNameChars()
    $safeName = $FileName
    
    foreach ($char in $invalidChars)
    {
        $safeName = $safeName.Replace($char, '_')
    }
    
    return $safeName
}
```

## Prevent Injection Attacks

### SQL Injection Prevention

```powershell
# ❌ Vulnerable to SQL injection
$query = "SELECT * FROM Users WHERE UserName = '$userName'"

# ✅ Use parameterized queries
$query = "SELECT * FROM Users WHERE UserName = @UserName"
$cmd = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
$cmd.Parameters.AddWithValue("@UserName", $userName)
```

### Command Injection Prevention

```powershell
# ❌ Vulnerable to command injection
$output = cmd.exe /c "ping $hostName"

# ✅ Use native cmdlets
$output = Test-Connection -ComputerName $hostName -Count 4

# ✅ If external command needed, validate input
if ($hostName -match '^[a-zA-Z0-9.-]+$')
{
    $output = & ping.exe $hostName
}
```

## Secure Coding Patterns

### Least Privilege

```powershell
# ✅ Check if admin rights are needed
function Test-IsAdmin
{
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-IsAdmin))
{
    throw "This script requires administrator privileges"
}
```

### Secure Temporary Files

```powershell
# ✅ Use secure temp file creation
$tempFile = [System.IO.Path]::GetTempFileName()

try
{
    # Use temp file
    Set-Content -Path $tempFile -Value $data
    # Process...
}
finally
{
    # Always clean up
    if (Test-Path $tempFile)
    {
        Remove-Item $tempFile -Force
    }
}
```

### Avoid Invoke-Expression

```powershell
# ❌ Dangerous: Arbitrary code execution
$command = "Get-Process"
Invoke-Expression $command

# ✅ Use safer alternatives
$command = "Get-Process"
& $command

# ✅ Or use scriptblock
$scriptBlock = { Get-Process }
& $scriptBlock
```

## Logging and Auditing

### Log Security Events

```powershell
function Write-SecurityLog
{
    param(
        [string]$Message,
        [string]$User = $env:USERNAME
    )
    
    $logEntry = @{
        Timestamp = Get-Date -Format 'o'
        User      = $User
        Computer  = $env:COMPUTERNAME
        Message   = $Message
    }
    
    $logEntry | ConvertTo-Json | Out-File "C:\Logs\security.log" -Append
}

# Usage
Write-SecurityLog -Message "User attempted to access restricted resource"
```

## Best Practices Summary

1. **Never store plain-text passwords** - Use PSCredential or Key Vault
2. **Sign production scripts** - Use code signing certificates
3. **Validate all input** - Use parameter validation attributes
4. **Prevent injection** - Use parameterized queries and native cmdlets
5. **Follow least privilege** - Request only necessary permissions
6. **Clean up resources** - Remove temp files and close connections
7. **Avoid Invoke-Expression** - Use safer alternatives
8. **Log security events** - Maintain audit trail
9. **Use execution policies** - RemoteSigned minimum for production
10. **Encrypt sensitive data** - Use SecureString or Key Vault

