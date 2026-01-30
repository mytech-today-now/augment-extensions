# Setup script for benchmark suite (PowerShell)

Write-Host "Setting up benchmark suite..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path "benchmarks/baseline" | Out-Null
New-Item -ItemType Directory -Force -Path "benchmarks/skills" | Out-Null
New-Item -ItemType Directory -Force -Path "benchmarks/scenarios" | Out-Null

# Prepare baseline files
Write-Host "Preparing baseline files..." -ForegroundColor Cyan

# MCP module
if (Test-Path "augment-extensions/domain-rules/mcp") {
    Get-Content augment-extensions/domain-rules/mcp/README.md, augment-extensions/domain-rules/mcp/rules/*.md | 
        Set-Content benchmarks/baseline/mcp-module.txt
    Write-Host "  ✓ MCP module baseline created" -ForegroundColor Green
} else {
    Write-Host "  ⚠ MCP module not found, skipping" -ForegroundColor Yellow
}

# Beads module
if (Test-Path "augment-extensions/workflows/beads") {
    Get-Content augment-extensions/workflows/beads/README.md, augment-extensions/workflows/beads/rules/*.md | 
        Set-Content benchmarks/baseline/beads-module.txt
    Write-Host "  ✓ Beads module baseline created" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Beads module not found, skipping" -ForegroundColor Yellow
}

# TypeScript module (if exists)
if (Test-Path "augment-extensions/coding-standards/typescript") {
    Get-Content augment-extensions/coding-standards/typescript/README.md, augment-extensions/coding-standards/typescript/rules/*.md | 
        Set-Content benchmarks/baseline/typescript-module.txt
    Write-Host "  ✓ TypeScript module baseline created" -ForegroundColor Green
} else {
    Write-Host "  ⚠ TypeScript module not found, creating placeholder" -ForegroundColor Yellow
    "# TypeScript Module Placeholder" | Set-Content benchmarks/baseline/typescript-module.txt
}

# Prepare skill files
Write-Host "Preparing skill files..." -ForegroundColor Cyan

# SDK query skill
if (Test-Path "openspec/changes/skill-based-refactor/examples/sdk-query-skill.md") {
    Copy-Item "openspec/changes/skill-based-refactor/examples/sdk-query-skill.md" `
              "benchmarks/skills/sdk-query.txt"
    Write-Host "  ✓ SDK query skill created" -ForegroundColor Green
} else {
    Write-Host "  ⚠ SDK query skill not found, creating placeholder" -ForegroundColor Yellow
    "# SDK Query Skill Placeholder" | Set-Content benchmarks/skills/sdk-query.txt
}

# Context retrieval skill
if (Test-Path "openspec/changes/skill-based-refactor/examples/context-retrieval-skill.md") {
    Copy-Item "openspec/changes/skill-based-refactor/examples/context-retrieval-skill.md" `
              "benchmarks/skills/context-retrieval.txt"
    Write-Host "  ✓ Context retrieval skill created" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Context retrieval skill not found, creating placeholder" -ForegroundColor Yellow
    "# Context Retrieval Skill Placeholder" | Set-Content benchmarks/skills/context-retrieval.txt
}

# Create placeholder skills for other scenarios
Write-Host "  Creating placeholder skills..." -ForegroundColor Cyan
"# Beads Task Create Skill Placeholder" | Set-Content benchmarks/skills/beads-task-create.txt
"# TypeScript Naming Skill Placeholder" | Set-Content benchmarks/skills/typescript-naming.txt
"# TypeScript Types Skill Placeholder" | Set-Content benchmarks/skills/typescript-types.txt

Write-Host ""
Write-Host "✓ Benchmark suite setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Install tiktoken: pip install tiktoken"
Write-Host "  2. Run benchmarks: python benchmarks/run-benchmarks.py"

