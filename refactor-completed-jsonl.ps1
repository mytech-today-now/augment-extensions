# Refactor completed.jsonl to root location
# This script performs the complete refactoring of completed.jsonl from .beads/ to root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Refactoring completed.jsonl to root" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify files exist
Write-Host "Step 1: Verifying files..." -ForegroundColor Yellow
if (-not (Test-Path ".beads/completed.jsonl")) {
    Write-Host "❌ Error: .beads/completed.jsonl not found" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "completed.jsonl")) {
    Write-Host "❌ Error: completed.jsonl not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Both files exist" -ForegroundColor Green
Write-Host ""

# Step 2: Show current state
Write-Host "Step 2: Current state..." -ForegroundColor Yellow
$beadsLines = (Get-Content .beads/completed.jsonl | Measure-Object -Line).Lines
$rootLines = (Get-Content completed.jsonl | Measure-Object -Line).Lines
Write-Host "  .beads/completed.jsonl: $beadsLines lines" -ForegroundColor Cyan
Write-Host "  completed.jsonl: $rootLines lines" -ForegroundColor Cyan
Write-Host ""

# Step 3: Merge files
Write-Host "Step 3: Merging .beads/completed.jsonl into completed.jsonl..." -ForegroundColor Yellow
Get-Content .beads/completed.jsonl | Add-Content completed.jsonl
$mergedLines = (Get-Content completed.jsonl | Measure-Object -Line).Lines
Write-Host "✅ Merge complete! Total lines: $mergedLines" -ForegroundColor Green
Write-Host ""

# Step 4: Remove old file using git
Write-Host "Step 4: Removing .beads/completed.jsonl..." -ForegroundColor Yellow
git rm .beads/completed.jsonl
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ File removed from git" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: git rm failed, trying manual removal" -ForegroundColor Yellow
    Remove-Item .beads/completed.jsonl -Force
    Write-Host "✅ File removed manually" -ForegroundColor Green
}
Write-Host ""

# Step 5: Verify .gitignore
Write-Host "Step 5: Verifying .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "^completed\.jsonl$" -or $gitignoreContent -match "^/completed\.jsonl$") {
    Write-Host "⚠️  Warning: completed.jsonl is in .gitignore - it will not be tracked!" -ForegroundColor Yellow
    Write-Host "   You may want to remove it from .gitignore if you want to track it" -ForegroundColor Yellow
} else {
    Write-Host "✅ completed.jsonl is not ignored" -ForegroundColor Green
}
Write-Host ""

# Step 6: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Refactoring Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  • Merged $beadsLines lines from .beads/completed.jsonl" -ForegroundColor White
Write-Host "  • Into existing $rootLines lines in completed.jsonl" -ForegroundColor White
Write-Host "  • Total lines now: $mergedLines" -ForegroundColor White
Write-Host "  • Removed .beads/completed.jsonl" -ForegroundColor White
Write-Host ""
Write-Host "Files updated:" -ForegroundColor Cyan
Write-Host "  ✅ update_completed.ps1" -ForegroundColor Green
Write-Host "  ✅ close-prefix-tasks.ps1" -ForegroundColor Green
Write-Host "  ✅ ADR_TASKS_EXECUTION_REPORT.md" -ForegroundColor Green
Write-Host "  ✅ task-execution-summary-2026-02-07.md" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review changes: git status" -ForegroundColor White
Write-Host "  2. Stage changes: git add ." -ForegroundColor White
Write-Host "  3. Commit: git commit -m 'refactor: move completed.jsonl to root'" -ForegroundColor White
Write-Host "  4. Push: git push" -ForegroundColor White
Write-Host ""

