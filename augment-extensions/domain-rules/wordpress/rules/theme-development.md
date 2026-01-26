# WordPress Theme Development Workflow

## Overview

This document provides step-by-step workflows for WordPress theme development, covering both classic and block themes.

## Workflow 1: Create New Block Theme

### Step 1: Initialize Theme Structure

```bash
# Create theme directory
mkdir wp-content/themes/my-theme
cd wp-content/themes/my-theme

# Create required directories
mkdir templates parts patterns assets assets/css assets/js
```

### Step 2: Create Required Files

**style.css** (Required):
```css
/*
Theme Name: My Theme
Theme URI: https://example.com/my-theme
Author: Your Name
Author URI: https://example.com
Description: A modern block theme
Requires at least: 6.4
Tested up to: 6.4
Requires PHP: 7.4
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: my-theme
Tags: block-theme, full-site-editing, custom-colors
*/
```

**theme.json** (Required):
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 2,
  "settings": {
    "appearanceTools": true,
    "layout": {
      "contentSize": "840px",
      "wideSize": "1100px"
    },
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
      ]
    },
    "typography": {
      "fontFamilies": [
        {
          "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
          "slug": "system-font",
          "name": "System Font"
        }
      ],
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
      ]
    },
    "spacing": {
      "units": ["px", "em", "rem", "vh", "vw", "%"]
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--white)",
      "text": "var(--wp--preset--color--black)"
    },
    "typography": {
      "fontFamily": "var(--wp--preset--font-family--system-font)",
      "fontSize": "var(--wp--preset--font-size--medium)",
      "lineHeight": "1.6"
    },
    "spacing": {
      "padding": {
        "top": "0px",
        "right": "0px",
        "bottom": "0px",
        "left": "0px"
      }
    }
  }
}
```

**templates/index.html** (Required):
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:query {"queryId":0,"query":{"perPage":10,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date"}} -->
    <div class="wp-block-query">
        <!-- wp:post-template -->
            <!-- wp:post-title {"isLink":true} /-->
            <!-- wp:post-date /-->
            <!-- wp:post-excerpt /-->
        <!-- /wp:post-template -->
        
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

**parts/header.html**:
```html
<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
<div class="wp-block-group">
    <!-- wp:site-title /-->
    <!-- wp:navigation /-->
</div>
<!-- /wp:group -->
```

**parts/footer.html**:
```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">© 2024 My Theme. All rights reserved.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

**functions.php** (Optional but recommended):
```php
<?php
/**
 * My Theme functions and definitions
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue theme styles
 */
function my_theme_enqueue_styles() {
    wp_enqueue_style(
        'my-theme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get( 'Version' )
    );
}
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );

/**
 * Register block patterns
 */
function my_theme_register_patterns() {
    register_block_pattern_category(
        'my-theme',
        array( 'label' => __( 'My Theme', 'my-theme' ) )
    );
}
add_action( 'init', 'my_theme_register_patterns' );
```

### Step 3: Create Additional Templates

Create these templates as needed:

- `templates/single.html` - Single post
- `templates/page.html` - Page
- `templates/archive.html` - Archive
- `templates/404.html` - 404 error
- `templates/front-page.html` - Front page
- `templates/home.html` - Blog home

### Step 4: Add Screenshot

Create `screenshot.png` (1200x900px recommended) showing theme preview.

### Step 5: Activate Theme

1. Go to WordPress admin → Appearance → Themes
2. Find your theme
3. Click "Activate"

## Workflow 2: Convert Classic Theme to Block Theme

### Step 1: Add theme.json

Create `theme.json` in theme root with basic configuration (see above).

### Step 2: Create Templates Directory

```bash
mkdir templates parts
```

### Step 3: Convert Template Files

**Convert header.php to parts/header.html**:
1. Extract header HTML
2. Convert to block markup
3. Replace PHP functions with block equivalents

**Convert footer.php to parts/footer.html**:
1. Extract footer HTML
2. Convert to block markup

**Convert index.php to templates/index.html**:
1. Extract main content area
2. Convert loop to Query block
3. Add template parts for header/footer

### Step 4: Test and Refine

1. Activate theme
2. Test all templates
3. Adjust block markup as needed
4. Remove old PHP templates once converted

## Workflow 3: Theme Setup and Configuration

### Enqueue Assets

**functions.php**:
```php
function my_theme_enqueue_assets() {
    // Enqueue stylesheet
    wp_enqueue_style(
        'my-theme-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get( 'Version' )
    );
    
    // Enqueue custom CSS
    wp_enqueue_style(
        'my-theme-custom',
        get_template_directory_uri() . '/assets/css/custom.css',
        array( 'my-theme-style' ),
        '1.0.0'
    );
    
    // Enqueue JavaScript
    wp_enqueue_script(
        'my-theme-script',
        get_template_directory_uri() . '/assets/js/main.js',
        array(),
        '1.0.0',
        true
    );
}
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_assets' );
```

### Register Navigation Menus

```php
function my_theme_register_menus() {
    register_nav_menus( array(
        'primary' => __( 'Primary Menu', 'my-theme' ),
        'footer'  => __( 'Footer Menu', 'my-theme' ),
    ) );
}
add_action( 'after_setup_theme', 'my_theme_register_menus' );
```

### Add Theme Support

```php
function my_theme_setup() {
    // Add default posts and comments RSS feed links to head
    add_theme_support( 'automatic-feed-links' );
    
    // Let WordPress manage the document title
    add_theme_support( 'title-tag' );
    
    // Enable support for Post Thumbnails
    add_theme_support( 'post-thumbnails' );
    
    // Add support for responsive embeds
    add_theme_support( 'responsive-embeds' );
    
    // Add support for editor styles
    add_theme_support( 'editor-styles' );
    
    // Add support for HTML5 markup
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ) );
    
    // Add support for custom logo
    add_theme_support( 'custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ) );
}
add_action( 'after_setup_theme', 'my_theme_setup' );
```

## Best Practices

### DO

✅ Use `theme.json` for global styles and settings  
✅ Follow WordPress coding standards  
✅ Sanitize and escape all output  
✅ Use translation functions for all text  
✅ Test with default WordPress content  
✅ Provide screenshot.png  
✅ Include readme.txt with documentation  
✅ Use semantic HTML  
✅ Ensure accessibility (WCAG 2.1 AA)  
✅ Test on multiple devices and browsers

### DON'T

❌ Hardcode URLs or paths  
❌ Include plugin functionality in themes  
❌ Modify WordPress core files  
❌ Use deprecated functions  
❌ Ignore security best practices  
❌ Forget to enqueue scripts/styles properly  
❌ Use inline styles or scripts  
❌ Skip translation support  
❌ Ignore performance optimization

