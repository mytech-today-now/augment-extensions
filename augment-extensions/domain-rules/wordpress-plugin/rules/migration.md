# Migration Workflows for WordPress Plugins

## Overview

This guide covers migration workflows for WordPress plugins including WordPress core upgrades, PHP version upgrades, theme migration, and plugin migration. Each workflow includes backup procedures and comprehensive testing steps.

---

## 1. WordPress Core Upgrade Workflow

### Pre-Upgrade Checklist

**Before upgrading WordPress core:**

1. **Check compatibility**:
   ```bash
   # Check plugin compatibility with target WordPress version
   # Review plugin's "Tested up to" version in readme.txt
   # Check WordPress.org plugin page for compatibility reports
   ```

2. **Review changelog**:
   - Read WordPress release notes
   - Identify deprecated functions
   - Check for breaking changes
   - Review security updates

3. **Backup everything**:
   ```bash
   # Database backup
   wp db export backup-$(date +%Y%m%d-%H%M%S).sql
   
   # Files backup
   tar -czf wordpress-backup-$(date +%Y%m%d-%H%M%S).tar.gz /path/to/wordpress
   ```

### Upgrade Process

**Step 1: Test in staging environment**

```bash
# Clone production to staging
wp db export production.sql
wp db import production.sql --url=staging.example.com

# Update WordPress core in staging
wp core update
wp core update-db
```

**Step 2: Test plugin functionality**

- ✅ Activate plugin
- ✅ Test all features
- ✅ Check admin interface
- ✅ Test frontend functionality
- ✅ Verify AJAX handlers
- ✅ Test REST API endpoints
- ✅ Check cron jobs
- ✅ Verify database queries

**Step 3: Fix compatibility issues**

```php
// Example: Replace deprecated function
// OLD (deprecated in WP 5.3)
wp_make_link_relative( $url );

// NEW
wp_parse_url( $url, PHP_URL_PATH );
```

**Step 4: Update production**

```bash
# Backup production
wp db export pre-upgrade-backup.sql

# Enable maintenance mode
wp maintenance-mode activate

# Update WordPress core
wp core update
wp core update-db

# Test critical functionality
wp plugin list
wp theme list

# Disable maintenance mode
wp maintenance-mode deactivate
```

### Post-Upgrade Testing

**Critical tests after upgrade:**

1. **Plugin activation**: Verify plugin activates without errors
2. **Database integrity**: Check custom tables and data
3. **Admin functionality**: Test all admin pages and settings
4. **Frontend functionality**: Test shortcodes, widgets, blocks
5. **Performance**: Check page load times
6. **Error logs**: Review PHP error logs and debug.log

---

## 2. PHP Version Upgrade Workflow

### Pre-Upgrade Checklist

**Before upgrading PHP version:**

1. **Check current PHP version**:
   ```bash
   php -v
   wp cli info
   ```

2. **Review PHP compatibility**:
   - Check plugin's "Requires PHP" version in readme.txt
   - Review PHP changelog for breaking changes
   - Identify deprecated PHP features used in plugin

3. **Run compatibility checker**:
   ```bash
   # Install PHP Compatibility Checker plugin
   wp plugin install php-compatibility-checker --activate
   
   # Or use PHPCompatibility CodeSniffer standard
   composer require --dev phpcompatibility/php-compatibility
   vendor/bin/phpcs -p . --standard=PHPCompatibility --runtime-set testVersion 7.4-
   ```

### Common PHP Compatibility Issues

**PHP 7.4 → PHP 8.0+**

```php
// Issue 1: Deprecated curly brace array access
// OLD
$char = $string{0};

// NEW
$char = $string[0];

// Issue 2: Required parameters after optional parameters
// OLD
function example( $optional = null, $required ) {}

// NEW
function example( $required, $optional = null ) {}

// Issue 3: Deprecated create_function()
// OLD
$func = create_function( '$a,$b', 'return $a + $b;' );

// NEW
$func = function( $a, $b ) {
    return $a + $b;
};
```

### Upgrade Process

**Step 1: Test in staging with target PHP version**

```bash
# Switch PHP version in staging (example for Ubuntu)
sudo update-alternatives --set php /usr/bin/php8.1

# Restart web server
sudo systemctl restart apache2  # or nginx
```

**Step 2: Run automated tests**

```bash
# Run PHPUnit tests
vendor/bin/phpunit

# Run PHP CodeSniffer
vendor/bin/phpcs

# Check for PHP errors
tail -f /var/log/php-errors.log
```

**Step 3: Manual testing**

- ✅ Test all plugin features
- ✅ Check error logs
- ✅ Verify database operations
- ✅ Test file uploads
- ✅ Check email functionality
- ✅ Test third-party integrations

**Step 4: Update production**

```bash
# Backup production
wp db export pre-php-upgrade-backup.sql

# Enable maintenance mode
wp maintenance-mode activate

# Switch PHP version
sudo update-alternatives --set php /usr/bin/php8.1
sudo systemctl restart apache2

# Test
wp cli info  # Verify PHP version
wp plugin list  # Verify plugins load

# Disable maintenance mode
wp maintenance-mode deactivate
```

### Post-Upgrade Monitoring

**Monitor for 24-48 hours:**

1. **Error logs**: Check PHP error logs frequently
2. **Performance**: Monitor page load times
3. **User reports**: Watch for user-reported issues
4. **Database**: Check for query errors
5. **Cron jobs**: Verify scheduled tasks run correctly

---

## 3. Theme Migration Workflow

### Scenario: Migrating Plugin from One Theme to Another

**Common issues when switching themes:**

- Custom post type templates
- Widget areas
- Shortcode styling
- Theme-specific hooks
- CSS conflicts

### Pre-Migration Checklist

1. **Document theme dependencies**:
   ```php
   // Check if plugin relies on theme features
   if ( ! current_theme_supports( 'post-thumbnails' ) ) {
       add_theme_support( 'post-thumbnails' );
   }
   ```

2. **Identify theme-specific code**:
   - Custom templates in plugin
   - Theme hook usage
   - Widget area registrations
   - Shortcode styling

3. **Backup current state**:
   ```bash
   wp db export pre-theme-migration.sql
   wp theme list
   ```

### Migration Process

**Step 1: Test in staging**

```bash
# Clone production to staging
wp db export production.sql
wp db import production.sql --url=staging.example.com

# Activate new theme
wp theme activate new-theme
```

**Step 2: Update plugin templates**

```php
// OLD: Theme-specific template
locate_template( 'my-plugin-template.php' );

// NEW: Plugin-provided template with theme override support
if ( $theme_file = locate_template( 'my-plugin/template.php' ) ) {
    include $theme_file;
} else {
    include plugin_dir_path( __FILE__ ) . 'templates/template.php';
}
```

**Step 3: Update CSS for new theme**

```php
// Enqueue plugin styles with theme compatibility
function myplugin_enqueue_styles() {
    wp_enqueue_style(
        'myplugin-styles',
        plugins_url( 'css/styles.css', __FILE__ ),
        array(), // Dependencies
        '1.0.0'
    );

    // Add theme-specific overrides
    $theme = wp_get_theme();
    $theme_slug = $theme->get_stylesheet();

    $theme_override = plugins_url( "css/themes/{$theme_slug}.css", __FILE__ );
    if ( file_exists( plugin_dir_path( __FILE__ ) . "css/themes/{$theme_slug}.css" ) ) {
        wp_enqueue_style(
            'myplugin-theme-override',
            $theme_override,
            array( 'myplugin-styles' ),
            '1.0.0'
        );
    }
}
add_action( 'wp_enqueue_scripts', 'myplugin_enqueue_styles' );
```

**Step 4: Test all functionality**

- ✅ Custom post type archives
- ✅ Single post templates
- ✅ Widget areas
- ✅ Shortcodes
- ✅ Gutenberg blocks
- ✅ Frontend forms
- ✅ AJAX functionality

**Step 5: Update production**

```bash
# Backup production
wp db export pre-theme-switch.sql

# Enable maintenance mode
wp maintenance-mode activate

# Switch theme
wp theme activate new-theme

# Clear caches
wp cache flush
wp rewrite flush

# Disable maintenance mode
wp maintenance-mode deactivate
```

---

## 4. Plugin Migration Workflow

### Scenario: Migrating Plugin to New Server/Environment

**Common migration scenarios:**

- Development → Staging → Production
- Shared hosting → VPS → Cloud
- HTTP → HTTPS
- Domain change

### Pre-Migration Checklist

1. **Document current environment**:
   ```bash
   # WordPress version
   wp core version

   # PHP version
   php -v

   # Database version
   wp db query "SELECT VERSION();"

   # Active plugins
   wp plugin list --status=active

   # Server configuration
   wp cli info
   ```

2. **Check plugin requirements**:
   - PHP version compatibility
   - Required PHP extensions
   - Database requirements
   - File permissions
   - Server resources (memory, execution time)

3. **Backup everything**:
   ```bash
   # Full site backup
   wp db export full-backup-$(date +%Y%m%d).sql
   tar -czf files-backup-$(date +%Y%m%d).tar.gz /path/to/wordpress
   ```

### Migration Process

**Step 1: Prepare target environment**

```bash
# Install WordPress
wp core download
wp config create --dbname=newdb --dbuser=newuser --dbpass=newpass
wp core install --url=newsite.com --title="New Site" --admin_user=admin

# Match PHP version
php -v  # Verify matches source

# Install required PHP extensions
sudo apt-get install php-curl php-gd php-mbstring php-xml php-zip
```

**Step 2: Migrate database**

```bash
# Export from source
wp db export migration.sql

# Import to target
wp db import migration.sql

# Update URLs (if domain changed)
wp search-replace 'oldsite.com' 'newsite.com' --all-tables

# Update file paths (if path changed)
wp search-replace '/old/path' '/new/path' --all-tables
```

**Step 3: Migrate files**

```bash
# Copy plugin files
rsync -avz /old/wp-content/plugins/my-plugin/ /new/wp-content/plugins/my-plugin/

# Set correct permissions
find /new/wp-content/plugins/my-plugin -type d -exec chmod 755 {} \;
find /new/wp-content/plugins/my-plugin -type f -exec chmod 644 {} \;
```

**Step 4: Update plugin configuration**

```php
// Update plugin settings for new environment
function myplugin_migration_update_settings() {
    $options = get_option( 'myplugin_options' );

    // Update URLs
    if ( isset( $options['api_url'] ) ) {
        $options['api_url'] = str_replace(
            'oldsite.com',
            'newsite.com',
            $options['api_url']
        );
    }

    // Update file paths
    if ( isset( $options['upload_dir'] ) ) {
        $options['upload_dir'] = str_replace(
            '/old/path',
            '/new/path',
            $options['upload_dir']
        );
    }

    update_option( 'myplugin_options', $options );
}
```

**Step 5: Test thoroughly**

```bash
# Verify plugin activation
wp plugin activate my-plugin

# Check for errors
wp plugin status my-plugin

# Test database connectivity
wp db query "SELECT * FROM {$wpdb->prefix}myplugin_table LIMIT 1;"

# Verify cron jobs
wp cron event list

# Test REST API
curl https://newsite.com/wp-json/myplugin/v1/endpoint
```

### Post-Migration Checklist

- ✅ Plugin activates without errors
- ✅ Database tables exist and contain data
- ✅ Custom post types display correctly
- ✅ Admin settings pages load
- ✅ Frontend functionality works
- ✅ AJAX handlers respond
- ✅ REST API endpoints accessible
- ✅ Cron jobs scheduled
- ✅ File uploads work
- ✅ Email notifications send
- ✅ Third-party integrations connect
- ✅ Performance is acceptable

---

## 5. Rollback Procedures

### Emergency Rollback

**If migration fails, rollback immediately:**

```bash
# 1. Enable maintenance mode
wp maintenance-mode activate

# 2. Restore database
wp db import pre-migration-backup.sql

# 3. Restore files
tar -xzf files-backup.tar.gz -C /path/to/wordpress

# 4. Clear caches
wp cache flush
wp rewrite flush

# 5. Verify restoration
wp plugin list
wp db query "SELECT COUNT(*) FROM wp_posts;"

# 6. Disable maintenance mode
wp maintenance-mode deactivate
```

### Partial Rollback

**If only plugin needs rollback:**

```bash
# Deactivate plugin
wp plugin deactivate my-plugin

# Restore plugin files
rm -rf wp-content/plugins/my-plugin
tar -xzf plugin-backup.tar.gz -C wp-content/plugins/

# Restore plugin database tables
wp db query < plugin-tables-backup.sql

# Reactivate plugin
wp plugin activate my-plugin
```

---

## 6. Best Practices

### Backup Strategy

**Always maintain multiple backup points:**

1. **Before migration**: Full backup
2. **After testing**: Staging backup
3. **Before production**: Production backup
4. **After migration**: Post-migration backup

### Testing Strategy

**Test in this order:**

1. **Automated tests**: PHPUnit, CodeSniffer
2. **Staging environment**: Full functionality test
3. **Production (limited)**: Soft launch to subset of users
4. **Production (full)**: Full rollout with monitoring

### Communication Strategy

**Notify stakeholders:**

1. **Before migration**: Announce maintenance window
2. **During migration**: Status updates
3. **After migration**: Completion notice
4. **Post-migration**: Monitor and respond to issues

### Documentation

**Document everything:**

- Migration plan
- Backup locations
- Configuration changes
- Issues encountered
- Rollback procedures
- Lessons learned

---

## 7. Common Migration Issues

### Issue 1: Database Prefix Mismatch

```php
// Problem: Hardcoded table prefix
$results = $wpdb->get_results( "SELECT * FROM wp_myplugin_table" );

// Solution: Use $wpdb->prefix
global $wpdb;
$table_name = $wpdb->prefix . 'myplugin_table';
$results = $wpdb->get_results( "SELECT * FROM {$table_name}" );
```

### Issue 2: Absolute Path Issues

```php
// Problem: Hardcoded paths
include '/var/www/html/wp-content/plugins/my-plugin/includes/class.php';

// Solution: Use WordPress constants
include plugin_dir_path( __FILE__ ) . 'includes/class.php';
```

### Issue 3: URL Hardcoding

```php
// Problem: Hardcoded URLs
$api_url = 'https://oldsite.com/wp-json/myplugin/v1/';

// Solution: Use WordPress functions
$api_url = rest_url( 'myplugin/v1/' );
```

### Issue 4: File Permission Issues

```bash
# Problem: Incorrect permissions after migration
# Solution: Set correct permissions
find wp-content/plugins/my-plugin -type d -exec chmod 755 {} \;
find wp-content/plugins/my-plugin -type f -exec chmod 644 {} \;
chown -R www-data:www-data wp-content/plugins/my-plugin
```

---

## Summary

**Key takeaways:**

1. **Always backup** before any migration
2. **Test in staging** before production
3. **Document everything** for future reference
4. **Have rollback plan** ready
5. **Monitor closely** after migration
6. **Communicate clearly** with stakeholders

**Migration checklist:**

- [ ] Backup database and files
- [ ] Test in staging environment
- [ ] Document configuration changes
- [ ] Prepare rollback procedure
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Execute migration
- [ ] Test thoroughly
- [ ] Monitor for issues
- [ ] Document lessons learned


