<#
.SYNOPSIS
    Wrapper script for bd-query.ps1 and bd-write.ps1 - mimics 'bd' command

.DESCRIPTION
    A wrapper that allows you to use 'bd' syntax without the Dolt server.
    Routes read commands to bd-query.ps1 and write commands to bd-write.ps1.
    Supports both Unix-style (--parameter) and PowerShell-style (-Parameter) arguments.
    Usage: .\.beads\bd.ps1 <command> [options]

.EXAMPLE
    # Read operations
    .\.beads\bd.ps1 list
    .\.beads\bd.ps1 ready
    .\.beads\bd.ps1 ready --limit 0
    .\.beads\bd.ps1 show bd-123
    .\.beads\bd.ps1 stats

    # Write operations
    .\.beads\bd.ps1 create "Fix bug" --priority 1
    .\.beads\bd.ps1 update bd-123 --status in_progress
    .\.beads\bd.ps1 close bd-123 --reason "Fixed"
    .\.beads\bd.ps1 comment bd-123 "Working on this"

.NOTES
    This is a lightweight alternative to the full 'bd' CLI when Dolt server is not available.
    Automatically converts Unix-style --parameter to PowerShell-style -Parameter.
#>

# Convert Unix-style arguments (--parameter) to PowerShell-style (-Parameter)
function Convert-Arguments {
    param([array]$Arguments)

    $converted = @()

    for ($i = 0; $i -lt $Arguments.Count; $i++) {
        $arg = $Arguments[$i]

        # Check if this is a double-dash parameter
        if ($arg -match '^--([a-zA-Z].*)$') {
            $paramName = $Matches[1]
            # Capitalize first letter for PowerShell convention
            $paramName = $paramName.Substring(0, 1).ToUpper() + $paramName.Substring(1)
            $converted += "-$paramName"
        } else {
            $converted += $arg
        }
    }

    return $converted
}

# Determine which script to use based on command
$readCommands = @('list', 'show', 'count', 'ready', 'search', 'stats', 'help')
$writeCommands = @('create', 'update', 'close', 'reopen', 'comment', 'assign', 'link')
$utilityCommands = @('sync')

# Get the command (first argument)
$command = if ($args.Count -gt 0) { $args[0] } else { 'list' }

# Select the appropriate script
if ($writeCommands -contains $command) {
    $scriptPath = Join-Path $PSScriptRoot "bd-write.ps1"
} elseif ($utilityCommands -contains $command) {
    $scriptPath = Join-Path $PSScriptRoot "bd-sync.ps1"
} else {
    $scriptPath = Join-Path $PSScriptRoot "bd-query.ps1"
}

# Convert the arguments
if ($args.Count -gt 0) {
    $convertedArgs = Convert-Arguments -Arguments $args
    # Use Invoke-Expression to properly expand the arguments
    $argString = ($convertedArgs | ForEach-Object {
        if ($_ -match '\s') {
            "`"$_`""
        } else {
            $_
        }
    }) -join ' '
    Invoke-Expression "& `"$scriptPath`" $argString"
} else {
    & $scriptPath
}

