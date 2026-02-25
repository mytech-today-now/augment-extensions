# Generate CHANGELOG.md templates for all modules
# Task: bd-b1bf - Create CHANGELOG.md template script

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Get all module.json files
$moduleFiles = Get-ChildItem -Path "augment-extensions" -Recurse -Filter "module.json"

$totalModules = $moduleFiles.Count
$processedCount = 0
$createdCount = 0
$skippedCount = 0

Write-Host "Found $totalModules modules to process" -ForegroundColor Cyan
Write-Host ""

foreach ($moduleFile in $moduleFiles) {
    $processedCount++
    $moduleDir = $moduleFile.DirectoryName
    $relativePath = $moduleDir.Replace((Get-Location).Path + "\augment-extensions\", "")
    
    # Check if CHANGELOG.md already exists
    $changelogPath = Join-Path $moduleDir "CHANGELOG.md"
    if ((Test-Path $changelogPath) -and -not $Force) {
        if ($Verbose) {
            Write-Host "[$processedCount/$totalModules] SKIP: $relativePath (CHANGELOG.md exists)" -ForegroundColor Yellow
        }
        $skippedCount++
        continue
    }
    
    # Read module.json
    $moduleContent = Get-Content $moduleFile.FullName -Raw | ConvertFrom-Json
    
    # Extract metadata
    $version = if ($moduleContent.version) { $moduleContent.version } else { "1.0.0" }
    $displayName = if ($moduleContent.displayName) { $moduleContent.displayName } else { $moduleContent.name }
    $description = if ($moduleContent.description) { $moduleContent.description } else { "Module description" }
    
    # Get current date
    $currentDate = Get-Date -Format "yyyy-MM-dd"
    
    # Build CHANGELOG content
    $changelogContent = @"
# Changelog

All notable changes to this module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [$version] - $currentDate

### Added

- Initial release of $displayName module
- $description

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

## Guidelines

When updating this changelog:

1. **Added** for new features
2. **Changed** for changes in existing functionality
3. **Deprecated** for soon-to-be removed features
4. **Removed** for now removed features
5. **Fixed** for any bug fixes
6. **Security** in case of vulnerabilities

Each version should:
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Include the release date in YYYY-MM-DD format
- List changes in the appropriate category
- Link to relevant issues or PRs when applicable

"@
    
    if ($DryRun) {
        Write-Host "[$processedCount/$totalModules] DRY RUN: Would create $relativePath/CHANGELOG.md" -ForegroundColor Cyan
        if ($Verbose) {
            Write-Host $changelogContent -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        # Write CHANGELOG.md
        $changelogContent | Out-File -FilePath $changelogPath -Encoding UTF8
        if ($Force -and (Test-Path $changelogPath)) {
            Write-Host "[$processedCount/$totalModules] UPDATED: $relativePath/CHANGELOG.md" -ForegroundColor Magenta
        } else {
            Write-Host "[$processedCount/$totalModules] CREATED: $relativePath/CHANGELOG.md" -ForegroundColor Green
        }
        $createdCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Total modules: $totalModules" -ForegroundColor White
Write-Host "  Created: $createdCount" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files were created" -ForegroundColor Yellow
    Write-Host "Run without -DryRun to create files" -ForegroundColor Yellow
}

if (-not $Force) {
    Write-Host "Use -Force to overwrite existing CHANGELOG.md files" -ForegroundColor Cyan
}

