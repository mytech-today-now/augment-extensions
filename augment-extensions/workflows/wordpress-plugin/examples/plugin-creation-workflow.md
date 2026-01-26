# Plugin Creation Workflow Example

This example demonstrates the complete workflow for creating a new WordPress plugin from scratch using OpenSpec and Beads.

## Scenario

Creating a "Reading Time Estimator" plugin that displays estimated reading time for posts and pages.

## Plugin Concept

- **Plugin Name**: Reading Time Estimator
- **Plugin Slug**: reading-time-estimator
- **Text Domain**: reading-time-estimator
- **Purpose**: Calculate and display estimated reading time for WordPress posts/pages
- **Features**:
  - Automatic reading time calculation (words per minute configurable)
  - Display reading time before/after content
  - Shortcode support: `[reading_time]`
  - Settings page for customization
  - Support for custom post types

## Workflow Steps

### Step 1: Create OpenSpec Proposal

**File**: `openspec/changes/reading-time-plugin/proposal.md`

```markdown
---
id: reading-time-plugin
relatedTasks: []
relatedRules: [module-development.md]
status: draft
---

# Reading Time Estimator Plugin

## Motivation

Many content-heavy websites want to display estimated reading time to help users
gauge time commitment before reading. This is a common feature on Medium, blogs,
and documentation sites.

## Changes

1. Create new WordPress plugin from scratch
2. Add reading time calculation algorithm
3. Add settings page for customization
4. Add display options (before/after content, shortcode)
5. Add support for custom post types

## Impact

### New Plugin Structure
- Main plugin file with header
- Core calculation class
- Settings page class
- Display handler class
- Admin CSS/JS
- Frontend CSS

### WordPress Integration
- Settings page under Settings > Reading Time
- Automatic display via content filter
- Shortcode: `[reading_time]`
- Widget support (optional)

## Timeline

- Plugin scaffolding: 1 day
- Core implementation: 1-2 days
- Settings page: 1 day
- Testing and polish: 1 day

## Dependencies

- None (standalone plugin)
```

### Step 2: Create OpenSpec Spec

**File**: `openspec/changes/reading-time-plugin/specs/plugin-features/reading-time.md`

```markdown
---
id: plugin-features/reading-time
status: active
relatedTasks: []
---

# Reading Time Estimator

## Overview
Calculate and display estimated reading time for WordPress content.

## Requirements

### Functional Requirements
- Calculate reading time based on word count
- Default: 200 words per minute (configurable)
- Display format: "X min read" or "X minute read"
- Display options:
  - Before content
  - After content
  - Both
  - Manual via shortcode only
- Support for posts, pages, and custom post types
- Exclude HTML tags and shortcodes from word count

### Settings Requirements
- Settings page under Settings > Reading Time
- Options:
  - Words per minute (default: 200)
  - Display position (before/after/both/manual)
  - Post types to include
  - Display format template
  - Enable/disable for specific post types

### Performance Requirements
- Cache reading time as post meta
- Recalculate on post save
- No performance impact on frontend

## User Stories

**As a** content creator
**I want** to display reading time on my posts
**So that** readers know how long content will take

**As a** site admin
**I want** to customize reading time settings
**So that** I can match my site's needs

## Technical Approach

### Calculation Algorithm
```
words = strip_tags(strip_shortcodes(content))
word_count = count(explode(' ', words))
minutes = ceil(word_count / words_per_minute)
```

### WordPress Integration
- Filter: `the_content` for automatic display
- Shortcode: `reading_time` for manual placement
- Post meta: `_reading_time_minutes` (cached)
- Action: `save_post` to recalculate

### Files to Create
- `reading-time-estimator.php` - Main plugin file
- `includes/class-calculator.php` - Reading time calculation
- `includes/class-display.php` - Display logic
- `admin/class-settings.php` - Settings page
- `admin/css/settings.css` - Admin styles
- `public/css/display.css` - Frontend styles

## Testing Requirements

### Unit Tests
- Test word count calculation
- Test reading time calculation
- Test different words-per-minute values
- Test HTML/shortcode stripping

### Manual Testing
- Test on posts with various lengths
- Test on pages
- Test on custom post types
- Test settings page
- Test shortcode
- Test with different themes
```

### Step 3: Create Beads Tasks

```bash
# Create epic
bd create "Build Reading Time Estimator Plugin" -p 0 --type epic --label wordpress --label plugin
# Returns: bd-rte

# Scaffolding
bd create "Create plugin structure and main file" -p 0 --parent bd-rte --label scaffolding
# Returns: bd-rte.1

bd create "Create readme.txt for WordPress.org" -p 0 --parent bd-rte --label scaffolding
# Returns: bd-rte.2

# Core implementation
bd create "Create Calculator class" -p 1 --parent bd-rte --label implementation
# Returns: bd-rte.3

bd create "Create Display class" -p 1 --parent bd-rte --label implementation
# Returns: bd-rte.4

bd create "Add shortcode support" -p 1 --parent bd-rte --label implementation
# Returns: bd-rte.5

# Settings
bd create "Create Settings class" -p 1 --parent bd-rte --label admin --label settings
# Returns: bd-rte.6

bd create "Add settings page UI" -p 1 --parent bd-rte --label admin --label settings
# Returns: bd-rte.7

bd create "Add settings CSS" -p 2 --parent bd-rte --label admin
# Returns: bd-rte.8

# Frontend
bd create "Add frontend display CSS" -p 2 --parent bd-rte --label frontend
# Returns: bd-rte.9

# Testing
bd create "Write unit tests" -p 1 --parent bd-rte --label testing
# Returns: bd-rte.10

bd create "Manual testing" -p 2 --parent bd-rte --label testing
# Returns: bd-rte.11

# Documentation
bd create "Add inline documentation" -p 2 --parent bd-rte --label documentation
# Returns: bd-rte.12
```

### Step 4: Add Task Dependencies

```bash
# Display depends on Calculator
bd dep add bd-rte.4 bd-rte.3

# Shortcode depends on Calculator
bd dep add bd-rte.5 bd-rte.3

# Settings UI depends on Settings class
bd dep add bd-rte.7 bd-rte.6

# Settings CSS depends on Settings UI
bd dep add bd-rte.8 bd-rte.7

# Frontend CSS depends on Display
bd dep add bd-rte.9 bd-rte.4

# Testing depends on core implementation
bd dep add bd-rte.10 bd-rte.5
bd dep add bd-rte.11 bd-rte.10

# Documentation depends on everything
bd dep add bd-rte.12 bd-rte.11
```

### Step 5: Implementation

#### Task bd-rte.1: Create Plugin Structure

```bash
bd update bd-rte.1 --status in_progress
```

**Create directory structure**:

```bash
mkdir -p reading-time-estimator/{includes,admin/{css,js},public/css,tests,languages}
cd reading-time-estimator
```

**File**: `reading-time-estimator.php`

```php
<?php
/**
 * Plugin Name: Reading Time Estimator
 * Plugin URI: https://example.com/reading-time-estimator
 * Description: Display estimated reading time for posts and pages
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: reading-time-estimator
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RTE_VERSION', '1.0.0');
define('RTE_PATH', plugin_dir_path(__FILE__));
define('RTE_URL', plugin_dir_url(__FILE__));

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'RTE_';
    $base_dir = RTE_PATH . 'includes/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . strtolower(str_replace('_', '-', $relative_class)) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Initialize plugin
function rte_init() {
    // Load text domain
    load_plugin_textdomain('reading-time-estimator', false, dirname(plugin_basename(__FILE__)) . '/languages');

    // Initialize classes
    $calculator = new RTE_Calculator();
    $display = new RTE_Display($calculator);
    $display->init();

    if (is_admin()) {
        $settings = new RTE_Settings();
        $settings->init();
    }
}
add_action('plugins_loaded', 'rte_init');

// Activation hook
register_activation_hook(__FILE__, 'rte_activate');
function rte_activate() {
    // Set default options
    add_option('rte_words_per_minute', 200);
    add_option('rte_display_position', 'before');
    add_option('rte_post_types', array('post', 'page'));
    add_option('rte_display_format', '%d min read');
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'rte_deactivate');
function rte_deactivate() {
    // Cleanup if needed
}
```

```bash
bd comment bd-rte.1 "Created plugin structure with autoloader and activation hooks"
bd close bd-rte.1
```

#### Task bd-rte.2: Create readme.txt

```bash
bd update bd-rte.2 --status in_progress
```

**File**: `readme.txt`

```
=== Reading Time Estimator ===
Contributors: yourname
Tags: reading time, estimated time, content, posts
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Display estimated reading time for your posts and pages.

== Description ==

Reading Time Estimator calculates and displays the estimated reading time for your WordPress content. Help your readers gauge the time commitment before diving into your articles.

**Features:**

* Automatic reading time calculation
* Customizable words per minute
* Display before or after content
* Shortcode support: [reading_time]
* Settings page for easy configuration
* Support for custom post types
* Lightweight and fast

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/reading-time-estimator`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Settings > Reading Time to configure options

== Frequently Asked Questions ==

= How is reading time calculated? =

Reading time is calculated based on word count divided by words per minute (default: 200).

= Can I customize the display format? =

Yes! Go to Settings > Reading Time to customize the format and position.

= Does it work with custom post types? =

Yes, you can enable it for any post type in the settings.

== Changelog ==

= 1.0.0 =
* Initial release
```

```bash
bd comment bd-rte.2 "Created WordPress.org readme with description and FAQ"
bd close bd-rte.2
```

#### Task bd-rte.3: Create Calculator Class

```bash
bd ready  # Shows bd-rte.3 is ready
bd update bd-rte.3 --status in_progress
```

**File**: `includes/class-calculator.php`

```php
<?php
class RTE_Calculator {
    private $words_per_minute;

    public function __construct() {
        $this->words_per_minute = get_option('rte_words_per_minute', 200);
    }

    /**
     * Calculate reading time for content
     *
     * @param string $content Post content
     * @return int Reading time in minutes
     */
    public function calculate($content) {
        $word_count = $this->count_words($content);
        $minutes = ceil($word_count / $this->words_per_minute);
        return max(1, $minutes); // Minimum 1 minute
    }

    /**
     * Count words in content
     *
     * @param string $content Post content
     * @return int Word count
     */
    public function count_words($content) {
        // Strip HTML tags and shortcodes
        $text = strip_tags(strip_shortcodes($content));

        // Remove extra whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        // Count words
        $words = explode(' ', trim($text));
        return count(array_filter($words));
    }

    /**
     * Get or calculate reading time for a post
     *
     * @param int $post_id Post ID
     * @return int Reading time in minutes
     */
    public function get_reading_time($post_id) {
        // Check cache
        $cached = get_post_meta($post_id, '_reading_time_minutes', true);
        if ($cached) {
            return (int) $cached;
        }

        // Calculate and cache
        $post = get_post($post_id);
        if (!$post) {
            return 0;
        }

        $minutes = $this->calculate($post->post_content);
        update_post_meta($post_id, '_reading_time_minutes', $minutes);

        return $minutes;
    }

    /**
     * Recalculate reading time on post save
     *
     * @param int $post_id Post ID
     */
    public function recalculate_on_save($post_id) {
        // Skip autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Delete cache to force recalculation
        delete_post_meta($post_id, '_reading_time_minutes');
    }
}
```

```bash
bd comment bd-rte.3 "Created Calculator class with word counting and caching"
bd close bd-rte.3
```

## Step 6: Continue Implementation

Following the dependency chain, implement remaining tasks:

- **bd-rte.4**: Display class with content filter
- **bd-rte.5**: Shortcode handler
- **bd-rte.6**: Settings class with options API
- **bd-rte.7**: Settings page UI
- **bd-rte.8**: Admin CSS
- **bd-rte.9**: Frontend CSS
- **bd-rte.10**: Unit tests
- **bd-rte.11**: Manual testing
- **bd-rte.12**: Inline documentation

## Step 7: Testing and Completion

```bash
# Run tests
./vendor/bin/phpunit

# Manual testing
bd update bd-rte.11 --status in_progress
bd comment bd-rte.11 "Manual testing completed:
- ✓ Reading time displays correctly
- ✓ Settings page works
- ✓ Shortcode works
- ✓ Caching works (no performance impact)
- ✓ Works with different post types
- ✓ Works with different themes"
bd close bd-rte.11

# Add documentation
bd update bd-rte.12 --status in_progress
bd comment bd-rte.12 "Added PHPDoc comments to all classes and methods"
bd close bd-rte.12

# Close epic
bd close bd-rte
```

## Step 8: Archive OpenSpec Change

```bash
# Move to archive
mv openspec/changes/reading-time-plugin openspec/archive/reading-time-plugin
```

## AI Agent Workflow

### Initial Prompt

```
Create a WordPress plugin called "Reading Time Estimator" that displays estimated reading time for posts and pages.

Requirements:
- Plugin slug: reading-time-estimator
- Text domain: reading-time-estimator
- Minimum WordPress version: 6.0
- PHP version: 7.4+

Features:
- Calculate reading time based on word count (200 words/min default)
- Display before or after content (configurable)
- Shortcode support: [reading_time]
- Settings page under Settings > Reading Time
- Support for custom post types
- Cache reading time as post meta for performance

Use object-oriented architecture with separate classes for calculation, display, and settings.
Follow WordPress coding standards and best practices.
```

### Implementation Approach

1. **Create OpenSpec proposal and spec** with detailed requirements
2. **Break down into Beads tasks** with clear dependencies
3. **Implement incrementally** starting with scaffolding
4. **Test thoroughly** with unit and manual tests
5. **Document** with inline comments and readme.txt

## Key Takeaways

- **Start with scaffolding** to establish plugin structure
- **Use OpenSpec** to define clear requirements before coding
- **Break down into small tasks** with Beads for tracking
- **Follow WordPress standards** for plugin structure and naming
- **Cache expensive operations** (reading time calculation)
- **Test thoroughly** before release
- **Document well** for users and developers

