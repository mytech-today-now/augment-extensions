# Complete WordPress Plugin Example

This example shows a complete WordPress plugin development workflow from start to finish using OpenSpec and Beads.

## Scenario

Building a "Simple Contact Form" WordPress plugin that allows users to submit contact messages through a form on the frontend, with admin management capabilities.

## Plugin Requirements

- **Plugin Name**: Simple Contact Form
- **Plugin Slug**: simple-contact-form
- **Text Domain**: simple-contact-form
- **Minimum WordPress**: 6.0
- **PHP Version**: 7.4+
- **Features**:
  - Frontend contact form with name, email, subject, message fields
  - Admin page to view submitted messages
  - Email notifications to site admin
  - AJAX form submission
  - Security: nonces, sanitization, escaping, capability checks

## Directory Structure

```
simple-contact-form/
├── simple-contact-form.php          # Main plugin file
├── readme.txt                        # WordPress.org readme
├── uninstall.php                     # Cleanup on uninstall
├── includes/
│   ├── class-contact-form.php       # Core form logic
│   ├── class-contact-message.php    # Message model
│   └── class-email-handler.php      # Email sending
├── admin/
│   ├── class-admin.php              # Admin interface
│   ├── css/
│   │   └── admin.css
│   └── js/
│       └── admin.js
├── public/
│   ├── class-public.php             # Frontend display
│   ├── css/
│   │   └── public.css
│   └── js/
│       └── public.js
├── tests/
│   ├── bootstrap.php
│   ├── test-contact-form.php
│   └── test-email-handler.php
└── languages/
    └── simple-contact-form.pot
```

## Step 1: Initialize OpenSpec

```bash
# Create OpenSpec directory structure
mkdir -p openspec/specs/plugin-features
mkdir -p openspec/changes
```

## Step 2: Create OpenSpec Specification

**File**: `openspec/specs/plugin-features/contact-form.md`

```markdown
---
id: plugin-features/contact-form
status: active
relatedTasks: []
---

# Simple Contact Form Plugin

## Overview
A WordPress plugin that provides a simple contact form with admin management.

## Requirements

### Functional Requirements
- Display contact form via shortcode `[simple_contact_form]`
- Collect: name, email, subject, message
- Store submissions in custom database table
- Send email notification to admin on submission
- Admin page to view/delete submissions
- AJAX form submission with loading state

### Security Requirements
- Nonce verification for form submission
- Capability check: `manage_options` for admin page
- Sanitize all inputs using WordPress functions
- Escape all outputs
- Validate email addresses
- Rate limiting: max 3 submissions per IP per hour

### Performance Requirements
- Database queries optimized with indexes
- AJAX for form submission (no page reload)
- Conditional asset loading (only load on pages with shortcode)

## User Stories

**As a** site visitor
**I want** to submit a contact message
**So that** I can communicate with the site owner

**As a** site admin
**I want** to view submitted messages
**So that** I can respond to inquiries

## Technical Approach

### Database Schema
Custom table: `wp_simple_contact_messages`
- id (bigint, primary key, auto_increment)
- name (varchar 255)
- email (varchar 255)
- subject (varchar 255)
- message (text)
- ip_address (varchar 45)
- submitted_at (datetime)
- status (varchar 20, default 'unread')

### WordPress Integration
- Shortcode: `simple_contact_form`
- Admin menu: Tools > Contact Messages
- AJAX action: `simple_contact_form_submit`
- Activation hook: create database table
- Uninstall hook: remove database table and options

### Files to Create
- Main plugin file with header
- Core classes for form, message, email
- Admin interface class
- Frontend display class
- CSS/JS assets
- Unit tests
```

## Step 3: Create Beads Epic and Tasks

```bash
# Create epic
bd create "Build Simple Contact Form Plugin" -p 0 --type epic --label wordpress --label plugin
# Returns: bd-scf

# Database setup
bd create "Create database schema" -p 0 --parent bd-scf --label database
# Returns: bd-scf.1

# Core implementation
bd create "Create ContactForm core class" -p 1 --parent bd-scf --label implementation
# Returns: bd-scf.2

bd create "Create ContactMessage model class" -p 1 --parent bd-scf --label implementation
# Returns: bd-scf.3

bd create "Create EmailHandler class" -p 1 --parent bd-scf --label implementation
# Returns: bd-scf.4

# Admin interface
bd create "Create admin interface" -p 1 --parent bd-scf --label admin
# Returns: bd-scf.5

bd create "Add admin CSS/JS" -p 1 --parent bd-scf --label admin
# Returns: bd-scf.6

# Frontend
bd create "Create frontend form display" -p 1 --parent bd-scf --label frontend
# Returns: bd-scf.7

bd create "Add AJAX form submission" -p 1 --parent bd-scf --label frontend --label ajax
# Returns: bd-scf.8

bd create "Add frontend CSS/JS" -p 1 --parent bd-scf --label frontend
# Returns: bd-scf.9

# Security
bd create "Add nonce verification" -p 1 --parent bd-scf --label security
# Returns: bd-scf.10

bd create "Add input sanitization" -p 1 --parent bd-scf --label security
# Returns: bd-scf.11

bd create "Add output escaping" -p 1 --parent bd-scf --label security
# Returns: bd-scf.12

bd create "Add rate limiting" -p 1 --parent bd-scf --label security
# Returns: bd-scf.13

# Testing
bd create "Write unit tests" -p 1 --parent bd-scf --label testing
# Returns: bd-scf.14

bd create "Manual testing in WordPress" -p 2 --parent bd-scf --label testing
# Returns: bd-scf.15
```

## Step 4: Add Task Dependencies

```bash
# Core classes depend on database
bd dep add bd-scf.2 bd-scf.1
bd dep add bd-scf.3 bd-scf.1
bd dep add bd-scf.4 bd-scf.1

# Admin depends on core classes
bd dep add bd-scf.5 bd-scf.3
bd dep add bd-scf.6 bd-scf.5

# Frontend depends on core classes
bd dep add bd-scf.7 bd-scf.2
bd dep add bd-scf.8 bd-scf.7
bd dep add bd-scf.9 bd-scf.7

# Security tasks depend on implementation
bd dep add bd-scf.10 bd-scf.8
bd dep add bd-scf.11 bd-scf.2
bd dep add bd-scf.12 bd-scf.5
bd dep add bd-scf.13 bd-scf.8

# Testing depends on everything
bd dep add bd-scf.14 bd-scf.13
bd dep add bd-scf.15 bd-scf.14
```

## Step 5: Implementation Workflow

### Task bd-scf.1: Create Database Schema

```bash
bd update bd-scf.1 --status in_progress
```

**File**: `includes/class-contact-message.php` (database setup)

```php
<?php
class Simple_Contact_Message {
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_messages';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            subject varchar(255) NOT NULL,
            message text NOT NULL,
            ip_address varchar(45) NOT NULL,
            submitted_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            status varchar(20) DEFAULT 'unread' NOT NULL,
            PRIMARY KEY  (id),
            KEY email (email),
            KEY submitted_at (submitted_at),
            KEY status (status)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    public static function drop_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_messages';
        $wpdb->query("DROP TABLE IF EXISTS $table_name");
    }
}
```

**File**: `simple-contact-form.php` (activation hook)

```php
<?php
/**
 * Plugin Name: Simple Contact Form
 * Description: A simple contact form with admin management
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL-2.0+
 * Text Domain: simple-contact-form
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SIMPLE_CONTACT_FORM_VERSION', '1.0.0');
define('SIMPLE_CONTACT_FORM_PATH', plugin_dir_path(__FILE__));

// Activation hook
register_activation_hook(__FILE__, 'simple_contact_form_activate');
function simple_contact_form_activate() {
    require_once SIMPLE_CONTACT_FORM_PATH . 'includes/class-contact-message.php';
    Simple_Contact_Message::create_table();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'simple_contact_form_deactivate');
function simple_contact_form_deactivate() {
    // Cleanup if needed
}
```

**File**: `uninstall.php`

```php
<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . 'includes/class-contact-message.php';
Simple_Contact_Message::drop_table();

// Delete options
delete_option('simple_contact_form_version');
```

```bash
bd comment bd-scf.1 "Created database schema with indexes for performance"
bd close bd-scf.1
```

### Task bd-scf.2: Create ContactForm Core Class

```bash
bd ready  # Shows bd-scf.2, bd-scf.3, bd-scf.4 are ready
bd update bd-scf.2 --status in_progress
```

**File**: `includes/class-contact-form.php`

```php
<?php
class Simple_Contact_Form {
    private $message_model;
    private $email_handler;

    public function __construct() {
        $this->message_model = new Simple_Contact_Message();
        $this->email_handler = new Simple_Contact_Email_Handler();
    }

    public function init() {
        add_shortcode('simple_contact_form', array($this, 'render_form'));
        add_action('wp_ajax_simple_contact_form_submit', array($this, 'handle_submission'));
        add_action('wp_ajax_nopriv_simple_contact_form_submit', array($this, 'handle_submission'));
    }

    public function render_form($atts) {
        ob_start();
        include SIMPLE_CONTACT_FORM_PATH . 'public/partials/contact-form.php';
        return ob_get_clean();
    }

    public function handle_submission() {
        // Verify nonce
        if (!check_ajax_referer('simple_contact_form_nonce', 'nonce', false)) {
            wp_send_json_error(array('message' => 'Security check failed'));
        }

        // Rate limiting check
        if (!$this->check_rate_limit()) {
            wp_send_json_error(array('message' => 'Too many submissions. Please try again later.'));
        }

        // Sanitize inputs
        $name = sanitize_text_field($_POST['name']);
        $email = sanitize_email($_POST['email']);
        $subject = sanitize_text_field($_POST['subject']);
        $message = sanitize_textarea_field($_POST['message']);

        // Validate
        if (empty($name) || empty($email) || empty($subject) || empty($message)) {
            wp_send_json_error(array('message' => 'All fields are required'));
        }

        if (!is_email($email)) {
            wp_send_json_error(array('message' => 'Invalid email address'));
        }

        // Save to database
        $message_id = $this->message_model->save(array(
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'message' => $message,
            'ip_address' => $this->get_client_ip()
        ));

        if ($message_id) {
            // Send email notification
            $this->email_handler->send_notification($message_id);
            wp_send_json_success(array('message' => 'Thank you! Your message has been sent.'));
        } else {
            wp_send_json_error(array('message' => 'Failed to save message. Please try again.'));
        }
    }

    private function check_rate_limit() {
        $ip = $this->get_client_ip();
        $count = $this->message_model->count_recent_by_ip($ip, 1); // 1 hour
        return $count < 3; // Max 3 per hour
    }

    private function get_client_ip() {
        $ip = '';
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return sanitize_text_field($ip);
    }
}
```

```bash
bd comment bd-scf.2 "Created ContactForm class with AJAX handler and rate limiting"
bd close bd-scf.2
```

## Step 6: Continue Implementation

Following the same pattern, implement remaining tasks:

- **bd-scf.3**: ContactMessage model with CRUD operations
- **bd-scf.4**: EmailHandler for sending notifications
- **bd-scf.5**: Admin interface to view/delete messages
- **bd-scf.6**: Admin CSS/JS for styling and interactions
- **bd-scf.7**: Frontend form template
- **bd-scf.8**: AJAX form submission JavaScript
- **bd-scf.9**: Frontend CSS for form styling
- **bd-scf.10-13**: Security hardening
- **bd-scf.14**: Unit tests with PHPUnit
- **bd-scf.15**: Manual testing

## Step 7: Testing

```bash
# Run unit tests
cd wp-content/plugins/simple-contact-form
./vendor/bin/phpunit

# Manual testing checklist
bd comment bd-scf.15 "Testing checklist:
- ✓ Form displays correctly via shortcode
- ✓ AJAX submission works without page reload
- ✓ Email notifications sent to admin
- ✓ Messages saved to database
- ✓ Admin page displays messages
- ✓ Rate limiting prevents spam
- ✓ Security: nonces verified
- ✓ Security: inputs sanitized
- ✓ Security: outputs escaped
- ✓ Works with different themes
- ✓ Works on mobile devices"

bd close bd-scf.15
```

## Step 8: Close Epic

```bash
bd close bd-scf
```

## Final Plugin Structure

```
simple-contact-form/
├── simple-contact-form.php          ✓ Created
├── readme.txt                        ✓ Created
├── uninstall.php                     ✓ Created
├── includes/
│   ├── class-contact-form.php       ✓ Created
│   ├── class-contact-message.php    ✓ Created
│   └── class-email-handler.php      ✓ Created
├── admin/
│   ├── class-admin.php              ✓ Created
│   ├── css/admin.css                ✓ Created
│   └── js/admin.js                  ✓ Created
├── public/
│   ├── class-public.php             ✓ Created
│   ├── partials/contact-form.php    ✓ Created
│   ├── css/public.css               ✓ Created
│   └── js/public.js                 ✓ Created
├── tests/
│   ├── bootstrap.php                ✓ Created
│   ├── test-contact-form.php        ✓ Created
│   └── test-email-handler.php       ✓ Created
└── languages/
    └── simple-contact-form.pot      ✓ Created
```

## AI Agent Workflow Summary

### Creating the Plugin

```
Create a WordPress plugin called "Simple Contact Form" that allows users to submit contact messages.

Requirements:
- Plugin slug: simple-contact-form
- Text domain: simple-contact-form
- Minimum WordPress version: 6.0
- PHP version: 7.4+

Features:
- Frontend contact form (name, email, subject, message)
- Admin page to view submissions
- Email notifications
- AJAX submission
- Rate limiting (3 per hour per IP)

Use object-oriented architecture with separate classes for form, message model, and email handling.
Follow WordPress security best practices: nonces, sanitization, escaping, capability checks.
```

### Implementation Approach

1. **Create OpenSpec spec** defining requirements
2. **Break down into Beads tasks** with dependencies
3. **Implement incrementally** following task order
4. **Test thoroughly** with unit and manual tests
5. **Document progress** in Beads comments
6. **Close tasks** as completed

## Key Takeaways

- **OpenSpec** provides clear requirements and technical approach
- **Beads** tracks implementation progress with dependencies
- **Security-first** approach with WordPress best practices
- **Incremental development** with testable milestones
- **Complete documentation** through Beads comments and OpenSpec specs

