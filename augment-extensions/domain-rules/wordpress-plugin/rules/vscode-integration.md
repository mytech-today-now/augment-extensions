# VS Code Integration for WordPress Plugin Development

## Overview

This guide provides VS Code configuration for WordPress plugin development including file associations, task suggestions, context menu integrations, snippets, and recommended extensions.

---

## 1. File Associations

### .vscode/settings.json

Configure file associations for WordPress-specific files:

```json
{
  "files.associations": {
    "*.php": "php",
    "*.inc": "php",
    "*.module": "php",
    "*.install": "php",
    "*.theme": "php",
    "*.profile": "php",
    "*.test": "php",
    "*.tpl.php": "php",
    "*.twig": "twig",
    "*.scss": "scss",
    "*.sass": "sass",
    "*.less": "less",
    "*.json": "jsonc",
    "composer.lock": "json",
    "*.lock": "json",
    ".phpcs.xml": "xml",
    "phpcs.xml": "xml",
    "phpunit.xml": "xml",
    ".editorconfig": "editorconfig"
  },
  
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/vendor": true,
    "**/.sass-cache": true,
    "**/dist": true,
    "**/build": true
  },
  
  "search.exclude": {
    "**/node_modules": true,
    "**/vendor": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true
  }
}
```

---

## 2. Task Suggestions

### .vscode/tasks.json

Define common WordPress plugin development tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "WordPress: Install Dependencies",
      "type": "shell",
      "command": "composer install && npm install",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Run PHPUnit Tests",
      "type": "shell",
      "command": "vendor/bin/phpunit",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Run PHP CodeSniffer",
      "type": "shell",
      "command": "vendor/bin/phpcs --standard=WordPress .",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Fix PHP CodeSniffer Issues",
      "type": "shell",
      "command": "vendor/bin/phpcbf --standard=WordPress .",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Build Assets",
      "type": "shell",
      "command": "npm run build",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Watch Assets",
      "type": "shell",
      "command": "npm run watch",
      "group": "build",
      "isBackground": true,
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Generate POT File",
      "type": "shell",
      "command": "wp i18n make-pot . languages/my-plugin.pot",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Activate Plugin",
      "type": "shell",
      "command": "wp plugin activate my-plugin",
      "group": "none",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Deactivate Plugin",
      "type": "shell",
      "command": "wp plugin deactivate my-plugin",
      "group": "none",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "WordPress: Flush Rewrite Rules",
      "type": "shell",
      "command": "wp rewrite flush",
      "group": "none",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

---

## 3. Launch Configurations

### .vscode/launch.json

Configure debugging for WordPress plugins:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html/wp-content/plugins/my-plugin": "${workspaceFolder}"
      }
    },
    {
      "name": "Launch currently open script",
      "type": "php",
      "request": "launch",
      "program": "${file}",
      "cwd": "${fileDirname}",
      "port": 9003
    }
  ]
}
```

---

## 4. Code Snippets

### .vscode/wordpress.code-snippets

Create WordPress-specific code snippets:

```json
{
  "WordPress Plugin Header": {
    "prefix": "wp-plugin-header",
    "body": [
      "<?php",
      "/**",
      " * Plugin Name: ${1:Plugin Name}",
      " * Plugin URI: ${2:https://example.com/plugin}",
      " * Description: ${3:Plugin description}",
      " * Version: ${4:1.0.0}",
      " * Requires at least: ${5:5.8}",
      " * Requires PHP: ${6:7.4}",
      " * Author: ${7:Author Name}",
      " * Author URI: ${8:https://example.com}",
      " * License: ${9:GPL v2 or later}",
      " * License URI: ${10:https://www.gnu.org/licenses/gpl-2.0.html}",
      " * Text Domain: ${11:plugin-slug}",
      " * Domain Path: ${12:/languages}",
      " */",
      "",
      "// Exit if accessed directly",
      "if ( ! defined( 'ABSPATH' ) ) {",
      "\texit;",
      "}",
      "",
      "$0"
    ],
    "description": "WordPress plugin header"
  },

  "WordPress Action Hook": {
    "prefix": "wp-action",
    "body": [
      "add_action( '${1:hook_name}', '${2:callback_function}', ${3:10}, ${4:1} );",
      "",
      "function ${2:callback_function}( $${5:arg} ) {",
      "\t$0",
      "}"
    ],
    "description": "WordPress action hook"
  },

  "WordPress Filter Hook": {
    "prefix": "wp-filter",
    "body": [
      "add_filter( '${1:hook_name}', '${2:callback_function}', ${3:10}, ${4:1} );",
      "",
      "function ${2:callback_function}( $${5:value} ) {",
      "\t$0",
      "\treturn $${5:value};",
      "}"
    ],
    "description": "WordPress filter hook"
  },

  "WordPress Shortcode": {
    "prefix": "wp-shortcode",
    "body": [
      "add_shortcode( '${1:shortcode_name}', '${2:callback_function}' );",
      "",
      "function ${2:callback_function}( $atts, $content = null ) {",
      "\t$atts = shortcode_atts(",
      "\t\tarray(",
      "\t\t\t'${3:attribute}' => '${4:default_value}',",
      "\t\t),",
      "\t\t$atts,",
      "\t\t'${1:shortcode_name}'",
      "\t);",
      "",
      "\t$0",
      "",
      "\treturn $output;",
      "}"
    ],
    "description": "WordPress shortcode"
  },

  "WordPress AJAX Handler": {
    "prefix": "wp-ajax",
    "body": [
      "add_action( 'wp_ajax_${1:action_name}', '${2:callback_function}' );",
      "add_action( 'wp_ajax_nopriv_${1:action_name}', '${2:callback_function}' );",
      "",
      "function ${2:callback_function}() {",
      "\tcheck_ajax_referer( '${3:nonce_name}', 'nonce' );",
      "",
      "\t$0",
      "",
      "\twp_send_json_success( $data );",
      "}"
    ],
    "description": "WordPress AJAX handler"
  },

  "WordPress REST Endpoint": {
    "prefix": "wp-rest",
    "body": [
      "add_action( 'rest_api_init', '${1:register_endpoint}' );",
      "",
      "function ${1:register_endpoint}() {",
      "\tregister_rest_route(",
      "\t\t'${2:namespace}/v1',",
      "\t\t'/${3:route}',",
      "\t\tarray(",
      "\t\t\t'methods' => '${4:GET}',",
      "\t\t\t'callback' => '${5:callback_function}',",
      "\t\t\t'permission_callback' => '${6:permission_callback}',",
      "\t\t)",
      "\t);",
      "}",
      "",
      "function ${5:callback_function}( $request ) {",
      "\t$0",
      "\treturn rest_ensure_response( $data );",
      "}",
      "",
      "function ${6:permission_callback}() {",
      "\treturn current_user_can( 'edit_posts' );",
      "}"
    ],
    "description": "WordPress REST API endpoint"
  },

  "WordPress Custom Post Type": {
    "prefix": "wp-cpt",
    "body": [
      "add_action( 'init', '${1:register_post_type}' );",
      "",
      "function ${1:register_post_type}() {",
      "\t$labels = array(",
      "\t\t'name' => _x( '${2:Post Type}', 'Post type general name', '${3:textdomain}' ),",
      "\t\t'singular_name' => _x( '${4:Post}', 'Post type singular name', '${3:textdomain}' ),",
      "\t\t'menu_name' => _x( '${2:Post Type}', 'Admin Menu text', '${3:textdomain}' ),",
      "\t\t'add_new' => __( 'Add New', '${3:textdomain}' ),",
      "\t\t'add_new_item' => __( 'Add New ${4:Post}', '${3:textdomain}' ),",
      "\t\t'edit_item' => __( 'Edit ${4:Post}', '${3:textdomain}' ),",
      "\t\t'new_item' => __( 'New ${4:Post}', '${3:textdomain}' ),",
      "\t\t'view_item' => __( 'View ${4:Post}', '${3:textdomain}' ),",
      "\t\t'all_items' => __( 'All ${2:Post Type}', '${3:textdomain}' ),",
      "\t);",
      "",
      "\t$args = array(",
      "\t\t'labels' => $labels,",
      "\t\t'public' => true,",
      "\t\t'has_archive' => true,",
      "\t\t'show_in_rest' => true,",
      "\t\t'supports' => array( 'title', 'editor', 'thumbnail' ),",
      "\t);",
      "",
      "\tregister_post_type( '${5:post_type_slug}', $args );",
      "}"
    ],
    "description": "WordPress custom post type"
  },

  "WordPress Meta Box": {
    "prefix": "wp-metabox",
    "body": [
      "add_action( 'add_meta_boxes', '${1:add_meta_box}' );",
      "",
      "function ${1:add_meta_box}() {",
      "\tadd_meta_box(",
      "\t\t'${2:metabox_id}',",
      "\t\t__( '${3:Meta Box Title}', '${4:textdomain}' ),",
      "\t\t'${5:render_callback}',",
      "\t\t'${6:post}',",
      "\t\t'${7:normal}',",
      "\t\t'${8:default}'",
      "\t);",
      "}",
      "",
      "function ${5:render_callback}( $post ) {",
      "\twp_nonce_field( '${2:metabox_id}_nonce', '${2:metabox_id}_nonce' );",
      "\t$value = get_post_meta( $post->ID, '_${9:meta_key}', true );",
      "\t$0",
      "}",
      "",
      "add_action( 'save_post', '${10:save_meta_box}' );",
      "",
      "function ${10:save_meta_box}( $post_id ) {",
      "\tif ( ! isset( $_POST['${2:metabox_id}_nonce'] ) ) {",
      "\t\treturn;",
      "\t}",
      "",
      "\tif ( ! wp_verify_nonce( $_POST['${2:metabox_id}_nonce'], '${2:metabox_id}_nonce' ) ) {",
      "\t\treturn;",
      "\t}",
      "",
      "\tif ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {",
      "\t\treturn;",
      "\t}",
      "",
      "\tif ( ! current_user_can( 'edit_post', $post_id ) ) {",
      "\t\treturn;",
      "\t}",
      "",
      "\tif ( isset( $_POST['${9:meta_key}'] ) ) {",
      "\t\tupdate_post_meta( $post_id, '_${9:meta_key}', sanitize_text_field( $_POST['${9:meta_key}'] ) );",
      "\t}",
      "}"
    ],
    "description": "WordPress meta box"
  },

  "WordPress Enqueue Script": {
    "prefix": "wp-enqueue-script",
    "body": [
      "add_action( 'wp_enqueue_scripts', '${1:enqueue_scripts}' );",
      "",
      "function ${1:enqueue_scripts}() {",
      "\twp_enqueue_script(",
      "\t\t'${2:handle}',",
      "\t\tplugins_url( '${3:js/script.js}', __FILE__ ),",
      "\t\tarray( '${4:jquery}' ),",
      "\t\t'${5:1.0.0}',",
      "\t\ttrue",
      "\t);",
      "",
      "\twp_localize_script(",
      "\t\t'${2:handle}',",
      "\t\t'${6:objectName}',",
      "\t\tarray(",
      "\t\t\t'ajax_url' => admin_url( 'admin-ajax.php' ),",
      "\t\t\t'nonce' => wp_create_nonce( '${7:nonce_name}' ),",
      "\t\t)",
      "\t);",
      "}"
    ],
    "description": "WordPress enqueue script"
  },

  "WordPress Enqueue Style": {
    "prefix": "wp-enqueue-style",
    "body": [
      "add_action( 'wp_enqueue_scripts', '${1:enqueue_styles}' );",
      "",
      "function ${1:enqueue_styles}() {",
      "\twp_enqueue_style(",
      "\t\t'${2:handle}',",
      "\t\tplugins_url( '${3:css/style.css}', __FILE__ ),",
      "\t\tarray(),",
      "\t\t'${4:1.0.0}'",
      "\t);",
      "}"
    ],
    "description": "WordPress enqueue style"
  }
}
```

---

## 5. Recommended Extensions

### Essential Extensions

Install these VS Code extensions for WordPress development:

```json
{
  "recommendations": [
    "bmewburn.vscode-intelephense-client",
    "xdebug.php-debug",
    "wongjn.php-sniffer",
    "valeryanm.vscode-phpsab",
    "neilbrayfield.php-docblocker",
    "junstyle.php-cs-fixer",
    "wordpresstoolbox.wordpress-toolbox",
    "claudiosanches.woocommerce",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "bradlc.vscode-tailwindcss",
    "editorconfig.editorconfig",
    "mikestead.dotenv",
    "eamodio.gitlens"
  ]
}
```

Save this as `.vscode/extensions.json` in your plugin directory.

### Extension Configuration

#### Intelephense Settings

```json
{
  "intelephense.stubs": [
    "wordpress",
    "woocommerce",
    "acf-pro",
    "wordpress-globals",
    "wp-cli",
    "genesis",
    "polylang"
  ],
  "intelephense.environment.includePaths": [
    "/path/to/wordpress"
  ],
  "intelephense.files.maxSize": 5000000
}
```

#### PHP CodeSniffer Settings

```json
{
  "phpSniffer.standard": "WordPress",
  "phpSniffer.executablesFolder": "vendor/bin/",
  "phpSniffer.autoDetect": true,
  "phpSniffer.run": "onSave"
}
```

#### PHP CS Fixer Settings

```json
{
  "php-cs-fixer.executablePath": "${workspaceFolder}/vendor/bin/php-cs-fixer",
  "php-cs-fixer.onsave": true,
  "php-cs-fixer.rules": "@WordPress",
  "php-cs-fixer.config": ".php-cs-fixer.dist.php"
}
```

---

## 6. Context Menu Integrations

### Custom Context Menu Commands

Add to `.vscode/settings.json`:

```json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.php": "${capture}.test.php, ${capture}.spec.php",
    "*.js": "${capture}.min.js, ${capture}.map",
    "*.css": "${capture}.min.css, ${capture}.map",
    "package.json": "package-lock.json, yarn.lock, pnpm-lock.yaml",
    "composer.json": "composer.lock"
  }
}
```

---

## 7. Workspace Settings

### Complete .vscode/settings.json

Comprehensive VS Code settings for WordPress plugin development:

```json
{
  "editor.tabSize": 4,
  "editor.insertSpaces": false,
  "editor.detectIndentation": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },

  "[php]": {
    "editor.defaultFormatter": "bmewburn.vscode-intelephense-client",
    "editor.tabSize": 4,
    "editor.insertSpaces": false
  },

  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "editor.insertSpaces": true
  },

  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "editor.insertSpaces": true
  },

  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "editor.insertSpaces": true
  },

  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2,
    "editor.insertSpaces": true
  },

  "php.validate.executablePath": "/usr/bin/php",
  "php.suggest.basic": false,

  "intelephense.stubs": [
    "wordpress",
    "woocommerce"
  ],

  "phpSniffer.standard": "WordPress",
  "phpSniffer.executablesFolder": "vendor/bin/",

  "files.associations": {
    "*.php": "php"
  },

  "files.exclude": {
    "**/node_modules": true,
    "**/vendor": true
  },

  "search.exclude": {
    "**/node_modules": true,
    "**/vendor": true,
    "**/dist": true,
    "**/build": true
  },

  "emmet.includeLanguages": {
    "php": "html"
  }
}
```

---

## 8. Keyboard Shortcuts

### .vscode/keybindings.json

Custom keyboard shortcuts for WordPress development:

```json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "WordPress: Run PHPUnit Tests"
  },
  {
    "key": "ctrl+shift+c",
    "command": "workbench.action.tasks.runTask",
    "args": "WordPress: Run PHP CodeSniffer"
  },
  {
    "key": "ctrl+shift+f",
    "command": "workbench.action.tasks.runTask",
    "args": "WordPress: Fix PHP CodeSniffer Issues"
  },
  {
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "WordPress: Build Assets"
  }
]
```

---

## 9. Project Templates

### WordPress Plugin Workspace Template

Create a workspace file `.vscode/wordpress-plugin.code-workspace`:

```json
{
  "folders": [
    {
      "path": "."
    }
  ],
  "settings": {
    "files.associations": {
      "*.php": "php"
    },
    "intelephense.stubs": [
      "wordpress",
      "woocommerce"
    ],
    "phpSniffer.standard": "WordPress"
  },
  "extensions": {
    "recommendations": [
      "bmewburn.vscode-intelephense-client",
      "xdebug.php-debug",
      "wongjn.php-sniffer"
    ]
  }
}
```

---

## Summary

**Key VS Code configurations for WordPress plugin development:**

1. **File associations** - Proper syntax highlighting
2. **Tasks** - Automated build and test commands
3. **Snippets** - Quick code generation
4. **Extensions** - Enhanced development experience
5. **Debugging** - Xdebug integration
6. **Code quality** - PHP CodeSniffer integration
7. **Workspace settings** - Consistent formatting

**Quick setup:**

```bash
# Create .vscode directory
mkdir .vscode

# Copy configuration files
cp examples/vscode/settings.json .vscode/
cp examples/vscode/tasks.json .vscode/
cp examples/vscode/launch.json .vscode/
cp examples/vscode/extensions.json .vscode/
cp examples/vscode/wordpress.code-snippets .vscode/

# Install recommended extensions
code --install-extension bmewburn.vscode-intelephense-client
code --install-extension xdebug.php-debug
code --install-extension wongjn.php-sniffer
```


