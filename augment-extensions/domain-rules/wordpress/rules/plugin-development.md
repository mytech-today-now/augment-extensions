# WordPress Plugin Development Workflow

## Overview

This document provides step-by-step workflows for WordPress plugin development, from basic plugins to complex functionality.

## Workflow 1: Create Custom Plugin

### Step 1: Initialize Plugin Structure

```bash
# Create plugin directory
mkdir wp-content/plugins/my-plugin
cd wp-content/plugins/my-plugin

# Create directory structure
mkdir includes admin public assets assets/css assets/js languages
```

### Step 2: Create Main Plugin File

**my-plugin.php**:
```php
<?php
/**
 * Plugin Name: My Plugin
 * Plugin URI: https://example.com/my-plugin
 * Description: A custom WordPress plugin
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Your Name
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

// Define plugin constants
define( 'MY_PLUGIN_VERSION', '1.0.0' );
define( 'MY_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'MY_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include core files
require_once MY_PLUGIN_PATH . 'includes/class-my-plugin.php';

/**
 * Initialize the plugin
 */
function my_plugin_init() {
    $plugin = new My_Plugin();
    $plugin->run();
}
add_action( 'plugins_loaded', 'my_plugin_init' );

/**
 * Activation hook
 */
function my_plugin_activate() {
    // Create database tables, add options, etc.
    require_once MY_PLUGIN_PATH . 'includes/class-activator.php';
    My_Plugin_Activator::activate();
}
register_activation_hook( __FILE__, 'my_plugin_activate' );

/**
 * Deactivation hook
 */
function my_plugin_deactivate() {
    // Clean up temporary data
    require_once MY_PLUGIN_PATH . 'includes/class-deactivator.php';
    My_Plugin_Deactivator::deactivate();
}
register_deactivation_hook( __FILE__, 'my_plugin_deactivate' );
```

### Step 3: Create Core Plugin Class

**includes/class-my-plugin.php**:
```php
<?php
/**
 * Core plugin class
 */
class My_Plugin {
    
    /**
     * Plugin version
     */
    const VERSION = '1.0.0';
    
    /**
     * Initialize the plugin
     */
    public function run() {
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }
    
    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        require_once MY_PLUGIN_PATH . 'admin/class-admin.php';
        require_once MY_PLUGIN_PATH . 'public/class-public.php';
    }
    
    /**
     * Register admin hooks
     */
    private function define_admin_hooks() {
        $admin = new My_Plugin_Admin();
        
        add_action( 'admin_enqueue_scripts', array( $admin, 'enqueue_styles' ) );
        add_action( 'admin_enqueue_scripts', array( $admin, 'enqueue_scripts' ) );
        add_action( 'admin_menu', array( $admin, 'add_admin_menu' ) );
    }
    
    /**
     * Register public hooks
     */
    private function define_public_hooks() {
        $public = new My_Plugin_Public();
        
        add_action( 'wp_enqueue_scripts', array( $public, 'enqueue_styles' ) );
        add_action( 'wp_enqueue_scripts', array( $public, 'enqueue_scripts' ) );
    }
}
```

### Step 4: Create Admin Class

**admin/class-admin.php**:
```php
<?php
/**
 * Admin-specific functionality
 */
class My_Plugin_Admin {
    
    /**
     * Enqueue admin styles
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            'my-plugin-admin',
            MY_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            MY_PLUGIN_VERSION
        );
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'my-plugin-admin',
            MY_PLUGIN_URL . 'assets/js/admin.js',
            array( 'jquery' ),
            MY_PLUGIN_VERSION,
            true
        );
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __( 'My Plugin', 'my-plugin' ),
            __( 'My Plugin', 'my-plugin' ),
            'manage_options',
            'my-plugin',
            array( $this, 'display_admin_page' ),
            'dashicons-admin-generic',
            30
        );
    }
    
    /**
     * Display admin page
     */
    public function display_admin_page() {
        // Check user capabilities
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields( 'my_plugin_options' );
                do_settings_sections( 'my-plugin' );
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}
```

### Step 5: Create Public Class

**public/class-public.php**:
```php
<?php
/**
 * Public-facing functionality
 */
class My_Plugin_Public {
    
    /**
     * Enqueue public styles
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            'my-plugin-public',
            MY_PLUGIN_URL . 'assets/css/public.css',
            array(),
            MY_PLUGIN_VERSION
        );
    }
    
    /**
     * Enqueue public scripts
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'my-plugin-public',
            MY_PLUGIN_URL . 'assets/js/public.js',
            array( 'jquery' ),
            MY_PLUGIN_VERSION,
            true
        );
    }
}
```

### Step 6: Create Uninstall Script

**uninstall.php**:
```php
<?php
/**
 * Fired when the plugin is uninstalled
 */

// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Delete plugin options
delete_option( 'my_plugin_option' );

// Delete custom database tables
global $wpdb;
$table_name = $wpdb->prefix . 'my_plugin_table';
$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" );

// Clear scheduled hooks
wp_clear_scheduled_hook( 'my_plugin_cron_hook' );

// Delete transients
delete_transient( 'my_plugin_transient' );
```

## Workflow 2: Add Custom Post Type

### Step 1: Register Custom Post Type

**includes/class-post-types.php**:
```php
<?php
/**
 * Register custom post types
 */
class My_Plugin_Post_Types {
    
    /**
     * Initialize
     */
    public function init() {
        add_action( 'init', array( $this, 'register_book_post_type' ) );
    }
    
    /**
     * Register Book post type
     */
    public function register_book_post_type() {
        $labels = array(
            'name'               => __( 'Books', 'my-plugin' ),
            'singular_name'      => __( 'Book', 'my-plugin' ),
            'add_new'            => __( 'Add New', 'my-plugin' ),
            'add_new_item'       => __( 'Add New Book', 'my-plugin' ),
            'edit_item'          => __( 'Edit Book', 'my-plugin' ),
            'new_item'           => __( 'New Book', 'my-plugin' ),
            'view_item'          => __( 'View Book', 'my-plugin' ),
            'search_items'       => __( 'Search Books', 'my-plugin' ),
            'not_found'          => __( 'No books found', 'my-plugin' ),
            'not_found_in_trash' => __( 'No books found in Trash', 'my-plugin' ),
            'menu_name'          => __( 'Books', 'my-plugin' ),
        );
        
        $args = array(
            'labels'              => $labels,
            'public'              => true,
            'publicly_queryable'  => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'query_var'           => true,
            'rewrite'             => array( 'slug' => 'book' ),
            'capability_type'     => 'post',
            'has_archive'         => true,
            'hierarchical'        => false,
            'menu_position'       => 20,
            'menu_icon'           => 'dashicons-book',
            'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
            'show_in_rest'        => true, // Enable Gutenberg editor
        );
        
        register_post_type( 'book', $args );
    }
}
```

### Step 2: Register Custom Taxonomy

```php
/**
 * Register Genre taxonomy
 */
public function register_genre_taxonomy() {
    $labels = array(
        'name'              => __( 'Genres', 'my-plugin' ),
        'singular_name'     => __( 'Genre', 'my-plugin' ),
        'search_items'      => __( 'Search Genres', 'my-plugin' ),
        'all_items'         => __( 'All Genres', 'my-plugin' ),
        'parent_item'       => __( 'Parent Genre', 'my-plugin' ),
        'parent_item_colon' => __( 'Parent Genre:', 'my-plugin' ),
        'edit_item'         => __( 'Edit Genre', 'my-plugin' ),
        'update_item'       => __( 'Update Genre', 'my-plugin' ),
        'add_new_item'      => __( 'Add New Genre', 'my-plugin' ),
        'new_item_name'     => __( 'New Genre Name', 'my-plugin' ),
        'menu_name'         => __( 'Genres', 'my-plugin' ),
    );
    
    $args = array(
        'labels'            => $labels,
        'hierarchical'      => true,
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'genre' ),
        'show_in_rest'      => true,
    );
    
    register_taxonomy( 'genre', array( 'book' ), $args );
}
```

## Workflow 3: Add Settings Page

### Step 1: Register Settings

```php
/**
 * Register plugin settings
 */
public function register_settings() {
    // Register setting
    register_setting(
        'my_plugin_options',
        'my_plugin_option',
        array(
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => '',
        )
    );
    
    // Add settings section
    add_settings_section(
        'my_plugin_section',
        __( 'General Settings', 'my-plugin' ),
        array( $this, 'section_callback' ),
        'my-plugin'
    );
    
    // Add settings field
    add_settings_field(
        'my_plugin_field',
        __( 'Option Name', 'my-plugin' ),
        array( $this, 'field_callback' ),
        'my-plugin',
        'my_plugin_section'
    );
}
add_action( 'admin_init', 'register_settings' );

/**
 * Section callback
 */
public function section_callback() {
    echo '<p>' . esc_html__( 'Configure your plugin settings below.', 'my-plugin' ) . '</p>';
}

/**
 * Field callback
 */
public function field_callback() {
    $value = get_option( 'my_plugin_option', '' );
    echo '<input type="text" name="my_plugin_option" value="' . esc_attr( $value ) . '" class="regular-text" />';
}
```

## Security Best Practices

### Input Sanitization

```php
// Sanitize text field
$clean_text = sanitize_text_field( $_POST['field'] );

// Sanitize email
$clean_email = sanitize_email( $_POST['email'] );

// Sanitize URL
$clean_url = esc_url_raw( $_POST['url'] );

// Sanitize textarea
$clean_textarea = sanitize_textarea_field( $_POST['textarea'] );
```

### Output Escaping

```php
// Escape HTML
echo esc_html( $text );

// Escape attributes
echo '<div class="' . esc_attr( $class ) . '">';

// Escape URLs
echo '<a href="' . esc_url( $url ) . '">';

// Escape JavaScript
echo '<script>var data = ' . wp_json_encode( $data ) . ';</script>';
```

### Nonce Verification

```php
// Create nonce
wp_nonce_field( 'my_plugin_action', 'my_plugin_nonce' );

// Verify nonce
if ( ! isset( $_POST['my_plugin_nonce'] ) || ! wp_verify_nonce( $_POST['my_plugin_nonce'], 'my_plugin_action' ) ) {
    wp_die( __( 'Security check failed', 'my-plugin' ) );
}
```

### Capability Checks

```php
// Check user capability
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( __( 'You do not have sufficient permissions', 'my-plugin' ) );
}
```

## Best Practices

### DO

✅ Use WordPress coding standards  
✅ Sanitize all input  
✅ Escape all output  
✅ Use nonces for form submissions  
✅ Check user capabilities  
✅ Use prepared statements for database queries  
✅ Prefix all functions, classes, and database tables  
✅ Use translation functions  
✅ Enqueue scripts and styles properly  
✅ Provide uninstall.php for cleanup

### DON'T

❌ Trust user input  
❌ Use deprecated functions  
❌ Modify WordPress core  
❌ Use global namespace  
❌ Hardcode database table names  
❌ Include plugin functionality in themes  
❌ Use `eval()` or similar dangerous functions  
❌ Ignore error handling  
❌ Skip documentation

