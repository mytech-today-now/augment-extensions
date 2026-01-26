# WordPress.org Submission Workflow Example

This example demonstrates the complete workflow for submitting a WordPress plugin to the WordPress.org Plugin Directory using OpenSpec and Beads.

## Scenario

Submitting the "Simple Contact Form" plugin to WordPress.org after completing development and security audit.

## Plugin Context

**Plugin**: Simple Contact Form
**Version**: 1.0.0
**Status**: Development complete, security audit passed
**Goal**: Get approved and published on WordPress.org

## Workflow Steps

### Step 1: Create OpenSpec Submission Spec

**File**: `openspec/specs/submission/wordpress-org.md`

```markdown
---
id: submission/wordpress-org
status: active
relatedTasks: []
---

# WordPress.org Plugin Submission

## Overview
Submit Simple Contact Form plugin to WordPress.org Plugin Directory.

## Requirements

### Pre-Submission Requirements
- Plugin is complete and tested
- Security audit passed
- Code follows WordPress Coding Standards
- Documentation is complete
- readme.txt is properly formatted
- All assets are prepared

### Submission Requirements
- Create WordPress.org account
- Prepare plugin ZIP file
- Submit via WordPress.org submission form
- Respond to review feedback promptly

### Post-Approval Requirements
- Set up SVN repository
- Commit plugin files to trunk
- Tag first release
- Upload assets (banner, icon, screenshots)
- Monitor support forum

## Submission Checklist

### Code Quality
- [ ] Follows WordPress Coding Standards (WPCS)
- [ ] No PHP errors or warnings
- [ ] All functions documented (PHPDoc)
- [ ] No debug code or console.log statements

### Security
- [ ] All forms have nonce verification
- [ ] All output is escaped
- [ ] All input is sanitized
- [ ] All database queries use prepared statements
- [ ] Capability checks in place

### Functionality
- [ ] All features work as expected
- [ ] Works with latest WordPress version
- [ ] Works with minimum supported version
- [ ] Compatible with common themes
- [ ] No JavaScript errors

### Documentation
- [ ] readme.txt properly formatted
- [ ] Installation instructions clear
- [ ] FAQ section complete
- [ ] Changelog up to date
- [ ] Screenshots included

### Licensing
- [ ] Plugin is GPL-2.0+ or compatible
- [ ] All third-party libraries are GPL-compatible
- [ ] License file included
- [ ] Copyright notices in place

### Assets
- [ ] Banner images (772x250, 1544x500)
- [ ] Icon images (128x128, 256x256)
- [ ] Screenshots (at least 2-3)
- [ ] All images optimized

## Timeline Expectations

- Submission to initial review: 1-14 days (typically 3-7 days)
- Follow-up reviews: 1-7 days
- Total approval time: 1-4 weeks
- After approval: Plugin appears immediately
```

### Step 2: Create Beads Tasks for Submission

```bash
# Create epic for WordPress.org submission
bd create "Submit Simple Contact Form to WordPress.org" -p 0 --type epic --label wordpress-org --label submission
# Returns: bd-sub

# Pre-submission preparation
bd create "Run final WPCS check" -p 0 --parent bd-sub --label preparation
# Returns: bd-sub.1

bd create "Validate readme.txt format" -p 0 --parent bd-sub --label preparation
# Returns: bd-sub.2

bd create "Create plugin banner images" -p 0 --parent bd-sub --label assets
# Returns: bd-sub.3

bd create "Create plugin icon images" -p 0 --parent bd-sub --label assets
# Returns: bd-sub.4

bd create "Take plugin screenshots" -p 0 --parent bd-sub --label assets
# Returns: bd-sub.5

bd create "Optimize all images" -p 0 --parent bd-sub --label assets
# Returns: bd-sub.6

bd create "Create plugin ZIP file" -p 0 --parent bd-sub --label preparation
# Returns: bd-sub.7

# Submission
bd create "Create WordPress.org account" -p 1 --parent bd-sub --label submission
# Returns: bd-sub.8

bd create "Submit plugin via WordPress.org form" -p 1 --parent bd-sub --label submission
# Returns: bd-sub.9

bd create "Wait for initial review" -p 1 --parent bd-sub --label submission
# Returns: bd-sub.10

bd create "Respond to review feedback" -p 1 --parent bd-sub --label submission
# Returns: bd-sub.11

# Post-approval
bd create "Set up SVN repository" -p 2 --parent bd-sub --label post-approval
# Returns: bd-sub.12

bd create "Commit plugin files to trunk" -p 2 --parent bd-sub --label post-approval
# Returns: bd-sub.13

bd create "Tag version 1.0.0 release" -p 2 --parent bd-sub --label post-approval
# Returns: bd-sub.14

bd create "Upload assets to SVN" -p 2 --parent bd-sub --label post-approval
# Returns: bd-sub.15

bd create "Verify plugin appears on WordPress.org" -p 2 --parent bd-sub --label post-approval
# Returns: bd-sub.16

# Documentation
bd create "Create submission documentation" -p 2 --parent bd-sub --label documentation
# Returns: bd-sub.17
```

### Step 3: Add Task Dependencies

```bash
# Assets can be created in parallel
bd dep add bd-sub.6 bd-sub.3
bd dep add bd-sub.6 bd-sub.4
bd dep add bd-sub.6 bd-sub.5

# ZIP depends on WPCS check and readme validation
bd dep add bd-sub.7 bd-sub.1
bd dep add bd-sub.7 bd-sub.2

# Submission depends on ZIP and account
bd dep add bd-sub.9 bd-sub.7
bd dep add bd-sub.9 bd-sub.8

# Review feedback depends on submission
bd dep add bd-sub.10 bd-sub.9
bd dep add bd-sub.11 bd-sub.10

# SVN setup depends on approval (after feedback)
bd dep add bd-sub.12 bd-sub.11

# SVN operations are sequential
bd dep add bd-sub.13 bd-sub.12
bd dep add bd-sub.14 bd-sub.13
bd dep add bd-sub.15 bd-sub.14
bd dep add bd-sub.16 bd-sub.15

# Documentation depends on completion
bd dep add bd-sub.17 bd-sub.16
```

### Step 4: Pre-Submission Preparation

#### Task bd-sub.1: Run Final WPCS Check

```bash
bd update bd-sub.1 --status in_progress
```

**Run WPCS**:

```bash
vendor/bin/phpcs --standard=WordPress --extensions=php --report=summary .
```

**Output**:

```
PHP CODE SNIFFER REPORT SUMMARY
----------------------------------------------------------------------
FILE                                                  ERRORS  WARNINGS
----------------------------------------------------------------------
/simple-contact-form/includes/class-contact-form.php      0         0
/simple-contact-form/admin/class-admin.php                0         0
/simple-contact-form/public/class-public.php              0         0
----------------------------------------------------------------------
A TOTAL OF 0 ERRORS AND 0 WARNINGS WERE FOUND IN 15 FILES
----------------------------------------------------------------------
```

```bash
bd comment bd-sub.1 "WPCS check passed. No errors or warnings found. Code is compliant."
bd close bd-sub.1
```

#### Task bd-sub.2: Validate readme.txt

```bash
bd update bd-sub.2 --status in_progress
```

**Use WordPress.org readme validator**:

1. Go to https://wordpress.org/plugins/developers/readme-validator/
2. Paste readme.txt content
3. Click "Validate"

**Ensure readme.txt has all required sections**:

```
=== Simple Contact Form ===
Contributors: yourname
Tags: contact form, form, email, ajax
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Display a simple contact form with admin management.

== Description ==

Simple Contact Form allows you to add a contact form to your WordPress site with just a shortcode. Features include:

* Easy shortcode: [simple_contact_form]
* Admin page to view submissions
* Email notifications
* AJAX form submission
* Custom fields support
* Rate limiting to prevent spam

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/simple-contact-form`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Add the shortcode [simple_contact_form] to any page or post
4. Configure settings under Tools > Contact Form

== Frequently Asked Questions ==

= How do I display the contact form? =

Use the shortcode [simple_contact_form] in any page or post.

= Where do I view submissions? =

Go to Tools > Contact Messages in the WordPress admin.

= Can I customize the form fields? =

Yes! Go to Tools > Contact Form > Custom Fields to add your own fields.

== Screenshots ==

1. Frontend contact form
2. Admin submissions list
3. Custom fields management
4. Email notification settings

== Changelog ==

= 1.0.0 =
* Initial release
* Contact form with name, email, subject, message
* Admin page to view submissions
* Email notifications
* AJAX submission
* Custom fields support
* Rate limiting

== Upgrade Notice ==

= 1.0.0 =
Initial release of Simple Contact Form.
```

```bash
bd comment bd-sub.2 "readme.txt validated successfully. All required sections present and properly formatted."
bd close bd-sub.2
```

#### Task bd-sub.3-6: Create and Optimize Assets

```bash
bd update bd-sub.3 bd-sub.4 bd-sub.5 --status in_progress
```

**Create banner images**:
- `banner-772x250.png` (for plugin page)
- `banner-1544x500.png` (for high-DPI displays)

**Create icon images**:
- `icon-128x128.png` (for plugin directory)
- `icon-256x256.png` (for high-DPI displays)

**Take screenshots**:
- Screenshot 1: Frontend contact form
- Screenshot 2: Admin submissions list
- Screenshot 3: Custom fields management

**Optimize images**:

```bash
# Install image optimization tools
npm install -g imagemin-cli imagemin-pngquant

# Optimize all images
imagemin assets/*.png --out-dir=assets --plugin=pngquant
```

```bash
bd comment bd-sub.3 "Created banner images (772x250 and 1544x500)"
bd comment bd-sub.4 "Created icon images (128x128 and 256x256)"
bd comment bd-sub.5 "Captured 3 screenshots of plugin features"
bd close bd-sub.3 bd-sub.4 bd-sub.5

bd update bd-sub.6 --status in_progress
bd comment bd-sub.6 "Optimized all images. Total size reduced by 45%."
bd close bd-sub.6
```

#### Task bd-sub.7: Create Plugin ZIP

```bash
bd ready  # Shows bd-sub.7 is ready
bd update bd-sub.7 --status in_progress
```

**Create ZIP file**:

```bash
# Navigate to plugins directory
cd /path/to/wp-content/plugins

# Create ZIP (exclude development files)
zip -r simple-contact-form.zip simple-contact-form \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*vendor*" \
  -x "*.DS_Store" \
  -x "*tests*" \
  -x "*assets*" \
  -x "*.md" \
  -x "composer.*" \
  -x "package.*" \
  -x "phpunit.*"
```

**Verify ZIP contents**:

```bash
unzip -l simple-contact-form.zip
```

**Expected structure**:

```
simple-contact-form/
├── simple-contact-form.php
├── readme.txt
├── uninstall.php
├── includes/
├── admin/
├── public/
└── languages/
```

```bash
bd comment bd-sub.7 "Created plugin ZIP file (245 KB). Verified contents - all required files included, development files excluded."
bd close bd-sub.7
```

### Step 5: Submission

#### Task bd-sub.8: Create WordPress.org Account

```bash
bd update bd-sub.8 --status in_progress
```

1. Go to https://login.wordpress.org/register
2. Create account with username and email
3. Verify email address
4. Log in to WordPress.org

```bash
bd comment bd-sub.8 "Created WordPress.org account and verified email."
bd close bd-sub.8
```

#### Task bd-sub.9: Submit Plugin

```bash
bd ready  # Shows bd-sub.9 is ready
bd update bd-sub.9 --status in_progress
```

**Submission process**:

1. Go to https://wordpress.org/plugins/developers/add/
2. Upload `simple-contact-form.zip`
3. Fill in plugin details:
   - **Plugin Name**: Simple Contact Form
   - **Plugin Description**: A simple contact form with admin management and custom fields support
   - **Plugin URL**: (leave blank for now)
4. Agree to guidelines
5. Click "Submit Plugin"

**Confirmation email received**:

```
Subject: [WordPress Plugin Directory] Simple Contact Form

Thank you for uploading Simple Contact Form to the WordPress Plugin Directory.

Your plugin has been added to the review queue. You will receive an email when
the review is complete. This typically takes 1-14 days.

In the meantime, please review the Plugin Guidelines:
https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/

Ticket URL: https://wordpress.org/support/plugin/simple-contact-form/
```

```bash
bd comment bd-sub.9 "Plugin submitted successfully. Received confirmation email. Ticket URL: https://wordpress.org/support/plugin/simple-contact-form/"
bd close bd-sub.9
```

#### Task bd-sub.10: Wait for Initial Review

```bash
bd update bd-sub.10 --status in_progress
```

**Day 5 - Review email received**:

```
Subject: [WordPress Plugin Directory] Simple Contact Form - Approved

Congratulations! Your plugin has been approved for the WordPress.org Plugin Directory.

Your SVN repository is ready:
https://plugins.svn.wordpress.org/simple-contact-form/

Next steps:
1. Check out the SVN repository
2. Add your plugin files to the trunk directory
3. Tag your first release
4. Upload assets (banner, icon, screenshots) to the assets directory

Your plugin will appear on WordPress.org once you commit files to trunk and tag a release.

Documentation: https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/
```

```bash
bd comment bd-sub.10 "Plugin approved! Received SVN repository URL. Review took 5 days."
bd close bd-sub.10
```

#### Task bd-sub.11: Respond to Review Feedback

```bash
# In this case, plugin was approved on first review
bd update bd-sub.11 --status in_progress
bd comment bd-sub.11 "No feedback to address - plugin approved on first review."
bd close bd-sub.11
```

### Step 6: Post-Approval SVN Setup

#### Task bd-sub.12: Set Up SVN Repository

```bash
bd ready  # Shows bd-sub.12 is ready
bd update bd-sub.12 --status in_progress
```

**Check out SVN repository**:

```bash
# Create local directory
mkdir -p ~/svn-repos
cd ~/svn-repos

# Check out repository
svn co https://plugins.svn.wordpress.org/simple-contact-form simple-contact-form

# Navigate to repository
cd simple-contact-form
```

**Repository structure**:

```
simple-contact-form/
├── trunk/          # Development version
├── tags/           # Released versions
└── assets/         # Plugin assets (banner, icon, screenshots)
```

```bash
bd comment bd-sub.12 "SVN repository checked out successfully. Repository structure verified."
bd close bd-sub.12
```

#### Task bd-sub.13: Commit Files to Trunk

```bash
bd update bd-sub.13 --status in_progress
```

**Copy plugin files to trunk**:

```bash
# Copy all plugin files to trunk
cp -r /path/to/wp-content/plugins/simple-contact-form/* trunk/

# Add files to SVN
cd trunk
svn add --force * --auto-props --parents --depth infinity -q

# Commit to trunk
svn ci -m "Initial commit of Simple Contact Form v1.0.0"
```

```bash
bd comment bd-sub.13 "Committed all plugin files to trunk. Revision: r2891234"
bd close bd-sub.13
```

#### Task bd-sub.14: Tag Release

```bash
bd update bd-sub.14 --status in_progress
```

**Create version tag**:

```bash
# Navigate to repository root
cd ~/svn-repos/simple-contact-form

# Copy trunk to tags/1.0.0
svn cp trunk tags/1.0.0

# Commit tag
svn ci -m "Tagging version 1.0.0"
```

```bash
bd comment bd-sub.14 "Tagged version 1.0.0. Revision: r2891235"
bd close bd-sub.14
```

#### Task bd-sub.15: Upload Assets

```bash
bd update bd-sub.15 --status in_progress
```

**Copy assets to SVN**:

```bash
# Copy assets
cp /path/to/assets/banner-*.png assets/
cp /path/to/assets/icon-*.png assets/
cp /path/to/assets/screenshot-*.png assets/

# Add and commit
svn add assets/*
svn ci -m "Add plugin assets (banner, icon, screenshots)"
```

```bash
bd comment bd-sub.15 "Uploaded all assets to SVN. Banner, icon, and 3 screenshots committed."
bd close bd-sub.15
```

#### Task bd-sub.16: Verify Plugin on WordPress.org

```bash
bd update bd-sub.16 --status in_progress
```

**Check plugin page**:

1. Go to https://wordpress.org/plugins/simple-contact-form/
2. Verify:
   - ✅ Plugin appears in directory
   - ✅ Banner displays correctly
   - ✅ Icon displays correctly
   - ✅ Screenshots display correctly
   - ✅ readme.txt content displays correctly
   - ✅ Download button works
   - ✅ Version shows as 1.0.0

```bash
bd comment bd-sub.16 "Plugin verified on WordPress.org. All assets display correctly. Plugin is live!"
bd close bd-sub.16
```

### Step 7: Documentation

#### Task bd-sub.17: Create Submission Documentation

```bash
bd update bd-sub.17 --status in_progress
```

**File**: `SUBMISSION-NOTES.md`

```markdown
# WordPress.org Submission Notes

## Submission Details

- **Submission Date**: 2024-01-20
- **Approval Date**: 2024-01-25
- **Review Time**: 5 days
- **Plugin URL**: https://wordpress.org/plugins/simple-contact-form/
- **SVN URL**: https://plugins.svn.wordpress.org/simple-contact-form/

## Timeline

- Day 0: Plugin submitted
- Day 5: Plugin approved
- Day 5: SVN repository set up
- Day 5: Files committed and tagged
- Day 5: Plugin live on WordPress.org

## Review Feedback

No issues found. Plugin approved on first review.

## SVN Commands Reference

### Update from SVN
```bash
svn up
```

### Commit changes
```bash
svn ci -m "Commit message"
```

### Tag new version
```bash
svn cp trunk tags/1.1.0
svn ci -m "Tagging version 1.1.0"
```

### Update assets
```bash
svn add assets/new-asset.png
svn ci -m "Update assets"
```

## Post-Submission Checklist

- [x] Plugin appears on WordPress.org
- [x] Assets display correctly
- [x] Download works
- [x] Installation instructions clear
- [ ] Monitor support forum daily
- [ ] Respond to reviews
- [ ] Plan next release
```

```bash
bd comment bd-sub.17 "Created submission documentation with timeline, SVN commands, and post-submission checklist."
bd close bd-sub.17
bd close bd-sub
```

## AI Agent Workflow

### Initial Prompt

```
Submit the Simple Contact Form plugin to WordPress.org.

Pre-submission tasks:
- Run final WPCS check
- Validate readme.txt format
- Create banner images (772x250, 1544x500)
- Create icon images (128x128, 256x256)
- Take screenshots (at least 3)
- Optimize all images
- Create plugin ZIP file

Submission process:
- Create WordPress.org account (if needed)
- Submit plugin via WordPress.org form
- Wait for review
- Respond to any feedback

Post-approval tasks:
- Set up SVN repository
- Commit files to trunk
- Tag version 1.0.0
- Upload assets
- Verify plugin appears on WordPress.org

Document the entire process with timeline and SVN commands.
```

### Implementation Approach

1. **Create OpenSpec submission spec** with requirements and checklist
2. **Break down into Beads tasks** with clear dependencies
3. **Prepare all assets** before submission
4. **Submit and wait patiently** for review
5. **Respond promptly** to any feedback
6. **Set up SVN correctly** after approval
7. **Verify everything works** on WordPress.org
8. **Document process** for future releases

## Key Takeaways

- **Preparation is critical** - ensure everything is ready before submitting
- **readme.txt format** must be exact - use validator
- **Assets matter** - good banner and icon improve visibility
- **Review time varies** - typically 3-7 days, can be up to 14 days
- **SVN is required** - learn basic SVN commands
- **First impression counts** - thorough preparation leads to faster approval
- **Documentation helps** - document process for future updates
- **Support forum** - monitor and respond to user questions promptly

