# Context Providers for WordPress Plugin Development

## Overview

This guide documents WordPress-specific file context providers that help AI assistants understand the purpose and constraints of different WordPress files. Each file type has specific patterns, best practices, and safety rules.

---

## 1. functions.php (Theme Functions File)

### Purpose

Theme setup, customization, and functionality extension.

### Context Rules

**When editing functions.php:**

- ✅ **DO**: Add theme support features
- ✅ **DO**: Register navigation menus
- ✅ **DO**: Enqueue theme styles and scripts
- ✅ **DO**: Register widget areas
- ✅ **DO**: Add custom image sizes
- ✅ **DO**: Customize excerpt length
- ✅ **DO**: Add theme-specific filters and actions

- ❌ **DON'T**: Modify core WordPress files
- ❌ **DON'T**: Add plugin-level functionality (use plugins instead)
- ❌ **DON'T**: Include large amounts of business logic
- ❌ **DON'T**: Hardcode URLs or paths

### Common Patterns

```php
<?php
/**
 * Theme functions and definitions
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Theme setup
 */
function mytheme_setup() {
    // Add theme support
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
    add_theme_support( 'custom-logo' );
    
    // Register navigation menus
    register_nav_menus( array(
        'primary' => __( 'Primary Menu', 'mytheme' ),
        'footer'  => __( 'Footer Menu', 'mytheme' ),
    ) );
    
    // Add custom image sizes
    add_image_size( 'mytheme-featured', 800, 600, true );
}
add_action( 'after_setup_theme', 'mytheme_setup' );

/**
 * Enqueue scripts and styles
 */
function mytheme_enqueue_scripts() {
    // Enqueue styles
    wp_enqueue_style( 'mytheme-style', get_stylesheet_uri(), array(), '1.0.0' );
    
    // Enqueue scripts
    wp_enqueue_script( 'mytheme-script', get_template_directory_uri() . '/js/script.js', array( 'jquery' ), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'mytheme_enqueue_scripts' );

/**
 * Register widget areas
 */
function mytheme_widgets_init() {
    register_sidebar( array(
        'name'          => __( 'Sidebar', 'mytheme' ),
        'id'            => 'sidebar-1',
        'description'   => __( 'Add widgets here.', 'mytheme' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ) );
}
add_action( 'widgets_init', 'mytheme_widgets_init' );
```

### Safety Rules

- **NEVER** remove the opening `<?php` tag
- **ALWAYS** use proper WordPress hooks
- **ALWAYS** prefix function names with theme slug
- **ALWAYS** use translation functions for user-facing strings
- **ALWAYS** check if functions exist before defining them

---

## 2. wp-config.php (WordPress Configuration File)

### Purpose

WordPress core configuration including database credentials, security keys, and environment settings.

### Context Rules

**When viewing wp-config.php:**

- ✅ **DO**: Read configuration values
- ✅ **DO**: Suggest environment-specific constants
- ✅ **DO**: Recommend security improvements
- ✅ **DO**: Suggest debugging settings for development

- ❌ **DON'T**: Modify database credentials without explicit permission
- ❌ **DON'T**: Change security keys without warning
- ❌ **DON'T**: Enable debugging in production
- ❌ **DON'T**: Expose sensitive information

### Read-Only Context

**wp-config.php is READ-ONLY by default. Only suggest changes, never make them automatically.**

### Common Safe Additions

```php
// Development environment settings (ONLY for local development)
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SCRIPT_DEBUG', true );

// Memory limits
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );

// Auto-save interval (in seconds)
define( 'AUTOSAVE_INTERVAL', 160 );

// Post revisions
define( 'WP_POST_REVISIONS', 5 );

// Trash auto-empty (in days)
define( 'EMPTY_TRASH_DAYS', 30 );

// Disable file editing in admin
define( 'DISALLOW_FILE_EDIT', true );

// Force SSL for admin
define( 'FORCE_SSL_ADMIN', true );

// Custom content directory
define( 'WP_CONTENT_DIR', dirname(__FILE__) . '/wp-content' );
define( 'WP_CONTENT_URL', 'https://example.com/wp-content' );
```

### Safety Rules

- **NEVER** modify without explicit user permission
- **ALWAYS** warn before suggesting changes
- **ALWAYS** recommend backups before changes
- **ALWAYS** distinguish between development and production settings
- **NEVER** log or expose database credentials

---

## 3. block.json (Block Metadata File)

### Purpose

Gutenberg block metadata including attributes, supports, and registration details.

### Context Rules

**When editing block.json:**

- ✅ **DO**: Define block attributes
- ✅ **DO**: Specify block supports
- ✅ **DO**: Set block category
- ✅ **DO**: Define block keywords
- ✅ **DO**: Specify editor and view scripts
- ✅ **DO**: Define block styles

- ❌ **DON'T**: Use invalid JSON syntax
- ❌ **DON'T**: Omit required fields
- ❌ **DON'T**: Use reserved block names

### Standard block.json Structure

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "myplugin/custom-block",
  "version": "1.0.0",
  "title": "Custom Block",
  "category": "widgets",
  "icon": "smiley",
  "description": "A custom Gutenberg block",
  "keywords": ["custom", "block"],
  "textdomain": "myplugin",
  "supports": {
    "html": false,
    "align": true,
    "color": {
      "background": true,
      "text": true
    },
    "spacing": {
      "margin": true,
      "padding": true
    }
  },
  "attributes": {
    "content": {
      "type": "string",
      "default": ""
    },
    "alignment": {
      "type": "string",
      "default": "left"
    }
  },
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css"
}
```

### Common Attributes

```json
{
  "attributes": {
    "title": {
      "type": "string",
      "default": ""
    },
    "content": {
      "type": "string",
      "source": "html",
      "selector": "p"
    },
    "imageUrl": {
      "type": "string",
      "default": ""
    },
    "imageId": {
      "type": "number"
    },
    "isEnabled": {
      "type": "boolean",
      "default": true
    },
    "items": {
      "type": "array",
      "default": []
    },
    "settings": {
      "type": "object",
      "default": {}
    }
  }
}
```

### Safety Rules

- **ALWAYS** validate JSON syntax
- **ALWAYS** include required fields (name, title, category)
- **ALWAYS** use proper attribute types
- **ALWAYS** prefix block names with plugin/theme namespace
- **NEVER** use core WordPress block names

---

## 4. theme.json (Global Styles and Settings)

### Purpose

Define global styles, color palettes, typography, and layout settings for block themes.

### Context Rules

**When editing theme.json:**

- ✅ **DO**: Define color palettes
- ✅ **DO**: Set typography scales
- ✅ **DO**: Configure layout settings
- ✅ **DO**: Define custom CSS properties
- ✅ **DO**: Set block-specific styles

- ❌ **DON'T**: Use invalid JSON syntax
- ❌ **DON'T**: Override user preferences without reason
- ❌ **DON'T**: Define inaccessible color combinations

### Standard theme.json Structure

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
        },
        {
          "slug": "secondary",
          "color": "#23282d",
          "name": "Secondary"
        },
        {
          "slug": "white",
          "color": "#ffffff",
          "name": "White"
        },
        {
          "slug": "black",
          "color": "#000000",
          "name": "Black"
        }
      ],
      "gradients": [
        {
          "slug": "primary-to-secondary",
          "gradient": "linear-gradient(135deg, #0073aa 0%, #23282d 100%)",
          "name": "Primary to Secondary"
        }
      ],
      "duotone": [],
      "custom": true,
      "customGradient": true,
      "link": true
    },
    "typography": {
      "fontSizes": [
        {
          "slug": "small",
          "size": "14px",
          "name": "Small"
        },
        {
          "slug": "medium",
          "size": "18px",
          "name": "Medium"
        },
        {
          "slug": "large",
          "size": "24px",
          "name": "Large"
        },
        {
          "slug": "x-large",
          "size": "32px",
          "name": "Extra Large"
        }
      ],
      "fontFamilies": [
        {
          "slug": "system",
          "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
          "name": "System Font"
        }
      ],
      "customFontSize": true,
      "lineHeight": true
    },
    "spacing": {
      "units": ["px", "em", "rem", "vh", "vw", "%"],
      "padding": true,
      "margin": true
    },
    "layout": {
      "contentSize": "800px",
      "wideSize": "1200px"
    }
  },
  "styles": {
    "color": {
      "background": "#ffffff",
      "text": "#000000"
    },
    "typography": {
      "fontSize": "18px",
      "lineHeight": "1.6",
      "fontFamily": "var(--wp--preset--font-family--system)"
    },
    "spacing": {
      "padding": {
        "top": "0",
        "right": "0",
        "bottom": "0",
        "left": "0"
      }
    },
    "elements": {
      "link": {
        "color": {
          "text": "var(--wp--preset--color--primary)"
        }
      },
      "h1": {
        "typography": {
          "fontSize": "var(--wp--preset--font-size--x-large)"
        }
      }
    },
    "blocks": {
      "core/paragraph": {
        "spacing": {
          "margin": {
            "bottom": "1em"
          }
        }
      }
    }
  }
}
```

### Safety Rules

- **ALWAYS** validate JSON syntax
- **ALWAYS** use version 2 schema
- **ALWAYS** ensure color contrast meets WCAG standards
- **ALWAYS** provide fallback values
- **NEVER** remove default color palette without replacement

---

## 5. style.css (Theme Metadata File)

### Purpose

Theme metadata and optional theme styles.

### Context Rules

**When editing style.css:**

- ✅ **DO**: Update theme metadata in header
- ✅ **DO**: Add theme-specific styles
- ✅ **DO**: Use proper CSS syntax
- ✅ **DO**: Include version number

- ❌ **DON'T**: Remove required header fields
- ❌ **DON'T**: Use invalid CSS syntax
- ❌ **DON'T**: Hardcode colors without CSS variables

### Required Header Format

```css
/*
Theme Name: My Theme
Theme URI: https://example.com/my-theme
Author: Author Name
Author URI: https://example.com
Description: A custom WordPress theme
Version: 1.0.0
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: mytheme
Domain Path: /languages
Tags: blog, custom-background, custom-logo, custom-menu, featured-images
*/
```

### Required Fields

- **Theme Name**: Display name of the theme
- **Author**: Theme author name
- **Description**: Brief theme description
- **Version**: Theme version number
- **License**: Theme license
- **Text Domain**: Translation text domain

### Optional Fields

- **Theme URI**: Theme homepage URL
- **Author URI**: Author homepage URL
- **Requires at least**: Minimum WordPress version
- **Tested up to**: Maximum tested WordPress version
- **Requires PHP**: Minimum PHP version
- **Domain Path**: Translation files directory
- **Tags**: Theme tags for WordPress.org

### Safety Rules

- **NEVER** remove the theme header comment
- **ALWAYS** update version number when making changes
- **ALWAYS** use valid CSS syntax
- **ALWAYS** match Text Domain with theme slug

---

## 6. Plugin Main File (my-plugin.php)

### Purpose

Plugin entry point with metadata and initialization.

### Context Rules

**When editing plugin main file:**

- ✅ **DO**: Update plugin metadata in header
- ✅ **DO**: Define plugin constants
- ✅ **DO**: Include required files
- ✅ **DO**: Initialize plugin functionality
- ✅ **DO**: Add activation/deactivation hooks

- ❌ **DON'T**: Remove required header fields
- ❌ **DON'T**: Execute code before security checks
- ❌ **DON'T**: Include large amounts of code directly

### Required Header Format

```php
<?php
/**
 * Plugin Name: My Plugin
 * Plugin URI: https://example.com/my-plugin
 * Description: A custom WordPress plugin
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Author Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: myplugin
 * Domain Path: /languages
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'MYPLUGIN_VERSION', '1.0.0' );
define( 'MYPLUGIN_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'MYPLUGIN_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'MYPLUGIN_PLUGIN_FILE', __FILE__ );

// Include required files
require_once MYPLUGIN_PLUGIN_DIR . 'includes/class-myplugin.php';

// Initialize plugin
function myplugin_init() {
    $plugin = new MyPlugin();
    $plugin->run();
}
add_action( 'plugins_loaded', 'myplugin_init' );

// Activation hook
register_activation_hook( __FILE__, 'myplugin_activate' );
function myplugin_activate() {
    // Activation code
}

// Deactivation hook
register_deactivation_hook( __FILE__, 'myplugin_deactivate' );
function myplugin_deactivate() {
    // Deactivation code
}
```

### Required Fields

- **Plugin Name**: Display name of the plugin
- **Description**: Brief plugin description
- **Version**: Plugin version number
- **Author**: Plugin author name
- **License**: Plugin license
- **Text Domain**: Translation text domain

### Safety Rules

- **NEVER** remove the plugin header comment
- **ALWAYS** include ABSPATH security check
- **ALWAYS** define plugin constants
- **ALWAYS** use proper activation/deactivation hooks
- **ALWAYS** update version number when making changes

---

## 7. readme.txt (WordPress.org Plugin Readme)

### Purpose

Plugin documentation for WordPress.org plugin directory.

### Context Rules

**When editing readme.txt:**

- ✅ **DO**: Update version numbers
- ✅ **DO**: Add changelog entries
- ✅ **DO**: Update compatibility information
- ✅ **DO**: Improve installation instructions
- ✅ **DO**: Add FAQ entries

- ❌ **DON'T**: Remove required sections
- ❌ **DON'T**: Use invalid markdown syntax
- ❌ **DON'T**: Include promotional content

### Standard readme.txt Structure

```
=== My Plugin ===
Contributors: username
Donate link: https://example.com/donate
Tags: tag1, tag2, tag3
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Short description of the plugin.

== Description ==

Detailed description of the plugin.

Features:
* Feature 1
* Feature 2
* Feature 3

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/my-plugin`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the Settings->My Plugin screen to configure the plugin

== Frequently Asked Questions ==

= Question 1 =

Answer 1

= Question 2 =

Answer 2

== Screenshots ==

1. Screenshot 1 description
2. Screenshot 2 description

== Changelog ==

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release
```

### Safety Rules

- **ALWAYS** update version numbers consistently
- **ALWAYS** add changelog entries for new versions
- **ALWAYS** update "Tested up to" version
- **ALWAYS** use proper markdown syntax
- **NEVER** include promotional links in description

---

## Summary

**Key context providers for WordPress development:**

1. **functions.php** - Theme setup and customization
2. **wp-config.php** - Configuration (READ-ONLY)
3. **block.json** - Gutenberg block metadata
4. **theme.json** - Global styles and settings
5. **style.css** - Theme metadata
6. **Plugin main file** - Plugin entry point
7. **readme.txt** - WordPress.org documentation

**Safety rules:**

- ✅ Always validate syntax before saving
- ✅ Always backup before making changes
- ✅ Always use WordPress coding standards
- ✅ Always check for required fields
- ❌ Never modify wp-config.php without permission
- ❌ Never remove required metadata
- ❌ Never use invalid syntax


