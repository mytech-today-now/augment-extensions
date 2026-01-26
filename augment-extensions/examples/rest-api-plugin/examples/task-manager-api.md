# Task Manager REST API Plugin Example

## Overview

This example demonstrates a complete **REST API Plugin** with full CRUD operations (GET, POST, PUT, DELETE), authentication, validation, error handling, pagination, and JavaScript client examples.

**Complexity**: Medium  
**File Count**: 5-8 files  
**Team Size**: 1-2 developers  
**Use Case**: REST API development, CRUD operations, external integrations, headless WordPress

---

## Complete Plugin: "Task Manager API"

A comprehensive REST API plugin demonstrating WordPress REST API best practices with custom endpoints, authentication, validation, and JavaScript client integration.

---

## Directory Structure

```
task-manager-api/
├── task-manager-api.php           # Main plugin file
├── includes/
│   ├── class-api-controller.php   # API controller
│   ├── class-task-model.php       # Task model
│   └── class-validator.php        # Validation logic
├── assets/
│   └── js/
│       └── api-client.js          # JavaScript client
└── readme.txt                     # WordPress.org readme
```

---

## Main Plugin File

### File: `task-manager-api.php`

```php
<?php
/**
 * Plugin Name: Task Manager API
 * Plugin URI: https://example.com/task-manager-api
 * Description: REST API for task management with full CRUD operations
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: task-manager-api
 *
 * @package Task_Manager_API
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('TMA_VERSION', '1.0.0');
define('TMA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TMA_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Autoloader for plugin classes
 */
spl_autoload_register(function ($class) {
    $prefix = 'TMA_';
    $base_dir = TMA_PLUGIN_DIR . 'includes/';
    
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

/**
 * Register REST API routes
 */
function tma_register_routes() {
    $controller = new TMA_API_Controller();
    $controller->register_routes();
}
add_action('rest_api_init', 'tma_register_routes');

/**
 * Enqueue admin scripts
 */
function tma_enqueue_admin_scripts($hook) {
    if ('toplevel_page_task-manager-api' !== $hook) {
        return;
    }
    
    wp_enqueue_script(
        'tma-api-client',
        TMA_PLUGIN_URL . 'assets/js/api-client.js',
        array('wp-api-fetch'),
        TMA_VERSION,
        true
    );
    
    wp_localize_script('tma-api-client', 'tmaData', array(
        'apiUrl' => rest_url('task-manager/v1'),
        'nonce' => wp_create_nonce('wp_rest'),
    ));
}
add_action('admin_enqueue_scripts', 'tma_enqueue_admin_scripts');

/**
 * Add admin menu
 */
function tma_add_admin_menu() {
    add_menu_page(
        __('Task Manager API', 'task-manager-api'),
        __('Tasks', 'task-manager-api'),
        'manage_options',
        'task-manager-api',
        'tma_render_admin_page',
        'dashicons-list-view',
        25
    );
}
add_action('admin_menu', 'tma_add_admin_menu');

/**
 * Render admin page
 */
function tma_render_admin_page() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <div id="tma-app"></div>
    </div>
    <?php
}

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    // Create custom table for tasks
    global $wpdb;
    $table_name = $wpdb->prefix . 'tma_tasks';
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        title varchar(255) NOT NULL,
        description text,
        status varchar(20) DEFAULT 'pending',
        priority int(11) DEFAULT 1,
        user_id bigint(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY status (status)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    // Cleanup if needed
});
```

---

## API Controller

### File: `includes/class-api-controller.php`

```php
<?php
/**
 * API Controller
 *
 * @package Task_Manager_API
 */

class TMA_API_Controller extends WP_REST_Controller {

    /**
     * Namespace
     *
     * @var string
     */
    protected $namespace = 'task-manager/v1';

    /**
     * Rest base
     *
     * @var string
     */
    protected $rest_base = 'tasks';

    /**
     * Register routes
     */
    public function register_routes() {
        // GET /tasks - List all tasks
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_items'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args'                => $this->get_collection_params(),
            ),
            'schema' => array($this, 'get_item_schema'),
        ));

        // POST /tasks - Create task
        register_rest_route($this->namespace, '/' . $this->rest_base, array(
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'create_item'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args'                => $this->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
            ),
        ));

        // GET /tasks/{id} - Get single task
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_item'),
                'permission_callback' => array($this, 'get_item_permissions_check'),
                'args'                => array(
                    'id' => array(
                        'description' => __('Unique identifier for the task.', 'task-manager-api'),
                        'type'        => 'integer',
                    ),
                ),
            ),
        ));

        // PUT /tasks/{id} - Update task
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array($this, 'update_item'),
                'permission_callback' => array($this, 'update_item_permissions_check'),
                'args'                => $this->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
            ),
        ));

        // DELETE /tasks/{id} - Delete task
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array($this, 'delete_item'),
                'permission_callback' => array($this, 'delete_item_permissions_check'),
                'args'                => array(
                    'id' => array(
                        'description' => __('Unique identifier for the task.', 'task-manager-api'),
                        'type'        => 'integer',
                    ),
                ),
            ),
        ));
    }

    /**
     * Get collection of tasks
     *
     * @param WP_REST_Request $request Full request data.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_items($request) {
        $model = new TMA_Task_Model();

        $args = array(
            'page'     => $request->get_param('page') ?: 1,
            'per_page' => $request->get_param('per_page') ?: 10,
            'status'   => $request->get_param('status'),
            'user_id'  => $request->get_param('user_id'),
            'orderby'  => $request->get_param('orderby') ?: 'created_at',
            'order'    => $request->get_param('order') ?: 'DESC',
        );

        $tasks = $model->get_tasks($args);
        $total = $model->get_total_tasks($args);

        $data = array();
        foreach ($tasks as $task) {
            $data[] = $this->prepare_item_for_response($task, $request);
        }

        $response = rest_ensure_response($data);

        // Add pagination headers
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', ceil($total / $args['per_page']));

        return $response;
    }

    /**
     * Get single task
     *
     * @param WP_REST_Request $request Full request data.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_item($request) {
        $model = new TMA_Task_Model();
        $task = $model->get_task($request['id']);

        if (!$task) {
            return new WP_Error(
                'rest_task_not_found',
                __('Task not found.', 'task-manager-api'),
                array('status' => 404)
            );
        }

        return rest_ensure_response($this->prepare_item_for_response($task, $request));
    }

    /**
     * Create task
     *
     * @param WP_REST_Request $request Full request data.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function create_item($request) {
        $validator = new TMA_Validator();

        // Validate input
        $validation = $validator->validate_task_data($request->get_params());
        if (is_wp_error($validation)) {
            return $validation;
        }

        $model = new TMA_Task_Model();

        $data = array(
            'title'       => sanitize_text_field($request['title']),
            'description' => wp_kses_post($request['description']),
            'status'      => sanitize_text_field($request['status'] ?: 'pending'),
            'priority'    => absint($request['priority'] ?: 1),
            'user_id'     => get_current_user_id(),
        );

        $task_id = $model->create_task($data);

        if (!$task_id) {
            return new WP_Error(
                'rest_task_create_failed',
                __('Failed to create task.', 'task-manager-api'),
                array('status' => 500)
            );
        }

        $task = $model->get_task($task_id);

        return rest_ensure_response($this->prepare_item_for_response($task, $request));
    }

    /**
     * Update task
     *
     * @param WP_REST_Request $request Full request data.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function update_item($request) {
        $model = new TMA_Task_Model();
        $task = $model->get_task($request['id']);

        if (!$task) {
            return new WP_Error(
                'rest_task_not_found',
                __('Task not found.', 'task-manager-api'),
                array('status' => 404)
            );
        }

        $validator = new TMA_Validator();
        $validation = $validator->validate_task_data($request->get_params(), true);
        if (is_wp_error($validation)) {
            return $validation;
        }

        $data = array();
        if (isset($request['title'])) {
            $data['title'] = sanitize_text_field($request['title']);
        }
        if (isset($request['description'])) {
            $data['description'] = wp_kses_post($request['description']);
        }
        if (isset($request['status'])) {
            $data['status'] = sanitize_text_field($request['status']);
        }
        if (isset($request['priority'])) {
            $data['priority'] = absint($request['priority']);
        }

        $updated = $model->update_task($request['id'], $data);

        if (!$updated) {
            return new WP_Error(
                'rest_task_update_failed',
                __('Failed to update task.', 'task-manager-api'),
                array('status' => 500)
            );
        }

        $task = $model->get_task($request['id']);

        return rest_ensure_response($this->prepare_item_for_response($task, $request));
    }

    /**
     * Delete task
     *
     * @param WP_REST_Request $request Full request data.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function delete_item($request) {
        $model = new TMA_Task_Model();
        $task = $model->get_task($request['id']);

        if (!$task) {
            return new WP_Error(
                'rest_task_not_found',
                __('Task not found.', 'task-manager-api'),
                array('status' => 404)
            );
        }

        $deleted = $model->delete_task($request['id']);

        if (!$deleted) {
            return new WP_Error(
                'rest_task_delete_failed',
                __('Failed to delete task.', 'task-manager-api'),
                array('status' => 500)
            );
        }

        return rest_ensure_response(array(
            'deleted' => true,
            'previous' => $this->prepare_item_for_response($task, $request),
        ));
    }

    /**
     * Prepare item for response
     *
     * @param object          $item    Task object.
     * @param WP_REST_Request $request Request object.
     * @return array Response data.
     */
    protected function prepare_item_for_response($item, $request) {
        return array(
            'id'          => (int) $item->id,
            'title'       => $item->title,
            'description' => $item->description,
            'status'      => $item->status,
            'priority'    => (int) $item->priority,
            'user_id'     => (int) $item->user_id,
            'created_at'  => $item->created_at,
            'updated_at'  => $item->updated_at,
        );
    }

    /**
     * Permission check for getting items
     */
    public function get_items_permissions_check($request) {
        return current_user_can('read');
    }

    /**
     * Permission check for getting item
     */
    public function get_item_permissions_check($request) {
        return current_user_can('read');
    }

    /**
     * Permission check for creating item
     */
    public function create_item_permissions_check($request) {
        return current_user_can('edit_posts');
    }

    /**
     * Permission check for updating item
     */
    public function update_item_permissions_check($request) {
        return current_user_can('edit_posts');
    }

    /**
     * Permission check for deleting item
     */
    public function delete_item_permissions_check($request) {
        return current_user_can('delete_posts');
    }

    /**
     * Get collection parameters
     */
    public function get_collection_params() {
        return array(
            'page' => array(
                'description'       => __('Current page of the collection.', 'task-manager-api'),
                'type'              => 'integer',
                'default'           => 1,
                'sanitize_callback' => 'absint',
                'validate_callback' => 'rest_validate_request_arg',
                'minimum'           => 1,
            ),
            'per_page' => array(
                'description'       => __('Maximum number of items to be returned.', 'task-manager-api'),
                'type'              => 'integer',
                'default'           => 10,
                'minimum'           => 1,
                'maximum'           => 100,
                'sanitize_callback' => 'absint',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'status' => array(
                'description'       => __('Filter by status.', 'task-manager-api'),
                'type'              => 'string',
                'enum'              => array('pending', 'in_progress', 'completed'),
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'user_id' => array(
                'description'       => __('Filter by user ID.', 'task-manager-api'),
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'orderby' => array(
                'description'       => __('Order by field.', 'task-manager-api'),
                'type'              => 'string',
                'default'           => 'created_at',
                'enum'              => array('id', 'title', 'created_at', 'updated_at', 'priority'),
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => 'rest_validate_request_arg',
            ),
            'order' => array(
                'description'       => __('Order direction.', 'task-manager-api'),
                'type'              => 'string',
                'default'           => 'DESC',
                'enum'              => array('ASC', 'DESC'),
                'sanitize_callback' => 'sanitize_text_field',
                'validate_callback' => 'rest_validate_request_arg',
            ),
        );
    }

    /**
     * Get item schema
     */
    public function get_item_schema() {
        return array(
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'task',
            'type'       => 'object',
            'properties' => array(
                'id' => array(
                    'description' => __('Unique identifier for the task.', 'task-manager-api'),
                    'type'        => 'integer',
                    'context'     => array('view', 'edit'),
                    'readonly'    => true,
                ),
                'title' => array(
                    'description' => __('The title for the task.', 'task-manager-api'),
                    'type'        => 'string',
                    'context'     => array('view', 'edit'),
                    'required'    => true,
                    'arg_options' => array(
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
                'description' => array(
                    'description' => __('The description for the task.', 'task-manager-api'),
                    'type'        => 'string',
                    'context'     => array('view', 'edit'),
                    'arg_options' => array(
                        'sanitize_callback' => 'wp_kses_post',
                    ),
                ),
                'status' => array(
                    'description' => __('The status of the task.', 'task-manager-api'),
                    'type'        => 'string',
                    'enum'        => array('pending', 'in_progress', 'completed'),
                    'context'     => array('view', 'edit'),
                    'default'     => 'pending',
                ),
                'priority' => array(
                    'description' => __('The priority of the task.', 'task-manager-api'),
                    'type'        => 'integer',
                    'context'     => array('view', 'edit'),
                    'default'     => 1,
                    'minimum'     => 1,
                    'maximum'     => 5,
                ),
                'user_id' => array(
                    'description' => __('The user ID who created the task.', 'task-manager-api'),
                    'type'        => 'integer',
                    'context'     => array('view', 'edit'),
                    'readonly'    => true,
                ),
                'created_at' => array(
                    'description' => __('The date the task was created.', 'task-manager-api'),
                    'type'        => 'string',
                    'format'      => 'date-time',
                    'context'     => array('view', 'edit'),
                    'readonly'    => true,
                ),
                'updated_at' => array(
                    'description' => __('The date the task was last updated.', 'task-manager-api'),
                    'type'        => 'string',
                    'format'      => 'date-time',
                    'context'     => array('view', 'edit'),
                    'readonly'    => true,
                ),
            ),
        );
    }
}
```

---

## Task Model

### File: `includes/class-task-model.php`

```php
<?php
/**
 * Task Model
 *
 * @package Task_Manager_API
 */

class TMA_Task_Model {

    /**
     * Table name
     *
     * @var string
     */
    private $table_name;

    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'tma_tasks';
    }

    /**
     * Get tasks
     *
     * @param array $args Query arguments.
     * @return array Tasks.
     */
    public function get_tasks($args = array()) {
        global $wpdb;

        $defaults = array(
            'page'     => 1,
            'per_page' => 10,
            'status'   => null,
            'user_id'  => null,
            'orderby'  => 'created_at',
            'order'    => 'DESC',
        );

        $args = wp_parse_args($args, $defaults);

        $where = array('1=1');

        if ($args['status']) {
            $where[] = $wpdb->prepare('status = %s', $args['status']);
        }

        if ($args['user_id']) {
            $where[] = $wpdb->prepare('user_id = %d', $args['user_id']);
        }

        $where_clause = implode(' AND ', $where);

        $offset = ($args['page'] - 1) * $args['per_page'];

        $sql = $wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE {$where_clause} ORDER BY {$args['orderby']} {$args['order']} LIMIT %d OFFSET %d",
            $args['per_page'],
            $offset
        );

        return $wpdb->get_results($sql);
    }

    /**
     * Get total tasks
     *
     * @param array $args Query arguments.
     * @return int Total tasks.
     */
    public function get_total_tasks($args = array()) {
        global $wpdb;

        $where = array('1=1');

        if (isset($args['status']) && $args['status']) {
            $where[] = $wpdb->prepare('status = %s', $args['status']);
        }

        if (isset($args['user_id']) && $args['user_id']) {
            $where[] = $wpdb->prepare('user_id = %d', $args['user_id']);
        }

        $where_clause = implode(' AND ', $where);

        return (int) $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE {$where_clause}");
    }

    /**
     * Get single task
     *
     * @param int $id Task ID.
     * @return object|null Task object or null.
     */
    public function get_task($id) {
        global $wpdb;

        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE id = %d",
            $id
        ));
    }

    /**
     * Create task
     *
     * @param array $data Task data.
     * @return int|false Task ID or false on failure.
     */
    public function create_task($data) {
        global $wpdb;

        $inserted = $wpdb->insert(
            $this->table_name,
            $data,
            array('%s', '%s', '%s', '%d', '%d')
        );

        return $inserted ? $wpdb->insert_id : false;
    }

    /**
     * Update task
     *
     * @param int   $id   Task ID.
     * @param array $data Task data.
     * @return bool True on success, false on failure.
     */
    public function update_task($id, $data) {
        global $wpdb;

        return $wpdb->update(
            $this->table_name,
            $data,
            array('id' => $id),
            array('%s', '%s', '%s', '%d'),
            array('%d')
        );
    }

    /**
     * Delete task
     *
     * @param int $id Task ID.
     * @return bool True on success, false on failure.
     */
    public function delete_task($id) {
        global $wpdb;

        return $wpdb->delete(
            $this->table_name,
            array('id' => $id),
            array('%d')
        );
    }
}
```

---

## Validator

### File: `includes/class-validator.php`

```php
<?php
/**
 * Validator
 *
 * @package Task_Manager_API
 */

class TMA_Validator {

    /**
     * Validate task data
     *
     * @param array $data   Task data.
     * @param bool  $update Whether this is an update operation.
     * @return true|WP_Error True on success, WP_Error on failure.
     */
    public function validate_task_data($data, $update = false) {
        $errors = new WP_Error();

        // Title validation (required for create, optional for update)
        if (!$update && empty($data['title'])) {
            $errors->add(
                'rest_missing_title',
                __('Title is required.', 'task-manager-api'),
                array('status' => 400)
            );
        }

        if (isset($data['title']) && strlen($data['title']) > 255) {
            $errors->add(
                'rest_invalid_title',
                __('Title must be 255 characters or less.', 'task-manager-api'),
                array('status' => 400)
            );
        }

        // Status validation
        if (isset($data['status'])) {
            $valid_statuses = array('pending', 'in_progress', 'completed');
            if (!in_array($data['status'], $valid_statuses, true)) {
                $errors->add(
                    'rest_invalid_status',
                    __('Invalid status. Must be one of: pending, in_progress, completed.', 'task-manager-api'),
                    array('status' => 400)
                );
            }
        }

        // Priority validation
        if (isset($data['priority'])) {
            $priority = absint($data['priority']);
            if ($priority < 1 || $priority > 5) {
                $errors->add(
                    'rest_invalid_priority',
                    __('Priority must be between 1 and 5.', 'task-manager-api'),
                    array('status' => 400)
                );
            }
        }

        if ($errors->has_errors()) {
            return $errors;
        }

        return true;
    }
}
```

---

## JavaScript Client

### File: `assets/js/api-client.js`

```javascript
/**
 * Task Manager API Client
 *
 * @package Task_Manager_API
 */

(function() {
    'use strict';

    const { apiFetch } = wp;
    const apiUrl = tmaData.apiUrl;

    /**
     * Task Manager API Client
     */
    class TaskManagerAPI {

        /**
         * Get all tasks
         *
         * @param {Object} params Query parameters
         * @returns {Promise}
         */
        static async getTasks(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const url = `${apiUrl}/tasks${queryString ? '?' + queryString : ''}`;

            try {
                const response = await apiFetch({
                    path: url,
                    method: 'GET',
                });

                return response;
            } catch (error) {
                console.error('Error fetching tasks:', error);
                throw error;
            }
        }

        /**
         * Get single task
         *
         * @param {number} id Task ID
         * @returns {Promise}
         */
        static async getTask(id) {
            try {
                const response = await apiFetch({
                    path: `${apiUrl}/tasks/${id}`,
                    method: 'GET',
                });

                return response;
            } catch (error) {
                console.error(`Error fetching task ${id}:`, error);
                throw error;
            }
        }

        /**
         * Create task
         *
         * @param {Object} data Task data
         * @returns {Promise}
         */
        static async createTask(data) {
            try {
                const response = await apiFetch({
                    path: `${apiUrl}/tasks`,
                    method: 'POST',
                    data: data,
                });

                return response;
            } catch (error) {
                console.error('Error creating task:', error);
                throw error;
            }
        }

        /**
         * Update task
         *
         * @param {number} id   Task ID
         * @param {Object} data Task data
         * @returns {Promise}
         */
        static async updateTask(id, data) {
            try {
                const response = await apiFetch({
                    path: `${apiUrl}/tasks/${id}`,
                    method: 'PUT',
                    data: data,
                });

                return response;
            } catch (error) {
                console.error(`Error updating task ${id}:`, error);
                throw error;
            }
        }

        /**
         * Delete task
         *
         * @param {number} id Task ID
         * @returns {Promise}
         */
        static async deleteTask(id) {
            try {
                const response = await apiFetch({
                    path: `${apiUrl}/tasks/${id}`,
                    method: 'DELETE',
                });

                return response;
            } catch (error) {
                console.error(`Error deleting task ${id}:`, error);
                throw error;
            }
        }
    }

    /**
     * Example usage
     */
    document.addEventListener('DOMContentLoaded', async function() {

        // Get all tasks
        try {
            const tasks = await TaskManagerAPI.getTasks({
                page: 1,
                per_page: 10,
                status: 'pending',
            });
            console.log('Tasks:', tasks);
        } catch (error) {
            console.error('Failed to fetch tasks');
        }

        // Create task
        try {
            const newTask = await TaskManagerAPI.createTask({
                title: 'New Task',
                description: 'Task description',
                status: 'pending',
                priority: 3,
            });
            console.log('Created task:', newTask);
        } catch (error) {
            console.error('Failed to create task');
        }

        // Update task
        try {
            const updatedTask = await TaskManagerAPI.updateTask(1, {
                status: 'completed',
            });
            console.log('Updated task:', updatedTask);
        } catch (error) {
            console.error('Failed to update task');
        }

        // Delete task
        try {
            const result = await TaskManagerAPI.deleteTask(1);
            console.log('Deleted task:', result);
        } catch (error) {
            console.error('Failed to delete task');
        }
    });

    // Make API client available globally
    window.TaskManagerAPI = TaskManagerAPI;

})();
```

---

## Using Fetch API (Alternative)

### Vanilla JavaScript with Fetch

```javascript
/**
 * Task Manager API Client (Fetch API)
 */
class TaskManagerFetchAPI {

    constructor(apiUrl, nonce) {
        this.apiUrl = apiUrl;
        this.nonce = nonce;
    }

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': this.nonce,
            },
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, mergedOptions);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get all tasks
     */
    async getTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/tasks${queryString ? '?' + queryString : ''}`);
    }

    /**
     * Get single task
     */
    async getTask(id) {
        return this.request(`/tasks/${id}`);
    }

    /**
     * Create task
     */
    async createTask(data) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update task
     */
    async updateTask(id, data) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Delete task
     */
    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }
}

// Usage
const api = new TaskManagerFetchAPI(
    'https://example.com/wp-json/task-manager/v1',
    tmaData.nonce
);

// Get tasks
api.getTasks({ status: 'pending' })
    .then(tasks => console.log(tasks))
    .catch(error => console.error(error));
```

---

## Testing the API

### Using cURL

```bash
# Get all tasks
curl -X GET https://example.com/wp-json/task-manager/v1/tasks

# Get tasks with filters
curl -X GET "https://example.com/wp-json/task-manager/v1/tasks?status=pending&per_page=5"

# Get single task
curl -X GET https://example.com/wp-json/task-manager/v1/tasks/1

# Create task (requires authentication)
curl -X POST https://example.com/wp-json/task-manager/v1/tasks \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: YOUR_NONCE" \
  --cookie "wordpress_logged_in_HASH=YOUR_COOKIE" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "status": "pending",
    "priority": 3
  }'

# Update task
curl -X PUT https://example.com/wp-json/task-manager/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: YOUR_NONCE" \
  --cookie "wordpress_logged_in_HASH=YOUR_COOKIE" \
  -d '{
    "status": "completed"
  }'

# Delete task
curl -X DELETE https://example.com/wp-json/task-manager/v1/tasks/1 \
  -H "X-WP-Nonce: YOUR_NONCE" \
  --cookie "wordpress_logged_in_HASH=YOUR_COOKIE"
```

### Using Postman

1. **Set up authentication**:
   - Method: Cookie Authentication
   - Add `X-WP-Nonce` header

2. **Test endpoints**:
   - GET `/wp-json/task-manager/v1/tasks`
   - POST `/wp-json/task-manager/v1/tasks`
   - PUT `/wp-json/task-manager/v1/tasks/{id}`
   - DELETE `/wp-json/task-manager/v1/tasks/{id}`

---

## Key Features Demonstrated

### 1. **Complete CRUD Operations**
- ✅ GET (list and single)
- ✅ POST (create)
- ✅ PUT (update)
- ✅ DELETE (delete)

### 2. **Authentication & Permissions**
- ✅ Permission callbacks for each endpoint
- ✅ User capability checks
- ✅ Nonce verification

### 3. **Validation**
- ✅ Input validation
- ✅ Schema validation
- ✅ Error responses

### 4. **Pagination**
- ✅ Page and per_page parameters
- ✅ Total count headers
- ✅ Collection parameters

### 5. **Error Handling**
- ✅ WP_Error responses
- ✅ Proper HTTP status codes
- ✅ Descriptive error messages

### 6. **JavaScript Integration**
- ✅ wp.apiFetch client
- ✅ Vanilla Fetch API client
- ✅ Error handling in JavaScript

---

## Best Practices Demonstrated

1. **Use WP_REST_Controller** - Extends base controller class
2. **Schema definition** - Proper schema with validation
3. **Permission callbacks** - Security checks for each endpoint
4. **Sanitization** - All input sanitized
5. **Error handling** - Proper WP_Error usage
6. **Pagination** - Collection endpoints support pagination
7. **Versioning** - API namespace includes version (v1)
8. **Documentation** - Clear docblocks and comments

---

## Next Steps

1. Add unit tests for API endpoints
2. Implement caching for GET requests
3. Add rate limiting
4. Implement webhook notifications
5. Add batch operations endpoint
6. Create Swagger/OpenAPI documentation

