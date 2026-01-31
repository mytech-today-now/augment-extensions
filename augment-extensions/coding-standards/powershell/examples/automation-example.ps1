<#
.SYNOPSIS
    Automated system maintenance script with comprehensive error handling and logging.

.DESCRIPTION
    This script demonstrates PowerShell automation best practices including:
    - Comment-based help
    - Parameter validation
    - Error handling with try/catch
    - Logging and auditing
    - Progress reporting
    - Cleanup operations

.PARAMETER ComputerName
    Target computer(s) for maintenance operations.

.PARAMETER LogPath
    Path to log file. Defaults to script directory.

.PARAMETER SkipDiskCleanup
    Skip disk cleanup operations.

.PARAMETER WhatIf
    Show what would happen without making changes.

.EXAMPLE
    .\automation-example.ps1 -ComputerName 'SERVER01'
    Run maintenance on SERVER01 with default settings.

.EXAMPLE
    .\automation-example.ps1 -ComputerName 'SERVER01','SERVER02' -SkipDiskCleanup -WhatIf
    Preview maintenance on multiple servers without disk cleanup.

.NOTES
    Author: PowerShell Standards Team
    Version: 1.0.0
    Requires: PowerShell 7.4+
#>

#Requires -Version 7.4
#Requires -RunAsAdministrator

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory, ValueFromPipeline)]
    [ValidateNotNullOrEmpty()]
    [string[]]$ComputerName,
    
    [Parameter()]
    [ValidateScript({ Test-Path (Split-Path $_) })]
    [string]$LogPath = (Join-Path $PSScriptRoot 'maintenance.log'),
    
    [Parameter()]
    [switch]$SkipDiskCleanup
)

begin
{
    # Initialize logging
    function Write-Log
    {
        [CmdletBinding()]
        param(
            [Parameter(Mandatory)]
            [ValidateSet('Info', 'Warning', 'Error', 'Success')]
            [string]$Level,
            
            [Parameter(Mandatory)]
            [string]$Message
        )
        
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logEntry = "[$timestamp] [$Level] $Message"
        
        Add-Content -Path $LogPath -Value $logEntry
        
        switch ($Level)
        {
            'Info' { Write-Verbose $Message }
            'Warning' { Write-Warning $Message }
            'Error' { Write-Error $Message }
            'Success' { Write-Output $Message }
        }
    }
    
    Write-Log -Level Info -Message "Starting maintenance script"
    Write-Log -Level Info -Message "Target computers: $($ComputerName -join ', ')"
    
    $totalComputers = $ComputerName.Count
    $currentComputer = 0
}

process
{
    foreach ($computer in $ComputerName)
    {
        $currentComputer++
        $percentComplete = ($currentComputer / $totalComputers) * 100
        
        Write-Progress -Activity "System Maintenance" `
                      -Status "Processing $computer" `
                      -PercentComplete $percentComplete `
                      -CurrentOperation "Computer $currentComputer of $totalComputers"
        
        try
        {
            # Test connectivity
            Write-Log -Level Info -Message "Testing connectivity to $computer"
            
            if (-not (Test-Connection -ComputerName $computer -Count 1 -Quiet))
            {
                throw "Computer $computer is not reachable"
            }
            
            # Get system information
            Write-Log -Level Info -Message "Gathering system information from $computer"
            
            $session = New-CimSession -ComputerName $computer -ErrorAction Stop
            
            try
            {
                $os = Get-CimInstance -CimSession $session -ClassName Win32_OperatingSystem
                $disk = Get-CimInstance -CimSession $session -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
                
                Write-Log -Level Info -Message "$computer - OS: $($os.Caption), Free Space: $([math]::Round($disk.FreeSpace / 1GB, 2)) GB"
                
                # Check disk space
                $freeSpacePercent = ($disk.FreeSpace / $disk.Size) * 100
                
                if ($freeSpacePercent -lt 10)
                {
                    Write-Log -Level Warning -Message "$computer - Low disk space: $([math]::Round($freeSpacePercent, 2))%"
                    
                    if (-not $SkipDiskCleanup)
                    {
                        if ($PSCmdlet.ShouldProcess($computer, "Clean temporary files"))
                        {
                            Write-Log -Level Info -Message "$computer - Starting disk cleanup"
                            # Disk cleanup logic here
                            Write-Log -Level Success -Message "$computer - Disk cleanup completed"
                        }
                    }
                }
                
                # Check for pending updates
                Write-Log -Level Info -Message "$computer - Checking for pending updates"
                
                # Update check logic here
                
                Write-Log -Level Success -Message "$computer - Maintenance completed successfully"
            }
            finally
            {
                Remove-CimSession -CimSession $session
            }
        }
        catch
        {
            Write-Log -Level Error -Message "$computer - Maintenance failed: $($_.Exception.Message)"
            
            # Continue processing other computers
            continue
        }
    }
}

end
{
    Write-Progress -Activity "System Maintenance" -Completed
    Write-Log -Level Info -Message "Maintenance script completed"
    Write-Output "Log file: $LogPath"
}

