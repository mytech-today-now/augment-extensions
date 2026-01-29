# PHP CMS Integration Best Practices

## Overview

This guide provides best practices for developing WordPress and Drupal plugins/modules, including hooks, filters, security, database interactions, and CMS-specific patterns.

## WordPress Development

### Plugin Structure

```php
<?php
/**
 * Plugin Name: My Custom Plugin
 * Plugin URI: https://example.com/my-plugin
 * Description: A custom WordPress plugin
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * Text Domain: my-custom-plugin
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MY_PLUGIN_VERSION', '1.0.0');
define('MY_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('MY_PLUGIN_URL', plugin_dir_url(__FILE__));

// Autoloader
require_once MY_PLUGIN_PATH . 'includes/class-my-plugin.php';

// Initialize plugin
function my_plugin_init() {
    $plugin = new My_Plugin();
    $plugin->run();
}
add_action('plugins_loaded', 'my_plugin_init');

// Activation hook
register_activation_hook(__FILE__, 'my_plugin_activate');
function my_plugin_activate() {
    // Create database tables, set default options, etc.
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'my_plugin_deactivate');
function my_plugin_deactivate() {
    flush_rewrite_rules();
}
```

### Hooks and Filters

#### Actions

```php
<?php

// Add custom action
add_action('init', 'my_custom_init_function');
function my_custom_init_function() {
    // Register custom post types, taxonomies, etc.
}

// Admin menu
add_action('admin_menu', 'my_plugin_add_admin_menu');
function my_plugin_add_admin_menu() {
    add_menu_page(
        'My Plugin',           // Page title
        'My Plugin',           // Menu title
        'manage_options',      // Capability
        'my-plugin',           // Menu slug
        'my_plugin_admin_page', // Callback
        'dashicons-admin-generic', // Icon
        20                     // Position
    );
}

// Enqueue scripts and styles
add_action('wp_enqueue_scripts', 'my_plugin_enqueue_assets');
function my_plugin_enqueue_assets() {
    wp_enqueue_style(
        'my-plugin-style',
        MY_PLUGIN_URL . 'assets/css/style.css',
        [],
        MY_PLUGIN_VERSION
    );
    
    wp_enqueue_script(
        'my-plugin-script',
        MY_PLUGIN_URL . 'assets/js/script.js',
        ['jquery'],
        MY_PLUGIN_VERSION,
        true
    );
    
    // Localize script
    wp_localize_script('my-plugin-script', 'myPluginData', [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('my-plugin-nonce')
    ]);
}

// Save post hook
add_action('save_post', 'my_plugin_save_post_meta', 10, 2);
function my_plugin_save_post_meta($post_id, $post) {
    // Verify nonce
    if (!isset($_POST['my_plugin_nonce']) || 
        !wp_verify_nonce($_POST['my_plugin_nonce'], 'my_plugin_save')) {
        return;
    }
    
    // Check autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Check permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Save meta
    if (isset($_POST['my_custom_field'])) {
        update_post_meta(
            $post_id,
            '_my_custom_field',
            sanitize_text_field($_POST['my_custom_field'])
        );
    }
}
```

#### Filters

```php
<?php

// Modify content
add_filter('the_content', 'my_plugin_modify_content');
function my_plugin_modify_content($content) {
    if (is_single()) {
        $custom_content = '<div class="custom-notice">Custom notice</div>';
        $content = $custom_content . $content;
    }
    return $content;
}

// Modify query
add_filter('pre_get_posts', 'my_plugin_modify_query');
function my_plugin_modify_query($query) {
    if (!is_admin() && $query->is_main_query() && $query->is_home()) {
        $query->set('posts_per_page', 20);
    }
    return $query;
}

// Add custom body class
add_filter('body_class', 'my_plugin_body_class');
function my_plugin_body_class($classes) {
    if (is_page('special-page')) {
        $classes[] = 'special-page-class';
    }
    return $classes;
}
```

### Custom Post Types

```php
<?php

add_action('init', 'my_plugin_register_post_type');
function my_plugin_register_post_type() {
    register_post_type('book', [
        'labels' => [
            'name' => __('Books', 'my-plugin'),
            'singular_name' => __('Book', 'my-plugin'),
            'add_new' => __('Add New Book', 'my-plugin'),
            'add_new_item' => __('Add New Book', 'my-plugin'),
            'edit_item' => __('Edit Book', 'my-plugin'),
        ],
        'public' => true,
        'has_archive' => true,
        'rewrite' => ['slug' => 'books'],
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt'],
        'menu_icon' => 'dashicons-book',
        'show_in_rest' => true, // Enable Gutenberg
    ]);
}
```

### WP_Query

```php
<?php

// Basic query
$args = [
    'post_type' => 'post',
    'posts_per_page' => 10,
    'orderby' => 'date',
    'order' => 'DESC',
];

$query = new WP_Query($args);

if ($query->have_posts()) {
    while ($query->have_posts()) {
        $query->the_post();
        the_title('<h2>', '</h2>');
        the_excerpt();
    }
    wp_reset_postdata();
} else {
    echo '<p>No posts found.</p>';
}

// Advanced query with meta
$args = [
    'post_type' => 'book',
    'meta_query' => [
        'relation' => 'AND',
        [
            'key' => '_price',
            'value' => 20,
            'compare' => '>=',
            'type' => 'NUMERIC'
        ],
        [
            'key' => '_in_stock',
            'value' => '1',
            'compare' => '='
        ]
    ],
    'tax_query' => [
        [
            'taxonomy' => 'genre',
            'field' => 'slug',
            'terms' => 'fiction'
        ]
    ]
];

$query = new WP_Query($args);
```

### Shortcodes

```php
<?php

// Register shortcode
add_shortcode('my_shortcode', 'my_shortcode_handler');
function my_shortcode_handler($atts, $content = null) {
    // Parse attributes
    $atts = shortcode_atts([
        'title' => 'Default Title',
        'count' => 5,
        'type' => 'post'
    ], $atts, 'my_shortcode');

    // Sanitize
    $title = sanitize_text_field($atts['title']);
    $count = absint($atts['count']);
    $type = sanitize_key($atts['type']);

    // Build output
    ob_start();
    ?>
    <div class="my-shortcode">
        <h3><?php echo esc_html($title); ?></h3>
        <?php
        $query = new WP_Query([
            'post_type' => $type,
            'posts_per_page' => $count
        ]);

        if ($query->have_posts()) {
            echo '<ul>';
            while ($query->have_posts()) {
                $query->the_post();
                echo '<li>' . get_the_title() . '</li>';
            }
            echo '</ul>';
            wp_reset_postdata();
        }
        ?>
    </div>
    <?php
    return ob_get_clean();
}

// Usage: [my_shortcode title="Recent Posts" count="10" type="post"]
```

### AJAX Handling

```php
<?php

// Register AJAX handlers
add_action('wp_ajax_my_ajax_action', 'my_ajax_handler');
add_action('wp_ajax_nopriv_my_ajax_action', 'my_ajax_handler');

function my_ajax_handler() {
    // Verify nonce
    check_ajax_referer('my-plugin-nonce', 'nonce');

    // Get data
    $data = isset($_POST['data']) ? sanitize_text_field($_POST['data']) : '';

    // Process
    $result = process_data($data);

    // Return JSON
    if ($result) {
        wp_send_json_success([
            'message' => 'Success',
            'data' => $result
        ]);
    } else {
        wp_send_json_error([
            'message' => 'Error processing data'
        ]);
    }
}
```

### Security Best Practices

#### Nonce Verification

```php
<?php

// Create nonce
$nonce = wp_create_nonce('my-action');

// Verify nonce in form submission
if (!isset($_POST['my_nonce']) || !wp_verify_nonce($_POST['my_nonce'], 'my-action')) {
    wp_die('Security check failed');
}

// Verify nonce in AJAX
check_ajax_referer('my-ajax-action', 'nonce');

// Verify nonce in URL
if (!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce'], 'my-action')) {
    wp_die('Security check failed');
}
```

#### Data Sanitization

```php
<?php

// Sanitize text
$text = sanitize_text_field($_POST['text']);

// Sanitize email
$email = sanitize_email($_POST['email']);

// Sanitize URL
$url = esc_url_raw($_POST['url']);

// Sanitize HTML
$html = wp_kses_post($_POST['content']);

// Sanitize key
$key = sanitize_key($_POST['key']);

// Sanitize file name
$filename = sanitize_file_name($_FILES['file']['name']);

// Sanitize SQL for LIKE
$search = $wpdb->esc_like($_POST['search']);
```

#### Output Escaping

```php
<?php

// Escape HTML
echo esc_html($text);

// Escape attributes
echo '<input type="text" value="' . esc_attr($value) . '">';

// Escape URL
echo '<a href="' . esc_url($url) . '">Link</a>';

// Escape JavaScript
echo '<script>var data = "' . esc_js($data) . '";</script>';

// Escape textarea
echo '<textarea>' . esc_textarea($content) . '</textarea>';
```

#### Capability Checks

```php
<?php

// Check if user can edit posts
if (!current_user_can('edit_posts')) {
    wp_die('You do not have permission');
}

// Check if user can manage options
if (!current_user_can('manage_options')) {
    return;
}

// Check if user can edit specific post
if (!current_user_can('edit_post', $post_id)) {
    wp_die('You cannot edit this post');
}
```

## Drupal Development

### Module Structure

```php
<?php

// my_module.info.yml
name: My Module
type: module
description: 'A custom Drupal module'
core_version_requirement: ^9 || ^10
package: Custom
dependencies:
  - drupal:node
  - drupal:user
```

### Hooks

```php
<?php

/**
 * Implements hook_help().
 */
function my_module_help($route_name, RouteMatchInterface $route_match) {
    switch ($route_name) {
        case 'help.page.my_module':
            return '<p>' . t('Help text for my module.') . '</p>';
    }
}

/**
 * Implements hook_node_presave().
 */
function my_module_node_presave(NodeInterface $node) {
    if ($node->getType() == 'article') {
        // Modify node before saving
        $node->setTitle('Modified: ' . $node->getTitle());
    }
}

/**
 * Implements hook_form_alter().
 */
function my_module_form_alter(&$form, FormStateInterface $form_state, $form_id) {
    if ($form_id == 'node_article_form') {
        $form['title']['#description'] = t('Custom description');
    }
}
```

### Services

```php
<?php

namespace Drupal\my_module\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;

class MyService {

    protected $database;
    protected $logger;

    public function __construct(
        Connection $database,
        LoggerChannelFactoryInterface $logger_factory
    ) {
        $this->database = $database;
        $this->logger = $logger_factory->get('my_module');
    }

    public function processData($data) {
        try {
            // Process data
            $this->logger->info('Data processed successfully');
            return true;
        } catch (\Exception $e) {
            $this->logger->error('Error: @message', ['@message' => $e->getMessage()]);
            return false;
        }
    }
}
```

## Best Practices

### ✅ DO

- Use WordPress/Drupal coding standards
- Verify nonces for all form submissions
- Sanitize all input data
- Escape all output data
- Check user capabilities before operations
- Use translation functions for all strings
- Prefix all function/class names
- Use hooks and filters instead of modifying core
- Follow semantic versioning
- Document code with PHPDoc
- Use prepared statements for database queries
- Implement proper error handling

### ❌ DON'T

- Modify core files
- Use global variables unnecessarily
- Trust user input
- Output unescaped data
- Hardcode database table names
- Use deprecated functions
- Ignore coding standards
- Skip nonce verification
- Use direct database queries without sanitization
- Suppress errors in production

## Security Checklist

- [ ] Nonce verification on all forms
- [ ] Input sanitization
- [ ] Output escaping
- [ ] Capability checks
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Secure AJAX handlers
- [ ] Proper error handling (no sensitive data exposure)

