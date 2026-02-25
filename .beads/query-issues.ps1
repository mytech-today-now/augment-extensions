# Query issues.jsonl without Dolt
# Usage: .\.beads\query-issues.ps1 -Status open -Priority 1

param(
    [string]$Status = $null,
    [int]$Priority = $null,
    [string]$Id = $null,
    [string]$Search = $null,
    [switch]$Ready,
    [switch]$Closed,
    [switch]$Json
)

$issuesFile = Join-Path $PSScriptRoot "issues.jsonl"

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

# Convert to array
$issues = $latestIssues.Values

# Apply filters
if ($Status) {
    $issues = $issues | Where-Object { $_.status -eq $Status }
}

if ($Priority -ne $null) {
    $issues = $issues | Where-Object { $_.priority -eq $Priority }
}

if ($Id) {
    $issues = $issues | Where-Object { $_.id -like "*$Id*" }
}

if ($Search) {
    $issues = $issues | Where-Object { 
        ($_.title -like "*$Search*") -or 
        ($_.description -like "*$Search*")
    }
}

if ($Closed) {
    $issues = $issues | Where-Object { $_.status -eq 'closed' }
}

if ($Ready) {
    # Show open issues with no blockers
    $issues = $issues | Where-Object { 
        $_.status -eq 'open' -and 
        (-not $_.blocked_by -or $_.blocked_by.Count -eq 0)
    }
}

# Output
if ($Json) {
    $issues | ConvertTo-Json -Depth 10
} else {
    $issues | Select-Object id, title, priority, status, @{
        Name='blockers'
        Expression={ if ($_.blocked_by) { $_.blocked_by -join ', ' } else { '' } }
    } | Format-Table -AutoSize
}

