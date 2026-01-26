# REST API Endpoint Example

## Overview

This example demonstrates a complete custom REST API endpoint with route registration, permission callback, endpoint handler, sanitization, validation, JSON response, and error handling.

**Use Case**: Custom API endpoints for external integrations  
**Complexity**: Medium  
**Prerequisites**: WordPress 5.0+, PHP 7.4+

---

## Complete Example: "Book Reviews API"

A custom REST API for managing book reviews with full CRUD operations, authentication, and validation.

---

## Directory Structure

```
book-reviews-api/
├── book-reviews-api.php       # Main plugin file
├── includes/
│   ├── class-api.php          # API controller
│   ├── class-validator.php    # Validation logic
│   └── class-sanitizer.php    # Sanitization logic
└── readme.txt                 # Plugin readme
```

---

## 1. Main Plugin File

### File: `book-reviews-api.php`

```php
<?php
/**
 * Plugin Name: Book Reviews API
 * Description: Custom REST API for managing book reviews
 * Version: 1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.4
 * Author: Your Name
 * License: GPL-2.0+
 * Text Domain: book-reviews-api
 */

if (!defined('ABSPATH')) {
    exit;
}

// Include dependencies
require_once plugin_dir_path(__FILE__) . 'includes/class-api.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-validator.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sanitizer.php';

/**
 * Initialize the API
 */
function bra_init() {
    $api = new Book_Reviews_API();
    $api->register_routes();
}
add_action('rest_api_init', 'bra_init');
```

---

## 2. API Controller

### File: `includes/class-api.php`

```php
<?php
/**
 * Book Reviews API Controller
 */
class Book_Reviews_API {

    /**
     * Namespace for API routes
     */
    private $namespace = 'book-reviews/v1';

    /**
     * Base route
     */
    private $base = 'reviews';

    /**
     * Register all routes
     */
    public function register_routes() {
        // GET - List all reviews
        register_rest_route($this->namespace, '/' . $this->base, array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_items'),
            'permission_callback' => '__return_true',
            'args'                => $this->get_collection_params(),
        ));

        // POST - Create review
        register_rest_route($this->namespace, '/' . $this->base, array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'create_item'),
            'permission_callback' => array($this, 'create_item_permissions_check'),
            'args'                => $this->get_endpoint_args_for_item_schema(),
        ));

        // GET - Get single review
        register_rest_route($this->namespace, '/' . $this->base . '/(?P<id>[\d]+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'get_item'),
            'permission_callback' => '__return_true',
            'args'                => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ),
            ),
        ));

        // PUT/PATCH - Update review
        register_rest_route($this->namespace, '/' . $this->base . '/(?P<id>[\d]+)', array(
            'methods'             => WP_REST_Server::EDITABLE,
            'callback'            => array($this, 'update_item'),
            'permission_callback' => array($this, 'update_item_permissions_check'),
            'args'                => $this->get_endpoint_args_for_item_schema(),
        ));

        // DELETE - Delete review
        register_rest_route($this->namespace, '/' . $this->base . '/(?P<id>[\d]+)', array(
            'methods'             => WP_REST_Server::DELETABLE,
            'callback'            => array($this, 'delete_item'),
            'permission_callback' => array($this, 'delete_item_permissions_check'),
        ));
    }

    /**
     * Get collection of reviews
     */
    public function get_items($request) {
        $args = array(
            'post_type'      => 'book_review',
            'posts_per_page' => $request->get_param('per_page') ?: 10,
            'paged'          => $request->get_param('page') ?: 1,
            'orderby'        => $request->get_param('orderby') ?: 'date',
            'order'          => $request->get_param('order') ?: 'DESC',
        );

        $query = new WP_Query($args);
        $reviews = array();

        foreach ($query->posts as $post) {
            $reviews[] = $this->prepare_item_for_response($post);
        }

        $response = rest_ensure_response($reviews);
        
        // Add pagination headers
        $response->header('X-WP-Total', $query->found_posts);
        $response->header('X-WP-TotalPages', $query->max_num_pages);

        return $response;
    }

    /**
     * Get single review
     */
    public function get_item($request) {
        $id = (int) $request->get_param('id');
        $post = get_post($id);

        if (!$post || $post->post_type !== 'book_review') {
            return new WP_Error(
                'rest_review_not_found',
                __('Review not found.', 'book-reviews-api'),
                array('status' => 404)
            );
        }

        $data = $this->prepare_item_for_response($post);
        return rest_ensure_response($data);
    }

    /**
     * Create new review
     */
    public function create_item($request) {
        $validator = new Book_Reviews_Validator();
        $sanitizer = new Book_Reviews_Sanitizer();

        // Validate input
        $validation = $validator->validate_review_data($request->get_params());
        if (is_wp_error($validation)) {
            return $validation;
        }

        // Sanitize input
        $data = $sanitizer->sanitize_review_data($request->get_params());

        // Create post
        $post_id = wp_insert_post(array(
            'post_type'    => 'book_review',
            'post_title'   => $data['title'],
            'post_content' => $data['content'],
            'post_status'  => 'publish',
            'post_author'  => get_current_user_id(),
        ));

        if (is_wp_error($post_id)) {
            return new WP_Error(
                'rest_review_create_failed',
                __('Failed to create review.', 'book-reviews-api'),
                array('status' => 500)
            );
        }

        // Save meta data
        update_post_meta($post_id, '_book_title', $data['book_title']);
        update_post_meta($post_id, '_book_author', $data['book_author']);
        update_post_meta($post_id, '_rating', $data['rating']);

        $post = get_post($post_id);
        $response = $this->prepare_item_for_response($post);

        return rest_ensure_response($response);
    }

    /**
     * Update review
     */
    public function update_item($request) {
        $id = (int) $request->get_param('id');
        $post = get_post($id);

        if (!$post || $post->post_type !== 'book_review') {
            return new WP_Error(
                'rest_review_not_found',
                __('Review not found.', 'book-reviews-api'),
                array('status' => 404)
            );
        }

        $validator = new Book_Reviews_Validator();
        $sanitizer = new Book_Reviews_Sanitizer();

        // Validate input
        $validation = $validator->validate_review_data($request->get_params());
        if (is_wp_error($validation)) {
            return $validation;
        }

        // Sanitize input
        $data = $sanitizer->sanitize_review_data($request->get_params());

        // Update post
        $updated = wp_update_post(array(
            'ID'           => $id,
            'post_title'   => $data['title'],
            'post_content' => $data['content'],
        ));

        if (is_wp_error($updated)) {
            return new WP_Error(
                'rest_review_update_failed',
                __('Failed to update review.', 'book-reviews-api'),
                array('status' => 500)
            );
        }

        // Update meta data
        update_post_meta($id, '_book_title', $data['book_title']);
        update_post_meta($id, '_book_author', $data['book_author']);
        update_post_meta($id, '_rating', $data['rating']);

        $post = get_post($id);
        $response = $this->prepare_item_for_response($post);

        return rest_ensure_response($response);
    }

    /**
     * Delete review
     */
    public function delete_item($request) {
        $id = (int) $request->get_param('id');
        $post = get_post($id);

        if (!$post || $post->post_type !== 'book_review') {
            return new WP_Error(
                'rest_review_not_found',
                __('Review not found.', 'book-reviews-api'),
                array('status' => 404)
            );
        }

        $previous = $this->prepare_item_for_response($post);
        $result = wp_delete_post($id, true);

        if (!$result) {
            return new WP_Error(
                'rest_review_delete_failed',
                __('Failed to delete review.', 'book-reviews-api'),
                array('status' => 500)
            );
        }

        return rest_ensure_response(array(
            'deleted'  => true,
            'previous' => $previous,
        ));
    }

    /**
     * Permission check for creating reviews
     */
    public function create_item_permissions_check($request) {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'rest_forbidden',
                __('You must be logged in to create reviews.', 'book-reviews-api'),
                array('status' => 401)
            );
        }

        if (!current_user_can('publish_posts')) {
            return new WP_Error(
                'rest_forbidden',
                __('You do not have permission to create reviews.', 'book-reviews-api'),
                array('status' => 403)
            );
        }

        return true;
    }

    /**
     * Permission check for updating reviews
     */
    public function update_item_permissions_check($request) {
        $id = (int) $request->get_param('id');
        $post = get_post($id);

        if (!$post) {
            return new WP_Error(
                'rest_review_not_found',
                __('Review not found.', 'book-reviews-api'),
                array('status' => 404)
            );
        }

        if (!current_user_can('edit_post', $id)) {
            return new WP_Error(
                'rest_forbidden',
                __('You do not have permission to edit this review.', 'book-reviews-api'),
                array('status' => 403)
            );
        }

        return true;
    }

    /**
     * Permission check for deleting reviews
     */
    public function delete_item_permissions_check($request) {
        $id = (int) $request->get_param('id');
        $post = get_post($id);

        if (!$post) {
            return new WP_Error(
                'rest_review_not_found',
                __('Review not found.', 'book-reviews-api'),
                array('status' => 404)
            );
        }

        if (!current_user_can('delete_post', $id)) {
            return new WP_Error(
                'rest_forbidden',
                __('You do not have permission to delete this review.', 'book-reviews-api'),
                array('status' => 403)
            );
        }

        return true;
    }

    /**
     * Prepare item for response
     */
    private function prepare_item_for_response($post) {
        return array(
            'id'          => $post->ID,
            'title'       => $post->post_title,
            'content'     => $post->post_content,
            'book_title'  => get_post_meta($post->ID, '_book_title', true),
            'book_author' => get_post_meta($post->ID, '_book_author', true),
            'rating'      => (int) get_post_meta($post->ID, '_rating', true),
            'date'        => $post->post_date,
            'author'      => $post->post_author,
        );
    }

    /**
     * Get collection parameters
     */
    private function get_collection_params() {
        return array(
            'page' => array(
                'description'       => __('Current page of the collection.', 'book-reviews-api'),
                'type'              => 'integer',
                'default'           => 1,
                'sanitize_callback' => 'absint',
            ),
            'per_page' => array(
                'description'       => __('Maximum number of items per page.', 'book-reviews-api'),
                'type'              => 'integer',
                'default'           => 10,
                'sanitize_callback' => 'absint',
            ),
            'orderby' => array(
                'description'       => __('Sort collection by field.', 'book-reviews-api'),
                'type'              => 'string',
                'default'           => 'date',
                'enum'              => array('date', 'title', 'rating'),
            ),
            'order' => array(
                'description'       => __('Order sort attribute ascending or descending.', 'book-reviews-api'),
                'type'              => 'string',
                'default'           => 'DESC',
                'enum'              => array('ASC', 'DESC'),
            ),
        );
    }

    /**
     * Get endpoint args for item schema
     */
    private function get_endpoint_args_for_item_schema() {
        return array(
            'title' => array(
                'description'       => __('Review title.', 'book-reviews-api'),
                'type'              => 'string',
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'content' => array(
                'description'       => __('Review content.', 'book-reviews-api'),
                'type'              => 'string',
                'required'          => true,
                'sanitize_callback' => 'wp_kses_post',
            ),
            'book_title' => array(
                'description'       => __('Book title.', 'book-reviews-api'),
                'type'              => 'string',
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'book_author' => array(
                'description'       => __('Book author.', 'book-reviews-api'),
                'type'              => 'string',
                'required'          => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'rating' => array(
                'description'       => __('Rating (1-5).', 'book-reviews-api'),
                'type'              => 'integer',
                'required'          => true,
                'minimum'           => 1,
                'maximum'           => 5,
                'sanitize_callback' => 'absint',
            ),
        );
    }
}
```

---

## 3. Validator Class

### File: `includes/class-validator.php`

```php
<?php
/**
 * Book Reviews Validator
 */
class Book_Reviews_Validator {

    /**
     * Validate review data
     */
    public function validate_review_data($data) {
        $errors = new WP_Error();

        // Validate title
        if (empty($data['title'])) {
            $errors->add(
                'missing_title',
                __('Review title is required.', 'book-reviews-api'),
                array('status' => 400)
            );
        }

        // Validate content
        if (empty($data['content'])) {
            $errors->add(
                'missing_content',
                __('Review content is required.', 'book-reviews-api'),
                array('status' => 400)
            );
        }

        // Validate book title
        if (empty($data['book_title'])) {
            $errors->add(
                'missing_book_title',
                __('Book title is required.', 'book-reviews-api'),
                array('status' => 400)
            );
        }

        // Validate book author
        if (empty($data['book_author'])) {
            $errors->add(
                'missing_book_author',
                __('Book author is required.', 'book-reviews-api'),
                array('status' => 400)
            );
        }

        // Validate rating
        if (!isset($data['rating'])) {
            $errors->add(
                'missing_rating',
                __('Rating is required.', 'book-reviews-api'),
                array('status' => 400)
            );
        } elseif ($data['rating'] < 1 || $data['rating'] > 5) {
            $errors->add(
                'invalid_rating',
                __('Rating must be between 1 and 5.', 'book-reviews-api'),
                array('status' => 400)
            );
        }

        if ($errors->has_errors()) {
            return $errors;
        }

        return true;
    }
}
```

---

## 4. Sanitizer Class

### File: `includes/class-sanitizer.php`

```php
<?php
/**
 * Book Reviews Sanitizer
 */
class Book_Reviews_Sanitizer {

    /**
     * Sanitize review data
     */
    public function sanitize_review_data($data) {
        return array(
            'title'       => sanitize_text_field($data['title']),
            'content'     => wp_kses_post($data['content']),
            'book_title'  => sanitize_text_field($data['book_title']),
            'book_author' => sanitize_text_field($data['book_author']),
            'rating'      => absint($data['rating']),
        );
    }
}
```

---

## 5. Testing Steps

### Manual Testing with cURL

**1. List all reviews (GET)**

```bash
curl -X GET "https://example.com/wp-json/book-reviews/v1/reviews"
```

**2. Get single review (GET)**

```bash
curl -X GET "https://example.com/wp-json/book-reviews/v1/reviews/123"
```

**3. Create review (POST)**

```bash
curl -X POST "https://example.com/wp-json/book-reviews/v1/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Great Book!",
    "content": "This book was amazing...",
    "book_title": "The Great Gatsby",
    "book_author": "F. Scott Fitzgerald",
    "rating": 5
  }'
```

**4. Update review (PUT)**

```bash
curl -X PUT "https://example.com/wp-json/book-reviews/v1/reviews/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content...",
    "book_title": "The Great Gatsby",
    "book_author": "F. Scott Fitzgerald",
    "rating": 4
  }'
```

**5. Delete review (DELETE)**

```bash
curl -X DELETE "https://example.com/wp-json/book-reviews/v1/reviews/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testing with JavaScript

```javascript
// Fetch all reviews
fetch('https://example.com/wp-json/book-reviews/v1/reviews')
  .then(response => response.json())
  .then(data => console.log(data));

// Create review
fetch('https://example.com/wp-json/book-reviews/v1/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpApiSettings.nonce
  },
  body: JSON.stringify({
    title: 'Great Book!',
    content: 'This book was amazing...',
    book_title: 'The Great Gatsby',
    book_author: 'F. Scott Fitzgerald',
    rating: 5
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Automated Testing with PHPUnit

```php
<?php
class Test_Book_Reviews_API extends WP_UnitTestCase {

    public function test_get_reviews() {
        $request = new WP_REST_Request('GET', '/book-reviews/v1/reviews');
        $response = rest_do_request($request);

        $this->assertEquals(200, $response->get_status());
        $this->assertIsArray($response->get_data());
    }

    public function test_create_review_requires_authentication() {
        $request = new WP_REST_Request('POST', '/book-reviews/v1/reviews');
        $request->set_body_params(array(
            'title'       => 'Test Review',
            'content'     => 'Test content',
            'book_title'  => 'Test Book',
            'book_author' => 'Test Author',
            'rating'      => 5,
        ));

        $response = rest_do_request($request);

        $this->assertEquals(401, $response->get_status());
    }

    public function test_create_review_validates_rating() {
        wp_set_current_user($this->factory->user->create(array('role' => 'editor')));

        $request = new WP_REST_Request('POST', '/book-reviews/v1/reviews');
        $request->set_body_params(array(
            'title'       => 'Test Review',
            'content'     => 'Test content',
            'book_title'  => 'Test Book',
            'book_author' => 'Test Author',
            'rating'      => 10, // Invalid rating
        ));

        $response = rest_do_request($request);

        $this->assertEquals(400, $response->get_status());
    }
}
```

---

## Best Practices Demonstrated

✅ **Proper route registration** - Using `register_rest_route()`
✅ **Permission callbacks** - Authentication and authorization
✅ **Validation** - Input validation with error messages
✅ **Sanitization** - Secure data handling
✅ **Error handling** - WP_Error for failures
✅ **Pagination** - Collection parameters and headers
✅ **HTTP methods** - Proper REST verbs (GET, POST, PUT, DELETE)
✅ **Response formatting** - Consistent JSON responses
✅ **Nonce verification** - CSRF protection
✅ **Capability checks** - WordPress permissions integration

