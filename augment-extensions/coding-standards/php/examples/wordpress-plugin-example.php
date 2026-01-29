<?php
/**
 * Plugin Name: Custom Content Manager
 * Plugin URI: https://example.com/custom-content-manager
 * Description: A custom WordPress plugin demonstrating best practices for plugin development
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: custom-content-manager
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CCM_VERSION', '1.0.0');
define('CCM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CCM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CCM_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
class Custom_Content_Manager
{
    private static $instance = null;
    
    /**
     * Singleton instance
     */
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct()
    {
        $this->load_dependencies();
        $this->init_hooks();
    }
    
    /**
     * Load required files
     */
    private function load_dependencies()
    {
        require_once CCM_PLUGIN_DIR . 'includes/class-ccm-post-type.php';
        require_once CCM_PLUGIN_DIR . 'includes/class-ccm-meta-box.php';
        require_once CCM_PLUGIN_DIR . 'includes/class-ccm-shortcode.php';
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks()
    {
        // Activation/Deactivation
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
        
        // Core hooks
        add_action('init', [$this, 'init']);
        add_action('admin_init', [$this, 'admin_init']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        
        // AJAX hooks
        add_action('wp_ajax_ccm_save_settings', [$this, 'ajax_save_settings']);
        add_action('wp_ajax_ccm_get_content', [$this, 'ajax_get_content']);
    }
    
    /**
     * Plugin activation
     */
    public function activate()
    {
        // Create custom database table if needed
        global $wpdb;
        $table_name = $wpdb->prefix . 'ccm_content';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            content_type varchar(50) NOT NULL,
            content_data longtext NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY post_id (post_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Set default options
        add_option('ccm_version', CCM_VERSION);
        add_option('ccm_settings', [
            'enable_feature_x' => true,
            'items_per_page' => 10
        ]);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate()
    {
        flush_rewrite_rules();
    }
    
    /**
     * Initialize plugin
     */
    public function init()
    {
        // Load text domain for translations
        load_plugin_textdomain(
            'custom-content-manager',
            false,
            dirname(CCM_PLUGIN_BASENAME) . '/languages'
        );
        
        // Register custom post type
        CCM_Post_Type::register();
        
        // Register shortcodes
        CCM_Shortcode::register();
    }
    
    /**
     * Admin initialization
     */
    public function admin_init()
    {
        // Register settings
        register_setting('ccm_settings_group', 'ccm_settings', [
            'sanitize_callback' => [$this, 'sanitize_settings']
        ]);
        
        // Add meta boxes
        add_action('add_meta_boxes', [CCM_Meta_Box::class, 'add']);
        add_action('save_post', [CCM_Meta_Box::class, 'save']);
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu()
    {
        add_menu_page(
            __('Content Manager', 'custom-content-manager'),
            __('Content Manager', 'custom-content-manager'),
            'manage_options',
            'custom-content-manager',
            [$this, 'render_admin_page'],
            'dashicons-admin-generic',
            20
        );
        
        add_submenu_page(
            'custom-content-manager',
            __('Settings', 'custom-content-manager'),
            __('Settings', 'custom-content-manager'),
            'manage_options',
            'ccm-settings',
            [$this, 'render_settings_page']
        );
    }
}

