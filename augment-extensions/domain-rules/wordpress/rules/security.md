# WordPress Security Best Practices

## Overview

This document provides comprehensive security guidelines for WordPress development, covering input sanitization, output escaping, authentication, and common vulnerabilities.

## Critical Security Rules

### 🔴 NEVER

❌ Trust user input  
❌ Use `eval()` or similar dangerous functions  
❌ Store passwords in plain text  
❌ Use `$_GET`, `$_POST`, `$_REQUEST` directly without sanitization  
❌ Output data without escaping  
❌ Use SQL queries without prepared statements  
❌ Hardcode credentials  
❌ Disable security features for convenience  
❌ Use deprecated functions  
❌ Ignore WordPress security updates

### ✅ ALWAYS

✅ Sanitize all input  
✅ Escape all output  
✅ Use nonces for form submissions  
✅ Check user capabilities  
✅ Use prepared statements for database queries  
✅ Validate and verify data  
✅ Use HTTPS  
✅ Keep WordPress, themes, and plugins updated  
✅ Use strong passwords  
✅ Implement proper error handling

## Input Sanitization

### Text Fields

```php
// Sanitize text field
$clean_text = sanitize_text_field( $_POST['field'] );

// Sanitize textarea
$clean_textarea = sanitize_textarea_field( $_POST['textarea'] );

// Sanitize title
$clean_title = sanitize_title( $_POST['title'] );

// Sanitize key (lowercase alphanumeric with dashes and underscores)
$clean_key = sanitize_key( $_POST['key'] );
```

### Email and URL

```php
// Sanitize email
$clean_email = sanitize_email( $_POST['email'] );

// Validate email
if ( ! is_email( $clean_email ) ) {
    wp_die( __( 'Invalid email address', 'my-plugin' ) );
}

// Sanitize URL
$clean_url = esc_url_raw( $_POST['url'] );

// Sanitize file name
$clean_filename = sanitize_file_name( $_FILES['file']['name'] );
```

### HTML and Rich Content

```php
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

// Strip all HTML tags
$clean_text = wp_strip_all_tags( $_POST['content'] );
```

### Arrays and Complex Data

```php
// Sanitize array of text fields
$clean_array = array_map( 'sanitize_text_field', $_POST['items'] );

// Sanitize array recursively
function sanitize_array( $array ) {
    foreach ( $array as $key => &$value ) {
        if ( is_array( $value ) ) {
            $value = sanitize_array( $value );
        } else {
            $value = sanitize_text_field( $value );
        }
    }
    return $array;
}
$clean_data = sanitize_array( $_POST['data'] );
```

### Numbers and Booleans

```php
// Sanitize integer
$clean_int = absint( $_POST['number'] ); // Absolute integer (always positive)
$clean_int = intval( $_POST['number'] ); // Can be negative

// Sanitize float
$clean_float = floatval( $_POST['price'] );

// Sanitize boolean
$clean_bool = (bool) $_POST['checkbox'];
$clean_bool = rest_sanitize_boolean( $_POST['checkbox'] ); // REST API
```

## Output Escaping

### HTML Context

```php
// Escape HTML
echo esc_html( $text );

// Escape HTML with translation
echo esc_html__( 'Text to translate', 'my-plugin' );
echo esc_html_e( 'Text to translate', 'my-plugin' ); // Echo version

// Escape and translate with variables
echo esc_html( sprintf( __( 'Hello %s', 'my-plugin' ), $name ) );
```

### Attribute Context

```php
// Escape attributes
echo '<div class="' . esc_attr( $class ) . '">';
echo '<input type="text" value="' . esc_attr( $value ) . '" />';

// Escape attribute with translation
echo '<div title="' . esc_attr__( 'Title text', 'my-plugin' ) . '">';
```

### URL Context

```php
// Escape URL
echo '<a href="' . esc_url( $url ) . '">';

// Escape URL for database storage
$clean_url = esc_url_raw( $url );
```

### JavaScript Context

```php
// Escape JavaScript
echo '<script>var data = "' . esc_js( $data ) . '";</script>';

// Better: Use wp_localize_script or wp_json_encode
wp_localize_script( 'my-script', 'myData', array(
    'value' => $data,
) );

// Or use JSON encoding
echo '<script>var data = ' . wp_json_encode( $data ) . ';</script>';
```

### Textarea Context

```php
// Escape textarea
echo '<textarea>' . esc_textarea( $content ) . '</textarea>';
```

## Nonce Verification

### Creating Nonces

```php
// Create nonce field in form
wp_nonce_field( 'my_action', 'my_nonce_field' );

// Create nonce URL
$url = wp_nonce_url( 'admin.php?page=my-page&action=delete', 'delete_action' );

// Create nonce value
$nonce = wp_create_nonce( 'my_action' );
```

### Verifying Nonces

```php
// Verify nonce in form submission
if ( ! isset( $_POST['my_nonce_field'] ) || ! wp_verify_nonce( $_POST['my_nonce_field'], 'my_action' ) ) {
    wp_die( __( 'Security check failed', 'my-plugin' ) );
}

// Verify nonce in URL
if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'delete_action' ) ) {
    wp_die( __( 'Security check failed', 'my-plugin' ) );
}

// Verify nonce in AJAX
check_ajax_referer( 'my_ajax_action', 'security' );
```

### Nonce in AJAX

```php
// Localize nonce for AJAX
wp_localize_script( 'my-ajax-script', 'myAjax', array(
    'ajaxurl' => admin_url( 'admin-ajax.php' ),
    'nonce'   => wp_create_nonce( 'my_ajax_action' ),
) );

// JavaScript
jQuery.ajax({
    url: myAjax.ajaxurl,
    type: 'POST',
    data: {
        action: 'my_ajax_action',
        security: myAjax.nonce,
        data: 'value'
    },
    success: function(response) {
        console.log(response);
    }
});

// PHP handler
function my_ajax_handler() {
    check_ajax_referer( 'my_ajax_action', 'security' );
    
    // Process request
    $data = sanitize_text_field( $_POST['data'] );
    
    wp_send_json_success( array( 'message' => 'Success' ) );
}
add_action( 'wp_ajax_my_ajax_action', 'my_ajax_handler' );
```

## Capability Checks

### Check User Capabilities

```php
// Check if user can manage options
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( __( 'You do not have sufficient permissions', 'my-plugin' ) );
}

// Check if user can edit posts
if ( ! current_user_can( 'edit_posts' ) ) {
    return;
}

// Check if user can edit specific post
if ( ! current_user_can( 'edit_post', $post_id ) ) {
    wp_die( __( 'You cannot edit this post', 'my-plugin' ) );
}

// Check if user can delete users
if ( ! current_user_can( 'delete_users' ) ) {
    return;
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

## Database Security

### Prepared Statements

```php
global $wpdb;

// Correct: Use prepared statements
$user_id = 123;
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}my_table WHERE user_id = %d",
        $user_id
    )
);

// Correct: Multiple placeholders
$name = 'John';
$age = 30;
$wpdb->query(
    $wpdb->prepare(
        "INSERT INTO {$wpdb->prefix}my_table (name, age) VALUES (%s, %d)",
        $name,
        $age
    )
);

// WRONG: Direct variable insertion (SQL injection risk)
$results = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}my_table WHERE user_id = $user_id" );
```

### Placeholder Types

- `%s` - String
- `%d` - Integer
- `%f` - Float

### Safe Database Operations

```php
// Insert
$wpdb->insert(
    $wpdb->prefix . 'my_table',
    array(
        'name' => sanitize_text_field( $_POST['name'] ),
        'age'  => absint( $_POST['age'] ),
    ),
    array( '%s', '%d' )
);

// Update
$wpdb->update(
    $wpdb->prefix . 'my_table',
    array( 'name' => sanitize_text_field( $_POST['name'] ) ),
    array( 'id' => absint( $_POST['id'] ) ),
    array( '%s' ),
    array( '%d' )
);

// Delete
$wpdb->delete(
    $wpdb->prefix . 'my_table',
    array( 'id' => absint( $_POST['id'] ) ),
    array( '%d' )
);
```

## File Upload Security

### Validate File Uploads

```php
function validate_file_upload( $file ) {
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
        wp_die( __( 'File too large', 'my-plugin' ) );
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
```

### Use WordPress Upload Functions

```php
// Use WordPress file upload handler
require_once( ABSPATH . 'wp-admin/includes/file.php' );

$uploaded_file = wp_handle_upload( $_FILES['file'], array( 'test_form' => false ) );

if ( isset( $uploaded_file['error'] ) ) {
    wp_die( $uploaded_file['error'] );
}

// File uploaded successfully
$file_url = $uploaded_file['url'];
$file_path = $uploaded_file['file'];
```

## Authentication and Authorization

### Check if User is Logged In

```php
if ( ! is_user_logged_in() ) {
    wp_redirect( wp_login_url() );
    exit;
}
```

### Verify User Identity

```php
// Check if current user owns the post
$post = get_post( $post_id );
if ( $post->post_author != get_current_user_id() ) {
    wp_die( __( 'You do not own this post', 'my-plugin' ) );
}
```

### Password Hashing

```php
// Hash password (WordPress handles this automatically)
$user_id = wp_create_user( $username, $password, $email );

// Verify password
$user = get_user_by( 'login', $username );
if ( $user && wp_check_password( $password, $user->user_pass, $user->ID ) ) {
    // Password is correct
}

// Update password
wp_set_password( $new_password, $user_id );
```

## Common Vulnerabilities

### SQL Injection Prevention

```php
// ✅ CORRECT
$wpdb->prepare( "SELECT * FROM {$wpdb->posts} WHERE ID = %d", $id );

// ❌ WRONG
$wpdb->query( "SELECT * FROM {$wpdb->posts} WHERE ID = $id" );
```

### Cross-Site Scripting (XSS) Prevention

```php
// ✅ CORRECT
echo esc_html( $user_input );

// ❌ WRONG
echo $user_input;
```

### Cross-Site Request Forgery (CSRF) Prevention

```php
// ✅ CORRECT
wp_nonce_field( 'my_action', 'my_nonce' );
wp_verify_nonce( $_POST['my_nonce'], 'my_action' );

// ❌ WRONG
// No nonce verification
```

### Directory Traversal Prevention

```php
// ✅ CORRECT
$file = basename( $_GET['file'] );
$path = WP_CONTENT_DIR . '/uploads/' . $file;

// Verify file is in allowed directory
if ( strpos( realpath( $path ), WP_CONTENT_DIR . '/uploads/' ) !== 0 ) {
    wp_die( __( 'Invalid file path', 'my-plugin' ) );
}

// ❌ WRONG
$file = $_GET['file'];
include( WP_CONTENT_DIR . '/uploads/' . $file );
```

## Security Headers

### Add Security Headers

```php
/**
 * Add security headers
 */
function add_security_headers() {
    header( 'X-Content-Type-Options: nosniff' );
    header( 'X-Frame-Options: SAMEORIGIN' );
    header( 'X-XSS-Protection: 1; mode=block' );
    header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}
add_action( 'send_headers', 'add_security_headers' );
```

## Best Practices Summary

### Input Handling

✅ Sanitize all input using appropriate functions  
✅ Validate data types and formats  
✅ Use whitelist validation when possible  
✅ Never trust user input

### Output Handling

✅ Escape all output based on context  
✅ Use `esc_html()`, `esc_attr()`, `esc_url()`, `esc_js()`  
✅ Escape late (just before output)

### Database

✅ Always use prepared statements  
✅ Use `$wpdb->prepare()` for custom queries  
✅ Use WordPress database functions when possible

### Authentication

✅ Use nonces for all form submissions  
✅ Check user capabilities  
✅ Verify user identity for sensitive operations  
✅ Use HTTPS for login and admin areas

### Files

✅ Validate file uploads  
✅ Check file types and sizes  
✅ Use WordPress upload functions  
✅ Store uploads outside web root when possible

### General

✅ Keep WordPress, themes, and plugins updated  
✅ Use strong passwords  
✅ Limit login attempts  
✅ Regular security audits  
✅ Monitor error logs  
✅ Use security plugins  
✅ Regular backups

