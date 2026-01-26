# WordPress.org Plugin Submission Workflow

## Overview

This workflow guides you through preparing and submitting a WordPress plugin to the WordPress.org Plugin Directory, including security audits, code standards compliance, and responding to review feedback.

## Prerequisites

- Completed WordPress plugin
- All features tested and working
- Documentation complete
- Domain rules: `domain-rules/wordpress-plugin/wordpress-org-submission.md`

## Workflow Steps

### 1. Pre-Submission Checklist

**Code Quality**:
- [ ] All code follows WordPress Coding Standards (WPCS)
- [ ] No PHP errors or warnings
- [ ] All functions are properly documented (PHPDoc)
- [ ] Code is well-organized and maintainable
- [ ] No debug code or console.log statements

**Security**:
- [ ] All user input is sanitized
- [ ] All output is escaped
- [ ] Nonces are used for all forms
- [ ] Capability checks are in place
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] File upload restrictions (if applicable)

**Functionality**:
- [ ] All features work as expected
- [ ] No JavaScript errors in console
- [ ] Responsive design works on mobile
- [ ] Works with latest WordPress version
- [ ] Works with minimum supported WordPress version
- [ ] Compatible with common themes
- [ ] Compatible with common plugins

**Performance**:
- [ ] Database queries are optimized
- [ ] No N+1 query problems
- [ ] Caching implemented where appropriate
- [ ] Assets are minified and combined
- [ ] Lazy loading used where appropriate

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Forms have proper labels
- [ ] Images have alt text

**Licensing**:
- [ ] Plugin is GPL-compatible
- [ ] All third-party libraries are GPL-compatible
- [ ] License file included
- [ ] Copyright notices in place

### 2. Security Audit Workflow

**Step 2.1: Automated Security Scan**

```bash
# Install security scanner
composer require --dev automattic/vipwpcs

# Run security scan
vendor/bin/phpcs --standard=WordPress-VIP-Go .
```

**Step 2.2: Manual Security Review**

Check for common vulnerabilities:

**Nonce Verification**:
```bash
# Search for forms without nonce verification
grep -r "wp_nonce_field" . --include="*.php"
grep -r "wp_verify_nonce" . --include="*.php"
```

**Capability Checks**:
```bash
# Search for capability checks
grep -r "current_user_can" . --include="*.php"
```

**Input Sanitization**:
```bash
# Search for $_POST, $_GET, $_REQUEST usage
grep -r "\$_POST\[" . --include="*.php"
grep -r "\$_GET\[" . --include="*.php"
grep -r "\$_REQUEST\[" . --include="*.php"
```

**Output Escaping**:
```bash
# Search for echo statements
grep -r "echo " . --include="*.php"
```

**Step 2.3: Security Audit Checklist**

- [ ] All forms have nonce verification
- [ ] All admin actions have capability checks
- [ ] All $_POST data is sanitized
- [ ] All $_GET data is sanitized
- [ ] All output is escaped
- [ ] No direct database queries (use $wpdb prepared statements)
- [ ] File uploads are restricted and validated
- [ ] No eval() or exec() usage
- [ ] No unserialize() on user input
- [ ] No file_get_contents() on user input

### 3. Code Standards Check (WPCS)

**Step 3.1: Install WordPress Coding Standards**

```bash
# Install WPCS
composer require --dev wp-coding-standards/wpcs

# Configure PHPCS
vendor/bin/phpcs --config-set installed_paths vendor/wp-coding-standards/wpcs
```

**Step 3.2: Run WPCS Check**

```bash
# Run WPCS check
vendor/bin/phpcs --standard=WordPress .

# Run with specific rules
vendor/bin/phpcs --standard=WordPress-Core .
vendor/bin/phpcs --standard=WordPress-Docs .
vendor/bin/phpcs --standard=WordPress-Extra .

# Generate report
vendor/bin/phpcs --standard=WordPress --report=summary .
```

**Step 3.3: Fix WPCS Issues**

```bash
# Auto-fix issues
vendor/bin/phpcbf --standard=WordPress .

# Check specific file
vendor/bin/phpcs --standard=WordPress path/to/file.php

# Ignore specific rules (if necessary)
vendor/bin/phpcs --standard=WordPress --exclude=WordPress.Files.FileName .
```

**Step 3.4: WPCS Compliance Checklist**

- [ ] Indentation is correct (tabs, not spaces)
- [ ] Braces are on correct lines
- [ ] Function names are lowercase with underscores
- [ ] Class names are capitalized with underscores
- [ ] Variable names are lowercase with underscores
- [ ] No trailing whitespace
- [ ] Files end with newline
- [ ] No PHP short tags
- [ ] Proper spacing around operators
- [ ] Proper PHPDoc comments

### 4. Create/Update readme.txt

**Step 4.1: readme.txt Template**

```
=== Plugin Name ===
Contributors: yourusername
Donate link: https://example.com/donate
Tags: tag1, tag2, tag3
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Short description of your plugin (max 150 characters).

== Description ==

Detailed description of your plugin.

**Features:**

* Feature 1
* Feature 2
* Feature 3

**Use Cases:**

* Use case 1
* Use case 2

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/plugin-name` directory, or install through WordPress plugins screen.
2. Activate the plugin through 'Plugins' screen in WordPress.
3. Use Settings -> Plugin Name to configure the plugin.

== Frequently Asked Questions ==

= Question 1? =

Answer 1.

= Question 2? =

Answer 2.

== Screenshots ==

1. Screenshot 1 description
2. Screenshot 2 description

== Changelog ==

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 1.0.0 =
Initial release.
```

**Step 4.2: Validate readme.txt**

```bash
# Use WordPress.org readme validator
# Visit: https://wordpress.org/plugins/developers/readme-validator/

# Or use WP-CLI
wp plugin readme validate readme.txt
```

**Step 4.3: readme.txt Best Practices**

- [ ] Short description is under 150 characters
- [ ] Tags are relevant (max 12 tags)
- [ ] "Requires at least" is accurate
- [ ] "Tested up to" is latest WordPress version
- [ ] "Requires PHP" is accurate
- [ ] "Stable tag" matches plugin version
- [ ] Description is clear and comprehensive
- [ ] Installation instructions are complete
- [ ] FAQ section addresses common questions
- [ ] Changelog is up to date
- [ ] Screenshots are described

### 5. Prepare Screenshots

**Step 5.1: Take Screenshots**

Requirements:
- PNG or JPG format
- Minimum width: 772px
- Maximum width: 1600px (recommended)
- Aspect ratio: 4:3 or 16:9
- Clear and high quality
- Show actual plugin functionality

**Step 5.2: Name Screenshots**

```
screenshot-1.png  # Corresponds to "1. Description" in readme.txt
screenshot-2.png  # Corresponds to "2. Description" in readme.txt
screenshot-3.png  # Corresponds to "3. Description" in readme.txt
```

**Step 5.3: Optimize Screenshots**

```bash
# Install image optimization tool
npm install -g imagemin-cli

# Optimize screenshots
imagemin screenshot-*.png --out-dir=assets/
```

**Step 5.4: Screenshot Checklist**

- [ ] Screenshots show key features
- [ ] Screenshots are high quality
- [ ] Screenshots are properly sized
- [ ] Screenshots are optimized
- [ ] Screenshot descriptions are in readme.txt
- [ ] Screenshots are numbered correctly

### 6. Test in Clean WordPress Install

**Step 6.1: Set Up Clean Test Environment**

```bash
# Using Local by Flywheel, XAMPP, or similar
# Or use WP-CLI

wp core download
wp config create --dbname=test_db --dbuser=root --dbpass=root
wp core install --url=http://localhost/test --title="Test Site" --admin_user=admin --admin_password=admin --admin_email=admin@example.com
```

**Step 6.2: Install Plugin**

```bash
# Copy plugin to wp-content/plugins/
cp -r /path/to/plugin wp-content/plugins/

# Or use WP-CLI
wp plugin install /path/to/plugin.zip --activate
```

**Step 6.3: Clean Install Testing Checklist**

- [ ] Plugin activates without errors
- [ ] Plugin deactivates without errors
- [ ] Plugin uninstalls cleanly (removes data)
- [ ] No PHP errors or warnings
- [ ] No JavaScript errors in console
- [ ] Admin interface works correctly
- [ ] Frontend display works correctly
- [ ] Settings save correctly
- [ ] Database tables created correctly (if applicable)
- [ ] Cron jobs scheduled correctly (if applicable)

**Step 6.4: Test with Different Themes**

```bash
# Test with default WordPress themes
wp theme install twentytwentyfour --activate
wp theme install twentytwentythree --activate
wp theme install twentytwentytwo --activate
```

- [ ] Works with Twenty Twenty-Four
- [ ] Works with Twenty Twenty-Three
- [ ] Works with Twenty Twenty-Two
- [ ] Works with popular themes (Astra, GeneratePress, etc.)

**Step 6.5: Test with Different PHP Versions**

- [ ] Works with PHP 7.4
- [ ] Works with PHP 8.0
- [ ] Works with PHP 8.1
- [ ] Works with PHP 8.2

**Step 6.6: Test with Different WordPress Versions**

- [ ] Works with minimum supported version
- [ ] Works with latest stable version
- [ ] Works with latest beta version (if available)

### 7. Submit to WordPress.org

**Step 7.1: Create WordPress.org Account**

1. Visit https://wordpress.org/support/register.php
2. Create account with valid email
3. Verify email address

**Step 7.2: Submit Plugin**

1. Visit https://wordpress.org/plugins/developers/add/
2. Upload plugin ZIP file
3. Fill out submission form:
   - Plugin name
   - Plugin slug (unique, lowercase, hyphens)
   - Plugin description
   - Plugin URL (if applicable)
4. Agree to guidelines
5. Submit for review

**Step 7.3: Submission Checklist**

- [ ] Plugin ZIP file created
- [ ] ZIP file contains only plugin files (no .git, node_modules, etc.)
- [ ] Plugin slug is unique
- [ ] Plugin name is unique
- [ ] All required fields filled out
- [ ] Guidelines acknowledged

**Step 7.4: Create Plugin ZIP**

```bash
# Navigate to plugin directory
cd wp-content/plugins/your-plugin

# Create ZIP (exclude unnecessary files)
zip -r ../your-plugin.zip . -x "*.git*" "node_modules/*" "tests/*" "*.md" "composer.json" "composer.lock" "package.json" "package-lock.json"

# Or use build script
npm run build  # If you have a build process
```

### 8. Respond to Review Feedback

**Step 8.1: Review Timeline**

- Initial review: 1-14 days (typically 3-7 days)
- Follow-up reviews: 1-7 days
- Total time: 1-4 weeks (varies)

**Step 8.2: Common Review Feedback**

**Security Issues**:
- Missing nonce verification
- Missing capability checks
- Unsanitized input
- Unescaped output
- SQL injection vulnerabilities

**Code Quality Issues**:
- Not following WordPress Coding Standards
- Missing text domain
- Hardcoded URLs
- Direct file access not prevented
- Missing license information

**Functionality Issues**:
- Plugin doesn't work as described
- Errors on activation
- Conflicts with other plugins
- Performance issues

**Documentation Issues**:
- Incomplete readme.txt
- Missing installation instructions
- Missing FAQ section
- Missing changelog

**Step 8.3: Responding to Feedback**

1. **Read feedback carefully**
2. **Fix all issues mentioned**
3. **Test fixes thoroughly**
4. **Reply to review thread** with:
   - Acknowledgment of issues
   - Description of fixes made
   - Confirmation that all issues are resolved
5. **Wait for follow-up review**

**Example Response**:

```
Thank you for the review!

I've addressed all the issues mentioned:

1. Added nonce verification to all forms (lines 45, 67, 89)
2. Added capability checks to admin actions (lines 123, 145)
3. Sanitized all $_POST data using sanitize_text_field() (lines 50, 72)
4. Escaped all output using esc_html() and esc_attr() (lines 200-250)
5. Updated readme.txt with complete installation instructions
6. Added text domain to all translatable strings

All changes have been tested in a clean WordPress install with no errors.

Please let me know if there are any other issues to address.
```

**Step 8.4: Resubmit Plugin**

1. Make all requested changes
2. Test thoroughly
3. Update version number (if requested)
4. Create new ZIP file
5. Reply to review thread (don't create new submission)
6. Wait for follow-up review

### 9. Post-Approval Workflow

**Step 9.1: Set Up SVN Repository**

```bash
# Checkout SVN repository
svn co https://plugins.svn.wordpress.org/your-plugin-slug

# Navigate to repository
cd your-plugin-slug
```

**Step 9.2: Add Plugin Files**

```bash
# Copy files to trunk
cp -r /path/to/plugin/* trunk/

# Add files to SVN
svn add trunk/*

# Commit to trunk
svn ci -m "Initial commit"
```

**Step 9.3: Create Tag for Release**

```bash
# Copy trunk to tags/1.0.0
svn cp trunk tags/1.0.0

# Commit tag
svn ci -m "Tagging version 1.0.0"
```

**Step 9.4: Add Assets**

```bash
# Create assets directory (if not exists)
mkdir -p assets

# Copy screenshots and banner
cp screenshot-*.png assets/
cp banner-772x250.png assets/
cp banner-1544x500.png assets/
cp icon-128x128.png assets/
cp icon-256x256.png assets/

# Add assets to SVN
svn add assets/*

# Commit assets
svn ci -m "Add plugin assets"
```

**Step 9.5: Post-Approval Checklist**

- [ ] SVN repository set up
- [ ] Plugin files committed to trunk
- [ ] Version tag created
- [ ] Screenshots added to assets
- [ ] Banner images added (optional)
- [ ] Icon images added (optional)
- [ ] Plugin appears on WordPress.org

### 10. Update Workflow (Future Releases)

**Step 10.1: Prepare Update**

1. Make changes to plugin
2. Update version number in plugin header
3. Update version in readme.txt
4. Update changelog in readme.txt
5. Test thoroughly

**Step 10.2: Commit to SVN**

```bash
# Update trunk
svn up

# Copy new files to trunk
cp -r /path/to/plugin/* trunk/

# Check status
svn status

# Add new files (if any)
svn add trunk/new-file.php

# Commit changes
svn ci -m "Update to version 1.1.0"

# Create new tag
svn cp trunk tags/1.1.0
svn ci -m "Tagging version 1.1.0"
```

**Step 10.3: Update Checklist**

- [ ] Version number updated in plugin header
- [ ] Version number updated in readme.txt
- [ ] Changelog updated in readme.txt
- [ ] All changes tested
- [ ] Changes committed to trunk
- [ ] New tag created
- [ ] Update appears on WordPress.org

## AI Prompt Templates

### Security Audit Prompt

```
Perform a comprehensive security audit on [plugin name].

Check for:
- Missing nonce verification in forms
- Missing capability checks in admin actions
- Unsanitized input ($_POST, $_GET, $_REQUEST)
- Unescaped output (echo, print)
- SQL injection vulnerabilities
- XSS vulnerabilities
- CSRF vulnerabilities
- File upload vulnerabilities

Provide a report with:
- List of vulnerabilities found
- Severity rating (Critical, High, Medium, Low)
- Line numbers where issues occur
- Recommended fixes with code examples
```

### WPCS Compliance Prompt

```
Check [plugin name] for WordPress Coding Standards compliance.

Run PHPCS with WordPress standards and fix all issues:
- Indentation (tabs, not spaces)
- Braces placement
- Function naming (lowercase with underscores)
- Class naming (capitalized with underscores)
- Variable naming (lowercase with underscores)
- Spacing around operators
- PHPDoc comments
- File structure

Auto-fix where possible using PHPCBF.
Provide a summary of changes made.
```

### readme.txt Creation Prompt

```
Create a comprehensive readme.txt for [plugin name].

Include:
- Short description (max 150 characters)
- Detailed description with features and use cases
- Installation instructions
- FAQ section with common questions
- Screenshots section with descriptions
- Changelog with version history
- Upgrade notices

Follow WordPress.org readme.txt format.
Validate using WordPress.org readme validator.
```

## Best Practices

### DO

✅ Run security audit before submission
✅ Follow WordPress Coding Standards
✅ Test in clean WordPress install
✅ Test with different themes and plugins
✅ Respond promptly to review feedback
✅ Keep readme.txt up to date
✅ Use semantic versioning
✅ Maintain changelog
✅ Test updates before releasing
✅ Monitor support forums after release

### DON'T

❌ Submit without security audit
❌ Ignore coding standards
❌ Skip testing in clean install
❌ Argue with reviewers
❌ Resubmit without fixing issues
❌ Use misleading plugin name or description
❌ Include premium features in free version
❌ Phone home without user consent
❌ Include affiliate links in plugin
❌ Violate WordPress.org guidelines

## Common Rejection Reasons

1. **Security Issues**
   - Missing nonce verification
   - Missing capability checks
   - Unsanitized input
   - Unescaped output

2. **Code Quality Issues**
   - Not following WordPress Coding Standards
   - Missing text domain
   - Hardcoded URLs
   - Direct file access not prevented

3. **Guideline Violations**
   - Trademark violations
   - Including premium features
   - Phone home without consent
   - Obfuscated code

4. **Functionality Issues**
   - Plugin doesn't work as described
   - Errors on activation
   - Conflicts with WordPress core

## Timeline Expectations

- **Submission to initial review**: 1-14 days (typically 3-7 days)
- **Follow-up reviews**: 1-7 days
- **Total approval time**: 1-4 weeks (varies)
- **After approval**: Plugin appears immediately on WordPress.org

## Resources

- [WordPress Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)
- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [readme.txt Validator](https://wordpress.org/plugins/developers/readme-validator/)
- [Plugin SVN Guide](https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/)

## Related Workflows

- `development-workflow.md` - Feature development cycle
- `testing-workflow.md` - Testing setup and execution
- `scaffolding-workflow.md` - Creating new plugins

## Related Domain Rules

- `domain-rules/wordpress-plugin/wordpress-org-submission.md` - Detailed submission requirements
- `domain-rules/wordpress-plugin/security-best-practices.md` - Security guidelines

