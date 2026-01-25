# WordPress Plugin Activation, Deactivation, and Uninstall Hooks

## Overview

This document covers the proper implementation of plugin lifecycle hooks: activation, deactivation, and uninstall. These hooks are critical for setting up plugin requirements, cleaning up data, and ensuring a smooth user experience.

---

## Activation Hook

### Purpose

The activation hook runs **once** when the plugin is activated. Use it to:

- Create custom database tables
- Add default options
- Set up capabilities/roles
- Schedule cron events
- Flush rewrite rules
- Check system requirements

### Basic Implementation

```php
<?php
/**
 * Plugin Name: My Plugin
 */

// Register activation hook
register_activation_hook(__FILE__, 'my_plugin_activate');

function my_plugin_activate() {
    // Activation code here
    
    // Example: Add default options
    add_option('my_plugin_version', '1.0.0');
    add_option('my_plugin_settings', array(
        'enabled' => true,
        'api_key' => ''
    ));
    
    // Flush rewrite rules
    flush_rewrite_rules();
}
```

### Object-Oriented Implementation

```php
<?php
class My_Plugin_Activator {
    public static function activate() {
        self::create_tables();
        self::add_default_options();
        self::add_capabilities();
        self::schedule_cron();
        
        // Store activation timestamp
        update_option('my_plugin_activated_time', time());
    }
    
    private static function create_tables() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'my_plugin_data';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            data text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private static function add_default_options() {
        $defaults = array(
            'my_plugin_version' => '1.0.0',
            'my_plugin_settings' => array(
                'enabled' => true,
                'items_per_page' => 10
            )
        );
        
        foreach ($defaults as $key => $value) {
            add_option($key, $value);
        }
    }
    
    private static function add_capabilities() {
        $role = get_role('administrator');
        if ($role) {
            $role->add_cap('manage_my_plugin');
            $role->add_cap('edit_my_plugin_items');
        }
    }
    
    private static function schedule_cron() {
        if (!wp_next_scheduled('my_plugin_daily_task')) {
            wp_schedule_event(time(), 'daily', 'my_plugin_daily_task');
        }
    }
}

// Register hook
register_activation_hook(__FILE__, array('My_Plugin_Activator', 'activate'));
```

### System Requirements Check

```php
<?php
function my_plugin_activate() {
    // Check PHP version
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die('This plugin requires PHP 7.4 or higher.');
    }
    
    // Check WordPress version
    global $wp_version;
    if (version_compare($wp_version, '5.8', '<')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die('This plugin requires WordPress 5.8 or higher.');
    }
    
    // Check for required plugins
    if (!is_plugin_active('woocommerce/woocommerce.php')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die('This plugin requires WooCommerce to be installed and activated.');
    }
    
    // Check for required PHP extensions
    if (!extension_loaded('curl')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die('This plugin requires the PHP cURL extension.');
    }
    
    // All checks passed - proceed with activation
    my_plugin_setup();
}
```

### Multisite Activation

```php
<?php
function my_plugin_activate($network_wide) {
    if (is_multisite() && $network_wide) {
        // Network activation
        global $wpdb;
        
        // Get all blog IDs
        $blog_ids = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
        
        foreach ($blog_ids as $blog_id) {
            switch_to_blog($blog_id);
            my_plugin_activate_single_site();
            restore_current_blog();
        }
    } else {
        // Single site activation
        my_plugin_activate_single_site();
    }
}

function my_plugin_activate_single_site() {
    // Activation code for single site
    add_option('my_plugin_version', '1.0.0');
}

register_activation_hook(__FILE__, 'my_plugin_activate');
```

---

## Deactivation Hook

### Purpose

The deactivation hook runs when the plugin is deactivated. Use it to:

- Clear scheduled cron events
- Flush rewrite rules
- Clear transients/caches
- **DO NOT** delete user data or options

### Basic Implementation

```php
<?php
register_deactivation_hook(__FILE__, 'my_plugin_deactivate');

function my_plugin_deactivate() {
    // Clear scheduled events
    $timestamp = wp_next_scheduled('my_plugin_daily_task');
    if ($timestamp) {
        wp_unschedule_event($timestamp, 'my_plugin_daily_task');
    }
    
    // Flush rewrite rules
    flush_rewrite_rules();
    
    // Clear transients
    delete_transient('my_plugin_cache');
}
```

### Object-Oriented Implementation

```php
<?php
class My_Plugin_Deactivator {
    public static function deactivate() {
        self::clear_cron_jobs();
        self::flush_cache();
        self::flush_rewrite_rules();
        
        // Log deactivation
        update_option('my_plugin_deactivated_time', time());
    }
    
    private static function clear_cron_jobs() {
        $cron_hooks = array(
            'my_plugin_daily_task',
            'my_plugin_hourly_task',
            'my_plugin_cleanup_task'
        );

        foreach ($cron_hooks as $hook) {
            $timestamp = wp_next_scheduled($hook);
            if ($timestamp) {
                wp_unschedule_event($timestamp, $hook);
            }
        }
    }

    private static function flush_cache() {
        // Delete transients
        delete_transient('my_plugin_cache');
        delete_transient('my_plugin_api_response');

        // Clear object cache
        wp_cache_flush();
    }

    private static function flush_rewrite_rules() {
        flush_rewrite_rules();
    }
}

register_deactivation_hook(__FILE__, array('My_Plugin_Deactivator', 'deactivate'));
```

### What NOT to Do on Deactivation

❌ **DO NOT** delete user data
❌ **DO NOT** delete options/settings
❌ **DO NOT** drop database tables
❌ **DO NOT** remove user capabilities

**Reason**: Users may reactivate the plugin and expect their data to be intact.

---

## Uninstall Hook

### Purpose

The uninstall hook runs when the plugin is **deleted** (not just deactivated). Use it to:

- Delete all plugin options
- Drop custom database tables
- Remove custom capabilities
- Delete uploaded files
- Clean up everything

### Method 1: uninstall.php (Recommended)

Create a file named `uninstall.php` in the plugin root:

```php
<?php
/**
 * Uninstall script
 *
 * Runs when plugin is deleted via WordPress admin
 */

// Exit if accessed directly
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options
delete_option('my_plugin_version');
delete_option('my_plugin_settings');
delete_option('my_plugin_activated_time');
delete_option('my_plugin_deactivated_time');

// Delete transients
delete_transient('my_plugin_cache');

// Drop custom tables
global $wpdb;
$table_name = $wpdb->prefix . 'my_plugin_data';
$wpdb->query("DROP TABLE IF EXISTS $table_name");

// Remove capabilities
$role = get_role('administrator');
if ($role) {
    $role->remove_cap('manage_my_plugin');
    $role->remove_cap('edit_my_plugin_items');
}

// Delete uploaded files
$upload_dir = wp_upload_dir();
$plugin_upload_dir = $upload_dir['basedir'] . '/my-plugin';
if (is_dir($plugin_upload_dir)) {
    // Recursively delete directory
    array_map('unlink', glob("$plugin_upload_dir/*.*"));
    rmdir($plugin_upload_dir);
}

// Clear scheduled events (if any remain)
wp_clear_scheduled_hook('my_plugin_daily_task');
```

### Method 2: register_uninstall_hook()

```php
<?php
/**
 * Plugin Name: My Plugin
 */

// Register uninstall hook
register_uninstall_hook(__FILE__, 'my_plugin_uninstall');

function my_plugin_uninstall() {
    // Uninstall code here
    delete_option('my_plugin_version');
    delete_option('my_plugin_settings');

    global $wpdb;
    $table_name = $wpdb->prefix . 'my_plugin_data';
    $wpdb->query("DROP TABLE IF EXISTS $table_name");
}
```

### Object-Oriented Uninstall (uninstall.php)

```php
<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Load plugin classes
require_once plugin_dir_path(__FILE__) . 'includes/class-uninstaller.php';

// Run uninstall
My_Plugin_Uninstaller::uninstall();
```

**Uninstaller Class** (`includes/class-uninstaller.php`):

```php
<?php
class My_Plugin_Uninstaller {
    public static function uninstall() {
        self::delete_options();
        self::delete_transients();
        self::drop_tables();
        self::remove_capabilities();
        self::delete_files();
        self::clear_cron();
    }

    private static function delete_options() {
        $options = array(
            'my_plugin_version',
            'my_plugin_settings',
            'my_plugin_activated_time',
            'my_plugin_deactivated_time'
        );

        foreach ($options as $option) {
            delete_option($option);
        }
    }

    private static function delete_transients() {
        global $wpdb;

        // Delete all transients with plugin prefix
        $wpdb->query(
            "DELETE FROM $wpdb->options
             WHERE option_name LIKE '_transient_my_plugin_%'
             OR option_name LIKE '_transient_timeout_my_plugin_%'"
        );
    }

    private static function drop_tables() {
        global $wpdb;

        $tables = array(
            $wpdb->prefix . 'my_plugin_data',
            $wpdb->prefix . 'my_plugin_logs'
        );

        foreach ($tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS $table");
        }
    }

    private static function remove_capabilities() {
        $capabilities = array(
            'manage_my_plugin',
            'edit_my_plugin_items',
            'delete_my_plugin_items'
        );

        $roles = array('administrator', 'editor');

        foreach ($roles as $role_name) {
            $role = get_role($role_name);
            if ($role) {
                foreach ($capabilities as $cap) {
                    $role->remove_cap($cap);
                }
            }
        }
    }

    private static function delete_files() {
        $upload_dir = wp_upload_dir();
        $plugin_dir = $upload_dir['basedir'] . '/my-plugin';

        if (is_dir($plugin_dir)) {
            self::delete_directory($plugin_dir);
        }
    }

    private static function delete_directory($dir) {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), array('.', '..'));

        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? self::delete_directory($path) : unlink($path);
        }

        rmdir($dir);
    }

    private static function clear_cron() {
        wp_clear_scheduled_hook('my_plugin_daily_task');
        wp_clear_scheduled_hook('my_plugin_hourly_task');
    }
}
```

### Multisite Uninstall

```php
<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

if (is_multisite()) {
    global $wpdb;

    // Get all blog IDs
    $blog_ids = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");

    foreach ($blog_ids as $blog_id) {
        switch_to_blog($blog_id);
        my_plugin_uninstall_single_site();
        restore_current_blog();
    }

    // Delete network-wide options
    delete_site_option('my_plugin_network_settings');
} else {
    my_plugin_uninstall_single_site();
}

function my_plugin_uninstall_single_site() {
    // Delete options
    delete_option('my_plugin_version');
    delete_option('my_plugin_settings');

    // Drop tables
    global $wpdb;
    $table_name = $wpdb->prefix . 'my_plugin_data';
    $wpdb->query("DROP TABLE IF EXISTS $table_name");
}
```

---

## Database Table Management

### Creating Tables (Activation)

```php
<?php
function my_plugin_create_tables() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'my_plugin_data';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL,
        title varchar(255) NOT NULL,
        content longtext NOT NULL,
        status varchar(20) DEFAULT 'draft',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY status (status)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);

    // Store database version
    add_option('my_plugin_db_version', '1.0');
}
```

### Updating Tables (Version Check)

```php
<?php
function my_plugin_update_db_check() {
    $current_version = get_option('my_plugin_db_version', '0');
    $new_version = '1.1';

    if (version_compare($current_version, $new_version, '<')) {
        my_plugin_update_tables();
        update_option('my_plugin_db_version', $new_version);
    }
}
add_action('plugins_loaded', 'my_plugin_update_db_check');

function my_plugin_update_tables() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'my_plugin_data';

    // Add new column
    $wpdb->query("ALTER TABLE $table_name ADD COLUMN new_field varchar(100) DEFAULT NULL");
}
```

---

## Best Practices

### Activation

✅ Check system requirements (PHP, WordPress, extensions)
✅ Create database tables using `dbDelta()`
✅ Add default options with `add_option()` (not `update_option()`)
✅ Flush rewrite rules if registering custom post types/taxonomies
✅ Schedule cron events
✅ Store activation timestamp
✅ Check for multisite and handle accordingly

### Deactivation

✅ Clear scheduled cron events
✅ Flush rewrite rules
✅ Clear transients and caches
❌ **DO NOT** delete user data
❌ **DO NOT** delete options
❌ **DO NOT** drop tables

### Uninstall

✅ Use `uninstall.php` (preferred) or `register_uninstall_hook()`
✅ Delete ALL plugin options
✅ Drop ALL custom tables
✅ Remove ALL capabilities
✅ Delete ALL uploaded files
✅ Clear ALL scheduled events
✅ Handle multisite properly
✅ Be thorough - leave no trace

---

## Common Patterns

### Version-Based Activation

```php
<?php
function my_plugin_activate() {
    $current_version = get_option('my_plugin_version', '0');
    $new_version = '2.0.0';

    if (version_compare($current_version, $new_version, '<')) {
        // Upgrade from older version
        my_plugin_upgrade($current_version, $new_version);
    } else {
        // Fresh install
        my_plugin_fresh_install();
    }

    update_option('my_plugin_version', $new_version);
}

function my_plugin_upgrade($from, $to) {
    // Migration logic
    if (version_compare($from, '1.5.0', '<')) {
        // Migrate from < 1.5.0
    }

    if (version_compare($from, '2.0.0', '<')) {
        // Migrate from < 2.0.0
    }
}

function my_plugin_fresh_install() {
    // Fresh installation logic
    my_plugin_create_tables();
    my_plugin_add_default_options();
}
```

### Conditional Uninstall

```php
<?php
// uninstall.php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Check if user wants to keep data
$keep_data = get_option('my_plugin_keep_data_on_uninstall', false);

if (!$keep_data) {
    // Delete everything
    delete_option('my_plugin_version');
    delete_option('my_plugin_settings');

    global $wpdb;
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}my_plugin_data");
} else {
    // Keep data, just mark as uninstalled
    update_option('my_plugin_uninstalled', true);
}
```

---

## Security Considerations

### Activation

✅ Verify user capabilities before activation
✅ Validate system requirements
✅ Use nonces for AJAX activation
✅ Sanitize any user input during activation

### Uninstall

✅ Check `WP_UNINSTALL_PLUGIN` constant
✅ Verify user has permission to delete plugins
✅ Use `$wpdb->prepare()` for database queries
✅ Validate file paths before deletion

---

## Testing

### Test Activation

```php
<?php
// Test activation in different scenarios
function test_my_plugin_activation() {
    // Test fresh install
    delete_option('my_plugin_version');
    my_plugin_activate();
    assert(get_option('my_plugin_version') === '1.0.0');

    // Test upgrade
    update_option('my_plugin_version', '0.9.0');
    my_plugin_activate();
    assert(get_option('my_plugin_version') === '1.0.0');
}
```

### Test Uninstall

```php
<?php
// Test uninstall cleanup
function test_my_plugin_uninstall() {
    // Activate plugin
    my_plugin_activate();

    // Verify data exists
    assert(get_option('my_plugin_version') !== false);

    // Uninstall
    require_once 'uninstall.php';

    // Verify cleanup
    assert(get_option('my_plugin_version') === false);

    global $wpdb;
    $table_exists = $wpdb->get_var(
        "SHOW TABLES LIKE '{$wpdb->prefix}my_plugin_data'"
    );
    assert($table_exists === null);
}
```

---

## Troubleshooting

### Activation Errors

**Problem**: Plugin activates but doesn't create tables
**Solution**: Check `dbDelta()` syntax, ensure `upgrade.php` is included

**Problem**: Activation fails silently
**Solution**: Enable `WP_DEBUG` and check error logs

**Problem**: Multisite activation doesn't work
**Solution**: Check `$network_wide` parameter and use `switch_to_blog()`

### Uninstall Issues

**Problem**: `uninstall.php` doesn't run
**Solution**: Ensure file is in plugin root, check `WP_UNINSTALL_PLUGIN` constant

**Problem**: Data not fully deleted
**Solution**: Check for site-specific options in multisite, verify table names

---

## Summary

| Hook | When | Purpose | Delete Data? |
|------|------|---------|--------------|
| Activation | Plugin activated | Setup, create tables, add options | No |
| Deactivation | Plugin deactivated | Clear caches, unschedule cron | **NO** |
| Uninstall | Plugin deleted | Complete cleanup | **YES** |

**Golden Rule**: Only delete user data during uninstall, never during deactivation.

