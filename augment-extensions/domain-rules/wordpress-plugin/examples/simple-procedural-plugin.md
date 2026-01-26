# Simple Procedural Plugin Example

## Overview

This example demonstrates **Pattern 1: Simple Procedural Plugin** - the simplest WordPress plugin architecture for single-feature plugins, utility functions, and quick prototypes.

**Complexity**: Low  
**File Count**: 1-3 files  
**Team Size**: 1 developer  
**Use Case**: Single feature, utility functions, quick prototypes

---

## Complete Plugin Code

### Main Plugin File: `disable-comments-simple.php`

```php
<?php
/**
 * Plugin Name: Disable Comments Simple
 * Plugin URI: https://example.com/disable-comments-simple
 * Description: A simple plugin to disable comments site-wide with one click
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: disable-comments-simple
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('DCS_VERSION', '1.0.0');
define('DCS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DCS_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Disable comments and trackbacks site-wide
 */
function dcs_disable_comments_post_types_support() {
    $post_types = get_post_types();
    foreach ($post_types as $post_type) {
        if (post_type_supports($post_type, 'comments')) {
            remove_post_type_support($post_type, 'comments');
            remove_post_type_support($post_type, 'trackbacks');
        }
    }
}
add_action('init', 'dcs_disable_comments_post_types_support');

/**
 * Close comments on the front-end
 */
function dcs_disable_comments_status() {
    return false;
}
add_filter('comments_open', 'dcs_disable_comments_status', 20, 2);
add_filter('pings_open', 'dcs_disable_comments_status', 20, 2);

/**
 * Hide existing comments
 */
function dcs_disable_comments_hide_existing_comments($comments) {
    return array();
}
add_filter('comments_array', 'dcs_disable_comments_hide_existing_comments', 10, 2);

/**
 * Remove comments page in menu
 */
function dcs_disable_comments_admin_menu() {
    remove_menu_page('edit-comments.php');
}
add_action('admin_menu', 'dcs_disable_comments_admin_menu');

/**
 * Redirect any user trying to access comments page
 */
function dcs_disable_comments_admin_menu_redirect() {
    global $pagenow;
    if ($pagenow === 'edit-comments.php') {
        wp_safe_redirect(admin_url());
        exit;
    }
}
add_action('admin_init', 'dcs_disable_comments_admin_menu_redirect');

/**
 * Remove comments metabox from dashboard
 */
function dcs_disable_comments_dashboard() {
    remove_meta_box('dashboard_recent_comments', 'dashboard', 'normal');
}
add_action('admin_init', 'dcs_disable_comments_dashboard');

/**
 * Remove comments links from admin bar
 */
function dcs_disable_comments_admin_bar() {
    if (is_admin_bar_showing()) {
        remove_action('admin_bar_menu', 'wp_admin_bar_comments_menu', 60);
    }
}
add_action('init', 'dcs_disable_comments_admin_bar');

/**
 * Remove comment-reply script for themes that include it
 */
function dcs_disable_comments_remove_comment_reply() {
    wp_deregister_script('comment-reply');
}
add_action('wp_enqueue_scripts', 'dcs_disable_comments_remove_comment_reply');

/**
 * Add settings link on plugin page
 */
function dcs_add_settings_link($links) {
    $settings_link = '<a href="' . admin_url('options-general.php') . '">' . __('Settings', 'disable-comments-simple') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'dcs_add_settings_link');

/**
 * Display admin notice on activation
 */
function dcs_activation_notice() {
    if (get_transient('dcs_activation_notice')) {
        ?>
        <div class="notice notice-success is-dismissible">
            <p><?php _e('Comments have been disabled site-wide!', 'disable-comments-simple'); ?></p>
        </div>
        <?php
        delete_transient('dcs_activation_notice');
    }
}
add_action('admin_notices', 'dcs_activation_notice');

/**
 * Activation hook
 */
function dcs_activate() {
    set_transient('dcs_activation_notice', true, 5);
}
register_activation_hook(__FILE__, 'dcs_activate');

/**
 * Deactivation hook
 */
function dcs_deactivate() {
    // Clean up if needed
}
register_deactivation_hook(__FILE__, 'dcs_deactivate');
```

---

## WordPress.org readme.txt

### File: `readme.txt`

```
=== Disable Comments Simple ===
Contributors: yourusername
Tags: comments, disable comments, remove comments, spam
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Disable comments site-wide with one click. No configuration needed.

== Description ==

Disable Comments Simple is a lightweight plugin that completely disables comments on your WordPress site. Perfect for sites that don't need commenting functionality.

**Features:**

* Disables comments on all post types
* Hides existing comments from display
* Removes comments from admin menu
* Removes comments from admin bar
* Removes comment metabox from dashboard
* No configuration required - just activate!

**Why Use This Plugin?**

* Reduce spam and moderation overhead
* Improve site performance by removing comment queries
* Clean up admin interface
* Simple and lightweight (single file)

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/disable-comments-simple`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. That's it! Comments are now disabled site-wide

== Frequently Asked Questions ==

= Will this delete my existing comments? =

No, it only hides them from display. If you deactivate the plugin, comments will reappear.

= Can I enable comments on specific posts? =

Not with this simple version. This plugin disables comments site-wide.

= Does this work with custom post types? =

Yes, it disables comments on all post types including custom post types.

== Changelog ==

= 1.0.0 =
* Initial release
* Disable comments site-wide
* Remove comments from admin interface

== Upgrade Notice ==

= 1.0.0 =
Initial release.
```

---

## Uninstall Script (Optional)

### File: `uninstall.php`

```php
<?php
/**
 * Uninstall script for Disable Comments Simple
 *
 * @package Disable_Comments_Simple
 */

// Exit if accessed directly or not uninstalling
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Clean up options (if any were stored)
delete_option('dcs_settings');

// Clean up transients
delete_transient('dcs_activation_notice');

// Optional: Clean up comment metadata
// global $wpdb;
// $wpdb->query("DELETE FROM {$wpdb->commentmeta} WHERE meta_key LIKE 'dcs_%'");
```

---

## Directory Structure

```
disable-comments-simple/
├── disable-comments-simple.php    # Main plugin file (all code)
├── readme.txt                     # WordPress.org readme
└── uninstall.php                  # Optional uninstall cleanup
```

---

## Key Features Demonstrated

### 1. **Security Best Practices**

✅ **ABSPATH check**: Prevents direct file access
```php
if (!defined('ABSPATH')) {
    exit;
}
```

✅ **Proper escaping**: Uses WordPress translation functions
```php
__('Settings', 'disable-comments-simple')
```

✅ **Safe redirects**: Uses `wp_safe_redirect()`
```php
wp_safe_redirect(admin_url());
```

### 2. **WordPress Hooks**

✅ **Actions**: `init`, `admin_menu`, `admin_init`, `admin_notices`, `wp_enqueue_scripts`
✅ **Filters**: `comments_open`, `pings_open`, `comments_array`, `plugin_action_links_*`
✅ **Activation/Deactivation**: `register_activation_hook()`, `register_deactivation_hook()`

### 3. **WordPress APIs**

✅ **Post Types API**: `get_post_types()`, `post_type_supports()`, `remove_post_type_support()`
✅ **Admin API**: `remove_menu_page()`, `remove_meta_box()`, `admin_url()`
✅ **Transients API**: `set_transient()`, `get_transient()`, `delete_transient()`
✅ **Plugin API**: `plugin_basename()`, `plugin_dir_path()`, `plugin_dir_url()`

### 4. **Internationalization (i18n)**

✅ **Text Domain**: Defined in plugin header
✅ **Translation Functions**: `__()` for translatable strings
✅ **Domain Path**: `/languages` directory specified

---

## When to Use This Pattern

### ✅ Good Use Cases

- **Single feature plugins**: Disable comments, add custom CSS, redirect users
- **Utility functions**: Custom shortcodes, simple widgets
- **Quick prototypes**: Testing ideas before building complex plugins
- **Learning**: Understanding WordPress plugin basics
- **Micro-plugins**: Very specific, focused functionality

### ❌ Not Suitable For

- **Multiple features**: Use Organized Procedural (Pattern 2)
- **Complex logic**: Use Object-Oriented (Pattern 3)
- **Team collaboration**: Use WPPB (Pattern 4)
- **Extensibility needed**: Use Namespace-Based (Pattern 5)
- **Enterprise plugins**: Use Service Container (Pattern 6)

---

## Advantages

✅ **Simple**: All code in one file, easy to understand
✅ **Fast**: No autoloading, minimal overhead
✅ **Portable**: Single file, easy to share
✅ **Beginner-friendly**: Great for learning WordPress plugin development
✅ **Quick to develop**: No boilerplate, straight to functionality

---

## Limitations

❌ **Not scalable**: Hard to maintain as features grow
❌ **No separation of concerns**: All code mixed together
❌ **Hard to test**: No class structure for unit testing
❌ **No namespacing**: Risk of function name conflicts
❌ **Limited reusability**: Functions not easily reusable

---

## Best Practices for Simple Procedural Plugins

### 1. **Use Unique Function Prefixes**

Always prefix functions to avoid conflicts:
```php
// Good
function dcs_disable_comments() { }

// Bad
function disable_comments() { }  // Too generic
```

### 2. **Define Constants**

Use constants for version, paths, and URLs:
```php
define('DCS_VERSION', '1.0.0');
define('DCS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DCS_PLUGIN_URL', plugin_dir_url(__FILE__));
```

### 3. **Check ABSPATH**

Always prevent direct access:
```php
if (!defined('ABSPATH')) {
    exit;
}
```

### 4. **Use WordPress APIs**

Don't reinvent the wheel:
```php
// Good
wp_safe_redirect(admin_url());

// Bad
header('Location: /wp-admin/');  // Don't do this
```

### 5. **Sanitize and Escape**

Even simple plugins need security:
```php
// Sanitize input
$value = sanitize_text_field($_POST['value']);

// Escape output
echo esc_html($value);
```

### 6. **Use Activation/Deactivation Hooks**

Clean up after yourself:
```php
register_activation_hook(__FILE__, 'dcs_activate');
register_deactivation_hook(__FILE__, 'dcs_deactivate');
```

### 7. **Internationalization**

Make your plugin translatable:
```php
__('Text to translate', 'text-domain');
_e('Text to echo', 'text-domain');
```

---

## Testing the Plugin

### Manual Testing

1. **Install**: Copy to `wp-content/plugins/disable-comments-simple/`
2. **Activate**: Go to Plugins > Activate "Disable Comments Simple"
3. **Verify**: Check that comments are disabled on posts
4. **Admin**: Verify comments menu is removed
5. **Deactivate**: Verify comments reappear

### Checklist

- [ ] Plugin activates without errors
- [ ] Comments are disabled on all post types
- [ ] Existing comments are hidden
- [ ] Comments menu is removed from admin
- [ ] Admin bar comments link is removed
- [ ] Activation notice appears
- [ ] Settings link appears on plugins page
- [ ] Plugin deactivates cleanly
- [ ] Comments reappear after deactivation

---

## Extending This Plugin

If you need to add features, consider upgrading to **Pattern 2: Organized Procedural**:

```
disable-comments-simple/
├── disable-comments-simple.php    # Main file (loader)
├── includes/
│   ├── functions.php              # Core functions
│   ├── hooks.php                  # Hook callbacks
│   └── admin.php                  # Admin functions
├── readme.txt
└── uninstall.php
```

---

## Related Patterns

- **Pattern 2**: [Organized Procedural Plugin](organized-procedural-plugin.md) - For medium complexity
- **Pattern 3**: [Object-Oriented Plugin](object-oriented-plugin.md) - For complex plugins
- **Pattern 4**: [WPPB Plugin](wppb-plugin.md) - For professional plugins

---

## Additional Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [Plugin Security Best Practices](https://developer.wordpress.org/plugins/security/)
- [Internationalization](https://developer.wordpress.org/plugins/internationalization/)

---

## Summary

This simple procedural plugin demonstrates:

✅ Complete working plugin in a single file
✅ WordPress security best practices
✅ Proper use of hooks and filters
✅ WordPress APIs (Post Types, Admin, Transients, Plugin)
✅ Internationalization support
✅ Activation/deactivation hooks
✅ Clean, readable code structure

**Perfect for**: Single-feature plugins, utilities, prototypes, and learning WordPress plugin development.

**Next steps**: When your plugin grows beyond 200-300 lines, consider upgrading to Pattern 2 (Organized Procedural) for better code organization.

