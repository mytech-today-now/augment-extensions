# WordPress.org Plugin Submission Guidelines

## Overview

This document provides comprehensive guidelines for submitting plugins to the WordPress.org Plugin Directory, covering requirements, review process, SVN management, and best practices.

---

## Pre-Submission Requirements

### 1. Plugin Readiness Checklist

Before submitting, ensure your plugin meets these requirements:

- [ ] **Unique functionality** - Not duplicating existing plugins
- [ ] **GPL-compatible license** - GPL-2.0+, GPL-3.0+, or compatible
- [ ] **No trademark violations** - Avoid trademarked names
- [ ] **Security best practices** - Sanitization, validation, escaping
- [ ] **WordPress coding standards** - Follow WPCS
- [ ] **Proper text domain** - Matches plugin slug
- [ ] **Translation ready** - All strings use i18n functions
- [ ] **No external dependencies** - No required paid services
- [ ] **No obfuscated code** - All code must be readable
- [ ] **readme.txt** - Complete and properly formatted

### 2. Required Files

**Minimum files:**
- Main plugin file with plugin header
- `readme.txt` (WordPress.org format)

**Recommended files:**
- `LICENSE` or `license.txt`
- `README.md` (for GitHub)
- `CHANGELOG.md` or changelog in readme.txt

### 3. Plugin Header Requirements

```php
<?php
/**
 * Plugin Name: My Awesome Plugin
 * Plugin URI: https://example.com/my-awesome-plugin
 * Description: Brief description of what the plugin does
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: my-awesome-plugin
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */
```

### 4. readme.txt Requirements

See [documentation-standards.md](./documentation-standards.md) for complete readme.txt format.

**Critical sections:**
- Plugin name and metadata
- Short description (max 150 characters)
- Detailed description
- Installation instructions
- FAQ section
- Changelog

---

## Submission Process

### Step 1: Create WordPress.org Account

1. Go to [wordpress.org/support/register.php](https://wordpress.org/support/register.php)
2. Create an account (required for plugin submission)
3. Verify your email address

### Step 2: Submit Plugin for Review

1. Go to [wordpress.org/plugins/developers/add/](https://wordpress.org/plugins/developers/add/)
2. Upload your plugin ZIP file
3. Provide plugin details:
   - Plugin name
   - Plugin description
   - Plugin URL (if available)
4. Agree to guidelines
5. Submit for review

### Step 3: Wait for Review

- **Review time**: Typically 1-14 days (can vary)
- **Email notification**: You'll receive an email when reviewed
- **Possible outcomes**:
  - **Approved**: SVN repository created
  - **Rejected**: Email with reasons and required changes

### Step 4: Address Review Feedback

If rejected or changes requested:

1. Read the review email carefully
2. Make all required changes
3. Reply to the email with:
   - Confirmation of changes made
   - Explanation of any questions
4. Wait for re-review

---

## SVN Repository Management

### Initial Setup

Once approved, you'll receive SVN repository access:

```bash
# Checkout SVN repository
svn co https://plugins.svn.wordpress.org/your-plugin-slug your-plugin-slug

# Navigate to directory
cd your-plugin-slug
```

### Repository Structure

```
your-plugin-slug/
├── trunk/              # Development version
├── tags/               # Released versions
│   ├── 1.0.0/
│   ├── 1.0.1/
│   └── 1.1.0/
├── branches/           # Development branches (optional)
└── assets/             # Plugin directory assets
    ├── banner-772x250.png
    ├── banner-1544x500.png
    ├── icon-128x128.png
    ├── icon-256x256.png
    └── screenshot-1.png
```

### First Release

```bash
# Copy plugin files to trunk
cp -r /path/to/your/plugin/* trunk/

# Add files to SVN
cd trunk
svn add --force * --auto-props --parents --depth infinity -q

# Commit to trunk
svn ci -m "Initial commit of version 1.0.0"

# Create tag for version 1.0.0
svn cp trunk tags/1.0.0
svn ci -m "Tagging version 1.0.0"
```

### Subsequent Releases

```bash
# Update trunk with new version
cd trunk
# Copy updated files
svn stat
svn add <new-files>
svn delete <removed-files>
svn ci -m "Update to version 1.1.0"

# Create new tag
svn cp trunk tags/1.1.0
svn ci -m "Tagging version 1.1.0"
```

### Assets Management

```bash
# Add plugin assets
cd assets
svn add banner-772x250.png
svn add banner-1544x500.png
svn add icon-128x128.png
svn add icon-256x256.png
svn ci -m "Add plugin assets"
```

**Asset Requirements:**

- **Banner**: 772×250px (required), 1544×500px (retina, optional)
- **Icon**: 128×128px (required), 256×256px (retina, optional)
- **Screenshots**: Any size, numbered (screenshot-1.png, screenshot-2.png, etc.)
- **Format**: PNG or JPG
- **File size**: Keep under 1MB per file

---

## Plugin Review Guidelines

### What Gets Approved

✅ **Unique functionality** - Solves a real problem
✅ **Clean code** - Follows WordPress coding standards
✅ **Secure code** - Proper sanitization, validation, escaping
✅ **GPL-compatible** - Open source license
✅ **No external dependencies** - Works standalone
✅ **Proper documentation** - Clear readme.txt
✅ **Translation ready** - All strings translatable

### What Gets Rejected

❌ **Trademark violations** - Using trademarked names without permission
❌ **Obfuscated code** - Encoded, minified, or unreadable code
❌ **Security issues** - SQL injection, XSS, CSRF vulnerabilities
❌ **Calling external services** - Without user consent
❌ **Phoning home** - Tracking without disclosure
❌ **Spam/SEO plugins** - Link injection, content spinning
❌ **Duplicate functionality** - Exact copy of existing plugin
❌ **Incomplete plugins** - "Coming soon" or placeholder plugins

---

## Security Requirements

### Data Sanitization

```php
// Sanitize text input
$text = sanitize_text_field($_POST['text']);

// Sanitize email
$email = sanitize_email($_POST['email']);

// Sanitize URL
$url = esc_url_raw($_POST['url']);

// Sanitize textarea
$textarea = sanitize_textarea_field($_POST['textarea']);

// Sanitize HTML
$html = wp_kses_post($_POST['html']);
```

### Data Validation

```php
// Validate email
if (!is_email($email)) {
    wp_die('Invalid email address');
}

// Validate URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    wp_die('Invalid URL');
}

// Validate nonce
if (!wp_verify_nonce($_POST['nonce'], 'my_action')) {
    wp_die('Security check failed');
}
```

### Data Escaping

```php
// Escape HTML
echo esc_html($text);

// Escape attributes
echo '<input value="' . esc_attr($value) . '">';

// Escape URLs
echo '<a href="' . esc_url($url) . '">Link</a>';

// Escape JavaScript
echo '<script>var data = ' . wp_json_encode($data) . ';</script>';
```

### SQL Queries

```php
// Use $wpdb->prepare() for all queries
global $wpdb;

$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}table WHERE id = %d AND name = %s",
        $id,
        $name
    )
);
```

---

## Common Rejection Reasons

### 1. Security Issues

**Problem**: Unsanitized input, SQL injection, XSS vulnerabilities

**Solution**:
- Sanitize all input: `sanitize_text_field()`, `sanitize_email()`, etc.
- Validate all data before processing
- Escape all output: `esc_html()`, `esc_attr()`, `esc_url()`
- Use `$wpdb->prepare()` for all database queries
- Use nonces for form submissions

### 2. Calling External Services

**Problem**: Plugin calls external APIs without user consent

**Solution**:
- Disclose all external calls in readme.txt
- Provide opt-in mechanism for external services
- Document privacy implications
- Provide alternative if service is unavailable

### 3. Generic Function/Class Names

**Problem**: Function names like `init()`, `get_data()` conflict with other plugins

**Solution**:
- Prefix all functions: `my_plugin_init()`
- Use namespaces: `namespace MyPlugin;`
- Prefix class names: `class MyPlugin_Admin {}`

### 4. Including External Libraries

**Problem**: Including entire libraries when only small parts are used

**Solution**:
- Only include necessary code
- Use WordPress core functions when available
- Document why external library is needed
- Ensure library is GPL-compatible

### 5. Incomplete readme.txt

**Problem**: Missing required sections or improper formatting

**Solution**:
- Use [WordPress readme.txt validator](https://wordpress.org/plugins/developers/readme-validator/)
- Include all required sections
- Follow exact formatting guidelines
- Test with validator before submission

---

## Post-Approval Best Practices

### 1. Regular Updates

- Update `Tested up to` with each WordPress release
- Fix reported bugs promptly
- Add new features based on user feedback
- Keep dependencies up to date

### 2. Support Forum Monitoring

- Check support forum daily
- Respond to questions within 48 hours
- Mark resolved topics as resolved
- Create FAQ entries for common questions

### 3. Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update changelog for every release
- Test thoroughly before releasing
- Keep stable tag updated in readme.txt

### 4. Asset Updates

- Update screenshots when UI changes
- Refresh banner/icon if rebranding
- Keep assets optimized (< 1MB)

---

## Useful Resources

### Official Documentation

- [Plugin Developer Handbook](https://developer.wordpress.org/plugins/)
- [Plugin Review Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)
- [SVN Guide](https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/)
- [readme.txt Validator](https://wordpress.org/plugins/developers/readme-validator/)

### Tools

- [WordPress Coding Standards](https://github.com/WordPress/WordPress-Coding-Standards)
- [Plugin Check Plugin](https://wordpress.org/plugins/plugin-check/)
- [Query Monitor](https://wordpress.org/plugins/query-monitor/)
- [Debug Bar](https://wordpress.org/plugins/debug-bar/)

### Community

- [WordPress.org Support Forums](https://wordpress.org/support/forums/)
- [WordPress Slack](https://make.wordpress.org/chat/)
- [WordPress Developer Blog](https://developer.wordpress.org/news/)

---

## Troubleshooting

### Plugin Not Showing in Directory

**Possible causes:**
- Stable tag in readme.txt doesn't match tag in SVN
- Plugin header version doesn't match stable tag
- SVN commit failed

**Solution:**
```bash
# Verify stable tag in readme.txt
grep "Stable tag:" trunk/readme.txt

# Verify tag exists in SVN
svn list https://plugins.svn.wordpress.org/your-plugin/tags/

# Re-commit if needed
svn ci -m "Fix stable tag"
```

### Updates Not Appearing

**Possible causes:**
- Stable tag not updated in readme.txt
- Version in plugin header not updated
- Tag not created in SVN

**Solution:**
1. Update version in plugin header
2. Update stable tag in readme.txt
3. Commit to trunk
4. Create new tag in SVN
5. Wait 15-30 minutes for WordPress.org to update

### Assets Not Displaying

**Possible causes:**
- Wrong file names
- Wrong dimensions
- Files not in assets/ directory

**Solution:**
```bash
# Verify asset file names
svn list https://plugins.svn.wordpress.org/your-plugin/assets/

# Re-upload with correct names
cd assets
svn add banner-772x250.png
svn ci -m "Add banner"
```

