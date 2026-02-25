<#
.SYNOPSIS
    Sync completed tasks from completed.jsonl to issues.jsonl

.DESCRIPTION
    Reads completed.jsonl and appends closure entries to issues.jsonl for any
    tasks that are marked as completed but still show as open in issues.jsonl.

.EXAMPLE
    .\bd-sync.ps1
    Syncs all completed tasks to issues.jsonl

.EXAMPLE
    .\bd-sync.ps1 -DryRun
    Shows what would be synced without making changes
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$issuesFile = Join-Path $PSScriptRoot "issues.jsonl"
$completedFile = Join-Path $PSScriptRoot "..\completed.jsonl"

# Helper function to get latest state of each issue
function Get-LatestIssues {
    param([string]$filePath)

    if (-not (Test-Path $filePath)) {
        return @{}, @()
    }

    $issues = @{}
    $errors = @()
    $lineNum = 0

    Get-Content $filePath | ForEach-Object {
        $lineNum++
        try {
            $issue = $_ | ConvertFrom-Json
            $issues[$issue.id] = $issue
        } catch {
            $errors += "Line $lineNum : $($_.Exception.Message)"
        }
    }
    return $issues, $errors
}

# Get current state
Write-Host "`n🔍 Reading current state..." -ForegroundColor Cyan
$currentIssues, $currentErrors = Get-LatestIssues $issuesFile
$completedIssues, $completedErrors = Get-LatestIssues $completedFile

Write-Host "   Issues in issues.jsonl: $($currentIssues.Count)" -ForegroundColor Gray
Write-Host "   Issues in completed.jsonl: $($completedIssues.Count)" -ForegroundColor Gray

if ($completedErrors.Count -gt 0) {
    Write-Host "`n⚠️  Warning: $($completedErrors.Count) malformed lines in completed.jsonl (skipped)" -ForegroundColor Yellow
    if ($DryRun) {
        $completedErrors | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    }
}

# Find issues that need to be closed
$toClose = @()
foreach ($id in $completedIssues.Keys) {
    $completed = $completedIssues[$id]
    $current = $currentIssues[$id]
    
    if ($current -and $current.status -ne 'closed') {
        $toClose += [PSCustomObject]@{
            id = $id
            title = $completed.title
            current_status = $current.status
            close_reason = $completed.close_reason
            completed_at = $completed.completed_at
        }
    }
}

if ($toClose.Count -eq 0) {
    Write-Host "`n✅ All tasks are in sync!" -ForegroundColor Green
    exit 0
}

Write-Host "`n📋 Found $($toClose.Count) tasks to close:" -ForegroundColor Yellow
$toClose | Format-Table id, title, current_status -AutoSize

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN - No changes made" -ForegroundColor Cyan
    exit 0
}

# Close each task
Write-Host "`n🔄 Closing tasks..." -ForegroundColor Cyan
$count = 0
foreach ($task in $toClose) {
    $completed = $completedIssues[$task.id]
    $current = $currentIssues[$task.id]
    
    # Create closed issue with all existing fields
    $closed = $current | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $closed.status = 'closed'
    $closed.updated_at = $completed.completed_at
    
    # Add closed_at
    if ($closed.PSObject.Properties['closed_at']) {
        $closed.closed_at = $completed.completed_at
    } else {
        $closed | Add-Member -NotePropertyName closed_at -NotePropertyValue $completed.completed_at
    }
    
    # Add close_reason if provided
    if ($completed.close_reason) {
        if ($closed.PSObject.Properties['close_reason']) {
            $closed.close_reason = $completed.close_reason
        } else {
            $closed | Add-Member -NotePropertyName close_reason -NotePropertyValue $completed.close_reason
        }
    }
    
    # Append to issues.jsonl
    $json = $closed | ConvertTo-Json -Depth 10 -Compress
    Add-Content -Path $issuesFile -Value $json -Encoding UTF8
    
    $count++
    Write-Host "   ✓ Closed $($task.id): $($task.title)" -ForegroundColor Green
}

Write-Host "`n✅ Sync complete! Closed $count tasks" -ForegroundColor Green

