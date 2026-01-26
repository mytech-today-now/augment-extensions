# Singleton Plugin Example

## Overview

This example demonstrates the **Singleton Design Pattern** - ensuring a class has only one instance with global access point, commonly used in WordPress plugin development.

**Complexity**: Medium  
**File Count**: 5-15 files  
**Team Size**: 1-3 developers  
**Use Case**: Plugin main class, database connections, cache managers, configuration managers

---

## Complete Plugin: "Settings Manager Singleton"

A complete settings management plugin demonstrating the Singleton pattern for the main plugin class and various manager classes.

---

## Directory Structure

```
settings-manager-singleton/
├── settings-manager-singleton.php    # Main plugin file (bootstrap)
├── uninstall.php                     # Uninstall cleanup
├── readme.txt                        # WordPress.org readme
├── includes/
│   ├── class-settings-manager.php    # Main plugin class (Singleton)
│   ├── class-database.php            # Database manager (Singleton)
│   ├── class-cache.php               # Cache manager (Singleton)
│   ├── class-config.php              # Config manager (Singleton)
│   └── class-logger.php              # Logger (Singleton)
├── admin/
│   ├── class-admin.php               # Admin functionality
│   └── views/
│       └── settings-page.php         # Settings view
├── public/
│   └── class-public.php              # Public functionality
└── assets/
    ├── css/
    └── js/
```

---

## Main Plugin File

### File: `settings-manager-singleton.php`

```php
<?php
/**
 * Plugin Name: Settings Manager Singleton
 * Plugin URI: https://example.com/settings-manager
 * Description: Settings management with Singleton pattern
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: settings-manager-singleton
 * Domain Path: /languages
 *
 * @package Settings_Manager_Singleton
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SMS_VERSION', '1.0.0');
define('SMS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SMS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SMS_PLUGIN_FILE', __FILE__);

/**
 * Autoloader
 */
spl_autoload_register(function ($class) {
    $prefix = 'Settings_Manager_';
    
    if (strpos($class, $prefix) !== 0) {
        return;
    }
    
    $class_name = str_replace($prefix, '', $class);
    $class_file = 'class-' . str_replace('_', '-', strtolower($class_name)) . '.php';
    
    // Check includes directory
    $file = SMS_PLUGIN_DIR . 'includes/' . $class_file;
    if (file_exists($file)) {
        require $file;
        return;
    }
    
    // Check admin directory
    $file = SMS_PLUGIN_DIR . 'admin/' . $class_file;
    if (file_exists($file)) {
        require $file;
        return;
    }
    
    // Check public directory
    $file = SMS_PLUGIN_DIR . 'public/' . $class_file;
    if (file_exists($file)) {
        require $file;
    }
});

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    Settings_Manager_Singleton::get_instance()->activate();
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    Settings_Manager_Singleton::get_instance()->deactivate();
});

/**
 * Initialize the plugin
 *
 * Use the Singleton pattern to get the plugin instance
 */
function run_settings_manager_singleton() {
    return Settings_Manager_Singleton::get_instance();
}

// Run the plugin
run_settings_manager_singleton();
```

---

## Singleton Pattern Implementation

### File: `includes/class-settings-manager.php`

```php
<?php
/**
 * Main plugin class using Singleton pattern
 *
 * @package Settings_Manager_Singleton
 */

class Settings_Manager_Singleton {
    /**
     * The single instance of the class
     *
     * @var Settings_Manager_Singleton
     */
    private static $instance = null;

    /**
     * Plugin version
     *
     * @var string
     */
    private $version;

    /**
     * Database manager instance
     *
     * @var Settings_Manager_Database
     */
    private $database;

    /**
     * Cache manager instance
     *
     * @var Settings_Manager_Cache
     */
    private $cache;

    /**
     * Config manager instance
     *
     * @var Settings_Manager_Config
     */
    private $config;

    /**
     * Private constructor to prevent direct instantiation
     *
     * This is the key to the Singleton pattern - the constructor is private
     * so new instances cannot be created with 'new Settings_Manager_Singleton()'
     */
    private function __construct() {
        $this->version = SMS_VERSION;

        $this->load_dependencies();
        $this->set_locale();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    /**
     * Prevent cloning of the instance
     *
     * Singleton pattern requirement - prevent cloning
     */
    private function __clone() {
        // Prevent cloning
    }

    /**
     * Prevent unserializing of the instance
     *
     * Singleton pattern requirement - prevent unserialization
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Get the single instance of the class
     *
     * This is the public static method that returns the single instance
     *
     * @return Settings_Manager_Singleton
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        // Get singleton instances of manager classes
        $this->database = Settings_Manager_Database::get_instance();
        $this->cache = Settings_Manager_Cache::get_instance();
        $this->config = Settings_Manager_Config::get_instance();
    }

    /**
     * Set the plugin locale for internationalization
     */
    private function set_locale() {
        add_action('plugins_loaded', array($this, 'load_plugin_textdomain'));
    }

    /**
     * Load plugin text domain
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain(
            'settings-manager-singleton',
            false,
            dirname(plugin_basename(SMS_PLUGIN_FILE)) . '/languages/'
        );
    }

    /**
     * Register admin hooks
     */
    private function define_admin_hooks() {
        if (is_admin()) {
            $admin = new Settings_Manager_Admin($this->version);

            add_action('admin_menu', array($admin, 'add_admin_menu'));
            add_action('admin_init', array($admin, 'register_settings'));
            add_action('admin_enqueue_scripts', array($admin, 'enqueue_styles'));
            add_action('admin_enqueue_scripts', array($admin, 'enqueue_scripts'));
        }
    }

    /**
     * Register public hooks
     */
    private function define_public_hooks() {
        $public = new Settings_Manager_Public($this->version);

        add_action('wp_enqueue_scripts', array($public, 'enqueue_styles'));
        add_action('wp_enqueue_scripts', array($public, 'enqueue_scripts'));
    }

    /**
     * Activation hook
     */
    public function activate() {
        // Create database tables
        $this->database->create_tables();

        // Set default options
        $this->config->set_defaults();

        // Clear cache
        $this->cache->flush();

        // Log activation
        Settings_Manager_Logger::get_instance()->log('Plugin activated');
    }

    /**
     * Deactivation hook
     */
    public function deactivate() {
        // Clear cache
        $this->cache->flush();

        // Log deactivation
        Settings_Manager_Logger::get_instance()->log('Plugin deactivated');
    }

    /**
     * Get plugin version
     *
     * @return string
     */
    public function get_version() {
        return $this->version;
    }

    /**
     * Get database manager
     *
     * @return Settings_Manager_Database
     */
    public function get_database() {
        return $this->database;
    }

    /**
     * Get cache manager
     *
     * @return Settings_Manager_Cache
     */
    public function get_cache() {
        return $this->cache;
    }

    /**
     * Get config manager
     *
     * @return Settings_Manager_Config
     */
    public function get_config() {
        return $this->config;
    }
}
```

### File: `includes/class-database.php`

```php
<?php
/**
 * Database manager using Singleton pattern
 *
 * @package Settings_Manager_Singleton
 */

class Settings_Manager_Database {
    /**
     * The single instance of the class
     *
     * @var Settings_Manager_Database
     */
    private static $instance = null;

    /**
     * WordPress database object
     *
     * @var wpdb
     */
    private $wpdb;

    /**
     * Table name
     *
     * @var string
     */
    private $table_name;

    /**
     * Private constructor
     */
    private function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'sms_settings';
    }

    /**
     * Prevent cloning
     */
    private function __clone() {
        // Prevent cloning
    }

    /**
     * Prevent unserialization
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Get the single instance
     *
     * @return Settings_Manager_Database
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Create database tables
     */
    public function create_tables() {
        $charset_collate = $this->wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$this->table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            setting_key varchar(100) NOT NULL,
            setting_value longtext,
            setting_type varchar(20) DEFAULT 'string',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY setting_key (setting_key)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Get setting value
     *
     * @param string $key     Setting key
     * @param mixed  $default Default value
     * @return mixed
     */
    public function get($key, $default = null) {
        $result = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT setting_value, setting_type FROM {$this->table_name} WHERE setting_key = %s",
                $key
            )
        );

        if (!$result) {
            return $default;
        }

        return $this->unserialize_value($result->setting_value, $result->setting_type);
    }

    /**
     * Set setting value
     *
     * @param string $key   Setting key
     * @param mixed  $value Setting value
     * @return bool
     */
    public function set($key, $value) {
        $type = $this->get_value_type($value);
        $serialized_value = $this->serialize_value($value, $type);

        $existing = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT id FROM {$this->table_name} WHERE setting_key = %s",
                $key
            )
        );

        if ($existing) {
            return $this->wpdb->update(
                $this->table_name,
                array(
                    'setting_value' => $serialized_value,
                    'setting_type' => $type,
                ),
                array('setting_key' => $key)
            ) !== false;
        } else {
            return $this->wpdb->insert(
                $this->table_name,
                array(
                    'setting_key' => $key,
                    'setting_value' => $serialized_value,
                    'setting_type' => $type,
                )
            ) !== false;
        }
    }

    /**
     * Delete setting
     *
     * @param string $key Setting key
     * @return bool
     */
    public function delete($key) {
        return $this->wpdb->delete(
            $this->table_name,
            array('setting_key' => $key)
        ) !== false;
    }

    /**
     * Get value type
     *
     * @param mixed $value Value
     * @return string
     */
    private function get_value_type($value) {
        if (is_array($value)) {
            return 'array';
        } elseif (is_object($value)) {
            return 'object';
        } elseif (is_bool($value)) {
            return 'boolean';
        } elseif (is_int($value)) {
            return 'integer';
        } elseif (is_float($value)) {
            return 'float';
        } else {
            return 'string';
        }
    }

    /**
     * Serialize value
     *
     * @param mixed  $value Value
     * @param string $type  Type
     * @return string
     */
    private function serialize_value($value, $type) {
        if ($type === 'array' || $type === 'object') {
            return maybe_serialize($value);
        } elseif ($type === 'boolean') {
            return $value ? '1' : '0';
        } else {
            return (string) $value;
        }
    }

    /**
     * Unserialize value
     *
     * @param string $value Serialized value
     * @param string $type  Type
     * @return mixed
     */
    private function unserialize_value($value, $type) {
        if ($type === 'array' || $type === 'object') {
            return maybe_unserialize($value);
        } elseif ($type === 'boolean') {
            return $value === '1';
        } elseif ($type === 'integer') {
            return (int) $value;
        } elseif ($type === 'float') {
            return (float) $value;
        } else {
            return $value;
        }
    }
}
```

### File: `includes/class-cache.php`

```php
<?php
/**
 * Cache manager using Singleton pattern
 *
 * @package Settings_Manager_Singleton
 */

class Settings_Manager_Cache {
    /**
     * The single instance of the class
     *
     * @var Settings_Manager_Cache
     */
    private static $instance = null;

    /**
     * Cache group
     *
     * @var string
     */
    private $cache_group = 'sms_cache';

    /**
     * Private constructor
     */
    private function __construct() {
        // Constructor logic
    }

    /**
     * Prevent cloning
     */
    private function __clone() {
        // Prevent cloning
    }

    /**
     * Prevent unserialization
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Get the single instance
     *
     * @return Settings_Manager_Cache
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Get cached value
     *
     * @param string $key     Cache key
     * @param mixed  $default Default value
     * @return mixed
     */
    public function get($key, $default = null) {
        $value = wp_cache_get($key, $this->cache_group);

        if ($value === false) {
            return $default;
        }

        return $value;
    }

    /**
     * Set cached value
     *
     * @param string $key        Cache key
     * @param mixed  $value      Value to cache
     * @param int    $expiration Expiration in seconds (default: 1 hour)
     * @return bool
     */
    public function set($key, $value, $expiration = 3600) {
        return wp_cache_set($key, $value, $this->cache_group, $expiration);
    }

    /**
     * Delete cached value
     *
     * @param string $key Cache key
     * @return bool
     */
    public function delete($key) {
        return wp_cache_delete($key, $this->cache_group);
    }

    /**
     * Flush all cache
     *
     * @return bool
     */
    public function flush() {
        return wp_cache_flush();
    }

    /**
     * Remember - get from cache or execute callback and cache result
     *
     * @param string   $key        Cache key
     * @param callable $callback   Callback to execute if cache miss
     * @param int      $expiration Expiration in seconds
     * @return mixed
     */
    public function remember($key, $callback, $expiration = 3600) {
        $value = $this->get($key);

        if ($value !== null) {
            return $value;
        }

        $value = call_user_func($callback);
        $this->set($key, $value, $expiration);

        return $value;
    }
}
```

### File: `includes/class-config.php`

```php
<?php
/**
 * Config manager using Singleton pattern
 *
 * @package Settings_Manager_Singleton
 */

class Settings_Manager_Config {
    /**
     * The single instance of the class
     *
     * @var Settings_Manager_Config
     */
    private static $instance = null;

    /**
     * Configuration array
     *
     * @var array
     */
    private $config = array();

    /**
     * Private constructor
     */
    private function __construct() {
        $this->load_config();
    }

    /**
     * Prevent cloning
     */
    private function __clone() {
        // Prevent cloning
    }

    /**
     * Prevent unserialization
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Get the single instance
     *
     * @return Settings_Manager_Config
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Load configuration
     */
    private function load_config() {
        $this->config = array(
            'version' => SMS_VERSION,
            'plugin_dir' => SMS_PLUGIN_DIR,
            'plugin_url' => SMS_PLUGIN_URL,
            'cache_enabled' => true,
            'cache_expiration' => 3600,
            'debug_mode' => defined('WP_DEBUG') && WP_DEBUG,
        );

        // Allow filtering
        $this->config = apply_filters('sms_config', $this->config);
    }

    /**
     * Get config value
     *
     * @param string $key     Config key (supports dot notation)
     * @param mixed  $default Default value
     * @return mixed
     */
    public function get($key, $default = null) {
        // Support dot notation (e.g., 'cache.enabled')
        $keys = explode('.', $key);
        $value = $this->config;

        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    /**
     * Set config value
     *
     * @param string $key   Config key
     * @param mixed  $value Config value
     */
    public function set($key, $value) {
        $this->config[$key] = $value;
    }

    /**
     * Check if config key exists
     *
     * @param string $key Config key
     * @return bool
     */
    public function has($key) {
        return isset($this->config[$key]);
    }

    /**
     * Get all config
     *
     * @return array
     */
    public function all() {
        return $this->config;
    }

    /**
     * Set default options
     */
    public function set_defaults() {
        $defaults = array(
            'sms_enabled' => true,
            'sms_cache_enabled' => true,
            'sms_debug_mode' => false,
        );

        foreach ($defaults as $key => $value) {
            if (get_option($key) === false) {
                add_option($key, $value);
            }
        }
    }
}
```

### File: `includes/class-logger.php`

```php
<?php
/**
 * Logger using Singleton pattern
 *
 * @package Settings_Manager_Singleton
 */

class Settings_Manager_Logger {
    /**
     * The single instance of the class
     *
     * @var Settings_Manager_Logger
     */
    private static $instance = null;

    /**
     * Log file path
     *
     * @var string
     */
    private $log_file;

    /**
     * Private constructor
     */
    private function __construct() {
        $upload_dir = wp_upload_dir();
        $this->log_file = $upload_dir['basedir'] . '/sms-debug.log';
    }

    /**
     * Prevent cloning
     */
    private function __clone() {
        // Prevent cloning
    }

    /**
     * Prevent unserialization
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Get the single instance
     *
     * @return Settings_Manager_Logger
     */
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Log message
     *
     * @param string $message Log message
     * @param string $level   Log level (info, warning, error)
     */
    public function log($message, $level = 'info') {
        if (!Settings_Manager_Config::get_instance()->get('debug_mode')) {
            return;
        }

        $timestamp = current_time('Y-m-d H:i:s');
        $formatted_message = "[{$timestamp}] [{$level}] {$message}\n";

        error_log($formatted_message, 3, $this->log_file);
    }

    /**
     * Log info message
     *
     * @param string $message Message
     */
    public function info($message) {
        $this->log($message, 'info');
    }

    /**
     * Log warning message
     *
     * @param string $message Message
     */
    public function warning($message) {
        $this->log($message, 'warning');
    }

    /**
     * Log error message
     *
     * @param string $message Message
     */
    public function error($message) {
        $this->log($message, 'error');
    }

    /**
     * Clear log file
     */
    public function clear() {
        if (file_exists($this->log_file)) {
            unlink($this->log_file);
        }
    }
}
```


