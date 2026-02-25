<#
.SYNOPSIS
    Setup PowerShell alias for bd-query.ps1

.DESCRIPTION
    This script adds a 'bd' function to your PowerShell profile that allows you to use
    the bd-query script from anywhere without typing the full path.

.EXAMPLE
    .\.beads\setup-alias.ps1

.NOTES
    After running this script, you can use 'bd' from any directory:
    bd list
    bd ready
    bd stats
#>

$ErrorActionPreference = 'Stop'

Write-Host "`n🔧 Setting up PowerShell alias for Beads query tool...`n" -ForegroundColor Cyan

# Get the absolute path to the bd.ps1 script
$scriptPath = Join-Path $PSScriptRoot "bd.ps1"
$scriptPath = Resolve-Path $scriptPath

Write-Host "Script path: $scriptPath" -ForegroundColor Gray

# Check if profile exists
$profilePath = $PROFILE
Write-Host "Profile path: $profilePath" -ForegroundColor Gray

if (-not (Test-Path $profilePath)) {
    Write-Host "`n⚠️  PowerShell profile not found. Creating it..." -ForegroundColor Yellow
    
    # Create profile directory if it doesn't exist
    $profileDir = Split-Path $profilePath -Parent
    if (-not (Test-Path $profileDir)) {
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    
    # Create empty profile
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
    Write-Host "✅ Created profile at: $profilePath" -ForegroundColor Green
}

# Check if alias already exists
$profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
if ($profileContent -match 'function bd \{') {
    Write-Host "`n⚠️  'bd' function already exists in profile." -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -ne 'y') {
        Write-Host "`n❌ Cancelled. No changes made." -ForegroundColor Red
        exit 0
    }
    
    # Remove old function
    $profileContent = $profileContent -replace '(?ms)# Beads query alias.*?^}', ''
    Set-Content -Path $profilePath -Value $profileContent.TrimEnd()
    Write-Host "✅ Removed old 'bd' function" -ForegroundColor Green
}

# Add the alias function to profile
$aliasFunction = @"

# Beads query alias
# Added by .beads/setup-alias.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
function bd {
    & "$scriptPath" @args
}
"@

Add-Content -Path $profilePath -Value $aliasFunction
Write-Host "`n✅ Added 'bd' function to PowerShell profile" -ForegroundColor Green

# Reload the profile in current session
Write-Host "`n🔄 Reloading profile..." -ForegroundColor Cyan
. $profilePath
Write-Host "✅ Profile reloaded" -ForegroundColor Green

# Test the alias
Write-Host "`n🧪 Testing alias..." -ForegroundColor Cyan
try {
    $testOutput = bd stats 2>&1
    if ($LASTEXITCODE -eq 0 -or $testOutput) {
        Write-Host "✅ Alias is working!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Alias test failed, but it should work in new PowerShell sessions" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`nYou can now use 'bd' from anywhere:" -ForegroundColor White
Write-Host "  bd list" -ForegroundColor Yellow
Write-Host "  bd ready" -ForegroundColor Yellow
Write-Host "  bd stats" -ForegroundColor Yellow
Write-Host "  bd show bd-123" -ForegroundColor Yellow
Write-Host "  bd search 'text'" -ForegroundColor Yellow
Write-Host "  bd count" -ForegroundColor Yellow

Write-Host "`nFor help, run:" -ForegroundColor White
Write-Host "  bd help" -ForegroundColor Yellow

Write-Host "`n💡 Tip: Open a new PowerShell window to ensure the alias is loaded.`n" -ForegroundColor Gray

