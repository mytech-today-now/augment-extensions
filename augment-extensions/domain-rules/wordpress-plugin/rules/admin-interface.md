# WordPress Plugin Admin Interface

## Overview

This document covers creating admin interfaces for WordPress plugins, including settings pages, meta boxes, admin notices, list tables, and dashboard widgets.

---

## Settings Pages

### Adding a Top-Level Menu

```php
<?php
add_action('admin_menu', 'my_plugin_add_admin_menu');

function my_plugin_add_admin_menu() {
    add_menu_page(
        'My Plugin Settings',           // Page title
        'My Plugin',                    // Menu title
        'manage_options',               // Capability
        'my-plugin',                    // Menu slug
        'my_plugin_settings_page',      // Callback function
        'dashicons-admin-generic',      // Icon
        20                              // Position
    );
}

function my_plugin_settings_page() {
    // Check user capabilities
    if (!current_user_can('manage_options')) {
        return;
    }
    
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            settings_fields('my_plugin_options');
            do_settings_sections('my-plugin');
            submit_button('Save Settings');
            ?>
        </form>
    </div>
    <?php
}
```

### Adding a Submenu Page

```php
<?php
add_action('admin_menu', 'my_plugin_add_submenu');

function my_plugin_add_submenu() {
    // Add to Settings menu
    add_options_page(
        'My Plugin Settings',           // Page title
        'My Plugin',                    // Menu title
        'manage_options',               // Capability
        'my-plugin',                    // Menu slug
        'my_plugin_settings_page'       // Callback
    );
    
    // Or add to Tools menu
    add_management_page(
        'My Plugin Tools',
        'My Plugin',
        'manage_options',
        'my-plugin-tools',
        'my_plugin_tools_page'
    );
}
```

### Settings API Implementation

```php
<?php
add_action('admin_init', 'my_plugin_settings_init');

function my_plugin_settings_init() {
    // Register setting
    register_setting(
        'my_plugin_options',            // Option group
        'my_plugin_settings',           // Option name
        'my_plugin_sanitize_settings'   // Sanitize callback
    );
    
    // Add settings section
    add_settings_section(
        'my_plugin_section_general',    // Section ID
        'General Settings',             // Title
        'my_plugin_section_callback',   // Callback
        'my-plugin'                     // Page slug
    );
    
    // Add settings fields
    add_settings_field(
        'my_plugin_field_api_key',      // Field ID
        'API Key',                      // Title
        'my_plugin_field_api_key_cb',   // Callback
        'my-plugin',                    // Page slug
        'my_plugin_section_general',    // Section ID
        array(
            'label_for' => 'api_key',
            'class' => 'my_plugin_row'
        )
    );
    
    add_settings_field(
        'my_plugin_field_enabled',
        'Enable Feature',
        'my_plugin_field_enabled_cb',
        'my-plugin',
        'my_plugin_section_general',
        array('label_for' => 'enabled')
    );
}

function my_plugin_section_callback($args) {
    ?>
    <p>Configure your plugin settings below.</p>
    <?php
}

function my_plugin_field_api_key_cb($args) {
    $options = get_option('my_plugin_settings');
    $value = isset($options['api_key']) ? $options['api_key'] : '';
    ?>
    <input 
        type="text" 
        id="<?php echo esc_attr($args['label_for']); ?>"
        name="my_plugin_settings[<?php echo esc_attr($args['label_for']); ?>]"
        value="<?php echo esc_attr($value); ?>"
        class="regular-text"
    />
    <p class="description">Enter your API key from the provider.</p>
    <?php
}

function my_plugin_field_enabled_cb($args) {
    $options = get_option('my_plugin_settings');
    $checked = isset($options['enabled']) ? $options['enabled'] : false;
    ?>
    <input 
        type="checkbox" 
        id="<?php echo esc_attr($args['label_for']); ?>"
        name="my_plugin_settings[<?php echo esc_attr($args['label_for']); ?>]"
        value="1"
        <?php checked($checked, 1); ?>
    />
    <label for="<?php echo esc_attr($args['label_for']); ?>">
        Enable this feature
    </label>
    <?php
}

function my_plugin_sanitize_settings($input) {
    $sanitized = array();
    
    // Sanitize API key
    if (isset($input['api_key'])) {
        $sanitized['api_key'] = sanitize_text_field($input['api_key']);
    }
    
    // Sanitize checkbox
    $sanitized['enabled'] = isset($input['enabled']) ? 1 : 0;
    
    return $sanitized;
}
```

### Object-Oriented Settings Page

```php
<?php
class My_Plugin_Admin {
    private $plugin_name;
    private $version;
    
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'My Plugin',
            'My Plugin',
            'manage_options',
            $this->plugin_name,
            array($this, 'display_settings_page'),
            'dashicons-admin-generic'
        );
    }

    public function register_settings() {
        register_setting(
            $this->plugin_name . '_options',
            $this->plugin_name . '_settings',
            array($this, 'sanitize_settings')
        );

        add_settings_section(
            $this->plugin_name . '_section',
            'General Settings',
            array($this, 'section_callback'),
            $this->plugin_name
        );

        add_settings_field(
            'api_key',
            'API Key',
            array($this, 'api_key_field'),
            $this->plugin_name,
            $this->plugin_name . '_section'
        );
    }

    public function display_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        include_once plugin_dir_path(__FILE__) . 'partials/admin-display.php';
    }

    public function section_callback() {
        echo '<p>Configure your plugin settings.</p>';
    }

    public function api_key_field() {
        $options = get_option($this->plugin_name . '_settings');
        $value = isset($options['api_key']) ? $options['api_key'] : '';

        printf(
            '<input type="text" name="%s[api_key]" value="%s" class="regular-text" />',
            esc_attr($this->plugin_name . '_settings'),
            esc_attr($value)
        );
    }

    public function sanitize_settings($input) {
        $sanitized = array();

        if (isset($input['api_key'])) {
            $sanitized['api_key'] = sanitize_text_field($input['api_key']);
        }

        return $sanitized;
    }
}

// Hook it up
$admin = new My_Plugin_Admin('my-plugin', '1.0.0');
add_action('admin_menu', array($admin, 'add_admin_menu'));
add_action('admin_init', array($admin, 'register_settings'));
```

---

## Meta Boxes

### Adding a Meta Box

```php
<?php
add_action('add_meta_boxes', 'my_plugin_add_meta_box');

function my_plugin_add_meta_box() {
    add_meta_box(
        'my_plugin_meta_box',           // Meta box ID
        'My Plugin Settings',           // Title
        'my_plugin_meta_box_callback',  // Callback
        'post',                         // Post type (or array of post types)
        'side',                         // Context (normal, side, advanced)
        'default'                       // Priority (high, default, low)
    );
}

function my_plugin_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field('my_plugin_save_meta_box', 'my_plugin_meta_box_nonce');

    // Get current value
    $value = get_post_meta($post->ID, '_my_plugin_field', true);

    ?>
    <label for="my_plugin_field">Custom Field:</label>
    <input
        type="text"
        id="my_plugin_field"
        name="my_plugin_field"
        value="<?php echo esc_attr($value); ?>"
        class="widefat"
    />
    <?php
}

// Save meta box data
add_action('save_post', 'my_plugin_save_meta_box');

function my_plugin_save_meta_box($post_id) {
    // Check nonce
    if (!isset($_POST['my_plugin_meta_box_nonce'])) {
        return;
    }

    if (!wp_verify_nonce($_POST['my_plugin_meta_box_nonce'], 'my_plugin_save_meta_box')) {
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

    // Sanitize and save
    if (isset($_POST['my_plugin_field'])) {
        $value = sanitize_text_field($_POST['my_plugin_field']);
        update_post_meta($post_id, '_my_plugin_field', $value);
    }
}
```

### Object-Oriented Meta Box

```php
<?php
class My_Plugin_Meta_Box {
    public function __construct() {
        add_action('add_meta_boxes', array($this, 'add_meta_box'));
        add_action('save_post', array($this, 'save_meta_box'));
    }

    public function add_meta_box() {
        $post_types = array('post', 'page', 'custom_post_type');

        foreach ($post_types as $post_type) {
            add_meta_box(
                'my_plugin_meta_box',
                'My Plugin Settings',
                array($this, 'render_meta_box'),
                $post_type,
                'normal',
                'high'
            );
        }
    }

    public function render_meta_box($post) {
        wp_nonce_field('my_plugin_meta_box', 'my_plugin_meta_box_nonce');

        $project_url = get_post_meta($post->ID, '_project_url', true);
        $project_date = get_post_meta($post->ID, '_project_date', true);

        ?>
        <table class="form-table">
            <tr>
                <th><label for="project_url">Project URL</label></th>
                <td>
                    <input
                        type="url"
                        id="project_url"
                        name="project_url"
                        value="<?php echo esc_url($project_url); ?>"
                        class="regular-text"
                    />
                </td>
            </tr>
            <tr>
                <th><label for="project_date">Project Date</label></th>
                <td>
                    <input
                        type="date"
                        id="project_date"
                        name="project_date"
                        value="<?php echo esc_attr($project_date); ?>"
                    />
                </td>
            </tr>
        </table>
        <?php
    }

    public function save_meta_box($post_id) {
        // Verify nonce
        if (!isset($_POST['my_plugin_meta_box_nonce'])) {
            return;
        }

        if (!wp_verify_nonce($_POST['my_plugin_meta_box_nonce'], 'my_plugin_meta_box')) {
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

        // Save project URL
        if (isset($_POST['project_url'])) {
            update_post_meta(
                $post_id,
                '_project_url',
                esc_url_raw($_POST['project_url'])
            );
        }

        // Save project date
        if (isset($_POST['project_date'])) {
            update_post_meta(
                $post_id,
                '_project_date',
                sanitize_text_field($_POST['project_date'])
            );
        }
    }
}

new My_Plugin_Meta_Box();
```

---

## Admin Notices

### Basic Admin Notice

```php
<?php
add_action('admin_notices', 'my_plugin_admin_notice');

function my_plugin_admin_notice() {
    ?>
    <div class="notice notice-success is-dismissible">
        <p>Settings saved successfully!</p>
    </div>
    <?php
}
```

### Notice Types

```php
<?php
function my_plugin_show_notices() {
    // Success notice
    ?>
    <div class="notice notice-success is-dismissible">
        <p>Success message</p>
    </div>

    <!-- Error notice -->
    <div class="notice notice-error">
        <p>Error message</p>
    </div>

    <!-- Warning notice -->
    <div class="notice notice-warning">
        <p>Warning message</p>
    </div>

    <!-- Info notice -->
    <div class="notice notice-info">
        <p>Info message</p>
    </div>
    <?php
}
```

### Conditional Admin Notices

```php
<?php
add_action('admin_notices', 'my_plugin_conditional_notice');

function my_plugin_conditional_notice() {
    // Only show on plugin settings page
    $screen = get_current_screen();
    if ($screen->id !== 'toplevel_page_my-plugin') {
        return;
    }

    // Check if settings are configured
    $settings = get_option('my_plugin_settings');
    if (empty($settings['api_key'])) {
        ?>
        <div class="notice notice-warning">
            <p>
                <strong>My Plugin:</strong>
                Please configure your API key in
                <a href="<?php echo admin_url('admin.php?page=my-plugin'); ?>">settings</a>.
            </p>
        </div>
        <?php
    }
}
```

### Dismissible Notices with Transients

```php
<?php
add_action('admin_notices', 'my_plugin_dismissible_notice');

function my_plugin_dismissible_notice() {
    // Check if notice was dismissed
    if (get_transient('my_plugin_notice_dismissed')) {
        return;
    }

    ?>
    <div class="notice notice-info is-dismissible" data-notice="my-plugin-welcome">
        <p>Welcome to My Plugin! <a href="#">Get started</a></p>
    </div>

    <script>
    jQuery(document).ready(function($) {
        $(document).on('click', '.notice[data-notice="my-plugin-welcome"] .notice-dismiss', function() {
            $.post(ajaxurl, {
                action: 'my_plugin_dismiss_notice',
                nonce: '<?php echo wp_create_nonce('my_plugin_dismiss_notice'); ?>'
            });
        });
    });
    </script>
    <?php
}

// Handle AJAX dismiss
add_action('wp_ajax_my_plugin_dismiss_notice', 'my_plugin_handle_dismiss_notice');

function my_plugin_handle_dismiss_notice() {
    check_ajax_referer('my_plugin_dismiss_notice', 'nonce');

    set_transient('my_plugin_notice_dismissed', true, WEEK_IN_SECONDS);

    wp_send_json_success();
}
```

---

## List Tables

### Custom List Table

```php
<?php
if (!class_exists('WP_List_Table')) {
    require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}

class My_Plugin_List_Table extends WP_List_Table {
    public function __construct() {
        parent::__construct(array(
            'singular' => 'item',
            'plural'   => 'items',
            'ajax'     => false
        ));
    }

    public function get_columns() {
        return array(
            'cb'      => '<input type="checkbox" />',
            'title'   => 'Title',
            'author'  => 'Author',
            'date'    => 'Date',
            'status'  => 'Status'
        );
    }

    public function get_sortable_columns() {
        return array(
            'title' => array('title', false),
            'date'  => array('date', true)
        );
    }

    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'title':
            case 'author':
            case 'date':
            case 'status':
                return $item[$column_name];
            default:
                return print_r($item, true);
        }
    }

    public function column_cb($item) {
        return sprintf(
            '<input type="checkbox" name="items[]" value="%s" />',
            $item['id']
        );
    }

    public function column_title($item) {
        $actions = array(
            'edit'   => sprintf(
                '<a href="?page=%s&action=edit&item=%s">Edit</a>',
                $_REQUEST['page'],
                $item['id']
            ),
            'delete' => sprintf(
                '<a href="?page=%s&action=delete&item=%s">Delete</a>',
                $_REQUEST['page'],
                $item['id']
            )
        );

        return sprintf(
            '%1$s %2$s',
            $item['title'],
            $this->row_actions($actions)
        );
    }

    public function get_bulk_actions() {
        return array(
            'delete' => 'Delete',
            'export' => 'Export'
        );
    }

    public function prepare_items() {
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();

        $this->_column_headers = array($columns, $hidden, $sortable);

        // Get data
        $data = $this->get_data();

        // Pagination
        $per_page = 20;
        $current_page = $this->get_pagenum();
        $total_items = count($data);

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page'    => $per_page,
            'total_pages' => ceil($total_items / $per_page)
        ));

        $this->items = array_slice($data, (($current_page - 1) * $per_page), $per_page);
    }

    private function get_data() {
        // Get data from database
        global $wpdb;
        $table_name = $wpdb->prefix . 'my_plugin_data';

        return $wpdb->get_results(
            "SELECT * FROM $table_name ORDER BY date DESC",
            ARRAY_A
        );
    }
}

// Display list table
function my_plugin_list_page() {
    $list_table = new My_Plugin_List_Table();
    $list_table->prepare_items();

    ?>
    <div class="wrap">
        <h1>My Plugin Items</h1>
        <form method="post">
            <?php $list_table->display(); ?>
        </form>
    </div>
    <?php
}
```

---

## Dashboard Widgets

### Adding a Dashboard Widget

```php
<?php
add_action('wp_dashboard_setup', 'my_plugin_add_dashboard_widget');

function my_plugin_add_dashboard_widget() {
    wp_add_dashboard_widget(
        'my_plugin_dashboard_widget',       // Widget ID
        'My Plugin Stats',                  // Title
        'my_plugin_dashboard_widget_render' // Callback
    );
}

function my_plugin_dashboard_widget_render() {
    // Get stats
    $total_items = wp_count_posts('my_custom_post_type')->publish;
    $recent_items = get_posts(array(
        'post_type' => 'my_custom_post_type',
        'posts_per_page' => 5
    ));

    ?>
    <div class="my-plugin-dashboard-widget">
        <p><strong>Total Items:</strong> <?php echo esc_html($total_items); ?></p>

        <h4>Recent Items</h4>
        <ul>
            <?php foreach ($recent_items as $item) : ?>
                <li>
                    <a href="<?php echo get_edit_post_link($item->ID); ?>">
                        <?php echo esc_html($item->post_title); ?>
                    </a>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <?php
}
```

---

## Admin Columns

### Adding Custom Columns to Post List

```php
<?php
// Add column
add_filter('manage_post_posts_columns', 'my_plugin_add_custom_column');

function my_plugin_add_custom_column($columns) {
    $columns['my_custom_field'] = 'Custom Field';
    return $columns;
}

// Populate column
add_action('manage_post_posts_custom_column', 'my_plugin_populate_custom_column', 10, 2);

function my_plugin_populate_custom_column($column, $post_id) {
    if ($column === 'my_custom_field') {
        $value = get_post_meta($post_id, '_my_custom_field', true);
        echo esc_html($value);
    }
}

// Make column sortable
add_filter('manage_edit-post_sortable_columns', 'my_plugin_sortable_column');

function my_plugin_sortable_column($columns) {
    $columns['my_custom_field'] = 'my_custom_field';
    return $columns;
}
```

---

## Best Practices

### Settings Pages

✅ Check user capabilities (`current_user_can()`)
✅ Use Settings API for options
✅ Sanitize all input
✅ Use nonces for form submissions
✅ Provide helpful descriptions
✅ Group related settings
✅ Use appropriate input types

### Meta Boxes

✅ Always use nonces
✅ Check autosave
✅ Verify user permissions
✅ Sanitize input based on type
✅ Use `update_post_meta()` not direct DB queries
✅ Prefix meta keys with underscore for private fields

### Admin Notices

✅ Use appropriate notice types
✅ Make notices dismissible when appropriate
✅ Show notices only on relevant pages
✅ Provide actionable information
✅ Don't overwhelm users with notices

### Security

✅ Always check capabilities
✅ Use nonces for all forms
✅ Sanitize input, escape output
✅ Use `wp_verify_nonce()` before processing
✅ Check `DOING_AUTOSAVE` in save hooks
✅ Validate data types

---

## Common Patterns

### Tabbed Settings Page

```php
<?php
function my_plugin_settings_page() {
    $active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'general';

    ?>
    <div class="wrap">
        <h1>My Plugin Settings</h1>

        <h2 class="nav-tab-wrapper">
            <a href="?page=my-plugin&tab=general" class="nav-tab <?php echo $active_tab == 'general' ? 'nav-tab-active' : ''; ?>">
                General
            </a>
            <a href="?page=my-plugin&tab=advanced" class="nav-tab <?php echo $active_tab == 'advanced' ? 'nav-tab-active' : ''; ?>">
                Advanced
            </a>
            <a href="?page=my-plugin&tab=help" class="nav-tab <?php echo $active_tab == 'help' ? 'nav-tab-active' : ''; ?>">
                Help
            </a>
        </h2>

        <form method="post" action="options.php">
            <?php
            if ($active_tab == 'general') {
                settings_fields('my_plugin_general');
                do_settings_sections('my-plugin-general');
            } elseif ($active_tab == 'advanced') {
                settings_fields('my_plugin_advanced');
                do_settings_sections('my-plugin-advanced');
            } else {
                // Help tab content
                echo '<p>Help content here</p>';
            }

            if ($active_tab != 'help') {
                submit_button();
            }
            ?>
        </form>
    </div>
    <?php
}
```

---

## Summary

| Component | Purpose | Key Functions |
|-----------|---------|---------------|
| Settings Pages | Plugin configuration | `add_menu_page()`, `register_setting()` |
| Meta Boxes | Post/page custom fields | `add_meta_box()`, `update_post_meta()` |
| Admin Notices | User notifications | `admin_notices` hook |
| List Tables | Custom data tables | `WP_List_Table` class |
| Dashboard Widgets | Dashboard info | `wp_add_dashboard_widget()` |
| Admin Columns | Custom list columns | `manage_{post_type}_posts_columns` |

