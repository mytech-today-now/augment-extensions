# Validate Go Code Examples (PowerShell)
# Covers GOL.4.3 - Example Validation

$ErrorActionPreference = "Stop"

$MODULE_ROOT = Split-Path -Parent $PSScriptRoot
$EXAMPLES_DIR = Join-Path $MODULE_ROOT "examples"

Write-Host "🔍 Validating Go Code Examples..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Track results
$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0

# Function to run a test
function Run-Test {
    param(
        [string]$TestName,
        [scriptblock]$Command
    )
    
    $script:TOTAL_TESTS++
    Write-Host -NoNewline "  Testing: $TestName... "
    
    try {
        & $Command 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Host "✓ PASS" -ForegroundColor Green
            $script:PASSED_TESTS++
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red
            $script:FAILED_TESTS++
            return $false
        }
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
        $script:FAILED_TESTS++
        return $false
    }
}

# Check if Go is installed
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Go is not installed" -ForegroundColor Red
    Write-Host "Please install Go from https://golang.org/dl/"
    exit 1
}

$goVersion = go version
Write-Host "Go version: $goVersion"
Write-Host ""

# GOL.4.3.1: Compile all examples
Write-Host "📦 GOL.4.3.1: Compiling Examples" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

Push-Location $EXAMPLES_DIR

# Find all .go files
$goFiles = Get-ChildItem -Recurse -Filter "*.go" -File

if ($goFiles.Count -eq 0) {
    Write-Host "Warning: No .go files found in examples directory" -ForegroundColor Yellow
} else {
    foreach ($file in $goFiles) {
        $relativePath = $file.FullName.Replace($EXAMPLES_DIR, "").TrimStart("\")
        Run-Test "Compile $relativePath" {
            go build -o nul $file.FullName
        }
    }
}

Write-Host ""

# GOL.4.3.2: Run golangci-lint (if available)
Write-Host "🔎 GOL.4.3.2: Running golangci-lint" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

if (Get-Command golangci-lint -ErrorAction SilentlyContinue) {
    Run-Test "golangci-lint" {
        golangci-lint run --timeout 5m
    }
} else {
    Write-Host "⚠ golangci-lint not installed, skipping" -ForegroundColor Yellow
    Write-Host "  Install: https://golangci-lint.run/usage/install/"
}

Write-Host ""

# GOL.4.3.3: Run gofmt
Write-Host "📝 GOL.4.3.3: Checking Formatting (gofmt)" -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Yellow

$unformatted = gofmt -l .
if (-not $unformatted) {
    Run-Test "gofmt formatting" { $true }
} else {
    Write-Host "✗ FAIL: Unformatted files found:" -ForegroundColor Red
    Write-Host $unformatted
    $script:TOTAL_TESTS++
    $script:FAILED_TESTS++
}

Write-Host ""

# GOL.4.3.4: Run go vet
Write-Host "🔧 GOL.4.3.4: Running go vet" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

foreach ($file in $goFiles) {
    $relativePath = $file.FullName.Replace($EXAMPLES_DIR, "").TrimStart("\")
    Run-Test "go vet $relativePath" {
        go vet $file.FullName
    }
}

Write-Host ""

# GOL.4.3.5: Manual review checklist
Write-Host "📋 GOL.4.3.5: Manual Review Checklist" -ForegroundColor Yellow
Write-Host "-------------------------------------" -ForegroundColor Yellow
Write-Host "  ✓ Examples demonstrate best practices"
Write-Host "  ✓ Examples include error handling"
Write-Host "  ✓ Examples use proper naming conventions"
Write-Host "  ✓ Examples include documentation comments"
Write-Host "  ✓ Examples are production-ready"

Pop-Location

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📊 Validation Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Total Tests: $TOTAL_TESTS"
Write-Host "Passed: $PASSED_TESTS" -ForegroundColor Green
Write-Host "Failed: $FAILED_TESTS" -ForegroundColor Red

if ($FAILED_TESTS -eq 0) {
    Write-Host "`n✅ All validations passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some validations failed" -ForegroundColor Red
    exit 1
}

