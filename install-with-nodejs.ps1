# Augment Extensions CLI Installer with Node.js Management
# Automatically installs/upgrades Node.js if needed

param(
    [switch]$SkipNodeCheck = $false,
    [string]$NodeVersion = "20.11.0"  # LTS version
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Augment Extensions CLI Installer" -ForegroundColor Cyan
Write-Host "with Node.js Management" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Required Node.js version (from package.json engines.node)
$RequiredNodeMajor = 16
$RecommendedNodeVersion = $NodeVersion

# Function to compare versions
function Compare-Version {
    param([string]$Version1, [string]$Version2)
    $v1 = [version]($Version1 -replace '^v', '')
    $v2 = [version]($Version2 -replace '^v', '')
    return $v1.CompareTo($v2)
}

# Function to get Node.js major version
function Get-NodeMajorVersion {
    param([string]$Version)
    $cleanVersion = $Version -replace '^v', ''
    return [int]($cleanVersion.Split('.')[0])
}

# Function to download and install Node.js
function Install-NodeJS {
    param([string]$Version)
    
    Write-Host "Installing Node.js v$Version..." -ForegroundColor Yellow
    
    # Determine architecture
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    
    # Download URL
    $downloadUrl = "https://nodejs.org/dist/v$Version/node-v$Version-x64.msi"
    $installerPath = "$env:TEMP\node-v$Version-x64.msi"
    
    Write-Host "Downloading from: $downloadUrl" -ForegroundColor Cyan
    
    try {
        # Download Node.js installer
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✓ Downloaded successfully" -ForegroundColor Green
        
        # Install Node.js
        Write-Host "Installing Node.js (this may take a few minutes)..." -ForegroundColor Yellow
        $installArgs = "/i `"$installerPath`" /quiet /norestart"
        Start-Process msiexec.exe -ArgumentList $installArgs -Wait -NoNewWindow
        
        # Clean up installer
        Remove-Item $installerPath -Force
        
        Write-Host "✓ Node.js installed successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠ Please restart your terminal/PowerShell for changes to take effect" -ForegroundColor Yellow
        Write-Host "Then run this script again to complete the installation" -ForegroundColor Yellow
        
        return $true
    } catch {
        Write-Host "✗ Failed to install Node.js: $_" -ForegroundColor Red
        return $false
    }
}

# Function to upgrade Node.js
function Upgrade-NodeJS {
    param([string]$CurrentVersion, [string]$TargetVersion)
    
    Write-Host "Upgrading Node.js from v$CurrentVersion to v$TargetVersion..." -ForegroundColor Yellow
    
    $response = Read-Host "Do you want to upgrade Node.js? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Skipping Node.js upgrade" -ForegroundColor Yellow
        return $false
    }
    
    return Install-NodeJS -Version $TargetVersion
}

# Step 1: Check Node.js installation
Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Yellow

$nodeInstalled = $false
$nodeVersion = $null
$nodeMajorVersion = 0

try {
    $nodeVersion = (node --version 2>$null) -replace '^v', ''
    if ($nodeVersion) {
        $nodeInstalled = $true
        $nodeMajorVersion = Get-NodeMajorVersion -Version $nodeVersion
        Write-Host "✓ Node.js is installed: v$nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Node.js is not installed" -ForegroundColor Red
}

if (-not $nodeInstalled) {
    Write-Host ""
    Write-Host "Node.js is required but not installed." -ForegroundColor Yellow
    Write-Host "Required: Node.js >= v$RequiredNodeMajor.0.0" -ForegroundColor Cyan
    Write-Host "Recommended: Node.js v$RecommendedNodeVersion (LTS)" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $SkipNodeCheck) {
        $install = Install-NodeJS -Version $RecommendedNodeVersion
        if ($install) {
            exit 0
        } else {
            Write-Host ""
            Write-Host "Manual installation required:" -ForegroundColor Yellow
            Write-Host "1. Download Node.js from: https://nodejs.org/" -ForegroundColor Cyan
            Write-Host "2. Install Node.js v$RecommendedNodeVersion or later" -ForegroundColor Cyan
            Write-Host "3. Restart your terminal" -ForegroundColor Cyan
            Write-Host "4. Run this script again" -ForegroundColor Cyan
            exit 1
        }
    }
} elseif ($nodeMajorVersion -lt $RequiredNodeMajor) {
    Write-Host ""
    Write-Host "⚠ Node.js version is too old!" -ForegroundColor Yellow
    Write-Host "Current: v$nodeVersion" -ForegroundColor Red
    Write-Host "Required: >= v$RequiredNodeMajor.0.0" -ForegroundColor Cyan
    Write-Host "Recommended: v$RecommendedNodeVersion (LTS)" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $SkipNodeCheck) {
        $upgrade = Upgrade-NodeJS -CurrentVersion $nodeVersion -TargetVersion $RecommendedNodeVersion
        if ($upgrade) {
            exit 0
        } else {
            Write-Host ""
            Write-Host "Please upgrade Node.js manually:" -ForegroundColor Yellow
            Write-Host "1. Download from: https://nodejs.org/" -ForegroundColor Cyan
            Write-Host "2. Install v$RecommendedNodeVersion or later" -ForegroundColor Cyan
            Write-Host "3. Restart your terminal" -ForegroundColor Cyan
            Write-Host "4. Run this script again" -ForegroundColor Cyan
            exit 1
        }
    }
} else {
    Write-Host "✓ Node.js version is compatible (>= v$RequiredNodeMajor.0.0)" -ForegroundColor Green
}

Write-Host ""

# Step 2: Check npm installation
Write-Host "Step 2: Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    Write-Host "npm should be installed with Node.js. Please reinstall Node.js." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Install dependencies
Write-Host "Step 3: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Build the CLI
Write-Host "Step 4: Building TypeScript CLI..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build CLI!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ CLI built successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Install globally
Write-Host "Step 5: Installing globally..." -ForegroundColor Yellow
Write-Host "This will create the 'augx' command globally" -ForegroundColor Cyan

# Check if already installed
$alreadyInstalled = $false
try {
    $existingVersion = npm list -g @mytechtoday/augment-extensions --depth=0 2>$null
    if ($existingVersion -match "@mytechtoday/augment-extensions") {
        $alreadyInstalled = $true
        Write-Host "⚠ Package already installed globally. Reinstalling..." -ForegroundColor Yellow
        npm uninstall -g @mytechtoday/augment-extensions 2>$null
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

# Step 6: Verify installation
Write-Host "Step 6: Verifying installation..." -ForegroundColor Yellow

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

try {
    $augxVersion = augx --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ augx version: $augxVersion" -ForegroundColor Green
    } else {
        throw "Command failed"
    }
} catch {
    Write-Host "⚠ Verification warning: 'augx' command not immediately available" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The CLI was installed but may require a terminal restart." -ForegroundColor Yellow
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Close and reopen your terminal/PowerShell" -ForegroundColor Cyan
    Write-Host "  2. Run: augx --version" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Alternative: Use 'npx augx' instead of 'augx'" -ForegroundColor Yellow
    Write-Host ""

    # Show npm global prefix
    Write-Host "npm global prefix:" -ForegroundColor Cyan
    npm config get prefix
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Node.js version: v$nodeVersion" -ForegroundColor White
Write-Host "npm version: $npmVersion" -ForegroundColor White
Write-Host "augx CLI: Installed" -ForegroundColor White
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
Write-Host "Quick Start:" -ForegroundColor Yellow
Write-Host "  1. Restart your terminal (if augx command not found)" -ForegroundColor Cyan
Write-Host "  2. Run: augx list" -ForegroundColor Cyan
Write-Host "  3. See QUICKSTART.md for more examples" -ForegroundColor Cyan
Write-Host ""

