# Security Audit Workflow Example

This example demonstrates a complete security audit workflow for a WordPress plugin using OpenSpec and Beads.

## Scenario

Performing a comprehensive security audit on the "Simple Contact Form" plugin before submitting to WordPress.org.

## Plugin Context

**Plugin**: Simple Contact Form
**Version**: 1.0.0
**Features**:
- Frontend contact form
- Admin page to view submissions
- Email notifications
- AJAX form submission
- Custom fields support

**Security Concerns**:
- Form submissions (CSRF, XSS)
- Admin actions (capability checks)
- Database operations (SQL injection)
- File operations (if any)
- AJAX handlers (authentication, authorization)

## Workflow Steps

### Step 1: Create OpenSpec Security Audit Spec

**File**: `openspec/specs/security/contact-form-audit.md`

```markdown
---
id: security/contact-form-audit
status: active
relatedTasks: []
---

# Security Audit: Simple Contact Form

## Overview
Comprehensive security audit to identify and fix vulnerabilities before WordPress.org submission.

## Audit Scope

### Areas to Audit
1. **CSRF Protection**: All forms and AJAX handlers
2. **XSS Prevention**: All output escaping
3. **SQL Injection**: All database queries
4. **Authentication**: User identity verification
5. **Authorization**: Capability checks
6. **Input Validation**: All user inputs
7. **File Operations**: File uploads/downloads (if applicable)
8. **API Security**: REST API endpoints (if applicable)

### Security Standards
- OWASP Top 10 compliance
- WordPress VIP coding standards
- WordPress.org plugin guidelines

## Audit Requirements

### Requirement: CSRF Protection
ALL forms and state-changing operations MUST be protected against CSRF attacks.

#### Scenario: Form submission
- GIVEN a form exists
- WHEN the form is submitted
- THEN a valid nonce MUST be present
- AND the nonce MUST be verified before processing

#### Scenario: AJAX request
- GIVEN an AJAX handler exists
- WHEN an AJAX request is made
- THEN a valid nonce MUST be included
- AND verified with `check_ajax_referer()`

### Requirement: XSS Prevention
ALL output MUST be properly escaped based on context.

#### Scenario: HTML output
- WHEN outputting user data in HTML
- THEN use `esc_html()` or `esc_attr()`

#### Scenario: URL output
- WHEN outputting URLs
- THEN use `esc_url()`

#### Scenario: JavaScript output
- WHEN outputting data in JavaScript
- THEN use `esc_js()` or `wp_json_encode()`

### Requirement: SQL Injection Prevention
ALL database queries MUST use prepared statements.

#### Scenario: Custom query
- WHEN executing a custom database query
- THEN use `$wpdb->prepare()` with placeholders
- AND use correct placeholder types (%s, %d, %f)

### Requirement: Authorization
ALL admin actions MUST check user capabilities.

#### Scenario: Admin page access
- WHEN rendering an admin page
- THEN verify user has required capability
- AND deny access if capability missing

#### Scenario: Data modification
- WHEN modifying data
- THEN verify user has permission
- AND log the action

## Testing Requirements

### Automated Testing
- Run PHPCS with WordPress-VIP-Go standard
- Run security scanner (e.g., WPScan)
- Check for common vulnerability patterns

### Manual Testing
- Review all forms for nonce verification
- Review all output for escaping
- Review all database queries for prepared statements
- Review all admin actions for capability checks
- Test with different user roles

## Remediation Requirements

### Critical Issues
- MUST be fixed before submission
- Examples: SQL injection, XSS, CSRF

### High Issues
- SHOULD be fixed before submission
- Examples: Missing capability checks, weak validation

### Medium Issues
- SHOULD be fixed or documented
- Examples: Suboptimal escaping, missing sanitization

### Low Issues
- MAY be fixed or documented
- Examples: Code style, minor improvements
```

### Step 2: Create Beads Tasks for Security Audit

```bash
# Create epic for security audit
bd create "Security Audit: Simple Contact Form" -p 0 --type epic --label security --label audit
# Returns: bd-sa

# Automated scanning
bd create "Run PHPCS with WordPress-VIP-Go standard" -p 0 --parent bd-sa --label automated
# Returns: bd-sa.1

bd create "Run WPScan security scanner" -p 0 --parent bd-sa --label automated
# Returns: bd-sa.2

# Manual review - CSRF
bd create "Audit all forms for nonce verification" -p 1 --parent bd-sa --label csrf --label manual
# Returns: bd-sa.3

bd create "Audit all AJAX handlers for nonce verification" -p 1 --parent bd-sa --label csrf --label manual
# Returns: bd-sa.4

# Manual review - XSS
bd create "Audit all output for proper escaping" -p 1 --parent bd-sa --label xss --label manual
# Returns: bd-sa.5

bd create "Audit all admin pages for escaping" -p 1 --parent bd-sa --label xss --label manual
# Returns: bd-sa.6

# Manual review - SQL Injection
bd create "Audit all database queries for prepared statements" -p 1 --parent bd-sa --label sql --label manual
# Returns: bd-sa.7

# Manual review - Authorization
bd create "Audit all admin actions for capability checks" -p 1 --parent bd-sa --label authz --label manual
# Returns: bd-sa.8

bd create "Audit all data modifications for capability checks" -p 1 --parent bd-sa --label authz --label manual
# Returns: bd-sa.9

# Remediation
bd create "Fix critical security issues" -p 0 --parent bd-sa --label remediation --label critical
# Returns: bd-sa.10

bd create "Fix high security issues" -p 1 --parent bd-sa --label remediation --label high
# Returns: bd-sa.11

bd create "Fix medium security issues" -p 2 --parent bd-sa --label remediation --label medium
# Returns: bd-sa.12

# Documentation
bd create "Document security audit findings" -p 1 --parent bd-sa --label documentation
# Returns: bd-sa.13

bd create "Create security audit report" -p 1 --parent bd-sa --label documentation
# Returns: bd-sa.14
```

### Step 3: Add Task Dependencies

```bash
# Manual reviews can run in parallel after automated scans
bd dep add bd-sa.3 bd-sa.1
bd dep add bd-sa.4 bd-sa.1
bd dep add bd-sa.5 bd-sa.1
bd dep add bd-sa.6 bd-sa.1
bd dep add bd-sa.7 bd-sa.1
bd dep add bd-sa.8 bd-sa.1
bd dep add bd-sa.9 bd-sa.1

# Remediation depends on manual reviews
bd dep add bd-sa.10 bd-sa.3
bd dep add bd-sa.10 bd-sa.4
bd dep add bd-sa.10 bd-sa.5
bd dep add bd-sa.10 bd-sa.6
bd dep add bd-sa.10 bd-sa.7
bd dep add bd-sa.10 bd-sa.8
bd dep add bd-sa.10 bd-sa.9

bd dep add bd-sa.11 bd-sa.10
bd dep add bd-sa.12 bd-sa.11

# Documentation depends on remediation
bd dep add bd-sa.13 bd-sa.12
bd dep add bd-sa.14 bd-sa.13
```

### Step 4: Execute Security Audit

#### Task bd-sa.1: Run PHPCS with WordPress-VIP-Go

```bash
bd update bd-sa.1 --status in_progress
```

**Install and run PHPCS**:

```bash
# Install PHPCS and WordPress standards
composer require --dev squizlabs/php_codesniffer
composer require --dev wp-coding-standards/wpcs
composer require --dev automattic/vipwpcs

# Configure PHPCS
vendor/bin/phpcs --config-set installed_paths vendor/wp-coding-standards/wpcs,vendor/automattic/vipwpcs

# Run security scan
vendor/bin/phpcs --standard=WordPress-VIP-Go --extensions=php --report=summary .
```

**Output example**:

```
FILE: /simple-contact-form/includes/class-contact-form.php
----------------------------------------------------------------------
FOUND 3 ERRORS AND 2 WARNINGS AFFECTING 5 LINES
----------------------------------------------------------------------
 45 | ERROR   | Direct database query without prepare()
 67 | WARNING | Possible XSS vulnerability - output not escaped
 89 | ERROR   | Missing nonce verification
102 | WARNING | Missing capability check
125 | ERROR   | Unsanitized input from $_POST
----------------------------------------------------------------------
```

```bash
bd comment bd-sa.1 "PHPCS scan completed. Found 3 errors and 2 warnings. Issues logged for remediation."
bd close bd-sa.1
```

#### Task bd-sa.2: Run WPScan

```bash
bd update bd-sa.2 --status in_progress
```

**Run WPScan** (if available):

```bash
# Note: WPScan typically scans installed plugins, not source code
# For source code scanning, use PHPCS or manual review
```

```bash
bd comment bd-sa.2 "WPScan not applicable for source code. Using PHPCS results instead."
bd close bd-sa.2
```

#### Task bd-sa.3: Audit Forms for Nonce Verification

```bash
bd ready  # Shows bd-sa.3 is ready
bd update bd-sa.3 --status in_progress
```

**Manual review process**:

1. **Find all forms**:
```bash
grep -r "<form" . --include="*.php"
```

2. **Check each form for nonce**:

**File**: `admin/partials/settings-page.php`

```php
<!-- BEFORE (VULNERABLE) -->
<form method="post" action="">
    <input type="text" name="setting_value" />
    <input type="submit" value="Save" />
</form>

<!-- AFTER (SECURE) -->
<form method="post" action="">
    <?php wp_nonce_field('simple_contact_form_settings', 'scf_settings_nonce'); ?>
    <input type="text" name="setting_value" />
    <input type="submit" value="Save" />
</form>
```

3. **Check form handler for verification**:

**File**: `admin/class-admin.php`

```php
// BEFORE (VULNERABLE)
public function save_settings() {
    if (isset($_POST['setting_value'])) {
        update_option('scf_setting', $_POST['setting_value']);
    }
}

// AFTER (SECURE)
public function save_settings() {
    // Verify nonce
    if (!isset($_POST['scf_settings_nonce']) ||
        !wp_verify_nonce($_POST['scf_settings_nonce'], 'simple_contact_form_settings')) {
        wp_die(__('Security check failed', 'simple-contact-form'));
    }

    // Check capability
    if (!current_user_can('manage_options')) {
        wp_die(__('Insufficient permissions', 'simple-contact-form'));
    }

    // Sanitize and save
    if (isset($_POST['setting_value'])) {
        $value = sanitize_text_field($_POST['setting_value']);
        update_option('scf_setting', $value);
    }
}
```

**Audit findings**:

```bash
bd comment bd-sa.3 "Audit completed. Found 2 forms:
1. Settings form - MISSING nonce (CRITICAL)
2. Contact form - Has nonce ✓

Created remediation task for settings form."
bd close bd-sa.3
```

#### Task bd-sa.4: Audit AJAX Handlers for Nonce Verification

```bash
bd update bd-sa.4 --status in_progress
```

**Find all AJAX handlers**:

```bash
grep -r "wp_ajax" . --include="*.php"
```

**Check each handler**:

**File**: `includes/class-contact-form.php`

```php
// BEFORE (VULNERABLE)
public function handle_submission() {
    $name = $_POST['name'];
    $email = $_POST['email'];
    // ... process submission
}

// AFTER (SECURE)
public function handle_submission() {
    // Verify nonce
    if (!check_ajax_referer('simple_contact_form_nonce', 'nonce', false)) {
        wp_send_json_error(array('message' => 'Security check failed'));
    }

    // Sanitize inputs
    $name = sanitize_text_field($_POST['name']);
    $email = sanitize_email($_POST['email']);

    // ... process submission
}
```

**Check JavaScript nonce inclusion**:

**File**: `public/js/public.js`

```javascript
// BEFORE (VULNERABLE)
jQuery.ajax({
    url: ajaxurl,
    type: 'POST',
    data: {
        action: 'simple_contact_form_submit',
        name: name,
        email: email
    }
});

// AFTER (SECURE)
jQuery.ajax({
    url: scf_ajax.ajax_url,
    type: 'POST',
    data: {
        action: 'simple_contact_form_submit',
        nonce: scf_ajax.nonce,  // Added nonce
        name: name,
        email: email
    }
});
```

**Ensure nonce is localized**:

**File**: `public/class-public.php`

```php
public function enqueue_scripts() {
    wp_enqueue_script('scf-public', plugin_dir_url(__FILE__) . 'js/public.js');

    wp_localize_script('scf-public', 'scf_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('simple_contact_form_nonce')
    ));
}
```

```bash
bd comment bd-sa.4 "Audit completed. Found 1 AJAX handler:
1. Form submission handler - Has nonce verification ✓

All AJAX handlers properly secured."
bd close bd-sa.4
```

#### Task bd-sa.5: Audit Output for Escaping

```bash
bd update bd-sa.5 --status in_progress
```

**Find all echo/print statements**:

```bash
grep -rn "echo " . --include="*.php" | grep -v "esc_"
```

**Check each output**:

**File**: `admin/partials/messages-list.php`

```php
<!-- BEFORE (VULNERABLE) -->
<td><?php echo $message->name; ?></td>
<td><?php echo $message->email; ?></td>
<td><?php echo $message->message; ?></td>

<!-- AFTER (SECURE) -->
<td><?php echo esc_html($message->name); ?></td>
<td><?php echo esc_html($message->email); ?></td>
<td><?php echo esc_html($message->message); ?></td>
```

**URL escaping**:

```php
<!-- BEFORE (VULNERABLE) -->
<a href="<?php echo $delete_url; ?>">Delete</a>

<!-- AFTER (SECURE) -->
<a href="<?php echo esc_url($delete_url); ?>">Delete</a>
```

**Attribute escaping**:

```php
<!-- BEFORE (VULNERABLE) -->
<input type="text" value="<?php echo $value; ?>" />

<!-- AFTER (SECURE) -->
<input type="text" value="<?php echo esc_attr($value); ?>" />
```

```bash
bd comment bd-sa.5 "Audit completed. Found 12 unescaped outputs:
- 8 in admin messages list (HIGH)
- 3 in settings page (HIGH)
- 1 in email template (MEDIUM)

Created remediation tasks."
bd close bd-sa.5
```

#### Task bd-sa.7: Audit Database Queries

```bash
bd update bd-sa.7 --status in_progress
```

**Find all database queries**:

```bash
grep -rn "\$wpdb->" . --include="*.php"
```

**Check each query**:

**File**: `includes/class-contact-message.php`

```php
// BEFORE (VULNERABLE - SQL Injection)
public function get_by_email($email) {
    global $wpdb;
    $table = $wpdb->prefix . 'simple_contact_messages';
    return $wpdb->get_results("SELECT * FROM $table WHERE email = '$email'");
}

// AFTER (SECURE)
public function get_by_email($email) {
    global $wpdb;
    $table = $wpdb->prefix . 'simple_contact_messages';
    return $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM $table WHERE email = %s", $email)
    );
}
```

**Check for correct placeholder types**:

```php
// CORRECT
$wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id);           // %d for integers
$wpdb->prepare("SELECT * FROM $table WHERE name = %s", $name);       // %s for strings
$wpdb->prepare("SELECT * FROM $table WHERE price = %f", $price);     // %f for floats

// INCORRECT
$wpdb->prepare("SELECT * FROM $table WHERE id = %s", $id);           // Wrong type
$wpdb->prepare("SELECT * FROM $table WHERE id = '$id'");             // No placeholder
```

```bash
bd comment bd-sa.7 "Audit completed. Found 5 database queries:
- 2 using prepare() correctly ✓
- 3 missing prepare() (CRITICAL)

Created remediation task for unprepared queries."
bd close bd-sa.7
```

### Step 5: Remediation

#### Task bd-sa.10: Fix Critical Issues

```bash
bd ready  # Shows bd-sa.10 is ready
bd update bd-sa.10 --status in_progress
```

**Critical issues to fix**:

1. ✅ Add nonce to settings form
2. ✅ Add nonce verification to settings handler
3. ✅ Add prepared statements to all database queries

**Implementation**:

```bash
# Fix settings form nonce
# Fix database queries with prepare()
# Test all fixes
```

```bash
bd comment bd-sa.10 "Fixed all 3 critical issues:
1. Added nonce to settings form
2. Added nonce verification to settings handler
3. Converted all database queries to use prepare()

All critical vulnerabilities resolved."
bd close bd-sa.10
```

### Step 6: Create Security Audit Report

#### Task bd-sa.14: Create Audit Report

```bash
bd update bd-sa.14 --status in_progress
```

**File**: `SECURITY-AUDIT-REPORT.md`

```markdown
# Security Audit Report: Simple Contact Form

**Date**: 2024-01-26
**Version**: 1.0.0
**Auditor**: AI Agent

## Executive Summary

Comprehensive security audit completed. All critical and high-severity issues have been resolved. Plugin is ready for WordPress.org submission.

## Findings Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 3     | 3     | 0         |
| High     | 12    | 12    | 0         |
| Medium   | 1     | 1     | 0         |
| Low      | 0     | 0     | 0         |

## Critical Issues (All Fixed)

### 1. Missing Nonce Verification in Settings Form
- **File**: `admin/partials/settings-page.php`
- **Issue**: Form submission without CSRF protection
- **Fix**: Added `wp_nonce_field()` and verification
- **Status**: ✅ Fixed

### 2. SQL Injection in Email Query
- **File**: `includes/class-contact-message.php`
- **Issue**: Direct variable insertion in SQL query
- **Fix**: Converted to `$wpdb->prepare()` with %s placeholder
- **Status**: ✅ Fixed

### 3. SQL Injection in Date Range Query
- **File**: `includes/class-contact-message.php`
- **Issue**: Unprepared query with user input
- **Fix**: Converted to `$wpdb->prepare()` with %s placeholders
- **Status**: ✅ Fixed

## High Issues (All Fixed)

### 4-15. Unescaped Output in Admin Pages
- **Files**: Various admin templates
- **Issue**: XSS vulnerability from unescaped user data
- **Fix**: Added appropriate escaping (`esc_html()`, `esc_attr()`, `esc_url()`)
- **Status**: ✅ Fixed (all 12 instances)

## Medium Issues (All Fixed)

### 16. Unescaped Output in Email Template
- **File**: `includes/class-email-handler.php`
- **Issue**: Potential XSS in email content
- **Fix**: Added `esc_html()` to email template
- **Status**: ✅ Fixed

## Security Checklist

- [x] All forms have nonce verification
- [x] All AJAX handlers verify nonces
- [x] All admin actions check capabilities
- [x] All user input is sanitized
- [x] All output is escaped
- [x] All database queries use prepared statements
- [x] No eval() or exec() usage
- [x] No unserialize() on user input
- [x] File uploads properly validated (N/A - no file uploads)
- [x] No external API calls without validation

## Recommendations

1. ✅ Implement rate limiting for form submissions (already implemented)
2. ✅ Add input validation for email addresses (already implemented)
3. ✅ Log security events (already implemented)
4. Consider adding honeypot field for spam prevention
5. Consider implementing reCAPTCHA for additional protection

## Conclusion

The Simple Contact Form plugin has passed comprehensive security audit. All critical and high-severity vulnerabilities have been resolved. The plugin follows WordPress security best practices and is ready for submission to WordPress.org.
```

```bash
bd comment bd-sa.14 "Created comprehensive security audit report. All issues documented and resolved."
bd close bd-sa.14
bd close bd-sa
```

## AI Agent Workflow

### Initial Prompt

```
Perform a comprehensive security audit on the Simple Contact Form plugin.

Audit scope:
- CSRF protection (nonces)
- XSS prevention (output escaping)
- SQL injection (prepared statements)
- Authorization (capability checks)
- Input validation and sanitization

Process:
1. Run automated scans (PHPCS with WordPress-VIP-Go)
2. Manual review of all forms, AJAX handlers, database queries, and output
3. Document all findings with severity ratings
4. Fix all critical and high-severity issues
5. Create security audit report

Provide detailed findings with file names, line numbers, and recommended fixes.
```

### Implementation Approach

1. **Create OpenSpec security audit spec** with requirements
2. **Break down into Beads tasks** for systematic review
3. **Run automated scans** to identify common issues
4. **Manual review** of critical security areas
5. **Prioritize remediation** (critical → high → medium → low)
6. **Fix all issues** with secure coding practices
7. **Document findings** in comprehensive report
8. **Verify fixes** with re-scan and testing

## Key Takeaways

- **Automated scanning** catches many issues but manual review is essential
- **Systematic approach** ensures no security areas are missed
- **Prioritization** focuses effort on critical vulnerabilities first
- **Documentation** provides audit trail and learning resource
- **WordPress security functions** (nonces, escaping, prepare) are mandatory
- **Security audit** should be performed before every release
- **Beads tracking** ensures all findings are addressed

