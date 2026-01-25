# WordPress Plugin Architecture Patterns

## Overview

This document outlines 7 proven WordPress plugin architecture patterns, from simple procedural to enterprise-level. Choose the appropriate pattern based on plugin complexity, team size, and long-term maintenance needs.

---

## Pattern 1: Simple Procedural Plugin

**Complexity**: Low  
**File Count**: 1-3 files  
**Team Size**: 1 developer  
**Use Case**: Single feature, utility functions, quick prototypes

### Structure

```
my-plugin/
├── my-plugin.php          # Main plugin file (all code)
└── readme.txt             # WordPress.org readme
```

### Implementation

```php
<?php
/**
 * Plugin Name: My Simple Plugin
 * Description: A simple plugin
 * Version: 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Add action hooks
add_action('init', 'my_plugin_init');
add_filter('the_content', 'my_plugin_filter_content');

function my_plugin_init() {
    // Initialization code
}

function my_plugin_filter_content($content) {
    // Filter content
    return $content;
}
```

### When to Use

✅ Single feature plugins (e.g., disable comments, add custom CSS)  
✅ Utility functions  
✅ Quick prototypes  
✅ Learning/tutorial plugins  

### Pros & Cons

**Pros**: Simple, fast to develop, easy to understand  
**Cons**: Hard to maintain as complexity grows, no separation of concerns

---

## Pattern 2: Organized Procedural Plugin

**Complexity**: Medium  
**File Count**: 5-20 files  
**Team Size**: 1-2 developers  
**Use Case**: Medium-sized plugins, organized code, team collaboration

### Structure

```
my-plugin/
├── my-plugin.php          # Main plugin file (loader)
├── includes/
│   ├── functions.php      # Core functions
│   ├── hooks.php          # Hook callbacks
│   └── shortcodes.php     # Shortcode handlers
├── admin/
│   ├── settings.php       # Admin settings
│   └── meta-boxes.php     # Meta boxes
├── public/
│   └── display.php        # Frontend display
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── languages/
├── uninstall.php
└── readme.txt
```

### Implementation

**Main Plugin File** (`my-plugin.php`):

```php
<?php
/**
 * Plugin Name: My Organized Plugin
 * Description: An organized procedural plugin
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('MY_PLUGIN_VERSION', '1.0.0');
define('MY_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('MY_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load dependencies
require_once MY_PLUGIN_PATH . 'includes/functions.php';
require_once MY_PLUGIN_PATH . 'includes/hooks.php';

// Admin functionality
if (is_admin()) {
    require_once MY_PLUGIN_PATH . 'admin/settings.php';
}

// Public functionality
if (!is_admin()) {
    require_once MY_PLUGIN_PATH . 'public/display.php';
}

// Activation/Deactivation
register_activation_hook(__FILE__, 'my_plugin_activate');
register_deactivation_hook(__FILE__, 'my_plugin_deactivate');
```

### When to Use

✅ Multiple features  
✅ Admin and frontend functionality  
✅ Custom assets (CSS/JS)  
✅ Team collaboration  

### Pros & Cons

**Pros**: Organized, easier to maintain, clear separation  
**Cons**: Still procedural, limited extensibility

---

## Pattern 3: Object-Oriented Plugin

**Complexity**: Medium-High  
**File Count**: 10-50 files  
**Team Size**: 2-5 developers  
**Use Case**: Large plugins, maintainable code, extensibility

### Structure

```
my-plugin/
├── my-plugin.php          # Main plugin file (bootstrap)
├── includes/
│   ├── class-plugin.php   # Main plugin class
│   ├── class-admin.php    # Admin functionality
│   ├── class-public.php   # Public functionality
│   ├── class-loader.php   # Hook loader
│   └── class-activator.php # Activation logic
├── admin/
│   ├── class-settings.php # Settings page
│   └── partials/          # Admin view templates
├── public/
│   ├── class-shortcode.php # Shortcode handler
│   └── partials/          # Public view templates
├── assets/
├── languages/
├── uninstall.php
└── readme.txt
```

### Implementation

**Main Plugin File** (`my-plugin.php`):

```php
<?php
/**
 * Plugin Name: My OOP Plugin
 * Description: An object-oriented plugin
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('MY_PLUGIN_VERSION', '1.0.0');
define('MY_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'My_Plugin_';
    $base_dir = MY_PLUGIN_PATH . 'includes/';

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

// Activation/Deactivation
register_activation_hook(__FILE__, array('My_Plugin_Activator', 'activate'));
register_deactivation_hook(__FILE__, array('My_Plugin_Deactivator', 'deactivate'));

// Run the plugin
function run_my_plugin() {
    $plugin = new My_Plugin();
    $plugin->run();
}
run_my_plugin();
```

**Main Plugin Class** (`includes/class-plugin.php`):

```php
<?php
class My_Plugin {
    protected $loader;
    protected $plugin_name;
    protected $version;

    public function __construct() {
        $this->version = MY_PLUGIN_VERSION;
        $this->plugin_name = 'my-plugin';

        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    private function load_dependencies() {
        require_once MY_PLUGIN_PATH . 'includes/class-loader.php';
        require_once MY_PLUGIN_PATH . 'includes/class-admin.php';
        require_once MY_PLUGIN_PATH . 'includes/class-public.php';

        $this->loader = new My_Plugin_Loader();
    }

    private function define_admin_hooks() {
        $admin = new My_Plugin_Admin($this->plugin_name, $this->version);
        $this->loader->add_action('admin_menu', $admin, 'add_admin_menu');
        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_styles');
    }

    private function define_public_hooks() {
        $public = new My_Plugin_Public($this->plugin_name, $this->version);
        $this->loader->add_action('wp_enqueue_scripts', $public, 'enqueue_styles');
    }

    public function run() {
        $this->loader->run();
    }
}
```

### When to Use

✅ Complex functionality
✅ Need for extensibility
✅ Multiple developers
✅ Long-term maintenance

### Pros & Cons

**Pros**: Maintainable, extensible, testable, clear structure
**Cons**: More complex, steeper learning curve

---

## Pattern 4: WordPress Plugin Boilerplate (WPPB)

**Complexity**: High
**File Count**: 20-100 files
**Team Size**: 3-10 developers
**Use Case**: Professional plugins, standardized structure, large teams

### Structure

```
plugin-name/
├── plugin-name.php
├── admin/
│   ├── class-plugin-name-admin.php
│   ├── css/
│   ├── js/
│   └── partials/
├── includes/
│   ├── class-plugin-name.php
│   ├── class-plugin-name-loader.php
│   ├── class-plugin-name-i18n.php
│   ├── class-plugin-name-activator.php
│   └── class-plugin-name-deactivator.php
├── public/
│   ├── class-plugin-name-public.php
│   ├── css/
│   ├── js/
│   └── partials/
├── languages/
├── uninstall.php
└── README.txt
```

### When to Use

✅ Professional/commercial plugins
✅ Standardized team workflow
✅ WordPress.org submission
✅ Long-term support

### Pros & Cons

**Pros**: Industry standard, well-documented, proven structure
**Cons**: Overkill for simple plugins, verbose

---

## Pattern 5: Namespace-Based Plugin

**Complexity**: Medium-High
**File Count**: 10-50 files
**Team Size**: 2-5 developers
**Use Case**: Modern PHP, PSR-4 autoloading, Composer dependencies

### Structure

```
my-plugin/
├── my-plugin.php
├── src/
│   ├── Plugin.php
│   ├── Admin/
│   │   ├── Settings.php
│   │   └── MetaBoxes.php
│   ├── Frontend/
│   │   ├── Shortcodes.php
│   │   └── Widgets.php
│   └── Core/
│       ├── Activator.php
│       └── Deactivator.php
├── vendor/               # Composer dependencies
├── composer.json
└── readme.txt
```

### Implementation

**composer.json**:

```json
{
    "name": "vendor/my-plugin",
    "autoload": {
        "psr-4": {
            "MyPlugin\\": "src/"
        }
    },
    "require": {
        "php": ">=7.4"
    }
}
```

**Main Plugin File** (`my-plugin.php`):

```php
<?php
/**
 * Plugin Name: My Namespace Plugin
 * Description: A modern namespace-based plugin
 * Version: 1.0.0
 * Requires PHP: 7.4
 */

namespace MyPlugin;

if (!defined('ABSPATH')) {
    exit;
}

// Composer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Define constants
define('MY_PLUGIN_VERSION', '1.0.0');
define('MY_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Activation/Deactivation
register_activation_hook(__FILE__, [Core\Activator::class, 'activate']);
register_deactivation_hook(__FILE__, [Core\Deactivator::class, 'deactivate']);

// Run plugin
(new Plugin())->run();
```

**Plugin Class** (`src/Plugin.php`):

```php
<?php
namespace MyPlugin;

class Plugin {
    public function run() {
        add_action('init', [$this, 'init']);

        if (is_admin()) {
            new Admin\Settings();
        } else {
            new Frontend\Shortcodes();
        }
    }

    public function init() {
        // Initialization code
    }
}
```

### When to Use

✅ Modern PHP (7.4+)
✅ Composer dependencies
✅ PSR-4 autoloading
✅ Third-party libraries

### Pros & Cons

**Pros**: Modern, clean namespaces, Composer support
**Cons**: Requires Composer, not beginner-friendly

---

## Pattern 6: Service Container Plugin

**Complexity**: High
**File Count**: 30-100 files
**Team Size**: 5-15 developers
**Use Case**: Enterprise plugins, dependency injection, testability

### Structure

```
my-plugin/
├── my-plugin.php
├── src/
│   ├── Container.php
│   ├── ServiceProvider.php
│   ├── Services/
│   │   ├── DatabaseService.php
│   │   ├── CacheService.php
│   │   └── ApiService.php
│   ├── Controllers/
│   │   ├── AdminController.php
│   │   └── FrontendController.php
│   └── Models/
│       └── Post.php
├── config/
│   └── services.php
├── vendor/
├── composer.json
└── readme.txt
```

### Implementation

**Service Container** (`src/Container.php`):

```php
<?php
namespace MyPlugin;

class Container {
    private $services = [];

    public function register($name, $resolver) {
        $this->services[$name] = $resolver;
    }

    public function resolve($name) {
        if (!isset($this->services[$name])) {
            throw new \Exception("Service {$name} not found");
        }

        $resolver = $this->services[$name];
        return $resolver($this);
    }
}
```

**Service Provider** (`src/ServiceProvider.php`):

```php
<?php
namespace MyPlugin;

class ServiceProvider {
    public static function register(Container $container) {
        $container->register('database', function($c) {
            return new Services\DatabaseService();
        });

        $container->register('cache', function($c) {
            return new Services\CacheService();
        });

        $container->register('admin', function($c) {
            return new Controllers\AdminController(
                $c->resolve('database'),
                $c->resolve('cache')
            );
        });
    }
}
```

### When to Use

✅ Enterprise-level plugins
✅ Complex dependencies
✅ High testability requirements
✅ Large development teams

### Pros & Cons

**Pros**: Highly testable, dependency injection, scalable
**Cons**: Complex, overkill for most plugins

---

## Pattern 7: Modular Plugin System

**Complexity**: Very High
**File Count**: 50-500 files
**Team Size**: 10+ developers
**Use Case**: Plugin frameworks, extensible platforms, add-on ecosystems

### Structure

```
my-plugin/
├── my-plugin.php
├── src/
│   ├── Core/
│   │   ├── ModuleLoader.php
│   │   ├── HookManager.php
│   │   └── EventDispatcher.php
│   ├── Modules/
│   │   ├── Admin/
│   │   ├── Frontend/
│   │   ├── API/
│   │   └── Database/
│   └── Interfaces/
│       └── ModuleInterface.php
├── modules/              # Third-party modules
├── config/
├── vendor/
└── readme.txt
```

### Implementation

**Module Interface** (`src/Interfaces/ModuleInterface.php`):

```php
<?php
namespace MyPlugin\Interfaces;

interface ModuleInterface {
    public function register();
    public function boot();
    public function getName();
}
```

**Module Loader** (`src/Core/ModuleLoader.php`):

```php
<?php
namespace MyPlugin\Core;

use MyPlugin\Interfaces\ModuleInterface;

class ModuleLoader {
    private $modules = [];

    public function register(ModuleInterface $module) {
        $this->modules[$module->getName()] = $module;
        $module->register();
    }

    public function boot() {
        foreach ($this->modules as $module) {
            $module->boot();
        }
    }
}
```

### When to Use

✅ Plugin frameworks (e.g., WooCommerce, BuddyPress)
✅ Extensible platforms
✅ Add-on ecosystems
✅ Very large teams

### Pros & Cons

**Pros**: Extremely extensible, modular, scalable
**Cons**: Very complex, requires significant architecture

---

## Choosing the Right Pattern

### Decision Matrix

| Pattern | Complexity | Files | Team Size | Use Case |
|---------|-----------|-------|-----------|----------|
| Simple Procedural | Low | 1-3 | 1 | Single feature |
| Organized Procedural | Medium | 5-20 | 1-2 | Multiple features |
| Object-Oriented | Medium-High | 10-50 | 2-5 | Large plugins |
| WPPB | High | 20-100 | 3-10 | Professional |
| Namespace-Based | Medium-High | 10-50 | 2-5 | Modern PHP |
| Service Container | High | 30-100 | 5-15 | Enterprise |
| Modular System | Very High | 50-500 | 10+ | Frameworks |

### Recommendation Flow

1. **Single feature?** → Simple Procedural
2. **Multiple features, 1-2 devs?** → Organized Procedural
3. **Need extensibility?** → Object-Oriented
4. **Professional/commercial?** → WPPB
5. **Using Composer?** → Namespace-Based
6. **Enterprise-level?** → Service Container
7. **Building framework?** → Modular System

---

## Best Practices

### All Patterns

✅ Always check `ABSPATH` constant
✅ Use proper WordPress coding standards
✅ Sanitize input, escape output
✅ Use WordPress APIs (don't reinvent the wheel)
✅ Follow semantic versioning

### OOP Patterns

✅ Use dependency injection
✅ Follow SOLID principles
✅ Write unit tests
✅ Use interfaces for contracts
✅ Keep classes focused (single responsibility)

### Modern Patterns

✅ Use Composer for dependencies
✅ Follow PSR-4 autoloading
✅ Use namespaces
✅ Leverage modern PHP features
✅ Write PHPDoc blocks

---

## Anti-Patterns to Avoid

❌ Global variables (use constants or class properties)
❌ Direct database queries (use `$wpdb` or WP_Query)
❌ Hardcoded paths (use `plugin_dir_path()`)
❌ Mixing HTML and PHP logic
❌ Not using WordPress hooks
❌ Ignoring security (nonces, sanitization)
❌ Not following WordPress coding standards

