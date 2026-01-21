# Validate Beads Issue Prefix
# Ensures all issues in .beads/issues.jsonl use "bd-" prefix

param(
    [switch]$Verbose
)

$issuesFile = ".beads/issues.jsonl"

# Check if issues file exists
if (-not (Test-Path $issuesFile)) {
    Write-Host "✅ No issues file found (OK for new repos)" -ForegroundColor Green
    exit 0
}

# Read and parse all issues
try {
    $issues = Get-Content $issuesFile -ErrorAction Stop | ForEach-Object {
        try {
            $_ | ConvertFrom-Json
        } catch {
            Write-Warning "Failed to parse line: $_"
            $null
        }
    } | Where-Object { $_ -ne $null }
} catch {
    Write-Host "❌ Failed to read issues file: $_" -ForegroundColor Red
    exit 1
}

if ($issues.Count -eq 0) {
    Write-Host "✅ No issues found in file" -ForegroundColor Green
    exit 0
}

# Validate prefix
# Pattern allows: bd-<alphanumeric> with optional dots or hyphens for hierarchy
$invalidIssues = $issues | Where-Object {
    $_.id -and $_.id -notmatch '^bd-[a-z0-9]+([.-][a-z0-9]+)*$'
}

if ($invalidIssues) {
    Write-Host "❌ Found issues with invalid prefix:" -ForegroundColor Red
    Write-Host ""
    
    foreach ($issue in $invalidIssues) {
        Write-Host "  - $($issue.id)" -ForegroundColor Yellow
        if ($Verbose -and $issue.title) {
            Write-Host "    Title: $($issue.title)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "All issues must use 'bd-' prefix with format:" -ForegroundColor Red
    Write-Host "  - bd-<hash>        (e.g., bd-a1b2)" -ForegroundColor Gray
    Write-Host "  - bd-<name>        (e.g., bd-init, bd-rename1)" -ForegroundColor Gray
    Write-Host "  - bd-<hash>.<num>  (e.g., bd-a1b2.1)" -ForegroundColor Gray
    Write-Host "  - bd-<name>-<num>  (e.g., bd-prefix1-1)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See openspec/specs/beads/naming-convention.md for details" -ForegroundColor Gray
    
    exit 1
}

# Success
Write-Host "✅ All $($issues.Count) issues use correct 'bd-' prefix" -ForegroundColor Green

if ($Verbose) {
    Write-Host ""
    Write-Host "Validated issues:" -ForegroundColor Gray
    $issues | ForEach-Object {
        $status = if ($_.status -eq "closed") { "✓" } else { "○" }
        Write-Host "  $status $($_.id) - $($_.title)" -ForegroundColor Gray
    }
}

exit 0

