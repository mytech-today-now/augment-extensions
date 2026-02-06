# Release script for version 1.3.0
Write-Host "Starting release process for v1.3.0..." -ForegroundColor Green

# Stage all changes
Write-Host "`nStaging all changes..." -ForegroundColor Yellow
git add -A

# Check status
Write-Host "`nGit status:" -ForegroundColor Yellow
git status --short

# Commit changes
Write-Host "`nCommitting changes..." -ForegroundColor Yellow
git commit -m "Release v1.3.0: Add ADR Support and Visual Design modules

- Add ADR Support Module with complete lifecycle management
- Add Visual Design Module for multi-domain visual design
- Update package version from 1.2.2 to 1.3.0
- Update CHANGELOG.md with release notes
- Build TypeScript CLI"

# Create git tag
Write-Host "`nCreating git tag v1.3.0..." -ForegroundColor Yellow
git tag -a v1.3.0 -m "Release v1.3.0: Add ADR Support and Visual Design modules"

# Push to origin/main
Write-Host "`nPushing to origin/main..." -ForegroundColor Yellow
git push origin main

# Push tags
Write-Host "`nPushing tags..." -ForegroundColor Yellow
git push origin --tags

# Verify
Write-Host "`nVerifying git status..." -ForegroundColor Yellow
git status

Write-Host "`nRelease process complete!" -ForegroundColor Green
Write-Host "Ready to publish to npm with: npm publish" -ForegroundColor Cyan

