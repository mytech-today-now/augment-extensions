<#
.SYNOPSIS
    Example PowerShell module demonstrating best practices.

.DESCRIPTION
    This module demonstrates:
    - Advanced functions with CmdletBinding
    - Parameter validation
    - Pipeline support
    - Error handling
    - Module-scoped variables
    - Public/private function separation
#>

#Requires -Version 7.4

# Module-scoped variables
$script:ModuleConfig = @{
    DefaultTimeout = 30
    MaxRetries = 3
    LogLevel = 'Info'
}

#region Private Functions

function Write-ModuleLog
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Info', 'Warning', 'Error')]
        [string]$Level,
        
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logMessage = "[$timestamp] [$Level] $Message"
    
    switch ($Level)
    {
        'Info' { Write-Verbose $logMessage }
        'Warning' { Write-Warning $logMessage }
        'Error' { Write-Error $logMessage }
    }
}

function Invoke-WithRetry
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [scriptblock]$ScriptBlock,
        
        [Parameter()]
        [int]$MaxRetries = $script:ModuleConfig.MaxRetries,
        
        [Parameter()]
        [int]$DelaySeconds = 2
    )
    
    $attempt = 0
    
    while ($attempt -lt $MaxRetries)
    {
        $attempt++
        
        try
        {
            return & $ScriptBlock
        }
        catch
        {
            Write-ModuleLog -Level Warning -Message "Attempt $attempt failed: $($_.Exception.Message)"
            
            if ($attempt -lt $MaxRetries)
            {
                Start-Sleep -Seconds $DelaySeconds
            }
            else
            {
                throw
            }
        }
    }
}

#endregion

#region Public Functions

function Get-UserData
{
    <#
    .SYNOPSIS
        Retrieves user data with validation and error handling.
    
    .DESCRIPTION
        Demonstrates advanced function with CmdletBinding, parameter validation,
        pipeline support, and comprehensive error handling.
    
    .PARAMETER UserName
        Username(s) to retrieve data for.
    
    .PARAMETER IncludeDetails
        Include detailed user information.
    
    .EXAMPLE
        Get-UserData -UserName 'jdoe'
        Get basic user data for jdoe.
    
    .EXAMPLE
        'jdoe','asmith' | Get-UserData -IncludeDetails
        Get detailed user data for multiple users via pipeline.
    #>
    
    [CmdletBinding()]
    [OutputType([PSCustomObject])]
    param(
        [Parameter(Mandatory, ValueFromPipeline, ValueFromPipelineByPropertyName)]
        [ValidateNotNullOrEmpty()]
        [ValidatePattern('^[a-zA-Z0-9._-]+$')]
        [Alias('Name', 'User')]
        [string[]]$UserName,
        
        [Parameter()]
        [switch]$IncludeDetails
    )
    
    begin
    {
        Write-ModuleLog -Level Info -Message "Starting Get-UserData"
        $results = [System.Collections.Generic.List[PSCustomObject]]::new()
    }
    
    process
    {
        foreach ($user in $UserName)
        {
            try
            {
                Write-ModuleLog -Level Info -Message "Processing user: $user"
                
                # Simulate data retrieval with retry logic
                $userData = Invoke-WithRetry -ScriptBlock {
                    # Simulated API call
                    [PSCustomObject]@{
                        UserName = $user
                        DisplayName = "$user Display Name"
                        Email = "$user@example.com"
                        Created = (Get-Date).AddDays(-365)
                        LastLogin = Get-Date
                    }
                }
                
                if ($IncludeDetails)
                {
                    # Add detailed information
                    $userData | Add-Member -NotePropertyName 'Department' -NotePropertyValue 'IT'
                    $userData | Add-Member -NotePropertyName 'Manager' -NotePropertyValue 'manager@example.com'
                }
                
                $results.Add($userData)
                
                # Output to pipeline immediately
                Write-Output $userData
            }
            catch
            {
                Write-ModuleLog -Level Error -Message "Failed to get data for $user: $($_.Exception.Message)"
                
                # Write non-terminating error
                Write-Error -Message "Failed to retrieve user data for $user" -Category ObjectNotFound -TargetObject $user
            }
        }
    }
    
    end
    {
        Write-ModuleLog -Level Info -Message "Completed Get-UserData. Processed $($results.Count) users"
    }
}

function Set-UserData
{
    <#
    .SYNOPSIS
        Updates user data with ShouldProcess support.
    
    .DESCRIPTION
        Demonstrates ShouldProcess for -WhatIf and -Confirm support.
    
    .PARAMETER UserName
        Username to update.
    
    .PARAMETER Department
        New department value.
    
    .PARAMETER Force
        Skip confirmation prompts.
    
    .EXAMPLE
        Set-UserData -UserName 'jdoe' -Department 'Engineering' -WhatIf
        Preview changes without applying them.
    #>
    
    [CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'Medium')]
    param(
        [Parameter(Mandatory, ValueFromPipelineByPropertyName)]
        [ValidateNotNullOrEmpty()]
        [string]$UserName,
        
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [string]$Department,
        
        [Parameter()]
        [switch]$Force
    )
    
    process
    {
        if ($Force -or $PSCmdlet.ShouldProcess($UserName, "Update department to $Department"))
        {
            try
            {
                Write-ModuleLog -Level Info -Message "Updating $UserName department to $Department"
                
                # Simulated update operation
                Start-Sleep -Milliseconds 100
                
                Write-ModuleLog -Level Info -Message "Successfully updated $UserName"
                
                [PSCustomObject]@{
                    UserName = $UserName
                    Department = $Department
                    Updated = Get-Date
                    Success = $true
                }
            }
            catch
            {
                Write-ModuleLog -Level Error -Message "Failed to update $UserName: $($_.Exception.Message)"
                throw
            }
        }
    }
}

#endregion

# Export public functions
Export-ModuleMember -Function Get-UserData, Set-UserData

