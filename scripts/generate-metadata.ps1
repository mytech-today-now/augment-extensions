# Generate metadata.json for all modules
# Task: bd-0070 - Create metadata.json generation script

param(
    [switch]$DryRun,
    [switch]$Verbose
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
    
    # Check if metadata.json already exists
    $metadataPath = Join-Path $moduleDir "metadata.json"
    if (Test-Path $metadataPath) {
        if ($Verbose) {
            Write-Host "[$processedCount/$totalModules] SKIP: $relativePath (metadata.json exists)" -ForegroundColor Yellow
        }
        $skippedCount++
        continue
    }
    
    # Read module.json
    $moduleContent = Get-Content $moduleFile.FullName -Raw | ConvertFrom-Json
    
    # Extract metadata
    $version = if ($moduleContent.version) { $moduleContent.version } else { "1.0.0" }
    $name = $moduleContent.name
    $displayName = if ($moduleContent.displayName) { $moduleContent.displayName } else { $name }
    $description = if ($moduleContent.description) { $moduleContent.description } else { "" }
    $type = if ($moduleContent.type) { $moduleContent.type } else { "module" }
    $language = if ($moduleContent.language) { $moduleContent.language } else { $null }
    $tags = if ($moduleContent.tags) { $moduleContent.tags } else { @() }
    
    # Get character count from module.json or calculate
    $characterCount = if ($moduleContent.augment.characterCount) { 
        $moduleContent.augment.characterCount 
    } else { 
        0 
    }
    
    # Get list of rule files
    $rulesDir = Join-Path $moduleDir "rules"
    $ruleFiles = @()
    if (Test-Path $rulesDir) {
        $ruleFiles = Get-ChildItem -Path $rulesDir -Recurse -Filter "*.md" | 
            ForEach-Object { $_.FullName.Replace($rulesDir + "\", "").Replace("\", "/") }
    }
    
    # Get list of example files
    $examplesDir = Join-Path $moduleDir "examples"
    $exampleFiles = @()
    if (Test-Path $examplesDir) {
        $exampleFiles = Get-ChildItem -Path $examplesDir -Recurse -File | 
            Where-Object { $_.Extension -in @(".md", ".js", ".ts", ".json", ".yaml", ".yml") } |
            ForEach-Object { $_.FullName.Replace($examplesDir + "\", "").Replace("\", "/") }
    }
    
    # Build metadata object
    $metadata = [ordered]@{
        version = $version
        name = $name
        displayName = $displayName
        description = $description
        type = $type
    }
    
    if ($language) {
        $metadata.language = $language
    }
    
    $metadata.tags = $tags
    $metadata.compatibility = @{
        augmentMinVersion = "1.0.0"
        nodeMinVersion = "18.0.0"
    }
    
    if ($language -eq "typescript") {
        $metadata.compatibility.typescriptMinVersion = "5.0.0"
    }
    
    $metadata.characterCount = $characterCount
    $metadata.lastUpdated = (Get-Date -Format "yyyy-MM-dd")
    $metadata.files = @{
        rules = $ruleFiles
        examples = $exampleFiles
    }
    
    # Convert to JSON
    $metadataJson = $metadata | ConvertTo-Json -Depth 10
    
    if ($DryRun) {
        Write-Host "[$processedCount/$totalModules] DRY RUN: Would create $relativePath/metadata.json" -ForegroundColor Cyan
        if ($Verbose) {
            Write-Host $metadataJson -ForegroundColor Gray
        }
    } else {
        # Write metadata.json
        $metadataJson | Out-File -FilePath $metadataPath -Encoding UTF8
        Write-Host "[$processedCount/$totalModules] CREATED: $relativePath/metadata.json" -ForegroundColor Green
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

