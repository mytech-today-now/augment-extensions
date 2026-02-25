<#
.SYNOPSIS
    Query Beads issues.jsonl directly without requiring Dolt server

.DESCRIPTION
    A PowerShell-based query tool for Beads JSONL files that mimics common bd commands.
    Works without requiring a Dolt server connection.

.EXAMPLE
    .\.beads\bd-query.ps1 list
    .\.beads\bd-query.ps1 list -Status open -Priority 1
    .\.beads\bd-query.ps1 show bd-123
    .\.beads\bd-query.ps1 ready
    .\.beads\bd-query.ps1 count
    .\.beads\bd-query.ps1 search "authentication"

.NOTES
    Author: Augment Extensions
    Version: 1.0.0
#>

param(
    [Parameter(Position=0)]
    [ValidateSet('list', 'show', 'count', 'ready', 'search', 'stats', 'help')]
    [string]$Command = 'list',
    
    [Parameter(Position=1)]
    [string]$IssueId = $null,
    
    [string]$Status = $null,
    [int]$Priority = $null,
    [string]$Assignee = $null,
    [string]$Label = $null,
    [string]$Search = $null,
    [string]$Title = $null,
    [int]$Limit = 50,
    [switch]$All,
    [switch]$Json,
    [switch]$Long,
    [switch]$Tree
)

$ErrorActionPreference = 'Stop'
$issuesFile = Join-Path $PSScriptRoot "issues.jsonl"

# Helper function to show help
function Show-Help {
    Write-Host @"
bd-query - Query Beads issues without Dolt server

USAGE:
    bd-query.ps1 <command> [options]

COMMANDS:
    list        List issues (default)
    show        Show detailed issue information
    ready       Show ready-to-work issues (open, no blockers)
    count       Count issues by status
    stats       Show issue statistics
    search      Search issues by text
    help        Show this help message

OPTIONS:
    -Status <status>      Filter by status (open, in_progress, blocked, deferred, closed)
    -Priority <0-4>       Filter by priority (0=highest, 4=lowest)
    -Assignee <name>      Filter by assignee
    -Label <label>        Filter by label
    -Search <text>        Search in title and description
    -Title <text>         Filter by title text
    -Limit <n>            Limit results (default: 50, use 0 for all)
    -All                  Show all issues including closed
    -Json                 Output in JSON format
    -Long                 Show detailed output
    -Tree                 Show hierarchical tree format

EXAMPLES:
    # List all open issues
    bd-query.ps1 list -Status open

    # Show high priority issues
    bd-query.ps1 list -Priority 1

    # Show issue details
    bd-query.ps1 show bd-123

    # Find ready-to-work issues
    bd-query.ps1 ready

    # Show ALL ready issues (no limit)
    bd-query.ps1 ready -Limit 0

    # Search for issues
    bd-query.ps1 search "authentication"

    # Get issue statistics
    bd-query.ps1 stats

    # Count issues by status
    bd-query.ps1 count

NOTE:
    When using bd.ps1 wrapper, you can use Unix-style arguments:
    bd.ps1 ready --limit 0
    bd.ps1 list --status open --priority 1
"@
}

# Helper function to load issues
function Get-LatestIssues {
    if (-not (Test-Path $issuesFile)) {
        Write-Error "issues.jsonl not found at $issuesFile"
        exit 1
    }

    # Read all issues
    $allIssues = Get-Content $issuesFile | ForEach-Object { 
        try {
            $_ | ConvertFrom-Json
        } catch {
            # Skip invalid JSON lines
        }
    }

    # Get the latest state of each issue (JSONL is append-only)
    $latestIssues = @{}
    foreach ($issue in $allIssues) {
        if ($issue.id) {
            $latestIssues[$issue.id] = $issue
        }
    }

    return $latestIssues.Values
}

# Helper function to filter issues
function Filter-Issues {
    param($issues)

    if ($Status) {
        $issues = $issues | Where-Object { $_.status -eq $Status }
    }

    if ($Priority -ne $null) {
        $issues = $issues | Where-Object { $_.priority -eq $Priority }
    }

    if ($Assignee) {
        $issues = $issues | Where-Object { $_.assignee -like "*$Assignee*" }
    }

    if ($Label) {
        $issues = $issues | Where-Object { 
            $_.labels -and ($_.labels -contains $Label)
        }
    }

    if ($Search) {
        $issues = $issues | Where-Object { 
            ($_.title -like "*$Search*") -or 
            ($_.description -like "*$Search*")
        }
    }

    if ($Title) {
        $issues = $issues | Where-Object { $_.title -like "*$Title*" }
    }

    if (-not $All) {
        $issues = $issues | Where-Object { $_.status -ne 'closed' }
    }

    return $issues
}

# Helper function to format issue for display
function Format-Issue {
    param($issue, [switch]$Detailed)

    if ($Detailed) {
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "ID:          " -NoNewline -ForegroundColor Gray
        Write-Host $issue.id -ForegroundColor White
        Write-Host "Title:       " -NoNewline -ForegroundColor Gray
        Write-Host $issue.title -ForegroundColor White
        Write-Host "Status:      " -NoNewline -ForegroundColor Gray
        $statusColor = switch ($issue.status) {
            'open' { 'Green' }
            'in_progress' { 'Yellow' }
            'blocked' { 'Red' }
            'deferred' { 'Magenta' }
            'closed' { 'Gray' }
            default { 'White' }
        }
        Write-Host $issue.status -ForegroundColor $statusColor
        Write-Host "Priority:    " -NoNewline -ForegroundColor Gray
        Write-Host "P$($issue.priority)" -ForegroundColor $(if ($issue.priority -le 1) { 'Red' } elseif ($issue.priority -eq 2) { 'Yellow' } else { 'White' })

        if ($issue.assignee) {
            Write-Host "Assignee:    " -NoNewline -ForegroundColor Gray
            Write-Host $issue.assignee -ForegroundColor White
        }

        if ($issue.labels -and $issue.labels.Count -gt 0) {
            Write-Host "Labels:      " -NoNewline -ForegroundColor Gray
            Write-Host ($issue.labels -join ', ') -ForegroundColor Cyan
        }

        if ($issue.created_at) {
            Write-Host "Created:     " -NoNewline -ForegroundColor Gray
            Write-Host $issue.created_at -ForegroundColor White
        }

        if ($issue.updated_at) {
            Write-Host "Updated:     " -NoNewline -ForegroundColor Gray
            Write-Host $issue.updated_at -ForegroundColor White
        }

        if ($issue.blocked_by -and $issue.blocked_by.Count -gt 0) {
            Write-Host "Blocked By:  " -NoNewline -ForegroundColor Gray
            Write-Host ($issue.blocked_by -join ', ') -ForegroundColor Red
        }

        if ($issue.blocks -and $issue.blocks.Count -gt 0) {
            Write-Host "Blocks:      " -NoNewline -ForegroundColor Gray
            Write-Host ($issue.blocks -join ', ') -ForegroundColor Yellow
        }

        if ($issue.description) {
            Write-Host "`nDescription:" -ForegroundColor Gray
            Write-Host $issue.description -ForegroundColor White
        }

        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
    }
}

# Command: list
function Invoke-List {
    $issues = Get-LatestIssues
    $issues = Filter-Issues $issues

    # Sort by priority (ascending) then by created date
    $issues = $issues | Sort-Object priority, created_at

    # Apply limit
    if ($Limit -gt 0) {
        $issues = $issues | Select-Object -First $Limit
    }

    if ($Json) {
        $issues | ConvertTo-Json -Depth 10
    } elseif ($Long) {
        foreach ($issue in $issues) {
            Format-Issue $issue -Detailed
        }
    } else {
        $issues | Select-Object `
            @{Name='ID'; Expression={$_.id}},
            @{Name='Title'; Expression={$_.title}},
            @{Name='Status'; Expression={$_.status}},
            @{Name='P'; Expression={$_.priority}},
            @{Name='Assignee'; Expression={$_.assignee}},
            @{Name='Blockers'; Expression={if ($_.blocked_by) { $_.blocked_by.Count } else { 0 }}} |
            Format-Table -AutoSize
    }

    Write-Host "`nTotal: $($issues.Count) issues" -ForegroundColor Gray
}

# Command: show
function Invoke-Show {
    param($id)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-query.ps1 show <issue-id>"
        exit 1
    }

    $issues = Get-LatestIssues
    $issue = $issues | Where-Object { $_.id -eq $id }

    if (-not $issue) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    if ($Json) {
        $issue | ConvertTo-Json -Depth 10
    } else {
        Format-Issue $issue -Detailed
    }
}

# Command: ready
function Invoke-Ready {
    $issues = Get-LatestIssues

    # Filter for ready issues: open status, no blockers
    $readyIssues = $issues | Where-Object {
        $_.status -eq 'open' -and
        (-not $_.blocked_by -or $_.blocked_by.Count -eq 0)
    }

    # Sort by priority (0=highest, 4=lowest), then by created date
    # This ensures highest priority tasks appear first
    $readyIssues = $readyIssues | Sort-Object priority, created_at

    # Apply limit if specified (0 means show all)
    if ($Limit -gt 0) {
        $readyIssues = $readyIssues | Select-Object -First $Limit
    }

    if ($Json) {
        $readyIssues | ConvertTo-Json -Depth 10
    } elseif ($Long) {
        foreach ($issue in $readyIssues) {
            Format-Issue $issue -Detailed
        }
    } else {
        Write-Host "`n🚀 Ready to Work Issues (sorted by priority):" -ForegroundColor Green
        $readyIssues | Select-Object `
            @{Name='ID'; Expression={$_.id}},
            @{Name='Title'; Expression={$_.title}},
            @{Name='P'; Expression={$_.priority}},
            @{Name='Assignee'; Expression={$_.assignee}} |
            Format-Table -AutoSize
    }

    Write-Host "`nTotal: $($readyIssues.Count) ready issues" -ForegroundColor Gray
}

# Command: count
function Invoke-Count {
    $issues = Get-LatestIssues

    $statusCounts = $issues | Group-Object status | Select-Object `
        @{Name='Status'; Expression={$_.Name}},
        @{Name='Count'; Expression={$_.Count}}

    Write-Host "`n📊 Issue Count by Status:" -ForegroundColor Cyan
    $statusCounts | Format-Table -AutoSize
    Write-Host "Total: $($issues.Count) issues`n" -ForegroundColor Gray
}

# Command: stats
function Invoke-Stats {
    $issues = Get-LatestIssues

    $total = $issues.Count
    $open = ($issues | Where-Object { $_.status -eq 'open' }).Count
    $inProgress = ($issues | Where-Object { $_.status -eq 'in_progress' }).Count
    $blocked = ($issues | Where-Object { $_.status -eq 'blocked' }).Count
    $deferred = ($issues | Where-Object { $_.status -eq 'deferred' }).Count
    $closed = ($issues | Where-Object { $_.status -eq 'closed' }).Count

    $p0 = ($issues | Where-Object { $_.priority -eq 0 -and $_.status -ne 'closed' }).Count
    $p1 = ($issues | Where-Object { $_.priority -eq 1 -and $_.status -ne 'closed' }).Count
    $p2 = ($issues | Where-Object { $_.priority -eq 2 -and $_.status -ne 'closed' }).Count

    $ready = ($issues | Where-Object {
        $_.status -eq 'open' -and
        (-not $_.blocked_by -or $_.blocked_by.Count -eq 0)
    }).Count

    Write-Host "`n📈 Issue Statistics" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "`nTotal Issues:        " -NoNewline -ForegroundColor Gray
    Write-Host $total -ForegroundColor White

    Write-Host "`nBy Status:" -ForegroundColor Yellow
    Write-Host "  Open:              " -NoNewline -ForegroundColor Gray
    Write-Host $open -ForegroundColor Green
    Write-Host "  In Progress:       " -NoNewline -ForegroundColor Gray
    Write-Host $inProgress -ForegroundColor Yellow
    Write-Host "  Blocked:           " -NoNewline -ForegroundColor Gray
    Write-Host $blocked -ForegroundColor Red
    Write-Host "  Deferred:          " -NoNewline -ForegroundColor Gray
    Write-Host $deferred -ForegroundColor Magenta
    Write-Host "  Closed:            " -NoNewline -ForegroundColor Gray
    Write-Host $closed -ForegroundColor Gray

    Write-Host "`nBy Priority (Open):" -ForegroundColor Yellow
    Write-Host "  P0 (Critical):     " -NoNewline -ForegroundColor Gray
    Write-Host $p0 -ForegroundColor Red
    Write-Host "  P1 (High):         " -NoNewline -ForegroundColor Gray
    Write-Host $p1 -ForegroundColor Red
    Write-Host "  P2 (Medium):       " -NoNewline -ForegroundColor Gray
    Write-Host $p2 -ForegroundColor Yellow

    Write-Host "`nReady to Work:       " -NoNewline -ForegroundColor Gray
    Write-Host $ready -ForegroundColor Green

    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
}

# Command: search
function Invoke-Search {
    param($searchTerm)

    if (-not $searchTerm) {
        Write-Error "Search term required. Usage: bd-query.ps1 search <text>"
        exit 1
    }

    $issues = Get-LatestIssues
    $results = $issues | Where-Object {
        ($_.title -like "*$searchTerm*") -or
        ($_.description -like "*$searchTerm*") -or
        ($_.id -like "*$searchTerm*")
    }

    if (-not $All) {
        $results = $results | Where-Object { $_.status -ne 'closed' }
    }

    $results = $results | Sort-Object priority, created_at

    if ($Limit -gt 0) {
        $results = $results | Select-Object -First $Limit
    }

    if ($Json) {
        $results | ConvertTo-Json -Depth 10
    } elseif ($Long) {
        foreach ($issue in $results) {
            Format-Issue $issue -Detailed
        }
    } else {
        Write-Host "`n🔍 Search Results for '$searchTerm':" -ForegroundColor Cyan
        $results | Select-Object `
            @{Name='ID'; Expression={$_.id}},
            @{Name='Title'; Expression={$_.title}},
            @{Name='Status'; Expression={$_.status}},
            @{Name='P'; Expression={$_.priority}} |
            Format-Table -AutoSize
    }

    Write-Host "`nFound: $($results.Count) issues`n" -ForegroundColor Gray
}

# Main execution
switch ($Command) {
    'list' { Invoke-List }
    'show' { Invoke-Show $IssueId }
    'ready' { Invoke-Ready }
    'count' { Invoke-Count }
    'stats' { Invoke-Stats }
    'search' { Invoke-Search $(if ($IssueId) { $IssueId } else { $Search }) }
    'help' { Show-Help }
    default { Show-Help }
}

