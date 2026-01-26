# WordPress Project Detection

## Overview

This document defines how to automatically detect WordPress projects and determine their type (full installation, theme, plugin, or block development).

## Detection Criteria

### 1. Full WordPress Installation

A project is identified as a **full WordPress installation** if it contains:

**Required Files:**
- `wp-config.php` or `wp-config-sample.php`
- `wp-load.php`
- `wp-settings.php`

**Required Directories:**
- `wp-includes/`
- `wp-admin/`
- `wp-content/`

**Detection Pattern:**
```
wordpress-root/
├── wp-config.php (or wp-config-sample.php)
├── wp-load.php
├── wp-settings.php
├── wp-includes/
├── wp-admin/
└── wp-content/
```

### 2. WordPress Theme Project

A project is identified as a **WordPress theme** if it contains:

**Required Files:**
- `style.css` with WordPress theme header
- `functions.php`
- `index.php`

**Optional Files (Block Theme):**
- `theme.json`
- `templates/` directory with `.html` files
- `parts/` directory with `.html` files

**Theme Header Detection:**
```css
/*
Theme Name: Theme Name
Theme URI: https://example.com/
Author: Author Name
Author URI: https://example.com/
Description: Theme description
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: theme-slug
*/
```

**Detection Pattern (Classic Theme):**
```
theme-name/
├── style.css (with theme header)
├── functions.php
├── index.php
├── header.php
├── footer.php
└── ...
```

**Detection Pattern (Block Theme):**
```
theme-name/
├── style.css (with theme header)
├── functions.php
├── theme.json
├── templates/
│   ├── index.html
│   └── ...
└── parts/
    ├── header.html
    └── ...
```

### 3. WordPress Plugin Project

A project is identified as a **WordPress plugin** if it contains:

**Required:**
- PHP file with WordPress plugin header

**Plugin Header Detection:**
```php
<?php
/**
 * Plugin Name: Plugin Name
 * Plugin URI: https://example.com/
 * Description: Plugin description
 * Version: 1.0.0
 * Author: Author Name
 * Author URI: https://example.com/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: plugin-slug
 */
```

**Detection Pattern:**
```
plugin-name/
├── plugin-name.php (with plugin header)
├── readme.txt
├── includes/
├── admin/
└── ...
```

### 4. Gutenberg Block Development

A project is identified as a **Gutenberg block** if it contains:

**Required Files:**
- `block.json`
- `package.json` with `@wordpress/*` dependencies

**Block.json Detection:**
```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 2,
  "name": "namespace/block-name",
  "title": "Block Title",
  "category": "widgets",
  "icon": "smiley",
  "description": "Block description",
  "supports": {},
  "textdomain": "block-slug",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css"
}
```

**Detection Pattern:**
```
block-name/
├── block.json
├── package.json
├── src/
│   ├── index.js
│   ├── edit.js
│   └── save.js
└── build/
```

## Detection Priority

When multiple detection criteria match, use this priority order:

1. **Full WordPress Installation** (highest priority)
   - Check for `wp-config.php` first
   - If found, treat as full installation

2. **Theme Project**
   - Check for `style.css` with theme header
   - Check for `functions.php` and `index.php`

3. **Plugin Project**
   - Check for PHP files with plugin header
   - Typically in `wp-content/plugins/[plugin-name]/`

4. **Block Development** (lowest priority)
   - Check for `block.json`
   - Check for `@wordpress/*` in `package.json`

## Detection Algorithm

```javascript
function detectWordPressProject(projectPath) {
  // 1. Check for full WordPress installation
  if (fileExists('wp-config.php') || fileExists('wp-config-sample.php')) {
    if (directoryExists('wp-includes') && directoryExists('wp-admin')) {
      return { type: 'wordpress-full', version: detectWPVersion() };
    }
  }
  
  // 2. Check for theme
  if (fileExists('style.css') && fileExists('functions.php')) {
    const styleContent = readFile('style.css');
    if (styleContent.includes('Theme Name:')) {
      const isBlockTheme = fileExists('theme.json');
      return { 
        type: 'wordpress-theme', 
        subtype: isBlockTheme ? 'block-theme' : 'classic-theme' 
      };
    }
  }
  
  // 3. Check for plugin
  const phpFiles = findFiles('*.php');
  for (const file of phpFiles) {
    const content = readFile(file);
    if (content.includes('Plugin Name:')) {
      return { type: 'wordpress-plugin', mainFile: file };
    }
  }
  
  // 4. Check for block development
  if (fileExists('block.json')) {
    const packageJson = readFile('package.json');
    if (packageJson.includes('@wordpress/')) {
      return { type: 'wordpress-block' };
    }
  }
  
  return { type: 'unknown' };
}
```

## Context Hints

Once a WordPress project is detected, provide these context hints to the AI:

### Full Installation
- WordPress version
- Active theme location
- Plugins directory
- Upload directory
- Database configuration (read-only)

### Theme
- Theme type (classic or block)
- Template hierarchy
- Asset locations
- Functions.php hooks

### Plugin
- Main plugin file
- Plugin structure
- Hook priorities
- Admin vs public code

### Block
- Block metadata
- Build configuration
- WordPress dependencies
- Editor vs frontend code

