# AJAX Handlers

## Overview

This guide covers WordPress AJAX implementation for plugins including script enqueuing, localization, nonce verification, capability checks, and JSON responses.

---

## Basic AJAX Setup

### Enqueue Script with AJAX Data

```php
<?php
/**
 * Enqueue AJAX script
 */
function my_plugin_enqueue_ajax_script() {
    wp_enqueue_script(
        'my-plugin-ajax',
        plugins_url( 'js/ajax-handler.js', __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );
    
    // Localize script with AJAX URL and nonce
    wp_localize_script( 'my-plugin-ajax', 'myPluginAjax', array(
        'ajaxurl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'my_plugin_ajax_nonce' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_ajax_script' );
```

### JavaScript AJAX Request

**js/ajax-handler.js:**
```javascript
jQuery(document).ready(function($) {
    $('#my-button').on('click', function(e) {
        e.preventDefault();
        
        var data = {
            action: 'my_plugin_ajax_action',
            security: myPluginAjax.nonce,
            item_id: $(this).data('item-id'),
            value: $('#my-input').val()
        };
        
        $.ajax({
            url: myPluginAjax.ajaxurl,
            type: 'POST',
            data: data,
            beforeSend: function() {
                $('#my-button').prop('disabled', true).text('Loading...');
            },
            success: function(response) {
                if (response.success) {
                    console.log('Success:', response.data);
                    alert(response.data.message);
                } else {
                    console.error('Error:', response.data);
                    alert('Error: ' + response.data.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', error);
                alert('An error occurred. Please try again.');
            },
            complete: function() {
                $('#my-button').prop('disabled', false).text('Submit');
            }
        });
    });
});
```

### PHP AJAX Handler

```php
<?php
/**
 * AJAX handler for logged-in users
 */
function my_plugin_ajax_handler() {
    // Verify nonce
    check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );
    
    // Check user capability
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( array(
            'message' => __( 'You do not have permission to perform this action.', 'my-plugin' ),
        ) );
    }
    
    // Sanitize input
    $item_id = isset( $_POST['item_id'] ) ? absint( $_POST['item_id'] ) : 0;
    $value   = isset( $_POST['value'] ) ? sanitize_text_field( $_POST['value'] ) : '';
    
    // Validate input
    if ( ! $item_id || empty( $value ) ) {
        wp_send_json_error( array(
            'message' => __( 'Invalid input data.', 'my-plugin' ),
        ) );
    }
    
    // Process request
    $result = update_post_meta( $item_id, '_my_custom_field', $value );
    
    if ( $result ) {
        wp_send_json_success( array(
            'message' => __( 'Data saved successfully.', 'my-plugin' ),
            'item_id' => $item_id,
            'value'   => $value,
        ) );
    } else {
        wp_send_json_error( array(
            'message' => __( 'Failed to save data.', 'my-plugin' ),
        ) );
    }
}
add_action( 'wp_ajax_my_plugin_ajax_action', 'my_plugin_ajax_handler' );
```

---

## AJAX for Logged-In and Non-Logged-In Users

### Handler for Both User Types

```php
<?php
/**
 * AJAX handler for logged-in users
 */
function my_plugin_public_ajax_handler() {
    // Verify nonce
    check_ajax_referer( 'my_plugin_public_nonce', 'security' );
    
    // Sanitize input
    $search_term = isset( $_POST['search'] ) ? sanitize_text_field( $_POST['search'] ) : '';
    
    // Query posts
    $args = array(
        'post_type'      => 'post',
        'posts_per_page' => 10,
        's'              => $search_term,
    );
    
    $query = new WP_Query( $args );
    
    $results = array();
    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $results[] = array(
                'id'    => get_the_ID(),
                'title' => get_the_title(),
                'url'   => get_permalink(),
            );
        }
        wp_reset_postdata();
    }
    
    wp_send_json_success( array(
        'results' => $results,
        'count'   => count( $results ),
    ) );
}
// For logged-in users
add_action( 'wp_ajax_my_plugin_public_action', 'my_plugin_public_ajax_handler' );
// For non-logged-in users
add_action( 'wp_ajax_nopriv_my_plugin_public_action', 'my_plugin_public_ajax_handler' );

---

## Advanced AJAX Patterns

### File Upload via AJAX

**JavaScript:**
```javascript
jQuery(document).ready(function($) {
    $('#upload-form').on('submit', function(e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append('action', 'my_plugin_upload_file');
        formData.append('security', myPluginAjax.nonce);
        formData.append('file', $('#file-input')[0].files[0]);

        $.ajax({
            url: myPluginAjax.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    console.log('File uploaded:', response.data.file_url);
                }
            }
        });
    });
});
```

**PHP:**
```php
<?php
/**
 * Handle file upload via AJAX
 */
function my_plugin_upload_file_handler() {
    check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );

    if ( ! current_user_can( 'upload_files' ) ) {
        wp_send_json_error( array(
            'message' => __( 'You do not have permission to upload files.', 'my-plugin' ),
        ) );
    }

    if ( empty( $_FILES['file'] ) ) {
        wp_send_json_error( array(
            'message' => __( 'No file uploaded.', 'my-plugin' ),
        ) );
    }

    require_once( ABSPATH . 'wp-admin/includes/file.php' );

    $uploaded_file = wp_handle_upload( $_FILES['file'], array( 'test_form' => false ) );

    if ( isset( $uploaded_file['error'] ) ) {
        wp_send_json_error( array(
            'message' => $uploaded_file['error'],
        ) );
    }

    wp_send_json_success( array(
        'message'  => __( 'File uploaded successfully.', 'my-plugin' ),
        'file_url' => $uploaded_file['url'],
        'file_path' => $uploaded_file['file'],
    ) );
}
add_action( 'wp_ajax_my_plugin_upload_file', 'my_plugin_upload_file_handler' );
```

### Long-Running Process with Progress Updates

**JavaScript:**
```javascript
function processLongRunningTask() {
    var totalItems = 100;
    var batchSize = 10;
    var processed = 0;

    function processBatch() {
        $.ajax({
            url: myPluginAjax.ajaxurl,
            type: 'POST',
            data: {
                action: 'my_plugin_process_batch',
                security: myPluginAjax.nonce,
                offset: processed,
                limit: batchSize
            },
            success: function(response) {
                if (response.success) {
                    processed += response.data.processed;
                    var progress = Math.round((processed / totalItems) * 100);

                    $('#progress-bar').css('width', progress + '%');
                    $('#progress-text').text(progress + '%');

                    if (processed < totalItems) {
                        processBatch(); // Process next batch
                    } else {
                        alert('Processing complete!');
                    }
                }
            }
        });
    }

    processBatch();
}
```

**PHP:**
```php
<?php
/**
 * Process batch of items
 */
function my_plugin_process_batch_handler() {
    check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( array(
            'message' => __( 'Insufficient permissions.', 'my-plugin' ),
        ) );
    }

    $offset = isset( $_POST['offset'] ) ? absint( $_POST['offset'] ) : 0;
    $limit  = isset( $_POST['limit'] ) ? absint( $_POST['limit'] ) : 10;

    // Get items to process
    $items = get_posts( array(
        'post_type'      => 'my_custom_post_type',
        'posts_per_page' => $limit,
        'offset'         => $offset,
    ) );

    $processed = 0;
    foreach ( $items as $item ) {
        // Process each item
        update_post_meta( $item->ID, '_processed', true );
        $processed++;
    }

    wp_send_json_success( array(
        'processed' => $processed,
        'offset'    => $offset + $processed,
    ) );
}
add_action( 'wp_ajax_my_plugin_process_batch', 'my_plugin_process_batch_handler' );
```

### Heartbeat API Integration

```php
<?php
/**
 * Modify Heartbeat API data
 */
function my_plugin_heartbeat_received( $response, $data ) {
    if ( isset( $data['my_plugin_check'] ) ) {
        // Get real-time data
        $response['my_plugin_data'] = array(
            'notifications' => get_user_meta( get_current_user_id(), 'unread_notifications', true ),
            'timestamp'     => current_time( 'timestamp' ),
        );
    }

    return $response;
}
add_filter( 'heartbeat_received', 'my_plugin_heartbeat_received', 10, 2 );
```

**JavaScript:**
```javascript
jQuery(document).on('heartbeat-send', function(event, data) {
    data.my_plugin_check = true;
});

jQuery(document).on('heartbeat-tick', function(event, data) {
    if (data.my_plugin_data) {
        console.log('Notifications:', data.my_plugin_data.notifications);
        $('#notification-count').text(data.my_plugin_data.notifications);
    }
});
```

---

## Error Handling

### Comprehensive Error Handling

**JavaScript:**
```javascript
function handleAjaxRequest(data) {
    $.ajax({
        url: myPluginAjax.ajaxurl,
        type: 'POST',
        data: data,
        timeout: 30000, // 30 seconds
        success: function(response) {
            if (response.success) {
                // Handle success
                console.log('Success:', response.data);
            } else {
                // Handle error from server
                console.error('Server error:', response.data);
                showErrorMessage(response.data.message || 'An error occurred');
            }
        },
        error: function(xhr, status, error) {
            // Handle AJAX error
            if (status === 'timeout') {
                showErrorMessage('Request timed out. Please try again.');
            } else if (status === 'abort') {
                showErrorMessage('Request was aborted.');
            } else {
                showErrorMessage('Network error: ' + error);
            }
        }
    });
}

function showErrorMessage(message) {
    $('#error-container').html('<div class="error">' + message + '</div>').show();
}
```

**PHP:**
```php
<?php
/**
 * AJAX handler with comprehensive error handling
 */
function my_plugin_safe_ajax_handler() {
    try {
        // Verify nonce
        if ( ! check_ajax_referer( 'my_plugin_ajax_nonce', 'security', false ) ) {
            throw new Exception( __( 'Security check failed.', 'my-plugin' ) );
        }

        // Check capability
        if ( ! current_user_can( 'edit_posts' ) ) {
            throw new Exception( __( 'Insufficient permissions.', 'my-plugin' ) );
        }

        // Validate input
        $item_id = isset( $_POST['item_id'] ) ? absint( $_POST['item_id'] ) : 0;
        if ( ! $item_id ) {
            throw new Exception( __( 'Invalid item ID.', 'my-plugin' ) );
        }

        // Process request
        $result = my_plugin_process_item( $item_id );

        if ( is_wp_error( $result ) ) {
            throw new Exception( $result->get_error_message() );
        }

        wp_send_json_success( array(
            'message' => __( 'Item processed successfully.', 'my-plugin' ),
            'data'    => $result,
        ) );

    } catch ( Exception $e ) {
        wp_send_json_error( array(
            'message' => $e->getMessage(),
            'code'    => $e->getCode(),
        ) );
    }
}
add_action( 'wp_ajax_my_plugin_safe_action', 'my_plugin_safe_ajax_handler' );
```

---

## Best Practices

### Security

1. **Always verify nonces**: Use `check_ajax_referer()` in every AJAX handler
2. **Check capabilities**: Verify user has permission to perform the action
3. **Sanitize input**: Use appropriate sanitization functions for all input
4. **Escape output**: Use `esc_html()`, `esc_url()`, etc. when outputting data
5. **Validate data**: Check that required data is present and valid

### Performance

1. **Limit query results**: Don't return large datasets in AJAX responses
2. **Use caching**: Cache expensive queries with transients
3. **Batch processing**: Break long-running tasks into smaller batches
4. **Debounce requests**: Prevent rapid-fire AJAX requests
5. **Set timeouts**: Configure appropriate timeout values

### User Experience

1. **Show loading states**: Disable buttons and show loading indicators
2. **Provide feedback**: Show success/error messages to users
3. **Handle errors gracefully**: Display user-friendly error messages
4. **Prevent duplicate requests**: Disable submit buttons during processing
5. **Use progress indicators**: For long-running operations

### Code Organization

1. **Separate concerns**: Keep JavaScript and PHP handlers focused
2. **Use action names consistently**: Follow naming convention `{plugin}_{action}`
3. **Group related handlers**: Organize AJAX handlers in dedicated files
4. **Document handlers**: Add PHPDoc blocks explaining what each handler does
5. **Use classes**: For complex plugins, use OOP to organize AJAX handlers

---

## Common Pitfalls

### ❌ DON'T

```php
// Don't skip nonce verification
function bad_ajax_handler() {
    // No nonce check - BAD!
    $data = $_POST['data'];
    update_option( 'my_option', $data );
    wp_send_json_success();
}

// Don't skip capability checks
function bad_ajax_handler2() {
    check_ajax_referer( 'my_nonce', 'security' );
    // No capability check - BAD!
    wp_delete_post( $_POST['post_id'], true );
    wp_send_json_success();
}

// Don't forget to sanitize
function bad_ajax_handler3() {
    check_ajax_referer( 'my_nonce', 'security' );
    $value = $_POST['value']; // Not sanitized - BAD!
    update_post_meta( $post_id, 'key', $value );
    wp_send_json_success();
}

// Don't echo and then use wp_send_json
function bad_ajax_handler4() {
    echo 'Processing...'; // BAD!
    wp_send_json_success( array( 'message' => 'Done' ) );
}
```

### ✅ DO

```php
// Always verify nonce
function good_ajax_handler() {
    check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );

    // Check capability
    if ( ! current_user_can( 'edit_posts' ) ) {
        wp_send_json_error( array( 'message' => 'Insufficient permissions' ) );
    }

    // Sanitize input
    $data = sanitize_text_field( $_POST['data'] );

    // Process and respond
    update_option( 'my_option', $data );
    wp_send_json_success( array( 'message' => 'Saved successfully' ) );
}
add_action( 'wp_ajax_my_plugin_action', 'good_ajax_handler' );
```

---

## Complete Example

### Plugin File Structure

```
my-plugin/
├── my-plugin.php
├── js/
│   └── ajax-handler.js
└── includes/
    └── class-ajax-handler.php
```

### Class-Based AJAX Handler

**includes/class-ajax-handler.php:**
```php
<?php
class My_Plugin_Ajax_Handler {

    public function __construct() {
        add_action( 'wp_ajax_my_plugin_save_data', array( $this, 'save_data' ) );
        add_action( 'wp_ajax_my_plugin_load_data', array( $this, 'load_data' ) );
    }

    public function save_data() {
        check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( array(
                'message' => __( 'Insufficient permissions.', 'my-plugin' ),
            ) );
        }

        $item_id = isset( $_POST['item_id'] ) ? absint( $_POST['item_id'] ) : 0;
        $value   = isset( $_POST['value'] ) ? sanitize_text_field( $_POST['value'] ) : '';

        if ( ! $item_id || empty( $value ) ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid data.', 'my-plugin' ),
            ) );
        }

        $result = update_post_meta( $item_id, '_my_custom_field', $value );

        if ( $result ) {
            wp_send_json_success( array(
                'message' => __( 'Data saved.', 'my-plugin' ),
                'item_id' => $item_id,
            ) );
        } else {
            wp_send_json_error( array(
                'message' => __( 'Failed to save.', 'my-plugin' ),
            ) );
        }
    }

    public function load_data() {
        check_ajax_referer( 'my_plugin_ajax_nonce', 'security' );

        $item_id = isset( $_POST['item_id'] ) ? absint( $_POST['item_id'] ) : 0;

        if ( ! $item_id ) {
            wp_send_json_error( array(
                'message' => __( 'Invalid item ID.', 'my-plugin' ),
            ) );
        }

        $value = get_post_meta( $item_id, '_my_custom_field', true );

        wp_send_json_success( array(
            'value' => $value,
        ) );
    }
}

new My_Plugin_Ajax_Handler();
```

