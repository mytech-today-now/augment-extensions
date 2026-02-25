# Run all versioning scripts on all modules
# Task: bd-2242 - Run versioning scripts on all modules

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$SkipMetadata,
    [switch]$SkipChangelog
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Module Versioning Script Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptsDir = $PSScriptRoot
if (-not $scriptsDir) {
    $scriptsDir = "scripts"
}

# Step 1: Generate metadata.json files
if (-not $SkipMetadata) {
    Write-Host "Step 1: Generating metadata.json files..." -ForegroundColor Yellow
    Write-Host "===========================================" -ForegroundColor Yellow
    Write-Host ""
    
    $metadataScript = Join-Path $scriptsDir "generate-metadata.ps1"
    if (-not (Test-Path $metadataScript)) {
        Write-Host "ERROR: generate-metadata.ps1 not found at $metadataScript" -ForegroundColor Red
        exit 1
    }
    
    $metadataArgs = @()
    if ($DryRun) { $metadataArgs += "-DryRun" }
    if ($Verbose) { $metadataArgs += "-Verbose" }
    
    & $metadataScript @metadataArgs
    
    Write-Host ""
    Write-Host "Step 1 Complete!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Step 1: Skipping metadata.json generation (-SkipMetadata)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Generate CHANGELOG.md files
if (-not $SkipChangelog) {
    Write-Host "Step 2: Generating CHANGELOG.md files..." -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host ""
    
    $changelogScript = Join-Path $scriptsDir "generate-changelog.ps1"
    if (-not (Test-Path $changelogScript)) {
        Write-Host "ERROR: generate-changelog.ps1 not found at $changelogScript" -ForegroundColor Red
        exit 1
    }
    
    $changelogArgs = @()
    if ($DryRun) { $changelogArgs += "-DryRun" }
    if ($Verbose) { $changelogArgs += "-Verbose" }
    
    & $changelogScript @changelogArgs
    
    Write-Host ""
    Write-Host "Step 2 Complete!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Step 2: Skipping CHANGELOG.md generation (-SkipChangelog)" -ForegroundColor Yellow
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Versioning Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files were created" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to create files" -ForegroundColor Yellow
} else {
    Write-Host "All versioning files have been generated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review generated files" -ForegroundColor White
    Write-Host "  2. Update character counts in metadata.json files" -ForegroundColor White
    Write-Host "  3. Customize CHANGELOG.md entries as needed" -ForegroundColor White
    Write-Host "  4. Commit changes to git" -ForegroundColor White
}

Write-Host ""

