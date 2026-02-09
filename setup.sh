#!/bin/bash
set -e

echo "=== Augment Extensions Development Environment Setup ==="

# Update system packages
echo "Updating system packages..."
sudo apt-get update -qq

# Install Node.js 18 (LTS) if not present or version is too old
echo "Checking Node.js version..."
if ! command -v node &> /dev/null || ! node -e "const v=process.version.match(/^v(\d+)/)[1]; if(v<16){process.exit(1);}" 2>/dev/null; then
    echo "Installing Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verify Node.js version
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Build the CLI
echo "Building TypeScript CLI..."
npm run build

# Verify build output exists
if [ ! -f "cli/dist/index.js" ]; then
    echo "Error: Build output not found at cli/dist/index.js"
    exit 1
fi

echo "=== Setup completed successfully ==="
echo "CLI built at: cli/dist/"
echo "Ready to run tests with: npm test"