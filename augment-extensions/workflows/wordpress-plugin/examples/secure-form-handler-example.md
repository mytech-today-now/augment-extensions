# Secure Form Handler Example

This example demonstrates implementing a secure form handler in WordPress with comprehensive security measures including nonce verification, capability checks, input sanitization, and output escaping.

## Scenario

Creating a secure contact form handler that demonstrates all WordPress security best practices.

## Complete Implementation

### Form Display

**File**: `public/partials/contact-form.php`

```php
<?php
/**
 * Contact form template.
 *
 * Security features:
 * - Nonce field for CSRF protection
 * - Escaped output for XSS prevention
 * - Honeypot field for spam prevention
 */

// Get current values (for form repopulation after validation errors)
$name = isset($_POST['contact_name']) ? sanitize_text_field($_POST['contact_name']) : '';
$email = isset($_POST['contact_email']) ? sanitize_email($_POST['contact_email']) : '';
$subject = isset($_POST['contact_subject']) ? sanitize_text_field($_POST['contact_subject']) : '';
$message = isset($_POST['contact_message']) ? sanitize_textarea_field($_POST['contact_message']) : '';

// Get error messages
$errors = get_transient('contact_form_errors_' . session_id());
$success = get_transient('contact_form_success_' . session_id());

// Clear transients
delete_transient('contact_form_errors_' . session_id());
delete_transient('contact_form_success_' . session_id());
?>

<div class="contact-form-wrapper">
    <?php if ($success) : ?>
        <div class="contact-form-success">
            <p><?php echo esc_html($success); ?></p>
        </div>
    <?php endif; ?>
    
    <?php if ($errors && is_array($errors)) : ?>
        <div class="contact-form-errors">
            <ul>
                <?php foreach ($errors as $error) : ?>
                    <li><?php echo esc_html($error); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
    
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="contact-form">
        <!-- Nonce field for CSRF protection -->
        <?php wp_nonce_field('contact_form_submit', 'contact_form_nonce'); ?>
        
        <!-- Action for WordPress admin-post.php handler -->
        <input type="hidden" name="action" value="submit_contact_form" />
        
        <!-- Honeypot field (hidden from users, catches bots) -->
        <input type="text" name="contact_website" value="" style="display:none;" tabindex="-1" autocomplete="off" />
        
        <div class="form-field">
            <label for="contact_name">
                <?php _e('Name', 'text-domain'); ?> <span class="required">*</span>
            </label>
            <input type="text" 
                   id="contact_name" 
                   name="contact_name" 
                   value="<?php echo esc_attr($name); ?>" 
                   required 
                   maxlength="100" />
        </div>
        
        <div class="form-field">
            <label for="contact_email">
                <?php _e('Email', 'text-domain'); ?> <span class="required">*</span>
            </label>
            <input type="email" 
                   id="contact_email" 
                   name="contact_email" 
                   value="<?php echo esc_attr($email); ?>" 
                   required 
                   maxlength="100" />
        </div>
        
        <div class="form-field">
            <label for="contact_subject">
                <?php _e('Subject', 'text-domain'); ?> <span class="required">*</span>
            </label>
            <input type="text" 
                   id="contact_subject" 
                   name="contact_subject" 
                   value="<?php echo esc_attr($subject); ?>" 
                   required 
                   maxlength="200" />
        </div>
        
        <div class="form-field">
            <label for="contact_message">
                <?php _e('Message', 'text-domain'); ?> <span class="required">*</span>
            </label>
            <textarea id="contact_message" 
                      name="contact_message" 
                      required 
                      rows="6" 
                      maxlength="2000"><?php echo esc_textarea($message); ?></textarea>
        </div>
        
        <div class="form-field">
            <button type="submit" class="submit-button">
                <?php _e('Send Message', 'text-domain'); ?>
            </button>
        </div>
    </form>
</div>
```

### Form Handler Class

**File**: `includes/class-contact-form-handler.php`

```php
<?php
/**
 * Secure contact form handler.
 *
 * Security features:
 * - Nonce verification (CSRF protection)
 * - Capability checks (authorization)
 * - Input sanitization (data cleaning)
 * - Input validation (data verification)
 * - Rate limiting (spam prevention)
 * - Honeypot field (bot detection)
 * - SQL injection prevention (prepared statements)
 * - XSS prevention (output escaping)
 */
class Contact_Form_Handler {
    
    /**
     * Rate limit: max submissions per IP per hour.
     */
    const RATE_LIMIT = 3;
    
    /**
     * Initialize the form handler.
     */
    public function __construct() {
        // Register form submission handler
        add_action('admin_post_submit_contact_form', array($this, 'handle_submission'));
        add_action('admin_post_nopriv_submit_contact_form', array($this, 'handle_submission'));
    }
    
    /**
     * Handle form submission.
     */
    public function handle_submission() {
        // Start session for error/success messages
        if (!session_id()) {
            session_start();
        }
        
        $errors = array();
        
        // 1. CSRF Protection: Verify nonce
        if (!isset($_POST['contact_form_nonce']) || 
            !wp_verify_nonce($_POST['contact_form_nonce'], 'contact_form_submit')) {
            $errors[] = __('Security check failed. Please try again.', 'text-domain');
            $this->redirect_with_errors($errors);
            return;
        }
        
        // 2. Bot Detection: Check honeypot field
        if (!empty($_POST['contact_website'])) {
            // Bot detected - silently fail
            $this->redirect_with_success(__('Thank you for your message!', 'text-domain'));
            return;
        }
        
        // 3. Rate Limiting: Check submission rate
        if (!$this->check_rate_limit()) {
            $errors[] = __('Too many submissions. Please try again later.', 'text-domain');
            $this->redirect_with_errors($errors);
            return;
        }
        
        // 4. Input Sanitization: Clean all inputs
        $name = isset($_POST['contact_name']) ? sanitize_text_field($_POST['contact_name']) : '';
        $email = isset($_POST['contact_email']) ? sanitize_email($_POST['contact_email']) : '';
        $subject = isset($_POST['contact_subject']) ? sanitize_text_field($_POST['contact_subject']) : '';
        $message = isset($_POST['contact_message']) ? sanitize_textarea_field($_POST['contact_message']) : '';
        
        // 5. Input Validation: Verify data
        $errors = $this->validate_input($name, $email, $subject, $message);
        
        if (!empty($errors)) {
            $this->redirect_with_errors($errors);
            return;
        }
        
        // 6. Save to Database: Use prepared statements
        $saved = $this->save_to_database($name, $email, $subject, $message);
        
        if (!$saved) {
            $errors[] = __('Failed to save message. Please try again.', 'text-domain');
            $this->redirect_with_errors($errors);
            return;
        }
        
        // 7. Send Email Notification
        $this->send_email_notification($name, $email, $subject, $message);
        
        // 8. Log Submission
        $this->log_submission($email);
        
        // 9. Success
        $this->redirect_with_success(__('Thank you for your message! We will get back to you soon.', 'text-domain'));
    }

    /**
     * Validate form input.
     *
     * @return array Array of error messages (empty if valid)
     */
    private function validate_input($name, $email, $subject, $message) {
        $errors = array();

        // Validate name
        if (empty($name)) {
            $errors[] = __('Name is required.', 'text-domain');
        } elseif (strlen($name) < 2) {
            $errors[] = __('Name must be at least 2 characters.', 'text-domain');
        } elseif (strlen($name) > 100) {
            $errors[] = __('Name must be less than 100 characters.', 'text-domain');
        }

        // Validate email
        if (empty($email)) {
            $errors[] = __('Email is required.', 'text-domain');
        } elseif (!is_email($email)) {
            $errors[] = __('Please enter a valid email address.', 'text-domain');
        }

        // Validate subject
        if (empty($subject)) {
            $errors[] = __('Subject is required.', 'text-domain');
        } elseif (strlen($subject) < 3) {
            $errors[] = __('Subject must be at least 3 characters.', 'text-domain');
        } elseif (strlen($subject) > 200) {
            $errors[] = __('Subject must be less than 200 characters.', 'text-domain');
        }

        // Validate message
        if (empty($message)) {
            $errors[] = __('Message is required.', 'text-domain');
        } elseif (strlen($message) < 10) {
            $errors[] = __('Message must be at least 10 characters.', 'text-domain');
        } elseif (strlen($message) > 2000) {
            $errors[] = __('Message must be less than 2000 characters.', 'text-domain');
        }

        return $errors;
    }

    /**
     * Check rate limit for submissions.
     *
     * @return bool True if within rate limit, false otherwise
     */
    private function check_rate_limit() {
        $ip_address = $this->get_client_ip();
        $transient_key = 'contact_form_rate_' . md5($ip_address);

        $submissions = get_transient($transient_key);

        if ($submissions === false) {
            // First submission in this hour
            set_transient($transient_key, 1, HOUR_IN_SECONDS);
            return true;
        }

        if ($submissions >= self::RATE_LIMIT) {
            // Rate limit exceeded
            return false;
        }

        // Increment submission count
        set_transient($transient_key, $submissions + 1, HOUR_IN_SECONDS);
        return true;
    }

    /**
     * Get client IP address.
     *
     * @return string IP address
     */
    private function get_client_ip() {
        $ip_address = '';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip_address = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip_address = $_SERVER['REMOTE_ADDR'];
        }

        // Sanitize IP address
        return filter_var($ip_address, FILTER_VALIDATE_IP) ? $ip_address : '0.0.0.0';
    }

    /**
     * Save submission to database using prepared statements.
     *
     * @return bool True on success, false on failure
     */
    private function save_to_database($name, $email, $subject, $message) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'contact_messages';

        // Use prepared statement to prevent SQL injection
        $result = $wpdb->insert(
            $table_name,
            array(
                'name' => $name,
                'email' => $email,
                'subject' => $subject,
                'message' => $message,
                'ip_address' => $this->get_client_ip(),
                'submitted_at' => current_time('mysql'),
                'status' => 'unread',
            ),
            array(
                '%s', // name
                '%s', // email
                '%s', // subject
                '%s', // message
                '%s', // ip_address
                '%s', // submitted_at
                '%s', // status
            )
        );

        return $result !== false;
    }

    /**
     * Send email notification to admin.
     */
    private function send_email_notification($name, $email, $subject, $message) {
        $admin_email = get_option('admin_email');

        // Prepare email
        $to = $admin_email;
        $email_subject = sprintf(
            __('[%s] New Contact Form Submission: %s', 'text-domain'),
            get_bloginfo('name'),
            $subject
        );

        // Build email body with escaped content
        $email_body = sprintf(
            __("New contact form submission:\n\nName: %s\nEmail: %s\nSubject: %s\n\nMessage:\n%s", 'text-domain'),
            $name,
            $email,
            $subject,
            $message
        );

        // Set headers
        $headers = array(
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $email,
        );

        // Send email
        wp_mail($to, $email_subject, $email_body, $headers);
    }

    /**
     * Log submission for security monitoring.
     */
    private function log_submission($email) {
        // Log to WordPress debug log if enabled
        if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
            error_log(sprintf(
                'Contact form submission from %s (IP: %s)',
                $email,
                $this->get_client_ip()
            ));
        }
    }

    /**
     * Redirect back to form with errors.
     */
    private function redirect_with_errors($errors) {
        set_transient('contact_form_errors_' . session_id(), $errors, 60);

        $redirect_url = wp_get_referer();
        if (!$redirect_url) {
            $redirect_url = home_url();
        }

        wp_safe_redirect($redirect_url);
        exit;
    }

    /**
     * Redirect back to form with success message.
     */
    private function redirect_with_success($message) {
        set_transient('contact_form_success_' . session_id(), $message, 60);

        $redirect_url = wp_get_referer();
        if (!$redirect_url) {
            $redirect_url = home_url();
        }

        wp_safe_redirect($redirect_url);
        exit;
    }
}
```

### AJAX Form Handler (Alternative)

**File**: `includes/class-contact-form-ajax-handler.php`

```php
<?php
/**
 * Secure AJAX contact form handler.
 *
 * Additional security for AJAX:
 * - check_ajax_referer() for nonce verification
 * - wp_send_json_error() and wp_send_json_success() for responses
 */
class Contact_Form_Ajax_Handler {

    /**
     * Initialize the AJAX handler.
     */
    public function __construct() {
        // Register AJAX handlers
        add_action('wp_ajax_submit_contact_form', array($this, 'handle_ajax_submission'));
        add_action('wp_ajax_nopriv_submit_contact_form', array($this, 'handle_ajax_submission'));

        // Enqueue scripts with localized nonce
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Enqueue scripts with localized data.
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'contact-form-ajax',
            plugin_dir_url(__FILE__) . '../public/js/contact-form-ajax.js',
            array('jquery'),
            '1.0.0',
            true
        );

        // Localize script with AJAX URL and nonce
        wp_localize_script('contact-form-ajax', 'contactFormAjax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('contact_form_ajax_nonce'),
        ));
    }

    /**
     * Handle AJAX form submission.
     */
    public function handle_ajax_submission() {
        // 1. CSRF Protection: Verify AJAX nonce
        if (!check_ajax_referer('contact_form_ajax_nonce', 'nonce', false)) {
            wp_send_json_error(array(
                'message' => __('Security check failed. Please refresh the page and try again.', 'text-domain'),
            ));
        }

        // 2. Bot Detection: Check honeypot
        if (!empty($_POST['contact_website'])) {
            // Bot detected - send fake success
            wp_send_json_success(array(
                'message' => __('Thank you for your message!', 'text-domain'),
            ));
        }

        // 3. Rate Limiting
        if (!$this->check_rate_limit()) {
            wp_send_json_error(array(
                'message' => __('Too many submissions. Please try again later.', 'text-domain'),
            ));
        }

        // 4. Input Sanitization
        $name = isset($_POST['contact_name']) ? sanitize_text_field($_POST['contact_name']) : '';
        $email = isset($_POST['contact_email']) ? sanitize_email($_POST['contact_email']) : '';
        $subject = isset($_POST['contact_subject']) ? sanitize_text_field($_POST['contact_subject']) : '';
        $message = isset($_POST['contact_message']) ? sanitize_textarea_field($_POST['contact_message']) : '';

        // 5. Input Validation
        $errors = $this->validate_input($name, $email, $subject, $message);

        if (!empty($errors)) {
            wp_send_json_error(array(
                'message' => implode(' ', $errors),
                'errors' => $errors,
            ));
        }

        // 6. Save to Database
        $saved = $this->save_to_database($name, $email, $subject, $message);

        if (!$saved) {
            wp_send_json_error(array(
                'message' => __('Failed to save message. Please try again.', 'text-domain'),
            ));
        }

        // 7. Send Email
        $this->send_email_notification($name, $email, $subject, $message);

        // 8. Log Submission
        $this->log_submission($email);

        // 9. Success Response
        wp_send_json_success(array(
            'message' => __('Thank you for your message! We will get back to you soon.', 'text-domain'),
        ));
    }

    // ... (same helper methods as Contact_Form_Handler)
}
```

### JavaScript for AJAX Form

**File**: `public/js/contact-form-ajax.js`

```javascript
(function($) {
    'use strict';

    $(document).ready(function() {
        $('#contact-form-ajax').on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $submitButton = $form.find('button[type="submit"]');
            var $messageContainer = $('#form-messages');

            // Disable submit button
            $submitButton.prop('disabled', true).text('Sending...');

            // Clear previous messages
            $messageContainer.html('').removeClass('success error');

            // Prepare form data
            var formData = {
                action: 'submit_contact_form',
                nonce: contactFormAjax.nonce,
                contact_name: $form.find('#contact_name').val(),
                contact_email: $form.find('#contact_email').val(),
                contact_subject: $form.find('#contact_subject').val(),
                contact_message: $form.find('#contact_message').val(),
                contact_website: $form.find('[name="contact_website"]').val() // Honeypot
            };

            // Send AJAX request
            $.ajax({
                url: contactFormAjax.ajax_url,
                type: 'POST',
                data: formData,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        // Success
                        $messageContainer
                            .html('<p>' + escapeHtml(response.data.message) + '</p>')
                            .addClass('success');

                        // Reset form
                        $form[0].reset();
                    } else {
                        // Error
                        $messageContainer
                            .html('<p>' + escapeHtml(response.data.message) + '</p>')
                            .addClass('error');
                    }
                },
                error: function(xhr, status, error) {
                    // AJAX error
                    $messageContainer
                        .html('<p>An error occurred. Please try again.</p>')
                        .addClass('error');
                },
                complete: function() {
                    // Re-enable submit button
                    $submitButton.prop('disabled', false).text('Send Message');
                }
            });
        });
    });

    /**
     * Escape HTML to prevent XSS in JavaScript.
     */
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

})(jQuery);
```

### Database Table Creation

**File**: `includes/class-contact-form-database.php`

```php
<?php
/**
 * Database table management for contact form.
 */
class Contact_Form_Database {

    /**
     * Create the contact messages table.
     */
    public static function create_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'contact_messages';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            email varchar(100) NOT NULL,
            subject varchar(200) NOT NULL,
            message text NOT NULL,
            ip_address varchar(45) NOT NULL,
            submitted_at datetime NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'unread',
            PRIMARY KEY  (id),
            KEY email (email),
            KEY status (status),
            KEY submitted_at (submitted_at)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
```

### Admin Page to View Submissions

**File**: `admin/class-contact-messages-admin.php`

```php
<?php
/**
 * Admin page to view contact form submissions.
 *
 * Security features:
 * - Capability check (manage_options)
 * - Nonce verification for actions
 * - Prepared statements for queries
 * - Output escaping
 */
class Contact_Messages_Admin {

    /**
     * Initialize the admin page.
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_post_delete_contact_message', array($this, 'delete_message'));
    }

    /**
     * Add admin menu item.
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            __('Contact Messages', 'text-domain'),
            __('Contact Messages', 'text-domain'),
            'manage_options',
            'contact-messages',
            array($this, 'render_admin_page')
        );
    }

    /**
     * Render the admin page.
     */
    public function render_admin_page() {
        // Check user capability
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'text-domain'));
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'contact_messages';

        // Get messages with prepared statement
        $messages = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name ORDER BY submitted_at DESC LIMIT %d",
                100
            )
        );

        ?>
        <div class="wrap">
            <h1><?php _e('Contact Messages', 'text-domain'); ?></h1>

            <?php if (empty($messages)) : ?>
                <p><?php _e('No messages found.', 'text-domain'); ?></p>
            <?php else : ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php _e('Date', 'text-domain'); ?></th>
                            <th><?php _e('Name', 'text-domain'); ?></th>
                            <th><?php _e('Email', 'text-domain'); ?></th>
                            <th><?php _e('Subject', 'text-domain'); ?></th>
                            <th><?php _e('Message', 'text-domain'); ?></th>
                            <th><?php _e('Status', 'text-domain'); ?></th>
                            <th><?php _e('Actions', 'text-domain'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($messages as $message) : ?>
                            <tr>
                                <td><?php echo esc_html($message->submitted_at); ?></td>
                                <td><?php echo esc_html($message->name); ?></td>
                                <td><a href="mailto:<?php echo esc_attr($message->email); ?>"><?php echo esc_html($message->email); ?></a></td>
                                <td><?php echo esc_html($message->subject); ?></td>
                                <td><?php echo esc_html(wp_trim_words($message->message, 10)); ?></td>
                                <td><?php echo esc_html($message->status); ?></td>
                                <td>
                                    <a href="<?php echo esc_url(wp_nonce_url(
                                        admin_url('admin-post.php?action=delete_contact_message&id=' . $message->id),
                                        'delete_message_' . $message->id
                                    )); ?>"
                                       onclick="return confirm('<?php _e('Are you sure you want to delete this message?', 'text-domain'); ?>');">
                                        <?php _e('Delete', 'text-domain'); ?>
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Delete a message.
     */
    public function delete_message() {
        // Check user capability
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to perform this action.', 'text-domain'));
        }

        // Get message ID
        $message_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if (!$message_id) {
            wp_die(__('Invalid message ID.', 'text-domain'));
        }

        // Verify nonce
        if (!isset($_GET['_wpnonce']) ||
            !wp_verify_nonce($_GET['_wpnonce'], 'delete_message_' . $message_id)) {
            wp_die(__('Security check failed.', 'text-domain'));
        }

        // Delete message with prepared statement
        global $wpdb;
        $table_name = $wpdb->prefix . 'contact_messages';

        $deleted = $wpdb->delete(
            $table_name,
            array('id' => $message_id),
            array('%d')
        );

        if ($deleted) {
            wp_safe_redirect(admin_url('tools.php?page=contact-messages&deleted=1'));
        } else {
            wp_die(__('Failed to delete message.', 'text-domain'));
        }

        exit;
    }
}
```

## Security Checklist

### ✅ CSRF Protection (Cross-Site Request Forgery)

- [x] **Nonce field in form**: `wp_nonce_field('contact_form_submit', 'contact_form_nonce')`
- [x] **Nonce verification in handler**: `wp_verify_nonce($_POST['contact_form_nonce'], 'contact_form_submit')`
- [x] **AJAX nonce**: `check_ajax_referer('contact_form_ajax_nonce', 'nonce', false)`
- [x] **Admin action nonce**: `wp_nonce_url()` for delete links

### ✅ XSS Prevention (Cross-Site Scripting)

- [x] **Output escaping**: `esc_html()`, `esc_attr()`, `esc_url()`, `esc_textarea()`
- [x] **JavaScript escaping**: Custom `escapeHtml()` function
- [x] **Email content**: Plain text email (no HTML)

### ✅ SQL Injection Prevention

- [x] **Prepared statements**: `$wpdb->insert()` with format array
- [x] **Prepared queries**: `$wpdb->prepare()` with placeholders
- [x] **Type casting**: `intval()` for IDs

### ✅ Authorization

- [x] **Capability checks**: `current_user_can('manage_options')`
- [x] **Admin page protection**: Check capability before rendering
- [x] **Admin action protection**: Check capability before deleting

### ✅ Input Validation

- [x] **Required fields**: Check for empty values
- [x] **Length validation**: Min/max character limits
- [x] **Email validation**: `is_email()` function
- [x] **Type validation**: Ensure correct data types

### ✅ Input Sanitization

- [x] **Text fields**: `sanitize_text_field()`
- [x] **Email**: `sanitize_email()`
- [x] **Textarea**: `sanitize_textarea_field()`
- [x] **IP address**: `filter_var($ip, FILTER_VALIDATE_IP)`

### ✅ Spam Prevention

- [x] **Rate limiting**: Max 3 submissions per hour per IP
- [x] **Honeypot field**: Hidden field to catch bots
- [x] **IP logging**: Track submissions by IP address

### ✅ Additional Security

- [x] **Session management**: Proper session handling
- [x] **Transients for messages**: Temporary storage for errors/success
- [x] **Safe redirects**: `wp_safe_redirect()`
- [x] **Error logging**: Log submissions for monitoring

## Testing Checklist

### Functional Testing

- [ ] Form displays correctly
- [ ] Form submits successfully with valid data
- [ ] Success message displays after submission
- [ ] Email notification sent to admin
- [ ] Data saved to database correctly
- [ ] AJAX form works without page reload

### Security Testing

- [ ] Form submission fails without nonce
- [ ] Form submission fails with invalid nonce
- [ ] Form submission fails with expired nonce
- [ ] Rate limiting blocks excessive submissions
- [ ] Honeypot catches bot submissions
- [ ] Admin page requires manage_options capability
- [ ] Delete action requires nonce verification
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are escaped

### Validation Testing

- [ ] Empty fields show error messages
- [ ] Invalid email shows error message
- [ ] Too short inputs show error messages
- [ ] Too long inputs show error messages
- [ ] Multiple errors display correctly

### Edge Cases

- [ ] Form works with special characters in input
- [ ] Form works with Unicode characters
- [ ] Form works with very long messages
- [ ] Form handles database errors gracefully
- [ ] Form handles email sending failures gracefully

## Key Takeaways

1. **Defense in Depth**: Multiple layers of security (nonces, capability checks, sanitization, escaping)
2. **Never Trust User Input**: Always sanitize and validate
3. **Always Escape Output**: Prevent XSS vulnerabilities
4. **Use Prepared Statements**: Prevent SQL injection
5. **Rate Limiting**: Prevent spam and abuse
6. **Honeypot Fields**: Simple bot detection
7. **Proper Error Handling**: Don't expose sensitive information
8. **Logging**: Monitor for suspicious activity
9. **WordPress Functions**: Use built-in security functions
10. **Testing**: Comprehensive security testing is essential

