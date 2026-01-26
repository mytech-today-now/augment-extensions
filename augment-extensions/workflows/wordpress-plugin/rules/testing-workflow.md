# WordPress Plugin Testing Workflow

## Overview

This workflow guides you through setting up and running comprehensive tests for WordPress plugins using PHPUnit, WordPress Test Suite, and CI/CD integration.

## Prerequisites

- WordPress plugin with code to test
- Composer installed
- Local WordPress development environment
- Basic understanding of PHPUnit
- Domain rules: `domain-rules/wordpress-plugin/testing-patterns.md`

## Workflow Steps

### 1. Initial Test Environment Setup

**Step 1.1: Install PHPUnit via Composer**

```bash
# Navigate to plugin directory
cd wp-content/plugins/your-plugin

# Initialize composer if not already done
composer init

# Install PHPUnit
composer require --dev phpunit/phpunit ^9.0

# Install WordPress test library
composer require --dev yoast/phpunit-polyfills
```

**Step 1.2: Install WordPress Test Suite**

```bash
# Install WordPress test suite
bash bin/install-wp-tests.sh wordpress_test root '' localhost latest

# Or for specific WordPress version
bash bin/install-wp-tests.sh wordpress_test root '' localhost 6.4
```

**Step 1.3: Create Test Bootstrap File**

```php
// tests/bootstrap.php
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
    require dirname( dirname( __FILE__ ) ) . '/your-plugin.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment
require $_tests_dir . '/includes/bootstrap.php';
```

**Step 1.4: Create PHPUnit Configuration**

```xml
<!-- phpunit.xml.dist -->
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
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./includes</directory>
            <directory suffix=".php">./admin</directory>
            <directory suffix=".php">./public</directory>
        </include>
        <exclude>
            <directory>./vendor</directory>
            <directory>./tests</directory>
        </exclude>
    </coverage>
    <php>
        <env name="WP_TESTS_DIR" value="/tmp/wordpress-tests-lib" />
    </php>
</phpunit>
```

**Step 1.5: Create Test Directory Structure**

```bash
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures
mkdir -p tests/mocks
```

### 2. Test-Driven Development Workflow

**Step 2.1: Write Test First (Red)**

```php
// tests/unit/test-feature.php
class Test_Feature extends WP_UnitTestCase {
    
    public function test_feature_processes_data_correctly() {
        $feature = new Plugin_Feature();
        $input = array( 'key' => 'value' );
        $expected = array( 'key' => 'processed_value' );
        
        $result = $feature->process_data( $input );
        
        $this->assertEquals( $expected, $result );
    }
}
```

Run test (should fail):
```bash
vendor/bin/phpunit tests/unit/test-feature.php
```

**Step 2.2: Implement Feature (Green)**

```php
// includes/feature.php
class Plugin_Feature {
    public function process_data( $data ) {
        return array( 'key' => 'processed_value' );
    }
}
```

Run test (should pass):
```bash
vendor/bin/phpunit tests/unit/test-feature.php
```

**Step 2.3: Refactor (Refactor)**

Improve code quality while keeping tests passing.

### 3. Running Tests During Development

**Run All Tests**:

```bash
# Run all tests
vendor/bin/phpunit

# Run with verbose output
vendor/bin/phpunit --verbose

# Run with debug output
vendor/bin/phpunit --debug
```

**Run Specific Test Suites**:

```bash
# Run only unit tests
vendor/bin/phpunit --testsuite unit

# Run only integration tests
vendor/bin/phpunit --testsuite integration
```

**Run Specific Test Files**:

```bash
# Run specific test file
vendor/bin/phpunit tests/unit/test-feature.php

# Run specific test class
vendor/bin/phpunit --filter Test_Feature

# Run specific test method
vendor/bin/phpunit --filter test_feature_processes_data_correctly
```

**Run Tests with Coverage**:

```bash
# Generate HTML coverage report
vendor/bin/phpunit --coverage-html coverage/

# Generate text coverage report
vendor/bin/phpunit --coverage-text

# Generate coverage with minimum threshold
vendor/bin/phpunit --coverage-text --coverage-filter includes/ --coverage-clover coverage.xml
```

### 4. Writing Different Types of Tests

**Unit Tests** (test in isolation):

```php
class Test_Data_Processor extends WP_UnitTestCase {
    
    private $processor;
    
    public function setUp(): void {
        parent::setUp();
        $this->processor = new Data_Processor();
    }
    
    public function test_sanitizes_input() {
        $input = '<script>alert("xss")</script>Test';
        $expected = 'alert("xss")Test';
        
        $result = $this->processor->sanitize( $input );
        
        $this->assertEquals( $expected, $result );
    }
}
```

**Integration Tests** (test with WordPress):

```php
class Test_Post_Handler_Integration extends WP_UnitTestCase {

    public function test_creates_post_with_meta() {
        $handler = new Post_Handler();

        $post_id = $handler->create_post( array(
            'title' => 'Test Post',
            'meta' => array( 'key' => 'value' ),
        ) );

        $this->assertGreaterThan( 0, $post_id );
        $this->assertEquals( 'value', get_post_meta( $post_id, 'key', true ) );
    }
}
```

**AJAX Tests**:

```php
class Test_AJAX_Handler extends WP_Ajax_UnitTestCase {

    public function test_ajax_action_success() {
        // Set up request
        $_POST['action'] = 'my_ajax_action';
        $_POST['nonce'] = wp_create_nonce( 'my_nonce' );
        $_POST['data'] = 'test_data';

        // Set current user
        wp_set_current_user( $this->factory->user->create( array( 'role' => 'administrator' ) ) );

        // Make AJAX request
        try {
            $this->_handleAjax( 'my_ajax_action' );
        } catch ( WPAjaxDieContinueException $e ) {
            // Expected exception
        }

        // Assert response
        $response = json_decode( $this->_last_response );
        $this->assertTrue( $response->success );
    }
}
```

**Database Tests**:

```php
class Test_Database_Operations extends WP_UnitTestCase {

    private $table_name;

    public function setUp(): void {
        parent::setUp();
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'custom_table';
    }

    public function test_inserts_data() {
        global $wpdb;

        $data = array(
            'column1' => 'value1',
            'column2' => 'value2',
        );

        $result = $wpdb->insert( $this->table_name, $data );

        $this->assertNotFalse( $result );
        $this->assertEquals( 1, $wpdb->insert_id );
    }
}
```

### 5. Using Test Factories

**Create Test Data**:

```php
class Test_With_Factories extends WP_UnitTestCase {

    public function test_with_posts() {
        // Create posts
        $post_ids = $this->factory->post->create_many( 5 );

        $this->assertCount( 5, $post_ids );
    }

    public function test_with_users() {
        // Create user
        $user_id = $this->factory->user->create( array(
            'role' => 'editor',
            'user_email' => 'test@example.com',
        ) );

        $user = get_user_by( 'id', $user_id );
        $this->assertEquals( 'editor', $user->roles[0] );
    }

    public function test_with_terms() {
        // Create taxonomy terms
        $term_ids = $this->factory->term->create_many( 3, array(
            'taxonomy' => 'category',
        ) );

        $this->assertCount( 3, $term_ids );
    }
}
```

### 6. Mocking and Stubbing

**Mock WordPress Functions**:

```php
class Test_With_Mocks extends WP_UnitTestCase {

    public function test_with_filter_mock() {
        // Add filter
        add_filter( 'my_filter', function( $value ) {
            return 'mocked_value';
        } );

        $result = apply_filters( 'my_filter', 'original_value' );

        $this->assertEquals( 'mocked_value', $result );
    }

    public function test_with_action_mock() {
        $called = false;

        add_action( 'my_action', function() use ( &$called ) {
            $called = true;
        } );

        do_action( 'my_action' );

        $this->assertTrue( $called );
    }
}
```

**Mock External APIs**:

```php
class Test_API_Client extends WP_UnitTestCase {

    public function test_api_request() {
        // Mock wp_remote_get
        add_filter( 'pre_http_request', function( $preempt, $args, $url ) {
            if ( strpos( $url, 'api.example.com' ) !== false ) {
                return array(
                    'response' => array( 'code' => 200 ),
                    'body' => json_encode( array( 'data' => 'mocked' ) ),
                );
            }
            return $preempt;
        }, 10, 3 );

        $client = new API_Client();
        $result = $client->fetch_data();

        $this->assertEquals( 'mocked', $result['data'] );
    }
}
```

### 7. CI/CD Integration Workflow

**Step 7.1: Create GitHub Actions Workflow**

```yaml
# .github/workflows/tests.yml
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
        php: ['7.4', '8.0', '8.1', '8.2']
        wordpress: ['6.0', '6.4', 'latest']

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

    - name: Install WordPress Test Suite
      run: bash bin/install-wp-tests.sh wordpress_test root root localhost ${{ matrix.wordpress }}

    - name: Run tests
      run: vendor/bin/phpunit --coverage-clover coverage.xml

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage.xml
```

**Step 7.2: Create GitLab CI Configuration**

```yaml
# .gitlab-ci.yml
image: php:8.1

stages:
  - test

variables:
  MYSQL_ROOT_PASSWORD: root
  MYSQL_DATABASE: wordpress_test

services:
  - mysql:5.7

before_script:
  - apt-get update -qq && apt-get install -y -qq git subversion mysql-client
  - docker-php-ext-install mysqli
  - curl -sS https://getcomposer.org/installer | php
  - php composer.phar install

test:
  stage: test
  script:
    - bash bin/install-wp-tests.sh wordpress_test root root mysql latest
    - vendor/bin/phpunit --coverage-text --colors=never
```

### 8. Pre-Release Testing Checklist

**Code Quality**:
- [ ] All tests pass locally
- [ ] Code coverage > 80%
- [ ] No PHP errors or warnings
- [ ] Follows WordPress Coding Standards (WPCS)
- [ ] PHPStan/Psalm static analysis passes

**Functional Testing**:
- [ ] All features work as expected
- [ ] Admin interface functions correctly
- [ ] Frontend display works correctly
- [ ] AJAX requests work correctly
- [ ] Forms submit successfully

**Security Testing**:
- [ ] Nonce verification tests pass
- [ ] Capability check tests pass
- [ ] Input sanitization tests pass
- [ ] Output escaping tests pass
- [ ] SQL injection tests pass
- [ ] XSS tests pass

**Performance Testing**:
- [ ] Database queries are optimized
- [ ] No N+1 query problems
- [ ] Caching works correctly
- [ ] Page load time is acceptable

**Compatibility Testing**:
- [ ] Works with latest WordPress version
- [ ] Works with minimum supported WordPress version
- [ ] Works with PHP 7.4+
- [ ] Works with common themes
- [ ] Works with common plugins

**Accessibility Testing**:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Forms have proper labels

### 9. Debugging Failed Tests

**Enable Debug Mode**:

```php
// tests/bootstrap.php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
```

**Use var_dump in Tests**:

```php
public function test_debug_output() {
    $result = $this->feature->process_data( $input );
    var_dump( $result ); // Will show in test output
    $this->assertTrue( true );
}
```

**Use PHPUnit Debugging**:

```bash
# Run with debug output
vendor/bin/phpunit --debug

# Run with verbose output
vendor/bin/phpunit --verbose

# Stop on first failure
vendor/bin/phpunit --stop-on-failure

# Stop on first error
vendor/bin/phpunit --stop-on-error
```

**Check WordPress Debug Log**:

```bash
# View debug log
tail -f wp-content/debug.log
```

### 10. Continuous Testing Workflow

**Watch Mode** (using entr or similar):

```bash
# Install entr (macOS)
brew install entr

# Watch for changes and run tests
find . -name "*.php" | entr vendor/bin/phpunit
```

**Pre-Commit Hook**:

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running tests..."
vendor/bin/phpunit

if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi

echo "Tests passed. Proceeding with commit."
```

## AI Prompt Templates

### Test Setup Prompt

```
Set up PHPUnit testing for [plugin name].

Requirements:
- Install PHPUnit via Composer
- Install WordPress Test Suite
- Create test bootstrap file
- Create PHPUnit configuration
- Create test directory structure (unit, integration, fixtures, mocks)

Test coverage needed:
- Unit tests for core logic
- Integration tests for WordPress integration
- AJAX tests for AJAX handlers
- Database tests for custom tables

Use WordPress test suite and mock WordPress functions where appropriate.
```

### Test Writing Prompt

```
Write comprehensive tests for [feature name] in [plugin name].

Test coverage:
- Unit tests for [list functions]
- Integration tests for [list WordPress integration points]
- Security tests for nonce verification, capability checks, sanitization, escaping
- Database tests for [list database operations]

Use test factories for creating test data.
Mock external APIs and WordPress functions where appropriate.
Achieve > 80% code coverage.
```

### CI/CD Setup Prompt

```
Set up CI/CD for [plugin name] using [GitHub Actions/GitLab CI].

Requirements:
- Test on PHP versions: 7.4, 8.0, 8.1, 8.2
- Test on WordPress versions: 6.0, 6.4, latest
- Run PHPUnit tests
- Generate code coverage report
- Upload coverage to Codecov

Create workflow file with proper matrix configuration.
```

## Best Practices

### DO

✅ Write tests before implementing features (TDD)
✅ Test one thing per test method
✅ Use descriptive test method names
✅ Use test factories for creating test data
✅ Mock external dependencies
✅ Test edge cases and error conditions
✅ Aim for > 80% code coverage
✅ Run tests before committing
✅ Use CI/CD for automated testing
✅ Keep tests fast and isolated

### DON'T

❌ Skip writing tests
❌ Test multiple things in one test
❌ Use production data in tests
❌ Depend on test execution order
❌ Leave failing tests in codebase
❌ Skip testing edge cases
❌ Commit without running tests
❌ Ignore code coverage metrics
❌ Write slow tests
❌ Test implementation details

## Common Testing Patterns

### Pattern 1: Test Setup and Teardown

```php
class Test_Feature extends WP_UnitTestCase {

    private $feature;
    private $test_post_id;

    public function setUp(): void {
        parent::setUp();
        $this->feature = new Feature();
        $this->test_post_id = $this->factory->post->create();
    }

    public function tearDown(): void {
        wp_delete_post( $this->test_post_id, true );
        parent::tearDown();
    }
}
```

### Pattern 2: Data Providers

```php
class Test_Validation extends WP_UnitTestCase {

    /**
     * @dataProvider email_provider
     */
    public function test_email_validation( $email, $expected ) {
        $result = $this->validator->is_valid_email( $email );
        $this->assertEquals( $expected, $result );
    }

    public function email_provider() {
        return array(
            array( 'valid@example.com', true ),
            array( 'invalid@', false ),
            array( 'no-at-sign.com', false ),
            array( '', false ),
        );
    }
}
```

### Pattern 3: Exception Testing

```php
class Test_Error_Handling extends WP_UnitTestCase {

    public function test_throws_exception_on_invalid_input() {
        $this->expectException( InvalidArgumentException::class );
        $this->expectExceptionMessage( 'Invalid input' );

        $this->feature->process( null );
    }
}
```

## Resources

- [WordPress PHPUnit Documentation](https://make.wordpress.org/core/handbook/testing/automated-testing/phpunit/)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [WordPress Test Suite](https://develop.svn.wordpress.org/trunk/tests/phpunit/)
- [WP_UnitTestCase Reference](https://developer.wordpress.org/reference/classes/wp_unittestcase/)
- [Codecov](https://codecov.io/)

## Related Workflows

- `development-workflow.md` - Feature development cycle
- `scaffolding-workflow.md` - Creating new plugins
- `submission-workflow.md` - WordPress.org submission

## Related Domain Rules

- `domain-rules/wordpress-plugin/testing-patterns.md` - Detailed testing patterns
- `domain-rules/wordpress-plugin/security-best-practices.md` - Security testing

