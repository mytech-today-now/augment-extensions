<#
.SYNOPSIS
    Write operations for Beads issues.jsonl - create, update, close, comment, etc.

.DESCRIPTION
    A PowerShell-based write tool for Beads JSONL files that handles all write operations.
    Appends to issues.jsonl following the append-only JSONL format.

.EXAMPLE
    .\.beads\bd-write.ps1 create "Fix bug in parser" -Priority 1 -Description "Parser fails on edge case"
    .\.beads\bd-write.ps1 update bd-123 -Status in_progress
    .\.beads\bd-write.ps1 close bd-123 -Reason "Fixed in commit abc123"
    .\.beads\bd-write.ps1 comment bd-123 "Working on this now"
    .\.beads\bd-write.ps1 assign bd-123 -Assignee "kyle@mytech.today"
    .\.beads\bd-write.ps1 link bd-123 -Blocks bd-456

.NOTES
    Author: Augment Extensions
    Version: 1.0.0
#>

param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet('create', 'update', 'close', 'comment', 'assign', 'link', 'reopen', 'help')]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$IssueIdOrTitle = $null,
    
    [Parameter(Position=2)]
    [string]$Value = $null,
    
    [string]$Description = "",
    [ValidateSet('open', 'in_progress', 'blocked', 'deferred', 'closed')]
    [string]$Status = $null,
    [ValidateRange(0, 4)]
    [int]$Priority = -1,
    [ValidateSet('task', 'bug', 'feature', 'epic', 'story')]
    [string]$IssueType = $null,
    [string]$Owner = $null,
    [string]$Assignee = $null,
    [string[]]$Labels = @(),
    [string]$Reason = "",
    [string]$Blocks = $null,
    [string]$BlockedBy = $null,
    [switch]$Json
)

$ErrorActionPreference = 'Stop'
$issuesFile = Join-Path $PSScriptRoot "issues.jsonl"

# Helper function to generate short hash-based ID
function New-IssueId {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $random = Get-Random -Maximum 9999
    $combined = "$timestamp-$random"

    # Create MD5 hash from string
    $md5 = [System.Security.Cryptography.MD5]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($combined)
    $hashBytes = $md5.ComputeHash($bytes)
    $hash = [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()

    return "bd-" + $hash.Substring(0, 4)
}

# Helper function to get current timestamp in ISO 8601 format
function Get-Timestamp {
    return [DateTimeOffset]::Now.ToString("yyyy-MM-ddTHH:mm:ss.fffffffzzz")
}

# Helper function to get latest issue state
function Get-LatestIssue {
    param([string]$id)
    
    if (-not (Test-Path $issuesFile)) {
        return $null
    }
    
    $allIssues = Get-Content $issuesFile | ForEach-Object { 
        try { $_ | ConvertFrom-Json } catch { }
    }
    
    $latestIssues = @{}
    foreach ($issue in $allIssues) {
        if ($issue.id) {
            $latestIssues[$issue.id] = $issue
        }
    }
    
    return $latestIssues[$id]
}

# Helper function to append to JSONL
function Add-JsonlEntry {
    param([PSCustomObject]$entry)
    
    $json = $entry | ConvertTo-Json -Compress -Depth 10
    Add-Content -Path $issuesFile -Value $json -Encoding UTF8
}

# Helper function to show help
function Show-Help {
    Write-Host @"
bd-write - Write operations for Beads issues

USAGE:
    bd-write.ps1 <command> [arguments] [options]

COMMANDS:
    create <title>              Create a new issue
    update <issue-id>           Update an existing issue
    close <issue-id>            Close an issue
    reopen <issue-id>           Reopen a closed issue
    comment <issue-id> <text>   Add a comment to an issue
    assign <issue-id>           Assign an issue to someone
    link <issue-id>             Add dependency/blocker relationship
    help                        Show this help message

CREATE OPTIONS:
    -Description <text>         Issue description
    -Priority <0-4>             Priority (0=highest, 4=lowest, default: 2)
    -IssueType <type>           Type: task, bug, feature, epic, story (default: task)
    -Owner <email>              Owner email (default: current user)
    -Labels <label1,label2>     Comma-separated labels
    -Status <status>            Initial status (default: open)

UPDATE OPTIONS:
    -Status <status>            New status (open, in_progress, blocked, deferred, closed)
    -Priority <0-4>             New priority
    -Assignee <email>           New assignee

CLOSE OPTIONS:
    -Reason <text>              Reason for closing

ASSIGN OPTIONS:
    -Assignee <email>           Email of assignee

LINK OPTIONS:
    -Blocks <issue-id>          This issue blocks another issue
    -BlockedBy <issue-id>       This issue is blocked by another issue

EXAMPLES:
    # Create a new task
    bd-write.ps1 create "Implement feature X" -Priority 1 -Description "Add new feature"
    
    # Update issue status
    bd-write.ps1 update bd-abc123 -Status in_progress
    
    # Close an issue
    bd-write.ps1 close bd-abc123 -Reason "Completed in PR #42"

    # Add a comment
    bd-write.ps1 comment bd-abc123 "Working on this now"

    # Assign an issue
    bd-write.ps1 assign bd-abc123 -Assignee "kyle@mytech.today"

    # Add dependency
    bd-write.ps1 link bd-abc123 -Blocks bd-def456
"@
}

# Command: create
function Invoke-Create {
    param([string]$title)

    if (-not $title) {
        Write-Error "Title required. Usage: bd-write.ps1 create <title> [options]"
        exit 1
    }

    $id = New-IssueId
    $timestamp = Get-Timestamp

    # Use defaults if not provided
    $issueStatus = if ($Status) { $Status } else { 'open' }
    $issuePriority = if ($Priority -ge 0) { $Priority } else { 2 }
    $issueType = if ($IssueType) { $IssueType } else { 'task' }
    $issueOwner = if ($Owner) { $Owner } else { $env:USERNAME + "@mytech.today" }

    $issue = [PSCustomObject]@{
        id = $id
        title = $title
        description = $Description
        status = $issueStatus
        priority = $issuePriority
        issue_type = $issueType
        owner = $issueOwner
        created_at = $timestamp
        created_by = $env:USERNAME
        updated_at = $timestamp
    }

    # Add optional fields
    if ($Labels.Count -gt 0) {
        $issue | Add-Member -NotePropertyName labels -NotePropertyValue $Labels
    }

    if ($Assignee) {
        $issue | Add-Member -NotePropertyName assignee -NotePropertyValue $Assignee
    }

    Add-JsonlEntry $issue

    if ($Json) {
        $issue | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Created issue: $id" -ForegroundColor Green
        Write-Host "   Title: $title" -ForegroundColor Gray
        Write-Host "   Priority: $Priority" -ForegroundColor Gray
        Write-Host "   Status: $Status" -ForegroundColor Gray
    }
}

# Command: update
function Invoke-Update {
    param([string]$id)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-write.ps1 update <issue-id> [options]"
        exit 1
    }

    $existing = Get-LatestIssue $id
    if (-not $existing) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    # Create updated issue with all existing fields
    $updated = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $updated.updated_at = Get-Timestamp

    # Update specified fields
    if ($Status) {
        $updated.status = $Status
    }
    if ($Priority -ge 0) {
        $updated.priority = $Priority
    }
    if ($Assignee) {
        if ($updated.PSObject.Properties['assignee']) {
            $updated.assignee = $Assignee
        } else {
            $updated | Add-Member -NotePropertyName assignee -NotePropertyValue $Assignee
        }
    }

    Add-JsonlEntry $updated

    if ($Json) {
        $updated | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Updated issue: $id" -ForegroundColor Green
        Write-Host "   Status: $($updated.status)" -ForegroundColor Gray
        Write-Host "   Priority: $($updated.priority)" -ForegroundColor Gray
    }
}

# Command: close
function Invoke-Close {
    param([string]$id)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-write.ps1 close <issue-id> [-Reason <text>]"
        exit 1
    }

    $existing = Get-LatestIssue $id
    if (-not $existing) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    # Create closed issue
    $closed = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $timestamp = Get-Timestamp
    $closed.status = 'closed'
    $closed.updated_at = $timestamp

    # Add closed_at if it doesn't exist
    if ($closed.PSObject.Properties['closed_at']) {
        $closed.closed_at = $timestamp
    } else {
        $closed | Add-Member -NotePropertyName closed_at -NotePropertyValue $timestamp
    }

    # Add close_reason if provided
    if ($Reason) {
        if ($closed.PSObject.Properties['close_reason']) {
            $closed.close_reason = $Reason
        } else {
            $closed | Add-Member -NotePropertyName close_reason -NotePropertyValue $Reason
        }
    }

    Add-JsonlEntry $closed

    if ($Json) {
        $closed | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Closed issue: $id" -ForegroundColor Green
        if ($Reason) {
            Write-Host "   Reason: $Reason" -ForegroundColor Gray
        }
    }
}

# Command: reopen
function Invoke-Reopen {
    param([string]$id)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-write.ps1 reopen <issue-id>"
        exit 1
    }

    $existing = Get-LatestIssue $id
    if (-not $existing) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    if ($existing.status -ne 'closed') {
        Write-Warning "Issue $id is not closed (current status: $($existing.status))"
    }

    # Create reopened issue
    $reopened = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $reopened.status = 'open'
    $reopened.updated_at = Get-Timestamp

    # Remove closed_at and close_reason if they exist
    if ($reopened.PSObject.Properties['closed_at']) {
        $reopened.PSObject.Properties.Remove('closed_at')
    }
    if ($reopened.PSObject.Properties['close_reason']) {
        $reopened.PSObject.Properties.Remove('close_reason')
    }

    Add-JsonlEntry $reopened

    if ($Json) {
        $reopened | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Reopened issue: $id" -ForegroundColor Green
    }
}

# Command: comment
function Invoke-Comment {
    param([string]$id, [string]$text)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-write.ps1 comment <issue-id> <text>"
        exit 1
    }

    if (-not $text) {
        Write-Error "Comment text required. Usage: bd-write.ps1 comment <issue-id> <text>"
        exit 1
    }

    $existing = Get-LatestIssue $id
    if (-not $existing) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    # Create updated issue with new comment
    $updated = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $updated.updated_at = Get-Timestamp

    # Initialize comments array if it doesn't exist
    if (-not $updated.PSObject.Properties['comments']) {
        $updated | Add-Member -NotePropertyName comments -NotePropertyValue @()
    }

    # Generate comment ID
    $commentId = if ($updated.comments.Count -gt 0) {
        ($updated.comments | Measure-Object -Property id -Maximum).Maximum + 1
    } else {
        1
    }

    # Create new comment
    $comment = [PSCustomObject]@{
        id = $commentId
        issue_id = $id
        author = $env:USERNAME
        text = $text
        created_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss\Z")
    }

    # Add comment to array
    $updated.comments = @($updated.comments) + @($comment)

    Add-JsonlEntry $updated

    if ($Json) {
        $comment | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Added comment to issue: $id" -ForegroundColor Green
        Write-Host "   Comment #$commentId by $env:USERNAME" -ForegroundColor Gray
    }
}

# Command: assign
function Invoke-Assign {
    param([string]$id)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-write.ps1 assign <issue-id> -Assignee <email>"
        exit 1
    }

    if (-not $Assignee) {
        Write-Error "Assignee required. Usage: bd-write.ps1 assign <issue-id> -Assignee <email>"
        exit 1
    }

    $existing = Get-LatestIssue $id
    if (-not $existing) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    # Create updated issue with assignee
    $updated = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $updated.updated_at = Get-Timestamp

    if ($updated.PSObject.Properties['assignee']) {
        $updated.assignee = $Assignee
    } else {
        $updated | Add-Member -NotePropertyName assignee -NotePropertyValue $Assignee
    }

    Add-JsonlEntry $updated

    if ($Json) {
        $updated | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Assigned issue: $id" -ForegroundColor Green
        Write-Host "   Assignee: $Assignee" -ForegroundColor Gray
    }
}

# Command: link
function Invoke-Link {
    param([string]$id)

    if (-not $id) {
        Write-Error "Issue ID required. Usage: bd-write.ps1 link <issue-id> [-Blocks <id> | -BlockedBy <id>]"
        exit 1
    }

    if (-not $Blocks -and -not $BlockedBy) {
        Write-Error "Either -Blocks or -BlockedBy required. Usage: bd-write.ps1 link <issue-id> [-Blocks <id> | -BlockedBy <id>]"
        exit 1
    }

    $existing = Get-LatestIssue $id
    if (-not $existing) {
        Write-Error "Issue not found: $id"
        exit 1
    }

    # Verify target issue exists
    $targetId = if ($Blocks) { $Blocks } else { $BlockedBy }
    $targetIssue = Get-LatestIssue $targetId
    if (-not $targetIssue) {
        Write-Error "Target issue not found: $targetId"
        exit 1
    }

    # Create updated issue with dependency
    $updated = $existing | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $updated.updated_at = Get-Timestamp

    # Initialize dependencies array if it doesn't exist
    if (-not $updated.PSObject.Properties['dependencies']) {
        $updated | Add-Member -NotePropertyName dependencies -NotePropertyValue @()
    }

    # Create dependency object
    $dependency = [PSCustomObject]@{
        issue_id = $id
        type = if ($Blocks) { "blocks" } else { "blocked_by" }
        created_at = Get-Timestamp
        created_by = $env:USERNAME
    }

    if ($Blocks) {
        $dependency | Add-Member -NotePropertyName depends_on_id -NotePropertyValue $Blocks
    } else {
        $dependency | Add-Member -NotePropertyName depends_on_id -NotePropertyValue $BlockedBy
    }

    # Check if dependency already exists
    $existingDep = $updated.dependencies | Where-Object {
        $_.depends_on_id -eq $targetId -and $_.type -eq $dependency.type
    }

    if ($existingDep) {
        Write-Warning "Dependency already exists: $id $($dependency.type) $targetId"
        return
    }

    # Add dependency to array
    $updated.dependencies = @($updated.dependencies) + @($dependency)

    Add-JsonlEntry $updated

    if ($Json) {
        $dependency | ConvertTo-Json -Depth 10
    } else {
        Write-Host "`n✅ Added dependency to issue: $id" -ForegroundColor Green
        if ($Blocks) {
            Write-Host "   $id blocks $Blocks" -ForegroundColor Gray
        } else {
            Write-Host "   $id is blocked by $BlockedBy" -ForegroundColor Gray
        }
    }
}

# Main execution
switch ($Command) {
    'create' { Invoke-Create $IssueIdOrTitle }
    'update' { Invoke-Update $IssueIdOrTitle }
    'close' { Invoke-Close $IssueIdOrTitle }
    'reopen' { Invoke-Reopen $IssueIdOrTitle }
    'comment' { Invoke-Comment $IssueIdOrTitle $Value }
    'assign' { Invoke-Assign $IssueIdOrTitle }
    'link' { Invoke-Link $IssueIdOrTitle }
    'help' { Show-Help }
    default { Show-Help }
}

