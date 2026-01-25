# WordPress Plugin Scaffolding Workflow

## Overview

This document provides workflows for scaffolding WordPress plugins using WP-CLI and manual methods. It covers plugin generation, file structure creation, and initial setup for different plugin complexity levels.

---

## WP-CLI Scaffolding (Recommended)

### Prerequisites

Install WP-CLI:

```bash
# macOS/Linux
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Windows (via Composer)
composer global require wp-cli/wp-cli-bundle

# Verify installation
wp --info
```

### Basic Plugin Scaffold

```bash
# Navigate to WordPress plugins directory
cd /path/to/wordpress/wp-content/plugins

# Generate basic plugin
wp scaffold plugin my-plugin \
  --plugin_name="My Plugin" \
  --plugin_description="Brief description of my plugin" \
  --plugin_author="Your Name" \
  --plugin_author_uri="https://example.com" \
  --plugin_uri="https://example.com/my-plugin" \
  --skip-tests

# Navigate to plugin directory
cd my-plugin
```

**Generated structure:**
```
my-plugin/
├── my-plugin.php
├── readme.txt
├── .gitignore
└── package.json
```

### Plugin with Tests

```bash
wp scaffold plugin my-plugin \
  --plugin_name="My Plugin" \
  --plugin_description="Brief description" \
  --plugin_author="Your Name" \
  --activate
```

**Generated structure:**
```
my-plugin/
├── my-plugin.php
├── readme.txt
├── .gitignore
├── package.json
├── phpunit.xml.dist
├── bin/
│   └── install-wp-tests.sh
└── tests/
    ├── bootstrap.php
    └── test-sample.php
```

### Advanced Scaffold with Custom Post Type

```bash
# Generate plugin
wp scaffold plugin my-plugin

# Navigate to plugin
cd my-plugin

# Add custom post type
wp scaffold post-type book \
  --label=Books \
  --textdomain=my-plugin \
  --dashicon=book \
  --plugin=my-plugin

# Add custom taxonomy
wp scaffold taxonomy genre \
  --post_types=book \
  --label=Genres \
  --plugin=my-plugin
```

### Scaffold Plugin Block

```bash
# Generate Gutenberg block
wp scaffold block my-block \
  --title="My Block" \
  --plugin=my-plugin \
  --namespace=my-plugin

# Generate dynamic block
wp scaffold block my-dynamic-block \
  --title="My Dynamic Block" \
  --plugin=my-plugin \
  --namespace=my-plugin \
  --dynamic
```

---

## Manual Scaffolding

### Simple Plugin (Pattern 1)

For single-feature plugins:

```bash
# Create plugin directory
mkdir my-plugin
cd my-plugin

# Create main plugin file
touch my-plugin.php

# Create readme
touch readme.txt
```

**my-plugin.php:**
```php
<?php
/**
 * Plugin Name: My Plugin
 * Description: Brief description
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL-2.0+
 * Text Domain: my-plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

// Plugin code here
```

### Organized Plugin (Pattern 2)

For plugins with multiple features:

```bash
mkdir -p my-plugin/{includes,admin,public}
cd my-plugin

# Create files
touch my-plugin.php
touch readme.txt
touch includes/class-my-plugin.php
touch admin/class-my-plugin-admin.php
touch public/class-my-plugin-public.php
```

**Directory structure:**
```
my-plugin/
├── my-plugin.php
├── readme.txt
├── includes/
│   └── class-my-plugin.php
├── admin/
│   └── class-my-plugin-admin.php
└── public/
    └── class-my-plugin-public.php
```

### Object-Oriented Plugin (Pattern 3)

For complex plugins with OOP structure:

```bash
mkdir -p my-plugin/{includes,admin,public,languages}
cd my-plugin

# Create main files
touch my-plugin.php
touch uninstall.php
touch readme.txt

# Create class files
touch includes/class-my-plugin.php
touch includes/class-my-plugin-loader.php
touch includes/class-my-plugin-i18n.php
touch admin/class-my-plugin-admin.php
touch public/class-my-plugin-public.php
```

**Directory structure:**
```
my-plugin/
├── my-plugin.php
├── uninstall.php
├── readme.txt
├── includes/
│   ├── class-my-plugin.php
│   ├── class-my-plugin-loader.php
│   └── class-my-plugin-i18n.php
├── admin/
│   ├── class-my-plugin-admin.php
│   ├── css/
│   └── js/
├── public/
│   ├── class-my-plugin-public.php
│   ├── css/
│   └── js/
└── languages/
```

### Modern Plugin with Build Tools (Pattern 4)

For plugins with JavaScript/CSS build process:

```bash
# Create directory structure
mkdir -p my-plugin/{src,dist,includes,admin,public,assets/{css,js,images}}
cd my-plugin

# Initialize npm
npm init -y

# Install build tools
npm install --save-dev webpack webpack-cli @wordpress/scripts

# Create configuration files
touch webpack.config.js
touch .babelrc
touch .eslintrc.js

# Create source files
touch src/index.js
touch src/style.scss
```

**package.json scripts:**
```json
{
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start",
    "lint:js": "wp-scripts lint-js",
    "lint:css": "wp-scripts lint-style"
  }
}
```

---

## Composer Integration

### Initialize Composer

```bash
cd my-plugin

# Initialize composer
composer init

# Install dependencies
composer require --dev phpunit/phpunit
composer require --dev squizlabs/php_codesniffer
composer require --dev wp-coding-standards/wpcs

# Configure PHPCS
./vendor/bin/phpcs --config-set installed_paths vendor/wp-coding-standards/wpcs
```

**composer.json:**
```json
{
  "name": "vendor/my-plugin",
  "description": "My WordPress Plugin",
  "type": "wordpress-plugin",
  "license": "GPL-2.0+",
  "autoload": {
    "psr-4": {
      "MyPlugin\\": "includes/"
    }
  },
  "require": {
    "php": ">=7.4"
  },
  "require-dev": {
    "phpunit/phpunit": "^9.0",
    "squizlabs/php_codesniffer": "^3.7",
    "wp-coding-standards/wpcs": "^3.0"
  },
  "scripts": {
    "test": "phpunit",
    "lint": "phpcs --standard=WordPress includes/ admin/ public/",
    "lint:fix": "phpcbf --standard=WordPress includes/ admin/ public/"
  }
}
```

---

## Git Integration

### Initialize Git Repository

```bash
cd my-plugin

# Initialize git
git init

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
/vendor/
/node_modules/

# Build files
/dist/
/build/

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# WordPress
wp-config.php
.htaccess

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
EOF

# Initial commit
git add .
git commit -m "Initial commit"
```

### GitHub Repository Setup

```bash
# Create GitHub repository (using GitHub CLI)
gh repo create my-plugin --public --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

---

## Plugin Boilerplate Templates

### WordPress Plugin Boilerplate

```bash
# Clone the boilerplate
git clone https://github.com/DevinVinson/WordPress-Plugin-Boilerplate.git my-plugin

cd my-plugin

# Run the rename script (if available) or manually rename
# Replace 'plugin-name' with your plugin slug
# Replace 'Plugin_Name' with your plugin class prefix
```

### Underscores Plugin Generator

Use the online generator at [wppb.me](https://wppb.me/):

1. Enter plugin details
2. Select options (CPT, taxonomy, etc.)
3. Download generated plugin
4. Extract to plugins directory

---

## Scaffolding Checklist

### Initial Setup

- [ ] Create plugin directory with proper slug
- [ ] Create main plugin file with header
- [ ] Create readme.txt
- [ ] Initialize Git repository
- [ ] Create .gitignore
- [ ] Set up directory structure based on complexity

### Development Tools

- [ ] Initialize Composer (if using PHP dependencies)
- [ ] Initialize npm (if using JavaScript/CSS build)
- [ ] Configure PHPCS with WordPress standards
- [ ] Set up ESLint for JavaScript
- [ ] Configure build scripts

### Code Quality

- [ ] Set up PHPUnit for testing
- [ ] Configure code linting (PHPCS, ESLint)
- [ ] Add pre-commit hooks (optional)
- [ ] Set up continuous integration (optional)

### Documentation

- [ ] Create README.md for GitHub
- [ ] Create readme.txt for WordPress.org
- [ ] Add inline code documentation
- [ ] Create CHANGELOG.md

---

## Quick Start Commands

### Simple Plugin (No Build Tools)

```bash
# Create and scaffold
mkdir my-plugin && cd my-plugin
wp scaffold plugin . --plugin_name="My Plugin" --skip-tests

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Modern Plugin (With Build Tools)

```bash
# Create and scaffold
mkdir my-plugin && cd my-plugin
wp scaffold plugin . --plugin_name="My Plugin"

# Initialize npm and install tools
npm init -y
npm install --save-dev @wordpress/scripts

# Initialize composer
composer init --no-interaction
composer require --dev phpunit/phpunit wp-coding-standards/wpcs

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Block Plugin

```bash
# Create plugin directory
mkdir my-block-plugin && cd my-block-plugin

# Scaffold block plugin
npx @wordpress/create-block my-block

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

---

## Post-Scaffolding Tasks

### 1. Update Plugin Header

Edit main plugin file and update:
- Plugin Name
- Description
- Author information
- Version number
- Text Domain

### 2. Update readme.txt

Edit readme.txt and update:
- Plugin name and description
- Tags
- Requires at least / Tested up to
- Installation instructions
- FAQ section

### 3. Configure Build Tools

If using build tools:

```bash
# Install dependencies
npm install
composer install

# Run initial build
npm run build

# Start development mode
npm run start
```

### 4. Set Up Testing

```bash
# Install WordPress test suite
bin/install-wp-tests.sh wordpress_test root '' localhost latest

# Run tests
composer test
# or
npm test
```

### 5. Configure Linting

```bash
# Lint PHP
composer run lint

# Lint JavaScript
npm run lint:js

# Lint CSS
npm run lint:css

# Auto-fix issues
composer run lint:fix
npm run lint:js -- --fix
```

---

## Best Practices

### DO

✅ Use WP-CLI for consistent scaffolding
✅ Initialize version control immediately
✅ Set up build tools before writing code
✅ Configure linting and testing early
✅ Use proper text domain matching plugin slug
✅ Follow WordPress coding standards from start
✅ Create .gitignore to exclude build files

### DON'T

❌ Manually create all files (use scaffolding tools)
❌ Skip version control setup
❌ Commit build files to repository
❌ Use generic function/class names
❌ Skip testing setup
❌ Ignore coding standards
❌ Hardcode plugin paths or URLs

---

## Troubleshooting

### WP-CLI Not Found

```bash
# Verify installation
which wp

# Add to PATH (macOS/Linux)
export PATH=$PATH:/usr/local/bin

# Reinstall if needed
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
```

### Composer Autoload Not Working

```bash
# Regenerate autoload files
composer dump-autoload

# Verify autoload in main plugin file
require_once plugin_dir_path(__FILE__) . 'vendor/autoload.php';
```

### Build Tools Not Working

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Verify webpack config
npm run build -- --mode=development
```

