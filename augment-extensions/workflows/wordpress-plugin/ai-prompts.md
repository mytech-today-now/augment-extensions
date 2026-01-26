# AI Prompt Templates for WordPress Plugin Development

This document provides ready-to-use AI prompt templates for common WordPress plugin development tasks. These prompts are optimized for use with AI coding assistants like Augment Code AI.

## Table of Contents

1. [Plugin Creation Prompts](#plugin-creation-prompts)
2. [Feature Development Prompts](#feature-development-prompts)
3. [Security Audit Prompts](#security-audit-prompts)
4. [Testing Prompts](#testing-prompts)
5. [WordPress.org Submission Prompts](#wordpress-org-submission-prompts)
6. [Debugging Prompts](#debugging-prompts)
7. [Optimization Prompts](#optimization-prompts)

---

## Plugin Creation Prompts

### Basic Plugin Scaffolding

```
Create a WordPress plugin called [Plugin Name] that [brief description].

Requirements:
- Plugin slug: [plugin-slug]
- Text domain: [plugin-slug]
- Minimum WordPress version: 6.0
- PHP version: 7.4+
- License: GPL-2.0+

Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Architecture:
- Use object-oriented approach
- Separate admin and public functionality
- Follow WordPress coding standards
- Include activation/deactivation hooks

File structure:
- Main plugin file with header
- Includes directory for core classes
- Admin directory for admin functionality
- Public directory for frontend functionality
- Languages directory for translations

Security requirements:
- Nonce verification for all forms
- Capability checks for admin actions
- Input sanitization using WordPress functions
- Output escaping for all user-generated content

Create the basic plugin structure with all necessary files and boilerplate code.
```

### Plugin with Custom Post Type

```
Create a WordPress plugin called [Plugin Name] that manages [custom post type].

Requirements:
- Plugin slug: [plugin-slug]
- Custom post type: [post-type-slug]
- Custom taxonomy: [taxonomy-slug] (if applicable)
- Minimum WordPress version: 6.0

Features:
- Register custom post type with proper labels
- Register custom taxonomy (if applicable)
- Admin interface for managing [post type]
- Frontend display with custom template
- Shortcode: [shortcode-name]
- Widget support (optional)

Custom post type configuration:
- Public: true
- Has archive: true
- Supports: title, editor, thumbnail, excerpt
- Menu icon: [dashicon-name]
- Rewrite slug: [slug]

Include:
- Custom meta boxes for additional fields
- Custom columns in admin list view
- Filters for custom queries
- Template hierarchy support

Follow WordPress best practices for custom post types and taxonomies.
```

### Plugin with Settings Page

```
Create a WordPress plugin called [Plugin Name] with a settings page.

Requirements:
- Plugin slug: [plugin-slug]
- Settings page location: Settings > [Page Name]
- Minimum WordPress version: 6.0

Settings to include:
- [Setting 1]: [type] (text, checkbox, select, etc.)
- [Setting 2]: [type]
- [Setting 3]: [type]

Features:
- Settings page using WordPress Settings API
- Proper sanitization for all settings
- Default values on activation
- Settings validation
- Success/error messages
- Reset to defaults option

Security:
- Nonce verification for form submission
- Capability check: manage_options
- Sanitize all inputs based on type
- Escape all outputs

Use WordPress Settings API with register_setting(), add_settings_section(), and add_settings_field().
```

---

## Feature Development Prompts

### Add AJAX Functionality

```
Add AJAX functionality to [plugin name] for [feature description].

Requirements:
- AJAX action: [action-name]
- Trigger: [user action, e.g., button click, form submit]
- Response: [JSON response format]

Implementation:
- Create AJAX handler in PHP
- Add JavaScript for AJAX request
- Localize script with ajax_url and nonce
- Handle success and error responses
- Show loading state during request

Security:
- Verify nonce with check_ajax_referer()
- Check user capability: [capability]
- Sanitize all inputs
- Escape all outputs in response

JavaScript requirements:
- Use jQuery.ajax() or fetch()
- Handle errors gracefully
- Update UI based on response
- Show user-friendly error messages

PHP handler requirements:
- Hook to wp_ajax_[action] and wp_ajax_nopriv_[action] (if public)
- Return JSON with wp_send_json_success() or wp_send_json_error()
- Log errors for debugging
```

### Add REST API Endpoint

```
Add a REST API endpoint to [plugin name] for [purpose].

Requirements:
- Namespace: [plugin-slug]/v1
- Route: /[endpoint-path]
- Methods: [GET, POST, PUT, DELETE]
- Authentication: [required/optional]

Endpoint details:
- URL: /wp-json/[plugin-slug]/v1/[endpoint-path]
- Parameters: [list parameters with types]
- Response format: [JSON structure]

Implementation:
- Register route with register_rest_route()
- Create callback function
- Add permission callback
- Validate parameters with args
- Sanitize inputs
- Return WP_REST_Response

Security:
- Permission callback to check capabilities
- Nonce verification (if needed)
- Sanitize all inputs
- Validate parameter types
- Rate limiting (if applicable)

Example usage:
- Show example JavaScript fetch() call
- Show example cURL command
```

### Add Custom Database Table

```
Add a custom database table to [plugin name] for [purpose].

Requirements:
- Table name: wp_[plugin_prefix]_[table_name]
- Columns: [list columns with types]
- Indexes: [list indexes]

Table schema:
- id: bigint(20) AUTO_INCREMENT PRIMARY KEY
- [column1]: [type] [constraints]
- [column2]: [type] [constraints]
- created_at: datetime DEFAULT CURRENT_TIMESTAMP
- updated_at: datetime ON UPDATE CURRENT_TIMESTAMP

Implementation:
- Create table on plugin activation using dbDelta()
- Add version checking for updates
- Create model class with CRUD methods
- Use $wpdb->prepare() for all queries
- Add proper indexes for performance

Model class methods:
- create($data): Insert new record
- get_by_id($id): Get single record
- get_all($args): Get multiple records with pagination
- update($id, $data): Update record
- delete($id): Delete record

Security:
- Always use $wpdb->prepare() with placeholders
- Sanitize all inputs
- Validate data before insertion
- Use correct placeholder types (%s, %d, %f)

Uninstall:
- Drop table in uninstall.php (optional)
- Or keep data for plugin reinstallation
```

---

## Security Audit Prompts

### Comprehensive Security Audit

```
Perform a comprehensive security audit on [plugin name].

Audit scope:
1. CSRF Protection (Cross-Site Request Forgery)
2. XSS Prevention (Cross-Site Scripting)
3. SQL Injection Prevention
4. Authentication and Authorization
5. Input Validation and Sanitization
6. Output Escaping
7. File Upload Security (if applicable)
8. API Security (if applicable)

For each area, check:
- All forms have nonce verification
- All AJAX handlers verify nonces
- All admin actions check capabilities
- All user input is sanitized
- All output is escaped
- All database queries use prepared statements
- No eval() or exec() usage
- No unserialize() on user input
- File uploads are restricted and validated

Provide a report with:
- List of vulnerabilities found
- Severity rating (Critical, High, Medium, Low)
- File names and line numbers
- Recommended fixes with code examples
- Security best practices to implement

Use WordPress security functions:
- wp_nonce_field(), wp_verify_nonce(), check_ajax_referer()
- sanitize_text_field(), sanitize_email(), sanitize_textarea_field()
- esc_html(), esc_attr(), esc_url(), esc_js()
- $wpdb->prepare() with %s, %d, %f placeholders
- current_user_can() for capability checks
```

### Fix Security Vulnerabilities

```
Fix the following security vulnerabilities in [plugin name]:

[List vulnerabilities with file names and line numbers]

For each vulnerability:
1. Explain the security risk
2. Show the vulnerable code
3. Provide the secure fix
4. Explain why the fix works

Security fixes to apply:
- Add nonce verification to forms
- Add nonce verification to AJAX handlers
- Add capability checks to admin actions
- Sanitize all user inputs
- Escape all outputs
- Convert database queries to use $wpdb->prepare()

Follow WordPress security best practices:
- Use WordPress security functions (not custom implementations)
- Apply defense in depth (multiple layers of security)
- Validate on both client and server side
- Log security events for monitoring
- Use least privilege principle for capabilities

Test all fixes to ensure:
- Functionality still works correctly
- Security vulnerabilities are resolved
- No new vulnerabilities introduced
- User experience is not negatively impacted
```

---

## Testing Prompts

### Set Up PHPUnit Testing

```
Set up PHPUnit testing for [plugin name].

Requirements:
- Install PHPUnit via Composer
- Install WordPress Test Suite
- Create test bootstrap file
- Create PHPUnit configuration
- Create test directory structure

Directory structure:
tests/
├── bootstrap.php
├── unit/
│   ├── test-[class-name].php
│   └── ...
├── integration/
│   ├── test-[feature-name].php
│   └── ...
├── fixtures/
│   └── sample-data.php
└── mocks/
    └── mock-[class-name].php

Test coverage needed:
- Unit tests for core logic (isolated from WordPress)
- Integration tests for WordPress integration
- AJAX tests for AJAX handlers
- Database tests for custom tables
- REST API tests for endpoints

Configuration:
- PHPUnit version: 9.x
- WordPress test suite: latest
- Code coverage: enabled
- Test groups: unit, integration, ajax, database

Create example tests for:
- [Class/Feature 1]
- [Class/Feature 2]
- [Class/Feature 3]

Use WordPress test suite functions:
- WP_UnitTestCase for WordPress integration tests
- factory() for creating test data
- go_to() for simulating page requests
```

### Write Unit Tests

```
Write comprehensive unit tests for [class/feature name] in [plugin name].

Class/Feature to test:
- File: [file path]
- Class: [class name]
- Methods: [list methods]

Test coverage requirements:
- Test all public methods
- Test edge cases and error conditions
- Test with valid and invalid inputs
- Test return values and side effects
- Achieve > 80% code coverage

Test structure:
- One test class per class being tested
- One test method per scenario
- Use descriptive test method names
- Follow Arrange-Act-Assert pattern

Example test scenarios:
- Test with valid input
- Test with invalid input
- Test with empty input
- Test with boundary values
- Test error handling
- Test WordPress integration (if applicable)

Use PHPUnit assertions:
- assertEquals(), assertSame(), assertTrue(), assertFalse()
- assertInstanceOf(), assertArrayHasKey()
- expectException() for error testing

Mock WordPress functions where needed:
- Use WP_Mock or Brain\Monkey for mocking
- Mock database calls
- Mock WordPress hooks
```

### Write Integration Tests

```
Write integration tests for [feature name] in [plugin name].

Feature to test:
- Description: [feature description]
- Files involved: [list files]
- WordPress integration points: [hooks, filters, etc.]

Test scenarios:
- Test feature with WordPress environment
- Test database operations
- Test AJAX handlers
- Test REST API endpoints
- Test shortcodes
- Test widgets
- Test admin pages

Integration test requirements:
- Use WP_UnitTestCase
- Create test data with factory()
- Clean up after each test
- Test with different user roles
- Test with different WordPress configurations

Example tests:
1. Test [scenario 1]
2. Test [scenario 2]
3. Test [scenario 3]

Use WordPress test utilities:
- $this->factory->post->create() for test posts
- $this->factory->user->create() for test users
- wp_set_current_user() to simulate logged-in users
- do_action() to trigger hooks
- apply_filters() to test filters
```

---

## WordPress.org Submission Prompts

### Prepare Plugin for Submission

```
Prepare [plugin name] for WordPress.org submission.

Pre-submission checklist:
1. Code Quality
   - Run WPCS check: vendor/bin/phpcs --standard=WordPress
   - Fix all errors and warnings
   - Ensure all functions are documented (PHPDoc)
   - Remove debug code and console.log statements

2. Security
   - Run security audit
   - Fix all security vulnerabilities
   - Verify nonce usage in all forms
   - Verify capability checks in all admin actions
   - Verify input sanitization and output escaping

3. Functionality
   - Test all features
   - Test with latest WordPress version
   - Test with minimum supported version
   - Test with common themes
   - Test with common plugins

4. Documentation
   - Create/update readme.txt
   - Validate readme.txt format
   - Add installation instructions
   - Add FAQ section
   - Add changelog

5. Assets
   - Create banner images (772x250, 1544x500)
   - Create icon images (128x128, 256x256)
   - Take screenshots (at least 2-3)
   - Optimize all images

6. Licensing
   - Verify GPL-2.0+ license
   - Check third-party library licenses
   - Add license file
   - Add copyright notices

Create a submission-ready ZIP file excluding:
- .git, .gitignore
- node_modules, vendor
- tests, .phpunit.xml
- Development files (package.json, composer.json)
- Documentation files (.md files except readme.txt)

Provide a checklist of completed items and any remaining tasks.
```

### Create readme.txt

```
Create a WordPress.org readme.txt file for [plugin name].

Plugin details:
- Plugin name: [name]
- Description: [brief description]
- Contributors: [wordpress.org usernames]
- Tags: [tag1, tag2, tag3] (max 5)
- Requires at least: 6.0
- Tested up to: 6.4
- Requires PHP: 7.4
- Stable tag: [version]
- License: GPLv2 or later

Include these sections:
1. Short Description (150 characters max)
2. Description (detailed features and benefits)
3. Installation (step-by-step instructions)
4. Frequently Asked Questions (at least 3-5 questions)
5. Screenshots (descriptions for each)
6. Changelog (version history)
7. Upgrade Notice (important upgrade information)

Features to highlight:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Use proper readme.txt format:
- Use === for plugin name
- Use == for section headers
- Use = for subsection headers
- Use * for bullet points
- Use 1. 2. 3. for numbered lists

Validate with: https://wordpress.org/plugins/developers/readme-validator/
```

---

## Debugging Prompts

### Debug Plugin Issue

```
Debug the following issue in [plugin name]:

Issue description:
[Describe the problem]

Steps to reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected behavior:
[What should happen]

Actual behavior:
[What actually happens]

Environment:
- WordPress version: [version]
- PHP version: [version]
- Active theme: [theme name]
- Active plugins: [list plugins]

Debug process:
1. Enable WordPress debug mode (WP_DEBUG, WP_DEBUG_LOG)
2. Check error logs for PHP errors
3. Check browser console for JavaScript errors
4. Add debug logging to relevant functions
5. Test with default theme (Twenty Twenty-Four)
6. Test with all other plugins deactivated
7. Check for conflicts with other plugins/themes

Provide:
- Root cause of the issue
- Step-by-step fix
- Code changes needed
- Testing steps to verify fix
- Prevention measures for future
```

### Optimize Plugin Performance

```
Optimize the performance of [plugin name].

Current performance issues:
- [Issue 1: e.g., slow page load]
- [Issue 2: e.g., too many database queries]
- [Issue 3: e.g., large asset files]

Optimization areas:
1. Database Queries
   - Identify N+1 query problems
   - Add database indexes
   - Implement query caching
   - Use transients for expensive queries

2. Asset Loading
   - Minify CSS and JavaScript
   - Combine files where possible
   - Conditional loading (only load when needed)
   - Use wp_enqueue_script() with dependencies

3. Caching
   - Implement object caching
   - Use transients for API calls
   - Cache expensive calculations
   - Set appropriate cache expiration

4. Code Optimization
   - Remove unnecessary loops
   - Optimize algorithms
   - Lazy load data
   - Use WordPress core functions

Performance targets:
- Page load time: < 2 seconds
- Database queries: < 10 per page
- Asset size: < 500KB total
- Time to First Byte: < 600ms

Provide:
- Performance audit results
- Specific optimizations to implement
- Before/after performance metrics
- Testing methodology
```

---

## Optimization Prompts

### Add Caching

```
Add caching to [plugin name] for [feature/data].

Caching requirements:
- Cache type: [transient, object cache, page cache]
- Cache duration: [time in seconds]
- Cache key: [unique identifier]
- Invalidation triggers: [when to clear cache]

Implementation:
- Use WordPress Transients API
- Set appropriate expiration time
- Implement cache invalidation
- Add cache warming (if needed)
- Handle cache misses gracefully

Example caching scenarios:
1. Cache API responses
2. Cache database query results
3. Cache expensive calculations
4. Cache rendered HTML

Code structure:
```php
// Check cache
$cache_key = 'plugin_prefix_' . $identifier;
$cached_data = get_transient($cache_key);

if (false !== $cached_data) {
    return $cached_data;
}

// Generate data
$data = expensive_operation();

// Store in cache
set_transient($cache_key, $data, HOUR_IN_SECONDS);

return $data;
```

Cache invalidation:
- Clear cache on data update
- Clear cache on plugin settings change
- Provide manual cache clear option
- Clear cache on plugin deactivation (optional)
```

### Implement Lazy Loading

```
Implement lazy loading for [feature/content] in [plugin name].

Lazy loading requirements:
- Load content only when needed
- Improve initial page load time
- Reduce unnecessary HTTP requests
- Maintain good user experience

Implementation approaches:
1. JavaScript lazy loading
   - Load content on scroll
   - Load content on click
   - Load content on viewport intersection

2. PHP lazy loading
   - Load data only when accessed
   - Use lazy initialization pattern
   - Defer expensive operations

3. Image lazy loading
   - Use loading="lazy" attribute
   - Implement intersection observer
   - Provide placeholder images

Example scenarios:
- Lazy load images in gallery
- Lazy load admin page content
- Lazy load widget content
- Lazy load AJAX data

Provide:
- Implementation code
- Fallback for browsers without JavaScript
- Performance improvement metrics
- User experience considerations
```

---

## Usage Examples

### Example: Create Contact Form Plugin

```
Create a WordPress plugin called "Simple Contact Form" that allows users to submit contact messages.

Requirements:
- Plugin slug: simple-contact-form
- Text domain: simple-contact-form
- Minimum WordPress version: 6.0
- PHP version: 7.4+

Features:
- Frontend contact form with fields: name, email, subject, message
- Shortcode: [simple_contact_form]
- Admin page to view submissions (Tools > Contact Messages)
- Email notifications to site admin
- AJAX form submission
- Rate limiting (3 submissions per hour per IP)
- Custom fields support (admin can add custom form fields)

Architecture:
- Object-oriented with separate classes for form, message model, email handler
- Admin and public functionality separated
- Use WordPress Settings API for configuration

Security requirements:
- Nonce verification for form submission
- Capability check: manage_options for admin page
- Sanitize all inputs (sanitize_text_field, sanitize_email, sanitize_textarea_field)
- Escape all outputs (esc_html, esc_attr, esc_url)
- Rate limiting to prevent spam

Database:
- Custom table: wp_simple_contact_messages
- Columns: id, name, email, subject, message, ip_address, submitted_at, status

Create complete plugin with all files, classes, and functionality.
```

### Example: Add Security Audit

```
Perform a comprehensive security audit on the Simple Contact Form plugin.

Check for:
1. CSRF Protection
   - All forms have nonce verification
   - All AJAX handlers verify nonces

2. XSS Prevention
   - All output is properly escaped
   - Admin pages escape user data
   - Email templates escape content

3. SQL Injection
   - All database queries use $wpdb->prepare()
   - Correct placeholder types used

4. Authorization
   - Admin pages check manage_options capability
   - Data modification checks permissions

5. Input Validation
   - Email addresses validated
   - Required fields checked
   - Data types validated

Provide detailed report with:
- Vulnerabilities found (with severity)
- File names and line numbers
- Recommended fixes with code examples
- Security best practices to implement
```

---

## Tips for Using These Prompts

1. **Customize for your needs**: Replace placeholders like [plugin name], [feature], etc.
2. **Be specific**: Add more details about your requirements
3. **Combine prompts**: Use multiple prompts for complex tasks
4. **Iterate**: Refine prompts based on AI responses
5. **Verify output**: Always review and test generated code
6. **Follow up**: Ask clarifying questions if needed

## Related Resources

- WordPress Plugin Handbook: https://developer.wordpress.org/plugins/
- WordPress Coding Standards: https://developer.wordpress.org/coding-standards/
- WordPress Security: https://developer.wordpress.org/apis/security/
- Plugin Review Guidelines: https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/

