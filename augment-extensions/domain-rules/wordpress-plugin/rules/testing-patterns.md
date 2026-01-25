# Testing Patterns for WordPress Plugins

## Overview

This document provides comprehensive testing patterns and best practices for WordPress plugin development, including PHPUnit setup, unit tests, integration tests, and WordPress-specific testing strategies.

## Testing Environment Setup

### Install WordPress Test Suite

```bash
#!/bin/bash
# bin/install-wp-tests.sh

DB_NAME=${1-wordpress_test}
DB_USER=${2-root}
DB_PASS=${3-}
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}

# Download WordPress test suite
svn co --quiet https://develop.svn.wordpress.org/tags/$WP_VERSION/tests/phpunit/includes/ /tmp/wordpress-tests-lib/includes/
svn co --quiet https://develop.svn.wordpress.org/tags/$WP_VERSION/tests/phpunit/data/ /tmp/wordpress-tests-lib/data/

# Create test database
mysql --user="$DB_USER" --password="$DB_PASS" --execute="CREATE DATABASE IF NOT EXISTS $DB_NAME;"
```

### PHPUnit Configuration

**phpunit.xml:**
```xml
<?xml version="1.0"?>
<phpunit
    bootstrap="tests/bootstrap.php"
    backupGlobals="false"
    colors="true"
    convertErrorsToExceptions="true"
    convertNoticesToExceptions="true"
    convertWarningsToExceptions="true"
>
    <testsuites>
        <testsuite name="unit">
            <directory prefix="test-" suffix=".php">./tests/unit/</directory>
        </testsuite>
        <testsuite name="integration">
            <directory prefix="test-" suffix=".php">./tests/integration/</directory>
        </testsuite>
    </testsuites>
    <filter>
        <whitelist processUncoveredFilesFromWhitelist="true">
            <directory suffix=".php">./includes/</directory>
            <directory suffix=".php">./admin/</directory>
            <directory suffix=".php">./public/</directory>
        </whitelist>
    </filter>
</phpunit>
```

### Bootstrap File

**tests/bootstrap.php:**
```php
<?php
/**
 * PHPUnit bootstrap file
 */

// Composer autoloader
require_once dirname( dirname( __FILE__ ) ) . '/vendor/autoload.php';

// WordPress tests directory
$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
    echo "Could not find $_tests_dir/includes/functions.php\n";
    exit( 1 );
}

// Give access to tests_add_filter() function
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested
 */
function _manually_load_plugin() {
    require dirname( dirname( __FILE__ ) ) . '/my-plugin.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment
require $_tests_dir . '/includes/bootstrap.php';
```

---

## Unit Testing Patterns

### Test Class Structure

```php
<?php
/**
 * Unit test for custom class
 */
class Test_My_Plugin_Class extends WP_UnitTestCase {
    
    /**
     * Set up before each test
     */
    public function setUp(): void {
        parent::setUp();
        
        // Set up test data
        $this->instance = new My_Plugin_Class();
    }
    
    /**
     * Tear down after each test
     */
    public function tearDown(): void {
        parent::tearDown();
        
        // Clean up test data
        unset( $this->instance );
    }
    
    /**
     * Test method
     */
    public function test_method_name() {
        $result = $this->instance->method_name( 'test' );
        
        $this->assertEquals( 'expected', $result );
    }
}
```

### Testing WordPress Functions

```php
<?php
/**
 * Test WordPress function integration
 */
class Test_Plugin_Functions extends WP_UnitTestCase {
    
    /**
     * Test option storage
     */
    public function test_save_plugin_option() {
        $option_name = 'my_plugin_option';
        $option_value = 'test value';
        
        update_option( $option_name, $option_value );
        
        $saved_value = get_option( $option_name );
        
        $this->assertEquals( $option_value, $saved_value );
    }
    
    /**
     * Test post meta
     */
    public function test_save_post_meta() {
        $post_id = $this->factory->post->create();
        $meta_key = '_custom_meta';
        $meta_value = 'test value';

        update_post_meta( $post_id, $meta_key, $meta_value );

        $saved_value = get_post_meta( $post_id, $meta_key, true );

        $this->assertEquals( $meta_value, $saved_value );
    }
}
```

### Testing Custom Post Types

```php
<?php
/**
 * Test custom post type registration
 */
class Test_Custom_Post_Type extends WP_UnitTestCase {

    /**
     * Test CPT is registered
     */
    public function test_cpt_registered() {
        $this->assertTrue( post_type_exists( 'my_custom_post_type' ) );
    }

    /**
     * Test CPT creation
     */
    public function test_create_cpt() {
        $post_id = $this->factory->post->create( array(
            'post_type'   => 'my_custom_post_type',
            'post_title'  => 'Test Post',
            'post_status' => 'publish',
        ) );

        $this->assertGreaterThan( 0, $post_id );

        $post = get_post( $post_id );
        $this->assertEquals( 'my_custom_post_type', $post->post_type );
        $this->assertEquals( 'Test Post', $post->post_title );
    }

    /**
     * Test CPT labels
     */
    public function test_cpt_labels() {
        $post_type_object = get_post_type_object( 'my_custom_post_type' );

        $this->assertEquals( 'My Custom Posts', $post_type_object->labels->name );
        $this->assertEquals( 'My Custom Post', $post_type_object->labels->singular_name );
    }
}
```

### Testing Taxonomies

```php
<?php
/**
 * Test custom taxonomy
 */
class Test_Custom_Taxonomy extends WP_UnitTestCase {

    /**
     * Test taxonomy is registered
     */
    public function test_taxonomy_registered() {
        $this->assertTrue( taxonomy_exists( 'my_custom_taxonomy' ) );
    }

    /**
     * Test term creation
     */
    public function test_create_term() {
        $term = wp_insert_term( 'Test Term', 'my_custom_taxonomy' );

        $this->assertIsArray( $term );
        $this->assertArrayHasKey( 'term_id', $term );

        $term_object = get_term( $term['term_id'], 'my_custom_taxonomy' );
        $this->assertEquals( 'Test Term', $term_object->name );
    }

    /**
     * Test term assignment
     */
    public function test_assign_term_to_post() {
        $post_id = $this->factory->post->create( array(
            'post_type' => 'my_custom_post_type',
        ) );

        $term = wp_insert_term( 'Test Term', 'my_custom_taxonomy' );

        wp_set_object_terms( $post_id, $term['term_id'], 'my_custom_taxonomy' );

        $terms = wp_get_object_terms( $post_id, 'my_custom_taxonomy' );

        $this->assertCount( 1, $terms );
        $this->assertEquals( 'Test Term', $terms[0]->name );
    }
}
```

---

## Integration Testing Patterns

### Testing Hooks and Filters

```php
<?php
/**
 * Test hooks and filters
 */
class Test_Plugin_Hooks extends WP_UnitTestCase {

    /**
     * Test action hook is registered
     */
    public function test_action_hook_registered() {
        $this->assertGreaterThan(
            0,
            has_action( 'init', 'my_plugin_init_function' )
        );
    }

    /**
     * Test filter hook is registered
     */
    public function test_filter_hook_registered() {
        $this->assertGreaterThan(
            0,
            has_filter( 'the_content', 'my_plugin_filter_content' )
        );
    }

    /**
     * Test filter modifies content
     */
    public function test_filter_modifies_content() {
        $original_content = 'Original content';
        $filtered_content = apply_filters( 'the_content', $original_content );

        $this->assertStringContainsString( 'Original content', $filtered_content );
    }

    /**
     * Test action executes
     */
    public function test_action_executes() {
        // Set up a flag to check if action executed
        $executed = false;

        add_action( 'my_plugin_custom_action', function() use ( &$executed ) {
            $executed = true;
        } );

        do_action( 'my_plugin_custom_action' );

        $this->assertTrue( $executed );
    }
}
```

### Testing AJAX Handlers

```php
<?php
/**
 * Test AJAX handlers
 */
class Test_Plugin_AJAX extends WP_Ajax_UnitTestCase {

    /**
     * Test AJAX handler for logged-in users
     */
    public function test_ajax_handler_logged_in() {
        // Create and log in user
        $user_id = $this->factory->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $user_id );

        // Set up POST data
        $_POST['nonce'] = wp_create_nonce( 'my_plugin_ajax_nonce' );
        $_POST['data'] = 'test data';

        // Make AJAX request
        try {
            $this->_handleAjax( 'my_plugin_ajax_action' );
        } catch ( WPAjaxDieContinueException $e ) {
            // Expected exception
        }

        // Check response
        $response = json_decode( $this->_last_response );
        $this->assertTrue( $response->success );
    }

    /**
     * Test AJAX handler for non-logged-in users
     */
    public function test_ajax_handler_not_logged_in() {
        // Set up POST data
        $_POST['data'] = 'test data';

        // Make AJAX request
        try {
            $this->_handleAjax( 'my_plugin_ajax_action' );
        } catch ( WPAjaxDieStopException $e ) {
            // Expected exception for unauthorized access
        }

        // Check response indicates failure
        $response = json_decode( $this->_last_response );
        $this->assertFalse( $response->success );
    }
}
```

### Testing REST API Endpoints

```php
<?php
/**
 * Test REST API endpoints
 */
class Test_Plugin_REST_API extends WP_Test_REST_TestCase {

    /**
     * Set up before tests
     */
    public function setUp(): void {
        parent::setUp();

        // Create test user
        $this->user_id = $this->factory->user->create( array(
            'role' => 'administrator',
        ) );
    }

    /**
     * Test GET endpoint
     */
    public function test_get_endpoint() {
        wp_set_current_user( $this->user_id );

        $request = new WP_REST_Request( 'GET', '/my-plugin/v1/items' );
        $response = rest_do_request( $request );

        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();
        $this->assertIsArray( $data );
    }

    /**
     * Test POST endpoint
     */
    public function test_post_endpoint() {
        wp_set_current_user( $this->user_id );

        $request = new WP_REST_Request( 'POST', '/my-plugin/v1/items' );
        $request->set_body_params( array(
            'title' => 'Test Item',
            'content' => 'Test content',
        ) );

        $response = rest_do_request( $request );

        $this->assertEquals( 201, $response->get_status() );

        $data = $response->get_data();
        $this->assertEquals( 'Test Item', $data['title'] );
    }

    /**
     * Test endpoint permissions
     */
    public function test_endpoint_permissions() {
        // Not logged in
        $request = new WP_REST_Request( 'POST', '/my-plugin/v1/items' );
        $response = rest_do_request( $request );

        $this->assertEquals( 401, $response->get_status() );
    }
}
```

---

## Database Testing Patterns

### Testing Custom Tables

```php
<?php
/**
 * Test custom database table
 */
class Test_Custom_Table extends WP_UnitTestCase {

    /**
     * Table name
     */
    private $table_name;

    /**
     * Set up before tests
     */
    public function setUp(): void {
        parent::setUp();

        global $wpdb;
        $this->table_name = $wpdb->prefix . 'my_plugin_table';
    }

    /**
     * Test table exists
     */
    public function test_table_exists() {
        global $wpdb;

        $table_exists = $wpdb->get_var(
            $wpdb->prepare(
                "SHOW TABLES LIKE %s",
                $this->table_name
            )
        );

        $this->assertEquals( $this->table_name, $table_exists );
    }

    /**
     * Test insert data
     */
    public function test_insert_data() {
        global $wpdb;

        $data = array(
            'name'  => 'Test Name',
            'value' => 'Test Value',
        );

        $result = $wpdb->insert( $this->table_name, $data );

        $this->assertEquals( 1, $result );
        $this->assertGreaterThan( 0, $wpdb->insert_id );
    }

    /**
     * Test query data
     */
    public function test_query_data() {
        global $wpdb;

        // Insert test data
        $wpdb->insert( $this->table_name, array(
            'name'  => 'Test Name',
            'value' => 'Test Value',
        ) );

        // Query data
        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE name = %s",
                'Test Name'
            )
        );

        $this->assertEquals( 'Test Name', $result->name );
        $this->assertEquals( 'Test Value', $result->value );
    }
}
```

### Testing Transients

```php
<?php
/**
 * Test transient caching
 */
class Test_Plugin_Transients extends WP_UnitTestCase {

    /**
     * Test set and get transient
     */
    public function test_set_get_transient() {
        $transient_name = 'my_plugin_transient';
        $transient_value = array( 'key' => 'value' );

        set_transient( $transient_name, $transient_value, HOUR_IN_SECONDS );

        $retrieved_value = get_transient( $transient_name );

        $this->assertEquals( $transient_value, $retrieved_value );
    }

    /**
     * Test transient expiration
     */
    public function test_transient_expiration() {
        $transient_name = 'my_plugin_transient_expire';
        $transient_value = 'test value';

        set_transient( $transient_name, $transient_value, 1 );

        sleep( 2 );

        $retrieved_value = get_transient( $transient_name );

        $this->assertFalse( $retrieved_value );
    }

    /**
     * Test delete transient
     */
    public function test_delete_transient() {
        $transient_name = 'my_plugin_transient_delete';
        $transient_value = 'test value';

        set_transient( $transient_name, $transient_value, HOUR_IN_SECONDS );

        delete_transient( $transient_name );

        $retrieved_value = get_transient( $transient_name );

        $this->assertFalse( $retrieved_value );
    }
}
```

---

## WooCommerce Testing Patterns

### Testing WooCommerce Products

```php
<?php
/**
 * Test WooCommerce product functionality
 */
class Test_WooCommerce_Product extends WP_UnitTestCase {

    /**
     * Test create simple product
     */
    public function test_create_simple_product() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Test Product' );
        $product->set_regular_price( '10.00' );
        $product->set_status( 'publish' );
        $product->save();

        $this->assertGreaterThan( 0, $product->get_id() );
        $this->assertEquals( 'Test Product', $product->get_name() );
        $this->assertEquals( '10.00', $product->get_regular_price() );
    }

    /**
     * Test product meta
     */
    public function test_product_meta() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Test Product' );
        $product->save();

        $product->update_meta_data( '_custom_field', 'custom value' );
        $product->save();

        $custom_field = $product->get_meta( '_custom_field' );

        $this->assertEquals( 'custom value', $custom_field );
    }
}
```

### Testing WooCommerce Orders

```php
<?php
/**
 * Test WooCommerce order functionality
 */
class Test_WooCommerce_Order extends WP_UnitTestCase {

    /**
     * Test create order
     */
    public function test_create_order() {
        $order = wc_create_order();

        $this->assertInstanceOf( 'WC_Order', $order );
        $this->assertGreaterThan( 0, $order->get_id() );
    }

    /**
     * Test add product to order
     */
    public function test_add_product_to_order() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Test Product' );
        $product->set_regular_price( '10.00' );
        $product->save();

        $order = wc_create_order();
        $order->add_product( $product, 2 );
        $order->calculate_totals();

        $this->assertEquals( '20.00', $order->get_total() );
    }

    /**
     * Test order status change
     */
    public function test_order_status_change() {
        $order = wc_create_order();
        $order->set_status( 'processing' );
        $order->save();

        $this->assertEquals( 'processing', $order->get_status() );
    }
}
```

---

## Mock and Stub Patterns

### Mocking External APIs

```php
<?php
/**
 * Test external API integration
 */
class Test_External_API extends WP_UnitTestCase {

    /**
     * Test API call with mock
     */
    public function test_api_call() {
        // Mock HTTP response
        add_filter( 'pre_http_request', function( $preempt, $args, $url ) {
            if ( strpos( $url, 'api.example.com' ) !== false ) {
                return array(
                    'response' => array( 'code' => 200 ),
                    'body'     => json_encode( array( 'success' => true ) ),
                );
            }
            return $preempt;
        }, 10, 3 );

        $response = wp_remote_get( 'https://api.example.com/endpoint' );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        $this->assertTrue( $body['success'] );
    }
}
```

### Stubbing WordPress Functions

```php
<?php
/**
 * Test with stubbed functions
 */
class Test_Stubbed_Functions extends WP_UnitTestCase {

    /**
     * Test with stubbed current_time
     */
    public function test_with_stubbed_time() {
        // Stub current_time to return fixed timestamp
        add_filter( 'current_time', function( $time, $type ) {
            return '2024-01-01 12:00:00';
        }, 10, 2 );

        $time = current_time( 'mysql' );

        $this->assertEquals( '2024-01-01 12:00:00', $time );
    }
}
```

---

## Test Data Factories

### Using WordPress Factories

```php
<?php
/**
 * Test using factories
 */
class Test_With_Factories extends WP_UnitTestCase {

    /**
     * Test create multiple posts
     */
    public function test_create_posts() {
        $post_ids = $this->factory->post->create_many( 5 );

        $this->assertCount( 5, $post_ids );
    }

    /**
     * Test create user with meta
     */
    public function test_create_user_with_meta() {
        $user_id = $this->factory->user->create( array(
            'role'       => 'editor',
            'user_email' => 'test@example.com',
        ) );

        update_user_meta( $user_id, 'custom_field', 'custom value' );

        $user = get_user_by( 'id', $user_id );
        $custom_field = get_user_meta( $user_id, 'custom_field', true );

        $this->assertEquals( 'editor', $user->roles[0] );
        $this->assertEquals( 'custom value', $custom_field );
    }

    /**
     * Test create comment
     */
    public function test_create_comment() {
        $post_id = $this->factory->post->create();
        $comment_id = $this->factory->comment->create( array(
            'comment_post_ID' => $post_id,
        ) );

        $comment = get_comment( $comment_id );

        $this->assertEquals( $post_id, $comment->comment_post_ID );
    }
}
```

---

## Assertion Patterns

### Common Assertions

```php
<?php
/**
 * Common assertion examples
 */
class Test_Assertions extends WP_UnitTestCase {

    /**
     * Test equality assertions
     */
    public function test_equality() {
        $this->assertEquals( 'expected', 'expected' );
        $this->assertNotEquals( 'expected', 'actual' );
        $this->assertSame( 1, 1 ); // Strict comparison
        $this->assertNotSame( 1, '1' );
    }

    /**
     * Test boolean assertions
     */
    public function test_boolean() {
        $this->assertTrue( true );
        $this->assertFalse( false );
        $this->assertNull( null );
        $this->assertNotNull( 'value' );
    }

    /**
     * Test array assertions
     */
    public function test_array() {
        $array = array( 'key' => 'value' );

        $this->assertIsArray( $array );
        $this->assertArrayHasKey( 'key', $array );
        $this->assertContains( 'value', $array );
        $this->assertCount( 1, $array );
    }

    /**
     * Test string assertions
     */
    public function test_string() {
        $string = 'Hello World';

        $this->assertIsString( $string );
        $this->assertStringContainsString( 'World', $string );
        $this->assertStringStartsWith( 'Hello', $string );
        $this->assertStringEndsWith( 'World', $string );
    }

    /**
     * Test numeric assertions
     */
    public function test_numeric() {
        $this->assertGreaterThan( 5, 10 );
        $this->assertLessThan( 10, 5 );
        $this->assertGreaterThanOrEqual( 5, 5 );
        $this->assertLessThanOrEqual( 5, 5 );
    }

    /**
     * Test instance assertions
     */
    public function test_instance() {
        $post = get_post( $this->factory->post->create() );

        $this->assertInstanceOf( 'WP_Post', $post );
    }
}
```

---

## Code Coverage

### Generate Coverage Report

**composer.json:**
```json
{
  "scripts": {
    "test": "phpunit",
    "test:coverage": "phpunit --coverage-html coverage"
  }
}
```

**Run coverage:**
```bash
composer test:coverage
```

### Coverage Annotations

```php
<?php
/**
 * Test with coverage annotations
 */
class Test_Coverage extends WP_UnitTestCase {

    /**
     * @covers My_Plugin_Class::method_name
     */
    public function test_method() {
        $instance = new My_Plugin_Class();
        $result = $instance->method_name();

        $this->assertTrue( $result );
    }
}
```

---

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/tests.yml:**
```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        php: [ '7.4', '8.0', '8.1', '8.2' ]
        wordpress: [ 'latest', '6.0' ]

    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          extensions: mysqli
          coverage: xdebug

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress

      - name: Install WordPress test suite
        run: |
          bash bin/install-wp-tests.sh wordpress_test root root localhost ${{ matrix.wordpress }}

      - name: Run tests
        run: composer test

      - name: Upload coverage
        if: matrix.php == '8.1' && matrix.wordpress == 'latest'
        uses: codecov/codecov-action@v3
```

---

## Best Practices

### DO

✅ **Write tests first** (TDD approach when possible)
✅ **Test one thing per test** method
✅ **Use descriptive test names** (`test_user_can_save_settings`)
✅ **Clean up after tests** (use `tearDown()`)
✅ **Use factories** for test data creation
✅ **Mock external dependencies** (APIs, services)
✅ **Test edge cases** and error conditions
✅ **Aim for high code coverage** (80%+ is good)
✅ **Run tests before commits**
✅ **Use CI/CD** for automated testing
✅ **Test with multiple PHP versions**
✅ **Test with multiple WordPress versions**

### DON'T

❌ **Don't test WordPress core** functionality
❌ **Don't write tests that depend on each other**
❌ **Don't use real external APIs** in tests
❌ **Don't skip cleanup** in `tearDown()`
❌ **Don't test implementation details** - test behavior
❌ **Don't ignore failing tests**
❌ **Don't commit without running tests**
❌ **Don't test private methods** directly
❌ **Don't use production database** for tests
❌ **Don't hardcode test data** - use factories

---

## Test Organization

### Directory Structure

```
tests/
├── bootstrap.php                 # Test bootstrap
├── unit/                         # Unit tests
│   ├── test-class-plugin.php
│   ├── test-functions.php
│   └── test-helpers.php
├── integration/                  # Integration tests
│   ├── test-cpt.php
│   ├── test-ajax.php
│   └── test-rest-api.php
├── fixtures/                     # Test fixtures
│   ├── sample-data.json
│   └── sample-image.jpg
└── mocks/                        # Mock classes
    └── class-mock-api.php
```

### Naming Conventions

**Test files:**
- Prefix with `test-`
- Match source file name: `class-plugin.php` → `test-class-plugin.php`

**Test classes:**
- Prefix with `Test_`
- Use underscores: `Test_My_Plugin_Class`

**Test methods:**
- Prefix with `test_`
- Descriptive names: `test_user_can_save_settings()`

---

## Running Tests

### Command Line

```bash
# Run all tests
phpunit

# Run specific test suite
phpunit --testsuite unit
phpunit --testsuite integration

# Run specific test file
phpunit tests/unit/test-class-plugin.php

# Run specific test method
phpunit --filter test_method_name

# Run with coverage
phpunit --coverage-html coverage

# Run with verbose output
phpunit --verbose
```

### Composer Scripts

**composer.json:**
```json
{
  "scripts": {
    "test": "phpunit",
    "test:unit": "phpunit --testsuite unit",
    "test:integration": "phpunit --testsuite integration",
    "test:coverage": "phpunit --coverage-html coverage",
    "test:watch": "phpunit-watcher watch"
  }
}
```

**Run:**
```bash
composer test
composer test:unit
composer test:coverage
```

---

## Debugging Tests

### Enable Debug Output

```php
<?php
/**
 * Test with debug output
 */
class Test_Debug extends WP_UnitTestCase {

    public function test_with_debug() {
        $value = 'test';

        // Output debug information
        fwrite( STDERR, print_r( $value, true ) );

        $this->assertEquals( 'test', $value );
    }
}
```

### Use PHPUnit Annotations

```php
<?php
/**
 * @group slow
 * @group external-api
 */
class Test_External_API extends WP_UnitTestCase {

    /**
     * @group integration
     */
    public function test_api_call() {
        // Test code
    }
}
```

**Run specific groups:**
```bash
phpunit --group integration
phpunit --exclude-group slow
```

---

## Resources

- [WordPress PHPUnit Documentation](https://make.wordpress.org/core/handbook/testing/automated-testing/phpunit/)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [WP_UnitTestCase Reference](https://developer.wordpress.org/reference/classes/wp_unittestcase/)
- [WordPress Test Suite](https://develop.svn.wordpress.org/trunk/tests/phpunit/)
- [WooCommerce Testing](https://github.com/woocommerce/woocommerce/tree/trunk/plugins/woocommerce/tests)
```


