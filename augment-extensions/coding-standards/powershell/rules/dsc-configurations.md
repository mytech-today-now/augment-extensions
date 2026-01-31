# PowerShell DSC Configurations

Best practices for Desired State Configuration, configuration data separation, and LCM setup.

## Configuration Structure

### Basic DSC Configuration

```powershell
#Requires -Version 7.4

Configuration WebServerConfig
{
    param(
        [Parameter(Mandatory)]
        [string[]]$ComputerName,
        
        [Parameter()]
        [string]$WebsiteName = 'Default Web Site'
    )
    
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -ModuleName xWebAdministration
    
    Node $ComputerName
    {
        WindowsFeature IIS
        {
            Ensure = 'Present'
            Name = 'Web-Server'
        }
        
        WindowsFeature AspNet45
        {
            Ensure = 'Present'
            Name = 'Web-Asp-Net45'
            DependsOn = '[WindowsFeature]IIS'
        }
        
        xWebsite DefaultSite
        {
            Ensure = 'Present'
            Name = $WebsiteName
            State = 'Started'
            PhysicalPath = 'C:\inetpub\wwwroot'
            DependsOn = '[WindowsFeature]IIS'
        }
    }
}
```

## Configuration Data Separation

### Configuration Data File

```powershell
# ConfigData.psd1
@{
    AllNodes = @(
        @{
            NodeName = 'WebServer01'
            Role = 'WebServer'
            Environment = 'Production'
            CertificateFile = 'C:\Certs\WebServer01.cer'
        },
        @{
            NodeName = 'WebServer02'
            Role = 'WebServer'
            Environment = 'Production'
            CertificateFile = 'C:\Certs\WebServer02.cer'
        },
        @{
            NodeName = '*'
            PSDscAllowPlainTextPassword = $false
            PSDscAllowDomainUser = $true
        }
    )
    
    NonNodeData = @{
        WebsiteName = 'Corporate Portal'
        DatabaseServer = 'SQL01.contoso.com'
    }
}
```

### Using Configuration Data

```powershell
Configuration WebServerWithData
{
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    
    Node $AllNodes.Where{$_.Role -eq 'WebServer'}.NodeName
    {
        $websiteName = $ConfigurationData.NonNodeData.WebsiteName
        
        WindowsFeature IIS
        {
            Ensure = 'Present'
            Name = 'Web-Server'
        }
        
        File WebContent
        {
            Ensure = 'Present'
            DestinationPath = 'C:\inetpub\wwwroot\index.html'
            Contents = "Welcome to $websiteName on $($Node.NodeName)"
            Type = 'File'
        }
    }
}

# Compile configuration
$configData = Import-PowerShellDataFile -Path '.\ConfigData.psd1'
WebServerWithData -ConfigurationData $configData -OutputPath 'C:\DSC\Configs'
```

## Idempotency

### Ensure Idempotent Resources

```powershell
Configuration IdempotentConfig
{
    param([string]$ComputerName)
    
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    
    Node $ComputerName
    {
        # ✅ GOOD: Idempotent - can run multiple times safely
        File LogDirectory
        {
            Ensure = 'Present'
            Type = 'Directory'
            DestinationPath = 'C:\Logs'
        }
        
        Registry DisableIPv6
        {
            Ensure = 'Present'
            Key = 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters'
            ValueName = 'DisabledComponents'
            ValueData = '0xFF'
            ValueType = 'Dword'
        }
        
        Service W32Time
        {
            Name = 'W32Time'
            State = 'Running'
            StartupType = 'Automatic'
        }
    }
}
```

### Test Idempotency

```powershell
# Test configuration multiple times
$config = IdempotentConfig -ComputerName 'localhost' -OutputPath 'C:\DSC\Test'

# First run - should make changes
Start-DscConfiguration -Path 'C:\DSC\Test' -Wait -Verbose

# Second run - should report no changes needed
Start-DscConfiguration -Path 'C:\DSC\Test' -Wait -Verbose

# Verify state
Test-DscConfiguration -Path 'C:\DSC\Test' -Verbose
```

## Local Configuration Manager (LCM)

### Configure LCM

```powershell
[DSCLocalConfigurationManager()]
Configuration LCMConfig
{
    param([string[]]$ComputerName)

    Node $ComputerName
    {
        Settings
        {
            RefreshMode = 'Push'
            ConfigurationMode = 'ApplyAndAutoCorrect'
            RebootNodeIfNeeded = $true
            ActionAfterReboot = 'ContinueConfiguration'
            ConfigurationModeFrequencyMins = 15
            RefreshFrequencyMins = 30
            AllowModuleOverwrite = $true
        }
    }
}

# Apply LCM configuration
LCMConfig -ComputerName 'WebServer01' -OutputPath 'C:\DSC\LCM'
Set-DscLocalConfigurationManager -Path 'C:\DSC\LCM' -Verbose
```

### Pull Server Configuration

```powershell
[DSCLocalConfigurationManager()]
Configuration PullClientConfig
{
    param(
        [string]$NodeName,
        [string]$RegistrationKey,
        [string]$ServerURL
    )

    Node $NodeName
    {
        Settings
        {
            RefreshMode = 'Pull'
            ConfigurationMode = 'ApplyAndAutoCorrect'
            RebootNodeIfNeeded = $true
        }

        ConfigurationRepositoryWeb PullServer
        {
            ServerURL = $ServerURL
            RegistrationKey = $RegistrationKey
            ConfigurationNames = @('WebServerConfig')
        }

        ReportServerWeb PullServerReports
        {
            ServerURL = $ServerURL
            RegistrationKey = $RegistrationKey
        }
    }
}
```

## Credentials and Secrets

### Encrypted Credentials

```powershell
Configuration SecureConfig
{
    param(
        [Parameter(Mandatory)]
        [PSCredential]$Credential
    )

    Import-DscResource -ModuleName PSDesiredStateConfiguration

    Node 'WebServer01'
    {
        User LocalAdmin
        {
            Ensure = 'Present'
            UserName = 'AppAdmin'
            Password = $Credential
            PasswordNeverExpires = $true
            PasswordChangeNotAllowed = $false
        }
    }
}

# Use certificate for encryption
$configData = @{
    AllNodes = @(
        @{
            NodeName = 'WebServer01'
            CertificateFile = 'C:\Certs\WebServer01.cer'
            Thumbprint = '1234567890ABCDEF1234567890ABCDEF12345678'
        }
    )
}

$cred = Get-Credential -UserName 'AppAdmin' -Message 'Enter password'
SecureConfig -Credential $cred -ConfigurationData $configData -OutputPath 'C:\DSC\Secure'
```

## Best Practices

1. **Separate configuration from data** - Use ConfigurationData parameter
2. **Use certificates for encryption** - Never use plain text passwords
3. **Test idempotency** - Run configurations multiple times
4. **Version control configurations** - Track changes in Git
5. **Use dependencies** - DependsOn for resource ordering
6. **Configure LCM appropriately** - Match environment needs
7. **Use composite resources** - For reusable patterns
8. **Implement proper error handling** - Validate before applying
9. **Document node requirements** - Prerequisites and dependencies
10. **Test in non-production first** - Validate before production deployment


