# MVC Plugin Example

## Overview

This example demonstrates **Model-View-Controller (MVC) Pattern** - a clean separation of data, presentation, and business logic for WordPress plugins.

**Complexity**: Medium-High  
**File Count**: 15-40 files  
**Team Size**: 2-5 developers  
**Use Case**: Complex business logic, multiple views, testable code, clear separation of concerns

---

## Complete Plugin: "Task Manager MVC"

A complete task management plugin demonstrating MVC architecture with models, views, controllers, and routing.

---

## Directory Structure

```
task-manager-mvc/
├── task-manager-mvc.php           # Main plugin file (bootstrap)
├── uninstall.php                  # Uninstall cleanup
├── readme.txt                     # WordPress.org readme
├── app/
│   ├── models/
│   │   ├── Task.php               # Task model
│   │   ├── Category.php           # Category model
│   │   └── BaseModel.php          # Base model class
│   ├── controllers/
│   │   ├── TaskController.php     # Task controller
│   │   ├── CategoryController.php # Category controller
│   │   └── BaseController.php     # Base controller class
│   ├── views/
│   │   ├── tasks/
│   │   │   ├── index.php          # Task list view
│   │   │   ├── create.php         # Create task view
│   │   │   ├── edit.php           # Edit task view
│   │   │   └── show.php           # Single task view
│   │   ├── categories/
│   │   │   ├── index.php          # Category list view
│   │   │   └── form.php           # Category form view
│   │   └── layouts/
│   │       ├── admin.php          # Admin layout
│   │       └── public.php         # Public layout
│   └── core/
│       ├── Router.php             # URL routing
│       ├── View.php               # View renderer
│       ├── Database.php           # Database abstraction
│       └── Validator.php          # Input validation
├── assets/
│   ├── css/
│   │   ├── admin.css
│   │   └── public.css
│   └── js/
│       ├── admin.js
│       └── public.js
└── languages/
    └── task-manager-mvc.pot
```

---

## Main Plugin File

### File: `task-manager-mvc.php`

```php
<?php
/**
 * Plugin Name: Task Manager MVC
 * Plugin URI: https://example.com/task-manager-mvc
 * Description: Task management with MVC architecture
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: task-manager-mvc
 * Domain Path: /languages
 *
 * @package Task_Manager_MVC
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('TMM_VERSION', '1.0.0');
define('TMM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TMM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TMM_APP_DIR', TMM_PLUGIN_DIR . 'app/');

/**
 * PSR-4 Autoloader
 */
spl_autoload_register(function ($class) {
    // Only autoload our classes
    if (strpos($class, 'TMM\\') !== 0) {
        return;
    }
    
    // Remove namespace prefix
    $class = str_replace('TMM\\', '', $class);
    
    // Convert namespace separators to directory separators
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    
    // Build file path
    $file = TMM_APP_DIR . $class . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    require_once TMM_PLUGIN_DIR . 'install.php';
    TMM_Install::activate();
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    require_once TMM_PLUGIN_DIR . 'install.php';
    TMM_Install::deactivate();
});

/**
 * Initialize the plugin
 */
add_action('plugins_loaded', function() {
    // Load text domain
    load_plugin_textdomain('task-manager-mvc', false, dirname(plugin_basename(__FILE__)) . '/languages');
    
    // Initialize router
    $router = new TMM\Core\Router();
    $router->init();
});

/**
 * Admin menu
 */
add_action('admin_menu', function() {
    add_menu_page(
        __('Task Manager', 'task-manager-mvc'),
        __('Tasks', 'task-manager-mvc'),
        'manage_options',
        'tmm-tasks',
        'tmm_render_admin_page',
        'dashicons-list-view',
        25
    );
});

/**
 * Render admin page (entry point for router)
 */
function tmm_render_admin_page() {
    $router = new TMM\Core\Router();
    $router->dispatch();
}

/**
 * Enqueue assets
 */
add_action('admin_enqueue_scripts', function($hook) {
    if (strpos($hook, 'tmm-') !== 0) {
        return;
    }
    
    wp_enqueue_style('tmm-admin', TMM_PLUGIN_URL . 'assets/css/admin.css', array(), TMM_VERSION);
    wp_enqueue_script('tmm-admin', TMM_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), TMM_VERSION, true);
});
```

---

## MVC Core Components

### File: `app/core/Router.php`

```php
<?php
namespace TMM\Core;

/**
 * Router class - handles URL routing and dispatching to controllers
 *
 * @package Task_Manager_MVC
 */
class Router {
    /**
     * Routes registry
     *
     * @var array
     */
    private $routes = array();

    /**
     * Initialize router and register routes
     */
    public function init() {
        $this->register_routes();
    }

    /**
     * Register all routes
     */
    private function register_routes() {
        // Task routes
        $this->add_route('GET', 'tasks', 'TaskController@index');
        $this->add_route('GET', 'tasks/create', 'TaskController@create');
        $this->add_route('POST', 'tasks/store', 'TaskController@store');
        $this->add_route('GET', 'tasks/edit', 'TaskController@edit');
        $this->add_route('POST', 'tasks/update', 'TaskController@update');
        $this->add_route('POST', 'tasks/delete', 'TaskController@delete');

        // Category routes
        $this->add_route('GET', 'categories', 'CategoryController@index');
        $this->add_route('POST', 'categories/store', 'CategoryController@store');
    }

    /**
     * Add a route
     *
     * @param string $method HTTP method
     * @param string $path   Route path
     * @param string $action Controller@method
     */
    public function add_route($method, $path, $action) {
        $this->routes[$method][$path] = $action;
    }

    /**
     * Dispatch request to appropriate controller
     */
    public function dispatch() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = isset($_GET['action']) ? sanitize_text_field($_GET['action']) : 'tasks';

        // Find matching route
        if (isset($this->routes[$method][$action])) {
            $route = $this->routes[$method][$action];
            $this->call_controller($route);
        } else {
            // Default to task index
            $this->call_controller('TaskController@index');
        }
    }

    /**
     * Call controller method
     *
     * @param string $route Controller@method string
     */
    private function call_controller($route) {
        list($controller, $method) = explode('@', $route);

        $controller_class = "TMM\\Controllers\\{$controller}";

        if (class_exists($controller_class)) {
            $controller_instance = new $controller_class();

            if (method_exists($controller_instance, $method)) {
                $controller_instance->$method();
            }
        }
    }
}
```

### File: `app/core/View.php`

```php
<?php
namespace TMM\Core;

/**
 * View class - handles view rendering
 *
 * @package Task_Manager_MVC
 */
class View {
    /**
     * Render a view
     *
     * @param string $view View path (e.g., 'tasks/index')
     * @param array  $data Data to pass to view
     * @param string $layout Layout to use (default: 'admin')
     */
    public static function render($view, $data = array(), $layout = 'admin') {
        // Extract data to variables
        extract($data);

        // Start output buffering
        ob_start();

        // Include view file
        $view_file = TMM_APP_DIR . 'views/' . $view . '.php';
        if (file_exists($view_file)) {
            include $view_file;
        } else {
            echo '<p>View not found: ' . esc_html($view) . '</p>';
        }

        // Get view content
        $content = ob_get_clean();

        // Render with layout
        if ($layout) {
            self::render_layout($layout, $content, $data);
        } else {
            echo $content;
        }
    }

    /**
     * Render layout
     *
     * @param string $layout  Layout name
     * @param string $content View content
     * @param array  $data    Additional data
     */
    private static function render_layout($layout, $content, $data = array()) {
        extract($data);

        $layout_file = TMM_APP_DIR . 'views/layouts/' . $layout . '.php';
        if (file_exists($layout_file)) {
            include $layout_file;
        } else {
            echo $content;
        }
    }

    /**
     * Render partial view
     *
     * @param string $partial Partial view path
     * @param array  $data    Data to pass to partial
     */
    public static function partial($partial, $data = array()) {
        extract($data);

        $partial_file = TMM_APP_DIR . 'views/' . $partial . '.php';
        if (file_exists($partial_file)) {
            include $partial_file;
        }
    }
}
```

### File: `app/core/Validator.php`

```php
<?php
namespace TMM\Core;

/**
 * Validator class - handles input validation
 *
 * @package Task_Manager_MVC
 */
class Validator {
    /**
     * Validation errors
     *
     * @var array
     */
    private $errors = array();

    /**
     * Validate data against rules
     *
     * @param array $data  Data to validate
     * @param array $rules Validation rules
     * @return bool
     */
    public function validate($data, $rules) {
        $this->errors = array();

        foreach ($rules as $field => $rule_string) {
            $rules_array = explode('|', $rule_string);

            foreach ($rules_array as $rule) {
                $this->apply_rule($field, $data[$field] ?? '', $rule);
            }
        }

        return empty($this->errors);
    }

    /**
     * Apply validation rule
     *
     * @param string $field Field name
     * @param mixed  $value Field value
     * @param string $rule  Rule to apply
     */
    private function apply_rule($field, $value, $rule) {
        if ($rule === 'required' && empty($value)) {
            $this->errors[$field][] = sprintf(__('%s is required', 'task-manager-mvc'), ucfirst($field));
        }

        if (strpos($rule, 'min:') === 0) {
            $min = (int) substr($rule, 4);
            if (strlen($value) < $min) {
                $this->errors[$field][] = sprintf(__('%s must be at least %d characters', 'task-manager-mvc'), ucfirst($field), $min);
            }
        }

        if (strpos($rule, 'max:') === 0) {
            $max = (int) substr($rule, 4);
            if (strlen($value) > $max) {
                $this->errors[$field][] = sprintf(__('%s must not exceed %d characters', 'task-manager-mvc'), ucfirst($field), $max);
            }
        }
    }

    /**
     * Get validation errors
     *
     * @return array
     */
    public function errors() {
        return $this->errors;
    }

    /**
     * Check if validation has errors
     *
     * @return bool
     */
    public function has_errors() {
        return !empty($this->errors);
    }
}
```

---

## Model Layer

### File: `app/models/BaseModel.php`

```php
<?php
namespace TMM\Models;

/**
 * Base Model class - provides common database operations
 *
 * @package Task_Manager_MVC
 */
abstract class BaseModel {
    /**
     * Database table name
     *
     * @var string
     */
    protected $table;

    /**
     * Primary key column
     *
     * @var string
     */
    protected $primary_key = 'id';

    /**
     * Model attributes
     *
     * @var array
     */
    protected $attributes = array();

    /**
     * Get WordPress database object
     *
     * @return wpdb
     */
    protected function db() {
        global $wpdb;
        return $wpdb;
    }

    /**
     * Get full table name with prefix
     *
     * @return string
     */
    protected function get_table_name() {
        return $this->db()->prefix . $this->table;
    }

    /**
     * Find record by ID
     *
     * @param int $id Record ID
     * @return static|null
     */
    public static function find($id) {
        $instance = new static();
        $table = $instance->get_table_name();
        $pk = $instance->primary_key;

        $result = $instance->db()->get_row(
            $instance->db()->prepare("SELECT * FROM {$table} WHERE {$pk} = %d", $id),
            ARRAY_A
        );

        if ($result) {
            $instance->attributes = $result;
            return $instance;
        }

        return null;
    }

    /**
     * Get all records
     *
     * @param array $where Where conditions
     * @param array $order_by Order by clauses
     * @return array
     */
    public static function all($where = array(), $order_by = array()) {
        $instance = new static();
        $table = $instance->get_table_name();

        $sql = "SELECT * FROM {$table}";

        if (!empty($where)) {
            $conditions = array();
            foreach ($where as $key => $value) {
                $conditions[] = $instance->db()->prepare("{$key} = %s", $value);
            }
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }

        if (!empty($order_by)) {
            $sql .= " ORDER BY " . implode(', ', $order_by);
        }

        $results = $instance->db()->get_results($sql, ARRAY_A);

        $models = array();
        foreach ($results as $result) {
            $model = new static();
            $model->attributes = $result;
            $models[] = $model;
        }

        return $models;
    }

    /**
     * Save model (insert or update)
     *
     * @return bool
     */
    public function save() {
        $table = $this->get_table_name();

        if (isset($this->attributes[$this->primary_key]) && $this->attributes[$this->primary_key] > 0) {
            // Update
            $id = $this->attributes[$this->primary_key];
            unset($this->attributes[$this->primary_key]);

            $result = $this->db()->update(
                $table,
                $this->attributes,
                array($this->primary_key => $id)
            );

            $this->attributes[$this->primary_key] = $id;
            return $result !== false;
        } else {
            // Insert
            $result = $this->db()->insert($table, $this->attributes);

            if ($result) {
                $this->attributes[$this->primary_key] = $this->db()->insert_id;
                return true;
            }

            return false;
        }
    }

    /**
     * Delete model
     *
     * @return bool
     */
    public function delete() {
        if (!isset($this->attributes[$this->primary_key])) {
            return false;
        }

        $table = $this->get_table_name();

        return $this->db()->delete(
            $table,
            array($this->primary_key => $this->attributes[$this->primary_key])
        ) !== false;
    }

    /**
     * Get attribute value
     *
     * @param string $key Attribute key
     * @return mixed
     */
    public function __get($key) {
        return $this->attributes[$key] ?? null;
    }

    /**
     * Set attribute value
     *
     * @param string $key   Attribute key
     * @param mixed  $value Attribute value
     */
    public function __set($key, $value) {
        $this->attributes[$key] = $value;
    }

    /**
     * Get all attributes
     *
     * @return array
     */
    public function to_array() {
        return $this->attributes;
    }
}
```

### File: `app/models/Task.php`

```php
<?php
namespace TMM\Models;

/**
 * Task Model
 *
 * @package Task_Manager_MVC
 */
class Task extends BaseModel {
    /**
     * Table name
     *
     * @var string
     */
    protected $table = 'tmm_tasks';

    /**
     * Get tasks by status
     *
     * @param string $status Task status
     * @return array
     */
    public static function by_status($status) {
        return self::all(array('status' => $status), array('created_at DESC'));
    }

    /**
     * Get tasks by category
     *
     * @param int $category_id Category ID
     * @return array
     */
    public static function by_category($category_id) {
        return self::all(array('category_id' => $category_id), array('created_at DESC'));
    }

    /**
     * Mark task as complete
     *
     * @return bool
     */
    public function mark_complete() {
        $this->status = 'completed';
        $this->completed_at = current_time('mysql');
        return $this->save();
    }

    /**
     * Check if task is overdue
     *
     * @return bool
     */
    public function is_overdue() {
        if (empty($this->due_date) || $this->status === 'completed') {
            return false;
        }

        return strtotime($this->due_date) < time();
    }

    /**
     * Get category
     *
     * @return Category|null
     */
    public function category() {
        if (empty($this->category_id)) {
            return null;
        }

        return Category::find($this->category_id);
    }
}
```

### File: `app/models/Category.php`

```php
<?php
namespace TMM\Models;

/**
 * Category Model
 *
 * @package Task_Manager_MVC
 */
class Category extends BaseModel {
    /**
     * Table name
     *
     * @var string
     */
    protected $table = 'tmm_categories';

    /**
     * Get tasks in this category
     *
     * @return array
     */
    public function tasks() {
        return Task::by_category($this->id);
    }

    /**
     * Get task count
     *
     * @return int
     */
    public function task_count() {
        $table = $this->db()->prefix . 'tmm_tasks';

        return (int) $this->db()->get_var(
            $this->db()->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE category_id = %d",
                $this->id
            )
        );
    }
}
```

---

## Controller Layer

### File: `app/controllers/BaseController.php`

```php
<?php
namespace TMM\Controllers;

use TMM\Core\View;
use TMM\Core\Validator;

/**
 * Base Controller class
 *
 * @package Task_Manager_MVC
 */
abstract class BaseController {
    /**
     * Validator instance
     *
     * @var Validator
     */
    protected $validator;

    /**
     * Constructor
     */
    public function __construct() {
        $this->validator = new Validator();
    }

    /**
     * Render view
     *
     * @param string $view   View path
     * @param array  $data   Data to pass to view
     * @param string $layout Layout to use
     */
    protected function view($view, $data = array(), $layout = 'admin') {
        View::render($view, $data, $layout);
    }

    /**
     * Redirect to URL
     *
     * @param string $url URL to redirect to
     */
    protected function redirect($url) {
        wp_safe_redirect($url);
        exit;
    }

    /**
     * Redirect back with message
     *
     * @param string $message Message to display
     * @param string $type    Message type (success, error, warning, info)
     */
    protected function redirect_back($message, $type = 'success') {
        set_transient('tmm_flash_message', array('message' => $message, 'type' => $type), 30);
        $this->redirect(wp_get_referer());
    }

    /**
     * Verify nonce
     *
     * @param string $action Nonce action
     * @param string $name   Nonce name
     * @return bool
     */
    protected function verify_nonce($action, $name = '_wpnonce') {
        return isset($_POST[$name]) && wp_verify_nonce($_POST[$name], $action);
    }

    /**
     * Check user capability
     *
     * @param string $capability Capability to check
     * @return bool
     */
    protected function can($capability) {
        return current_user_can($capability);
    }
}
```

### File: `app/controllers/TaskController.php`

```php
<?php
namespace TMM\Controllers;

use TMM\Models\Task;
use TMM\Models\Category;

/**
 * Task Controller
 *
 * @package Task_Manager_MVC
 */
class TaskController extends BaseController {
    /**
     * Display task list
     */
    public function index() {
        $status = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : 'all';

        if ($status === 'all') {
            $tasks = Task::all(array(), array('created_at DESC'));
        } else {
            $tasks = Task::by_status($status);
        }

        $this->view('tasks/index', array(
            'tasks' => $tasks,
            'current_status' => $status,
        ));
    }

    /**
     * Show create task form
     */
    public function create() {
        $categories = Category::all();

        $this->view('tasks/create', array(
            'categories' => $categories,
        ));
    }

    /**
     * Store new task
     */
    public function store() {
        // Verify nonce
        if (!$this->verify_nonce('tmm_create_task')) {
            wp_die(__('Security check failed', 'task-manager-mvc'));
        }

        // Check capability
        if (!$this->can('manage_options')) {
            wp_die(__('You do not have permission to perform this action', 'task-manager-mvc'));
        }

        // Validate input
        $valid = $this->validator->validate($_POST, array(
            'title' => 'required|min:3|max:200',
            'description' => 'max:1000',
        ));

        if (!$valid) {
            set_transient('tmm_validation_errors', $this->validator->errors(), 30);
            $this->redirect_back('', 'error');
            return;
        }

        // Create task
        $task = new Task();
        $task->title = sanitize_text_field($_POST['title']);
        $task->description = sanitize_textarea_field($_POST['description']);
        $task->category_id = isset($_POST['category_id']) ? absint($_POST['category_id']) : 0;
        $task->due_date = isset($_POST['due_date']) ? sanitize_text_field($_POST['due_date']) : '';
        $task->status = 'pending';
        $task->created_at = current_time('mysql');

        if ($task->save()) {
            $this->redirect_back(__('Task created successfully', 'task-manager-mvc'), 'success');
        } else {
            $this->redirect_back(__('Failed to create task', 'task-manager-mvc'), 'error');
        }
    }

    /**
     * Show edit task form
     */
    public function edit() {
        $task_id = isset($_GET['id']) ? absint($_GET['id']) : 0;
        $task = Task::find($task_id);

        if (!$task) {
            wp_die(__('Task not found', 'task-manager-mvc'));
        }

        $categories = Category::all();

        $this->view('tasks/edit', array(
            'task' => $task,
            'categories' => $categories,
        ));
    }

    /**
     * Update task
     */
    public function update() {
        // Verify nonce
        if (!$this->verify_nonce('tmm_update_task')) {
            wp_die(__('Security check failed', 'task-manager-mvc'));
        }

        // Check capability
        if (!$this->can('manage_options')) {
            wp_die(__('You do not have permission to perform this action', 'task-manager-mvc'));
        }

        $task_id = isset($_POST['task_id']) ? absint($_POST['task_id']) : 0;
        $task = Task::find($task_id);

        if (!$task) {
            $this->redirect_back(__('Task not found', 'task-manager-mvc'), 'error');
            return;
        }

        // Validate input
        $valid = $this->validator->validate($_POST, array(
            'title' => 'required|min:3|max:200',
            'description' => 'max:1000',
        ));

        if (!$valid) {
            set_transient('tmm_validation_errors', $this->validator->errors(), 30);
            $this->redirect_back('', 'error');
            return;
        }

        // Update task
        $task->title = sanitize_text_field($_POST['title']);
        $task->description = sanitize_textarea_field($_POST['description']);
        $task->category_id = isset($_POST['category_id']) ? absint($_POST['category_id']) : 0;
        $task->due_date = isset($_POST['due_date']) ? sanitize_text_field($_POST['due_date']) : '';
        $task->status = isset($_POST['status']) ? sanitize_text_field($_POST['status']) : 'pending';
        $task->updated_at = current_time('mysql');

        if ($task->save()) {
            $this->redirect_back(__('Task updated successfully', 'task-manager-mvc'), 'success');
        } else {
            $this->redirect_back(__('Failed to update task', 'task-manager-mvc'), 'error');
        }
    }

    /**
     * Delete task
     */
    public function delete() {
        // Verify nonce
        if (!$this->verify_nonce('tmm_delete_task')) {
            wp_die(__('Security check failed', 'task-manager-mvc'));
        }

        // Check capability
        if (!$this->can('manage_options')) {
            wp_die(__('You do not have permission to perform this action', 'task-manager-mvc'));
        }

        $task_id = isset($_POST['task_id']) ? absint($_POST['task_id']) : 0;
        $task = Task::find($task_id);

        if (!$task) {
            $this->redirect_back(__('Task not found', 'task-manager-mvc'), 'error');
            return;
        }

        if ($task->delete()) {
            $this->redirect_back(__('Task deleted successfully', 'task-manager-mvc'), 'success');
        } else {
            $this->redirect_back(__('Failed to delete task', 'task-manager-mvc'), 'error');
        }
    }
}
```

---

## View Layer

### File: `app/views/layouts/admin.php`

```php
<div class="wrap tmm-admin">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <?php
    // Display flash messages
    $flash = get_transient('tmm_flash_message');
    if ($flash):
        delete_transient('tmm_flash_message');
    ?>
        <div class="notice notice-<?php echo esc_attr($flash['type']); ?> is-dismissible">
            <p><?php echo esc_html($flash['message']); ?></p>
        </div>
    <?php endif; ?>

    <?php
    // Display validation errors
    $errors = get_transient('tmm_validation_errors');
    if ($errors):
        delete_transient('tmm_validation_errors');
    ?>
        <div class="notice notice-error is-dismissible">
            <p><strong><?php _e('Validation errors:', 'task-manager-mvc'); ?></strong></p>
            <ul>
                <?php foreach ($errors as $field => $field_errors): ?>
                    <?php foreach ($field_errors as $error): ?>
                        <li><?php echo esc_html($error); ?></li>
                    <?php endforeach; ?>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <div class="tmm-content">
        <?php echo $content; ?>
    </div>
</div>
```

### File: `app/views/tasks/index.php`

```php
<div class="tmm-tasks-index">
    <div class="tmm-header">
        <a href="<?php echo admin_url('admin.php?page=tmm-tasks&action=tasks/create'); ?>" class="button button-primary">
            <?php _e('Add New Task', 'task-manager-mvc'); ?>
        </a>

        <div class="tmm-filters">
            <a href="<?php echo admin_url('admin.php?page=tmm-tasks&status=all'); ?>"
               class="<?php echo $current_status === 'all' ? 'current' : ''; ?>">
                <?php _e('All', 'task-manager-mvc'); ?>
            </a>
            <a href="<?php echo admin_url('admin.php?page=tmm-tasks&status=pending'); ?>"
               class="<?php echo $current_status === 'pending' ? 'current' : ''; ?>">
                <?php _e('Pending', 'task-manager-mvc'); ?>
            </a>
            <a href="<?php echo admin_url('admin.php?page=tmm-tasks&status=completed'); ?>"
               class="<?php echo $current_status === 'completed' ? 'current' : ''; ?>">
                <?php _e('Completed', 'task-manager-mvc'); ?>
            </a>
        </div>
    </div>

    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php _e('Title', 'task-manager-mvc'); ?></th>
                <th><?php _e('Category', 'task-manager-mvc'); ?></th>
                <th><?php _e('Due Date', 'task-manager-mvc'); ?></th>
                <th><?php _e('Status', 'task-manager-mvc'); ?></th>
                <th><?php _e('Actions', 'task-manager-mvc'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($tasks)): ?>
                <tr>
                    <td colspan="5"><?php _e('No tasks found', 'task-manager-mvc'); ?></td>
                </tr>
            <?php else: ?>
                <?php foreach ($tasks as $task): ?>
                    <tr class="<?php echo $task->is_overdue() ? 'tmm-overdue' : ''; ?>">
                        <td>
                            <strong><?php echo esc_html($task->title); ?></strong>
                            <?php if ($task->is_overdue()): ?>
                                <span class="tmm-badge tmm-badge-danger"><?php _e('Overdue', 'task-manager-mvc'); ?></span>
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php
                            $category = $task->category();
                            echo $category ? esc_html($category->name) : '—';
                            ?>
                        </td>
                        <td><?php echo $task->due_date ? esc_html(date('M j, Y', strtotime($task->due_date))) : '—'; ?></td>
                        <td>
                            <span class="tmm-status tmm-status-<?php echo esc_attr($task->status); ?>">
                                <?php echo esc_html(ucfirst($task->status)); ?>
                            </span>
                        </td>
                        <td>
                            <a href="<?php echo admin_url('admin.php?page=tmm-tasks&action=tasks/edit&id=' . $task->id); ?>"
                               class="button button-small">
                                <?php _e('Edit', 'task-manager-mvc'); ?>
                            </a>

                            <form method="post" action="<?php echo admin_url('admin.php?page=tmm-tasks&action=tasks/delete'); ?>"
                                  style="display:inline;"
                                  onsubmit="return confirm('<?php _e('Are you sure?', 'task-manager-mvc'); ?>');">
                                <?php wp_nonce_field('tmm_delete_task'); ?>
                                <input type="hidden" name="task_id" value="<?php echo esc_attr($task->id); ?>">
                                <button type="submit" class="button button-small button-link-delete">
                                    <?php _e('Delete', 'task-manager-mvc'); ?>
                                </button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</div>
```

### File: `app/views/tasks/create.php`

```php
<div class="tmm-task-form">
    <form method="post" action="<?php echo admin_url('admin.php?page=tmm-tasks&action=tasks/store'); ?>">
        <?php wp_nonce_field('tmm_create_task'); ?>

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="title"><?php _e('Title', 'task-manager-mvc'); ?> <span class="required">*</span></label>
                </th>
                <td>
                    <input type="text"
                           id="title"
                           name="title"
                           class="regular-text"
                           required>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="description"><?php _e('Description', 'task-manager-mvc'); ?></label>
                </th>
                <td>
                    <textarea id="description"
                              name="description"
                              rows="5"
                              class="large-text"></textarea>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="category_id"><?php _e('Category', 'task-manager-mvc'); ?></label>
                </th>
                <td>
                    <select id="category_id" name="category_id">
                        <option value="0"><?php _e('None', 'task-manager-mvc'); ?></option>
                        <?php foreach ($categories as $category): ?>
                            <option value="<?php echo esc_attr($category->id); ?>">
                                <?php echo esc_html($category->name); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="due_date"><?php _e('Due Date', 'task-manager-mvc'); ?></label>
                </th>
                <td>
                    <input type="date"
                           id="due_date"
                           name="due_date">
                </td>
            </tr>
        </table>

        <p class="submit">
            <input type="submit"
                   class="button button-primary"
                   value="<?php _e('Create Task', 'task-manager-mvc'); ?>">
            <a href="<?php echo admin_url('admin.php?page=tmm-tasks'); ?>"
               class="button">
                <?php _e('Cancel', 'task-manager-mvc'); ?>
            </a>
        </p>
    </form>
</div>
```

---

## MVC Principles Demonstrated

### 1. **Model** - Data and Business Logic

✅ **Encapsulates data access**: All database operations in model classes
✅ **Business logic**: Methods like `is_overdue()`, `mark_complete()`
✅ **Relationships**: `task->category()`, `category->tasks()`
✅ **Reusable**: Models used by multiple controllers

### 2. **View** - Presentation Layer

✅ **No business logic**: Views only display data
✅ **Reusable layouts**: Admin layout wraps all views
✅ **Partials**: Reusable view components
✅ **Proper escaping**: All output escaped for security

### 3. **Controller** - Request Handling

✅ **Handles requests**: Processes form submissions
✅ **Coordinates**: Calls models, passes data to views
✅ **Validation**: Validates input before processing
✅ **Security**: Nonce verification, capability checks

### 4. **Router** - URL Mapping

✅ **Clean URLs**: Maps actions to controller methods
✅ **RESTful**: GET for display, POST for modifications
✅ **Centralized**: All routes in one place

---

## Advantages of MVC Pattern

### ✅ Separation of Concerns

- **Models**: Handle data and business logic
- **Views**: Handle presentation
- **Controllers**: Handle request/response flow
- **Easy to modify**: Change one layer without affecting others

### ✅ Testability

- **Unit test models**: Test business logic independently
- **Test controllers**: Mock models and test request handling
- **Test views**: Verify output without database

### ✅ Reusability

- **Models**: Reused across admin and public
- **Views**: Partials and layouts reduce duplication
- **Controllers**: Base controller provides common functionality

### ✅ Maintainability

- **Clear structure**: Easy to find code
- **Predictable**: Consistent patterns throughout
- **Scalable**: Easy to add new features

### ✅ Team Collaboration

- **Parallel development**: Frontend and backend developers work independently
- **Clear responsibilities**: Each layer has specific role
- **Code review**: Smaller, focused files

---

## When to Use MVC Pattern

### ✅ Good Use Cases

- **Complex business logic**: Multiple models with relationships
- **Multiple views**: Different ways to display same data
- **Team development**: Frontend and backend developers
- **Testability required**: Unit and integration testing
- **Long-term maintenance**: Plugin will evolve over time
- **API development**: Models can serve both UI and API

### ❌ Not Suitable For

- **Simple plugins**: Single feature, minimal logic (use Pattern 1)
- **Quick prototypes**: Temporary or experimental code
- **Beginner projects**: Learning WordPress basics
- **Micro-plugins**: Very specific, focused functionality

---

## Best Practices

### 1. **Model Best Practices**

```php
// Good - Business logic in model
class Task extends BaseModel {
    public function is_overdue() {
        return strtotime($this->due_date) < time();
    }
}

// Bad - Business logic in controller
if (strtotime($task->due_date) < time()) {
    // ...
}
```

### 2. **View Best Practices**

```php
// Good - No logic in view
<?php echo esc_html($task->title); ?>

// Bad - Business logic in view
<?php
$category = Category::find($task->category_id);
echo $category->name;
?>
```

### 3. **Controller Best Practices**

```php
// Good - Thin controller
public function store() {
    $this->validate_request();
    $task = $this->create_task_from_request();
    $task->save();
    $this->redirect_with_message('Success');
}

// Bad - Fat controller with business logic
public function store() {
    // 100 lines of business logic
}
```

### 4. **Router Best Practices**

```php
// Good - RESTful routes
$this->add_route('GET', 'tasks', 'TaskController@index');
$this->add_route('POST', 'tasks/store', 'TaskController@store');

// Bad - Inconsistent routes
$this->add_route('GET', 'show_tasks', 'TaskController@show');
$this->add_route('GET', 'save_task', 'TaskController@save');
```

### 5. **Security Best Practices**

```php
// Always in controllers
public function store() {
    // 1. Verify nonce
    if (!$this->verify_nonce('action_name')) {
        wp_die('Security check failed');
    }

    // 2. Check capability
    if (!$this->can('manage_options')) {
        wp_die('Permission denied');
    }

    // 3. Validate input
    $this->validator->validate($_POST, $rules);

    // 4. Sanitize input
    $value = sanitize_text_field($_POST['value']);
}
```

---

## Installation Example

### File: `install.php`

```php
<?php
class TMM_Install {
    public static function activate() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        // Tasks table
        $tasks_table = $wpdb->prefix . 'tmm_tasks';
        $sql_tasks = "CREATE TABLE $tasks_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(200) NOT NULL,
            description text,
            category_id bigint(20) DEFAULT 0,
            due_date date,
            status varchar(20) DEFAULT 'pending',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime,
            completed_at datetime,
            PRIMARY KEY  (id),
            KEY category_id (category_id),
            KEY status (status)
        ) $charset_collate;";

        // Categories table
        $categories_table = $wpdb->prefix . 'tmm_categories';
        $sql_categories = "CREATE TABLE $categories_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            slug varchar(100) NOT NULL,
            description text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY slug (slug)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_tasks);
        dbDelta($sql_categories);

        add_option('tmm_db_version', '1.0.0');
    }

    public static function deactivate() {
        // Cleanup if needed
    }
}
```

---

## Comparison with Other Patterns

| Feature | Simple Procedural | OOP | MVC | WPPB |
|---------|------------------|-----|-----|------|
| **Complexity** | Low | Medium-High | Medium-High | High |
| **File Count** | 1-3 | 10-30 | 15-40 | 20-100 |
| **Learning Curve** | Easy | Moderate | Moderate-Steep | Steep |
| **Separation of Concerns** | None | Good | Excellent | Excellent |
| **Testability** | Low | High | Very High | Very High |
| **Business Logic** | Mixed | In classes | In models | In models |
| **View Reusability** | None | Low | High | High |
| **Team Size** | 1 | 2-5 | 2-5 | 3-10 |
| **Best For** | Simple plugins | Complex plugins | Complex business logic | Professional plugins |

---

## Migration Path

### From OOP to MVC

1. **Extract models** from existing classes
2. **Create controllers** for request handling
3. **Move views** to separate files
4. **Add router** for URL mapping
5. **Refactor** to follow MVC principles

### Example Migration

**Before (OOP):**
```php
class Task_Manager {
    public function display_tasks() {
        $tasks = $this->get_tasks();
        include 'views/tasks.php';
    }

    private function get_tasks() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM tasks");
    }
}
```

**After (MVC):**
```php
// Model
class Task extends BaseModel {
    protected $table = 'tasks';
}

// Controller
class TaskController extends BaseController {
    public function index() {
        $tasks = Task::all();
        $this->view('tasks/index', compact('tasks'));
    }
}

// View (tasks/index.php)
<?php foreach ($tasks as $task): ?>
    <div><?php echo esc_html($task->title); ?></div>
<?php endforeach; ?>
```

---

## Testing Example

### Unit Test for Task Model

```php
<?php
class Task_Model_Test extends WP_UnitTestCase {
    public function test_task_creation() {
        $task = new TMM\Models\Task();
        $task->title = 'Test Task';
        $task->status = 'pending';
        $task->save();

        $this->assertGreaterThan(0, $task->id);
        $this->assertEquals('Test Task', $task->title);
    }

    public function test_is_overdue() {
        $task = new TMM\Models\Task();
        $task->due_date = date('Y-m-d', strtotime('-1 day'));
        $task->status = 'pending';

        $this->assertTrue($task->is_overdue());
    }

    public function test_category_relationship() {
        $category = new TMM\Models\Category();
        $category->name = 'Work';
        $category->save();

        $task = new TMM\Models\Task();
        $task->category_id = $category->id;
        $task->save();

        $this->assertEquals('Work', $task->category()->name);
    }
}
```

---

## Related Patterns

- **Pattern 1**: [Simple Procedural Plugin](simple-procedural-plugin.md) - For simple plugins
- **Pattern 3**: [Object-Oriented Plugin](object-oriented-plugin.md) - OOP without MVC
- **Pattern 4**: [WPPB Plugin](wppb-plugin.md) - Professional standard
- **Pattern 6**: [Service Container Plugin](service-container-plugin.md) - Dependency injection

---

## Additional Resources

- [MVC Pattern Explained](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- [WordPress MVC Frameworks](https://wordpress.org/plugins/tags/mvc/)
- [Testing WordPress Plugins](https://make.wordpress.org/core/handbook/testing/automated-testing/phpunit/)
- [RESTful Routing](https://restfulapi.net/)

---

## Summary

This MVC plugin example demonstrates:

✅ **Complete MVC architecture** with models, views, controllers
✅ **Router** for clean URL mapping
✅ **Base classes** for code reusability
✅ **Model layer** with business logic and relationships
✅ **View layer** with layouts and partials
✅ **Controller layer** with request handling and validation
✅ **Security best practices** (nonces, capability checks, sanitization)
✅ **Validation** with custom validator class
✅ **Flash messages** for user feedback
✅ **Database abstraction** in base model
✅ **RESTful routing** for clean URLs
✅ **Testable code** structure

**Perfect for**: Complex business logic, multiple views, team development, testable code, long-term maintenance.

**Next steps**: For even more structure with dependency injection, consider Pattern 6 (Service Container) or modern frameworks like Laravel-style WordPress development.

