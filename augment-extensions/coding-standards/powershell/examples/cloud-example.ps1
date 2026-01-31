<#
.SYNOPSIS
    Azure/AWS cloud orchestration example demonstrating authentication and resource management.

.DESCRIPTION
    Complete example showing:
    - Azure authentication (Managed Identity, Service Principal)
    - AWS authentication (IAM roles, profiles)
    - Resource provisioning and management
    - Error handling and logging
    - Idempotent operations

.PARAMETER Environment
    Target environment (Dev, Test, Prod)

.PARAMETER CloudProvider
    Cloud provider to use (Azure, AWS)

.EXAMPLE
    .\cloud-example.ps1 -Environment Dev -CloudProvider Azure
#>

#Requires -Version 7.4
#Requires -Modules Az.Accounts, Az.Resources

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidateSet('Dev', 'Test', 'Prod')]
    [string]$Environment,
    
    [Parameter(Mandatory)]
    [ValidateSet('Azure', 'AWS')]
    [string]$CloudProvider
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

#region Azure Functions

function Connect-AzureEnvironment
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$TenantId,
        
        [Parameter()]
        [switch]$UseManagedIdentity
    )
    
    try
    {
        if ($UseManagedIdentity)
        {
            Write-Verbose "Connecting to Azure using Managed Identity"
            Connect-AzAccount -Identity -ErrorAction Stop
        }
        else
        {
            Write-Verbose "Connecting to Azure using Service Principal"
            # In production, retrieve from Key Vault or secure storage
            $credential = Get-Credential -Message "Enter Service Principal credentials"
            $appId = Read-Host "Enter Application ID"
            
            Connect-AzAccount -ServicePrincipal -TenantId $TenantId `
                -Credential $credential -ApplicationId $appId -ErrorAction Stop
        }
        
        Write-Host "✓ Connected to Azure" -ForegroundColor Green
    }
    catch
    {
        Write-Error "Failed to connect to Azure: $_"
        throw
    }
}

function New-AzureResourceDeployment
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        
        [Parameter(Mandatory)]
        [string]$Location,
        
        [Parameter()]
        [hashtable]$Tags = @{}
    )
    
    if ($PSCmdlet.ShouldProcess($ResourceGroupName, 'Create/Update Resource Group'))
    {
        try
        {
            # Idempotent: Check if resource group exists
            $rg = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
            
            if ($null -eq $rg)
            {
                Write-Verbose "Creating new resource group: $ResourceGroupName"
                $rg = New-AzResourceGroup -Name $ResourceGroupName -Location $Location -Tag $Tags
                Write-Host "✓ Created resource group: $ResourceGroupName" -ForegroundColor Green
            }
            else
            {
                Write-Verbose "Resource group already exists: $ResourceGroupName"
                # Update tags if different
                if ($Tags.Count -gt 0)
                {
                    Set-AzResourceGroup -Name $ResourceGroupName -Tag $Tags | Out-Null
                    Write-Host "✓ Updated resource group tags" -ForegroundColor Green
                }
            }
            
            return $rg
        }
        catch
        {
            Write-Error "Failed to create/update resource group: $_"
            throw
        }
    }
}

#endregion

#region AWS Functions

function Connect-AWSEnvironment
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ProfileName,
        
        [Parameter(Mandatory)]
        [string]$Region
    )
    
    try
    {
        # Set AWS credentials from profile
        Set-AWSCredential -ProfileName $ProfileName -ErrorAction Stop
        Set-DefaultAWSRegion -Region $Region -ErrorAction Stop

        Write-Host "✓ Connected to AWS (Profile: $ProfileName, Region: $Region)" -ForegroundColor Green
    }
    catch
    {
        Write-Error "Failed to connect to AWS: $_"
        throw
    }
}

#endregion

#region Main Execution

try
{
    Write-Host "Starting cloud orchestration for $CloudProvider ($Environment environment)" -ForegroundColor Cyan

    # Environment-specific configuration
    $config = @{
        Dev = @{
            Azure = @{
                TenantId = '00000000-0000-0000-0000-000000000000'
                Location = 'eastus'
                ResourceGroupName = 'rg-dev-example'
            }
            AWS = @{
                ProfileName = 'dev-profile'
                Region = 'us-east-1'
            }
        }
        Test = @{
            Azure = @{
                TenantId = '11111111-1111-1111-1111-111111111111'
                Location = 'centralus'
                ResourceGroupName = 'rg-test-example'
            }
            AWS = @{
                ProfileName = 'test-profile'
                Region = 'us-west-2'
            }
        }
        Prod = @{
            Azure = @{
                TenantId = '22222222-2222-2222-2222-222222222222'
                Location = 'westus'
                ResourceGroupName = 'rg-prod-example'
            }
            AWS = @{
                ProfileName = 'prod-profile'
                Region = 'us-east-1'
            }
        }
    }

    $envConfig = $config[$Environment][$CloudProvider]

    # Common tags
    $tags = @{
        Environment = $Environment
        ManagedBy = 'PowerShell'
        CreatedDate = (Get-Date -Format 'yyyy-MM-dd')
    }

    switch ($CloudProvider)
    {
        'Azure'
        {
            Connect-AzureEnvironment -TenantId $envConfig.TenantId -UseManagedIdentity:$false

            $deployment = New-AzureResourceDeployment `
                -ResourceGroupName $envConfig.ResourceGroupName `
                -Location $envConfig.Location `
                -Tags $tags `
                -WhatIf:$WhatIfPreference

            Write-Host "`n✓ Azure deployment completed successfully" -ForegroundColor Green
        }

        'AWS'
        {
            Connect-AWSEnvironment -ProfileName $envConfig.ProfileName -Region $envConfig.Region

            # AWS resource creation would go here
            Write-Host "`n✓ AWS deployment completed successfully" -ForegroundColor Green
        }
    }
}
catch
{
    Write-Error "Cloud orchestration failed: $_"
    exit 1
}

#endregion

