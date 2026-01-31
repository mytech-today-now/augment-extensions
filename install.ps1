# Augment Extensions CLI Installation Script
# Run this script to install the augx CLI globally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Augment Extensions CLI Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Build the CLI
Write-Host "Step 2: Building TypeScript CLI..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build CLI!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ CLI built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Install globally
Write-Host "Step 3: Installing globally..." -ForegroundColor Yellow
Write-Host "This will create the 'augx' command globally" -ForegroundColor Cyan

# Check if already installed
$alreadyInstalled = $false
try {
    $existingVersion = npm list -g @mytechtoday/augment-extensions --depth=0 2>$null
    if ($existingVersion -match "@mytechtoday/augment-extensions") {
        $alreadyInstalled = $true
        Write-Host "⚠ Package already installed globally. Reinstalling..." -ForegroundColor Yellow
        npm uninstall -g @mytechtoday/augment-extensions
    }
} catch {
    # Not installed, continue
}

npm install -g .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install globally!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running PowerShell as Administrator:" -ForegroundColor Yellow
    Write-Host "  Right-click PowerShell → 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "  Then run this script again" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Installed globally successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Verify installation
Write-Host "Step 4: Verifying installation..." -ForegroundColor Yellow
try {
    $augxVersion = augx --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ augx version: $augxVersion" -ForegroundColor Green
    } else {
        throw "Command failed"
    }
} catch {
    Write-Host "✗ Verification failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The CLI was installed but 'augx' command is not found." -ForegroundColor Yellow
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "  1. Restart your terminal" -ForegroundColor Yellow
    Write-Host "  2. Add npm global bin to PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "npm global prefix:" -ForegroundColor Cyan
    npm config get prefix
    Write-Host ""
    Write-Host "Alternative: Use 'npx augx' instead of 'augx'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  augx --version       Show version" -ForegroundColor White
Write-Host "  augx --help          Show help" -ForegroundColor White
Write-Host "  augx list            List available modules" -ForegroundColor White
Write-Host "  augx show <module>   Show module details" -ForegroundColor White
Write-Host "  augx search <term>   Search for modules" -ForegroundColor White
Write-Host "  augx init            Initialize in a project" -ForegroundColor White
Write-Host "  augx link <module>   Link a module to project" -ForegroundColor White
Write-Host ""
Write-Host "Try it now:" -ForegroundColor Yellow
Write-Host "  augx list" -ForegroundColor Green
Write-Host ""

