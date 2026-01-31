# Update remote repository URL
Write-Host "Updating remote repository URL..." -ForegroundColor Cyan
git remote set-url origin https://github.com/mytech-today-now/augment-extensions.git

# Verify remote URL
Write-Host "`nVerifying remote URL:" -ForegroundColor Cyan
git remote -v

# Check git status
Write-Host "`nChecking git status:" -ForegroundColor Cyan
git status

# Add all changes
Write-Host "`nAdding changes..." -ForegroundColor Cyan
git add VERSION CHANGELOG.md README.md package.json

# Show what will be committed
Write-Host "`nChanges to be committed:" -ForegroundColor Cyan
git status

# Commit changes
Write-Host "`nCommitting changes..." -ForegroundColor Cyan
git commit -m "Release v0.4.0: Skills System and MCP Integration

- Add VERSION file with 0.4.0
- Update CHANGELOG.md with v0.4.0 release notes
- Update README.md with Skills System and MCP Integration
- Update package.json repository URLs to augment-extensions
- Skills System: Token-efficient, on-demand skill loading (97.2% reduction)
- MCP Integration: Wrap MCP servers as CLI commands and skills
- New commands: augx skill *, augx mcp *
- Documentation: SKILL_DEVELOPMENT.md, MIGRATION_GUIDE.md"

# Create and push tag
Write-Host "`nCreating tag v0.4.0..." -ForegroundColor Cyan
git tag -a v0.4.0 -m "Release v0.4.0: Skills System and MCP Integration"

# Push to remote
Write-Host "`nPushing to origin/main..." -ForegroundColor Cyan
git push origin main

# Push tags
Write-Host "`nPushing tags..." -ForegroundColor Cyan
git push origin --tags

Write-Host "`n✅ Git operations complete!" -ForegroundColor Green

# Build the package
Write-Host "`nBuilding package..." -ForegroundColor Cyan
npm run build

# Publish to npm
Write-Host "`nReady to publish to npm!" -ForegroundColor Yellow
Write-Host "Run the following command to publish:" -ForegroundColor Yellow
Write-Host "npm publish" -ForegroundColor Cyan

