# WordPress REST API Development Workflow

## Overview

This document provides workflows for extending the WordPress REST API with custom endpoints and modifying existing endpoints.

## Workflow 1: Register Custom REST API Endpoint

### Step 1: Create Basic Endpoint

**functions.php** or plugin file:
```php
/**
 * Register custom REST API endpoint
 */
function register_custom_api_endpoint() {
    register_rest_route( 'my-plugin/v1', '/items', array(
        'methods'             => 'GET',
        'callback'            => 'get_custom_items',
        'permission_callback' => '__return_true', // Public endpoint
    ) );
}
add_action( 'rest_api_init', 'register_custom_api_endpoint' );

/**
 * Callback function for endpoint
 */
function get_custom_items( $request ) {
    $items = array(
        array(
            'id'    => 1,
            'title' => 'Item 1',
            'description' => 'First item',
        ),
        array(
            'id'    => 2,
            'title' => 'Item 2',
            'description' => 'Second item',
        ),
    );
    
    return new WP_REST_Response( $items, 200 );
}
```

**Access endpoint**:
```
GET https://example.com/wp-json/my-plugin/v1/items
```

### Step 2: Add Multiple HTTP Methods

```php
/**
 * Register endpoint with multiple methods
 */
function register_crud_endpoint() {
    // GET - Retrieve items
    register_rest_route( 'my-plugin/v1', '/items', array(
        'methods'             => 'GET',
        'callback'            => 'get_items',
        'permission_callback' => '__return_true',
    ) );
    
    // POST - Create item
    register_rest_route( 'my-plugin/v1', '/items', array(
        'methods'             => 'POST',
        'callback'            => 'create_item',
        'permission_callback' => 'check_create_permission',
        'args'                => get_item_schema(),
    ) );
    
    // GET - Retrieve single item
    register_rest_route( 'my-plugin/v1', '/items/(?P<id>\d+)', array(
        'methods'             => 'GET',
        'callback'            => 'get_item',
        'permission_callback' => '__return_true',
        'args'                => array(
            'id' => array(
                'validate_callback' => function( $param ) {
                    return is_numeric( $param );
                },
            ),
        ),
    ) );
    
    // PUT - Update item
    register_rest_route( 'my-plugin/v1', '/items/(?P<id>\d+)', array(
        'methods'             => 'PUT',
        'callback'            => 'update_item',
        'permission_callback' => 'check_update_permission',
        'args'                => get_item_schema(),
    ) );
    
    // DELETE - Delete item
    register_rest_route( 'my-plugin/v1', '/items/(?P<id>\d+)', array(
        'methods'             => 'DELETE',
        'callback'            => 'delete_item',
        'permission_callback' => 'check_delete_permission',
    ) );
}
add_action( 'rest_api_init', 'register_crud_endpoint' );
```

### Step 3: Implement Callback Functions

**GET single item**:
```php
function get_item( $request ) {
    $id = $request['id'];
    
    // Retrieve item from database
    $item = get_post( $id );
    
    if ( ! $item ) {
        return new WP_Error( 'not_found', __( 'Item not found', 'my-plugin' ), array( 'status' => 404 ) );
    }
    
    $data = array(
        'id'          => $item->ID,
        'title'       => $item->post_title,
        'content'     => $item->post_content,
        'date'        => $item->post_date,
    );
    
    return new WP_REST_Response( $data, 200 );
}
```

**POST - Create item**:
```php
function create_item( $request ) {
    $title   = sanitize_text_field( $request['title'] );
    $content = sanitize_textarea_field( $request['content'] );
    
    $post_id = wp_insert_post( array(
        'post_title'   => $title,
        'post_content' => $content,
        'post_status'  => 'publish',
        'post_type'    => 'post',
    ) );
    
    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'create_failed', __( 'Failed to create item', 'my-plugin' ), array( 'status' => 500 ) );
    }
    
    $data = array(
        'id'      => $post_id,
        'title'   => $title,
        'content' => $content,
    );
    
    return new WP_REST_Response( $data, 201 );
}
```

**PUT - Update item**:
```php
function update_item( $request ) {
    $id      = $request['id'];
    $title   = sanitize_text_field( $request['title'] );
    $content = sanitize_textarea_field( $request['content'] );
    
    $result = wp_update_post( array(
        'ID'           => $id,
        'post_title'   => $title,
        'post_content' => $content,
    ) );
    
    if ( is_wp_error( $result ) ) {
        return new WP_Error( 'update_failed', __( 'Failed to update item', 'my-plugin' ), array( 'status' => 500 ) );
    }
    
    $data = array(
        'id'      => $id,
        'title'   => $title,
        'content' => $content,
    );
    
    return new WP_REST_Response( $data, 200 );
}
```

**DELETE - Delete item**:
```php
function delete_item( $request ) {
    $id = $request['id'];
    
    $result = wp_delete_post( $id, true );
    
    if ( ! $result ) {
        return new WP_Error( 'delete_failed', __( 'Failed to delete item', 'my-plugin' ), array( 'status' => 500 ) );
    }
    
    return new WP_REST_Response( array( 'deleted' => true ), 200 );
}
```

## Workflow 2: Permission Callbacks

### Public Endpoint (No Authentication)

```php
'permission_callback' => '__return_true',
```

### Require Authentication

```php
function check_authentication() {
    return is_user_logged_in();
}

'permission_callback' => 'check_authentication',
```

### Require Specific Capability

```php
function check_admin_permission() {
    return current_user_can( 'manage_options' );
}

'permission_callback' => 'check_admin_permission',
```

### Custom Permission Logic

```php
function check_custom_permission( $request ) {
    // Check if user is logged in
    if ( ! is_user_logged_in() ) {
        return false;
    }
    
    // Check if user has capability
    if ( ! current_user_can( 'edit_posts' ) ) {
        return false;
    }
    
    // Check if user owns the resource
    $id = $request['id'];
    $post = get_post( $id );
    
    if ( $post && $post->post_author != get_current_user_id() ) {
        return false;
    }
    
    return true;
}

'permission_callback' => 'check_custom_permission',
```

## Workflow 3: Input Validation and Sanitization

### Define Argument Schema

```php
function get_item_schema() {
    return array(
        'title' => array(
            'required'          => true,
            'type'              => 'string',
            'description'       => __( 'Item title', 'my-plugin' ),
            'sanitize_callback' => 'sanitize_text_field',
            'validate_callback' => function( $param ) {
                return ! empty( $param ) && strlen( $param ) <= 200;
            },
        ),
        'content' => array(
            'required'          => false,
            'type'              => 'string',
            'description'       => __( 'Item content', 'my-plugin' ),
            'sanitize_callback' => 'sanitize_textarea_field',
        ),
        'status' => array(
            'required'          => false,
            'type'              => 'string',
            'description'       => __( 'Item status', 'my-plugin' ),
            'enum'              => array( 'draft', 'published', 'archived' ),
            'default'           => 'draft',
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
function validate_email( $param, $request, $key ) {
    if ( ! is_email( $param ) ) {
        return new WP_Error( 'invalid_email', __( 'Invalid email address', 'my-plugin' ) );
    }
    return true;
}

'args' => array(
    'email' => array(
        'required'          => true,
        'validate_callback' => 'validate_email',
        'sanitize_callback' => 'sanitize_email',
    ),
),
```

## Workflow 4: Query Parameters

### Accept Query Parameters

```php
function get_items_with_filters( $request ) {
    $params = $request->get_params();
    
    $args = array(
        'post_type'      => 'post',
        'posts_per_page' => isset( $params['per_page'] ) ? absint( $params['per_page'] ) : 10,
        'paged'          => isset( $params['page'] ) ? absint( $params['page'] ) : 1,
        'orderby'        => isset( $params['orderby'] ) ? sanitize_text_field( $params['orderby'] ) : 'date',
        'order'          => isset( $params['order'] ) ? sanitize_text_field( $params['order'] ) : 'DESC',
    );
    
    if ( isset( $params['search'] ) ) {
        $args['s'] = sanitize_text_field( $params['search'] );
    }
    
    $query = new WP_Query( $args );
    
    $items = array();
    foreach ( $query->posts as $post ) {
        $items[] = array(
            'id'    => $post->ID,
            'title' => $post->post_title,
        );
    }
    
    $response = new WP_REST_Response( $items, 200 );
    
    // Add pagination headers
    $response->header( 'X-WP-Total', $query->found_posts );
    $response->header( 'X-WP-TotalPages', $query->max_num_pages );
    
    return $response;
}
```

**Usage**:
```
GET /wp-json/my-plugin/v1/items?per_page=20&page=2&orderby=title&order=ASC&search=keyword
```

## Workflow 5: Authentication

### Application Passwords (WordPress 5.6+)

```php
// No additional code needed - WordPress handles it
// Users create application passwords in their profile
```

**Usage**:
```bash
curl -X GET https://example.com/wp-json/my-plugin/v1/items \
  --user "username:application-password"
```

### JWT Authentication (Plugin Required)

Install JWT Authentication plugin, then:

```php
/**
 * Endpoint requiring JWT authentication
 */
register_rest_route( 'my-plugin/v1', '/secure-data', array(
    'methods'             => 'GET',
    'callback'            => 'get_secure_data',
    'permission_callback' => function() {
        return is_user_logged_in();
    },
) );
```

**Usage**:
```bash
# Get token
curl -X POST https://example.com/wp-json/jwt-auth/v1/token \
  -d "username=admin&password=password"

# Use token
curl -X GET https://example.com/wp-json/my-plugin/v1/secure-data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Custom API Key Authentication

```php
/**
 * Validate API key
 */
function validate_api_key( $request ) {
    $api_key = $request->get_header( 'X-API-Key' );
    
    if ( ! $api_key ) {
        return false;
    }
    
    $valid_keys = get_option( 'my_plugin_api_keys', array() );
    
    return in_array( $api_key, $valid_keys, true );
}

register_rest_route( 'my-plugin/v1', '/data', array(
    'methods'             => 'GET',
    'callback'            => 'get_data',
    'permission_callback' => 'validate_api_key',
) );
```

## Workflow 6: Modify Existing Endpoints

### Add Custom Fields to Posts

```php
/**
 * Add custom field to post response
 */
function add_custom_field_to_post() {
    register_rest_field( 'post', 'custom_field', array(
        'get_callback'    => function( $post ) {
            return get_post_meta( $post['id'], '_custom_field', true );
        },
        'update_callback' => function( $value, $post ) {
            return update_post_meta( $post->ID, '_custom_field', sanitize_text_field( $value ) );
        },
        'schema'          => array(
            'description' => __( 'Custom field', 'my-plugin' ),
            'type'        => 'string',
        ),
    ) );
}
add_action( 'rest_api_init', 'add_custom_field_to_post' );
```

### Modify Response Data

```php
/**
 * Modify post response
 */
function modify_post_response( $response, $post, $request ) {
    $data = $response->get_data();
    
    // Add custom data
    $data['custom_data'] = array(
        'views' => get_post_meta( $post->ID, 'views', true ),
        'likes' => get_post_meta( $post->ID, 'likes', true ),
    );
    
    $response->set_data( $data );
    
    return $response;
}
add_filter( 'rest_prepare_post', 'modify_post_response', 10, 3 );
```

## Best Practices

### DO

✅ Use proper HTTP status codes (200, 201, 400, 401, 404, 500)  
✅ Validate all input  
✅ Sanitize all data  
✅ Use permission callbacks  
✅ Return WP_Error for errors  
✅ Use WP_REST_Response for success  
✅ Version your API (v1, v2)  
✅ Document your endpoints  
✅ Use proper HTTP methods (GET, POST, PUT, DELETE)  
✅ Add pagination for large datasets

### DON'T

❌ Trust user input  
❌ Use `__return_true` for sensitive endpoints  
❌ Forget error handling  
❌ Return raw database data  
❌ Ignore authentication  
❌ Skip input validation  
❌ Use deprecated functions  
❌ Hardcode values  
❌ Forget to sanitize output

