# WordPress Plugin Documentation Standards

## Overview

This document defines documentation standards for WordPress plugins, covering inline code documentation (PHPDoc), readme.txt for WordPress.org, README.md for GitHub, and user-facing documentation.

---

## PHPDoc Standards

### File Headers

Every PHP file must include a file-level DocBlock:

```php
<?php
/**
 * Plugin Name: My Plugin
 * Description: Brief description
 * Version: 1.0.0
 * Author: Author Name
 * License: GPL-2.0+
 * Text Domain: my-plugin
 *
 * @package    My_Plugin
 * @subpackage My_Plugin/includes
 * @author     Author Name <email@example.com>
 * @license    GPL-2.0+ http://www.gnu.org/licenses/gpl-2.0.txt
 * @link       https://example.com
 * @since      1.0.0
 */
```

### Class Documentation

```php
/**
 * Main plugin class.
 *
 * Handles plugin initialization, loading dependencies, and defining hooks.
 *
 * @since      1.0.0
 * @package    My_Plugin
 * @subpackage My_Plugin/includes
 * @author     Author Name <email@example.com>
 */
class My_Plugin {
    
    /**
     * The unique identifier of this plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      string    $plugin_name    The string used to uniquely identify this plugin.
     */
    protected $plugin_name;
    
    /**
     * Initialize the plugin.
     *
     * Sets the plugin name and version, loads dependencies, defines locale,
     * and sets up admin and public hooks.
     *
     * @since    1.0.0
     */
    public function __construct() {
        // Constructor code
    }
}
```

### Function Documentation

```php
/**
 * Retrieve posts with custom meta query.
 *
 * @since    1.0.0
 * @param    array    $args    Query arguments.
 * @param    bool     $cache   Whether to use cached results. Default true.
 * @return   array|WP_Error    Array of posts or WP_Error on failure.
 */
function my_plugin_get_posts( $args = array(), $cache = true ) {
    // Function code
}
```

### Hook Documentation

```php
/**
 * Fires after plugin initialization.
 *
 * @since 1.0.0
 * @param My_Plugin $plugin The main plugin instance.
 */
do_action( 'my_plugin_initialized', $this );

/**
 * Filters the plugin settings before saving.
 *
 * @since 1.0.0
 * @param array $settings The plugin settings array.
 * @param int   $user_id  The current user ID.
 */
$settings = apply_filters( 'my_plugin_settings', $settings, get_current_user_id() );
```

### Required PHPDoc Tags

- `@since` - Version when introduced (required for all)
- `@param` - Parameter description (required for functions/methods with parameters)
- `@return` - Return value description (required for functions/methods that return values)
- `@access` - Access level (public, protected, private) for properties
- `@var` - Variable type for properties
- `@package` - Package name
- `@author` - Author information
- `@link` - Related URL
- `@see` - Related function/class
- `@deprecated` - Deprecation notice with version and alternative

---

## readme.txt (WordPress.org)

### Structure

```
=== Plugin Name ===
Contributors: username1, username2
Donate link: https://example.com/donate
Tags: tag1, tag2, tag3
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Short description (max 150 characters).

== Description ==

Detailed description of the plugin.

**Key Features:**

* Feature 1
* Feature 2
* Feature 3

**Use Cases:**

* Use case 1
* Use case 2

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/my-plugin`
2. Activate the plugin through the 'Plugins' menu
3. Configure settings at Settings > My Plugin

== Frequently Asked Questions ==

= Question 1? =

Answer 1.

= Question 2? =

Answer 2.

== Screenshots ==

1. Screenshot 1 description
2. Screenshot 2 description

== Changelog ==

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release.
```

### Best Practices

- **Contributors**: Use WordPress.org usernames
- **Tags**: Maximum 12 tags, use existing popular tags
- **Tested up to**: Keep updated with latest WordPress version
- **Short description**: Clear, concise, under 150 characters
- **Changelog**: Use semantic versioning, list all changes
- **Screenshots**: Number them, provide clear descriptions

---

## README.md (GitHub/Repository)

### Structure

```markdown
# Plugin Name

Brief description of the plugin.

## Description

Detailed description with features and benefits.

## Features

- Feature 1
- Feature 2
- Feature 3

## Requirements

- WordPress 6.0 or higher
- PHP 7.4 or higher

## Installation

### From WordPress.org

1. Go to Plugins > Add New
2. Search for "Plugin Name"
3. Click Install Now
4. Activate the plugin

### Manual Installation

1. Download the plugin zip file
2. Upload to `/wp-content/plugins/`
3. Activate through WordPress admin

### From Source

```bash
git clone https://github.com/username/plugin-name.git
cd plugin-name
composer install
npm install
npm run build
```

## Usage

### Basic Usage

```php
// Example code
```

### Advanced Usage

```php
// Advanced example
```

## Configuration

Configure the plugin at **Settings > Plugin Name**.

Available options:
- Option 1: Description
- Option 2: Description

## Hooks & Filters

### Actions

```php
// Hook into plugin initialization
add_action('my_plugin_init', 'my_custom_function');
```

### Filters

```php
// Filter plugin settings
add_filter('my_plugin_settings', 'my_custom_filter');
```

## Development

### Setup

```bash
composer install
npm install
```

### Build

```bash
npm run build
```

### Testing

```bash
composer test
npm test
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

## License

GPL-2.0+ - See [LICENSE](LICENSE) for details.

## Support

- [Documentation](https://example.com/docs)
- [Support Forum](https://wordpress.org/support/plugin/plugin-name)
- [Issue Tracker](https://github.com/username/plugin-name/issues)
```

---

## Inline Code Comments

### When to Comment

**DO comment:**
- Complex algorithms or business logic
- Non-obvious code behavior
- Workarounds for WordPress/PHP quirks
- Security-sensitive code
- Performance optimizations

**DON'T comment:**
- Obvious code (e.g., `// Set variable`)
- Self-explanatory function names
- Code that can be refactored to be clearer

### Comment Style

```php
// Single-line comment for brief explanations

/*
 * Multi-line comment for longer explanations
 * that span multiple lines.
 */

/**
 * DocBlock comment for functions, classes, and methods.
 * Always use DocBlocks for public APIs.
 */
```

---

## User Documentation

### Admin Help Tabs

```php
add_action('admin_head', 'my_plugin_add_help_tabs');

function my_plugin_add_help_tabs() {
    $screen = get_current_screen();

    $screen->add_help_tab(array(
        'id'      => 'my_plugin_overview',
        'title'   => __('Overview', 'my-plugin'),
        'content' => '<p>' . __('Help content here.', 'my-plugin') . '</p>',
    ));

    $screen->set_help_sidebar(
        '<p><strong>' . __('For more information:', 'my-plugin') . '</strong></p>' .
        '<p><a href="https://example.com/docs">' . __('Documentation', 'my-plugin') . '</a></p>'
    );
}
```

### Contextual Help

Provide help text near complex settings:

```php
<p class="description">
    <?php _e('This setting controls...', 'my-plugin'); ?>
</p>
```

---

## Changelog Management

### Format

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature description

### Changed
- Changed feature description

### Deprecated
- Deprecated feature description

### Removed
- Removed feature description

### Fixed
- Bug fix description

### Security
- Security fix description

## [1.0.0] - 2024-01-15

### Added
- Initial release
```

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

---

## Best Practices

### Documentation Checklist

- [ ] All public functions have PHPDoc comments
- [ ] All classes have PHPDoc comments
- [ ] All hooks (actions/filters) are documented
- [ ] readme.txt is complete and up-to-date
- [ ] README.md includes installation and usage instructions
- [ ] Changelog is updated for each release
- [ ] Code comments explain "why", not "what"
- [ ] Admin help tabs provide contextual assistance
- [ ] All user-facing strings are translatable

### Maintenance

- Update `Tested up to` with each WordPress release
- Keep changelog current with each version
- Review and update documentation quarterly
- Remove outdated screenshots and examples
- Update code examples to use current best practices

