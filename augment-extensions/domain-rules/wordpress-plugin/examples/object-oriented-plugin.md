# Object-Oriented Plugin Example

## Overview

This example demonstrates **Pattern 3: Object-Oriented Plugin** - a maintainable, extensible architecture using classes for complex WordPress plugins.

**Complexity**: Medium-High  
**File Count**: 10-30 files  
**Team Size**: 2-5 developers  
**Use Case**: Complex functionality, extensibility, multiple developers, long-term maintenance

---

## Complete Plugin: "Event Manager Pro"

A complete event management plugin demonstrating OOP principles, hook loader pattern, and separation of concerns.

---

## Directory Structure

```
event-manager-pro/
├── event-manager-pro.php          # Main plugin file (bootstrap)
├── uninstall.php                  # Uninstall cleanup
├── readme.txt                     # WordPress.org readme
├── includes/
│   ├── class-event-manager.php    # Main plugin class
│   ├── class-loader.php           # Hook loader
│   ├── class-activator.php        # Activation logic
│   ├── class-deactivator.php      # Deactivation logic
│   ├── class-event.php            # Event model
│   └── class-database.php         # Database operations
├── admin/
│   ├── class-admin.php            # Admin functionality
│   ├── class-settings.php         # Settings page
│   ├── class-meta-boxes.php       # Meta boxes
│   ├── css/
│   │   └── admin.css
│   ├── js/
│   │   └── admin.js
│   └── partials/
│       ├── settings-page.php      # Settings view
│       └── meta-box-event.php     # Event meta box view
├── public/
│   ├── class-public.php           # Public functionality
│   ├── class-shortcodes.php       # Shortcode handlers
│   ├── class-widgets.php          # Widget classes
│   ├── css/
│   │   └── public.css
│   ├── js/
│   │   └── public.js
│   └── partials/
│       ├── event-single.php       # Single event view
│       └── event-list.php         # Event list view
└── languages/
    └── event-manager-pro.pot
```

---

## Main Plugin File

### File: `event-manager-pro.php`

```php
<?php
/**
 * Plugin Name: Event Manager Pro
 * Plugin URI: https://example.com/event-manager-pro
 * Description: Professional event management with OOP architecture
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: event-manager-pro
 * Domain Path: /languages
 *
 * @package Event_Manager_Pro
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('EMP_VERSION', '1.0.0');
define('EMP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('EMP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('EMP_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * PSR-4 Autoloader for plugin classes
 */
spl_autoload_register(function ($class) {
    $prefix = 'Event_Manager_Pro_';
    $base_dir = EMP_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . str_replace('_', '-', strtolower($relative_class)) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Load admin classes
spl_autoload_register(function ($class) {
    if (strpos($class, 'Event_Manager_Pro_Admin') === 0) {
        $file = EMP_PLUGIN_DIR . 'admin/class-' . str_replace('_', '-', strtolower(str_replace('Event_Manager_Pro_Admin_', '', $class))) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }
});

// Load public classes
spl_autoload_register(function ($class) {
    if (strpos($class, 'Event_Manager_Pro_Public') === 0) {
        $file = EMP_PLUGIN_DIR . 'public/class-' . str_replace('_', '-', strtolower(str_replace('Event_Manager_Pro_Public_', '', $class))) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }
});

/**
 * Activation hook
 */
function activate_event_manager_pro() {
    require_once EMP_PLUGIN_DIR . 'includes/class-activator.php';
    Event_Manager_Pro_Activator::activate();
}
register_activation_hook(__FILE__, 'activate_event_manager_pro');

/**
 * Deactivation hook
 */
function deactivate_event_manager_pro() {
    require_once EMP_PLUGIN_DIR . 'includes/class-deactivator.php';
    Event_Manager_Pro_Deactivator::deactivate();
}
register_deactivation_hook(__FILE__, 'deactivate_event_manager_pro');

/**
 * Initialize and run the plugin
 */
function run_event_manager_pro() {
    $plugin = new Event_Manager_Pro();
    $plugin->run();
}
run_event_manager_pro();
```

---

## Core Classes

### File: `includes/class-event-manager.php`

```php
<?php
/**
 * Main plugin class
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro {
    /**
     * The loader that's responsible for maintaining and registering all hooks
     *
     * @var Event_Manager_Pro_Loader
     */
    protected $loader;

    /**
     * The unique identifier of this plugin
     *
     * @var string
     */
    protected $plugin_name;

    /**
     * The current version of the plugin
     *
     * @var string
     */
    protected $version;

    /**
     * Initialize the plugin
     */
    public function __construct() {
        $this->version = EMP_VERSION;
        $this->plugin_name = 'event-manager-pro';

        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        require_once EMP_PLUGIN_DIR . 'includes/class-loader.php';
        require_once EMP_PLUGIN_DIR . 'includes/class-event.php';
        require_once EMP_PLUGIN_DIR . 'includes/class-database.php';
        require_once EMP_PLUGIN_DIR . 'admin/class-admin.php';
        require_once EMP_PLUGIN_DIR . 'admin/class-settings.php';
        require_once EMP_PLUGIN_DIR . 'admin/class-meta-boxes.php';
        require_once EMP_PLUGIN_DIR . 'public/class-public.php';
        require_once EMP_PLUGIN_DIR . 'public/class-shortcodes.php';

        $this->loader = new Event_Manager_Pro_Loader();
    }

    /**
     * Set the plugin locale for internationalization
     */
    private function set_locale() {
        $this->loader->add_action('plugins_loaded', $this, 'load_plugin_textdomain');
    }

    /**
     * Load plugin text domain
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'event-manager-pro',
            false,
            dirname(EMP_PLUGIN_BASENAME) . '/languages/'
        );
    }

    /**
     * Register all admin-related hooks
     */
    private function define_admin_hooks() {
        $admin = new Event_Manager_Pro_Admin($this->plugin_name, $this->version);

        // Admin menu and assets
        $this->loader->add_action('admin_menu', $admin, 'add_admin_menu');
        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_scripts');

        // Settings
        $settings = new Event_Manager_Pro_Admin_Settings($this->plugin_name, $this->version);
        $this->loader->add_action('admin_init', $settings, 'register_settings');

        // Meta boxes
        $meta_boxes = new Event_Manager_Pro_Admin_Meta_Boxes($this->plugin_name, $this->version);
        $this->loader->add_action('add_meta_boxes', $meta_boxes, 'add_meta_boxes');
        $this->loader->add_action('save_post', $meta_boxes, 'save_meta_boxes');
    }

    /**
     * Register all public-facing hooks
     */
    private function define_public_hooks() {
        $public = new Event_Manager_Pro_Public($this->plugin_name, $this->version);

        // Public assets
        $this->loader->add_action('wp_enqueue_scripts', $public, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $public, 'enqueue_scripts');

        // Custom post type
        $this->loader->add_action('init', $public, 'register_event_post_type');

        // Shortcodes
        $shortcodes = new Event_Manager_Pro_Public_Shortcodes($this->plugin_name, $this->version);
        $this->loader->add_action('init', $shortcodes, 'register_shortcodes');
    }

    /**
     * Run the loader to execute all hooks
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * Get the plugin name
     *
     * @return string
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Get the plugin version
     *
     * @return string
     */
    public function get_version() {
        return $this->version;
    }

    /**
     * Get the loader
     *
     * @return Event_Manager_Pro_Loader
     */
    public function get_loader() {
        return $this->loader;
    }
}
```

### File: `includes/class-loader.php`

```php
<?php
/**
 * Hook loader class
 *
 * Maintains and registers all hooks for the plugin
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Loader {
    /**
     * Array of actions registered with WordPress
     *
     * @var array
     */
    protected $actions;

    /**
     * Array of filters registered with WordPress
     *
     * @var array
     */
    protected $filters;

    /**
     * Initialize the collections
     */
    public function __construct() {
        $this->actions = array();
        $this->filters = array();
    }

    /**
     * Add a new action to the collection
     *
     * @param string $hook          The name of the WordPress action
     * @param object $component     A reference to the instance of the object
     * @param string $callback      The name of the function definition on the $component
     * @param int    $priority      Optional. The priority at which the function should be fired. Default is 10.
     * @param int    $accepted_args Optional. The number of arguments that should be passed to the $callback. Default is 1.
     */
    public function add_action($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->actions = $this->add($this->actions, $hook, $component, $callback, $priority, $accepted_args);
    }

    /**
     * Add a new filter to the collection
     *
     * @param string $hook          The name of the WordPress filter
     * @param object $component     A reference to the instance of the object
     * @param string $callback      The name of the function definition on the $component
     * @param int    $priority      Optional. The priority at which the function should be fired. Default is 10.
     * @param int    $accepted_args Optional. The number of arguments that should be passed to the $callback. Default is 1.
     */
    public function add_filter($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->filters = $this->add($this->filters, $hook, $component, $callback, $priority, $accepted_args);
    }

    /**
     * Utility function to register hooks
     *
     * @param array  $hooks         The collection of hooks
     * @param string $hook          The name of the WordPress filter/action
     * @param object $component     A reference to the instance of the object
     * @param string $callback      The name of the function definition on the $component
     * @param int    $priority      The priority at which the function should be fired
     * @param int    $accepted_args The number of arguments that should be passed to the $callback
     * @return array
     */
    private function add($hooks, $hook, $component, $callback, $priority, $accepted_args) {
        $hooks[] = array(
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args
        );

        return $hooks;
    }

    /**
     * Register the filters and actions with WordPress
     */
    public function run() {
        foreach ($this->filters as $hook) {
            add_filter(
                $hook['hook'],
                array($hook['component'], $hook['callback']),
                $hook['priority'],
                $hook['accepted_args']
            );
        }

        foreach ($this->actions as $hook) {
            add_action(
                $hook['hook'],
                array($hook['component'], $hook['callback']),
                $hook['priority'],
                $hook['accepted_args']
            );
        }
    }
}
```

### File: `includes/class-activator.php`

```php
<?php
/**
 * Activation handler
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Activator {
    /**
     * Activate the plugin
     */
    public static function activate() {
        // Register custom post type (needed for flush_rewrite_rules)
        self::register_event_post_type();

        // Flush rewrite rules
        flush_rewrite_rules();

        // Create custom database tables
        self::create_tables();

        // Set default options
        self::set_default_options();

        // Schedule cron events
        if (!wp_next_scheduled('emp_daily_cleanup')) {
            wp_schedule_event(time(), 'daily', 'emp_daily_cleanup');
        }
    }

    /**
     * Register event post type (temporary for activation)
     */
    private static function register_event_post_type() {
        register_post_type('emp_event', array(
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'events'),
        ));
    }

    /**
     * Create custom database tables
     */
    private static function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'emp_attendees';

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            event_id bigint(20) NOT NULL,
            user_id bigint(20) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'registered',
            registered_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY event_id (event_id),
            KEY user_id (user_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Store database version
        add_option('emp_db_version', '1.0.0');
    }

    /**
     * Set default plugin options
     */
    private static function set_default_options() {
        $defaults = array(
            'events_per_page' => 10,
            'date_format' => 'F j, Y',
            'time_format' => 'g:i a',
            'enable_registration' => true,
        );

        add_option('emp_settings', $defaults);
    }
}
```

### File: `includes/class-deactivator.php`

```php
<?php
/**
 * Deactivation handler
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Deactivator {
    /**
     * Deactivate the plugin
     */
    public static function deactivate() {
        // Unschedule cron events
        $timestamp = wp_next_scheduled('emp_daily_cleanup');
        if ($timestamp) {
            wp_unschedule_event($timestamp, 'emp_daily_cleanup');
        }

        // Flush rewrite rules
        flush_rewrite_rules();
    }
}
```

### File: `includes/class-event.php`

```php
<?php
/**
 * Event model class
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Event {
    /**
     * Event ID
     *
     * @var int
     */
    private $id;

    /**
     * Event data
     *
     * @var array
     */
    private $data;

    /**
     * Constructor
     *
     * @param int $event_id Event post ID
     */
    public function __construct($event_id = 0) {
        if ($event_id > 0) {
            $this->id = $event_id;
            $this->load();
        }
    }

    /**
     * Load event data
     */
    private function load() {
        $post = get_post($this->id);

        if (!$post || $post->post_type !== 'emp_event') {
            return false;
        }

        $this->data = array(
            'title' => $post->post_title,
            'description' => $post->post_content,
            'start_date' => get_post_meta($this->id, '_emp_start_date', true),
            'end_date' => get_post_meta($this->id, '_emp_end_date', true),
            'location' => get_post_meta($this->id, '_emp_location', true),
            'capacity' => get_post_meta($this->id, '_emp_capacity', true),
            'status' => $post->post_status,
        );
    }

    /**
     * Get event property
     *
     * @param string $key Property key
     * @return mixed
     */
    public function get($key) {
        return isset($this->data[$key]) ? $this->data[$key] : null;
    }

    /**
     * Set event property
     *
     * @param string $key   Property key
     * @param mixed  $value Property value
     */
    public function set($key, $value) {
        $this->data[$key] = $value;
    }

    /**
     * Save event
     *
     * @return int|WP_Error Event ID on success, WP_Error on failure
     */
    public function save() {
        $post_data = array(
            'post_title' => $this->data['title'],
            'post_content' => $this->data['description'],
            'post_type' => 'emp_event',
            'post_status' => $this->data['status'] ?? 'publish',
        );

        if ($this->id > 0) {
            $post_data['ID'] = $this->id;
            $result = wp_update_post($post_data, true);
        } else {
            $result = wp_insert_post($post_data, true);
            if (!is_wp_error($result)) {
                $this->id = $result;
            }
        }

        if (is_wp_error($result)) {
            return $result;
        }

        // Save meta data
        update_post_meta($this->id, '_emp_start_date', $this->data['start_date']);
        update_post_meta($this->id, '_emp_end_date', $this->data['end_date']);
        update_post_meta($this->id, '_emp_location', $this->data['location']);
        update_post_meta($this->id, '_emp_capacity', $this->data['capacity']);

        return $this->id;
    }

    /**
     * Delete event
     *
     * @return bool
     */
    public function delete() {
        if ($this->id > 0) {
            return wp_delete_post($this->id, true) !== false;
        }
        return false;
    }

    /**
     * Get attendee count
     *
     * @return int
     */
    public function get_attendee_count() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'emp_attendees';

        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE event_id = %d AND status = 'registered'",
            $this->id
        ));
    }

    /**
     * Check if event is full
     *
     * @return bool
     */
    public function is_full() {
        $capacity = (int) $this->get('capacity');
        if ($capacity <= 0) {
            return false;
        }

        return $this->get_attendee_count() >= $capacity;
    }

    /**
     * Get available spots
     *
     * @return int
     */
    public function get_available_spots() {
        $capacity = (int) $this->get('capacity');
        if ($capacity <= 0) {
            return -1; // Unlimited
        }

        return max(0, $capacity - $this->get_attendee_count());
    }
}
```

---

## Admin Classes

### File: `admin/class-admin.php`

```php
<?php
/**
 * Admin functionality
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Admin {
    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Event Manager', 'event-manager-pro'),
            __('Events', 'event-manager-pro'),
            'manage_options',
            'event-manager-pro',
            array($this, 'display_admin_page'),
            'dashicons-calendar-alt',
            25
        );
    }

    /**
     * Display admin page
     */
    public function display_admin_page() {
        include EMP_PLUGIN_DIR . 'admin/partials/settings-page.php';
    }

    /**
     * Enqueue admin styles
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            EMP_PLUGIN_URL . 'admin/css/admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            EMP_PLUGIN_URL . 'admin/js/admin.js',
            array('jquery', 'jquery-ui-datepicker'),
            $this->version,
            false
        );
    }
}
```

### File: `admin/class-meta-boxes.php`

```php
<?php
/**
 * Meta boxes for event post type
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Admin_Meta_Boxes {
    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Add meta boxes
     */
    public function add_meta_boxes() {
        add_meta_box(
            'emp_event_details',
            __('Event Details', 'event-manager-pro'),
            array($this, 'render_event_details_meta_box'),
            'emp_event',
            'normal',
            'high'
        );
    }

    /**
     * Render event details meta box
     */
    public function render_event_details_meta_box($post) {
        wp_nonce_field('emp_save_event_details', 'emp_event_details_nonce');

        $start_date = get_post_meta($post->ID, '_emp_start_date', true);
        $end_date = get_post_meta($post->ID, '_emp_end_date', true);
        $location = get_post_meta($post->ID, '_emp_location', true);
        $capacity = get_post_meta($post->ID, '_emp_capacity', true);

        include EMP_PLUGIN_DIR . 'admin/partials/meta-box-event.php';
    }

    /**
     * Save meta box data
     */
    public function save_meta_boxes($post_id) {
        // Security checks
        if (!isset($_POST['emp_event_details_nonce'])) {
            return;
        }

        if (!wp_verify_nonce($_POST['emp_event_details_nonce'], 'emp_save_event_details')) {
            return;
        }

        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save meta data
        if (isset($_POST['emp_start_date'])) {
            update_post_meta($post_id, '_emp_start_date', sanitize_text_field($_POST['emp_start_date']));
        }

        if (isset($_POST['emp_end_date'])) {
            update_post_meta($post_id, '_emp_end_date', sanitize_text_field($_POST['emp_end_date']));
        }

        if (isset($_POST['emp_location'])) {
            update_post_meta($post_id, '_emp_location', sanitize_text_field($_POST['emp_location']));
        }

        if (isset($_POST['emp_capacity'])) {
            update_post_meta($post_id, '_emp_capacity', absint($_POST['emp_capacity']));
        }
    }
}
```

---

## Public Classes

### File: `public/class-public.php`

```php
<?php
/**
 * Public-facing functionality
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Public {
    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register event custom post type
     */
    public function register_event_post_type() {
        $labels = array(
            'name' => __('Events', 'event-manager-pro'),
            'singular_name' => __('Event', 'event-manager-pro'),
            'add_new' => __('Add New Event', 'event-manager-pro'),
            'add_new_item' => __('Add New Event', 'event-manager-pro'),
            'edit_item' => __('Edit Event', 'event-manager-pro'),
            'view_item' => __('View Event', 'event-manager-pro'),
            'search_items' => __('Search Events', 'event-manager-pro'),
        );

        $args = array(
            'labels' => $labels,
            'public' => true,
            'has_archive' => true,
            'menu_icon' => 'dashicons-calendar-alt',
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
            'rewrite' => array('slug' => 'events'),
            'show_in_rest' => true,
        );

        register_post_type('emp_event', $args);
    }

    /**
     * Enqueue public styles
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            EMP_PLUGIN_URL . 'public/css/public.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Enqueue public scripts
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            EMP_PLUGIN_URL . 'public/js/public.js',
            array('jquery'),
            $this->version,
            false
        );
    }
}
```

### File: `public/class-shortcodes.php`

```php
<?php
/**
 * Shortcode handlers
 *
 * @package Event_Manager_Pro
 */

class Event_Manager_Pro_Public_Shortcodes {
    private $plugin_name;
    private $version;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register shortcodes
     */
    public function register_shortcodes() {
        add_shortcode('event_list', array($this, 'event_list_shortcode'));
        add_shortcode('event_single', array($this, 'event_single_shortcode'));
    }

    /**
     * Event list shortcode
     */
    public function event_list_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 10,
            'order' => 'ASC',
        ), $atts);

        $args = array(
            'post_type' => 'emp_event',
            'posts_per_page' => intval($atts['limit']),
            'order' => $atts['order'],
            'meta_key' => '_emp_start_date',
            'orderby' => 'meta_value',
        );

        $query = new WP_Query($args);

        ob_start();
        if ($query->have_posts()) {
            include EMP_PLUGIN_DIR . 'public/partials/event-list.php';
        }
        wp_reset_postdata();

        return ob_get_clean();
    }

    /**
     * Single event shortcode
     */
    public function event_single_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
        ), $atts);

        $event = new Event_Manager_Pro_Event(intval($atts['id']));

        ob_start();
        include EMP_PLUGIN_DIR . 'public/partials/event-single.php';
        return ob_get_clean();
    }
}
```

---

## Key OOP Principles Demonstrated

### 1. **Separation of Concerns**

✅ **Admin logic** separated from **public logic**
✅ **Model** (Event) separated from **controllers** (Admin, Public)
✅ **Views** in partials directory

### 2. **Single Responsibility Principle**

✅ Each class has one clear purpose:
- `Event_Manager_Pro` - Main orchestrator
- `Event_Manager_Pro_Loader` - Hook management
- `Event_Manager_Pro_Event` - Event data model
- `Event_Manager_Pro_Admin` - Admin functionality
- `Event_Manager_Pro_Public` - Public functionality

### 3. **Dependency Injection**

✅ Plugin name and version injected into classes:
```php
$admin = new Event_Manager_Pro_Admin($this->plugin_name, $this->version);
```

### 4. **Encapsulation**

✅ Private/protected properties and methods
✅ Public getters/setters for controlled access
✅ Data validation in model methods

### 5. **Hook Loader Pattern**

✅ Centralized hook management
✅ Easy to track all hooks
✅ Testable hook registration

---

## Advantages of OOP Pattern

### ✅ Maintainability

- **Clear structure**: Easy to find and modify code
- **Separation of concerns**: Changes isolated to specific classes
- **Consistent patterns**: Predictable code organization

### ✅ Extensibility

- **Easy to extend**: Add new classes without modifying existing ones
- **Inheritance**: Can extend base classes for variations
- **Interfaces**: Can define contracts for implementations

### ✅ Testability

- **Unit testing**: Each class can be tested independently
- **Mocking**: Dependencies can be mocked for testing
- **Dependency injection**: Easy to swap implementations

### ✅ Collaboration

- **Multiple developers**: Can work on different classes simultaneously
- **Code review**: Smaller, focused classes easier to review
- **Documentation**: PHPDoc on classes and methods

### ✅ Reusability

- **Model classes**: Can be reused across admin and public
- **Utility classes**: Shared functionality in dedicated classes
- **Composition**: Combine classes for complex functionality

---

## When to Use OOP Pattern

### ✅ Good Use Cases

- **Complex plugins**: Multiple features and functionality
- **Team development**: 2-5 developers working together
- **Long-term maintenance**: Plugin will be maintained for years
- **Extensibility needed**: Other developers will extend the plugin
- **Professional plugins**: Commercial or enterprise plugins
- **Testing required**: Unit and integration testing needed

### ❌ Not Suitable For

- **Simple plugins**: Single feature, < 200 lines (use Pattern 1)
- **Quick prototypes**: Temporary or experimental code
- **Solo learning**: Beginners learning WordPress (start with Pattern 1)
- **Micro-plugins**: Very specific, focused functionality

---

## Best Practices

### 1. **Class Naming**

```php
// Good
class Event_Manager_Pro_Admin { }
class Event_Manager_Pro_Public_Shortcodes { }

// Bad
class Admin { }  // Too generic
class EMP_A { }  // Not descriptive
```

### 2. **File Naming**

```php
// Good
class-event-manager.php
class-admin.php
class-shortcodes.php

// Bad
EventManager.php  // Wrong case
admin.php  // Missing prefix
```

### 3. **Autoloading**

```php
// Use PSR-4 style autoloader
spl_autoload_register(function ($class) {
    $prefix = 'Event_Manager_Pro_';
    $base_dir = EMP_PLUGIN_DIR . 'includes/';

    // Convert class name to file path
    $relative_class = substr($class, strlen($prefix));
    $file = $base_dir . 'class-' . str_replace('_', '-', strtolower($relative_class)) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});
```

### 4. **Dependency Injection**

```php
// Good - Dependencies injected
public function __construct($plugin_name, $version, $database) {
    $this->plugin_name = $plugin_name;
    $this->version = $version;
    $this->database = $database;
}

// Bad - Hard-coded dependencies
public function __construct() {
    $this->database = new Database();  // Hard to test
}
```

### 5. **Hook Loader**

```php
// Good - Centralized hook management
$this->loader->add_action('init', $public, 'register_post_type');
$this->loader->add_filter('the_content', $public, 'filter_content');

// Bad - Direct hook registration in multiple places
add_action('init', array($this, 'register_post_type'));
```

### 6. **Model Classes**

```php
// Good - Model with methods
$event = new Event_Manager_Pro_Event($event_id);
$event->set('title', 'New Event');
$event->save();

// Bad - Direct post meta manipulation
update_post_meta($event_id, '_emp_title', 'New Event');
```

### 7. **Security**

```php
// Always sanitize and validate
public function save_meta_boxes($post_id) {
    // Nonce verification
    if (!wp_verify_nonce($_POST['nonce'], 'save_event')) {
        return;
    }

    // Capability check
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Sanitize input
    $value = sanitize_text_field($_POST['value']);
}
```

---

## Testing Example

### Unit Test for Event Model

```php
<?php
class Event_Test extends WP_UnitTestCase {
    public function test_event_creation() {
        $event = new Event_Manager_Pro_Event();
        $event->set('title', 'Test Event');
        $event->set('start_date', '2024-01-01');

        $event_id = $event->save();

        $this->assertGreaterThan(0, $event_id);
        $this->assertEquals('Test Event', get_the_title($event_id));
    }

    public function test_event_capacity() {
        $event = new Event_Manager_Pro_Event();
        $event->set('capacity', 10);
        $event->save();

        $this->assertEquals(10, $event->get_available_spots());
        $this->assertFalse($event->is_full());
    }
}
```

---

## Comparison with Other Patterns

| Feature | Simple Procedural | OOP | WPPB |
|---------|------------------|-----|------|
| **Complexity** | Low | Medium-High | High |
| **File Count** | 1-3 | 10-30 | 20-100 |
| **Learning Curve** | Easy | Moderate | Steep |
| **Maintainability** | Low | High | Very High |
| **Testability** | Low | High | Very High |
| **Team Size** | 1 | 2-5 | 3-10 |
| **Best For** | Simple plugins | Complex plugins | Professional plugins |

---

## Migration Path

### From Simple Procedural to OOP

1. **Create main plugin class**
2. **Move functions to methods**
3. **Create loader class**
4. **Separate admin and public**
5. **Create model classes**
6. **Add autoloader**

### Example Migration

**Before (Procedural):**
```php
function emp_register_post_type() {
    register_post_type('emp_event', array(...));
}
add_action('init', 'emp_register_post_type');
```

**After (OOP):**
```php
class Event_Manager_Pro_Public {
    public function register_event_post_type() {
        register_post_type('emp_event', array(...));
    }
}

$public = new Event_Manager_Pro_Public($plugin_name, $version);
$loader->add_action('init', $public, 'register_event_post_type');
```

---

## Related Patterns

- **Pattern 1**: [Simple Procedural Plugin](simple-procedural-plugin.md) - For simple plugins
- **Pattern 2**: [Organized Procedural Plugin](organized-procedural-plugin.md) - Medium complexity
- **Pattern 4**: [WPPB Plugin](wppb-plugin.md) - Professional standard
- **Pattern 5**: [Namespace-Based Plugin](namespace-based-plugin.md) - Modern PHP

---

## Additional Resources

- [WordPress Plugin Handbook - OOP](https://developer.wordpress.org/plugins/plugin-basics/best-practices/#object-oriented-programming-method)
- [SOLID Principles in WordPress](https://carlalexander.ca/designing-class-wordpress-hooks/)
- [WordPress Plugin Boilerplate](https://wppb.me/)
- [PHPUnit for WordPress](https://make.wordpress.org/core/handbook/testing/automated-testing/phpunit/)

---

## Summary

This OOP plugin example demonstrates:

✅ **Complete working plugin** with event management functionality
✅ **Proper OOP architecture** with separation of concerns
✅ **Hook loader pattern** for centralized hook management
✅ **Model class** for data encapsulation
✅ **Admin and public separation** for clear organization
✅ **Activation/deactivation** handlers
✅ **Custom database tables** with proper creation
✅ **Meta boxes** with security (nonces, capability checks)
✅ **Shortcodes** with proper output buffering
✅ **Autoloading** for automatic class loading
✅ **Security best practices** throughout
✅ **Testable code** structure

**Perfect for**: Complex plugins, team development, long-term maintenance, professional/commercial plugins.

**Next steps**: For even more structure, consider Pattern 4 (WPPB) or Pattern 5 (Namespace-Based) for modern PHP with Composer.

