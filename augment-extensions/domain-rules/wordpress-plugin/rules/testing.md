# Testing Guidelines for WordPress Plugins

## Overview

This guide covers comprehensive testing strategies for WordPress plugins including automated testing with PHPUnit, Theme Check, Plugin Check, accessibility testing (WCAG 2.1), performance testing, and manual testing checklists.

---

## Automated Testing Tools

### 1. Theme Check Plugin

**Purpose**: Validate WordPress coding standards and best practices

**Installation**:
```bash
# Via WordPress admin
Plugins > Add New > Search "Theme Check"

# Or download from WordPress.org
https://wordpress.org/plugins/theme-check/
```

**Usage**:
```
1. Install and activate Theme Check plugin
2. Go to Appearance > Theme Check
3. Select your theme
4. Click "Check it!"
5. Review warnings and errors
```

**What it checks**:
- ✅ Required WordPress files
- ✅ Proper use of WordPress functions
- ✅ Deprecated function usage
- ✅ Security issues (escaping, sanitization)
- ✅ Translation readiness
- ✅ Licensing information

---

### 2. Plugin Check Plugin

**Purpose**: Validate plugin quality and WordPress.org submission requirements

**Installation**:
```bash
# Via WP-CLI
wp plugin install plugin-check --activate

# Or via WordPress admin
Plugins > Add New > Search "Plugin Check"
```

**Usage**:
```bash
# Via WP-CLI
wp plugin check /path/to/your-plugin

# Or via WordPress admin
Tools > Plugin Check > Select plugin > Run Check
```

**What it checks**:
- ✅ Plugin header information
- ✅ File structure and naming
- ✅ Security vulnerabilities
- ✅ Performance issues
- ✅ Accessibility compliance
- ✅ Internationalization
- ✅ WordPress coding standards

---

### 3. PHPUnit Tests

**Purpose**: Automated unit and integration testing

**Setup**:

```bash
# Install PHPUnit via Composer
composer require --dev phpunit/phpunit

# Install WordPress test suite
bash bin/install-wp-tests.sh wordpress_test root '' localhost latest

# Create phpunit.xml
```

**File: `phpunit.xml`**

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
            <directory suffix=".php">./tests/unit/</directory>
        </testsuite>
        <testsuite name="integration">
            <directory suffix=".php">./tests/integration/</directory>
        </testsuite>
    </testsuites>
    <filter>
        <whitelist>
            <directory suffix=".php">./includes/</directory>
        </whitelist>
    </filter>
</phpunit>
```

**Example Unit Test**:

```php
<?php
class Test_Plugin_Functions extends WP_UnitTestCase {

    public function test_sanitize_input() {
        $input = '<script>alert("xss")</script>Test';
        $expected = 'alert("xss")Test';
        $result = my_plugin_sanitize($input);
        
        $this->assertEquals($expected, $result);
    }

    public function test_validate_email() {
        $this->assertTrue(my_plugin_validate_email('test@example.com'));
        $this->assertFalse(my_plugin_validate_email('invalid-email'));
    }

    public function test_save_option() {
        $option_name = 'my_plugin_option';
        $option_value = 'test value';
        
        my_plugin_save_option($option_name, $option_value);
        
        $this->assertEquals($option_value, get_option($option_name));
    }
}
```

**Run Tests**:

```bash
# Run all tests
vendor/bin/phpunit

# Run specific test suite
vendor/bin/phpunit --testsuite unit

# Run with coverage
vendor/bin/phpunit --coverage-html coverage/
```

---

## Accessibility Testing (WCAG 2.1)

### Automated Accessibility Tools

**1. axe DevTools**
```
1. Install axe DevTools browser extension
2. Open your plugin's admin pages
3. Run axe scan
4. Fix reported issues
```

**2. WAVE (Web Accessibility Evaluation Tool)**
```
1. Visit https://wave.webaim.org/
2. Enter your plugin page URL
3. Review accessibility errors and warnings
```

**3. WordPress Accessibility Checker**
```bash
# Install via npm
npm install -g pa11y

# Run accessibility check
pa11y http://localhost/wp-admin/admin.php?page=your-plugin
```

### WCAG 2.1 Compliance Checklist

**Level A (Required)**:
- ✅ All images have alt text
- ✅ Form inputs have labels
- ✅ Keyboard navigation works
- ✅ Color contrast ratio ≥ 4.5:1 for normal text
- ✅ No keyboard traps
- ✅ Page has proper heading structure (h1, h2, h3)

**Level AA (Recommended)**:
- ✅ Color contrast ratio ≥ 7:1 for large text
- ✅ Focus indicators visible
- ✅ ARIA labels for complex widgets
- ✅ Error messages are descriptive
- ✅ Time limits can be extended

**Testing Steps**:
```
1. Navigate entire plugin using only keyboard (Tab, Enter, Esc)
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Check color contrast with browser tools
4. Verify all interactive elements have focus states
5. Test forms with validation errors
```

---

## Performance Testing

### 1. Query Monitor Plugin

**Installation**:
```bash
wp plugin install query-monitor --activate
```

**What to check**:
- ✅ Database queries (< 50 per page load)
- ✅ Query execution time (< 0.05s per query)
- ✅ HTTP requests (minimize external calls)
- ✅ PHP errors and warnings
- ✅ Hook execution time

**Usage**:
```
1. Activate Query Monitor
2. Use your plugin features
3. Check admin toolbar for Query Monitor menu
4. Review Queries, HTTP, Hooks tabs
5. Optimize slow queries and hooks
```

---

### 2. P3 (Plugin Performance Profiler)

**Installation**:
```bash
wp plugin install p3-profiler --activate
```

**Usage**:
```
1. Go to Tools > P3 Plugin Profiler
2. Click "Start Scan"
3. Browse your site normally
4. Stop scan and view results
5. Identify performance bottlenecks
```

---

### 3. Load Testing

**Using Apache Bench**:
```bash
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost/wp-admin/admin.php?page=your-plugin
```

**Using WP-CLI**:
```bash
# Profile plugin activation
wp profile stage --all
```

---

## Manual Testing Checklist

### Installation & Activation
- [ ] Plugin installs without errors
- [ ] Plugin activates successfully
- [ ] No PHP errors in debug.log
- [ ] Database tables created (if applicable)
- [ ] Default options set correctly
- [ ] Admin notices display properly

### Functionality Testing
- [ ] All features work as expected
- [ ] Forms submit correctly
- [ ] AJAX requests complete successfully
- [ ] Shortcodes render properly
- [ ] Widgets display correctly
- [ ] Custom post types appear
- [ ] Meta boxes save data

### Security Testing
- [ ] Nonce verification on all forms
- [ ] Capability checks on admin pages
- [ ] Input sanitization working
- [ ] Output escaping working
- [ ] SQL queries use prepared statements
- [ ] File uploads validated
- [ ] CSRF protection in place

### Compatibility Testing
- [ ] Works with latest WordPress version
- [ ] Works with PHP 7.4, 8.0, 8.1, 8.2
- [ ] Compatible with popular themes
- [ ] Compatible with popular plugins
- [ ] Multisite compatible (if applicable)
- [ ] Works in different browsers

### Deactivation & Uninstall
- [ ] Plugin deactivates cleanly
- [ ] No errors on deactivation
- [ ] Uninstall removes all data (if configured)
- [ ] Database tables removed (if applicable)
- [ ] Options deleted (if configured)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Forms have proper labels

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Database queries optimized
- [ ] Assets minified and concatenated
- [ ] Images optimized
- [ ] Caching implemented
- [ ] No memory leaks

---

## Continuous Integration (CI)

### GitHub Actions Example

**File: `.github/workflows/test.yml`**

```yaml
name: Test Plugin

on: [push, pull_request]

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

    - name: Run PHPUnit tests
      run: vendor/bin/phpunit --coverage-clover coverage.xml

    - name: Run Plugin Check
      run: wp plugin check .

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage.xml
```

---

## Best Practices

### DO
✅ Write tests before implementing features (TDD)  
✅ Test on multiple PHP versions  
✅ Test on multiple WordPress versions  
✅ Use automated testing in CI/CD  
✅ Test with real user scenarios  
✅ Check accessibility with screen readers  
✅ Profile performance regularly  
✅ Test multisite if applicable  
✅ Validate with Plugin Check before release  

### DON'T
❌ Skip writing tests  
❌ Test only on latest versions  
❌ Ignore accessibility  
❌ Deploy without performance testing  
❌ Skip security testing  
❌ Forget to test deactivation/uninstall  
❌ Ignore PHP errors and warnings  
❌ Skip cross-browser testing
