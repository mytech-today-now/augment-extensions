# WordPress Directory Structure Patterns

## Overview

This document defines the standard directory structures for WordPress projects: full installations, themes, plugins, and blocks.

## Standard WordPress Installation

### Complete Structure

```
wordpress/
├── wp-admin/                    # WordPress admin area
│   ├── css/
│   ├── images/
│   ├── includes/
│   ├── js/
│   ├── maint/
│   ├── network/
│   ├── user/
│   └── *.php                    # Admin pages
├── wp-content/                  # User content (themes, plugins, uploads)
│   ├── themes/                  # Themes directory
│   │   ├── twentytwentyfour/   # Default theme
│   │   └── [custom-theme]/     # Custom themes
│   ├── plugins/                 # Plugins directory
│   │   ├── akismet/
│   │   ├── hello.php
│   │   └── [custom-plugin]/    # Custom plugins
│   ├── mu-plugins/              # Must-use plugins (auto-loaded)
│   ├── uploads/                 # Media uploads
│   │   └── [year]/
│   │       └── [month]/
│   ├── languages/               # Translation files
│   └── upgrade/                 # Temporary upgrade files
├── wp-includes/                 # WordPress core files
│   ├── blocks/
│   ├── certificates/
│   ├── css/
│   ├── customize/
│   ├── fonts/
│   ├── images/
│   ├── js/
│   ├── pomo/
│   ├── rest-api/
│   ├── theme-compat/
│   ├── widgets/
│   └── *.php                    # Core PHP files
├── .htaccess                    # Apache configuration
├── index.php                    # Main entry point
├── license.txt                  # GPL license
├── readme.html                  # WordPress readme
├── wp-activate.php              # Multisite activation
├── wp-blog-header.php           # Blog header loader
├── wp-comments-post.php         # Comment handler
├── wp-config.php                # WordPress configuration (CRITICAL)
├── wp-config-sample.php         # Sample configuration
├── wp-cron.php                  # Cron handler
├── wp-links-opml.php            # OPML export
├── wp-load.php                  # Bootstrap loader
├── wp-login.php                 # Login page
├── wp-mail.php                  # Email handler
├── wp-settings.php              # Settings loader
├── wp-signup.php                # Multisite signup
├── wp-trackback.php             # Trackback handler
└── xmlrpc.php                   # XML-RPC handler
```

### Key Directories

**wp-admin/**
- WordPress administration interface
- DO NOT modify core files
- Use hooks and filters instead

**wp-content/**
- User-generated content
- Safe to modify
- Version control this directory

**wp-includes/**
- WordPress core library
- DO NOT modify
- Use plugins/themes for customization

## Theme Structure

### Classic Theme

```
theme-name/
├── style.css                    # Required: Theme stylesheet with header
├── functions.php                # Required: Theme functions
├── index.php                    # Required: Main template
├── header.php                   # Header template
├── footer.php                   # Footer template
├── sidebar.php                  # Sidebar template
├── single.php                   # Single post template
├── page.php                     # Page template
├── archive.php                  # Archive template
├── category.php                 # Category archive
├── tag.php                      # Tag archive
├── author.php                   # Author archive
├── date.php                     # Date archive
├── search.php                   # Search results
├── 404.php                      # 404 error page
├── comments.php                 # Comments template
├── front-page.php               # Front page template
├── home.php                     # Blog home template
├── attachment.php               # Attachment template
├── image.php                    # Image attachment
├── template-parts/              # Reusable template parts
│   ├── content.php
│   ├── content-single.php
│   └── content-page.php
├── inc/                         # Include files
│   ├── customizer.php
│   ├── template-tags.php
│   └── template-functions.php
├── assets/                      # Theme assets
│   ├── css/
│   │   ├── main.css
│   │   └── editor-style.css
│   ├── js/
│   │   ├── main.js
│   │   └── customizer.js
│   └── images/
│       └── *.png, *.jpg, *.svg
├── languages/                   # Translation files
│   └── theme-slug.pot
├── screenshot.png               # Theme screenshot (880x660px)
└── readme.txt                   # Theme documentation
```

### Block Theme (FSE)

```
theme-name/
├── style.css                    # Required: Theme stylesheet with header
├── functions.php                # Theme functions (minimal)
├── theme.json                   # Required: Theme configuration
├── templates/                   # Required: Block templates
│   ├── index.html              # Required: Main template
│   ├── single.html             # Single post
│   ├── page.html               # Page
│   ├── archive.html            # Archive
│   ├── search.html             # Search results
│   ├── 404.html                # 404 error
│   ├── front-page.html         # Front page
│   └── home.html               # Blog home
├── parts/                       # Template parts
│   ├── header.html
│   ├── footer.html
│   ├── sidebar.html
│   └── comments.html
├── patterns/                    # Block patterns
│   ├── hero.php
│   ├── call-to-action.php
│   └── testimonials.php
├── assets/                      # Theme assets
│   ├── css/
│   ├── js/
│   └── images/
├── inc/                         # Include files
│   └── block-patterns.php
├── languages/                   # Translation files
├── screenshot.png               # Theme screenshot
└── readme.txt                   # Theme documentation
```

## Plugin Structure

### Standard Plugin

```
plugin-name/
├── plugin-name.php              # Required: Main plugin file with header
├── uninstall.php                # Cleanup on uninstall
├── readme.txt                   # WordPress.org readme
├── LICENSE                      # License file
├── includes/                    # Core functionality
│   ├── class-plugin-name.php
│   ├── class-loader.php
│   ├── class-i18n.php
│   └── functions.php
├── admin/                       # Admin-specific functionality
│   ├── class-admin.php
│   ├── partials/
│   │   └── admin-display.php
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── admin.js
├── public/                      # Public-facing functionality
│   ├── class-public.php
│   ├── partials/
│   │   └── public-display.php
│   ├── css/
│   │   └── public.css
│   └── js/
│       └── public.js
├── assets/                      # Shared assets
│   ├── images/
│   └── fonts/
├── languages/                   # Translation files
│   └── plugin-slug.pot
└── tests/                       # PHPUnit tests
    ├── bootstrap.php
    └── test-*.php
```

### Block Plugin

```
block-plugin/
├── plugin-name.php              # Main plugin file
├── block.json                   # Block metadata
├── package.json                 # Build dependencies
├── src/                         # Source files
│   ├── index.js                # Block registration
│   ├── edit.js                 # Editor component
│   ├── save.js                 # Save function
│   ├── style.scss              # Frontend styles
│   └── editor.scss             # Editor styles
├── build/                       # Compiled files (gitignored)
│   ├── index.js
│   ├── index.asset.php
│   ├── style-index.css
│   └── index.css
└── languages/
```

## Gutenberg Block Development

### Standalone Block

```
block-name/
├── block.json                   # Block metadata
├── package.json                 # Dependencies
├── src/                         # Source files
│   ├── index.js
│   ├── edit.js
│   ├── save.js
│   ├── style.scss
│   └── editor.scss
├── build/                       # Build output
└── readme.md
```

## Best Practices

### DO

✅ Keep themes in `wp-content/themes/`
✅ Keep plugins in `wp-content/plugins/`
✅ Use `mu-plugins/` for critical plugins
✅ Organize assets in dedicated directories
✅ Use `inc/` or `includes/` for PHP includes
✅ Separate admin and public code
✅ Use `languages/` for translations

### DON'T

❌ Modify `wp-admin/` or `wp-includes/`
❌ Store uploads outside `wp-content/uploads/`
❌ Mix theme and plugin code
❌ Put sensitive data in public directories
❌ Hardcode paths (use WordPress functions)

