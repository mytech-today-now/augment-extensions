# WordPress Plugin Structure

## Overview

This rule defines how to detect WordPress plugin projects and the standard directory structures for different plugin complexity levels.

## Plugin Detection

### Detection Criteria

AI agents should detect a WordPress plugin project when ANY of the following conditions are met:

#### 1. Plugin Header Detection

Look for PHP files containing a plugin header comment block with required headers:

```php
<?php
/**
 * Plugin Name: My Plugin Name
 * Plugin URI: https://example.com/my-plugin
 * Description: Brief description of the plugin
 * Version: 1.0.0
 * Author: Author Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: my-plugin
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */
```

**Required Headers**:
- `Plugin Name` - Display name of the plugin
- `Description` - Brief description
- `Version` - Semantic version number
- `Author` - Plugin author name

**Recommended Headers**:
- `Plugin URI` - Plugin homepage
- `Author URI` - Author website
- `License` - License identifier (GPL-2.0+, MIT, etc.)
- `Text Domain` - Translation text domain (should match plugin slug)
- `Domain Path` - Path to translation files (usually `/languages`)
- `Requires at least` - Minimum WordPress version
- `Requires PHP` - Minimum PHP version

#### 2. File Pattern Detection

- Main plugin file (typically matches directory name: `my-plugin/my-plugin.php`)
- `readme.txt` - WordPress.org format readme
- `uninstall.php` - Cleanup script for plugin uninstallation
- `languages/` directory - Translation files (`.pot`, `.po`, `.mo`)

#### 3. Directory Structure Detection

Common plugin directory patterns:
- `includes/` or `inc/` - Core functionality
- `admin/` - Admin-specific code
- `public/` - Frontend-specific code
- `assets/` - CSS, JS, images
- `blocks/` - Gutenberg blocks
- `templates/` - Template files

## Standard Directory Structures

### 1. Simple Procedural Plugin

**Complexity**: Low  
**File Count**: 1-5 files  
**Use Case**: Small utility plugins, simple functionality, quick prototypes

```
my-plugin/
├── my-plugin.php          # Main plugin file (all code)
└── readme.txt             # WordPress.org readme
```

**When to Use**:
- Single feature plugins (e.g., disable comments, add custom CSS)
- Utility functions
- Quick prototypes
- Learning/tutorial plugins

### 2. Organized Procedural Plugin

**Complexity**: Medium  
**File Count**: 5-20 files  
**Use Case**: Medium-sized plugins, organized code, team collaboration

```
my-plugin/
├── my-plugin.php          # Main plugin file (loader)
├── includes/
│   ├── functions.php      # Core functions
│   ├── hooks.php          # Hook callbacks
│   └── shortcodes.php     # Shortcode handlers
├── admin/
│   ├── settings.php       # Admin settings
│   └── meta-boxes.php     # Meta boxes
├── public/
│   └── display.php        # Frontend display
├── assets/
│   ├── css/
│   │   ├── admin.css
│   │   └── public.css
│   ├── js/
│   │   ├── admin.js
│   │   └── public.js
│   └── images/
├── languages/
│   └── my-plugin.pot      # Translation template
├── uninstall.php          # Cleanup on uninstall
└── readme.txt
```

**When to Use**:
- Multiple features
- Admin and frontend functionality
- Custom assets (CSS/JS)
- Team collaboration

### 3. Object-Oriented Plugin

**Complexity**: Medium-High  
**File Count**: 10-50 files  
**Use Case**: Large plugins, maintainable code, extensibility

```
my-plugin/
├── my-plugin.php          # Main plugin file (bootstrap)
├── includes/
│   ├── class-plugin.php   # Main plugin class
│   ├── class-admin.php    # Admin functionality
│   ├── class-public.php   # Public functionality
│   ├── class-loader.php   # Hook loader
│   └── class-activator.php # Activation logic
├── admin/
│   ├── class-settings.php # Settings page
│   └── partials/          # Admin view templates
├── public/
│   ├── class-shortcode.php # Shortcode handler
│   └── partials/          # Public view templates
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── languages/
├── uninstall.php
└── readme.txt
```

**When to Use**:
- Complex functionality
- Need for extensibility
- Multiple developers
- Long-term maintenance

### 4. WordPress Plugin Boilerplate

**Complexity**: High
**File Count**: 20+ files
**Use Case**: Standard WordPress plugin structure, best practices, enterprise plugins

```
plugin-name/
├── plugin-name.php
├── admin/
│   ├── class-plugin-name-admin.php
│   ├── css/
│   │   └── plugin-name-admin.css
│   ├── js/
│   │   └── plugin-name-admin.js
│   └── partials/
│       └── plugin-name-admin-display.php
├── includes/
│   ├── class-plugin-name.php
│   ├── class-plugin-name-loader.php
│   ├── class-plugin-name-i18n.php
│   ├── class-plugin-name-activator.php
│   └── class-plugin-name-deactivator.php
├── public/
│   ├── class-plugin-name-public.php
│   ├── css/
│   │   └── plugin-name-public.css
│   ├── js/
│   │   └── plugin-name-public.js
│   └── partials/
│       └── plugin-name-public-display.php
├── languages/
│   └── plugin-name.pot
├── uninstall.php
└── README.txt
```

**When to Use**:
- Following WordPress.org best practices
- Enterprise-level plugins
- Maximum maintainability
- Plugin marketplace submission

## File Naming Conventions

### PHP Files

- **Main plugin file**: `plugin-slug.php` (matches directory name)
- **Class files**: `class-{class-name}.php` (lowercase, hyphens)
- **Function files**: `{purpose}-functions.php` or `functions.php`
- **Template files**: `{template-name}.php`

**Examples**:
- `class-plugin-name.php`
- `class-admin-settings.php`
- `helper-functions.php`
- `contact-form-template.php`

### Asset Files

- **CSS**: `{plugin-slug}-{context}.css` (e.g., `my-plugin-admin.css`)
- **JavaScript**: `{plugin-slug}-{context}.js` (e.g., `my-plugin-public.js`)
- **Images**: Descriptive names with hyphens

### Translation Files

- **POT template**: `{text-domain}.pot`
- **PO files**: `{text-domain}-{locale}.po` (e.g., `my-plugin-es_ES.po`)
- **MO files**: `{text-domain}-{locale}.mo` (e.g., `my-plugin-es_ES.mo`)

## Required Files

### Main Plugin File

**Purpose**: Entry point for the plugin, contains plugin header

**Location**: Root of plugin directory

**Naming**: Should match plugin directory name

**Example**: `my-plugin/my-plugin.php`

### readme.txt

**Purpose**: WordPress.org plugin directory readme

**Location**: Root of plugin directory

**Format**: WordPress.org readme format

**Required Sections**:
- Contributors
- Tags
- Requires at least
- Tested up to
- Stable tag
- License
- Short Description
- Description
- Installation
- Frequently Asked Questions
- Screenshots
- Changelog

### uninstall.php

**Purpose**: Clean up plugin data on uninstallation

**Location**: Root of plugin directory

**Security**: Must check for `WP_UNINSTALL_PLUGIN` constant

**Example**:
```php
<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Delete options
delete_option( 'my_plugin_option' );

// Delete custom tables
global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}my_plugin_table" );
```

## Best Practices

### Security

✅ **DO**:
- Always check `ABSPATH` constant in all PHP files
- Use `WP_UNINSTALL_PLUGIN` in uninstall.php
- Prefix all function names, class names, and database tables
- Use nonces for form submissions
- Sanitize all input, escape all output

❌ **DON'T**:
- Allow direct file access
- Use generic function/class names
- Store sensitive data in plain text

### Performance

✅ **DO**:
- Load assets only when needed
- Use conditional loading for admin/frontend
- Minimize database queries
- Use transients for caching

❌ **DON'T**:
- Load all assets on every page
- Make unnecessary database queries
- Ignore caching opportunities

### Maintainability

✅ **DO**:
- Use consistent naming conventions
- Organize code logically
- Comment complex logic
- Follow WordPress Coding Standards

❌ **DON'T**:
- Mix concerns (admin/public code)
- Use inconsistent naming
- Leave code undocumented

## AI Agent Guidelines

When scaffolding a new WordPress plugin:

1. **Ask for complexity level** or infer from requirements
2. **Choose appropriate structure** based on complexity
3. **Create directory structure** first
4. **Generate main plugin file** with proper headers
5. **Add security checks** to all files
6. **Create readme.txt** with proper format
7. **Add uninstall.php** if plugin stores data
8. **Set up translation files** if i18n is needed

When analyzing existing plugins:

1. **Detect plugin header** in PHP files
2. **Identify structure pattern** used
3. **Check for required files** (readme.txt, uninstall.php)
4. **Validate naming conventions**
5. **Verify security checks** (ABSPATH, nonces)
6. **Suggest improvements** based on best practices


