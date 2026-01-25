# Security Best Practices

## Overview

This guide covers critical security rules for WordPress plugin development including nonce verification, input sanitization, output escaping, capability checks, and prepared statements.

---

## Nonce Verification

### What are Nonces?

Nonces (Number Used Once) are security tokens that protect against CSRF (Cross-Site Request Forgery) attacks.

### Creating Nonces

```php
<?php
/**
 * Create nonce field in form
 */
function my_plugin_settings_form() {
    ?>
    <form method="post" action="">
        <?php wp_nonce_field( 'my_plugin_save_settings', 'my_plugin_nonce' ); ?>
        
        <input type="text" name="setting_value" />
        <input type="submit" value="Save" />
    </form>
    <?php
}

/**
 * Create nonce URL
 */
$delete_url = wp_nonce_url(
    admin_url( 'admin.php?page=my-plugin&action=delete&id=123' ),
    'delete_item_123'
);

/**
 * Create nonce value
 */
$nonce = wp_create_nonce( 'my_plugin_action' );
```

### Verifying Nonces

```php
<?php
/**
 * Verify nonce in form submission
 */
function my_plugin_save_settings() {
    // Check if nonce field exists and is valid
    if ( ! isset( $_POST['my_plugin_nonce'] ) || 
         ! wp_verify_nonce( $_POST['my_plugin_nonce'], 'my_plugin_save_settings' ) ) {
        wp_die( __( 'Security check failed', 'my-plugin' ) );
    }
    
    // Process form data
    $value = sanitize_text_field( $_POST['setting_value'] );
    update_option( 'my_plugin_setting', $value );
}

/**
 * Verify nonce in URL
 */
function my_plugin_delete_item() {
    if ( ! isset( $_GET['_wpnonce'] ) || 
         ! wp_verify_nonce( $_GET['_wpnonce'], 'delete_item_' . $_GET['id'] ) ) {
        wp_die( __( 'Security check failed', 'my-plugin' ) );
    }
    
    // Delete item
    $item_id = absint( $_GET['id'] );
    my_plugin_delete( $item_id );
}

/**
 * Verify nonce in AJAX
 */
function my_plugin_ajax_handler() {
    check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );
    
    // Process AJAX request
    $data = sanitize_text_field( $_POST['data'] );
    wp_send_json_success( array( 'message' => 'Success' ) );
}
add_action( 'wp_ajax_my_plugin_action', 'my_plugin_ajax_handler' );
```

---

## Input Sanitization

### Text Fields

```php
<?php
// Sanitize text field (removes tags, encodes special chars)
$clean_text = sanitize_text_field( $_POST['field'] );

// Sanitize textarea (preserves line breaks)
$clean_textarea = sanitize_textarea_field( $_POST['textarea'] );

// Sanitize title (lowercase alphanumeric with dashes)
$clean_title = sanitize_title( $_POST['title'] );

// Sanitize key (lowercase alphanumeric with dashes and underscores)
$clean_key = sanitize_key( $_POST['key'] );

// Sanitize file name
$clean_filename = sanitize_file_name( $_FILES['file']['name'] );
```

### Email and URL

```php
<?php
// Sanitize email
$clean_email = sanitize_email( $_POST['email'] );

// Validate email
if ( ! is_email( $clean_email ) ) {
    wp_die( __( 'Invalid email address', 'my-plugin' ) );
}

// Sanitize URL
$clean_url = esc_url_raw( $_POST['url'] );

// Validate URL
if ( ! filter_var( $clean_url, FILTER_VALIDATE_URL ) ) {
    wp_die( __( 'Invalid URL', 'my-plugin' ) );
}
```

### Numbers

```php
<?php
// Sanitize integer (absolute integer)
$clean_int = absint( $_POST['number'] );

// Sanitize integer (can be negative)
$clean_int = intval( $_POST['number'] );

// Sanitize float
$clean_float = floatval( $_POST['price'] );
```

### HTML Content

```php
<?php
// Sanitize HTML (allows safe HTML tags)
$clean_html = wp_kses_post( $_POST['content'] );

// Sanitize with custom allowed tags
$allowed_tags = array(
    'a' => array(
        'href'  => array(),
        'title' => array(),
    ),
    'br'     => array(),
    'em'     => array(),
    'strong' => array(),
);
$clean_html = wp_kses( $_POST['content'], $allowed_tags );

// Strip all tags
$clean_text = wp_strip_all_tags( $_POST['content'] );
```

### Arrays

```php
<?php
// Sanitize array of text fields
$clean_array = array_map( 'sanitize_text_field', $_POST['items'] );

// Sanitize array of integers
$clean_ids = array_map( 'absint', $_POST['ids'] );
```

---

## Output Escaping

### HTML Context

```php
<?php
// Escape HTML
echo esc_html( $text );

// Escape HTML with translation
echo esc_html__( 'Hello World', 'my-plugin' );
echo esc_html_e( 'Hello World', 'my-plugin' ); // Echoes directly
```

### Attribute Context

```php
<?php
// Escape attribute
echo '<input type="text" value="' . esc_attr( $value ) . '" />';

// Escape attribute with translation
echo '<input type="text" placeholder="' . esc_attr__( 'Enter name', 'my-plugin' ) . '" />';
```

### URL Context

```php
<?php
// Escape URL
echo '<a href="' . esc_url( $url ) . '">Link</a>';

// Escape URL for use in HTML attribute
echo '<a href="' . esc_url( $url ) . '">Link</a>';
```

### JavaScript Context

```php
<?php
// Escape JavaScript
echo '<script>var message = "' . esc_js( $message ) . '";</script>';

// Better: Use wp_json_encode for complex data
echo '<script>var data = ' . wp_json_encode( $data ) . ';</script>';

// Localize script data (recommended)
wp_localize_script( 'my-script', 'myData', array(
    'message' => $message,
    'url'     => admin_url( 'admin-ajax.php' ),
) );
```

### Textarea Context

```php
<?php
// Escape textarea
echo '<textarea>' . esc_textarea( $content ) . '</textarea>';
```

### SQL Context

```php
<?php
// Use $wpdb->prepare() - covered in Prepared Statements section
global $wpdb;
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}table WHERE id = %d",
        $id
    )
);
```

---

## Capability Checks

### Check User Capabilities

```php
<?php
/**
 * Check if user can manage options
 */
function my_plugin_admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( __( 'You do not have sufficient permissions to access this page.', 'my-plugin' ) );
    }

    // Display admin page
}

/**
 * Check if user can edit posts
 */
function my_plugin_save_post_meta( $post_id ) {
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // Save post meta
}

/**
 * Check if user can delete users
 */
function my_plugin_delete_user( $user_id ) {
    if ( ! current_user_can( 'delete_users' ) ) {
        wp_die( __( 'You do not have permission to delete users.', 'my-plugin' ) );
    }

    // Delete user
}
```

### Common Capabilities

- `manage_options` - Administrator
- `edit_posts` - Editor, Author, Contributor
- `publish_posts` - Editor, Author
- `edit_published_posts` - Editor, Author
- `delete_posts` - Editor, Author, Contributor
- `upload_files` - Editor, Author
- `edit_pages` - Editor
- `edit_users` - Administrator
- `delete_users` - Administrator
- `install_plugins` - Administrator
- `activate_plugins` - Administrator

### Custom Capabilities

```php
<?php
/**
 * Add custom capability on activation
 */
function my_plugin_add_capabilities() {
    $role = get_role( 'administrator' );

    if ( $role ) {
        $role->add_cap( 'manage_my_plugin' );
        $role->add_cap( 'edit_my_plugin_items' );
    }
}
register_activation_hook( __FILE__, 'my_plugin_add_capabilities' );

/**
 * Check custom capability
 */
function my_plugin_admin_page() {
    if ( ! current_user_can( 'manage_my_plugin' ) ) {
        wp_die( __( 'Insufficient permissions', 'my-plugin' ) );
    }

    // Display admin page
}
```

---

## Prepared Statements

### Using $wpdb->prepare()

**Always use prepared statements to prevent SQL injection.**

```php
<?php
global $wpdb;

// Single placeholder
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE user_id = %d",
        $user_id
    )
);

// Multiple placeholders
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE user_id = %d AND status = %s",
        $user_id,
        $status
    )
);

// LIKE query
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE title LIKE %s",
        '%' . $wpdb->esc_like( $search_term ) . '%'
    )
);
```

### Placeholder Types

- `%s` - String
- `%d` - Integer (signed)
- `%f` - Float

```php
<?php
// String placeholder
$wpdb->prepare( "SELECT * FROM table WHERE name = %s", $name );

// Integer placeholder
$wpdb->prepare( "SELECT * FROM table WHERE id = %d", $id );

// Float placeholder
$wpdb->prepare( "SELECT * FROM table WHERE price = %f", $price );

// Multiple types
$wpdb->prepare(
    "INSERT INTO table (name, age, score) VALUES (%s, %d, %f)",
    $name,
    $age,
    $score
);
```

### ❌ DON'T - SQL Injection Vulnerability

```php
<?php
// WRONG - Direct variable insertion (SQL injection risk)
$results = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}table WHERE user_id = $user_id"
);

// WRONG - String concatenation
$results = $wpdb->get_results(
    "SELECT * FROM {$wpdb->prefix}table WHERE name = '" . $name . "'"
);
```

### ✅ DO - Use Prepared Statements

```php
<?php
// CORRECT - Use $wpdb->prepare()
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}table WHERE user_id = %d",
        $user_id
    )
);

// CORRECT - Multiple parameters
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}table WHERE name = %s AND age = %d",
        $name,
        $age
    )
);
```

---

## File Upload Security

### Validate File Uploads

```php
<?php
/**
 * Validate file upload
 */
function my_plugin_validate_file_upload( $file ) {
    // Check if file was uploaded
    if ( ! isset( $file['error'] ) || is_array( $file['error'] ) ) {
        wp_die( __( 'Invalid file upload', 'my-plugin' ) );
    }

    // Check for upload errors
    if ( $file['error'] !== UPLOAD_ERR_OK ) {
        wp_die( __( 'Upload error', 'my-plugin' ) );
    }

    // Check file size (5MB max)
    if ( $file['size'] > 5242880 ) {
        wp_die( __( 'File too large (max 5MB)', 'my-plugin' ) );
    }

    // Check file type
    $allowed_types = array( 'image/jpeg', 'image/png', 'image/gif' );
    $finfo = finfo_open( FILEINFO_MIME_TYPE );
    $mime_type = finfo_file( $finfo, $file['tmp_name'] );
    finfo_close( $finfo );

    if ( ! in_array( $mime_type, $allowed_types, true ) ) {
        wp_die( __( 'Invalid file type', 'my-plugin' ) );
    }

    // Sanitize filename
    $filename = sanitize_file_name( $file['name'] );

    return true;
}

/**
 * Handle file upload
 */
function my_plugin_handle_upload() {
    // Check nonce
    check_ajax_referer( 'my_plugin_upload_nonce', 'security' );

    // Check capability
    if ( ! current_user_can( 'upload_files' ) ) {
        wp_send_json_error( array( 'message' => 'Insufficient permissions' ) );
    }

    // Validate file
    if ( empty( $_FILES['file'] ) ) {
        wp_send_json_error( array( 'message' => 'No file uploaded' ) );
    }

    my_plugin_validate_file_upload( $_FILES['file'] );

    // Use WordPress upload handler
    require_once( ABSPATH . 'wp-admin/includes/file.php' );

    $uploaded_file = wp_handle_upload( $_FILES['file'], array( 'test_form' => false ) );

    if ( isset( $uploaded_file['error'] ) ) {
        wp_send_json_error( array( 'message' => $uploaded_file['error'] ) );
    }

    wp_send_json_success( array(
        'url'  => $uploaded_file['url'],
        'path' => $uploaded_file['file'],
    ) );
}
add_action( 'wp_ajax_my_plugin_upload', 'my_plugin_handle_upload' );
```

---

## Authentication and Authorization

### Check if User is Logged In

```php
<?php
/**
 * Require user to be logged in
 */
function my_plugin_members_only_page() {
    if ( ! is_user_logged_in() ) {
        wp_redirect( wp_login_url( get_permalink() ) );
        exit;
    }

    // Display members-only content
}

/**
 * Get current user ID
 */
$user_id = get_current_user_id();

if ( $user_id ) {
    // User is logged in
} else {
    // User is not logged in
}
```

### Verify User Owns Resource

```php
<?php
/**
 * Verify user owns the item before editing
 */
function my_plugin_edit_item( $item_id ) {
    global $wpdb;

    $item = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}my_plugin_items WHERE id = %d",
            $item_id
        )
    );

    if ( ! $item ) {
        wp_die( __( 'Item not found', 'my-plugin' ) );
    }

    // Check if current user owns the item
    if ( $item->user_id !== get_current_user_id() ) {
        wp_die( __( 'You do not have permission to edit this item', 'my-plugin' ) );
    }

    // Edit item
}
```

---

## Common Vulnerabilities

### SQL Injection Prevention

```php
<?php
// ✅ CORRECT
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}posts WHERE ID = %d",
        $id
    )
);

// ❌ WRONG
$results = $wpdb->query( "SELECT * FROM {$wpdb->prefix}posts WHERE ID = $id" );
```

### Cross-Site Scripting (XSS) Prevention

```php
<?php
// ✅ CORRECT
echo esc_html( $user_input );

// ❌ WRONG
echo $user_input;
```

### Cross-Site Request Forgery (CSRF) Prevention

```php
<?php
// ✅ CORRECT
wp_nonce_field( 'my_action', 'my_nonce' );
wp_verify_nonce( $_POST['my_nonce'], 'my_action' );

// ❌ WRONG
// No nonce verification
```

### Directory Traversal Prevention

```php
<?php
// ✅ CORRECT
$file = basename( $_GET['file'] );
$path = WP_CONTENT_DIR . '/uploads/' . $file;

if ( ! file_exists( $path ) ) {
    wp_die( __( 'File not found', 'my-plugin' ) );
}

// ❌ WRONG
$file = $_GET['file'];
$path = WP_CONTENT_DIR . '/uploads/' . $file; // Can access ../../../etc/passwd
```

### Remote Code Execution Prevention

```php
<?php
// ❌ WRONG - Never use eval() with user input
eval( $_POST['code'] );

// ❌ WRONG - Never execute user input
system( $_POST['command'] );

// ✅ CORRECT - Validate and whitelist allowed actions
$allowed_actions = array( 'action1', 'action2', 'action3' );
$action = sanitize_text_field( $_POST['action'] );

if ( in_array( $action, $allowed_actions, true ) ) {
    call_user_func( 'my_plugin_' . $action );
}
```

---

## Best Practices Summary

### Input Handling

✅ **DO**:
- Sanitize all input using appropriate functions
- Validate data types and formats
- Use whitelist validation when possible
- Never trust user input

❌ **DON'T**:
- Use unsanitized input directly
- Assume input is safe
- Skip validation

### Output Handling

✅ **DO**:
- Escape all output based on context
- Use `esc_html()`, `esc_attr()`, `esc_url()`, `esc_js()`
- Escape late (just before output)

❌ **DON'T**:
- Output raw user input
- Forget to escape
- Use wrong escaping function for context

### Database

✅ **DO**:
- Always use prepared statements
- Use `$wpdb->prepare()` for custom queries
- Use WordPress database functions when possible

❌ **DON'T**:
- Concatenate user input into SQL
- Skip prepared statements
- Trust user input in queries

### Authentication

✅ **DO**:
- Use nonces for all form submissions
- Check user capabilities
- Verify user identity for sensitive operations
- Use HTTPS for login and admin areas

❌ **DON'T**:
- Skip nonce verification
- Forget capability checks
- Allow unauthenticated access to sensitive data

### Files

✅ **DO**:
- Validate file types and sizes
- Use WordPress upload functions
- Sanitize filenames
- Check MIME types

❌ **DON'T**:
- Trust file extensions
- Allow unrestricted uploads
- Skip file validation

---

## Security Checklist

### For Every Form

- [ ] Nonce field added with `wp_nonce_field()`
- [ ] Nonce verified with `wp_verify_nonce()`
- [ ] Capability check with `current_user_can()`
- [ ] All input sanitized
- [ ] All output escaped

### For Every AJAX Handler

- [ ] Nonce verified with `check_ajax_referer()`
- [ ] Capability check performed
- [ ] Input sanitized
- [ ] Output escaped in response

### For Every Database Query

- [ ] Using `$wpdb->prepare()` for custom queries
- [ ] Correct placeholder types (%s, %d, %f)
- [ ] No direct variable insertion

### For Every File Upload

- [ ] File type validated
- [ ] File size checked
- [ ] MIME type verified
- [ ] Filename sanitized
- [ ] Using `wp_handle_upload()`

---

## Complete Example

### Secure Form Processing

```php
<?php
/**
 * Display form
 */
function my_plugin_display_form() {
    ?>
    <form method="post" action="">
        <?php wp_nonce_field( 'my_plugin_save_data', 'my_plugin_nonce' ); ?>

        <label for="title">Title:</label>
        <input type="text" id="title" name="title" value="<?php echo esc_attr( get_option( 'my_plugin_title' ) ); ?>" />

        <label for="content">Content:</label>
        <textarea id="content" name="content"><?php echo esc_textarea( get_option( 'my_plugin_content' ) ); ?></textarea>

        <input type="submit" name="submit" value="<?php esc_attr_e( 'Save', 'my-plugin' ); ?>" />
    </form>
    <?php
}

/**
 * Process form submission
 */
function my_plugin_process_form() {
    // Check if form was submitted
    if ( ! isset( $_POST['submit'] ) ) {
        return;
    }

    // Verify nonce
    if ( ! isset( $_POST['my_plugin_nonce'] ) ||
         ! wp_verify_nonce( $_POST['my_plugin_nonce'], 'my_plugin_save_data' ) ) {
        wp_die( __( 'Security check failed', 'my-plugin' ) );
    }

    // Check capability
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( __( 'Insufficient permissions', 'my-plugin' ) );
    }

    // Sanitize input
    $title = sanitize_text_field( $_POST['title'] );
    $content = wp_kses_post( $_POST['content'] );

    // Validate input
    if ( empty( $title ) ) {
        add_settings_error( 'my_plugin', 'empty_title', __( 'Title is required', 'my-plugin' ) );
        return;
    }

    // Save data
    update_option( 'my_plugin_title', $title );
    update_option( 'my_plugin_content', $content );

    // Success message
    add_settings_error( 'my_plugin', 'settings_saved', __( 'Settings saved', 'my-plugin' ), 'success' );
}
add_action( 'admin_init', 'my_plugin_process_form' );
```

---

## Summary

**Key Takeaways:**

1. **Nonces**: Always use nonces for form submissions and AJAX requests
2. **Sanitization**: Sanitize all input with appropriate functions
3. **Escaping**: Escape all output based on context
4. **Capabilities**: Check user capabilities for all sensitive operations
5. **Prepared Statements**: Always use `$wpdb->prepare()` for database queries
6. **File Uploads**: Validate file types, sizes, and MIME types
7. **Authentication**: Verify user identity for sensitive operations

**Common Mistakes to Avoid:**

- Skipping nonce verification
- Not sanitizing user input
- Forgetting to escape output
- Using direct SQL queries without preparation
- Trusting file extensions
- Not checking user capabilities

**Resources:**

- [WordPress Security](https://developer.wordpress.org/plugins/security/)
- [Data Validation](https://developer.wordpress.org/plugins/security/data-validation/)
- [Securing Input](https://developer.wordpress.org/plugins/security/securing-input/)
- [Securing Output](https://developer.wordpress.org/plugins/security/securing-output/)
- [Nonces](https://developer.wordpress.org/plugins/security/nonces/)

