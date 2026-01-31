<#
.SYNOPSIS
    DSC configuration example demonstrating best practices.

.DESCRIPTION
    This example demonstrates:
    - Configuration data separation
    - Idempotent resource configuration
    - Credential handling
    - Multiple node targeting
    - LCM configuration

.NOTES
    Requires: PowerShell 7.4+ with PSDesiredStateConfiguration module
#>

#Requires -Version 7.4
#Requires -Modules PSDesiredStateConfiguration

#region Configuration Data

# Separate configuration data from configuration logic
$ConfigurationData = @{
    AllNodes = @(
        @{
            NodeName = 'WebServer01'
            Role = 'WebServer'
            Features = @('Web-Server', 'Web-Asp-Net45')
            WebsitePath = 'C:\inetpub\wwwroot'
            WebsiteName = 'DefaultWebSite'
        },
        @{
            NodeName = 'WebServer02'
            Role = 'WebServer'
            Features = @('Web-Server', 'Web-Asp-Net45')
            WebsitePath = 'C:\inetpub\wwwroot'
            WebsiteName = 'DefaultWebSite'
        },
        @{
            NodeName = 'DBServer01'
            Role = 'DatabaseServer'
            Features = @('SQL-Server-Full')
            DatabasePath = 'D:\SQLData'
        }
    )
}

#endregion

#region DSC Configuration

Configuration WebServerConfiguration
{
    <#
    .SYNOPSIS
        Configures web servers with IIS and required features.
    #>
    
    param(
        [Parameter()]
        [PSCredential]$Credential
    )
    
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    
    Node $AllNodes.Where{$_.Role -eq 'WebServer'}.NodeName
    {
        # Ensure Windows Features are installed
        foreach ($feature in $Node.Features)
        {
            WindowsFeature "Feature_$feature"
            {
                Name = $feature
                Ensure = 'Present'
            }
        }
        
        # Ensure website directory exists
        File WebsiteDirectory
        {
            DestinationPath = $Node.WebsitePath
            Type = 'Directory'
            Ensure = 'Present'
        }
        
        # Ensure default website is configured
        Script ConfigureWebsite
        {
            GetScript = {
                $site = Get-Website -Name $using:Node.WebsiteName -ErrorAction SilentlyContinue
                return @{
                    Result = if ($site) { 'Present' } else { 'Absent' }
                }
            }
            
            TestScript = {
                $site = Get-Website -Name $using:Node.WebsiteName -ErrorAction SilentlyContinue
                
                if (-not $site)
                {
                    return $false
                }
                
                # Verify website is running
                return $site.State -eq 'Started'
            }
            
            SetScript = {
                # Idempotent: Only create if doesn't exist
                $site = Get-Website -Name $using:Node.WebsiteName -ErrorAction SilentlyContinue
                
                if (-not $site)
                {
                    New-Website -Name $using:Node.WebsiteName `
                               -PhysicalPath $using:Node.WebsitePath `
                               -Force
                }
                
                # Ensure website is started
                Start-Website -Name $using:Node.WebsiteName
            }
            
            DependsOn = '[File]WebsiteDirectory'
        }
        
        # Ensure Windows Firewall allows HTTP
        Script ConfigureFirewall
        {
            GetScript = {
                $rule = Get-NetFirewallRule -DisplayName 'Allow HTTP' -ErrorAction SilentlyContinue
                return @{
                    Result = if ($rule) { 'Present' } else { 'Absent' }
                }
            }
            
            TestScript = {
                $rule = Get-NetFirewallRule -DisplayName 'Allow HTTP' -ErrorAction SilentlyContinue
                return $null -ne $rule
            }
            
            SetScript = {
                New-NetFirewallRule -DisplayName 'Allow HTTP' `
                                   -Direction Inbound `
                                   -LocalPort 80 `
                                   -Protocol TCP `
                                   -Action Allow
            }
        }
    }
}

Configuration DatabaseServerConfiguration
{
    <#
    .SYNOPSIS
        Configures database servers with SQL Server.
    #>
    
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    
    Node $AllNodes.Where{$_.Role -eq 'DatabaseServer'}.NodeName
    {
        # Ensure database directory exists
        File DatabaseDirectory
        {
            DestinationPath = $Node.DatabasePath
            Type = 'Directory'
            Ensure = 'Present'
        }
        
        # Ensure SQL Server features are installed
        foreach ($feature in $Node.Features)
        {
            WindowsFeature "Feature_$feature"
            {
                Name = $feature
                Ensure = 'Present'
            }
        }
    }
}

#endregion

#region LCM Configuration

[DSCLocalConfigurationManager()]
Configuration LCMConfiguration
{
    Node $AllNodes.NodeName
    {
        Settings
        {
            RefreshMode = 'Push'
            ConfigurationMode = 'ApplyAndAutoCorrect'
            RebootNodeIfNeeded = $true
            ActionAfterReboot = 'ContinueConfiguration'
            RefreshFrequencyMins = 30
            ConfigurationModeFrequencyMins = 15
        }
    }
}

#endregion

#region Execution Example

# Generate MOF files
$outputPath = Join-Path $PSScriptRoot 'DSCOutput'

# Compile configurations
WebServerConfiguration -ConfigurationData $ConfigurationData -OutputPath $outputPath
DatabaseServerConfiguration -ConfigurationData $ConfigurationData -OutputPath $outputPath

# Compile LCM configuration
LCMConfiguration -ConfigurationData $ConfigurationData -OutputPath (Join-Path $outputPath 'LCM')

Write-Output "Configuration MOF files generated in: $outputPath"
Write-Output "To apply configuration:"
Write-Output "  1. Set-DscLocalConfigurationManager -Path '$outputPath\LCM' -ComputerName <NodeName>"
Write-Output "  2. Start-DscConfiguration -Path '$outputPath' -ComputerName <NodeName> -Wait -Verbose"

#endregion

