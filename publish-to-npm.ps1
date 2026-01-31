# Publish to npm
Write-Host "Publishing to npm..." -ForegroundColor Cyan

# Check if logged in
Write-Host "`nChecking npm login status..." -ForegroundColor Cyan
npm whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Not logged in to npm. Please run 'npm login' first." -ForegroundColor Yellow
    exit 1
}

# Show package info
Write-Host "`nPackage information:" -ForegroundColor Cyan
npm pack --dry-run

# Publish
Write-Host "`nPublishing package..." -ForegroundColor Cyan
npm publish

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully published to npm!" -ForegroundColor Green
    Write-Host "`nView package at: https://www.npmjs.com/package/@mytechtoday/augment-extensions" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Failed to publish to npm" -ForegroundColor Red
    exit 1
}

