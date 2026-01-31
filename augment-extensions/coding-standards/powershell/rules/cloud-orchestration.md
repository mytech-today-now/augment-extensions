# PowerShell Cloud Orchestration

Best practices for Azure/AWS PowerShell, ARM/Bicep integration, and authentication patterns.

## Azure PowerShell

### Authentication

```powershell
#Requires -Version 7.4
#Requires -Modules Az.Accounts, Az.Resources

# ✅ GOOD: Use managed identity in Azure
function Connect-AzureWithManagedIdentity
{
    [CmdletBinding()]
    param()
    
    try
    {
        # Connect using managed identity
        Connect-AzAccount -Identity -ErrorAction Stop
        Write-Verbose "Connected to Azure using Managed Identity"
    }
    catch
    {
        Write-Error "Failed to connect with Managed Identity: $_"
        throw
    }
}

# ✅ GOOD: Use service principal for automation
function Connect-AzureWithServicePrincipal
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$TenantId,
        
        [Parameter(Mandatory)]
        [string]$ApplicationId,
        
        [Parameter(Mandatory)]
        [PSCredential]$Credential
    )
    
    $params = @{
        ServicePrincipal = $true
        TenantId = $TenantId
        Credential = $Credential
        ApplicationId = $ApplicationId
    }
    
    Connect-AzAccount @params -ErrorAction Stop
}

# ❌ BAD: Interactive login in automation
# Connect-AzAccount  # Don't use in scripts
```

### Resource Management

```powershell
function New-AzureResourceGroup
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [ValidatePattern('^[a-zA-Z0-9-_]+$')]
        [string]$ResourceGroupName,
        
        [Parameter(Mandatory)]
        [ValidateSet('eastus', 'westus', 'centralus', 'northeurope', 'westeurope')]
        [string]$Location,
        
        [Parameter()]
        [hashtable]$Tags = @{}
    )
    
    if ($PSCmdlet.ShouldProcess($ResourceGroupName, 'Create Resource Group'))
    {
        try
        {
            $params = @{
                Name = $ResourceGroupName
                Location = $Location
                Tag = $Tags
                ErrorAction = 'Stop'
            }
            
            $rg = New-AzResourceGroup @params
            Write-Verbose "Created resource group: $($rg.ResourceGroupName)"
            return $rg
        }
        catch
        {
            Write-Error "Failed to create resource group: $_"
            throw
        }
    }
}
```

### ARM Template Deployment

```powershell
function Deploy-AzureARMTemplate
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        
        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ -PathType Leaf })]
        [string]$TemplateFile,
        
        [Parameter()]
        [ValidateScript({ Test-Path $_ -PathType Leaf })]
        [string]$ParametersFile,
        
        [Parameter()]
        [string]$DeploymentName = "deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    )
    
    try
    {
        $deployParams = @{
            ResourceGroupName = $ResourceGroupName
            TemplateFile = $TemplateFile
            Name = $DeploymentName
            Mode = 'Incremental'
            ErrorAction = 'Stop'
        }
        
        if ($ParametersFile)
        {
            $deployParams['TemplateParameterFile'] = $ParametersFile
        }
        
        # Validate template first
        $validation = Test-AzResourceGroupDeployment @deployParams
        if ($validation)
        {
            Write-Error "Template validation failed: $($validation.Message)"
            return
        }
        
        # Deploy template
        $deployment = New-AzResourceGroupDeployment @deployParams -Verbose
        Write-Output "Deployment completed: $($deployment.ProvisioningState)"
        return $deployment
    }
    catch
    {
        Write-Error "Deployment failed: $_"
        throw
    }
}
```

### Bicep Integration

```powershell
function Deploy-BicepTemplate
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,

        [Parameter(Mandatory)]
        [ValidateScript({ Test-Path $_ -PathType Leaf })]
        [string]$BicepFile,

        [Parameter()]
        [hashtable]$Parameters = @{}
    )

    try
    {
        # Build Bicep to ARM
        $armTemplate = $BicepFile -replace '\.bicep$', '.json'
        bicep build $BicepFile --outfile $armTemplate

        if (-not (Test-Path $armTemplate))
        {
            throw "Bicep build failed"
        }

        # Deploy ARM template
        $deployParams = @{
            ResourceGroupName = $ResourceGroupName
            TemplateFile = $armTemplate
            TemplateParameterObject = $Parameters
            ErrorAction = 'Stop'
        }

        New-AzResourceGroupDeployment @deployParams -Verbose
    }
    finally
    {
        # Clean up generated ARM template
        if (Test-Path $armTemplate)
        {
            Remove-Item $armTemplate -Force
        }
    }
}
```

## AWS PowerShell

### Authentication

```powershell
#Requires -Modules AWS.Tools.Common, AWS.Tools.EC2

# ✅ GOOD: Use IAM role in EC2
function Initialize-AWSCredentials
{
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$ProfileName,

        [Parameter()]
        [string]$Region = 'us-east-1'
    )

    try
    {
        if ($ProfileName)
        {
            # Use named profile
            Set-AWSCredential -ProfileName $ProfileName
        }
        else
        {
            # Use instance profile (IAM role)
            $instanceProfile = Invoke-RestMethod -Uri 'http://169.254.169.254/latest/meta-data/iam/security-credentials/' -TimeoutSec 2
            Write-Verbose "Using instance profile: $instanceProfile"
        }

        Set-DefaultAWSRegion -Region $Region
        Write-Verbose "AWS credentials initialized for region: $Region"
    }
    catch
    {
        Write-Error "Failed to initialize AWS credentials: $_"
        throw
    }
}
```

### EC2 Instance Management

```powershell
function New-EC2InstanceWithTags
{
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$ImageId,

        [Parameter(Mandatory)]
        [string]$InstanceType,

        [Parameter(Mandatory)]
        [string]$KeyName,

        [Parameter()]
        [hashtable]$Tags = @{}
    )

    if ($PSCmdlet.ShouldProcess("EC2 Instance", "Create"))
    {
        try
        {
            # Create instance
            $instance = New-EC2Instance -ImageId $ImageId `
                                       -InstanceType $InstanceType `
                                       -KeyName $KeyName `
                                       -MinCount 1 `
                                       -MaxCount 1

            $instanceId = $instance.Instances[0].InstanceId
            Write-Verbose "Created instance: $instanceId"

            # Wait for instance to exist
            Start-Sleep -Seconds 5

            # Apply tags
            $tagList = $Tags.GetEnumerator() | ForEach-Object {
                [Amazon.EC2.Model.Tag]@{
                    Key = $_.Key
                    Value = $_.Value
                }
            }

            New-EC2Tag -Resource $instanceId -Tag $tagList
            Write-Output "Instance $instanceId created and tagged"

            return $instanceId
        }
        catch
        {
            Write-Error "Failed to create EC2 instance: $_"
            throw
        }
    }
}
```

## Error Handling and Retry Logic

### Implement Retry for Transient Failures

```powershell
function Invoke-CloudCommandWithRetry
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [scriptblock]$ScriptBlock,

        [Parameter()]
        [int]$MaxRetries = 3,

        [Parameter()]
        [int]$RetryDelaySeconds = 5
    )

    $attempt = 0
    $success = $false

    while (-not $success -and $attempt -lt $MaxRetries)
    {
        $attempt++

        try
        {
            $result = & $ScriptBlock
            $success = $true
            return $result
        }
        catch
        {
            Write-Warning "Attempt $attempt failed: $_"

            if ($attempt -lt $MaxRetries)
            {
                Write-Verbose "Retrying in $RetryDelaySeconds seconds..."
                Start-Sleep -Seconds $RetryDelaySeconds
            }
            else
            {
                Write-Error "All $MaxRetries attempts failed"
                throw
            }
        }
    }
}

# Usage
$result = Invoke-CloudCommandWithRetry -ScriptBlock {
    Get-AzVM -ResourceGroupName 'MyRG' -Name 'MyVM'
} -MaxRetries 3
```

## Best Practices

1. **Use managed identities** - Avoid storing credentials
2. **Implement retry logic** - Handle transient failures
3. **Validate before deployment** - Test templates first
4. **Use parameter splatting** - Improve readability
5. **Tag all resources** - For cost tracking and organization
6. **Use specific modules** - Import only what you need
7. **Handle regions properly** - Set default region
8. **Implement proper logging** - Track all operations
9. **Use ShouldProcess** - For destructive operations
10. **Clean up resources** - Remove temporary resources in finally blocks


