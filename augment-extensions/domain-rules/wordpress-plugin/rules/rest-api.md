# REST API Development

## Overview

This guide covers WordPress REST API development for plugins including custom endpoints, authentication, permissions, validation, and modifying existing endpoints.

---

## Register Custom Endpoints

### Basic GET Endpoint

```php
<?php
/**
 * Register custom REST API endpoint
 */
function my_plugin_register_api_routes() {
    register_rest_route( 'my-plugin/v1', '/items', array(
        'methods'             => 'GET',
        'callback'            => 'my_plugin_get_items',
        'permission_callback' => '__return_true', // Public endpoint
    ) );
}
add_action( 'rest_api_init', 'my_plugin_register_api_routes' );

/**
 * Callback function for GET endpoint
 */
function my_plugin_get_items( $request ) {
    $items = array(
        array(
            'id'          => 1,
            'title'       => 'Item 1',
            'description' => 'First item',
        ),
        array(
            'id'          => 2,
            'title'       => 'Item 2',
            'description' => 'Second item',
        ),
    );
    
    return new WP_REST_Response( $items, 200 );
}
```

**Access endpoint:**
```
GET https://example.com/wp-json/my-plugin/v1/items
```

### Complete CRUD Endpoints

```php
<?php
/**
 * Register CRUD endpoints
 */
function my_plugin_register_crud_routes() {
    $namespace = 'my-plugin/v1';
    $base = 'items';
    
    // GET - List items
    register_rest_route( $namespace, '/' . $base, array(
        'methods'             => 'GET',
        'callback'            => 'my_plugin_get_items',
        'permission_callback' => '__return_true',
        'args'                => my_plugin_get_collection_params(),
    ) );
    
    // POST - Create item
    register_rest_route( $namespace, '/' . $base, array(
        'methods'             => 'POST',
        'callback'            => 'my_plugin_create_item',
        'permission_callback' => 'my_plugin_create_item_permissions_check',
        'args'                => my_plugin_get_item_schema(),
    ) );
    
    // GET - Retrieve single item
    register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'my_plugin_get_item',
        'permission_callback' => '__return_true',
        'args'                => array(
            'id' => array(
                'validate_callback' => function( $param ) {
                    return is_numeric( $param );
                },
            ),
        ),
    ) );
    
    // PUT/PATCH - Update item
    register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
        'methods'             => array( 'PUT', 'PATCH' ),
        'callback'            => 'my_plugin_update_item',
        'permission_callback' => 'my_plugin_update_item_permissions_check',
        'args'                => my_plugin_get_item_schema(),
    ) );
    
    // DELETE - Delete item
    register_rest_route( $namespace, '/' . $base . '/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'my_plugin_delete_item',
        'permission_callback' => 'my_plugin_delete_item_permissions_check',
    ) );
}
add_action( 'rest_api_init', 'my_plugin_register_crud_routes' );
```

---

## Callback Functions

### GET Single Item

```php
<?php
/**
 * Get single item
 */
function my_plugin_get_item( $request ) {
    $id = $request['id'];
    
    // Retrieve item from database
    $item = get_post( $id );
    
    if ( ! $item || $item->post_type !== 'my_custom_post_type' ) {
        return new WP_Error(
            'not_found',
            __( 'Item not found', 'my-plugin' ),
            array( 'status' => 404 )
        );
    }
    
    $data = array(
        'id'          => $item->ID,
        'title'       => $item->post_title,
        'content'     => $item->post_content,
        'date'        => $item->post_date,
        'modified'    => $item->post_modified,
        'author'      => $item->post_author,
    );
    
    return new WP_REST_Response( $data, 200 );
}
```

### POST - Create Item

```php
<?php
/**
 * Create item
 */
function my_plugin_create_item( $request ) {
    $title   = sanitize_text_field( $request['title'] );
    $content = wp_kses_post( $request['content'] );
    $status  = sanitize_text_field( $request['status'] );
    
    $post_id = wp_insert_post( array(
        'post_title'   => $title,
        'post_content' => $content,
        'post_status'  => $status,
        'post_type'    => 'my_custom_post_type',
    ) );

    if ( is_wp_error( $post_id ) ) {
        return new WP_Error(
            'create_failed',
            __( 'Failed to create item', 'my-plugin' ),
            array( 'status' => 500 )
        );
    }

    $data = array(
        'id'      => $post_id,
        'title'   => $title,
        'content' => $content,
        'status'  => $status,
    );

    return new WP_REST_Response( $data, 201 );
}
```

### PUT/PATCH - Update Item

```php
<?php
/**
 * Update item
 */
function my_plugin_update_item( $request ) {
    $id = $request['id'];

    // Check if item exists
    $item = get_post( $id );
    if ( ! $item || $item->post_type !== 'my_custom_post_type' ) {
        return new WP_Error(
            'not_found',
            __( 'Item not found', 'my-plugin' ),
            array( 'status' => 404 )
        );
    }

    $update_data = array(
        'ID' => $id,
    );

    if ( isset( $request['title'] ) ) {
        $update_data['post_title'] = sanitize_text_field( $request['title'] );
    }

    if ( isset( $request['content'] ) ) {
        $update_data['post_content'] = wp_kses_post( $request['content'] );
    }

    if ( isset( $request['status'] ) ) {
        $update_data['post_status'] = sanitize_text_field( $request['status'] );
    }

    $result = wp_update_post( $update_data, true );

    if ( is_wp_error( $result ) ) {
        return new WP_Error(
            'update_failed',
            __( 'Failed to update item', 'my-plugin' ),
            array( 'status' => 500 )
        );
    }

    $updated_item = get_post( $id );
    $data = array(
        'id'      => $updated_item->ID,
        'title'   => $updated_item->post_title,
        'content' => $updated_item->post_content,
        'status'  => $updated_item->post_status,
    );

    return new WP_REST_Response( $data, 200 );
}
```

### DELETE - Delete Item

```php
<?php
/**
 * Delete item
 */
function my_plugin_delete_item( $request ) {
    $id = $request['id'];

    // Check if item exists
    $item = get_post( $id );
    if ( ! $item || $item->post_type !== 'my_custom_post_type' ) {
        return new WP_Error(
            'not_found',
            __( 'Item not found', 'my-plugin' ),
            array( 'status' => 404 )
        );
    }

    // Delete permanently (true) or move to trash (false)
    $result = wp_delete_post( $id, true );

    if ( ! $result ) {
        return new WP_Error(
            'delete_failed',
            __( 'Failed to delete item', 'my-plugin' ),
            array( 'status' => 500 )
        );
    }

    return new WP_REST_Response(
        array(
            'deleted' => true,
            'id'      => $id,
        ),
        200
    );
}
```

---

## Permission Callbacks

### Public Endpoint (No Authentication)

```php
<?php
'permission_callback' => '__return_true',
```

### Require Authentication

```php
<?php
function my_plugin_check_authentication() {
    return is_user_logged_in();
}

'permission_callback' => 'my_plugin_check_authentication',
```

### Require Specific Capability

```php
<?php
function my_plugin_create_item_permissions_check( $request ) {
    return current_user_can( 'edit_posts' );
}

function my_plugin_delete_item_permissions_check( $request ) {
    return current_user_can( 'delete_posts' );
}

'permission_callback' => 'my_plugin_create_item_permissions_check',
```

### Custom Permission Logic

```php
<?php
function my_plugin_update_item_permissions_check( $request ) {
    // Check if user is logged in
    if ( ! is_user_logged_in() ) {
        return new WP_Error(
            'rest_forbidden',
            __( 'You must be logged in to update items.', 'my-plugin' ),
            array( 'status' => 401 )
        );
    }

    // Check if user has capability
    if ( ! current_user_can( 'edit_posts' ) ) {
        return new WP_Error(
            'rest_forbidden',
            __( 'You do not have permission to edit items.', 'my-plugin' ),
            array( 'status' => 403 )
        );
    }

    // Check if user owns the resource
    $id = $request['id'];
    $post = get_post( $id );

    if ( $post && $post->post_author != get_current_user_id() && ! current_user_can( 'edit_others_posts' ) ) {
        return new WP_Error(
            'rest_forbidden',
            __( 'You can only edit your own items.', 'my-plugin' ),
            array( 'status' => 403 )
        );
    }

    return true;
}

'permission_callback' => 'my_plugin_update_item_permissions_check',
```

---

## Input Validation and Sanitization

### Define Argument Schema

```php
<?php
/**
 * Get item schema for validation
 */
function my_plugin_get_item_schema() {
    return array(
        'title' => array(
            'required'          => true,
            'type'              => 'string',
            'description'       => __( 'Item title', 'my-plugin' ),
            'sanitize_callback' => 'sanitize_text_field',
        ),
        'content' => array(
            'required'          => false,
            'type'              => 'string',
            'description'       => __( 'Item content', 'my-plugin' ),
            'sanitize_callback' => 'wp_kses_post',
        ),
        'status' => array(
            'required'          => false,
            'type'              => 'string',
            'description'       => __( 'Item status', 'my-plugin' ),
            'enum'              => array( 'draft', 'publish', 'private' ),
            'default'           => 'draft',
            'sanitize_callback' => 'sanitize_text_field',
        ),
        'count' => array(
            'required'          => false,
            'type'              => 'integer',
            'description'       => __( 'Item count', 'my-plugin' ),
            'minimum'           => 0,
            'maximum'           => 100,
            'default'           => 0,
        ),
    );
}
```

### Custom Validation

```php
<?php
/**
 * Validate email
 */
function my_plugin_validate_email( $param, $request, $key ) {
    if ( ! is_email( $param ) ) {
        return new WP_Error(
            'invalid_email',
            __( 'Invalid email address', 'my-plugin' )
        );
    }
    return true;
}

/**
 * Validate URL
 */
function my_plugin_validate_url( $param, $request, $key ) {
    if ( ! filter_var( $param, FILTER_VALIDATE_URL ) ) {
        return new WP_Error(
            'invalid_url',
            __( 'Invalid URL', 'my-plugin' )
        );
    }
    return true;
}

// Use in args
'args' => array(
    'email' => array(
        'required'          => true,
        'validate_callback' => 'my_plugin_validate_email',
        'sanitize_callback' => 'sanitize_email',
    ),
    'website' => array(
        'required'          => false,
        'validate_callback' => 'my_plugin_validate_url',
        'sanitize_callback' => 'esc_url_raw',
    ),
),

---

## Query Parameters

### Accept Query Parameters

```php
<?php
/**
 * Get collection parameters
 */
function my_plugin_get_collection_params() {
    return array(
        'per_page' => array(
            'description'       => __( 'Items per page', 'my-plugin' ),
            'type'              => 'integer',
            'default'           => 10,
            'minimum'           => 1,
            'maximum'           => 100,
            'sanitize_callback' => 'absint',
        ),
        'page' => array(
            'description'       => __( 'Page number', 'my-plugin' ),
            'type'              => 'integer',
            'default'           => 1,
            'minimum'           => 1,
            'sanitize_callback' => 'absint',
        ),
        'search' => array(
            'description'       => __( 'Search term', 'my-plugin' ),
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ),
        'orderby' => array(
            'description'       => __( 'Order by field', 'my-plugin' ),
            'type'              => 'string',
            'default'           => 'date',
            'enum'              => array( 'date', 'title', 'modified' ),
            'sanitize_callback' => 'sanitize_text_field',
        ),
        'order' => array(
            'description'       => __( 'Order direction', 'my-plugin' ),
            'type'              => 'string',
            'default'           => 'DESC',
            'enum'              => array( 'ASC', 'DESC' ),
            'sanitize_callback' => 'sanitize_text_field',
        ),
    );
}

/**
 * Get items with query parameters
 */
function my_plugin_get_items( $request ) {
    $per_page = $request->get_param( 'per_page' );
    $page     = $request->get_param( 'page' );
    $search   = $request->get_param( 'search' );
    $orderby  = $request->get_param( 'orderby' );
    $order    = $request->get_param( 'order' );

    $args = array(
        'post_type'      => 'my_custom_post_type',
        'posts_per_page' => $per_page,
        'paged'          => $page,
        'orderby'        => $orderby,
        'order'          => $order,
    );

    if ( ! empty( $search ) ) {
        $args['s'] = $search;
    }

    $query = new WP_Query( $args );

    $items = array();
    foreach ( $query->posts as $post ) {
        $items[] = array(
            'id'      => $post->ID,
            'title'   => $post->post_title,
            'content' => $post->post_content,
            'date'    => $post->post_date,
        );
    }

    $response = new WP_REST_Response( $items, 200 );

    // Add pagination headers
    $response->header( 'X-WP-Total', $query->found_posts );
    $response->header( 'X-WP-TotalPages', $query->max_num_pages );

    return $response;
}
```

**Usage:**
```
GET /wp-json/my-plugin/v1/items?per_page=20&page=2&orderby=title&order=ASC&search=keyword
```

---

## Authentication

### Application Passwords (WordPress 5.6+)

WordPress natively supports Application Passwords for REST API authentication.

**No additional code needed** - Users create application passwords in their profile.

**Usage:**
```bash
curl -X GET https://example.com/wp-json/my-plugin/v1/items \
  --user "username:application-password"
```

### Custom API Key Authentication

```php
<?php
/**
 * Validate API key
 */
function my_plugin_validate_api_key( $request ) {
    $api_key = $request->get_header( 'X-API-Key' );

    if ( empty( $api_key ) ) {
        return new WP_Error(
            'rest_forbidden',
            __( 'API key is required', 'my-plugin' ),
            array( 'status' => 401 )
        );
    }

    // Validate API key against stored keys
    $valid_keys = get_option( 'my_plugin_api_keys', array() );

    if ( ! in_array( $api_key, $valid_keys, true ) ) {
        return new WP_Error(
            'rest_forbidden',
            __( 'Invalid API key', 'my-plugin' ),
            array( 'status' => 401 )
        );
    }

    return true;
}

// Use in endpoint
register_rest_route( 'my-plugin/v1', '/secure-data', array(
    'methods'             => 'GET',
    'callback'            => 'my_plugin_get_secure_data',
    'permission_callback' => 'my_plugin_validate_api_key',
) );
```

**Usage:**
```bash
curl -X GET https://example.com/wp-json/my-plugin/v1/secure-data \
  -H "X-API-Key: your-api-key-here"
```

---

## Modify Existing Endpoints

### Add Custom Fields to Posts

```php
<?php
/**
 * Add custom field to post response
 */
function my_plugin_add_custom_field_to_post() {
    register_rest_field( 'post', 'custom_field', array(
        'get_callback'    => 'my_plugin_get_custom_field',
        'update_callback' => 'my_plugin_update_custom_field',
        'schema'          => array(
            'description' => __( 'Custom field', 'my-plugin' ),
            'type'        => 'string',
        ),
    ) );
}
add_action( 'rest_api_init', 'my_plugin_add_custom_field_to_post' );

/**
 * Get custom field value
 */
function my_plugin_get_custom_field( $post ) {
    return get_post_meta( $post['id'], '_custom_field', true );
}

/**
 * Update custom field value
 */
function my_plugin_update_custom_field( $value, $post ) {
    return update_post_meta( $post->ID, '_custom_field', sanitize_text_field( $value ) );
}
```

### Add Multiple Custom Fields

```php
<?php
/**
 * Add multiple custom fields
 */
function my_plugin_add_multiple_fields() {
    register_rest_field( 'post', 'view_count', array(
        'get_callback' => function( $post ) {
            return (int) get_post_meta( $post['id'], 'views', true );
        },
        'schema'       => array(
            'description' => __( 'Number of views', 'my-plugin' ),
            'type'        => 'integer',
        ),
    ) );

    register_rest_field( 'post', 'reading_time', array(
        'get_callback' => function( $post ) {
            $content = get_post_field( 'post_content', $post['id'] );
            $word_count = str_word_count( strip_tags( $content ) );
            return ceil( $word_count / 200 ); // Assume 200 words per minute
        },
        'schema'       => array(
            'description' => __( 'Estimated reading time in minutes', 'my-plugin' ),
            'type'        => 'integer',
        ),
    ) );
}
add_action( 'rest_api_init', 'my_plugin_add_multiple_fields' );
```

### Modify Response Data

```php
<?php
/**
 * Modify post response
 */
function my_plugin_modify_post_response( $response, $post, $request ) {
    $data = $response->get_data();

    // Add custom data
    $data['custom_data'] = array(
        'views'        => get_post_meta( $post->ID, 'views', true ),
        'likes'        => get_post_meta( $post->ID, 'likes', true ),
        'is_featured'  => (bool) get_post_meta( $post->ID, 'featured', true ),
    );

    // Remove sensitive data
    unset( $data['author'] );

    $response->set_data( $data );

    return $response;
}
add_filter( 'rest_prepare_post', 'my_plugin_modify_post_response', 10, 3 );
```

---

## Best Practices

### Endpoint Design

1. **Use versioning**: Include version in namespace (`my-plugin/v1`)
2. **Use nouns for resources**: `/items`, `/users`, not `/get-items`
3. **Use HTTP methods correctly**: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
4. **Use proper status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
5. **Return consistent responses**: Use `WP_REST_Response` or `WP_Error`

### Security

1. **Always validate permissions**: Never use `__return_true` for write operations
2. **Sanitize input**: Use appropriate sanitization callbacks
3. **Validate input**: Use validation callbacks and schema
4. **Escape output**: Use `esc_html()`, `esc_url()`, etc.
5. **Use nonces for admin**: For admin-ajax.php endpoints (not REST API)
6. **Rate limiting**: Consider implementing rate limiting for public endpoints

### Performance

1. **Limit query results**: Set maximum `per_page` value
2. **Use pagination**: Always paginate large result sets
3. **Cache responses**: Use transients for expensive queries
4. **Optimize queries**: Use `WP_Query` efficiently
5. **Lazy load data**: Don't include unnecessary data in responses

### Documentation

1. **Document endpoints**: Provide clear descriptions
2. **Document parameters**: Describe all parameters and their types
3. **Provide examples**: Include example requests and responses
4. **Use schema**: Define proper schema for validation and documentation

---

## Common Pitfalls

### ❌ DON'T

```php
// Don't use __return_true for write operations
register_rest_route( 'my-plugin/v1', '/items', array(
    'methods'             => 'POST',
    'callback'            => 'create_item',
    'permission_callback' => '__return_true', // BAD!
) );

// Don't forget to sanitize input
function create_item( $request ) {
    $title = $request['title']; // BAD! Not sanitized
    wp_insert_post( array( 'post_title' => $title ) );
}

// Don't return raw data
function get_item( $request ) {
    return get_post( $request['id'] ); // BAD! Returns WP_Post object
}

// Don't forget error handling
function get_item( $request ) {
    $item = get_post( $request['id'] );
    return new WP_REST_Response( $item, 200 ); // BAD! No error check
}
```

### ✅ DO

```php
// Use proper permission checks
register_rest_route( 'my-plugin/v1', '/items', array(
    'methods'             => 'POST',
    'callback'            => 'create_item',
    'permission_callback' => 'check_create_permission', // GOOD!
) );

// Always sanitize input
function create_item( $request ) {
    $title = sanitize_text_field( $request['title'] ); // GOOD!
    wp_insert_post( array( 'post_title' => $title ) );
}

// Return formatted data
function get_item( $request ) {
    $post = get_post( $request['id'] );
    $data = array(
        'id'    => $post->ID,
        'title' => $post->post_title,
    );
    return new WP_REST_Response( $data, 200 ); // GOOD!
}

// Always handle errors
function get_item( $request ) {
    $item = get_post( $request['id'] );

    if ( ! $item ) {
        return new WP_Error( 'not_found', 'Item not found', array( 'status' => 404 ) );
    }

    return new WP_REST_Response( $item, 200 ); // GOOD!
}
```

