# WordPress Plugin Development Best Practices

## Overview

This document provides comprehensive best practices for WordPress plugin development, covering code organization, naming conventions, security, performance, accessibility, and backward compatibility.

## Code Organization

### Directory Structure

**Standard Plugin Structure**:

```
plugin-name/
├── plugin-name.php              # Main plugin file
├── uninstall.php                # Uninstall cleanup
├── readme.txt                   # WordPress.org readme
├── LICENSE                      # License file
├── includes/                    # Core plugin classes
│   ├── class-plugin-name.php
│   ├── class-activator.php
│   ├── class-deactivator.php
│   └── class-loader.php
├── admin/                       # Admin-specific functionality
│   ├── class-admin.php
│   ├── partials/                # Admin view templates
│   ├── css/
│   └── js/
├── public/                      # Public-facing functionality
│   ├── class-public.php
│   ├── partials/                # Public view templates
│   ├── css/
│   └── js/
├── languages/                   # Translation files
├── assets/                      # Plugin assets for WordPress.org
│   ├── banner-772x250.png
│   ├── banner-1544x500.png
│   ├── icon-128x128.png
│   └── icon-256x256.png
└── tests/                       # PHPUnit tests
    ├── bootstrap.php
    ├── unit/
    └── integration/
```

### File Organization Best Practices

**DO**:
- ✅ One class per file
- ✅ Group related functionality in subdirectories
- ✅ Separate admin and public functionality
- ✅ Keep templates in `partials/` directories
- ✅ Organize assets by type (css, js, images)

**DON'T**:
- ❌ Mix multiple classes in one file
- ❌ Put all code in main plugin file
- ❌ Mix admin and public code
- ❌ Hardcode HTML in PHP classes
- ❌ Put assets in root directory

## Naming Conventions

### File Naming

**PHP Files**:
```
class-plugin-name.php           # Class files (lowercase, hyphens)
class-admin.php
class-public.php
plugin-name-functions.php       # Function files
```

**Template Files**:
```
admin-display.php               # Admin templates
public-display.php              # Public templates
settings-page.php
```

**Asset Files**:
```
plugin-name-admin.css           # Prefixed with plugin name
plugin-name-public.js
plugin-name-icon.png
```

### Code Naming

**Classes**:
```php
class Plugin_Name {}                    # Capitalized with underscores
class Plugin_Name_Admin {}
class Plugin_Name_Public {}
```

**Functions**:
```php
function plugin_name_activate() {}      # Lowercase with underscores
function plugin_name_get_data() {}
function plugin_name_sanitize_input() {}
```

**Variables**:
```php
$plugin_name = 'value';                 # Lowercase with underscores
$user_data = array();
$is_active = true;
```

**Constants**:
```php
define( 'PLUGIN_NAME_VERSION', '1.0.0' );  # Uppercase with underscores
define( 'PLUGIN_NAME_PATH', plugin_dir_path( __FILE__ ) );
```

**Hooks**:
```php
// Actions
do_action( 'plugin_name_before_save' );
do_action( 'plugin_name_after_save' );

// Filters
apply_filters( 'plugin_name_data', $data );
apply_filters( 'plugin_name_settings', $settings );
```

### Database Naming

**Tables**:
```php
global $wpdb;
$table_name = $wpdb->prefix . 'plugin_name_items';  # Prefixed, lowercase, underscores
```

**Options**:
```php
get_option( 'plugin_name_settings' );    # Prefixed with plugin name
get_option( 'plugin_name_version' );
```

**Post Meta**:
```php
get_post_meta( $post_id, '_plugin_name_meta_key', true );  # Prefixed, leading underscore for hidden
```

**User Meta**:
```php
get_user_meta( $user_id, 'plugin_name_preference', true );
```

**Transients**:
```php
get_transient( 'plugin_name_cache_key' );  # Prefixed, max 172 characters
```

## WordPress Coding Standards

### Indentation and Spacing

**Use Tabs for Indentation**:
```php
function plugin_name_example() {
	if ( $condition ) {
		// Code here (indented with tab)
	}
}
```

**Space After Control Structures**:
```php
if ( $condition ) {  // Space after 'if', space inside parentheses
	// Code
}

foreach ( $items as $item ) {  // Space after 'foreach'
	// Code
}
```

**No Space Before Function Parentheses**:
```php
function my_function( $param ) {  // No space before (
	// Code
}
```

### Braces and Brackets

**Opening Braces on Same Line**:
```php
if ( $condition ) {
	// Code
}

function my_function() {
	// Code
}
```

**Arrays**:
```php
$array = array(
	'key1' => 'value1',
	'key2' => 'value2',
);
```

### Quotes

**Use Single Quotes for Strings**:
```php
$string = 'Hello World';
$html = '<div class="wrapper">';  // Single quotes for HTML
```

**Use Double Quotes for Interpolation**:
```php
$name = 'John';
$greeting = "Hello, $name";  // Double quotes for variable interpolation
```

### Yoda Conditions

**Use Yoda Conditions for Comparisons**:
```php
if ( 'value' === $variable ) {  // Constant on left
	// Code
}

if ( true === $is_active ) {
	// Code
}
```

## Security Checklist

### Input Validation and Sanitization

**Always Sanitize User Input**:

```php
// Text fields
$text = sanitize_text_field( $_POST['text'] );

// Email
$email = sanitize_email( $_POST['email'] );

// URL
$url = esc_url_raw( $_POST['url'] );

// Integer
$number = absint( $_POST['number'] );

// Array
$array = array_map( 'sanitize_text_field', $_POST['array'] );

// HTML (allowed tags)
$html = wp_kses_post( $_POST['content'] );
```

### Output Escaping

**Always Escape Output**:

```php
// HTML
echo esc_html( $text );

// Attributes
echo '<div class="' . esc_attr( $class ) . '">';

// URL
echo '<a href="' . esc_url( $url ) . '">';

// JavaScript
echo '<script>var data = ' . wp_json_encode( $data ) . ';</script>';

// Translation with escaping
echo esc_html__( 'Text', 'text-domain' );
```

### Nonce Verification

**Always Use Nonces for Forms**:

```php
// Create nonce
wp_nonce_field( 'action_name', 'nonce_name' );

// Verify nonce
if ( ! isset( $_POST['nonce_name'] ) || ! wp_verify_nonce( $_POST['nonce_name'], 'action_name' ) ) {
	wp_die( __( 'Security check failed', 'text-domain' ) );
}
```

**Nonces for AJAX**:

```php
// Create nonce for AJAX
wp_localize_script( 'script-handle', 'ajax_object', array(
	'ajax_url' => admin_url( 'admin-ajax.php' ),
	'nonce' => wp_create_nonce( 'ajax_nonce' ),
) );

// Verify in AJAX handler
check_ajax_referer( 'ajax_nonce', 'nonce' );
```

### Capability Checks

**Always Check User Capabilities**:

```php
// Admin actions
if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( __( 'Insufficient permissions', 'text-domain' ) );
}

// Post editing
if ( ! current_user_can( 'edit_post', $post_id ) ) {
	return;
}

// Custom capability
if ( ! current_user_can( 'plugin_name_custom_capability' ) ) {
	return;
}
```

### Database Security

**Use Prepared Statements**:

```php
global $wpdb;

// Prepared statement
$results = $wpdb->get_results( $wpdb->prepare(
	"SELECT * FROM {$wpdb->prefix}table WHERE column = %s AND id = %d",
	$string_value,
	$int_value
) );

// Never use direct queries
// BAD: $wpdb->query( "SELECT * FROM table WHERE id = " . $_GET['id'] );
```

### File Security

**Prevent Direct Access**:

```php
// Add to all PHP files
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
```

**Validate File Uploads**:

```php
function plugin_name_validate_upload( $file ) {
	// Check file type
	$allowed_types = array( 'image/jpeg', 'image/png', 'image/gif' );
	if ( ! in_array( $file['type'], $allowed_types, true ) ) {
		return new WP_Error( 'invalid_type', __( 'Invalid file type', 'text-domain' ) );
	}

	// Check file size (5MB max)
	if ( $file['size'] > 5 * 1024 * 1024 ) {
		return new WP_Error( 'file_too_large', __( 'File too large', 'text-domain' ) );
	}

	return $file;
}
```

### Security Checklist

- [ ] All user input is sanitized
- [ ] All output is escaped
- [ ] Nonces are used for all forms
- [ ] Capability checks are in place
- [ ] Database queries use prepared statements
- [ ] Direct file access is prevented
- [ ] File uploads are validated
- [ ] No eval() or exec() usage
- [ ] No unserialize() on user input
- [ ] No file_get_contents() on user input
- [ ] HTTPS is used for external requests
- [ ] API keys are stored securely (not in code)

## Performance Checklist

### Database Optimization

**Optimize Queries**:

```php
// Use WP_Query efficiently
$args = array(
	'post_type' => 'post',
	'posts_per_page' => 10,
	'no_found_rows' => true,  // Skip pagination count
	'update_post_meta_cache' => false,  // Skip meta cache if not needed
	'update_post_term_cache' => false,  // Skip term cache if not needed
);
$query = new WP_Query( $args );

// Avoid N+1 queries
// BAD: Loop through posts and get meta for each
// GOOD: Use update_post_meta_cache or get all meta at once
```

**Use Transients for Caching**:

```php
function plugin_name_get_expensive_data() {
	$cache_key = 'plugin_name_expensive_data';
	$data = get_transient( $cache_key );

	if ( false === $data ) {
		// Expensive operation
		$data = perform_expensive_operation();

		// Cache for 1 hour
		set_transient( $cache_key, $data, HOUR_IN_SECONDS );
	}

	return $data;
}
```

**Use Object Caching**:

```php
function plugin_name_get_data( $id ) {
	$cache_key = 'plugin_name_data_' . $id;
	$data = wp_cache_get( $cache_key, 'plugin_name' );

	if ( false === $data ) {
		$data = get_data_from_database( $id );
		wp_cache_set( $cache_key, $data, 'plugin_name', 3600 );
	}

	return $data;
}
```

### Asset Optimization

**Conditional Loading**:

```php
function plugin_name_enqueue_scripts() {
	// Only load on specific pages
	if ( is_singular( 'post' ) ) {
		wp_enqueue_script( 'plugin-name-script', plugins_url( 'js/script.js', __FILE__ ), array( 'jquery' ), '1.0.0', true );
	}

	// Only load in admin
	if ( is_admin() ) {
		wp_enqueue_style( 'plugin-name-admin', plugins_url( 'css/admin.css', __FILE__ ), array(), '1.0.0' );
	}
}
add_action( 'wp_enqueue_scripts', 'plugin_name_enqueue_scripts' );
```

**Minify and Combine Assets**:

```php
// Use .min versions in production
$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
wp_enqueue_script( 'plugin-name-script', plugins_url( "js/script{$suffix}.js", __FILE__ ), array( 'jquery' ), '1.0.0', true );
```

**Lazy Load Images**:

```php
function plugin_name_add_lazy_loading( $content ) {
	if ( is_singular() ) {
		$content = str_replace( '<img ', '<img loading="lazy" ', $content );
	}
	return $content;
}
add_filter( 'the_content', 'plugin_name_add_lazy_loading' );
```

### Cron Job Optimization

**Use WP-Cron Efficiently**:

```php
// Schedule event
if ( ! wp_next_scheduled( 'plugin_name_daily_task' ) ) {
	wp_schedule_event( time(), 'daily', 'plugin_name_daily_task' );
}

// Hook callback
add_action( 'plugin_name_daily_task', 'plugin_name_do_daily_task' );

function plugin_name_do_daily_task() {
	// Batch process large datasets
	$offset = get_option( 'plugin_name_batch_offset', 0 );
	$batch_size = 100;

	// Process batch
	$items = get_items( $offset, $batch_size );
	foreach ( $items as $item ) {
		process_item( $item );
	}

	// Update offset
	update_option( 'plugin_name_batch_offset', $offset + $batch_size );
}
```

### Performance Checklist

- [ ] Database queries are optimized
- [ ] Transients are used for expensive operations
- [ ] Object caching is implemented
- [ ] Assets are loaded conditionally
- [ ] Assets are minified
- [ ] Images use lazy loading
- [ ] Cron jobs are optimized
- [ ] No queries in loops
- [ ] Pagination is implemented for large datasets
- [ ] External API calls are cached

## Accessibility Considerations

### Semantic HTML

**Use Proper HTML Elements**:

```php
// Good
echo '<button type="button">' . esc_html__( 'Click Me', 'text-domain' ) . '</button>';

// Bad
echo '<div onclick="doSomething()">' . esc_html__( 'Click Me', 'text-domain' ) . '</div>';
```

### ARIA Labels

**Add ARIA Labels for Screen Readers**:

```php
echo '<button type="button" aria-label="' . esc_attr__( 'Close dialog', 'text-domain' ) . '">';
echo '<span aria-hidden="true">&times;</span>';
echo '</button>';
```

### Keyboard Navigation

**Ensure Keyboard Accessibility**:

```php
// Add tabindex for custom interactive elements
echo '<div tabindex="0" role="button" onkeypress="handleKeyPress(event)">';
echo esc_html__( 'Custom Button', 'text-domain' );
echo '</div>';
```

### Form Labels

**Always Label Form Fields**:

```php
echo '<label for="plugin-name-field">' . esc_html__( 'Field Label', 'text-domain' ) . '</label>';
echo '<input type="text" id="plugin-name-field" name="field_name" />';
```

### Color Contrast

**Ensure Sufficient Color Contrast**:

```css
/* WCAG AA requires 4.5:1 contrast ratio for normal text */
.plugin-name-text {
	color: #333333;  /* Dark gray on white background */
	background-color: #ffffff;
}

/* WCAG AAA requires 7:1 contrast ratio */
.plugin-name-important {
	color: #000000;  /* Black on white background */
	background-color: #ffffff;
}
```

### Accessibility Checklist

- [ ] Semantic HTML is used
- [ ] ARIA labels are provided
- [ ] Keyboard navigation works
- [ ] Form fields have labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Images have alt text
- [ ] Focus indicators are visible
- [ ] Skip links are provided
- [ ] Headings are hierarchical
- [ ] Error messages are descriptive

## Backward Compatibility

### WordPress Version Compatibility

**Check WordPress Version**:

```php
function plugin_name_check_version() {
	global $wp_version;

	if ( version_compare( $wp_version, '6.0', '<' ) ) {
		add_action( 'admin_notices', 'plugin_name_version_notice' );
		return false;
	}

	return true;
}

function plugin_name_version_notice() {
	echo '<div class="notice notice-error"><p>';
	echo esc_html__( 'Plugin Name requires WordPress 6.0 or higher.', 'text-domain' );
	echo '</p></div>';
}
```

### PHP Version Compatibility

**Check PHP Version**:

```php
if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
	add_action( 'admin_notices', function() {
		echo '<div class="notice notice-error"><p>';
		echo esc_html__( 'Plugin Name requires PHP 7.4 or higher.', 'text-domain' );
		echo '</p></div>';
	} );
	return;
}
```

### Deprecation Handling

**Handle Deprecated Functions**:

```php
function plugin_name_old_function() {
	_deprecated_function( __FUNCTION__, '2.0.0', 'plugin_name_new_function' );
	return plugin_name_new_function();
}

function plugin_name_new_function() {
	// New implementation
}
```

### Database Schema Updates

**Version Database Schema**:

```php
function plugin_name_update_database() {
	$current_version = get_option( 'plugin_name_db_version', '1.0' );

	if ( version_compare( $current_version, '2.0', '<' ) ) {
		plugin_name_upgrade_to_2_0();
		update_option( 'plugin_name_db_version', '2.0' );
	}
}

function plugin_name_upgrade_to_2_0() {
	global $wpdb;

	// Add new column
	$wpdb->query( "ALTER TABLE {$wpdb->prefix}plugin_name_table ADD COLUMN new_column VARCHAR(255)" );
}
```

### Backward Compatibility Checklist

- [ ] Minimum WordPress version is specified
- [ ] Minimum PHP version is specified
- [ ] Version checks are in place
- [ ] Deprecated functions use _deprecated_function()
- [ ] Database schema updates are versioned
- [ ] Settings migration is handled
- [ ] Old hooks are maintained (with deprecation notices)
- [ ] Breaking changes are documented
- [ ] Upgrade path is tested

## Internationalization (i18n)

### Text Domain

**Use Consistent Text Domain**:

```php
// In plugin header
/*
 * Text Domain: plugin-name
 * Domain Path: /languages
 */

// In code
__( 'Text', 'plugin-name' );
_e( 'Text', 'plugin-name' );
esc_html__( 'Text', 'plugin-name' );
esc_html_e( 'Text', 'plugin-name' );
```

### Load Text Domain

**Load Translations**:

```php
function plugin_name_load_textdomain() {
	load_plugin_textdomain( 'plugin-name', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'plugin_name_load_textdomain' );
```

### Translatable Strings

**Make All User-Facing Strings Translatable**:

```php
// Simple string
echo esc_html__( 'Hello World', 'plugin-name' );

// String with context
echo esc_html_x( 'Post', 'noun', 'plugin-name' );

// Plural
echo esc_html( sprintf(
	_n( '%d item', '%d items', $count, 'plugin-name' ),
	$count
) );
```

## Documentation Standards

### PHPDoc Comments

**Document All Functions and Classes**:

```php
/**
 * Process user data
 *
 * @since 1.0.0
 * @param array $data The user data to process.
 * @param bool  $validate Whether to validate the data.
 * @return array|WP_Error Processed data or error.
 */
function plugin_name_process_data( $data, $validate = true ) {
	// Implementation
}
```

### Inline Comments

**Add Explanatory Comments**:

```php
// Check if user has permission
if ( ! current_user_can( 'manage_options' ) ) {
	return;
}

// Process data in batches to avoid memory issues
$batch_size = 100;
for ( $i = 0; $i < count( $items ); $i += $batch_size ) {
	$batch = array_slice( $items, $i, $batch_size );
	process_batch( $batch );
}
```

### README Documentation

**Maintain Comprehensive README**:

```markdown
# Plugin Name

## Description
Brief description of what the plugin does.

## Installation
1. Upload plugin files
2. Activate plugin
3. Configure settings

## Usage
How to use the plugin.

## Hooks
List of available hooks and filters.

## Changelog
Version history with changes.
```

## Testing Best Practices

### Write Tests First (TDD)

```php
// Write test first
public function test_sanitizes_email() {
	$input = 'test@EXAMPLE.com';
	$expected = 'test@example.com';
	$result = plugin_name_sanitize_email( $input );
	$this->assertEquals( $expected, $result );
}

// Then implement function
function plugin_name_sanitize_email( $email ) {
	return sanitize_email( strtolower( $email ) );
}
```

### Test Coverage

**Aim for > 80% Code Coverage**:

```bash
vendor/bin/phpunit --coverage-html coverage/
```

### Test Different Scenarios

```php
public function test_handles_empty_input() {
	$result = plugin_name_process( '' );
	$this->assertWPError( $result );
}

public function test_handles_invalid_input() {
	$result = plugin_name_process( 'invalid' );
	$this->assertWPError( $result );
}

public function test_handles_valid_input() {
	$result = plugin_name_process( 'valid' );
	$this->assertNotWPError( $result );
}
```

## Version Control Best Practices

### Git Workflow

**Use Feature Branches**:

```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "feat: Add new feature"
git push origin feature/new-feature
```

### Commit Messages

**Use Conventional Commits**:

```
feat: Add new feature
fix: Fix bug in data processing
docs: Update README
style: Format code
refactor: Refactor data processing
test: Add tests for new feature
chore: Update dependencies
```

### .gitignore

**Ignore Unnecessary Files**:

```
# .gitignore
node_modules/
vendor/
.DS_Store
*.log
coverage/
.phpunit.result.cache
```

## Release Checklist

### Pre-Release

- [ ] All tests pass
- [ ] Code coverage > 80%
- [ ] Security audit complete
- [ ] WPCS compliance verified
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version number updated
- [ ] Translation files generated

### Release

- [ ] Create git tag
- [ ] Create release notes
- [ ] Update WordPress.org SVN
- [ ] Test in clean WordPress install
- [ ] Monitor for issues

### Post-Release

- [ ] Monitor support forums
- [ ] Respond to user feedback
- [ ] Track bug reports
- [ ] Plan next release

## Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WordPress Security Best Practices](https://developer.wordpress.org/plugins/security/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Semantic Versioning](https://semver.org/)

## Related Workflows

- `development-workflow.md` - Feature development cycle
- `testing-workflow.md` - Testing setup and execution
- `submission-workflow.md` - WordPress.org submission

## Related Domain Rules

- `domain-rules/wordpress-plugin/security-best-practices.md`
- `domain-rules/wordpress-plugin/performance-optimization.md`
- `domain-rules/wordpress-plugin/internationalization.md`

