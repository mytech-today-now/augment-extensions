# WordPress File Patterns

## Overview

This document defines key WordPress file patterns, their purposes, and usage guidelines.

## Theme Files

### Required Files

#### style.css
**Purpose**: Theme stylesheet and metadata  
**Location**: Theme root  
**Required**: Yes

**Structure**:
```css
/*
Theme Name: Twenty Twenty-Four
Theme URI: https://wordpress.org/themes/twentytwentyfour/
Author: the WordPress team
Author URI: https://wordpress.org
Description: A modern block theme
Requires at least: 6.4
Tested up to: 6.4
Requires PHP: 7.0
Version: 1.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: twentytwentyfour
Tags: blog, one-column, custom-colors, custom-menu, editor-style
*/

/* Theme styles go here */
```

**Key Points**:
- Must be in theme root
- Header comment is required
- Contains theme metadata
- Can contain CSS or be empty (if using separate CSS files)

#### functions.php
**Purpose**: Theme functions and hooks  
**Location**: Theme root  
**Required**: Yes (recommended)

**Common Uses**:
```php
<?php
// Theme setup
function mytheme_setup() {
    // Add theme support
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form' ) );
    
    // Register menus
    register_nav_menus( array(
        'primary' => __( 'Primary Menu', 'mytheme' ),
        'footer'  => __( 'Footer Menu', 'mytheme' ),
    ) );
}
add_action( 'after_setup_theme', 'mytheme_setup' );

// Enqueue scripts and styles
function mytheme_scripts() {
    wp_enqueue_style( 'mytheme-style', get_stylesheet_uri() );
    wp_enqueue_script( 'mytheme-script', get_template_directory_uri() . '/js/main.js', array(), '1.0', true );
}
add_action( 'wp_enqueue_scripts', 'mytheme_scripts' );
```

#### index.php
**Purpose**: Main template fallback  
**Location**: Theme root  
**Required**: Yes (classic themes)

**Template Hierarchy**: Lowest priority fallback for all template types

### Block Theme Files

#### theme.json
**Purpose**: Theme configuration for block themes  
**Location**: Theme root  
**Required**: Yes (block themes)

**Structure**:
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 2,
  "settings": {
    "color": {
      "palette": [
        {
          "slug": "primary",
          "color": "#0073aa",
          "name": "Primary"
        }
      ]
    },
    "typography": {
      "fontSizes": [
        {
          "slug": "small",
          "size": "14px",
          "name": "Small"
        }
      ]
    }
  },
  "styles": {
    "color": {
      "background": "#ffffff",
      "text": "#000000"
    }
  }
}
```

#### templates/*.html
**Purpose**: Block templates  
**Location**: `templates/` directory  
**Required**: `index.html` is required

**Common Templates**:
- `index.html` - Main template (required)
- `single.html` - Single post
- `page.html` - Page
- `archive.html` - Archive
- `404.html` - 404 error
- `front-page.html` - Front page
- `home.html` - Blog home

#### parts/*.html
**Purpose**: Reusable template parts  
**Location**: `parts/` directory  
**Required**: No

**Common Parts**:
- `header.html` - Site header
- `footer.html` - Site footer
- `sidebar.html` - Sidebar
- `comments.html` - Comments section

### Classic Theme Templates

#### Template Hierarchy Files

**Single Post**:
- `single-{post-type}-{slug}.php`
- `single-{post-type}.php`
- `single.php`
- `singular.php`
- `index.php`

**Page**:
- `page-{slug}.php`
- `page-{id}.php`
- `page.php`
- `singular.php`
- `index.php`

**Archive**:
- `archive-{post-type}.php`
- `archive.php`
- `index.php`

**Category**:
- `category-{slug}.php`
- `category-{id}.php`
- `category.php`
- `archive.php`
- `index.php`

**Tag**:
- `tag-{slug}.php`
- `tag-{id}.php`
- `tag.php`
- `archive.php`
- `index.php`

**Author**:
- `author-{nicename}.php`
- `author-{id}.php`
- `author.php`
- `archive.php`
- `index.php`

**Date**:
- `date.php`
- `archive.php`
- `index.php`

**Search**:
- `search.php`
- `index.php`

**404**:
- `404.php`
- `index.php`

**Front Page**:
- `front-page.php`
- `home.php`
- `index.php`

## Plugin Files

### Main Plugin File

**Purpose**: Plugin entry point with header  
**Location**: Plugin root  
**Naming**: `plugin-name.php` or `plugin-slug.php`

**Structure**:
```php
<?php
/**
 * Plugin Name: My Plugin
 * Plugin URI: https://example.com/my-plugin
 * Description: Plugin description
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Author Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: my-plugin
 * Domain Path: /languages
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin code here
```

### uninstall.php

**Purpose**: Cleanup on plugin deletion  
**Location**: Plugin root  
**Required**: No (recommended)

**Structure**:
```php
<?php
// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Delete options
delete_option( 'my_plugin_option' );

// Delete custom tables
global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}my_plugin_table" );

// Clear scheduled hooks
wp_clear_scheduled_hook( 'my_plugin_cron' );
```

## Block Files

### block.json

**Purpose**: Block metadata  
**Location**: Block root  
**Required**: Yes (blocks)

**Structure**:
```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 2,
  "name": "namespace/block-name",
  "title": "Block Title",
  "category": "widgets",
  "icon": "smiley",
  "description": "Block description",
  "keywords": ["keyword1", "keyword2"],
  "version": "1.0.0",
  "textdomain": "block-slug",
  "attributes": {
    "content": {
      "type": "string",
      "source": "html",
      "selector": "p"
    }
  },
  "supports": {
    "html": false,
    "align": true
  },
  "example": {
    "attributes": {
      "content": "Example content"
    }
  },
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css"
}
```

## Configuration Files

### wp-config.php

**Purpose**: WordPress configuration  
**Location**: WordPress root  
**Required**: Yes

**CRITICAL SAFETY RULES**:
- ❌ NEVER modify database credentials
- ❌ NEVER commit to version control
- ✅ READ ONLY for AI operations
- ✅ Only modify debug settings or add constants

**Common Constants**:
```php
// Database (READ ONLY)
define( 'DB_NAME', 'database_name' );
define( 'DB_USER', 'database_user' );
define( 'DB_PASSWORD', 'database_password' );
define( 'DB_HOST', 'localhost' );

// Debug (SAFE TO MODIFY)
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

// Custom constants (SAFE TO ADD)
define( 'CUSTOM_CONSTANT', 'value' );
```

### .htaccess

**Purpose**: Apache configuration  
**Location**: WordPress root  
**Required**: No (Apache only)

**Common Rules**:
```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

### composer.json

**Purpose**: PHP dependency management  
**Location**: Theme/plugin root  
**Required**: No (if using Composer)

### package.json

**Purpose**: JavaScript dependency management  
**Location**: Theme/plugin/block root  
**Required**: No (if using npm/yarn)

**Block Development**:
```json
{
  "name": "block-name",
  "version": "1.0.0",
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start"
  },
  "devDependencies": {
    "@wordpress/scripts": "^26.0.0"
  }
}
```

## Translation Files

### .pot (Template)
**Purpose**: Translation template  
**Location**: `languages/` directory  
**Generated**: Yes (using WP-CLI or tools)

### .po (Translation)
**Purpose**: Human-readable translations  
**Location**: `languages/` directory

### .mo (Compiled)
**Purpose**: Machine-readable translations  
**Location**: `languages/` directory  
**Generated**: Yes (from .po files)

## Best Practices

### File Naming

✅ Use lowercase with hyphens: `my-plugin.php`  
✅ Match text domain: `my-plugin` → `my-plugin.php`  
✅ Be descriptive: `class-admin-settings.php`  
❌ Avoid spaces: `My Plugin.php`  
❌ Avoid underscores in slugs: `my_plugin.php`

### File Organization

✅ Group related files in directories  
✅ Separate admin and public code  
✅ Use `inc/` or `includes/` for PHP includes  
✅ Keep assets in `assets/` or dedicated directories  
❌ Don't mix concerns in single files  
❌ Don't create deeply nested structures

