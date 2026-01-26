# WordPress Plugin Development Workflow

## Overview

This workflow guides you through adding features to an existing WordPress plugin using a security-first, test-driven approach with OpenSpec and Beads integration.

## Prerequisites

- Existing WordPress plugin structure
- Local WordPress development environment
- OpenSpec initialized (`openspec/` directory)
- Beads initialized (`.beads/` directory)
- Domain rules: `domain-rules/wordpress-plugin` module

## Workflow Steps

### 1. Feature Planning with OpenSpec

**Create OpenSpec Spec**:

```bash
# Create spec file
mkdir -p openspec/specs/plugin-features
touch openspec/specs/plugin-features/[feature-name].md
```

**Spec Template**:

```markdown
---
id: plugin-features/[feature-name]
status: active
relatedTasks: []
---

# [Feature Name]

## Overview
[Brief description of the feature]

## Requirements

### Functional Requirements
- [Requirement 1]
- [Requirement 2]

### Security Requirements
- Nonce verification for all forms
- Capability checks for admin actions
- Input sanitization using WordPress functions
- Output escaping for all user-generated content

### Performance Requirements
- Database queries must be optimized
- Caching strategy defined
- Asset loading optimized (conditional loading)

## User Stories

**As a** [user type]
**I want** [goal]
**So that** [benefit]

## Technical Approach

### Architecture Pattern
[e.g., MVC, Service Layer, Repository Pattern]

### WordPress Integration Points
- Hooks: [list hooks to use]
- Filters: [list filters to use]
- Custom Post Types: [if applicable]
- Taxonomies: [if applicable]
- Database Tables: [if applicable]

### Files to Create/Modify
- `includes/[feature-name].php` - Core logic
- `admin/[feature-name]-admin.php` - Admin interface
- `public/[feature-name]-public.php` - Frontend display
- `tests/test-[feature-name].php` - Unit tests

## Testing Requirements

### Unit Tests
- Test core logic in isolation
- Mock WordPress functions
- Test edge cases and error conditions

### Integration Tests
- Test WordPress integration
- Test database operations
- Test AJAX handlers

### Manual Testing
- Test in WordPress admin
- Test on frontend
- Test with different user roles
- Test with different WordPress versions

## Documentation Updates
- Update main plugin README
- Add inline PHPDoc comments
- Update changelog
```

### 2. Break Down into Beads Tasks

**Create Epic Task**:

```bash
bd create "Implement [feature-name]" -p 1 --type epic --label wordpress --label plugin --label [feature-name]
```

**Create Subtasks**:

```bash
# Planning
bd create "Create OpenSpec spec for [feature-name]" -p 1 --label planning

# Implementation
bd create "Create [feature-name] core class" -p 1 --label implementation
bd create "Add admin interface for [feature-name]" -p 1 --label admin
bd create "Add frontend display for [feature-name]" -p 1 --label frontend
bd create "Add AJAX handlers for [feature-name]" -p 1 --label ajax

# Security
bd create "Add nonce verification" -p 1 --label security
bd create "Add capability checks" -p 1 --label security
bd create "Add input sanitization" -p 1 --label security
bd create "Add output escaping" -p 1 --label security

# Testing
bd create "Write unit tests for [feature-name]" -p 1 --label testing
bd create "Write integration tests for [feature-name]" -p 1 --label testing
bd create "Manual testing in WordPress" -p 2 --label testing

# Documentation
bd create "Update plugin documentation" -p 2 --label documentation
bd create "Add inline PHPDoc comments" -p 2 --label documentation
```

### 3. Implementation Workflow

**Step 3.1: Set Up Feature Structure**

Create necessary files following plugin architecture:

```php
// includes/[feature-name].php
<?php
/**
 * [Feature Name] Core Class
 *
 * @package    [Plugin_Name]
 * @subpackage [Plugin_Name]/includes
 */

class Plugin_Name_Feature_Name {
    
    /**
     * Initialize the class
     */
    public function __construct() {
        $this->load_dependencies();
        $this->define_hooks();
    }
    
    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        // Load dependencies
    }
    
    /**
     * Register hooks
     */
    private function define_hooks() {
        add_action( 'init', array( $this, 'init' ) );
    }
    
    /**
     * Initialize feature
     */
    public function init() {
        // Implementation
    }
}
```

**Step 3.2: Implement Core Logic (Security-First)**

Always implement security checks FIRST:

```php
public function handle_form_submission() {
    // 1. Verify nonce
    if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( $_POST['_wpnonce'], 'feature_action' ) ) {
        wp_die( __( 'Security check failed', 'text-domain' ) );
    }

    // 2. Check capabilities
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( __( 'Insufficient permissions', 'text-domain' ) );
    }

    // 3. Sanitize input
    $data = array(
        'field1' => sanitize_text_field( $_POST['field1'] ),
        'field2' => sanitize_email( $_POST['field2'] ),
        'field3' => absint( $_POST['field3'] ),
    );

    // 4. Validate data
    if ( empty( $data['field1'] ) ) {
        return new WP_Error( 'invalid_data', __( 'Field 1 is required', 'text-domain' ) );
    }

    // 5. Process data
    $result = $this->process_data( $data );

    // 6. Return result
    return $result;
}
```

**Step 3.3: Add Admin Interface**

```php
// admin/[feature-name]-admin.php
public function add_admin_menu() {
    add_submenu_page(
        'options-general.php',
        __( 'Feature Settings', 'text-domain' ),
        __( 'Feature', 'text-domain' ),
        'manage_options',
        'feature-settings',
        array( $this, 'render_settings_page' )
    );
}

public function render_settings_page() {
    // Check capabilities
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    // Get current settings
    $settings = get_option( 'feature_settings', array() );

    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields( 'feature_settings_group' );
            do_settings_sections( 'feature-settings' );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
```

**Step 3.4: Add Frontend Display**

```php
// public/[feature-name]-public.php
public function render_shortcode( $atts ) {
    $atts = shortcode_atts( array(
        'id' => 0,
        'type' => 'default',
    ), $atts, 'feature_shortcode' );

    // Sanitize attributes
    $id = absint( $atts['id'] );
    $type = sanitize_key( $atts['type'] );

    // Get data
    $data = $this->get_data( $id );

    if ( ! $data ) {
        return '';
    }

    // Start output buffering
    ob_start();

    // Include template
    include plugin_dir_path( __FILE__ ) . 'partials/feature-display.php';

    return ob_get_clean();
}
```

**Step 3.5: Add AJAX Handlers**

```php
public function register_ajax_handlers() {
    add_action( 'wp_ajax_feature_action', array( $this, 'ajax_feature_action' ) );
    add_action( 'wp_ajax_nopriv_feature_action', array( $this, 'ajax_feature_action' ) );
}

public function ajax_feature_action() {
    // Verify nonce
    check_ajax_referer( 'feature_nonce', 'nonce' );

    // Check capabilities (if needed)
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( array( 'message' => __( 'Insufficient permissions', 'text-domain' ) ) );
    }

    // Sanitize input
    $data = isset( $_POST['data'] ) ? sanitize_text_field( $_POST['data'] ) : '';

    // Process request
    $result = $this->process_ajax_request( $data );

    if ( is_wp_error( $result ) ) {
        wp_send_json_error( array( 'message' => $result->get_error_message() ) );
    }

    wp_send_json_success( array( 'data' => $result ) );
}
```

### 4. Add Tests

**Create Unit Tests**:

```php
// tests/test-[feature-name].php
class Test_Feature_Name extends WP_UnitTestCase {

    private $feature;

    public function setUp(): void {
        parent::setUp();
        $this->feature = new Plugin_Name_Feature_Name();
    }

    public function test_feature_initialization() {
        $this->assertInstanceOf( 'Plugin_Name_Feature_Name', $this->feature );
    }

    public function test_data_sanitization() {
        $input = '<script>alert("xss")</script>Test';
        $expected = 'alert("xss")Test';
        $result = $this->feature->sanitize_data( $input );
        $this->assertEquals( $expected, $result );
    }

    public function test_capability_check() {
        // Test without capabilities
        $result = $this->feature->handle_form_submission();
        $this->assertWPError( $result );

        // Test with capabilities
        wp_set_current_user( $this->factory->user->create( array( 'role' => 'administrator' ) ) );
        // Add nonce to $_POST
        $_POST['_wpnonce'] = wp_create_nonce( 'feature_action' );
        $_POST['field1'] = 'test';

        $result = $this->feature->handle_form_submission();
        $this->assertNotWPError( $result );
    }
}
```

**Run Tests**:

```bash
# Run all tests
vendor/bin/phpunit

# Run specific test file
vendor/bin/phpunit tests/test-[feature-name].php

# Run with coverage
vendor/bin/phpunit --coverage-html coverage/
```

### 5. Update Documentation

**Update Plugin README**:

```markdown
## Features

### [Feature Name]
[Description of the feature]

**Usage**:
\`\`\`php
// Code example
\`\`\`

**Shortcode**:
\`\`\`
[feature_shortcode id="123" type="default"]
\`\`\`

**Hooks**:
- `plugin_name_before_feature` - Fires before feature execution
- `plugin_name_after_feature` - Fires after feature execution

**Filters**:
- `plugin_name_feature_data` - Filter feature data before processing
```

**Add PHPDoc Comments**:

```php
/**
 * Process feature data
 *
 * @since 1.0.0
 * @param array $data The data to process.
 * @return array|WP_Error Processed data or error.
 */
public function process_data( $data ) {
    // Implementation
}
```

### 6. Manual Testing Checklist

**Admin Testing**:
- [ ] Settings page loads without errors
- [ ] Settings save correctly
- [ ] Nonce verification works
- [ ] Capability checks prevent unauthorized access
- [ ] Admin notices display correctly
- [ ] AJAX requests work as expected

**Frontend Testing**:
- [ ] Shortcode renders correctly
- [ ] Frontend forms submit successfully
- [ ] Data displays correctly
- [ ] No JavaScript errors in console
- [ ] Responsive design works on mobile

**Security Testing**:
- [ ] XSS attempts are blocked
- [ ] SQL injection attempts are blocked
- [ ] CSRF protection works (nonces)
- [ ] Unauthorized users cannot access admin features
- [ ] File upload restrictions work (if applicable)

**Performance Testing**:
- [ ] Database queries are optimized
- [ ] Caching works correctly
- [ ] Assets load conditionally
- [ ] No N+1 query problems

**Compatibility Testing**:
- [ ] Works with latest WordPress version
- [ ] Works with minimum supported WordPress version
- [ ] Works with common themes
- [ ] Works with common plugins
- [ ] No PHP errors or warnings

### 7. Code Review Checklist

**Security**:
- [ ] All user input is sanitized
- [ ] All output is escaped
- [ ] Nonces are used for all forms
- [ ] Capability checks are in place
- [ ] No direct database queries (use $wpdb prepared statements)

**Code Quality**:
- [ ] Follows WordPress Coding Standards
- [ ] PHPDoc comments are complete
- [ ] No hardcoded values (use constants)
- [ ] Error handling is implemented
- [ ] Logging is implemented for debugging

**Performance**:
- [ ] Database queries are optimized
- [ ] Caching is implemented where appropriate
- [ ] Assets are minified and combined
- [ ] Lazy loading is used where appropriate

**Testing**:
- [ ] Unit tests cover core logic
- [ ] Integration tests cover WordPress integration
- [ ] Code coverage is > 80%
- [ ] All tests pass

## AI Prompt Templates

### Feature Implementation Prompt

```
Implement [feature name] for the [plugin name] WordPress plugin.

Requirements:
- [Requirement 1]
- [Requirement 2]

Security requirements:
- Nonce verification for all forms
- Capability checks: [required capability]
- Input sanitization using WordPress functions
- Output escaping for all user-generated content

Architecture:
- Follow [architecture pattern] pattern
- Create files: [list files]
- Use hooks: [list hooks]

Testing:
- Write unit tests for core logic
- Write integration tests for WordPress integration
- Achieve > 80% code coverage

Reference the domain-rules/wordpress-plugin module for detailed implementation patterns.
```

### Security Audit Prompt

```
Perform a security audit on [feature name] in [plugin name].

Check for:
- Missing nonce verification
- Missing capability checks
- Unsanitized input
- Unescaped output
- SQL injection vulnerabilities
- XSS vulnerabilities
- CSRF vulnerabilities

Provide a report with:
- List of vulnerabilities found
- Severity rating (Critical, High, Medium, Low)
- Recommended fixes
- Code examples for fixes
```

### Testing Prompt

```
Create comprehensive tests for [feature name] in [plugin name].

Test coverage needed:
- Unit tests for [list functions]
- Integration tests for [list WordPress integration points]
- Security tests for [list security features]

Use WordPress test suite and PHPUnit.
Mock WordPress functions where appropriate.
Achieve > 80% code coverage.
```

## Common Development Patterns

### Pattern 1: Settings API Integration

```php
public function register_settings() {
    register_setting(
        'feature_settings_group',
        'feature_settings',
        array( $this, 'sanitize_settings' )
    );

    add_settings_section(
        'feature_main_section',
        __( 'Main Settings', 'text-domain' ),
        array( $this, 'render_section_description' ),
        'feature-settings'
    );

    add_settings_field(
        'feature_option_1',
        __( 'Option 1', 'text-domain' ),
        array( $this, 'render_option_1_field' ),
        'feature-settings',
        'feature_main_section'
    );
}
```

### Pattern 2: Custom Post Type Registration

```php
public function register_post_type() {
    $args = array(
        'labels' => array(
            'name' => __( 'Items', 'text-domain' ),
            'singular_name' => __( 'Item', 'text-domain' ),
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array( 'title', 'editor', 'thumbnail' ),
        'show_in_rest' => true,
    );

    register_post_type( 'feature_item', $args );
}
```

### Pattern 3: Meta Box Implementation

```php
public function add_meta_box() {
    add_meta_box(
        'feature_meta_box',
        __( 'Feature Settings', 'text-domain' ),
        array( $this, 'render_meta_box' ),
        'post',
        'side',
        'default'
    );
}

public function render_meta_box( $post ) {
    wp_nonce_field( 'feature_meta_box', 'feature_meta_box_nonce' );
    $value = get_post_meta( $post->ID, '_feature_meta_key', true );
    ?>
    <label for="feature_field">
        <?php _e( 'Feature Field', 'text-domain' ); ?>
    </label>
    <input type="text" id="feature_field" name="feature_field" value="<?php echo esc_attr( $value ); ?>" />
    <?php
}

public function save_meta_box( $post_id ) {
    // Verify nonce
    if ( ! isset( $_POST['feature_meta_box_nonce'] ) || ! wp_verify_nonce( $_POST['feature_meta_box_nonce'], 'feature_meta_box' ) ) {
        return;
    }

    // Check autosave
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }

    // Check capabilities
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // Sanitize and save
    if ( isset( $_POST['feature_field'] ) ) {
        $value = sanitize_text_field( $_POST['feature_field'] );
        update_post_meta( $post_id, '_feature_meta_key', $value );
    }
}
```

## Best Practices

### DO

✅ Always verify nonces before processing forms
✅ Always check user capabilities
✅ Always sanitize input using WordPress functions
✅ Always escape output using WordPress functions
✅ Write tests before implementing features (TDD)
✅ Use WordPress coding standards
✅ Add PHPDoc comments to all functions
✅ Use WordPress APIs instead of direct database queries
✅ Implement error handling and logging
✅ Test with different WordPress versions

### DON'T

❌ Trust user input without sanitization
❌ Output data without escaping
❌ Skip nonce verification
❌ Skip capability checks
❌ Use direct SQL queries without preparation
❌ Hardcode values (use constants or options)
❌ Ignore WordPress coding standards
❌ Skip writing tests
❌ Commit code without testing
❌ Deploy without security audit

## Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [WordPress Security Best Practices](https://developer.wordpress.org/plugins/security/)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [WordPress Test Suite](https://make.wordpress.org/core/handbook/testing/automated-testing/phpunit/)

## Related Workflows

- `scaffolding-workflow.md` - Creating new plugins
- `testing-workflow.md` - Testing setup and execution
- `submission-workflow.md` - WordPress.org submission

## Related Domain Rules

- `domain-rules/wordpress-plugin/plugin-structure.md`
- `domain-rules/wordpress-plugin/security-best-practices.md`
- `domain-rules/wordpress-plugin/testing-patterns.md`

