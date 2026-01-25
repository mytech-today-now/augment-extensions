# Asset Management

## Overview

This guide covers WordPress plugin asset management including enqueueing scripts and styles, dependency management, versioning, conditional loading, inline scripts/styles, and build processes.

---

## Enqueuing Scripts

### Basic Script Enqueuing

```php
<?php
/**
 * Enqueue plugin scripts
 */
function my_plugin_enqueue_scripts() {
    wp_enqueue_script(
        'my-plugin-script',                              // Handle
        plugins_url( 'js/script.js', __FILE__ ),        // Source
        array( 'jquery' ),                               // Dependencies
        '1.0.0',                                         // Version
        true                                             // In footer
    );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_scripts' );
```

### Admin Scripts

```php
<?php
/**
 * Enqueue admin scripts
 */
function my_plugin_admin_scripts( $hook ) {
    // Only load on specific admin pages
    if ( 'settings_page_my-plugin' !== $hook ) {
        return;
    }
    
    wp_enqueue_script(
        'my-plugin-admin',
        plugins_url( 'admin/js/admin.js', __FILE__ ),
        array( 'jquery', 'wp-color-picker' ),
        '1.0.0',
        true
    );
}
add_action( 'admin_enqueue_scripts', 'my_plugin_admin_scripts' );
```

### Script Localization

```php
<?php
/**
 * Localize script with data
 */
function my_plugin_enqueue_with_data() {
    wp_enqueue_script(
        'my-plugin-ajax',
        plugins_url( 'js/ajax.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );
    
    wp_localize_script( 'my-plugin-ajax', 'myPluginData', array(
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'my_plugin_nonce' ),
        'strings' => array(
            'loading' => __( 'Loading...', 'my-plugin' ),
            'error'   => __( 'An error occurred', 'my-plugin' ),
        ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_with_data' );
```

---

## Enqueuing Styles

### Basic Style Enqueuing

```php
<?php
/**
 * Enqueue plugin styles
 */
function my_plugin_enqueue_styles() {
    wp_enqueue_style(
        'my-plugin-style',                               // Handle
        plugins_url( 'css/style.css', __FILE__ ),       // Source
        array(),                                         // Dependencies
        '1.0.0',                                         // Version
        'all'                                            // Media
    );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_styles' );
```

### Admin Styles

```php
<?php
/**
 * Enqueue admin styles
 */
function my_plugin_admin_styles( $hook ) {
    // Only load on plugin pages
    if ( strpos( $hook, 'my-plugin' ) === false ) {
        return;
    }
    
    wp_enqueue_style(
        'my-plugin-admin',
        plugins_url( 'admin/css/admin.css', __FILE__ ),
        array(),
        '1.0.0'
    );
}
add_action( 'admin_enqueue_scripts', 'my_plugin_admin_styles' );
```

### Media-Specific Styles

```php
<?php
// Print styles
wp_enqueue_style(
    'my-plugin-print',
    plugins_url( 'css/print.css', __FILE__ ),
    array(),
    '1.0.0',
    'print'
);

// Mobile styles
wp_enqueue_style(
    'my-plugin-mobile',
    plugins_url( 'css/mobile.css', __FILE__ ),
    array(),
    '1.0.0',
    '(max-width: 768px)'
);
```

---

## Dependency Management

### WordPress Core Dependencies

```php
<?php
// jQuery
wp_enqueue_script( 'my-script', $url, array( 'jquery' ), '1.0.0', true );

// jQuery UI
wp_enqueue_script( 'my-script', $url, array( 'jquery-ui-datepicker' ), '1.0.0', true );

// WordPress Media Uploader
wp_enqueue_media();
wp_enqueue_script( 'my-script', $url, array( 'jquery', 'media-upload' ), '1.0.0', true );

// Color Picker
wp_enqueue_style( 'wp-color-picker' );
wp_enqueue_script( 'my-script', $url, array( 'wp-color-picker' ), '1.0.0', true );

// CodeMirror
wp_enqueue_code_editor( array( 'type' => 'text/css' ) );
```

### Block Editor Dependencies

```php
<?php
/**
 * Enqueue block editor assets
 */
function my_plugin_block_editor_assets() {
    wp_enqueue_script(
        'my-plugin-blocks',
        plugins_url( 'build/blocks.js', __FILE__ ),
        array(
            'wp-blocks',
            'wp-element',
            'wp-editor',
            'wp-components',
            'wp-i18n',
        ),
        '1.0.0',
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_block_editor_assets' );
```

---

## Versioning

### Dynamic Versioning

```php
<?php
// Use plugin version constant
define( 'MY_PLUGIN_VERSION', '1.0.0' );

wp_enqueue_script(
    'my-plugin-script',
    plugins_url( 'js/script.js', __FILE__ ),
    array( 'jquery' ),
    MY_PLUGIN_VERSION,
    true
);

// Use file modification time for cache busting during development
$version = defined( 'WP_DEBUG' ) && WP_DEBUG
    ? filemtime( plugin_dir_path( __FILE__ ) . 'js/script.js' )
    : MY_PLUGIN_VERSION;

wp_enqueue_script(
    'my-plugin-script',
    plugins_url( 'js/script.js', __FILE__ ),
    array( 'jquery' ),
    $version,
    true
);
```

### Cache Busting

```php
<?php
/**
 * Get asset version with cache busting
 */
function my_plugin_get_asset_version( $file ) {
    $file_path = plugin_dir_path( __FILE__ ) . $file;

    if ( defined( 'WP_DEBUG' ) && WP_DEBUG && file_exists( $file_path ) ) {
        return filemtime( $file_path );
    }

    return MY_PLUGIN_VERSION;
}

wp_enqueue_script(
    'my-plugin-script',
    plugins_url( 'js/script.js', __FILE__ ),
    array( 'jquery' ),
    my_plugin_get_asset_version( 'js/script.js' ),
    true
);
```

---

## Conditional Loading

### Load Only Where Needed

```php
<?php
/**
 * Conditionally enqueue assets
 */
function my_plugin_conditional_assets() {
    // Only on single posts
    if ( is_single() ) {
        wp_enqueue_script( 'my-plugin-single', $url, array(), '1.0.0', true );
    }

    // Only on specific post type
    if ( is_singular( 'product' ) ) {
        wp_enqueue_script( 'my-plugin-product', $url, array(), '1.0.0', true );
    }

    // Only if shortcode is present
    global $post;
    if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'my_shortcode' ) ) {
        wp_enqueue_script( 'my-plugin-shortcode', $url, array(), '1.0.0', true );
    }

    // Only on specific page template
    if ( is_page_template( 'template-custom.php' ) ) {
        wp_enqueue_script( 'my-plugin-template', $url, array(), '1.0.0', true );
    }
}
add_action( 'wp_enqueue_scripts', 'my_plugin_conditional_assets' );
```

### Admin Page Specific

```php
<?php
/**
 * Load assets only on plugin admin pages
 */
function my_plugin_admin_conditional( $hook ) {
    // Only on plugin settings page
    if ( 'settings_page_my-plugin' === $hook ) {
        wp_enqueue_script( 'my-plugin-settings', $url, array(), '1.0.0', true );
    }

    // Only on post edit screen
    if ( 'post.php' === $hook || 'post-new.php' === $hook ) {
        wp_enqueue_script( 'my-plugin-post-editor', $url, array(), '1.0.0', true );
    }

    // Only on specific custom post type
    global $post_type;
    if ( 'product' === $post_type ) {
        wp_enqueue_script( 'my-plugin-product-admin', $url, array(), '1.0.0', true );
    }
}
add_action( 'admin_enqueue_scripts', 'my_plugin_admin_conditional' );
```

---

## Inline Scripts and Styles

### Inline JavaScript

```php
<?php
/**
 * Add inline script
 */
function my_plugin_inline_script() {
    wp_enqueue_script( 'my-plugin-script', $url, array(), '1.0.0', true );

    $inline_script = "
        const myPluginConfig = {
            apiUrl: '" . esc_js( rest_url( 'my-plugin/v1' ) ) . "',
            nonce: '" . wp_create_nonce( 'wp_rest' ) . "'
        };
    ";

    wp_add_inline_script( 'my-plugin-script', $inline_script, 'before' );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_inline_script' );
```

### Inline CSS

```php
<?php
/**
 * Add inline styles
 */
function my_plugin_inline_styles() {
    wp_enqueue_style( 'my-plugin-style', $url, array(), '1.0.0' );

    $custom_css = "
        .my-plugin-element {
            background-color: " . esc_attr( get_option( 'my_plugin_color', '#000000' ) ) . ";
        }
    ";

    wp_add_inline_style( 'my-plugin-style', $custom_css );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_inline_styles' );
```

---

## Build Processes

### npm/webpack Setup

**package.json**:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch",
    "lint:js": "eslint assets/src/js",
    "lint:css": "stylelint assets/src/css/**/*.css"
  },
  "devDependencies": {
    "@wordpress/scripts": "^26.0.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0"
  }
}
```

### WordPress Scripts

```json
{
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start",
    "lint:js": "wp-scripts lint-js",
    "lint:css": "wp-scripts lint-style"
  },
  "devDependencies": {
    "@wordpress/scripts": "^26.0.0"
  }
}
```

### Asset Dependencies (asset.php)

```php
<?php
/**
 * Enqueue with generated dependencies
 */
function my_plugin_enqueue_block_assets() {
    $asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

    wp_enqueue_script(
        'my-plugin-blocks',
        plugins_url( 'build/index.js', __FILE__ ),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );
}
add_action( 'enqueue_block_editor_assets', 'my_plugin_enqueue_block_assets' );
```

---

## Best Practices

### DO

✅ Always use `wp_enqueue_script()` and `wp_enqueue_style()`
✅ Specify dependencies correctly
✅ Use versioning for cache control
✅ Load scripts in footer when possible
✅ Conditionally load assets only where needed
✅ Use `wp_localize_script()` for passing data to JavaScript
✅ Minify assets in production
✅ Use WordPress core libraries when available

### DON'T

❌ Hard-code `<script>` or `<link>` tags
❌ Load assets on every page unnecessarily
❌ Forget to specify dependencies
❌ Use inline scripts for large code blocks
❌ Load unminified assets in production
❌ Include jQuery or other core libraries manually

---

## Performance Optimization

### Defer and Async

```php
<?php
/**
 * Add defer attribute to script
 */
function my_plugin_defer_script( $tag, $handle, $src ) {
    if ( 'my-plugin-script' === $handle ) {
        return str_replace( ' src', ' defer src', $tag );
    }
    return $tag;
}
add_filter( 'script_loader_tag', 'my_plugin_defer_script', 10, 3 );

/**
 * Add async attribute to script
 */
function my_plugin_async_script( $tag, $handle, $src ) {
    if ( 'my-plugin-analytics' === $handle ) {
        return str_replace( ' src', ' async src', $tag );
    }
    return $tag;
}
add_filter( 'script_loader_tag', 'my_plugin_async_script', 10, 3 );
```

### Preloading Assets

```php
<?php
/**
 * Preload critical assets
 */
function my_plugin_preload_assets() {
    echo '<link rel="preload" href="' . esc_url( plugins_url( 'css/critical.css', __FILE__ ) ) . '" as="style">';
    echo '<link rel="preload" href="' . esc_url( plugins_url( 'js/critical.js', __FILE__ ) ) . '" as="script">';
}
add_action( 'wp_head', 'my_plugin_preload_assets', 1 );
```

---

## Common Patterns

### Enqueue Class

```php
<?php
class My_Plugin_Assets {
    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_public' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin' ) );
    }

    public function enqueue_public() {
        wp_enqueue_style(
            'my-plugin-public',
            plugins_url( 'css/public.css', dirname( __FILE__ ) ),
            array(),
            MY_PLUGIN_VERSION
        );

        wp_enqueue_script(
            'my-plugin-public',
            plugins_url( 'js/public.js', dirname( __FILE__ ) ),
            array( 'jquery' ),
            MY_PLUGIN_VERSION,
            true
        );
    }

    public function enqueue_admin( $hook ) {
        if ( 'settings_page_my-plugin' !== $hook ) {
            return;
        }

        wp_enqueue_style(
            'my-plugin-admin',
            plugins_url( 'css/admin.css', dirname( __FILE__ ) ),
            array(),
            MY_PLUGIN_VERSION
        );
    }
}

new My_Plugin_Assets();
```

---

## Resources

- [WordPress Script/Style Enqueuing](https://developer.wordpress.org/plugins/javascript/enqueuing/)
- [@wordpress/scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)
- [WordPress Dependency Extraction](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dependency-extraction-webpack-plugin/)


